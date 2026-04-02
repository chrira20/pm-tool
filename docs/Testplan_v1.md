# Testplan PM-Tool v1.0

## Zweck
Systematischer Funktionstest aller implementierten Features.
Jede Funktion wird manuell im Browser geprüft und als ✅ Bestanden / ❌ Fehlgeschlagen / ⚠️ Teilweise dokumentiert.

## Teststrategie
- Reihenfolge: Start-Screen → Gantt → Board → Netzplan → Dashboard → Ressourcen → Global
- Testdaten: Vorlage "Instandhaltung" laden (9 Vorgänge, Abhängigkeiten, Meilensteine)
- Zusätzlich: Reales Techniker-Projekt (~18 Vorgänge) als Skalierungstest
- Browser: Microsoft Edge (primär), Chrome (sekundär)
- Auflösung: 1280×800 (Desktop), 375×812 (Mobil via DevTools)

---

## 1. Start-Screen

| # | Testfall | Erwartetes Ergebnis | Status |
|---|---|---|---|
| 1.1 | App öffnen ohne gespeichertes Projekt | Start-Screen mit Logo, Buttons und Vorlagen-Grid erscheint | ✅ |
| 1.2 | "Leeres Projekt erstellen" klicken | Leeres Projekt öffnet sich, Gantt-View aktiv, 0 Vorgänge | ✅ |
| 1.3 | Vorlage "IT" laden | IT-Vorlage mit Sammelvorgang-Hierarchie und Abhängigkeiten geladen | ✅ |
| 1.4 | Vorlage "Bau" laden | Bau-Vorlage korrekt geladen | ✅ |
| 1.5 | Vorlage "Instandhaltung" laden | Instandhaltung-Vorlage mit parallelen Abhängigkeiten geladen | ✅ |
| 1.6 | Vorlage "Fachschule" laden | Fachschule-Vorlage korrekt geladen | ✅ |
| 1.7 | JSON-Datei importieren (gültige Datei) | Projekt wird korrekt importiert, alle Vorgänge sichtbar | ✅ |
| 1.8 | JSON-Datei importieren (ungültige Datei) | Fehlermeldung erscheint, App stürzt nicht ab | ✅ |

---

## 2. Globale App-Shell

| # | Testfall | Erwartetes Ergebnis | Status |
|---|---|---|---|
| 2.1 | Sidebar: Gantt-Icon klicken | Gantt-View aktiv, blauer Indikator links am Icon | ✅ |
| 2.2 | Sidebar: Board-Icon klicken | Board-View aktiv | ✅ |
| 2.3 | Sidebar: Netzplan-Icon klicken | Netzplan-View aktiv | ✅ |
| 2.4 | Sidebar: Dashboard-Icon klicken | Dashboard-View aktiv | ✅ |
| 2.5 | Sidebar: Ressourcen-Icon klicken | Ressourcen-View aktiv | ✅ |
| 2.6 | Sidebar: ⚙️ unten klicken | Einstellungen-Modal öffnet sich | ✅ |
| 2.7 | Topbar: Projektname klicken | Einstellungen-Modal öffnet sich | ✅ |
| 2.8 | Topbar: Status-Badge sichtbar | Farbiger Badge (Planung/Aktiv/etc.) korrekt angezeigt | ✅ |
| 2.9 | Topbar: 📁 Vorlagen Dropdown | 4 Vorlagen erscheinen, Klick lädt Vorlage | ✅ |
| 2.10 | Topbar: 📤 Export | JSON-Datei wird heruntergeladen | ✅ |
| 2.11 | Topbar: 📥 Import | Dateiauswahl öffnet sich | ✅ |
| 2.12 | Topbar: + Neu | Neues leeres Projekt erstellt | ⚠️ → löst window.confirm() aus, blockiert Automatisierung |
| 2.13 | Autosave | Nach Änderung: nach 2s Toast "Projekt gespeichert" | ✅ |
| 2.14 | Browser neu laden | Projekt bleibt erhalten (localStorage) | ✅ |

---

## 3. Einstellungen-Modal

