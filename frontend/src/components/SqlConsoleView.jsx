import { useState } from 'react';
import { Database, Play, AlertTriangle, CheckCircle, Table } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Definizione dello schema per l'autocompletamento
const dbSchema = {
  accounts: ['id', 'name', 'type', 'initial_balance', 'is_system'],
  categories: ['id', 'name', 'type'],
  transactions: ['id', 'account_id', 'to_account_id', 'category_id', 'amount', 'type', 'date', 'description', 'installment_id', 'recurrence_type'],
  tags: ['id', 'name', 'color', 'description'],
  transaction_tags: ['transaction_id', 'tag_id'],
  installments: ['id', 'name', 'total_amount', 'monthly_amount', 'paid_installments', 'search_keyword'],
  investments: ['id', 'name', 'ticker', 'manual_price', 'use_manual_price'],
  investment_transactions: ['id', 'investment_id', 'shares', 'price_per_share', 'type', 'linked_transaction_id'],
  subscriptions: ['id', 'name', 'amount', 'day_of_month', 'active']
};

export default function SqlConsoleView() {
  const [query, setQuery] = useState('SELECT * FROM accounts LIMIT 10;');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const executeQuery = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: query })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore durante l'esecuzione della query");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sql-console">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Console SQL</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Esegui query dirette sul database PostgreSQL</p>
        </div>
        <button 
          className="add-title-btn" 
          onClick={executeQuery} 
          disabled={loading}
          style={{ background: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Play size={18} /> {loading ? 'Esecuzione...' : 'Esegui Query'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
        <button className="year-selector" style={{fontSize: '11px', whiteSpace: 'nowrap'}} onClick={() => setQuery('SELECT c.name, SUM(t.amount) as totale FROM transactions t JOIN categories c ON t.category_id = c.id WHERE t.type = \'expense\' GROUP BY c.name ORDER BY totale DESC;')}>Spese per Categoria</button>
        <button className="year-selector" style={{fontSize: '11px', whiteSpace: 'nowrap'}} onClick={() => setQuery('SELECT a.name, SUM(CASE WHEN t.type=\'income\' THEN amount WHEN t.type=\'expense\' THEN -amount ELSE 0 END) as saldo FROM accounts a LEFT JOIN transactions t ON a.id = t.account_id GROUP BY a.name;')}>Saldo Reale Conti</button>
        <button className="year-selector" style={{fontSize: '11px', whiteSpace: 'nowrap'}} onClick={() => setQuery('SELECT name, ticker, (manual_price * total_shares) as valore_stimato FROM investments WHERE use_manual_price = true;')}>Valore Titoli Manuali</button>
        <button className="year-selector" style={{fontSize: '11px', whiteSpace: 'nowrap'}} onClick={() => setQuery('SELECT * FROM transactions WHERE date BETWEEN \'2025-01-01\' AND \'2025-01-31\' ORDER BY date DESC;')}>Gennaio 2025</button>
        <button className="year-selector" style={{fontSize: '11px', whiteSpace: 'nowrap'}} onClick={() => setQuery('SELECT * FROM transactions WHERE date > CURRENT_DATE - INTERVAL \'7 days\' ORDER BY date DESC;')}>Ultimi 7 Giorni</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--accent-blue)' }}>
            <Database size={20} />
            <span style={{ fontWeight: 'bold' }}>SQL Editor</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: 'auto' }}>Ctrl+Enter per eseguire</span>
          </div>
          <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <CodeMirror
              value={query}
              height="200px"
              theme="dark"
              extensions={[sql({ schema: dbSchema })]}
              onChange={(value) => setQuery(value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  executeQuery();
                }
              }}
              style={{ fontSize: '14px' }}
            />
          </div>
        </div>

        <div className="card" style={{ padding: '15px', fontSize: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Table size={14} /> Legenda (Clicca per SELECT)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'accounts', cols: 'id, name, type, initial_balance' },
              { name: 'categories', cols: 'id, name, type' },
              { name: 'transactions', cols: 'id, account_id, to_account_id, category_id, amount, type, date' },
              { name: 'investments', cols: 'id, name, ticker, type, manual_price' },
              { name: 'investment_transactions', cols: 'id, investment_id, shares, total_amount, type' },
              { name: 'installments', cols: 'id, name, total_amount, paid_installments' }
            ].map(table => (
              <div 
                key={table.name} 
                onClick={() => setQuery(`SELECT * FROM ${table.name} LIMIT 20;`)}
                style={{ cursor: 'pointer', padding: '5px', borderRadius: '4px', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <strong style={{color: 'var(--accent-blue)'}}>{table.name}</strong>
                <div style={{color: 'var(--text-secondary)', fontSize: '10px', marginTop: '2px'}}>{table.cols}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '20px', backgroundColor: 'rgba(248, 81, 73, 0.1)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} />
          <div><strong>Errore SQL:</strong> {error}</div>
        </div>
      )}

      {result && result.type === 'command' && (
        <div className="card" style={{ padding: '20px', backgroundColor: 'rgba(35, 134, 54, 0.1)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={20} />
          <div>{result.message} Righe interessate: {result.rowCount}</div>
        </div>
      )}

      {result && result.type === 'select' && (
        <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
          <div style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Table size={18} />
            <span style={{ fontWeight: 'bold' }}>Risultati ({result.data.length} righe)</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                {result.fields.map(field => (
                  <th key={field} style={{ padding: '12px', textAlign: 'left', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{field}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.data.length > 0 ? (
                result.data.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {result.fields.map(field => (
                      <td key={field} style={{ padding: '12px' }}>
                        {row[field] === null ? <em style={{opacity: 0.5}}>null</em> : row[field].toString()}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={result.fields.length} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    La query non ha restituito risultati.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
