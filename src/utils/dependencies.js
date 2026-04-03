/**
 * Abhängigkeits-Validierung für Fortschrittsänderungen
 *
 * Prüft ob ein Vorgang Fortschritt eintragen darf, wenn seine Vorgänger
 * noch nicht abgeschlossen sind (Out-of-Sequence Detection).
 *
 * Orientiert sich am Primavera P6 "Flexible"-Modus:
 * Fortschritt wird zugelassen, aber mit Warnung angezeigt.
 */

/**
 * Sammelt ALLE Vorgänger eines Vorgangs (direkte + geerbte vom Sammelvorgang).
 * Wenn der Vorgang ein Kind eines Sammelvorgangs ist und der Sammelvorgang
 * eigene Vorgänger hat, erben die Kinder diese Abhängigkeiten.
 *
 * @param {string} taskId - ID des Vorgangs
 * @param {Array} vorgaenge - Alle Vorgänge
 * @param {Array} abhaengigkeiten - Alle Abhängigkeiten
 * @returns {Array<{dep: Object, vorgaenger: Object, geerbt: boolean}>}
 */
export function getEffektiveVorgaenger(taskId, vorgaenge, abhaengigkeiten) {
  const task = vorgaenge.find(v => v.id === taskId);
  if (!task) return [];

  const result = [];

  // 1. Direkte Vorgänger
  const direkteDeps = abhaengigkeiten.filter(d => d.nachfolgerId === taskId);
  for (const dep of direkteDeps) {
    const vorgaenger = vorgaenge.find(v => v.id === dep.vorgaengerId);
    if (vorgaenger) {
      result.push({ dep, vorgaenger, geerbt: false });
    }
  }

  // 2. Geerbte Vorgänger vom Eltern-Sammelvorgang (rekursiv)
  let current = task;
  while (current.elternId) {
    const eltern = vorgaenge.find(v => v.id === current.elternId);
    if (!eltern) break;

    const elternDeps = abhaengigkeiten.filter(d => d.nachfolgerId === eltern.id);
    for (const dep of elternDeps) {
      const vorgaenger = vorgaenge.find(v => v.id === dep.vorgaengerId);
      if (vorgaenger) {
        // Nur hinzufügen wenn nicht schon durch direkte Deps abgedeckt
        const bereitsVorhanden = result.some(r => r.vorgaenger.id === vorgaenger.id);
        if (!bereitsVorhanden) {
          result.push({ dep, vorgaenger, geerbt: true });
        }
      }
    }

    current = eltern;
  }

  return result;
}

/**
 * Prüft ob ein Vorgang "Out-of-Sequence" ist — also Fortschritt > 0 hat,
 * obwohl mindestens ein (effektiver) Vorgänger noch nicht bei 100% ist.
 *
 * @param {string} taskId
 * @param {Array} vorgaenge
 * @param {Array} abhaengigkeiten
 * @returns {{ outOfSequence: boolean, offeneVorgaenger: Array<{name: string, fortschritt: number, geerbt: boolean}> }}
 */
export function pruefeOutOfSequence(taskId, vorgaenge, abhaengigkeiten) {
  const task = vorgaenge.find(v => v.id === taskId);
  if (!task) return { outOfSequence: false, offeneVorgaenger: [] };

  // Sammelvorgänge selbst nicht prüfen (ihr Fortschritt ist berechnet)
  if (task.typ === 'Sammelvorgang') return { outOfSequence: false, offeneVorgaenger: [] };

  const effektive = getEffektiveVorgaenger(taskId, vorgaenge, abhaengigkeiten);
  const offeneVorgaenger = [];

  for (const { vorgaenger, geerbt } of effektive) {
    // Prüfe ob der Vorgänger (oder seine Kinder bei Sammelvorgang) abgeschlossen ist
    let vorgaengerFortschritt;
    if (vorgaenger.typ === 'Sammelvorgang') {
      // Sammelvorgang: Prüfe den berechneten Gesamtfortschritt
      vorgaengerFortschritt = vorgaenger.fortschritt;
    } else {
      vorgaengerFortschritt = vorgaenger.fortschritt;
    }

    if (vorgaengerFortschritt < 100) {
      offeneVorgaenger.push({
        id: vorgaenger.id,
        name: vorgaenger.name,
        fortschritt: vorgaengerFortschritt,
        geerbt,
      });
    }
  }

  return {
    outOfSequence: offeneVorgaenger.length > 0 && task.fortschritt > 0,
    offeneVorgaenger,
  };
}

