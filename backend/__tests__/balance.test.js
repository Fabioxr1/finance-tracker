import { describe, it, expect } from 'vitest';
import { calculateBalance } from '../utils/balanceCalculator';

describe('Backend Balance Logic', () => {
  const INITIAL = 1000;
  const ACCOUNT_ID = 1;

  it('dovrebbe sommare le entrate', () => {
    const txs = [
      { type: 'income', amount: 500, account_id: ACCOUNT_ID }
    ];
    expect(calculateBalance(INITIAL, txs, ACCOUNT_ID)).toBe(1500);
  });

  it('dovrebbe sottrarre le uscite', () => {
    const txs = [
      { type: 'expense', amount: 200, account_id: ACCOUNT_ID }
    ];
    expect(calculateBalance(INITIAL, txs, ACCOUNT_ID)).toBe(800);
  });

  it('dovrebbe gestire i giroconti correttamente (sia in uscita che in entrata)', () => {
    const txs = [
      { type: 'transfer', amount: 300, account_id: ACCOUNT_ID, to_account_id: 2 }, // Esce da 1
      { type: 'transfer', amount: 150, account_id: 3, to_account_id: ACCOUNT_ID }  // Entra in 1
    ];
    // 1000 - 300 + 150 = 850
    expect(calculateBalance(INITIAL, txs, ACCOUNT_ID)).toBe(850);
  });

  it('non dovrebbe influenzare il saldo se la transazione riguarda altri conti', () => {
    const txs = [
      { type: 'income', amount: 1000, account_id: 99 },
      { type: 'expense', amount: 500, account_id: 99 },
      { type: 'transfer', amount: 500, account_id: 99, to_account_id: 100 }
    ];
    expect(calculateBalance(INITIAL, txs, ACCOUNT_ID)).toBe(1000);
  });
});
