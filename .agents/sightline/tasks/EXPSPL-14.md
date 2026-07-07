---
title: Neuer Raum: Namensabfrage + garantiert leere Kasse
task: EXPSPL-14
created: 2026-07-07T12:57
---

## Kontext

Nutzer hatte einen Raum verlassen und einen neuen erstellt — die alten Daten
waren aber weiterhin sichtbar, weil `roomCreate()` bisher den aktuell
geladenen lokalen `state` unverändert in den neuen Raum gepusht hat
(bereits in [[EXPSPL-13]] als bekannte Einschränkung notiert).

## Umsetzung

- Neues Modal `modal-new-room` fragt vor dem Erstellen nach dem Kassennamen.
- Bei Bestätigung: `state = freshState()`, `tripName` gesetzt, lokal
  gespeichert/gerendert, danach erst `roomCreate()` aufgerufen.
- Ergebnis: neuer Raum startet immer mit Standard-Teilnehmerliste und 0
  Ausgaben, unabhängig vom vorher lokal geladenen Stand.

Verifiziert im Browser: Testausgabe (42€) angelegt, "Raum erstellen" mit
Namen "Test Trip XYZ" ausgelöst → neuer Raum in Firebase enthält nur die
Standard-Personen, keine Ausgaben. Testraum danach wieder gelöscht.
