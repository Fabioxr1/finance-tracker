import DeadlineItem from './DeadlineItem';

export default function DeadlineList({ deadlines, onUpdateStatus, onDelete, onEdit }) {
  if (deadlines.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Nessuna scadenza in programma. Ottimo lavoro!
      </div>
    );
  }

  const pending = deadlines.filter(d => d.status === 'pending');
  const paid = deadlines.filter(d => d.status === 'paid');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {pending.length > 0 && (
        <div>
          <h3 className="card-title" style={{ marginBottom: '15px', color: 'var(--accent-blue)' }}>Da Pagare</h3>
          {pending.map(d => (
            <DeadlineItem key={d.id} deadline={d} onUpdateStatus={onUpdateStatus} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </div>
      )}

      {paid.length > 0 && (
        <div style={{ opacity: 0.7 }}>
          <h3 className="card-title" style={{ marginBottom: '15px' }}>Completate</h3>
          {paid.map(d => (
            <DeadlineItem key={d.id} deadline={d} onUpdateStatus={onUpdateStatus} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
