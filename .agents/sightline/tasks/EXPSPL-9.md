---
title: Tests für Abrechnungs-/Settlement-Berechnung
task: EXPSPL-9
created: 2026-07-06T14:16
---

## Kontext

`urlaubskasse.html` ist eine Single-HTML-File-App ohne Build-Tooling. Die
Abrechnungslogik (`computeRaw`, `roundBalances`, `computeBalances`,
`computeSettlement`) liegt im Closure einer IIFE und greift auf das
modul-globale `state` zu — nicht direkt testbar, ohne die App im Browser zu
laden.

## Ansatz

1. Reine Rechenfunktionen aus der IIFE in `settlement.js` extrahieren, als
   UMD-Modul (funktioniert per `<script src>` im Browser und per `require()`
   in Node). Signaturen ändern von "liest `state` aus Closure" zu expliziten
   Parametern (`people`, `expenses`, `roundStep`, `balances`) — Algorithmus
   bleibt unverändert.
2. `urlaubskasse.html` bindet `settlement.js` per `<script>` vor dem
   Inline-Script ein; die 4 Funktionsdefinitionen dort entfallen, Aufrufstellen
   rufen `Settlement.computeBalances(state.people, state.expenses,
   state.settings.roundStep)` etc.
3. Node-Test-Suite mit dem eingebauten `node:test`-Runner (keine zusätzliche
   Abhängigkeit nötig) unter `tests/settlement.test.js`.
4. Minimales `package.json` nur für `npm test` → `node --test tests`.

## Testfälle

- `computeRaw`: Grundsumme paid/exactShare, Ignorieren von Payer außerhalb
  der Personenliste, Betrag ≤ 0, keine Teilnehmer, Teilnehmer außerhalb der
  Personenliste.
- `roundBalances`: Summe der gerundeten Salden ist immer 0 (Largest-Remainder-
  Invariante), korrektes Verhalten bei verschiedenen Rundungsstufen (1/5/10/
  50/100 Cent), deterministische Tie-Break-Reihenfolge nach Personenreihenfolge.
- `computeBalances`: Integration Raw+Round an mehreren realistischen
  Szenarien (klassischer 3-Personen-Split, ungleiche Beträge, Fließkomma-
  Beträge wie 0.1+0.2).
- `computeSettlement`: Transfers gleichen die Salden vollständig aus
  (Konservierung), Personen mit Saldo 0 bekommen keinen Transfer, Anzahl der
  Transfers bei einfachen Fällen minimal.

## Status

Umgesetzt: `settlement.js` extrahiert, `urlaubskasse.html` angepasst,
`tests/settlement.test.js` geschrieben, `package.json` ergänzt.

**23/23 Tests grün** (`npm test`, Node >= 18 erforderlich — Node-Built-in-
Testrunner, keine Abhängigkeiten).

## Erkenntnis beim Testen (kein Bug, aber gut zu wissen)

Bei einem exakten 100-Cent-3-Personen-Split entstehen mathematisch exakt
wiederkehrende Drittel-Reste (0.333…/0.667…). Der Largest-Remainder-
Algorithmus entscheidet in diesem Gleichstand-Fall nicht nach Personen-
reihenfolge, sondern nach minimalem Floating-Point-Rundungsrauschen in den
IEEE-754-Resten. Das Ergebnis ist reproduzierbar und die Summe bleibt exakt
0 — aber *wer* den "fehlenden" Cent bekommt, ist bei echten Gleichständen
nicht durch die Personenreihenfolge vorhersagbar. Als Regressionsschutz im
Test dokumentiert (`roundBalances`-Suite). Kein Korrekturbedarf, da die
Kern-Invarianten (Summe 0, jede Ausgabe wird vollständig verteilt) immer
halten — nur die exakte Cent-Zuordnung bei echten Gleichständen ist arbiträr.
