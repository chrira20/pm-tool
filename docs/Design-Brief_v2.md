# Design-Brief PM-Tool v2.0

## Referenzquellen
Analysierte Referenzbilder: Microsoft Project Web (modern), MS Project Server 2013 (PWA),
Resource Planning Tool (modern), MS Project Kanban/Board-Ansicht, Sprint-Report-Dashboard.

## Designprinzipien
- Professionelles Work-Management-Feeling (wie Linear, Notion, MS Project Web)
- Dunkle Sidebar + helles Content-Panel (hoher Kontrast, klare Hierarchie)
- Minimal: keine unnötigen Rahmen, Schatten nur wo funktional
- Deutsche UI-Sprache durchgängig beibehalten

---

## 1. Design-System (CSS Custom Properties)

Alle Werte in `src/index.css` als CSS Custom Properties ergänzen:

```css
/* Neue Design-Tokens v2 */
--pm-sidebar-bg:      #0F172A;   /* Slate-950 – linke Sidebar */
--pm-header-bg:       #1E293B;   /* Slate-900 – Topbar */
--pm-surface:         #F8FAFC;   /* Slate-50  – App-Hintergrund */
--pm-table-bg:        #FFFFFF;   /* Tabelle / Panel */
--pm-border:          #E2E8F0;   /* Slate-200 – Trennlinien */
--pm-border-strong:   #CBD5E1;   /* Slate-300 – stärkere Linien */
--pm-text-primary:    #0F172A;   /* Slate-950 – Haupttext */
--pm-text-secondary:  #475569;   /* Slate-600 – Sekundärtext */
--pm-text-muted:      #94A3B8;   /* Slate-400 – Hinweistext */
--pm-accent:          #2563EB;   /* Blue-600  – Primärfarbe */
--pm-accent-hover:    #1D4ED8;   /* Blue-700  – Hover */
--pm-accent-light:    #EFF6FF;   /* Blue-50   – Aktive Zeile/Item */
--pm-success:         #16A34A;   /* Green-600 – Abgeschlossen */
--pm-success-bg:      #F0FDF4;   /* Green-50  – Hintergrund */
--pm-warning:         #D97706;   /* Amber-600 – Überfällig */
--pm-warning-bg:      #FFFBEB;   /* Amber-50  – Hintergrund */
--pm-danger:          #DC2626;   /* Red-600   – Kritisch/Überlast */
--pm-danger-bg:       #FEF2F2;   /* Red-50    – Hintergrund */
--pm-row-summary:     #F1F5F9;   /* Slate-100 – Sammelvorgang */
--pm-row-zebra:       #FAFAFA;   /* Jede 2. Zeile subtil */
--pm-sidebar-text:    #94A3B8;   /* Sidebar Icon-Farbe inaktiv */
--pm-sidebar-active:  #FFFFFF;   /* Sidebar Icon aktiv */
```

---

## 2. Layout-Struktur (Shell)

### Gesamt-Layout
```
┌────────────────────────────────────────────────────────────────┐
│ TOPBAR (--pm-header-bg, h-12):                                 │
│  ≡  PM-Tool  |  [Projektname]  [Status-Badge]    ↩↪ 📤📥 ⚙️ +│
├──────┬─────────────────────────────────────────────────────────┤
│  S   │                                                         │
│  I   │  VIEW-HEADER (weiß, h-11, border-b):                   │
│  D   │  [Gantt] [Board] [Netzplan] [Dashboard]   Zoom ●── ⋯  │
│  E   ├─────────────────────────────────────────────────────────┤
│  B   │                                                         │
│  A   │  HAUPTBEREICH (--pm-surface)                            │
│  R   │                                                         │
│  60px│                                                         │
└──────┴─────────────────────────────────────────────────────────┘
```

