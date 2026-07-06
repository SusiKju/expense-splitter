# expense-splitter

Single-HTML-File App (`urlaubskasse.html`). Die Abrechnungslogik liegt in
`settlement.js` und ist per `<script src>` eingebunden.

## Tests

Reine Node-Test-Suite für die Abrechnungsberechnung (kein Build, keine
Abhängigkeiten), erfordert Node >= 18:

```bash
npm test
```
