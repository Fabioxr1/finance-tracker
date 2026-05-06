import { X } from 'lucide-react';

export default function InstallmentForm({ 
  formData, 
  onChange, 
  onSubmit, 
  onCancel, 
  isEditing,
  accounts = [],
  availableTags = [],
  onToggleTag
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-content card" style={{ width: '550px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 className="card-title">{isEditing ? 'Modifica' : 'Nuovo'} Finanziamento</h3>
          <X onClick={onCancel} style={{ cursor: 'pointer' }} />
        </div>
        
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Nome Finanziamento</label>
              <input 
                type="text" 
                className="text-input" 
                value={formData.name} 
                onChange={(e) => onChange({...formData, name: e.target.value})} 
                placeholder="es. Mutuo Casa" 
                required 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Rate già Pagate</label>
              <input 
                type="number" 
                className="text-input" 
                value={formData.paid_installments} 
                onChange={(e) => onChange({...formData, paid_installments: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Descrizione / Istituto</label>
            <input 
              type="text" 
              className="text-input" 
              value={formData.description} 
              onChange={(e) => onChange({...formData, description: e.target.value})} 
              placeholder="es. Intesa Sanpaolo, Findomestic" 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Importo Totale (€)</label>
              <input 
                type="number" 
                step="0.01" 
                className="text-input" 
                value={formData.total_amount} 
                onChange={(e) => onChange({...formData, total_amount: e.target.value})} 
                required 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Rata Mensile (€)</label>
              <input 
                type="number" 
                step="0.01" 
                className="text-input" 
                value={formData.monthly_amount} 
                onChange={(e) => onChange({...formData, monthly_amount: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Data Inizio</label>
              <input 
                type="date" 
                className="text-input" 
                value={formData.start_date} 
                onChange={(e) => onChange({...formData, start_date: e.target.value})} 
                required 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Data Fine</label>
              <input 
                type="date" 
                className="text-input" 
                value={formData.end_date} 
                onChange={(e) => onChange({...formData, end_date: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Conto di Addebito</label>
              <select 
                className="text-input" 
                value={formData.account_id} 
                onChange={(e) => onChange({...formData, account_id: e.target.value})}
                required
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Parola Chiave Ricerca</label>
              <input 
                type="text" 
                className="text-input" 
                value={formData.search_keyword} 
                onChange={(e) => onChange({...formData, search_keyword: e.target.value})} 
                placeholder="es. MUTUO" 
              />
            </div>
          </div>

          {/* Selezione TAG PREDEFINITI */}
          <div style={{ marginTop: '10px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
              Tag Predefiniti (verranno applicati a ogni rata):
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableTags.map(tag => {
                const isSelected = formData.tags?.includes(tag.id);
                return (
                  <span 
                    key={tag.id}
                    onClick={() => onToggleTag(tag.id)}
                    title={tag.description}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '15px',
                      fontSize: '0.75em',
                      cursor: 'pointer',
                      border: `1px solid ${tag.color}`,
                      background: isSelected ? tag.color : 'transparent',
                      color: isSelected ? 'white' : tag.color,
                      transition: 'all 0.2s',
                      fontWeight: '600',
                      opacity: isSelected ? 1 : 0.6
                    }}
                  >
                    #{tag.name}
                  </span>
                );
              })}
              {availableTags.length === 0 && (
                <span style={{ fontSize: '0.8em', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  Nessun tag disponibile.
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="year-selector" style={{ flex: 1, background: 'var(--accent-blue)', color: 'white' }}>
              {isEditing ? 'Aggiorna' : 'Crea'} Finanziamento
            </button>
            <button type="button" className="year-selector" style={{ flex: 1 }} onClick={onCancel}>Annulla</button>
          </div>
        </form>
      </div>
    </div>
  );
}
