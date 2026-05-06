import { Wallet, Briefcase, TrendingUp, TrendingDown, Calculator } from 'lucide-react';

export default function InvestmentStats({ totalValue, totalInvested, totalGain, gainPercent, totalEstimatedTaxes }) {
  const netValue = totalValue - (totalEstimatedTaxes || 0);

  return (
    <div className="stats-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Valore Totale</span>
          <div className="stat-icon" style={{ background: 'rgba(47, 129, 247, 0.1)', color: 'var(--accent-blue)' }}>
            <Wallet size={20} />
          </div>
        </div>
        <div className="stat-value">€{totalValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Netto stimato: €{netValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Capitale Investito</span>
          <div className="stat-icon" style={{ background: 'rgba(137, 87, 229, 0.1)', color: '#8957e5' }}>
            <Briefcase size={20} />
          </div>
        </div>
        <div className="stat-value">€{totalInvested.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Performance</span>
          <div className="stat-icon" style={{ 
            background: totalGain >= 0 ? 'rgba(35, 134, 54, 0.1)' : 'rgba(248, 81, 73, 0.1)', 
            color: totalGain >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' 
          }}>
            {totalGain >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          </div>
        </div>
        <div className="stat-value" style={{ color: totalGain >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
          {totalGain >= 0 ? '+' : ''}€{totalGain.toLocaleString('it-IT', { minimumFractionDigits: 2 })} ({gainPercent.toFixed(2)}%)
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Tasse Potenziali</span>
          <div className="stat-icon" style={{ background: 'rgba(255, 152, 0, 0.1)', color: '#ffa726' }}>
            <Calculator size={20} />
          </div>
        </div>
        <div className="stat-value" style={{ color: '#ffa726' }}>
          €{(totalEstimatedTaxes || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Basate su plusvalenze attuali
        </div>
      </div>
    </div>
  );
}
