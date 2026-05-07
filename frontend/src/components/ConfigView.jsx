import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import DashboardGrid from './common/DashboardGrid';
import '../index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ConfigView() {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState({ name: '', type: 'expense' });

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Errore nel caricamento categorie:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCat.name) return;
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat)
      });
      if (!res.ok) throw new Error("Errore aggiunta categoria");
      setNewCat({ ...newCat, name: '' });
      fetchCategories();
    } catch (err) {
      console.error("Errore aggiunta categoria:", err);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Sicuro di voler eliminare questa categoria?")) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Errore eliminazione categoria");
      fetchCategories();
    } catch (err) {
      console.error("Errore eliminazione categoria:", err);
      alert("Impossibile eliminare: la categoria è probabilmente associata a delle transazioni esistenti.");
    }
  };

  const incomes = categories.filter(c => c.type === 'income');
  const expenses = categories.filter(c => c.type === 'expense');

  return (
    <div>
      <h2 className="chart-title" style={{marginBottom: '20px'}}>Configurazione Categorie</h2>

      <div className="card" style={{marginBottom: '30px'}}>
        <h3 className="card-title">Aggiungi nuova Categoria</h3>
        <form onSubmit={addCategory} style={{ display: 'flex', gap: '15px', marginTop: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            className="year-selector"
            value={newCat.type}
            onChange={e => setNewCat({...newCat, type: e.target.value})}
          >
            <option value="expense">Spesa (Uscita)</option>
            <option value="income">Entrata</option>
          </select>
          <input 
            type="text" 
            placeholder="Nome (es. Supermercato, Affitto...)" 
            className="year-selector"
            style={{ flex: 1, minWidth: '200px' }}
            value={newCat.name}
            onChange={e => setNewCat({...newCat, name: e.target.value})}
            required
          />
          <button type="submit" className="year-selector" style={{ background: 'var(--accent-blue)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}>
            <Plus size={18} /> Aggiungi
          </button>
        </form>
      </div>

      <DashboardGrid>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Categorie Uscite</h3>
            <Tag className="card-icon value-negative" size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {expenses.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-hover)', borderRadius: '8px' }}>
                <span>{c.name}</span>
                <button onClick={() => deleteCategory(c.id)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}>
                   <Trash2 size={16} />
                </button>
              </div>
            ))}
            {expenses.length === 0 && <span style={{ color: 'var(--text-secondary)' }}>Nessuna categoria</span>}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Categorie Entrate</h3>
            <Tag className="card-icon value-positive" size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {incomes.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-hover)', borderRadius: '8px' }}>
                <span>{c.name}</span>
                <button onClick={() => deleteCategory(c.id)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}>
                   <Trash2 size={16} />
                </button>
              </div>
            ))}
            {incomes.length === 0 && <span style={{ color: 'var(--text-secondary)' }}>Nessuna categoria</span>}
          </div>
        </div>
      </DashboardGrid>
    </div>
  );
}
