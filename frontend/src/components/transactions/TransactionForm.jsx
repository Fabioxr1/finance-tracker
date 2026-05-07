import { Plus, Calendar, Euro, FileText, RefreshCw, Landmark } from 'lucide-react';
import FormInput from '../common/FormInput';
import FormSelect from '../common/FormSelect';
import AppButton from '../common/AppButton';

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
        <FormSelect 
          value={newTx.type} 
          onChange={val => onTypeChange({ target: { value: val } })}
          options={[
            { value: 'expense', label: 'Uscita' },
            { value: 'income', label: 'Entrata' },
            { value: 'transfer', label: 'Giroconto' }
          ]}
          style={{ width: '120px' }}
        />

        <FormInput 
          type="date" 
          value={newTx.date}
          onChange={val => setNewTx({ ...newTx, date: val })}
          required
          style={{ width: '160px' }}
        />

        <FormInput 
          type="number" 
          step="0.01"
          placeholder="Importo €" 
          icon={Euro}
          value={newTx.amount}
          onChange={val => setNewTx({ ...newTx, amount: parseFloat(val) || '' })}
          required
          style={{ width: '130px' }}
        />

        {newTx.type === 'transfer' ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <FormSelect 
              value={newTx.account_id || ''} 
              onChange={val => setNewTx({ ...newTx, account_id: val })}
              placeholder="Nessuno (Vendita)"
              options={accounts.map(a => ({ value: a.id, label: a.name }))}
              style={{ width: '160px' }}
            />
            <span style={{color: 'var(--text-secondary)'}}>→</span>
            <FormSelect 
              value={newTx.to_account_id || ''} 
              onChange={val => setNewTx({ ...newTx, to_account_id: val })}
              placeholder="Nessuno (Acquisto)"
              options={accounts.filter(a => a.id !== parseInt(newTx.account_id)).map(a => ({ value: a.id, label: a.name }))}
              style={{ width: '160px' }}
            />
            <FormSelect 
              value={newTx.category_id || ''} 
              onChange={val => setNewTx({ ...newTx, category_id: val })}
              placeholder="Giroconto Standard"
              options={categories.filter(c => c.name === 'Investimenti').map(c => ({ value: c.id, label: 'Investimento' }))}
              style={{ width: '160px', borderColor: isInv ? 'var(--accent-green)' : undefined }}
            />
          </div>
        ) : (
          <>
            <FormSelect 
              value={newTx.account_id} 
              onChange={val => setNewTx({ ...newTx, account_id: val })}
              placeholder="Seleziona Conto"
              options={accounts.map(a => ({ value: a.id, label: a.name }))}
              required
              style={{ width: '160px' }}
            />
            <FormSelect 
              value={newTx.category_id} 
              onChange={val => setNewTx({ ...newTx, category_id: val })}
              placeholder="Categoria"
              options={categories.filter(c => c.type === newTx.type).map(c => ({ value: c.id, label: c.name }))}
              required
              style={{ width: '160px' }}
            />
          </>
        )}

        <FormInput 
          placeholder="Descrizione (es. Spesa Coop)" 
          icon={FileText}
          value={newTx.description}
          onChange={val => setNewTx({ ...newTx, description: val })}
          containerStyle={{ flex: 1, minWidth: '200px' }}
        />

        <FormSelect 
          value={newTx.recurrence_type || 'monthly'} 
          onChange={val => setNewTx({ ...newTx, recurrence_type: val })}
          options={[
            { value: 'monthly', label: '🔄 Mensile' },
            { value: 'extraordinary', label: '⚡ Straord.' },
            { value: 'occasional', label: '📅 Saltuaria' },
            { value: 'yearly', label: '🗓️ Annuale' },
            { value: 'variable', label: '📉 Variabile' }
          ]}
          style={{ width: '140px', borderColor: newTx.recurrence_type === 'extraordinary' ? 'var(--accent-red)' : undefined }}
        />

        <FormSelect 
          value={newTx.installment_id} 
          onChange={val => setNewTx({ ...newTx, installment_id: val })}
          placeholder="Nessun Finan."
          options={installments.map(i => ({ value: i.id, label: i.name }))}
          style={{ width: '150px' }}
        />

        <AppButton type="submit" icon={Plus}>Registra</AppButton>

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
