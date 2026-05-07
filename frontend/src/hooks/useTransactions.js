import { useState, useEffect, useRef } from 'react';
import { parseCSVLines, exportTransactionsToCSV } from '../utils/csvParser';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [lastTxDate, setLastTxDate] = useState(null);
  const [summary, setSummary] = useState({ totalBalance: 0, absoluteTotal: 0 });
  
  const [filters, setFilters] = useState({ 
    year: '', month: '', type: '', account_id: '', category_id: '', 
    description: '', installment_id: '', tag_id: '', id: '', amount: '' 
  });
  
  const [pagination, setPagination] = useState({ page: 1, limit: 50, totalPages: 1, total: 0 });

  const [newTx, setNewTx] = useState({
    type: 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    account_id: '',
    to_account_id: '',
    category_id: '',
    description: '',
    installment_id: '',
    recurrence_type: 'monthly',
    tags: []
  });

  const [editingId, setEditingId] = useState(null);
  const [editTx, setEditTx] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.year && { year: filters.year }),
        ...(filters.month && { month: filters.month }),
        ...(filters.type && { type: filters.type }),
        ...(filters.account_id && { account_id: filters.account_id }),
        ...(filters.category_id && { category_id: filters.category_id }),
        ...(filters.description && { description: filters.description }),
        ...(filters.installment_id && { installment_id: filters.installment_id }),
        ...(filters.tag_id && { tag_id: filters.tag_id }),
        ...(filters.id && { id: filters.id }),
        ...(filters.amount && { amount: filters.amount })
      });

      const [tRes, aRes, cRes, iRes, tagRes] = await Promise.all([
        fetch(`${API_URL}/transactions?${params}`).then(r => r.json()),
        fetch(`${API_URL}/accounts`).then(r => r.json()),
        fetch(`${API_URL}/categories`).then(r => r.json()),
        fetch(`${API_URL}/installments`).then(r => r.json()),
        fetch(`${API_URL}/tags`).then(r => r.json())
      ]);

      setTransactions(tRes.data);
      setSummary({ totalBalance: tRes.totalBalance, absoluteTotal: tRes.absoluteTotal });
      setPagination(prev => ({ 
        ...prev, 
        totalPages: tRes.pagination.totalPages, 
        total: tRes.pagination.total 
      }));
      setAccounts(aRes);
      setCategories(cRes);
      setInstallments(iRes);
      setAvailableTags(tagRes);

      if (!filters.year && !filters.month && !filters.type && !filters.account_id && !filters.category_id && !filters.description && tRes.data.length > 0) {
        setLastTxDate(tRes.data[0].date);
      } else {
        fetch(`${API_URL}/transactions?limit=1`)
          .then(r => r.json())
          .then(res => {
            if (res.data.length > 0) setLastTxDate(res.data[0].date);
          });
      }
      
      if (aRes.length > 0 && cRes.length > 0) {
        setNewTx(prev => ({
          ...prev,
          account_id: prev.account_id || aRes[0].id,
          category_id: prev.category_id || (cRes.find(c => c.type === prev.type)?.id || cRes[0].id)
        }));
      }
    } catch (err) {
      console.error("Errore nel caricamento dati:", err);
    }
  };

  useEffect(() => {
    fetchData();
    setSelectedIds([]);
  }, [filters, pagination.page]);

  const handleTypeChange = (e, isEdit = false) => {
    const type = e.target.value;
    const typeCategories = categories.filter(c => c.type === type);
    const newCatId = typeCategories.length > 0 ? typeCategories[0].id : '';
    
    if (isEdit) {
      setEditTx({ ...editTx, type, category_id: type === 'transfer' ? null : newCatId });
    } else {
      setNewTx({ ...newTx, type, category_id: type === 'transfer' ? null : newCatId });
    }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.account_id) return;
    const isInvestment = categories.find(c => c.id === parseInt(newTx.category_id))?.name === 'Investimenti';
    
    if (newTx.type !== 'transfer' && !newTx.category_id) return;
    if (newTx.type === 'transfer' && !newTx.to_account_id && !isInvestment) return;
    
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx)
      });
      if (!res.ok) throw new Error("Errore durante l'inserimento");
      setNewTx({ ...newTx, amount: '', description: '', installment_id: '', recurrence_type: 'monthly', tags: [] });
      fetchData(); 
    } catch (err) {
      console.error("Errore inserimento:", err);
    }
  };

  const deleteTransaction = async (id) => {
    if(!window.confirm("Sicuro di voler eliminare questa transazione?")) return;
    try {
      const res = await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Errore durante l'eliminazione");
      fetchData();
    } catch(err) {
      console.error(err);
    }
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditTx({ 
      ...t, 
      date: new Date(t.date).toISOString().split('T')[0],
      recurrence_type: t.recurrence_type || 'monthly',
      tags: t.tags ? t.tags.map(tag => tag.id) : []
    });
  };

  const saveEdit = async () => {
    if (!editTx.amount || !editTx.account_id) {
      alert("Importo e Conto sono obbligatori.");
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/transactions/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTx)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore durante il salvataggio");
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert("Errore durante il salvataggio: " + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Sicuro di voler eliminare ${selectedIds.length} transazioni?`)) return;
    try {
      const res = await fetch(`${API_URL}/transactions/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (!res.ok) throw new Error("Errore durante l'eliminazione massiva");
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkUpdate = async (payload) => {
    try {
      const res = await fetch(`${API_URL}/transactions/bulk-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, ...payload })
      });
      if (!res.ok) throw new Error("Errore durante la modifica massiva");
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkUndo = async () => {
    try {
      const res = await fetch(`${API_URL}/transactions/bulk-undo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore durante l'annullamento");
      alert(data.message);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 2) return alert("Il file CSV è vuoto o non ha transazioni.");

      const { transactions: newTransactions, errors } = parseCSVLines(lines, accounts, categories);

      if (errors.length > 0) {
        return alert("Errori durante l'importazione:\n\n" + errors.join('\n'));
      }

      try {
        const res = await fetch(`${API_URL}/transactions/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions: newTransactions })
        });
        if (!res.ok) throw new Error("Errore durante il caricamento batch");
        alert(`${newTransactions.length} transazioni importate/aggiornate con successo!`);
        fetchData();
      } catch (err) {
        alert(`Errore del database: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({
        limit: 100000,
        ...(filters.year && { year: filters.year }),
        ...(filters.month && { month: filters.month }),
        ...(filters.type && { type: filters.type }),
        ...(filters.account_id && { account_id: filters.account_id }),
        ...(filters.category_id && { category_id: filters.category_id }),
        ...(filters.description && { description: filters.description }),
        ...(filters.installment_id && { installment_id: filters.installment_id }),
        ...(filters.tag_id && { tag_id: filters.tag_id }),
        ...(filters.id && { id: filters.id }),
        ...(filters.amount && { amount: filters.amount })
      });

      const res = await fetch(`${API_URL}/transactions?${params}`);
      const result = await res.json();
      
      const csvContent = exportTransactionsToCSV(result.data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `esportazione_finanze_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Errore durante l'esportazione: " + err.message);
    }
  };

  return {
    transactions, accounts, categories, installments, availableTags,
    lastTxDate, summary, filters, setFilters, pagination, setPagination,
    newTx, setNewTx, editingId, setEditingId, editTx, setEditTx,
    selectedIds, setSelectedIds, fileInputRef,
    handleTypeChange, addTransaction, deleteTransaction, startEdit, saveEdit,
    handleBulkDelete, handleBulkUpdate, handleBulkUndo, handleFileUpload, handleExportCSV, fetchData
  };
}
