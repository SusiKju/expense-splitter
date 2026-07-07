---
title: Kasse schließen (nur Ersteller)
task: EXPSPL-17
created: 2026-07-07T14:43
---

## Ziel

Der Nutzer will eine abgeschlossene/fertige Kasse (Trip/Raum) schließen können.
Danach darf niemand mehr Änderungen vornehmen. Schließen/Öffnen darf nur die
Person, die die Kasse erstellt hat.

## Bestand (aus Code-Analyse)

- Single-file App `urlaubskasse.html`, State lokal in `localStorage` und optional
  über Firebase Realtime DB gespiegelt (`rooms/{code}`), kein Auth-System.
- Es existiert bereits eine persistente, rein lokale `deviceId`
  (`urlaubskasse:deviceId`), aktuell nur für `deviceHistory` genutzt.
- `state.settings` wird 1:1 mit synchronisiert (`stateForSync`/`loadFromFirebase`),
  da die Firebase-Rule `state: {".validate": true}` beliebige Unterfelder erlaubt
  → keine Änderung an `database.rules.json` nötig.

## Ansatz

- `state.settings.closed` (boolean) — wenn `true`, blockiert JEDE Mutation
  (Ausgaben, Personen, Settle-Checks, Rundung, Trip-Name, Import, Reset) für
  alle Geräte/Personen im Raum.
- `state.settings.creatorDeviceId` — beim Erstellen einer frischen Kasse
  (`freshState()`) auf die eigene `deviceId` gesetzt. Beim Beitreten eines
  Raums wird der Wert aus den Remote-Daten übernommen (Ersteller bleibt
  Ersteller). Legacy-Daten ohne das Feld: Fallback auf eigene Geräte-ID.
- Da es kein echtes Auth gibt, ist "nur Ersteller darf schließen" eine
  UI-Beschränkung (Button nur sichtbar für `creatorDeviceId === getDeviceId()`),
  keine serverseitige Durchsetzung — das ist im Rahmen der bestehenden
  Architektur (offene Firebase-Rules) so vorgesehen.
- UI: Status-Badge/Banner "Kasse geschlossen" + Menü-Eintrag mit Toggle-Button
  (nur für Ersteller sichtbar), FAB und Bearbeiten/Löschen-Icons ausgeblendet
  wenn geschlossen, alle mutierenden Funktionen zusätzlich per Guard-Funktion
  abgesichert (defense in depth).

## Schritte

1. `freshState()`, `loadState()`-Migration, `loadFromFirebase()`, Import: Felder
   `closed`/`creatorDeviceId` mit sinnvollen Defaults ergänzen.
2. Helper `isRoomClosed()`, `isCreatorDevice()`, `guardClosed()`.
3. Guards in allen mutierenden Funktionen (saveExpense, deleteExpense, savePerson,
   deletePerson, toggleSettle, resetChecks, resetTrip, importJson, trip-name-input,
   round-pick-Klick).
4. UI: geschlossen-Banner in "Ausgaben"-Tab, FAB/Action-Icons ausblenden,
   Menü-Sektion "Kasse-Status" mit Schließen/Öffnen-Button (nur Ersteller).
5. Manuell im Browser testen (öffnen, Ausgabe anlegen, schließen, Änderung
   verhindert, öffnen als Nicht-Ersteller simulieren via anderer deviceId).
