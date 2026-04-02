/**
 * Dashboard-Ansicht (Masterprompt C.5)
 * - Gesamtfortschritt
 * - SPI-Ampel
 * - KPI-Karten
 * - Meilenstein-Timeline
 * - Kritischer Pfad
 * - Ressourcen-Überlastungswarnungen
 */

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { parseISO, format, differenceInCalendarDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { berechneEVA } from '../../utils/eva';
import { berechneAuslastung, findeUeberlastungen } from '../../utils/resources';

/** Formatiert ein ISO-Datum als DD.MM.YYYY */
function fmtDate(str) {
  if (!str) return '–';
  try {
    return format(parseISO(str), 'dd.MM.yyyy', { locale: de });
  } catch {
    return str;
  }
}

/** SPI-Ampel-Farbe */
function spiColor(spi) {
  if (spi >= 0.95) return 'text-green-600';
  if (spi >= 0.85) return 'text-yellow-600';
  return 'text-red-600';
}

function spiLabel(spi) {
  if (spi >= 0.95) return 'Im Plan';
  if (spi >= 0.85) return 'Leicht verzögert';
  return 'Terminverzug';
}

function spiBarColor(spi) {
  if (spi >= 0.95) return '#22C55E';
  if (spi >= 0.85) return '#F59E0B';
  return '#EF4444';
}

export default function DashboardView({ projekt }) {
  const today = new Date().toISOString().split('T')[0];

  const meilensteine = projekt.vorgaenge.filter((v) => v.typ === 'Meilenstein');
  const kritisch = projekt.vorgaenge.filter((v) => v.istKritisch && v.typ !== 'Sammelvorgang');
  const berechenbare = projekt.vorgaenge.filter((v) => v.typ === 'Vorgang');

  // Gesamtfortschritt (gewichtet nach Dauer)
  const gesamtDauer = berechenbare.reduce((s, v) => s + v.dauer, 0);
  const gesamtFortschritt =
    gesamtDauer > 0
      ? Math.round(
          berechenbare.reduce((s, v) => s + v.fortschritt * v.dauer, 0) / gesamtDauer
        )
      : 0;

  // EVA
  const eva = useMemo(
    () => berechneEVA(projekt.vorgaenge, projekt.zuordnungen, projekt.ressourcen, new Date()),
    [projekt.vorgaenge, projekt.zuordnungen, projekt.ressourcen]
  );

  // Nächste 5 Meilensteine (nach FAZ sortiert)
  const naechsteMeilensteine = useMemo(
    () =>
      meilensteine
        .filter((v) => v.fruehesterAnfang)
        .sort((a, b) => a.fruehesterAnfang.localeCompare(b.fruehesterAnfang))
        .slice(0, 5),
    [meilensteine]
  );

  // Überlastungen
  const ueberlastungen = useMemo(() => {
    if (!projekt.ressourcen.length || !projekt.vorgaenge.length) return [];
    const dates = projekt.vorgaenge.flatMap((v) =>
      [v.fruehesterAnfang, v.fruehestesEnde].filter(Boolean)
    );
    if (!dates.length) return [];
    const startStr = dates.reduce((a, b) => (a < b ? a : b));
    const endStr = dates.reduce((a, b) => (a > b ? a : b));
    const auslastung = berechneAuslastung(
      projekt.vorgaenge,
      projekt.zuordnungen,
      projekt.ressourcen,
      projekt.kalender,
      startStr,
      endStr
    );
    return findeUeberlastungen(auslastung, projekt.ressourcen);
  }, [projekt]);

  // Abgeschlossene Vorgänge
  const abgeschlossen = berechenbare.filter((v) => v.fortschritt === 100).length;
  const ueberfaellig = berechenbare.filter(
    (v) => v.fruehestesEnde && v.fruehestesEnde < today && v.fortschritt < 100
  ).length;

  // Projektdauer in Arbeitstagen
  const projektDates = projekt.vorgaenge.flatMap((v) =>
    [v.fruehesterAnfang, v.fruehestesEnde].filter(Boolean)
  );
  const projektStart = projektDates.length
    ? projektDates.reduce((a, b) => (a < b ? a : b))
    : null;
  const projektEnde = projektDates.length
    ? projektDates.reduce((a, b) => (a > b ? a : b))
    : null;

  // Fortschrittsverlauf (Burnup-ähnlich): Fortschritt je Woche simulieren
  const fortschrittsVerlauf = useMemo(() => {
    if (!projektStart || !projektEnde) return [];
    const start = parseISO(projektStart);
    const end = parseISO(projektEnde);
    const totalDays = differenceInCalendarDays(end, start);
    if (totalDays <= 0) return [];

    // Geplante Kurve: linear
    const points = [];
    const steps = Math.min(Math.ceil(totalDays / 7), 20);
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const daysFromStart = Math.round(ratio * totalDays);
      const dateStr = format(
        new Date(start.getTime() + daysFromStart * 86400000),
        'dd.MM'
      );
      points.push({
        datum: dateStr,
        geplant: Math.round(ratio * 100),
        // Tatsächlicher Fortschritt: nur für vergangene Punkte schätzbar
        istDate: new Date(start.getTime() + daysFromStart * 86400000).toISOString().split('T')[0],
      });
    }

    // Ist-Fortschritt: verwende tatsächlichen Fortschritt für alle Punkte bis heute
    return points.map((p) => ({
      datum: p.datum,
      geplant: p.geplant,
      ist: p.istDate <= today ? gesamtFortschritt : undefined,
    }));
  }, [projektStart, projektEnde, today, gesamtFortschritt]);

  return (
    <div className="h-full overflow-y-auto p-4 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* ── Zeile 1: Gesamtfortschritt + SPI ─────────── */}
        <div className="grid grid-cols-3 gap-4">
          {/* Gesamtfortschritt */}
          <div className="col-span-2 bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-700">Gesamtfortschritt</h2>
              <span className="text-2xl font-bold text-blue-600">{gesamtFortschritt}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${gesamtFortschritt}%`,
                  background:
                    gesamtFortschritt === 100
                      ? '#22C55E'
                      : gesamtFortschritt >= 70
                      ? '#3B82F6'
                      : gesamtFortschritt >= 30
                      ? '#F59E0B'
                      : '#EF4444',
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>{abgeschlossen} von {berechenbare.length} Vorgängen abgeschlossen</span>
              {ueberfaellig > 0 && (
                <span className="text-orange-500 font-medium">⚠ {ueberfaellig} überfällig</span>
              )}
            </div>
          </div>

          {/* SPI */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col items-center justify-center">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">SPI</h3>
            <p className={`text-3xl font-bold mb-1 ${spiColor(eva.spi)}`}>
              {eva.spi.toFixed(2)}
            </p>
            <div
              className="w-16 h-2 rounded-full mb-1"
              style={{ background: spiBarColor(eva.spi) }}
            />
            <p className={`text-xs ${spiColor(eva.spi)}`}>{spiLabel(eva.spi)}</p>
            <div className="mt-2 text-xs text-slate-400 text-center">
              <div>PV: {eva.pv.toFixed(0)} h</div>
              <div>EV: {eva.ev.toFixed(0)} h</div>
            </div>
          </div>
        </div>

        {/* ── Zeile 2: KPI-Karten ───────────────────────── */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Vorgänge</p>
            <p className="text-2xl font-bold text-slate-800">{projekt.vorgaenge.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">gesamt</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Kritisch</p>
            <p className="text-2xl font-bold text-red-600">{kritisch.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Vorgänge</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Meilensteine</p>
            <p className="text-2xl font-bold text-purple-600">{meilensteine.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">definiert</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Ressourcen</p>
            <p className="text-2xl font-bold text-slate-700">{projekt.ressourcen.length}</p>
            {ueberlastungen.length > 0 ? (
              <p className="text-xs text-orange-500 mt-0.5">⚠ {ueberlastungen.length} überlastet</p>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">ok</p>
            )}
          </div>
        </div>

        {/* ── Zeile 3: Meilenstein-Timeline + Kritischer Pfad ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Meilenstein-Timeline */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Meilenstein-Timeline
              {naechsteMeilensteine.length > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  (nächste {naechsteMeilensteine.length})
                </span>
              )}
            </h2>
            {naechsteMeilensteine.length === 0 ? (
              <p className="text-xs text-slate-400">Keine Meilensteine mit berechneten Terminen.</p>
            ) : (
              <div className="space-y-2">
                {naechsteMeilensteine.map((ms) => {
                  const farbe = meilensteinFarbe(ms, today);
                  const status = meilensteinStatus(ms, today);
                  const heute = ms.fruehesterAnfang === today;
                  return (
                    <div key={ms.id} className="flex items-center gap-3" title={`Status: ${status}`}>
                      <div
                        className="w-3 h-3 rotate-45 flex-shrink-0"
                        style={{ backgroundColor: farbe, boxShadow: heute ? '0 0 0 3px rgba(251,191,36,0.3)' : 'none' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{ms.name}</p>
                        <p className="text-xs" style={{ color: farbe }}>
                          {fmtDate(ms.fruehesterAnfang)}
                          {ms.fortschritt >= 100 && ' ✓'}
                          {heute && ' ← Heute'}
                          <span className="text-slate-400 ml-1">({status})</span>
                        </p>
                      </div>
                      {ms.pspCode && (
                        <span className="text-xs text-slate-400 font-mono">{ms.pspCode}</span>
                      )}
                    </div>
                  );
                })}

                {/* Horizontale Zeitleiste */}
                {naechsteMeilensteine.length >= 2 && projektStart && projektEnde && (
                  <MeilensteinLeiste
                    meilensteine={naechsteMeilensteine}
                    projektStart={projektStart}
                    projektEnde={projektEnde}
                    today={today}
                  />
                )}
              </div>
            )}
          </div>

          {/* Kritischer Pfad */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Kritischer Pfad</h2>
            {kritisch.length === 0 ? (
              <p className="text-xs text-slate-400">Kein kritischer Pfad berechnet.</p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {kritisch.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-100"
                  >
                    <span className="text-red-700 font-medium truncate flex-1 mr-2">
                      {v.pspCode && (
                        <span className="text-slate-400 font-normal mr-1">{v.pspCode}</span>
                      )}
                      {v.name}
                    </span>
                    <span className="text-slate-400 flex-shrink-0 text-right">
                      {v.fruehesterAnfang ? v.fruehesterAnfang.slice(5) : '–'} →{' '}
                      {v.fruehestesEnde ? v.fruehestesEnde.slice(5) : '–'}{' '}
                      <span className="text-slate-500">({v.dauer}d)</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Zeile 4: Fortschrittsverlauf + Überlastungen ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Fortschrittsverlauf */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Fortschrittsverlauf</h2>
            {fortschrittsVerlauf.length < 2 ? (
              <p className="text-xs text-slate-400">Zu wenig Daten für Verlaufsdiagramm.</p>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={fortschrittsVerlauf} margin={{ top: 4, right: 8, bottom: 16, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="datum" tick={{ fontSize: 9, fill: '#94A3B8' }} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#94A3B8' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(val, name) => [`${val}%`, name === 'geplant' ? 'Geplant' : 'Ist']}
                    labelStyle={{ fontSize: 10 }}
                    itemStyle={{ fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="geplant"
                    stroke="#CBD5E1"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ist"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#3B82F6' }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Überlastungswarnungen */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Ressourcen-Status</h2>
            {ueberlastungen.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-lg">✓</span>
                <p className="text-xs">Keine Überlastungen erkannt.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {ueberlastungen.map((u) => (
                  <div key={u.ressourceId} className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">⚠</span>
                    <div>
                      <p className="text-xs font-medium text-slate-700">{u.name}</p>
                      <p className="text-xs text-orange-600">
                        Überlastet an {u.tage.length} Tag{u.tage.length > 1 ? 'en' : ''}:{' '}
                        {u.tage.slice(0, 3).map((d) => d.slice(5)).join(', ')}
                        {u.tage.length > 3 && ` (+${u.tage.length - 3} weitere)`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Projekt-Info */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500">
              {projektStart && (
                <div className="flex justify-between">
                  <span>Projektstart:</span>
                  <span>{fmtDate(projektStart)}</span>
                </div>
              )}
              {projektEnde && (
                <div className="flex justify-between">
                  <span>Projektende:</span>
                  <span>{fmtDate(projektEnde)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Heute:</span>
                <span>{fmtDate(today)}</span>
              </div>
              {projektStart && projektEnde && (
                <div className="flex justify-between">
                  <span>Gesamtdauer:</span>
                  <span>
                    {differenceInCalendarDays(parseISO(projektEnde), parseISO(projektStart))} Tage
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Bestimmt die Farbe eines Meilensteins nach Status */
function meilensteinFarbe(ms, today) {
  if (ms.fortschritt >= 100) return '#22C55E';       // abgeschlossen (--pm-bar-done)
  if (ms.fruehesterAnfang && ms.fruehesterAnfang < today && ms.fortschritt < 100) return '#F59E0B'; // überfällig
  if (ms.istKritisch) return '#EF4444';               // kritischer Pfad
  return '#8B5CF6';                                    // normal (--pm-milestone)
}

/** Status-Label für Tooltip */
function meilensteinStatus(ms, today) {
  if (ms.fortschritt >= 100) return 'Abgeschlossen';
  if (ms.fruehesterAnfang && ms.fruehesterAnfang < today && ms.fortschritt < 100) return 'Überfällig';
  if (ms.istKritisch) return 'Kritisch';
  return 'Offen';
}

/** Kürzt Text auf maxLen Zeichen */
function truncate(text, maxLen = 12) {
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

/** Horizontale Meilenstein-Zeitleiste (SVG) mit Farbcodierung, Beschriftung und Tooltip */
function MeilensteinLeiste({ meilensteine, projektStart, projektEnde, today }) {
  const W = 400;
  const LINE_Y = 24;
  const DIAMOND = 8;
  const LABEL_Y = LINE_Y + DIAMOND + 14;
  const DATE_Y = LABEL_Y + 12;
  const H = DATE_Y + 8;
  const pad = 20;

  const total = differenceInCalendarDays(parseISO(projektEnde), parseISO(projektStart)) || 1;
  const toX = (dateStr) => {
    const days = differenceInCalendarDays(parseISO(dateStr), parseISO(projektStart));
    return pad + ((days / total) * (W - 2 * pad));
  };
  const todayX = toX(today);

  return (
    <div className="mt-3 overflow-x-auto">
      <svg width={W} height={H} style={{ display: 'block' }}>
        {/* Achse */}
        <line x1={pad} y1={LINE_Y} x2={W - pad} y2={LINE_Y} stroke="#E2E8F0" strokeWidth={2} />
        {/* Anfang + Ende Beschriftung */}
        <text x={pad} y={10} fontSize={8} fill="#CBD5E1" textAnchor="start">
          {projektStart.slice(5)}
        </text>
        <text x={W - pad} y={10} fontSize={8} fill="#CBD5E1" textAnchor="end">
          {projektEnde.slice(5)}
        </text>
        {/* Heute-Linie */}
        {todayX >= pad && todayX <= W - pad && (
          <line x1={todayX} y1={LINE_Y - 12} x2={todayX} y2={LINE_Y + 12} stroke="#EF4444" strokeWidth={1.5} strokeDasharray="3 2" />
        )}
        {/* Meilensteine */}
        {meilensteine.map((ms) => {
          if (!ms.fruehesterAnfang) return null;
          const x = toX(ms.fruehesterAnfang);
          const farbe = meilensteinFarbe(ms, today);
          const status = meilensteinStatus(ms, today);
          const datumStr = fmtDate(ms.fruehesterAnfang);
          return (
            <g key={ms.id}>
              {/* Diamant */}
              <polygon
                points={`${x},${LINE_Y - DIAMOND} ${x + DIAMOND},${LINE_Y} ${x},${LINE_Y + DIAMOND} ${x - DIAMOND},${LINE_Y}`}
                fill={farbe}
                className="cursor-pointer"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }}
              >
                <title>{`${ms.name}\n${datumStr}\nStatus: ${status}`}</title>
              </polygon>
              {/* Name (gekürzt) */}
              <text
                x={x}
                y={LABEL_Y}
                fontSize={8}
                fill="#475569"
                textAnchor="middle"
                fontWeight="500"
              >
                {truncate(ms.name)}
              </text>
              {/* Datum */}
              <text
                x={x}
                y={DATE_Y}
                fontSize={7}
                fill="#94A3B8"
                textAnchor="middle"
              >
                {ms.fruehesterAnfang.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
