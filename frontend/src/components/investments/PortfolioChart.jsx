import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#2f81f7', '#238636', '#d29922', '#f85149', '#8957e5'];

export default function PortfolioChart({ data }) {
  const chartData = data.filter(i => i.totalShares > 0).map(i => ({ name: i.name, value: Number(i.currentValue) }));

  if (chartData.length === 0) return null;

  return (
    <div className="card">
      <h3 className="card-title" style={{ marginBottom: '20px' }}>Distribuzione Portafoglio</h3>
      <div style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={chartData} 
              cx="50%" 
              cy="50%" 
              innerRadius={70} 
              outerRadius={100} 
              paddingAngle={5} 
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '8px' }}
              itemStyle={{ color: '#e6edf3' }}
              formatter={(value) => `€${Number(value).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
