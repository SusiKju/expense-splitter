---
title: Multi-User-Sync vereinfachen – kein Repo, Token oder Branch erforderlich
task: MS-3
created: 2026-05-27T15:51
---

## Ziel

Die bisherige GitHub-basierte Sync-Lösung (MS-2) verlangte von jedem Nutzer drei manuelle Eingaben: GitHub-Token, Repo-Name und Branch-Name. Das ist zu viel Reibung für eine Urlaubskasse. Ersetzen durch eine zero-friction Variante.

## Gewählte Lösung: JSONBlob + Raum-Code

**Backend**: [jsonblob.com](https://jsonblob.com/api) — freie JSON-Speicher-API, kein Account nötig, unterstützt CORS.

**Flow**:
1. Trip-Ersteller tippt „Neuen Raum erstellen" → App POST an JSONBlob → erhält eine 19-stellige Blob-ID
2. Diese ID wird als **Sync-Code** angezeigt (Copy-Button)
3. Andere Gruppenmitglieder geben den Code ein → App lädt Zustand von JSONBlob
4. Bei jedem `saveState()` wird der neue Zustand automatisch auf JSONBlob gepusht
5. Beim Öffnen der App und beim Tab-Wechsel wird automatisch gepullt

**Warum JSONBlob**:
- Keine Registrierung, kein Token
- Unterstützt GET/POST/PUT ohne Auth
- CORS: `Access-Control-Allow-Origin: *`
- Kostenlos, seit 2013 im Betrieb

## Avatar-Optimierung

SVG-Avatare (~2-3 KB pro Person) werden beim Push nicht übertragen – sie sind aus dem Namen rekonstruierbar. Beim Pull werden sie aus dem `AVATARS`-Dict wiederhergestellt.

## Fehlerbehandlung

- Netzwerkfehler → Warning-Toast, lokale Daten bleiben erhalten
- 404 → Raum existiert nicht mehr → Sync wird automatisch deaktiviert
- Race condition (zwei Geräte pushen gleichzeitig) → Last-Write-Wins (für Urlaubskasse ausreichend)

## Implementierungsschritte

1. [x] Konzept erstellen
2. [ ] Sync-Funktionen in urlaubskasse.html (syncCreate, syncPull, syncPush, syncJoin, syncLeave)
3. [ ] `saveState()` um `syncPush()` erweitern
4. [ ] Sync-UI in "Mehr"-Modal (Idle-State + Aktiv-State)
5. [ ] Event-Listener verdrahten
6. [ ] `visibilitychange` für Auto-Pull
7. [ ] Initial sync pull beim App-Start
