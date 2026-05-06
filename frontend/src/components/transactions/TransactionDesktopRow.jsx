import { Trash2, Edit2, Check, X, Copy } from 'lucide-react';

export default function TransactionDesktopRow({
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
  const isInv = categories.find(c => c.id === parseInt(editTx?.category_id))?.name === 'Investimenti';

  if (isEditing) {
    return (
      <tr style={{ backgroundColor: 'rgba(47, 129, 247, 0.1)' }}>
        <td></td>
        <td style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center' }}>{t.id}</td>
        <td>
          <input 
            type="date" 
            className="text-input" 
            value={editTx.date} 
            onChange={e => setEditTx({ ...editTx, date: e.target.value })} 
            style={{ width: '130px' }} 
          />
        </td>
        <td>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <select 
              className="year-selector" 
              value={editTx.type} 
              onChange={e => onTypeChange(e, true)} 
              style={{ width: '100%', fontSize: '11px', height: '28px' }}
            >
              <option value="expense">Uscita</option>
              <option value="income">Entrata</option>
              <option value="transfer">Giroconto</option>
            </select>
            <select 
              className="year-selector" 
              value={editTx.account_id || ''} 
              onChange={e => setEditTx({ ...editTx, account_id: e.target.value })} 
              style={{ width: '100%' }}
            >
              <option value="">Nessuno (Vendita Titoli)</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {editTx.type === 'transfer' && (
              <select 
                className="year-selector" 
                value={editTx.to_account_id || ''} 
                onChange={e => setEditTx({ ...editTx, to_account_id: e.target.value })} 
                style={{ width: '100%', border: isInv ? '1px solid var(--accent-green)' : '1px solid var(--accent-blue)' }}
              >
                <option value="">Nessuno (Acquisto Titoli)</option>
                {accounts.filter(a => a.id !== parseInt(editTx.account_id)).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            )}
          </div>
        </td>
        <td>
          {editTx.type !== 'transfer' ? (
            <select className="year-selector" value={editTx.category_id} onChange={e => setEditTx({ ...editTx, category_id: e.target.value })} style={{ width: '100%' }}>
              {categories.filter(c => c.type === editTx.type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : (
            <select className="year-selector" value={editTx.category_id || ''} onChange={e => setEditTx({ ...editTx, category_id: e.target.value })} style={{ width: '100%' }}>
               <option value="">Giroconto Standard</option>
               {categories.filter(c => c.name === 'Investimenti').map(c => (
                 <option key={c.id} value={c.id}>Investimento</option>
               ))}
            </select>
          )}
        </td>
        <td>
          <input type="text" className="text-input" value={editTx.description} onChange={e => setEditTx({ ...editTx, description: e.target.value })} style={{ width: '100%' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
            {availableTags.map(tag => {
              const isTagSelected = editTx.tags?.includes(tag.id);
              return (
                <span key={tag.id} onClick={() => {
                  const newTags = isTagSelected ? editTx.tags.filter(id => id !== tag.id) : [...(editTx.tags || []), tag.id];
                  setEditTx({ ...editTx, tags: newTags });
                }} style={{ padding: '2px 6px', borderRadius: '8px', fontSize: '0.65em', cursor: 'pointer', border: `1px solid ${tag.color}`, background: isTagSelected ? tag.color : 'transparent', color: isTagSelected ? 'white' : tag.color, fontWeight: '600' }}>
                  #{tag.name}
                </span>
              );
            })}
          </div>
        </td>
        <td>
          <select className="year-selector" value={editTx.installment_id || ''} onChange={e => setEditTx({ ...editTx, installment_id: e.target.value })} style={{ width: '100%' }}>
            <option value="">Nessun Finan.</option>
            {installments.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          <select 
            className="year-selector" 
            value={editTx.recurrence_type || 'monthly'} 
            onChange={e => setEditTx({ ...editTx, recurrence_type: e.target.value })} 
            style={{ width: '100%', marginTop: '5px', fontSize: '11px' }}
          >
            <option value="monthly">🔄 Mensile</option>
            <option value="extraordinary">⚡ Straord.</option>
            <option value="occasional">📅 Saltuaria</option>
            <option value="yearly">🗓️ Annuale</option>
            <option value="variable">📉 Variabile</option>
          </select>
        </td>
        <td style={{ textAlign: 'right' }}>
          <input type="number" step="0.01" className="text-input" value={editTx.amount} onChange={e => setEditTx({ ...editTx, amount: parseFloat(e.target.value) || '' })} style={{ width: '90px' }} />
        </td>
        <td style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
            <button onClick={onSaveEdit} className="action-btn-green"><Check size={16} /></button>
            <button onClick={onCancelEdit} className="action-btn-gray"><X size={16} /></button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={isSelected ? 'selected-row' : ''}>
      <td>
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={() => onToggleSelectOne(t.id)}
        />
      </td>
      <td style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', fontWeight: '500' }}>{t.id}</td>
      <td>{new Date(t.date).toLocaleDateString('it-IT')}</td>
      <td>{t.type === 'transfer' ? `${t.account_name || 'Investimento'} → ${t.to_account_name || 'Investimento'}` : t.account_name}</td>
      <td>{t.type === 'transfer' ? (t.category_name || 'Giroconto') : t.category_name}</td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {(!t.recurrence_type || t.recurrence_type === 'monthly') && <span title="Mensile" style={{ cursor: 'help', opacity: 0.5 }}>🔄</span>}
          {t.recurrence_type === 'extraordinary' && <span title="Straordinaria" style={{ cursor: 'help' }}>⚡</span>}
          {t.recurrence_type === 'occasional' && <span title="Saltuaria" style={{ cursor: 'help' }}>📅</span>}
          {t.recurrence_type === 'yearly' && <span title="Annuale" style={{ cursor: 'help' }}>🗓️</span>}
          {t.recurrence_type === 'variable' && <span title="Variabile" style={{ cursor: 'help' }}>📉</span>}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>{t.description || '-'}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
              {t.tags && t.tags.map(tag => (
                <span key={tag.id} title={tag.description} style={{ fontSize: '0.65em', padding: '1px 6px', borderRadius: '8px', border: `1px solid ${tag.color}`, color: tag.color, fontWeight: '600', cursor: 'help' }}>
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </td>
      <td>{t.installment_id ? installments.find(i => i.id === t.installment_id)?.name : '-'}</td>
      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
        <span className={t.type === 'income' ? 'value-positive' : t.type === 'expense' ? 'value-negative' : ''}>
          {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''} €{Number(t.amount).toFixed(2)}
        </span>
      </td>
      <td style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Copy size={16} className="edit-icon" style={{ color: 'var(--accent-blue)' }} onClick={() => onDuplicate(t)} title="Duplica transazione" />
          <Edit2 size={16} className="edit-icon" onClick={() => onStartEdit(t)} title="Modifica" />
          <Trash2 size={16} className="delete-icon" onClick={() => onDelete(t.id)} title="Elimina" />
        </div>
      </td>
    </tr>
  );
}
