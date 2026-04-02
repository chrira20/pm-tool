/**
 * Netzplandiagramm (VKN nach DIN 69900)
 *
 * Knotenformat:
 *   ┌──────────────────────────────┐
 *   │  FAZ  │  Dauer  │    FEZ    │
 *   ├───────┴─────────┴───────────┤
 *   │            Name             │
 *   ├──────────────────────────────┤
 *   │  SAZ  │    GP   │    SEZ    │
 *   └──────────────────────────────┘
 *
 * Auto-Layout: ebenenweise von links nach rechts
 * Kritischer Pfad: rot hervorgehoben
 * Pan/Zoom: Maus + Scroll
 */

import { useMemo, useState, useRef, useCallback } from 'react';

const NODE_W = 168;
const NODE_H = 78;
const H_GAP = 72;
const V_GAP = 20;
const PADDING = 32;

/** Berechnet Ebenen per topologischer Sortierung */
function computeLevels(vorgaenge, abhaengigkeiten) {
  const predMap = new Map(vorgaenge.map((v) => [v.id, []]));
  for (const dep of abhaengigkeiten) {
    if (predMap.has(dep.nachfolgerId)) {
      predMap.get(dep.nachfolgerId).push(dep.vorgaengerId);
    }
  }

  const levels = new Map();
  const inStack = new Set();

  function getLevel(id) {
    if (levels.has(id)) return levels.get(id);
    if (inStack.has(id)) return 0; // Zyklus → Fallback
    inStack.add(id);
    const preds = predMap.get(id) || [];
    const level =
      preds.length === 0 ? 0 : Math.max(...preds.map((p) => getLevel(p) + 1));
    levels.set(id, level);
    inStack.delete(id);
    return level;
  }

  for (const v of vorgaenge) getLevel(v.id);
  return levels;
}

/** Berechnet x/y Positionen aller Knoten */
function computePositions(vorgaenge, abhaengigkeiten) {
  if (vorgaenge.length === 0) return new Map();

  const levels = computeLevels(vorgaenge, abhaengigkeiten);

  // Gruppieren nach Ebene
  const byLevel = new Map();
  for (const [id, level] of levels) {
    if (!byLevel.has(level)) byLevel.set(level, []);
    byLevel.get(level).push(id);
  }

  const positions = new Map();
  for (const [level, ids] of byLevel) {
    ids.forEach((id, idx) => {
      positions.set(id, {
        x: PADDING + level * (NODE_W + H_GAP),
        y: PADDING + idx * (NODE_H + V_GAP),
      });
    });
  }
  return positions;
}

/** Einzelner VKN-Knoten */
function VknNode({ task, x, y, isSelected, onClick }) {
  const crit = task.istKritisch;
  const strokeColor = crit ? '#EF4444' : isSelected ? '#3B82F6' : '#94A3B8';
  const strokeWidth = isSelected ? 2.5 : crit ? 2 : 1;
  const bgColor = crit ? '#FEF2F2' : isSelected ? '#EFF6FF' : '#F8FAFC';
  const textPrimary = crit ? '#7F1D1D' : '#1E293B';
  const textAccent = crit ? '#DC2626' : '#3B82F6';
  const divider = crit ? '#FECACA' : '#E2E8F0';
  const rowH = NODE_H / 3;

  const fmt = (v) => (v ? String(v).slice(5) : '–'); // nur MM-DD zeigen
  const fmtNum = (v) => (v !== null && v !== undefined ? String(v) : '–');

  return (
    <g transform={`translate(${x},${y})`} onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Hintergrund */}
      <rect
        width={NODE_W}
        height={NODE_H}
        fill={bgColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        rx={4}
      />

      {/* Obere Zeile: FAZ | Dauer | FEZ */}
      <line x1={0} y1={rowH} x2={NODE_W} y2={rowH} stroke={divider} strokeWidth={1} />
      <line x1={NODE_W / 3} y1={0} x2={NODE_W / 3} y2={rowH} stroke={divider} strokeWidth={1} />
      <line x1={(NODE_W * 2) / 3} y1={0} x2={(NODE_W * 2) / 3} y2={rowH} stroke={divider} strokeWidth={1} />
      <text
        x={NODE_W / 6}
        y={rowH / 2 + 4}
        textAnchor="middle"
        fontSize={9}
        fill={textAccent}
        fontFamily="monospace"
        fontWeight="600"
      >
        {fmt(task.fruehesterAnfang)}
      </text>
      <text
        x={NODE_W / 2}
        y={rowH / 2 + 4}
        textAnchor="middle"
        fontSize={11}
        fill={textPrimary}
        fontFamily="monospace"
        fontWeight="700"
      >
        {task.typ === 'Meilenstein' ? '◆' : fmtNum(task.dauer)}
      </text>
      <text
        x={(NODE_W * 5) / 6}
        y={rowH / 2 + 4}
        textAnchor="middle"
        fontSize={9}
        fill={textAccent}
        fontFamily="monospace"
        fontWeight="600"
      >
        {fmt(task.fruehestesEnde)}
      </text>

      {/* Mittlere Zeile: Name */}
      <line x1={0} y1={rowH * 2} x2={NODE_W} y2={rowH * 2} stroke={divider} strokeWidth={1} />
      <text
        x={NODE_W / 2}
        y={rowH + rowH / 2 + 4}
        textAnchor="middle"
        fontSize={11}
        fill={textPrimary}
        fontWeight="600"
        fontFamily="system-ui"
      >
        {task.name.length > 20 ? task.name.slice(0, 20) + '…' : task.name}
      </text>

      {/* Untere Zeile: SAZ | GP | SEZ */}
      <line x1={NODE_W / 3} y1={rowH * 2} x2={NODE_W / 3} y2={NODE_H} stroke={divider} strokeWidth={1} />
      <line x1={(NODE_W * 2) / 3} y1={rowH * 2} x2={(NODE_W * 2) / 3} y2={NODE_H} stroke={divider} strokeWidth={1} />
      <text
        x={NODE_W / 6}
        y={rowH * 2 + rowH / 2 + 4}
        textAnchor="middle"
        fontSize={9}
        fill={textPrimary}
        fontFamily="monospace"
      >
        {fmt(task.spaetesterAnfang)}
      </text>
      <text
        x={NODE_W / 2}
        y={rowH * 2 + rowH / 2 + 4}
        textAnchor="middle"
        fontSize={11}
        fill={crit ? '#EF4444' : '#64748B'}
        fontWeight={crit ? '700' : '400'}
        fontFamily="monospace"
      >
        {fmtNum(task.gesamtpuffer)}
      </text>
      <text
        x={(NODE_W * 5) / 6}
        y={rowH * 2 + rowH / 2 + 4}
        textAnchor="middle"
        fontSize={9}
        fill={textPrimary}
        fontFamily="monospace"
      >
        {fmt(task.spaetestesEnde)}
      </text>

      {/* Typ-Badge oben links */}
      {task.typ !== 'Vorgang' && (
        <text x={4} y={NODE_H - 4} fontSize={8} fill="#94A3B8" fontFamily="system-ui">
          {task.typ === 'Sammelvorgang' ? '▶ Sammel' : '◆ MS'}
        </text>
      )}
    </g>
  );
}

