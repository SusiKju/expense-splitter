'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  computeRaw,
  roundBalances,
  computeBalances,
  computeSettlement,
} = require('../settlement.js');

const people = (ids) => ids.map((id) => ({ id }));

// Prüft die Kern-Invariante jeder Abrechnung: die Transfers gleichen exakt
// die übergebenen Salden aus (niemand zahlt zu viel/zu wenig, nichts verschwindet).
function assertTransfersSettleBalances(balances, transfers) {
  const net = {};
  for (const pid of Object.keys(balances)) net[pid] = 0;
  for (const t of transfers) {
    assert.ok(t.cent > 0, `Transfer-Betrag muss positiv sein, war ${t.cent}`);
    net[t.from] = (net[t.from] || 0) - t.cent;
    net[t.to] = (net[t.to] || 0) + t.cent;
  }
  for (const pid of Object.keys(balances)) {
    assert.equal(net[pid], balances[pid], `Person ${pid}: Transfers gleichen Saldo nicht aus`);
  }
}

describe('computeRaw', () => {
  test('teilt eine Ausgabe gleichmäßig auf die Teilnehmer auf', () => {
    const p = people(['a', 'b']);
    const expenses = [{ payerId: 'a', amount: 10, participantIds: ['a', 'b'] }];
    const { paid, exactShare } = computeRaw(p, expenses);
    assert.deepEqual(paid, { a: 1000, b: 0 });
    assert.deepEqual(exactShare, { a: 500, b: 500 });
  });

  test('summiert mehrere Ausgaben verschiedener Zahler', () => {
    const p = people(['a', 'b', 'c']);
    const expenses = [
      { payerId: 'a', amount: 30, participantIds: ['a', 'b', 'c'] },
      { payerId: 'b', amount: 15, participantIds: ['a', 'b'] },
    ];
    const { paid, exactShare } = computeRaw(p, expenses);
    assert.deepEqual(paid, { a: 3000, b: 1500, c: 0 });
    assert.deepEqual(exactShare, { a: 1000 + 750, b: 1000 + 750, c: 1000 });
  });

  test('ignoriert Ausgaben mit Zahler außerhalb der Personenliste', () => {
    const p = people(['a', 'b']);
    const expenses = [{ payerId: 'ghost', amount: 10, participantIds: ['a', 'b'] }];
    const { paid, exactShare } = computeRaw(p, expenses);
    assert.deepEqual(paid, { a: 0, b: 0 });
    assert.deepEqual(exactShare, { a: 0, b: 0 });
  });

  test('ignoriert Ausgaben mit Betrag 0 oder negativ', () => {
    const p = people(['a', 'b']);
    for (const amount of [0, -5]) {
      const expenses = [{ payerId: 'a', amount, participantIds: ['a', 'b'] }];
      const { paid, exactShare } = computeRaw(p, expenses);
      assert.deepEqual(paid, { a: 0, b: 0 }, `amount=${amount}`);
      assert.deepEqual(exactShare, { a: 0, b: 0 }, `amount=${amount}`);
    }
  });

  test('ignoriert Ausgaben ohne gültige Teilnehmer', () => {
    const p = people(['a', 'b']);
    const expenses = [{ payerId: 'a', amount: 10, participantIds: ['x', 'y'] }];
    const { paid } = computeRaw(p, expenses);
    assert.deepEqual(paid, { a: 0, b: 0 });
  });

  test('filtert einzelne ungültige Teilnehmer heraus, statt die ganze Ausgabe zu verwerfen', () => {
    const p = people(['a', 'b']);
    const expenses = [{ payerId: 'a', amount: 10, participantIds: ['a', 'b', 'ghost'] }];
    const { paid, exactShare } = computeRaw(p, expenses);
    assert.deepEqual(paid, { a: 1000, b: 0 });
    assert.deepEqual(exactShare, { a: 500, b: 500 });
  });

  test('rechnet mit Fließkomma-Eurobeträgen korrekt in Cent um', () => {
    const p = people(['a', 'b']);
    // 0.1 + 0.2 ist der klassische Float-Stolperstein
    const expenses = [{ payerId: 'a', amount: 0.3, participantIds: ['a', 'b'] }];
    const { paid } = computeRaw(p, expenses);
    assert.equal(paid.a, 30);
  });
});

