# PM-Tool – Projektmanagement-Tool (MS Project Alternative)

## Projektübersicht

Dieses Projekt ist ein webbasiertes Projektmanagement-Tool, das die Kernfunktionen von Microsoft Project in einer React-Anwendung nachbildet. Die vollständige Spezifikation liegt im Masterprompt (siehe unten).

## Tech-Stack

- **Framework:** React 19 mit Vite 8
- **Styling:** Tailwind CSS 4 (via @tailwindcss/vite Plugin)
- **Diagramme:** SVG (Gantt, Netzplan), recharts (Dashboard-Charts, Ressourcen-Auslastung)
- **Utilities:** lodash, date-fns, uuid
- **Storage:** localStorage (Fallback für Persistent Storage API)
- **Sprache:** JavaScript (JSDoc für Typisierung)

## Projektstruktur

```
pm-tool/
├── src/
│   ├── components/
│   │   ├── gantt/          # Gantt-Ansicht (Vorgangstabelle + Diagramm)
│   │   ├── resources/      # Ressourcen-Ansicht + Auslastungsdiagramm
│   │   ├── network/        # Netzplandiagramm (VKN nach DIN 69900)
│   │   ├── board/          # Kanban-Board-Ansicht (D3)
│   │   ├── dashboard/      # Projektübersicht, SPI, Meilensteine
│   │   └── common/         # Gemeinsame UI-Komponenten
│   ├── hooks/              # Custom React Hooks
│   ├── models/
│   │   └── types.js        # Datenmodell (6 Entitäten) + Factory-Funktionen
│   ├── stores/             # State-Management (falls benötigt)
│   ├── utils/
│   │   ├── calendar.js     # Kalenderlogik (Arbeitstage, Feiertage)
│   │   ├── cpm.js          # CPM-Algorithmus (Netzplanberechnung)
│   │   ├── eva.js          # Earned-Value-Analyse
│   │   ├── hierarchy.js    # PSP-Baumstruktur (buildTree, flattenTree, ein-/ausrücken)
│   │   ├── resources.js    # Ressourcen-Auslastungsberechnung
│   │   └── storage.js      # Persistenz (localStorage + JSON Export/Import)
│   ├── App.jsx             # Hauptkomponente mit Tab-Navigation
│   ├── App.css             # (leer – Tailwind via index.css)
│   ├── index.css           # Tailwind-Import + CSS Custom Properties
│   └── main.jsx            # React-Entry-Point
├── CLAUDE.md               # Diese Datei
├── package.json
└── vite.config.js
```

## Design-Brief

Die vollständige Design-Spezifikation für den v2-Refresh liegt unter:
**`docs/Design-Brief_v2.md`**

Enthält: CSS Design-Tokens, Layout-Struktur (Sidebar + Topbar), Tabellen-Upgrades,
Typografie, Iterationsplan (D1 → D2 → D3) und Constraints.

## Masterprompt-Referenz

Die vollständige Funktionsspezifikation liegt unter:
**`docs/Masterprompt_PM-Tool_v1_0.md`** (im Cowork-Projekt)

Falls nicht direkt erreichbar, hier die Kern-Abschnitte:
- **Abschnitt A:** Datenmodell (6 Entitäten: Project, Task, Dependency, Resource, Assignment, Calendar) → implementiert in `src/models/types.js`
- **Abschnitt B:** Algorithmen (CPM, Kalenderlogik, Sammelvorgangs-Aggregation, Ressourcen-Auslastung, EVA) → implementiert in `src/utils/`
- **Abschnitt C:** UI-Architektur (4 Ansichten: Gantt, Ressourcen, Netzplan, Dashboard) → Grundgerüst in `src/components/`
- **Abschnitt D:** Datenhaltung (localStorage + JSON Export/Import) → implementiert in `src/utils/storage.js`
- **Abschnitt E:** UI-Design-Vorgaben (Farbsystem, Typografie, Layout) → CSS Custom Properties in `src/index.css`
- **Abschnitt F:** Projektvorlagen (Instandhaltung, IT, Bau, Fachschule)

## Implementierungsstatus

