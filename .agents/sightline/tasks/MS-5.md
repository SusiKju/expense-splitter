---
title: Redundante HTML-Datei löschen
task: MS-5
created: 2026-05-27T16:04
---

## Entscheidung

`index.html` enthielt die alte GitHub-Token-Sync-Implementierung (überholt durch MS-2/MS-3).
`urlaubskasse.html` ist die aktive Version mit JSONBlob-Sync.

`index.html` wurde gelöscht.

## Angepasste Referenzen

Da `index.html` der bisherige PWA-Einstiegspunkt war, wurden folgende Dateien aktualisiert:

- `manifest.webmanifest`: `start_url` → `./urlaubskasse.html`
- `sw.js`: ASSETS-Liste und Offline-Fallback → `./urlaubskasse.html`
- `urlaubskasse.html`: Manifest-Link `<link rel="manifest">` und Service-Worker-Registrierung hinzugefügt
