const express = require('express');
const router = express.Router();
const pool = require("../db");

// 1. GET Tags - Recupera tutti i tag
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tags ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST Tags - Aggiunge un nuovo tag
router.post('/', async (req, res) => {
  const { name, color, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome tag mancante' });
  
  // Rimuovi il # se presente e pulisci il nome
  const cleanName = name.replace('#', '').trim().toLowerCase();

  try {
    const result = await pool.query(
      'INSERT INTO tags (name, color, description) VALUES ($1, $2, $3) RETURNING *',
      [cleanName, color || '#3b82f6', description || '']
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Duplicate key
      res.status(400).json({ error: 'Questo tag esiste già' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// 3. PUT Tag - Modifica un tag esistente
router.put('/:id', async (req, res) => {
  const { name, color, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome tag mancante' });
  
  const cleanName = name.replace('#', '').trim().toLowerCase();

  try {
    const result = await pool.query(
      'UPDATE tags SET name = $1, color = $2, description = $3 WHERE id = $4 RETURNING *',
      [cleanName, color, description || '', req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE Tag
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tags WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
