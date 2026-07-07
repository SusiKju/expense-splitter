---
title: Obsolete JSON-Export/Import/Reset-Buttons entfernen
task: EXPSPL-18
created: 2026-07-07T15:25
---

## Kontext

Seit EXPSPL-13/14/15/16 gibt es Echtzeit-Sync mit Raum erstellen/beitreten/verlassen
sowie Geräte-Historie. Damit sind die manuellen JSON-Export/Import-Buttons und der
"Trip komplett zurücksetzen"-Button im Menü ("Mehr") obsolet.

## Betroffene Stellen in urlaubskasse.html

- Buttons im Menü-Modal (`#export-btn`, `#import-btn`, `#import-file`, `#reset-btn`)
- Event-Listener für diese Buttons
- Funktionen `exportJson`, `importJson`, `resetTrip`
- Referenzen auf `import-btn`/`reset-btn` in `updateCloseUI()`

## Vorgehen

Buttons, zugehörige Event-Listener und Funktionen entfernen, sofern nirgends
sonst referenziert (geprüft: `guardClosed`/`confirmAction` werden weiterhin
an anderen Stellen gebraucht, bleiben erhalten).