### Fertig
- [x] Datenmodell mit Factory-Funktionen
- [x] CPM-Algorithmus (Topologische Sortierung, Vorwärts-/Rückwärtsrechnung, Puffer, Zykluserkennung)
- [x] Kalenderlogik (Arbeitstage, Feiertage, Betriebsferien)
- [x] Earned-Value-Analyse (PV, EV, SPI)
- [x] Ressourcen-Auslastungsberechnung
- [x] Storage-Layer (localStorage + JSON Export/Import)
- [x] App-Shell mit Tab-Navigation
- [x] Gantt-View: Vorgangstabelle + Detail-Panel (Seitenleiste)
- [x] Gantt-Diagramm: SVG-Zeitachse, Vorgangsbalken, Meilensteindiamanten, Abhängigkeitspfeile, Heute-Linie
- [x] Gantt-Hover-Popover: Detailkarte beim Hovern über Balken
- [x] Gantt-Kontextmenü: Rechtsklick mit 7 Aktionen (Bearbeiten, Meilenstein, Einfügen, Duplizieren, etc.)
- [x] Netzplandiagramm: VKN-Darstellung nach DIN 69900 (SVG) mit Pan/Zoom
- [x] Ressourcen-View: Ressourcenliste mit CRUD + Zuordnungen
- [x] Ressourcen-Auslastungsdiagramm: Gestapeltes Balkendiagramm (recharts)
- [x] Dashboard-View: Fortschritt, SPI, kritischer Pfad
- [x] Abhängigkeiten-Editor: Vorgänger auswählen, Typ und Zeitversatz setzen
- [x] Undo/Redo: 20 Schritte History-Stack mit Ctrl+Z/Ctrl+Y
- [x] Projektvorlagen: 4 Vorlagen (IT, Bau, Instandhaltung, Fachschule)
- [x] Toast-Benachrichtigungen: Rückmeldungen für alle Aktionen
- [x] Tooltips: Wiederverwendbare Tooltip-Komponente (4 Positionen)
- [x] Meilenstein-Timeline: Horizontale SVG-Zeitleiste im Dashboard mit Farbcodierung (abgeschlossen/überfällig/kritisch/normal), Beschriftung und Tooltip
- [x] Projekt-Einstellungen: Modal mit Name, Startdatum, Status, Wochenenden-Option

