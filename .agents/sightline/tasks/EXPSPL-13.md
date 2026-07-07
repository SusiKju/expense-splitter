---
title: Raum-History mit Cloud-Sync (Geräte-ID)
task: EXPSPL-13
created: 2026-07-07T12:21
---

## Kontext

Aktuell kennt `urlaubskasse.html` nur einen aktiven Sync-Raum (`ROOM_KEY` in
localStorage). Beim Beitreten wird der komplette lokale State überschrieben
(`loadFromFirebase`), es gibt keine Liste zuvor genutzter Räume.

## Entscheidung (aus Gespräch mit User)

Variante 1: persistente, rein lokal erzeugte Geräte-ID + History-Daten in der
Firebase Realtime Database unter `deviceHistory/{deviceId}/{roomCode}`.
Kein echtes Login/Auth. Löschen ist explizit über einen Button (entfernt den
Cloud-Eintrag dauerhaft, kein automatisches Aufräumen).

Bekannte Grenze (dem User kommuniziert): Geht die Geräte-ID lokal verloren
(Cache/App-Daten gelöscht), ist die Verknüpfung zur Cloud-History weg — es
gibt keinen geräteübergreifenden Sync ohne echten Account.

## Umsetzung

1. `DEVICE_KEY = 'urlaubskasse:deviceId'` — einmalig `crypto.randomUUID()`,
   danach aus localStorage gelesen.
2. `touchHistory(code, tripName)` — schreibt/aktualisiert
   `deviceHistory/{deviceId}/{code}` = `{ tripName, lastActive }`.
   Aufruf nach `roomCreate` (Erstellung) und nach `roomJoin` (Beitritt), sowie
   in `roomPush` (hält tripName/lastActive aktuell, während der Raum aktiv ist).
3. `subscribeHistory()` — `.on('value', ...)` auf `deviceHistory/{deviceId}`,
   rendert Liste live im Menü.
4. `renderHistoryList(data)` — neue Sektion "Meine Kassen" im `modal-menu`,
   sortiert nach `lastActive` desc. Pro Eintrag: Tripname, Code, "zuletzt aktiv",
   Klick = Wechsel (`roomJoin`), 🗑-Button = Löschen (mit Confirm-Modal,
   verlässt vorher den Raum falls es der aktive ist).
5. Event-Delegation über den bestehenden globalen Click-Handler
   (`data-history-switch`, `data-history-delete`).

## Out of Scope (bewusst nicht angefasst)

- Kein Login/Firebase-Auth.
- Bestehendes Verhalten von "Raum erstellen" (übernimmt aktuellen lokalen
  State) bleibt unverändert — kein Teil dieser Anfrage.
