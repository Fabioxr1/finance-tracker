import { Wallet, TrendingUp, PieChart } from 'lucide-react';
import DashboardGrid from '../common/DashboardGrid';
import ActionCard from '../common/ActionCard';

export default function StatsCards({ data }) {
  return (
    <DashboardGrid>
      <ActionCard 
        title="Patrimonio Netto"
        subtitle="Conti + Titoli - Debiti"
        icon={PieChart}
        accentColor="var(--accent-blue)"
        amount={`€ ${(data.netWorth || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
        amountClassName={data.netWorth < 0 ? 'value-negative' : 'value-neutral'}
      />

      <ActionCard 
        title="Liquidità Conti"
        subtitle="Disponibilità immediata"
        icon={Wallet}
        amount={`€ ${(data.totalBalance || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
      />

      <ActionCard 
        title="Investimenti"
        subtitle="Controvalore attuale"
        icon={TrendingUp}
        accentColor="var(--accent-green)"
        amount={`€ ${(data.totalInvestments || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
        amountClassName="value-positive"
      />

      <ActionCard 
        title="Debiti Residui"
        subtitle="Totale finanziamenti"
        icon={TrendingUp}
        accentColor="var(--accent-red)"
        amount={`€ ${(data.totalDebt || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
        amountClassName="value-negative"
      />
    </DashboardGrid>
  );
}
