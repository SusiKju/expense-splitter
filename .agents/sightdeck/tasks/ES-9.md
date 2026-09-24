---
title: Neue Feature-Ideen für die Urlaubskasse-App evaluieren
task: ES-9
created: 2026-09-24T12:53
generated: refinement
---

# Neue Feature-Ideen für die Urlaubskasse-App evaluieren

Die bestehende App (Urlaubskasse / Expense Splitter) sichten, um den aktuellen Funktionsumfang zu verstehen. Darauf aufbauend neue Feature-Ideen sammeln, die für Kunden einen spürbaren Mehrwert oder Begeisterungseffekt haben. Ergebnis ist eine priorisierte Liste mit kurzer Begründung und grober Aufwandseinschätzung pro Idee. Offene Fragen: Wer ist die Zielgruppe genau, und gibt es Grenzen beim Umfang oder bei der Technik (z. B. nur Firebase, kein Backend)?

## Resolution / Ergebnis

**Ist-Stand (aus `urlaubskasse.html`, `settlement.js`):** Single-File-PWA, Firebase Realtime DB (Raum-Code-Sync, kein Login), Personen + Ausgaben (Betrag, Datum, Zahler, Teilnehmer – nur **Gleichverteilung**, nur **EUR**), Salden, Ausgleichsplan (abhakbar, kopierbar), Rundungswahl, Event-Infos (Zeitraum, Ort/Maps, Info), Kasse schließen, Theme, Willkommens-Modal, Avatare, Kassen-Historie. Nicht vorhanden: Kategorien, ungleiche Anteile, Fremdwährung, Belege, Statistik, Export, Erinnerungen.

**Priorisierte Ideen** (Wert für Kunden ÷ Aufwand; Aufwand: S ≤ ½ Tag, M ≈ 1–2 Tage, L > 2 Tage)

| # | Idee | Warum | Aufwand |
|---|------|-------|---------|
| 1 | **Ungleiche Anteile** (Beträge, Prozent oder „Anteile/Gewichte", z. B. Kind = 0,5) | Häufigster Grund, warum Gleichverteilung nicht reicht; Kern-Vergleichspunkt zu Splitwise. Betrifft `computeRaw` + Tests. | M |
| 2 | **Fremdwährungen** mit manuellem Kurs pro Ausgabe (Umrechnung nach EUR beim Speichern) | Urlaub = fast immer Ausland. Manueller Kurs = kein Backend/API nötig. | M |
| 3 | **Kategorien + Auswertung** (Essen, Unterkunft, Transport …; Kuchen-/Balkenübersicht pro Kategorie und Person) | „Wofür haben wir Geld ausgegeben?" – hoher Wow-Effekt, rein clientseitig. | M |
| 4 | **Zahlungslink beim Ausgleich** (PayPal.me / IBAN kopieren, Zahlungsinfo pro Person hinterlegen) | Schließt die Lücke zwischen „wer zahlt wem" und tatsächlicher Überweisung. Nur Text/Link. | S |
| 5 | **Beleg-Foto pro Ausgabe** (Firebase Storage ist konfiguriert) | Nachvollziehbarkeit bei Streit; Bucket-Config existiert schon. Kosten/Regeln prüfen (`database.rules.json` gilt nur für RTDB). | M–L |
| 6 | **Export als PDF/CSV/Teilen-Text** der Abrechnung | Aktuell nur „Plan kopieren"; Export ist Standard-Erwartung, geht per Print-CSS/Blob. | S |
| 7 | **Wiederkehrende Kasse / Vorlage** (Personenliste übernehmen) | Stammgruppen (WG, Freunde) starten jede Reise neu. | S |
| 8 | **Änderungsprotokoll** („Anna hat Abendessen bearbeitet") | Vertrauen in geteilten Räumen ohne Login; braucht Autor pro Änderung (Geräte-ID existiert). | M |
| 9 | **Erinnerung/Teilen-Link** (Einladung per Link/QR statt 6-stelligem Code) | Weniger Reibung beim Beitritt; QR rein clientseitig möglich. | S–M |
| 10 | **Schnellerfassung** (Widget-artiges „+ Betrag" mit Vorbelegung des letzten Zahlers/Teilnehmerkreises) | Weniger Taps im Alltag am Strand; Kleinigkeit, hoher Komfort. | S |

**Empfehlung:** Zuerst 1 + 2 (schließen die größten Funktionslücken), dann 4 + 6 (billige Abschluss-Features), danach 3 als „Begeisterungs"-Feature.

**Annahmen / offen** (nicht mit dem User geklärt, Auto-Ableitung aus dem Code): Zielgruppe = Freundes-/Familiengruppen auf Reisen, Constraint = kein eigenes Backend (nur Firebase). Wenn Login/Backend erlaubt wären, würden Belege (5) und Änderungsprotokoll (8) einfacher. Aufwände sind Schätzungen, nicht getestet.
