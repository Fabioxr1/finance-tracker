import { useState, useEffect } from 'react';
import { Wallet, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import '../index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AccountsView() {
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({ name: '', type: 'Conto Corrente', initial_balance: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editAccount, setEditAccount] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_URL}/accounts`);
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error("Errore nel caricamento conti:", err);
    }
  };

  const addAccount = async (e) => {
    e.preventDefault();
    if (!newAccount.name || !newAccount.type) return;
    try {
      const res = await fetch(`${API_URL}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount)
      });
      if (!res.ok) throw new Error("Errore inserimento");
      setNewAccount({ name: '', type: 'Conto Corrente', initial_balance: 0 });
      fetchAccounts();
    } catch (err) {
      console.error("Errore inserimento:", err);
    }
  };

  const deleteAccount = async (id) => {
    if(!window.confirm("Sicuro di voler eliminare questo conto? Se ha transazioni collegate, non potrà essere eliminato.")) return;
    try {
      const res = await fetch(`${API_URL}/accounts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Errore eliminazione");
      fetchAccounts();
    } catch(err) {
      alert("Errore. Impossibile eliminare un conto se contiene già delle transazioni.");
    }
  };

  const startEdit = (acc) => {
    setEditingId(acc.id);
    setEditAccount({ ...acc });
  };

  const saveEdit = async () => {
    if (!editAccount.name || !editAccount.type) return;
    try {
      const res = await fetch(`${API_URL}/accounts/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editAccount)
      });
      if (!res.ok) throw new Error("Errore modifica");
      setEditingId(null);
      fetchAccounts();
    } catch (err) {
      console.error("Errore modifica:", err);
    }
  };

  return (
    <div>
      <h2 className="chart-title" style={{marginBottom: '20px'}}>I tuoi Conti e Carte</h2>
      
      {accounts.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Nessun conto configurato. Aggiungine uno qui sotto!
        </div>
      ) : (
        <div className="dashboard-grid">
          {accounts.map(acc => (
            <div className="card" key={acc.id}>
              {editingId === acc.id ? (
                // FORM DI MODIFICA
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="text"
                    className="text-input" 
                    value={editAccount.name} 
                    placeholder="Nome"
                    onChange={e => setEditAccount({...editAccount, name: e.target.value})} 
                  />
                  <input 
                    type="text" 
                    placeholder="Tipo (es. Conto Corrente)" 
                    className="text-input"
                    value={editAccount.type}
                    onChange={e => setEditAccount({...editAccount, type: e.target.value})}
                    required
                  />
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Saldo Iniziale (Giorno 0) €"
                    className="text-input" 
                    value={editAccount.initial_balance} 
                    onChange={e => setEditAccount({...editAccount, initial_balance: parseFloat(e.target.value) || 0})} 
                  />
                  <input 
                    type="password" 
                    placeholder="Password Admin (per sbloccare saldo)"
                    className="text-input" 
                    value={editAccount.admin_password || ''} 
                    onChange={e => setEditAccount({...editAccount, admin_password: e.target.value})} 
                  />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={saveEdit} style={{ flex: 1, background: 'var(--accent-green)', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center'}}><Check size={18} /></button>
                    <button onClick={() => setEditingId(null)} style={{ flex: 1, background: 'var(--border-color)', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center'}}><X size={18} /></button>
                  </div>
                </div>
              ) : (
                // VISUALIZZAZIONE NORMALE
                <>
                  <div className="card-header">
                    <h3 className="card-title">{acc.name}</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Edit2 size={16} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => startEdit(acc)} />
                      <Trash2 size={16} style={{ cursor: 'pointer', color: 'var(--accent-red)' }} onClick={() => deleteAccount(acc.id)} />
                    </div>
                  </div>
                  <div className={`card-value ${acc.current_balance < 0 ? 'value-negative' : 'value-positive'}`}>
                    € {Number(acc.current_balance).toFixed(2)}
                  </div>
                  <div className="card-subtitle">
                    Tipo: {acc.type} <br/>
                    <span style={{opacity: 0.6, fontSize: '0.85em', display: 'inline-block', marginTop: '4px'}}>
                      Saldo di partenza: € {Number(acc.initial_balance).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FORM AGGIUNTA */}
      <div className="card" style={{marginTop: '30px'}}>
        <h3 className="card-title">Aggiungi nuovo conto</h3>
        <form onSubmit={addAccount} style={{ display: 'flex', gap: '15px', marginTop: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Nome (es. Fineco, Digital...)" 
            className="text-input"
            style={{ flex: 1, minWidth: '200px' }}
            value={newAccount.name}
            onChange={e => setNewAccount({...newAccount, name: e.target.value})}
            required
          />
          
          <input 
            type="text" 
            placeholder="Tipo (es. Conto, Contanti...)" 
            className="text-input"
            style={{ width: '220px' }}
            value={newAccount.type}
            onChange={e => setNewAccount({...newAccount, type: e.target.value})}
            required
          />

          <input 
            type="number" 
            step="0.01"
            placeholder="Saldo di Partenza €" 
            className="text-input"
            style={{ width: '150px' }}
            value={newAccount.initial_balance}
            onChange={e => setNewAccount({...newAccount, initial_balance: parseFloat(e.target.value) || 0})}
          />
          <button 
            type="submit" 
            className="year-selector" 
            style={{ background: 'var(--accent-blue)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}
          >
            <Plus size={18} /> Aggiungi
          </button>
        </form>
      </div>
    </div>
  );
}
