import { useState, useEffect, useCallback, useRef } from 'react';
import { createProject, createTask, createDependency } from './models/types';
import { berechneNetzplan } from './utils/cpm';
import {
  speichereProjekt,
  ladeProjekt,
  ladeProjektliste,
  ladeEinstellungen,
  speichereEinstellungen,
  exportProjektAlsJSON,
  importProjektAusJSON,
} from './utils/storage';
import GanttView from './components/gantt/GanttView';
import BoardView from './components/board/BoardView';
import ResourceView from './components/resources/ResourceView';
import NetworkView from './components/network/NetworkView';
import DashboardView from './components/dashboard/DashboardView';
import Tooltip from './components/common/Tooltip';
import { useToast } from './components/common/useToast';

// Sidebar-Navigation (vertikal)
const NAV_ITEMS = [
  { id: 'gantt', label: 'Gantt', icon: '📊' },
  { id: 'board', label: 'Board', icon: '📋' },
  { id: 'netzplan', label: 'Netzplan', icon: '🔗' },
  { id: 'dashboard', label: 'Dashboard', icon: '📈' },
];
const NAV_BOTTOM = [
  { id: 'ressourcen', label: 'Ressourcen', icon: '👥' },
];

const UNDO_LIMIT = 20;

// Status-Badge Farben
const STATUS_COLORS = {
  Planung: 'bg-slate-500/20 text-slate-300',
  Aktiv: 'bg-blue-500/20 text-blue-300',
  Abgeschlossen: 'bg-green-500/20 text-green-300',
  Eingefroren: 'bg-amber-500/20 text-amber-300',
};

// ─── Projektvorlagen (Masterprompt F) ────────────────────────

