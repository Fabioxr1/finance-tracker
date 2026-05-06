const express = require('express');
const router = express.Router();
const pool = require("../db");
const transactionService = require('../utils/transactionService');

// Utility per aggiungere mesi a una data
function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// 7.1 GET Installments - Lista finanziamenti con stato pagamenti e ricalcolo dinamico
router.get('/', async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const result = await pool.query(`
      SELECT i.*, a.name as account_name,
             (SELECT COUNT(*) FROM transactions t 
              WHERE t.installment_id = i.id 
              AND EXTRACT(MONTH FROM t.date) = $1 
              AND EXTRACT(YEAR FROM t.date) = $2) as paid_this_month,
             (SELECT COALESCE(SUM(amount), 0) FROM transactions t WHERE t.installment_id = i.id) as paid_amount_total,
             (SELECT array_agg(DISTINCT EXTRACT(MONTH FROM t.date)) 
              FROM transactions t 
              WHERE t.installment_id = i.id 
              AND EXTRACT(YEAR FROM t.date) = $2) as months_paid_current_year,
             (SELECT json_agg(json_build_object('id', tg.id, 'name', tg.name, 'color', tg.color))
              FROM tags tg
              WHERE tg.id = ANY(i.tags)) as tags_full
      FROM installments i
      LEFT JOIN accounts a ON i.account_id = a.id
      ORDER BY i.created_at DESC
    `, [currentMonth, currentYear]);

    const installments = result.rows.map(row => {
      const remainingAmount = Number(row.total_amount) - Number(row.paid_amount_total);
      const monthlyAmount = Number(row.monthly_amount);
      
      // Calcolo dinamico rate rimanenti
      const remainingInstallments = monthlyAmount > 0 ? Math.ceil(remainingAmount / monthlyAmount) : 0;
      const dynamicTotalInstallments = row.paid_installments + remainingInstallments;
      
      // Calcolo dinamico data fine stimata
      const estimatedEndDate = remainingInstallments > 0 
        ? addMonths(new Date(), remainingInstallments).toISOString().split('T')[0]
        : row.end_date;

      return {
        ...row,
        remainingAmount,
        dynamicTotalInstallments,
        estimatedEndDate,
        needsPayment: (row.paid_this_month === '0' || row.paid_this_month === 0) && remainingAmount > 0,
        monthsPaid: row.months_paid_current_year || [],
        tags_full: row.tags_full || []
      };
    });

    res.json(installments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7.2 POST New Installment
router.post('/', async (req, res) => {
  const { name, total_amount, monthly_amount, total_installments, paid_installments, start_date, end_date, description, account_id, search_keyword, tags } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO installments (name, total_amount, monthly_amount, total_installments, paid_installments, start_date, end_date, description, account_id, search_keyword, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [name, total_amount, monthly_amount, total_installments || 0, paid_installments || 0, start_date, end_date, description, account_id, search_keyword, tags || []]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7.2.1 PUT Installment
router.put('/:id', async (req, res) => {
  const { name, total_amount, monthly_amount, total_installments, paid_installments, start_date, end_date, description, account_id, search_keyword, tags } = req.body;
  try {
    const result = await pool.query(
      'UPDATE installments SET name=$1, total_amount=$2, monthly_amount=$3, total_installments=$4, paid_installments=$5, start_date=$6, end_date=$7, description=$8, account_id=$9, search_keyword=$10, tags=$11 WHERE id=$12 RETURNING *',
      [name, total_amount, monthly_amount, total_installments, paid_installments, start_date, end_date, description, account_id, search_keyword, tags || [], req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7.3 POST Pay Installment
router.post('/:id/pay', async (req, res) => {
  const { amount, date, description, category_id } = req.body;
  const installmentId = req.params.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const instRes = await client.query('SELECT * FROM installments WHERE id = $1', [installmentId]);
    if (instRes.rows.length === 0) throw new Error('Finanziamento non trovato');
    const inst = instRes.rows[0];

    const transaction = await transactionService.createTransaction(client, {
      account_id: inst.account_id,
      category_id: category_id,
      installment_id: installmentId,
      amount: amount,
      type: 'expense',
      date: date,
      description: description || `Rata ${inst.name}`,
      tags: inst.tags
    });

    // paid_installments conta i VERSAMENTI effettuati (non le rate coperte per importo).
    // La fonte di verità per il debito residuo è paid_amount_total (somma reale delle transazioni),
    // già usata correttamente in predictEngine.js e nel GET /installments.
    // Usare Math.floor(amount/monthly_amount) sarebbe fragile: se cambi la rata da 250 a 500,
    // i calcoli sui pagamenti passati andrebbero in errore.
    await client.query(
      'UPDATE installments SET paid_installments = paid_installments + 1 WHERE id = $1',
      [installmentId]
    );
    await client.query('COMMIT');
    res.json({ success: true, transaction });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 7.4 DELETE Installment
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM installments WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
