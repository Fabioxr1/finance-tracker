import React, { useState, useEffect } from 'react';

const PredictionCard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simTarget, setSimTarget] = useState(30);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetch(`${API_URL}/predictions`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching predictions:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) return null;

  // Calcolo dinamico basato sulla simulazione
  const simFreeBudget = (data.fullYearIncomeTotal * (1 - simTarget / 100)) - data.fullYearExpenseTotal;
  
  // Cosa succederebbe se spendessi tutto il budget libero extra?
  const simMonthlyExpense = (data.fullYearExpenseTotal + simFreeBudget) / 12;
  const simRunway = data.currentBalance / (simMonthlyExpense || 1);
  const simEndOfYearBalance = data.currentBalance + (data.fullYearIncomeTotal - (data.fullYearExpenseTotal + simFreeBudget));

  const styles = {
    section: {
      marginTop: '40px',
      marginBottom: '40px',
      padding: '30px',
      borderRadius: '24px',
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    },
    titleContainer: {
      textAlign: 'center',
      marginBottom: '40px',
      position: 'relative'
    },
    title: {
      fontSize: '0.85rem',
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      color: '#94a3b8',
      fontWeight: '600',
      display: 'inline-block',
      background: '#0f172a',
      padding: '0 20px',
      position: 'relative',
      zIndex: 1,
      margin: 0
    },
    line: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '1px',
      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
      zIndex: 0
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '24px',
    },
    heroCard: {
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '24px',
      padding: '28px',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    detailCard: {
      background: 'rgba(30, 41, 59, 0.2)',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      padding: '28px',
      border: '1px solid rgba(255,255,255,0.05)',
    },
    listRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)'
    },
    label: { color: '#94a3b8', fontSize: '13px' },
    value: { color: 'white', fontSize: '14px', fontWeight: 'bold' },
    sliderContainer: {
      background: 'rgba(255,255,255,0.03)',
      padding: '20px',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.05)'
    }
  };

  return (
    <section style={styles.section}>
      <div style={styles.titleContainer}>
        <h2 style={styles.title}>Simulatore di Risparmio</h2>
        <div style={styles.line}></div>
      </div>

      <div style={styles.grid}>
        {/* CARD SIMULAZIONE */}
        <div style={styles.heroCard}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Budget Libero Stimato</span>
              <span style={{ background: data.savingsRate >= simTarget ? 'rgba(52, 211, 153, 0.1)' : 'rgba(251, 113, 133, 0.1)', color: data.savingsRate >= simTarget ? '#34d399' : '#fb7185', fontSize: '10px', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                {data.savingsRate >= simTarget ? 'IN TARGET' : 'SOTTO TARGET'}
              </span>
            </div>
            <h2 style={{ fontSize: '42px', fontWeight: '900', color: simFreeBudget >= 0 ? '#34d399' : '#fb7185', margin: '12px 0' }}>
              {simFreeBudget >= 0 ? '+' : ''}€ {Math.round(simFreeBudget).toLocaleString('it-IT')}
            </h2>
            <p style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
              {simFreeBudget >= 0 
                ? `Puoi permetterti spese extra per €${Math.round(simFreeBudget).toLocaleString('it-IT')} mantenendo il tuo obiettivo.`
                : `Dovresti ridurre le spese di €${Math.abs(Math.round(simFreeBudget)).toLocaleString('it-IT')} per centrare il target.`}
            </p>
          </div>
          
          <div style={{ padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Proiezione Saldo al 31/12 (Simulato)</span>
            <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'white', margin: '8px 0' }}>
              € {Math.round(simEndOfYearBalance).toLocaleString('it-IT')}
            </h2>
          </div>

          <div style={styles.sliderContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ color: 'white', fontSize: '13px', fontWeight: 'bold' }}>Obiettivo Risparmio: {simTarget}%</span>
              <span style={{ color: '#64748b', fontSize: '11px' }}>{simTarget < 30 ? 'Poco ambizioso' : simTarget > 50 ? 'Molto ambizioso' : 'Equilibrato'}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="70" 
              step="1"
              value={simTarget} 
              onChange={(e) => setSimTarget(parseInt(e.target.value))}
              style={{ 
                width: '100%', 
                cursor: 'pointer', 
                accentColor: '#34d399',
                height: '6px',
                borderRadius: '3px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
             <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Autonomia (Sim)</span>
               <div style={{ color: '#34d399', fontSize: '20px', fontWeight: '900', marginTop: '4px' }}>{simRunway.toFixed(1)} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>mesi</span></div>
             </div>
             <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Target</span>
               <div style={{ color: 'white', fontSize: '20px', fontWeight: '900', marginTop: '4px' }}>{simTarget}%</div>
             </div>
          </div>
        </div>

        {/* DETTAGLIO ANALITICO */}
        <div style={styles.detailCard}>
          <h3 style={{ color: 'white', fontSize: '14px', fontWeight: 'bold', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Dettaglio Flussi {new Date().getFullYear()}
          </h3>
          
          <div style={styles.listRow}>
            <span style={styles.label}>Entrate Incassate (Real)</span>
            <span style={{ ...styles.value, color: '#34d399' }}>+ € {data.realIncomeYear.toLocaleString('it-IT')}</span>
          </div>
          <div style={styles.listRow}>
            <span style={styles.label}>Spese Già Fatte (Real)</span>
            <span style={{ ...styles.value, color: '#fb7185' }}>- € {data.realExpenseYear.toLocaleString('it-IT')}</span>
          </div>
          <div style={styles.listRow}>
            <span style={styles.label}>Entrate Stimate ({data.monthsRemaining} mesi)</span>
            <span style={{ ...styles.value, color: '#34d399' }}>+ € {data.projectedIncome.toLocaleString('it-IT')}</span>
          </div>
          <div style={styles.listRow}>
            <span style={styles.label}>Spese Previste Core ({data.monthsRemaining} mesi)</span>
            <span style={{ ...styles.value, color: '#fb7185' }}>- € {data.projectedExpense.toLocaleString('it-IT')}</span>
          </div>
          <div style={styles.listRow}>
            <span style={styles.label}>Scadenze e Rate Future</span>
            <span style={{ ...styles.value, color: '#fb7185' }}>- € {(data.pendingDeadlines + data.remainingInstallmentsTotal).toLocaleString('it-IT')}</span>
          </div>
          
          <div style={{ ...styles.listRow, marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', borderBottom: 'none' }}>
            <span style={{ ...styles.label, color: 'white', fontWeight: 'bold' }}>Risparmio Netto Stimato</span>
            <span style={{ ...styles.value, color: 'white', fontWeight: 'bold', fontSize: '1.2em' }}>
              € {(data.fullYearIncomeTotal - data.fullYearExpenseTotal).toLocaleString('it-IT')}
            </span>
          </div>
          
          <p style={{ fontSize: '11px', color: '#475569', marginTop: '20px', fontStyle: 'italic', lineHeight: '1.4' }}>
            * Le proiezioni includono un margine di sicurezza del 5% sulle spese variabili per una maggiore affidabilità.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PredictionCard;
