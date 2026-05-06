export default function InstallmentAmountFields({ formData, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Importo Totale (€)</label>
        <input 
          type="number" 
          step="0.01" 
          className="text-input" 
          value={formData.total_amount || ''} 
          onChange={(e) => onChange(prev => ({...prev, total_amount: e.target.value}))} 
          required 
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Rata Mensile (€)</label>
        <input 
          type="number" 
          step="0.01" 
          className="text-input" 
          value={formData.monthly_amount || ''} 
          onChange={(e) => onChange(prev => ({...prev, monthly_amount: e.target.value}))} 
          required 
        />
      </div>
    </div>
  );
}