/**
 * Prüft ob eine Fortschrittsänderung eine Out-of-Sequence-Warnung erzeugen soll.
 * Wird VOR dem Setzen des Fortschritts aufgerufen.
 *
 * @param {string} taskId
 * @param {number} neuerFortschritt
 * @param {Array} vorgaenge
 * @param {Array} abhaengigkeiten
 * @returns {{ warnung: boolean, nachricht: string, offeneVorgaenger: Array }}
 */
export function pruefeFortschrittsAenderung(taskId, neuerFortschritt, vorgaenge, abhaengigkeiten) {
  // Kein Check nötig wenn Fortschritt auf 0 zurückgesetzt wird
  if (neuerFortschritt === 0) {
    return { warnung: false, nachricht: '', offeneVorgaenger: [] };
  }

  const { offeneVorgaenger } = pruefeOutOfSequence(taskId, vorgaenge, abhaengigkeiten);

  // Wenn der Task selbst noch keinen Fortschritt hat, aber wir ihn setzen wollen,
  // müssen wir prüfen ob Vorgänger offen sind
  if (offeneVorgaenger.length === 0) {
    // Nochmal direkt prüfen (für den Fall dass der Task noch 0% hat)
    const effektive = getEffektiveVorgaenger(taskId, vorgaenge, abhaengigkeiten);
    const offene = effektive
      .filter(({ vorgaenger }) => vorgaenger.fortschritt < 100)
      .map(({ vorgaenger, geerbt }) => ({
        id: vorgaenger.id,
        name: vorgaenger.name,
        fortschritt: vorgaenger.fortschritt,
        geerbt,
      }));

    if (offene.length > 0) {
      const namen = offene.map(v => `"${v.name}" (${v.fortschritt}%)`).join(', ');
      const geerbteHinweis = offene.some(v => v.geerbt) ? ' (geerbt vom Sammelvorgang)' : '';
      return {
        warnung: true,
        nachricht: `Vorgänger noch nicht abgeschlossen: ${namen}${geerbteHinweis}`,
        offeneVorgaenger: offene,
      };
    }
  }

  if (offeneVorgaenger.length > 0) {
    const namen = offeneVorgaenger.map(v => `"${v.name}" (${v.fortschritt}%)`).join(', ');
    return {
      warnung: true,
      nachricht: `Vorgänger noch nicht abgeschlossen: ${namen}`,
      offeneVorgaenger,
    };
  }

  return { warnung: false, nachricht: '', offeneVorgaenger: [] };
}

/**
 * Findet alle Vorgänge im Projekt die aktuell Out-of-Sequence sind.
 * Für die visuelle Kennzeichnung in der Gantt-Tabelle und im Board.
 *
 * @param {Array} vorgaenge
 * @param {Array} abhaengigkeiten
 * @returns {Set<string>} Set von Task-IDs die Out-of-Sequence sind
 */
export function findeOutOfSequenceVorgaenge(vorgaenge, abhaengigkeiten) {
  const oosTasks = new Set();

  for (const v of vorgaenge) {
    if (v.typ === 'Sammelvorgang' || v.fortschritt === 0) continue;
    const { outOfSequence } = pruefeOutOfSequence(v.id, vorgaenge, abhaengigkeiten);
    if (outOfSequence) {
      oosTasks.add(v.id);
    }
  }

  return oosTasks;
}
