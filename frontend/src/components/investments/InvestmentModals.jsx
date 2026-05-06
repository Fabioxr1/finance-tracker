import { X, Check, Trash2, Edit2 } from 'lucide-react';

export default function InvestmentModals({ 
  showAddTitle, setShowAddTitle,
  showEditTitle, setShowEditTitle,
  showAddTx, setShowAddTx,
  showHistory, setShowHistory,
  showAddPlan, setShowAddPlan,
  showExecutePlan, setShowExecutePlan,
  
  newTitle, setNewTitle,
  editTitleData, setEditTitleData,
  newTx, setNewTx,
  history,
  newPlan, setNewPlan,
  execPlanData, setExecPlanData,
  
  selectedInv,
  selectedPlan,
  accounts, portfolio,
  
  addTitle, updateTitle, addTransaction, deleteHistoryTx, startEditTx, saveEditTx, editingTxId, setEditingTxId, editTxData, setEditTxData, addPlan, executePlan
}) {

  return (
    <>
      {/* 1. NUOVO TITOLO */}
      {showAddTitle && (
        <div className="modal-overlay"><div className="modal-content card" style={{ width: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 className="card-title">Nuovo Titolo</h3>
            <X onClick={() => setShowAddTitle(false)} style={{ cursor: 'pointer' }} />
          </div>
          <form onSubmit={addTitle} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Nome" className="text-input" value={newTitle.name} onChange={e => setNewTitle({...newTitle, name: e.target.value})} required />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="Ticker" className="text-input" value={newTitle.ticker} onChange={e => setNewTitle({...newTitle, ticker: e.target.value})} required style={{flex: 1}} />
              <input type="text" placeholder="ISIN (opz.)" className="text-input" value={newTitle.isin} onChange={e => setNewTitle({...newTitle, isin: e.target.value})} style={{flex: 1}} />
            </div>
            <select className="year-selector" value={newTitle.type} onChange={e => setNewTitle({...newTitle, type: e.target.value})}>
              <option value="ETF">ETF</option>
              <option value="Azione">Azione</option>
              <option value="BTP">BTP / Obbligazione</option>
              <option value="Fondo">Fondo / Altro</option>
            </select>
            <select className="year-selector" value={newTitle.account_id} onChange={e => setNewTitle({...newTitle, account_id: e.target.value})} required>
              <option value="">Seleziona Conto Predefinito...</option>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
            <div style={{ background: 'var(--bg-hover)', padding: '10px', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85em', cursor: 'pointer' }}>
                <input type="checkbox" checked={newTitle.use_manual_price} onChange={e => setNewTitle({...newTitle, use_manual_price: e.target.checked})} />
                Usa Prezzo Manuale
              </label>
              {newTitle.use_manual_price && (
                <input type="number" step="0.0001" placeholder="Prezzo iniziale €" className="text-input" style={{ width: '100%', marginTop: '10px' }} value={newTitle.manual_price} onChange={e => setNewTitle({...newTitle, manual_price: e.target.value})} />
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="year-selector" style={{ background: 'var(--accent-blue)', color: 'white', flex: 1 }}>Salva</button>
              <button type="button" onClick={() => setShowAddTitle(false)} className="year-selector" style={{ flex: 1 }}>Annulla</button>
            </div>
          </form>
        </div></div>
      )}

      {/* 2. MODIFICA TITOLO */}
      {showEditTitle && (
        <div className="modal-overlay"><div className="modal-content card" style={{ width: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 className="card-title">Modifica Titolo</h3>
            <X onClick={() => setShowEditTitle(false)} style={{ cursor: 'pointer' }} />
          </div>
          <form onSubmit={updateTitle} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" className="text-input" value={editTitleData.name} onChange={e => setEditTitleData({...editTitleData, name: e.target.value})} placeholder="Nome" />
            <input type="text" className="text-input" value={editTitleData.ticker} onChange={e => setEditTitleData({...editTitleData, ticker: e.target.value})} placeholder="Ticker (es. SWDA.MI)" />
            <select className="year-selector" value={editTitleData.type} onChange={e => setEditTitleData({...editTitleData, type: e.target.value})}>
              <option value="ETF">ETF</option>
              <option value="Azione">Azione</option>
              <option value="BTP">BTP / Obbligazione</option>
              <option value="Fondo">Fondo / Altro</option>
            </select>
            <select className="year-selector" value={editTitleData.account_id} onChange={e => setEditTitleData({...editTitleData, account_id: e.target.value})}>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="year-selector" style={{ background: 'var(--accent-blue)', color: 'white', flex: 1 }}>Aggiorna</button>
              <button type="button" onClick={() => setShowEditTitle(false)} className="year-selector" style={{ flex: 1 }}>Annulla</button>
            </div>
          </form>
        </div></div>
      )}

      {/* 3. AGGIUNGI TRANSAZIONE */}
      {showAddTx && (
        <div className="modal-overlay"><div className="modal-content card" style={{ width: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 className="card-title">Movimento: {selectedInv?.name}</h3>
            <X onClick={() => setShowAddTx(false)} style={{ cursor: 'pointer' }} />
          </div>
          <form onSubmit={addTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select className="year-selector" value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})} style={{flex: 1}}>
                <option value="buy">Acquisto</option>
                <option value="sell">Vendita</option>
              </select>
              <input type="date" className="text-input" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} required style={{flex: 1}} />
            </div>
            <select className="year-selector" value={newTx.account_id} onChange={e => setNewTx({...newTx, account_id: e.target.value})} required>
              <option value="" disabled>Seleziona Conto</option>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '5px', fontSize: '0.85em', color: 'var(--text-secondary)' }}>Quote</div>
                <input type="number" step="0.0001" placeholder="Quote" className="text-input" value={newTx.shares} 
                  onChange={e => {
                    const shares = e.target.value;
                    const factor = (selectedInv?.type === 'BTP' || selectedInv?.type === 'Obbligazione') ? 100 : 1;
                    const total = (Number(shares) * Number(newTx.price_per_share)) / factor;
                    setNewTx({...newTx, shares, total_amount: total > 0 ? total.toFixed(2) : ''});
                  }} 
                  required style={{width: '100%'}} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '5px', fontSize: '0.85em', color: 'var(--text-secondary)' }}>Prezzo (€)</div>
                <input type="number" step="0.0001" placeholder="Prezzo" className="text-input" value={newTx.price_per_share} 
                  onChange={e => {
                    const price = e.target.value;
                    const factor = (selectedInv?.type === 'BTP' || selectedInv?.type === 'Obbligazione') ? 100 : 1;
                    const total = (Number(newTx.shares) * Number(price)) / factor;
                    setNewTx({...newTx, price_per_share: price, total_amount: total > 0 ? total.toFixed(2) : ''});
                  }} 
                  required style={{width: '100%'}} />
              </div>
            </div>

            <div style={{ marginBottom: '5px', fontSize: '0.85em', color: 'var(--text-secondary)' }}>Totale Movimento (€)</div>
            <input type="number" step="0.01" placeholder="Totale €" className="text-input" value={newTx.total_amount} 
              onChange={e => {
                const total = e.target.value;
                const factor = (selectedInv?.type === 'BTP' || selectedInv?.type === 'Obbligazione') ? 100 : 1;
                const price = Number(newTx.price_per_share);
                const shares = (price > 0 && total > 0) ? ((Number(total) * factor) / price).toFixed(4) : newTx.shares;
                setNewTx({...newTx, total_amount: total, shares});
              }}
              required />
            {newTx.type === 'sell' && selectedInv?.avgPrice > 0 && newTx.shares > 0 && newTx.price_per_share > 0 && (
              <div style={{ 
                background: 'rgba(255, 152, 0, 0.1)', 
                border: '1px solid rgba(255, 152, 0, 0.3)', 
                padding: '12px', 
                borderRadius: '8px',
                fontSize: '0.85em',
                color: '#ffa726',
                lineHeight: '1.4'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  💡 Promemoria Tasse
                </div>
                {(() => {
                  const factor = (selectedInv.type === 'BTP' || selectedInv.type === 'Obbligazione') ? 100 : 1;
                  const rate = factor === 100 ? 0.125 : 0.26;
                  const gainPerShare = Number(newTx.price_per_share) - Number(selectedInv.avgPrice);
                  const totalGain = (gainPerShare * Number(newTx.shares)) / factor;
                  const estimatedTax = totalGain > 0 ? totalGain * rate : 0;

                  if (totalGain <= 0) return <span>Questa vendita non genera plusvalenza (prezzo di vendita ≤ PMC).</span>;
                  
                  return (
                    <span>
                      Plusvalenza stimata: <strong>€{totalGain.toFixed(2)}</strong>.<br/>
                      Tasse previste ({rate * 100}%): <strong>€{estimatedTax.toFixed(2)}</strong>.<br/>
                      Ricordati di registrare l'uscita separata per le tasse!
                    </span>
                  );
                })()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="year-selector" style={{ background: 'var(--accent-blue)', color: 'white', flex: 1 }}>Registra</button>
              <button type="button" onClick={() => setShowAddTx(false)} className="year-selector" style={{ flex: 1 }}>Annulla</button>
            </div>
          </form>
        </div></div>
      )}

      {/* 4. STORICO */}
      {showHistory && (
        <div className="modal-overlay"><div className="modal-content card" style={{ width: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 className="card-title">Storico: {selectedInv?.name}</h3>
            <X onClick={() => setShowHistory(false)} style={{ cursor: 'pointer' }} />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{padding: '10px'}}>Data</th>
                <th style={{padding: '10px'}}>Tipo</th>
                <th style={{padding: '10px', textAlign: 'right'}}>Quote</th>
                <th style={{padding: '10px', textAlign: 'right'}}>Prezzo</th>
                <th style={{padding: '10px', textAlign: 'right'}}>Totale</th>
                <th style={{padding: '10px', textAlign: 'center'}}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {history.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {editingTxId === tx.id ? (
                    <>
                      <td style={{padding:'8px'}}><input type="date" value={editTxData.date} onChange={e => setEditTxData({...editTxData, date: e.target.value})} className="text-input" style={{fontSize:'11px'}} /></td>
                      <td style={{padding:'8px'}}>
                        <select value={editTxData.type} onChange={e => setEditTxData({...editTxData, type: e.target.value})} className="year-selector" style={{fontSize:'11px', padding: '4px'}}>
                          <option value="buy">Acquisto</option>
                          <option value="sell">Vendita</option>
                        </select>
                      </td>
                      <td style={{padding:'8px'}}>
                        <input type="number" step="0.0001" value={editTxData.shares} 
                          onChange={e => {
                            const shares = e.target.value;
                            const factor = (selectedInv?.type === 'BTP' || selectedInv?.type === 'Obbligazione') ? 100 : 1;
                            const total = (Number(shares) * Number(editTxData.price_per_share)) / factor;
                            setEditTxData({...editTxData, shares, total_amount: total > 0 ? total.toFixed(2) : ''});
                          }} 
                          className="text-input" style={{width:'70px',fontSize:'11px'}} />
                      </td>
                      <td style={{padding:'8px'}}>
                        <input type="number" step="0.0001" value={editTxData.price_per_share} 
                          onChange={e => {
                            const price = e.target.value;
                            const factor = (selectedInv?.type === 'BTP' || selectedInv?.type === 'Obbligazione') ? 100 : 1;
                            const total = (Number(editTxData.shares) * Number(price)) / factor;
                            setEditTxData({...editTxData, price_per_share: price, total_amount: total > 0 ? total.toFixed(2) : ''});
                          }} 
                          className="text-input" style={{width:'70px',fontSize:'11px'}} />
                      </td>
                      <td style={{padding:'8px'}}>
                        <input type="number" step="0.01" value={editTxData.total_amount} 
                          onChange={e => {
                            const total = e.target.value;
                            const factor = (selectedInv?.type === 'BTP' || selectedInv?.type === 'Obbligazione') ? 100 : 1;
                            const price = Number(editTxData.price_per_share);
                            const shares = (price > 0 && total > 0) ? ((Number(total) * factor) / price).toFixed(4) : editTxData.shares;
                            setEditTxData({...editTxData, total_amount: total, shares});
                          }}
                          className="text-input" style={{width:'80px',fontSize:'11px'}} />
                      </td>
                      <td style={{padding:'8px', textAlign:'center'}}>
                        <div style={{display: 'flex', gap: '4px', justifyContent: 'center'}}>
                          <button onClick={saveEditTx} style={{background:'var(--accent-green)',color:'white',border:'none',padding:'4px 6px',borderRadius:'4px',cursor:'pointer'}}><Check size={12}/></button>
                          <button onClick={() => setEditingTxId(null)} style={{background:'var(--border-color)',color:'white',border:'none',padding:'4px 6px',borderRadius:'4px',cursor:'pointer'}}><X size={12}/></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '10px' }}>{new Date(tx.date).toLocaleDateString('it-IT')}</td>
                      <td style={{ padding: '10px' }}>{tx.type === 'buy' ? 'Acquisto' : 'Vendita'}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>{Number(tx.shares).toFixed(4)}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>€{Number(tx.price_per_share).toFixed(2)}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>€{Number(tx.total_amount).toFixed(2)}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                          <Edit2 size={14} onClick={() => startEditTx(tx)} style={{ cursor: 'pointer' }} />
                          <Trash2 size={14} onClick={() => deleteHistoryTx(tx.id)} style={{ cursor: 'pointer', color: 'var(--accent-red)' }} />
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      )}

      {/* 5. NUOVO PAC */}
      {showAddPlan && (
        <div className="modal-overlay"><div className="modal-content card" style={{ width: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 className="card-title">Nuovo PAC</h3>
            <X onClick={() => setShowAddPlan(false)} style={{ cursor: 'pointer' }} />
          </div>
          <form onSubmit={addPlan} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Nome Piano" className="text-input" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} required />
            <select className="year-selector" value={newPlan.investment_id} onChange={e => setNewPlan({...newPlan, investment_id: e.target.value})} required>
              <option value="">Seleziona Titolo...</option>
              {portfolio.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
            </select>
            <input type="number" placeholder="Importo Mensile €" className="text-input" value={newPlan.amount} onChange={e => setNewPlan({...newPlan, amount: e.target.value})} required />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="year-selector" style={{ background: 'var(--accent-blue)', color: 'white', flex: 1 }}>Salva</button>
              <button type="button" onClick={() => setShowAddPlan(false)} className="year-selector" style={{ flex: 1 }}>Annulla</button>
            </div>
          </form>
        </div></div>
      )}

      {/* 6. ESECUZIONE PAC */}
      {showExecutePlan && (
        <div className="modal-overlay"><div className="modal-content card" style={{ width: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 className="card-title">Versamento: {selectedPlan?.name}</h3>
            <X onClick={() => setShowExecutePlan(false)} style={{ cursor: 'pointer' }} />
          </div>
          <form onSubmit={executePlan} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="date" className="text-input" value={execPlanData.date} onChange={e => setExecPlanData({...execPlanData, date: e.target.value})} required />
            <select className="year-selector" value={execPlanData.account_id} onChange={e => setExecPlanData({...execPlanData, account_id: e.target.value})} required>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
            
            <div style={{ marginBottom: '-10px', fontSize: '0.85em', color: 'var(--text-secondary)' }}>Importo Versato (€)</div>
            <input type="number" step="0.01" placeholder="Importo €" className="text-input" value={execPlanData.amount}
              onChange={e => {
                const amt = e.target.value;
                const asset = portfolio.find(p => p.id === selectedPlan?.investment_id);
                const factor = (asset?.type === 'BTP' || asset?.type === 'Obbligazione') ? 100 : 1;
                const autoShares = execPlanData.price_per_share > 0 && amt > 0 ? ((Number(amt) * factor) / Number(execPlanData.price_per_share)).toFixed(4) : execPlanData.shares;
                setExecPlanData({...execPlanData, amount: amt, shares: autoShares});
              }}
              required />

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '5px', fontSize: '0.85em', color: 'var(--text-secondary)' }}>Prezzo (€)</div>
                <input type="number" step="0.0001" placeholder="Prezzo €" className="text-input" value={execPlanData.price_per_share}
                  onChange={e => {
                    const price = e.target.value;
                    const asset = portfolio.find(p => p.id === selectedPlan?.investment_id);
                    const factor = (asset?.type === 'BTP' || asset?.type === 'Obbligazione') ? 100 : 1;
                    const autoShares = price > 0 && execPlanData.amount > 0 ? ((Number(execPlanData.amount) * factor) / Number(price)).toFixed(4) : execPlanData.shares;
                    setExecPlanData({...execPlanData, price_per_share: price, shares: autoShares});
                  }}
                  required style={{width: '100%'}} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '5px', fontSize: '0.85em', color: 'var(--text-secondary)' }}>Quote (auto)</div>
                <input type="number" step="0.0001" placeholder="Quote" className="text-input" value={execPlanData.shares} onChange={e => setExecPlanData({...execPlanData, shares: e.target.value})} required style={{width: '100%'}} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="year-selector" style={{ background: '#8957e5', color: 'white', flex: 1 }}>Conferma</button>
              <button type="button" onClick={() => setShowExecutePlan(false)} className="year-selector" style={{ flex: 1 }}>Annulla</button>
            </div>
          </form>
        </div></div>
      )}
    </>
  );
}
