/**
 * Kanban-Board-Ansicht (Design D3)
 * Vorgänge als Karten in Status-Spalten: Offen → In Arbeit → Abgeschlossen
 * Unterstützt Maus-Drag und Touch-Drag
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { useToast } from '../common/useToast';
import { pruefeFortschrittsAenderung, findeOutOfSequenceVorgaenge, findeGateBlockierteVorgaenge } from '../../utils/dependencies';

// Board-Spalten mit Fortschritts-Bereichen
const COLUMNS = [
  { id: 'offen', label: 'Offen', color: 'var(--pm-text-muted)', bgCard: 'var(--pm-table-bg)', range: [0, 0] },
  { id: 'inArbeit', label: 'In Arbeit', color: 'var(--pm-accent)', bgCard: 'var(--pm-accent-light)', range: [1, 99] },
  { id: 'erledigt', label: 'Abgeschlossen', color: 'var(--pm-success)', bgCard: 'var(--pm-success-bg)', range: [100, 100] },
];

const COL_LABELS = { offen: 'Offen', inArbeit: 'In Arbeit', erledigt: 'Abgeschlossen' };

function getColumnForTask(v) {
  if (v.fortschritt >= 100) return 'erledigt';
  if (v.fortschritt > 0) return 'inArbeit';
  return 'offen';
}

/** Fortschritts-Balken mini */
function ProgressBar({ value, color }) {
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--pm-border)' }}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}