- [x] Responsive Layout: Gestapelter Modus unter 768px (Icon-only Header/Tabs, Tabelle/Diagramm gestapelt, Detail-Panel als Overlay)
- [x] Design D1 Shell-Redesign: Dunkle Sidebar (60px, --pm-sidebar-bg), dunkle Topbar (48px, --pm-header-bg), CSS Design-Tokens v2, neuer Start-Screen mit Vorlagen-Cards, Mobile Bottom-Tab-Bar, Status-Badge
- [x] Design D2 Tabellen-Upgrade: Zeilennummern (#-Spalte), Kreis-Checkboxen (Klick→100%, Raute für Meilensteine), Hover-Menü (⋯ statt ✕), Zebra-Zeilen, Überfällig-Badges (FAZ orange), Sammelvorgang-Styling, Design-Tokens durchgängig

- [x] Design D3 Kanban-Board + Resource Heatmap: Board-View mit 3 Spalten (Offen/In Arbeit/Abgeschlossen), Drag & Drop zwischen Spalten, Karten mit Typ-Badge/PSP/Fortschrittsbalken/Kritisch-Badge; Resource Heatmap als tägliche Zellen-Ansicht mit Farbskala (grün→blau→orange→rot) und Legende, umschaltbar neben Balkendiagramm

- [x] Drag & Drop: Gantt-Balken per Maus/Touch verschieben (Zeitversatz-Anpassung bei Vorgängern, Projektstart-Verschiebung bei Startvorgängen), visuelles Feedback mit Tage-Delta-Anzeige, Board Touch-Drag mit Ghost-Element
- [x] Touch-Support: Gantt-Balken + Board-Karten per Touch ziehbar, größere Tap-Targets auf Touchscreens (min 36px), CSS `pointer: coarse` Media-Query, `touchAction`-Steuerung
- [x] Keyboard-Shortcuts: Entf (Löschen), F2 (Umbenennen/Name fokussieren), Ins (Neuer Vorgang unterhalb), Esc (Abwählen) in Gantt; Strg+N (Neues Projekt), Strg+E (Einstellungen) global; Shortcuts-Legende am unteren Rand der Gantt-Ansicht
- [x] Auswirkungs-Feedback: Blaue Info-Bar zeigt nach terminrelevanten Änderungen verschobene Vorgänge und Projektende-Delta, 4s Auto-Dismiss, manuell schließbar
- [x] PSP-Navigation: Baumstruktur mit Ein-/Ausklappen (▸/▾), Einrücken (Tab) / Ausrücken (Shift+Tab), Tiefenbasierte Einrückung, Kinderzähler bei eingeklappten Sammelvorgängen, Kaskadenlöschung, Kontextmenü-Aktionen, Vorlagen mit Hierarchie (Sammelvorgang-Phasen)

### Offen (TODO – Priorität absteigend)

#### Priorität 2 – Technische Verbesserungen (Masterprompt v2.0 Baustein 4.3)
- [ ] **Virtualisierung:** Vorgangsliste bei >100 Einträgen virtualisieren (nur sichtbare Zeilen rendern) – Ziel: flüssig bei 200 Vorgängen (Größe: M)
- [ ] **Barrierefreiheit:** ARIA-Labels, Tastaturnavigation durch Tabelle, ausreichende Kontraste (Größe: M)

#### Priorität 3 – Erweiterungen Langfristig (Masterprompt v2.0 Baustein 4.4)
- [ ] **Kosten-Tracking:** Geplante vs. tatsächliche Kosten pro Vorgang und Ressource, Summen im Dashboard (Größe: M)
- [ ] **Risikomanagement:** Risiken pro Vorgang erfassen, Ampel-Visualisierung, Einfluss auf Projektende (Größe: L)
- [ ] **Template-System:** Vorschau vor dem Laden, Anpassung der Vorlage vor Erstellung (Größe: M)
- [ ] **Analyse-Framework:** Automatische Prüfung der Projektstruktur – PSP vollständig? Abhängigkeiten konsistent? Kritischer Pfad plausibel? (Größe: L)

#### Priorität 4 – Deployment
- [ ] **Lokaler Launcher:** `.bat`-Starter für Windows (Build starten + Browser öffnen, kein Terminal sichtbar) (Größe: S)
- [ ] **Electron-Paket:** Desktop-App (.exe) für firmeninternes Deployment ohne Browser-Abhängigkeit (Größe: L)

## Konventionen

- **Sprache:** UI und Variablennamen auf Deutsch (Fachbegriffe aus dem Masterprompt)
- **Komponenten:** Funktionale Komponenten mit Hooks
- **Styling:** Tailwind-Utility-Klassen, keine harten Pixelwerte für Layouts
- **State:** Props-Drilling von App.jsx nach unten, `onUpdate(changes)` nach oben
- **Berechnung:** Netzplan wird bei jeder Änderung automatisch neu berechnet
- **Storage:** Autosave mit 2s Debounce, kein manuelles Speichern nötig

## Farbsystem (Masterprompt E.1)

| Element | CSS Variable | Hex |
|---|---|---|
| Vorgangsbalken Standard | `--pm-bar-default` | #3B82F6 |
| Kritischer Pfad | `--pm-bar-critical` | #EF4444 |
| Abgeschlossen | `--pm-bar-done` | #22C55E |
| Überfällig | `--pm-bar-overdue` | #F59E0B |
| Meilenstein | `--pm-milestone` | #8B5CF6 |
| Sammelvorgang | `--pm-summary` | #1E293B |
| Heute-Linie | `--pm-today` | #EF4444 |

## Befehle

```bash
npm run dev      # Entwicklungsserver starten
npm run build    # Produktions-Build
npm run lint     # ESLint ausführen
npm run preview  # Build-Vorschau
```

## Abhängigkeitstypen (Masterprompt B.1)

| Typ | Bedeutung | Berechnung |
|---|---|---|
| EA | Ende-Anfang | FAZ(N) ≥ FEZ(V) + Zeitversatz |
| AA | Anfang-Anfang | FAZ(N) ≥ FAZ(V) + Zeitversatz |
| EE | Ende-Ende | FEZ(N) ≥ FEZ(V) + Zeitversatz |
| AE | Anfang-Ende | FEZ(N) ≥ FAZ(V) + Zeitversatz |