function erstelleVorlage(typ) {
  const base = createProject({ name: `${typ}-Projekt` });
  const tasks = [];
  const deps = [];

  const addTask = (name, dauer, pspCode, typ = 'Vorgang', elternId = null) => {
    const t = createTask(base.id, {
      name,
      dauer,
      pspCode,
      typ,
      elternId,
      sortierung: tasks.length,
    });
    tasks.push(t);
    return t;
  };
  const addDep = (vId, nId) => {
    deps.push(createDependency({ vorgaengerId: vId, nachfolgerId: nId, typ: 'EA' }));
  };

  if (typ === 'IT') {
    const p1 = addTask('Projektstart', 0, '1', 'Meilenstein');
    const phase1 = addTask('Analyse', 0, '2', 'Sammelvorgang');
    const a1 = addTask('Anforderungsanalyse', 5, '2.1', 'Vorgang', phase1.id);
    const a2 = addTask('Systemdesign', 7, '2.2', 'Vorgang', phase1.id);
    const phase2 = addTask('Umsetzung', 0, '3', 'Sammelvorgang');
    const a3 = addTask('Implementierung', 15, '3.1', 'Vorgang', phase2.id);
    const a4 = addTask('Testing', 8, '3.2', 'Vorgang', phase2.id);
    const a5 = addTask('Deployment', 3, '4');
    const p2 = addTask('Go-Live', 0, '5', 'Meilenstein');
    addDep(p1.id, a1.id);
    addDep(a1.id, a2.id);
    addDep(a2.id, a3.id);
    addDep(a3.id, a4.id);
    addDep(a4.id, a5.id);
    addDep(a5.id, p2.id);
  } else if (typ === 'Bau') {
    const p1 = addTask('Baubeginn', 0, '1', 'Meilenstein');
    const a1 = addTask('Planung & Genehmigung', 10, '2');
    const phase1 = addTask('Baukörper', 0, '3', 'Sammelvorgang');
    const a2 = addTask('Rohbau', 20, '3.1', 'Vorgang', phase1.id);
    const a3 = addTask('Dach & Fassade', 15, '3.2', 'Vorgang', phase1.id);
    const a4 = addTask('Innenausbau', 20, '3.3', 'Vorgang', phase1.id);
    const a5 = addTask('Haustechnik', 10, '3.4', 'Vorgang', phase1.id);
    const a6 = addTask('Außenanlagen', 8, '4');
    const p2 = addTask('Abnahme', 0, '5', 'Meilenstein');
    addDep(p1.id, a1.id);
    addDep(a1.id, a2.id);
    addDep(a2.id, a3.id);
    addDep(a3.id, a4.id);
    addDep(a4.id, a5.id);
    addDep(a5.id, a6.id);
    addDep(a6.id, p2.id);
  } else if (typ === 'Instandhaltung') {
    const p1 = addTask('Wartungsstart', 0, '1', 'Meilenstein');
    const a1 = addTask('Inspektion', 2, '2');
    const phase1 = addTask('Instandsetzung', 0, '3', 'Sammelvorgang');
    const a2 = addTask('Demontage', 3, '3.1', 'Vorgang', phase1.id);
    const a3 = addTask('Reinigung', 2, '3.2', 'Vorgang', phase1.id);
    const a4 = addTask('Ersatzteilbeschaffung', 5, '3.3', 'Vorgang', phase1.id);
    const a5 = addTask('Reparatur', 4, '3.4', 'Vorgang', phase1.id);
    const a6 = addTask('Montage', 3, '3.5', 'Vorgang', phase1.id);
    const a7 = addTask('Funktionstest', 2, '4');
    const p2 = addTask('Freigabe', 0, '5', 'Meilenstein');
    addDep(p1.id, a1.id);
    addDep(a1.id, a2.id);
    addDep(a2.id, a3.id);
    addDep(a2.id, a4.id);
    addDep(a3.id, a5.id);
    addDep(a4.id, a5.id);
    addDep(a5.id, a6.id);
    addDep(a6.id, a7.id);
    addDep(a7.id, p2.id);
  } else {
    // Fachschule
    const p1 = addTask('Projektauftrag', 0, '1', 'Meilenstein');
    const phase1 = addTask('Vorbereitung', 0, '2', 'Sammelvorgang');
    const a1 = addTask('Themenrecherche', 5, '2.1', 'Vorgang', phase1.id);
    const a2 = addTask('Gliederung erstellen', 3, '2.2', 'Vorgang', phase1.id);
    const phase2 = addTask('Durchführung', 0, '3', 'Sammelvorgang');
    const a3 = addTask('Ausarbeitung', 15, '3.1', 'Vorgang', phase2.id);
    const a4 = addTask('Korrektur & Review', 5, '3.2', 'Vorgang', phase2.id);
    const a5 = addTask('Präsentation vorbereiten', 5, '4');
    const p2 = addTask('Präsentation', 0, '5', 'Meilenstein');
    addDep(p1.id, a1.id);
    addDep(a1.id, a2.id);
    addDep(a2.id, a3.id);
    addDep(a3.id, a4.id);
    addDep(a4.id, a5.id);
    addDep(a5.id, p2.id);
  }

  return { ...base, name: `${typ}-Vorlage`, vorgaenge: tasks, abhaengigkeiten: deps };
}

// ─── Hauptkomponente ──────────────────────────────────────────

