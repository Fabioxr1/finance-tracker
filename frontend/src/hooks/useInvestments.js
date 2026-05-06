import { useState, useEffect, useMemo } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function useInvestments() {
  // ... (stati esistenti invariati)
  const [portfolio, setPortfolio] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [plans, setPlans] = useState([]);
  
  const [showAddTitle, setShowAddTitle] = useState(false);
  const [showEditTitle, setShowEditTitle] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [showExecutePlan, setShowExecutePlan] = useState(false);

  const [selectedInv, setSelectedInv] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [history, setHistory] = useState([]);

  const [newTitle, setNewTitle] = useState({ name: '', isin: '', ticker: '', type: 'ETF', account_id: '', manual_price: '', use_manual_price: false });
  const [newTx, setNewTx] = useState({ investment_id: '', account_id: '', date: new Date().toISOString().split('T')[0], shares: '', price_per_share: '', total_amount: '', type: 'buy' });
  const [newPlan, setNewPlan] = useState({ name: '', investment_id: '', amount: '' });
  const [execPlanData, setExecPlanData] = useState({ account_id: '', date: new Date().toISOString().split('T')[0], amount: '', shares: '', price_per_share: '' });

  const [editingTxId, setEditingTxId] = useState(null);
  const [editTxData, setEditTxData] = useState(null);
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [editTitleData, setEditTitleData] = useState(null);

  const fetchData = async () => {
    try {
      const [portRes, accRes, planRes] = await Promise.all([
        fetch(`${API_URL}/investments`).then(r => r.json()),
        fetch(`${API_URL}/accounts`).then(r => r.json()),
        fetch(`${API_URL}/investment-plans`).then(r => r.json())
      ]);
      setPortfolio(portRes);
      setAccounts(accRes);
      setPlans(planRes);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateQuickPrice = async (inv, price, useManual) => {
    try {
      const res = await fetch(`${API_URL}/investments/${inv.id}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual_price: price, use_manual_price: useManual })
      });
      if (!res.ok) throw new Error("Errore aggiornamento prezzo");
      fetchData();
    } catch (err) { console.error(err); }
  };

  const addTitle = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/investments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTitle)
      });
      if (!res.ok) throw new Error("Errore aggiunta titolo");
      setShowAddTitle(false);
      setNewTitle({ name: '', isin: '', ticker: '', type: 'ETF', account_id: '', manual_price: '', use_manual_price: false });
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const updateTitle = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/investments/${editingTitleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTitleData)
      });
      if (!res.ok) throw new Error("Errore aggiornamento titolo");
      setShowEditTitle(false);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const deleteTitle = async (id) => {
    if (!window.confirm("Eliminare il titolo e lo storico?")) return;
    try {
      const res = await fetch(`${API_URL}/investments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Errore eliminazione titolo");
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/investments/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx)
      });
      if (!res.ok) throw new Error("Errore aggiunta transazione");
      setShowAddTx(false);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const fetchHistory = async (inv) => {
    try {
      const res = await fetch(`${API_URL}/investments/${inv.id}/transactions`);
      const data = await res.json();
      setHistory(data);
      setSelectedInv(inv);
      setShowHistory(true);
    } catch (err) { console.error(err); }
  };

  const startEditTx = (tx) => {
    setEditingTxId(tx.id);
    setEditTxData({ ...tx, date: new Date(tx.date).toISOString().split('T')[0] });
  };

  const saveEditTx = async () => {
    try {
      const res = await fetch(`${API_URL}/investments/transactions/${editingTxId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTxData)
      });
      if (!res.ok) throw new Error("Errore modifica transazione");
      setEditingTxId(null);
      fetchHistory(selectedInv);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const deleteHistoryTx = async (id) => {
    if (!window.confirm("Eliminare movimento?")) return;
    try {
      const res = await fetch(`${API_URL}/investments/transactions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Errore eliminazione movimento");
      fetchHistory(selectedInv);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const addPlan = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/investment-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlan)
      });
      if (!res.ok) throw new Error("Errore aggiunta piano");
      setShowAddPlan(false);
      setNewPlan({ name: '', investment_id: '', amount: '' });
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const executePlan = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/investment-plans/${selectedPlan.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(execPlanData)
      });
      if (!res.ok) throw new Error("Errore esecuzione piano");
      setShowExecutePlan(false);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const deletePlan = async (id) => {
    if (!window.confirm("Eliminare piano?")) return;
    try {
      const res = await fetch(`${API_URL}/investment-plans/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Errore eliminazione piano");
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const startEditTitle = (inv) => {
    setEditingTitleId(inv.id);
    setEditTitleData({ ...inv });
    setShowEditTitle(true);
  };

  // Calcoli derivati
  const stats = useMemo(() => {
    const totalValue = portfolio.reduce((acc, curr) => acc + Number(curr.currentValue || 0), 0);
    const totalInvested = portfolio.reduce((acc, curr) => acc + Number(curr.totalInvested || 0), 0);
    const totalGain = totalValue - totalInvested;
    const gainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
    
    const totalEstimatedTaxes = portfolio.reduce((acc, curr) => {
      const gain = Number(curr.gain || 0);
      if (gain <= 0) return acc;
      const rate = (curr.type === 'BTP' || curr.type === 'Obbligazione') ? 0.125 : 0.26;
      return acc + (gain * rate);
    }, 0);

    return { totalValue, totalInvested, totalGain, gainPercent, totalEstimatedTaxes };
  }, [portfolio]);

  return {
    portfolio, accounts, plans, history, setHistory, stats,
    showAddTitle, setShowAddTitle,
    showEditTitle, setShowEditTitle,
    showAddTx, setShowAddTx,
    showHistory, setShowHistory,
    showAddPlan, setShowAddPlan,
    showExecutePlan, setShowExecutePlan,
    selectedInv, setSelectedInv,
    selectedPlan, setSelectedPlan,
    newTitle, setNewTitle,
    newTx, setNewTx,
    newPlan, setNewPlan,
    execPlanData, setExecPlanData,
    editingTxId, setEditingTxId,
    editTxData, setEditTxData,
    editingTitleId, setEditingTitleId,
    editTitleData, setEditTitleData,
    updateQuickPrice, addTitle, updateTitle, deleteTitle,
    addTransaction, fetchHistory, startEditTx, saveEditTx,
    deleteHistoryTx, addPlan, executePlan, deletePlan,
    startEditTitle
  };
}
