/**
 * Calcola il saldo di un conto basandosi sulle transazioni
 * @param {number} initialBalance - Saldo iniziale del conto
 * @param {Array} transactions - Lista di tutte le transazioni
 * @param {number} accountId - ID del conto di cui calcolare il saldo
 */
function calculateBalance(initialBalance, transactions, accountId) {
  let total = Number(initialBalance);
  
  transactions.forEach(t => {
    const amount = Number(t.amount);
    if (t.type === 'income' && t.account_id === accountId) {
      total += amount;
    } else if (t.type === 'expense' && t.account_id === accountId) {
      total -= amount;
    } else if (t.type === 'transfer') {
      if (t.account_id === accountId) {
        total -= amount; // Uscita dal conto di origine
      } else if (t.to_account_id === accountId) {
        total += amount; // Entrata nel conto di destinazione
      }
    }
  });
  
  return total;
}

module.exports = { calculateBalance };