export default function App() {
  const [projekt, setProjekt] = useState(null);
  const [activeTab, setActiveTab] = useState('gantt');
  const [fehler, setFehler] = useState(null);
  const [showVorlagen, setShowVorlagen] = useState(false);
  const [showEinstellungen, setShowEinstellungen] = useState(false);
  const toast = useToast();

  // Undo/Redo History
  const history = useRef([]); // Array von Projekt-Snapshots
  const historyIndex = useRef(-1);
  const skipHistory = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const debounceRef = useRef(null);
  const [auswirkung, setAuswirkung] = useState(null);
  const auswirkungTimerRef = useRef(null);
  const istErstesLadenRef = useRef(true);
  const projektRef = useRef(null); // Aktuellen Zustand für Vergleiche speichern

  // Projekt laden beim Start
  useEffect(() => {
    async function init() {
      const einstellungen = await ladeEinstellungen();
      const liste = await ladeProjektliste();

      if (einstellungen.letztesProjektId) {
        const p = await ladeProjekt(einstellungen.letztesProjektId);
        if (p) {
          setProjekt(p);
          projektRef.current = p;
          setActiveTab(einstellungen.letzteAnsicht || 'gantt');
          history.current = [p];
          historyIndex.current = 0;
        }
      }

      if (!projektRef.current && liste.length > 0) {
        const p = await ladeProjekt(liste[0].id);
        if (p) {
          setProjekt(p);
          projektRef.current = p;
          history.current = [p];
          historyIndex.current = 0;
        }
      }
      // Nach dem ersten Laden: Auswirkungs-Feedback aktivieren
      setTimeout(() => { istErstesLadenRef.current = false; }, 500);
    }
    init();
  }, []);

  // projektRef synchron halten
  useEffect(() => { projektRef.current = projekt; }, [projekt]);

  // Autosave mit 2s Debounce (Masterprompt D.1)
  useEffect(() => {
    if (!projekt) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await speichereProjekt({ ...projekt, aktualisiertAm: new Date().toISOString() });
      await speichereEinstellungen({ letztesProjektId: projekt.id, letzteAnsicht: activeTab });
      toast('Projekt gespeichert', 'save', 1500);
    }, 2000);
    return () => clearTimeout(debounceRef.current);
  }, [projekt, activeTab, toast]);

  const syncHistoryState = useCallback(() => {
    setCanUndo(historyIndex.current > 0);
    setCanRedo(historyIndex.current < history.current.length - 1);
  }, []);

  const pushHistory = useCallback((p) => {
    if (skipHistory.current) return;
    history.current = history.current.slice(0, historyIndex.current + 1);
    history.current.push(p);
    if (history.current.length > UNDO_LIMIT) {
      history.current.shift();
    }
    historyIndex.current = history.current.length - 1;
    syncHistoryState();
  }, [syncHistoryState]);

  const applyProjekt = useCallback((p, addToHistory = true) => {
    const { vorgaenge, fehler: f } = berechneNetzplan(
      p.vorgaenge,
      p.abhaengigkeiten,
      p.kalender,
      p.startDatum
    );
    setFehler(f);
    const updated = { ...p, vorgaenge };
    setProjekt(updated);
    if (addToHistory) pushHistory(updated);
    return updated;
  }, [pushHistory]);

  const updateProjekt = useCallback(
    (changes) => {
      const prev = projektRef.current;
      if (!prev) return;

      // Vorher: altes Projektende + Termine merken (für Auswirkungs-Feedback)
      const alteEnden = prev.vorgaenge.map((v) => v.fruehestesEnde).filter(Boolean);
      const altesEnde = alteEnden.length > 0 ? alteEnden.reduce((a, b) => (a > b ? a : b)) : null;
      const alteTermine = new Map(prev.vorgaenge.map((v) => [v.id, v.fruehesterAnfang]));

      const merged = { ...prev, ...changes };
      const { vorgaenge, fehler: f } = berechneNetzplan(
        merged.vorgaenge,
        merged.abhaengigkeiten,
        merged.kalender,
        merged.startDatum
      );
      setFehler(f);
      const updated = { ...merged, vorgaenge };
      pushHistory(updated);
      setProjekt(updated);

      // Auswirkungs-Feedback (nicht beim ersten Laden, nicht bei reinen Text-Änderungen)
      if (!istErstesLadenRef.current) {
        const hatTerminAenderung = changes.vorgaenge || changes.abhaengigkeiten || changes.startDatum || changes.kalender;
        if (hatTerminAenderung) {
          const neueEnden = vorgaenge.map((v) => v.fruehestesEnde).filter(Boolean);
          const neuesEnde = neueEnden.length > 0 ? neueEnden.reduce((a, b) => (a > b ? a : b)) : null;

          let verschoben = 0;
          for (const v of vorgaenge) {
            const alt = alteTermine.get(v.id);
            if (alt && v.fruehesterAnfang && alt !== v.fruehesterAnfang) verschoben++;
          }

          if (verschoben > 0 || (altesEnde && neuesEnde && altesEnde !== neuesEnde)) {
            let text = '';
            if (verschoben > 0) text += `${verschoben} ${verschoben > 1 ? 'Vorgänge' : 'Vorgang'} verschoben`;
            if (altesEnde && neuesEnde && altesEnde !== neuesEnde) {
              const d1 = new Date(altesEnde);
              const d2 = new Date(neuesEnde);
              const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
              if (text) text += ' · ';
              text += `Projektende: ${diff > 0 ? '+' : ''}${diff} Tage (→ ${neuesEnde.slice(5)})`;
            }
            if (text) {
              clearTimeout(auswirkungTimerRef.current);
              setAuswirkung(text);
              auswirkungTimerRef.current = setTimeout(() => setAuswirkung(null), 4000);
            }
          }
        }
      }
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    if (historyIndex.current <= 0) return;
    historyIndex.current -= 1;
    const p = history.current[historyIndex.current];
    skipHistory.current = true;
    applyProjekt(p, false);
    skipHistory.current = false;
    syncHistoryState();
    toast('Rückgängig gemacht', 'undo', 1500);
  }, [applyProjekt, toast, syncHistoryState]);

  const redo = useCallback(() => {
    if (historyIndex.current >= history.current.length - 1) return;
    historyIndex.current += 1;
    const p = history.current[historyIndex.current];
    skipHistory.current = true;
    applyProjekt(p, false);
    skipHistory.current = false;
    syncHistoryState();
    toast('Wiederholt', 'redo', 1500);
  }, [applyProjekt, toast, syncHistoryState]);

  const neuesProjekt = useCallback(() => {
    const p = createProject();
    history.current = [];
    historyIndex.current = -1;
    applyProjekt(p);
  }, [applyProjekt]);

  useEffect(() => {
    const handler = (e) => {
      // Undo/Redo (immer aktiv)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        redo();
      }
      // Globale Shortcuts (nicht wenn Input/Textarea fokussiert)
      const tag = document.activeElement?.tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        neuesProjekt();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && !inInput) {
        e.preventDefault();
        setShowEinstellungen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, neuesProjekt]);

  const ladeVorlage = useCallback(
    (typ) => {
      const vorlage = erstelleVorlage(typ);
      history.current = [];
      historyIndex.current = -1;
      applyProjekt(vorlage);
      setShowVorlagen(false);
      toast(`Vorlage "${typ}" geladen`, 'success');
    },
    [applyProjekt, toast]
  );

  const handleImport = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const imported = await importProjektAusJSON(file);
        history.current = [];
        historyIndex.current = -1;
        applyProjekt(imported);
        toast('Projekt importiert', 'success');
      } catch (err) {
        setFehler(err.message);
        toast('Import fehlgeschlagen', 'error');
      }
    },
    [applyProjekt, toast]
  );

  // ── Kein Projekt → Start-Screen (Design v2) ──
  if (!projekt) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--pm-surface)' }}>
        <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full mx-4 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--pm-header-bg)' }}>
              <span className="text-2xl">📊</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">PM-Tool</h1>
            <p className="text-sm text-slate-500 mt-1">Projektmanagement im Browser</p>
            <p className="text-xs text-slate-400 mt-0.5">Gantt-Diagramm · Netzplan · Ressourcen · Dashboard</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={neuesProjekt}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              + Leeres Projekt erstellen
            </button>

            <div>
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-medium">Schnellstart mit Vorlage</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { typ: 'IT', icon: '💻', desc: '7 Vorgänge: Analyse → Go-Live' },
                  { typ: 'Bau', icon: '🏗️', desc: '8 Vorgänge: Planung → Abnahme' },
                  { typ: 'Instandhaltung', icon: '🔧', desc: '9 Vorgänge: Inspektion → Freigabe' },
                  { typ: 'Fachschule', icon: '🎓', desc: '7 Vorgänge: Recherche → Präsentation' },
                ].map(({ typ, icon, desc }) => (
                  <button
                    key={typ}
                    onClick={() => ladeVorlage(typ)}
                    className="px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:border-blue-400 hover:shadow-md transition-all text-left group"
                  >
                    <span className="text-lg mr-1.5">{icon}</span>
                    <span className="text-sm font-medium">{typ}</span>
                    <p className="text-xs text-slate-400 mt-0.5 group-hover:text-slate-500">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-dashed border-slate-300 text-slate-500 rounded-lg hover:bg-slate-50 hover:border-blue-300 cursor-pointer text-sm transition-all">
              <span>📂</span> JSON-Datei importieren
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          <p className="text-xs text-slate-300 mt-6 text-center">Strg+Z Rückgängig · Strg+Y Wiederholen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--pm-surface)' }}>
      {/* ══ TOPBAR (dunkel, 48px) ══════════════════════════════ */}
      <header className="flex items-center justify-between px-4 h-12 flex-shrink-0" style={{ background: 'var(--pm-header-bg)' }}>
        {/* Links: Logo + Projektname */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-white/60 text-lg hidden sm:block">≡</span>
          <span className="text-white font-semibold text-sm hidden sm:block">PM-Tool</span>
          <div className="w-px h-5 bg-white/20 hidden sm:block" />
          <button
            onClick={() => setShowEinstellungen(true)}
            className="text-white text-sm font-medium truncate max-w-[200px] hover:text-white/80 transition-colors"
            title="Projekt-Einstellungen öffnen"
          >
            {projekt.name}
          </button>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[projekt.status] || STATUS_COLORS.Planung}`}>
            {projekt.status}
          </span>
        </div>

        {/* Rechts: Aktionen */}
        <div className="flex items-center gap-1">
          {/* Undo/Redo */}
          <Tooltip text="Rückgängig (Strg+Z)">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="px-2 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ↩
            </button>
          </Tooltip>
          <Tooltip text="Wiederholen (Strg+Y)">
            <button
              onClick={redo}
              disabled={!canRedo}
              className="px-2 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ↪
            </button>
          </Tooltip>

          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Vorlagen */}
          <div className="relative">
            <Tooltip text="Projektvorlage laden">
              <button
                onClick={() => setShowVorlagen((v) => !v)}
                className="px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <span className="sm:hidden">📁</span><span className="hidden sm:inline">📁 Vorlagen</span>
              </button>
            </Tooltip>
            {showVorlagen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 w-40">
                {['IT', 'Bau', 'Instandhaltung', 'Fachschule'].map((typ) => (
                  <button
                    key={typ}
                    onClick={() => ladeVorlage(typ)}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 text-slate-700"
                  >
                    {typ}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Tooltip text="Projekt als JSON exportieren">
            <button
              onClick={() => { exportProjektAlsJSON(projekt); toast('JSON exportiert', 'success'); }}
              className="px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <span className="sm:hidden">📤</span><span className="hidden sm:inline">📤 Export</span>
            </button>
          </Tooltip>
          <Tooltip text="JSON-Datei importieren">
            <label className="px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer">
              <span className="sm:hidden">📥</span><span className="hidden sm:inline">📥 Import</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </Tooltip>

          <div className="w-px h-5 bg-white/20 mx-1" />

          <Tooltip text="Projekt-Einstellungen">
            <button
              onClick={() => setShowEinstellungen(true)}
              className="px-2 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              ⚙️
            </button>
          </Tooltip>

          <Tooltip text="Neues leeres Projekt">
            <button
              onClick={neuesProjekt}
              className="ml-1 px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              <span className="hidden sm:inline">+ Neu</span>
              <span className="sm:hidden">+</span>
            </button>
          </Tooltip>
        </div>
      </header>

      {/* ══ BODY: Sidebar + Content ═══════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── SIDEBAR (60px, dunkel) ──────────────────────── */}
        <nav className="hidden sm:flex flex-col w-[60px] flex-shrink-0" style={{ background: 'var(--pm-sidebar-bg)' }}>
          {/* Haupt-Navigation */}
          <div className="flex-1 flex flex-col items-center pt-2 gap-1">
            {NAV_ITEMS.map((item) => (
              <Tooltip key={item.id} text={item.label} position="right">
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-11 h-11 flex items-center justify-center rounded-lg text-lg transition-all relative ${
                    activeTab === item.id
                      ? 'text-white bg-white/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {/* Aktiver Indikator */}
                  {activeTab === item.id && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r" style={{ background: 'var(--pm-accent)' }} />
                  )}
                  {item.icon}
                </button>
              </Tooltip>
            ))}

            {/* Trennlinie */}
            <div className="w-8 border-t border-slate-700 my-1" />

            {NAV_BOTTOM.map((item) => (
              <Tooltip key={item.id} text={item.label} position="right">
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-11 h-11 flex items-center justify-center rounded-lg text-lg transition-all relative ${
                    activeTab === item.id
                      ? 'text-white bg-white/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {activeTab === item.id && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r" style={{ background: 'var(--pm-accent)' }} />
                  )}
                  {item.icon}
                </button>
              </Tooltip>
            ))}
          </div>

          {/* Unten: Einstellungen */}
          <div className="flex flex-col items-center pb-3">
            <Tooltip text="Einstellungen" position="right">
              <button
                onClick={() => setShowEinstellungen(true)}
                className="w-11 h-11 flex items-center justify-center rounded-lg text-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                ⚙️
              </button>
            </Tooltip>
          </div>
        </nav>

        {/* ── Mobile Tab-Bar (nur unter sm) ────────────────── */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[100] flex justify-around py-1 border-t" style={{ background: 'var(--pm-sidebar-bg)', borderColor: '#334155' }}>
          {[...NAV_ITEMS, ...NAV_BOTTOM].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-3 text-xs transition-colors ${
                activeTab === item.id ? 'text-white' : 'text-slate-400'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="mt-0.5">{item.label}</span>
            </button>
          ))}
        </div>

        {/* ── CONTENT ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Fehler-Anzeige */}
          {fehler && (
            <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm flex items-center justify-between flex-shrink-0">
              <span>⚠ {fehler}</span>
              <button onClick={() => setFehler(null)} className="text-red-500 hover:text-red-700">✕</button>
            </div>
          )}

          {/* Auswirkungs-Feedback */}
          {auswirkung && (
            <div className="px-4 py-1.5 bg-blue-50 border-b border-blue-200 text-blue-700 text-xs flex items-center justify-between flex-shrink-0" style={{ animation: 'slideUp 0.2s ease-out' }}>
              <span>ℹ {auswirkung}</span>
              <button onClick={() => { setAuswirkung(null); clearTimeout(auswirkungTimerRef.current); }} className="text-blue-400 hover:text-blue-600 ml-3">✕</button>
            </div>
          )}

          {/* Hauptbereich */}
          <main className="flex-1 overflow-hidden pb-14 sm:pb-0">
            {activeTab === 'gantt' && <GanttView projekt={projekt} onUpdate={updateProjekt} />}
            {activeTab === 'board' && <BoardView projekt={projekt} onUpdate={updateProjekt} />}
            {activeTab === 'ressourcen' && <ResourceView projekt={projekt} onUpdate={updateProjekt} />}
            {activeTab === 'netzplan' && <NetworkView projekt={projekt} />}
            {activeTab === 'dashboard' && <DashboardView projekt={projekt} />}
          </main>
        </div>
      </div>

      {/* Vorlagen-Dropdown schließen bei Klick außen */}
      {showVorlagen && (
        <div className="fixed inset-0 z-40" onClick={() => setShowVorlagen(false)} />
      )}

      {/* Projekt-Einstellungen Modal */}
      {showEinstellungen && (
        <EinstellungenModal
          projekt={projekt}
          onSave={(changes) => {
            updateProjekt(changes);
            setShowEinstellungen(false);
            toast('Einstellungen gespeichert', 'success');
          }}
          onClose={() => setShowEinstellungen(false)}
        />
      )}
    </div>
  );
}

// ─── Einstellungen-Modal ──────────────────────────────────────────

function EinstellungenModal({ projekt, onSave, onClose }) {
  const [name, setName] = useState(projekt.name);
  const [startDatum, setStartDatum] = useState(projekt.startDatum);
  const [status, setStatus] = useState(projekt.status);
  const [wochenendeAktiv, setWochenendeAktiv] = useState(
    !(projekt.kalender.arbeitstage[5] === false && projekt.kalender.arbeitstage[6] === false)
  );

  const handleSave = () => {
    const neueArbeitstage = [...projekt.kalender.arbeitstage];
    neueArbeitstage[5] = wochenendeAktiv;
    neueArbeitstage[6] = wochenendeAktiv;
    onSave({
      name,
      startDatum,
      status,
      kalender: { ...projekt.kalender, arbeitstage: neueArbeitstage },
    });
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
        style={{ animation: 'fadeIn 0.15s ease-out' }}
      >
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span>⚙️</span> Projekt-Einstellungen
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Projektname</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none"
              placeholder="Projektname eingeben"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Startdatum</label>
            <input
              type="date"
              value={startDatum}
              onChange={(e) => setStartDatum(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Projektstatus</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white"
            >
              <option value="Planung">Planung</option>
              <option value="Aktiv">Aktiv</option>
              <option value="Abgeschlossen">Abgeschlossen</option>
              <option value="Eingefroren">Eingefroren</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="wochenendeAktiv"
              checked={!wochenendeAktiv}
              onChange={(e) => setWochenendeAktiv(!e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-400"
            />
            <label htmlFor="wochenendeAktiv" className="text-sm text-slate-700">
              Wochenenden überspringen
            </label>
            <span className="text-xs text-slate-400">
              {wochenendeAktiv ? 'Sa + So sind Arbeitstage' : 'Nur Mo–Fr'}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
