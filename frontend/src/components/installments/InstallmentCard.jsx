import { Wallet, AlertCircle, CheckCircle, Edit2, Trash2 } from 'lucide-react';

export default function InstallmentCard({ inst, onPay, onEdit, onDelete, monthsLabels, currentMonth }) {
  const progress = (inst.paid_installments / inst.dynamicTotalInstallments) * 100;

  return (
    <div className="asset-card" style={{ 
      padding: '25px',
      borderRadius: '16px',
      background: 'var(--bg-hover)',
      border: inst.needsPayment ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
      boxShadow: inst.needsPayment ? '0 0 15px rgba(47, 129, 247, 0.2)' : 'none'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.3em', fontWeight: '600' }}>{inst.name}</h4>
          {inst.description && (
            <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {inst.description}
            </div>
          )}
          <div style={{ fontSize: '0.95em', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <Wallet size={14} /> {inst.account_name}
          </div>
          {inst.tags_full && inst.tags_full.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
              {inst.tags_full.map(tag => (
                <span 
                  key={tag.id} 
                  style={{ 
                    fontSize: '0.7em', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    border: `1px solid ${tag.color}`, 
                    color: tag.color,
                    background: `${tag.color}11`,
                    fontWeight: '600'
                  }}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.2em', color: 'var(--text-primary)' }}>€{Number(inst.monthly_amount).toFixed(2)} <span style={{fontSize: '0.7em', opacity: 0.6}}>/ mese</span></div>
          <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginTop: '4px' }}>Rata {inst.paid_installments} di {inst.dynamicTotalInstallments}</div>
          <div style={{ fontSize: '0.8em', color: 'var(--accent-blue)', fontWeight: '600', marginTop: '2px' }}>
            Fine stimata: {new Date(inst.estimatedEndDate).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden', marginBottom: '8px' }}>
          <div style={{ 
            width: `${Math.min(100, progress)}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, var(--accent-blue), #4ecdc4)',
            boxShadow: '0 0 10px rgba(47, 129, 247, 0.5)',
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Residuo: <strong style={{color: 'var(--text-primary)'}}>€{Number(inst.remainingAmount).toLocaleString('it-IT')}</strong></span>
          <span style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* MONTHS TRACKER */}
      <div style={{ marginBottom: '20px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px' }}>
        <div style={{ fontSize: '0.75em', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Cronologia Pagamenti {new Date().getFullYear()}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {monthsLabels.map((m, i) => {
            const monthNum = i + 1;
            const isPaid = inst.monthsPaid.includes(monthNum);
            const isFuture = monthNum > currentMonth;
            const isMissing = !isPaid && !isFuture;

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  background: isPaid ? 'var(--accent-green)' : isMissing ? 'var(--accent-red)' : 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7em',
                  color: isPaid || isMissing ? 'white' : 'var(--text-secondary)',
                  opacity: isFuture ? 0.3 : 1,
                  boxShadow: isPaid ? '0 0 8px rgba(46, 204, 113, 0.4)' : 'none'
                }}>
                  {isPaid ? '✓' : ''}
                </div>
                <span style={{ fontSize: '0.65em', color: 'var(--text-secondary)' }}>{m}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        {inst.needsPayment ? (
          <button className="year-selector" onClick={() => onPay(inst)} style={{ 
            flex: 1, 
            background: 'var(--accent-blue)', 
            color: 'white', 
            border: 'none', 
            padding: '12px',
            borderRadius: '10px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            <AlertCircle size={18} /> Paga Rata Mese
          </button>
        ) : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '10px', 
            color: 'var(--accent-green)', 
            fontSize: '1em', 
            fontWeight: '600',
            background: 'rgba(46, 204, 113, 0.1)',
            borderRadius: '10px',
            padding: '12px'
          }}>
            <CheckCircle size={18} /> Rata pagata
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="year-selector" onClick={() => onEdit(inst)} style={{ 
            padding: '12px', 
            background: 'rgba(255,255,255,0.05)', 
            color: 'var(--text-secondary)', 
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer'
          }}>
            <Edit2 size={18} />
          </button>
          <button className="year-selector" onClick={() => onDelete(inst.id)} style={{ 
            padding: '12px', 
            background: 'rgba(255, 107, 107, 0.1)', 
            color: 'var(--accent-red)', 
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer'
          }}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
