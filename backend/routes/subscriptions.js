const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all subscriptions
router.get('/', async (req, res) => {
  try {
    const subs = await pool.query(`
      SELECT s.*, c.name as category_name, a.name as account_name 
      FROM subscriptions s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN accounts a ON s.account_id = a.id
      ORDER BY s.day_of_month ASC
    `);
    res.json(subs.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE subscription
router.post('/', async (req, res) => {
  const { name, amount, category_id, account_id, day_of_month, active_months } = req.body;
  try {
    const newSub = await pool.query(
      'INSERT INTO subscriptions (name, amount, category_id, account_id, day_of_month, active_months) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, amount, category_id, account_id, day_of_month, active_months]
    );
    res.json(newSub.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE subscription
router.put('/:id', async (req, res) => {
  const { name, amount, category_id, account_id, day_of_month, active, active_months } = req.body;
  try {
    const updatedSub = await pool.query(
      'UPDATE subscriptions SET name=$1, amount=$2, category_id=$3, account_id=$4, day_of_month=$5, active=$6, active_months=$7 WHERE id=$8 RETURNING *',
      [name, amount, category_id, account_id, day_of_month, active, active_months, req.params.id]
    );
    res.json(updatedSub.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE subscription
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM subscriptions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
