export default function InstallmentConfigFields({ formData, onChange, accounts = [] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Conto di Addebito</label>
        <select 
          className="text-input" 
          value={formData.account_id || ''} 
          onChange={(e) => onChange(prev => ({...prev, account_id: e.target.value}))}
          required
        >
          <option value="">Seleziona un conto</option>
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
          value={formData.search_keyword || ''} 
          onChange={(e) => onChange(prev => ({...prev, search_keyword: e.target.value}))} 
          placeholder="es. MUTUO" 
        />
      </div>
    </div>
  );
}
