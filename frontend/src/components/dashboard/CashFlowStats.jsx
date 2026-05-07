import { TrendingUp, PieChart } from 'lucide-react';
import DashboardGrid from '../common/DashboardGrid';

export default function CashFlowStats({ data, year }) {
  const getSavingsPercentage = () => {
    if (data.totalIncome === 0) return 0;
    return ((data.savings / data.totalIncome) * 100).toFixed(1);
  };

  return (
    <DashboardGrid>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Entrate Annuali</h3>
          <TrendingUp className="card-icon" size={20} color="var(--accent-green)" />
        </div>
        <div className="card-value value-positive">€ {data.totalIncome.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
        <div className="card-subtitle">Totale anno {year}</div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Uscite Annuali</h3>
          <TrendingUp className="card-icon" style={{ transform: 'scaleY(-1)' }} size={20} color="var(--accent-red)" />
        </div>
        <div className="card-value value-negative">€ {data.totalExpense.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
        <div className="card-subtitle">Totale anno {year}</div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Risparmio ({year})</h3>
          <PieChart className="card-icon" size={20} />
        </div>
        <div className={`card-value ${data.savings < 0 ? 'value-negative' : 'value-positive'}`}>
          € {data.savings.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
        </div>
        <div className="card-subtitle">Margine del {getSavingsPercentage()}%</div>
      </div>
    </DashboardGrid>
  );
}
