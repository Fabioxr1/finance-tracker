import { Wallet, CreditCard, Calendar } from 'lucide-react';
import DashboardGrid from '../common/DashboardGrid';
import ActionCard from '../common/ActionCard';

export default function InstallmentStats({ totalDebt, monthlyCommitment, activeCount, freedomDate }) {
  return (
    <DashboardGrid>
      <ActionCard 
        title="Debito Residuo Totale"
        subtitle="Capitale ancora da rimborsare"
        icon={Wallet}
        accentColor="var(--accent-red)"
        amount={`€ ${totalDebt.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
        amountClassName="value-negative"
      />

      <ActionCard 
        title="Impegno Mensile"
        subtitle="Totale rate correnti"
        icon={CreditCard}
        accentColor="var(--accent-blue)"
        amount={`€ ${monthlyCommitment.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
      />

      <ActionCard 
        title="Estinzione Debiti"
        subtitle="Data di libertà finanziaria stimata"
        icon={Calendar}
        accentColor="var(--accent-green)"
        amount={freedomDate ? new Date(freedomDate).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }) : '---'}
        amountClassName="text-capitalize"
      />
    </DashboardGrid>
  );
}
