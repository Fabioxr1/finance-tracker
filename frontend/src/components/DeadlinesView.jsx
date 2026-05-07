import { useState, useEffect } from 'react';
import DeadlineForm from './deadlines/DeadlineForm';
import DeadlineList from './deadlines/DeadlineList';
import { Search, Filter, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import PageHeader from './common/PageHeader';
import FormInput from './common/FormInput';
import FormSelect from './common/FormSelect';
import AppButton from './common/AppButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ITEMS_PER_PAGE = 20;

export default function DeadlinesView() {
  const [deadlines, setDeadlines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDeadline, setEditingDeadline] = useState(null);

  // Stati per Filtri e Paginazione
  const [filterTitle, setFilterTitle] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchInitialData = async () => {
    try {
      const [deadlinesRes, catRes] = await Promise.all([
        fetch(`${API_URL}/deadlines`).then(r => r.json()),
        fetch(`${API_URL}/categories`).then(r => r.json())
      ]);
      setDeadlines(deadlinesRes);
      setCategories(catRes);
      setLoading(false);
    } catch (err) {
      console.error("Errore recupero dati scadenze:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchDeadlines = async () => {
    try {
      const res = await fetch(`${API_URL}/deadlines`);
      const data = await res.json();
      setDeadlines(data);
    } catch (err) {
      console.error("Errore refresh scadenze:", err);
    }
  };

  const handleSaveDeadline = async (formData) => {
    try {
      let res;
      if (editingDeadline) {
        res = await fetch(`${API_URL}/deadlines/${editingDeadline.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        setEditingDeadline(null);
      } else {
        res = await fetch(`${API_URL}/deadlines`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Operazione fallita");
      }
      fetchDeadlines();
      return true;
    } catch (err) {
      alert("Operazione fallita: " + err.message);
      return false;
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const deadline = deadlines.find(d => d.id === id);
    try {
      const res = await fetch(`${API_URL}/deadlines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...deadline, status })
      });
      if (!res.ok) throw new Error("Errore aggiornamento stato");
      fetchDeadlines();
    } catch (err) {
      alert("Errore aggiornamento stato");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa scadenza?")) return;
    try {
      const res = await fetch(`${API_URL}/deadlines/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Errore eliminazione");
      fetchDeadlines();
      if (editingDeadline?.id === id) setEditingDeadline(null);
    } catch (err) {
      alert("Errore eliminazione");
    }
  };

  // LOGICA FILTRAGGIO
  const filteredDeadlines = deadlines.filter(d => {
    const matchesTitle = d.title.toLowerCase().includes(filterTitle.toLowerCase());
    const matchesCategory = filterCategory === '' || String(d.category_id) === filterCategory;
    return matchesTitle && matchesCategory;
  });

  // LOGICA PAGINAZIONE
  const totalPages = Math.ceil(filteredDeadlines.length / ITEMS_PER_PAGE);
  const paginatedDeadlines = filteredDeadlines.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset pagina se cambiano i filtri
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTitle, filterCategory]);

  return (
    <div className="deadlines-view">
      <PageHeader 
        title="Gestione Scadenze" 
        description={`Pianifica i tuoi pagamenti futuri. ${filteredDeadlines.length} risultati trovati.`}
      />

      <DeadlineForm 
        categories={categories} 
        onSubmit={handleSaveDeadline} 
        editDeadline={editingDeadline}
        onCancelEdit={() => setEditingDeadline(null)}
      />

      {/* BARRA FILTRI */}
      <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
          <FormInput 
            placeholder="Cerca per titolo..." 
            icon={Search}
            value={filterTitle}
            onChange={setFilterTitle}
            debounceMs={300}
            onClear={() => setFilterTitle('')}
            containerStyle={{ flex: 2, minWidth: '200px' }}
          />
          
          <FormSelect 
            placeholder="Tutte le categorie"
            icon={Filter}
            value={filterCategory}
            onChange={setFilterCategory}
            options={categories.filter(c => c.type === 'expense').map(c => ({ value: c.id, label: c.name }))}
            containerStyle={{ flex: 1, minWidth: '180px' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Caricamento...</div>
      ) : (
        <>
          <DeadlineList 
            deadlines={paginatedDeadlines} 
            onUpdateStatus={handleUpdateStatus} 
            onDelete={handleDelete} 
            onEdit={(d) => {
              setEditingDeadline(d);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* CONTROLLI PAGINAZIONE */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '30px', padding: '20px 0' }}>
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px 20px',
                  borderRadius: '12px',
                  background: currentPage === 1 ? 'transparent' : 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer', 
                  opacity: currentPage === 1 ? 0.3 : 1,
                  transition: 'all 0.2s',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                <ChevronLeft size={18} /> PRECEDENTE
              </button>
              
              <span style={{ fontWeight: '700', color: 'var(--accent-blue)', fontSize: '0.95rem' }}>
                PAGINA {currentPage} <span style={{ color: 'var(--text-secondary)', fontWeight: '400', margin: '0 5px' }}>DI</span> {totalPages}
              </span>
              
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px 20px',
                  borderRadius: '12px',
                  background: currentPage === totalPages ? 'transparent' : 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-primary)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', 
                  opacity: currentPage === totalPages ? 0.3 : 1,
                  transition: 'all 0.2s',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                SUCCESSIVA <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
