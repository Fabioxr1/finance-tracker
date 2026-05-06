export default function InstallmentBasicFields({ formData, onChange }) {
  return (
    <>
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
    </>
  );
}
