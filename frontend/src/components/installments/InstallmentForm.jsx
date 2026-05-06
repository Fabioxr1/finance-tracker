import { X } from 'lucide-react';
import InstallmentBasicFields from './InstallmentBasicFields';
import InstallmentAmountFields from './InstallmentAmountFields';
import InstallmentDateFields from './InstallmentDateFields';
import InstallmentConfigFields from './InstallmentConfigFields';
import InstallmentTagSelector from './InstallmentTagSelector';

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
  const commonProps = { formData, onChange };

  return (
    <div className="modal-overlay">
      <div className="modal-content card" style={{ width: '550px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 className="card-title">{isEditing ? 'Modifica' : 'Nuovo'} Finanziamento</h3>
          <X onClick={onCancel} style={{ cursor: 'pointer' }} />
        </div>
        
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <InstallmentBasicFields {...commonProps} />
          
          <InstallmentAmountFields {...commonProps} />
          
          <InstallmentDateFields {...commonProps} />
          
          <InstallmentConfigFields {...commonProps} accounts={accounts} />
          
          <InstallmentTagSelector 
            formData={formData} 
            availableTags={availableTags} 
            onToggleTag={onToggleTag} 
          />

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
