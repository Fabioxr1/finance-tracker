import { Trash2, Edit2, Check, X, Copy } from 'lucide-react';

export default function TransactionMobileCard({
  t,
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
  isSelected,
  onToggleSelectOne,
  availableTags
}) {
  const isEditing = editingId === t.id;

  return (
    <div className={`mobile-tx-card ${isEditing ? 'editing' : ''} ${isSelected ? 'selected' : ''}`}>
      {!isEditing && (
        <div style={{ position: 'absolute', left: '10px', top: '10px', zIndex: 2 }}>
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={() => onToggleSelectOne(t.id)}
            style={{ width: '18px', height: '18px' }}
          />
        </div>
      )}
      
      {isEditing ? (
        <div className="mobile-edit-form">
          <div className="form-group">
            <label>Data & Importo (ID: {editTx.id})</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="date" className="text-input" value={editTx.date} onChange={e => setEditTx({ ...editTx, date: e.target.value })} />
              <input type="number" step="0.01" className="text-input" value={editTx.amount} onChange={e => setEditTx({ ...editTx, amount: parseFloat(e.target.value) || '' })} />
            </div>
          </div>
          <div className="form-group">
            <label>Tipo & Categoria</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select className="year-selector" value={editTx.type} onChange={e => onTypeChange(e, true)}>
                <option value="expense">Uscita</option>
                <option value="income">Entrata</option>
                <option value="transfer">Giroconto</option>
              </select>
              {editTx.type !== 'transfer' ? (
                <select className="year-selector" value={editTx.category_id} onChange={e => setEditTx({ ...editTx, category_id: e.target.value })}>
                  {categories.filter(c => c.type === editTx.type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              ) : (
                <select className="year-selector" value={editTx.category_id || ''} onChange={e => setEditTx({ ...editTx, category_id: e.target.value })}>
                   <option value="">Giroconto Standard</option>
                   {categories.filter(c => c.name === 'Investimenti').map(c => (
                     <option key={c.id} value={c.id}>Investimento</option>
                   ))}
                </select>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>Conto {editTx.type === 'transfer' ? 'Origine' : ''}</label>
            <select className="year-selector" value={editTx.account_id || ''} onChange={e => setEditTx({ ...editTx, account_id: e.target.value })}>
              <option value="">Nessuno (Vendita Titoli)</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          {editTx.type === 'transfer' && (
            <div className="form-group">
              <label>Conto Destinazione</label>
              <select className="year-selector" value={editTx.to_account_id || ''} onChange={e => setEditTx({ ...editTx, to_account_id: e.target.value })}>
                <option value="">Nessuno (Acquisto Titoli)</option>
                {accounts.filter(a => a.id !== parseInt(editTx.account_id)).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Descrizione</label>
            <input type="text" className="text-input" value={editTx.description} onChange={e => setEditTx({ ...editTx, description: e.target.value })} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
              {availableTags.map(tag => {
                const isTagSelected = editTx.tags?.includes(tag.id);
                return (
                  <span key={tag.id} onClick={() => {
                    const newTags = isTagSelected ? editTx.tags.filter(id => id !== tag.id) : [...(editTx.tags || []), tag.id];
                    setEditTx({ ...editTx, tags: newTags });
                  }} style={{ padding: '4px 10px', borderRadius: '10px', fontSize: '0.7em', border: `1px solid ${tag.color}`, background: isTagSelected ? tag.color : 'transparent', color: isTagSelected ? 'white' : tag.color, fontWeight: '600' }}>
                    #{tag.name}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="form-group">
            <label>Finanziamento & Ricorrenza</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select className="year-selector" value={editTx.installment_id || ''} onChange={e => setEditTx({ ...editTx, installment_id: e.target.value })}>
                <option value="">Nessun Finanziamento</option>
                {installments.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              <select className="year-selector" value={editTx.recurrence_type || 'monthly'} onChange={e => setEditTx({ ...editTx, recurrence_type: e.target.value })}>
                <option value="monthly">🔄 Mensile</option>
                <option value="extraordinary">⚡ Straord.</option>
                <option value="occasional">📅 Saltuaria</option>
                <option value="yearly">🗓️ Annuale</option>
                <option value="variable">📉 Variabile</option>
              </select>
            </div>
          </div>
          <div className="mobile-edit-actions">
            <button onClick={onSaveEdit} className="save-btn"><Check size={20} /> Salva</button>
            <button onClick={onCancelEdit} className="cancel-btn"><X size={20} /> Annulla</button>
          </div>
        </div>
      ) : (
        <div className="tx-card-content">
          <div className="tx-card-main">
            <div className="tx-card-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="tx-card-date">{new Date(t.date).toLocaleDateString('it-IT')}</div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>ID: {t.id}</span>
              </div>
              <div className="tx-card-desc">
                {(!t.recurrence_type || t.recurrence_type === 'monthly') && <span style={{ marginRight: '5px', opacity: 0.5 }}>🔄</span>}
                {t.recurrence_type === 'extraordinary' && <span style={{ marginRight: '5px' }}>⚡</span>}
                {t.recurrence_type === 'occasional' && <span style={{ marginRight: '5px' }}>📅</span>}
                {t.recurrence_type === 'yearly' && <span style={{ marginRight: '5px' }}>🗓️</span>}
                {t.recurrence_type === 'variable' && <span style={{ marginRight: '5px' }}>📉</span>}
                {t.description || '-'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                {t.tags && t.tags.map(tag => (
                  <span key={tag.id} title={tag.description} style={{ fontSize: '0.6em', padding: '1px 6px', borderRadius: '8px', border: `1px solid ${tag.color}`, color: tag.color, fontWeight: '600' }}>
                    #{tag.name}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                <span className="tx-card-category">{t.type === 'transfer' ? (t.category_name || 'Giroconto') : t.category_name}</span>
                <span className="tx-card-account">{t.type === 'transfer' ? `${t.account_name || 'Inv'} → ${t.to_account_name || 'Inv'}` : t.account_name}</span>
                {t.installment_id && (
                  <span className="tx-card-category" style={{ background: 'rgba(47, 129, 247, 0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(47, 129, 247, 0.3)' }}>
                    {installments.find(i => i.id === t.installment_id)?.name}
                  </span>
                )}
              </div>
            </div>
            <div className={`tx-card-amount ${t.type === 'income' ? 'value-positive' : t.type === 'expense' ? 'value-negative' : ''}`}>
              {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''} €{Number(t.amount).toFixed(2)}
            </div>
          </div>
          <div className={`tx-card-actions`}>
            <button onClick={() => onDuplicate(t)} style={{ color: 'var(--accent-blue)' }}><Copy size={18} /> Duplica</button>
            <button onClick={() => onStartEdit(t)}><Edit2 size={18} /> Modifica</button>
            <button onClick={() => onDelete(t.id)} className="delete-btn"><Trash2 size={18} /> Elimina</button>
          </div>
        </div>
      )}
    </div>
  );
}
