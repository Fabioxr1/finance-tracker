import { useState, useEffect } from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Tag as TagIcon, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ShoppingCart
} from 'lucide-react';
import PageHeader from './common/PageHeader';
import DashboardGrid from './common/DashboardGrid';
import ActionCard from './common/ActionCard';
import CategoryRanking from './dashboard/CategoryRanking';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MONTHS = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];

export default function MonthlyAnalysisView() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear().toString());
  const [month, setMonth] = useState((now.getMonth() + 1).toString());
  const [availableYears, setAvailableYears] = useState([now.getFullYear().toString()]);
  const [data, setData] = useState({
    totals: { income: 0, expense: 0, savings: 0 },
    expenseByCategory: [],
    incomeByCategory: [],
    tagsBreakdown: [],
    topTransactions: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/monthly-stats?year=${year}&month=${month}`);
      const stats = await res.json();
      setData(stats);
      if (stats.availableYears) setAvailableYears(stats.availableYears);
    } catch (err) {
      console.error("Errore recupero statistiche mensili:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [year, month]);

  const handlePrevMonth = () => {
    let m = parseInt(month) - 1;
    let y = parseInt(year);
    if (m < 1) {
      m = 12;
      y -= 1;
      if (!availableYears.includes(y.toString())) return;
    }
    setMonth(m.toString());
    setYear(y.toString());
  };

  const handleNextMonth = () => {
    let m = parseInt(month) + 1;
    let y = parseInt(year);
    if (m > 12) {
      m = 1;
      y += 1;
    }
    // Permettiamo di andare avanti solo se non superiamo l'anno corrente + 1 o se è negli anni disponibili
    if (y > now.getFullYear()) return;
    setMonth(m.toString());
    setYear(y.toString());
  };

  return (
    <div className="monthly-analysis">
      <PageHeader title="Analisi Mensile Dettagliata" />

      {/* Selettore Mese/Anno */}
      <div className="card" style={{ marginBottom: '25px', padding: '15px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="btn-outline" onClick={handlePrevMonth} style={{ padding: '8px' }}>
              <ChevronLeft size={20} />
            </button>
            <h2 style={{ margin: 0, minWidth: '180px', textAlign: 'center', fontSize: '1.4rem' }}>
              {MONTHS[parseInt(month) - 1]} {year}
            </h2>
            <button className="btn-outline" onClick={handleNextMonth} style={{ padding: '8px' }}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <select 
              className="year-selector" 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
            >
              {MONTHS.map((m, idx) => (
                <option key={idx} value={idx + 1}>{m}</option>
              ))}
            </select>
            <select 
              className="year-selector" 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Riepilogo Rapido */}
      <DashboardGrid>
        <ActionCard 
          title="Entrate Mensili"
          subtitle="Totale incassato"
          icon={ArrowUpCircle}
          accentColor="var(--accent-green)"
          amount={`€ ${data.totals.income.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
          amountClassName="value-positive"
        />
        <ActionCard 
          title="Uscite Mensili"
          subtitle="Totale speso"
          icon={ArrowDownCircle}
          accentColor="var(--accent-red)"
          amount={`€ ${data.totals.expense.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
          amountClassName="value-negative"
        />
        <ActionCard 
          title="Risparmio Mese"
          subtitle="Differenza Entrate/Uscite"
          icon={Wallet}
          accentColor="var(--accent-blue)"
          amount={`€ ${data.totals.savings.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
          amountClassName={data.totals.savings >= 0 ? 'value-positive' : 'value-negative'}
        />
        <ActionCard 
          title="Tasso Risparmio"
          subtitle="% su entrate"
          icon={TrendingUp}
          accentColor="var(--accent-blue)"
          amount={`${data.totals.income > 0 ? ((data.totals.savings / data.totals.income) * 100).toFixed(1) : 0}%`}
        />
      </DashboardGrid>

      {/* Analisi Categorie (Riutilizzo Componente Esistente) */}
      <CategoryRanking 
        incomeData={data.incomeByCategory}
        expenseData={data.expenseByCategory}
        totalIncome={data.totals.income}
        totalExpense={data.totals.expense}
        year={`${MONTHS[parseInt(month) - 1]} ${year}`}
      />

      <DashboardGrid style={{ marginTop: '30px' }}>
        {/* Analisi per Tag */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Analisi per Tag ({MONTHS[parseInt(month) - 1]})</h3>
            <TagIcon size={20} color="var(--text-secondary)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
            {data.tagsBreakdown.length > 0 ? data.tagsBreakdown.map((tag, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
                  <span>{tag.name}</span>
                  <span style={{ fontWeight: '600' }}>€ {tag.total.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-hover)', borderRadius: '3px' }}>
                  <div style={{ 
                    width: `${(tag.total / data.totals.expense * 100).toFixed(1)}%`, 
                    height: '100%', 
                    backgroundColor: 'var(--accent-blue)',
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>
            )) : <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nessun tag utilizzato questo mese</p>}
          </div>
        </div>

        {/* Top 5 Uscite */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Le 5 Uscite Maggiori</h3>
            <ShoppingCart size={20} color="var(--text-secondary)" />
          </div>
          <div style={{ marginTop: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {data.topTransactions.length > 0 ? data.topTransactions.map((tx, idx) => (
                  <tr key={tx.id} style={{ borderBottom: idx === 4 ? 'none' : '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 0', fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: '600' }}>{tx.description || 'Senza descrizione'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(tx.date).toLocaleDateString('it-IT')}</div>
                    </td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: '700', color: 'var(--accent-red)' }}>
                      -€ {tx.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )) : <tr><td colSpan="2" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Nessuna transazione trovata</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardGrid>
    </div>
  );
}
