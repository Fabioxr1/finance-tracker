const express = require('express');
const router = express.Router();
const pool = require("../db");

// GET /api/monthly-stats?year=2026&month=5
router.get('/', async (req, res) => {
  const { year, month } = req.query;
  const targetYear = year || new Date().getFullYear().toString();
  const targetMonth = month || (new Date().getMonth() + 1).toString();

  try {
    // 1. Totali del mese
    const totalsRes = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
      FROM transactions
      WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2
    `, [targetYear, targetMonth]);

    const income = Number(totalsRes.rows[0].income);
    const expense = Number(totalsRes.rows[0].expense);
    const savings = income - expense;

    // 2. Ripartizione per Categoria (Uscite)
    const expenseByCategoryRes = await pool.query(`
      SELECT c.name, COALESCE(SUM(t.amount), 0) as total
      FROM categories c
      JOIN transactions t ON t.category_id = c.id
      WHERE EXTRACT(YEAR FROM t.date) = $1 
        AND EXTRACT(MONTH FROM t.date) = $2 
        AND t.type = 'expense'
      GROUP BY c.id, c.name
      ORDER BY total DESC
    `, [targetYear, targetMonth]);

    // 3. Ripartizione per Categoria (Entrate)
    const incomeByCategoryRes = await pool.query(`
      SELECT c.name, COALESCE(SUM(t.amount), 0) as total
      FROM categories c
      JOIN transactions t ON t.category_id = c.id
      WHERE EXTRACT(YEAR FROM t.date) = $1 
        AND EXTRACT(MONTH FROM t.date) = $2 
        AND t.type = 'income'
      GROUP BY c.id, c.name
      ORDER BY total DESC
    `, [targetYear, targetMonth]);

    // 4. Ripartizione per Tag del mese
    const tagsRes = await pool.query(`
      SELECT tg.name, SUM(t.amount) as total
      FROM tags tg
      JOIN transaction_tags tt ON tt.tag_id = tg.id
      JOIN transactions t ON t.id = tt.transaction_id
      WHERE EXTRACT(YEAR FROM t.date) = $1 
        AND EXTRACT(MONTH FROM t.date) = $2
        AND t.type = 'expense'
      GROUP BY tg.id, tg.name
      ORDER BY total DESC
    `, [targetYear, targetMonth]);

    // 5. Top 5 Transazioni (Uscite più alte)
    const topTransactionsRes = await pool.query(`
      SELECT id, date, description, amount, type
      FROM transactions
      WHERE EXTRACT(YEAR FROM date) = $1 
        AND EXTRACT(MONTH FROM date) = $2
        AND type = 'expense'
      ORDER BY amount DESC
      LIMIT 5
    `, [targetYear, targetMonth]);

    // 6. Anni disponibili
    const yearsRes = await pool.query('SELECT DISTINCT EXTRACT(YEAR FROM date) as year FROM transactions ORDER BY year DESC');
    const availableYears = yearsRes.rows.map(r => r.year.toString());
    if (availableYears.length === 0) availableYears.push(new Date().getFullYear().toString());

    res.json({
      totals: { income, expense, savings },
      expenseByCategory: expenseByCategoryRes.rows.map(r => ({ name: r.name, total: Number(r.total) })),
      incomeByCategory: incomeByCategoryRes.rows.map(r => ({ name: r.name, total: Number(r.total) })),
      tagsBreakdown: tagsRes.rows.map(r => ({ name: r.name, total: Number(r.total) })),
      topTransactions: topTransactionsRes.rows.map(r => ({ ...r, amount: Number(r.amount) })),
      availableYears
    });

  } catch (err) {
    console.error("Errore statistiche mensili:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
