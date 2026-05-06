import { useState, useEffect } from 'react';
import { AlertTriangle, CalendarRange } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function DeadlineSummary() {
  const [summary, setSummary] = useState({
    totalYear: 0,
    remainingYear: 0,
    count: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`${API_URL}/deadlines`);
        const data = await response.json();
        const currentYear = new Date().getFullYear();
        
        const yearDeadlines = data.filter(d => {
          const dDate = new Date(d.due_date);
          return dDate.getFullYear() === currentYear;
        });

        const total = yearDeadlines.reduce((acc, d) => acc + Number(d.amount || 0), 0);
        const remaining = yearDeadlines
          .filter(d => d.status === 'pending')
          .reduce((acc, d) => acc + Number(d.amount || 0), 0);

        setSummary({
          totalYear: total,
          remainingYear: remaining,
          count: yearDeadlines.length
        });
        setLoading(false);
      } catch (err) {
        console.error("Errore recupero sommario scadenze:", err);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return null;

  return (
    <section className="deadline-summary-section" style={{ 
      marginTop: '40px', 
      marginBottom: '40px',
      padding: '25px',
      borderRadius: '16px',
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px dashed rgba(255, 255, 255, 0.1)'
    }}>
      {/* Titolo Centrale della Sezione */}
      <div style={{ textAlign: 'center', marginBottom: '25px', position: 'relative' }}>
        <h2 style={{ 
          fontSize: '0.85rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.2em', 
          color: 'var(--text-secondary)',
          fontWeight: '600',
          display: 'inline-block',
          background: 'var(--bg-color)',
          padding: '0 20px',
          position: 'relative',
          zIndex: 1
        }}>
          Pianificazione Spese Future {new Date().getFullYear()}
        </h2>
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: 0, 
          right: 0, 
          height: '1px', 
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          zIndex: 0
        }}></div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', margin: 0 }}>
        {/* Riquadro 1: Totale Spese Fisse Annuali */}
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(163, 113, 247, 0.1) 0%, rgba(47, 129, 247, 0.05) 100%)',
          border: '1px solid rgba(163, 113, 247, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }}>
            <CalendarRange size={120} color="var(--accent-purple)" />
          </div>
          
          <div className="card-header">
            <div className="card-title" style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>Impegni Fissi Annuali</div>
            <CalendarRange size={20} className="card-icon" style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div className="card-value">€ {summary.totalYear.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
          <div className="card-subtitle">
            Pianificazione totale per l'anno basata su {summary.count} scadenze inserite.
          </div>
        </div>

        {/* Riquadro 2: Residuo da pagare */}
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(248, 81, 73, 0.1) 0%, rgba(13, 17, 23, 0.05) 100%)',
          border: '1px solid rgba(248, 81, 73, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }}>
            <AlertTriangle size={120} color="var(--accent-red)" />
          </div>

          <div className="card-header">
            <div className="card-title" style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>Residuo da Saldare</div>
            <AlertTriangle size={20} className="card-icon" style={{ color: 'var(--accent-red)' }} />
          </div>
          <div className="card-value">€ {summary.remainingYear.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
          <div className="card-subtitle">
            Importo totale delle scadenze imminenti o non ancora pagate.
          </div>
        </div>
      </div>
    </section>
  );
}
