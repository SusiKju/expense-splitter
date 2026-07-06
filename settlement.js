// Reine Abrechnungs-/Settlement-Berechnung, ausgelagert aus urlaubskasse.html.
// UMD: per <script src="settlement.js"> im Browser (globales `Settlement`)
// und per require('./settlement.js') in Node (Tests) nutzbar.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Settlement = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Liefert pro Person: { paid, exactShare } (Float in Cent).
  // payerId/participantIds außerhalb von `people` werden ignoriert, ebenso
  // Ausgaben ohne Teilnehmer oder mit Betrag <= 0.
  function computeRaw(people, expenses) {
    const paid = {};
    const exactShare = {};
    for (const p of people) { paid[p.id] = 0; exactShare[p.id] = 0; }
    for (const exp of expenses) {
      if (!paid.hasOwnProperty(exp.payerId)) continue;
      const amt = Math.round(Number(exp.amount) * 100);
      const parts = (exp.participantIds || []).filter(id => paid.hasOwnProperty(id));
      const n = parts.length;
      if (n === 0 || amt <= 0) continue;
      paid[exp.payerId] += amt;
      const share = amt / n;
      for (const pid of parts) exactShare[pid] += share;
    }
    return { paid, exactShare };
  }

  // Largest-Remainder-Rundung: rundet Salden in Einheiten von stepCent (Default 1),
  // sodass die Summe weiterhin 0 ist. Bei stepCent > 1 werden die Salden
  // grobgerastert (z.B. auf 5 Cent / 50 Cent / Euro).
  // peopleOrder: Array von IDs in der gewünschten Tie-Break-Reihenfolge.
  function roundBalances(exactCent, stepCent, peopleOrder) {
    const step = Math.max(1, stepCent | 0);
    const ids = Object.keys(exactCent);
    if (ids.length === 0) return {};
    ids.sort((a, b) => peopleOrder.indexOf(a) - peopleOrder.indexOf(b));

    const flUnits = {};
    const remainders = [];
    for (const pid of ids) {
      const e = exactCent[pid];
      const exactUnits = e / step;
      const fl = Math.floor(exactUnits);
      flUnits[pid] = fl;
      remainders.push({ pid, rem: exactUnits - fl });
    }
    let floorSum = 0;
    for (const v of Object.values(flUnits)) floorSum += v;
    // Wir müssen so viele Einheiten von 1 verteilen, dass Summe wieder 0 ergibt
    let toDistribute = -floorSum;
    // Sortiere stabil: nach rem desc, bei Gleichstand nach ursprünglicher Reihenfolge
    remainders.sort((a, b) => b.rem - a.rem);
    for (let i = 0; i < toDistribute && i < remainders.length; i++) {
      flUnits[remainders[i].pid] += 1;
    }
    const out = {};
    for (const pid of ids) out[pid] = flUnits[pid] * step;
    return out;
  }

  // Liefert die Saldo-Map { personId: cent } in der übergebenen Rundungsstufe.
  function computeBalances(people, expenses, roundStep) {
    const { paid, exactShare } = computeRaw(people, expenses);
    const exact = {};
    for (const pid of Object.keys(paid)) exact[pid] = paid[pid] - exactShare[pid];
    return roundBalances(exact, roundStep, people.map(p => p.id));
  }

  // Greedy-Matching: größter Schuldner zahlt an größten Gläubiger, bis alle
  // Salden ausgeglichen sind. Minimiert die Anzahl Transfers im Regelfall.
  function computeSettlement(balances) {
    const creditors = [];
    const debtors = [];
    for (const [pid, c] of Object.entries(balances)) {
      if (c > 0) creditors.push({ pid, c });
      else if (c < 0) debtors.push({ pid, c: -c });
    }
    creditors.sort((a, b) => b.c - a.c);
    debtors.sort((a, b) => b.c - a.c);
    const transfers = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const amt = Math.min(debtors[i].c, creditors[j].c);
      if (amt > 0) {
        transfers.push({ from: debtors[i].pid, to: creditors[j].pid, cent: amt });
      }
      debtors[i].c -= amt;
      creditors[j].c -= amt;
      if (debtors[i].c === 0) i++;
      if (creditors[j].c === 0) j++;
    }
    return transfers;
  }

  return { computeRaw, roundBalances, computeBalances, computeSettlement };
});
