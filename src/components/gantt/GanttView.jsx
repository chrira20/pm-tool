/**
 * Gantt-Ansicht (Masterprompt C.2) – D2 Tabellen-Upgrade
 * Links: Vorgangstabelle | Rechts: Gantt-Diagramm | Detail-Panel als Seitenleiste
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { parseISO, addDays, format as formatDate } from 'date-fns';
import { createTask, createDependency } from '../../models/types';
import GanttDiagram, { HEADER_HEIGHT, ROW_HEIGHT } from './GanttDiagram';
import Tooltip from '../common/Tooltip';
import { useToast } from '../common/useToast';
import ContextMenu from '../common/ContextMenu';
import { buildTree, flattenTree, einruecken, ausruecken, getDescendants } from '../../utils/hierarchy';

// Höhe des Spalten-Headers (muss = HEADER_HEIGHT sein für Zeilenausrichtung)
const COL_HEADER_H = HEADER_HEIGHT;

/** Prüft ob ein Datum überfällig ist (vor heute und Fortschritt < 100) */
function istUeberfaellig(v) {
  if (!v.fruehesterAnfang || v.fortschritt >= 100) return false;
  const heute = new Date().toISOString().slice(0, 10);
  return v.fruehesterAnfang < heute;
}

export default function GanttView({ projekt, onUpdate }) {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [hoveredTaskId, setHoveredTaskId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, taskId }
  const [collapsedIds, setCollapsedIds] = useState(new Set());
  const toast = useToast();
  const tableBodyRef = useRef(null);
  const diagramRef = useRef(null);
  const syncingRef = useRef(false);

  // PSP-Baumstruktur berechnen
  const { childrenMap, depthMap } = useMemo(() => buildTree(projekt.vorgaenge), [projekt.vorgaenge]);
  const visibleTasks = useMemo(() => flattenTree(projekt.vorgaenge, collapsedIds), [projekt.vorgaenge, collapsedIds]);

  const toggleCollapse = useCallback((taskId) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  // Synchrones vertikales Scrollen zwischen Tabelle und Diagramm
  const onTableScroll = useCallback(() => {
    if (syncingRef.current || !diagramRef.current || !tableBodyRef.current) return;
    syncingRef.current = true;
    diagramRef.current.scrollTop = tableBodyRef.current.scrollTop;
    requestAnimationFrame(() => { syncingRef.current = false; });
  }, []);

  const onDiagramScroll = useCallback(() => {
    if (syncingRef.current || !tableBodyRef.current || !diagramRef.current) return;
    syncingRef.current = true;
    tableBodyRef.current.scrollTop = diagramRef.current.scrollTop;
    requestAnimationFrame(() => { syncingRef.current = false; });
  }, []);

  const addVorgang = useCallback(() => {
    const neu = createTask(projekt.id, {
      name: `Vorgang ${projekt.vorgaenge.length + 1}`,
      sortierung: projekt.vorgaenge.length,
    });
    onUpdate({ vorgaenge: [...projekt.vorgaenge, neu] });
    toast('Vorgang hinzugefügt', 'success', 1500);
  }, [projekt.id, projekt.vorgaenge, onUpdate, toast]);

  const deleteVorgang = useCallback((id) => {
    const name = projekt.vorgaenge.find((v) => v.id === id)?.name || 'Vorgang';
    // Kaskadierendes Löschen: Sammelvorgang löscht auch alle Kinder
    const { childrenMap: cm } = buildTree(projekt.vorgaenge);
    const idsToDelete = new Set([id, ...getDescendants(id, cm)]);
    onUpdate({
      vorgaenge: projekt.vorgaenge.filter((v) => !idsToDelete.has(v.id)),
      abhaengigkeiten: projekt.abhaengigkeiten.filter(
        (d) => !idsToDelete.has(d.vorgaengerId) && !idsToDelete.has(d.nachfolgerId)
      ),
      zuordnungen: projekt.zuordnungen.filter((z) => !idsToDelete.has(z.vorgangId)),
    });
    if (idsToDelete.has(selectedTaskId)) setSelectedTaskId(null);
    const kinderCount = idsToDelete.size - 1;
    toast(`"${name}" gelöscht${kinderCount > 0 ? ` (+${kinderCount} Untervorgang${kinderCount > 1 ? 'e' : ''})` : ''}`, 'delete', 2000);
  }, [projekt.vorgaenge, projekt.abhaengigkeiten, projekt.zuordnungen, selectedTaskId, onUpdate, toast]);

  const updateVorgang = (id, changes) => {
    onUpdate({
      vorgaenge: projekt.vorgaenge.map((v) => (v.id === id ? { ...v, ...changes } : v)),
    });
  };

  const toggleFortschritt = (e, v) => {
    e.stopPropagation();
    const neuerFortschritt = v.fortschritt >= 100 ? 0 : 100;
    updateVorgang(v.id, { fortschritt: neuerFortschritt });
    toast(neuerFortschritt === 100 ? 'Abgeschlossen ✓' : 'Fortschritt zurückgesetzt', neuerFortschritt === 100 ? 'success' : 'info', 1500);
  };

  // Drag & Drop: Balken verschieben
  // Strategie: Verschiebe den Zeitversatz der eingehenden Abhängigkeit oder den Projektstart
  const handleDragMove = useCallback((taskId, daysDelta) => {
    const task = projekt.vorgaenge.find((v) => v.id === taskId);
    if (!task) return;

    // Hat der Vorgang eingehende Abhängigkeiten?
    const eingehend = projekt.abhaengigkeiten.filter((d) => d.nachfolgerId === taskId);

    if (eingehend.length > 0) {
      // Zeitversatz der ersten Abhängigkeit anpassen
      const dep = eingehend[0];
      const neuerVersatz = (dep.zeitversatz || 0) + daysDelta;
      onUpdate({
        abhaengigkeiten: projekt.abhaengigkeiten.map((d) =>
          d.id === dep.id ? { ...d, zeitversatz: neuerVersatz } : d
        ),
      });
      toast(`Zeitversatz → ${neuerVersatz >= 0 ? '+' : ''}${neuerVersatz}d`, 'info', 1500);
    } else {
      // Kein Vorgänger: Projekt-Startdatum verschieben
      const neuesStart = formatDate(addDays(parseISO(projekt.startDatum), daysDelta), 'yyyy-MM-dd');
      onUpdate({ startDatum: neuesStart });
      toast(`Projektstart → ${neuesStart}`, 'info', 1500);
    }
  }, [projekt.vorgaenge, projekt.abhaengigkeiten, projekt.startDatum, onUpdate, toast]);

  const openContextMenuForTask = (e, taskId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({ x: rect.right, y: rect.bottom, taskId });
  };

  const addAbhaengigkeit = (nachfolgerId, vorgaengerId, typ, zeitversatz) => {
    if (!vorgaengerId || !nachfolgerId || vorgaengerId === nachfolgerId) return;
    const exists = projekt.abhaengigkeiten.some(
      (d) => d.vorgaengerId === vorgaengerId && d.nachfolgerId === nachfolgerId
    );
    if (exists) return;
    const dep = createDependency({ vorgaengerId, nachfolgerId, typ, zeitversatz });
    onUpdate({ abhaengigkeiten: [...projekt.abhaengigkeiten, dep] });
  };

  const deleteAbhaengigkeit = (id) => {
    onUpdate({ abhaengigkeiten: projekt.abhaengigkeiten.filter((d) => d.id !== id) });
  };

  const handleSelectTask = useCallback(
    (id) => setSelectedTaskId((prev) => (prev === id ? null : id)),
    []
  );

  const nameInputRef = useRef(null);

  // ── Keyboard Shortcuts (Del, F2, Ins, Esc) ──────────────
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      // Esc: Selektion aufheben (immer, auch in Input)
      if (e.key === 'Escape') {
        setSelectedTaskId(null);
        return;
      }

      // Folgende Shortcuts nur wenn nicht in Eingabefeld
      if (inInput) return;

      // Del / Entf: Selektierten Vorgang löschen
      if (e.key === 'Delete' && selectedTaskId) {
        e.preventDefault();
        deleteVorgang(selectedTaskId);
        return;
      }

      // F2: Name-Feld fokussieren (Detail-Panel öffnen falls nötig)
      if (e.key === 'F2' && selectedTaskId) {
        e.preventDefault();
        // Focus wird nach Render via ref gesetzt
        requestAnimationFrame(() => {
          if (nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
          }
        });
        return;
      }

      // Ins / Insert: Neuen Vorgang unterhalb des selektierten einfügen (gleiche Ebene)
      if (e.key === 'Insert') {
        e.preventDefault();
        if (selectedTaskId) {
          const selTask = projekt.vorgaenge.find((v) => v.id === selectedTaskId);
          const idx = projekt.vorgaenge.findIndex((v) => v.id === selectedTaskId);
          const neu = createTask(projekt.id, {
            name: `Vorgang ${projekt.vorgaenge.length + 1}`,
            sortierung: idx + 1,
            elternId: selTask?.elternId || null,
          });
          const vorgaenge = [...projekt.vorgaenge];
          vorgaenge.splice(idx + 1, 0, neu);
          onUpdate({ vorgaenge });
          toast('Vorgang eingefügt', 'success', 1500);
          setSelectedTaskId(neu.id);
        } else {
          addVorgang();
        }
        return;
      }

      // Tab: Einrücken / Shift+Tab: Ausrücken
      if (e.key === 'Tab' && selectedTaskId) {
        e.preventDefault();
        if (e.shiftKey) {
          const result = ausruecken(projekt.vorgaenge, selectedTaskId);
          if (result) { onUpdate({ vorgaenge: result }); toast('Ausgerückt', 'info', 1500); }
        } else {
          const result = einruecken(projekt.vorgaenge, selectedTaskId);
          if (result) { onUpdate({ vorgaenge: result }); toast('Eingerückt', 'info', 1500); }
        }
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedTaskId, projekt.vorgaenge, projekt.id, onUpdate, toast, deleteVorgang, addVorgang]);

  const selectedTask = projekt.vorgaenge.find((v) => v.id === selectedTaskId);
  const vorgaengerDeps = selectedTask
    ? projekt.abhaengigkeiten.filter((d) => d.nachfolgerId === selectedTask.id)
    : [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex-shrink-0">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Vorgänge ({projekt.vorgaenge.length})
        </span>
        <div className="flex gap-2">
          <span className="text-xs text-slate-400">
            {projekt.abhaengigkeiten.length} Abhängigkeiten
          </span>
          <button
            onClick={addVorgang}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Vorgang
          </button>
        </div>
      </div>

      {/* Hauptbereich: Tabelle + Diagramm + Detail */}
      <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
        {/* ── Linke Spalte: Vorgangstabelle ─────────────────── */}
        <div className="flex flex-col flex-shrink-0 border-r border-slate-200 w-full sm:w-[420px]">
          {/* Spalten-Header (Höhe = HEADER_HEIGHT) */}
          <div
            className="border-b-2 border-slate-200 flex-shrink-0"
            style={{ height: COL_HEADER_H, background: 'var(--pm-row-summary)' }}
          >
            <table className="w-full text-[10px] table-fixed h-full">
              <thead>
                <tr className="text-left uppercase tracking-wider font-semibold h-full" style={{ color: 'var(--pm-text-muted)' }}>
                  <th className="w-8 text-center">#</th>
                  <th className="w-7"></th>
                  <th className="px-2 py-1 font-semibold">
                    <Tooltip text="Projektstrukturplan-Code" position="bottom"><span>PSP</span></Tooltip>
                  </th>
                  <th className="px-2 py-1 font-semibold">Name</th>
                  <th className="px-2 py-1 font-semibold w-12 text-center">
                    <Tooltip text="Dauer in Arbeitstagen" position="bottom"><span>Dauer</span></Tooltip>
                  </th>
                  <th className="px-2 py-1 font-semibold w-20">
                    <Tooltip text="Frühester Anfangszeitpunkt" position="bottom"><span>FAZ</span></Tooltip>
                  </th>
                  <th className="px-2 py-1 font-semibold w-8 text-center">
                    <Tooltip text="Gesamtpuffer (0 = kritisch)" position="bottom"><span>GP</span></Tooltip>
                  </th>
                  <th className="w-8"></th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Tabellen-Body (scrollt synchron mit Diagramm) */}
          <div
            ref={tableBodyRef}
            onScroll={onTableScroll}
            className="flex-1 overflow-y-auto overflow-x-hidden"
          >
            <table className="w-full text-xs table-fixed">
              <tbody>
                {visibleTasks.map((v, idx) => {
                  const istSammelvorgang = v.typ === 'Sammelvorgang';
                  const istMeilenstein = v.typ === 'Meilenstein';
                  const istDone = v.fortschritt >= 100;
                  const isHovered = hoveredTaskId === v.id;
                  const isSelected = selectedTaskId === v.id;
                  const isZebra = idx % 2 === 1;
                  const ueberfaellig = istUeberfaellig(v);
                  const depth = depthMap.get(v.id) || 0;
                  const hasChildren = (childrenMap.get(v.id) || []).length > 0;
                  const isCollapsed = collapsedIds.has(v.id);

                  // Hintergrundfarbe: Selektion > Hover > Sammelvorgang > Zebra > weiß
                  let bgStyle = {};
                  if (isSelected) {
                    bgStyle = { background: 'var(--pm-accent-light)' };
                  } else if (isHovered) {
                    bgStyle = { background: 'var(--pm-accent-light)' };
                  } else if (istSammelvorgang) {
                    bgStyle = { background: 'var(--pm-row-summary)' };
                  } else if (isZebra) {
                    bgStyle = { background: 'var(--pm-row-zebra)' };
                  }

                  return (
                    <tr
                      key={v.id}
                      onClick={() => handleSelectTask(v.id)}
                      onMouseEnter={() => setHoveredTaskId(v.id)}
                      onMouseLeave={() => setHoveredTaskId(null)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ x: e.clientX, y: e.clientY, taskId: v.id });
                      }}
                      style={{ height: ROW_HEIGHT, ...bgStyle }}
                      className="border-b cursor-pointer transition-colors group"
                      title=""
                    >
                      {/* Zeilennummer / Collapse-Toggle */}
                      <td className="w-8 text-center font-mono select-none" style={{ color: 'var(--pm-text-muted)', fontSize: '10px' }}>
                        {hasChildren ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleCollapse(v.id); }}
                            className="text-slate-400 hover:text-slate-700 text-xs w-6 h-6 inline-flex items-center justify-center rounded hover:bg-slate-100 transition-colors"
                            title={isCollapsed ? 'Aufklappen' : 'Einklappen'}
                          >
                            {isCollapsed ? '▸' : '▾'}
                          </button>
                        ) : (
                          idx + 1
                        )}
                      </td>

                      {/* Kreis-Checkbox */}
                      <td className="w-7 text-center">
                        <button
                          onClick={(e) => toggleFortschritt(e, v)}
                          className="inline-flex items-center justify-center transition-colors"
                          style={{ width: 18, height: 18 }}
                          title={istDone ? 'Fortschritt zurücksetzen' : 'Als abgeschlossen markieren'}
                        >
                          {istMeilenstein ? (
                            <span style={{
                              display: 'inline-block',
                              width: 12, height: 12,
                              transform: 'rotate(45deg)',
                              border: istDone ? 'none' : '2px solid var(--pm-milestone)',
                              background: istDone ? 'var(--pm-success)' : 'transparent',
                              borderRadius: 2,
                            }}>
                              {istDone && <span style={{ display: 'block', transform: 'rotate(-45deg)', fontSize: 9, lineHeight: '12px', color: 'white', textAlign: 'center' }}>✓</span>}
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 16, height: 16,
                              borderRadius: '50%',
                              border: istDone ? 'none' : '2px solid var(--pm-border-strong)',
                              background: istDone ? 'var(--pm-success)' : 'transparent',
                              fontSize: 9,
                              color: 'white',
                              lineHeight: 1,
                            }}>
                              {istDone && '✓'}
                            </span>
                          )}
                        </button>
                      </td>

                      {/* PSP-Code */}
                      <td className="px-2 py-0 truncate" style={{ color: 'var(--pm-text-muted)', width: 48 }}>
                        {v.pspCode || '–'}
                      </td>

                      {/* Name (mit Hierarchie-Einrückung) */}
                      <td
                        className={`py-0 truncate max-w-0 ${istSammelvorgang ? 'font-semibold' : 'font-medium'}`}
                        style={{
                          color: istSammelvorgang ? 'var(--pm-text-primary)' : 'var(--pm-text-secondary)',
                          paddingLeft: `${8 + depth * 16}px`,
                          paddingRight: 8,
                        }}
                      >
                        {istMeilenstein && (
                          <span className="mr-1 text-xs" style={{ color: 'var(--pm-milestone)' }}>◆</span>
                        )}
                        {v.name}
                        {hasChildren && isCollapsed && (
                          <span className="ml-1 text-[10px] font-normal" style={{ color: 'var(--pm-text-muted)' }}>
                            ({(childrenMap.get(v.id) || []).length})
                          </span>
                        )}
                      </td>

                      {/* Dauer */}
                      <td className="px-2 py-0 w-12 text-center" style={{ color: 'var(--pm-text-muted)' }}>
                        {istMeilenstein ? 'MS' : `${v.dauer}d`}
                      </td>

                      {/* FAZ mit Überfällig-Badge */}
                      <td className="px-2 py-0 w-20 text-xs">
                        {v.fruehesterAnfang ? (
                          <span
                            className={ueberfaellig ? 'px-1.5 py-0.5 rounded' : ''}
                            style={ueberfaellig
                              ? { background: 'var(--pm-warning-bg)', color: 'var(--pm-warning)', fontWeight: 500 }
                              : { color: 'var(--pm-text-muted)' }
                            }
                          >
                            {v.fruehesterAnfang.slice(5)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--pm-text-muted)' }}>–</span>
                        )}
                      </td>

                      {/* GP */}
                      <td className="px-2 py-0 w-8 text-center">
                        <span
                          style={{
                            color: v.istKritisch ? 'var(--pm-danger)' : 'var(--pm-text-muted)',
                            fontWeight: v.istKritisch ? 600 : 400,
                          }}
                        >
                          {v.gesamtpuffer ?? '–'}
                        </span>
                      </td>

                      {/* Hover-Menü */}
                      <td className="w-8 text-center relative">
                        <button
                          onClick={(e) => openContextMenuForTask(e, v.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700 text-sm px-1 rounded hover:bg-slate-100"
                          title="Aktionen"
                        >
                          ⋯
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {projekt.vorgaenge.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="text-3xl mb-2">📋</div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--pm-text-secondary)' }}>Noch keine Vorgänge</p>
                      <p className="text-xs mb-3" style={{ color: 'var(--pm-text-muted)' }}>Klicke &quot;+ Vorgang&quot; oben rechts um zu beginnen.</p>
                      <p className="text-[10px]" style={{ color: 'var(--pm-border-strong)' }}>💡 Rechtsklick auf einen Vorgang öffnet das Kontextmenü</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Gantt-Diagramm ──────────────────────────────── */}
        <div
          ref={diagramRef}
          onScroll={onDiagramScroll}
          className="flex-1 overflow-auto min-h-[300px]"
          style={{ background: 'var(--pm-table-bg)' }}
        >
          <GanttDiagram
            vorgaenge={visibleTasks}
            abhaengigkeiten={projekt.abhaengigkeiten}
            startDatum={projekt.startDatum}
            selectedTaskId={selectedTaskId}
            onSelectTask={handleSelectTask}
            hoveredTaskId={hoveredTaskId}
            onHoverTask={setHoveredTaskId}
            onDragMove={handleDragMove}
          />
        </div>

        {/* ── Detail-Panel: Desktop = Seitenleiste, Mobil = Modal-Overlay ── */}
        {selectedTask && (
          <>
            {/* Overlay für Mobil */}
            <div
              className="fixed inset-0 bg-black/30 z-[150] sm:hidden"
              onClick={() => setSelectedTaskId(null)}
            />
            <div className="fixed inset-x-0 bottom-0 top-16 z-[160] sm:relative sm:inset-auto sm:z-auto sm:w-72 border-l overflow-y-auto flex-shrink-0 rounded-t-xl sm:rounded-none shadow-2xl sm:shadow-none" style={{ borderColor: 'var(--pm-border)', background: 'var(--pm-table-bg)' }}>
            <div className="flex items-center justify-between px-3 py-2 border-b" style={{ background: 'var(--pm-row-summary)', borderColor: 'var(--pm-border)' }}>
              <h3 className="text-xs font-semibold" style={{ color: 'var(--pm-text-primary)' }}>Vorgang bearbeiten</h3>
              <button
                onClick={() => setSelectedTaskId(null)}
                className="text-sm px-1 hover:opacity-70"
                style={{ color: 'var(--pm-text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div className="p-3 space-y-3">
              {/* Name */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--pm-text-muted)' }}>Name</label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={selectedTask.name}
                  onChange={(e) => updateVorgang(selectedTask.id, { name: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1"
                  style={{ border: '1px solid var(--pm-border-strong)', color: 'var(--pm-text-primary)' }}
                />
              </div>

              {/* Typ + Dauer */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--pm-text-muted)' }}>Typ</label>
                  <select
                    value={selectedTask.typ}
                    onChange={(e) => updateVorgang(selectedTask.id, { typ: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1"
                    style={{ border: '1px solid var(--pm-border-strong)', color: 'var(--pm-text-primary)' }}
                  >
                    <option value="Vorgang">Vorgang</option>
                    <option value="Meilenstein">Meilenstein</option>
                    <option value="Sammelvorgang">Sammelvorgang</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--pm-text-muted)' }}>Dauer (AT)</label>
                  <input
                    type="number"
                    min="0"
                    value={selectedTask.dauer}
                    onChange={(e) =>
                      updateVorgang(selectedTask.id, { dauer: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1"
                    style={{ border: '1px solid var(--pm-border-strong)', color: 'var(--pm-text-primary)' }}
                  />
                </div>
              </div>

              {/* Fortschritt */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--pm-text-muted)' }}>
                  Fortschritt: {selectedTask.fortschritt}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedTask.fortschritt}
                  onChange={(e) =>
                    updateVorgang(selectedTask.id, { fortschritt: parseInt(e.target.value) })
                  }
                  className="w-full"
                  style={{ accentColor: 'var(--pm-accent)' }}
                />
              </div>

              {/* PSP-Code */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--pm-text-muted)' }}>PSP-Code</label>
                <input
                  type="text"
                  value={selectedTask.pspCode}
                  onChange={(e) => updateVorgang(selectedTask.id, { pspCode: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1"
                  style={{ border: '1px solid var(--pm-border-strong)', color: 'var(--pm-text-primary)' }}
                />
              </div>

              {/* Notizen */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--pm-text-muted)' }}>Notizen</label>
                <textarea
                  value={selectedTask.notizen}
                  onChange={(e) => updateVorgang(selectedTask.id, { notizen: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs rounded-lg h-16 resize-none focus:outline-none focus:ring-1"
                  style={{ border: '1px solid var(--pm-border-strong)', color: 'var(--pm-text-primary)' }}
                />
              </div>

              {/* Berechnete Werte (readonly) */}
              <div className="pt-2" style={{ borderTop: '1px solid var(--pm-border)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--pm-text-muted)' }}>Berechnete Werte</p>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                  {[
                    ['FAZ', selectedTask.fruehesterAnfang],
                    ['FEZ', selectedTask.fruehestesEnde],
                    ['SAZ', selectedTask.spaetesterAnfang],
                    ['SEZ', selectedTask.spaetestesEnde],
                    ['GP', selectedTask.gesamtpuffer],
                    ['FP', selectedTask.freierPuffer],
                  ].map(([label, val]) => (
                    <span key={label} className="contents">
                      <dt style={{ color: 'var(--pm-text-muted)' }}>{label}:</dt>
                      <dd
                        style={
                          label === 'GP' && selectedTask.istKritisch
                            ? { color: 'var(--pm-danger)', fontWeight: 600 }
                            : { color: 'var(--pm-text-primary)' }
                        }
                      >
                        {val ?? '–'}
                      </dd>
                    </span>
                  ))}
                  <span className="contents">
                    <dt style={{ color: 'var(--pm-text-muted)' }}>Kritisch:</dt>
                    <dd style={selectedTask.istKritisch ? { color: 'var(--pm-danger)', fontWeight: 600 } : {}}>
                      {selectedTask.istKritisch ? 'Ja' : 'Nein'}
                    </dd>
                  </span>
                </dl>
              </div>

              {/* Abhängigkeiten-Editor */}
              <div className="pt-2" style={{ borderTop: '1px solid var(--pm-border)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--pm-text-muted)' }}>Vorgänger</p>

                {vorgaengerDeps.length === 0 && (
                  <p className="text-xs mb-2" style={{ color: 'var(--pm-text-muted)' }}>Keine Vorgänger definiert.</p>
                )}

                <div className="space-y-1 mb-2">
                  {vorgaengerDeps.map((dep) => {
                    const vg = projekt.vorgaenge.find((v) => v.id === dep.vorgaengerId);
                    return (
                      <div key={dep.id} className="flex items-center gap-1 py-0.5">
                        <span className="flex-1 text-xs truncate" style={{ color: 'var(--pm-text-primary)' }}>
                          {vg?.name || '?'}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: 'var(--pm-row-summary)', color: 'var(--pm-text-muted)' }}>
                          {dep.typ}
                        </span>
                        {dep.zeitversatz !== 0 && (
                          <span className="text-xs" style={{ color: 'var(--pm-text-muted)' }}>
                            {dep.zeitversatz > 0 ? '+' : ''}
                            {dep.zeitversatz}d
                          </span>
                        )}
                        <button
                          onClick={() => deleteAbhaengigkeit(dep.id)}
                          className="text-xs hover:opacity-70"
                          style={{ color: 'var(--pm-border-strong)' }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>

                <AddDependencyForm
                  currentTaskId={selectedTask.id}
                  alleTasks={projekt.vorgaenge}
                  onAdd={(vorgaengerId, typ, zeitversatz) =>
                    addAbhaengigkeit(selectedTask.id, vorgaengerId, typ, zeitversatz)
                  }
                />
              </div>
            </div>
          </div>
          </>
        )}
      </div>

      {/* Shortcuts-Legende (nur wenn kein Detail-Panel offen) */}
      {!selectedTask && (
        <div className="flex-shrink-0 p-1 px-3 border-t border-slate-100 text-xs text-slate-400">
          Entf Löschen · F2 Umbenennen · Ins Einfügen · Tab Einrücken · Shift+Tab Ausrücken · Esc Abwählen
        </div>
      )}

      {/* Kontextmenü */}
      {contextMenu && (() => {
        const ctxTask = projekt.vorgaenge.find((v) => v.id === contextMenu.taskId);
        const canIndent = einruecken(projekt.vorgaenge, contextMenu.taskId) !== null;
        const canOutdent = ctxTask?.elternId != null;
        const ctxHasChildren = (childrenMap.get(contextMenu.taskId) || []).length > 0;
        return (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            items={[
              { label: 'Bearbeiten', icon: '✏️', onClick: () => handleSelectTask(contextMenu.taskId) },
              { label: ctxTask?.typ === 'Meilenstein' ? 'Zu Vorgang ändern' : 'Als Meilenstein', icon: '◆', onClick: () => {
                updateVorgang(contextMenu.taskId, {
                  typ: ctxTask?.typ === 'Meilenstein' ? 'Vorgang' : 'Meilenstein',
                  dauer: ctxTask?.typ === 'Meilenstein' ? 5 : 0,
                });
                toast(ctxTask?.typ === 'Meilenstein' ? 'Zu Vorgang geändert' : 'Als Meilenstein markiert', 'info');
              }},
              'separator',
              { label: 'Einrücken (→ Untervorgang)', icon: '→', onClick: () => {
                const result = einruecken(projekt.vorgaenge, contextMenu.taskId);
                if (result) { onUpdate({ vorgaenge: result }); toast('Eingerückt', 'info', 1500); }
              }, disabled: !canIndent },
              { label: 'Ausrücken (← Ebene hoch)', icon: '←', onClick: () => {
                const result = ausruecken(projekt.vorgaenge, contextMenu.taskId);
                if (result) { onUpdate({ vorgaenge: result }); toast('Ausgerückt', 'info', 1500); }
              }, disabled: !canOutdent },
              'separator',
              { label: 'Vorgang darunter einfügen', icon: '➕', onClick: () => {
                const idx = projekt.vorgaenge.findIndex((v) => v.id === contextMenu.taskId);
                const neu = createTask(projekt.id, {
                  name: `Vorgang ${projekt.vorgaenge.length + 1}`,
                  sortierung: idx + 1,
                  elternId: ctxTask?.elternId || null,
                });
                const vorgaenge = [...projekt.vorgaenge];
                vorgaenge.splice(idx + 1, 0, neu);
                onUpdate({ vorgaenge });
                toast('Vorgang eingefügt', 'success', 1500);
              }},
              { label: 'Duplizieren', icon: '📋', onClick: () => {
                const orig = projekt.vorgaenge.find((v) => v.id === contextMenu.taskId);
                if (!orig) return;
                const idx = projekt.vorgaenge.indexOf(orig);
                const kopie = createTask(projekt.id, {
                  name: `${orig.name} (Kopie)`,
                  dauer: orig.dauer,
                  typ: orig.typ,
                  pspCode: orig.pspCode ? `${orig.pspCode}k` : '',
                  fortschritt: 0,
                  notizen: orig.notizen,
                  sortierung: idx + 1,
                  elternId: orig.elternId,
                });
                const vorgaenge = [...projekt.vorgaenge];
                vorgaenge.splice(idx + 1, 0, kopie);
                onUpdate({ vorgaenge });
                toast(`"${orig.name}" dupliziert`, 'success');
              }},
              'separator',
              { label: 'Fortschritt → 100%', icon: '✅', onClick: () => {
                updateVorgang(contextMenu.taskId, { fortschritt: 100 });
                toast('Als abgeschlossen markiert', 'success');
              }, disabled: ctxTask?.fortschritt === 100 },
              { label: 'Fortschritt → 0%', icon: '🔄', onClick: () => {
                updateVorgang(contextMenu.taskId, { fortschritt: 0 });
                toast('Fortschritt zurückgesetzt', 'info');
              }, disabled: ctxTask?.fortschritt === 0 },
              'separator',
              { label: ctxHasChildren ? `Löschen (+${(childrenMap.get(contextMenu.taskId) || []).length} Unter.)` : 'Löschen', icon: '🗑', danger: true, onClick: () => deleteVorgang(contextMenu.taskId) },
            ]}
          />
        );
      })()}
    </div>
  );
}

/** Formular zum Hinzufügen eines neuen Vorgängers */
function AddDependencyForm({ currentTaskId, alleTasks, onAdd }) {
  const [vorgaengerId, setVorgaengerId] = useState('');
  const [typ, setTyp] = useState('EA');
  const [zeitversatz, setZeitversatz] = useState(0);

  const candidates = alleTasks.filter((t) => t.id !== currentTaskId);

  const handleAdd = () => {
    if (!vorgaengerId) return;
    onAdd(vorgaengerId, typ, zeitversatz);
    setVorgaengerId('');
    setZeitversatz(0);
  };

  return (
    <div className="space-y-1">
      <select
        value={vorgaengerId}
        onChange={(e) => setVorgaengerId(e.target.value)}
        className="w-full px-2 py-1 text-xs rounded-lg focus:outline-none focus:ring-1"
        style={{ border: '1px solid var(--pm-border-strong)', color: 'var(--pm-text-primary)' }}
      >
        <option value="">Vorgänger hinzufügen…</option>
        {candidates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <div className="flex gap-1">
        <select
          value={typ}
          onChange={(e) => setTyp(e.target.value)}
          className="flex-1 px-2 py-1 text-xs rounded-lg focus:outline-none focus:ring-1"
          style={{ border: '1px solid var(--pm-border-strong)', color: 'var(--pm-text-primary)' }}
        >
          <option value="EA">EA – Ende→Anfang</option>
          <option value="AA">AA – Anfang→Anfang</option>
          <option value="EE">EE – Ende→Ende</option>
          <option value="AE">AE – Anfang→Ende</option>
        </select>
        <input
          type="number"
          value={zeitversatz}
          onChange={(e) => setZeitversatz(parseInt(e.target.value) || 0)}
          title="Zeitversatz in Arbeitstagen"
          placeholder="±d"
          className="w-14 px-2 py-1 text-xs rounded-lg focus:outline-none focus:ring-1"
          style={{ border: '1px solid var(--pm-border-strong)', color: 'var(--pm-text-primary)' }}
        />
        <button
          onClick={handleAdd}
          disabled={!vorgaengerId}
          className="px-2 py-1 text-xs text-white rounded-lg disabled:opacity-40"
          style={{ background: 'var(--pm-accent)' }}
        >
          +
        </button>
      </div>
    </div>
  );
}
