#!/usr/bin/env python3
"""
Erstellt die PM-Tool Bedienungsanleitung V2 als PDF.
Ausführliche Anleitung mit detaillierten Erklärungen aller Funktionen.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether, ListFlowable, ListItem,
)
from reportlab.pdfgen import canvas
from reportlab.lib import colors

# ─── Farben ──────────────────────────────────────────────
BLUE = HexColor('#3B82F6')
DARK_BLUE = HexColor('#1E40AF')
RED = HexColor('#EF4444')
GREEN = HexColor('#22C55E')
AMBER = HexColor('#F59E0B')
PURPLE = HexColor('#8B5CF6')
SLATE = HexColor('#475569')
LIGHT_SLATE = HexColor('#94A3B8')
BG_BLUE = HexColor('#EFF6FF')
BG_SLATE = HexColor('#F8FAFC')
DARK = HexColor('#1E293B')

# ─── Stile ───────────────────────────────────────────────
styles = getSampleStyleSheet()

styles.add(ParagraphStyle(
    'CoverTitle', fontName='Helvetica-Bold', fontSize=28,
    textColor=DARK_BLUE, alignment=TA_CENTER, spaceAfter=8,
))
styles.add(ParagraphStyle(
    'CoverSub', fontName='Helvetica', fontSize=14,
    textColor=SLATE, alignment=TA_CENTER, spaceAfter=4,
))
styles.add(ParagraphStyle(
    'H1', fontName='Helvetica-Bold', fontSize=18,
    textColor=DARK_BLUE, spaceBefore=18, spaceAfter=10,
    borderWidth=0, borderPadding=0,
))
styles.add(ParagraphStyle(
    'H2', fontName='Helvetica-Bold', fontSize=14,
    textColor=DARK, spaceBefore=14, spaceAfter=6,
))
styles.add(ParagraphStyle(
    'H3', fontName='Helvetica-Bold', fontSize=11,
    textColor=SLATE, spaceBefore=10, spaceAfter=4,
))
styles.add(ParagraphStyle(
    'Body', fontName='Helvetica', fontSize=10,
    textColor=DARK, leading=14, spaceAfter=6,
    alignment=TA_JUSTIFY,
))
styles.add(ParagraphStyle(
    'BodySmall', fontName='Helvetica', fontSize=9,
    textColor=SLATE, leading=12, spaceAfter=4,
))
styles.add(ParagraphStyle(
    'Tip', fontName='Helvetica-Oblique', fontSize=9,
    textColor=DARK_BLUE, leading=12, spaceAfter=6,
    leftIndent=12, borderWidth=0,
))
styles.add(ParagraphStyle(
    'Warning', fontName='Helvetica-Bold', fontSize=9,
    textColor=RED, leading=12, spaceAfter=6,
    leftIndent=12,
))
styles.add(ParagraphStyle(
    'CodeBlock', fontName='Courier', fontSize=9,
    textColor=DARK, backColor=BG_SLATE,
    leading=12, spaceAfter=6, leftIndent=12, rightIndent=12,
    borderPadding=4,
))
styles.add(ParagraphStyle(
    'TableHeader', fontName='Helvetica-Bold', fontSize=9,
    textColor=white, alignment=TA_CENTER,
))
styles.add(ParagraphStyle(
    'TableCell', fontName='Helvetica', fontSize=9,
    textColor=DARK, leading=11,
))
styles.add(ParagraphStyle(
    'Footer', fontName='Helvetica', fontSize=8,
    textColor=LIGHT_SLATE, alignment=TA_CENTER,
))

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=HexColor('#E2E8F0'), spaceAfter=8, spaceBefore=4)

def tip(text):
    return Paragraph(f"<b>Tipp:</b> {text}", styles['Tip'])

def warning(text):
    return Paragraph(f"Achtung: {text}", styles['Warning'])

def make_table(headers, rows, col_widths=None):
    """Erstellt eine formatierte Tabelle."""
    data = [headers] + rows
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DARK_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, BG_SLATE]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    return t

def add_page_number(canvas_obj, doc):
    canvas_obj.saveState()
    canvas_obj.setFont('Helvetica', 8)
    canvas_obj.setFillColor(LIGHT_SLATE)
    canvas_obj.drawCentredString(A4[0] / 2, 15 * mm, f"PM-Tool Bedienungsanleitung  |  Seite {doc.page}")
    canvas_obj.restoreState()

# ─── Dokument aufbauen ───────────────────────────────────
story = []

# ═══════ DECKBLATT ═══════
story.append(Spacer(1, 60 * mm))
story.append(Paragraph("PM-Tool", styles['CoverTitle']))
story.append(Paragraph("Projektmanagement im Browser", styles['CoverSub']))
story.append(Spacer(1, 8 * mm))
story.append(Paragraph("Bedienungsanleitung V2.0", ParagraphStyle(
    'cv2', fontName='Helvetica-Bold', fontSize=16, textColor=BLUE, alignment=TA_CENTER
)))
story.append(Spacer(1, 15 * mm))
story.append(Paragraph("MS-Project Alternative mit Gantt-Diagramm, Netzplan (DIN 69900),<br/>Ressourcenplanung und Earned-Value-Analyse", ParagraphStyle(
    'cv3', fontName='Helvetica', fontSize=11, textColor=SLATE, alignment=TA_CENTER, leading=16
)))
story.append(Spacer(1, 30 * mm))

# Feature-Boxen
features = [
    ["Gantt-Diagramm", "Netzplan (VKN)", "Ressourcen", "Dashboard"],
    ["Zeitachse + Balken", "DIN 69900 konform", "Auslastung + Kosten", "SPI + Fortschritt"],
]
ft = Table(features, colWidths=[110, 110, 110, 110])
ft.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), BLUE),
    ('TEXTCOLOR', (0, 0), (-1, 0), white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 10),
    ('FONTNAME', (0, 1), (-1, 1), 'Helvetica'),
    ('FONTSIZE', (0, 1), (-1, 1), 8),
    ('TEXTCOLOR', (0, 1), (-1, 1), SLATE),
    ('BACKGROUND', (0, 1), (-1, 1), BG_BLUE),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, BLUE),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('ROUNDEDCORNERS', [4, 4, 4, 4]),
]))
story.append(ft)
story.append(Spacer(1, 20 * mm))
story.append(Paragraph("Stand: Maerz 2026", ParagraphStyle(
    'cv4', fontName='Helvetica', fontSize=9, textColor=LIGHT_SLATE, alignment=TA_CENTER
)))
story.append(PageBreak())

# ═══════ INHALTSVERZEICHNIS ═══════
story.append(Paragraph("Inhaltsverzeichnis", styles['H1']))
story.append(hr())

toc = [
    ("1.", "Schnellstart", "3"),
    ("2.", "Die Benutzeroberflaeche im Ueberblick", "4"),
    ("3.", "Gantt-Ansicht: Vorgaenge verwalten", "5"),
    ("4.", "Detail-Panel: Vorgaenge bearbeiten", "7"),
    ("5.", "Abhaengigkeiten und Netzplan", "9"),
    ("6.", "Kontextmenue und Schnellaktionen", "11"),
    ("7.", "Ressourcen-Ansicht", "12"),
    ("8.", "Dashboard und Kennzahlen", "13"),
    ("9.", "Projektvorlagen", "14"),
    ("10.", "Import, Export und Datenhaltung", "15"),
    ("11.", "Tastaturkuerzel", "16"),
    ("12.", "Farbsystem und visuelle Kodierung", "17"),
    ("13.", "Tipps fuer fortgeschrittene Nutzer", "18"),
]

for nr, title, page in toc:
    story.append(Paragraph(
        f"<b>{nr}</b>&nbsp;&nbsp;{title} {'.' * (60 - len(title))} {page}",
        ParagraphStyle('toc', fontName='Helvetica', fontSize=10, textColor=DARK, leading=18, leftIndent=10)
    ))

story.append(PageBreak())

# ═══════ 1. SCHNELLSTART ═══════
story.append(Paragraph("1. Schnellstart", styles['H1']))
story.append(hr())

story.append(Paragraph(
    "Das PM-Tool startet mit einem Startbildschirm, der Ihnen vier Moeglichkeiten bietet:",
    styles['Body']
))

story.append(Paragraph("Neues Projekt erstellen", styles['H3']))
story.append(Paragraph(
    "Klicken Sie auf <b>\"+ Leeres Projekt erstellen\"</b>, um ein Projekt ohne Vorgaenge zu starten. "
    "Sie koennen dann im Gantt-Tab Vorgaenge manuell hinzufuegen.",
    styles['Body']
))

story.append(Paragraph("Vorlage verwenden", styles['H3']))
story.append(Paragraph(
    "Waehlen Sie eine der vier vordefinierten Projektvorlagen: <b>IT</b> (Softwareprojekt mit 7 Vorgaengen), "
    "<b>Bau</b> (Bauprojekt mit 8 Vorgaengen), <b>Instandhaltung</b> (Wartungsprojekt mit 9 Vorgaengen) oder "
    "<b>Fachschule</b> (Facharbeit mit 7 Vorgaengen). Jede Vorlage enthaelt vordefinierte Abhaengigkeiten.",
    styles['Body']
))

story.append(Paragraph("Projekt importieren", styles['H3']))
story.append(Paragraph(
    "Klicken Sie auf <b>\"JSON-Datei importieren\"</b> um ein zuvor exportiertes Projekt zu laden. "
    "Die Datei muss im PM-Tool JSON-Format vorliegen.",
    styles['Body']
))

story.append(tip(
    "Beim ersten Start empfiehlt sich eine Vorlage, um die Funktionen des Tools kennenzulernen."
))

story.append(Paragraph("Erster Schritt nach dem Start", styles['H3']))
story.append(Paragraph(
    "Nach dem Erstellen/Laden eines Projekts landen Sie automatisch in der <b>Gantt-Ansicht</b>. "
    "Dort sehen Sie links die Vorgangstabelle und rechts das Gantt-Diagramm mit Zeitachse. "
    "Klicken Sie auf <b>\"+ Vorgang\"</b> oben rechts, um Ihren ersten Vorgang anzulegen.",
    styles['Body']
))

story.append(PageBreak())

# ═══════ 2. BENUTZEROBERFLAECHE ═══════
story.append(Paragraph("2. Die Benutzeroberflaeche im Ueberblick", styles['H1']))
story.append(hr())

story.append(Paragraph("Die Anwendung ist in drei Hauptbereiche gegliedert:", styles['Body']))

story.append(Paragraph("Kopfleiste (Header)", styles['H2']))
story.append(Paragraph(
    "Ganz oben finden Sie den <b>Projektnamen</b> und den Status. Rechts daneben befinden sich die Aktionsbuttons:",
    styles['Body']
))

header_items = [
    ["Element", "Funktion", "Hinweis"],
    ["Rueckgaengig-Pfeil", "Letzte Aenderung zuruecknehmen", "Auch: Strg+Z (max. 20 Schritte)"],
    ["Wiederholen-Pfeil", "Zurueckgenommene Aenderung wiederholen", "Auch: Strg+Y oder Strg+Shift+Z"],
    ["Vorlagen", "Dropdown mit 4 Projektvorlagen", "Ersetzt das aktuelle Projekt!"],
    ["Export", "Projekt als JSON-Datei herunterladen", "Fuer Backup und Datenaustausch"],
    ["Import", "JSON-Datei laden", "Ersetzt das aktuelle Projekt"],
    ["+ Neu", "Neues leeres Projekt erstellen", "Loescht nicht das gespeicherte Projekt"],
]
story.append(make_table(header_items[0], header_items[1:], col_widths=[80, 180, 190]))
story.append(Spacer(1, 4 * mm))

story.append(tip(
    "Fahren Sie mit der Maus ueber die Buttons, um einen Tooltip mit Beschreibung zu sehen."
))

story.append(Paragraph("Tab-Navigation", styles['H2']))
story.append(Paragraph(
    "Unterhalb der Kopfleiste befinden sich vier Tabs, die die Hauptansichten des Tools darstellen:",
    styles['Body']
))

tabs_data = [
    ["Tab", "Symbol", "Beschreibung"],
    ["Gantt", "Balkendiagramm", "Vorgangstabelle + Gantt-Diagramm (Hauptarbeitsbereich)"],
    ["Ressourcen", "Personen", "Ressourcenliste, Zuordnungen und Auslastungsdiagramm"],
    ["Netzplan", "Verknuepfung", "Vorgangsknotennetzplan nach DIN 69900"],
    ["Dashboard", "Statistik", "Projektuebersicht mit KPIs, SPI und Meilensteinen"],
]
story.append(make_table(tabs_data[0], tabs_data[1:], col_widths=[70, 70, 310]))
story.append(Spacer(1, 4 * mm))

story.append(Paragraph(
    "Rechts in der Tab-Leiste koennen Sie den <b>Projektnamen</b> und das <b>Startdatum</b> direkt bearbeiten. "
    "Klicken Sie einfach in das jeweilige Feld und tippen Sie den neuen Wert.",
    styles['Body']
))

story.append(Paragraph("Automatisches Speichern", styles['H2']))
story.append(Paragraph(
    "Alle Aenderungen werden <b>automatisch</b> nach 2 Sekunden im Browser gespeichert (localStorage). "
    "Sie erkennen das Speichern am Toast-Hinweis <b>\"Projekt gespeichert\"</b> am unteren Bildschirmrand. "
    "Ein manuelles Speichern ist nicht noetig.",
    styles['Body']
))

story.append(warning(
    "Die Daten liegen nur im lokalen Browser. Loeschen Sie den Browser-Cache, gehen die Daten verloren. "
    "Nutzen Sie den Export-Button fuer Backups!"
))

story.append(PageBreak())

# ═══════ 3. GANTT-ANSICHT ═══════
story.append(Paragraph("3. Gantt-Ansicht: Vorgaenge verwalten", styles['H1']))
story.append(hr())

story.append(Paragraph(
    "Die Gantt-Ansicht ist der Hauptarbeitsbereich. Sie besteht aus drei Bereichen, die nebeneinander angeordnet sind:",
    styles['Body']
))

story.append(Paragraph("3.1 Vorgangstabelle (links)", styles['H2']))
story.append(Paragraph(
    "Die linke Tabelle zeigt alle Vorgaenge mit folgenden Spalten:",
    styles['Body']
))

cols_data = [
    ["Spalte", "Bedeutung", "Beispiel"],
    ["PSP", "Projektstrukturplan-Code (hierarchisch)", "1, 2.1, 3.1"],
    ["Name", "Bezeichnung des Vorgangs", "Anforderungsanalyse"],
    ["Dauer", "Dauer in Arbeitstagen (AT)", "5d, 10d, MS"],
    ["FAZ", "Fruehester Anfangszeitpunkt (berechnet)", "03-17 (= 17. Maerz)"],
    ["GP", "Gesamtpuffer in Tagen (0 = kritisch!)", "0 (rot), 5 (grau)"],
]
story.append(make_table(cols_data[0], cols_data[1:], col_widths=[50, 200, 200]))
story.append(Spacer(1, 4 * mm))

story.append(tip(
    "Fahren Sie mit der Maus ueber die Spaltenueberschriften (PSP, FAZ, GP) um eine Erklaerung zu sehen."
))

story.append(Paragraph("Vorgang hinzufuegen", styles['H3']))
story.append(Paragraph(
    "Klicken Sie auf <b>\"+ Vorgang\"</b> in der Toolbar oben. Ein neuer Vorgang wird am Ende der Liste "
    "eingefuegt. Sie koennen ihn dann im Detail-Panel rechts bearbeiten.",
    styles['Body']
))

story.append(Paragraph("Vorgang loeschen", styles['H3']))
story.append(Paragraph(
    "Klicken Sie auf das <b>X</b> am rechten Rand der Tabellenzeile. Der Vorgang wird zusammen mit "
    "allen zugehoerigen Abhaengigkeiten und Ressourcen-Zuordnungen geloescht.",
    styles['Body']
))

story.append(Paragraph("Vorgang auswaehlen", styles['H3']))
story.append(Paragraph(
    "Klicken Sie auf eine Tabellenzeile oder auf den zugehoerigen Balken im Gantt-Diagramm. "
    "Die Zeile wird blau hervorgehoben und das Detail-Panel oeffnet sich rechts.",
    styles['Body']
))

story.append(Paragraph("3.2 Gantt-Diagramm (Mitte)", styles['H2']))
story.append(Paragraph(
    "Das Gantt-Diagramm zeigt die zeitliche Planung aller Vorgaenge:",
    styles['Body']
))

gantt_elemente = [
    ["Element", "Darstellung", "Bedeutung"],
    ["Zeitachse oben", "Monate + Kalenderwochen", "Zeigt den Projektzeitraum"],
    ["Blaue Balken", "Horizontale Balken", "Normaler Vorgang mit Dauer"],
    ["Rote Balken", "Horizontale Balken", "Vorgang auf dem kritischen Pfad"],
    ["Gruene Balken", "Horizontale Balken", "Vorgang mit 100% Fortschritt"],
    ["Gelbe Balken", "Horizontale Balken", "Ueberfaelliger Vorgang"],
    ["Lila Raute", "Diamant-Form", "Meilenstein (Dauer = 0)"],
    ["Dunkle Klammer", "Klammer-Form", "Sammelvorgang"],
    ["Gestrichelte rote Linie", "Vertikale Linie", "Heute-Markierung"],
    ["Kurvenpfeile", "Bezier-Kurven", "Abhaengigkeitsbeziehungen"],
    ["Weisser Balken im Balken", "Duenner Streifen", "Fortschrittsanzeige innerhalb"],
]
story.append(make_table(gantt_elemente[0], gantt_elemente[1:], col_widths=[105, 110, 235]))
story.append(Spacer(1, 4 * mm))

story.append(Paragraph("Hover-Popover", styles['H3']))
story.append(Paragraph(
    "Fahren Sie mit der Maus ueber einen Gantt-Balken. Nach kurzer Verzoegerung erscheint ein "
    "<b>Popover-Fenster</b> mit detaillierten Informationen:",
    styles['Body']
))

popover_items = [
    ["Vorgangsname und Status (Geplant, In Arbeit, Abgeschlossen, Ueberfaellig, Kritischer Pfad)"],
    ["Dauer in Arbeitstagen"],
    ["Vorgangstyp (Vorgang, Meilenstein, Sammelvorgang)"],
    ["Anfangs- und Enddatum (dd.MM.yyyy Format)"],
    ["Fortschritt in Prozent mit Fortschrittsbalken"],
    ["Gesamtpuffer (rot hervorgehoben bei kritischem Pfad)"],
    ["PSP-Code (falls vergeben)"],
]
for item in popover_items:
    story.append(Paragraph(f"  - {item[0]}", styles['BodySmall']))

story.append(Spacer(1, 2 * mm))
story.append(tip(
    "Der Popover folgt der Mausbewegung und verschwindet beim Verlassen des Balkens."
))

story.append(Paragraph("Synchrones Scrollen", styles['H3']))
story.append(Paragraph(
    "Tabelle und Diagramm scrollen <b>synchron vertikal</b>. Wenn Sie in der Tabelle nach unten scrollen, "
    "bewegt sich das Diagramm mit und umgekehrt. So bleibt die Zuordnung zwischen Zeile und Balken immer sichtbar.",
    styles['Body']
))

story.append(PageBreak())

# ═══════ 4. DETAIL-PANEL ═══════
story.append(Paragraph("4. Detail-Panel: Vorgaenge bearbeiten", styles['H1']))
story.append(hr())

story.append(Paragraph(
    "Wenn Sie einen Vorgang auswaehlen (Klick auf Tabellenzeile oder Gantt-Balken), "
    "oeffnet sich rechts das <b>Detail-Panel</b>. Hier koennen Sie alle Eigenschaften bearbeiten:",
    styles['Body']
))

story.append(Paragraph("4.1 Editierbare Felder", styles['H2']))

felder = [
    ["Feld", "Typ", "Beschreibung"],
    ["Name", "Textfeld", "Bezeichnung des Vorgangs (frei waehlbar)"],
    ["Typ", "Dropdown", "Vorgang, Meilenstein oder Sammelvorgang"],
    ["Dauer (AT)", "Zahlfeld", "Dauer in Arbeitstagen (0 fuer Meilenstein)"],
    ["Fortschritt", "Schieberegler", "0% bis 100%, Anzeige des Werts"],
    ["PSP-Code", "Textfeld", "Projektstrukturplan-Code (z.B. 2.1)"],
    ["Notizen", "Textbereich", "Freies Notizenfeld fuer Hinweise"],
]
story.append(make_table(felder[0], felder[1:], col_widths=[80, 80, 290]))
story.append(Spacer(1, 4 * mm))

story.append(Paragraph("4.2 Berechnete Werte (nur Anzeige)", styles['H2']))
story.append(Paragraph(
    "Unterhalb der editierbaren Felder zeigt das Detail-Panel die vom CPM-Algorithmus "
    "<b>automatisch berechneten</b> Werte an:",
    styles['Body']
))

berechnete = [
    ["Abkuerzung", "Vollstaendiger Name", "Bedeutung"],
    ["FAZ", "Fruehester Anfangszeitpunkt", "Fruehestmoeglicher Startzeitpunkt des Vorgangs"],
    ["FEZ", "Fruehestes Ende", "Fruehestmoegliches Ende (FAZ + Dauer)"],
    ["SAZ", "Spaetester Anfangszeitpunkt", "Spaetestmoeglicher Start ohne Verzoegerung"],
    ["SEZ", "Spaetestes Ende", "Spaetestmoegliches Ende ohne Verzoegerung"],
    ["GP", "Gesamtpuffer", "Tage, die der Vorgang verzoegert werden darf"],
    ["FP", "Freier Puffer", "Tage bis zum fruehesten Nachfolger"],
    ["Kritisch", "Kritischer Pfad", "Ja/Nein - ob GP = 0"],
]
story.append(make_table(berechnete[0], berechnete[1:], col_widths=[60, 130, 260]))
story.append(Spacer(1, 4 * mm))

story.append(tip(
    "Alle berechneten Werte aktualisieren sich sofort, wenn Sie Dauer, Abhaengigkeiten oder das Startdatum aendern."
))

story.append(Paragraph("4.3 Vorgangstypen", styles['H2']))

story.append(Paragraph("<b>Vorgang</b> (Standard)", styles['H3']))
story.append(Paragraph(
    "Ein normaler Arbeitsvorgang mit einer Dauer > 0 Arbeitstagen. Wird als horizontaler Balken "
    "im Gantt-Diagramm dargestellt. Die Balkenfarbe zeigt den Status an (blau, rot, gruen, gelb).",
    styles['Body']
))

story.append(Paragraph("<b>Meilenstein</b>", styles['H3']))
story.append(Paragraph(
    "Ein Ereignis ohne Dauer (0 Tage). Wird als <b>lilafarbene Raute</b> im Gantt-Diagramm dargestellt. "
    "Typisch fuer Projektstart, Go-Live, Abnahmen etc. In der Tabelle steht 'MS' statt einer Dauer.",
    styles['Body']
))

story.append(Paragraph("<b>Sammelvorgang</b>", styles['H3']))
story.append(Paragraph(
    "Ein uebergeordneter Vorgang, der andere Vorgaenge zusammenfasst. Wird als <b>dunkle Klammer</b> "
    "im Gantt-Diagramm dargestellt. Die Dauer ergibt sich aus den untergeordneten Vorgaengen.",
    styles['Body']
))

story.append(PageBreak())

# ═══════ 5. ABHAENGIGKEITEN UND NETZPLAN ═══════
story.append(Paragraph("5. Abhaengigkeiten und Netzplan", styles['H1']))
story.append(hr())

story.append(Paragraph("5.1 Abhaengigkeiten verwalten", styles['H2']))
story.append(Paragraph(
    "Abhaengigkeiten (Anordnungsbeziehungen) definieren die Reihenfolge der Vorgaenge. "
    "Sie werden im <b>Detail-Panel</b> unter \"Vorgaenger\" verwaltet.",
    styles['Body']
))

story.append(Paragraph("Abhaengigkeit hinzufuegen", styles['H3']))
story.append(Paragraph(
    "1. Waehlen Sie den <b>Nachfolger-Vorgang</b> aus (Klick in Tabelle)<br/>"
    "2. Im Detail-Panel unter \"Vorgaenger\" waehlen Sie den <b>Vorgaenger</b> aus dem Dropdown<br/>"
    "3. Waehlen Sie den <b>Typ</b> (EA, AA, EE, AE)<br/>"
    "4. Optional: Geben Sie einen <b>Zeitversatz</b> in Tagen ein (positiv oder negativ)<br/>"
    "5. Klicken Sie auf <b>\"+\"</b>",
    styles['Body']
))

story.append(Paragraph("5.2 Abhaengigkeitstypen", styles['H2']))

dep_types = [
    ["Typ", "Name", "Bedeutung", "Beispiel"],
    ["EA", "Ende-Anfang", "Nachfolger startet nach Ende des Vorgaengers", "Rohbau fertig, dann Dach"],
    ["AA", "Anfang-Anfang", "Beide starten gleichzeitig", "Parallel: Elektrik + Sanitaer"],
    ["EE", "Ende-Ende", "Beide enden gleichzeitig", "Test endet mit Entwicklung"],
    ["AE", "Anfang-Ende", "Ende des Nachfolgers haengt vom Start ab", "Selten verwendet"],
]
story.append(make_table(dep_types[0], dep_types[1:], col_widths=[35, 80, 170, 165]))
story.append(Spacer(1, 4 * mm))

story.append(Paragraph("Zeitversatz", styles['H3']))
story.append(Paragraph(
    "Der Zeitversatz erlaubt es, eine Verzoegerung oder Ueberlappung einzufuegen:<br/>"
    "- <b>+3</b>: 3 Arbeitstage Wartezeit nach der Abhaengigkeit<br/>"
    "- <b>-2</b>: 2 Arbeitstage Ueberlappung (Nachfolger startet frueher)<br/>"
    "- <b>0</b>: Keine Verzoegerung (Standard)",
    styles['Body']
))

story.append(Paragraph("5.3 Netzplan-Ansicht (VKN nach DIN 69900)", styles['H2']))
story.append(Paragraph(
    "Im Tab <b>\"Netzplan\"</b> sehen Sie den Vorgangsknotennetzplan. Jeder Vorgang wird als "
    "Knotenkarte dargestellt:",
    styles['Body']
))

# VKN-Knoten Darstellung als Tabelle
vkn_data = [
    ["FAZ", "Dauer", "FEZ"],
    ["", "Vorgangsname", ""],
    ["SAZ", "GP", "SEZ"],
]
vkn = Table(vkn_data, colWidths=[90, 100, 90])
vkn.setStyle(TableStyle([
    ('GRID', (0, 0), (-1, -1), 1, DARK),
    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('BACKGROUND', (0, 0), (-1, 0), BG_BLUE),
    ('BACKGROUND', (0, 1), (-1, 1), white),
    ('BACKGROUND', (0, 2), (-1, 2), BG_SLATE),
    ('FONTNAME', (1, 1), (1, 1), 'Helvetica-Bold'),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('SPAN', (0, 1), (0, 1)),
    ('SPAN', (2, 1), (2, 1)),
]))
story.append(vkn)
story.append(Spacer(1, 4 * mm))

story.append(Paragraph("Netzplan-Bedienung", styles['H3']))
story.append(Paragraph(
    "- <b>Pan (Verschieben):</b> Klicken und ziehen Sie mit der Maus<br/>"
    "- <b>Zoom:</b> Mausrad scrollen oder +/- Buttons in der Toolbar<br/>"
    "- <b>Reset:</b> Klicken Sie \"Reset\" um zur Standardansicht zurueckzukehren<br/>"
    "- <b>Knoten anklicken:</b> Zeigt Details in der Info-Leiste<br/>"
    "- <b>Kritischer Pfad:</b> Knoten und Kanten auf dem kritischen Pfad sind <b>rot</b> hervorgehoben",
    styles['Body']
))

story.append(Paragraph("Auto-Layout", styles['H3']))
story.append(Paragraph(
    "Der Netzplan wird automatisch layoutet. Vorgaenge werden in <b>Ebenen</b> angeordnet: "
    "Links stehen Vorgaenge ohne Vorgaenger, nach rechts folgen die Nachfolger. "
    "Abhaengigkeiten werden als Bezier-Kurven dargestellt.",
    styles['Body']
))

story.append(PageBreak())

# ═══════ 6. KONTEXTMENUE ═══════
story.append(Paragraph("6. Kontextmenue und Schnellaktionen", styles['H1']))
story.append(hr())

story.append(Paragraph(
    "NEU: Per <b>Rechtsklick</b> auf eine Tabellenzeile in der Gantt-Ansicht oeffnet sich ein "
    "Kontextmenue mit praktischen Schnellaktionen:",
    styles['Body']
))

ctx_items = [
    ["Aktion", "Symbol", "Beschreibung"],
    ["Bearbeiten", "Stift", "Oeffnet das Detail-Panel fuer diesen Vorgang"],
    ["Als Meilenstein / Zu Vorgang", "Raute", "Wechselt den Typ zwischen Meilenstein und Vorgang"],
    ["Vorgang darunter einfuegen", "+", "Fuegt einen neuen Vorgang direkt unter dem aktuellen ein"],
    ["Duplizieren", "Zwischenablage", "Erstellt eine Kopie des Vorgangs mit '(Kopie)' im Namen"],
    ["Fortschritt 100%", "Haekchen", "Setzt den Vorgang sofort auf 'Abgeschlossen'"],
    ["Fortschritt 0%", "Zuruecksetzen", "Setzt den Fortschritt zurueck auf 0%"],
    ["Loeschen", "Papierkorb", "Loescht den Vorgang inkl. aller Abhaengigkeiten (rot markiert)"],
]
story.append(make_table(ctx_items[0], ctx_items[1:], col_widths=[110, 60, 280]))
story.append(Spacer(1, 4 * mm))

story.append(tip(
    "Das Kontextmenue ist besonders nuetzlich, um schnell mehrere Vorgaenge zu duplizieren "
    "oder den Fortschritt zu aendern, ohne jedes Mal das Detail-Panel oeffnen zu muessen."
))

story.append(Paragraph("Toast-Benachrichtigungen", styles['H2']))
story.append(Paragraph(
    "Jede Aktion wird durch eine kurze <b>Toast-Meldung</b> am unteren Bildschirmrand bestaetigt. "
    "Die Meldungen verschwinden automatisch nach 1,5-2,5 Sekunden. Beispiele:",
    styles['Body']
))

toast_items = [
    ["Aktion", "Toast-Meldung", "Farbe"],
    ["Vorgang hinzugefuegt", "\"Vorgang hinzugefuegt\"", "Gruen"],
    ["Vorgang geloescht", "\"Name geloescht\"", "Rot"],
    ["Projekt gespeichert", "\"Projekt gespeichert\"", "Blau"],
    ["Rueckgaengig", "\"Rueckgaengig gemacht\"", "Orange"],
    ["Wiederholen", "\"Wiederholt\"", "Orange"],
    ["Vorlage geladen", "\"Vorlage IT geladen\"", "Gruen"],
    ["Export", "\"JSON exportiert\"", "Gruen"],
    ["Dupliziert", "\"Name dupliziert\"", "Gruen"],
]
story.append(make_table(toast_items[0], toast_items[1:], col_widths=[100, 180, 170]))

story.append(PageBreak())

# ═══════ 7. RESSOURCEN-ANSICHT ═══════
story.append(Paragraph("7. Ressourcen-Ansicht", styles['H1']))
story.append(hr())

story.append(Paragraph(
    "Im Tab <b>\"Ressourcen\"</b> verwalten Sie Projektmitarbeiter, Maschinen und Material.",
    styles['Body']
))

story.append(Paragraph("7.1 Ressourcen verwalten", styles['H2']))
story.append(Paragraph(
    "Klicken Sie <b>\"+ Ressource\"</b> um eine neue Ressource anzulegen. Jede Ressource hat:",
    styles['Body']
))

res_felder = [
    ["Feld", "Beschreibung", "Beispiel"],
    ["Name", "Bezeichnung der Ressource", "Max Mustermann"],
    ["Typ", "Arbeit, Material oder Kosten", "Arbeit"],
    ["Kapazitaet", "Verfuegbare Stunden pro Tag (in %)", "100%"],
    ["Kostensatz", "Kosten pro Stunde/Einheit", "75 Euro/h"],
    ["Farbe", "Farbe im Auslastungsdiagramm", "Farbwaehler"],
]
story.append(make_table(res_felder[0], res_felder[1:], col_widths=[70, 200, 180]))
story.append(Spacer(1, 4 * mm))

story.append(Paragraph("7.2 Zuordnungen", styles['H2']))
story.append(Paragraph(
    "Waehlen Sie eine Ressource aus und klicken Sie auf <b>\"+ Zuordnung\"</b>. "
    "Waehlen Sie dann einen Vorgang und die geplanten Stunden. "
    "So weisen Sie Ressourcen zu Vorgaengen zu.",
    styles['Body']
))

story.append(Paragraph("7.3 Auslastungsdiagramm", styles['H2']))
story.append(Paragraph(
    "Unten in der Ressourcen-Ansicht zeigt ein <b>gestapeltes Balkendiagramm</b> die woechentliche "
    "Auslastung aller Ressourcen. Jede Farbe repraesentiert eine Ressource. "
    "Die rote gestrichelte Linie zeigt die <b>Gesamtkapazitaet</b>. "
    "Uebersteigt die Auslastung die Kapazitaet, erscheint ein Warnzeichen.",
    styles['Body']
))

story.append(warning(
    "Ueberlastete Ressourcen werden mit einem Warnsymbol markiert. "
    "Auch im Dashboard erscheinen Ueberlastungswarnungen."
))

story.append(PageBreak())

# ═══════ 8. DASHBOARD ═══════
story.append(Paragraph("8. Dashboard und Kennzahlen", styles['H1']))
story.append(hr())

story.append(Paragraph(
    "Das Dashboard bietet eine Uebersicht ueber den Projektstatus mit folgenden Elementen:",
    styles['Body']
))

story.append(Paragraph("8.1 Gesamtfortschritt", styles['H2']))
story.append(Paragraph(
    "Ein <b>gewichteter Fortschrittsbalken</b> zeigt den Gesamtfortschritt des Projekts. "
    "Die Gewichtung basiert auf der Dauer der Vorgaenge. "
    "Die Farbe wechselt von Rot (0%) ueber Gelb und Blau nach Gruen (100%).",
    styles['Body']
))

story.append(Paragraph("8.2 SPI (Schedule Performance Index)", styles['H2']))
story.append(Paragraph(
    "Der SPI-Wert aus der <b>Earned-Value-Analyse</b> zeigt, ob das Projekt im Zeitplan liegt:",
    styles['Body']
))

spi_data = [
    ["SPI-Wert", "Farbe", "Bedeutung"],
    [">= 0,95", "Gruen", "Im Plan - Projekt lauft planmaessig"],
    ["0,85 - 0,95", "Gelb", "Leicht verzoegert - Aufmerksamkeit noetig"],
    ["< 0,85", "Rot", "Terminverzug - Massnahmen erforderlich"],
]
story.append(make_table(spi_data[0], spi_data[1:], col_widths=[80, 60, 310]))
story.append(Spacer(1, 4 * mm))

story.append(Paragraph("8.3 KPI-Karten", styles['H2']))
story.append(Paragraph(
    "Vier Kennzahlenkarten zeigen auf einen Blick: <b>Anzahl Vorgaenge</b>, "
    "<b>Kritische Vorgaenge</b>, <b>Meilensteine</b> und <b>Ressourcen</b>.",
    styles['Body']
))

story.append(Paragraph("8.4 Meilenstein-Timeline", styles['H2']))
story.append(Paragraph(
    "Eine <b>horizontale Zeitleiste</b> zeigt alle Meilensteine mit Datum und Abstand zueinander. "
    "Abgeschlossene Meilensteine sind gruen, zukuenftige blau markiert.",
    styles['Body']
))

story.append(Paragraph("8.5 Kritischer Pfad", styles['H2']))
story.append(Paragraph(
    "Eine Liste aller Vorgaenge auf dem <b>kritischen Pfad</b> (GP = 0). "
    "Diese Vorgaenge bestimmen die Mindestprojektdauer. "
    "Jede Verzoegerung eines kritischen Vorgangs verzoegert das gesamte Projekt.",
    styles['Body']
))

story.append(Paragraph("8.6 Fortschrittstrend", styles['H2']))
story.append(Paragraph(
    "Ein <b>Liniendiagramm</b> zeigt den geplanten Fortschritt (Plan) im Vergleich zum "
    "tatsaechlichen Fortschritt (Ist) ueber die Projektlaufzeit.",
    styles['Body']
))

story.append(PageBreak())

# ═══════ 9. PROJEKTVORLAGEN ═══════
story.append(Paragraph("9. Projektvorlagen", styles['H1']))
story.append(hr())

story.append(Paragraph(
    "Das PM-Tool bietet vier vordefinierte Projektvorlagen zum Schnellstart:",
    styles['Body']
))

vorlagen = [
    ["Vorlage", "Vorgaenge", "Struktur"],
    ["IT (Softwareprojekt)", "7", "Projektstart -> Analyse -> Design -> Implementierung -> Testing -> Deployment -> Go-Live"],
    ["Bau (Bauprojekt)", "8", "Baubeginn -> Planung -> Rohbau -> Dach -> Innenausbau -> Haustechnik -> Aussen -> Abnahme"],
    ["Instandhaltung", "9", "Wartungsstart -> Inspektion -> Demontage -> Reinigung/Beschaffung -> Reparatur -> Montage -> Test -> Freigabe"],
    ["Fachschule", "7", "Projektauftrag -> Recherche -> Gliederung -> Ausarbeitung -> Korrektur -> Praesentation vorbereiten -> Praesentation"],
]
story.append(make_table(vorlagen[0], vorlagen[1:], col_widths=[100, 50, 300]))
story.append(Spacer(1, 4 * mm))

story.append(Paragraph(
    "Alle Vorlagen enthalten <b>EA-Abhaengigkeiten</b> (Ende-Anfang) in der angegebenen Reihenfolge. "
    "Die Instandhaltungs-Vorlage hat zusaetzlich parallele Pfade (Reinigung und Ersatzteilbeschaffung laufen gleichzeitig).",
    styles['Body']
))

story.append(warning(
    "Das Laden einer Vorlage oder eines neuen Projekts ersetzt das aktuelle Projekt. "
    "Exportieren Sie zuerst, wenn Sie Ihre aktuelle Arbeit behalten moechten!"
))

story.append(PageBreak())

# ═══════ 10. IMPORT/EXPORT ═══════
story.append(Paragraph("10. Import, Export und Datenhaltung", styles['H1']))
story.append(hr())

story.append(Paragraph("10.1 JSON-Export", styles['H2']))
story.append(Paragraph(
    "Klicken Sie <b>\"Export\"</b> in der Kopfleiste. Das Projekt wird als <b>.json-Datei</b> heruntergeladen. "
    "Die Datei enthaelt alle Vorgaenge, Abhaengigkeiten, Ressourcen, Zuordnungen und den Kalender.",
    styles['Body']
))

story.append(Paragraph("10.2 JSON-Import", styles['H2']))
story.append(Paragraph(
    "Klicken Sie <b>\"Import\"</b> und waehlen Sie eine .json-Datei aus. Das importierte Projekt "
    "ersetzt das aktuelle Projekt und der Netzplan wird automatisch neu berechnet.",
    styles['Body']
))

story.append(Paragraph("10.3 Automatisches Speichern", styles['H2']))
story.append(Paragraph(
    "Jede Aenderung wird mit 2 Sekunden Verzoegerung (Debounce) automatisch im <b>localStorage</b> "
    "des Browsers gespeichert. Beim naechsten Oeffnen der App wird das letzte Projekt automatisch geladen.",
    styles['Body']
))

story.append(Paragraph("10.4 Undo / Redo", styles['H2']))
story.append(Paragraph(
    "Das PM-Tool speichert die letzten <b>20 Aenderungsschritte</b> in einem History-Stack:",
    styles['Body']
))

undo_data = [
    ["Funktion", "Button", "Tastenkuerzel"],
    ["Rueckgaengig", "Pfeil links in der Kopfleiste", "Strg+Z"],
    ["Wiederholen", "Pfeil rechts in der Kopfleiste", "Strg+Y oder Strg+Shift+Z"],
]
story.append(make_table(undo_data[0], undo_data[1:], col_widths=[100, 180, 170]))
story.append(Spacer(1, 4 * mm))

story.append(tip(
    "Nach einem Undo sind die nachfolgenden Aenderungen noch per Redo erreichbar. "
    "Machen Sie aber eine neue Aenderung, wird der Redo-Stack geloescht."
))

story.append(PageBreak())

# ═══════ 11. TASTATURKUERZEL ═══════
story.append(Paragraph("11. Tastaturkuerzel", styles['H1']))
story.append(hr())

shortcuts = [
    ["Kuerzel", "Funktion", "Kontext"],
    ["Strg+Z", "Rueckgaengig (Undo)", "Ueberall in der App"],
    ["Strg+Y", "Wiederholen (Redo)", "Ueberall in der App"],
    ["Strg+Shift+Z", "Wiederholen (Alternative)", "Ueberall in der App"],
    ["Rechtsklick", "Kontextmenue oeffnen", "Auf Vorgangszeile in Gantt"],
    ["Mausrad", "Zoom im Netzplan", "In der Netzplan-Ansicht"],
    ["Klick + Ziehen", "Pan (Verschieben)", "In der Netzplan-Ansicht"],
]
story.append(make_table(shortcuts[0], shortcuts[1:], col_widths=[100, 170, 180]))

story.append(PageBreak())

# ═══════ 12. FARBSYSTEM ═══════
story.append(Paragraph("12. Farbsystem und visuelle Kodierung", styles['H1']))
story.append(hr())

story.append(Paragraph(
    "Das PM-Tool verwendet ein konsistentes Farbsystem, das auf einen Blick den Status "
    "jedes Elements zeigt. Die Farben basieren auf dem Masterprompt (Abschnitt E.1):",
    styles['Body']
))

farben = [
    ["Farbe", "Hex-Code", "Element", "Bedeutung"],
    ["Blau", "#3B82F6", "Vorgangsbalken", "Normaler, nicht-kritischer Vorgang"],
    ["Rot", "#EF4444", "Kritischer Pfad", "Vorgang mit GP = 0 (keine Pufferzeit)"],
    ["Gruen", "#22C55E", "Abgeschlossen", "Vorgang mit 100% Fortschritt"],
    ["Gelb/Amber", "#F59E0B", "Ueberfaellig", "Endtermin ueberschritten, < 100%"],
    ["Lila", "#8B5CF6", "Meilenstein", "Meilenstein-Raute im Gantt"],
    ["Dunkel", "#1E293B", "Sammelvorgang", "Sammelvorgang-Klammer"],
    ["Rot gestrichelt", "#EF4444", "Heute-Linie", "Heutiges Datum im Gantt"],
]
story.append(make_table(farben[0], farben[1:], col_widths=[65, 60, 100, 225]))
story.append(Spacer(1, 4 * mm))

story.append(Paragraph("Tabellen-Highlights", styles['H2']))
highlight_data = [
    ["Farbe", "Bedeutung"],
    ["Blau hervorgehoben", "Ausgewaehlter Vorgang"],
    ["Hellblau beim Hover", "Maus befindet sich ueber dieser Zeile"],
    ["Rosa Hintergrund", "Vorgang auf dem kritischen Pfad"],
    ["Rote GP-Zahl", "Gesamtpuffer = 0 (kritisch)"],
]
story.append(make_table(highlight_data[0], highlight_data[1:], col_widths=[120, 330]))

story.append(PageBreak())

# ═══════ 13. TIPPS ═══════
story.append(Paragraph("13. Tipps fuer fortgeschrittene Nutzer", styles['H1']))
story.append(hr())

tipps = [
    ("Parallele Vorgaenge anlegen",
     "Verwenden Sie den Abhaengigkeitstyp <b>AA (Anfang-Anfang)</b> um Vorgaenge zu definieren, "
     "die gleichzeitig starten sollen. So koennen Sie parallele Arbeitspakete modellieren."),

    ("Zeitpuffer einplanen",
     "Nutzen Sie den <b>Zeitversatz</b> bei Abhaengigkeiten, um Pufferzeiten einzubauen. "
     "Z.B. EA +2 bedeutet: 2 Arbeitstage Wartezeit nach Ende des Vorgaengers."),

    ("Kritischen Pfad optimieren",
     "Der kritische Pfad bestimmt die Mindestprojektdauer. Um das Projekt zu beschleunigen, "
     "muessen Sie Vorgaenge auf dem <b>kritischen Pfad</b> verkuerzen (rote Balken im Gantt)."),

    ("Regelmaessig exportieren",
     "Da die Daten nur im Browser liegen, exportieren Sie regelmaessig eine JSON-Datei als Backup. "
     "So koennen Sie auch zwischen verschiedenen Computern wechseln."),

    ("Kontextmenue nutzen",
     "Das Rechtsklick-Kontextmenue spart Zeit: Schnell duplizieren, Fortschritt aendern oder "
     "neue Vorgaenge zwischen bestehenden einfuegen."),

    ("PSP-Codes verwenden",
     "Vergeben Sie systematische PSP-Codes (z.B. 1.0, 2.1, 2.2, 3.1) um eine klare "
     "Projektstruktur zu schaffen. Die Codes erscheinen in der ersten Tabellenspalte."),

    ("Netzplan zur Analyse nutzen",
     "Der Netzplan zeigt die logische Struktur Ihres Projekts. Nutzen Sie ihn um "
     "Engpaesse zu identifizieren und die Abhaengigkeitskette zu verstehen."),

    ("Dashboard regelmaessig pruefen",
     "Das Dashboard zeigt Ihnen auf einen Blick: Ist das Projekt im Plan (SPI)? "
     "Gibt es ueberlastete Ressourcen? Welche Meilensteine stehen an?"),
]

for title, text in tipps:
    story.append(KeepTogether([
        Paragraph(f"<b>{title}</b>", styles['H3']),
        Paragraph(text, styles['Body']),
        Spacer(1, 2 * mm),
    ]))

story.append(Spacer(1, 10 * mm))
story.append(hr())
story.append(Paragraph(
    "<b>PM-Tool</b> - Projektmanagement im Browser<br/>"
    "Version 2.0  |  Stand: Maerz 2026<br/>"
    "Fragen? Starten Sie mit einer Vorlage und erkunden Sie die Funktionen!",
    ParagraphStyle('endnote', fontName='Helvetica', fontSize=9, textColor=SLATE, alignment=TA_CENTER, leading=14)
))

# ─── PDF erstellen ───────────────────────────────────────
output_path = "PM-Tool_Bedienungsanleitung_V2.pdf"
doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    topMargin=20 * mm,
    bottomMargin=20 * mm,
    leftMargin=18 * mm,
    rightMargin=18 * mm,
    title="PM-Tool Bedienungsanleitung V2",
    author="PM-Tool",
    subject="Bedienungsanleitung",
)

doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
print(f"PDF erstellt: {output_path}")
print(f"Seiten: {doc.page}")
