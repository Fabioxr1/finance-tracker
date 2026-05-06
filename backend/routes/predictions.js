const express = require('express');
const router = express.Router();
const predictEngine = require('../utils/predictEngine');

/**
 * GET /api/predictions
 * Ritorna le proiezioni finanziarie basate sulla storia del DB
 */
router.get('/', async (req, res) => {
  try {
    const predictions = await predictEngine.getPredictions();
    res.json(predictions);
  } catch (err) {
    console.error("Prediction Route Error:", err);
    res.status(500).json({ error: "Errore nel calcolo delle previsioni" });
  }
});

module.exports = router;
