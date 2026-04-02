/**
 * Gantt-Diagramm (SVG-basiert)
 * Zeitachse, Vorgangsbalken, Meilensteindimanten, Abhängigkeitspfeile, Heute-Linie
 * + Hover-Popover mit Vorgangsdetails + Hover-Highlight
 * + Drag & Drop: Balken verschieben (Maus + Touch)
 */

import { useMemo, useState, useCallback, useRef } from 'react';
import { parseISO, differenceInCalendarDays, addDays, format } from 'date-fns';
import { de } from 'date-fns/locale';

export const DAY_WIDTH = 28;
export const ROW_HEIGHT = 32;
const HEADER_MONTHS_H = 22;
const HEADER_WEEKS_H = 22;
export const HEADER_HEIGHT = HEADER_MONTHS_H + HEADER_WEEKS_H;
const BAR_PAD = 5;
const BAR_H = ROW_HEIGHT - 2 * BAR_PAD;
const MS_HALF = 9;

const COLOR = {
  default: '#3B82F6',
  critical: '#EF4444',
  done: '#22C55E',
  overdue: '#F59E0B',
  milestone: '#8B5CF6',
  summary: '#1E293B',
  today: '#EF4444',
};

function barColor(task, today) {
  if (task.typ === 'Meilenstein') return COLOR.milestone;
  if (task.typ === 'Sammelvorgang') return COLOR.summary;
  if (task.fortschritt === 100) return COLOR.done;
  if (task.fruehestesEnde && task.fruehestesEnde < today && task.fortschritt < 100) return COLOR.overdue;
  if (task.istKritisch) return COLOR.critical;
  return COLOR.default;
}

function statusLabel(task, today) {
  if (task.fortschritt === 100) return { text: 'Abgeschlossen', color: '#22C55E' };
  if (task.fruehestesEnde && task.fruehestesEnde < today) return { text: 'Überfällig', color: '#F59E0B' };
  if (task.istKritisch) return { text: 'Kritischer Pfad', color: '#EF4444' };
  if (task.fortschritt > 0) return { text: 'In Arbeit', color: '#3B82F6' };
  return { text: 'Geplant', color: '#94A3B8' };
}

/**
 * @param {{
 *   vorgaenge: import('../../models/types').Task[],
 *   abhaengigkeiten: import('../../models/types').Dependency[],
 *   startDatum: string,
 *   selectedTaskId: string|null,
 *   onSelectTask: (id: string) => void,
 *   hoveredTaskId: string|null,
 *   onHoverTask: (id: string|null) => void,
 *   onDragMove?: (taskId: string, daysDelta: number) => void
 * }} props
 */
