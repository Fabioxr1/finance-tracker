import { useState, useEffect } from 'react';
import { Wallet, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import DashboardGrid from './common/DashboardGrid';
import ActionCard from './common/ActionCard';
import PageHeader from './common/PageHeader';
import FormInput from './common/FormInput';
import AppButton from './common/AppButton';
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
      <PageHeader 
        title="I tuoi Conti e Carte" 
        description={`Gestisci i tuoi asset finanziari. Hai ${accounts.length} conti configurati.`}
      />
      
      {accounts.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Nessun conto configurato. Aggiungine uno qui sotto!
        </div>
      ) : (
        <DashboardGrid>
          {accounts.map(acc => {
            const isEditing = editingId === acc.id;
            
            return (
              <ActionCard
                key={acc.id}
                title={isEditing ? 'Modifica Conto' : acc.name}
                icon={Wallet}
                accentColor="var(--accent-blue)"
                isActive={true}
                amount={!isEditing ? `€ ${Number(acc.current_balance).toFixed(2)}` : undefined}
                amountClassName={acc.current_balance < 0 ? 'value-negative' : 'value-positive'}
                actions={!isEditing ? (
                  <div style={{ display: 'flex', gap: '15px', width: '100%', justifyContent: 'flex-end' }}>
                    <Edit2 size={16} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => startEdit(acc)} />
                    <Trash2 size={16} style={{ cursor: 'pointer', color: 'var(--accent-red)' }} onClick={() => deleteAccount(acc.id)} />
                  </div>
                ) : null}
              >
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <FormInput 
                      value={editAccount.name} 
                      placeholder="Nome"
                      onChange={val => setEditAccount({...editAccount, name: val})} 
                    />
                    <FormInput 
                      placeholder="Tipo (es. Conto Corrente)" 
                      value={editAccount.type}
                      onChange={val => setEditAccount({...editAccount, type: val})}
                      required
                    />
                    <FormInput 
                      type="number" 
                      step="0.01" 
                      placeholder="Saldo Iniziale €"
                      value={editAccount.initial_balance} 
                      onChange={val => setEditAccount({...editAccount, initial_balance: parseFloat(val) || 0})} 
                    />
                    <FormInput 
                      type="password" 
                      placeholder="Password Admin"
                      value={editAccount.admin_password || ''} 
                      onChange={val => setEditAccount({...editAccount, admin_password: val})} 
                    />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <AppButton variant="success" onClick={saveEdit} style={{ flex: 1 }} icon={Check} />
                      <AppButton variant="outline" onClick={() => setEditingId(null)} style={{ flex: 1 }} icon={X} />
                    </div>
                  </div>
                ) : (
                  <div className="card-subtitle">
                    Tipo: {acc.type} <br/>
                    <span style={{opacity: 0.6, fontSize: '0.85em', display: 'inline-block', marginTop: '4px'}}>
                      Saldo di partenza: € {Number(acc.initial_balance).toFixed(2)}
                    </span>
                  </div>
                )}
              </ActionCard>
            );
          })}
        </DashboardGrid>
      )}

      {/* FORM AGGIUNTA */}
      <div className="card" style={{marginTop: '30px'}}>
        <h3 className="card-title">Aggiungi nuovo conto</h3>
        <form onSubmit={addAccount} style={{ display: 'flex', gap: '15px', marginTop: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <FormInput 
            placeholder="Nome (es. Fineco, Digital...)" 
            containerStyle={{ flex: 1, minWidth: '200px' }}
            value={newAccount.name}
            onChange={val => setNewAccount({...newAccount, name: val})}
            required
          />
          
          <FormInput 
            placeholder="Tipo (es. Conto, Contanti...)" 
            containerStyle={{ width: '220px' }}
            value={newAccount.type}
            onChange={val => setNewAccount({...newAccount, type: val})}
            required
          />

          <FormInput 
            type="number" 
            step="0.01"
            placeholder="Saldo di Partenza €" 
            containerStyle={{ width: '150px' }}
            value={newAccount.initial_balance}
            onChange={val => setNewAccount({...newAccount, initial_balance: parseFloat(val) || 0})}
          />
          <AppButton type="submit" icon={Plus}>Aggiungi</AppButton>
        </form>
      </div>
    </div>
  );
}
