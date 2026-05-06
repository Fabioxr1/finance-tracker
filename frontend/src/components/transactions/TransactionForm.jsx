import { Plus } from 'lucide-react';

export default function TransactionForm({ 
  newTx, 
  setNewTx, 
  accounts, 
  categories, 
  installments, 
  onTypeChange, 
  onSubmit,
  availableTags = []
}) {
  const isInv = categories.find(c => c.id === parseInt(newTx.category_id))?.name === 'Investimenti';

  const toggleTag = (tagId) => {
    const isSelected = newTx.tags.includes(tagId);
    const updatedTags = isSelected 
      ? newTx.tags.filter(id => id !== tagId) 
      : [...newTx.tags, tagId];
    setNewTx({ ...newTx, tags: updatedTags });
  };

  return (
    <div className="card" style={{ marginBottom: '30px' }}>
      <h3 className="card-title">Aggiungi nuova transazione</h3>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: '15px', marginTop: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select className="year-selector" value={newTx.type} onChange={e => onTypeChange(e)}>
          <option value="expense">Uscita</option>
          <option value="income">Entrata</option>
          <option value="transfer">Giroconto</option>
        </select>

        <input 
          type="date" 
          className="text-input"
          value={newTx.date}
          onChange={e => setNewTx({ ...newTx, date: e.target.value })}
          required
        />

        <input 
          type="number" 
          step="0.01"
          placeholder="Importo €" 
          className="text-input"
          style={{ width: '120px' }}
          value={newTx.amount}
          onChange={e => setNewTx({ ...newTx, amount: parseFloat(e.target.value) || '' })}
          required
        />

        {newTx.type === 'transfer' ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select className="year-selector" value={newTx.account_id || ''} onChange={e => setNewTx({ ...newTx, account_id: e.target.value })}>
              <option value="">Nessuno (Vendita)</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <span style={{color: 'var(--text-secondary)'}}>→</span>
            <select className="year-selector" value={newTx.to_account_id || ''} onChange={e => setNewTx({ ...newTx, to_account_id: e.target.value })}>
              <option value="">Nessuno (Acquisto)</option>
              {accounts.filter(a => a.id !== parseInt(newTx.account_id)).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select className="year-selector" value={newTx.category_id || ''} onChange={e => setNewTx({ ...newTx, category_id: e.target.value })} style={{ border: isInv ? '1px solid var(--accent-green)' : '1px solid var(--border-color)' }}>
               <option value="">Giroconto Standard</option>
               {categories.filter(c => c.name === 'Investimenti').map(c => (
                 <option key={c.id} value={c.id}>Investimento</option>
               ))}
            </select>
          </div>
        ) : (
          <>
            <select className="year-selector" value={newTx.account_id} onChange={e => setNewTx({ ...newTx, account_id: e.target.value })} required>
              <option value="" disabled>Seleziona Conto</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select className="year-selector" value={newTx.category_id} onChange={e => setNewTx({ ...newTx, category_id: e.target.value })} required>
              <option value="" disabled>Categoria</option>
              {categories.filter(c => c.type === newTx.type).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </>
        )}

        <input 
          type="text" 
          placeholder="Descrizione (es. Spesa Coop)" 
          className="text-input"
          style={{ flex: 1, minWidth: '200px' }}
          value={newTx.description}
          onChange={e => setNewTx({ ...newTx, description: e.target.value })}
        />

        <select 
          className="year-selector" 
          value={newTx.recurrence_type || 'monthly'} 
          onChange={e => setNewTx({ ...newTx, recurrence_type: e.target.value })} 
          style={{ width: '130px', border: newTx.recurrence_type === 'extraordinary' ? '1px solid var(--accent-red)' : '1px solid var(--border-color)' }}
        >
          <option value="monthly">🔄 Mensile</option>
          <option value="extraordinary">⚡ Straord.</option>
          <option value="occasional">📅 Saltuaria</option>
          <option value="yearly">🗓️ Annuale</option>
          <option value="variable">📉 Variabile</option>
        </select>

        <select className="year-selector" value={newTx.installment_id} onChange={e => setNewTx({ ...newTx, installment_id: e.target.value })} style={{ width: '150px' }}>
          <option value="">Nessun Finan.</option>
          {installments.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>

        <button type="submit" className="year-selector" style={{ background: 'var(--accent-blue)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <Plus size={18} /> Registra
        </button>

        {/* Selezione TAG */}
        {availableTags.length > 0 && (
          <div style={{ width: '100%', display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Associa Tag:</span>
            {availableTags.map(tag => {
              const isSelected = newTx.tags?.includes(tag.id);
              return (
                <span 
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  title={tag.description}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75em',
                    cursor: 'pointer',
                    border: `1px solid ${tag.color}`,
                    background: isSelected ? tag.color : 'transparent',
                    color: isSelected ? 'white' : tag.color,
                    transition: 'all 0.2s',
                    fontWeight: '600'
                  }}
                >
                  #{tag.name}
                </span>
              );
            })}
          </div>
        )}
      </form>
    </div>
  );
}
