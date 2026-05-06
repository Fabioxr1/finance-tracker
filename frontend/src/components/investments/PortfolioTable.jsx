import { Plus, History, Edit2, Trash2, AlertCircle } from 'lucide-react';

export default function PortfolioTable({ portfolio, onAddTx, onShowHistory, onEdit, onDelete, onUpdatePrice }) {
  return (
    <div className="portfolio-container">
      {/* VISTA DESKTOP */}
      <div className="desktop-only">
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '15px', textAlign: 'left' }}>Titolo</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Quote</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Media €</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Prezzo €</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Gain</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: '500' }}>{inv.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{inv.ticker}</div>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>{Number(inv.totalShares).toFixed(4)}</td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>{Number(inv.avgPrice).toFixed(2)}</td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                      {inv.isManual ? (
                        <input 
                          type="number" 
                          step="0.0001" 
                          value={inv.livePrice || ''} 
                          onChange={e => onUpdatePrice(inv, e.target.value, true)} 
                          style={{ width: '80px', background: 'var(--bg-color)', border: '1px solid var(--accent-blue)', color: 'white', textAlign: 'right', borderRadius: '4px', padding: '2px 5px' }} 
                        />
                      ) : (
                        inv.tickerError ? <AlertCircle size={14} color="var(--accent-red)" title="Errore recupero prezzo" /> : Number(inv.livePrice).toFixed(2)
                      )}
                      <input 
                        type="checkbox" 
                        checked={inv.isManual} 
                        title="Prezzo Manuale"
                        onChange={e => onUpdatePrice(inv, inv.livePrice, e.target.checked)} 
                        style={{ cursor: 'pointer' }} 
                      />
                    </div>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right', color: inv.gain >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: '500' }}>
                    {inv.gainPercent.toFixed(2)}%
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className="year-selector" title="Aggiungi Movimento" onClick={() => onAddTx(inv)}><Plus size={14} /></button>
                      <button className="year-selector" title="Vedi Storico" onClick={() => onShowHistory(inv)}><History size={14} /></button>
                      <button className="year-selector" title="Modifica Titolo" onClick={() => onEdit(inv)}><Edit2 size={14} /></button>
                      <button className="year-selector" title="Elimina Titolo" onClick={() => onDelete(inv.id)} style={{ color: 'var(--accent-red)' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VISTA MOBILE */}
      <div className="mobile-only">
        {portfolio.map(inv => (
          <div key={inv.id} className="card" style={{ marginBottom: '15px', padding: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{inv.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{inv.ticker} • {inv.type}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: inv.gain >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: '700', fontSize: '1.1rem' }}>
                  {inv.gainPercent >= 0 ? '+' : ''}{inv.gainPercent.toFixed(2)}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Gain: €{Number(inv.gain).toFixed(2)}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Quote</div>
                <div style={{ fontWeight: '500' }}>{Number(inv.totalShares).toFixed(4)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Media</div>
                <div style={{ fontWeight: '500' }}>€{Number(inv.avgPrice).toFixed(2)}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '5px' }}>Prezzo Attuale</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {inv.isManual ? (
                    <input 
                      type="number" 
                      step="0.0001" 
                      value={inv.livePrice || ''} 
                      onChange={e => onUpdatePrice(inv, e.target.value, true)} 
                      className="text-input"
                      style={{ flex: 1, height: '35px' }} 
                    />
                  ) : (
                    <div style={{ fontWeight: '600', fontSize: '1.1rem', flex: 1 }}>
                      €{Number(inv.livePrice).toFixed(2)}
                      {inv.tickerError && <AlertCircle size={14} color="var(--accent-red)" style={{ marginLeft: '5px' }} />}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                    <input type="checkbox" checked={inv.isManual} onChange={e => onUpdatePrice(inv, inv.livePrice, e.target.checked)} />
                    Manuale
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
              <button className="year-selector" style={{ width: '100%', padding: '10px 0' }} onClick={() => onAddTx(inv)}><Plus size={18} /></button>
              <button className="year-selector" style={{ width: '100%', padding: '10px 0' }} onClick={() => onShowHistory(inv)}><History size={18} /></button>
              <button className="year-selector" style={{ width: '100%', padding: '10px 0' }} onClick={() => onEdit(inv)}><Edit2 size={18} /></button>
              <button className="year-selector" style={{ width: '100%', padding: '10px 0', color: 'var(--accent-red)' }} onClick={() => onDelete(inv.id)}><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