### Sidebar (links, 60px breit, fest)
- Hintergrund: `--pm-sidebar-bg` (#0F172A)
- Oben: Hamburger-Icon (≡) als Logo-Placeholder
- Navigation Icons (vertikal zentriert):
  - 📊 Gantt
  - 📋 Board ← neue View (später)
  - 🔗 Netzplan
  - 📈 Dashboard
  - Trennlinie (border-t border-slate-700)
  - 👥 Ressourcen
- Unten (sticky bottom):
  - ⚙️ Einstellungen
- Aktiver Zustand: Linker blauer Streifen (4px, --pm-accent) + Icon weiß
- Inaktiver Zustand: Icon `--pm-sidebar-text` (#94A3B8), hover: weiß
- Tooltips rechts neben Icon beim Hover (Label anzeigen)

### Topbar (oben, 48px, --pm-header-bg)
- Links: Hamburger ≡ (Placeholder, noch keine Funktion) + "PM-Tool" Text weiß, font-semibold
- Mitte: Projektname (weiß, klickbar → öffnet Einstellungen-Modal) + Status-Badge
  (Status-Farben: Planung=slate, Aktiv=blau, Abgeschlossen=grün, Eingefroren=orange)
- Rechts: ↩ ↪ (Undo/Redo) | 📤 📥 (Export/Import) | ⚙️ (Einstellungen) | [+ Vorgang] Button (blau)
- Alle Icons/Buttons: weiß, hover: bg-white/10, rounded

### Tab-Navigation entfällt in der Topbar/Nav-Leiste
Die Tab-Navigation (Gantt/Ressourcen/Netzplan/Dashboard) wandert in die **Sidebar**.
Die bestehende `<nav>` unterhalb des Headers bleibt als **View-Header** für view-spezifische
Aktionen (Filter, Zoom, + Vorgang) erhalten – aber ohne die Tab-Buttons.

---

## 3. Gantt-Tabelle: Visuelle Verbesserungen

### Zeilennummern
- Neue erste Spalte: 32px breit, Zahl grau (`--pm-text-muted`), font-mono text-xs
- Sammelvorgang-Zeilen: keine Zahl, stattdessen ∨/▶ Chevron

### Kreis-Checkbox
- Neue zweite Spalte: 28px breit
- Darstellung: `○` (leerer Kreis, border-2 border-slate-300, rounded-full)
- Bei Klick: Fortschritt auf 100% setzen → Kreis wird grün mit Haken `✓`
- Bereits 100%: grüner gefüllter Kreis
- Meilenstein: Raute-Form statt Kreis

### Hover-Verhalten Tabellenzeile
- Dauerhaftes `✕` zum Löschen ausblenden
- Bei Hover: `···` Button rechts einblenden → Klick öffnet Kontextmenü
  (Bearbeiten / Meilenstein / Duplizieren / Einfügen darunter / Löschen)
- Zeilenhintergrund bei Hover: `--pm-accent-light` (#EFF6FF)

### Sammelvorgang-Zeilen
- Hintergrund: `--pm-row-summary` (#F1F5F9)
- Schrift: font-semibold, text-slate-700
- Chevron ∨ / ▶ links neben Name (Ein-/Ausklappen der Kinder – Funktion kann Stub bleiben)

### Überfällige Datums-Badges
- FAZ-Wert, wenn Datum < heute und Fortschritt < 100:
  Hintergrund `--pm-warning-bg`, Text `--pm-warning`, rounded px-1.5

### Zebra-Zeilen
- Jede zweite Zeile: `--pm-row-zebra` (#FAFAFA) als Hintergrund

---

## 4. Topbar-Buttons Design

```
[↩]  [↪]  |  [📤 Export]  [📥 Import]  |  [⚙️]  |  [+ Vorgang]
```
- Trennlinien zwischen Gruppen: `border-l border-white/20`
- Buttons: `px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded transition`
- Primär-Button "+ Vorgang": `bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium`
- Disabled (Undo/Redo): `opacity-30 cursor-not-allowed`

---

## 5. Allgemeine Typografie & Spacing

- Basis-Schrift: System-Font-Stack (bereits via Tailwind gesetzt)
- Tabellenzeilen: h-9 (36px) statt bisherige Höhe → dichter, professioneller
- Header-Zeile Tabelle: h-9, bg-slate-50, border-b-2 border-slate-200, text-xs font-semibold
  uppercase tracking-wider text-slate-500
- Buttons: `rounded-lg` statt `rounded` (etwas mehr Radius)
- Inputs: `rounded-lg`, `border-slate-300`, focus: `border-blue-400 ring-1 ring-blue-400`
- Badge/Pills: `rounded-full px-2 py-0.5 text-xs font-medium`

---

## 6. Start-Screen Redesign

Der leere Start-Screen (wenn kein Projekt geladen) erhält ebenfalls das neue Design:
- Hintergrund: `--pm-surface` (#F8FAFC)
- Zentrierte Card: weiß, `rounded-2xl shadow-lg`, max-w-lg
- Logo-Bereich: Dunkles Icon-Quadrat (#1E293B) mit 📊 weiß
- Vorlagen-Grid: 4 Karten mit Icon + Titel + Beschreibung,
  hover: border-blue-400, shadow-md, transition-all

---

## 7. Iterationsplan

| ID | Inhalt | Priorität |
|---|---|---|
| **D1** | Shell: Sidebar-Nav, Topbar dunkel, CSS-Tokens, Start-Screen | Hoch |
| **D2** | Tabelle: Zeilennummern, Checkboxen, Hover-Menü, Zebra, Badges | Mittel |
| **D3** | Kanban-Board View + Resource Heatmap | Niedrig (später) |

**Reihenfolge:** D1 → Build/Test → D2 → Build/Test → D3

---

## 8. Constraints (Negativanweisungen für Design)

- Keine neuen npm-Pakete für Icons – Emoji oder Unicode-Symbole verwenden
- Keine CSS-Animationen außer `transition` für hover/active states
- Keine Änderungen an der Berechnungslogik (CPM, EVA, Kalender)
- Desktop-Breakpoint (≥768px) als Primärziel – Mobile bleibt funktionsfähig aber nicht Fokus
- Bestehende Tailwind-Klassen bevorzugen, CSS Custom Properties nur für design-tokens
- Props-Drilling und State-Struktur unverändert lassen
- `npm run build` und `npm run lint` müssen nach jeder Iteration 0 Fehler haben