export default function GanttDiagram({ vorgaenge, abhaengigkeiten, startDatum, selectedTaskId, onSelectTask, hoveredTaskId, onHoverTask, onDragMove }) {
  const today = new Date().toISOString().split('T')[0];
  const [popover, setPopover] = useState(null); // { task, x, y }
  const popoverTimer = useRef(null);
  const svgRef = useRef(null);

  // Drag-State
  const [dragState, setDragState] = useState(null); // { taskId, startX, origDayOffset, currentDelta }
  const dragRef = useRef(null);

  const { projStart, daySpan } = useMemo(() => {
    const strs = vorgaenge.flatMap((v) => [v.fruehesterAnfang, v.fruehestesEnde].filter(Boolean));
    if (!strs.length) {
      const s = parseISO(startDatum || today);
      return { projStart: addDays(s, -1), daySpan: 42 };
    }
    const minStr = strs.reduce((a, b) => (a < b ? a : b));
    const maxStr = strs.reduce((a, b) => (a > b ? a : b));
    const s = addDays(parseISO(minStr), -2);
    const e = addDays(parseISO(maxStr), 7);
    return { projStart: s, daySpan: Math.max(differenceInCalendarDays(e, s) + 1, 42) };
  }, [vorgaenge, startDatum, today]);

  const toX = useCallback((dateStr) =>
    dateStr ? differenceInCalendarDays(parseISO(dateStr), projStart) * DAY_WIDTH : null, [projStart]);

  const svgW = daySpan * DAY_WIDTH;
  const svgH = HEADER_HEIGHT + vorgaenge.length * ROW_HEIGHT + 8;
  const todayX = toX(today);

  // ── Drag & Drop (Maus + Touch) ─────────────────────────────
  const startDrag = useCallback((taskId, clientX) => {
    const task = vorgaenge.find((v) => v.id === taskId);
    if (!task || task.typ === 'Sammelvorgang') return; // Sammelvorgänge nicht verschieben
    dragRef.current = { taskId, startX: clientX, currentDelta: 0 };
    setDragState({ taskId, currentDelta: 0 });
  }, [vorgaenge]);

  const moveDrag = useCallback((clientX) => {
    if (!dragRef.current) return;
    const dx = clientX - dragRef.current.startX;
    const daysDelta = Math.round(dx / DAY_WIDTH);
    if (daysDelta !== dragRef.current.currentDelta) {
      dragRef.current.currentDelta = daysDelta;
      setDragState((prev) => prev ? { ...prev, currentDelta: daysDelta } : null);
    }
  }, []);

  const endDrag = useCallback(() => {
    if (!dragRef.current) return;
    const { taskId, currentDelta } = dragRef.current;
    dragRef.current = null;
    setDragState(null);
    if (currentDelta !== 0 && onDragMove) {
      onDragMove(taskId, currentDelta);
    }
  }, [onDragMove]);

  // Maus-Handler
  const handleBarMouseDown = useCallback((e, taskId) => {
    if (e.button !== 0) return; // nur linke Maustaste
    e.stopPropagation();
    startDrag(taskId, e.clientX);

    const onMove = (ev) => moveDrag(ev.clientX);
    const onUp = () => {
      endDrag();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [startDrag, moveDrag, endDrag]);

  // Touch-Handler
  const handleBarTouchStart = useCallback((e, taskId) => {
    const touch = e.touches[0];
    if (!touch) return;
    e.stopPropagation();
    startDrag(taskId, touch.clientX);

    const onMove = (ev) => {
      ev.preventDefault(); // Scroll verhindern
      const t = ev.touches[0];
      if (t) moveDrag(t.clientX);
    };
    const onEnd = () => {
      endDrag();
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
  }, [startDrag, moveDrag, endDrag]);

  // Hover-Popover Logik
  const showPopover = useCallback((task, e) => {
    if (dragRef.current) return; // Kein Popover beim Draggen
    clearTimeout(popoverTimer.current);
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    popoverTimer.current = setTimeout(() => {
      setPopover({
        task,
        x: e.clientX - svgRect.left + 12,
        y: e.clientY - svgRect.top - 10,
      });
    }, 350);
    onHoverTask?.(task.id);
  }, [onHoverTask]);

  const hidePopover = useCallback(() => {
    clearTimeout(popoverTimer.current);
    setPopover(null);
    onHoverTask?.(null);
  }, [onHoverTask]);

  const movePopover = useCallback((e) => {
    if (!popover) return;
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    setPopover((prev) => prev ? {
      ...prev,
      x: e.clientX - svgRect.left + 12,
      y: e.clientY - svgRect.top - 10,
    } : null);
  }, [popover]);

  // Monatsgruppen für Header
  const months = useMemo(() => {
    const result = [];
    const projEnd = addDays(projStart, daySpan - 1);
    let cur = new Date(projStart.getFullYear(), projStart.getMonth(), 1);
    while (cur <= projEnd) {
      const mEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
      const dStart = cur < projStart ? projStart : cur;
      const dEnd = mEnd > projEnd ? projEnd : mEnd;
      const x = Math.max(0, differenceInCalendarDays(dStart, projStart) * DAY_WIDTH);
      const w = (differenceInCalendarDays(dEnd, projStart) + 1) * DAY_WIDTH - x;
      result.push({ label: format(cur, 'MMM yyyy', { locale: de }), x, w, idx: result.length });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
    return result;
  }, [projStart, daySpan]);

  // Wochenmarkierungen
  const weeks = useMemo(() => {
    const result = [];
    for (let d = 0; d < daySpan; d += 7) {
      result.push({ x: d * DAY_WIDTH, label: format(addDays(projStart, d), 'dd.MM') });
    }
    return result;
  }, [projStart, daySpan]);

  // Vertikale Gitterlinien (wöchentlich)
  const gridXs = useMemo(() => {
    const result = [];
    for (let d = 0; d < daySpan; d += 7) result.push(d * DAY_WIDTH);
    return result;
  }, [daySpan]);

  // Abhängigkeitspfeile
  const arrows = useMemo(() => {
    const result = [];
    for (const dep of abhaengigkeiten) {
      const v = vorgaenge.find((t) => t.id === dep.vorgaengerId);
      const n = vorgaenge.find((t) => t.id === dep.nachfolgerId);
      if (!v || !n || !v.fruehesterAnfang || !n.fruehesterAnfang) continue;

      const vi = vorgaenge.indexOf(v);
      const ni = vorgaenge.indexOf(n);

      let fx, tx;
      if (dep.typ === 'AA') {
        fx = toX(v.fruehesterAnfang);
        tx = toX(n.fruehesterAnfang);
      } else if (dep.typ === 'EE') {
        fx = toX(v.fruehestesEnde);
        tx = toX(n.fruehestesEnde);
      } else if (dep.typ === 'AE') {
        fx = toX(v.fruehesterAnfang);
        tx = toX(n.fruehestesEnde);
      } else {
        // EA (Standard)
        fx = toX(v.fruehestesEnde);
        tx = toX(n.fruehesterAnfang);
      }

      if (fx === null || tx === null) continue;

      const fy = HEADER_HEIGHT + vi * ROW_HEIGHT + ROW_HEIGHT / 2;
      const ty = HEADER_HEIGHT + ni * ROW_HEIGHT + ROW_HEIGHT / 2;
      const mid = (fx + tx) / 2;
      const path = `M${fx},${fy} C${mid},${fy} ${mid},${ty} ${tx},${ty}`;
      const crit = v.istKritisch && n.istKritisch;

      result.push({ id: dep.id, path, crit });
    }
    return result;
  }, [abhaengigkeiten, vorgaenge, toX]);

  return (
    <div className="relative" ref={svgRef} style={{ touchAction: dragState ? 'none' : 'auto' }}>
      <svg width={svgW} height={svgH} style={{ display: 'block', userSelect: 'none' }}>
        <defs>
          <marker id="arr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill="#94A3B8" />
          </marker>
          <marker id="arr-crit" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill={COLOR.critical} />
          </marker>
        </defs>

        {/* Hintergrund */}
        <rect x={0} y={0} width={svgW} height={svgH} fill="white" />

        {/* Abwechselnde Zeilen-Hintergründe */}
        {vorgaenge.map((_, i) =>
          i % 2 === 1 ? (
            <rect
              key={i}
              x={0}
              y={HEADER_HEIGHT + i * ROW_HEIGHT}
              width={svgW}
              height={ROW_HEIGHT}
              fill="#F8FAFC"
            />
          ) : null
        )}

        {/* Hover-Highlight-Zeile */}
        {hoveredTaskId && vorgaenge.map((task, i) =>
          task.id === hoveredTaskId && task.id !== selectedTaskId ? (
            <rect
              key={`hover-${task.id}`}
              x={0}
              y={HEADER_HEIGHT + i * ROW_HEIGHT}
              width={svgW}
              height={ROW_HEIGHT}
              fill="rgba(59,130,246,0.06)"
              style={{ pointerEvents: 'none' }}
            />
          ) : null
        )}

        {/* Vertikale Gitterlinien */}
        {gridXs.map((x, i) => (
          <line key={i} x1={x} y1={HEADER_HEIGHT} x2={x} y2={svgH} stroke="#E2E8F0" strokeWidth={1} />
        ))}

        {/* Heute-Linie */}
        {todayX !== null && todayX >= 0 && todayX <= svgW && (
          <line
            x1={todayX}
            y1={0}
            x2={todayX}
            y2={svgH}
            stroke={COLOR.today}
            strokeWidth={2}
            strokeDasharray="4 3"
            opacity={0.65}
          />
        )}

        {/* Monats-Header */}
        {months.map((m) => (
          <g key={m.idx}>
            <rect
              x={m.x}
              y={0}
              width={m.w}
              height={HEADER_MONTHS_H}
              fill={m.idx % 2 === 0 ? '#EEF2FF' : '#E0E7FF'}
            />
            <text x={m.x + 5} y={15} fontSize={11} fill="#3730A3" fontWeight="600" fontFamily="system-ui">
              {m.label}
            </text>
            <line x1={m.x} y1={0} x2={m.x} y2={HEADER_MONTHS_H} stroke="#C7D2FE" strokeWidth={1} />
          </g>
        ))}

        {/* Wochen-Header */}
        {weeks.map((w, i) => (
          <g key={i}>
            <text
              x={w.x + 3}
              y={HEADER_MONTHS_H + 15}
              fontSize={10}
              fill="#64748B"
              fontFamily="system-ui"
            >
              {w.label}
            </text>
            <line
              x1={w.x}
              y1={HEADER_MONTHS_H}
              x2={w.x}
              y2={HEADER_HEIGHT}
              stroke="#E2E8F0"
              strokeWidth={1}
            />
          </g>
        ))}

        {/* Header-Trennlinie */}
        <line x1={0} y1={HEADER_HEIGHT} x2={svgW} y2={HEADER_HEIGHT} stroke="#CBD5E1" strokeWidth={1} />

        {/* Abhängigkeitspfeile */}
        {arrows.map((a) => (
          <path
            key={a.id}
            d={a.path}
            stroke={a.crit ? COLOR.critical : '#94A3B8'}
            strokeWidth={1.5}
            fill="none"
            markerEnd={`url(#arr${a.crit ? '-crit' : ''})`}
            opacity={0.8}
          />
        ))}

        {/* Zeilen-Auswahl-Highlight */}
        {vorgaenge.map((task, i) =>
          selectedTaskId === task.id ? (
            <rect
              key={`sel-${task.id}`}
              x={0}
              y={HEADER_HEIGHT + i * ROW_HEIGHT}
              width={svgW}
              height={ROW_HEIGHT}
              fill="rgba(59,130,246,0.1)"
              style={{ pointerEvents: 'none' }}
            />
          ) : null
        )}

        {/* Vorgangsbalken */}
        {vorgaenge.map((task, i) => {
          const isDragging = dragState?.taskId === task.id;
          const dragDx = isDragging ? dragState.currentDelta * DAY_WIDTH : 0;
          const cy = HEADER_HEIGHT + i * ROW_HEIGHT;
          const bColor = barColor(task, today);
          const isSel = task.id === selectedTaskId;
          const isHov = task.id === hoveredTaskId;

          if (task.typ === 'Meilenstein') {
            const mx = toX(task.fruehesterAnfang);
            if (mx === null) return null;
            const mcy = cy + ROW_HEIGHT / 2;
            return (
              <g
                key={task.id}
                onClick={() => !isDragging && onSelectTask(task.id)}
                onMouseEnter={(e) => showPopover(task, e)}
                onMouseMove={movePopover}
                onMouseLeave={hidePopover}
                onMouseDown={(e) => handleBarMouseDown(e, task.id)}
                onTouchStart={(e) => handleBarTouchStart(e, task.id)}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                transform={isDragging ? `translate(${dragDx}, 0)` : undefined}
                opacity={isDragging ? 0.7 : 1}
              >
                {/* Größere Touch-Zone */}
                <rect
                  x={mx - MS_HALF - 6}
                  y={mcy - MS_HALF - 6}
                  width={MS_HALF * 2 + 12}
                  height={MS_HALF * 2 + 12}
                  fill="transparent"
                />
                <polygon
                  points={`${mx},${mcy - MS_HALF} ${mx + MS_HALF},${mcy} ${mx},${mcy + MS_HALF} ${mx - MS_HALF},${mcy}`}
                  fill={bColor}
                  stroke={isSel ? '#4C1D95' : isHov ? '#7C3AED' : 'transparent'}
                  strokeWidth={2}
                />
                {/* Drag-Hinweis */}
                {isDragging && (
                  <text
                    x={mx}
                    y={mcy - MS_HALF - 6}
                    fontSize={9}
                    fill={COLOR.default}
                    fontWeight="600"
                    textAnchor="middle"
                    fontFamily="system-ui"
                  >
                    {dragState.currentDelta > 0 ? '+' : ''}{dragState.currentDelta}d
                  </text>
                )}
              </g>
            );
          }

          const bx = toX(task.fruehesterAnfang);
          if (bx === null) return null;
          const bw = Math.max((task.dauer || 1) * DAY_WIDTH, 6);
          const by = cy + BAR_PAD;

          if (task.typ === 'Sammelvorgang') {
            const bh = BAR_H;
            return (
              <g
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                onMouseEnter={(e) => showPopover(task, e)}
                onMouseMove={movePopover}
                onMouseLeave={hidePopover}
                style={{ cursor: 'pointer' }}
              >
                <rect x={bx} y={by} width={bw} height={4} fill={bColor} />
                <rect x={bx} y={by} width={4} height={bh * 0.7} fill={bColor} />
                <rect x={bx + bw - 4} y={by} width={4} height={bh * 0.7} fill={bColor} />
                <polygon
                  points={`${bx},${by + bh * 0.7} ${bx + 7},${by + bh * 0.7} ${bx},${by + bh}`}
                  fill={bColor}
                />
                <polygon
                  points={`${bx + bw},${by + bh * 0.7} ${bx + bw - 7},${by + bh * 0.7} ${bx + bw},${by + bh}`}
                  fill={bColor}
                />
              </g>
            );
          }

          // Normaler Vorgang
          const progW = bw * (task.fortschritt / 100);
          return (
            <g
              key={task.id}
              onClick={() => !isDragging && onSelectTask(task.id)}
              onMouseEnter={(e) => showPopover(task, e)}
              onMouseMove={movePopover}
              onMouseLeave={hidePopover}
              onMouseDown={(e) => handleBarMouseDown(e, task.id)}
              onTouchStart={(e) => handleBarTouchStart(e, task.id)}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              transform={isDragging ? `translate(${dragDx}, 0)` : undefined}
              opacity={isDragging ? 0.7 : 1}
            >
              {/* Größere Touch-Zone (unsichtbar, 4px Rand) */}
              <rect
                x={bx - 4}
                y={by - 4}
                width={bw + 8}
                height={BAR_H + 8}
                fill="transparent"
              />
              <rect
                x={bx}
                y={by}
                width={bw}
                height={BAR_H}
                fill={bColor}
                rx={3}
                opacity={isHov ? 1 : 0.88}
                stroke={isDragging ? '#1D4ED8' : isSel ? 'white' : isHov ? 'rgba(255,255,255,0.6)' : 'none'}
                strokeWidth={isDragging ? 2 : isSel ? 2 : isHov ? 1.5 : 0}
              />
              {task.fortschritt > 0 && (
                <rect
                  x={bx + 1}
                  y={by + BAR_H / 2 - 2}
                  width={Math.max(progW - 2, 0)}
                  height={4}
                  fill="rgba(255,255,255,0.45)"
                  rx={2}
                  style={{ pointerEvents: 'none' }}
                />
              )}
              {bw > 36 && !isDragging && (
                <text
                  x={bx + 5}
                  y={by + BAR_H / 2 + 4}
                  fontSize={10}
                  fill="white"
                  fontWeight="500"
                  fontFamily="system-ui"
                  style={{ pointerEvents: 'none' }}
                >
                  {bw > 90
                    ? task.name.length > 14
                      ? task.name.slice(0, 14) + '…'
                      : task.name
                    : `${task.dauer}d`}
                </text>
              )}
              {/* Drag-Hinweis: Tage-Delta über dem Balken */}
              {isDragging && dragState.currentDelta !== 0 && (
                <text
                  x={bx + bw / 2}
                  y={by - 5}
                  fontSize={10}
                  fill={COLOR.default}
                  fontWeight="700"
                  textAnchor="middle"
                  fontFamily="system-ui"
                >
                  {dragState.currentDelta > 0 ? '+' : ''}{dragState.currentDelta}d
                </text>
              )}
            </g>
          );
        })}

        {/* Klickbare Flächen über jeder Zeile (nur für leere Bereiche) – nur wenn nicht gedraggt wird */}
        {!dragState && vorgaenge.map((task, i) => (
          <rect
            key={`click-${task.id}`}
            x={0}
            y={HEADER_HEIGHT + i * ROW_HEIGHT}
            width={svgW}
            height={ROW_HEIGHT}
            fill="transparent"
            onClick={() => onSelectTask(task.id)}
            onMouseEnter={() => onHoverTask?.(task.id)}
            onMouseLeave={() => onHoverTask?.(null)}
            style={{ cursor: 'pointer', pointerEvents: 'all' }}
          />
        ))}
      </svg>

      {/* Drag-Overlay: visuelles Feedback */}
      {dragState && (
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none z-10">
          <div className="absolute top-1 right-2 px-2 py-1 rounded-lg text-xs font-medium shadow-sm"
            style={{ background: 'var(--pm-accent-light)', color: 'var(--pm-accent)', border: '1px solid var(--pm-accent)' }}>
            Verschieben: {dragState.currentDelta > 0 ? '+' : ''}{dragState.currentDelta} Tag{Math.abs(dragState.currentDelta) !== 1 ? 'e' : ''}
          </div>
        </div>
      )}

      {/* Hover-Popover (HTML über SVG) */}
      {popover && !dragState && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: popover.x,
            top: popover.y,
            animation: 'popoverIn 0.15s ease-out',
          }}
        >
          <div className="bg-slate-800 text-white rounded-lg shadow-2xl px-3 py-2.5 text-xs min-w-[180px] max-w-[260px]">
            {/* Kopfzeile: Name + Status */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-semibold text-sm truncate flex-1">{popover.task.name}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: statusLabel(popover.task, today).color + '33',
                  color: statusLabel(popover.task, today).color,
                }}
              >
                {statusLabel(popover.task, today).text}
              </span>
            </div>

            {/* Details-Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-slate-300">
              {popover.task.typ !== 'Meilenstein' && (
                <>
                  <span className="text-slate-400">Dauer:</span>
                  <span>{popover.task.dauer} Arbeitstage</span>
                </>
              )}
              <span className="text-slate-400">Typ:</span>
              <span>{popover.task.typ}</span>
              {popover.task.fruehesterAnfang && (
                <>
                  <span className="text-slate-400">Anfang:</span>
                  <span>{format(parseISO(popover.task.fruehesterAnfang), 'dd.MM.yyyy')}</span>
                </>
              )}
              {popover.task.fruehestesEnde && (
                <>
                  <span className="text-slate-400">Ende:</span>
                  <span>{format(parseISO(popover.task.fruehestesEnde), 'dd.MM.yyyy')}</span>
                </>
              )}
              {popover.task.typ !== 'Meilenstein' && (
                <>
                  <span className="text-slate-400">Fortschritt:</span>
                  <span>{popover.task.fortschritt}%</span>
                </>
              )}
              {popover.task.gesamtpuffer != null && (
                <>
                  <span className="text-slate-400">Puffer:</span>
                  <span className={popover.task.istKritisch ? 'text-red-400 font-semibold' : ''}>
                    {popover.task.gesamtpuffer} Tage
                  </span>
                </>
              )}
            </div>

            {/* Fortschrittsbalken */}
            {popover.task.typ !== 'Meilenstein' && popover.task.fortschritt > 0 && (
              <div className="mt-2">
                <div className="w-full h-1.5 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${popover.task.fortschritt}%`,
                      backgroundColor: popover.task.fortschritt === 100 ? '#22C55E' : '#3B82F6',
                    }}
                  />
                </div>
              </div>
            )}

            {popover.task.pspCode && (
              <div className="mt-1 text-slate-400 text-[10px]">
                PSP: {popover.task.pspCode}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
