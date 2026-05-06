const express = require('express');
const router = express.Router();
const pool = require("../db");

// 3.3 GET Dashboard Stats
router.get('/', async (req, res) => {
  const { year } = req.query;
  const currentYear = year || new Date().getFullYear().toString();
  
  try {
    // 1. Saldo totale conti (Liquidità Reale)
    // FIX: escludiamo i trasferimenti dalle spese perché sono movimenti interni,
    // non uscite reali. Includerli gonfierebbe il totalExpense e abbatterebbe il saldo.
    const totalBalanceRes = await pool.query(`
      SELECT 
        (SELECT COALESCE(SUM(initial_balance), 0) FROM accounts) +
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'income') -
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'expense' AND to_account_id IS NULL) -
        (SELECT COALESCE(SUM(total_amount), 0) FROM investment_transactions WHERE type = 'buy') +
        (SELECT COALESCE(SUM(total_amount), 0) FROM investment_transactions WHERE type = 'sell') AS total_balance
    `);
    const totalBalance = Number(totalBalanceRes.rows[0].total_balance);

    // 2. Valore totale investimenti (Acquisti - Vendite)
    const investmentsRes = await pool.query(`
      SELECT SUM(
        CASE 
          WHEN type = 'buy' THEN total_amount 
          WHEN type = 'sell' THEN -total_amount 
          ELSE 0 
        END
      ) as total FROM investment_transactions
    `);
    const totalInvestments = Number(investmentsRes.rows[0].total || 0);

    // 3. Debito totale residuo (Capitale iniziale - Totale rimborsato)
    const debtRes = await pool.query(`
      SELECT 
        (SELECT COALESCE(SUM(total_amount), 0) FROM installments) -
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE installment_id IS NOT NULL) as total_debt
    `);
    const totalDebt = Math.max(0, Number(debtRes.rows[0].total_debt || 0));

    // Totali e risparmio per l'anno selezionato
    const yearStatsRes = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
      FROM transactions
      WHERE EXTRACT(YEAR FROM date) = $1
    `, [currentYear]);
    
    const totalIncome = Number(yearStatsRes.rows[0].total_income);
    const totalExpense = Number(yearStatsRes.rows[0].total_expense);
    const savings = totalIncome - totalExpense;

    // Dati per il grafico raggruppati per mese dell'anno selezionato
    const chartRes = await pool.query(`
      SELECT 
        EXTRACT(MONTH FROM date) as month,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS entrate,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS uscite
      FROM transactions
      WHERE EXTRACT(YEAR FROM date) = $1
      GROUP BY EXTRACT(MONTH FROM date)
      ORDER BY month ASC
    `, [currentYear]);

    const monthsLabels = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const chartDataMap = {};
    chartRes.rows.forEach(r => {
      chartDataMap[r.month] = { entrate: Number(r.entrate), uscite: Number(r.uscite) };
    });

    const chartData = monthsLabels.map((name, index) => {
      const m = index + 1;
      return {
        name,
        entrate: chartDataMap[m] ? chartDataMap[m].entrate : 0,
        uscite: chartDataMap[m] ? chartDataMap[m].uscite : 0
      };
    });

    // Anni disponibili (in cui esistono transazioni)
    const yearsRes = await pool.query('SELECT DISTINCT EXTRACT(YEAR FROM date) as year FROM transactions ORDER BY year DESC');
    const dbYears = yearsRes.rows.map(r => r.year.toString());
    const availableYears = Array.from(new Set([new Date().getFullYear().toString(), ...dbYears])).sort().reverse();

    // Ripartizione Spese per Categoria (Tutte, anche quelle a zero)
    const expenseByCategoryRes = await pool.query(`
      SELECT c.name, COALESCE(SUM(t.amount), 0) as total
      FROM categories c
      LEFT JOIN transactions t ON t.category_id = c.id AND EXTRACT(YEAR FROM t.date) = $1 AND t.type = 'expense'
      WHERE c.type = 'expense'
      GROUP BY c.id, c.name
      ORDER BY total DESC, c.name ASC
    `, [currentYear]);

    // Ripartizione Entrate per Categoria (Tutte, anche quelle a zero)
    const incomeByCategoryRes = await pool.query(`
      SELECT c.name, COALESCE(SUM(t.amount), 0) as total
      FROM categories c
      LEFT JOIN transactions t ON t.category_id = c.id AND EXTRACT(YEAR FROM t.date) = $1 AND t.type = 'income'
      WHERE c.type = 'income'
      GROUP BY c.id, c.name
      ORDER BY total DESC, c.name ASC
    `, [currentYear]);

    // 6. Breakdown per ogni conto (Entrate, Uscite, Saldo attuale)
    const accountsBreakdownRes = await pool.query(`
      SELECT 
        a.id, 
        a.name, 
        a.initial_balance,
        -- Dettagli per l'anno selezionato ($1)
        COALESCE((SELECT SUM(amount) FROM transactions WHERE account_id = a.id AND type = 'income' AND EXTRACT(YEAR FROM date) = $1), 0) as year_income,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE account_id = a.id AND type = 'expense' AND EXTRACT(YEAR FROM date) = $1), 0) as year_expense,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE to_account_id = a.id AND type = 'transfer' AND EXTRACT(YEAR FROM date) = $1), 0) as year_transfer_in,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE account_id = a.id AND type = 'transfer' AND EXTRACT(YEAR FROM date) = $1), 0) as year_transfer_out,
        -- Calcolo saldo reale (LIFETIME - Tutte le transazioni di sempre)
        COALESCE((SELECT SUM(amount) FROM transactions WHERE account_id = a.id AND type = 'income'), 0) +
        COALESCE((SELECT SUM(amount) FROM transactions WHERE to_account_id = a.id AND type = 'transfer'), 0) as total_in_lifetime,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE account_id = a.id AND (type = 'expense' OR type = 'transfer')), 0) as total_out_lifetime
      FROM accounts a
    `, [currentYear]);

    const accountsBreakdown = accountsBreakdownRes.rows.map(row => ({
      name: row.name || 'Senza Nome',
      in: Number(row.year_income || 0),
      out: Number(row.year_expense || 0),
      transIn: Number(row.year_transfer_in || 0),
      transOut: Number(row.year_transfer_out || 0),
      balance: Number(row.initial_balance || 0) + Number(row.total_in_lifetime || 0) - Number(row.total_out_lifetime || 0)
    }));

    res.json({
      totalBalance: Number(totalBalance || 0),
      totalInvestments: Number(totalInvestments || 0),
      totalDebt: Number(totalDebt || 0),
      netWorth: Number((totalBalance || 0) + (totalInvestments || 0) - (totalDebt || 0)),
      totalIncome: Number(totalIncome || 0),
      totalExpense: Number(totalExpense || 0),
      savings: Number(savings || 0),
      chartData: chartData || [],
      availableYears: availableYears || [currentYear],
      expenseByCategory: (expenseByCategoryRes.rows || []).map(r => ({ name: r.name, total: Number(r.total || 0) })),
      incomeByCategory: (incomeByCategoryRes.rows || []).map(r => ({ name: r.name, total: Number(r.total || 0) })),
      accountsBreakdown
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
