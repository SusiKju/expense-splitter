---
title: Brainstorming – Echten Sync implementieren
task: EXPSPL-7
created: 2026-05-28T00:00
---

## Kontext

Aktuelle "Sync" ist kein echter Sync:
- State wird per gzip+base64 in die URL-Fragment kodiert (`#v1:...`)
- User kopiert den Link manuell und schickt ihn weiter
- Kein Server, keine Echtzeit, kein automatisches Update

JSONBlob (vorher) scheiterte an CORS.
GitHub-Sync (davor) war zu komplex für den User.

## Anforderungen

- Kein Server den der Developer warten muss (oder minimalst)
- Kein User-Account erforderlich
- Einfaches Teilen (Raum-Code oder Link)
- Nahezu Echtzeit – zumindest Auto-Sync
- Bleibt eine Single-HTML-File

## Optionen

### A – Firebase Realtime Database (Empfehlung)
- Einmalig: Developer legt kostenloses Firebase-Projekt an, bettet Config ein
- User: Raum erstellen → 6-stelliger Code → teilen → beitreten
- Echte WebSocket-basierte Echtzeit (`.on('value', ...)`)
- Anonymous Auth: kein Account für End-User nötig
- Gratis-Kontingent: 1 GB Storage, 10 GB Traffic/Monat
- Firebase SDK per CDN einbinden (~30 KB gzip)
- Konflikt-Strategie: letzter Schreiber gewinnt (last-write-wins, reicht für diesen Use-Case)

### B – Cloudflare Worker + KV (Alternative ohne Google)
- Einmalig: Developer deployt Mini-Worker (~30 Zeilen JS)
- KV speichert State pro Raum-ID
- Client pollt alle 3–5 s
- Gratis-Kontingent: 100k Requests/Tag
- Kein echter Push, aber praktisch unspürbar bei 5s-Polling
- Volle Kontrolle, kein Google

### C – Gun.js mit Public Relay
- Zero Server-Setup: Gun.js lädt von CDN, nutzt öffentliche Gun-Relay-Server
- Echte Echtzeit via Gun's P2P-Protokoll
- Daten sind öffentlich (Gun-Netz)
- Öffentliche Relay-Server unzuverlässig, ~300 KB Bundle
- Nicht empfohlen für Produktion

### D – BroadcastChannel (local-only)
- Nur innerhalb desselben Browsers auf demselben Gerät
- Zero Infrastructure, sofort
- Ergänzung zu einer der oberen Optionen, kein Ersatz

## Entscheidung

Firebase Realtime Database (Option A). User hat Google-Konto.

## Implementiert

- Firebase compat SDK 10.12.0 via CDN eingebunden
- `FIREBASE_CONFIG` Platzhalter in der HTML mit klarem Kommentar
- `SESSION_ID` per `crypto.randomUUID()` für Echo-Prevention
- `roomCreate()` – generiert 6-char Code, schreibt State nach Firebase, subscribed
- `roomJoin(code)` – liest State aus Firebase, subscribed auf Änderungen
- `roomLeave()` – unsubscribed, localStorage-Key entfernt
- `roomPush()` – wird von `saveState()` automatisch aufgerufen (wenn in Raum)
- `subscribeRoom()` – `onValue` Listener; ignoriert eigene Pushes via `pushedBy === SESSION_ID`
- Auto-Reconnect beim Neuladen (wenn ROOM_KEY in localStorage und Config vorhanden)
- UI: "Raum erstellen" + Code-Input/Beitreten-Button + Enter-Handler

## Nächster Schritt (User)

Firebase-Projekt anlegen und Config eintragen (siehe unten).
