export default function MonthlyTable({ data, year }) {
  return (
    <div className="card" style={{ marginTop: '30px', padding: '0', overflow: 'hidden' }}>
      <h3 className="card-title" style={{ padding: '20px' }}>Riepilogo Mensile {year}</h3>
      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
              <th style={{ padding: '12px 10px' }}>Mese</th>
              <th style={{ padding: '12px 10px' }}>Entrate</th>
              <th style={{ padding: '12px 10px' }}>Uscite</th>
              <th style={{ padding: '12px 10px' }}>Risparmio</th>
              <th style={{ padding: '12px 10px', textAlign: 'right' }}>% Margine</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m, i) => {
              const diff = m.entrate - m.uscite;
              const perc = m.entrate > 0 ? ((diff / m.entrate) * 100).toFixed(1) : '0.0';
              
              const isFuture = i > new Date().getMonth() && Number(year) >= new Date().getFullYear();
              if (m.entrate === 0 && m.uscite === 0 && isFuture) return null;

              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{m.name}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }} className="value-positive">€ {m.entrate.toFixed(2)}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }} className="value-negative">€ {m.uscite.toFixed(2)}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }} className={diff >= 0 ? 'value-positive' : 'value-negative'}>
                    € {diff.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.8em',
                      backgroundColor: diff >= 0 ? 'rgba(63, 185, 80, 0.15)' : 'rgba(248, 81, 73, 0.15)',
                      color: diff >= 0 ? '#3fb950' : '#f85149'
                    }}>
                      {perc}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
