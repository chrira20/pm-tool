/**
 * Datenhaltung & Persistenz (Masterprompt Abschnitt D)
 *
 * Abstraktionsschicht für Storage. Verwendet localStorage als Fallback,
 * da window.storage (Persistent Storage API) nur im Claude-Artifact verfügbar ist.
 * In Claude Code / lokaler Entwicklung: localStorage.
 */

const KEYS = {
  PROJEKTE: 'pm-projekte',
  PROJEKT: (id) => `pm-projekt:${id}`,
  EINSTELLUNGEN: 'pm-einstellungen',
};

/**
 * Speichert einen Wert unter einem Schlüssel.
 */
export async function speichern(key, value) {
  try {
    const json = JSON.stringify(value);
    localStorage.setItem(key, json);
  } catch (err) {
    console.error('Fehler beim Speichern:', key, err);
  }
}

/**
 * Lädt einen Wert aus dem Storage.
 */
export async function laden(key) {
  try {
    const json = localStorage.getItem(key);
    return json ? JSON.parse(json) : null;
  } catch (err) {
    console.error('Fehler beim Laden:', key, err);
    return null;
  }
}

/**
 * Löscht einen Schlüssel.
 */
export async function loeschen(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Fehler beim Löschen:', key, err);
  }
}

// ─── Projekt-spezifische Funktionen ───────────────────────────

export async function ladeProjektliste() {
  return (await laden(KEYS.PROJEKTE)) || [];
}

export async function speichereProjektliste(liste) {
  await speichern(KEYS.PROJEKTE, liste);
}

export async function ladeProjekt(id) {
  return await laden(KEYS.PROJEKT(id));
}

export async function speichereProjekt(projekt) {
  await speichern(KEYS.PROJEKT(projekt.id), projekt);

  // Projektliste aktualisieren
  const liste = await ladeProjektliste();
  const index = liste.findIndex((p) => p.id === projekt.id);
  const meta = {
    id: projekt.id,
    name: projekt.name,
    status: projekt.status,
    startDatum: projekt.startDatum,
    aktualisiertAm: new Date().toISOString(),
  };

  if (index >= 0) {
    liste[index] = meta;
  } else {
    liste.push(meta);
  }

  await speichereProjektliste(liste);
}

export async function loescheProjekt(id) {
  await loeschen(KEYS.PROJEKT(id));
  const liste = await ladeProjektliste();
  await speichereProjektliste(liste.filter((p) => p.id !== id));
}

export async function ladeEinstellungen() {
  return (await laden(KEYS.EINSTELLUNGEN)) || {
    letztesProjektId: null,
    letzteAnsicht: 'gantt',
  };
}

export async function speichereEinstellungen(einstellungen) {
  await speichern(KEYS.EINSTELLUNGEN, einstellungen);
}

// ─── JSON Export/Import (D.2) ─────────────────────────────────

export function exportProjektAlsJSON(projekt) {
  const json = JSON.stringify(projekt, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  const datum = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `${projekt.name.replace(/\s+/g, '_')}_${datum}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

export async function importProjektAusJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projekt = JSON.parse(e.target.result);

        // Validierung
        if (!projekt.name || !projekt.vorgaenge || !projekt.schemaVersion) {
          reject(new Error('Ungültiges Projektformat: Pflichtfelder fehlen.'));
          return;
        }

        // Referenzintegrität prüfen
        const vorgangIds = new Set(projekt.vorgaenge.map((v) => v.id));
        for (const dep of projekt.abhaengigkeiten || []) {
          if (!vorgangIds.has(dep.vorgaengerId) || !vorgangIds.has(dep.nachfolgerId)) {
            reject(new Error(`Referenzfehler: Abhängigkeit ${dep.id} verweist auf nicht existierenden Vorgang.`));
            return;
          }
        }

        resolve(projekt);
      } catch (err) {
        reject(new Error('JSON-Datei konnte nicht gelesen werden: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'));
    reader.readAsText(file);
  });
}
