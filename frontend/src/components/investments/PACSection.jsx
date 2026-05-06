import { Repeat, Plus, Check, Trash2 } from 'lucide-react';

export default function PACSection({ plans, onExecute, onDelete }) {
  if (plans.length === 0) return null;

  return (
    <div className="card" style={{ marginBottom: '30px', padding: '20px' }}>
      <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Repeat size={20} color="#8957e5" /> PAC Attivi
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
        {plans.map(plan => (
          <div key={plan.id} className="asset-card" style={{ 
            padding: '15px', 
            background: 'var(--bg-hover)', 
            border: plan.needsExecution ? '1px solid #8957e5' : '1px solid var(--border-color)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{plan.name}</div>
                <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>{plan.investment_name}</div>
              </div>
              <div style={{ fontWeight: 'bold' }}>€{Number(plan.amount).toFixed(2)}</div>
            </div>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              {plan.needsExecution ? (
                <button 
                  className="year-selector" 
                  onClick={() => onExecute(plan)} 
                  style={{ flex: 1, background: '#8957e5', color: 'white', border: 'none', padding: '8px' }}
                >
                  <Plus size={16} /> Versa
                </button>
              ) : (
                <div style={{ 
                  flex: 1, 
                  color: 'var(--accent-green)', 
                  textAlign: 'center', 
                  padding: '8px', 
                  background: 'rgba(46, 204, 113, 0.1)', 
                  borderRadius: '6px' 
                }}>
                  <Check size={16} /> Eseguito
                </div>
              )}
              <button 
                onClick={() => onDelete(plan.id)} 
                style={{ padding: '8px', color: 'var(--accent-red)', background: 'none', border: 'none' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
