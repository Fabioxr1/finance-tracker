/**
 * Utility per la gestione delle transazioni nel frontend.
 */

/**
 * Prepara una transazione per la duplicazione.
 * @param {Object} transaction - La transazione originale da duplicare
 * @returns {Object} - La nuova transazione pronta per essere inviata al backend
 */
export const prepareTransactionForDuplication = (transaction) => {
  const duplicatedTx = {
    ...transaction,
    date: new Date().toISOString().split('T')[0],
    // Mappa gli oggetti tag in ID se presenti, altrimenti mantiene l'array di ID
    tags: transaction.tags 
      ? transaction.tags.map(tag => typeof tag === 'object' ? tag.id : tag) 
      : []
  };

  // Rimuoviamo i campi che non devono essere inviati o che verranno rigenerati
  // Questi campi derivano dai JOIN del database e il backend non li accetta in fase di POST
  delete duplicatedTx.id;
  delete duplicatedTx.account_name;
  delete duplicatedTx.to_account_name;
  delete duplicatedTx.category_name;
  delete duplicatedTx.installment_name;
  
  return duplicatedTx;
};
