import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function HistoryChart({ data, year }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Andamento Entrate vs Uscite ({year})</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-secondary)' }}>
          Nessun dato disponibile
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Andamento Entrate vs Uscite ({year})</h3>
      <div style={{ flex: 1, minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEntrate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3fb950" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3fb950" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorUscite" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f85149" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f85149" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
            <XAxis dataKey="name" stroke="#8b949e" />
            <YAxis stroke="#8b949e" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '8px' }}
              itemStyle={{ color: '#e6edf3' }}
            />
            <Legend />
            <Area type="monotone" name="Entrate" dataKey="entrate" stroke="#3fb950" strokeWidth={2} fillOpacity={1} fill="url(#colorEntrate)" />
            <Area type="monotone" name="Uscite" dataKey="uscite" stroke="#f85149" strokeWidth={2} fillOpacity={1} fill="url(#colorUscite)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
