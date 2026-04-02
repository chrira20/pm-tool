"""
Bedienungsanleitung für das PM-Tool als PDF erstellen.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.units import mm, cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# ── Farben ─────────────────────────────────────────────────
BLUE = HexColor('#3B82F6')
DARK_BLUE = HexColor('#1E40AF')
RED = HexColor('#EF4444')
GREEN = HexColor('#22C55E')
PURPLE = HexColor('#8B5CF6')
ORANGE = HexColor('#F59E0B')
DARK = HexColor('#1E293B')
SLATE = HexColor('#475569')
LIGHT_SLATE = HexColor('#94A3B8')
LIGHT_BG = HexColor('#F1F5F9')
WHITE = white

# ── Styles ─────────────────────────────────────────────────
styles = getSampleStyleSheet()

style_title = ParagraphStyle(
    'CustomTitle', parent=styles['Title'],
    fontSize=28, leading=34, textColor=DARK,
    spaceAfter=6,
)

style_subtitle = ParagraphStyle(
    'CustomSubtitle', parent=styles['Normal'],
    fontSize=14, leading=18, textColor=SLATE,
    spaceAfter=30,
)

style_h1 = ParagraphStyle(
    'H1', parent=styles['Heading1'],
    fontSize=20, leading=26, textColor=DARK_BLUE,
    spaceBefore=20, spaceAfter=10,
    borderWidth=0, borderPadding=0,
)

style_h2 = ParagraphStyle(
    'H2', parent=styles['Heading2'],
    fontSize=14, leading=19, textColor=DARK,
    spaceBefore=14, spaceAfter=6,
)

style_h3 = ParagraphStyle(
    'H3', parent=styles['Heading3'],
    fontSize=11, leading=15, textColor=SLATE,
    spaceBefore=10, spaceAfter=4,
)

style_body = ParagraphStyle(
    'Body', parent=styles['Normal'],
    fontSize=10, leading=15, textColor=DARK,
    alignment=TA_JUSTIFY, spaceAfter=6,
)

style_bullet = ParagraphStyle(
    'Bullet', parent=style_body,
    leftIndent=16, bulletIndent=6,
    spaceBefore=2, spaceAfter=2,
)

style_shortcut = ParagraphStyle(
    'Shortcut', parent=style_body,
    fontSize=9, leftIndent=20, textColor=SLATE,
    spaceBefore=1, spaceAfter=1,
)

style_tip = ParagraphStyle(
    'Tip', parent=style_body,
    fontSize=9, leading=13,
    leftIndent=12, rightIndent=12,
    textColor=DARK_BLUE,
    backColor=HexColor('#EFF6FF'),
    borderWidth=1, borderColor=BLUE, borderPadding=8,
    spaceBefore=8, spaceAfter=8,
)

style_warn = ParagraphStyle(
    'Warn', parent=style_tip,
    textColor=HexColor('#92400E'),
    backColor=HexColor('#FFFBEB'),
    borderColor=ORANGE,
)

style_footer = ParagraphStyle(
    'Footer', parent=styles['Normal'],
    fontSize=8, textColor=LIGHT_SLATE, alignment=TA_CENTER,
)


def bullet(text):
    return Paragraph(f"<bullet>&bull;</bullet> {text}", style_bullet)


def shortcut(key, desc):
    return Paragraph(
        f"<font color='#3B82F6'><b>{key}</b></font> &ndash; {desc}",
        style_shortcut,
    )


def hr():
    return HRFlowable(width="100%", thickness=0.5, color=LIGHT_SLATE, spaceAfter=8, spaceBefore=8)


def colored_table(headers, rows, col_widths=None):
    """Erstellt eine formatierte Tabelle."""
    data = [headers] + rows
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DARK_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_SLATE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    return t


# ── PDF erstellen ──────────────────────────────────────────

output_path = os.path.join(os.path.dirname(__file__), "PM-Tool_Bedienungsanleitung.pdf")

doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    leftMargin=2 * cm, rightMargin=2 * cm,
    topMargin=2 * cm, bottomMargin=2 * cm,
    title="PM-Tool Bedienungsanleitung",
    author="PM-Tool",
)

story = []

# ─── DECKBLATT ──────────────────────────────────────────────

story.append(Spacer(1, 80))
story.append(Paragraph("PM-Tool", style_title))
story.append(Paragraph("Bedienungsanleitung", ParagraphStyle(
    'DeckSub', parent=style_subtitle, fontSize=18, textColor=BLUE,
)))
story.append(Spacer(1, 20))
story.append(Paragraph("Webbasiertes Projektmanagement-Tool", style_subtitle))
story.append(Paragraph("MS-Project Alternative im Browser", style_body))
story.append(Spacer(1, 40))
story.append(hr())
story.append(Spacer(1, 10))

story.append(Paragraph("<b>Version:</b> 1.0", style_body))
story.append(Paragraph("<b>Stand:</b> M\u00e4rz 2026", style_body))
story.append(Paragraph("<b>Technologie:</b> React 19 + Vite 8 + Tailwind CSS", style_body))
story.append(Paragraph("<b>Datenhaltung:</b> Browser localStorage (offline)", style_body))

story.append(Spacer(1, 40))

story.append(Paragraph(
    "<b>Funktions\u00fcbersicht:</b>",
    ParagraphStyle('BO', parent=style_body, fontSize=11, textColor=DARK_BLUE),
))
for feat in [
    "Gantt-Diagramm mit Vorgangstabelle und Zeitachse",
    "Netzplandiagramm (VKN nach DIN 69900)",
    "Ressourcenverwaltung mit Auslastungsdiagramm",
    "Dashboard mit SPI, Fortschritt und Meilenstein-Timeline",
    "Kritischer-Pfad-Berechnung (CPM-Algorithmus)",
    "Undo/Redo (20 Schritte, Ctrl+Z / Ctrl+Y)",
    "4 Projektvorlagen: IT, Bau, Instandhaltung, Fachschule",
    "JSON Export/Import f\u00fcr Projektdatenaustausch",
]:
    story.append(bullet(feat))

story.append(PageBreak())

# ─── INHALTSVERZEICHNIS ─────────────────────────────────────

story.append(Paragraph("Inhaltsverzeichnis", style_h1))
story.append(Spacer(1, 8))

toc_items = [
    ("1", "Schnellstart"),
    ("2", "Projekt erstellen und verwalten"),
    ("3", "Gantt-Ansicht"),
    ("4", "Netzplan-Ansicht"),
    ("5", "Ressourcen-Ansicht"),
    ("6", "Dashboard-Ansicht"),
    ("7", "Abh\u00e4ngigkeiten verwalten"),
    ("8", "Undo/Redo"),
    ("9", "Export und Import"),
    ("10", "Tastaturk\u00fcrzel"),
    ("11", "Farbsystem"),
    ("12", "Tipps und Hinweise"),
]
for num, title in toc_items:
    story.append(Paragraph(
        f"<b>{num}.</b> &nbsp; {title}",
        ParagraphStyle('TOC', parent=style_body, fontSize=11, leftIndent=10, spaceBefore=4, spaceAfter=4),
    ))

story.append(PageBreak())

# ─── 1. SCHNELLSTART ────────────────────────────────────────

story.append(Paragraph("1. Schnellstart", style_h1))
story.append(hr())

story.append(Paragraph(
    "Das PM-Tool l\u00e4uft vollst\u00e4ndig in deinem Browser. Alle Daten werden lokal auf deinem "
    "Computer im Browser-Speicher (localStorage) gespeichert. Es ist keine Internetverbindung "
    "und keine Installation erforderlich, sobald der Entwicklungsserver l\u00e4uft.",
    style_body,
))

story.append(Paragraph("Server starten", style_h2))
story.append(Paragraph(
    "1. \u00d6ffne ein Terminal/Eingabeaufforderung im Projektordner<br/>"
    "2. F\u00fchre <font color='#3B82F6'><b>npm run dev</b></font> aus<br/>"
    "3. \u00d6ffne im Browser: <font color='#3B82F6'><b>http://localhost:5173</b></font><br/>"
    "4. Zum Beenden: <b>Ctrl+C</b> im Terminal",
    style_body,
))

story.append(Paragraph("Erstes Projekt", style_h2))
story.append(Paragraph(
    "Beim ersten Start siehst du den Startbildschirm mit folgenden Optionen:",
    style_body,
))
story.append(bullet("<b>Leeres Projekt erstellen</b> \u2013 Startet mit einem leeren Projekt"))
story.append(bullet("<b>Vorlage: IT / Bau / Instandhaltung / Fachschule</b> \u2013 L\u00e4dt eine vorgefertigte Projektstruktur mit typischen Vorg\u00e4ngen und Abh\u00e4ngigkeiten"))
story.append(bullet("<b>JSON importieren</b> \u2013 L\u00e4dt ein zuvor exportiertes Projekt"))

story.append(Paragraph(
    "<b>Tipp:</b> F\u00fcr den Einstieg empfiehlt sich eine Vorlage \u2013 so siehst du sofort, "
    "wie Gantt-Diagramm, Netzplan und Dashboard mit Daten aussehen.",
    style_tip,
))

story.append(PageBreak())

# ─── 2. PROJEKT ERSTELLEN UND VERWALTEN ─────────────────────

story.append(Paragraph("2. Projekt erstellen und verwalten", style_h1))
story.append(hr())

story.append(Paragraph("Kopfzeile (Header)", style_h2))
story.append(Paragraph(
    "Die Kopfzeile zeigt den Projektnamen und Status. Hier findest du alle wichtigen Aktionen:",
    style_body,
))

story.append(colored_table(
    ['Element', 'Funktion'],
    [
        ['Projektname', 'Wird oben links angezeigt; bearbeitbar im Tab-Bereich rechts'],
        ['Status-Badge', 'Zeigt den aktuellen Projektstatus (z.B. "Planung")'],
        [Paragraph('<font color="#3B82F6">&#8617;</font> / <font color="#3B82F6">&#8618;</font>', style_body), 'Undo / Redo (r\u00fcckg\u00e4ngig / wiederherstellen)'],
        ['Vorlagen', 'Dropdown-Men\u00fc mit 4 Projektvorlagen'],
        ['Export', 'Speichert das Projekt als JSON-Datei'],
        ['Import', 'L\u00e4dt eine JSON-Datei als Projekt'],
        ['+ Neu', 'Erstellt ein neues leeres Projekt'],
    ],
    col_widths=[4 * cm, 12.7 * cm],
))

story.append(Paragraph("Tab-Navigation", style_h2))
story.append(Paragraph(
    "Unter der Kopfzeile befinden sich 4 Tabs. Klicke auf einen Tab, um die Ansicht zu wechseln:",
    style_body,
))
story.append(colored_table(
    ['Tab', 'Inhalt'],
    [
        [Paragraph('<font color="#3B82F6"><b>Gantt</b></font>', style_body), 'Vorgangstabelle + Gantt-Diagramm + Detail-Panel'],
        [Paragraph('<font color="#3B82F6"><b>Ressourcen</b></font>', style_body), 'Ressourcenliste + Zuordnungen + Auslastungsdiagramm'],
        [Paragraph('<font color="#3B82F6"><b>Netzplan</b></font>', style_body), 'Vorgangsknotennetz nach DIN 69900 (interaktiv)'],
        [Paragraph('<font color="#3B82F6"><b>Dashboard</b></font>', style_body), 'Fortschritt, SPI, Meilensteine, kritischer Pfad'],
    ],
    col_widths=[4 * cm, 12.7 * cm],
))

story.append(Paragraph("Projekteinstellungen", style_h2))
story.append(Paragraph(
    "Rechts neben den Tabs findest du zwei bearbeitbare Felder:",
    style_body,
))
story.append(bullet("<b>Projektname</b> \u2013 Klicke auf den Namen und tippe einen neuen ein"))
story.append(bullet("<b>Startdatum</b> \u2013 Klicke auf das Datum und w\u00e4hle ein neues. "
    "Das Startdatum beeinflusst die Netzplanberechnung (FAZ/FEZ aller Vorg\u00e4nge)"))

story.append(Paragraph("Automatisches Speichern", style_h2))
story.append(Paragraph(
    "Das PM-Tool speichert automatisch alle \u00c4nderungen nach 2 Sekunden Inaktivit\u00e4t. "
    "Es ist kein manuelles Speichern n\u00f6tig. Die Daten bleiben im Browser erhalten, auch "
    "wenn du den Tab schlie\u00dft. Beim n\u00e4chsten \u00d6ffnen wird das letzte Projekt automatisch geladen.",
    style_body,
))

story.append(Paragraph(
    "<b>Achtung:</b> Das L\u00f6schen der Browser-Daten (Cache/Cookies) entfernt auch die Projektdaten! "
    "Nutze regelm\u00e4\u00dfig die Export-Funktion als Backup.",
    style_warn,
))

story.append(PageBreak())

# ─── 3. GANTT-ANSICHT ───────────────────────────────────────

story.append(Paragraph("3. Gantt-Ansicht", style_h1))
story.append(hr())

story.append(Paragraph(
    "Die Gantt-Ansicht ist die zentrale Arbeitsfl\u00e4che des PM-Tools. Sie besteht aus drei Bereichen:",
    style_body,
))

story.append(Paragraph("3.1 Vorgangstabelle (links)", style_h2))
story.append(Paragraph(
    "Die Tabelle zeigt alle Vorg\u00e4nge mit folgenden Spalten:",
    style_body,
))

story.append(colored_table(
    ['Spalte', 'Bedeutung'],
    [
        ['PSP', 'Projektstrukturplan-Code (z.B. "2.1")'],
        ['Name', 'Vorgangsbezeichnung'],
        ['Dauer', 'Geplante Dauer in Arbeitstagen (d) oder "MS" f\u00fcr Meilensteine'],
        ['FAZ', 'Fr\u00fchester Anfangszeitpunkt (berechnet)'],
        ['GP', 'Gesamtpuffer in Tagen (rot = kritisch, GP=0)'],
    ],
    col_widths=[3 * cm, 13.7 * cm],
))

story.append(Paragraph("Vorg\u00e4nge verwalten", style_h3))
story.append(bullet("<b>Neuer Vorgang:</b> Klicke auf <font color='#3B82F6'>+ Vorgang</font> in der Toolbar"))
story.append(bullet("<b>Vorgang ausw\u00e4hlen:</b> Klicke auf eine Zeile in der Tabelle \u2013 das Detail-Panel \u00f6ffnet sich"))
story.append(bullet("<b>Vorgang l\u00f6schen:</b> Klicke auf das <b>\u2715</b> am Ende der Zeile"))
story.append(bullet("<b>Farbliche Markierung:</b> Kritische Vorg\u00e4nge (GP=0) haben einen roten Hintergrund"))

story.append(Paragraph("3.2 Gantt-Diagramm (rechts)", style_h2))
story.append(Paragraph(
    "Das Diagramm zeigt eine Zeitachse mit den Vorg\u00e4ngen als visuelle Elemente:",
    style_body,
))
story.append(bullet("<b>Blaue Balken</b> \u2013 Normale Vorg\u00e4nge"))
story.append(bullet("<b>Rote Balken</b> \u2013 Kritische Vorg\u00e4nge (auf dem kritischen Pfad)"))
story.append(bullet("<b>Gr\u00fcne Balken</b> \u2013 Abgeschlossene Vorg\u00e4nge (100%)"))
story.append(bullet("<b>Gelbe Balken</b> \u2013 \u00dcberf\u00e4llige Vorg\u00e4nge"))
story.append(bullet("<b>Lila Rauten</b> \u2013 Meilensteine (Dauer 0)"))
story.append(bullet("<b>Schwarze Klammern</b> \u2013 Sammelvorg\u00e4nge"))
story.append(bullet("<b>Gestrichelte rote Linie</b> \u2013 Heute-Markierung"))
story.append(bullet("<b>Geschwungene Pfeile</b> \u2013 Abh\u00e4ngigkeiten zwischen Vorg\u00e4ngen"))

story.append(Paragraph(
    "Das Diagramm l\u00e4sst sich horizontal scrollen, um den gesamten Projektzeitraum zu sehen. "
    "Vertikales Scrollen ist mit der Tabelle synchronisiert.",
    style_body,
))

story.append(Paragraph("3.3 Detail-Panel (Seitenleiste)", style_h2))
story.append(Paragraph(
    "Wenn ein Vorgang ausgew\u00e4hlt ist, \u00f6ffnet sich rechts das Detail-Panel mit folgenden Feldern:",
    style_body,
))
story.append(bullet("<b>Name</b> \u2013 Vorgangsbezeichnung bearbeiten"))
story.append(bullet("<b>Typ</b> \u2013 Vorgang, Meilenstein oder Sammelvorgang"))
story.append(bullet("<b>Dauer (AT)</b> \u2013 Geplante Dauer in Arbeitstagen"))
story.append(bullet("<b>Fortschritt</b> \u2013 0\u2013100% per Schieberegler"))
story.append(bullet("<b>PSP-Code</b> \u2013 Projektstrukturplan-Nummer"))
story.append(bullet("<b>Notizen</b> \u2013 Freitext-Feld"))
story.append(bullet("<b>Berechnete Werte</b> \u2013 FAZ, FEZ, SAZ, SEZ, GP, FP (nur lesen)"))
story.append(bullet("<b>Vorg\u00e4nger</b> \u2013 Abh\u00e4ngigkeiten verwalten (siehe Abschnitt 7)"))

story.append(PageBreak())

# ─── 4. NETZPLAN-ANSICHT ────────────────────────────────────

story.append(Paragraph("4. Netzplan-Ansicht", style_h1))
story.append(hr())

story.append(Paragraph(
    "Der Netzplan zeigt das Vorgangsknotennetz (VKN) nach DIN 69900. "
    "Jeder Vorgang wird als Knoten dargestellt, Abh\u00e4ngigkeiten als Pfeile.",
    style_body,
))

story.append(Paragraph("Knotenformat (DIN 69900)", style_h2))
story.append(Paragraph(
    "Jeder Knoten hat drei Zeilen:",
    style_body,
))

story.append(colored_table(
    ['Zeile', 'Links', 'Mitte', 'Rechts'],
    [
        ['Oben', 'FAZ', 'Dauer', 'FEZ'],
        ['Mitte', '', 'Vorgangsname', ''],
        ['Unten', 'SAZ', 'GP (Gesamtpuffer)', 'SEZ'],
    ],
    col_widths=[3 * cm, 4.2 * cm, 5.3 * cm, 4.2 * cm],
))

story.append(Spacer(1, 6))
story.append(Paragraph("Erkl\u00e4rung der Abk\u00fcrzungen:", style_h3))
story.append(bullet("<b>FAZ</b> \u2013 Fr\u00fchester Anfangszeitpunkt"))
story.append(bullet("<b>FEZ</b> \u2013 Fr\u00fchester Endzeitpunkt"))
story.append(bullet("<b>SAZ</b> \u2013 Sp\u00e4tester Anfangszeitpunkt"))
story.append(bullet("<b>SEZ</b> \u2013 Sp\u00e4tester Endzeitpunkt"))
story.append(bullet("<b>GP</b> \u2013 Gesamtpuffer (Tage Spielraum)"))

story.append(Paragraph("Navigation", style_h2))
story.append(bullet("<b>Verschieben (Pan):</b> Klicke auf eine leere Fl\u00e4che und ziehe die Maus"))
story.append(bullet("<b>Zoomen:</b> Scrolle mit dem Mausrad"))
story.append(bullet("<b>+ / \u2013 Buttons:</b> Zoom-Steuerung in der Toolbar"))
story.append(bullet("<b>Reset:</b> Setzt Zoom und Position zur\u00fcck"))
story.append(bullet("<b>Knoten anklicken:</b> Zeigt Detailinfos in der Infoleiste unten"))

story.append(Paragraph("Farbbedeutung", style_h2))
story.append(bullet("<b>Rote Umrandung + roter Hintergrund</b> \u2013 Kritischer Pfad (GP = 0)"))
story.append(bullet("<b>Blaue Umrandung</b> \u2013 Ausgew\u00e4hlter Knoten"))
story.append(bullet("<b>Graue Umrandung</b> \u2013 Unkritische Vorg\u00e4nge"))
story.append(bullet("<b>Rote Pfeile</b> \u2013 Abh\u00e4ngigkeiten auf dem kritischen Pfad"))

story.append(PageBreak())

# ─── 5. RESSOURCEN-ANSICHT ──────────────────────────────────

story.append(Paragraph("5. Ressourcen-Ansicht", style_h1))
story.append(hr())

story.append(Paragraph(
    "Die Ressourcen-Ansicht besteht aus zwei Bereichen: der Ressourcenliste oben "
    "und dem Auslastungsdiagramm unten.",
    style_body,
))

story.append(Paragraph("5.1 Ressourcenliste", style_h2))
story.append(Paragraph(
    "Hier verwaltest du alle Projektressourcen (Personen, Material, Kosten):",
    style_body,
))
story.append(bullet("<b>+ Ressource:</b> Neue Ressource hinzuf\u00fcgen"))
story.append(bullet("<b>Bearbeiten (\u270f):</b> Name, Typ, Kapazit\u00e4t, Kosten und Farbe \u00e4ndern"))
story.append(bullet("<b>L\u00f6schen (\u2715):</b> Ressource und alle Zuordnungen entfernen"))
story.append(bullet("<b>\u26a0-Symbol:</b> Ressource ist \u00fcberlastet (mehr Arbeit als Kapazit\u00e4t)"))

story.append(Paragraph("Ressourcenfelder", style_h3))
story.append(colored_table(
    ['Feld', 'Bedeutung', 'Standard'],
    [
        ['Name', 'Bezeichnung der Ressource', '"Neue Ressource"'],
        ['Typ', 'Arbeit / Material / Kosten', 'Arbeit'],
        ['Kapazit\u00e4t', 'Verf\u00fcgbare Stunden pro Arbeitstag', '8h'],
        ['Kosten/h', 'Stundensatz in Euro', '0'],
        ['Farbe', 'Wird im Auslastungsdiagramm verwendet', 'Automatisch'],
    ],
    col_widths=[3 * cm, 9.7 * cm, 4 * cm],
))

story.append(Paragraph("5.2 Ressourcenzuordnungen", style_h2))
story.append(Paragraph(
    "Wenn eine Ressource ausgew\u00e4hlt ist, \u00f6ffnet sich rechts das Zuordnungs-Panel:",
    style_body,
))
story.append(bullet("W\u00e4hle einen Vorgang aus dem Dropdown und ordne ihn der Ressource zu"))
story.append(bullet("\u00c4ndere den <b>Aufwand</b> (Stunden) pro Zuordnung"))
story.append(bullet("Entferne Zuordnungen mit dem <b>\u2715</b>-Button"))

story.append(Paragraph("5.3 Auslastungsdiagramm", style_h2))
story.append(Paragraph(
    "Das gestapelte Balkendiagramm zeigt die w\u00f6chentliche Auslastung aller Ressourcen:",
    style_body,
))
story.append(bullet("Jede Farbe repr\u00e4sentiert eine Ressource"))
story.append(bullet("Die <b>rote gestrichelte Linie</b> zeigt die Gesamtkapazit\u00e4t"))
story.append(bullet("Balken \u00fcber der Linie bedeuten <b>\u00dcberlastung</b>"))
story.append(bullet("Fahre mit der Maus \u00fcber einen Balken f\u00fcr Details (Tooltip)"))

story.append(PageBreak())

# ─── 6. DASHBOARD ───────────────────────────────────────────

story.append(Paragraph("6. Dashboard-Ansicht", style_h1))
story.append(hr())

story.append(Paragraph(
    "Das Dashboard gibt einen \u00dcberblick \u00fcber den Projektstatus auf einen Blick.",
    style_body,
))

story.append(Paragraph("6.1 Gesamtfortschritt", style_h2))
story.append(Paragraph(
    "Der Fortschrittsbalken zeigt den gewichteten Fortschritt aller Vorg\u00e4nge "
    "(gewichtet nach Dauer). Farbwechsel bei 30%, 70% und 100%.",
    style_body,
))

story.append(Paragraph("6.2 SPI (Schedule Performance Index)", style_h2))
story.append(Paragraph(
    "Der SPI zeigt, ob das Projekt im Zeitplan liegt:",
    style_body,
))
story.append(colored_table(
    ['SPI-Wert', 'Bedeutung', 'Farbe'],
    [
        ['\u2265 0.95', 'Im Plan', 'Gr\u00fcn'],
        ['0.85 \u2013 0.94', 'Leicht verz\u00f6gert', 'Gelb'],
        ['< 0.85', 'Terminverzug', 'Rot'],
    ],
    col_widths=[4 * cm, 8.7 * cm, 4 * cm],
))

story.append(Paragraph("6.3 KPI-Karten", style_h2))
story.append(Paragraph(
    "Vier Kennzahlkarten zeigen auf einen Blick: Gesamtzahl Vorg\u00e4nge, Anzahl kritischer "
    "Vorg\u00e4nge, Meilensteine und Ressourcenstatus.",
    style_body,
))

story.append(Paragraph("6.4 Meilenstein-Timeline", style_h2))
story.append(Paragraph(
    "Zeigt die n\u00e4chsten 5 Meilensteine chronologisch sortiert:",
    style_body,
))
story.append(bullet("<b>Gr\u00fcne Raute</b> \u2013 Meilenstein liegt in der Vergangenheit"))
story.append(bullet("<b>Orange Raute</b> \u2013 Meilenstein ist heute f\u00e4llig"))
story.append(bullet("<b>Lila Raute</b> \u2013 Meilenstein liegt in der Zukunft"))
story.append(Paragraph(
    "Darunter wird eine horizontale Zeitleiste (SVG) mit den Meilensteinen angezeigt.",
    style_body,
))

story.append(Paragraph("6.5 Kritischer Pfad", style_h2))
story.append(Paragraph(
    "Listet alle Vorg\u00e4nge auf dem kritischen Pfad mit Start-/Endterminen und Dauer.",
    style_body,
))

story.append(Paragraph("6.6 Ressourcen-Status", style_h2))
story.append(Paragraph(
    "Zeigt Warnungen f\u00fcr \u00fcberlastete Ressourcen inkl. der betroffenen Tage. "
    "Wenn keine \u00dcberlastung vorliegt, wird ein gr\u00fcnes H\u00e4kchen angezeigt.",
    style_body,
))

story.append(PageBreak())

# ─── 7. ABHÄNGIGKEITEN ──────────────────────────────────────

story.append(Paragraph("7. Abh\u00e4ngigkeiten verwalten", style_h1))
story.append(hr())

story.append(Paragraph(
    "Abh\u00e4ngigkeiten definieren die Reihenfolge, in der Vorg\u00e4nge ausgef\u00fchrt werden m\u00fcssen. "
    "Sie sind die Grundlage f\u00fcr die Netzplanberechnung und den kritischen Pfad.",
    style_body,
))

story.append(Paragraph("Abh\u00e4ngigkeit hinzuf\u00fcgen", style_h2))
story.append(Paragraph(
    "1. Wechsle zum <b>Gantt</b>-Tab<br/>"
    "2. Klicke auf einen Vorgang (Zeile in der Tabelle)<br/>"
    "3. Im Detail-Panel unten findest du den Bereich <b>\u201eVorg\u00e4nger\u201c</b><br/>"
    "4. W\u00e4hle im Dropdown den Vorg\u00e4nger-Vorgang<br/>"
    "5. W\u00e4hle den Abh\u00e4ngigkeitstyp (EA, AA, EE, AE)<br/>"
    "6. Optional: Setze einen Zeitversatz in Arbeitstagen<br/>"
    "7. Klicke auf <b>+</b>",
    style_body,
))

story.append(Paragraph("Abh\u00e4ngigkeitstypen", style_h2))
story.append(colored_table(
    ['Typ', 'Bedeutung', 'Beschreibung'],
    [
        ['EA', 'Ende \u2192 Anfang', 'Nachfolger beginnt, wenn Vorg\u00e4nger endet (Standard)'],
        ['AA', 'Anfang \u2192 Anfang', 'Beide Vorg\u00e4nge beginnen gleichzeitig'],
        ['EE', 'Ende \u2192 Ende', 'Beide Vorg\u00e4nge enden gleichzeitig'],
        ['AE', 'Anfang \u2192 Ende', 'Nachfolger endet, wenn Vorg\u00e4nger beginnt'],
    ],
    col_widths=[2 * cm, 4.7 * cm, 10 * cm],
))

story.append(Paragraph("Zeitversatz (Lag/Lead)", style_h2))
story.append(bullet("<b>Positiver Wert (+)</b> \u2013 Lag: Wartezeit nach der Abh\u00e4ngigkeit (z.B. +2d = 2 Tage Pause)"))
story.append(bullet("<b>Negativer Wert (\u2013)</b> \u2013 Lead: \u00dcberlappung erlaubt (z.B. \u20132d = beginnt 2 Tage fr\u00fcher)"))
story.append(bullet("<b>0</b> \u2013 Direkte Abh\u00e4ngigkeit ohne Versatz (Standard)"))

story.append(Paragraph("Abh\u00e4ngigkeit l\u00f6schen", style_h2))
story.append(Paragraph(
    "Klicke auf das <b>\u2715</b> neben einer Abh\u00e4ngigkeit im Detail-Panel.",
    style_body,
))

story.append(Paragraph(
    "<b>Hinweis:</b> Zyklische Abh\u00e4ngigkeiten (A \u2192 B \u2192 C \u2192 A) werden automatisch erkannt "
    "und als Fehler in der roten Fehlermeldung oben angezeigt.",
    style_warn,
))

story.append(PageBreak())

# ─── 8. UNDO/REDO ───────────────────────────────────────────

story.append(Paragraph("8. Undo/Redo", style_h1))
story.append(hr())

story.append(Paragraph(
    "Das PM-Tool speichert die letzten 20 \u00c4nderungen und erm\u00f6glicht das R\u00fcckg\u00e4ngigmachen:",
    style_body,
))
story.append(bullet("<b>Undo (R\u00fcckg\u00e4ngig):</b> <font color='#3B82F6'>Ctrl+Z</font> oder <b>\u21a9</b>-Button im Header"))
story.append(bullet("<b>Redo (Wiederherstellen):</b> <font color='#3B82F6'>Ctrl+Y</font> oder <font color='#3B82F6'>Ctrl+Shift+Z</font> oder <b>\u21aa</b>-Button im Header"))
story.append(Paragraph(
    "Die Buttons sind ausgegraut, wenn kein Undo/Redo m\u00f6glich ist.",
    style_body,
))

# ─── 9. EXPORT UND IMPORT ──────────────────────────────────

story.append(Paragraph("9. Export und Import", style_h1))
story.append(hr())

story.append(Paragraph("Export", style_h2))
story.append(Paragraph(
    "Klicke auf <b>Export</b> im Header. Das Projekt wird als JSON-Datei heruntergeladen. "
    "Die Datei enth\u00e4lt alle Vorg\u00e4nge, Abh\u00e4ngigkeiten, Ressourcen und Zuordnungen.",
    style_body,
))

story.append(Paragraph("Import", style_h2))
story.append(Paragraph(
    "Klicke auf <b>Import</b> und w\u00e4hle eine zuvor exportierte JSON-Datei. "
    "Das importierte Projekt ersetzt das aktuelle Projekt. Der Netzplan wird automatisch neu berechnet.",
    style_body,
))

story.append(Paragraph(
    "<b>Tipp:</b> Nutze den Export regelm\u00e4\u00dfig als Backup und zum Austausch von "
    "Projekten mit Kollegen.",
    style_tip,
))

# ─── 10. TASTATURKÜRZEL ────────────────────────────────────

story.append(Paragraph("10. Tastaturk\u00fcrzel", style_h1))
story.append(hr())

story.append(colored_table(
    ['Taste', 'Aktion'],
    [
        ['Ctrl+Z', 'Undo (R\u00fcckg\u00e4ngig)'],
        ['Ctrl+Y', 'Redo (Wiederherstellen)'],
        ['Ctrl+Shift+Z', 'Redo (Alternative)'],
    ],
    col_widths=[5 * cm, 11.7 * cm],
))

story.append(PageBreak())

# ─── 11. FARBSYSTEM ────────────────────────────────────────

story.append(Paragraph("11. Farbsystem", style_h1))
story.append(hr())

story.append(Paragraph(
    "Das PM-Tool verwendet ein konsistentes Farbsystem f\u00fcr alle Ansichten:",
    style_body,
))

story.append(colored_table(
    ['Element', 'Farbe', 'Hex-Code'],
    [
        ['Normaler Vorgang', 'Blau', '#3B82F6'],
        ['Kritischer Pfad', 'Rot', '#EF4444'],
        ['Abgeschlossen (100%)', 'Gr\u00fcn', '#22C55E'],
        ['\u00dcberf\u00e4llig', 'Gelb/Orange', '#F59E0B'],
        ['Meilenstein', 'Lila', '#8B5CF6'],
        ['Sammelvorgang', 'Dunkel', '#1E293B'],
        ['Heute-Linie', 'Rot (gestrichelt)', '#EF4444'],
    ],
    col_widths=[5 * cm, 5.85 * cm, 5.85 * cm],
))

# ─── 12. TIPPS UND HINWEISE ────────────────────────────────

story.append(Paragraph("12. Tipps und Hinweise", style_h1))
story.append(hr())

story.append(Paragraph("Projektplanung", style_h2))
story.append(bullet("Beginne mit Meilensteinen (Start/Ende), dann f\u00fcge Vorg\u00e4nge dazwischen ein"))
story.append(bullet("Definiere Abh\u00e4ngigkeiten \u2013 ohne sie gibt es keinen kritischen Pfad"))
story.append(bullet("Nutze PSP-Codes (1.1, 1.2, 2.1 ...) f\u00fcr eine klare Struktur"))
story.append(bullet("Setze den Fortschritt regelm\u00e4\u00dfig \u2013 das Dashboard zeigt dann den SPI"))

story.append(Paragraph("Ressourcenplanung", style_h2))
story.append(bullet("Erstelle Ressourcen im Ressourcen-Tab"))
story.append(bullet("Ordne Ressourcen Vorg\u00e4ngen zu (Aufwand in Stunden)"))
story.append(bullet("Pr\u00fcfe das Auslastungsdiagramm auf \u00dcberlastungen"))
story.append(bullet("Passe Kapazit\u00e4ten oder Zuordnungen an, um \u00dcberlastungen zu beheben"))

story.append(Paragraph("Netzplan lesen", style_h2))
story.append(bullet("Knoten auf dem kritischen Pfad haben <b>GP = 0</b> (keinen Puffer)"))
story.append(bullet("Verz\u00f6gerungen auf dem kritischen Pfad verz\u00f6gern das gesamte Projekt"))
story.append(bullet("Unkritische Vorg\u00e4nge haben Puffer (GP > 0) und k\u00f6nnen sich verz\u00f6gern"))

story.append(Paragraph("Performance", style_h2))
story.append(bullet("Das Tool l\u00e4uft komplett im Browser \u2013 keine Internetverbindung n\u00f6tig"))
story.append(bullet("Daten werden automatisch alle 2 Sekunden gespeichert"))
story.append(bullet("Bei gro\u00dfen Projekten (50+ Vorg\u00e4nge): Netzplan-Zoom nutzen"))

story.append(Spacer(1, 30))
story.append(hr())
story.append(Paragraph(
    "PM-Tool v1.0 \u2013 Bedienungsanleitung \u2013 M\u00e4rz 2026",
    style_footer,
))

# ── BUILD ──────────────────────────────────────────────────

doc.build(story)
print(f"\nPDF erstellt: {output_path}")