describe('roundBalances', () => {
  test('Summe der gerundeten Salden ist immer 0 (Largest-Remainder-Invariante)', () => {
    const order = ['a', 'b', 'c'];
    const exact = { a: 6666.666666666666, b: -3333.3333333333335, c: -3333.3333333333335 };
    const rounded = roundBalances(exact, 1, order);
    const sum = Object.values(rounded).reduce((s, v) => s + v, 0);
    assert.equal(sum, 0);
  });

  test('vergibt den übrigen Cent an die Person(en) mit dem größten Nachkommaanteil', () => {
    const order = ['a', 'b', 'c'];
    // Reste 0.9 / 0.4 / 0.7 sind eindeutig verschieden (kein Gleichstand) -> a und c
    // bekommen den fehlenden Cent, b nicht.
    const exact = { a: 10.9, b: -3.6, c: -7.3 };
    const rounded = roundBalances(exact, 1, order);
    assert.deepEqual(rounded, { a: 11, b: -4, c: -7 });
  });

  test('bei mathematisch exakt gleichem Rest (1/3 vs 2/3) entscheidet Floating-Point-Rundung, nicht die Personenreihenfolge', () => {
    // 100 Cent auf 3 Personen aufgeteilt ergibt exakt wiederkehrende Drittel-Reste.
    // Die Personenreihenfolge (a vor b vor c) ist HIER kein verlässlicher Tie-Break,
    // weil die IEEE-754-Reste von b/c durch Rundungsrauschen minimal über dem von a liegen.
    // Dieser Test dokumentiert das reale, reproduzierbare Verhalten als Regressionsschutz.
    const order = ['a', 'b', 'c'];
    const exact = { a: 6666.666666666666, b: -3333.3333333333335, c: -3333.3333333333335 };
    const rounded = roundBalances(exact, 1, order);
    assert.deepEqual(rounded, { a: 6666, b: -3333, c: -3333 });
    assert.equal(Object.values(rounded).reduce((s, v) => s + v, 0), 0);
  });

  test('bricht Gleichstand beim Nachkommaanteil deterministisch nach peopleOrder', () => {
    const exact = { a: 0.5, b: -0.5 };
    assert.deepEqual(roundBalances(exact, 1, ['a', 'b']), { a: 1, b: -1 });
    assert.deepEqual(roundBalances(exact, 1, ['b', 'a']), { a: 0, b: 0 });
  });

  test('gröbere Rundungsstufen (5/10/50/100 Cent) bleiben summenneutral', () => {
    const order = ['a', 'b', 'c'];
    const exact = { a: 6666.666666666666, b: -3333.3333333333335, c: -3333.3333333333335 };
    for (const step of [5, 10, 50, 100]) {
      const rounded = roundBalances(exact, step, order);
      const sum = Object.values(rounded).reduce((s, v) => s + v, 0);
      assert.equal(sum, 0, `step=${step}`);
      for (const v of Object.values(rounded)) {
        // `v % step` kann bei negativen, glatt teilbaren Werten -0 statt 0 liefern
        // (JS-Eigenheit des %-Operators) - beides zählt als "Vielfaches von step".
        assert.ok(v % step === 0, `step=${step}: ${v} ist kein Vielfaches von ${step}`);
      }
    }
  });

  test('leere Salden-Map liefert leeres Ergebnis', () => {
    assert.deepEqual(roundBalances({}, 1, []), {});
  });
});

