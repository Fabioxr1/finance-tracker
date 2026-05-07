import React, { useState, useMemo } from 'react';
import { TrendingUp, Calendar, ArrowRight, Info, PieChart as PieIcon } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export default function InvestmentSimulator({ initialValue, monthlyContribution }) {
  const [monthlyAdd, setMonthlyAdd] = useState(monthlyContribution || 0);
  const [years, setYears] = useState(20);
  const [returnRate, setReturnRate] = useState(6); // % annuo

  // Sincronizza il valore del PAC quando i dati vengono caricati dal database
  React.useEffect(() => {
    if (monthlyContribution > 0) {
      setMonthlyAdd(monthlyContribution);
    }
  }, [monthlyContribution]);

  // Calcolo della proiezione
  const data = useMemo(() => {
    let currentTotal = initialValue;
    const monthlyRate = Math.pow(1 + returnRate / 100, 1 / 12) - 1;
    const projection = [];

    for (let i = 0; i <= years; i++) {
      projection.push({
        year: new Date().getFullYear() + i,
        invested: initialValue + (monthlyAdd * 12 * i),
        value: Math.round(currentTotal)
      });

      // Incremento annuo (approssimato mensilmente per precisione interesse composto)
      for (let m = 0; m < 12; m++) {
        currentTotal = (currentTotal + Number(monthlyAdd)) * (1 + monthlyRate);
      }
    }
    return projection;
  }, [initialValue, monthlyAdd, returnRate, years]);

  const finalValue = data[data.length - 1].value;
  const totalInvested = data[data.length - 1].invested;
  const totalGain = finalValue - totalInvested;
  // Assumiamo una tassazione media del 20% (media tra 12.5 e 26) per semplicità di proiezione
  const estimatedTax = totalGain > 0 ? totalGain * 0.20 : 0;
  const netFinalValue = finalValue - estimatedTax;

  return (
    <div className="card" style={{ padding: '30px', background: 'var(--bg-card)', marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 className="card-title" style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp color="var(--accent-green)" /> Simulatore Obiettivi a Lungo Termine
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Visualizza la potenza dell'interesse composto nel tempo</p>
        </div>
      </div>

      <div className="simulator-grid">
        {/* CONTROLLI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
              <span>Rendimento Annuo Stimato: <strong>{returnRate}%</strong></span>
            </label>
            <input 
              type="range" min="1" max="15" step="0.5" 
              value={returnRate} 
              onChange={(e) => setReturnRate(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-green)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
              <span>Prudente (3%)</span>
              <span>Storico (7%)</span>
              <span>Aggressivo (12%)</span>
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
              <span>Orizzonte Temporale: <strong>{years} anni</strong></span>
            </label>
            <input 
              type="range" min="1" max="40" 
              value={years} 
              onChange={(e) => setYears(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-blue)' }}
            />
          </div>

          <div className="form-group">
            <label style={{ marginBottom: '10px', display: 'block', fontSize: '0.9rem' }}>Versamento Mensile Corrente (€)</label>
            <input 
              type="number" 
              className="text-input" 
              value={monthlyAdd} 
              onChange={(e) => setMonthlyAdd(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Info size={14} /> Basato sui tuoi PAC attivi
            </p>
          </div>

          <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Capitale Finale Stimato</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              €{finalValue.toLocaleString('it-IT')}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--accent-green)', marginTop: '5px', fontWeight: '500' }}>
              Netto stimato (post-tasse): €{Math.round(netFinalValue).toLocaleString('it-IT')}
            </div>
          </div>
        </div>

        {/* GRAFICO */}
        <div style={{ height: '400px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '15px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="var(--text-secondary)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `€${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
              />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px' }}
                formatter={(value) => [`€${value.toLocaleString('it-IT')}`, '']}
              />
              <Legend verticalAlign="top" height={36}/>
              <Area type="monotone" name="Valore Stimato" dataKey="value" stroke="var(--accent-green)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              <Area type="monotone" name="Capitale Versato" dataKey="invested" stroke="var(--accent-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorInvested)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
