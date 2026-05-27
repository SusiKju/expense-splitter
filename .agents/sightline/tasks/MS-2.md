---
title: Multi-User-Zugang mit Echtzeit-Synchronisation für HTML-Oberfläche
task: MS-2
created: 2026-05-27T12:28
---

# GitHub Sync für Urlaubskasse

## Ziel

Mehrere Teilnehmer können die App gleichzeitig nutzen. Änderungen sind für alle
innerhalb weniger Sekunden sichtbar — ohne Server, ohne Konto außer GitHub.

## Gewählter Ansatz: GitHub Repository-Datei

Die App liest und schreibt eine JSON-Datei (`trip-data.json`) in einem GitHub Repo
via GitHub Contents API. Kein Backend nötig — GitHub ist der Datenspeicher.

### Ablauf

1. Matthias richtet ein GitHub-Repo ein (z.B. `matthias/urlaubskasse-daten`),
   öffnet das Menü in der App und aktiviert Sync mit Repo-Name + GitHub PAT.
2. Die App schreibt den aktuellen Stand als erstes Commit in `trip-data.json`.
3. Matthias klickt "Link kopieren" und schickt den Link per WhatsApp.
4. Andere öffnen den Link, sehen die Daten und können lesen (public repo).
5. Wer schreiben möchte, gibt einmalig ein eigenes GitHub PAT ein.
6. Die App pollt alle 8 Sekunden — bei Änderungen wird der Stand aktualisiert.

### Konfliktauflösung

Last-write-wins. Bei HTTP 409 (Conflict) holt die App frisch die aktuelle SHA
und schreibt erneut. Für 6 Urlauber ist das ausreichend stabil.

## Implementierte Teile

- `b64Encode` / `b64Decode` — UTF-8-sicheres Base64 für die GitHub API
- `ghGet` / `ghPut` — GitHub Contents API Wrapper (GET + PUT)
- `syncPoll` — Polling alle 8s, SHA-Vergleich, State-Update ohne GitHub-Rückschreib-Loop
- `doSyncWrite` — Debounced Write (2s), 409-Retry mit frischer SHA
- `queueSyncWrite` — Hook in `saveState()`, aktiviert nur wenn Token vorhanden
- Sync-Status-Dot im Topbar (grün / gelb pulsierend / rot)
- GitHub Sync Abschnitt im Menü-Modal (Repo, Branch, Dateiname, Token)
- URL-Parameter `?repo=...&branch=...&path=...` zum Teilen (Token nie in URL)

## Voraussetzungen für User

- GitHub-Account
- Public oder Private Repository (bei private: Leser brauchen auch Token)
- GitHub Personal Access Token mit `contents:write`-Berechtigung

## Offene Punkte

- Kein automatisches Repo-Erstellen — User muss das Repo vorab anlegen
- Bei private Repos können andere nur lesen wenn sie selbst ein Token haben
- Kein Merge bei gleichzeitigen Edits — letzter Schreiber gewinnt
