import TransactionDesktopRow from './TransactionDesktopRow';
import TransactionMobileCard from './TransactionMobileCard';

export default function TransactionTable({ 
  transactions, 
  accounts, 
  categories, 
  installments,
  editingId, 
  editTx, 
  setEditTx, 
  onStartEdit, 
  onSaveEdit, 
  onCancelEdit, 
  onDelete, 
  onDuplicate,
  onTypeChange,
  selectedIds = [],
  onToggleSelectAll,
  onToggleSelectOne,
  availableTags = []
}) {
  const commonProps = {
    accounts, categories, installments, editingId, editTx, setEditTx,
    onStartEdit, onSaveEdit, onCancelEdit, onDelete, onDuplicate, onTypeChange,
    onToggleSelectOne, availableTags
  };

  return (
    <div className="transactions-container">
      {/* VISTA DESKTOP (Tabella) */}
      <div className="desktop-only">
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={transactions.length > 0 && selectedIds.length === transactions.length} 
                  onChange={onToggleSelectAll}
                />
              </th>
              <th style={{ width: '50px', color: 'var(--text-secondary)', fontSize: '11px' }}>ID</th>
              <th>Data</th>
              <th>Conto</th>
              <th>Categoria</th>
              <th>Descrizione</th>
              <th>Finanziamento</th>
              <th style={{ textAlign: 'right' }}>Importo</th>
              <th style={{ textAlign: 'center', width: '80px' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan="9" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Nessuna transazione registrata.</td></tr>
            ) : (
              transactions.map(t => (
                <TransactionDesktopRow 
                  key={t.id} 
                  t={t} 
                  isSelected={selectedIds.includes(t.id)}
                  {...commonProps} 
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VISTA MOBILE (Cards) */}
      <div className="mobile-only">
        {transactions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Nessuna transazione.</div>
        ) : (
          transactions.map(t => (
            <TransactionMobileCard 
              key={t.id} 
              t={t} 
              isSelected={selectedIds.includes(t.id)}
              {...commonProps} 
            />
          ))
        )}
      </div>
    </div>
  );
}
