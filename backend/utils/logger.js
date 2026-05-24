const fs = require('fs');
const path = require('path');
const basePath = path.resolve(__dirname, '..');
const logFilePath = path.normalize(path.join(basePath, 'transactions.log'));
if (!logFilePath.startsWith(basePath)) {
  throw new Error("Invalid log file path specified");
}

/**
 * Logga un'operazione su una transazione nel file transactions.log
 * @param {Object} tx - L'oggetto transazione (da DB o da req.body)
 * @param {string} actionType - Tipo di azione (CREATE, UPDATE, DELETE)
 */
const logTransaction = (tx, actionType = 'CREATE') => {
  const timestamp = new Date().toISOString();
  const id = tx.id || 'N/A';
  const type = (tx.type || 'N/A').toUpperCase();
  const amount = tx.amount || 0;
  const description = tx.description || 'N/A';
  const categoryId = tx.category_id || 'N/A';
  
  let accountInfo = `ACC=${tx.account_id || '???'}`;
  if (type === 'TRANSFER') {
    accountInfo = `FROM=${tx.account_id || '???'} TO=${tx.to_account_id || '???'}`;
  }

  const logEntry = `${timestamp} | ID=${id} | ${actionType.toUpperCase()} [${type}] | ${amount}€ | ${description} | ${accountInfo} | CAT=${categoryId}\n`;

  try {
    fs.appendFileSync(logFilePath, logEntry);
  } catch (err) {
    console.error(" [Logger Error]: Impossibile scrivere nel file di log:", err.message);
  }
};

module.exports = { logTransaction };
