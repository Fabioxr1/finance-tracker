import { useState, useEffect, useRef } from 'react';
import '../index.css';
import { parseCSVLines, exportTransactionsToCSV } from '../utils/csvParser';

// Componenti Transazioni
import TransactionFilters from './transactions/TransactionFilters';
import TransactionForm from './transactions/TransactionForm';
import TransactionTable from './transactions/TransactionTable';
import TransactionPagination from './transactions/TransactionPagination';
import CSVControls from './transactions/CSVControls';

import { prepareTransactionForDuplication } from '../utils/transactionUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function TransactionsView() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [availableTags, setAvailableTags] = useState([]); // Nuovi tag disponibili
  const [lastTxDate, setLastTxDate] = useState(null);
  const [summary, setSummary] = useState({ totalBalance: 0, absoluteTotal: 0 });
  
  const [filters, setFilters] = useState({ year: '', month: '', type: '', account_id: '', category_id: '', description: '', installment_id: '', tag_id: '', id: '', amount: '' });
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
    tags: [] // Inizializzazione array tag
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
        fetch(`${API_URL}/tags`).then(r => r.json()) // Caricamento tag
      ]);

      setTransactions(tRes.data);
      setSummary({ 
        totalBalance: tRes.totalBalance, 
        absoluteTotal: tRes.absoluteTotal 
      });
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
    setSelectedIds([]); // Reset selezione quando cambiano filtri o pagina
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

  const handleDuplicate = async (t) => {
    try {
      const duplicatedTx = prepareTransactionForDuplication(t);

      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatedTx)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore durante la duplicazione");
      }
      
      fetchData();
    } catch (err) {
      console.error("Errore duplicazione:", err);
      alert("Errore durante la duplicazione: " + err.message);
    }
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditTx({ 
      ...t, 
      date: new Date(t.date).toISOString().split('T')[0],
      recurrence_type: t.recurrence_type || 'monthly',
      tags: t.tags ? t.tags.map(tag => tag.id) : [] // Mappa gli oggetti tag in array di ID
    });
  };

  const saveEdit = async () => {
    if (!editTx.amount || !editTx.account_id) {
      alert("Importo e Conto sono obbligatori.");
      return;
    }
    const isInvestment = categories.find(c => c.id === parseInt(editTx.category_id))?.name === 'Investimenti';

    if (editTx.type !== 'transfer' && !editTx.category_id) {
      alert("Seleziona una categoria per le entrate/uscite.");
      return;
    }
    if (editTx.type === 'transfer' && !editTx.to_account_id && !isInvestment) {
      alert("Per i giroconti standard devi selezionare il conto di destinazione.");
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
      // NON svuotiamo più setSelectedIds([]) qui per permettere tag multipli
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map(t => t.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
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
        return alert("Errori durante l'importazione:\n\n" + errors.join('\n') + "\n\nControlla i nomi dei conti nel CSV.");
      }

      if (newTransactions.length === 0) {
        return alert("Non è stata trovata nessuna riga valida. Sicuro di aver rispettato le colonne?");
      }

      try {
        const res = await fetch(`${API_URL}/transactions/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions: newTransactions })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Errore durante il caricamento batch");
        alert(`${newTransactions.length} transazioni importate con successo!`);
        fetchData();
      } catch (err) {
        console.error(err);
        alert(`Errore del database: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({
        limit: 100000, // Prendiamo tutto lo storico filtrato
        ...(filters.year && { year: filters.year }),
        ...(filters.month && { month: filters.month }),
        ...(filters.type && { type: filters.type }),
        ...(filters.account_id && { account_id: filters.account_id }),
        ...(filters.category_id && { category_id: filters.category_id }),
        ...(filters.description && { description: filters.description }),
        ...(filters.installment_id && { installment_id: filters.installment_id }),
        ...(filters.tag_id && { tag_id: filters.tag_id })
      });

      const res = await fetch(`${API_URL}/transactions?${params}`);
      const result = await res.json();
      
      if (!res.ok) throw new Error("Errore durante il recupero dei dati per l'esportazione");
      
      const csvContent = exportTransactionsToCSV(result.data);
      
      // Creazione Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `esportazione_finanze_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error(err);
      alert("Errore durante l'esportazione CSV: " + err.message);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="page-title" style={{marginBottom: 0}}>Le tue Transazioni</h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            {lastTxDate && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginTop: '5px' }}>
                Ultima: <strong style={{ color: 'var(--accent-blue)' }}>{new Date(lastTxDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</strong>
              </p>
            )}
            {(filters.description || filters.category_id || filters.account_id || filters.type) && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginTop: '5px' }}>
                Totale Risultati: <strong style={{ color: summary.totalBalance >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  € {Math.abs(summary.totalBalance).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  {summary.totalBalance < 0 ? ' (Uscita)' : ' (Entrata)'}
                </strong>
              </p>
            )}
          </div>
        </div>
        <CSVControls 
          onImportClick={() => fileInputRef.current.click()} 
          onExportClick={handleExportCSV}
          fileInputRef={fileInputRef} 
          onFileChange={handleFileUpload} 
        />
      </div>

      {/* FILTRI */}
      <TransactionFilters 
        filters={filters} 
        setFilters={setFilters} 
        accounts={accounts} 
        categories={categories} 
        installments={installments}
        availableTags={availableTags}
        setPage={(page) => setPagination({...pagination, page})} 
      />

      {/* FORM AGGIUNTA TRANSAZIONE */}
      <TransactionForm 
        newTx={newTx} 
        setNewTx={setNewTx} 
        accounts={accounts} 
        categories={categories} 
        installments={installments} 
        onTypeChange={handleTypeChange} 
        onSubmit={addTransaction} 
        availableTags={availableTags}
      />

      {/* AZIONI DI MASSA */}
      {selectedIds.length > 0 && (
        <div className="card" style={{ 
          marginBottom: '20px', 
          background: 'rgba(47, 129, 247, 0.1)', 
          border: '1px solid var(--accent-blue)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '15px 20px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>
            {selectedIds.length} transazioni selezionate
          </span>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9em' }}>Imposta come:</span>
            
            <select 
              className="year-selector" 
              style={{ fontSize: '12px' }}
              onChange={(e) => handleBulkUpdate({ updates: { recurrence_type: e.target.value } })}
              value=""
            >
              <option value="" disabled>Tipo Ricorrenza</option>
              <option value="monthly">🔄 Mensile</option>
              <option value="extraordinary">⚡ Straordinaria</option>
              <option value="occasional">📅 Saltuaria</option>
              <option value="yearly">🗓️ Annuale</option>
              <option value="variable">📉 Variabile</option>
            </select>

            <select 
              className="year-selector" 
              style={{ fontSize: '12px' }}
              onChange={(e) => handleBulkUpdate({ updates: { category_id: e.target.value } })}
              value=""
            >
              <option value="" disabled>Sposta in Categoria</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select 
              className="year-selector" 
              style={{ fontSize: '12px', border: '1px solid var(--accent-blue)', background: 'rgba(47, 129, 247, 0.05)' }}
              onChange={(e) => handleBulkUpdate({ tag_id: e.target.value })}
              value=""
            >
              <option value="" disabled>Aggiungi Tag #</option>
              {availableTags.map(tag => <option key={tag.id} value={tag.id}>#{tag.name}</option>)}
            </select>

            <select 
              className="year-selector" 
              style={{ fontSize: '12px', border: '1px solid var(--accent-red)', background: 'rgba(248, 81, 73, 0.05)' }}
              onChange={(e) => handleBulkUpdate({ remove_tag_id: e.target.value })}
              value=""
            >
              <option value="" disabled>Rimuovi Tag X</option>
              {availableTags.map(tag => <option key={tag.id} value={tag.id}>#{tag.name}</option>)}
            </select>

            <button 
              onClick={handleBulkDelete}
              className="year-selector" 
              style={{ background: 'rgba(248, 81, 73, 0.1)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)', cursor: 'pointer' }}
            >
              Elimina Selezionate
            </button>
            
            <button 
              onClick={() => setSelectedIds([])}
              className="year-selector" 
              style={{ background: 'var(--border-color)', color: 'white', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}
            >
              Fine / Deseleziona
            </button>
          </div>
        </div>
      )}

      {/* LISTA TRANSAZIONI */}
      <div className="card" style={{ padding: '0' }}>
        <div className="table-responsive">
          <TransactionTable 
            transactions={transactions} 
            accounts={accounts} 
            categories={categories} 
            installments={installments}
            editingId={editingId} 
            editTx={editTx} 
            setEditTx={setEditTx} 
            onStartEdit={startEdit} 
            onSaveEdit={saveEdit} 
            onCancelEdit={() => setEditingId(null)} 
            onDelete={deleteTransaction} 
            onDuplicate={handleDuplicate}
            onTypeChange={handleTypeChange}
            selectedIds={selectedIds}
            onToggleSelectAll={toggleSelectAll}
            onToggleSelectOne={toggleSelectOne}
            availableTags={availableTags}
          />
        </div>
        
        <TransactionPagination 
          pagination={pagination} 
          setPage={(page) => setPagination({...pagination, page})} 
        />
      </div>
    </div>
  );
}
