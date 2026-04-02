/**
 * Ressourcen-Auslastungsberechnung (Masterprompt Abschnitt B.4)
 */

import { parseISO, addDays, format } from 'date-fns';
import { istArbeitstag, arbeitstageZwischen } from './calendar.js';

/**
 * Berechnet die tägliche Auslastung aller Ressourcen.
 *
 * @param {import('../models/types').Task[]} vorgaenge
 * @param {import('../models/types').Assignment[]} zuordnungen
 * @param {import('../models/types').Resource[]} ressourcen
 * @param {import('../models/types').Calendar} kalender
 * @returns {Map<string, Map<string, number>>} ressourceId → (datum → stundenBelegt)
 */
export function berechneAuslastung(vorgaenge, zuordnungen, ressourcen, kalender) {
  const result = new Map();

  for (const ressource of ressourcen) {
    result.set(ressource.id, new Map());
  }

  for (const zuordnung of zuordnungen) {
    const vorgang = vorgaenge.find((v) => v.id === zuordnung.vorgangId);
    if (!vorgang || !vorgang.fruehesterAnfang || !vorgang.fruehestesEnde) continue;

    const vStart = parseISO(vorgang.fruehesterAnfang);
    const vEnde = parseISO(vorgang.fruehestesEnde);

    // Arbeitstage im Vorgang zählen
    const arbeitstage = arbeitstageZwischen(vStart, vEnde, kalender);
    if (arbeitstage === 0) continue;

    // Stunden pro Arbeitstag für diese Zuordnung
    const stundenProTag = (zuordnung.aufwand / arbeitstage) * (zuordnung.auslastung / 100);

    // Auf jeden Arbeitstag verteilen
    let current = new Date(vStart);
    while (current <= vEnde) {
      if (istArbeitstag(current, kalender)) {
        const key = format(current, 'yyyy-MM-dd');
        const ressourceMap = result.get(zuordnung.ressourceId);
        if (ressourceMap) {
          ressourceMap.set(key, (ressourceMap.get(key) || 0) + stundenProTag);
        }
      }
      current = addDays(current, 1);
    }
  }

  return result;
}

/**
 * Findet überlastete Ressourcen (> 100% Kapazität an mindestens einem Tag).
 *
 * @param {Map<string, Map<string, number>>} auslastung
 * @param {import('../models/types').Resource[]} ressourcen
 * @returns {{ressourceId: string, name: string, tage: string[]}[]}
 */
export function findeUeberlastungen(auslastung, ressourcen) {
  const ergebnis = [];

  for (const ressource of ressourcen) {
    const tagesMap = auslastung.get(ressource.id);
    if (!tagesMap) continue;

    const ueberlastetenTage = [];
    for (const [datum, stunden] of tagesMap) {
      if (stunden > ressource.kapazitaet) {
        ueberlastetenTage.push(datum);
      }
    }

    if (ueberlastetenTage.length > 0) {
      ergebnis.push({
        ressourceId: ressource.id,
        name: ressource.name,
        tage: ueberlastetenTage.sort(),
      });
    }
  }

  return ergebnis;
}
