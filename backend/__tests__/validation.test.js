import { describe, it, expect } from 'vitest';
const { prepareTransactionParams } = require('../utils/txFormatter');

describe('Transaction Formatter (Database Safety)', () => {
  
  it('dovrebbe gestire un\'Entrata normale (to_account_id deve essere null)', () => {
    const input = {
      account_id: 1,
      category_id: 10,
      amount: 100,
      type: 'income',
      date: '2026-05-01',
      description: 'Stipendio'
    };

    const params = prepareTransactionParams(input);
    
    // Il secondo parametro (to_account_id) deve essere null, non undefined
    expect(params[1]).toBe(null);
    expect(params[2]).toBe(10); // category_id presente
  });

  it('dovrebbe gestire un Giroconto (category_id deve essere null)', () => {
    const input = {
      account_id: 1,
      to_account_id: 2,
      amount: 50,
      type: 'transfer',
      date: '2026-05-01'
    };

    const params = prepareTransactionParams(input);
    
    expect(params[1]).toBe(2);    // to_account_id presente
    expect(params[2]).toBe(null); // category_id deve essere null nei giroconti
    expect(params[6]).toBe(null); // description assente -> null
  });

  it('dovrebbe prevenire errori se mancano campi opzionali del tutto', () => {
    const input = { account_id: 1, amount: 10 };
    const params = prepareTransactionParams(input);
    
    expect(params[1]).toBe(null);
    expect(params[2]).toBe(null);
    expect(params[6]).toBe(null);
  });
});
