import { AlertTriangle } from 'lucide-react';

export default function TaxReminder({ shares, pricePerShare, avgPrice, assetType }) {
  if (!shares || !pricePerShare || !avgPrice || avgPrice <= 0) return null;

  const factor = (assetType === 'BTP' || assetType === 'Obbligazione') ? 100 : 1;
  const rate = factor === 100 ? 0.125 : 0.26;
  const gainPerShare = Number(pricePerShare) - Number(avgPrice);
  const totalGain = (gainPerShare * Number(shares)) / factor;
  const estimatedTax = totalGain > 0 ? totalGain * rate : 0;

  if (totalGain <= 0) {
    return (
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)', 
        padding: '12px', 
        borderRadius: '8px',
        fontSize: '0.85em',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-color)',
        lineHeight: '1.4'
      }}>
        Nessuna plusvalenza generata (prezzo di vendita ≤ PMC).
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'rgba(255, 152, 0, 0.08)', 
      border: '1px solid rgba(255, 152, 0, 0.2)', 
      padding: '14px', 
      borderRadius: '8px',
      fontSize: '0.85em',
      color: '#ffa726',
      lineHeight: '1.5'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle size={16} />
        Promemoria Tasse
      </div>
      <div>
        Plusvalenza stimata: <strong>€{totalGain.toFixed(2)}</strong><br/>
        Tassazione prevista ({rate * 100}%): <strong>€{estimatedTax.toFixed(2)}</strong>
      </div>
      <div style={{ marginTop: '8px', fontSize: '0.8rem', opacity: 0.8, fontStyle: 'italic' }}>
        Ricordati di registrare l'uscita separata per le tasse sul tuo conto.
      </div>
    </div>
  );
}
