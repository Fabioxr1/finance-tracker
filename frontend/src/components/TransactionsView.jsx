import '../index.css';
import { useTransactions } from '../hooks/useTransactions';
import { prepareTransactionForDuplication } from '../utils/transactionUtils';

// Componenti Transazioni
import TransactionFilters from './transactions/TransactionFilters';
import TransactionForm from './transactions/TransactionForm';
import TransactionTable from './transactions/TransactionTable';
import TransactionPagination from './transactions/TransactionPagination';
import CSVControls from './transactions/CSVControls';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function TransactionsView() {
  const {
    transactions, accounts, categories, installments, availableTags,
    lastTxDate, summary, filters, setFilters, pagination, setPagination,
    newTx, setNewTx, editingId, setEditingId, editTx, setEditTx,
    selectedIds, setSelectedIds, fileInputRef,
    handleTypeChange, addTransaction, deleteTransaction, startEdit, saveEdit,
    handleBulkDelete, handleBulkUpdate, handleFileUpload, handleExportCSV, fetchData
  } = useTransactions();

  // Logica specifica della View per la duplicazione (che usa addTransaction internamente)
  const handleDuplicate = async (t) => {
    try {
      const duplicatedTx = prepareTransactionForDuplication(t);
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatedTx)
      });
      if (!res.ok) throw new Error("Errore durante la duplicazione");
      fetchData();
    } catch (err) {
      alert("Errore: " + err.message);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === transactions.length) setSelectedIds([]);
    else setSelectedIds(transactions.map(t => t.id));
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
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
            {(filters.description || filters.category_id || filters.account_id || filters.type || filters.id || filters.amount) && (
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

      <TransactionFilters 
        filters={filters} setFilters={setFilters} 
        accounts={accounts} categories={categories} installments={installments}
        availableTags={availableTags}
        setPage={(page) => setPagination({...pagination, page})} 
      />

      <TransactionForm 
        newTx={newTx} setNewTx={setNewTx} 
        accounts={accounts} categories={categories} installments={installments} 
        onTypeChange={handleTypeChange} onSubmit={addTransaction} availableTags={availableTags}
      />

      {/* AZIONI DI MASSA */}
      {selectedIds.length > 0 && (
        <div className="card bulk-actions-bar">
          <span className="bulk-count">{selectedIds.length} transazioni selezionate</span>
          <div className="bulk-actions-group">
            <select className="year-selector" onChange={(e) => handleBulkUpdate({ updates: { recurrence_type: e.target.value } })} value="">
              <option value="" disabled>Tipo Ricorrenza</option>
              <option value="monthly">🔄 Mensile</option>
              <option value="extraordinary">⚡ Straordinaria</option>
              <option value="occasional">📅 Saltuaria</option>
              <option value="yearly">🗓️ Annuale</option>
              <option value="variable">📉 Variabile</option>
            </select>
            <select className="year-selector" onChange={(e) => handleBulkUpdate({ updates: { category_id: e.target.value } })} value="">
              <option value="" disabled>Sposta in Categoria</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="year-selector" style={{ border: '1px solid var(--accent-blue)', background: 'rgba(47, 129, 247, 0.05)' }} onChange={(e) => handleBulkUpdate({ tag_id: e.target.value })} value="">
              <option value="" disabled>Aggiungi Tag #</option>
              {availableTags.map(tag => <option key={tag.id} value={tag.id}>#{tag.name}</option>)}
            </select>
            <select className="year-selector" style={{ border: '1px solid var(--accent-red)', background: 'rgba(248, 81, 73, 0.05)' }} onChange={(e) => handleBulkUpdate({ remove_tag_id: e.target.value })} value="">
              <option value="" disabled>Rimuovi Tag X</option>
              {availableTags.map(tag => <option key={tag.id} value={tag.id}>#{tag.name}</option>)}
            </select>
            <button onClick={handleBulkDelete} className="bulk-btn-delete">Elimina Selezionate</button>
            <button onClick={() => setSelectedIds([])} className="bulk-btn-cancel">Deseleziona</button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '0' }}>
        <div className="table-responsive">
          <TransactionTable 
            transactions={transactions} accounts={accounts} categories={categories} installments={installments}
            editingId={editingId} editTx={editTx} setEditTx={setEditTx} 
            onStartEdit={startEdit} onSaveEdit={saveEdit} onCancelEdit={() => setEditingId(null)} 
            onDelete={deleteTransaction} onDuplicate={handleDuplicate} onTypeChange={handleTypeChange}
            selectedIds={selectedIds} onToggleSelectAll={toggleSelectAll} onToggleSelectOne={toggleSelectOne}
            availableTags={availableTags}
          />
        </div>
        <TransactionPagination pagination={pagination} setPage={(page) => setPagination({...pagination, page})} />
      </div>
    </div>
  );
}
