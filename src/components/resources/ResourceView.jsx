/**
 * Ressourcen-Ansicht (Masterprompt C.1 + C.3)
 * Oben: Ressourcenliste mit CRUD und Zuordnungen
 * Unten: Auslastungsdiagramm (gestapeltes Balkendiagramm, recharts)
 */

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { parseISO, addDays, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { createResource, createAssignment } from '../../models/types';
import { berechneAuslastung, findeUeberlastungen } from '../../utils/resources';
import ResourceHeatmap from './ResourceHeatmap';

/** Baut wöchentliche Auslastungsdaten für recharts */
function buildChartData(vorgaenge, zuordnungen, ressourcen, kalender) {
  if (!ressourcen.length) return [];

  const dates = vorgaenge.flatMap((v) =>
    [v.fruehesterAnfang, v.fruehestesEnde].filter(Boolean)
  );
  if (!dates.length) return [];

  const startStr = dates.reduce((a, b) => (a < b ? a : b));
  const endStr = dates.reduce((a, b) => (a > b ? a : b));
  const start = parseISO(startStr);
  const end = parseISO(endStr);

  const auslastung = berechneAuslastung(
    vorgaenge,
    zuordnungen,
    ressourcen,
    kalender,
    startStr,
    endStr
  );

  const weeks = [];
  let cur = start;
  while (cur <= end) {
    const label = format(cur, "'KW'ww / MMM", { locale: de });
    const entry = { datum: label };
    for (const r of ressourcen) {
      let total = 0;
      for (let d = 0; d < 7; d++) {
        const key = format(addDays(cur, d), 'yyyy-MM-dd');
        total += auslastung.get(r.id)?.get(key) || 0;
      }
      entry[r.id] = Math.round(total * 10) / 10;
    }
    weeks.push(entry);
    cur = addDays(cur, 7);
  }
  return weeks;
}

/** Tooltip-Formatter für recharts */
function CustomTooltip({ active, payload, label, ressourcen }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded shadow-md p-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => {
        const r = ressourcen.find((r) => r.id === p.dataKey);
        return (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.fill }} />
            <span className="text-slate-600">{r?.name || p.dataKey}:</span>
            <span className="font-medium">{p.value}h</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ResourceView({ projekt, onUpdate }) {
  const [selectedRessourceId, setSelectedRessourceId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [chartMode, setChartMode] = useState('bar'); // 'bar' | 'heatmap'

  const addRessource = () => {
    const neue = createResource(projekt.id, {
      name: `Ressource ${projekt.ressourcen.length + 1}`,
      farbe: `hsl(${(projekt.ressourcen.length * 60) % 360}, 65%, 55%)`,
    });
    onUpdate({ ressourcen: [...projekt.ressourcen, neue] });
  };

  const deleteRessource = (id) => {
    onUpdate({
      ressourcen: projekt.ressourcen.filter((r) => r.id !== id),
      zuordnungen: projekt.zuordnungen.filter((z) => z.ressourceId !== id),
    });
    if (selectedRessourceId === id) setSelectedRessourceId(null);
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setEditForm({ name: r.name, typ: r.typ, kapazitaet: r.kapazitaet, kostenProStunde: r.kostenProStunde, farbe: r.farbe });
  };

  const saveEdit = () => {
    onUpdate({
      ressourcen: projekt.ressourcen.map((r) =>
        r.id === editingId ? { ...r, ...editForm } : r
      ),
    });
    setEditingId(null);
  };

  // Zuordnungen für ausgewählte Ressource
  const ressourceZuordnungen = useMemo(
    () => projekt.zuordnungen.filter((z) => z.ressourceId === selectedRessourceId),
    [projekt.zuordnungen, selectedRessourceId]
  );

  const addZuordnung = (vorgangId) => {
    if (!vorgangId || !selectedRessourceId) return;
    const exists = projekt.zuordnungen.some(
      (z) => z.vorgangId === vorgangId && z.ressourceId === selectedRessourceId
    );
    if (exists) return;
    const neu = createAssignment({ vorgangId, ressourceId: selectedRessourceId, aufwand: 8, auslastung: 100 });
    onUpdate({ zuordnungen: [...projekt.zuordnungen, neu] });
  };

  const deleteZuordnung = (id) => {
    onUpdate({ zuordnungen: projekt.zuordnungen.filter((z) => z.id !== id) });
  };

  const updateZuordnung = (id, changes) => {
    onUpdate({
      zuordnungen: projekt.zuordnungen.map((z) => (z.id === id ? { ...z, ...changes } : z)),
    });
  };

  // Auslastungsdiagramm-Daten
  const chartData = useMemo(
    () => buildChartData(projekt.vorgaenge, projekt.zuordnungen, projekt.ressourcen, projekt.kalender),
    [projekt.vorgaenge, projekt.zuordnungen, projekt.ressourcen, projekt.kalender]
  );

  // Überlastungen
  const ueberlastungen = useMemo(() => {
    if (!projekt.ressourcen.length) return [];
    const dates = projekt.vorgaenge.flatMap((v) =>
      [v.fruehesterAnfang, v.fruehestesEnde].filter(Boolean)
    );
    if (!dates.length) return [];
    const startStr = dates.reduce((a, b) => (a < b ? a : b));
    const endStr = dates.reduce((a, b) => (a > b ? a : b));
    const auslastung = berechneAuslastung(
      projekt.vorgaenge, projekt.zuordnungen, projekt.ressourcen, projekt.kalender, startStr, endStr
    );
    return findeUeberlastungen(auslastung, projekt.ressourcen);
  }, [projekt]);

  // Kapazitätslinie (wöchentlich): maximale Kapazität aller Ressourcen zusammen × 5 Tage
  const gesamtKapazitaet = projekt.ressourcen.reduce((s, r) => s + r.kapazitaet * 5, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Ressourcenliste ────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-slate-200" style={{ maxHeight: '45%' }}>
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Ressourcen ({projekt.ressourcen.length})
          </span>
          <button
            onClick={addRessource}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ressource
          </button>
        </div>

        <div className="flex overflow-hidden" style={{ maxHeight: 'calc(45vh - 80px)' }}>
          {/* Ressourcen-Tabelle */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                <tr className="text-left text-slate-500">
                  <th className="px-3 py-1.5 font-medium">Name</th>
                  <th className="px-3 py-1.5 font-medium">Typ</th>
                  <th className="px-3 py-1.5 font-medium">Kapazität</th>
                  <th className="px-3 py-1.5 font-medium">€/h</th>
                  <th className="px-3 py-1.5 font-medium">Farbe</th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody>
                {projekt.ressourcen.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRessourceId((id) => (id === r.id ? null : r.id))}
                    className={`border-b border-slate-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                      selectedRessourceId === r.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    {editingId === r.id ? (
                      <>
                        <td className="px-2 py-1">
                          <input
                            autoFocus
                            value={editForm.name}
                            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                            className="w-full px-1 py-0.5 border border-blue-300 rounded text-xs"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-2 py-1">
                          <select
                            value={editForm.typ}
                            onChange={(e) => setEditForm((f) => ({ ...f, typ: e.target.value }))}
                            className="w-full px-1 py-0.5 border border-blue-300 rounded text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="Arbeit">Arbeit</option>
                            <option value="Material">Material</option>
                            <option value="Kosten">Kosten</option>
                          </select>
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="number" min="1" max="24"
                            value={editForm.kapazitaet}
                            onChange={(e) => setEditForm((f) => ({ ...f, kapazitaet: parseFloat(e.target.value) || 8 }))}
                            className="w-16 px-1 py-0.5 border border-blue-300 rounded text-xs"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="number" min="0"
                            value={editForm.kostenProStunde}
                            onChange={(e) => setEditForm((f) => ({ ...f, kostenProStunde: parseFloat(e.target.value) || 0 }))}
                            className="w-16 px-1 py-0.5 border border-blue-300 rounded text-xs"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="color"
                            value={editForm.farbe}
                            onChange={(e) => setEditForm((f) => ({ ...f, farbe: e.target.value }))}
                            className="w-8 h-6 rounded cursor-pointer border-0"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-2 py-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); saveEdit(); }}
                            className="text-xs px-1.5 py-0.5 bg-green-500 text-white rounded hover:bg-green-600 mr-1"
                          >
                            ✓
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                            className="text-xs px-1.5 py-0.5 border border-slate-300 rounded hover:bg-slate-50"
                          >
                            ✕
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-1.5 font-medium text-slate-700">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle"
                            style={{ background: r.farbe }}
                          />
                          {r.name}
                          {ueberlastungen.some((u) => u.ressourceId === r.id) && (
                            <span className="ml-2 text-orange-500 font-bold" title="Überlastet">⚠</span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-slate-500">{r.typ}</td>
                        <td className="px-3 py-1.5 text-slate-500">{r.kapazitaet}h/Tag</td>
                        <td className="px-3 py-1.5 text-slate-500">
                          {r.kostenProStunde > 0 ? `${r.kostenProStunde} €` : '–'}
                        </td>
                        <td className="px-3 py-1.5">
                          <span
                            className="inline-block w-5 h-4 rounded border border-slate-300"
                            style={{ background: r.farbe }}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); startEdit(r); }}
                            className="text-slate-400 hover:text-blue-500 mr-2 text-xs"
                          >
                            ✏
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteRessource(r.id); }}
                            className="text-slate-400 hover:text-red-500 text-xs"
                          >
                            ✕
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {projekt.ressourcen.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                      Noch keine Ressourcen. Klicke &quot;+ Ressource&quot;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Zuordnungs-Panel (wenn Ressource ausgewählt) */}
          {selectedRessourceId && (() => {
            const res = projekt.ressourcen.find((r) => r.id === selectedRessourceId);
            if (!res) return null;
            const unzugeordnet = projekt.vorgaenge.filter(
              (v) => !projekt.zuordnungen.some(
                (z) => z.vorgangId === v.id && z.ressourceId === selectedRessourceId
              )
            );
            return (
              <div className="w-64 border-l border-slate-200 bg-slate-50 overflow-y-auto flex-shrink-0">
                <div className="px-3 py-2 bg-white border-b border-slate-200">
                  <p className="text-xs font-semibold text-slate-700">
                    Zuordnungen: {res.name}
                  </p>
                </div>
                <div className="p-2">
                  {ressourceZuordnungen.length === 0 && (
                    <p className="text-xs text-slate-400 mb-2">Keine Zuordnungen.</p>
                  )}
                  {ressourceZuordnungen.map((z) => {
                    const v = projekt.vorgaenge.find((t) => t.id === z.vorgangId);
                    return (
                      <div key={z.id} className="flex items-center gap-1 py-1 border-b border-slate-100">
                        <span className="flex-1 text-xs text-slate-700 truncate">{v?.name || '?'}</span>
                        <input
                          type="number" min="0"
                          value={z.aufwand}
                          onChange={(e) => updateZuordnung(z.id, { aufwand: parseFloat(e.target.value) || 0 })}
                          className="w-12 px-1 py-0.5 text-xs border border-slate-300 rounded"
                          title="Aufwand (Stunden)"
                        />
                        <span className="text-xs text-slate-400">h</span>
                        <button
                          onClick={() => deleteZuordnung(z.id)}
                          className="text-slate-300 hover:text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                  {unzugeordnet.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-400 mb-1">Vorgang zuordnen:</p>
                      <select
                        defaultValue=""
                        onChange={(e) => { addZuordnung(e.target.value); e.target.value = ''; }}
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                      >
                        <option value="">Vorgang wählen…</option>
                        {unzugeordnet.map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Auslastungsdiagramm ─────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ background: 'var(--pm-row-summary)', borderBottom: '1px solid var(--pm-border)' }}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--pm-text-muted)' }}>
              Auslastung
            </span>
            {/* Ansichts-Umschalter */}
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--pm-border)' }}>
              <button
                onClick={() => setChartMode('bar')}
                className="px-2 py-0.5 text-[10px] font-medium transition-colors"
                style={{
                  background: chartMode === 'bar' ? 'var(--pm-accent)' : 'var(--pm-table-bg)',
                  color: chartMode === 'bar' ? 'white' : 'var(--pm-text-muted)',
                }}
              >
                📊 Balken
              </button>
              <button
                onClick={() => setChartMode('heatmap')}
                className="px-2 py-0.5 text-[10px] font-medium transition-colors"
                style={{
                  background: chartMode === 'heatmap' ? 'var(--pm-accent)' : 'var(--pm-table-bg)',
                  color: chartMode === 'heatmap' ? 'white' : 'var(--pm-text-muted)',
                  borderLeft: '1px solid var(--pm-border)',
                }}
              >
                🗓 Heatmap
              </button>
            </div>
          </div>
          {ueberlastungen.length > 0 && (
            <span className="text-xs font-medium" style={{ color: 'var(--pm-warning)' }}>
              ⚠ {ueberlastungen.length} Ressource{ueberlastungen.length > 1 ? 'n' : ''} überlastet
            </span>
          )}
        </div>

        {chartMode === 'heatmap' ? (
          <ResourceHeatmap
            vorgaenge={projekt.vorgaenge}
            zuordnungen={projekt.zuordnungen}
            ressourcen={projekt.ressourcen}
            kalender={projekt.kalender}
          />
        ) : chartData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--pm-text-muted)' }}>
            {projekt.ressourcen.length === 0
              ? 'Füge zuerst Ressourcen hinzu.'
              : 'Keine Vorgänge mit berechneten Terminen vorhanden.'}
          </div>
        ) : (
          <div className="flex-1 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 16, bottom: 40, left: 40 }}
                barSize={Math.max(10, Math.min(40, 600 / (chartData.length || 1)))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="datum"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  label={{
                    value: 'Stunden',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -8,
                    style: { fontSize: 10, fill: '#94A3B8' },
                  }}
                />
                <Tooltip
                  content={<CustomTooltip ressourcen={projekt.ressourcen} />}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(value) =>
                    projekt.ressourcen.find((r) => r.id === value)?.name || value
                  }
                />
                {gesamtKapazitaet > 0 && (
                  <ReferenceLine
                    y={gesamtKapazitaet}
                    stroke="#EF4444"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    label={{
                      value: 'Kapazität',
                      position: 'right',
                      style: { fontSize: 10, fill: '#EF4444' },
                    }}
                  />
                )}
                {projekt.ressourcen.map((r) => (
                  <Bar
                    key={r.id}
                    dataKey={r.id}
                    name={r.name}
                    stackId="a"
                    fill={r.farbe}
                    radius={[0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
