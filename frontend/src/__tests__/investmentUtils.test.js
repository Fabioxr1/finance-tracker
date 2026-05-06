import { describe, it, expect } from 'vitest';
import { calculateTransactionFields, calculateInitialPACShares } from '../utils/investmentUtils';

describe('Investment UI Utilities', () => {

  describe('calculateTransactionFields', () => {
    it('dovrebbe calcolare il totale quando cambiano le quote (ETF)', () => {
      const result = calculateTransactionFields('10', '100', '', 'ETF', 'shares');
      expect(result.total_amount).toBe('1000.00');
    });

    it('dovrebbe calcolare il totale quando cambia il prezzo (ETF)', () => {
      const result = calculateTransactionFields('10', '105.50', '', 'ETF', 'price');
      expect(result.total_amount).toBe('1055.00');
    });

    it('dovrebbe calcolare le quote quando cambia il totale (ETF)', () => {
      const result = calculateTransactionFields('', '100', '1000', 'ETF', 'total');
      expect(result.shares).toBe('10.0000');
    });

    it('dovrebbe gestire il fattore 100 per i BTP (calcolo totale)', () => {
      // 1000 quote di BTP a prezzo 100 -> totale 1000€ (non 100.000€)
      const result = calculateTransactionFields('1000', '100', '', 'BTP', 'shares');
      expect(result.total_amount).toBe('1000.00');
    });

    it('dovrebbe gestire il fattore 100 per i BTP (calcolo quote)', () => {
      // Investo 1000€ in BTP a prezzo 98.5
      const result = calculateTransactionFields('', '98.5', '1000', 'BTP', 'total');
      // (1000 * 100) / 98.5 = 1015.2284
      expect(result.shares).toBe('1015.2284');
    });
  });

  describe('calculateInitialPACShares', () => {
    it('dovrebbe calcolare le quote iniziali per un PAC ETF', () => {
      expect(calculateInitialPACShares('100', '50', 'ETF')).toBe('2.0000');
    });

    it('dovrebbe calcolare le quote iniziali per un PAC BTP', () => {
      expect(calculateInitialPACShares('100', '98', 'BTP')).toBe('102.0408');
    });

    it('dovrebbe restituire stringa vuota se i dati mancano', () => {
      expect(calculateInitialPACShares('100', '0', 'ETF')).toBe('');
    });
  });

});
