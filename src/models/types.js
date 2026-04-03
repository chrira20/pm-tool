/**
 * Datenmodell-Definitionen für das PM-Tool
 * Basiert auf Masterprompt Abschnitt A (Entitäten A.1–A.6)
 *
 * Hinweis: Wir verwenden JSDoc-Typen statt TypeScript,
 * damit Claude Code ohne TS-Setup direkt arbeiten kann.
 */

import { v4 as uuidv4 } from 'uuid';

// ─── A.1 Projekt (Project) ────────────────────────────────────

/**
 * @typedef {Object} Project
 * @property {string} id - UUID
 * @property {string} name - Projektname
 * @property {string} beschreibung - Optionale Beschreibung
 * @property {string} startDatum - ISO-Date, geplanter Projektbeginn
 * @property {string|null} endDatum - ISO-Date, berechnet aus Netzplan
 * @property {Calendar} kalender - Arbeitstage, Feiertage, Betriebsferien
 * @property {'Planung'|'Aktiv'|'Pausiert'|'Abgeschlossen'} status
 * @property {string} erstelltAm - ISO-DateTime
 * @property {string} aktualisiertAm - ISO-DateTime
 * @property {Task[]} vorgaenge - Alle Vorgänge
 * @property {Dependency[]} abhaengigkeiten - Alle Abhängigkeiten
 * @property {Resource[]} ressourcen - Alle Ressourcen
 * @property {Assignment[]} zuordnungen - Alle Zuordnungen
 * @property {number} schemaVersion - Für Import/Export-Kompatibilität
 */

// ─── A.2 Vorgang (Task) ───────────────────────────────────────

/**
 * @typedef {Object} Task
 * @property {string} id - UUID
 * @property {string} projektId - FK zum Projekt
 * @property {string} pspCode - PSP-Code (z.B. "1.2.3")
 * @property {string} name - Vorgangsbezeichnung
 * @property {'Vorgang'|'Meilenstein'|'Sammelvorgang'} typ
 * @property {number} dauer - Geplante Dauer in Arbeitstagen
 * @property {'Tage'|'Stunden'} dauerEinheit
 * @property {string|null} fruehesterAnfang - FAZ (berechnet)
 * @property {string|null} fruehestesEnde - FEZ (berechnet)
 * @property {string|null} spaetesterAnfang - SAZ (berechnet)
 * @property {string|null} spaetestesEnde - SEZ (berechnet)
 * @property {number|null} gesamtpuffer - GP = SAZ - FAZ (berechnet)
 * @property {number|null} freierPuffer - FP (berechnet)
 * @property {boolean} istKritisch - true wenn GP = 0 (berechnet)
 * @property {boolean} istGate - true = Quality Gate (Meilenstein blockiert Nachfolger bis Freigabe)
 * @property {number} fortschritt - 0–100
 * @property {string|null} istStart - Tatsächlicher Starttermin
 * @property {string|null} istEnde - Tatsächlicher Endtermin
 * @property {string} notizen - Freitext
 * @property {string|null} elternId - ID des Sammelvorgangs
 * @property {number} sortierung - Reihenfolge innerhalb der Ebene
 */

// ─── A.3 Abhängigkeit (Dependency) ────────────────────────────

/**
 * @typedef {Object} Dependency
 * @property {string} id - UUID
 * @property {string} vorgaengerId - FK Vorgänger
 * @property {string} nachfolgerId - FK Nachfolger
 * @property {'EA'|'AA'|'EE'|'AE'} typ - Abhängigkeitstyp
 * @property {number} zeitversatz - Lag/Lead in Arbeitstagen
 */

// ─── A.4 Ressource (Resource) ─────────────────────────────────

/**
 * @typedef {Object} Resource
 * @property {string} id - UUID
 * @property {string} projektId - FK zum Projekt
 * @property {string} name - Bezeichnung
 * @property {'Arbeit'|'Material'|'Kosten'} typ
 * @property {number} kapazitaet - Stunden pro Arbeitstag
 * @property {number} kostenProStunde - Stundensatz
 * @property {string} farbe - Hex-Farbcode
 */

// ─── A.5 Ressourcenzuordnung (Assignment) ─────────────────────

/**
 * @typedef {Object} Assignment
 * @property {string} id - UUID
 * @property {string} vorgangId - FK zum Vorgang
 * @property {string} ressourceId - FK zur Ressource
 * @property {number} aufwand - Geplante Arbeitsstunden
 * @property {number} auslastung - 0–100%
 */

// ─── A.6 Kalender (Calendar) ──────────────────────────────────

/**
 * @typedef {Object} Calendar
 * @property {boolean[]} arbeitstage - 7 Einträge: Mo(0)–So(6)
 * @property {number} stundenProTag - Standard-Arbeitsstunden
 * @property {string[]} feiertage - ISO-Dates
 * @property {{von: string, bis: string}[]} betriebsferien
 */

// ─── Factory-Funktionen ───────────────────────────────────────

export function createProject(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: 'Neues Projekt',
    beschreibung: '',
    startDatum: new Date().toISOString().split('T')[0],
    endDatum: null,
    kalender: createDefaultCalendar(),
    status: 'Planung',
    erstelltAm: now,
    aktualisiertAm: now,
    vorgaenge: [],
    abhaengigkeiten: [],
    ressourcen: [],
    zuordnungen: [],
    schemaVersion: 1,
    ...overrides,
  };
}

export function createTask(projektId, overrides = {}) {
  return {
    id: uuidv4(),
    projektId,
    pspCode: '',
    name: 'Neuer Vorgang',
    typ: 'Vorgang',
    dauer: 1,
    dauerEinheit: 'Tage',
    fruehesterAnfang: null,
    fruehestesEnde: null,
    spaetesterAnfang: null,
    spaetestesEnde: null,
    gesamtpuffer: null,
    freierPuffer: null,
    istKritisch: false,
    istGate: false,
    fortschritt: 0,
    istStart: null,
    istEnde: null,
    notizen: '',
    elternId: null,
    sortierung: 0,
    ...overrides,
  };
}

export function createDependency(overrides = {}) {
  return {
    id: uuidv4(),
    vorgaengerId: '',
    nachfolgerId: '',
    typ: 'EA',
    zeitversatz: 0,
    ...overrides,
  };
}

export function createResource(projektId, overrides = {}) {
  return {
    id: uuidv4(),
    projektId,
    name: 'Neue Ressource',
    typ: 'Arbeit',
    kapazitaet: 8,
    kostenProStunde: 0,
    farbe: '#3B82F6',
    ...overrides,
  };
}

export function createAssignment(overrides = {}) {
  return {
    id: uuidv4(),
    vorgangId: '',
    ressourceId: '',
    aufwand: 8,
    auslastung: 100,
    ...overrides,
  };
}

export function createDefaultCalendar() {
  return {
    arbeitstage: [true, true, true, true, true, false, false], // Mo–Fr
    stundenProTag: 8,
    feiertage: [],
    betriebsferien: [],
  };
}
