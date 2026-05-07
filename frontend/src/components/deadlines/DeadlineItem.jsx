import { Calendar, AlertCircle, CheckCircle, Trash2, Clock, RotateCcw, Edit2 } from 'lucide-react';
import ActionCard from '../common/ActionCard';

export default function DeadlineItem({ deadline, onUpdateStatus, onDelete, onEdit }) {
  const isPaid = deadline.status === 'paid';
  const isOverdue = !isPaid && new Date(deadline.due_date) < new Date();
  const isUpcoming = !isPaid && !isOverdue && new Date(deadline.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Colore basato sullo stato
  const accentColor = isPaid 
    ? 'var(--accent-green)' 
    : isOverdue 
      ? 'var(--error-color)' 
      : isUpcoming 
        ? 'var(--warning-color)' 
        : 'var(--accent-blue)';

  // Icona basata sullo stato
  const Icon = isPaid ? CheckCircle : isOverdue ? AlertCircle : Clock;

  return (
    <ActionCard
      title={deadline.title}
      subtitle={
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          {deadline.category_name && <span className="tx-card-category">{deadline.category_name}</span>}
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85em', color: 'var(--text-secondary)' }}>
            <Calendar size={12} /> {new Date(deadline.due_date).toLocaleDateString('it-IT')}
          </span>
        </div>
      }
      icon={Icon}
      accentColor={accentColor}
      accentSide="left"
      isActive={!isPaid}
      amount={deadline.amount ? `€ ${Number(deadline.amount).toFixed(2)}` : undefined}
      amountStyle={{ textDecoration: isPaid ? 'line-through' : 'none', opacity: isPaid ? 0.6 : 1 }}
      actions={
        <>
          <div style={{ display: 'flex', gap: '10px' }}>
            {deadline.status === 'pending' ? (
              <button 
                onClick={() => onUpdateStatus(deadline.id, 'paid')}
                title="Segna come pagato"
                style={{ 
                  borderRadius: '20px', 
                  padding: '6px 14px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '0.75rem', 
                  fontWeight: '700',
                  background: 'rgba(63, 185, 80, 0.1)',
                  color: 'var(--accent-green)',
                  border: '1px solid rgba(63, 185, 80, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-green)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(63, 185, 80, 0.1)'; e.currentTarget.style.color = 'var(--accent-green)'; }}
              >
                <CheckCircle size={14} /> PAGA
              </button>
            ) : (
              <button 
                onClick={() => onUpdateStatus(deadline.id, 'pending')}
                title="Ripristina come da pagare"
                style={{ 
                  borderRadius: '20px', 
                  padding: '6px 14px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} /> RIPRISTINA
              </button>
            )}
            
            <button 
              onClick={() => onEdit(deadline)}
              title="Modifica"
              style={{ 
                padding: '8px', 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <Edit2 size={16} />
            </button>
          </div>

          <button 
            onClick={() => onDelete(deadline.id)}
            title="Elimina"
            style={{ 
              padding: '8px', 
              borderRadius: '50%', 
              background: 'rgba(248, 81, 73, 0.05)', 
              border: '1px solid rgba(248, 81, 73, 0.1)',
              color: 'var(--accent-red)',
              cursor: 'pointer',
              display: 'flex'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-red)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248, 81, 73, 0.05)'; e.currentTarget.style.color = 'var(--accent-red)'; }}
          >
            <Trash2 size={16} />
          </button>
        </>
      }
    >
      {deadline.description && (
        <p style={{ fontSize: '0.85em', color: 'var(--text-secondary)', margin: '10px 0 0 0', fontStyle: 'italic' }}>
          {deadline.description}
        </p>
      )}
    </ActionCard>
  );
}
