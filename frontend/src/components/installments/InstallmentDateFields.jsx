export default function InstallmentDateFields({ formData, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Data Inizio</label>
        <input 
          type="date" 
          className="text-input" 
          value={formData.start_date || ''} 
          onChange={(e) => onChange(prev => ({...prev, start_date: e.target.value}))} 
          required 
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Data Fine</label>
        <input 
          type="date" 
          className="text-input" 
          value={formData.end_date || ''} 
          onChange={(e) => onChange(prev => ({...prev, end_date: e.target.value}))} 
          required 
        />
      </div>
    </div>
  );
}
