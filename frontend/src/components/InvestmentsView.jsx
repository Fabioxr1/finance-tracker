import { Plus, Repeat } from 'lucide-react';

// Componenti Investimenti
import InvestmentStats from './investments/InvestmentStats';
import PACSection from './investments/PACSection';
import PortfolioTable from './investments/PortfolioTable';
import PortfolioChart from './investments/PortfolioChart';
import InvestmentModals from './investments/InvestmentModals';

import '../index.css';

import useInvestments from '../hooks/useInvestments';
import { calculateInitialPACShares } from '../utils/investmentUtils';

export default function InvestmentsView() {
  const {
    portfolio, accounts, plans, history, setHistory, stats,
    showAddTitle, setShowAddTitle,
    showEditTitle, setShowEditTitle,
    showAddTx, setShowAddTx,
    showHistory, setShowHistory,
    showAddPlan, setShowAddPlan,
    showExecutePlan, setShowExecutePlan,
    selectedInv, setSelectedInv,
    selectedPlan, setSelectedPlan,
    newTitle, setNewTitle,
    newTx, setNewTx,
    newPlan, setNewPlan,
    execPlanData, setExecPlanData,
    editingTxId, setEditingTxId,
    editTxData, setEditTxData,
    editTitleData, setEditTitleData,
    updateQuickPrice, addTitle, updateTitle, deleteTitle,
    addTransaction, fetchHistory, startEditTx, saveEditTx,
    deleteHistoryTx, addPlan, executePlan, deletePlan,
    startEditTitle
  } = useInvestments();

  return (
    <div className="investments-container">
      {/* HEADER */}
      <div className="page-header" style={{ marginBottom: '25px' }}>
        <div>
          <h1 className="page-title" style={{margin: 0}}>Investimenti</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Monitoraggio portafoglio e PAC</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="add-title-btn" onClick={() => setShowAddPlan(true)} style={{ background: 'rgba(137, 87, 229, 0.1)', color: '#8957e5', border: '1px solid #8957e5' }}><Repeat size={18} /> Nuovo PAC</button>
          <button className="add-title-btn" onClick={() => setShowAddTitle(true)}><Plus size={18} /> Nuovo Titolo</button>
        </div>
      </div>

      {/* STATISTICHE */}
      <InvestmentStats 
        totalValue={stats.totalValue} 
        totalInvested={stats.totalInvested} 
        totalGain={stats.totalGain} 
        gainPercent={stats.gainPercent} 
        totalEstimatedTaxes={stats.totalEstimatedTaxes}
      />

      {/* SEZIONE PAC */}
      <PACSection 
        plans={plans} 
        onExecute={(plan) => { 
          setSelectedPlan(plan); 
          const asset = portfolio.find(p => p.id === plan.investment_id); 
          const currentPrice = asset?.livePrice || 0;
          const initialShares = calculateInitialPACShares(plan.amount, currentPrice, asset?.type);

          setExecPlanData({ 
            account_id: asset?.account_id || accounts[0]?.id || '', 
            date: new Date().toISOString().split('T')[0], 
            amount: plan.amount, 
            shares: initialShares, 
            price_per_share: currentPrice || '' 
          }); 
          setShowExecutePlan(true); 
        }} 
        onDelete={deletePlan} 
      />

      {/* PORTFOLIO E DISTRIBUZIONE */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div style={{ gridColumn: 'span 1' }}>
          <PortfolioTable 
            portfolio={portfolio} 
            onAddTx={(inv) => { 
              setSelectedInv(inv); 
              setNewTx({ 
                ...newTx, 
                investment_id: inv.id, 
                account_id: inv.account_id || accounts[0]?.id || '',
                price_per_share: inv.livePrice || '',
                shares: '',
                total_amount: ''
              }); 
              setShowAddTx(true); 
            }} 
            onShowHistory={fetchHistory} 
            onEdit={startEditTitle} 
            onDelete={deleteTitle} 
            onUpdatePrice={updateQuickPrice} 
          />
        </div>

        <PortfolioChart data={portfolio} />
      </div>

      {/* TUTTI I MODALI */}
      <InvestmentModals 
        showAddTitle={showAddTitle} setShowAddTitle={setShowAddTitle}
        showEditTitle={showEditTitle} setShowEditTitle={setShowEditTitle}
        showAddTx={showAddTx} setShowAddTx={setShowAddTx}
        showHistory={showHistory} setShowHistory={setShowHistory}
        showAddPlan={showAddPlan} setShowAddPlan={setShowAddPlan}
        showExecutePlan={showExecutePlan} setShowExecutePlan={setShowExecutePlan}
        
        newTitle={newTitle} setNewTitle={setNewTitle}
        editTitleData={editTitleData} setEditTitleData={setEditTitleData}
        newTx={newTx} setNewTx={setNewTx}
        history={history} setHistory={setHistory}
        newPlan={newPlan} setNewPlan={setNewPlan}
        execPlanData={execPlanData} setExecPlanData={setExecPlanData}
        
        selectedInv={selectedInv} setSelectedInv={setSelectedInv}
        selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan}
        accounts={accounts} portfolio={portfolio}
        
        addTitle={addTitle} updateTitle={updateTitle} addTransaction={addTransaction} 
        deleteHistoryTx={deleteHistoryTx} startEditTx={startEditTx} saveEditTx={saveEditTx} 
        editingTxId={editingTxId} setEditingTxId={setEditingTxId} editTxData={editTxData} setEditTxData={setEditTxData} 
        addPlan={addPlan} executePlan={executePlan}
      />
    </div>
  );
}
