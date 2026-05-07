import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, CreditCard, Tag, Check, X, Bell, BellOff, RefreshCw, Edit2, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ModalWrapper from './common/ModalWrapper';
import ActionCard from './common/ActionCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MONTHS = [
  { id: 1, name: 'Gen' }, { id: 2, name: 'Feb' }, { id: 3, name: 'Mar' }, { id: 4, name: 'Apr' },
  { id: 5, name: 'Mag' }, { id: 6, name: 'Giu' }, { id: 7, name: 'Lug' }, { id: 8, name: 'Ago' },
  { id: 9, name: 'Set' }, { id: 10, name: 'Ott' }, { id: 11, name: 'Nov' }, { id: 12, name: 'Dic' }
];

export default function SubscriptionsView() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newSub, setNewSub] = useState({
    name: '',
    amount: '',
    category_id: '',
    account_id: '',
    day_of_month: 1,
    active: true,
    active_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  });

  const currentMonth = new Date().getMonth() + 1;

  const fetchData = async () => {
    try {
      const [sRes, aRes, cRes] = await Promise.all([
        fetch(`${API_URL}/subscriptions`).then(r => r.json()),
        fetch(`${API_URL}/accounts`).then(r => r.json()),
        fetch(`${API_URL}/categories`).then(r => r.json())
      ]);
      setSubscriptions(sRes);
      setAccounts(aRes);
      setCategories(cRes.filter(c => c.type === 'expense'));
      
      if (aRes.length > 0 && cRes.length > 0 && !editingId) {
        setNewSub(prev => ({
          ...prev,
          account_id: aRes[0].id,
          category_id: cRes.find(c => c.name === 'Abbonamenti')?.id || cRes[0].id
        }));
      }
    } catch (err) {
      console.error("Errore caricamento abbonamenti:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `${API_URL}/subscriptions/${editingId}` : `${API_URL}/subscriptions`;
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setNewSub({ name: '', amount: '', category_id: categories[0]?.id, account_id: accounts[0]?.id, day_of_month: 1, active: true, active_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (sub) => {
    setEditingId(sub.id);
    setNewSub({ ...sub, active_months: sub.active_months || [1,2,3,4,5,6,7,8,9,10,11,12] });
    setIsModalOpen(true);
  };

  const toggleMonth = (monthId) => {
    setNewSub(prev => {
      const months = prev.active_months || [];
      if (months.includes(monthId)) {
        return { ...prev, active_months: months.filter(m => m !== monthId) };
      } else {
        return { ...prev, active_months: [...months, monthId].sort((a, b) => a - b) };
      }
    });
  };

  const deleteSub = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo abbonamento?")) return;
    try {
      await fetch(`${API_URL}/subscriptions/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (sub) => {
    try {
      await fetch(`${API_URL}/subscriptions/${sub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sub, active: !sub.active })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const totalMonthlyCurrent = subscriptions
    .filter(s => s.active && (s.active_months || []).includes(currentMonth))
    .reduce((sum, s) => sum + Number(s.amount), 0);

  const totalAnnual = subscriptions
    .filter(s => s.active)
    .reduce((sum, s) => {
        const countMonths = (s.active_months || []).length;
        return sum + (Number(s.amount) * countMonths);
    }, 0);

  // Dati per il grafico
  const chartData = MONTHS.map(m => {
    const amount = subscriptions
      .filter(s => s.active && (s.active_months || []).includes(m.id))
      .reduce((sum, s) => sum + Number(s.amount), 0);
    return { name: m.name, amount, isCurrent: m.id === currentMonth };
  });

  return (
    <div className="subscriptions-view" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Abbonamenti & Ricorrenze</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9em', marginTop: '5px' }}>
            Hai <strong style={{ color: 'var(--accent-blue)' }}>{subscriptions.length}</strong> servizi registrati
          </p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <ActionCard 
            title="Uscita Mensile"
            subtitle={MONTHS[currentMonth-1].name}
            icon={RefreshCw}
            accentColor="var(--accent-red)"
            amount={`€${totalMonthlyCurrent.toFixed(2)}`}
            style={{ marginBottom: 0, padding: '10px 20px' }}
          />
          <ActionCard 
            title="Totale Annuale"
            subtitle="Stima 12 mesi"
            icon={TrendingDown}
            accentColor="var(--accent-blue)"
            amount={`€${totalAnnual.toFixed(2)}`}
            style={{ marginBottom: 0, padding: '10px 20px' }}
          />
          <button className="add-title-btn" onClick={() => { setEditingId(null); setNewSub({ name: '', amount: '', category_id: categories[0]?.id, account_id: accounts[0]?.id, day_of_month: 1, active: true, active_months: [1,2,3,4,5,6,7,8,9,10,11,12] }); setIsModalOpen(true); }}>
            <Plus size={20} /> Nuovo
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="card" style={{ padding: '20px', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <h3 className="chart-title" style={{ marginBottom: '20px' }}>Distribuzione Mensile Spese Ricorrenti</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                  <XAxis dataKey="name" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '8px', color: '#e6edf3' }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isCurrent ? 'var(--accent-blue)' : 'rgba(47, 129, 247, 0.3)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
              <h3 className="chart-title" style={{ marginBottom: '15px' }}>Top Abbonamenti (Impatto Annuale)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {subscriptions
                    .filter(s => s.active)
                    .sort((a, b) => (Number(b.amount) * (b.active_months?.length || 0)) - (Number(a.amount) * (a.active_months?.length || 0)))
                    .slice(0, 5)
                    .map(sub => {
                        const annual = Number(sub.amount) * (sub.active_months?.length || 0);
                        const perc = totalAnnual > 0 ? (annual / totalAnnual) * 100 : 0;
                        return (
                            <div key={sub.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                                    <span>{sub.name}</span>
                                    <span style={{ fontWeight: '600' }}>€{annual.toFixed(2)} <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal', fontSize: '0.8rem' }}>({perc.toFixed(1)}%)</span></span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: 'var(--accent-blue)', width: `${perc}%`, borderRadius: '3px' }}></div>
                                </div>
                            </div>
                        )
                    })
                  }
                  {subscriptions.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '20px' }}>Nessun dato disponibile</p>}
              </div>
          </div>
      </div>

      <div className="grid-container" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '20px'
      }}>
        {subscriptions.length === 0 ? (
          <div className="card" style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <BellOff size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
            <h3>Nessun abbonamento registrato</h3>
            <p>Aggiungi il tuo primo servizio cliccando sul pulsante in alto.</p>
          </div>
        ) : (
          subscriptions.map(sub => (
            <ActionCard
              key={sub.id}
              title={sub.name}
              subtitle={
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span className="tx-card-category" style={{ fontSize: '0.65rem' }}>{sub.category_name}</span>
                  <span className="tx-card-category" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                    Giorno {sub.day_of_month}
                  </span>
                </div>
              }
              amount={`€${Number(sub.amount).toFixed(2)}`}
              amountLabel="/ mese"
              accentColor={sub.active ? 'var(--accent-blue)' : 'var(--text-secondary)'}
              accentSide="left"
              isActive={sub.active}
              actions={
                <>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => toggleActive(sub)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        background: sub.active ? 'rgba(47, 129, 247, 0.1)' : 'rgba(139, 148, 158, 0.1)', 
                        color: sub.active ? 'var(--accent-blue)' : 'var(--text-secondary)',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {sub.active ? <Bell size={14} /> : <BellOff size={14} />}
                      {sub.active ? 'Attivo' : 'Sospeso'}
                    </button>
                    <button 
                      onClick={() => startEdit(sub)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => deleteSub(sub.id)} 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--text-secondary)', 
                      cursor: 'pointer', 
                      padding: '8px',
                      borderRadius: '50%',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              }
            >
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <CreditCard size={14} /> 
                  <span>Addebito su: <strong>{sub.account_name}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={14} />
                  <span>
                    {sub.active_months?.length === 12 
                      ? 'Tutto l\'anno' 
                      : `${sub.active_months?.length} mesi all'anno`}
                  </span>
                </div>
              </div>
            </ActionCard>
          ))
        )}
      </div>

      {isModalOpen && (
        <ModalWrapper 
          title={editingId ? 'Modifica Abbonamento' : 'Nuovo Abbonamento'} 
          onClose={() => setIsModalOpen(false)}
          width="480px"
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Nome del Servizio</label>
                <input 
                  type="text" 
                  className="text-input" 
                  placeholder="Es: Netflix, Palestra, Danza..." 
                  value={newSub.name}
                  onChange={e => setNewSub({...newSub, name: e.target.value})}
                  required
                  style={{ width: '100%' }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Importo Mensile (€)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="text-input" 
                    placeholder="0.00" 
                    value={newSub.amount}
                    onChange={e => setNewSub({...newSub, amount: e.target.value})}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Giorno Addebito</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="31" 
                    className="text-input" 
                    value={newSub.day_of_month}
                    onChange={e => setNewSub({...newSub, day_of_month: e.target.value})}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Mesi di Attività</label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(6, 1fr)', 
                  gap: '5px',
                  background: 'rgba(0,0,0,0.2)',
                  padding: '10px',
                  borderRadius: '8px'
                }}>
                  {MONTHS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMonth(m.id)}
                      style={{
                        padding: '8px 0',
                        fontSize: '0.7rem',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        background: (newSub.active_months || []).includes(m.id) ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                        color: (newSub.active_months || []).includes(m.id) ? 'white' : 'var(--text-secondary)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Categoria</label>
                  <select 
                    className="year-selector"
                    value={newSub.category_id}
                    onChange={e => setNewSub({...newSub, category_id: e.target.value})}
                    style={{ width: '100%' }}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Conto di Addebito</label>
                  <select 
                    className="year-selector"
                    value={newSub.account_id}
                    onChange={e => setNewSub({...newSub, account_id: e.target.value})}
                    style={{ width: '100%' }}
                  >
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button type="submit" className="add-title-btn" style={{ flex: 2, justifyContent: 'center', height: '45px' }}>
                  {editingId ? 'Aggiorna' : 'Crea'} Abbonamento
                </button>
                <button type="button" className="action-btn-gray" onClick={() => setIsModalOpen(false)} style={{ flex: 1, height: '45px' }}>
                  Annulla
                </button>
              </div>
            </form>
        </ModalWrapper>
      )}
    </div>
  );
}
