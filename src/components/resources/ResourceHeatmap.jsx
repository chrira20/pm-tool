/**
 * Resource Heatmap (Design D3)
 * Tägliche Auslastung als farbcodierte Zellen pro Ressource
 */

import { useMemo } from 'react';
import { parseISO, addDays, format, isWeekend } from 'date-fns';
import { de } from 'date-fns/locale';
import { berechneAuslastung } from '../../utils/resources';

/** Farbskala: 0h=transparent, leicht=grün, mittel=blau, hoch=orange, überlast=rot */
function heatColor(stunden, kapazitaet) {
  if (stunden === 0) return 'transparent';
  const ratio = stunden / kapazitaet;
  if (ratio <= 0.5) return 'var(--pm-success-bg)';
  if (ratio <= 0.8) return '#DBEAFE'; // blue-100
  if (ratio <= 1.0) return 'var(--pm-warning-bg)';
  return 'var(--pm-danger-bg)';
}

function heatTextColor(stunden, kapazitaet) {
  if (stunden === 0) return 'var(--pm-text-muted)';
  const ratio = stunden / kapazitaet;
  if (ratio <= 0.5) return 'var(--pm-success)';
  if (ratio <= 0.8) return 'var(--pm-accent)';
  if (ratio <= 1.0) return 'var(--pm-warning)';
  return 'var(--pm-danger)';
}

export default function ResourceHeatmap({ vorgaenge, zuordnungen, ressourcen, kalender }) {
  // Datum-Bereich berechnen
  const { tage, auslastungMap } = useMemo(() => {
    const dates = vorgaenge.flatMap((v) =>
      [v.fruehesterAnfang, v.fruehestesEnde].filter(Boolean)
    );
    if (!dates.length || !ressourcen.length) return { tage: [], auslastungMap: new Map() };

    const startStr = dates.reduce((a, b) => (a < b ? a : b));
    const endStr = dates.reduce((a, b) => (a > b ? a : b));

    const auslastungMap = berechneAuslastung(
      vorgaenge, zuordnungen, ressourcen, kalender, startStr, endStr
    );

    const start = parseISO(startStr);
    const end = parseISO(endStr);
    const tage = [];
    let cur = start;
    while (cur <= end) {
      tage.push({
        key: format(cur, 'yyyy-MM-dd'),
        label: format(cur, 'dd', { locale: de }),
        tag: format(cur, 'EEE', { locale: de }),
        monat: format(cur, 'MMM', { locale: de }),
        wochenende: isWeekend(cur),
      });
      cur = addDays(cur, 1);
    }
    return { tage, auslastungMap };
  }, [vorgaenge, zuordnungen, ressourcen, kalender]);

  if (tage.length === 0 || ressourcen.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm" style={{ color: 'var(--pm-text-muted)' }}>
        {ressourcen.length === 0
          ? 'Füge zuerst Ressourcen hinzu.'
          : 'Keine Vorgänge mit berechneten Terminen.'}
      </div>
    );
  }

  // Monatsgruppen für Header
  const monate = [];
  let lastMonat = '';
  for (let i = 0; i < tage.length; i++) {
    if (tage[i].monat !== lastMonat) {
      monate.push({ monat: tage[i].monat, start: i, count: 1 });
      lastMonat = tage[i].monat;
    } else {
      monate[monate.length - 1].count++;
    }
  }

  const CELL_W = 28;
  const CELL_H = 28;
  const NAME_W = 130;

  return (
    <div className="overflow-auto flex-1">
      <div style={{ minWidth: NAME_W + tage.length * CELL_W }}>
        {/* Monats-Header */}
        <div className="flex" style={{ height: 20 }}>
          <div style={{ width: NAME_W, flexShrink: 0 }} />
          {monate.map((m, i) => (
            <div
              key={i}
              className="text-[10px] font-semibold uppercase tracking-wider text-center"
              style={{
                width: m.count * CELL_W,
                color: 'var(--pm-text-muted)',
              }}
            >
              {m.monat}
            </div>
          ))}
        </div>

        {/* Tage-Header */}
        <div className="flex" style={{ height: 32, borderBottom: '2px solid var(--pm-border)' }}>
          <div className="text-[10px] font-semibold uppercase flex items-center px-2" style={{ width: NAME_W, flexShrink: 0, color: 'var(--pm-text-muted)', background: 'var(--pm-row-summary)' }}>
            Ressource
          </div>
          {tage.map((t) => (
            <div
              key={t.key}
              className="flex flex-col items-center justify-center"
              style={{
                width: CELL_W,
                flexShrink: 0,
                background: t.wochenende ? 'var(--pm-row-summary)' : 'var(--pm-table-bg)',
                borderLeft: '1px solid var(--pm-border)',
              }}
            >
              <span className="text-[8px]" style={{ color: 'var(--pm-text-muted)' }}>{t.tag}</span>
              <span className="text-[10px] font-medium" style={{ color: t.wochenende ? 'var(--pm-text-muted)' : 'var(--pm-text-secondary)' }}>
                {t.label}
              </span>
            </div>
          ))}
        </div>

        {/* Ressource-Zeilen */}
        {ressourcen.map((r) => {
          const rMap = auslastungMap.get(r.id) || new Map();
          return (
            <div key={r.id} className="flex" style={{ height: CELL_H, borderBottom: '1px solid var(--pm-border)' }}>
              {/* Name */}
              <div className="flex items-center gap-1.5 px-2 text-xs font-medium truncate" style={{ width: NAME_W, flexShrink: 0, color: 'var(--pm-text-primary)', background: 'var(--pm-table-bg)' }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.farbe }} />
                <span className="truncate">{r.name}</span>
              </div>
              {/* Zellen */}
              {tage.map((t) => {
                const stunden = rMap.get(t.key) || 0;
                const bg = heatColor(stunden, r.kapazitaet);
                const fg = heatTextColor(stunden, r.kapazitaet);
                return (
                  <div
                    key={t.key}
                    className="flex items-center justify-center text-[10px] font-medium transition-colors"
                    style={{
                      width: CELL_W,
                      flexShrink: 0,
                      background: stunden > 0 ? bg : (t.wochenende ? 'var(--pm-row-summary)' : 'var(--pm-table-bg)'),
                      color: fg,
                      borderLeft: '1px solid var(--pm-border)',
                    }}
                    title={`${r.name}: ${stunden}h am ${t.key} (Kapazität: ${r.kapazitaet}h)`}
                  >
                    {stunden > 0 ? stunden.toFixed(0) : ''}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Legende */}
        <div className="flex items-center gap-4 px-4 py-2" style={{ borderTop: '1px solid var(--pm-border)' }}>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--pm-text-muted)' }}>Legende:</span>
          {[
            { label: '≤ 50%', bg: 'var(--pm-success-bg)', fg: 'var(--pm-success)' },
            { label: '≤ 80%', bg: '#DBEAFE', fg: 'var(--pm-accent)' },
            { label: '≤ 100%', bg: 'var(--pm-warning-bg)', fg: 'var(--pm-warning)' },
            { label: '> 100%', bg: 'var(--pm-danger-bg)', fg: 'var(--pm-danger)' },
          ].map(({ label, bg, fg }) => (
            <div key={label} className="flex items-center gap-1">
              <span className="w-4 h-3 rounded" style={{ background: bg, border: '1px solid var(--pm-border)' }} />
              <span className="text-[10px]" style={{ color: fg }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
