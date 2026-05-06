const express = require('express');
const router = express.Router();
const pool = require("../db");
const { getLivePrice } = require('../utils/investments');
const { calculateInvestmentPerformance } = require('../utils/investmentCalculations');
const transactionService = require('../utils/transactionService');

// 6.1 GET Portfolio - Lista titoli con calcolo performance
router.get('/', async (req, res) => {
  try {
    const investments = await pool.query('SELECT i.*, a.name as account_name FROM investments i LEFT JOIN accounts a ON i.account_id = a.id');
    const portfolio = [];
    
    for (const inv of investments.rows) {
      const txs = await pool.query(
        'SELECT type, shares, price_per_share, total_amount FROM investment_transactions WHERE investment_id = $1',
        [inv.id]
      );
      let livePrice = null;
      if (!inv.use_manual_price || inv.manual_price === null) {
        livePrice = await getLivePrice(inv.ticker);
      }

      const performance = calculateInvestmentPerformance(inv, txs.rows, livePrice);

      portfolio.push({
        ...inv,
        ...performance
      });
    }
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6.2 POST New Title
router.post('/', async (req, res) => {
  const { name, isin, ticker, type, account_id, manual_price, use_manual_price } = req.body;
  const accId = (account_id === '' || account_id === undefined) ? null : account_id;
  const mPrice = (manual_price === '' || manual_price === undefined) ? null : manual_price;

  try {
    const result = await pool.query(
      'INSERT INTO investments (name, isin, ticker, type, account_id, manual_price, use_manual_price) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, isin, ticker, type, accId, mPrice, use_manual_price || false]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6.2.1 PUT Investment
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { name, isin, ticker, type, account_id, manual_price, use_manual_price } = req.body;
    const targetAccountId = (account_id === '' || account_id === undefined) ? null : account_id;
    const mPrice = (manual_price === '' || manual_price === undefined) ? null : manual_price;

    const result = await client.query(
      'UPDATE investments SET name=$1, isin=$2, ticker=$3, type=$4, account_id=$5, manual_price=$6, use_manual_price=$7 WHERE id=$8 RETURNING *',
      [name, isin, ticker, type, targetAccountId, mPrice, use_manual_price, req.params.id]
    );

    await client.query(`
      UPDATE transactions 
      SET account_id = CASE WHEN account_id IS NOT NULL THEN $1::int ELSE NULL END,
          to_account_id = CASE WHEN to_account_id IS NOT NULL THEN $1::int ELSE NULL END
      WHERE id IN (SELECT linked_transaction_id FROM investment_transactions WHERE investment_id = $2 AND linked_transaction_id IS NOT NULL)
    `, [targetAccountId, req.params.id]);

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 6.2.2 DELETE Investment
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      DELETE FROM transactions 
      WHERE id IN (SELECT linked_transaction_id FROM investment_transactions WHERE investment_id = $1 AND linked_transaction_id IS NOT NULL)
    `, [req.params.id]);
    await client.query('DELETE FROM investment_transactions WHERE investment_id = $1', [req.params.id]);
    await client.query('DELETE FROM investments WHERE id = $1', [req.params.id]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 6.3 POST Transaction (Investment)
router.post('/transactions', async (req, res) => {
  const { investment_id, date, shares, price_per_share, total_amount, type } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const invRes = await client.query('SELECT name, account_id FROM investments WHERE id = $1', [investment_id]);
    const { name, account_id: default_account_id } = invRes.rows[0];
    const targetAccountId = req.body.account_id || default_account_id;

    let catRes = await client.query("SELECT id FROM categories WHERE name = 'Investimenti'");
    let category_id;
    if (catRes.rows.length === 0) {
      const newCat = await client.query("INSERT INTO categories (name, type) VALUES ('Investimenti', 'expense') RETURNING id");
      category_id = newCat.rows[0].id;
    } else {
      category_id = catRes.rows[0].id;
    }

    const txType = 'transfer';
    const txDesc = `${type === 'buy' ? 'Acquisto' : 'Vendita'} ${name} (${shares} quote)`;

    // Recupera l'ID del conto "Investimenti" di sistema
    const systemAccRes = await client.query("SELECT id FROM accounts WHERE name = 'Investimenti' AND is_system = true");
    const systemAccountId = systemAccRes.rows[0]?.id;

    // Se compro: escono da targetAccountId ed entrano in systemAccountId
    // Se vendo: escono da systemAccountId ed entrano in targetAccountId
    const fromAcc = type === 'buy' ? targetAccountId : systemAccountId;
    const toAcc = type === 'buy' ? systemAccountId : targetAccountId;

    const txResult = await transactionService.createTransaction(client, {
      account_id: fromAcc,
      to_account_id: toAcc,
      category_id: category_id,
      amount: total_amount,
      type: txType,
      date: date,
      description: txDesc
    });
    const linked_transaction_id = txResult.id;

    const result = await client.query(
      'INSERT INTO investment_transactions (investment_id, date, shares, price_per_share, total_amount, type, linked_transaction_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [investment_id, date, shares, price_per_share, total_amount, type, linked_transaction_id]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 6.4 GET Investment Transactions
router.get('/:id/transactions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM investment_transactions WHERE investment_id = $1 ORDER BY date DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6.5 UPDATE Investment Transaction
router.put('/transactions/:id', async (req, res) => {
  const { date, shares, price_per_share, total_amount, type } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const oldRes = await client.query(`
      SELECT it.linked_transaction_id, i.name,
             COALESCE(t.account_id, t.to_account_id) as original_account_id
      FROM investment_transactions it 
      JOIN investments i ON it.investment_id = i.id
      LEFT JOIN transactions t ON t.id = it.linked_transaction_id
      WHERE it.id = $1`, [req.params.id]);
    
    if (oldRes.rows.length > 0) {
      const { linked_transaction_id, name, original_account_id } = oldRes.rows[0];
      if (linked_transaction_id) {
        // Recupera l'ID del conto "Investimenti" di sistema
        const systemAccRes = await client.query("SELECT id FROM accounts WHERE name = 'Investimenti' AND is_system = true");
        const systemAccountId = systemAccRes.rows[0]?.id;

        const txType = 'transfer';
        const txDesc = `${type === 'buy' ? 'Acquisto' : 'Vendita'} ${name} (${shares} quote)`;
        
        // Se compro: escono da original_account_id ed entrano in systemAccountId
        // Se vendo: escono da systemAccountId ed entrano in original_account_id
        const fromAcc = type === 'buy' ? original_account_id : systemAccountId;
        const toAcc = type === 'buy' ? systemAccountId : original_account_id;

        await client.query(
          'UPDATE transactions SET account_id=$1, to_account_id=$2, amount=$3, type=$4, date=$5, description=$6 WHERE id=$7',
          [fromAcc, toAcc, total_amount, txType, date, txDesc, linked_transaction_id]
        );
      }
    }

    const result = await client.query(
      'UPDATE investment_transactions SET date=$1, shares=$2, price_per_share=$3, total_amount=$4, type=$5 WHERE id=$6 RETURNING *',
      [date, shares, price_per_share, total_amount, type, req.params.id]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 6.6 DELETE Investment Transaction
router.delete('/transactions/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const oldRes = await client.query('SELECT linked_transaction_id FROM investment_transactions WHERE id = $1', [req.params.id]);
    if (oldRes.rows.length > 0 && oldRes.rows[0].linked_transaction_id) {
      await client.query('DELETE FROM transactions WHERE id = $1', [oldRes.rows[0].linked_transaction_id]);
    }
    await client.query('DELETE FROM investment_transactions WHERE id = $1', [req.params.id]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 6.2.3 PATCH Investment Price - Aggiornamento rapido prezzo
router.patch('/:id/price', async (req, res) => {
  const { manual_price, use_manual_price } = req.body;
  const mPrice = (manual_price === '' || manual_price === undefined) ? null : manual_price;
  try {
    const result = await pool.query(
      'UPDATE investments SET manual_price=$1, use_manual_price=$2 WHERE id=$3 RETURNING *',
      [mPrice, use_manual_price, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