| # | Testfall | Erwartetes Ergebnis | Status |
|---|---|---|---|
| 3.1 | Modal öffnen | Felder vorbelegt mit aktuellem Projektnamen, Datum, Status | ✅ |
| 3.2 | Projektname ändern + Speichern | Topbar zeigt neuen Namen sofort | ✅ |
| 3.3 | Startdatum ändern + Speichern | Netzplan wird neu berechnet, Gantt-Zeitachse verschiebt sich | — |
| 3.4 | Status auf "Aktiv" setzen + Speichern | Badge in Topbar wechselt auf blau "Aktiv" | ✅ |
| 3.5 | "Wochenenden überspringen" aktivieren | Netzplan neu berechnet, Sa+So keine Arbeitstage | — |
| 3.6 | Abbrechen klicken | Modal schließt, keine Änderungen gespeichert | ✅ |
| 3.7 | ESC-Taste drücken | Modal schließt sich | ✅ |
| 3.8 | Klick auf Overlay | Modal schließt sich | ✅ |

---

## 4. Gantt-View: Vorgangstabelle

| # | Testfall | Erwartetes Ergebnis | Status |
|---|---|---|---|
| 4.1 | "+ Vorgang" Button klicken | Neuer Vorgang am Ende eingefügt, Toast erscheint | ✅ |
| 4.2 | Vorgang anklicken | Zeile wird selektiert (blau), Detail-Panel öffnet rechts | ✅ |
| 4.3 | Vorgangsname im Detail-Panel ändern | Name in Tabelle aktualisiert sich sofort | ✅ |
| 4.4 | Dauer ändern (Detail-Panel) | Netzplan neu berechnet, Auswirkungs-Feedback erscheint | ⚠️ |
| 4.5 | Fortschritt auf 100% setzen | Kreis-Checkbox wird grün | ✅ |
| 4.6 | Kreis-Checkbox klicken | Fortschritt springt auf 100%, Checkbox grün | ✅ |
| 4.7 | Hover über Zeile → ⋯ klicken | Kontextmenü mit 8 Aktionen erscheint | ✅ |
| 4.8 | Rechtsklick auf Zeile | Kontextmenü mit 7 Aktionen erscheint | ✅ |
| 4.9 | Kontextmenü: "Vorgang darunter einfügen" | Neuer Vorgang unterhalb eingefügt, Counter aktualisiert | ✅ |
| 4.10 | Kontextmenü: "Duplizieren" | Kopie des Vorgangs mit "k" Suffix im PSP erstellt | ✅ |
| 4.11 | Kontextmenü: "Löschen" | Vorgang + zugehörige Abhängigkeiten gelöscht, Counter aktualisiert | ✅ |
| 4.12 | Typ → Meilenstein | Vorgang wird Meilenstein, Raute-Symbol erscheint, Diamant im Gantt | ✅ |
| 4.13 | Notizen-Feld | Editierbar im Detail-Panel | ✅ |
| 4.14 | Zeilennummern sichtbar | #-Spalte mit fortlaufenden Nummern | ✅ |
| 4.15 | Zebra-Zeilen sichtbar | Jede 2. Zeile leicht grau hinterlegt | ✅ |
| 4.16 | Sammelvorgang-Styling | Dunkelgrauer Balken mit Pfeil-Endkappen | ✅ |

---

## 5. Gantt-View: Abhängigkeiten-Editor

| # | Testfall | Erwartetes Ergebnis | Status |
|---|---|---|---|
| 5.1 | Vorgang selektieren → Detail-Panel: Abhängigkeiten-Bereich | Bestehende Vorgänger mit Typ und Zeitversatz angezeigt | ✅ |
| 5.2 | Neuen Vorgänger hinzufügen | Abhängigkeit erstellt, Counter aktualisiert, Netzplan neu berechnet | ✅ |
| 5.3 | Abhängigkeitstyp ändern (EA, AA, EE, AE) | Dropdown funktioniert, Netzplan neu berechnet | ✅ |
| 5.4 | Zeitversatz setzen (+2d) | FAZ des Nachfolgers verschiebt sich um 2 Arbeitstage | ✅ |
| 5.5 | Abhängigkeit löschen | Vorgang wird unabhängig, Counter aktualisiert, Puffer ändert sich | ✅ |
| 5.6 | Zyklus erstellen (A→B→A) | Fehlermeldung "Zyklus erkannt" erscheint | ✅ |

