/**
 * Utility per i calcoli finanziari degli investimenti.
 */

/**
 * Calcola le performance di un titolo in base alle sue transazioni.
 * @param {Object} investment - Il titolo (da tabella investments)
 * @param {Array} transactions - Lista transazioni (da tabella investment_transactions)
 * @param {number|null} livePrice - Prezzo attuale di mercato (opzionale)
 * @returns {Object} - Dati calcolati (quote totali, investito, PMC, valore attuale, gain)
 */
function calculateInvestmentPerformance(investment, transactions, livePrice = null) {
  let totalShares = 0;
  let totalInvested = 0;
  
  transactions.forEach(t => {
    const shares = Number(t.shares);
    const total = Number(t.total_amount);
    if (t.type === 'buy') {
      totalShares += shares;
      totalInvested += total;
    } else if (t.type === 'sell') {
      // In caso di vendita, scarichiamo il costo storico proporzionale (PMC)
      const previousTotalShares = totalShares;
      totalShares -= shares;
      if (previousTotalShares > 0) {
        totalInvested -= shares * (totalInvested / previousTotalShares);
      }
    }
  });

  const isBond = investment.type === 'BTP' || investment.type === 'Obbligazione';
  const factor = isBond ? 100 : 1;
  const avgPricePerUnit = totalShares > 0 ? (totalInvested / totalShares) : 0;
  
  // Determinazione del prezzo da usare
  let currentPriceForDisplay;
  const isManual = investment.use_manual_price && investment.manual_price !== null;
  
  if (isManual) {
    currentPriceForDisplay = Number(investment.manual_price);
  } else {
    currentPriceForDisplay = (livePrice !== null && livePrice !== undefined) ? livePrice : (avgPricePerUnit * factor);
  }

  // Arrotondamenti e calcoli finali
  currentPriceForDisplay = Math.round(currentPriceForDisplay * 10000) / 10000;
  const currentValue = Math.round((currentPriceForDisplay * totalShares / factor) * 100) / 100;
  const totalInvestedRounded = Math.round(totalInvested * 100) / 100;
  const gain = Math.round((currentValue - totalInvestedRounded) * 100) / 100;
  const gainPercent = totalInvestedRounded > 0 ? (gain / totalInvestedRounded) * 100 : 0;

  return {
    totalShares,
    totalInvested: totalInvestedRounded,
    avgPrice: Math.round(avgPricePerUnit * factor * 100) / 100,
    livePrice: isManual ? Number(investment.manual_price) : livePrice,
    isManual,
    currentValue,
    gain,
    gainPercent: Math.round(gainPercent * 100) / 100,
    tickerError: (!isManual && (livePrice === null || livePrice === undefined) && investment.ticker) ? true : false
  };
}

module.exports = { calculateInvestmentPerformance };
