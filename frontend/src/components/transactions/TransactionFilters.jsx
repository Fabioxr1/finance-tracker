import { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';

export default function TransactionFilters({ filters, setFilters, accounts, categories, installments = [], availableTags = [], setPage }) {
  const years = [...Array(10)].map((_, i) => new Date().getFullYear() - i);
  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  
  // Stato locale per la ricerca per permettere il debouncing
  const [searchTerm, setSearchTerm] = useState(filters.description || '');

  // Effetto per il debouncing della ricerca
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== filters.description) {
        setFilters(prev => ({ ...prev, description: searchTerm }));
        setPage(1);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Sincronizza lo stato locale se i filtri vengono resettati esternamente
  useEffect(() => {
    setSearchTerm(filters.description || '');
  }, [filters.description]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  return (
    <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Barra di Ricerca Principale */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search 
            size={18} 
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} 
          />
          <input 
            type="text" 
            placeholder="Cerca per descrizione o parola chiave..." 
            className="text-input" 
            style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px', fontSize: '15px', height: '45px', border: searchTerm ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <X 
              size={18} 
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', cursor: 'pointer' }} 
            />
          )}
        </div>

        {/* Filtri Secondari */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', marginRight: '10px' }}>
            <Filter size={16} />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Filtri:</span>
          </div>
          
          <select className="year-selector" value={filters.year} onChange={e => handleFilterChange('year', e.target.value)}>
            <option value="">Anni</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select className="year-selector" value={filters.month} onChange={e => handleFilterChange('month', e.target.value)}>
            <option value="">Mesi</option>
            {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>

          <select className="year-selector" value={filters.type} onChange={e => handleFilterChange('type', e.target.value)}>
            <option value="">Tutti i tipi</option>
            <option value="expense">Uscite</option>
            <option value="income">Entrate</option>
            <option value="transfer">Giroconti</option>
          </select>

          <select className="year-selector" value={filters.account_id} onChange={e => handleFilterChange('account_id', e.target.value)}>
            <option value="">Tutti i conti</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          <select className="year-selector" value={filters.category_id} onChange={e => handleFilterChange('category_id', e.target.value)}>
            <option value="">Tutte le categorie</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type === 'income' ? 'E' : 'U'})</option>)}
          </select>

          <select className="year-selector" value={filters.installment_id} onChange={e => handleFilterChange('installment_id', e.target.value)}>
            <option value="">Tutti i finanz.</option>
            {installments.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>

          <select 
            className="year-selector" 
            value={filters.tag_id || ''} 
            onChange={e => handleFilterChange('tag_id', e.target.value)}
            style={{ border: filters.tag_id ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)' }}
          >
            <option value="">Tutti i tag #</option>
            {availableTags.map(tag => (
              <option key={tag.id} value={tag.id}>#{tag.name}</option>
            ))}
          </select>

          <input 
            type="number" 
            placeholder="ID" 
            className="year-selector" 
            style={{ width: '70px', paddingLeft: '8px' }}
            value={filters.id || ''} 
            onChange={e => handleFilterChange('id', e.target.value)}
          />

          <input 
            type="text" 
            placeholder="Prezzo €" 
            className="year-selector" 
            style={{ width: '100px', paddingLeft: '8px' }}
            value={filters.amount || ''} 
            onChange={e => handleFilterChange('amount', e.target.value)}
          />

          {(filters.year || filters.month || filters.type || filters.account_id || filters.category_id || filters.description || filters.installment_id || filters.tag_id || filters.id || filters.amount) && (
            <button 
              onClick={() => {
                setFilters({year: '', month: '', type: '', account_id: '', category_id: '', description: '', installment_id: '', tag_id: '', id: '', amount: ''});
                setSearchTerm('');
                setPage(1);
              }} 
              style={{ background: 'transparent', color: 'var(--accent-red)', border: '1px solid rgba(248,81,73,0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
            >
              Resetta filtri
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
