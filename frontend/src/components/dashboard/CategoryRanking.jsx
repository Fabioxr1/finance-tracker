import DashboardGrid from '../common/DashboardGrid';

export default function CategoryRanking({ incomeData, expenseData, totalIncome, totalExpense, year }) {
  return (
    <DashboardGrid style={{ marginTop: '30px' }}>
      {/* Entrate per Categoria */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '5px' }}>Analisi Entrate per Tipologia ({year})</h3>
        <div style={{ marginBottom: '15px', fontSize: '1.2em', fontWeight: 'bold', color: 'var(--accent-green)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Totale: € {totalIncome.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {incomeData.length > 0 ? incomeData.map((cat, idx) => {
            const percentage = totalIncome > 0 ? ((cat.total / totalIncome) * 100).toFixed(1) : 0;
            return (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '5px', fontSize: '0.85em' }}>
                  <span style={{ flex: '1', minWidth: '120px' }}>{cat.name}</span>
                  <span className="value-positive" style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>
                    € {cat.total.toLocaleString('it-IT', { minimumFractionDigits: 2 })} ({percentage}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#3fb950' }}></div>
                </div>
              </div>
            );
          }) : <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Nessun dato disponibile</p>}
        </div>
      </div>

      {/* Spese per Categoria (Ranking) */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '5px' }}>Dove spendi di più ({year})</h3>
        <div style={{ marginBottom: '15px', fontSize: '1.2em', fontWeight: 'bold', color: 'var(--accent-red)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Totale: € {totalExpense.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {expenseData.length > 0 ? expenseData.map((cat, idx) => {
            const percentage = totalExpense > 0 ? ((cat.total / totalExpense) * 100).toFixed(1) : 0;
            return (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '5px', fontSize: '0.85em' }}>
                  <span style={{ flex: '1', minWidth: '120px' }}>{cat.name}</span>
                  <span className="value-negative" style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>
                    € {cat.total.toLocaleString('it-IT', { minimumFractionDigits: 2 })} ({percentage}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#f85149' }}></div>
                </div>
              </div>
            );
          }) : <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Nessun dato disponibile</p>}
        </div>
      </div>
    </DashboardGrid>
  );
}
