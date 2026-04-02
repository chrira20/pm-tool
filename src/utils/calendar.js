/**
 * Kalenderlogik (Masterprompt Abschnitt B.2)
 *
 * Übersetzt zwischen Arbeitstagen (Dauern) und Kalendertagen (Termine).
 * Berücksichtigt Wochenenden, Feiertage und Betriebsferien.
 */

import { addDays, differenceInCalendarDays, format, isWithinInterval, parseISO } from 'date-fns';

/**
 * Prüft ob ein Datum ein Arbeitstag ist (kein Wochenende, Feiertag, Betriebsferien).
 * @param {Date} date
 * @param {import('../models/types').Calendar} kalender
 * @returns {boolean}
 */
export function istArbeitstag(date, kalender) {
  // Wochentag prüfen (0=So, 1=Mo, ..., 6=Sa → umrechnen auf Mo=0)
  const jsDay = date.getDay(); // 0=So, 1=Mo, ..., 6=Sa
  const kalenderIndex = jsDay === 0 ? 6 : jsDay - 1; // Mo=0, ..., So=6

  if (!kalender.arbeitstage[kalenderIndex]) return false;

  const isoDate = format(date, 'yyyy-MM-dd');

  // Feiertag prüfen
  if (kalender.feiertage.includes(isoDate)) return false;

  // Betriebsferien prüfen
  for (const ferien of kalender.betriebsferien) {
    const von = parseISO(ferien.von);
    const bis = parseISO(ferien.bis);
    if (isWithinInterval(date, { start: von, end: bis })) return false;
  }

  return true;
}

/**
 * Addiert Arbeitstage zu einem Startdatum.
 * Gibt das resultierende Kalenderdatum zurück.
 *
 * @param {Date} startDatum
 * @param {number} anzahlArbeitstage - Kann auch 0 sein (Meilenstein)
 * @param {import('../models/types').Calendar} kalender
 * @returns {Date}
 */
export function addArbeitstage(startDatum, anzahlArbeitstage, kalender) {
  if (anzahlArbeitstage === 0) return new Date(startDatum);

  let aktuellesDatum = new Date(startDatum);
  let verbleibendeArbeitstage = anzahlArbeitstage;

  // Bei Dauer > 0: Der Startag zählt als erster Arbeitstag
  // D.h. 1 Tag Dauer: Start Mo → Ende Mo (nicht Di)
  if (verbleibendeArbeitstage > 0) {
    verbleibendeArbeitstage--; // Starttag ist inklusiv
  }

  while (verbleibendeArbeitstage > 0) {
    aktuellesDatum = addDays(aktuellesDatum, 1);
    if (istArbeitstag(aktuellesDatum, kalender)) {
      verbleibendeArbeitstage--;
    }
  }

  return aktuellesDatum;
}

/**
 * Zählt die Arbeitstage zwischen zwei Kalenderdaten.
 *
 * @param {Date} von
 * @param {Date} bis
 * @param {import('../models/types').Calendar} kalender
 * @returns {number}
 */
export function arbeitstageZwischen(von, bis, kalender) {
  let count = 0;
  const totalDays = differenceInCalendarDays(bis, von);

  for (let i = 0; i <= totalDays; i++) {
    const tag = addDays(von, i);
    if (istArbeitstag(tag, kalender)) {
      count++;
    }
  }

  return count;
}

/**
 * Findet den nächsten Arbeitstag ab einem Datum (inklusiv).
 *
 * @param {Date} date
 * @param {import('../models/types').Calendar} kalender
 * @returns {Date}
 */
export function naechsterArbeitstag(date, kalender) {
  let current = new Date(date);
  while (!istArbeitstag(current, kalender)) {
    current = addDays(current, 1);
  }
  return current;
}
