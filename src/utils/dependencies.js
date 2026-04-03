/**
 * Abhängigkeits-Validierung für Fortschrittsänderungen
 *
 * Prüft ob ein Vorgang Fortschritt eintragen darf, wenn in seiner
 * gesamten Vorgänger-KETTE noch nicht alles abgeschlossen ist.
 * (Transitive Out-of-Sequence Detection)
 *
 * Orientiert sich am Primavera P6 "Flexible"-Modus:
 * Fortschritt wird zugelassen, aber mit Warnung angezeigt.
 */

/**
 * Sammelt ALLE transitiven Vorgänger eines Vorgangs.
 * Folgt der gesamten Abhängigkeitskette rückwärts + erbt vom Sammelvorgang.
 *
 * Beispiel: A → B → C → D
 * getAlleVorgaenger(D) = [C, B, A]
 *
 * @param {string} taskId
 * @param {Array} vorgaenge
 * @param {Array} abhaengigkeiten
 * @returns {Array<{id: string, name: string, fortschritt: number}>}
 */
export function getAlleVorgaengerTransitiv(taskId, vorgaenge, abhaengigkeiten) {
  const besucht = new Set();
  const ergebnis = [];

  function sammle(id) {
    if (besucht.has(id)) return;
    besucht.add(id);

    const task = vorgaenge.find(v => v.id === id);
    if (!task) return;

    // 1. Direkte Vorgänger aus Abhängigkeiten
    const deps = abhaengigkeiten.filter(d => d.nachfolgerId === id);
    for (const dep of deps) {
      const vorg = vorgaenge.find(v => v.id === dep.vorgaengerId);
      if (vorg && !besucht.has(vorg.id)) {
        ergebnis.push(vorg);
        sammle(vorg.id); // Rekursiv weiter zurück
      }
    }

    // 2. Geerbte Vorgänger vom Eltern-Sammelvorgang
    if (task.elternId) {
      const eltern = vorgaenge.find(v => v.id === task.elternId);
      if (eltern) {
        const elternDeps = abhaengigkeiten.filter(d => d.nachfolgerId === eltern.id);
        for (const dep of elternDeps) {
          const vorg = vorgaenge.find(v => v.id === dep.vorgaengerId);
          if (vorg && !besucht.has(vorg.id)) {
            ergebnis.push(vorg);
            sammle(vorg.id);
          }
        }
      }
    }
  }

  sammle(taskId);
  return ergebnis;
}

/**
 * Prüft ob ein Vorgang "Out-of-Sequence" ist — also Fortschritt > 0 hat,
 * obwohl irgendwo in seiner Vorgänger-Kette ein Vorgang unter 100% ist.
 *
 * @param {string} taskId
 * @param {Array} vorgaenge
 * @param {Array} abhaengigkeiten
 * @returns {{ outOfSequence: boolean, offeneVorgaenger: Array }}
 */
export function pruefeOutOfSequence(taskId, vorgaenge, abhaengigkeiten) {
  const task = vorgaenge.find(v => v.id === taskId);
  if (!task) return { outOfSequence: false, offeneVorgaenger: [] };
  if (task.typ === 'Sammelvorgang') return { outOfSequence: false, offeneVorgaenger: [] };

  const alleVorgaenger = getAlleVorgaengerTransitiv(taskId, vorgaenge, abhaengigkeiten);
  const offeneVorgaenger = alleVorgaenger
    .filter(v => v.fortschritt < 100 && v.typ !== 'Sammelvorgang')
    .map(v => ({ id: v.id, name: v.name, fortschritt: v.fortschritt }));

  return {
    outOfSequence: offeneVorgaenger.length > 0 && task.fortschritt > 0,
    offeneVorgaenger,
  };
}

/**
 * Prüft ob eine Fortschrittsänderung eine Out-of-Sequence-Warnung erzeugen soll.
 * Wird VOR dem Setzen des Fortschritts aufgerufen.
 */
export function pruefeFortschrittsAenderung(taskId, neuerFortschritt, vorgaenge, abhaengigkeiten) {
  if (neuerFortschritt === 0) {
    return { warnung: false, nachricht: '', offeneVorgaenger: [] };
  }

  const alleVorgaenger = getAlleVorgaengerTransitiv(taskId, vorgaenge, abhaengigkeiten);
  const offene = alleVorgaenger
    .filter(v => v.fortschritt < 100 && v.typ !== 'Sammelvorgang')
    .map(v => ({ id: v.id, name: v.name, fortschritt: v.fortschritt }));

  if (offene.length > 0) {
    // Nur den nächsten offenen Vorgänger in der Kette anzeigen (nicht alle)
    const naechster = offene[offene.length - 1]; // letzter = direktester
    const weitere = offene.length > 1 ? ` (+${offene.length - 1} weitere)` : '';
    return {
      warnung: true,
      nachricht: `Vorgänger offen: "${naechster.name}" (${naechster.fortschritt}%)${weitere}`,
      offeneVorgaenger: offene,
    };
  }

  return { warnung: false, nachricht: '', offeneVorgaenger: [] };
}

/**
 * Findet alle Vorgänge im Projekt die aktuell Out-of-Sequence sind.
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
    if (outOfSequence) oosTasks.add(v.id);
  }
  return oosTasks;
}
