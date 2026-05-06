import { useState, useEffect } from 'react';

// Componenti Dashboard
import StatsCards from './dashboard/StatsCards';
import AccountsGrid from './dashboard/AccountsGrid';
import CashFlowStats from './dashboard/CashFlowStats';
import HistoryChart from './dashboard/HistoryChart';
import CategoryRanking from './dashboard/CategoryRanking';
import MonthlyTable from './dashboard/MonthlyTable';
import DeadlineSummary from './dashboard/DeadlineSummary';
import PredictionCard from './dashboard/PredictionCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function DashboardView() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState([new Date().getFullYear().toString()]);
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
    totalInvestments: 0,
    totalDebt: 0,
    netWorth: 0,
    totalIncome: 0,
    totalExpense: 0,
    savings: 0,
    chartData: [],
    expenseByCategory: [],
    incomeByCategory: [],
    accountsBreakdown: []
  });

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch(`${API_URL}/dashboard-stats?year=${year}`);
      const data = await statsRes.json();
      if (!data) return;

      if (data.availableYears) setAvailableYears(data.availableYears);
      setDashboardData({
        totalBalance: data.totalBalance,
        totalInvestments: data.totalInvestments,
        totalDebt: data.totalDebt,
        netWorth: data.netWorth,
        totalIncome: data.totalIncome,
        totalExpense: data.totalExpense,
        savings: data.savings,
        chartData: data.chartData,
        expenseByCategory: data.expenseByCategory || [],
        incomeByCategory: data.incomeByCategory || [],
        accountsBreakdown: data.accountsBreakdown || []
      });
    } catch (err) {
      console.error("Errore recupero dati dashboard:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [year]);

  return (
    <>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Riepilogo Finanziario</h1>
        <select 
          className="year-selector" 
          value={year} 
          onChange={(e) => setYear(e.target.value)}
        >
          {availableYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </header>

      {/* 1. Carte Statistiche Principali */}
      <StatsCards data={dashboardData} />


      <PredictionCard />

      {/* 1.5 Sommario Scadenze Annuali (Nuovo) */}
      <DeadlineSummary />

      {/* 2. Dettaglio Conti */}
      <AccountsGrid accounts={dashboardData.accountsBreakdown} />

      {/* 3. Flusso di Cassa Annuale */}
      <CashFlowStats data={dashboardData} year={year} />

      {/* 4. Grafico Storico */}
      <HistoryChart data={dashboardData.chartData} year={year} />

      {/* 5. Analisi Categorie */}
      <CategoryRanking 
        incomeData={dashboardData.incomeByCategory}
        expenseData={dashboardData.expenseByCategory}
        totalIncome={dashboardData.totalIncome}
        totalExpense={dashboardData.totalExpense}
        year={year}
      />

      {/* 6. Tabella Mensile */}
      <MonthlyTable data={dashboardData.chartData} year={year} />
    </>
  );
}