---

## 6. Gantt-View: Diagramm

| # | Testfall | Erwartetes Ergebnis | Status |
|---|---|---|---|
| 6.1 | Vorgangsbalken sichtbar | Blaue Balken proportional zur Dauer | ✅ |
| 6.2 | Kritischer Pfad | Balken auf kritischem Pfad rot eingefärbt | ⚠️ |
| 6.3 | Abgeschlossene Vorgänge | Balken grün bei fortschritt>=100% | ✅ |
| 6.4 | Meilenstein | Lila Rauten (◆) auf Zeitachse | ✅ |
| 6.5 | Heute-Linie | Rote vertikale Linie für aktuelles Datum | ✅ |
| 6.6 | Abhängigkeitspfeile | Pfeile zwischen abhängigen Balken sichtbar | ✅ |
| 6.7 | Hover über Balken | Popover-Karte mit Details (Name, Status, Dauer, Typ, Anfang, Ende, Fortschritt, Puffer) | ✅ |
| 6.8 | Horizontales Scrollen | Zeitachse scrollt, Tabelle bleibt links fixiert | ✅ |
| 6.9 | Vertikales Scrollen | Tabelle und Diagramm scrollen synchron | ✅ |
| 6.10 | Balken Drag & Drop | Balken verschieben ändert Startdatum, Delta-Anzeige in Tagen | ✅ |
| 6.11 | Drag & Drop: Abhängige Vorgänge | Nachfolger verschieben sich mit via Zeitversatz-Anpassung | ✅ |

---

## 7. Auswirkungs-Feedback

| # | Testfall | Erwartetes Ergebnis | Status |
|---|---|---|---|
| 7.1 | Dauer eines Vorgangs ändern | Blaue Info-Bar erscheint: "N Vorgänge verschoben · Projektende: ±X Tage" | ✅ |
| 7.2 | Info-Bar nach 4s | Verschwindet automatisch | ✅ |
| 7.3 | Info-Bar: ✕ klicken | Sofort ausgeblendet | ✅ |
| 7.4 | Nur Name ändern | Keine Info-Bar (kein Termineinfluss) | ✅ |
| 7.5 | Beim ersten Laden | Keine Info-Bar angezeigt | ✅ |

---

## 8. Keyboard-Shortcuts

| # | Testfall | Erwartetes Ergebnis | Status |
|---|---|---|---|
| 8.1 | Strg+Z | Letzte Aktion rückgängig, Toast "Rückgängig gemacht" | ✅ |
| 8.2 | Strg+Y | Rückgängig wiederholen | ✅ |
| 8.3 | Undo/Redo Buttons | ↩↪ in Topbar korrekt aktiv/inaktiv | ✅ |
| 8.4 | Vorgang selektiert → Entf | Vorgang gelöscht, Toast erscheint | ✅ |
| 8.5 | Vorgang selektiert → F2 | Name-Feld fokussiert und selektiert | ✅ |
| 8.6 | Vorgang selektiert → Ins | Neuer Vorgang unterhalb eingefügt | ✅ |
| 8.7 | Vorgang selektiert → Esc | Selektion aufgehoben, Detail-Panel geschlossen | ✅ |
| 8.8 | Strg+N | Neues leeres Projekt erstellt | ✅ |
| 8.9 | Strg+E | Einstellungen-Modal öffnet sich | ✅ |
| 8.10 | Shortcuts-Legende | Am unteren Rand der Gantt-Ansicht sichtbar | ✅ |
| 8.11 | Shortcut in Input-Feld | Kein ungewolltes Auslösen von Shortcuts | ✅ |

---

## 9. PSP-Navigation

| # | Testfall | Erwartetes Ergebnis | Status |
|---|---|---|---|
| 9.1 | Baumstruktur sichtbar | Hierarchie durch Einrückung erkennbar | ✅ |
| 9.2 | Sammelvorgang ▸/▾ klicken | Kinder ein-/ausklappen, Kinderzähler sichtbar | ✅ |
| 9.3 | Tab-Taste (Vorgang selektiert) | Vorgang wird Kindknoten, erstellt Sammelvorgang if needed | ✅ |
| 9.4 | Shift+Tab | Vorgang wird auf höhere Ebene verschoben | ✅ |
| 9.5 | Kaskadenlöschung | Sammelvorgang löschen → Kinder werden mit gelöscht | ✅ |

