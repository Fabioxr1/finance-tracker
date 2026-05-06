const express = require('express');
const router = express.Router();
const pool = require("../db");
const transactionService = require('../utils/transactionService');

// GET Investment Plans con stato mensile
router.get('/', async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const result = await pool.query(`
      SELECT p.*, i.name as investment_name, i.ticker,
             (SELECT COUNT(*) FROM investment_transactions it
              WHERE it.investment_id = p.investment_id
              AND EXTRACT(MONTH FROM it.date) = $1
              AND EXTRACT(YEAR FROM it.date) = $2
              AND it.total_amount >= p.amount * 0.9) as paid_this_month
      FROM investment_plans p
      JOIN investments i ON p.investment_id = i.id
      ORDER BY p.created_at DESC
    `, [currentMonth, currentYear]);

    const plans = result.rows.map(row => ({
      ...row,
      needsExecution: Number(row.paid_this_month) === 0
    }));

    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST New Plan
router.post('/', async (req, res) => {
  const { name, investment_id, amount } = req.body;
  const invId = (investment_id === '' || investment_id === undefined) ? null : investment_id;
  const amt = (amount === '' || amount === undefined) ? null : amount;

  try {
    const result = await pool.query(
      'INSERT INTO investment_plans (name, investment_id, amount) VALUES ($1, $2, $3) RETURNING *',
      [name, invId, amt]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Plan
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM investment_plans WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Execute Plan - Versamento mensile
router.post('/:id/execute', async (req, res) => {
  const { account_id, date, amount, shares, price_per_share } = req.body;
  const planId = req.params.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Recupera dettagli piano e nome investimento
    const planRes = await client.query(`
      SELECT p.*, i.name as investment_name 
      FROM investment_plans p
      JOIN investments i ON p.investment_id = i.id
      WHERE p.id = $1
    `, [planId]);
    
    if (planRes.rows.length === 0) throw new Error('Piano non trovato');
    const plan = planRes.rows[0];

    // 2. Assicuriamoci che esista la categoria "PAC" (la creiamo se mancante)
    let pacCatRes = await client.query("SELECT id FROM categories WHERE name = 'PAC' AND type = 'expense'");
    let pacCategoryId;
    if (pacCatRes.rows.length === 0) {
      const newCat = await client.query("INSERT INTO categories (name, type) VALUES ('PAC', 'expense') RETURNING id");
      pacCategoryId = newCat.rows[0].id;
    } else {
      pacCategoryId = pacCatRes.rows[0].id;
    }

    // Recupera l'ID del conto "Investimenti" di sistema
    const systemAccRes = await client.query("SELECT id FROM accounts WHERE name = 'Investimenti' AND is_system = true");
    const systemAccountId = systemAccRes.rows[0]?.id;

    // 3. Crea transazione bancaria (Giroconto verso Investimenti)
    const txRes = await transactionService.createTransaction(client, {
      account_id: account_id,
      to_account_id: systemAccountId,
      category_id: pacCategoryId,
      amount: amount,
      type: 'transfer',
      date: date,
      description: `Acquisto PAC: ${plan.investment_name} (${shares || 0} quote)`
    });
    const linkedTxId = txRes.id;

    // 4. Crea movimento investimento
    await client.query(`
      INSERT INTO investment_transactions (investment_id, date, shares, price_per_share, total_amount, type, linked_transaction_id)
      VALUES ($1, $2, $3, $4, $5, 'buy', $6)
    `, [plan.investment_id, date, shares || 0, price_per_share || 0, amount, linkedTxId]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
