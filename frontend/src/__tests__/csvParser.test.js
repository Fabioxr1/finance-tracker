import { describe, it, expect } from 'vitest';
import { parseCSVLines } from '../utils/csvParser';

describe('CSV Parser Utility', () => {
  const mockAccounts = [
    { id: 1, name: 'Conto Corrente' },
    { id: 2, name: 'Carta Digital' }
  ];

  const mockCategories = [
    { id: 10, name: 'Altro', type: 'expense' },
    { id: 11, name: 'Spesa', type: 'expense' },
    { id: 12, name: 'Stipendio', type: 'income' }
  ];

  it('dovrebbe parsare correttamente un CSV standard (punto e virgola)', () => {
    const lines = [
      'Data;Tipo;Importo;Conto;Categoria;Descrizione',
      '10/05/2024;Uscita;25,50;Conto Corrente;Spesa;Pane e latte'
    ];

    const result = parseCSVLines(lines, mockAccounts, mockCategories);
    
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toEqual({
      date: '2024-05-10',
      type: 'expense',
      amount: 25.50,
      account_id: 1,
      category_id: 11,
      description: 'Pane e latte',
      recurrence_type: 'monthly',
      tagNames: [],
      to_account_id: null
    });
  });

  it('dovrebbe gestire i decimali con la virgola in un CSV con separatore virgola (formato LibreOffice)', () => {
    // In questo caso "7,50" diventa due colonne separate se il separatore è ","
    const lines = [
      'Data,Tipo,Importo,Conto,Categoria,Descrizione',
      '2024-05-10,Uscita,7,50,Carta Digital,Caffè'
    ];

    const result = parseCSVLines(lines, mockAccounts, mockCategories);
    
    expect(result.transactions).toHaveLength(1);
    expect(result.amount).toBeUndefined(); // Verifica struttura
    expect(result.transactions[0].amount).toBe(7.50);
    expect(result.transactions[0].account_id).toBe(2);
  });

  it('dovrebbe restituire un errore se il conto non esiste', () => {
    const lines = [
      'Data;Tipo;Importo;Conto;Categoria',
      '10/05/2024;Uscita;10;Conto Inesistente;Altro'
    ];

    const result = parseCSVLines(lines, mockAccounts, mockCategories);
    
    expect(result.transactions).toHaveLength(0);
    expect(result.errors[0]).toContain('Conto Origine "Conto Inesistente" non trovato');
  });

  it('dovrebbe usare la categoria fallback "Altro" se la categoria non esiste', () => {
    const lines = [
      'Data;Tipo;Importo;Conto;Categoria',
      '10/05/2024;Uscita;10;Conto Corrente;Categoria Fantasma'
    ];

    const result = parseCSVLines(lines, mockAccounts, mockCategories);
    
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].category_id).toBe(10); // ID di 'Altro'
  });
});
