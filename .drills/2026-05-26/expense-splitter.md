# Expense Splitter — Urlaubskasse für Reddi, Long, Micha, Ronny, Rudi, Ulbert

Standalone-HTML-App zur Berechnung "wer schuldet wem wie viel", damit am Ende
jeder gleich viel bezahlt hat.

Teilnehmerkreis (fix für initialen Wurf): Reddi, Long, Micha, Ronny, Rudi, Ulbert.

----
Q: Welche Sprache soll die Oberfläche haben?
A: Deutsch.

----
Q: Wie soll der Aufteilungs-Modus pro Ausgabe funktionieren? Immer alle gleichmäßig, oder pro Ausgabe wählbar wer beteiligt war, oder sogar mit individuellen Anteilen/Gewichten?
A: Pro Ausgabe wählbar wer beteiligt war, gleichmäßig unter den Beteiligten.

----
Q: Sollen die Daten im Browser dauerhaft gespeichert werden (localStorage), zusätzlich Export/Import als JSON, oder soll alles nur in der Session leben?
A: localStorage plus Export/Import als JSON.

----
Q: Soll am Ende der Schuldenausgleich auf möglichst wenige Überweisungen optimiert werden, oder lieber transparent zeigen "jeder schuldet jedem genau X" (Brutto-Matrix)?
A: Optimiert auf möglichst wenige Überweisungen.

----
Q: Soll die App nur einen Trip verwalten oder mehrere parallele Trips/Events?
A: Nur ein Trip.

----
Q: Welche Währung soll standardmäßig genutzt werden? Soll sie wählbar/umschaltbar sein?
A: EUR fix.

----
Q: Soll die Teilnehmerliste editierbar sein (Personen hinzufügen/entfernen/umbenennen) oder fix auf die sechs genannten Namen?
A: Editierbar, Standard sind die 6 Namen (Reddi, Long, Micha, Ronny, Rudi, Ulbert).

----
Q: Welche Felder soll eine Ausgabe haben? Mindestens: Wer hat bezahlt, Betrag, Beschreibung. Optional: Datum, Kategorie, Notiz?
A: Wer bezahlt, Betrag, Beschreibung, Datum.

----
Q: Sollen Ausgaben nach dem Anlegen noch bearbeitet und/oder gelöscht werden können (mit Bestätigungsdialog beim Löschen)?
A: Bearbeiten und Löschen, Löschen mit Bestätigung.

----
Q: Soll der Schuldenausgleich automatisch bei jeder Änderung live neu berechnet werden, oder lieber per "Berechnen"-Button?
A: Live bei jeder Änderung.

----
Q: Welche Default-Auswahl bei "wer war beteiligt" soll beim Anlegen einer neuen Ausgabe vorausgewählt sein — alle Teilnehmer (häufigster Fall) oder leer?
A: Alle vorausgewählt.

----
Q: Welches Default-Datum soll beim Anlegen einer neuen Ausgabe gesetzt sein — heute, leer, oder das Datum der zuletzt eingetragenen Ausgabe?
A: Heute.

----
Q: Wie soll mit Rundungs-Cent umgegangen werden, wenn ein Betrag nicht glatt durch die Anzahl Beteiligter teilbar ist (z.B. 10,00€ / 3 = 3,33 + 3,33 + 3,34)? Der Rest-Cent geht entweder an den Zahler, an einen zufälligen Beteiligten, oder reihum?
A: Zahler trägt den Rest (bekommt entsprechend weniger zurück / muss weniger zahlen).

----
Q: Bevorzugst du Hell-Modus, Dunkel-Modus oder eine automatische Umschaltung nach System-Einstellung?
A: System-automatisch mit manuellem Schalter.

----
Q: Soll die App primär mobil bedienbar sein (Hochkant am Handy, da im Urlaub) oder soll auch Desktop-Nutzung gleichwertig optimiert sein?
A: Mobile-first, aber Desktop sauber.

----
Q: Wie soll die Ausgabenliste sortiert sein — neueste zuerst, älteste zuerst, oder nach Betrag?
A: Neueste Ausgabe oben.

----
Q: Soll es zusätzlich eine Übersicht "wer hat insgesamt wie viel ausgelegt / sollte wie viel tragen / Saldo" geben, oder reicht der reine Ausgleichs-Plan am Ende?
A: Ja, plus optimierter Ausgleichsplan.

----
Q: Soll es eine "Trip zurücksetzen / komplett leeren"-Funktion geben (mit Bestätigung)?
A: Ja, mit Bestätigung.

----
Q: Wie soll die App technisch ausgeliefert werden — eine einzelne HTML-Datei (alles inline, max. portabel), oder getrennte Dateien für HTML/CSS/JS?
A: Eine einzige HTML-Datei, alles inline.

----
Q: Welche Akzentfarbe / welcher Stil soll dominieren — eher Sommer/Urlaub (z.B. Türkis/Sand), neutral (Anthrazit/Weiß), oder ein konkreter Wunsch?
A: Sommer/Urlaub — Türkis/Sand.

----
Q: Soll die App als PWA installierbar und offline-fähig sein (Manifest + Service Worker), damit man sie aufs Handy "installieren" kann?
A: Ja, PWA mit Manifest + Service Worker.

----
Q: Was soll passieren, wenn ein Teilnehmer gelöscht werden soll, der noch in Ausgaben vorkommt? Löschen blockieren, Ausgaben automatisch anpassen, oder warnen und trotzdem löschen?
A: Löschen blockieren, solange noch Ausgaben verknüpft sind (mit Hinweis welche).

----
Q: Soll der Ausgleichsplan einen "als Text kopieren"-Button bekommen (z.B. um die Überweisungen direkt in eine WhatsApp-Gruppe zu pasten)?
A: Ja.

----
Q: Bei den Ausgleichs-Anweisungen — soll auch ein "erledigt"-Häkchen pro Überweisung möglich sein (damit ihr im Nachgang abhaken könnt, wer schon überwiesen hat)?
A: Ja, mit persistentem Häkchen (im localStorage).

----
Q: KONFLIKT: "Single HTML File" und "PWA" widersprechen sich technisch — eine echte PWA braucht zwingend mindestens manifest.json und einen Service Worker als separate Datei (Browser erlauben keinen inline Service Worker). Wie auflösen?
A: Mini-Bundle: 1 HTML-Datei mit allem Code/CSS inline, plus manifest.webmanifest + sw.js + 2 Icons (192/512). Insgesamt 5 Dateien, weiterhin sehr portabel.

----
Q: Wie soll die App auf alle Teilnehmer verteilt werden — Single-User-Tracking (einer pflegt), geteilter Share-Link, oder echtes Multi-User mit Backend?
A: Single-User. Matthias trackt allein, am Ende wird der Ausgleichsplan per "Plan kopieren"-Button in die WhatsApp-Gruppe gepostet. Die anderen Teilnehmer müssen die App selbst nicht aufrufen. Kein Sharing-Feature, kein Backend.