export default function NetworkView({ projekt }) {
  const [selectedId, setSelectedId] = useState(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const svgRef = useRef(null);
  const dragging = useRef(null);

  const positions = useMemo(
    () => computePositions(projekt.vorgaenge, projekt.abhaengigkeiten),
    [projekt.vorgaenge, projekt.abhaengigkeiten]
  );

  // Abhängigkeitskanten
  const edges = useMemo(() => {
    return projekt.abhaengigkeiten
      .map((dep) => {
        const from = positions.get(dep.vorgaengerId);
        const to = positions.get(dep.nachfolgerId);
        if (!from || !to) return null;

        const v = projekt.vorgaenge.find((t) => t.id === dep.vorgaengerId);
        const n = projekt.vorgaenge.find((t) => t.id === dep.nachfolgerId);
        const crit = v?.istKritisch && n?.istKritisch;

        // Verbindungspunkte: rechte Mitte → linke Mitte
        const x1 = from.x + NODE_W;
        const y1 = from.y + NODE_H / 2;
        const x2 = to.x;
        const y2 = to.y + NODE_H / 2;
        const cx1 = x1 + (x2 - x1) * 0.5;
        const cx2 = x2 - (x2 - x1) * 0.5;
        const path = `M${x1},${y1} C${cx1},${y1} ${cx2},${y2} ${x2},${y2}`;

        return { id: dep.id, path, crit, typ: dep.typ };
      })
      .filter(Boolean);
  }, [projekt.abhaengigkeiten, projekt.vorgaenge, positions]);

  // Pan via Mausdrag
  const onMouseDown = useCallback((e) => {
    if (e.target.closest('[data-node]')) return;
    dragging.current = { startX: e.clientX, startY: e.clientY, tx: transform.x, ty: transform.y };
    e.currentTarget.style.cursor = 'grabbing';
  }, [transform]);

  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragging.current.startX;
    const dy = e.clientY - dragging.current.startY;
    setTransform((t) => ({ ...t, x: dragging.current.tx + dx, y: dragging.current.ty + dy }));
  }, []);

  const onMouseUp = useCallback((e) => {
    dragging.current = null;
    if (e.currentTarget) e.currentTarget.style.cursor = 'grab';
  }, []);

  // Zoom via Mausrad
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.91;
    setTransform((t) => {
      const newScale = Math.min(Math.max(t.scale * factor, 0.2), 3);
      return { ...t, scale: newScale };
    });
  }, []);

  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  const kritischeVorgaenge = projekt.vorgaenge.filter((v) => v.istKritisch);

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Netzplan (VKN nach DIN 69900)
          </span>
          <span className="text-xs text-slate-400">
            {projekt.vorgaenge.length} Knoten ·{' '}
            <span className="text-red-500">{kritischeVorgaenge.length} kritisch</span> ·{' '}
            {projekt.abhaengigkeiten.length} Kanten
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {Math.round(transform.scale * 100)}%
          </span>
          <button
            onClick={() => setTransform((t) => ({ ...t, scale: Math.min(t.scale * 1.2, 3) }))}
            className="text-xs px-2 py-1 border border-slate-300 rounded hover:bg-slate-50"
          >
            +
          </button>
          <button
            onClick={() => setTransform((t) => ({ ...t, scale: Math.max(t.scale * 0.83, 0.2) }))}
            className="text-xs px-2 py-1 border border-slate-300 rounded hover:bg-slate-50"
          >
            −
          </button>
          <button
            onClick={resetView}
            className="text-xs px-2 py-1 border border-slate-300 rounded hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Legende */}
      <div className="flex items-center gap-4 px-4 py-1 bg-white border-b border-slate-100 flex-shrink-0">
        <span className="text-xs text-slate-400">Legende:</span>
        <span className="flex items-center gap-1 text-xs text-slate-600">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-100 border border-red-400"></span>
          Kritischer Pfad
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-600">
          <span className="inline-block w-3 h-3 rounded-sm bg-blue-50 border border-slate-300"></span>
          Unkritisch
        </span>
        <span className="text-xs text-slate-400">| Drag zum Verschieben · Scroll zum Zoomen</span>
        <div className="ml-auto text-xs text-slate-400 font-mono">
          FAZ · Dauer · FEZ / Name / SAZ · GP · SEZ
        </div>
      </div>

      {/* Canvas */}
      {projekt.vorgaenge.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Keine Vorgänge vorhanden. Füge im Gantt-Tab Vorgänge hinzu.
        </div>
      ) : (
        <svg
          ref={svgRef}
          className="flex-1 w-full"
          style={{ cursor: 'grab', overflow: 'hidden' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
        >
          <defs>
            <marker id="net-arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#94A3B8" />
            </marker>
            <marker
              id="net-arr-crit"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#EF4444" />
            </marker>
          </defs>

          <g
            transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}
          >
            {/* Kanten */}
            {edges.map((edge) => (
              <g key={edge.id}>
                <path
                  d={edge.path}
                  stroke={edge.crit ? '#EF4444' : '#CBD5E1'}
                  strokeWidth={edge.crit ? 2 : 1.5}
                  fill="none"
                  markerEnd={`url(#net-arr${edge.crit ? '-crit' : ''})`}
                  opacity={0.85}
                />
                {/* Typ-Label mittig */}
                {edge.typ && edge.typ !== 'EA' && (() => {
                  // Mittelpunkt der Bezier-Kurve annähern
                  const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                  pathEl.setAttribute('d', edge.path);
                  try {
                    const total = pathEl.getTotalLength();
                    const mid = pathEl.getPointAtLength(total / 2);
                    return (
                      <text
                        x={mid.x}
                        y={mid.y - 4}
                        textAnchor="middle"
                        fontSize={9}
                        fill={edge.crit ? '#DC2626' : '#94A3B8'}
                        fontFamily="monospace"
                      >
                        {edge.typ}
                      </text>
                    );
                  } catch {
                    return null;
                  }
                })()}
              </g>
            ))}

            {/* Knoten */}
            {projekt.vorgaenge.map((task) => {
              const pos = positions.get(task.id);
              if (!pos) return null;
              return (
                <g key={task.id} data-node="true">
                  <VknNode
                    task={task}
                    x={pos.x}
                    y={pos.y}
                    isSelected={selectedId === task.id}
                    onClick={() => setSelectedId((id) => (id === task.id ? null : task.id))}
                  />
                </g>
              );
            })}
          </g>
        </svg>
      )}

      {/* Ausgewählter Knoten – Info-Leiste unten */}
      {selectedId && (() => {
        const task = projekt.vorgaenge.find((v) => v.id === selectedId);
        if (!task) return null;
        return (
          <div className="flex items-center gap-6 px-4 py-2 bg-white border-t border-slate-200 flex-shrink-0 text-xs">
            <span className="font-semibold text-slate-700">{task.name}</span>
            {[
              ['FAZ', task.fruehesterAnfang],
              ['FEZ', task.fruehestesEnde],
              ['SAZ', task.spaetesterAnfang],
              ['SEZ', task.spaetestesEnde],
              ['GP', task.gesamtpuffer],
              ['FP', task.freierPuffer],
              ['Dauer', task.dauer ? `${task.dauer}d` : '–'],
            ].map(([label, val]) => (
              <span key={label} className="text-slate-500">
                <span className="text-slate-400">{label}: </span>
                <span
                  className={
                    label === 'GP' && task.istKritisch ? 'text-red-600 font-semibold' : ''
                  }
                >
                  {val ?? '–'}
                </span>
              </span>
            ))}
            <span
              className={`ml-auto font-semibold ${task.istKritisch ? 'text-red-600' : 'text-green-600'}`}
            >
              {task.istKritisch ? '● Kritisch' : '○ Unkritisch'}
            </span>
            <button
              onClick={() => setSelectedId(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        );
      })()}
    </div>
  );
}
