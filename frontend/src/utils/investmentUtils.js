/**
 * Utility per la logica dell'interfaccia degli investimenti.
 */

/**
 * Calcola le quote o il totale in base ai dati inseriti.
 * @param {string} type - 'buy' o 'sell'
 * @param {string} shares - Numero di quote
 * @param {string} price - Prezzo per quota
 * @param {string} total - Importo totale
 * @param {string} assetType - Tipo di asset (ETF, BTP, etc.)
 * @param {string} lastChanged - Quale campo è stato modificato ('shares', 'price', 'total')
 * @returns {Object} - L'oggetto con i valori aggiornati
 */
export function calculateTransactionFields(shares, price, total, assetType, lastChanged) {
  const factor = (assetType === 'BTP' || assetType === 'Obbligazione') ? 100 : 1;
  const s = Number(shares);
  const p = Number(price);
  const t = Number(total);

  let newShares = shares;
  let newTotal = total;

  if (lastChanged === 'shares' || lastChanged === 'price') {
    if (s > 0 && p > 0) {
      newTotal = ((s * p) / factor).toFixed(2);
    }
  } else if (lastChanged === 'total') {
    if (t > 0 && p > 0) {
      newShares = ((t * factor) / p).toFixed(4);
    }
  }

  return { shares: newShares, total_amount: newTotal };
}

/**
 * Calcola le quote iniziali per l'esecuzione di un PAC.
 */
export function calculateInitialPACShares(amount, price, assetType) {
  const factor = (assetType === 'BTP' || assetType === 'Obbligazione') ? 100 : 1;
  const amt = Number(amount);
  const prc = Number(price);
  
  if (amt > 0 && prc > 0) {
    return ((amt * factor) / prc).toFixed(4);
  }
  return '';
}
