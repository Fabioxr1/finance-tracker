import { X } from 'lucide-react';

export default function InstallmentPayModal({ 
  selectedInst, 
  paymentData, 
  categories, 
  onPayment, 
  onClose,
  setPaymentData
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-content card" style={{ maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 className="card-title">Registra Pagamento Rata</h3>
          <X onClick={onClose} style={{ cursor: 'pointer' }} />
        </div>
        
        <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Stai registrando la rata per: <strong>{selectedInst?.name}</strong>
        </p>
        
        <form onSubmit={onPayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>Importo effettivo pagato (€)</label>
            <input 
              type="number" 
              step="0.01" 
              className="text-input" 
              style={{ width: '100%' }} 
              value={paymentData.amount} 
              onChange={e => setPaymentData({...paymentData, amount: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>Categoria Spesa</label>
            <select 
              className="year-selector" 
              style={{ width: '100%' }} 
              value={paymentData.category_id} 
              onChange={e => setPaymentData({...paymentData, category_id: e.target.value})} 
              required
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>Data Addebito</label>
            <input 
              type="date" 
              className="text-input" 
              style={{ width: '100%' }} 
              value={paymentData.date} 
              onChange={e => setPaymentData({...paymentData, date: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>Descrizione</label>
            <input 
              type="text" 
              placeholder="Descrizione transazione" 
              className="text-input" 
              style={{ width: '100%' }}
              value={paymentData.description} 
              onChange={e => setPaymentData({...paymentData, description: e.target.value})} 
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="year-selector" style={{ background: 'var(--accent-blue)', color: 'white', border: 'none', flex: 1 }}>
              Conferma Pagamento
            </button>
            <button type="button" className="year-selector" onClick={onClose} style={{ flex: 1 }}>Annulla</button>
          </div>
        </form>
      </div>
    </div>
  );
}
