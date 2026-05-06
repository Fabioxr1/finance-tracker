const express = require('express');
const router = express.Router();
const pool = require("../db");

// GET Tag Statistics
router.get('/', async (req, res) => {
  const { year, month } = req.query;
  const filterYear = year || new Date().getFullYear();
  const filterMonth = parseInt(month) || 0; // 0 significa "Tutto l'anno"

  try {
    // 1. Query principale: Totali per ogni Tag
    let query = `
      SELECT 
        tg.id, 
        tg.name, 
        tg.color, 
        tg.description,
        COALESCE(SUM(t.amount), 0) as total, 
        COUNT(t.id) as count
      FROM tags tg
      LEFT JOIN transaction_tags tt ON tg.id = tt.tag_id
      LEFT JOIN transactions t ON tt.transaction_id = t.id 
          AND EXTRACT(YEAR FROM t.date) = $1
          AND ($2 = 0 OR EXTRACT(MONTH FROM t.date) = $2)
          AND t.type = 'expense'
      GROUP BY tg.id, tg.name, tg.color, tg.description
      ORDER BY total DESC, tg.name ASC
    `;
    
    const statsRes = await pool.query(query, [filterYear, filterMonth]);

    // 2. Calcolo del totale generale del periodo (per le percentuali)
    const totalPeriodRes = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE type = 'expense'
        AND EXTRACT(YEAR FROM date) = $1
        AND ($2 = 0 OR EXTRACT(MONTH FROM date) = $2)
    `, [filterYear, filterMonth]);

    const totalPeriod = parseFloat(totalPeriodRes.rows[0].total);

    res.json({
      year: filterYear,
      month: filterMonth,
      totalPeriod,
      stats: statsRes.rows.map(r => ({
        ...r,
        total: parseFloat(r.total),
        count: parseInt(r.count),
        percentage: totalPeriod > 0 ? (parseFloat(r.total) / totalPeriod) * 100 : 0
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /runway — Simulatore Autonomia Finanziaria
// Calcola: saldo attuale + spesa media mensile per tag (ultimi 6 mesi)
router.get('/runway', async (req, res) => {
  try {
    // 1. Saldo attuale (liquidità di tutti i conti)
    const balanceRes = await pool.query(`
      SELECT SUM(
        initial_balance + 
        COALESCE((SELECT SUM(amount) FROM transactions WHERE account_id = a.id AND type = 'income'), 0) +
        COALESCE((SELECT SUM(amount) FROM transactions WHERE to_account_id = a.id AND type = 'transfer'), 0) -
        COALESCE((SELECT SUM(amount) FROM transactions WHERE account_id = a.id AND (type = 'expense' OR type = 'transfer')), 0)
      ) as total_liquid
      FROM accounts a
    `);
    const currentBalance = Number(balanceRes.rows[0]?.total_liquid || 0);

    // 2. Spesa media mensile per ogni tag (ultimi 6 mesi, escluso mese corrente)
    const tagAvgRes = await pool.query(`
      WITH monthly_tag_data AS (
        SELECT 
          tg.id as tag_id,
          tg.name,
          tg.color,
          tg.description,
          date_trunc('month', t.date) as month,
          SUM(t.amount) as month_total
        FROM tags tg
        JOIN transaction_tags tt ON tg.id = tt.tag_id
        JOIN transactions t ON tt.transaction_id = t.id
        WHERE t.type = 'expense'
          AND t.date >= date_trunc('month', CURRENT_DATE) - INTERVAL '6 months'
          AND t.date < date_trunc('month', CURRENT_DATE)
        GROUP BY tg.id, tg.name, tg.color, tg.description, date_trunc('month', t.date)
      )
      SELECT 
        tag_id as id,
        name,
        color,
        description,
        COALESCE(SUM(month_total), 0) as total_6m,
        COUNT(DISTINCT month) as active_months
      FROM monthly_tag_data
      GROUP BY tag_id, name, color, description
      ORDER BY total_6m DESC
    `);

    // 3. Spesa media mensile totale (senza tag, per avere il baseline)
    const totalAvgRes = await pool.query(`
      WITH monthly_totals AS (
        SELECT 
          date_trunc('month', date) as month,
          SUM(amount) as total
        FROM transactions
        WHERE type = 'expense'
          AND to_account_id IS NULL
          AND date >= date_trunc('month', CURRENT_DATE) - INTERVAL '6 months'
          AND date < date_trunc('month', CURRENT_DATE)
        GROUP BY 1
      )
      SELECT 
        COALESCE(SUM(total), 0) as grand_total,
        COUNT(*) as active_months
      FROM monthly_totals
    `);

    const totalMonths = Math.max(Number(totalAvgRes.rows[0]?.active_months || 1), 1);
    const avgMonthlyTotal = Number(totalAvgRes.rows[0]?.grand_total || 0) / totalMonths;

    const tags = tagAvgRes.rows.map(r => {
      const activeMonths = Math.max(Number(r.active_months || 1), 1);
      const avgMonthly = Number(r.total_6m) / activeMonths;
      return {
        id: r.id,
        name: r.name,
        color: r.color,
        description: r.description,
        avgMonthly: Math.round(avgMonthly * 100) / 100,
        total6m: Number(r.total_6m)
      };
    });

    res.json({
      currentBalance: Math.round(currentBalance * 100) / 100,
      avgMonthlyTotal: Math.round(avgMonthlyTotal * 100) / 100,
      baselineRunway: avgMonthlyTotal > 0 ? Math.round((currentBalance / avgMonthlyTotal) * 10) / 10 : 999,
      tags
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