export default function BoardView({ projekt, onUpdate }) {
  const [dragTaskId, setDragTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const toast = useToast();

  // Touch-Drag Refs
  const touchDragRef = useRef(null); // { taskId, startX, startY, el, ghost }
  const columnRefs = useRef({}); // colId → DOM element

  const updateVorgang = useCallback((id, changes) => {
    onUpdate({
      vorgaenge: projekt.vorgaenge.map((v) => (v.id === id ? { ...v, ...changes } : v)),
    });
  }, [projekt.vorgaenge, onUpdate]);

  // Out-of-Sequence-Erkennung
  const oosVorgaenge = useMemo(
    () => findeOutOfSequenceVorgaenge(projekt.vorgaenge, projekt.abhaengigkeiten),
    [projekt.vorgaenge, projekt.abhaengigkeiten]
  );

  // Quality Gate Blockierung
  const gateBlockiert = useMemo(
    () => findeGateBlockierteVorgaenge(projekt.vorgaenge, projekt.abhaengigkeiten),
    [projekt.vorgaenge, projekt.abhaengigkeiten]
  );

  // Shared Drop-Logik (Mouse + Touch)
  const dropToColumn = useCallback((taskId, colId) => {
    const task = projekt.vorgaenge.find((v) => v.id === taskId);
    if (!task) return;

    const currentCol = getColumnForTask(task);
    if (currentCol === colId) return;

    let neuerFortschritt;
    if (colId === 'offen') neuerFortschritt = 0;
    else if (colId === 'inArbeit') neuerFortschritt = task.fortschritt > 0 && task.fortschritt < 100 ? task.fortschritt : 50;
    else neuerFortschritt = 100;

    // Gate-Blockierung (harter Block)
    if (neuerFortschritt > 0 && gateBlockiert.has(taskId)) {
      const gates = gateBlockiert.get(taskId);
      toast(`🚫 Blockiert: Gate "${gates[0].name}" noch nicht freigegeben`, 'error', 4000);
      return;
    }

    // Out-of-Sequence-Warnung (weiche Warnung)
    if (neuerFortschritt > 0) {
      const { warnung, nachricht } = pruefeFortschrittsAenderung(
        taskId, neuerFortschritt, projekt.vorgaenge, projekt.abhaengigkeiten
      );
      if (warnung) {
        toast(`⚠ Out-of-Sequence: ${nachricht}`, 'warning', 4000);
      }
    }

    updateVorgang(taskId, { fortschritt: neuerFortschritt });
    toast(`"${task.name}" → ${COL_LABELS[colId]}`, 'success', 1500);
  }, [projekt.vorgaenge, projekt.abhaengigkeiten, updateVorgang, toast, gateBlockiert]);

  // Gruppiere Vorgänge nach Spalten
  const columns = COLUMNS.map((col) => ({
    ...col,
    tasks: projekt.vorgaenge.filter((v) => getColumnForTask(v) === col.id),
  }));

  // ── Mouse Drag & Drop Handler ─────────────────────────
  const handleDragStart = (e, taskId) => {
    setDragTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    const el = e.currentTarget;
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, 20);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!dragTaskId) return;
    dropToColumn(dragTaskId, colId);
    setDragTaskId(null);
  };

  const handleDragEnd = () => {
    setDragTaskId(null);
    setDragOverCol(null);
  };

  // ── Touch Drag Handler ────────────────────────────────
  const handleTouchStart = useCallback((e, taskId) => {
    const touch = e.touches[0];
    if (!touch) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();

    // Ghost-Element für visuelles Feedback
    const ghost = el.cloneNode(true);
    ghost.style.position = 'fixed';
    ghost.style.zIndex = '9999';
    ghost.style.width = `${rect.width}px`;
    ghost.style.opacity = '0.85';
    ghost.style.pointerEvents = 'none';
    ghost.style.transform = 'rotate(2deg) scale(1.03)';
    ghost.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
    ghost.style.left = `${touch.clientX - rect.width / 2}px`;
    ghost.style.top = `${touch.clientY - 20}px`;
    document.body.appendChild(ghost);

    touchDragRef.current = {
      taskId,
      startX: touch.clientX,
      startY: touch.clientY,
      ghost,
      moved: false,
    };
    setDragTaskId(taskId);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchDragRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    e.preventDefault(); // Scroll verhindern

    const ref = touchDragRef.current;
    ref.moved = true;
    ref.ghost.style.left = `${touch.clientX - parseInt(ref.ghost.style.width) / 2}px`;
    ref.ghost.style.top = `${touch.clientY - 20}px`;

    // Spalte unter dem Finger finden
    let foundCol = null;
    for (const [colId, colEl] of Object.entries(columnRefs.current)) {
      if (!colEl) continue;
      const rect = colEl.getBoundingClientRect();
      if (touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        foundCol = colId;
        break;
      }
    }
    setDragOverCol(foundCol);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchDragRef.current) return;
    const ref = touchDragRef.current;

    // Ghost entfernen
    if (ref.ghost && ref.ghost.parentNode) {
      ref.ghost.parentNode.removeChild(ref.ghost);
    }

    // Drop ausführen
    if (ref.moved && dragOverCol) {
      dropToColumn(ref.taskId, dragOverCol);
    }

    touchDragRef.current = null;
    setDragTaskId(null);
    setDragOverCol(null);
  }, [dragOverCol, dropToColumn]);

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{ touchAction: dragTaskId ? 'none' : 'auto' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ background: 'var(--pm-row-summary)', borderBottom: '1px solid var(--pm-border)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pm-text-muted)' }}>
          Board – {projekt.vorgaenge.length} Vorgänge
        </span>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--pm-text-muted)' }}>
          {columns.map((col) => (
            <span key={col.id} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
              {col.tasks.length} {col.label}
            </span>
          ))}
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 flex gap-4 p-4 overflow-x-auto overflow-y-hidden">
        {columns.map((col) => (
          <div
            key={col.id}
            ref={(el) => { columnRefs.current[col.id] = el; }}
            className="flex flex-col min-w-[260px] flex-1 rounded-xl transition-colors"
            style={{
              background: dragOverCol === col.id ? 'var(--pm-accent-light)' : 'var(--pm-row-summary)',
              border: dragOverCol === col.id ? '2px dashed var(--pm-accent)' : '2px solid transparent',
            }}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Spalten-Header */}
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pm-text-secondary)' }}>
                  {col.label}
                </span>
              </div>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded-full" style={{ background: 'var(--pm-border)', color: 'var(--pm-text-muted)' }}>
                {col.tasks.length}
              </span>
            </div>

            {/* Karten */}
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
              {col.tasks.map((v) => (
                <div
                  key={v.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, v.id)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(e, v.id)}
                  className="rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md group select-none"
                  style={{
                    background: 'var(--pm-table-bg)',
                    border: '1px solid var(--pm-border)',
                    opacity: dragTaskId === v.id ? 0.4 : 1,
                  }}
                >
                  {/* Typ-Badge + PSP */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {v.typ === 'Meilenstein' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#F3E8FF', color: 'var(--pm-milestone)' }}>
                          ◆ Meilenstein
                        </span>
                      )}
                      {v.typ === 'Sammelvorgang' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'var(--pm-row-summary)', color: 'var(--pm-text-secondary)' }}>
                          Sammelvorgang
                        </span>
                      )}
                    </div>
                    {v.pspCode && (
                      <span className="text-[10px] font-mono" style={{ color: 'var(--pm-text-muted)' }}>
                        {v.pspCode}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <p className="text-sm font-medium mb-2 leading-snug" style={{ color: 'var(--pm-text-primary)' }}>
                    {v.name}
                  </p>

                  {/* Meta-Zeile */}
                  <div className="flex items-center gap-2 mb-2 text-[10px]" style={{ color: 'var(--pm-text-muted)' }}>
                    {v.typ !== 'Meilenstein' && (
                      <span>{v.dauer}d</span>
                    )}
                    {v.fruehesterAnfang && (
                      <span>{v.fruehesterAnfang.slice(5)}</span>
                    )}
                    {v.istKritisch && (
                      <span className="px-1 py-0.5 rounded text-[9px] font-semibold" style={{ background: 'var(--pm-danger-bg)', color: 'var(--pm-danger)' }}>
                        Kritisch
                      </span>
                    )}
                    {gateBlockiert.has(v.id) && (
                      <span className="px-1 py-0.5 rounded text-[9px] font-semibold" style={{ background: '#EF444422', color: '#EF4444' }} title={`Gate blockiert: "${gateBlockiert.get(v.id)[0]?.name}"`}>
                        🚫 Gate
                      </span>
                    )}
                    {oosVorgaenge.has(v.id) && !gateBlockiert.has(v.id) && (
                      <span className="px-1 py-0.5 rounded text-[9px] font-semibold" style={{ background: '#F59E0B22', color: '#F59E0B' }} title="Out-of-Sequence: Vorgänger nicht abgeschlossen">
                        ⚠ OOS
                      </span>
                    )}
                  </div>

                  {/* Fortschrittsbalken */}
                  {v.typ !== 'Meilenstein' && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ProgressBar value={v.fortschritt} color={col.color} />
                      </div>
                      <span className="text-[10px] font-medium" style={{ color: 'var(--pm-text-muted)' }}>
                        {v.fortschritt}%
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {col.tasks.length === 0 && (
                <div className="flex items-center justify-center py-8 text-xs rounded-lg border-2 border-dashed" style={{ borderColor: 'var(--pm-border)', color: 'var(--pm-text-muted)' }}>
                  {dragTaskId ? 'Hier ablegen' : 'Keine Vorgänge'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
