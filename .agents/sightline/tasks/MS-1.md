---
title: Multi-User-Sync für Urlaubskasse
task: MS-1
created: 2026-05-26T13:00
---

# Multi-User-Sync für Urlaubskasse

## Idee

Aus dem Brainstorming: *„Geht es irgendjemanden einen Trick, diese Seite zu
synchronisieren, wenn mehrere Personen es auf ihrem Smartphone offen haben?"*

Aktueller Zustand: Single-User. Matthias trackt, am Ende Plan per WhatsApp
geteilt. Daten liegen pro Browser im `localStorage`.

Ziel: alle 6 Teilnehmer sehen den gleichen Stand, idealerweise können auch alle
selbst eintippen.

## Drei evaluierte Wege

### Option A — File System Access API + geteilte JSON-Datei

App schreibt in eine `.json`-Datei, die im iCloud/GDrive/Dropbox-Ordner des
Users liegt. Cloud-Software syncht die Datei zwischen Geräten.

- Vorteil: kein Backend, keine Server-Kosten.
- Nachteil 1: File System Access API gibt es nicht in iOS Safari → iPhone-User
  fallen raus.
- Nachteil 2: Cloud-Apps auf Android zeigen GDrive/iCloud oft als virtuelle
  Ordner ohne lokale Datei → unstabile Sync.
- Nachteil 3: keine Konfliktauflösung. Gleichzeitige Edits → einer verliert.
- Realistisch nur auf Desktop wirklich brauchbar.

### Option B — WebRTC Peer-to-Peer mit Trystero / Yjs

Geräte verbinden sich direkt miteinander, Änderungen werden live synchronisiert.
Trystero nutzt öffentliche BitTorrent-Tracker oder Nostr-Relays als
Signaling-Layer, kein eigener Server nötig.

- Vorteil: echtes Realtime auf allen Plattformen inkl. iPhone.
- Vorteil: kein dauerhaftes Backend.
- Nachteil: alle müssen die App gleichzeitig offen haben, sonst kein Sync.
- Nachteil: App-Datei wird ~50 KB größer durch Library.
- Pragmatischer Sweet Spot wenn die Gruppe abends gemeinsam einträgt.

### Option C — Cloudflare Worker + KV als Backend

Winziges Backend (~50 Zeilen) speichert die Daten zentral. App lädt beim Start,
schreibt bei Änderung, pollt regelmäßig (oder WebSocket).

- Vorteil: robust, alle Plattformen, Offline-tolerant.
- Vorteil: free tier reicht für die Größenordnung locker.
- Nachteil: einmal CF-Account einrichten, Worker deployen (~30 min).
- Nachteil: App muss eine deployment-URL kennen.

## Entscheidung

Offen. User hat erstmal in den Backlog geschoben, will später entscheiden.

## Wenn umgesetzt wird

- Konflikt-Strategie definieren (last-write-wins reicht für die Größenordnung).
- UI-Indikator für Sync-Status (verbunden / offline / Konflikt).
- Klar im UI machen, dass Daten geteilt werden.
- Migration: bestehender `localStorage`-Stand sollte als initialer Stand für
  den geteilten Bereich übernommen werden können.
