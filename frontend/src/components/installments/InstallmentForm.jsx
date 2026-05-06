import { X } from 'lucide-react';
import ModalWrapper from '../common/ModalWrapper';
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
    <ModalWrapper 
      title={`${isEditing ? 'Modifica' : 'Nuovo'} Finanziamento`} 
      onClose={onCancel}
      width="550px"
    >
        
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
    </ModalWrapper>
  );
}
