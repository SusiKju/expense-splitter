---
title: Willkommens-Modal für Erstbesuch
task: EXPSPL-16
created: 2026-07-07T14:12
---

## Problem

Ein Freund, der den Link zum ersten Mal öffnet, landet auf einem lokal
initialisierten Zustand (`freshState()` in `urlaubskasse.html`): leere Ausgaben,
aber vorbefüllte Demo-Teilnehmer (`DEFAULT_PEOPLE`). Es gibt keinen Hinweis, dass
er entweder einen neuen Raum erstellen oder einem bestehenden per Code beitreten
sollte — dieser Einstieg ist im "⋯"-Menü unter "Echtzeit-Sync" versteckt.

## Lösung

Ein Onboarding-Modal, das automatisch beim allerersten Start erscheint, wenn
weder `localStorage[STORAGE_KEY]` (`urlaubskasse:v1`) noch `localStorage[ROOM_KEY]`
(`urlaubskasse:room`) gesetzt sind. Erkennung also: erster Aufruf überhaupt auf
diesem Gerät/Browser.

Drei Optionen im Modal:
1. **"Neuen Raum erstellen"** (primary) — öffnet das bestehende `modal-new-room`
   (Trip-Name eingeben → `new-room-create` Flow, ruft `roomCreate()`).
2. **"Code eingeben"** — Eingabefeld + Button direkt im Willkommens-Modal, nutzt
   bestehenden `roomJoin()` Flow.
3. **"Erstmal ohne Sync starten"** (unauffälliger Ghost-Button) — schließt das
   Modal, App bleibt im lokalen Default-Zustand wie bisher.

Ein Flag `urlaubskasse:onboarded` wird gesetzt, sobald einer der drei Buttons
geklickt wird, damit das Modal nie wieder automatisch erscheint.

## Umsetzung (erledigt)

- Neues Modal-Markup `#modal-welcome` vor `#modal-new-room` eingefügt.
- `ONBOARDED_KEY = 'urlaubskasse:onboarded'` Konstante ergänzt.
- Event-Listener für `welcome-create-btn` (öffnet `modal-new-room`),
  `welcome-join-btn` (+ Enter-Handler auf `welcome-join-input`, ruft `roomJoin()`
  und schließt bei Erfolg alle Modals) und `welcome-skip-btn` (schließt direkt).
- Trigger am Ende der Init-Sequenz: wenn `!localStorage.getItem(STORAGE_KEY) &&
  !_roomCode && !localStorage.getItem(ONBOARDED_KEY)` → `openModal('modal-welcome')`.

## Test

Manuell: `localStorage.clear()` im Browser, Seite neu laden → Willkommens-Modal
muss erscheinen. Nach jeder der drei Optionen darf es beim nächsten Reload nicht
mehr erscheinen.
