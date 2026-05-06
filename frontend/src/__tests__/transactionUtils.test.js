import { describe, it, expect } from 'vitest';
import { prepareTransactionForDuplication } from '../utils/transactionUtils';

describe('Transaction Utilities', () => {
  it('dovrebbe preparare correttamente una transazione per la duplicazione', () => {
    const originalTx = {
      id: 123,
      amount: 50.0,
      type: 'expense',
      date: '2023-01-01',
      account_id: 1,
      account_name: 'Conto Test',
      category_id: 10,
      category_name: 'Spesa',
      installment_id: 5,
      installment_name: 'Mutuo Auto',
      description: 'Cena fuori',
      tags: [
        { id: 1, name: 'cibo' },
        { id: 2, name: 'svago' }
      ]
    };

    const result = prepareTransactionForDuplication(originalTx);

    // Verifica che l'ID sia stato rimosso
    expect(result.id).toBeUndefined();
    
    // Verifica che i nomi (join) siano stati rimossi
    expect(result.account_name).toBeUndefined();
    expect(result.category_name).toBeUndefined();
    expect(result.installment_name).toBeUndefined();

    // Verifica che la data sia quella di oggi (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    expect(result.date).toBe(today);

    // Verifica che l'importo e gli altri campi siano rimasti uguali
    expect(result.amount).toBe(50.0);
    expect(result.type).toBe('expense');
    expect(result.description).toBe('Cena fuori');

    // Verifica che i tag siano stati mappati solo agli ID
    expect(result.tags).toEqual([1, 2]);
  });

  it('dovrebbe gestire transazioni senza tag', () => {
    const originalTx = {
      id: 456,
      amount: 10.0,
      type: 'income',
      tags: null
    };

    const result = prepareTransactionForDuplication(originalTx);
    expect(result.tags).toEqual([]);
  });
});
