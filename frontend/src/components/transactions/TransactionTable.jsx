import { ArrowDownRight, ArrowUpRight, Trash2, Edit2, Check, X, Copy } from 'lucide-react';

export default function TransactionTable({ 
  transactions, 
  accounts, 
  categories, 
  installments,
  editingId, 
  editTx, 
  setEditTx, 
  onStartEdit, 
  onSaveEdit, 
  onCancelEdit, 
  onDelete, 
  onDuplicate,
  onTypeChange,
  selectedIds = [],
  onToggleSelectAll,
  onToggleSelectOne,
  availableTags = []
}) {
  const isInv = categories.find(c => c.id === parseInt(editTx?.category_id))?.name === 'Investimenti';

  return (
    <div className="transactions-container">
      {/* VISTA DESKTOP (Tabella) */}
      <div className="desktop-only">
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={transactions.length > 0 && selectedIds.length === transactions.length} 
                  onChange={onToggleSelectAll}
                />
              </th>
              <th style={{ width: '50px', color: 'var(--text-secondary)', fontSize: '11px' }}>ID</th>
              <th>Data</th>
              <th>Conto</th>
              <th>Categoria</th>
              <th>Descrizione</th>
              <th>Finanziamento</th>
              <th style={{ textAlign: 'right' }}>Importo</th>
              <th style={{ textAlign: 'center', width: '80px' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan="9" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Nessuna transazione registrata.</td></tr>
            ) : (
              transactions.map(t => (
                editingId === t.id ? (
                  <tr key={t.id} style={{ backgroundColor: 'rgba(47, 129, 247, 0.1)' }}>
                    <td></td>
                    <td style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center' }}>{t.id}</td>
                    <td><input type="date" className="text-input" value={editTx.date} onChange={e => setEditTx({ ...editTx, date: e.target.value })} style={{ width: '130px' }} /></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <select className="year-selector" value={editTx.type} onChange={e => onTypeChange(e, true)} style={{ width: '100%', fontSize: '11px', height: '28px' }}>
                          <option value="expense">Uscita</option>
                          <option value="income">Entrata</option>
                          <option value="transfer">Giroconto</option>
                        </select>
                        <select className="year-selector" value={editTx.account_id || ''} onChange={e => setEditTx({ ...editTx, account_id: e.target.value })} style={{ width: '100%' }}>
                          <option value="">Nessuno (Vendita Titoli)</option>
                          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        {editTx.type === 'transfer' && (
                          <select className="year-selector" value={editTx.to_account_id || ''} onChange={e => setEditTx({ ...editTx, to_account_id: e.target.value })} style={{ width: '100%', border: isInv ? '1px solid var(--accent-green)' : '1px solid var(--accent-blue)' }}>
                            <option value="">Nessuno (Acquisto Titoli)</option>
                            {accounts.filter(a => a.id !== parseInt(editTx.account_id)).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                        )}
                      </div>
                    </td>
                    <td>
                      {editTx.type !== 'transfer' ? (
                        <select className="year-selector" value={editTx.category_id} onChange={e => setEditTx({ ...editTx, category_id: e.target.value })} style={{ width: '100%' }}>
                          {categories.filter(c => c.type === editTx.type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      ) : (
                        <select className="year-selector" value={editTx.category_id || ''} onChange={e => setEditTx({ ...editTx, category_id: e.target.value })} style={{ width: '100%' }}>
                           <option value="">Giroconto Standard</option>
                           {categories.filter(c => c.name === 'Investimenti').map(c => (
                             <option key={c.id} value={c.id}>Investimento</option>
                           ))}
                        </select>
                      )}
                    </td>
                    <td>
                      <input type="text" className="text-input" value={editTx.description} onChange={e => setEditTx({ ...editTx, description: e.target.value })} style={{ width: '100%' }} />
                      {/* Selettore Tag in Modifica Desktop */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                        {availableTags.map(tag => {
                          const isSelected = editTx.tags?.includes(tag.id);
                          return (
                            <span key={tag.id} onClick={() => {
                              const newTags = isSelected ? editTx.tags.filter(id => id !== tag.id) : [...(editTx.tags || []), tag.id];
                              setEditTx({ ...editTx, tags: newTags });
                            }} style={{ padding: '2px 6px', borderRadius: '8px', fontSize: '0.65em', cursor: 'pointer', border: `1px solid ${tag.color}`, background: isSelected ? tag.color : 'transparent', color: isSelected ? 'white' : tag.color, fontWeight: '600' }}>
                              #{tag.name}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <select className="year-selector" value={editTx.installment_id || ''} onChange={e => setEditTx({ ...editTx, installment_id: e.target.value })} style={{ width: '100%' }}>
                        <option value="">Nessun Finan.</option>
                        {installments.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                      <select 
                        className="year-selector" 
                        value={editTx.recurrence_type || 'monthly'} 
                        onChange={e => setEditTx({ ...editTx, recurrence_type: e.target.value })} 
                        style={{ width: '100%', marginTop: '5px', fontSize: '11px' }}
                      >
                        <option value="monthly">🔄 Mensile</option>
                        <option value="extraordinary">⚡ Straord.</option>
                        <option value="occasional">📅 Saltuaria</option>
                        <option value="yearly">🗓️ Annuale</option>
                        <option value="variable">📉 Variabile</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}><input type="number" step="0.01" className="text-input" value={editTx.amount} onChange={e => setEditTx({ ...editTx, amount: parseFloat(e.target.value) || '' })} style={{ width: '90px' }} /></td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={onSaveEdit} className="action-btn-green"><Check size={16} /></button>
                      <button onClick={onCancelEdit} className="action-btn-gray"><X size={16} /></button>
                    </td>
                  </tr>
                ) : (
                  <tr key={t.id} className={selectedIds.includes(t.id) ? 'selected-row' : ''}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(t.id)} 
                        onChange={() => onToggleSelectOne(t.id)}
                      />
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', fontWeight: '500' }}>{t.id}</td>
                    <td>{new Date(t.date).toLocaleDateString('it-IT')}</td>
                    <td>{t.type === 'transfer' ? `${t.account_name || 'Investimento'} → ${t.to_account_name || 'Investimento'}` : t.account_name}</td>
                    <td>{t.type === 'transfer' ? (t.category_name || 'Giroconto') : t.category_name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {(!t.recurrence_type || t.recurrence_type === 'monthly') && <span title="Mensile" style={{ cursor: 'help', opacity: 0.5 }}>🔄</span>}
                        {t.recurrence_type === 'extraordinary' && <span title="Straordinaria" style={{ cursor: 'help' }}>⚡</span>}
                        {t.recurrence_type === 'occasional' && <span title="Saltuaria" style={{ cursor: 'help' }}>📅</span>}
                        {t.recurrence_type === 'yearly' && <span title="Annuale" style={{ cursor: 'help' }}>🗓️</span>}
                        {t.recurrence_type === 'variable' && <span title="Variabile" style={{ cursor: 'help' }}>📉</span>}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{t.description || '-'}</span>
                          {/* Visualizzazione Tag Desktop */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                            {t.tags && t.tags.map(tag => (
                              <span key={tag.id} title={tag.description} style={{ fontSize: '0.65em', padding: '1px 6px', borderRadius: '8px', border: `1px solid ${tag.color}`, color: tag.color, fontWeight: '600', cursor: 'help' }}>
                                #{tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{t.installment_id ? installments.find(i => i.id === t.installment_id)?.name : '-'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      <span className={t.type === 'income' ? 'value-positive' : t.type === 'expense' ? 'value-negative' : ''}>
                        {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''} €{Number(t.amount).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Copy size={16} className="edit-icon" style={{ color: 'var(--accent-blue)', marginRight: '8px' }} onClick={() => onDuplicate(t)} title="Duplica transazione" />
                      <Edit2 size={16} className="edit-icon" onClick={() => onStartEdit(t)} title="Modifica" />
                      <Trash2 size={16} className="delete-icon" onClick={() => onDelete(t.id)} title="Elimina" />
                    </td>
                  </tr>
                )
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VISTA MOBILE (Cards) */}
      <div className="mobile-only">
        {transactions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Nessuna transazione.</div>
        ) : (
          transactions.map(t => (
            <div key={t.id} className={`mobile-tx-card ${editingId === t.id ? 'editing' : ''} ${selectedIds.includes(t.id) ? 'selected' : ''}`}>
              {editingId !== t.id && (
                <div style={{ position: 'absolute', left: '10px', top: '10px', zIndex: 2 }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(t.id)} 
                    onChange={() => onToggleSelectOne(t.id)}
                    style={{ width: '18px', height: '18px' }}
                  />
                </div>
              )}
              {editingId === t.id ? (
                <div className="mobile-edit-form">
                  <div className="form-group">
                    <label>Data & Importo (ID: {editTx.id})</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="date" className="text-input" value={editTx.date} onChange={e => setEditTx({ ...editTx, date: e.target.value })} />
                      <input type="number" step="0.01" className="text-input" value={editTx.amount} onChange={e => setEditTx({ ...editTx, amount: parseFloat(e.target.value) || '' })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Tipo & Categoria</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select className="year-selector" value={editTx.type} onChange={e => onTypeChange(e, true)}>
                        <option value="expense">Uscita</option>
                        <option value="income">Entrata</option>
                        <option value="transfer">Giroconto</option>
                      </select>
                      {editTx.type !== 'transfer' ? (
                        <select className="year-selector" value={editTx.category_id} onChange={e => setEditTx({ ...editTx, category_id: e.target.value })}>
                          {categories.filter(c => c.type === editTx.type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      ) : (
                        <select className="year-selector" value={editTx.category_id || ''} onChange={e => setEditTx({ ...editTx, category_id: e.target.value })}>
                           <option value="">Giroconto Standard</option>
                           {categories.filter(c => c.name === 'Investimenti').map(c => (
                             <option key={c.id} value={c.id}>Investimento</option>
                           ))}
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Conto {editTx.type === 'transfer' ? 'Origine' : ''}</label>
                    <select className="year-selector" value={editTx.account_id || ''} onChange={e => setEditTx({ ...editTx, account_id: e.target.value })}>
                      <option value="">Nessuno (Vendita Titoli)</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  {editTx.type === 'transfer' && (
                    <div className="form-group">
                      <label>Conto Destinazione</label>
                      <select className="year-selector" value={editTx.to_account_id || ''} onChange={e => setEditTx({ ...editTx, to_account_id: e.target.value })}>
                        <option value="">Nessuno (Acquisto Titoli)</option>
                        {accounts.filter(a => a.id !== parseInt(editTx.account_id)).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="form-group">
                    <label>Descrizione</label>
                    <input type="text" className="text-input" value={editTx.description} onChange={e => setEditTx({ ...editTx, description: e.target.value })} />
                    {/* Selettore Tag in Modifica Mobile */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                      {availableTags.map(tag => {
                        const isSelected = editTx.tags?.includes(tag.id);
                        return (
                          <span key={tag.id} onClick={() => {
                            const newTags = isSelected ? editTx.tags.filter(id => id !== tag.id) : [...(editTx.tags || []), tag.id];
                            setEditTx({ ...editTx, tags: newTags });
                          }} style={{ padding: '4px 10px', borderRadius: '10px', fontSize: '0.7em', border: `1px solid ${tag.color}`, background: isSelected ? tag.color : 'transparent', color: isSelected ? 'white' : tag.color, fontWeight: '600' }}>
                            #{tag.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Finanziamento & Ricorrenza</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select className="year-selector" value={editTx.installment_id || ''} onChange={e => setEditTx({ ...editTx, installment_id: e.target.value })}>
                        <option value="">Nessun Finanziamento</option>
                        {installments.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                      <select className="year-selector" value={editTx.recurrence_type || 'monthly'} onChange={e => setEditTx({ ...editTx, recurrence_type: e.target.value })}>
                        <option value="monthly">🔄 Mensile</option>
                        <option value="extraordinary">⚡ Straord.</option>
                        <option value="occasional">📅 Saltuaria</option>
                        <option value="yearly">🗓️ Annuale</option>
                        <option value="variable">📉 Variabile</option>
                      </select>
                    </div>
                  </div>
                  <div className="mobile-edit-actions">
                    <button onClick={onSaveEdit} className="save-btn"><Check size={20} /> Salva</button>
                    <button onClick={onCancelEdit} className="cancel-btn"><X size={20} /> Annulla</button>
                  </div>
                </div>
              ) : (
                <div className="tx-card-content">
                  <div className="tx-card-main">
                    <div className="tx-card-info">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="tx-card-date">{new Date(t.date).toLocaleDateString('it-IT')}</div>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>ID: {t.id}</span>
                      </div>
                      <div className="tx-card-desc">
                        {(!t.recurrence_type || t.recurrence_type === 'monthly') && <span style={{ marginRight: '5px', opacity: 0.5 }}>🔄</span>}
                        {t.recurrence_type === 'extraordinary' && <span style={{ marginRight: '5px' }}>⚡</span>}
                        {t.recurrence_type === 'occasional' && <span style={{ marginRight: '5px' }}>📅</span>}
                        {t.recurrence_type === 'yearly' && <span style={{ marginRight: '5px' }}>🗓️</span>}
                        {t.recurrence_type === 'variable' && <span style={{ marginRight: '5px' }}>📉</span>}
                        {t.description || '-'}
                      </div>
                      {/* Visualizzazione Tag Mobile */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {t.tags && t.tags.map(tag => (
                          <span key={tag.id} title={tag.description} style={{ fontSize: '0.6em', padding: '1px 6px', borderRadius: '8px', border: `1px solid ${tag.color}`, color: tag.color, fontWeight: '600' }}>
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                        <span className="tx-card-category">{t.type === 'transfer' ? (t.category_name || 'Giroconto') : t.category_name}</span>
                        <span className="tx-card-account">{t.type === 'transfer' ? `${t.account_name || 'Inv'} → ${t.to_account_name || 'Inv'}` : t.account_name}</span>
                        {t.installment_id && (
                          <span className="tx-card-category" style={{ background: 'rgba(47, 129, 247, 0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(47, 129, 247, 0.3)' }}>
                            {installments.find(i => i.id === t.installment_id)?.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`tx-card-amount ${t.type === 'income' ? 'value-positive' : t.type === 'expense' ? 'value-negative' : ''}`}>
                      {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''} €{Number(t.amount).toFixed(2)}
                    </div>
                  </div>
                  <div className={`tx-card-actions`}>
                    <button onClick={() => onDuplicate(t)} style={{ color: 'var(--accent-blue)' }}><Copy size={18} /> Duplica</button>
                    <button onClick={() => onStartEdit(t)}><Edit2 size={18} /> Modifica</button>
                    <button onClick={() => onDelete(t.id)} className="delete-btn"><Trash2 size={18} /> Elimina</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
