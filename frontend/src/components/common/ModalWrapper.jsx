import { X } from 'lucide-react';

export default function ModalWrapper({ 
  title, 
  onClose, 
  children, 
  width = '400px', 
  maxWidth = '95vw',
  style = {} 
}) {
  // Gestione click sull'overlay per chiudere
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div 
        className="modal-content card" 
        style={{ 
          width, 
          maxWidth, 
          maxHeight: '90vh', 
          overflowY: 'auto', 
          position: 'relative',
          ...style 
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-card)',
          zIndex: 10,
          paddingBottom: '10px'
        }}>
          <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>
          <X 
            onClick={onClose} 
            style={{ cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s' }} 
            className="hover-opacity-full"
          />
        </div>
        
        {children}
      </div>
    </div>
  );
}
