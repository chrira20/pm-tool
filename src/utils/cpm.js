/**
 * Netzplanberechnung – Critical Path Method (CPM)
 * Masterprompt Abschnitt B.1
 *
 * Implementiert:
 * - Topologische Sortierung (Kahns Algorithmus)
 * - Vorwärtsrechnung (Forward Pass)
 * - Rückwärtsrechnung (Backward Pass)
 * - Pufferberechnung (GP, FP)
 * - Zykluserkennung
 * - Alle 4 Abhängigkeitstypen: EA, AA, EE, AE
 */

import { parseISO, format } from 'date-fns';
import { addArbeitstage, naechsterArbeitstag } from './calendar.js';

/**
 * Führt die vollständige Netzplanberechnung durch.
 *
 * @param {import('../models/types').Task[]} vorgaenge
 * @param {import('../models/types').Dependency[]} abhaengigkeiten
 * @param {import('../models/types').Calendar} kalender
 * @param {string} projektStart - ISO-Date
 * @returns {{ vorgaenge: Task[], fehler: string|null }}
 */
export function berechneNetzplan(vorgaenge, abhaengigkeiten, kalender, projektStart) {
  // Nur echte Vorgänge und Meilensteine berechnen (keine Sammelvorgänge)
  const berechenbar = vorgaenge.filter((v) => v.typ !== 'Sammelvorgang');
  const alleIds = new Set(berechenbar.map((v) => v.id));

  // Adjacency-Listen aufbauen
  const nachfolgerMap = new Map(); // vorgängerId → [{nachfolgerId, typ, zeitversatz}]
  const vorgaengerMap = new Map(); // nachfolgerId → [{vorgängerId, typ, zeitversatz}]
  const eingangsgrad = new Map();

  for (const v of berechenbar) {
    nachfolgerMap.set(v.id, []);
    vorgaengerMap.set(v.id, []);
    eingangsgrad.set(v.id, 0);
  }

  for (const dep of abhaengigkeiten) {
    if (!alleIds.has(dep.vorgaengerId) || !alleIds.has(dep.nachfolgerId)) continue;
    nachfolgerMap.get(dep.vorgaengerId).push(dep);
    vorgaengerMap.get(dep.nachfolgerId).push(dep);
    eingangsgrad.set(dep.nachfolgerId, (eingangsgrad.get(dep.nachfolgerId) || 0) + 1);
  }

  // ─── Topologische Sortierung (Kahns Algorithmus) ────────────
  const sortiert = [];
  const queue = [];

  for (const [id, grad] of eingangsgrad) {
    if (grad === 0) queue.push(id);
  }

  const tempEingangsgrad = new Map(eingangsgrad);

  while (queue.length > 0) {
    const current = queue.shift();
    sortiert.push(current);

    for (const dep of nachfolgerMap.get(current) || []) {
      const neuerGrad = tempEingangsgrad.get(dep.nachfolgerId) - 1;
      tempEingangsgrad.set(dep.nachfolgerId, neuerGrad);
      if (neuerGrad === 0) queue.push(dep.nachfolgerId);
    }
  }

  // Zykluserkennung
  if (sortiert.length !== berechenbar.length) {
    const zyklusIds = berechenbar
      .filter((v) => !sortiert.includes(v.id))
      .map((v) => v.name);
    return {
      vorgaenge,
      fehler: `Zyklus erkannt bei: ${zyklusIds.join(', ')}. Bitte Abhängigkeiten prüfen.`,
    };
  }

  // Vorgänge als Map für schnellen Zugriff
  const vorgangMap = new Map(vorgaenge.map((v) => [v.id, { ...v }]));
  const startDate = parseISO(projektStart);

  // ─── Vorwärtsrechnung (Forward Pass) ────────────────────────
  for (const id of sortiert) {
    const vorgang = vorgangMap.get(id);
    const deps = vorgaengerMap.get(id) || [];

    let faz;

    if (deps.length === 0) {
      // Startvorgang: beginnt am Projektstartdatum
      faz = naechsterArbeitstag(startDate, kalender);
    } else {
      // FAZ = Maximum der berechneten Termine aus Vorgängern
      let maxDate = null;

      for (const dep of deps) {
        const vorgaenger = vorgangMap.get(dep.vorgaengerId);
        let bezugsDatum;

        switch (dep.typ) {
          case 'EA': // Ende-Anfang: FAZ(N) ≥ FEZ(V) + Zeitversatz
            bezugsDatum = parseISO(vorgaenger.fruehestesEnde);
            bezugsDatum = addArbeitstage(bezugsDatum, 1 + dep.zeitversatz, kalender);
            break;
          case 'AA': // Anfang-Anfang: FAZ(N) ≥ FAZ(V) + Zeitversatz
            bezugsDatum = parseISO(vorgaenger.fruehesterAnfang);
            bezugsDatum = addArbeitstage(bezugsDatum, dep.zeitversatz, kalender);
            break;
          case 'EE': // Ende-Ende: FEZ(N) ≥ FEZ(V) + Zeitversatz → FAZ ableiten
            bezugsDatum = parseISO(vorgaenger.fruehestesEnde);
            bezugsDatum = addArbeitstage(bezugsDatum, dep.zeitversatz, kalender);
            // FEZ soll mindestens bezugsDatum sein → FAZ = FEZ - Dauer
            // Wird nach FEZ-Berechnung korrigiert
            bezugsDatum = addArbeitstage(bezugsDatum, -(vorgang.dauer - 1), kalender);
            break;
          case 'AE': // Anfang-Ende: FEZ(N) ≥ FAZ(V) + Zeitversatz → FAZ ableiten
            bezugsDatum = parseISO(vorgaenger.fruehesterAnfang);
            bezugsDatum = addArbeitstage(bezugsDatum, dep.zeitversatz, kalender);
            bezugsDatum = addArbeitstage(bezugsDatum, -(vorgang.dauer - 1), kalender);
            break;
          default:
            bezugsDatum = startDate;
        }

        bezugsDatum = naechsterArbeitstag(bezugsDatum, kalender);

        if (!maxDate || bezugsDatum > maxDate) {
          maxDate = bezugsDatum;
        }
      }

      faz = maxDate;
    }

    const dauer = vorgang.typ === 'Meilenstein' ? 0 : vorgang.dauer;
    const fez = addArbeitstage(faz, dauer, kalender);

    vorgang.fruehesterAnfang = format(faz, 'yyyy-MM-dd');
    vorgang.fruehestesEnde = format(fez, 'yyyy-MM-dd');
  }

  // ─── Rückwärtsrechnung (Backward Pass) ──────────────────────
  // Projektende = Maximum aller FEZ
  let projektEnde = null;
  for (const id of sortiert) {
    const fez = parseISO(vorgangMap.get(id).fruehestesEnde);
    if (!projektEnde || fez > projektEnde) projektEnde = fez;
  }

  // Rückwärts iterieren
  for (let i = sortiert.length - 1; i >= 0; i--) {
    const id = sortiert[i];
    const vorgang = vorgangMap.get(id);
    const nachfolger = nachfolgerMap.get(id) || [];

    let sez;

    if (nachfolger.length === 0) {
      // Endvorgang: SEZ = Projektende
      sez = projektEnde;
    } else {
      let minDate = null;

      for (const dep of nachfolger) {
        const nf = vorgangMap.get(dep.nachfolgerId);
        let bezugsDatum;

        switch (dep.typ) {
          case 'EA':
            bezugsDatum = parseISO(nf.spaetesterAnfang);
            bezugsDatum = addArbeitstage(bezugsDatum, -(1 + dep.zeitversatz), kalender);
            break;
          case 'AA': {
            bezugsDatum = parseISO(nf.spaetesterAnfang);
            bezugsDatum = addArbeitstage(bezugsDatum, -dep.zeitversatz, kalender);
            // SAZ des Vorgängers → SEZ = SAZ + Dauer
            const dauer = vorgang.typ === 'Meilenstein' ? 0 : vorgang.dauer;
            bezugsDatum = addArbeitstage(bezugsDatum, dauer, kalender);
            break;
          }
          case 'EE':
            bezugsDatum = parseISO(nf.spaetestesEnde);
            bezugsDatum = addArbeitstage(bezugsDatum, -dep.zeitversatz, kalender);
            break;
          case 'AE':
            bezugsDatum = parseISO(nf.spaetestesEnde);
            bezugsDatum = addArbeitstage(bezugsDatum, -dep.zeitversatz, kalender);
            break;
          default:
            bezugsDatum = projektEnde;
        }

        if (!minDate || bezugsDatum < minDate) {
          minDate = bezugsDatum;
        }
      }

      sez = minDate;
    }

    const dauer = vorgang.typ === 'Meilenstein' ? 0 : vorgang.dauer;
    const saz = addArbeitstage(sez, -dauer, kalender);

    vorgang.spaetestesEnde = format(sez, 'yyyy-MM-dd');
    vorgang.spaetesterAnfang = format(saz, 'yyyy-MM-dd');
  }

  // ─── Pufferberechnung ───────────────────────────────────────
  for (const id of sortiert) {
    const vorgang = vorgangMap.get(id);
    const fazDate = parseISO(vorgang.fruehesterAnfang);
    const sazDate = parseISO(vorgang.spaetesterAnfang);

    // GP = SAZ - FAZ (in Arbeitstagen)
    const gp = Math.round((sazDate - fazDate) / (1000 * 60 * 60 * 24));
    vorgang.gesamtpuffer = gp;
    vorgang.istKritisch = gp === 0;

    // FP = min(FAZ Nachfolger) - FEZ
    const nachfolger = nachfolgerMap.get(id) || [];
    if (nachfolger.length > 0) {
      let minNachfolgerFaz = null;
      for (const dep of nachfolger) {
        if (dep.typ === 'EA') {
          const nfFaz = parseISO(vorgangMap.get(dep.nachfolgerId).fruehesterAnfang);
          if (!minNachfolgerFaz || nfFaz < minNachfolgerFaz) minNachfolgerFaz = nfFaz;
        }
      }
      if (minNachfolgerFaz) {
        const fez = parseISO(vorgang.fruehestesEnde);
        vorgang.freierPuffer = Math.round((minNachfolgerFaz - fez) / (1000 * 60 * 60 * 24)) - 1;
      } else {
        vorgang.freierPuffer = vorgang.gesamtpuffer;
      }
    } else {
      vorgang.freierPuffer = vorgang.gesamtpuffer;
    }
  }

  // ─── Sammelvorgänge aggregieren (B.3) ───────────────────────
  const sammelvorgaenge = vorgaenge.filter((v) => v.typ === 'Sammelvorgang');
  for (const sv of sammelvorgaenge) {
    const kinder = vorgaenge.filter((v) => v.elternId === sv.id && v.typ !== 'Sammelvorgang');
    if (kinder.length === 0) continue;

    const svCopy = vorgangMap.get(sv.id) || { ...sv };

    const fazDates = kinder.map((k) => vorgangMap.get(k.id)?.fruehesterAnfang).filter(Boolean);
    const fezDates = kinder.map((k) => vorgangMap.get(k.id)?.fruehestesEnde).filter(Boolean);

    if (fazDates.length > 0) {
      svCopy.fruehesterAnfang = fazDates.sort()[0];
      svCopy.fruehestesEnde = fezDates.sort().reverse()[0];
      svCopy.spaetesterAnfang = svCopy.fruehesterAnfang;
      svCopy.spaetestesEnde = svCopy.fruehestesEnde;
      svCopy.gesamtpuffer = 0;
      svCopy.freierPuffer = 0;
      svCopy.istKritisch = kinder.some((k) => vorgangMap.get(k.id)?.istKritisch);

      // Gewichteter Fortschritt
      const gesamtDauer = kinder.reduce((sum, k) => sum + k.dauer, 0);
      if (gesamtDauer > 0) {
        svCopy.fortschritt = Math.round(
          kinder.reduce((sum, k) => sum + k.fortschritt * k.dauer, 0) / gesamtDauer
        );
      }

      vorgangMap.set(sv.id, svCopy);
    }
  }

  // Ergebnis: aktualisierte Vorgänge zurückgeben
  const ergebnis = vorgaenge.map((v) => vorgangMap.get(v.id) || v);

  return { vorgaenge: ergebnis, fehler: null };
}
