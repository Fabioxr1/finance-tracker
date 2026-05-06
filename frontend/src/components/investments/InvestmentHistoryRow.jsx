import { X, Check, Edit2, Trash2 } from 'lucide-react';

export default function InvestmentHistoryRow({ 
  tx, 
  isEditing, 
  editTxData, 
  setEditTxData, 
  onSave, 
  onCancel, 
  onEdit, 
  onDelete, 
  selectedInv 
}) {
  
  const factor = (selectedInv?.type === 'BTP' || selectedInv?.type === 'Obbligazione') ? 100 : 1;

  if (isEditing) {
    return (
      <tr style={{ background: 'rgba(47, 129, 247, 0.08)', borderRadius: '8px' }}>
        <td style={{ padding: '12px' }}>
          <input 
            type="date" 
            value={editTxData.date} 
            onChange={e => setEditTxData(prev => ({...prev, date: e.target.value}))} 
            className="text-input" 
            style={{ padding: '6px', fontSize: '0.85rem' }} 
          />
        </td>
        <td style={{ padding: '12px' }}>
          <select 
            value={editTxData.type} 
            onChange={e => setEditTxData(prev => ({...prev, type: e.target.value}))} 
            className="year-selector" 
            style={{ padding: '6px', fontSize: '0.85rem', width: '100%' }}
          >
            <option value="buy">Acquisto</option>
            <option value="sell">Vendita</option>
          </select>
        </td>
        <td style={{ padding: '12px' }}>
          <input 
            type="number" 
            step="0.0001" 
            value={editTxData.shares} 
            onChange={e => {
              const shares = e.target.value;
              const total = (Number(shares) * Number(editTxData.price_per_share)) / factor;
              setEditTxData(prev => ({...prev, shares, total_amount: total > 0 ? total.toFixed(2) : ''}));
            }} 
            className="text-input" 
            style={{ width: '100%', fontSize: '0.85rem', textAlign: 'right' }} 
          />
        </td>
        <td style={{ padding: '12px' }}>
          <input 
            type="number" 
            step="0.0001" 
            value={editTxData.price_per_share} 
            onChange={e => {
              const price = e.target.value;
              const total = (Number(editTxData.shares) * Number(price)) / factor;
              setEditTxData(prev => ({...prev, price_per_share: price, total_amount: total > 0 ? total.toFixed(2) : ''}));
            }} 
            className="text-input" 
            style={{ width: '100%', fontSize: '0.85rem', textAlign: 'right' }} 
          />
        </td>
        <td style={{ padding: '12px' }}>
          <input 
            type="number" 
            step="0.01" 
            value={editTxData.total_amount} 
            onChange={e => {
              const total = e.target.value;
              const price = Number(editTxData.price_per_share);
              const shares = (price > 0 && total > 0) ? ((Number(total) * factor) / price).toFixed(4) : editTxData.shares;
              setEditTxData(prev => ({...prev, total_amount: total, shares}));
            }}
            className="text-input" 
            style={{ width: '100%', fontSize: '0.85rem', textAlign: 'right' }} 
          />
        </td>
        <td style={{ padding: '12px', textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button onClick={onSave} style={{ background: 'var(--accent-green)', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}>
              <Check size={16}/>
            </button>
            <button onClick={onCancel} style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}>
              <X size={16}/>
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr style={{ background: 'rgba(255, 255, 255, 0.02)', transition: 'all 0.2s', borderRadius: '8px' }}>
      <td style={{ padding: '12px', fontSize: '0.9rem' }}>{new Date(tx.date).toLocaleDateString('it-IT')}</td>
      <td style={{ padding: '12px' }}>
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '6px', 
          fontSize: '0.7rem', 
          fontWeight: '700', 
          textTransform: 'uppercase',
          background: tx.type === 'buy' ? 'rgba(63, 185, 80, 0.15)' : 'rgba(248, 81, 73, 0.15)',
          color: tx.type === 'buy' ? 'var(--accent-green)' : 'var(--accent-red)',
          border: `1px solid ${tx.type === 'buy' ? 'rgba(63, 185, 80, 0.2)' : 'rgba(248, 81, 73, 0.2)'}`
        }}>
          {tx.type === 'buy' ? 'Acquisto' : 'Vendita'}
        </span>
      </td>
      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500', fontSize: '0.9rem' }}>{Number(tx.shares).toFixed(4)}</td>
      <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>€{Number(tx.price_per_share).toFixed(2)}</td>
      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', fontSize: '0.9rem' }}>€{Number(tx.total_amount).toFixed(2)}</td>
      <td style={{ padding: '12px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          <Edit2 
            size={16} 
            onClick={() => onEdit(tx)} 
            style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
            className="hover-icon-blue" 
          />
          <Trash2 
            size={16} 
            onClick={() => onDelete(tx.id)} 
            style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
            className="hover-icon-red" 
          />
        </div>
      </td>
    </tr>
  );
}
