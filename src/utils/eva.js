/**
 * Earned-Value-Analyse (EVA) – Masterprompt Abschnitt B.5
 *
 * Berechnet PV (Planned Value), EV (Earned Value) und SPI.
 */

import { parseISO, isBefore, isEqual } from 'date-fns';

/**
 * Berechnet die Earned-Value-Kennzahlen für ein Projekt.
 *
 * @param {import('../models/types').Task[]} vorgaenge
 * @param {import('../models/types').Assignment[]} zuordnungen
 * @param {import('../models/types').Resource[]} ressourcen
 * @param {Date} stichtag - Datum für die Berechnung
 * @returns {{ pv: number, ev: number, spi: number }}
 */
export function berechneEVA(vorgaenge, zuordnungen, ressourcen, stichtag) {
  let pv = 0; // Planned Value
  let ev = 0; // Earned Value

  const berechenbar = vorgaenge.filter((v) => v.typ === 'Vorgang');

  for (const vorgang of berechenbar) {
    // Gesamtaufwand dieses Vorgangs berechnen
    const vorgangZuordnungen = zuordnungen.filter((z) => z.vorgangId === vorgang.id);
    const gesamtAufwand = vorgangZuordnungen.reduce((sum, z) => sum + z.aufwand, 0);

    if (gesamtAufwand === 0) continue;

    // PV: Wenn FEZ ≤ Stichtag, ist der volle Aufwand geplant
    if (vorgang.fruehestesEnde) {
      const fez = parseISO(vorgang.fruehestesEnde);
      if (isBefore(fez, stichtag) || isEqual(fez, stichtag)) {
        pv += gesamtAufwand;
      } else if (vorgang.fruehesterAnfang) {
        // Anteilig: wie viel des Vorgangs hätte bis Stichtag erledigt sein sollen
        const faz = parseISO(vorgang.fruehesterAnfang);
        if (isBefore(faz, stichtag) || isEqual(faz, stichtag)) {
          const gesamtTage = (fez - faz) / (1000 * 60 * 60 * 24);
          const verstricheneTage = (stichtag - faz) / (1000 * 60 * 60 * 24);
          const anteil = gesamtTage > 0 ? Math.min(verstricheneTage / gesamtTage, 1) : 1;
          pv += gesamtAufwand * anteil;
        }
      }
    }

    // EV: Tatsächlich fertiggestellter Wert
    ev += gesamtAufwand * (vorgang.fortschritt / 100);
  }

  // SPI = EV / PV (Terminleistungsindex)
  const spi = pv > 0 ? ev / pv : 1;

  return {
    pv: Math.round(pv * 100) / 100,
    ev: Math.round(ev * 100) / 100,
    spi: Math.round(spi * 100) / 100,
  };
}
