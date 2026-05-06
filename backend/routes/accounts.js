const express = require('express');
const router = express.Router();
const pool = require("../db");

// 1. GET Accounts - Ottiene tutti i conti con saldo aggiornato
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT a.*, 
             (
               SELECT COALESCE(SUM(
                 CASE 
                   WHEN type = 'income' THEN amount 
                   WHEN type = 'expense' THEN -amount
                   WHEN type = 'transfer' THEN -amount
                   ELSE 0 
                 END), 0) FROM transactions WHERE account_id = a.id
             ) +
             (
               SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE to_account_id = a.id AND type = 'transfer'
             ) AS transaction_sum
      FROM accounts a
      ORDER BY a.created_at ASC
    `;
    const result = await pool.query(query);
    const accounts = result.rows.map(acc => ({
      ...acc,
      current_balance: Number(acc.initial_balance) + Number(acc.transaction_sum)
    }));
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST Accounts - Aggiunge un nuovo conto
router.post('/', async (req, res) => {
  const { name, type, initial_balance } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO accounts (name, type, initial_balance) VALUES ($1, $2, $3) RETURNING *',
      [name, type, initial_balance || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2.1 PUT Account - Modifica un conto
router.put('/:id', async (req, res) => {
  const { name, type, initial_balance, admin_password } = req.body;
  const isAdmin = admin_password === 'fabio';

  try {
    // Controllo se è un conto di sistema
    const checkRes = await pool.query('SELECT is_system FROM accounts WHERE id = $1', [req.params.id]);
    if (checkRes.rows.length > 0 && checkRes.rows[0].is_system) {
      return res.status(403).json({ error: "I conti di sistema non possono essere modificati nelle impostazioni base." });
    }

    let result;
    if (initial_balance !== undefined && isAdmin) {
      result = await pool.query(
        'UPDATE accounts SET name=$1, type=$2, initial_balance=$3 WHERE id=$4 RETURNING *',
        [name, type, initial_balance, req.params.id]
      );
    } else {
      result = await pool.query(
        'UPDATE accounts SET name=$1, type=$2 WHERE id=$3 RETURNING *',
        [name, type, req.params.id]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2.2 DELETE Account - Elimina un conto
router.delete('/:id', async (req, res) => {
  try {
    // Impedisci eliminazione conti di sistema
    const checkRes = await pool.query('SELECT is_system, name FROM accounts WHERE id = $1', [req.params.id]);
    if (checkRes.rows.length > 0 && checkRes.rows[0].is_system) {
      return res.status(403).json({ error: `Il conto di sistema '${checkRes.rows[0].name}' non può essere eliminato.` });
    }

    await pool.query('DELETE FROM accounts WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Errore. Impossibile eliminare un conto se contiene già delle transazioni." });
  }
});

module.exports = router;
