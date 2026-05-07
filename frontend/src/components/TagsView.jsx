import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, X, Edit2, Check } from 'lucide-react';
import DashboardGrid from './common/DashboardGrid';
import '../index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function TagsView() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState({ name: '', color: '#3b82f6', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editTag, setEditTag] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await fetch(`${API_URL}/tags`);
      const data = await res.json();
      setTags(data);
    } catch (err) {
      console.error("Errore caricamento tag:", err);
    }
  };

  const addTag = async (e) => {
    e.preventDefault();
    if (!newTag.name) return;
    setError('');

    try {
      const res = await fetch(`${API_URL}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTag)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Errore inserimento");

      setNewTag({ name: '', color: '#3b82f6', description: '' });
      fetchTags();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (tag) => {
    setEditingId(tag.id);
    setEditTag({ ...tag });
  };

  const saveEdit = async () => {
    if (!editTag.name) return;
    try {
      const res = await fetch(`${API_URL}/tags/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTag)
      });
      if (!res.ok) throw new Error("Errore modifica");
      setEditingId(null);
      fetchTags();
    } catch (err) {
      console.error("Errore modifica:", err);
    }
  };

  const deleteTag = async (id) => {
    if (!window.confirm("Eliminare questo tag? Le transazioni esistenti perderanno il riferimento a questo tag.")) return;
    try {
      await fetch(`${API_URL}/tags/${id}`, { method: 'DELETE' });
      fetchTags();
    } catch (err) {
      console.error("Errore eliminazione:", err);
    }
  };

  return (
    <div>
      <h2 className="chart-title" style={{ marginBottom: '20px' }}>Gestione Tag</h2>
      
      <DashboardGrid minWidth="220px">
        {tags.map(tag => (
          <div className="card" key={tag.id} style={{ borderLeft: `4px solid ${tag.color}`, padding: '15px' }}>
            {editingId === tag.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input 
                    type="text" 
                    className="text-input" 
                    value={editTag.name} 
                    onChange={e => setEditTag({...editTag, name: e.target.value})} 
                  />
                  <input 
                    type="color" 
                    value={editTag.color} 
                    onChange={e => setEditTag({...editTag, color: e.target.value})} 
                    style={{ width: '40px', padding: '0', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  />
                </div>
                <input 
                  type="text" 
                  className="text-input" 
                  placeholder="Descrizione (opzionale)"
                  style={{ fontSize: '0.8em' }}
                  value={editTag.description || ''} 
                  onChange={e => setEditTag({...editTag, description: e.target.value})} 
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={saveEdit} style={{ flex: 1, background: 'var(--accent-green)', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}><Check size={16} /></button>
                  <button onClick={() => setEditingId(null)} style={{ flex: 1, background: 'var(--border-color)', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}><X size={16} /></button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Tag size={18} style={{ color: tag.color }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '600', fontSize: '1.1em' }}>#{tag.name}</span>
                    {tag.description && <span style={{ fontSize: '0.75em', color: 'var(--text-secondary)', marginTop: '2px' }}>{tag.description}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Edit2 
                    size={16} 
                    style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} 
                    onClick={() => startEdit(tag)} 
                  />
                  <Trash2 
                    size={16} 
                    style={{ cursor: 'pointer', color: 'var(--accent-red)', opacity: 0.7 }} 
                    onClick={() => deleteTag(tag.id)} 
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </DashboardGrid>

      <div className="card" style={{ marginTop: '30px', maxWidth: '500px' }}>
        <h3 className="card-title">Crea nuovo Tag</h3>
        <form onSubmit={addTag} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Nome tag (es. essenziale, extra...)" 
              className="text-input"
              style={{ flex: 1 }}
              value={newTag.name}
              onChange={e => setNewTag({ ...newTag, name: e.target.value })}
              required
            />
            <input 
              type="color" 
              className="text-input"
              style={{ width: '50px', padding: '2px', cursor: 'pointer' }}
              value={newTag.color}
              onChange={e => setNewTag({ ...newTag, color: e.target.value })}
            />
          </div>
          
          <textarea 
            placeholder="Descrizione (opzionale - es. Spese per la casa)" 
            className="text-input"
            style={{ width: '100%', minHeight: '60px', resize: 'vertical' }}
            value={newTag.description || ''}
            onChange={e => setNewTag({ ...newTag, description: e.target.value })}
          />
          
          {error && <div style={{ color: 'var(--accent-red)', fontSize: '0.9em' }}>{error}</div>}

          <button 
            type="submit" 
            className="year-selector" 
            style={{ background: 'var(--accent-blue)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', justifyContent: 'center' }}
          >
            <Plus size={18} /> Aggiungi Tag
          </button>
        </form>
      </div>
    </div>
  );
}