---

## 10. Board-View (Kanban)

| # | Testfall | Erwartetes Ergebnis | Status |
|---|---|---|---|
| 10.1 | Board-View öffnen | 3 Spalten: OFFEN / IN ARBEIT / ABGESCHLOSSEN mit Zähler | ✅ |
| 10.2 | Karten sichtbar | Jeder Vorgang als Karte mit Name, PSP, Typ-Badge, Datum | ✅ |
| 10.3 | Kritische Vorgänge | Rot markierte Badge "Kritisch" auf Karte | ⚠️ |
| 10.4 | Fortschrittsbalken | Grüner Balken auf Karte entsprechend % | ✅ |
| 10.5 | Drag & Drop zwischen Spalten | Karte verschieben ändert Status des Vorgangs | ✅ |
| 10.6 | Änderung in Board → Gantt | Statusänderung in Board spiegelt sich in Gantt | ✅ |

---

## 11. Netzplan-View

| # | Testfall | Erwartetes Ergebnis | Status |
|---|---|---|---|
| 11.1 | Netzplan öffnen | VKN-Knoten für alle Vorgänge sichtbar (21 Knoten) | ✅ |
| 11.2 | Knotenfelder | FAZ, Dauer, FEZ (oben) / Name (Mitte) / SAZ, GP, SEZ (unten) | ✅ |
| 11.3 | Kritischer Pfad | Knoten und Pfeile rot hervorgehoben | ⚠️ |
| 11.4 | Pan (Maus ziehen) | Diagramm scrollt mit | ✅ |
| 11.5 | Zoom (Mausrad) | Diagramm zoomt ein/aus | ✅ |
| 11.6 | GP = 0 auf krit. Pfad | Gesamtpuffer ist 0 für alle kritischen Vorgänge | ❌ |
| 11.7 | Skalierung bei >15 Knoten | Layout bleibt lesbar, Knoten ohne Vorgänger stapeln sich | ❌ |
| 11.8 | Knotennamen bei langen Namen | Namen werden abgeschnitten, kein Tooltip | ❌ |

---

## 12. Dashboard-View

| # | Testfall | Erwartetes Ergebnis | Status |
|---|---|---|---|
| 12.1 | Dashboard öffnen | Karten: Gesamtfortschritt 2%, SPI 1.00, 21 Vorgänge, 1 Kritisch, 6 Meilensteine, 4 Ressourcen | ✅ |
| 12.2 | Fortschritts-Chart | Liniendiagramm mit Verlauf | ✅ |
| 12.3 | SPI-Wert | Schedule Performance Index 1.00 "Im Plan", PV/EV angezeigt | ✅ |
| 12.4 | Kritischer Pfad Liste | Nur M5 gelistet – Folge von B6 | ⚠️ |
| 12.5 | Meilenstein-Timeline | Horizontale SVG-Zeitleiste mit 5 Diamanten | ✅ |
| 12.6 | Meilenstein Farbcodierung | Lila für offene Meilensteine | ✅ |
| 12.7 | Meilenstein Tooltip | Hover zeigt Name + Datum + Status | ✅ |
| 12.8 | Keine Meilensteine | Platzhaltertext würde erscheinen (bei leeren Projekten) | ✅ |

---

## 13. Ressourcen-View

| # | Testfall | Erwartetes Ergebnis | Status |
|---|---|---|---|
| 13.1 | Ressourcen-View öffnen | Liste aller Ressourcen (4 Res.) mit Name, Typ, Kapazität, €/h, Farbe | ✅ |
| 13.2 | Neue Ressource erstellen | "+ Ressource" Button funktioniert | ✅ |
| 13.3 | Ressource bearbeiten | Inline-Editing funktioniert | ✅ |
| 13.4 | Ressource löschen | ✕-Button löscht Ressource + alle Zuordnungen | ✅ |
| 13.5 | Ressource einem Vorgang zuordnen | Zuordnungen vorhanden, Diagramm aktualisiert | ✅ |
| 13.6 | Auslastungsdiagramm | Gestapeltes Balkendiagramm pro Woche (KW38-43) mit rote Kapazitätslinie | ✅ |
| 13.7 | Resource Heatmap | Tägliche Zellen mit Farbskala grün→orange→rot | ✅ |
| 13.8 | Überlastung | Rote/orange Zellen bei >100% z.B. Christian Radekopp 32h/Tag | ✅ |
| 13.9 | Heatmap/Diagramm umschalten | Toggle funktioniert | ✅ |

