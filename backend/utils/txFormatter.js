/**
 * Prepara i dati di una transazione per l'inserimento nel DB,
 * garantendo che i campi opzionali siano null invece di undefined.
 */
function prepareTransactionParams(tx) {
  return [
    tx.account_id,
    tx.to_account_id || null,    // Giroconto: opzionale
    tx.category_id || null,      // Categoria: opzionale (null nei giroconti)
    tx.amount,
    tx.type,
    tx.date,
    tx.description || null,      // Descrizione: opzionale
    tx.installment_id || null,   // Collegamento finanziamento: opzionale
    tx.recurrence_type || 'monthly'
  ];
}

module.exports = { prepareTransactionParams };
