import { useState, useEffect } from 'react';
import { Plus, Tag } from 'lucide-react';
import DashboardGrid from './common/DashboardGrid';
import PageHeader from './common/PageHeader';
import FormInput from './common/FormInput';
import FormSelect from './common/FormSelect';
import AppButton from './common/AppButton';
import CategoryItem from './config/CategoryItem';
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

  const handleUpdateCategory = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error("Errore aggiornamento categoria");
      fetchCategories();
      return true;
    } catch (err) {
      console.error("Errore aggiornamento categoria:", err);
      alert("Errore nell'aggiornamento della categoria.");
      return false;
    }
  };

  const incomes = categories.filter(c => c.type === 'income');
  const expenses = categories.filter(c => c.type === 'expense');

  return (
    <div>
      <PageHeader 
        title="Configurazione Categorie" 
        description="Gestisci le categorie per le tue entrate e uscite."
      />

      <div className="card" style={{marginBottom: '30px'}}>
        <h3 className="card-title">Aggiungi nuova Categoria</h3>
        <form onSubmit={addCategory} style={{ display: 'flex', gap: '15px', marginTop: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <FormSelect 
            value={newCat.type}
            onChange={val => setNewCat({...newCat, type: val})}
            options={[
              { value: 'expense', label: 'Spesa (Uscita)' },
              { value: 'income', label: 'Entrata' }
            ]}
            style={{ width: '200px' }}
          />
          <FormInput 
            placeholder="Nome (es. Supermercato, Affitto...)" 
            containerStyle={{ flex: 1, minWidth: '200px' }}
            value={newCat.name}
            onChange={val => setNewCat({...newCat, name: val})}
            required
          />
          <AppButton type="submit" icon={Plus}>Aggiungi</AppButton>
        </form>
      </div>

      <DashboardGrid>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Categorie Uscite</h3>
            <Tag className="card-icon value-negative" size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
            {expenses.map(c => (
              <CategoryItem 
                key={c.id} 
                category={c} 
                onUpdate={handleUpdateCategory} 
                onDelete={deleteCategory} 
              />
            ))}
            {expenses.length === 0 && <span style={{ color: 'var(--text-secondary)', padding: '10px' }}>Nessuna categoria</span>}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Categorie Entrate</h3>
            <Tag className="card-icon value-positive" size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
            {incomes.map(c => (
              <CategoryItem 
                key={c.id} 
                category={c} 
                onUpdate={handleUpdateCategory} 
                onDelete={deleteCategory} 
              />
            ))}
            {incomes.length === 0 && <span style={{ color: 'var(--text-secondary)', padding: '10px' }}>Nessuna categoria</span>}
          </div>
        </div>
      </DashboardGrid>
    </div>
  );
}
