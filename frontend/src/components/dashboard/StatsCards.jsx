import { Wallet, TrendingUp, PieChart } from 'lucide-react';

export default function StatsCards({ data }) {
  return (
    <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '30px' }}>
      <div className="card" style={{ borderTop: '4px solid var(--accent-blue)' }}>
        <div className="card-header">
          <h3 className="card-title">Patrimonio Netto</h3>
          <PieChart className="card-icon" color="var(--accent-blue)" size={20} />
        </div>
        <div className={`card-value ${data.netWorth < 0 ? 'value-negative' : 'value-neutral'}`} style={{fontSize: '1.8em'}}>
          € {(data.netWorth || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
        </div>
        <div className="card-subtitle">Conti + Titoli - Debiti</div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Liquidità Conti</h3>
          <Wallet className="card-icon" size={20} />
        </div>
        <div className="card-value" style={{fontSize: '1.6em'}}>€ {(data.totalBalance || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
        <div className="card-subtitle">Disponibilità immediata</div>
      </div>

      <div className="card" style={{ borderTop: '4px solid var(--accent-green)' }}>
        <div className="card-header">
          <h3 className="card-title">Investimenti</h3>
          <TrendingUp className="card-icon" color="var(--accent-green)" size={20} />
        </div>
        <div className="card-value value-positive" style={{fontSize: '1.6em'}}>€ {(data.totalInvestments || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
        <div className="card-subtitle">Controvalore attuale</div>
      </div>

      <div className="card" style={{ borderTop: '4px solid var(--accent-red)' }}>
        <div className="card-header">
          <h3 className="card-title">Debiti Residui</h3>
          <TrendingUp className="card-icon" color="var(--accent-red)" style={{ transform: 'scaleY(-1)' }} size={20} />
        </div>
        <div className="card-value value-negative" style={{fontSize: '1.6em'}}>€ {(data.totalDebt || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
        <div className="card-subtitle">Totale finanziamenti</div>
      </div>
    </div>
  );
}
