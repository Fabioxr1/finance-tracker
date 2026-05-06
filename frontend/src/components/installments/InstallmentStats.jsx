import { Wallet, CreditCard, Calendar } from 'lucide-react';

export default function InstallmentStats({ totalDebt, monthlyCommitment, activeCount, freedomDate }) {
  return (
    <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '30px' }}>
      <div className="card" style={{ borderTop: '4px solid var(--accent-red)' }}>
        <div className="card-header">
          <h3 className="card-title">Debito Residuo Totale</h3>
          <Wallet className="card-icon" color="var(--accent-red)" size={20} />
        </div>
        <div className="card-value value-negative" style={{ fontSize: '1.8em' }}>
          € {totalDebt.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
        </div>
        <div className="card-subtitle">Capitale ancora da rimborsare</div>
      </div>

      <div className="card" style={{ borderTop: '4px solid var(--accent-blue)' }}>
        <div className="card-header">
          <h3 className="card-title">Impegno Mensile</h3>
          <CreditCard className="card-icon" color="var(--accent-blue)" size={20} />
        </div>
        <div className="card-value" style={{ fontSize: '1.8em' }}>
          € {monthlyCommitment.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
        </div>
        <div className="card-subtitle">Totale rate correnti</div>
      </div>

      <div className="card" style={{ borderTop: '4px solid var(--accent-green)' }}>
        <div className="card-header">
          <h3 className="card-title">Estinzione Debiti</h3>
          <Calendar className="card-icon" color="var(--accent-green)" size={20} />
        </div>
        <div className="card-value" style={{ fontSize: '1.5em', textTransform: 'capitalize' }}>
          {freedomDate ? new Date(freedomDate).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }) : '---'}
        </div>
        <div className="card-subtitle">Data di libertà finanziaria stimata</div>
      </div>
    </div>
  );
}
