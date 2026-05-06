import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import useInvestments from '../hooks/useInvestments';

// Mock delle chiamate fetch
global.fetch = vi.fn();

describe('useInvestments Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dovrebbe caricare i dati iniziali correttamente', async () => {
    const mockPortfolio = [{ id: 1, name: 'Apple', currentValue: 1000, totalInvested: 900 }];
    const mockAccounts = [{ id: 1, name: 'Conto Corrente' }];
    const mockPlans = [];

    // Simuliamo le risposte delle 3 API chiamate in Promise.all
    fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockPortfolio) })
         .mockResolvedValueOnce({ json: () => Promise.resolve(mockAccounts) })
         .mockResolvedValueOnce({ json: () => Promise.resolve(mockPlans) });

    const { result } = renderHook(() => useInvestments());

    // Attendiamo che i dati vengano caricati
    await waitFor(() => {
      expect(result.current.portfolio).toEqual(mockPortfolio);
    });

    expect(result.current.accounts).toEqual(mockAccounts);
    expect(result.current.stats.totalValue).toBe(1000);
    expect(result.current.stats.totalGain).toBe(100);
  });

  it('dovrebbe gestire l\'apertura dei modali', () => {
    const { result } = renderHook(() => useInvestments());

    act(() => {
      result.current.setShowAddTitle(true);
    });

    expect(result.current.showAddTitle).toBe(true);
  });

  it('dovrebbe chiamare l\'API corretta per eliminare un titolo', async () => {
    // Mock della conferma dell'utente
    vi.stubGlobal('confirm', vi.fn(() => true));
    fetch.mockResolvedValueOnce({ ok: true }); // Delete response
    
    // Mock dei fetch iniziali per non far crashare fetchData
    fetch.mockResolvedValue({ json: () => Promise.resolve([]) });

    const { result } = renderHook(() => useInvestments());

    await act(async () => {
      await result.current.deleteTitle(123);
    });

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/investments/123'), expect.objectContaining({
      method: 'DELETE'
    }));
  });

  it('dovrebbe calcolare correttamente le statistiche globali', async () => {
    const mockPortfolio = [
      { id: 1, currentValue: 1000, totalInvested: 800 },
      { id: 2, currentValue: 500, totalInvested: 600 }
    ];

    fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockPortfolio) })
         .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
         .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

    const { result } = renderHook(() => useInvestments());

    await waitFor(() => {
      expect(result.current.stats.totalValue).toBe(1500);
      expect(result.current.stats.totalInvested).toBe(1400);
      expect(result.current.stats.totalGain).toBe(100);
      expect(result.current.stats.gainPercent).toBeCloseTo(7.14, 2);
    });
  });
});
