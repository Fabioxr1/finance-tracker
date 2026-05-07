import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Tag, Calendar, ChevronRight, TrendingDown } from 'lucide-react';
import DashboardGrid from './common/DashboardGrid';
import RunwaySimulator from './RunwaySimulator';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function TagStats() {
  const [data, setData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState("0"); // "0" = Tutto l'anno
  const [loading, setLoading] = useState(true);

  const months = [
    { value: "0", label: "Tutto l'anno" },
    { value: "1", label: "Gennaio" },
    { value: "2", label: "Febbraio" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Aprile" },
    { value: "5", label: "Maggio" },
    { value: "6", label: "Giugno" },
    { value: "7", label: "Luglio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Settembre" },
    { value: "10", label: "Ottobre" },
    { value: "11", label: "Novembre" },
    { value: "12", label: "Dicembre" }
  ];

  useEffect(() => {
    fetchStats();
  }, [year, month]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tag-stats?year=${year}&month=${month}`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Errore recupero statistiche tag:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) return <div className="loading">Caricamento statistiche...</div>;

  return (
    <div className="tag-stats-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 className="chart-title" style={{ margin: 0 }}>Analisi per Tag</h2>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            className="year-selector" 
            value={year} 
            onChange={(e) => setYear(e.target.value)}
          >
            {[0, 1, 2, 3, 4].map(i => {
              const y = new Date().getFullYear() - i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
          
          <select 
            className="year-selector" 
            value={month} 
            onChange={(e) => setMonth(e.target.value)}
          >
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {/* Card Riassuntiva */}
      <div className="card" style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '20px', background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(59, 130, 246, 0.05) 100%)' }}>
        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>
          <TrendingDown size={28} />
        </div>
        <div>
          <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)', margin: 0 }}>Totale Spese Periodo</p>
          <h3 style={{ fontSize: '1.8em', fontWeight: '800', margin: '5px 0 0 0' }}>{data?.totalPeriod.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</h3>
        </div>
      </div>

      {/* Simulatore Autonomia Finanziaria */}
      <RunwaySimulator />

      {/* Tabella Riepilogo Priorità */}
      <div className="card" style={{ marginBottom: '25px', border: '1px solid var(--accent-blue)', background: 'rgba(47, 129, 247, 0.02)' }}>
        <h3 className="card-title" style={{ marginBottom: '15px', color: 'var(--accent-blue)' }}>Riepilogo per Priorità</h3>
        <div className="table-container">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Priorità</th>
                <th style={{ textAlign: 'right' }}>Totale Speso</th>
                <th style={{ textAlign: 'right' }}>Incidenza %</th>
                <th>Descrizione Sintetica</th>
              </tr>
            </thead>
            <tbody>
              {data?.stats.filter(s => s.name.startsWith('p - ')).map(tag => (
                <tr key={tag.id} style={{ borderLeft: `4px solid ${tag.color}` }}>
                  <td style={{ fontWeight: '700', textTransform: 'capitalize' }}>
                    {tag.name.replace('p - ', '')}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '600' }}>
                    {tag.total.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '10px', 
                      background: `${tag.color}22`, 
                      color: tag.color,
                      fontSize: '0.9em',
                      fontWeight: '700'
                    }}>
                      {tag.percentage.toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                    {tag.description || '-'}
                  </td>
                </tr>
              ))}
              {data?.stats.filter(s => s.name.startsWith('p - ')).length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                    Nessun tag di priorità trovato (es. p - essenziale)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DashboardGrid minWidth="100%">
        {/* Grafico a Barre */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '20px' }}>Distribuzione Spesa per Tag</h3>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.stats.filter(s => s.total > 0)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  width={100}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  formatter={(value) => value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={25}>
                  {data?.stats.filter(s => s.total > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabella Dettaglio */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '20px' }}>Tutti i Tag</h3>
          <div className="table-container">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th style={{ textAlign: 'right' }}>Totale</th>
                  <th style={{ textAlign: 'right' }}>Incidenza</th>
                  <th style={{ textAlign: 'right' }}>N. Spese</th>
                </tr>
              </thead>
              <tbody>
                {data?.stats.filter(s => s.total > 0).map(tag => (
                  <tr key={tag.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: tag.color }}></div>
                        <span style={{ fontWeight: '600' }}>#{tag.name}</span>
                      </div>
                      {tag.description && <p style={{ fontSize: '0.7em', color: 'var(--text-secondary)', margin: '2px 0 0 22px' }}>{tag.description}</p>}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700' }}>{tag.total.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>{tag.percentage.toFixed(1)}%</span>
                        <div style={{ width: '60px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${tag.percentage}%`, height: '100%', background: tag.color }}></div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{tag.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardGrid>
    </div>
  );
}
