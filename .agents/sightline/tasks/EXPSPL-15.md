---
title: Fix: Zombie-Listener beim Raum-Wechsel überschreibt Session
task: EXPSPL-15
created: 2026-07-07T13:30
---

## Kontext

Nutzer meldete: nach Erstellen eines neuen Raums und Wechseln zurück wird
"der Name" bzw. "die Session" überschrieben.

## Root Causes (zwei Bugs, nicht einer)

1. **`subscribeRoom()` schloss über die veränderliche Variable `_roomRef`**
   statt die tatsächliche Referenz zu capturen:
   `_unsubscribe = () => _roomRef.off('value', handler)`. Nach einem
   Wechsel zeigt `_roomRef` schon auf den neuen Raum, `.off()` wird also
   nie auf der richtigen (alten) Referenz aufgerufen — der alte Listener
   blieb aktiv. Fix: `ref` als lokale Konstante capturen + Guard
   `if (ref !== _roomRef) return;` im Handler als zusätzliche Absicherung.

2. **Schwerwiegender: `loadFromFirebase()` lehnte Räume mit 0 Ausgaben ab.**
   Guard `Array.isArray(loaded?.expenses)` scheiterte, weil Firebase leere
   Arrays nicht speichert (Feld fehlt komplett bei 0 Ausgaben — seit
   [[EXPSPL-14]] der Normalfall für neu erstellte Räume). Die Funktion
   returnte dann still, OHNE `state` zu aktualisieren — während
   `_roomRef`/`_roomCode` schon auf den neuen Raum zeigten. Ergebnis: App
   "verbunden" mit Raum A, arbeitet intern aber weiter mit Raum B's
   Daten. Hätte man in diesem Zustand etwas bearbeitet, wäre Raum A in
   Firebase mit Raum B's Daten überschrieben worden — im Test blieben die
   Räume selbst aber unangetastet, nur der devices History-Eintrag zeigte
   den falschen Namen (weil `touchHistory` mit dem unveränderten,
   falschen `state.settings.tripName` aufgerufen wurde).

## Fix

- `subscribeRoom()`: `ref` lokal capturen statt `_roomRef` zu lesen.
- `loadFromFirebase()`: nur `people` MUSS ein Array sein; fehlendes
  `expenses` wird zu `[]` normalisiert statt die ganze Funktion
  abzulehnen.

## Verifikation

Zwei leere Räume (0 Ausgaben) erstellt, hin- und hergewechselt,
Firebase-Inhalte direkt per curl geprüft: beide Räume behalten ihre
eigenen, korrekten Daten; History-Einträge zeigen korrekte Namen.
Vor dem Fix reproduziert: History-Eintrag des Zielraums zeigte den Namen
des verlassenen Raums.
