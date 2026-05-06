import { describe, it, expect, vi } from 'vitest';
const transactionService = require('./transactionService');

describe('TransactionService', () => {
  // Mock del client del database
  const mockClient = {
    query: vi.fn()
  };

  it('dovrebbe creare una transazione con dati validi', async () => {
    const validData = {
      account_id: 1,
      category_id: 5,
      amount: 150.50,
      type: 'expense',
      date: '2026-05-01',
      description: 'Cena test'
    };

    // Simuliamo la risposta del DB
    mockClient.query.mockResolvedValueOnce({
      rows: [{ id: 100, ...validData }]
    });

    const result = await transactionService.createTransaction(mockClient, validData);

    expect(result.id).toBe(100);
    expect(result.amount).toBe(150.50);
    
    // Verifichiamo che la query SQL sia stata costruita correttamente
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO transactions'),
      expect.arrayContaining([1, 5, 150.50, 'expense', '2026-05-01', 'Cena test'])
    );
  });

  it('dovrebbe lanciare un errore se manca un campo obbligatorio', async () => {
    const invalidData = {
      account_id: 1,
      // manca category_id
      amount: 100,
      type: 'expense',
      date: '2026-05-01'
    };

    await expect(transactionService.createTransaction(mockClient, invalidData))
      .rejects.toThrow("Errore Validazione: Il campo 'category_id' è obbligatorio.");
  });

  it('dovrebbe gestire gli errori del database', async () => {
    const data = {
      account_id: 1,
      category_id: 1,
      amount: 10,
      type: 'income',
      date: '2026-05-01'
    };

    // Simuliamo un errore di connessione o vincolo del DB
    mockClient.query.mockRejectedValueOnce(new Error("Database connection error"));

    await expect(transactionService.createTransaction(mockClient, data))
      .rejects.toThrow("Database connection error");
  });
});
