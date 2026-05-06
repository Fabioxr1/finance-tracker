// Importazione corretta per compatibilità Node 20
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

/**
 * Recupera il prezzo attuale di un titolo tramite il ticker
 * @param {string} ticker - Esempio: 'AAPL', 'SWDA.MI', 'ISP.MI'
 */
async function getLivePrice(ticker) {
  if (!ticker) return null;
  try {
    // Chiamata diretta a quote senza queryOptions (che causava errore)
    const result = await yahooFinance.quote(ticker);
    
    if (!result) return null;

    // Restituiamo il prezzo corrente cercando tra i vari campi possibili
    return result.regularMarketPrice || result.postMarketPrice || result.bid || result.ask || null;
  } catch (err) {
    console.error(`Errore Yahoo per ${ticker}:`, err.message);
    return null;
  }
}

module.exports = { getLivePrice };
