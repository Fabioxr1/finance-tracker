import '../index.css';
import { useTransactions } from '../hooks/useTransactions';
import { prepareTransactionForDuplication } from '../utils/transactionUtils';

// Componenti Transazioni
import TransactionFilters from './transactions/TransactionFilters';
import TransactionForm from './transactions/TransactionForm';
import TransactionTable from './transactions/TransactionTable';
import TransactionPagination from './transactions/TransactionPagination';
import CSVControls from './transactions/CSVControls';
import PageHeader from './common/PageHeader';
import AppButton from './common/AppButton';
import FormSelect from './common/FormSelect';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function TransactionsView() {
  const {
    transactions, accounts, categories, installments, availableTags,
    lastTxDate, summary, filters, setFilters, pagination, setPagination,
    newTx, setNewTx, editingId, setEditingId, editTx, setEditTx,
    selectedIds, setSelectedIds, fileInputRef,
    handleTypeChange, addTransaction, deleteTransaction, startEdit, saveEdit,
    handleBulkDelete, handleBulkUpdate, handleBulkUndo, handleFileUpload, handleExportCSV, fetchData
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
      <PageHeader 
        title="Le tue Transazioni"
        description={
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {lastTxDate && (
              <span>Ultima: <strong style={{ color: 'var(--accent-blue)' }}>{new Date(lastTxDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</strong></span>
            )}
            {(filters.description || filters.category_id || filters.account_id || filters.type || filters.id || filters.amount) && (
              <span>Totale Risultati: <strong style={{ color: summary.totalBalance >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                € {Math.abs(summary.totalBalance).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                {summary.totalBalance < 0 ? ' (Uscita)' : ' (Entrata)'}
              </strong></span>
            )}
          </div>
        }
        actions={
          <>
            <AppButton 
              variant="outline" 
              onClick={handleBulkUndo}
              style={{ color: 'var(--accent-red)', borderColor: 'rgba(248,81,73,0.3)', fontSize: '0.8rem' }}
              title="Annulla l'ultima operazione di modifica massiva"
            >
              ↩️ Annulla Ultima Modifica
            </AppButton>
            <CSVControls 
              onImportClick={() => fileInputRef.current.click()} 
              onExportClick={handleExportCSV}
              fileInputRef={fileInputRef} 
              onFileChange={handleFileUpload} 
            />
          </>
        }
      />

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
            <FormSelect 
              placeholder="Tipo Ricorrenza"
              onChange={(val) => handleBulkUpdate({ updates: { recurrence_type: val } })}
              options={[
                { value: 'monthly', label: '🔄 Mensile' },
                { value: 'extraordinary', label: '⚡ Straordinaria' },
                { value: 'occasional', label: '📅 Saltuaria' },
                { value: 'yearly', label: '🗓️ Annuale' },
                { value: 'variable', label: '📉 Variabile' }
              ]}
              style={{ height: '36px', fontSize: '0.85rem' }}
            />
            <FormSelect 
              placeholder="Sposta in Categoria"
              onChange={(val) => handleBulkUpdate({ updates: { category_id: val } })}
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              style={{ height: '36px', fontSize: '0.85rem' }}
            />
            <FormSelect 
              placeholder="Aggiungi Tag #"
              onChange={(val) => handleBulkUpdate({ tag_id: val })}
              options={availableTags.map(tag => ({ value: tag.id, label: `#${tag.name}` }))}
              style={{ height: '36px', fontSize: '0.85rem', borderColor: 'var(--accent-blue)' }}
            />
            <AppButton variant="danger" onClick={handleBulkDelete} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Elimina Selezionate</AppButton>
            <AppButton variant="outline" onClick={() => setSelectedIds([])} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Annulla</AppButton>
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
