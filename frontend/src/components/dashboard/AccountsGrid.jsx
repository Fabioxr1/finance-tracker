import DashboardGrid from '../common/DashboardGrid';

export default function AccountsGrid({ accounts }) {
  if (!accounts || accounts.length === 0) return null;

  return (
    <>
      <h3 className="chart-title" style={{ marginBottom: '15px' }}>Situazione Liquidità per Conto</h3>
      <DashboardGrid minWidth="280px">
        {accounts.map((acc, idx) => (
          <div key={idx} className="card account-card" style={{ padding: '15px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1em', color: 'var(--accent-blue)' }}>{acc.name}</span>
              <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>€ {(acc.balance || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Sezione Entrate/Uscite Dirette */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em', marginBottom: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>Entrate Dirette</span>
                <span className="value-positive" style={{ fontWeight: 'bold' }}>+€ {(acc.in || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>Uscite Dirette</span>
                <span className="value-negative" style={{ fontWeight: 'bold' }}>-€ {(acc.out || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Sezione Giroconti (Trasferimenti) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75em', padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Giroconti (In)</span>
                <span style={{ color: 'var(--accent-blue)', fontWeight: '600' }}>+€ {(acc.transIn || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Giroconti (Out)</span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>-€ {(acc.transOut || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Progress Bar Entrate/Uscite Dirette */}
            <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-hover)', borderRadius: '2px', marginTop: '12px', overflow: 'hidden', display: 'flex' }}>
              {(acc.in || 0) + (acc.out || 0) > 0 && (
                <>
                  <div style={{ width: `${((acc.in || 0) / ((acc.in || 0) + (acc.out || 0))) * 100}%`, height: '100%', backgroundColor: 'var(--accent-green)', opacity: 0.6 }}></div>
                  <div style={{ width: `${((acc.out || 0) / ((acc.in || 0) + (acc.out || 0))) * 100}%`, height: '100%', backgroundColor: 'var(--accent-red)', opacity: 0.6 }}></div>
                </>
              )}
            </div>
          </div>
        ))}
      </DashboardGrid>
    </>
  );
}