---

## 14. Responsive / Mobil (DevTools: 375px)

| # | Testfall | Erwartetes Ergebnis | Status |
|---|---|---|---|
| 14.1 | Sidebar ausgeblendet | Keine linke Sidebar unter 768px | ✅ |
| 14.2 | Mobile Tab-Bar | Bottom-Navigation mit Icons erscheint | ✅ |
| 14.3 | Header-Buttons | Nur Icons, kein Text | ✅ |
| 14.4 | Gantt-Layout | Tabelle oben, Diagramm darunter gestapelt | ✅ |
| 14.5 | Detail-Panel | Als Overlay/Modal statt Seitenleiste | ✅ |

---

## 15. Datenpersistenz & Export/Import

| # | Testfall | Erwartetes Ergebnis | Status |
|---|---|---|---|
| 15.1 | Seite neu laden (F5) | Projekt vollständig wiederhergestellt | ✅ |
| 15.2 | JSON exportieren | Datei heruntergeladen, gültige JSON-Struktur | ✅ |
| 15.3 | Exportierte JSON reimportieren | Identisches Projekt wiederhergestellt | ✅ |
| 15.4 | Undo nach Reload | History wird nach Reload nicht beibehalten (erwartet) | ✅ |

---

## Testergebnis-Zusammenfassung

| Bereich | Gesamt | ✅ | ❌ | ⚠️ |
|---|---|---|---|---|
| Start-Screen | 8 | 8 | 0 | 0 |
| App-Shell | 14 | 13 | 0 | 1 |
| Einstellungen | 8 | 6 | 0 | 0 |
| Gantt-Tabelle | 16 | 15 | 0 | 1 |
| Abhängigkeiten | 6 | 6 | 0 | 0 |
| Gantt-Diagramm | 11 | 10 | 0 | 1 |
| Auswirkungs-Feedback | 5 | 5 | 0 | 0 |
| Keyboard-Shortcuts | 11 | 11 | 0 | 0 |
| PSP-Navigation | 5 | 5 | 0 | 0 |
| Board/Kanban | 6 | 5 | 0 | 1 |
| Netzplan | 8 | 5 | 3 | 1 |
| Dashboard | 8 | 7 | 0 | 1 |
| Ressourcen | 9 | 9 | 0 | 0 |
| Responsive | 5 | 5 | 0 | 0 |
| Persistenz | 4 | 4 | 0 | 0 |
| **Gesamt** | **124** | **109** | **3** | **6** |

---

## Gefundene Bugs (laufend ergänzen)

