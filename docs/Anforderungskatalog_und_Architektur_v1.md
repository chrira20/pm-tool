# Anforderungskatalog & Architektur – PM-Tool v2.0

**Dokumentversion:** 1.1
**Datum:** 2026-03-19
**Autor:** Chr (unterstützt durch KI-Recherche)
**Status:** Entwurf (aktualisiert mit Browser-Recherche Planner/Project)

---

## Inhaltsverzeichnis

1. [Einleitung und Zielsetzung](#1-einleitung-und-zielsetzung)
2. [Marktanalyse: Professionelle PM-Software](#2-marktanalyse-professionelle-pm-software)
3. [Bestandsanalyse: PM-Tool Ist-Zustand](#3-bestandsanalyse-pm-tool-ist-zustand)
4. [Gap-Analyse: Wo steht das Tool vs. Markt](#4-gap-analyse-wo-steht-das-tool-vs-markt)
5. [Anforderungskatalog](#5-anforderungskatalog)
6. [Architektur-Entwurf](#6-architektur-entwurf)
7. [Implementierungs-Roadmap](#7-implementierungs-roadmap)
8. [UX-Analyse: Microsofts Schwächen als unsere Chance](#8-ux-analyse-microsofts-schwächen-als-unsere-chance)
9. [Quellenverzeichnis](#9-quellenverzeichnis)

---

## 1. Einleitung und Zielsetzung

### 1.1 Ausgangslage

Das PM-Tool ist eine webbasierte Projektmanagement-Anwendung, die als Alternative zu Microsoft Project konzipiert wurde. Es läuft als React-Single-Page-Application im Browser, nutzt localStorage für die Persistierung und implementiert den Critical-Path-Method-Algorithmus (CPM) nach DIN 69900 für die Netzplanberechnung. Die Anwendung befindet sich in aktiver Entwicklung und deckt bereits grundlegende Funktionen des klassischen Projektmanagements ab.

### 1.2 Ziel dieses Dokuments

Dieses Dokument verfolgt drei Ziele:

Erstens eine systematische Marktanalyse: Was macht professionelle PM-Software erfolgreich? Welche Funktionen sind Standard, welche differenzierend? Wo hat insbesondere MS Project Stärken und Schwächen?

Zweitens einen priorisierten Anforderungskatalog: Welche Funktionen braucht das PM-Tool, um als professionelle, moderne und benutzerfreundliche Alternative wahrgenommen zu werden? Was fehlt, was muss verbessert werden?

Drittens einen detaillierten Architektur-Entwurf: Wie muss die technische Architektur aussehen, um die Anforderungen umzusetzen – mit konkreten Dateistrukturen, Interface-Definitionen und State-Management-Entscheidungen?

### 1.3 Zielgruppe des Tools

Das PM-Tool richtet sich an zwei Zielgruppen: Zum einen an Projektleiter und Techniker in kleinen bis mittleren Unternehmen, die klassische und hybride Projekte (Instandhaltung, Bau, IT, technische Projekte) planen und steuern. Zum anderen an Fachschulen und Bildungseinrichtungen, die Projektmanagement praxisnah vermitteln wollen. Die Anwendung soll branchenunabhängig nutzbar sein, aber besondere Stärken im technischen Projektmanagement ausspielen.

---

## 2. Marktanalyse: Professionelle PM-Software

### 2.1 Microsoft Project – Der Platzhirsch

Microsoft Project ist seit über 30 Jahren der De-facto-Standard für klassisches Projektmanagement. Die Software wird aktuell in mehreren Editionen vertrieben: Planner und Project Plan 3 (ab ca. 30 $/Nutzer/Monat), Planner und Project Plan 5 (ab ca. 55 $/Nutzer/Monat) sowie die Desktop-Version Project Professional. Microsoft hat 2025 „Project for the Web" eingestellt und die Funktionen in Microsoft Planner Premium integriert. Project Online wird zum 30.09.2026 eingestellt.

**Kernfunktionen von MS Project:**

MS Project bietet eine vollständige CPM-Engine (Critical Path Method) mit automatischer Terminplanung: Sobald eine Änderung an Dauer, Abhängigkeit oder Ressource vorgenommen wird, berechnet das System alle betroffenen Termine neu. Die Software unterstützt alle vier Abhängigkeitstypen (EA, AA, EE, AE) mit Zeitversatz sowie Einschränkungstypen (Constraints) wie „So früh wie möglich", „Muss anfangen am" oder „Nicht später anfangen als".

Die Ressourcenverwaltung unterscheidet drei Typen: Arbeitsressourcen (Personen, Geräte), Materialressourcen (Verbrauchsgüter) und Kostenressourcen (Festbeträge). Besonders relevant ist das Resource Leveling – ein Algorithmus, der überlastete Ressourcen automatisch entlastet, indem er Vorgänge verschiebt. Der Leveling-Algorithmus bewertet dabei Aufgaben-ID, Dauer, Einschränkungen und Abhängigkeiten, um eine optimale Reihenfolge zu bestimmen. Allerdings hat dieses Feature eine bekannte Schwäche: Nach dem Leveling stimmt die Anzeige des kritischen Pfads oft nicht mehr, weil der „Total Slack"-Wert durch die regelbasierte Verschiebung verfälscht wird.

MS Project erlaubt das Setzen von Baselines (Referenzplänen). Bis zu 11 Baselines können gespeichert werden, sodass der ursprüngliche Plan mit dem aktuellen Stand verglichen werden kann. Darauf aufbauend berechnet MS Project Earned-Value-Kennzahlen (PV, EV, AC, SPI, CPI, EAC, ETC).

Die Kostenverwaltung ermöglicht geplante und tatsächliche Kosten pro Vorgang und Ressource, mit Kostensatztabellen (bis zu 5 Sätze pro Ressource), festen Kosten pro Vorgang und kumulierten Projektkosten.

**Grenzen von MS Project:**

Trotz dieser Stärken hat MS Project erhebliche Schwächen, die den Markt für Alternativen öffnen. Die Benutzeroberfläche wirkt veraltet und überladen – zahlreiche Rezensionen beschreiben die Einarbeitung als „steil" und „nicht intuitiv". Die Software ist tief im Wasserfall-Modell verwurzelt; Agile-Features wie Kanban-Boards und Sprint-Planung wirken nachträglich aufgesetzt. Die Kollaborationsmöglichkeiten sind begrenzt: Es gibt keinen zentralen Kommunikationsraum im Tool, Remote-Teams können nicht in Echtzeit zusammenarbeiten. MS Project ist primär für Windows konzipiert, was die plattformübergreifende Nutzung einschränkt. Die Integration mit Nicht-Microsoft-Tools (Slack, Salesforce, GitHub) ist schwierig. Und schließlich ist die Software teuer – gerade für kleinere Teams oder Einzelprojekte.

### 2.2 Moderne Cloud-PM-Tools im Vergleich

Neben MS Project haben sich mehrere Cloud-basierte Plattformen etabliert, die jeweils unterschiedliche Stärken haben:

**Monday.com** richtet sich an Teams, die visuelle, anpassbare Workflows wollen. Die Stärke liegt in der extremen Flexibilität: Zwischen Kanban, Timeline, Kalender und Chart-Ansichten kann je nach Bedarf gewechselt werden. Die Plattform bietet entwickler-ähnliche Workflow-Anpassung ohne Code-Kenntnisse. Für klassisches Projektmanagement mit CPM-Berechnung ist Monday.com allerdings nicht geeignet.

**Jira** dominiert in Software-Entwicklungsteams mit Agile-Methoden. Scrum- und Kanban-Boards, Sprint-Planung, Backlog-Management und die Integration mit Entwickler-Tools (GitHub, Bitbucket, CI/CD) sind erstklassig. Für Wasserfall-Projekte oder gemischte Methoden ist Jira weniger geeignet.

**Smartsheet** kombiniert die Vertrautheit einer Tabellenkalkulation mit Projektmanagement-Funktionen. Die Stärke liegt in der Balance zwischen Struktur (Gantt, Abhängigkeiten, kritischer Pfad) und Flexibilität (benutzerdefinierte Felder, Automatisierungen). Besonders für Portfolio-Management und Ressourcen-Allokation auf Unternehmensebene ist Smartsheet stark.

**Asana** verbindet Aufgabenmanagement mit strategischer Zielausrichtung. Die Stärke liegt darin, tägliche Aufgaben mit übergeordneten Unternehmenszielen zu verknüpfen. Die Benutzeroberfläche gilt als eine der intuitivsten am Markt.

**ProjectLibre** ist die bekannteste kostenlose Open-Source-Alternative zu MS Project. Es bietet ähnliche Funktionen und Dateikompatibilität, hat aber eine veraltete Java-basierte Oberfläche.

### 2.3 Enterprise-PM-Software: Oracle Primavera P6

Neben MS Project gibt es im Enterprise-Segment Oracle Primavera P6 – die bevorzugte Software für Großprojekte in Bau, Infrastruktur, Energie und Fertigung. Primavera P6 Professional unterstützt Projekte mit bis zu 100.000 Aktivitäten und bietet unbegrenzte Ressourcen, unbegrenzte Zielpläne (Baselines) und erweiterte Scheduling-Funktionen. Die Software beinhaltet Earned-Value-Analyse, Kostentracking, Schedule-Variance-Berichte und anpassbare Dashboards, die Termin-, Kosten- und Ressourcendaten konsolidieren. Version 24.12 (2025) brachte verbessertes Dependency-Management und flexiblere Meilenstein-Verknüpfungen.

Primavera ist für unser PM-Tool weniger ein direkter Wettbewerber als vielmehr ein Referenzpunkt: Es zeigt, welche Funktionen in anspruchsvollen Umgebungen erwartet werden (Multi-Baseline, umfassendes EVM, Portfolio-Management). Der Hauptnachteil ist die Komplexität und der Preis – beides Bereiche, in denen unser Tool glänzen kann.

### 2.4 Weitere professionelle PM-Tools

**Wrike** ist cloudbasiert und bekannt für die Kombination aus Benutzerfreundlichkeit und KI-gestützten Features. Die Stärke liegt in intelligenten Automatisierungen und Echtzeit-Zusammenarbeit. Für größere Unternehmen fehlen jedoch erweiterte Finanz- und Ressourcen-Management-Funktionen.

**ClickUp** positioniert sich als All-in-One-Plattform mit extremer Anpassbarkeit: Checklisten, Timelines, Gantt-Charts, Kanban-Boards, Abhängigkeiten, über 1.000 Integrationen, anpassbare Automatisierungen und Berechtigungs-Systeme. ClickUp bietet häufig mehr Funktionen in günstigeren Tarifen als die Konkurrenz und ist besonders bei Start-ups und wachsenden Teams beliebt.

**Celoxis** ist speziell auf mittelständische und große Unternehmen zugeschnitten und bietet fortschrittliches Ressourcen-Management, das sowohl Wrike als auch Jira übertrifft. Die Stärke liegt in der hohen Anpassbarkeit für komplexe Projekte mit anspruchsvollen Reporting-Anforderungen.

**OpenProject** ist die führende Open-Source-Alternative und besonders für datensensible Organisationen relevant, da es komplett selbst gehostet werden kann. Es kombiniert Gantt-Charts mit Agile-Boards, Kosten- und Zeittracking, Wikis und EU-Datenschutz-Konformität. Die Community Edition ist kostenlos, die Enterprise Edition bietet zusätzliche Features und Support. OpenProject unterstützt klassisches, agiles und hybrides Projektmanagement.

**GanttProject** ist eine kostenlose, Open-Source Desktop-Anwendung (Java, GPLv3) für einfache Gantt-basierte Projektplanung. Es bietet Gantt-Charts, Ressourcen-Auslastungsdiagramme und PERT-Charts, ist aber funktional limitiert und hat eine veraltete Oberfläche.

**Linear** spezialisiert sich auf agile Software-Entwicklung mit optimierten Workflows und erstklassigem Issue-Tracking, inklusive GitHub-Integration. Es ist das bevorzugte Tool für Tech-Start-ups, aber nicht für klassisches Projektmanagement geeignet.

**Notion** setzt auf extreme Anpassbarkeit mit modularem Design: Kanban-Boards, Datenbanken, Echtzeit-Kollaboration und Dokumentation in einem. Es ist eher eine Wissensmanagement-Plattform als ein dediziertes PM-Tool, hat aber mit „Notion Projects" eine PM-Erweiterung.

**Basecamp** verfolgt einen minimalistischen Ansatz mit Fokus auf zentralisierter Kommunikation: To-Do-Listen, Message-Boards, Zeitpläne, Gruppenchat und automatische Check-ins. Das Flat-Pricing-Modell (349 $/Monat für unbegrenzte Nutzer) ist attraktiv, aber es fehlen Gantt-Charts, Abhängigkeiten und CPM.

### 2.5 Marktsegmentierung: Wo positioniert sich unser Tool?

Aus der Analyse aller professionellen PM-Tools ergibt sich eine klare Marktsegmentierung:

| Segment | Tools | Fokus | Unser Tool? |
|---|---|---|---|
| **Enterprise/Großprojekte** | Primavera P6, MS Project Plan 5 | Portfolio, 100k+ Aktivitäten, EVM | ❌ Nicht unser Markt |
| **Klassisches PM (Mittelstand)** | MS Project, Celoxis, Smartsheet | CPM, Baselines, Kosten, Ressourcen | ✅ **Unser Kernmarkt** |
| **Agile/DevOps** | Jira, Linear, Azure DevOps | Sprints, Backlogs, Issue-Tracking | 🟡 Teilweise (Board) |
| **Visual Work Management** | Monday, Asana, ClickUp, Wrike | Flexibel, KI, Automatisierung | 🟡 UX-Inspiration |
| **Open Source** | OpenProject, ProjectLibre, GanttProject | Self-hosted, kostenfrei | ✅ **Direkter Wettbewerb** |
| **Minimalistisch** | Basecamp, Notion, Trello | Einfach, Kommunikation | ❌ Anderer Ansatz |

Unser PM-Tool positioniert sich im Schnittfeld von „Klassisches PM (Mittelstand)" und „Open Source" – mit dem Anspruch, die algorithmische Tiefe von MS Project mit der modernen UX von ClickUp/Monday zu verbinden, bei null Kosten und ohne Installationsaufwand.

### 2.6 Moderne PM-Methoden und Trends 2025/2026

Die PM-Landschaft hat sich in den letzten Jahren fundamental gewandelt. Laut dem PMI Pulse of the Profession Report 2025 setzen über 67 % der großen Unternehmen hybride Frameworks ein – also eine Kombination aus plangetriebenem (Wasserfall) und iterativem (Agile) Vorgehen. Projekte mit hybriden Methoden weisen eine 20 % höhere Erfolgsquote auf als rein klassische oder rein agile Projekte.

Die wichtigsten Trends für 2025/2026 sind:

**Hybrid-Projektmanagement** ist der dominierende Ansatz. Es kombiniert die strukturierte Planung des Wasserfall-Modells (Phasen, Meilensteine, Abhängigkeiten) mit der flexiblen Ausführung agiler Methoden (Sprints, Kanban, iterative Lieferung). Ein modernes PM-Tool muss beides abbilden können.

**KI-Integration** gewinnt rapide an Bedeutung. Generative KI für Risikovorhersage, automatische Terminplanung, Ressourcen-Optimierung und Berichterstellung wird zum Differenzierungsmerkmal. Predictive Analytics kann Projektverzögerungen frühzeitig erkennen.

**Maßgeschneiderte Methodik** statt One-Size-Fits-All: Die Debatte „Wasserfall vs. Agile" ist veraltet. Moderne Tools müssen es ermöglichen, die Methodik an die Volatilität, Compliance-Anforderungen und Komplexität des jeweiligen Projekts anzupassen.

**Echtzeit-Zusammenarbeit** ist Standard geworden. Teams erwarten, gemeinsam an Plänen zu arbeiten, Änderungen sofort zu sehen und im Kontext zu kommunizieren.

**Wertorientiertes Management** rückt in den Vordergrund: Nicht die Einhaltung des Plans, sondern der gelieferte Geschäftswert ist die zentrale Metrik. Tools müssen dies durch Kennzahlen und Dashboards unterstützen.

### 2.7 Critical Chain Project Management (CCPM) – Alternative zum CPM

Neben dem klassischen CPM (Critical Path Method), den unser Tool bereits implementiert, gibt es eine weitere wissenschaftlich fundierte Scheduling-Methode: die Critical Chain Project Management (CCPM), entwickelt von Dr. Eliyahu M. Goldratt basierend auf seiner Theory of Constraints (1997).

Der fundamentale Unterschied: CPM fokussiert auf Aufgabenabhängigkeiten und geht von unbegrenzten Ressourcen aus. CCPM berücksichtigt sowohl Aufgabenabhängigkeiten als auch Ressourcenverfügbarkeit und nutzt strategische Puffer anstelle von individuellen Aufgaben-Polstern. Statt jeder Aufgabe einzeln Zeitpuffer hinzuzufügen (was zu „Student Syndrome" und Parkinson's Law führt), werden Puffer auf Projektebene gepoolt – als Project Buffer am Projektende und Feeding Buffers an den Einspeisungen in die kritische Kette. Die Erfolgsmessung basiert nicht auf der Einhaltung einzelner Aufgabentermine, sondern auf der Buffer-Consumption-Rate.

Für unser Tool ist CCPM eine interessante Erweiterung, weil: es eine methodische Alternative zum CPM bietet (kein Entweder-Oder, beides kann koexistieren), es den Ressourcen-Engpass explizit adressiert (was CPM allein nicht tut), es in Branchen wie Bau, Fertigung und Instandhaltung zunehmend eingesetzt wird, und es ein Differenzierungsmerkmal wäre – kaum ein PM-Tool unterhalb der Enterprise-Klasse bietet CCPM.

### 2.8 PMBOK 7. und 8. Edition – Der neue PM-Standard

Die Project Management Body of Knowledge (PMBOK) Guides des PMI haben sich fundamental gewandelt. Die 7. Edition (2021) ersetzte die prozessbasierten Wissensgebiete durch 12 Prinzipien und 8 Performance-Domänen und betonte wertorientiertes, adaptives Projektmanagement. Die 8. Edition (November 2025) rebalanciert den Ansatz: Sie kondensiert die 12 Prinzipien auf 6 (Holistic View, Value Focus, Quality, Accountable Leadership, Sustainability, Empowered Culture), definiert 7 Performance-Domänen (Governance, Scope, Schedule, Finance, Stakeholders, Resources, Risk) und führt 40 Prozesse wieder ein – allerdings nicht-präskriptiv. Neu sind erweiterte Kapitel zu KI, PMOs und Beschaffung.

Für unser Tool bedeutet das: Die PMBOK-8-Domänen korrespondieren direkt mit Funktionsbereichen, die wir abdecken oder abdecken sollten: Schedule (CPM ✅), Finance (Kosten-Tracking ⬜), Resources (Ressourcen-Management ✅), Risk (Risikomanagement ⬜), Scope (PSP ✅), Governance (Baselines ⬜), Stakeholders (Collaboration ⬜).

### 2.9 PRINCE2 7th Edition und hybride Ansätze

PRINCE2 hat sich 2023 mit der 7. Edition grundlegend modernisiert. Die wichtigsten Neuerungen: Erstens die explizite Integration des „People"-Aspekts – Teamdynamik, Stakeholder-Engagement und Soft Skills sind jetzt fester Bestandteil des Frameworks. Zweitens die Kompatibilität mit Agile – 60 % der PRINCE2-Nutzer kombinieren es bereits mit agilen Methoden. Drittens die Aufnahme von Nachhaltigkeit als Performance-Ziel. Und viertens die Anpassung an digitale Projektökosysteme.

Für hybride PM-Tools wie unseres ist das ein starkes Signal: Die etablierten Frameworks konvergieren – klassisch und agil wachsen zusammen. Ein Tool, das beides natürlich unterstützt (Gantt + Board + Sprints), trifft den Zeitgeist.

---

## 3. Bestandsanalyse: PM-Tool Ist-Zustand

### 3.1 Technischer Stack

Das PM-Tool basiert auf React 19 mit Vite 8 als Build-Tool und Tailwind CSS 4 für das Styling. Diagramme werden mit eigenem SVG-Code (Gantt, Netzplan) und recharts (Dashboard, Ressourcen-Auslastung) gerendert. Die Datenverarbeitung nutzt date-fns für Datumsfunktionen, lodash für Utilities und uuid für ID-Generierung. Die Persistierung erfolgt über localStorage mit einer eigenen Abstraktionsschicht. Die Typisierung basiert auf JSDoc (kein TypeScript).

### 3.2 Implementierte Funktionen (35 Features)

**Algorithmen und Berechnungen:**

Die CPM-Implementierung (Critical Path Method) in `src/utils/cpm.js` ist vollständig: Topologische Sortierung nach Kahns Algorithmus, Vorwärts- und Rückwärtsrechnung, alle vier Abhängigkeitstypen (EA, AA, EE, AE) mit Zeitversatz, Gesamtpuffer und freier Puffer, Zykluserkennung. Sammelvorgänge werden korrekt aus der Berechnung ausgeschlossen und ihre Termine aus den Kindvorgängen aggregiert.

Die Kalenderlogik (`src/utils/calendar.js`) unterstützt konfigurierbare Arbeitstage (Mo–So einzeln schaltbar), Feiertage als ISO-String-Array und Betriebsferien als Intervalle. Die Earned-Value-Analyse (`src/utils/eva.js`) berechnet PV, EV und SPI. Die Ressourcen-Auslastungsberechnung (`src/utils/resources.js`) verteilt Aufwand gleichmäßig über die Vorgangsdauer und erkennt Überlastungen.

**Datenmodell:**

Das Datenmodell (`src/models/types.js`, 194 Zeilen) umfasst sechs Entitäten mit Factory-Funktionen: Project (Aggregat mit allen Unterobjekten), Task (Vorgang/Meilenstein/Sammelvorgang mit berechneten CPM-Feldern), Dependency (vier Typen mit Zeitversatz), Resource (Arbeit/Material/Kosten), Assignment (Viele-zu-viele Zuordnung Task↔Resource) und Calendar (Arbeitstage, Feiertage, Betriebsferien).

**Ansichten (Views):**

Die Gantt-Ansicht (`src/components/gantt/`) besteht aus einer Vorgangstabelle mit Zeilennummern, Kreis-Checkboxen, Hover-Menü, Zebra-Zeilen und Überfällig-Badges sowie einem SVG-Diagramm mit Vorgangsbalken, Meilensteinrauten, Abhängigkeitspfeilen (Bezier-Kurven), Heute-Linie und Drag-and-Drop (Maus + Touch). Das Detail-Panel ermöglicht die Bearbeitung aller Vorgangseigenschaften und Abhängigkeiten.

Die Board-Ansicht (`src/components/board/BoardView.jsx`) bietet ein Kanban-Board mit drei Spalten (Offen, In Arbeit, Abgeschlossen), Drag-and-Drop zwischen Spalten mit Touch-Support und Karten mit Typ-Badge, PSP-Code, Fortschrittsbalken und Kritisch-Badge.

Die Netzplan-Ansicht (`src/components/network/NetworkView.jsx`) zeigt ein Vorgangsknotennetz (VKN) nach DIN 69900 als SVG mit dem klassischen Knotenformat (FAZ/Dauer/FEZ oben, Name Mitte, SAZ/GP/SEZ unten), ebenenweisem Layout, Pan/Zoom und kritischem Pfad in Rot.

Das Dashboard (`src/components/dashboard/DashboardView.jsx`) enthält KPI-Karten (Fortschritt, SPI-Ampel, Projektende, Meilensteine), eine Meilenstein-Timeline als horizontale SVG-Zeitleiste mit Farbcodierung, eine Tabelle der kritischen Vorgänge und Ressourcen-Überlastungswarnungen.

Die Ressourcen-Ansicht (`src/components/resources/`) bietet CRUD für Ressourcen, ein gestapeltes Balkendiagramm (recharts) für die Auslastung und eine tägliche Heatmap (`ResourceHeatmap.jsx`) mit Farbskala (grün→blau→orange→rot).

**UX-Features:**

Undo/Redo mit 20-Schritte History-Stack (Ctrl+Z/Y), Keyboard-Shortcuts (Entf, F2, Ins, Esc, Tab/Shift+Tab), Kontextmenü mit 7 Aktionen, PSP-Navigation mit Ein-/Ausklappen und Einrücken/Ausrücken, Auswirkungs-Feedback (blaue Info-Bar bei Terminänderungen), vier Projektvorlagen (IT, Bau, Instandhaltung, Fachschule), Toast-Benachrichtigungen und Tooltips.

**Design:**

Dunkle Sidebar (60px) und Topbar (48px), CSS Design-Tokens v2 mit durchgängigem Farbsystem, responsives Layout (gestapelt unter 768px, Icon-only Navigation), Mobile Bottom-Tab-Bar, Status-Badge.

### 3.3 Stärken des aktuellen Tools

Das PM-Tool hat mehrere klare Stärken, die es von vielen Wettbewerbern abheben:

Die CPM-Implementierung ist algorithmisch vollständig und korrekt – alle vier Abhängigkeitstypen, Zykluserkennung, Pufferberechnung. Das erreichen viele Konkurrenz-Tools nicht (Monday.com, Asana, Trello haben keine echte CPM-Engine). Die Netzplandarstellung nach DIN 69900 als VKN ist ein echtes Alleinstellungsmerkmal – weder MS Project noch die Cloud-Tools bieten eine normgerechte VKN-Visualisierung.

Das moderne UI-Design mit Dark-Sidebar, Design-Tokens und responsivem Layout wirkt zeitgemäß und professionell – deutlich moderner als MS Project oder ProjectLibre. Die Kombination aus Gantt, Kanban-Board, Netzplan und Dashboard in einer Anwendung bietet Methodenvielfalt, die den Hybrid-Trend aufgreift.

Die Anwendung ist kostenlos und läuft komplett im Browser ohne Installation, Server oder Lizenz. Das ist eine massive Einstiegshürde weniger im Vergleich zu MS Project.

### 3.4 Schwächen und technische Schulden

**Performance:** Keine Virtualisierung der Vorgangsliste – bei über 100 Einträgen werden alle DOM-Elemente gerendert. Keine Indexierung für ID-Lookups (überall `.find()` auf Arrays). Keine Memoization der Abhängigkeitsberechnungen. Ziel sollte sein: flüssig bei 200+ Vorgängen.

**Architektur:** Props-Drilling bis in die 4. Ebene (App → GanttView → GanttDiagram → Popover). Keine Abstraktionen für wiederverwendbare Patterns (TaskRow, TaskCard werden in Gantt und Board dupliziert). SVG-Rendering inline in Komponenten (GanttDiagram.jsx ist sehr umfangreich). Keine Error-Boundaries, keine Loading-States. localStorage als einzige Persistierung (5–10 MB Limit, Single-Device).

**Fehlende professionelle Features:** Kein Kosten-Tracking, keine Baselines, kein Resource Leveling, keine Filter/Suche, keine Multi-User-Funktionalität, keine Reports/Exporte (nur JSON), keine Barrierefreiheit (ARIA, WCAG), keine automatisierten Tests.

---

## 4. Gap-Analyse: Wo steht das Tool vs. Markt

### 4.1 Feature-Vergleich mit MS Project

| Funktionsbereich | PM-Tool | MS Project | Gap |
|---|---|---|---|
| **CPM-Berechnung** | ✅ Vollständig (4 Typen, Puffer, Zyklen) | ✅ Vollständig + Constraints | 🟡 Constraints fehlen |
| **Gantt-Diagramm** | ✅ SVG mit Drag & Drop | ✅ WebGL-basiert | 🟡 Zoom-Level fehlen |
| **Netzplan (VKN)** | ✅ DIN 69900 konform | ❌ Kein VKN | 🟢 PM-Tool besser |
| **Kanban-Board** | ✅ 3-Spalten mit DnD | ✅ Planner-Integration | 🟡 Gleichwertig |
| **Ressourcen-Typen** | ✅ Arbeit/Material/Kosten | ✅ Arbeit/Material/Kosten | 🟢 Gleichwertig |
| **Ressourcen-Auslastung** | ✅ Balkendiagramm + Heatmap | ✅ Auslastungsansicht | 🟢 Gleichwertig |
| **Resource Leveling** | ❌ Nicht vorhanden | ✅ Automatisch + manuell | 🔴 Kritischer Gap |
| **Baseline-Vergleich** | ❌ Nicht vorhanden | ✅ Bis zu 11 Baselines | 🔴 Kritischer Gap |
| **Kosten-Tracking** | ❌ Nicht vorhanden | ✅ Vollständig (5 Kostensätze) | 🔴 Kritischer Gap |
| **Earned Value (EVM)** | 🟡 Nur PV, EV, SPI | ✅ PV, EV, AC, SPI, CPI, EAC, ETC | 🟡 Ausbau nötig |
| **Constraints** | ❌ Keine | ✅ 8 Einschränkungstypen | 🔴 Fehlt |
| **Filter & Suche** | ❌ Keine | ✅ Umfangreich | 🔴 Fehlt |
| **Reports & Export** | ❌ Nur JSON | ✅ PDF, Excel, visuell | 🔴 Fehlt |
| **Multi-User** | ❌ Single-User | ✅ SharePoint-Integration | 🔴 Fehlt (langfristig) |
| **Kalender** | ✅ Feiertage, Betriebsferien | ✅ Mehrere Kalender pro Ressource | 🟡 Ausbau nötig |
| **PSP-Hierarchie** | ✅ Ein-/Ausklappen, Einrücken | ✅ Vollständig | 🟢 Gleichwertig |
| **Undo/Redo** | ✅ 20 Schritte | ✅ Unbegrenzt | 🟡 Ausreichend |
| **Plattform** | ✅ Web (alle OS) | ❌ Primär Windows | 🟢 PM-Tool besser |
| **Preis** | 🆓 Kostenlos | 💰 30–55 $/Monat | 🟢 PM-Tool besser |
| **UI-Moderne** | ✅ Modern, responsive | ❌ Veraltet, überladen | 🟢 PM-Tool besser |
| **Lernkurve** | ✅ Flach | ❌ Steil | 🟢 PM-Tool besser |

### 4.2 Feature-Vergleich mit modernen Cloud-Tools

| Funktionsbereich | PM-Tool | Monday / Asana / Smartsheet | Gap |
|---|---|---|---|
| **CPM-Berechnung** | ✅ Vollständig | ❌/🟡/🟡 | 🟢 PM-Tool besser |
| **Netzplandiagramm** | ✅ DIN 69900 | ❌ Keines | 🟢 PM-Tool besser |
| **Real-time Collaboration** | ❌ | ✅ | 🔴 Kritischer Gap |
| **Automatisierungen** | ❌ | ✅ (Workflows, Trigger) | 🔴 Fehlt |
| **Custom Fields** | ❌ | ✅ | 🟡 Wünschenswert |
| **Integrationen** | ❌ | ✅ (Slack, GitHub, etc.) | 🟡 Langfristig |
| **Mobile App** | 🟡 Responsive Web | ✅ Native | 🟡 Web ausreichend |
| **Benachrichtigungen** | ❌ | ✅ | 🟡 Fehlt |
| **Kommentare/Diskussionen** | ❌ | ✅ | 🟡 Wünschenswert |

### 4.3 Positionierung: Wo setzt das PM-Tool an?

Das PM-Tool positioniert sich in einer Marktlücke: Es kombiniert die algorithmische Tiefe von MS Project (CPM, Netzplan, EVA) mit der modernen Benutzeroberfläche von Cloud-Tools – bei null Kosten und null Installationsaufwand. Die Nische ist „professionelles klassisches und hybrides Projektmanagement für Einzelanwender und kleine Teams, die kein Enterprise-Tool brauchen, aber mehr als ein Kanban-Board wollen."

Die strategische Differenzierung gegenüber MS Project liegt in der Modernität (UI, Web, kostenlos, einfach), gegenüber Monday/Asana in der algorithmischen Tiefe (CPM, VKN, EVA), gegenüber ProjectLibre in der Technologie (React statt Java, modern statt veraltet).

---

## 5. Anforderungskatalog

### 5.1 Legende

Jede Anforderung wird nach folgendem Schema kategorisiert:

**Priorität:**
- **P1 – Kritisch:** Ohne diese Funktion ist das Tool nicht wettbewerbsfähig
- **P2 – Wichtig:** Deutliche Aufwertung, erwartet von professionellen Nutzern
- **P3 – Wünschenswert:** Nice-to-have, Differenzierung gegenüber Wettbewerb
- **P4 – Langfristig:** Strategisch relevant, aber nicht für v2.0

**Größe (T-Shirt):**
- **S:** 1–2 Tage Aufwand
- **M:** 3–7 Tage Aufwand
- **L:** 2–4 Wochen Aufwand
- **XL:** 1–2 Monate Aufwand

**Kategorie:**
- KERN = Kernfunktionalität PM
- VIS = Visualisierung
- UX = Benutzererfahrung
- PERF = Performance
- ARCH = Architektur
- DATA = Datenhaltung
- INT = Integration

---

### 5.2 P1 – Kritische Anforderungen

#### ANF-001: Baseline-Management
**Kategorie:** KERN | **Größe:** M | **Abhängigkeiten:** ANF-003

Das Tool muss mindestens 3 Baselines (Referenzpläne) pro Projekt unterstützen. Eine Baseline speichert einen Snapshot aller Vorgangstermine (FAZ, FEZ) und Dauern zum Zeitpunkt der Erstellung. Im Gantt-Diagramm muss der Baseline-Balken als schattierter Balken hinter dem aktuellen Balken sichtbar sein (Plan vs. Ist). Im Dashboard müssen Abweichungen zwischen Baseline und aktuellem Plan als Kennzahl angezeigt werden (Terminverzug pro Vorgang in Tagen).

**Datenmodell-Erweiterung:**
```javascript
// In types.js
createBaseline(projekt, name) → {
  id: uuid(),
  name: String,           // z.B. "Ursprungsplan", "Re-Baseline März"
  erstelltAm: ISO-Date,
  vorgaenge: [{            // Snapshot der Vorgangstermine
    vorgangId: UUID,
    faz: ISO-Date,
    fez: ISO-Date,
    dauer: Number,
    fortschritt: Number
  }]
}
```

**Akzeptanzkriterien:**
- Baseline kann per Button „Baseline setzen" erstellt werden
- Baseline-Balken im Gantt sichtbar (toggle ein/aus)
- Dashboard zeigt Terminabweichung pro Vorgang
- Baselines sind persistent (localStorage)

---

#### ANF-002: Kosten-Tracking
**Kategorie:** KERN | **Größe:** M | **Abhängigkeiten:** –

Jeder Vorgang muss geplante Kosten (PLAN) und tatsächliche Kosten (IST) tragen können. Die Kosten setzen sich zusammen aus: Ressourcenkosten (Stundensatz × zugeordneter Aufwand), festen Vorgangskosten (z.B. Materialbestellung) und manuellen Ist-Kosten. Im Dashboard muss eine Kostenübersicht angezeigt werden: Gesamtbudget, verbraucht, verbleibend, Prognose.

**Datenmodell-Erweiterung:**
```javascript
// Task-Erweiterung
{
  ...existingTask,
  festeKosten: Number,       // Fixkosten pro Vorgang (€)
  istKosten: Number,         // Tatsächlich angefallen (€)
}

// Berechnung (in neuem utils/costs.js)
planKosten(task) = festeKosten + Σ(assignment.aufwand × resource.kostenProStunde)
istKosten(task) = task.istKosten + Σ(istAufwand × resource.kostenProStunde)
```

**Akzeptanzkriterien:**
- Kosten im Detail-Panel editierbar
- Dashboard-KPI: Budget, Verbraucht, Delta, CPI
- Sammelvorgang aggregiert Kosten der Kinder

---

#### ANF-003: Erweiterte Earned-Value-Analyse (EVM)
**Kategorie:** KERN | **Größe:** S | **Abhängigkeiten:** ANF-001, ANF-002

Die bestehende EVA (`src/utils/eva.js`) muss um folgende Kennzahlen erweitert werden: AC (Actual Cost), CPI (Cost Performance Index = EV/AC), EAC (Estimate at Completion = BAC/CPI), ETC (Estimate to Complete = EAC − AC), VAC (Variance at Completion = BAC − EAC). Im Dashboard soll ein EVM-Chart (S-Kurve) die zeitliche Entwicklung von PV, EV und AC visualisieren.

**Akzeptanzkriterien:**
- Alle 7 EVM-Kennzahlen berechnet und im Dashboard angezeigt
- S-Kurve als Liniendiagramm (recharts)
- Ampel-Logik: CPI < 0,9 = rot, 0,9–1,0 = gelb, > 1,0 = grün

---

#### ANF-004: Constraints (Einschränkungstypen)
**Kategorie:** KERN | **Größe:** M | **Abhängigkeiten:** –

Vorgänge müssen mit Einschränkungstypen versehen werden können, die die CPM-Berechnung beeinflussen. Mindestens vier Typen sind erforderlich: „So früh wie möglich" (ASAP, Standard), „So spät wie möglich" (ALAP), „Muss anfangen am" (MSO – fixes Startdatum), „Nicht früher anfangen als" (SNET). Diese Constraints erweitern die Flexibilität der Terminplanung erheblich und sind in professionellen Tools Standard.

**Datenmodell-Erweiterung:**
```javascript
{
  ...existingTask,
  constraint: {
    typ: 'ASAP' | 'ALAP' | 'MSO' | 'SNET' | 'SNLT' | 'FNET' | 'FNLT' | 'MFO',
    datum: ISO-Date | null   // nur bei datumsgebundenen Constraints
  }
}
```

**CPM-Erweiterung in `src/utils/cpm.js`:**
- ASAP: Keine Änderung (Standard)
- MSO: FAZ = constraint.datum (ignoriert Vorgänger, wenn constraint.datum > berechneter FAZ)
- SNET: FAZ = max(berechneter FAZ, constraint.datum)
- ALAP: Rückwärtsrechnung priorisieren

**Akzeptanzkriterien:**
- Constraint im Detail-Panel auswählbar (Dropdown + Datumsfeld)
- CPM berücksichtigt Constraints korrekt
- Visueller Indikator im Gantt (Icon am Balken)

---

#### ANF-005: Filter, Suche und Ansichten
**Kategorie:** UX | **Größe:** M | **Abhängigkeiten:** –

Die Vorgangsliste und das Gantt-Diagramm müssen filterbar sein. Mindestens folgende Filter sind nötig: Nach Status (Offen, In Arbeit, Abgeschlossen), nach Kritischem Pfad (nur kritische Vorgänge), nach Ressource (alle Vorgänge einer Person), nach Überfällig (FAZ < heute und Fortschritt < 100 %). Zusätzlich muss eine Volltextsuche über Vorgangsnamen verfügbar sein. Gespeicherte Filtersets (Ansichten) ermöglichen schnellen Wechsel.

**Akzeptanzkriterien:**
- Filter-Bar oberhalb der Tabelle (Chips/Dropdowns)
- Suche per Ctrl+F oder Suchfeld in Topbar
- Mindestens 4 vordefinierte Filter
- Filter wirken gleichzeitig auf Tabelle und Gantt-Diagramm

---

#### ANF-006: Virtualisierung der Vorgangsliste
**Kategorie:** PERF | **Größe:** M | **Abhängigkeiten:** –

Die Vorgangstabelle und das Gantt-Diagramm müssen bei 200+ Vorgängen flüssig bleiben. Die Tabelle muss virtualisiert werden (nur sichtbare Zeilen im DOM). Das SVG-Diagramm muss Viewport-Clipping nutzen (nur sichtbare Balken rendern). Scroll-Performance-Ziel: 60 FPS bei 500 Vorgängen.

**Technische Umsetzung:**
- react-window oder @tanstack/virtual für Tabellen-Virtualisierung
- SVG-Viewport-Clipping basierend auf scrollTop + sichtbarer Höhe
- ID-Index (`Map<id, task>`) statt Array-`.find()`

**Akzeptanzkriterien:**
- 200 Vorgänge: kein spürbarer Unterschied zu 20 Vorgängen
- 500 Vorgänge: flüssiges Scrollen (≥30 FPS)
- Lighthouse Performance-Score ≥ 80

---

#### ANF-007: Report-Export
**Kategorie:** INT | **Größe:** M | **Abhängigkeiten:** ANF-001, ANF-002

Das Tool muss Projektdaten in mindestens zwei Formate exportieren können: PDF (Gantt-Diagramm als druckbare Ansicht, Projektübersicht mit KPIs) und Excel/CSV (Vorgangsliste mit allen Feldern, Ressourcen-Auslastung, Kostenübersicht). Der Gantt-Export muss druckoptimiert sein (Querformat, passende Seitenumbrüche).

**Akzeptanzkriterien:**
- Export-Menü in Topbar (PDF, Excel, CSV, JSON)
- PDF enthält Gantt-Diagramm + Projektzusammenfassung
- Excel enthält Vorgangsliste, Ressourcen, Kosten als Sheets
- JSON-Export bleibt erhalten (Reimport-fähig)

---

### 5.3 P2 – Wichtige Anforderungen

#### ANF-008: Resource Leveling (Ressourcen-Nivellierung)
**Kategorie:** KERN | **Größe:** L | **Abhängigkeiten:** ANF-004

Das Tool soll einen Resource-Leveling-Algorithmus bieten, der überlastete Ressourcen automatisch entlastet, indem er nicht-kritische Vorgänge innerhalb ihres Puffers verschiebt. Der Algorithmus soll schrittweise vorgehen: zuerst Puffer nutzen, dann Vorgänge mit niedrigerer Priorität verschieben, dann Abhängigkeiten berücksichtigen. Das Ergebnis soll als Vorschlag angezeigt werden (nicht automatisch angewendet), damit der Nutzer entscheiden kann.

**Algorithmus (in neuem `src/utils/leveling.js`):**
```
1. Identifiziere alle Tage mit Ressourcen-Überlastung
2. Für jeden überlasteten Tag:
   a. Sammle alle zugeordneten Vorgänge der Ressource
   b. Sortiere nach Leveling-Score: GP (absteigend), Dauer, ID
   c. Verschiebe den Vorgang mit dem höchsten GP um 1 Arbeitstag
   d. Prüfe, ob Überlastung behoben
3. Wiederhole bis keine Überlastung oder max. Iterationen erreicht
```

**Akzeptanzkriterien:**
- Button „Ressourcen nivellieren" in Ressourcen-Ansicht
- Vorschau der Änderungen vor Anwendung (Diff-Ansicht)
- Undo möglich (über Undo/Redo-Stack)
- Warnung, wenn Leveling Projektende verschiebt

---

#### ANF-009: Gantt-Zoom und Zeitskalierung
**Kategorie:** VIS | **Größe:** M | **Abhängigkeiten:** –

Das Gantt-Diagramm muss verschiedene Zoom-Stufen unterstützen: Tage (aktuell, detailliert), Wochen (1 Spalte = 1 Woche, für Projekte 1–6 Monate), Monate (1 Spalte = 1 Monat, für Projekte 6–24 Monate) und Quartale (1 Spalte = 1 Quartal, für Jahresprojekte). Die Zeitskalierung muss über einen Zoom-Slider oder Buttons (+/−) steuerbar sein. Der Header muss sich anpassen (bei Wochen: KW-Nummern, bei Monaten: Monatsnamen).

**Akzeptanzkriterien:**
- 4 Zoom-Stufen über Buttons oder Slider
- Header passt sich an (Tage → KW → Monate → Quartale)
- Zoom zentriert auf aktuellen Viewport
- Heute-Linie bleibt in allen Stufen sichtbar

---

#### ANF-010: Inline-Editing in der Gantt-Tabelle
**Kategorie:** UX | **Größe:** M | **Abhängigkeiten:** –

Vorgangsfelder sollen direkt in der Tabelle editierbar sein (Inline-Edit), ohne das Detail-Panel öffnen zu müssen. Mindestens folgende Felder: Name (Doppelklick → Textfeld), Dauer (Doppelklick → Zahlenfeld mit Einheit), Fortschritt (Doppelklick → Slider oder Zahlenfeld), Ressource (Doppelklick → Dropdown). Tab navigiert zum nächsten Feld, Enter bestätigt, Esc bricht ab.

**Akzeptanzkriterien:**
- Doppelklick auf Zelle aktiviert Inline-Edit
- Tab-Navigation zwischen Zellen (wie in Excel)
- Enter bestätigt, Esc bricht ab
- Änderungen lösen CPM-Neuberechnung aus

---

#### ANF-011: Barrierefreiheit (Accessibility, WCAG 2.1 AA)
**Kategorie:** UX | **Größe:** M | **Abhängigkeiten:** –

Alle interaktiven Elemente müssen ARIA-Labels tragen. Die Gantt-Tabelle muss per Tastatur vollständig navigierbar sein (Pfeiltasten zwischen Zeilen/Spalten, Enter zum Öffnen, Space zum Togglen). Farben allein dürfen keine Information tragen (zusätzlich Muster oder Icons). Kontraste müssen WCAG 2.1 AA erfüllen (4.5:1 für Text, 3:1 für große Elemente). Screen-Reader-Unterstützung für Tabelle, Navigation und Dialoge.

**Akzeptanzkriterien:**
- axe-core oder Lighthouse Accessibility-Score ≥ 90
- Komplette Tastaturnavigation ohne Maus möglich
- Screen-Reader kann alle wesentlichen Inhalte vorlesen

---

#### ANF-012: Abhängigkeiten visuell erstellen (Link-Modus)
**Kategorie:** UX | **Größe:** M | **Abhängigkeiten:** –

Im Gantt-Diagramm soll es einen „Verknüpfungsmodus" geben: Der Nutzer aktiviert ihn per Button oder Tastenkürzel, klickt dann auf Vorgang A (Start der Verknüpfung) und zieht eine Linie zu Vorgang B (Ziel). Beim Loslassen wird ein Abhängigkeits-Dialog geöffnet (Typ auswählen, Zeitversatz eingeben). Dies entspricht dem Workflow in MS Project und ist erheblich intuitiver als die aktuelle Methode über das Detail-Panel.

**Akzeptanzkriterien:**
- Link-Modus per Button (Kettensymbol) oder Shift+L aktivierbar
- Visuelle Linie folgt der Maus beim Ziehen
- Abhängigkeits-Dialog bei Drop mit Typ + Zeitversatz
- Bestehende Abhängigkeiten per Klick auf Pfeil editierbar

---

#### ANF-013: Mehrfachauswahl und Massenbearbeitung
**Kategorie:** UX | **Größe:** M | **Abhängigkeiten:** –

Der Nutzer soll mehrere Vorgänge gleichzeitig auswählen können (Ctrl+Klick, Shift+Klick für Bereich) und gemeinsam bearbeiten: Löschen, Ressource zuweisen, Fortschritt setzen, Einrücken/Ausrücken. Im Gantt-Diagramm sollen ausgewählte Balken hervorgehoben sein.

**Akzeptanzkriterien:**
- Ctrl+Klick: Toggle einzelner Vorgang in Auswahl
- Shift+Klick: Bereichsauswahl von letztem zu aktuellem
- Toolbar zeigt Massenaktionen bei Mehrfachauswahl
- Entf löscht alle ausgewählten Vorgänge

---

### 5.4 P3 – Wünschenswerte Anforderungen

#### ANF-014: Projekt-Kalender pro Ressource
**Kategorie:** KERN | **Größe:** S | **Abhängigkeiten:** –

Neben dem Projektkalender soll jede Ressource einen eigenen Kalender haben können (z.B. Teilzeit Mo–Mi, Urlaub). Die CPM-Berechnung muss den Ressourcenkalender berücksichtigen, wenn der Vorgang eine zugeordnete Ressource hat.

---

#### ANF-015: Automatisierte Benachrichtigungen
**Kategorie:** UX | **Größe:** S | **Abhängigkeiten:** –

Das Tool soll bei bestimmten Ereignissen visuelle In-App-Benachrichtigungen anzeigen: Vorgang überfällig (FAZ überschritten), Meilenstein in ≤ 3 Tagen, Ressource überlastet, Projektende verschoben. Die Benachrichtigungen erscheinen als Badge in der Sidebar und als Liste in einem Benachrichtigungs-Panel.

---

#### ANF-016: Custom Fields (Benutzerdefinierte Felder)
**Kategorie:** KERN | **Größe:** M | **Abhängigkeiten:** –

Der Nutzer soll eigene Felder pro Vorgang definieren können (Text, Zahl, Datum, Auswahl). Dies ermöglicht firmenspezifische Anpassungen ohne Code-Änderungen (z.B. „Kostenstelle", „Gewerk", „Priorität intern").

---

#### ANF-017: Risikomanagement
**Kategorie:** KERN | **Größe:** L | **Abhängigkeiten:** –

Vorgänge sollen mit Risiken versehen werden können: Beschreibung, Eintrittswahrscheinlichkeit (1–5), Auswirkung (1–5), Risikowert (Wahrscheinlichkeit × Auswirkung), Maßnahmen. Im Dashboard soll eine Risiko-Matrix (Heatmap 5×5) die Projektrisiken visualisieren.

---

#### ANF-018: Kommentare und Notizen-System
**Kategorie:** UX | **Größe:** S | **Abhängigkeiten:** –

Jeder Vorgang soll ein Notizen-/Kommentarfeld mit Zeitstempel haben. Dies dient der Dokumentation von Entscheidungen und Änderungsgründen – essenziell für Projekte mit Nachweispflicht.

---

#### ANF-019: Template-System mit Vorschau
**Kategorie:** UX | **Größe:** M | **Abhängigkeiten:** –

Vor dem Laden einer Vorlage soll eine Vorschau angezeigt werden (Miniatur-Gantt, Vorgangsanzahl, Dauer, Beschreibung). Zusätzlich sollen benutzerdefinierte Vorlagen gespeichert werden können (aktuelles Projekt als Vorlage speichern).

---

#### ANF-020: Druckansicht
**Kategorie:** VIS | **Größe:** S | **Abhängigkeiten:** ANF-009

Eine druckoptimierte Ansicht des Gantt-Diagramms mit automatischen Seitenumbrüchen, Kopf-/Fußzeile (Projektname, Datum, Seitenzahl) und wählbarem Maßstab.

---

### 5.5 P4 – Langfristige Anforderungen

#### ANF-021: Multi-User und Cloud-Backend
**Kategorie:** ARCH | **Größe:** XL | **Abhängigkeiten:** –

Migration von localStorage zu einem Cloud-Backend (Supabase, Firebase oder eigener Server). Authentifizierung (OAuth2), Echtzeit-Synchronisation (WebSocket/CRDT), Rollen und Berechtigungen (Admin, Projektleiter, Mitarbeiter, Betrachter).

---

#### ANF-022: Agile-Erweiterung (Sprints)
**Kategorie:** KERN | **Größe:** L | **Abhängigkeiten:** –

Sprint-Planung: Sprints als Zeitcontainer definieren, Vorgänge Sprints zuordnen, Burndown-Chart pro Sprint, Velocity-Tracking. Dies vervollständigt das Hybrid-PM-Konzept.

---

#### ANF-023: KI-gestützte Features
**Kategorie:** KERN | **Größe:** XL | **Abhängigkeiten:** ANF-021

Integration von KI-Features: Automatische Dauerschätzung basierend auf historischen Daten, Risikovorhersage (welche Vorgänge werden wahrscheinlich verzögert?), Ressourcen-Optimierungsvorschläge, automatische Berichterstellung.

---

#### ANF-024: Electron-Desktop-App
**Kategorie:** ARCH | **Größe:** L | **Abhängigkeiten:** –

Paketierung als Desktop-App (.exe/.dmg) mit Electron für firmeninternes Deployment ohne Browser-Abhängigkeit. Inklusive Auto-Update, lokaler Dateispeicherung und nativen Dialogen.

---

#### ANF-025: API und Integrationen
**Kategorie:** INT | **Größe:** L | **Abhängigkeiten:** ANF-021

REST-API für externe Integrationen: Webhooks bei Änderungen, Import/Export-Schnittstellen (MS Project XML, Jira CSV), Kalender-Sync (iCal, Google Calendar).

---

### 5.6 P2/P3 – Neue strategische Anforderungen (Marktvorbereitung)

#### ANF-026: RACI-Management (Responsibility Assignment Matrix)
**Kategorie:** KERN | **Größe:** M | **Abhängigkeiten:** –

Das Tool muss eine RACI-Matrix als eigene Ansicht bieten. RACI steht für Responsible (führt die Arbeit aus), Accountable (trägt die Verantwortung – genau eine Person pro Vorgang), Consulted (wird vor der Entscheidung befragt) und Informed (wird über Ergebnisse informiert). Die Matrix wird als Tabelle dargestellt: Vorgänge in den Zeilen, Ressourcen in den Spalten, RACI-Rollen als farbcodierte Zellen (R=blau, A=rot, C=gelb, I=grau).

Die RACI-Ansicht soll in der Sidebar als eigener Tab verfügbar sein (neben Gantt, Board, Netzplan, Dashboard, Ressourcen). Sie ist keine isolierte Funktion, sondern nutzt die bestehenden Ressourcen und Zuordnungen und erweitert sie um die Rollendimension.

**Datenmodell-Erweiterung:**
```javascript
// Assignment-Erweiterung (bestehende Zuordnung erweitern)
{
  ...existingAssignment,
  raciRolle: 'R' | 'A' | 'C' | 'I'   // NEU: RACI-Rolle
}

// Validierungsregeln:
// - Genau ein 'A' (Accountable) pro Vorgang (Pflicht)
// - Mindestens ein 'R' (Responsible) pro Vorgang (Pflicht)
// - Beliebig viele 'C' und 'I' pro Vorgang
// - Eine Person kann pro Vorgang nur eine Rolle haben
```

**UI-Konzept:**
```
RACI-Matrix-Ansicht:
┌──────────────────┬──────────┬──────────┬──────────┬──────────┐
│ Vorgang          │ Müller   │ Schmidt  │ Weber    │ Fischer  │
├──────────────────┼──────────┼──────────┼──────────┼──────────┤
│ 1.1 Planung      │    A     │    R     │    C     │    I     │
│ 1.2 Umsetzung    │    I     │    A     │    R     │    R     │
│ 1.3 Test         │    C     │    I     │    A     │    R     │
│ 2.0 Abnahme      │    A     │    C     │    I     │    R     │
└──────────────────┴──────────┴──────────┴──────────┴──────────┘
  Klick auf Zelle → Dropdown (R/A/C/I/leer)
  Farben: R=blau, A=rot, C=gelb, I=grau
```

**Akzeptanzkriterien:**
- RACI-Tab in der Sidebar-Navigation
- Matrix mit Klick-auf-Zelle-Bearbeitung (Dropdown R/A/C/I/leer)
- Validierung: Warnung wenn kein A oder kein R für einen Vorgang
- Farbcodierung der Zellen nach RACI-Rolle
- Filter: „Zeige nur Vorgänge von Ressource X" oder „Zeige nur Vorgänge ohne A"
- Export der RACI-Matrix als Teil des Excel-/PDF-Exports (ANF-007)

---

#### ANF-027: Anforderungsmanagement – Lastenheft-Import
**Kategorie:** KERN | **Größe:** L | **Abhängigkeiten:** ANF-016

Das Tool soll Lastenheft-Dokumente (DOCX/PDF) importieren und daraus automatisch eine Projektstruktur generieren können. Der Import-Workflow basiert auf strukturierter Textextraktion: Das hochgeladene Dokument wird geparst, Anforderungen werden anhand von Mustern erkannt (Nummerierung, Schlüsselwörter wie „muss", „soll", „kann"; Überschriftenstruktur) und als Vorgänge mit Hierarchie angelegt.

Dieser Workflow orientiert sich an der Struktur nach VDI 2519 (Vorgehensweise bei der Erstellung von Lasten-/Pflichtenheften) und DIN 69901 (Projektmanagement-Begriffe). Das Lastenheft beschreibt WAS der Auftraggeber will (Anforderungen), das Pflichtenheft beschreibt WIE der Auftragnehmer es umsetzt (Lösung). Beide folgen typischerweise einer hierarchischen Struktur, die sich direkt auf einen PSP abbilden lässt.

**Import-Pipeline:**
```
Lastenheft (DOCX/PDF)
    │
    ▼
┌──────────────────┐
│ 1. Dokument      │  Datei einlesen, Text extrahieren
│    parsen         │  (mammoth.js für DOCX, pdf.js für PDF)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 2. Struktur      │  Überschriften → Phasen (Sammelvorgänge)
│    erkennen       │  Nummerierte Punkte → Vorgänge
│                   │  Muss/Soll/Kann → Priorität
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 3. Anforderungen │  Jede erkannte Anforderung wird zu einem
│    → Vorgänge     │  Vorgang mit: Name, Beschreibung, Priorität,
│                   │  Eltern-Sammelvorgang, geschätzte Dauer (?)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 4. Review &      │  Nutzer sieht Vorschlag in einer Tabelle,
│    Anpassung      │  kann Vorgänge umbenennen, löschen, verschieben
│                   │  bevor der Import übernommen wird
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 5. Projekt       │  Vorgänge werden ins Projekt eingefügt,
│    generieren     │  PSP-Codes zugewiesen, CPM berechnet
└──────────────────┘
```

**Datenmodell-Erweiterung:**
```javascript
// Neue Entität: Anforderung (verknüpft mit Vorgang)
createAnforderung(overrides) → {
  id: uuid(),
  vorgangId: UUID | null,       // Verknüpfung zum generierten Vorgang
  quelle: String,               // z.B. "Lastenheft_Projekt_X.docx"
  kapitelNr: String,            // z.B. "3.2.1"
  text: String,                 // Originaltext der Anforderung
  typ: 'muss' | 'soll' | 'kann',  // Anforderungstyp (MoSCoW: Must/Should/Could)
  status: 'offen' | 'umgesetzt' | 'verifiziert' | 'abgelehnt',
  pruefkriterium: String,       // Wie wird geprüft, ob erfüllt?
  kommentar: String
}

// Project-Erweiterung
{
  ...existingProject,
  anforderungen: []             // Array von Anforderungen
}
```

**Akzeptanzkriterien:**
- Upload-Button in Topbar: „Lastenheft importieren" (DOCX/PDF)
- Vorschau-Dialog mit erkannten Anforderungen vor dem Import
- Jede Anforderung wird als Vorgang angelegt (Nutzer kann anpassen)
- Traceability: Jeder Vorgang zeigt die verknüpfte Anforderung
- Anforderungsliste als eigene Ansicht (Tabelle mit Status, Typ, Prüfkriterium)
- Filter: „Zeige nur Muss-Anforderungen" oder „Zeige nicht umgesetzte"

---

#### ANF-028: Anforderungsmanagement – Pflichtenheft-Generierung
**Kategorie:** KERN | **Größe:** L | **Abhängigkeiten:** ANF-027, ANF-007

Aus einem laufenden Projekt soll ein Pflichtenheft als DOCX-Dokument generiert werden können. Das Pflichtenheft beschreibt, wie die Anforderungen des Lastenhefts umgesetzt werden – mit Bezug auf die Projektstruktur, Termine, Ressourcen und Kosten.

**Generierungs-Template (Pflichtenheft nach VDI 2519):**
```
1. Einleitung
   1.1 Projektziel (aus Projekteinstellungen)
   1.2 Geltungsbereich
   1.3 Referenzdokumente (verknüpftes Lastenheft)

2. Anforderungsübersicht
   2.1 Muss-Anforderungen (aus Anforderungsliste)
   2.2 Soll-Anforderungen
   2.3 Kann-Anforderungen

3. Lösungsbeschreibung
   [Pro Sammelvorgang/Phase:]
   3.x Phasenname
       - Vorgänge mit Beschreibung
       - Zugeordnete Ressourcen
       - Geplante Termine (FAZ–FEZ)
       - Verknüpfte Anforderungen

4. Terminplan
   - Gantt-Diagramm (als Bild eingebettet)
   - Meilensteinliste mit Terminen

5. Ressourcenplan
   - RACI-Matrix (wenn vorhanden)
   - Ressourcen-Auslastung

6. Kostenplan (wenn ANF-002 implementiert)
   - Kostenübersicht pro Phase
   - Gesamtbudget

7. Risiken (wenn ANF-017 implementiert)
   - Risikomatrix
   - Top-5-Risiken mit Maßnahmen

8. Abnahmekriterien
   - Prüfkriterien aus Anforderungsliste
```

**Akzeptanzkriterien:**
- Button „Pflichtenheft generieren" in Export-Menü
- DOCX-Ausgabe mit professioneller Formatierung (Inhaltsverzeichnis, Kopfzeile, Seitennummern)
- Gantt-Diagramm als eingebettetes Bild
- Alle verknüpften Anforderungen mit Traceability-Nummern
- Anpassbares Template (Kapitelstruktur konfigurierbar)

---

#### ANF-029: Anforderungs-Traceability-Matrix
**Kategorie:** KERN | **Größe:** M | **Abhängigkeiten:** ANF-027

Eine Traceability-Matrix verknüpft Anforderungen bidirektional mit Vorgängen und zeigt den Umsetzungsstatus. Diese Matrix ist in regulierten Branchen (Medizintechnik, Automotive, Bau) oft Pflicht und ein starkes Differenzierungsmerkmal.

**UI-Konzept:**
```
Traceability-Matrix:
┌──────────┬────────────────┬──────────────┬────────────┬──────────┐
│ Anf.-Nr. │ Anforderung    │ Vorgang(s-ID)│ Status     │ Prüfung  │
├──────────┼────────────────┼──────────────┼────────────┼──────────┤
│ LH-001   │ System muss... │ 1.2.1, 1.2.3│ Umgesetzt  │ Test #4  │
│ LH-002   │ Schnittstelle..│ 1.3.1       │ In Arbeit  │ –        │
│ LH-003   │ Verfügbarkeit..│ –           │ ⚠ Nicht    │ –        │
│          │                │             │ zugeordnet │          │
└──────────┴────────────────┴──────────────┴────────────┴──────────┘
  Rot: Nicht zugeordnet, Orange: In Arbeit, Grün: Verifiziert
```

**Akzeptanzkriterien:**
- Eigene Ansicht „Traceability" oder Unterreiter der Anforderungsliste
- Bidirektionale Verknüpfung (Anforderung → Vorgang und Vorgang → Anforderung)
- Farbcodierter Status (rot/orange/grün)
- Warnung bei verwaisten Anforderungen (keinem Vorgang zugeordnet)
- Export als Tabelle (Excel, PDF)

---

#### ANF-030: CCPM-Erweiterung (Critical Chain Project Management)
**Kategorie:** KERN | **Größe:** L | **Abhängigkeiten:** ANF-008

Als optionale Ergänzung zum CPM soll das Tool CCPM-Puffer unterstützen. CCPM basiert auf der Theory of Constraints (Goldratt, 1997) und adressiert das Problem, dass individuelle Aufgabenpuffer systematisch verschwendet werden (Student Syndrome, Parkinson's Law). Statt jeder Aufgabe einzeln Sicherheitspuffer zu geben, werden Puffer auf Projektebene gepoolt.

**Konzept:**

Die „Critical Chain" (kritische Kette) ist der längste Pfad durch das Projekt unter Berücksichtigung von sowohl Aufgabenabhängigkeiten als auch Ressourcenverfügbarkeit. Sie unterscheidet sich vom „Critical Path" (CPM), der nur Aufgabenabhängigkeiten betrachtet. CCPM fügt drei Puffertypen hinzu: den Project Buffer (PB) am Ende der kritischen Kette (schützt den Fertigstellungstermin), Feeding Buffers (FB) an jedem Einspeisepunkt in die kritische Kette (schützt vor Verzögerungen auf Nebenpfaden) und den Resource Buffer (ein Signal an Ressourcen, dass sie bald auf der kritischen Kette gebraucht werden).

Die Puffergrößen werden typischerweise mit der Root-Sum-Square-Methode berechnet: PB = √(Σ(Sicherheit_i²)) wobei Sicherheit_i = optimistische_Dauer − aggressive_Dauer für jeden Vorgang auf der kritischen Kette.

Das Monitoring erfolgt über ein Buffer-Consumption-Chart: Solange der verbrauchte Puffer prozentual kleiner ist als der Projektfortschritt, ist das Projekt im grünen Bereich.

**Datenmodell-Erweiterung:**
```javascript
// Task-Erweiterung für CCPM
{
  ...existingTask,
  dauerAggressiv: Number | null,    // Dauer ohne Sicherheit (50%-Schätzung)
  dauerSicher: Number | null,       // Dauer mit Sicherheit (90%-Schätzung)
  // dauer bleibt = dauerAggressiv (CCPM-Modus)
}

// Neue Entitäten
createPuffer(overrides) → {
  id: uuid(),
  typ: 'PB' | 'FB' | 'RB',
  dauer: Number,                    // Berechnete Pufferdauer in Tagen
  verbraucht: Number,               // Tatsächlich verbrauchte Tage
  position: {                       // Wo im Plan liegt der Puffer?
    nachVorgangId: UUID,
    vorVorgangId: UUID | null
  }
}
```

**Akzeptanzkriterien:**
- CCPM als optionaler Modus (Toggle in Projekteinstellungen: „CPM" oder „CCPM")
- Aggressive und sichere Dauerschätzung pro Vorgang
- Automatische Berechnung der Puffergrößen (Root-Sum-Square)
- Puffer als eigene Elemente im Gantt (gelbe Balken)
- Buffer-Consumption-Chart im Dashboard (Fever Chart)
- Kritische Kette farblich hervorgehoben (anders als kritischer Pfad)

---

### 5.7 P5 – Marktfähigkeit und Geschäftsmodell

#### ANF-031: Geschäftsmodell-Architektur (Freemium / Open Core)
**Kategorie:** ARCH | **Größe:** L | **Abhängigkeiten:** ANF-021

Das Tool soll so architektonisch aufgebaut sein, dass es als Freemium- oder Open-Core-Produkt vermarktet werden kann. Dazu muss die Codebasis in einen Kern (kostenlos) und Premium-Module (kostenpflichtig) trennbar sein. Der Kern enthält: Gantt-Diagramm, CPM-Berechnung, Kanban-Board, Netzplan, Baselines, bis zu 3 Projekte, bis zu 200 Vorgänge pro Projekt. Die Premium-Module enthalten: Anforderungsmanagement (ANF-027/028/029), RACI-Matrix (ANF-026), CCPM (ANF-030), Kosten-Tracking (ANF-002), Resource Leveling (ANF-008), unbegrenzte Projekte/Vorgänge, PDF/Excel-Export, Cloud-Sync.

**Technische Umsetzung:**
```javascript
// Feature-Flags in eigenem Modul
// src/config/features.js
export const FEATURES = {
  // Kostenlos
  gantt: true,
  cpm: true,
  board: true,
  network: true,
  baselines: true,
  maxProjekte: 3,
  maxVorgaenge: 200,

  // Premium
  anforderungen: false,
  raci: false,
  ccpm: false,
  kostenTracking: false,
  resourceLeveling: false,
  pdfExport: false,
  xlsxExport: false,
  cloudSync: false,
  unlimitedProjekte: false,
  unlimitedVorgaenge: false,
};

// Prüfung in Komponenten:
if (!FEATURES.raci) {
  return <UpgradeHint feature="RACI-Matrix" />;
}
```

**Akzeptanzkriterien:**
- Feature-Flag-System für alle Premium-Features
- Upgrade-Hinweis (kein harter Block, sondern freundlicher Hinweis mit Vorteilen)
- Lizenzschlüssel-Mechanismus (offline-fähig, kein Server nötig für v1)
- Keine Funktionseinschränkung der kostenlosen Version, die das Tool unbrauchbar macht

---

## 6. Architektur-Entwurf

### 6.1 Aktuelle Architektur (Ist-Zustand)

```
┌─────────────────────────────────────────────┐
│                   Browser                    │
├─────────────────────────────────────────────┤
│  App.jsx (State: projekt, activeTab,        │
│           undoStack, redoStack)              │
│  ┌──────────┬──────────┬──────────┐         │
│  │ GanttView│ BoardView│NetworkVw │ ...     │
│  │ (Props)  │ (Props)  │ (Props)  │         │
│  └────┬─────┴────┬─────┴────┬─────┘         │
│       │          │          │                │
│  ┌────▼──────────▼──────────▼─────┐         │
│  │         utils/ (reine Fkt.)     │         │
│  │  cpm.js │ calendar.js │ eva.js  │         │
│  │  hierarchy.js │ resources.js    │         │
│  └────────────────┬───────────────┘         │
│                   │                          │
│  ┌────────────────▼───────────────┐         │
│  │      storage.js (localStorage)  │         │
│  └─────────────────────────────────┘         │
└─────────────────────────────────────────────┘
```

**Probleme des Ist-Zustands:**
- Props-Drilling 4 Ebenen tief → schwer wartbar
- Kein zentraler State-Manager → inkonsistente Updates möglich
- Monolithische Komponenten (GanttDiagram.jsx) → schwer testbar
- Keine Abstraktion für Geschäftslogik → UI und Logik vermischt
- Keine Error-Boundaries → ein Fehler crasht die gesamte App
- Array-basierte Lookups überall → O(n) statt O(1)

### 6.2 Ziel-Architektur (v2.0)

Die Ziel-Architektur folgt drei Prinzipien: Separation of Concerns (UI ≠ Geschäftslogik ≠ Persistierung), Performance by Default (Indizierung, Virtualisierung, Memoization) und Erweiterbarkeit (Plugin-fähige Struktur für Custom Fields, Filter, Exporte).

```
┌──────────────────────────────────────────────────────────────┐
│                          Browser                              │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    UI-Schicht (React)                     │  │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌────────────┐   │  │
│  │  │  Gantt   │ │  Board   │ │ Network │ │  Dashboard │   │  │
│  │  │  View    │ │  View    │ │  View   │ │   View     │   │  │
│  │  └────┬────┘ └────┬─────┘ └────┬────┘ └─────┬──────┘   │  │
│  │       │           │            │             │           │  │
│  │  ┌────▼───────────▼────────────▼─────────────▼────────┐ │  │
│  │  │              Shared UI Components                   │ │  │
│  │  │  TaskRow │ TaskCard │ FilterBar │ InlineEditor │    │ │  │
│  │  │  Timeline │ DependencyArrow │ ContextMenu          │ │  │
│  │  └───────────────────────┬────────────────────────────┘ │  │
│  └──────────────────────────┼──────────────────────────────┘  │
│                             │                                  │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │                   State-Schicht (Zustand)                │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │              useProjectStore (Zustand)             │   │  │
│  │  │                                                    │   │  │
│  │  │  State:                                            │   │  │
│  │  │  ├─ projekt: Project                               │   │  │
│  │  │  ├─ taskIndex: Map<id, Task>     ← O(1) Lookup    │   │  │
│  │  │  ├─ baselines: Baseline[]                          │   │  │
│  │  │  ├─ filter: FilterConfig                           │   │  │
│  │  │  ├─ selection: Set<id>           ← Mehrfachauswahl│   │  │
│  │  │  ├─ undoStack / redoStack                          │   │  │
│  │  │  └─ ui: { activeTab, sidePanel, zoom, ... }       │   │  │
│  │  │                                                    │   │  │
│  │  │  Actions:                                          │   │  │
│  │  │  ├─ updateTask(id, changes)                        │   │  │
│  │  │  ├─ addTask(parentId?) / deleteTask(id)            │   │  │
│  │  │  ├─ addDependency() / removeDependency()           │   │  │
│  │  │  ├─ setBaseline(name) / compareBaseline(id)        │   │  │
│  │  │  ├─ setFilter(config) / clearFilter()              │   │  │
│  │  │  ├─ undo() / redo()                                │   │  │
│  │  │  └─ recalculate()  ← CPM + Kosten + EVA           │   │  │
│  │  └────────────────────────┬───────────────────────────┘   │  │
│  └───────────────────────────┼──────────────────────────────┘  │
│                              │                                  │
│  ┌───────────────────────────▼──────────────────────────────┐  │
│  │                 Berechnungs-Schicht (Pure)                │  │
│  │                                                            │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐    │  │
│  │  │  cpm.js    │ │ calendar.js│ │     eva.js         │    │  │
│  │  │  (erweitert│ │ (erweitert │ │  (7 KPIs statt 3)  │    │  │
│  │  │  +Constr.) │ │ +Res.Kal.) │ │                    │    │  │
│  │  └────────────┘ └────────────┘ └────────────────────┘    │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐    │  │
│  │  │ leveling.js│ │  costs.js  │ │   hierarchy.js     │    │  │
│  │  │  (NEU)     │ │  (NEU)     │ │  (erweitert)       │    │  │
│  │  └────────────┘ └────────────┘ └────────────────────┘    │  │
│  │  ┌────────────┐ ┌────────────┐                            │  │
│  │  │resources.js│ │ filters.js │                            │  │
│  │  │(erweitert) │ │  (NEU)     │                            │  │
│  │  └────────────┘ └────────────┘                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌───────────────────────────▼──────────────────────────────┐  │
│  │                 Persistierungs-Schicht                     │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────┐     │  │
│  │  │              StorageAdapter (Interface)            │     │  │
│  │  │  speichern(key, value) │ laden(key) │ loeschen()  │     │  │
│  │  └───────────┬──────────────────────────┬────────────┘     │  │
│  │              │                          │                   │  │
│  │  ┌───────────▼──────────┐  ┌───────────▼──────────┐       │  │
│  │  │  LocalStorageAdapter │  │   IndexedDBAdapter   │       │  │
│  │  │  (aktuell, <5MB)     │  │   (NEU, >50MB)       │       │  │
│  │  └──────────────────────┘  └──────────────────────┘       │  │
│  │              │                          │                   │  │
│  │  ┌───────────▼──────────────────────────▼──────────┐       │  │
│  │  │           Export-Engine                          │       │  │
│  │  │  JSON │ PDF (jsPDF) │ XLSX (SheetJS) │ CSV      │       │  │
│  │  └─────────────────────────────────────────────────┘       │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 6.3 Neue Dateistruktur (v2.0)

```
pm-tool/
├── src/
│   ├── components/
│   │   ├── gantt/
│   │   │   ├── GanttView.jsx            # Container: Tabelle + Diagramm
│   │   │   ├── GanttTable.jsx           # NEU: Virtualisierte Tabelle (extrahiert)
│   │   │   ├── GanttDiagram.jsx         # SVG-Rendering (refactored)
│   │   │   ├── GanttHeader.jsx          # NEU: Zeitachsen-Header (Zoom-fähig)
│   │   │   ├── GanttBar.jsx             # NEU: Einzelner Vorgangsbalken (extrahiert)
│   │   │   ├── DependencyArrow.jsx      # NEU: Abhängigkeitspfeil (extrahiert)
│   │   │   ├── BaselineBar.jsx          # NEU: Baseline-Balken (ANF-001)
│   │   │   └── LinkMode.jsx             # NEU: Visueller Verknüpfungsmodus (ANF-012)
│   │   │
│   │   ├── board/
│   │   │   ├── BoardView.jsx            # Kanban-Container
│   │   │   ├── BoardColumn.jsx          # NEU: Einzelne Spalte (extrahiert)
│   │   │   └── BoardCard.jsx            # NEU: Einzelne Karte (extrahiert)
│   │   │
│   │   ├── network/
│   │   │   ├── NetworkView.jsx          # VKN-Container
│   │   │   ├── NetworkNode.jsx          # NEU: Einzelner Knoten (extrahiert)
│   │   │   └── NetworkEdge.jsx          # NEU: Einzelne Kante (extrahiert)
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardView.jsx        # Dashboard-Container
│   │   │   ├── KpiCard.jsx              # NEU: Einzelne KPI-Karte
│   │   │   ├── EvmChart.jsx             # NEU: S-Kurve (ANF-003)
│   │   │   ├── CostOverview.jsx         # NEU: Kostenübersicht (ANF-002)
│   │   │   ├── RiskMatrix.jsx           # NEU: Risiko-Heatmap (ANF-017)
│   │   │   └── MilestoneTimeline.jsx    # Bestehend (extrahiert)
│   │   │
│   │   ├── resources/
│   │   │   ├── ResourceView.jsx         # Bestehend
│   │   │   ├── ResourceHeatmap.jsx      # Bestehend
│   │   │   └── LevelingDialog.jsx       # NEU: Resource Leveling UI (ANF-008)
│   │   │
│   │   ├── shared/                      # Umbenannt von common/ → shared/
│   │   │   ├── TaskRow.jsx              # NEU: Wiederverwendbare Tabellenzeile
│   │   │   ├── TaskCard.jsx             # NEU: Wiederverwendbare Karte
│   │   │   ├── FilterBar.jsx            # NEU: Filter-Komponente (ANF-005)
│   │   │   ├── InlineEditor.jsx         # NEU: Inline-Edit (ANF-010)
│   │   │   ├── SearchBar.jsx            # NEU: Volltextsuche (ANF-005)
│   │   │   ├── ExportMenu.jsx           # NEU: Export-Dialog (ANF-007)
│   │   │   ├── BaselineDialog.jsx       # NEU: Baseline-Verwaltung (ANF-001)
│   │   │   ├── ConstraintPicker.jsx     # NEU: Constraint-Auswahl (ANF-004)
│   │   │   ├── NotificationPanel.jsx    # NEU: Benachrichtigungen (ANF-015)
│   │   │   ├── Toast.jsx                # Bestehend
│   │   │   ├── ToastContext.js           # Bestehend
│   │   │   ├── useToast.js              # Bestehend
│   │   │   ├── Tooltip.jsx              # Bestehend
│   │   │   └── ContextMenu.jsx          # Bestehend
│   │   │
│   │   ├── raci/                        # NEU: RACI-Ansicht (ANF-026)
│   │   │   ├── RaciView.jsx             # RACI-Matrix-Container
│   │   │   ├── RaciCell.jsx             # Einzelne Zelle mit Dropdown
│   │   │   └── RaciValidation.jsx       # Validierungswarnungen
│   │   │
│   │   ├── requirements/                # NEU: Anforderungsmanagement (ANF-027/028/029)
│   │   │   ├── RequirementsView.jsx     # Anforderungsliste als Tabelle
│   │   │   ├── ImportDialog.jsx         # Lastenheft-Import-Dialog
│   │   │   ├── RequirementParser.jsx    # Dokument-Parsing-Vorschau
│   │   │   ├── TraceabilityMatrix.jsx   # Traceability-Ansicht (ANF-029)
│   │   │   └── PflichtenheftGenerator.jsx # Export-Konfiguration
│   │   │
│   │   └── settings/                    # NEU: Einstellungen als eigener Bereich
│   │       ├── ProjectSettings.jsx      # Bestehend (extrahiert aus App.jsx)
│   │       ├── CalendarSettings.jsx     # NEU: Kalender-Verwaltung
│   │       ├── CustomFieldsEditor.jsx   # NEU: Custom Fields (ANF-016)
│   │       └── FeatureFlags.jsx         # NEU: Premium-Feature-Verwaltung (ANF-031)
│   │
│   ├── stores/                          # NEU: Zentrales State-Management
│   │   ├── useProjectStore.js           # Zustand Store (Haupt-State)
│   │   ├── useUiStore.js                # UI-State (Tab, Zoom, Selection)
│   │   └── useNotificationStore.js      # NEU: Benachrichtigungen
│   │
│   ├── hooks/                           # NEU: Custom Hooks (extrahiert)
│   │   ├── useTaskSelection.js          # Einzel- und Mehrfachauswahl
│   │   ├── useDragDrop.js               # Maus + Touch Drag & Drop
│   │   ├── useKeyboardShortcuts.js      # Globale + kontextuelle Shortcuts
│   │   ├── useVirtualScroll.js          # Virtualisierungs-Hook
│   │   ├── useGanttZoom.js              # Zoom-Logik
│   │   └── useInlineEdit.js             # Inline-Editing-Logik
│   │
│   ├── models/
│   │   ├── types.js                     # Bestehend (erweitert um Baseline, Constraint, Kosten)
│   │   ├── schema.js                    # NEU: Validierungsschema (Zod oder eigenes)
│   │   └── migrations.js               # NEU: Datenmigration bei Schema-Änderungen
│   │
│   ├── utils/
│   │   ├── cpm.js                       # Bestehend (erweitert um Constraints)
│   │   ├── ccpm.js                      # NEU: Critical Chain + Puffer (ANF-030)
│   │   ├── calendar.js                  # Bestehend (erweitert um Ressourcen-Kalender)
│   │   ├── eva.js                       # Bestehend (erweitert um AC, CPI, EAC, ETC, VAC)
│   │   ├── hierarchy.js                 # Bestehend
│   │   ├── resources.js                 # Bestehend
│   │   ├── storage.js                   # Bestehend (refactored → Adapter-Pattern)
│   │   ├── costs.js                     # NEU: Kostenberechnung (ANF-002)
│   │   ├── leveling.js                  # NEU: Resource Leveling (ANF-008)
│   │   ├── filters.js                   # NEU: Filter-Engine (ANF-005)
│   │   ├── raci.js                      # NEU: RACI-Validierung (ANF-026)
│   │   ├── requirements.js              # NEU: Anforderungs-Parser (ANF-027)
│   │   ├── docGenerator.js              # NEU: Pflichtenheft-Generator (ANF-028)
│   │   ├── exportPdf.js                 # NEU: PDF-Export (ANF-007)
│   │   ├── exportXlsx.js               # NEU: Excel-Export (ANF-007)
│   │   ├── indexer.js                   # NEU: Map-basierte ID-Indizes
│   │   └── features.js                  # NEU: Feature-Flag-System (ANF-031)
│   │
│   ├── App.jsx                          # Refactored: Schlank, delegiert an Stores
│   ├── index.css                        # Bestehend (erweitert)
│   └── main.jsx                         # Bestehend
│
├── docs/
│   ├── Masterprompt_PM-Tool_v1_0.md     # Bestehend
│   ├── Design-Brief_v2.md              # Bestehend
│   ├── Anforderungskatalog_und_Architektur_v1.md  # Dieses Dokument
│   └── API.md                           # NEU: Interne API-Dokumentation
│
├── tests/                               # NEU: Testverzeichnis
│   ├── utils/
│   │   ├── cpm.test.js                  # CPM-Algorithmus Tests
│   │   ├── calendar.test.js             # Kalender-Tests
│   │   ├── costs.test.js                # Kosten-Tests
│   │   ├── leveling.test.js             # Leveling-Tests
│   │   └── eva.test.js                  # EVA-Tests
│   └── components/
│       ├── GanttView.test.jsx           # Integrations-Tests
│       └── FilterBar.test.jsx           # Komponenten-Tests
│
├── CLAUDE.md
├── package.json
└── vite.config.js
```

### 6.4 State-Management: Zustand Store

Die aktuelle Props-Drilling-Architektur wird durch Zustand ersetzt – eine leichtgewichtige State-Management-Bibliothek, die ohne Boilerplate auskommt und perfekt zu React Hooks passt.

**Warum Zustand statt Redux/Context API?**

Redux wäre für die Projektgröße überdimensioniert (zu viel Boilerplate). Die Context API hat Performance-Probleme bei häufigen Updates (jeder Consumer rendert neu). Zustand bietet selektive Subscriptions (nur betroffene Komponenten rendern), ist extrem leichtgewichtig (~1 KB), hat eine einfache API und unterstützt Middleware (Persist, Devtools, Immer).

```javascript
// src/stores/useProjectStore.js (Konzept)
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

const useProjectStore = create(
  persist(
    immer((set, get) => ({
      // === STATE ===
      projekt: null,
      taskIndex: new Map(),        // id → Task (O(1) Lookup)
      baselines: [],

      // === ACTIONS ===
      loadProjekt: (projekt) => set(state => {
        state.projekt = projekt;
        state.taskIndex = new Map(
          projekt.vorgaenge.map(t => [t.id, t])
        );
      }),

      updateTask: (id, changes) => set(state => {
        const task = state.projekt.vorgaenge.find(t => t.id === id);
        if (task) {
          Object.assign(task, changes);
          // Index aktualisieren
          state.taskIndex.set(id, { ...task });
          // CPM neu berechnen (async via Middleware)
        }
      }),

      addBaseline: (name) => set(state => {
        state.baselines.push({
          id: uuid(),
          name,
          erstelltAm: new Date().toISOString(),
          vorgaenge: state.projekt.vorgaenge.map(t => ({
            vorgangId: t.id,
            faz: t.fruehesterAnfang,
            fez: t.fruehestesEnde,
            dauer: t.dauer,
            fortschritt: t.fortschritt
          }))
        });
      }),

      recalculate: () => {
        const { projekt } = get();
        if (!projekt) return;
        const result = berechneNetzplan(
          projekt.vorgaenge,
          projekt.abhaengigkeiten,
          projekt.kalender,
          projekt.startDatum
        );
        set(state => {
          state.projekt.vorgaenge = result.vorgaenge;
          // Index neu aufbauen
          state.taskIndex = new Map(
            result.vorgaenge.map(t => [t.id, t])
          );
        });
      },

      // Undo/Redo
      undoStack: [],
      redoStack: [],
      undo: () => { /* ... */ },
      redo: () => { /* ... */ },
    })),
    {
      name: 'pm-projekt-store',
      // Persist-Middleware für automatisches Speichern
    }
  )
);
```

### 6.5 Datenmodell-Erweiterungen

```javascript
// src/models/types.js – Erweiterungen für v2.0

// Task-Erweiterung
createTask(overrides) → {
  ...existingFields,

  // NEU: Constraints (ANF-004)
  constraint: {
    typ: 'ASAP',              // Standard
    datum: null
  },

  // NEU: Kosten (ANF-002)
  festeKosten: 0,             // Fixkosten pro Vorgang (€)
  istKosten: 0,               // Tatsächliche Kosten (€)

  // NEU: Risiko (ANF-017)
  risiko: null,               // { beschreibung, wahrscheinlichkeit, auswirkung, massnahmen }

  // NEU: Custom Fields (ANF-016)
  customFields: {},           // { feldName: wert }

  // NEU: Kommentare (ANF-018)
  kommentare: [],             // [{ text, zeitstempel, autor }]
}

// NEU: Baseline (ANF-001)
createBaseline(projekt, name) → {
  id: uuid(),
  name: String,
  erstelltAm: ISO-Date,
  vorgaenge: [{ vorgangId, faz, fez, dauer, fortschritt }]
}

// NEU: Filter-Konfiguration (ANF-005)
createFilterConfig() → {
  status: null,               // 'offen' | 'inArbeit' | 'abgeschlossen' | null
  kritisch: false,            // nur kritischer Pfad
  ressourceId: null,          // nach Ressource filtern
  ueberfaellig: false,        // nur überfällige
  suchtext: '',               // Volltextsuche
  customFilters: []           // benutzerdefinierte Filter
}

// Project-Erweiterung
createProject(overrides) → {
  ...existingFields,

  // NEU
  baselines: [],
  gesamtbudget: 0,
  customFieldDefinitions: [], // [{ name, typ, optionen }]
  benachrichtigungen: []
}
```

### 6.6 Persistierungs-Architektur

Die aktuelle localStorage-Lösung stößt bei größeren Projekten (200+ Vorgänge mit Baselines, Kosten, Custom Fields) an das 5–10 MB Limit. Die Lösung ist ein Adapter-Pattern, das localStorage für kleine Projekte beibehält und IndexedDB für große Projekte nutzt.

```javascript
// src/utils/storage.js – Refactored mit Adapter-Pattern

class StorageAdapter {
  async speichern(key, value) { throw new Error('Not implemented'); }
  async laden(key) { throw new Error('Not implemented'); }
  async loeschen(key) { throw new Error('Not implemented'); }
  async alleSchluessel() { throw new Error('Not implemented'); }
}

class LocalStorageAdapter extends StorageAdapter {
  // Bestehende Implementierung, für Projekte < 2 MB
}

class IndexedDBAdapter extends StorageAdapter {
  // NEU: Für größere Projekte, > 50 MB möglich
  // Nutzt idb-keyval oder eigene Wrapper
  constructor(dbName = 'pm-tool') {
    this.db = null;
  }

  async init() {
    this.db = await openDB(this.dbName, 1, {
      upgrade(db) {
        db.createObjectStore('projekte', { keyPath: 'id' });
        db.createObjectStore('baselines', { keyPath: 'id' });
        db.createObjectStore('einstellungen');
      }
    });
  }
}

// Auto-Detection: Welcher Adapter?
function createStorageAdapter() {
  const projektGroesse = schaetzeProjektGroesse();
  if (projektGroesse > 2_000_000 || !window.localStorage) {
    return new IndexedDBAdapter();
  }
  return new LocalStorageAdapter();
}
```

### 6.7 Berechnungs-Pipeline

Die Berechnungen (CPM, Kosten, EVA, Leveling) werden in einer definierten Pipeline ausgeführt, die bei jeder Änderung durchlaufen wird:

```
Nutzer-Änderung
    │
    ▼
┌──────────────────┐
│ 1. Validierung   │  schema.js: Eingabewerte prüfen
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 2. Hierarchie    │  hierarchy.js: PSP-Codes aktualisieren,
│    aktualisieren │  Sammelvorgänge identifizieren
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 3. CPM-Berechnung│  cpm.js: Vorwärts-/Rückwärtsrechnung
│    (+ Constraints)│  mit Constraint-Berücksichtigung
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 4. Sammelvorgang │  hierarchy.js: FAZ/FEZ/Dauer/Fortschritt
│    Aggregation   │  aus Kindvorgängen aggregieren
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 5. Kosten-       │  costs.js: Plan- und Ist-Kosten berechnen
│    berechnung    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 6. Ressourcen-   │  resources.js: Auslastung pro Tag/Ressource
│    auslastung    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 7. EVA-Berechnung│  eva.js: PV, EV, AC, SPI, CPI, EAC, ETC
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 8. Benachrich-   │  Überfällige Vorgänge, Meilensteine,
│    tigungen      │  Überlastungen prüfen
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 9. Index         │  indexer.js: taskIndex Map aktualisieren
│    aktualisieren │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 10. Persistieren │  storage.js: Debounced speichern (2s)
└──────────────────┘
```

### 6.8 Export-Architektur

```javascript
// src/utils/exportPdf.js
// Nutzt jsPDF + svg2pdf.js für Gantt-zu-PDF

export async function exportGanttAlsPdf(projekt, optionen) {
  const { seitenformat, zeitraum, zoomStufe } = optionen;
  // 1. SVG des Gantt-Diagramms generieren (headless)
  // 2. Projektzusammenfassung als Text
  // 3. jsPDF: Seiten erstellen, SVG einfügen
  // 4. Download auslösen
}

// src/utils/exportXlsx.js
// Nutzt SheetJS (xlsx) für Excel-Export

export function exportAlsExcel(projekt) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Vorgangsliste
  const vorgaengeSheet = XLSX.utils.json_to_sheet(
    projekt.vorgaenge.map(t => ({
      'PSP': t.pspCode,
      'Name': t.name,
      'Dauer (Tage)': t.dauer,
      'FAZ': t.fruehesterAnfang,
      'FEZ': t.fruehestesEnde,
      'GP (Tage)': t.gesamtpuffer,
      'Fortschritt (%)': t.fortschritt,
      'Kritisch': t.istKritisch ? 'Ja' : 'Nein',
      'Plan-Kosten (€)': berechnePlanKosten(t),
      'Ist-Kosten (€)': t.istKosten
    }))
  );
  XLSX.utils.book_append_sheet(workbook, vorgaengeSheet, 'Vorgänge');

  // Sheet 2: Ressourcen
  // Sheet 3: Kostenübersicht
  // Sheet 4: Meilensteine

  XLSX.writeFile(workbook, `${projekt.name}_Export.xlsx`);
}
```

### 6.9 Neue Abhängigkeiten (package.json)

```json
{
  "dependencies": {
    "zustand": "^5.0.0",          // State-Management (ersetzt Props-Drilling)
    "immer": "^10.0.0",           // Immutable State Updates
    "@tanstack/react-virtual": "^3.0.0",  // Virtualisierung (ANF-006)
    "jspdf": "^2.5.0",            // PDF-Export (ANF-007)
    "jspdf-autotable": "^3.8.0",  // PDF-Tabellen
    "xlsx": "^0.18.0",            // Excel-Export (ANF-007)
    "idb-keyval": "^6.2.0"        // IndexedDB-Wrapper (Persistierung)
  },
  "devDependencies": {
    "vitest": "^3.0.0",           // Unit-Testing
    "@testing-library/react": "^16.0.0"  // Komponenten-Testing
  }
}
```

---

## 7. Implementierungs-Roadmap

### Phase 1: Fundament (4–6 Wochen)

**Ziel:** Architektur stabilisieren, Performance sichern, Grundlage für alle weiteren Features.

| Woche | Aufgabe | ANF | Größe |
|---|---|---|---|
| 1 | Zustand Store einführen, Props-Drilling eliminieren | ARCH | M |
| 1 | ID-Indexierung (`Map<id, Task>`) einbauen | PERF | S |
| 2 | GanttDiagram.jsx refactoren (GanttBar, DependencyArrow extrahieren) | ARCH | M |
| 2 | Error-Boundaries + Loading-States | ARCH | S |
| 3 | Virtualisierung der Gantt-Tabelle (@tanstack/react-virtual) | ANF-006 | M |
| 3 | SVG-Viewport-Clipping im Diagramm | ANF-006 | S |
| 4 | Vitest einrichten, CPM-Tests schreiben | ARCH | M |
| 4–5 | Kalender- und Hierarchie-Tests | ARCH | S |
| 5–6 | IndexedDB-Adapter implementieren (Fallback localStorage) | ARCH | M |

### Phase 2: Kern-Features (6–8 Wochen)

**Ziel:** Die kritischen Funktionslücken schließen.

| Woche | Aufgabe | ANF | Größe |
|---|---|---|---|
| 7 | Baseline-Management (Datenmodell + Speicherung) | ANF-001 | M |
| 7–8 | Baseline-Visualisierung im Gantt (Schatten-Balken) | ANF-001 | M |
| 8 | Kosten-Tracking (Datenmodell + Berechnung) | ANF-002 | M |
| 9 | Kosten-UI (Detail-Panel + Dashboard-KPI) | ANF-002 | S |
| 9 | Erweiterte EVA (7 Kennzahlen + S-Kurve) | ANF-003 | S |
| 10 | Constraints implementieren (Datenmodell + CPM-Erweiterung) | ANF-004 | M |
| 10–11 | Constraints-UI (Detail-Panel + Gantt-Indikator) | ANF-004 | S |
| 11–12 | Filter & Suche (FilterBar + SearchBar + filters.js) | ANF-005 | M |
| 12–13 | Report-Export (PDF + Excel) | ANF-007 | M |

### Phase 3: UX-Verbesserungen (4–6 Wochen)

**Ziel:** Professionelle Bedienbarkeit erreichen.

| Woche | Aufgabe | ANF | Größe |
|---|---|---|---|
| 14 | Gantt-Zoom (4 Stufen: Tage/Wochen/Monate/Quartale) | ANF-009 | M |
| 14–15 | Inline-Editing in Gantt-Tabelle | ANF-010 | M |
| 15–16 | Barrierefreiheit (ARIA, Keyboard-Nav, Kontraste) | ANF-011 | M |
| 16 | Link-Modus (visuelle Abhängigkeitserstellung) | ANF-012 | M |
| 17 | Mehrfachauswahl + Massenbearbeitung | ANF-013 | M |

### Phase 4: Erweiterte Features (6–8 Wochen)

**Ziel:** Differenzierung und professionelle Tiefe.

| Woche | Aufgabe | ANF | Größe |
|---|---|---|---|
| 18–19 | Resource Leveling (Algorithmus + UI) | ANF-008 | L |
| 19 | Ressourcen-Kalender | ANF-014 | S |
| 20 | Benachrichtigungen | ANF-015 | S |
| 20–21 | Custom Fields | ANF-016 | M |
| 21–22 | Risikomanagement | ANF-017 | L |
| 22 | Template-System mit Vorschau | ANF-019 | M |
| 23 | Druckansicht | ANF-020 | S |

### Phase 5: Langfristig (nach v2.0)

- Multi-User + Cloud-Backend (ANF-021)
- Agile-Erweiterung mit Sprints (ANF-022)
- KI-Features (ANF-023)
- Electron-Desktop-App (ANF-024)
- API + Integrationen (ANF-025)

---

## 8. UX-Analyse: Microsofts Schwächen als unsere Chance

### 8.1 Die Microsoft-Produktverwirrung

Microsoft hat sein Projektmanagement-Portfolio in den letzten Jahren mehrfach umstrukturiert, was bei Nutzern zu erheblicher Verwirrung führt. Die aktuelle Lage (März 2026): „Project for the Web" wurde im August 2025 eingestellt und in Microsoft Planner überführt. Project Online wird zum 30.09.2026 eingestellt. Übrig bleiben Planner (Basic/Premium), Project Plan 3 und Plan 5 sowie die Desktop-Version Project Professional. Die MPUG-Community (Microsoft Project User Group) nennt die Vielzahl an Lösungen, Preisstrukturen und Plattformen als eine der größten Frustrationen.

Für unser PM-Tool bedeutet das: Wir haben eine klare, einfache Positionierung. Es gibt genau ein Produkt, kostenlos, im Browser. Keine Verwirrung, kein Vendor-Lock-in.

### 8.2 Planner Premium Feature-Matrix: Was bietet Microsoft wirklich?

Die Analyse der Planner-Seite (microsoft.com/planner) und der offiziellen Feature-Vergleichsseite (support.microsoft.com) zeigt eine klare Zwei-Klassen-Gesellschaft:

**Planner Basic (in Microsoft 365 enthalten, „kostenlos"):**
Grid-View, Board-View, Charts-View, Schedule-View, Filter/Gruppierung, To-Do-Integration, Teams-Integration, Outlook-Integration, Recurring Tasks, Loop-Integration. Aber: Keine Timeline/Gantt, keine Abhängigkeiten, kein kritischer Pfad, keine Meilensteine, keine Custom Fields, keine Sprints, keine Ziele.

**Planner Premium (Plan 1, ab 10 $/Monat/Nutzer):**
Timeline/Gantt-View, Abhängigkeiten zwischen Aufgaben, People View (Workload-Balancing), Meilensteine, Custom Fields, Conditional Coloring, Critical Path, Backlogs und Sprints, Goals, Task History, Custom Calendars, Copilot-Integration (Vorschau).

**Planner Plan 3 (30 $/Monat/Nutzer) – zusätzlich:**
Erweiterte Abhängigkeiten mit Lead und Lag, Ressourcenanforderung, Aufgabenverlauf, Programm- und Projektbedarfsmanagement, Project Online Desktop-Client.

**Planner Plan 5 (55 $/Monat/Nutzer) – zusätzlich:**
Portfoliomanagement, Enterprise-Ressourcenmanagement und -zuteilung.

**Wichtig:** Planner Premium hat ein Task-Limit von nur 3.000 Aufgaben pro Plan (Basic: 9.000). Baselines sind in Planner Premium verfügbar, aber ohne grafische Darstellung. Die Timeline-Ansicht wird von Experten als „kein echtes Gantt-Chart" eingestuft – es fehlen einige Kernfunktionen eines vollwertigen Gantt-Diagramms.

### 8.3 Die Top-10-Frustrationen der MS Project Community

Basierend auf der MPUG-Community-Analyse, Capterra/Software Advice Reviews (2024/2025) und Experten-Reviews sind die häufigsten Beschwerden:

**1. Steile Lernkurve:** Die Oberfläche ist überladen, Features sind nicht dort wo man sie erwartet, und die Einarbeitung fühlt sich an wie „durch nassen Zement waten" (Originalzitat aus Reviews). Für Nicht-PM-Profis ist die Software kaum zugänglich.

**2. Veraltete UI:** Trotz gelegentlicher Updates wirkt die Desktop-Version wie Software aus den 2010er-Jahren. Das Ribbon-Interface ist für komplexe Projektplanung ungeeignet, weil man ständig zwischen Tabs wechseln muss.

**3. Kosten:** Project Professional kostet ~1.130 $ als Einmallizenz, Plan 3 kostet 30 $/Monat/Nutzer. Für kleine Teams oder Einzelanwender ist das prohibitiv teuer – und viele Features werden nie genutzt.

**4. Keine echte Zusammenarbeit:** Es gibt keinen zentralen Kommunikationsraum im Tool. Team-Mitglieder können nicht in Echtzeit am selben Plan arbeiten (außer über die eingeschränkte Web-Version). Feedback-Schleifen erfordern externe Tools.

**5. Gantt-Chart-Einschränkungen:** In der Online-Version können Aufgabennamen nicht neben oder innerhalb der Gantt-Balken angezeigt werden (Stand Oktober 2024). Die Ressourcen-Allokationsvisualisierung ist verbesserungswürdig.

**6. Proprietäres Dateiformat:** .mpp-Dateien können nur mit Project geöffnet werden. Das erzeugt einen Vendor-Lock-in und Kompatibilitätsprobleme, wenn Projektbeteiligte die Software nicht haben.

**7. Agile-Unterstützung mangelhaft:** Project wurde für Wasserfall konzipiert. Agile-Features (Sprints, Backlogs) wurden erst spät und halbherzig integriert. Für Scrum-Teams ist Jira oder Azure DevOps die bessere Wahl.

**8. Ressourcen-Management fehleranfällig:** Wenn man bei ressourcengebundenen Vorgängen Termine, Dauer oder Aufwand ändert, verhält sich das Tool oft unerwartet – die Dreieckslogik (Dauer × Aufwand × Einheiten) ist schwer durchschaubar.

**9. Resource Leveling verfälscht den kritischen Pfad:** Nach dem automatischen Ressourcen-Leveling stimmt der angezeigte kritische Pfad oft nicht mehr, weil der Total-Slack-Wert durch die regelbasierte Verschiebung verfälscht wird. Das ist ein bekanntes, seit Jahren ungelöstes Problem.

**10. Plattform-Fragmentierung:** Die Koexistenz von Desktop, Online und Planner verwirrt Nutzer. Features sind nicht konsistent über Plattformen hinweg, und die Migrationspfade sind unklar.

### 8.4 UX-Best-Practices 2025/2026: Was moderne PM-Software richtig machen muss

Aus der Recherche zu UX-Best-Practices für Enterprise-Software und PM-Tools ergeben sich klare Prinzipien:

**Progressive Disclosure (Stufenweise Offenlegung):** Nicht alle Features auf einmal zeigen. Informationen in handhabbaren Schichten offenbaren. Grundfunktionen sofort sichtbar, erweiterte Funktionen bei Bedarf. Das ist genau der Ansatz, den unser PM-Tool bereits teilweise verfolgt (Detail-Panel öffnet sich erst bei Klick), aber konsequenter umsetzen sollte.

**Minimales Onboarding:** Nutzer nicht mit Multi-Step-Tutorials überfordern. Stattdessen ein oder zwei Schlüsselaktionen hervorheben, die sofort produktiv machen. Vorlagen sind hier Gold wert – unser Tool hat bereits 4 Vorlagen, die den Einstieg erleichtern.

**Visuelle Hierarchie:** Wichtige Daten-Metriken priorisieren, Drill-Down für Details ermöglichen. Hohe Informationsdichte ohne Überforderung durch klare visuelle Struktur.

**Konsistente Interaktionsmuster:** Überall die gleichen Bedienkonzepte (Doppelklick = Bearbeiten, Rechtsklick = Kontextmenü, Drag = Verschieben). Unser Tool macht das bereits gut.

**Messbarer UX-Impact:** Studien zeigen, dass intuitive Interfaces 75 % weniger Trainingszeit erfordern. B2B-Apps mit guter UX konvertieren 43 % mehr Nutzer von Trial zu Paid. Salesforce steigerte die User-Activation um 68 % durch ein Onboarding-Redesign.

### 8.5 Konkrete UX-Vorteile unseres PM-Tools vs. Microsoft

| UX-Aspekt | Unser PM-Tool | MS Project / Planner | Vorteil |
|---|---|---|---|
| **Einstieg** | Sofort im Browser, 0 Konfiguration, Vorlagen | Account nötig, Lizenz kaufen, Plattform wählen | ✅ Wir |
| **Lernkurve** | Flach: Tab-Navigation, visuelles Feedback | Steil: Ribbon-UI, versteckte Features | ✅ Wir |
| **Netzplan (VKN)** | DIN 69900 konform, integriert | Nicht vorhanden (weder Project noch Planner) | ✅ Wir |
| **Gantt + Balken-Labels** | Vorgangsname in Tabelle, Hover-Popover | Online: Kein Name am Balken möglich | ✅ Wir |
| **Kontextmenü** | 7 Aktionen direkt am Element | Ribbon-Tabs wechseln | ✅ Wir |
| **Keyboard Shortcuts** | Entf, F2, Ins, Tab, Esc, Ctrl+Z/Y | Vorhanden aber versteckt | ≈ Gleich |
| **Drag & Drop** | Gantt-Balken + Board-Karten, Touch-Support | Planner Board ja, Gantt eingeschränkt | ✅ Wir |
| **Responsive/Mobile** | Gestapelt <768px, Touch-optimiert | Planner: ja, Project Desktop: nein | ≈ Gleich |
| **Kosten** | 0 € | 10–55 $/Monat/Nutzer | ✅ Wir |
| **Dateiformat** | JSON (offen, lesbar, portabel) | .mpp (proprietär) | ✅ Wir |
| **Zusammenarbeit** | Single-User (Nachteil) | Cloud-Sync (Vorteil) | ❌ Microsoft |
| **Integrationen** | Keine | Teams, Outlook, Loop, Power Platform | ❌ Microsoft |
| **Baselines grafisch** | Noch nicht (geplant in ANF-001) | Desktop: ja, Planner: nur Daten, kein Chart | 🟡 Geplant |
| **Resource Leveling** | Noch nicht (geplant in ANF-008) | Vorhanden aber fehlerhaft (verfälscht krit. Pfad) | 🟡 Chance |
| **Agile/Sprints** | Board vorhanden, Sprints fehlen | Planner Premium: Sprints + Backlogs | ❌ Microsoft |

### 8.6 Strategische UX-Empfehlungen für das PM-Tool

Basierend auf allen Erkenntnissen ergeben sich folgende UX-fokussierte Empfehlungen, die über die rein funktionalen Anforderungen hinausgehen:

**UX-001: Guided Onboarding (Geführter Einstieg)**
Beim ersten Start eine kurze interaktive Tour (3–5 Schritte), die die Kernelemente zeigt: „Vorgang anlegen → Dauer setzen → Abhängigkeit erstellen → Gantt betrachten". Kein langer Tutorial-Text, sondern Step-by-Step mit Highlight auf dem jeweiligen UI-Element. Nutzer sollen in unter 2 Minuten den ersten Vorgang haben.

**UX-002: Kontextsensitive Hilfe**
An komplexen Stellen (CPM-Ergebnisse, EVA-Kennzahlen, Abhängigkeitstypen) kleine Info-Icons mit Erklärungen. „Was bedeutet GP?" → Tooltip mit Kurztext + Link zu ausführlicher Erklärung. Das adressiert direkt die MS-Project-Kritik „Features sind nicht dort wo man sie erwartet".

**UX-003: Leerer-Zustand-Design (Empty States)**
Wenn ein neues Projekt leer ist, statt einer leeren Tabelle eine einladende Ansicht: „Erstelle deinen ersten Vorgang" mit großem + Button und optionalem Verweis auf Vorlagen. Jede leere Ansicht (Board, Dashboard) soll erklären was dort erscheinen wird.

**UX-004: Fehler-Feedback mit Kontext**
Wenn die CPM-Berechnung einen Zyklus erkennt, nicht nur „Zyklus erkannt" melden, sondern die betroffenen Vorgänge visuell hervorheben und eine Erklärung geben: „Vorgang A → B → C → A bilden einen Zyklus. Entferne eine Abhängigkeit, um das Problem zu lösen."

**UX-005: Aufgabennamen im Gantt-Balken**
Anders als MS Project Online, wo Nutzernamen nicht am Balken angezeigt werden können, sollte unser Tool den Aufgabennamen direkt neben oder innerhalb des Gantt-Balkens anzeigen (bei ausreichender Breite). Das war eine der meistgenannten Beschwerden bei MS Project.

**UX-006: Visuelles Abhängigkeiten-Feedback**
Beim Hovern über einen Vorgang alle Vorgänger und Nachfolger farblich hervorheben (Vorgänger: blau, Nachfolger: grün). Das macht die Abhängigkeitsstruktur sofort sichtbar – etwas, das bei MS Project nur über den Task Inspector möglich ist.

---

## 9. Quellenverzeichnis

### Marktanalyse und Funktionsvergleiche

- [Microsoft Project Management Tool Overview 2025](https://www.theprojectgroup.com/blog/en/microsoft-project-management-tools/) – Funktionsübersicht MS Project Editionen
- [Microsoft Project Review 2026: Expert Opinion](https://thedigitalprojectmanager.com/tools/microsoft-project-review/) – Detaillierte Bewertung mit Stärken/Schwächen
- [MS Project Tools, Apps and Editions: The 2026 Guide](https://birdviewpsa.com/blog/ms-project-tools-apps-and-editions-what-to-choose-in-2026/) – Aktuelle Editionsübersicht
- [What Is Microsoft Project? Uses, Features and Pricing](https://www.projectmanager.com/blog/what-is-microsoft-project) – Kernfunktionen und Ressourcentypen
- [13 Reasons Not to Use Microsoft Project](https://www.celoxis.com/article/13-reasons-why-to-stop-using-microsoft-project) – Kritische Analyse der Schwächen
- [20 Best Microsoft Project Alternatives 2025](https://thedigitalprojectmanager.com/tools/microsoft-project-alternatives/) – Marktübersicht Alternativen
- [Best Enterprise Project Management Software 2026](https://www.smartsheet.com/content/best-project-management-software) – Smartsheet Vergleichsanalyse
- [15 Best Project Management Software 2026](https://monday.com/blog/project-management/project-management-software/) – Monday.com Feature-Vergleich
- [Best Project Management Software Tested 2026](https://www.goodday.work/blog/best-project-management-software/) – Unabhängiger Vergleich

### PM-Methoden und Trends

- [Hybrid Project Management Strategies for Modern Teams 2026](https://monday.com/blog/project-management/hybrid-project-management/) – Hybrid-Ansatz erklärt
- [8 Project Management Trends of 2026](https://www.epicflow.com/blog/current-trends-in-project-management-what-to-prepare-for/) – KI, Automatisierung, Trends
- [PM Methodology Adoption: Waterfall vs. Agile vs. Hybrid 2026-27](https://apmic.org/blogs/project-management-methodology-adoption-waterfall-vs-agile-vs-hybrid-2026-27-data) – PMI-Daten zu Methoden-Adoption (67 % hybrid)
- [13 PM Trends 2026 – Key Innovations & Skills](https://www.theknowledgeacademy.com/blog/project-management-trends/) – Übergreifende Trend-Analyse

### Technische Referenzen

- [Resource Leveling Breaks the Critical Path – MS Project](https://boyleprojectconsulting.com/tomsblog/2016/01/05/logic-analysis-of-resource-leveled-schedules-ms-project/) – Analyse des Leveling-Algorithmus und seiner Grenzen
- [Finally, Resource Leveling Explained](https://mpug.com/finally-the-resource-leveling-feature-explained-2/) – Detaillierte Erklärung des Leveling-Score
- [MS Project Advanced Scheduling](https://www.tutorialspoint.com/ms_project/ms_project_advanced_scheduling.htm) – Constraints und Auto-Scheduling
- [Mastering MS Project Schedule Logic](https://www.msprojecttraining.online/microsoft-project-schedule-logic) – Task Modes, Constraints, Critical Path
- [Earned Value Management in Projects](https://www.celoxis.com/article/earned-value-management-projects) – EVM-Kennzahlen und Berechnung
- [Top Metrics PMOs Track](https://www.celoxis.com/article/top-metrics-pmos-track-project-management-software) – KPI-Benchmarks
- [9 React Libraries for PM Apps](https://medium.com/@olgatashlikovich/9-react-libraries-for-project-management-apps-f7657e9e816c) – Technische Bibliotheken-Empfehlungen

### Baseline-Tracking und EVM

- [Top 5 Project Baseline Management Tools 2025](https://ones.com/blog/project-baseline-management-tools/) – Baseline-Konzepte und Tool-Vergleich
- [Top 3 Baseline Tools Comparison 2025](https://ones.com/blog/baseline-tools-project-management-comparison/) – Detaillierter Baseline-Vergleich
- [Resource Leveling in PM: A Quick Guide](https://www.projectmanager.com/blog/resource-leveling-101-master-this-pm-technique) – Leveling-Techniken

---

**Ende des Dokuments**

### Microsoft Planner und Produkttransition

- [Transitioning to Microsoft Planner and retiring Project for the web](https://techcommunity.microsoft.com/blog/plannerblog/transitioning-to-microsoft-planner-and-retiring-microsoft-project-for-the-web/4410149) – Offizieller Microsoft-Blogpost zur Einstellung von Project for the Web
- [Microsoft Project Online is retiring](https://techcommunity.microsoft.com/blog/plannerblog/microsoft-project-online-is-retiring-what-you-need-to-know/4450558) – Offizielle Ankündigung der Project-Online-Einstellung (30.09.2026)
- [Compare Microsoft Planner basic vs. premium plans](https://support.microsoft.com/en-us/office/compare-microsoft-planner-basic-vs-premium-plans-5e351170-4ed5-43dc-bf30-d6762f5a6968) – Offizielle Feature-Matrix Basic vs. Premium
- [Microsoft Planner Premium Licensing Plans & Pricing 2026](https://wellingtone.com/microsoft-planner-premium-licensing-plans-pricing-2026/) – Preisübersicht und Lizenzmodelle
- [Advanced capabilities with premium plans in Planner](https://support.microsoft.com/en-us/office/advanced-capabilities-with-premium-plans-in-planner-6cdba2aa-da06-4e08-be4c-baaa4fda17ba) – Offizielle Dokumentation Premium-Features
- [Microsoft Planner vs. Microsoft Project: 2026 Reviews](https://thedigitalprojectmanager.com/tools/microsoft-planner-vs-project/) – Detaillierter Vergleich Planner vs. Project
- [Beginner's Guide to Planner Premium: Timelines, Dependencies, and More](https://nboldapp.com/beginners-guide-to-planner-premium-timelines-dependencies-and-more/) – Praxisanleitung Premium-Funktionen

### UX-Kritik und Nutzerfeedback

- [What frustrates the Microsoft Project User Community?](https://mpug.com/what-frustrates-the-microsoft-project-user-community) – MPUG Community-Umfrage zu Frustrationen
- [Microsoft Project Reviews 2025 – Capterra](https://www.capterra.com/p/198049/Microsoft-Project/reviews/) – Verifizierte Nutzerreviews
- [Microsoft Project Reviews – Software Advice](https://www.softwareadvice.com/project-management/microsoft-project-profile/reviews/) – Detaillierte Pro/Contra-Analyse
- [Charlie's Honest Microsoft Project Review 2025](https://www.jibble.io/construction-software-reviews/microsoft-project-review/) – Unabhängige Expert-Review
- [Why did Microsoft give up on Project?](https://www.perspectives.plus/p/why-did-microsoft-give-up-on-project) – Analyse der strategischen Entscheidungen

### Weitere PM-Software

- [Oracle Primavera P6 EPPM Overview](https://www.oracle.com/construction-engineering/primavera-p6/) – Offizielle Oracle-Produktseite mit Feature-Übersicht
- [What Is Oracle Primavera P6? Uses, Features & Pricing](https://www.projectmanager.com/blog/what-is-primavera-p6) – Detaillierte Feature-Analyse und Preise
- [Primavera P6 EPPM Datasheet](https://www.oracle.com/construction-engineering/primavera-p6/datasheet/) – Oracle-Datenblatt mit technischen Details
- [Wrike vs. Jira vs. Celoxis: Best PM Tool?](https://www.celoxis.com/article/wrike-vs-jira-vs-celoxis) – Dreifach-Vergleich Enterprise-Tools
- [10 Best TeamGantt Alternatives 2026](https://clickup.com/blog/teamgantt-alternatives/) – ClickUp Feature-Vergleich
- [OpenProject – Open Source PM Software](https://www.openproject.org/) – Offizielle OpenProject-Seite
- [Top 5 Open Source PM Software 2026](https://www.openproject.org/blog/top-5-open-source-project-management-software-2026/) – Open-Source-Vergleich
- [Top 6 Open Source PM Software 2026 – Plane](https://plane.so/blog/top-6-open-source-project-management-software-in-2026) – Alternative Open-Source-Analyse

### PM-Methoden und Standards

- [Critical Chain vs. Critical Path (CCPM vs CPM)](https://www.wrike.com/project-management-guide/faq/differences-between-critical-chain-vs-critical-path/) – Wrike-Guide zum Methodenvergleich
- [Critical Chain Project Management – Asana](https://asana.com/resources/critical-chain-project-management) – CCPM-Grundlagen und Puffer-Management
- [Critical path or critical chain – combining the best of both (PMI)](https://www.pmi.org/learning/library/critical-path-critical-chain-combining-4606) – PMI-Paper zur Kombination von CPM und CCPM
- [PMBOK Guide – Project Management Institute](https://www.pmi.org/standards/pmbok) – Offizielle PMI-Standardseite
- [PMBOK 7th vs 8th Edition: Key Differences & 2026 Updates](https://projectmanagementacademy.net/resources/blog/pmbok-7-vs-pmbok-8-differences/) – Vergleich der PMBOK-Editionen
- [PMBOK Guide 8th Edition Key Changes (2026)](https://www.learningtree.com/blog/pmbok-guide-8th-edition-whats-new/) – Detaillierte Analyse der 8. Edition
- [PM Predictions for 2026 – PRINCE2](https://www.prince2.com/usa/blog/project-management-predictions-for-2026-the-trends-shaping-delivery) – PRINCE2-Perspektive auf PM-Trends
- [How to Adapt to PRINCE2 7th Edition Changes](https://www.projex.com/how-to-adapt-to-prince2-7th-edition-changes-in-2025-and-their-impact-on-your-projects/) – PRINCE2 7th Edition Änderungen
- [State of Agile PM: 2026-27 Industry Trends](https://apmic.org/blogs/state-of-agile-project-management-original-2026-27-industry-trends-amp-insights) – APMIC-Branchenbericht
- [Top 12 PM Methodologies Overview 2026](https://productive.io/blog/project-management-methodologies/) – Methodenübersicht

### UX Best Practices

- [10 UX/UI Best Practices for Modern Digital Products 2025](https://devpulse.com/insights/ux-ui-design-best-practices-2025-enterprise-applications/) – Enterprise-UX-Prinzipien
- [7 SaaS UX Design Best Practices 2025](https://mouseflow.com/blog/saas-ux-design-best-practices/) – SaaS-spezifische UX-Empfehlungen
- [UX/UI Design for Project Management Interfaces](https://datacalculus.com/en/blog/technology-information-and-internet/uxui-designer/uxui-design-for-project-management-interfaces) – PM-spezifisches UI/UX-Design
- [20 Dashboard UI/UX Design Principles 2025](https://medium.com/@allclonescript/20-best-dashboard-ui-ux-design-principles-you-need-in-2025-30b661f2f795) – Dashboard-Design-Prinzipien

---

*Erstellt am 2026-03-19. Basierend auf Web-Recherche (März 2026), Browser-Analyse der Microsoft Planner-Seite und vollständiger Codeanalyse des PM-Tools.*
