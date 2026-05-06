import { describe, it, expect } from 'vitest';
import { calculateInvestmentPerformance } from '../utils/investmentCalculations';

describe('Investment Performance Calculations', () => {
  
  it('dovrebbe calcolare correttamente un singolo acquisto', () => {
    const investment = { type: 'ETF', use_manual_price: false };
    const transactions = [
      { type: 'buy', shares: 10, total_amount: 1000 } // Prezzo unitario 100
    ];
    const livePrice = 110;

    const result = calculateInvestmentPerformance(investment, transactions, livePrice);

    expect(result.totalShares).toBe(10);
    expect(result.totalInvested).toBe(1000);
    expect(result.avgPrice).toBe(100);
    expect(result.currentValue).toBe(1100); // 10 * 110
    expect(result.gain).toBe(100);
    expect(result.gainPercent).toBe(10);
  });

  it('dovrebbe calcolare correttamente il Prezzo Medio di Carico (PMC) con più acquisti', () => {
    const investment = { type: 'ETF', use_manual_price: false };
    const transactions = [
      { type: 'buy', shares: 10, total_amount: 1000 }, // PMC 100
      { type: 'buy', shares: 10, total_amount: 1200 }  // Nuovo PMC: (1000+1200)/20 = 110
    ];
    const livePrice = 110;

    const result = calculateInvestmentPerformance(investment, transactions, livePrice);

    expect(result.totalShares).toBe(20);
    expect(result.totalInvested).toBe(2200);
    expect(result.avgPrice).toBe(110);
    expect(result.gain).toBe(0); // Prezzo attuale = PMC
  });

  it('dovrebbe gestire correttamente le vendite scaricando il costo storico (PMC)', () => {
    const investment = { type: 'ETF', use_manual_price: false };
    const transactions = [
      { type: 'buy', shares: 20, total_amount: 2000 }, // PMC 100
      { type: 'sell', shares: 10, total_amount: 1500 } // Vendo metà quote a 150
    ];
    // Dopo la vendita di metà quote, l'investito rimanente deve essere metà del costo storico (1000)
    // Nonostante io abbia incassato 1500, il costo storico "residuo" è calcolato sul PMC
    const livePrice = 120;

    const result = calculateInvestmentPerformance(investment, transactions, livePrice);

    expect(result.totalShares).toBe(10);
    expect(result.totalInvested).toBe(1000);
    expect(result.avgPrice).toBe(100);
    expect(result.currentValue).toBe(1200);
    expect(result.gain).toBe(200); // Guadagno latente sulle 10 quote rimaste
  });

  it('dovrebbe applicare il fattore 100 per BTP e Obbligazioni', () => {
    const investment = { type: 'BTP', use_manual_price: false };
    const transactions = [
      { type: 'buy', shares: 1000, total_amount: 1000 } // Prezzo 100 (1000 quote * 100 / 100)
    ];
    const livePrice = 98.5; // BTP sotto la pari

    const result = calculateInvestmentPerformance(investment, transactions, livePrice);

    expect(result.avgPrice).toBe(100);
    expect(result.currentValue).toBe(985); // (98.5 * 1000 / 100)
    expect(result.gain).toBe(-15);
  });

  it('dovrebbe usare il prezzo manuale se impostato', () => {
    const investment = { 
      type: 'ETF', 
      use_manual_price: true, 
      manual_price: 50 
    };
    const transactions = [
      { type: 'buy', shares: 10, total_amount: 400 } // PMC 40
    ];
    const livePrice = 100; // Prezzo di mercato ignorato

    const result = calculateInvestmentPerformance(investment, transactions, livePrice);

    expect(result.livePrice).toBe(50);
    expect(result.currentValue).toBe(500); // 10 * 50
    expect(result.gain).toBe(100);
  });

});