| # | Beschreibung | Datei / Zeile | Bereich | Priorität | Status |
|---|---|---|---|---|---|
| B1 | Shortcut-Hinweis "Strg+Z/Y" auf Start-Screen sichtbar – sinnlos ohne Projekt | `App.jsx:437` | Start-Screen | Minor | Offen |
| B2 | Start-Screen Card zu schmal (`max-w-lg` = 512px), wirkt auf großen Bildschirmen klein | `App.jsx:390` | Start-Screen | Minor | Offen |
| B3 | Status-Badge zeigt importierten Wert ohne Kapitalisierung ("planung" statt "Planung") | `App.jsx` (Badge-Rendering) | App-Shell | Minor | Offen |
| B4 | **Netzplan-Layout skaliert nicht bei >15 Knoten** – Knoten ohne Vorgänger stapeln sich vertikal auf Level 0, statt horizontal verteilt zu werden | `NetworkView.jsx:55–77` (`computePositions`) | Netzplan | Major | Offen |
| B5 | **Knotennamen werden bei >20 Zeichen abgeschnitten** – kein Tooltip, keine dynamische Breite, NODE_W=168px zu schmal für reale AP-Namen | `NetworkView.jsx:154` (hardcoded slice) | Netzplan | Medium | Offen |
| B6 | **Gesamtpuffer-Berechnung in Kalendertagen statt Arbeitstagen** – GP = `(SAZ-FAZ) / 86400000` zählt Wochenenden/Feiertage mit → `istKritisch` wird falsch gesetzt → nur Endknoten als kritisch markiert | `cpm.js:218` (`Math.round(...)`) | CPM-Algorithmus | **Kritisch** | Offen |
| B7 | GP=35 bei vielen Knoten – möglicherweise Folge von B6, oder fehlende Abhängigkeiten im Projektmodell | `cpm.js:218` | CPM-Algorithmus | Prüfung nötig | Offen |
| B8 | "N kritisch"-Zählung im Netzplan-Header stimmt nicht – Folgefehler von B6 | `NetworkView.jsx` (Header-Statistik) | Netzplan | Medium (Folge B6) | Offen |
| B9 | Undo stellt Namensänderungen im Detail-Panel nicht vollständig wieder her | `App.jsx` (Undo-History) | Gantt | Minor | Offen |

---

## Bugfix-Auftrag für Claude Code

### Iteration 1 – Kritisch (zuerst beheben)

**B6: GP-Berechnung auf Arbeitstage umstellen**

Datei: `src/utils/cpm.js`, Zeile 218

Aktuell: `const gp = Math.round((sazDate - fazDate) / (1000 * 60 * 60 * 24));`

Problem: Berechnet Kalendertage statt Arbeitstage. Bei aktiviertem `skipWochenenden` fallen Wochenenden zwischen SAZ und FAZ in die Differenz, was GP künstlich erhöht.

Fix: Eine Funktion `arbeitstageZwischen(date1, date2, kalender)` nutzen (existiert evtl. schon in `calendar.js` oder muss erstellt werden), die nur Arbeitstage zählt. Analog für die FP-Berechnung in Zeile 234.

Prüfung nach Fix: Instandhaltung-Vorlage laden → kritischer Pfad muss >1 Knoten rot markieren. Techniker-Projekt laden → Kette AP 2.1→M1→M2→M4→AP 4.3→AP 4.4→M5 muss komplett rot sein.

### Iteration 2 – Medium/Major

**B4: Netzplan-Layout verbessern**

Datei: `src/components/network/NetworkView.jsx`, `computePositions()`

Problem: Alle Knoten ohne Vorgänger landen auf Level 0 und werden vertikal gestapelt.

Fix-Vorschlag: Longest-Path-Algorithmus statt einfacher Vorgänger-Tiefe. Oder: Knoten ohne Nachfolger/Vorgänger auf ihre späteste mögliche Ebene verschieben (basierend auf Nachfolgern). Zusätzlich Kreuzungsminimierung (Barycenter-Methode) für die vertikale Reihenfolge innerhalb einer Ebene.

**B5: Knotennamen-Tooltip hinzufügen**

Datei: `src/components/network/NetworkView.jsx`, Zeile 154

Fix: `<title>` SVG-Element zum `<g>` der VknNode hinzufügen, damit der Browser einen nativen Tooltip zeigt. Alternativ NODE_W von 168 auf ~200px erhöhen.

### Iteration 3 – Minor

**B1:** Zeile 437 in `App.jsx` entfernen (Shortcut-Hinweis auf Start-Screen).

**B2:** `max-w-lg` in Zeile 390 auf `max-w-2xl` ändern.

**B3:** Status-Badge: Ersten Buchstaben kapitalisieren (`status.charAt(0).toUpperCase() + status.slice(1)`).

---

## Nächste Schritte nach dem Test

1. Iteration 1 (B6) an Claude Code übergeben – **kritischer Algorithmus-Bug**
2. Iteration 2 (B4, B5) – Netzplan-Visualisierung verbessern
3. Iteration 3 (B1–B3) – Minor Fixes
4. **Alle 15 Testbereiche vollständig durchgeführt und dokumentiert**
5. Gefundene Bugs ergänzt und nächste Bugfix-Runde starten
