const express = require('express');
const router = express.Router();
const pool = require("../db");

// 3. GET Categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY type, name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3.1 POST Category
router.post('/', async (req, res) => {
  const { name, type } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING *',
      [name, type]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3.2 DELETE Category
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3.3 PUT Category (Update)
router.put('/:id', async (req, res) => {
  const { name, type } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE categories SET name = $1, type = $2 WHERE id = $3 RETURNING *',
      [name, type, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Categoria non trovata" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
