const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. GET all deadlines
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, c.name as category_name 
      FROM deadlines d
      LEFT JOIN categories c ON d.category_id = c.id
      ORDER BY d.due_date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST new deadline
router.post('/', async (req, res) => {
  const { title, due_date, amount, category_id, description, is_recurring } = req.body;
  
  // Validazione
  if (!title || !due_date) {
    return res.status(400).json({ error: 'Titolo e Data sono obbligatori.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO deadlines (title, due_date, amount, category_id, description, is_recurring) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, due_date, amount || null, category_id || null, description || '', is_recurring || false]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Errore database: ' + err.message });
  }
});

// 3. PUT update deadline (with recurrence logic)
router.put('/:id', async (req, res) => {
  const { title, due_date, amount, category_id, status, description, is_recurring } = req.body;
  const deadlineId = req.params.id;

  if (!title || !due_date) {
    return res.status(400).json({ error: 'Titolo e Data sono obbligatori per l\'aggiornamento.' });
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const oldRes = await client.query('SELECT status FROM deadlines WHERE id = $1', [deadlineId]);
    const oldStatus = oldRes.rows[0]?.status;

    const updateResult = await client.query(
      'UPDATE deadlines SET title=$1, due_date=$2, amount=$3, category_id=$4, status=$5, description=$6, is_recurring=$7 WHERE id=$8 RETURNING *',
      [title, due_date, amount || null, category_id || null, status, description || '', is_recurring, deadlineId]
    );

    if (status === 'paid' && is_recurring && oldStatus !== 'paid') {
      const nextDate = new Date(due_date);
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      
      const checkDup = await client.query(
        'SELECT id FROM deadlines WHERE title = $1 AND due_date = $2 AND status = $3',
        [title, nextDate.toISOString().split('T')[0], 'pending']
      );

      if (checkDup.rows.length === 0) {
        await client.query(
          'INSERT INTO deadlines (title, due_date, amount, category_id, description, is_recurring, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [title, nextDate.toISOString().split('T')[0], amount || null, category_id || null, description || '', is_recurring, 'pending']
        );
      }
    }

    await client.query('COMMIT');
    res.json(updateResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Errore durante l\'aggiornamento: ' + err.message });
  } finally {
    client.release();
  }
});

// 4. DELETE deadline
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM deadlines WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