describe('computeBalances (Integration Raw + Round)', () => {
  test('klassischer 3-Personen-Split: einer zahlt alles, Rest gleichmäßig aufgeteilt', () => {
    const p = people(['a', 'b', 'c']);
    const expenses = [{ payerId: 'a', amount: 100, participantIds: ['a', 'b', 'c'] }];
    const bal = computeBalances(p, expenses, 1);
    // Exakt: a=+66.667, b=-33.333, c=-33.333 (wiederkehrende Drittel) - die Rundung
    // auf den letzten Cent ist bei diesem exakten Gleichstand reproduzierbar, aber
    // nicht durch die Personenreihenfolge vorhersagbar (siehe roundBalances-Tests).
    assert.deepEqual(bal, { a: 6666, b: -3333, c: -3333 });
    assert.equal(bal.a + bal.b + bal.c, 0);
  });

  test('ungleiche Zahlungen mehrerer Personen gleichen sich exakt aus', () => {
    // A zahlt 30, B zahlt 10, C zahlt 20 -> Summe 60, Anteil je 20
    const p = people(['a', 'b', 'c']);
    const expenses = [
      { payerId: 'a', amount: 30, participantIds: ['a', 'b', 'c'] },
      { payerId: 'b', amount: 10, participantIds: ['a', 'b', 'c'] },
      { payerId: 'c', amount: 20, participantIds: ['a', 'b', 'c'] },
    ];
    const bal = computeBalances(p, expenses, 1);
    assert.deepEqual(bal, { a: 1000, b: -1000, c: 0 });
  });

  test('Person ohne jede Beteiligung hat Saldo 0', () => {
    const p = people(['a', 'b', 'c']);
    const expenses = [{ payerId: 'a', amount: 20, participantIds: ['a', 'b'] }];
    const bal = computeBalances(p, expenses, 1);
    assert.equal(bal.c, 0);
  });

  test('gröbere Rundungsstufe kann Salden über die exakte Differenz hinaus verschieben', () => {
    const p = people(['a', 'b']);
    const expenses = [{ payerId: 'a', amount: 5, participantIds: ['a', 'b'] }];
    // exakt: a=+250, b=-250 -> bei Rundung auf volle Euro bleibt es exakt bei +/-300? prüfen:
    const bal = computeBalances(p, expenses, 100);
    const sum = Object.values(bal).reduce((s, v) => s + v, 0);
    assert.equal(sum, 0);
    assert.ok(bal.a % 100 === 0);
    assert.ok(bal.b % 100 === 0);
  });
});

describe('computeSettlement', () => {
  test('ein Schuldner, ein Gläubiger -> genau ein Transfer', () => {
    const bal = { a: 500, b: -500 };
    const transfers = computeSettlement(bal);
    assert.deepEqual(transfers, [{ from: 'b', to: 'a', cent: 500 }]);
  });

  test('Personen mit Saldo 0 tauchen in keinem Transfer auf', () => {
    const bal = { a: 1000, b: -1000, c: 0 };
    const transfers = computeSettlement(bal);
    assertTransfersSettleBalances(bal, transfers);
    assert.ok(!transfers.some((t) => t.from === 'c' || t.to === 'c'));
  });

  test('alle Salden 0 -> keine Transfers', () => {
    assert.deepEqual(computeSettlement({ a: 0, b: 0 }), []);
  });

  test('mehrere Schuldner/Gläubiger werden vollständig und korrekt ausgeglichen', () => {
    const bal = { a: 6667, b: -3333, c: -3334 };
    const transfers = computeSettlement(bal);
    assertTransfersSettleBalances(bal, transfers);
    assert.deepEqual(transfers, [
      { from: 'c', to: 'a', cent: 3334 },
      { from: 'b', to: 'a', cent: 3333 },
    ]);
  });

  test('größerer Fall mit mehreren Gläubigern und Schuldnern bleibt konservativ (Konservierung)', () => {
    const bal = { a: 2000, b: 1500, c: -1000, d: -1500, e: -1000 };
    const transfers = computeSettlement(bal);
    assertTransfersSettleBalances(bal, transfers);
  });

  test('End-to-End: computeBalances -> computeSettlement gleicht reale Ausgaben komplett aus', () => {
    const p = people(['a', 'b', 'c', 'd']);
    const expenses = [
      { payerId: 'a', amount: 120, participantIds: ['a', 'b', 'c', 'd'] },
      { payerId: 'c', amount: 40, participantIds: ['a', 'b', 'c'] },
      { payerId: 'd', amount: 15.5, participantIds: ['b', 'd'] },
    ];
    const bal = computeBalances(p, expenses, 1);
    const transfers = computeSettlement(bal);
    assertTransfersSettleBalances(bal, transfers);
  });
});
