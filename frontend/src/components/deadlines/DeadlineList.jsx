import DeadlineItem from './DeadlineItem';
import DashboardGrid from '../common/DashboardGrid';

export default function DeadlineList({ deadlines, onUpdateStatus, onDelete, onEdit }) {
  if (deadlines.length === 0) {
    return (
      <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <h3 style={{ opacity: 0.5 }}>Nessuna scadenza trovata per i filtri selezionati.</h3>
      </div>
    );
  }

  // Raggruppamento per anno
  const groupedByYear = deadlines.reduce((acc, d) => {
    const year = new Date(d.due_date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(d);
    return acc;
  }, {});

  // Ordinamento anni crescente
  const years = Object.keys(groupedByYear).sort((a, b) => a - b);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {years.map(year => (
        <div key={year} className="year-section" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px', 
            marginBottom: '20px',
            paddingBottom: '10px',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '1.8rem', 
              fontWeight: '800', 
              color: 'var(--accent-blue)',
              letterSpacing: '-1px'
            }}>
              Scadenze {year}
            </h2>
            <div style={{ 
              background: 'rgba(255,255,255,0.05)', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '0.8rem', 
              color: 'var(--text-secondary)',
              fontWeight: '600'
            }}>
              {groupedByYear[year].length} {groupedByYear[year].length === 1 ? 'scadenza' : 'scadenze'}
            </div>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--border-color) 0%, transparent 100%)' }}></div>
          </div>

          <DashboardGrid>
            {groupedByYear[year]
              .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
              .map(d => (
                <DeadlineItem 
                  key={d.id} 
                  deadline={d} 
                  onUpdateStatus={onUpdateStatus} 
                  onDelete={onDelete} 
                  onEdit={onEdit} 
                />
              ))
            }
          </DashboardGrid>
        </div>
      ))}
    </div>
  );
}
