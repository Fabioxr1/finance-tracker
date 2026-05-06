import { useState, useEffect } from 'react';
import { Plus, Loader2, Save, X } from 'lucide-react';

export default function DeadlineForm({ categories, onSubmit, editDeadline, onCancelEdit }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    due_date: '',
    amount: '',
    category_id: '',
    description: '',
    is_recurring: false
  });

  // Popola il form se siamo in modalità modifica
  useEffect(() => {
    if (editDeadline) {
      // Formattiamo la data per l'input di tipo 'date' (YYYY-MM-DD)
      const formattedDate = new Date(editDeadline.due_date).toISOString().split('T')[0];
      setFormData({
        title: editDeadline.title,
        due_date: formattedDate,
        amount: editDeadline.amount || '',
        category_id: editDeadline.category_id || '',
        description: editDeadline.description || '',
        is_recurring: editDeadline.is_recurring || false
      });
    } else {
      setFormData({ title: '', due_date: '', amount: '', category_id: '', description: '', is_recurring: false });
    }
  }, [editDeadline]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Se stiamo modificando, passiamo anche l'ID e lo stato originale
    const dataToSend = editDeadline ? { ...editDeadline, ...formData } : formData;
    const success = await onSubmit(dataToSend);
    
    if (success && !editDeadline) {
      setFormData({ 
        title: '', 
        due_date: '', 
        amount: '', 
        category_id: '', 
        description: '', 
        is_recurring: false 
      });
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginBottom: '20px', border: editDeadline ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)' }}>
      <h3 className="card-title">{editDeadline ? 'Modifica Scadenza' : 'Nuova Scadenza'}</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '15px' }}>
        <input 
          type="text" 
          placeholder="Titolo (obbligatorio)" 
          className="text-input" 
          style={{ flex: 2, minWidth: '200px' }}
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          required
        />
        <input 
          type="date" 
          className="text-input" 
          style={{ flex: 1 }}
          value={formData.due_date}
          onChange={e => setFormData({...formData, due_date: e.target.value})}
          required
        />
        <input 
          type="number" 
          placeholder="Importo €" 
          className="text-input" 
          style={{ flex: 1, minWidth: '100px' }}
          value={formData.amount}
          onChange={e => setFormData({...formData, amount: e.target.value})}
        />
        <select 
          className="year-selector" 
          style={{ flex: 1 }}
          value={formData.category_id}
          onChange={e => setFormData({...formData, category_id: e.target.value})}
        >
          <option value="">Senza Categoria</option>
          {categories.filter(c => c.type === 'expense').map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9em' }}>
          <input 
            type="checkbox" 
            id="recurring"
            checked={formData.is_recurring}
            onChange={e => setFormData({...formData, is_recurring: e.target.checked})}
          />
          <label htmlFor="recurring">Ricorrente (Annuale)</label>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            disabled={loading}
            className="year-selector" 
            style={{ 
              background: loading ? 'var(--bg-hover)' : 'var(--accent-blue)', 
              color: 'white', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px' 
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (editDeadline ? <Save size={18} /> : <Plus size={18} />)} 
            {loading ? 'Salvataggio...' : (editDeadline ? 'Salva Modifiche' : 'Aggiungi')}
          </button>
          
          {editDeadline && (
            <button 
              type="button" 
              onClick={onCancelEdit}
              className="year-selector" 
              style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <X size={18} /> Annulla
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
