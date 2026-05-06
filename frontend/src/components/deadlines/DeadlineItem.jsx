import { Calendar, AlertCircle, CheckCircle, Trash2, Clock, RotateCcw, Edit2 } from 'lucide-react';

export default function DeadlineItem({ deadline, onUpdateStatus, onDelete, onEdit }) {
  const isOverdue = new Date(deadline.due_date) < new Date() && deadline.status === 'pending';
  const isUpcoming = !isOverdue && new Date(deadline.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className={`card deadline-item ${deadline.status} ${isOverdue ? 'overdue' : ''}`} style={{ 
      borderLeft: deadline.status === 'paid' ? '4px solid var(--accent-green)' : isOverdue ? '4px solid var(--error-color)' : isUpcoming ? '4px solid var(--warning-color)' : '4px solid var(--border-color)',
      marginBottom: '10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="deadline-icon" style={{ 
            padding: '10px', 
            borderRadius: '10px', 
            background: deadline.status === 'paid' ? 'rgba(63, 185, 80, 0.1)' : isOverdue ? 'rgba(248, 81, 73, 0.1)' : 'rgba(47, 129, 247, 0.1)',
            color: deadline.status === 'paid' ? 'var(--accent-green)' : isOverdue ? 'var(--error-color)' : 'var(--accent-blue)'
          }}>
            {deadline.status === 'paid' ? <CheckCircle size={20} /> : isOverdue ? <AlertCircle size={20} /> : <Clock size={20} />}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1em', textDecoration: deadline.status === 'paid' ? 'line-through' : 'none' }}>{deadline.title}</h4>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px', fontSize: '0.85em', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> {new Date(deadline.due_date).toLocaleDateString('it-IT')}
              </span>
              {deadline.amount && <span>€ {Number(deadline.amount).toFixed(2)}</span>}
              {deadline.category_name && <span className="tx-card-category">{deadline.category_name}</span>}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {deadline.status === 'pending' ? (
            <button 
              onClick={() => onUpdateStatus(deadline.id, 'paid')}
              className="action-btn-green"
              title="Segna come pagato"
            >
              <CheckCircle size={16} />
            </button>
          ) : (
            <button 
              onClick={() => onUpdateStatus(deadline.id, 'pending')}
              className="action-btn-gray"
              title="Ripristina come da pagare"
            >
              <RotateCcw size={16} />
            </button>
          )}
          
          <button 
            onClick={() => onEdit(deadline)}
            className="action-btn-gray"
            title="Modifica"
          >
            <Edit2 size={16} />
          </button>

          <button 
            onClick={() => onDelete(deadline.id)}
            className="action-btn-gray"
            style={{ color: 'var(--error-color)' }}
            title="Elimina"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
