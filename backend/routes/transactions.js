const express = require('express');
const router = express.Router();
const pool = require("../db");
const { prepareTransactionParams } = require('../utils/txFormatter');
const transactionService = require('../utils/transactionService');
const { logTransaction } = require('../utils/logger');

// 4. GET Transactions
router.get('/', async (req, res) => {
  const { page = 1, limit = 50, year, month, type, account_id, category_id, description, installment_id, id, amount } = req.query;
  const offset = (page - 1) * limit;

  try {
    let whereClauses = [];
    let values = [];
    let valueCount = 1;

    if (year) {
      whereClauses.push(`EXTRACT(YEAR FROM t.date) = $${valueCount++}`);
      values.push(year);
    }
    if (month) {
      whereClauses.push(`EXTRACT(MONTH FROM t.date) = $${valueCount++}`);
      values.push(month);
    }
    if (type) {
      whereClauses.push(`t.type = $${valueCount++}`);
      values.push(type);
    }
    if (account_id) {
      whereClauses.push(`t.account_id = $${valueCount++}`);
      values.push(account_id);
    }
    if (category_id) {
      whereClauses.push(`t.category_id = $${valueCount++}`);
      values.push(category_id);
    }
    if (description) {
      whereClauses.push(`t.description ILIKE $${valueCount++}`);
      values.push(`%${description}%`);
    }
    if (installment_id) {
        whereClauses.push(`t.installment_id = $${valueCount++}`);
        values.push(installment_id);
    }
    if (id) {
      whereClauses.push(`t.id = $${valueCount++}`);
      values.push(id);
    }
    if (amount) {
      whereClauses.push(`CAST(t.amount AS TEXT) LIKE $${valueCount++}`);
      values.push(`%${amount}%`);
    }
    if (req.query.tag_id) {
      whereClauses.push(`EXISTS (SELECT 1 FROM transaction_tags tt WHERE tt.transaction_id = t.id AND tt.tag_id = $${valueCount++})`);
      values.push(req.query.tag_id);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const summaryQuery = `
      SELECT 
        COUNT(*) as count, 
        SUM(CASE WHEN t.type = 'income' THEN t.amount WHEN t.type = 'expense' THEN -t.amount ELSE 0 END) as balance,
        SUM(t.amount) as absolute_total
      FROM transactions t
      ${whereString}
    `;

    const dataQuery = `
      SELECT t.*, c.name as category_name, a.name as account_name, 
             a2.name as to_account_name, i.name as installment_name,
             (
               SELECT json_agg(json_build_object('id', tg.id, 'name', tg.name, 'color', tg.color, 'description', tg.description))
               FROM tags tg
               JOIN transaction_tags tt ON tg.id = tt.tag_id
               WHERE tt.transaction_id = t.id
             ) as tags
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN accounts a2 ON t.to_account_id = a2.id
      LEFT JOIN installments i ON t.installment_id = i.id
      ${whereString}
      ORDER BY t.date DESC, t.id DESC
      LIMIT $${valueCount++} OFFSET $${valueCount++}
    `;

    const [summaryResult, dataResult] = await Promise.all([
      pool.query(summaryQuery, values),
      pool.query(dataQuery, [...values, limit, offset])
    ]);

    const totalCount = parseInt(summaryResult.rows[0].count);
    const totalBalance = parseFloat(summaryResult.rows[0].balance || 0);
    const absoluteTotal = parseFloat(summaryResult.rows[0].absolute_total || 0);

    res.json({
      data: dataResult.rows,
      totalBalance,
      absoluteTotal,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4.1 POST Transaction - Aggiunge una nuova transazione
router.post('/', async (req, res) => {
  const { description } = req.body;
  let txData = { ...req.body };

  try {
    if (!txData.installment_id && description) {
      const installments = await pool.query('SELECT id, search_keyword FROM installments WHERE search_keyword IS NOT NULL AND search_keyword != \'\'');
      for (const inst of installments.rows) {
        if (description.toUpperCase().includes(inst.search_keyword.toUpperCase())) {
          txData.installment_id = inst.id;
          break;
        }
      }
    }

    const transaction = await transactionService.createTransaction(pool, txData);
    
    // Aggiornamento contatore rate pagate
    if (txData.installment_id) {
      await pool.query('UPDATE installments SET paid_installments = paid_installments + 1 WHERE id = $1', [txData.installment_id]);
      
      // Se non sono stati passati tag manualmente, prova ad applicare quelli di default del finanziamento
      if (!txData.tags || txData.tags.length === 0) {
        const instRes = await pool.query('SELECT tags FROM installments WHERE id = $1', [txData.installment_id]);
        const defaultTags = instRes.rows[0]?.tags;
        if (defaultTags && defaultTags.length > 0) {
          const tagQueries = defaultTags.map(tagId => 
            pool.query('INSERT INTO transaction_tags (transaction_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [transaction.id, tagId])
          );
          await Promise.all(tagQueries);
        }
      }
    }

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4.2 DELETE Transaction
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const txRes = await client.query('SELECT * FROM transactions WHERE id = $1', [req.params.id]);
    if (txRes.rows.length === 0) {
        throw new Error("Transazione non trovata");
    }
    const oldTx = txRes.rows[0];
    const installmentId = oldTx.installment_id;

    await client.query('DELETE FROM transactions WHERE id=$1', [req.params.id]);

    if (installmentId) {
      await client.query('UPDATE installments SET paid_installments = GREATEST(0, paid_installments - 1) WHERE id = $1', [installmentId]);
    }

    await client.query('COMMIT');
    logTransaction(oldTx, 'DELETE');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 4.3 UPDATE Transaction
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Recuperiamo la vecchia transazione per vedere se è cambiato l'installment_id
    const oldTxRes = await client.query('SELECT installment_id FROM transactions WHERE id = $1', [req.params.id]);
    if (oldTxRes.rows.length === 0) throw new Error('Transazione non trovata');
    const oldInstallmentId = oldTxRes.rows[0].installment_id;

    // Utilizzo del service centralizzato
    const updatedTx = await transactionService.updateTransaction(client, req.params.id, req.body);
    const newInstallmentId = updatedTx.installment_id;

    // Se l'installment_id è cambiato, aggiorniamo i contatori dei finanziamenti
    if (oldInstallmentId !== newInstallmentId) {
      if (oldInstallmentId) {
        await client.query('UPDATE installments SET paid_installments = GREATEST(0, paid_installments - 1) WHERE id = $1', [oldInstallmentId]);
      }
      if (newInstallmentId) {
        await client.query('UPDATE installments SET paid_installments = paid_installments + 1 WHERE id = $1', [newInstallmentId]);
      }
    }

    await client.query('COMMIT');
    res.json(updatedTx);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 5. BULK CREATE/UPDATE Transactions
router.post('/bulk', async (req, res) => {
  const { transactions } = req.body;
  if (!transactions || !Array.isArray(transactions)) {
    return res.status(400).json({ error: "Dati non validi" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const installments = await pool.query('SELECT id, search_keyword FROM installments WHERE search_keyword IS NOT NULL AND search_keyword != \'\'');

    for (const tx of transactions) {
      let txData = { ...tx };
      
      // Associazione automatica finanziamento (solo se non già presente)
      if (!txData.installment_id && txData.description) {
        for (const inst of installments.rows) {
          if (txData.description.toUpperCase().includes(inst.search_keyword.toUpperCase())) {
            txData.installment_id = inst.id;
            break;
          }
        }
      }

      if (txData.id) {
        // --- LOGICA AGGIORNAMENTO (UPDATE) ---
        // Recuperiamo la vecchia transazione per gestire i contatori finanziamenti
        const oldTxRes = await client.query('SELECT installment_id FROM transactions WHERE id = $1', [txData.id]);
        
        if (oldTxRes.rows.length > 0) {
          const oldInstallmentId = oldTxRes.rows[0].installment_id;
          const updatedTx = await transactionService.updateTransaction(client, txData.id, txData);
          const newInstallmentId = updatedTx.installment_id;

          // Gestione contatori finanziamenti se l'id finanziamento è cambiato
          if (oldInstallmentId !== newInstallmentId) {
            if (oldInstallmentId) {
              await client.query('UPDATE installments SET paid_installments = GREATEST(0, paid_installments - 1) WHERE id = $1', [oldInstallmentId]);
            }
            if (newInstallmentId) {
              await client.query('UPDATE installments SET paid_installments = paid_installments + 1 WHERE id = $1', [newInstallmentId]);
            }
          }
        } else {
          // Se l'ID non esiste nel DB, potremmo decidere di ignorarlo o crearlo come nuova
          // Per sicurezza, creiamo una nuova transazione ignorando l'ID inesistente
          delete txData.id;
          await transactionService.createTransaction(client, txData);
        }
      } else {
        // --- LOGICA CREAZIONE (INSERT - Comportamento Originale) ---
        const newTx = await transactionService.createTransaction(client, txData);
        
        // Incremento rate in bulk
        if (txData.installment_id) {
          await client.query('UPDATE installments SET paid_installments = paid_installments + 1 WHERE id = $1', [txData.installment_id]);
          
          // Applica tag di default del finanziamento in bulk
          const instRes = await client.query('SELECT tags FROM installments WHERE id = $1', [txData.installment_id]);
          const defaultTags = instRes.rows[0]?.tags;
          if (defaultTags && defaultTags.length > 0) {
            for (const tagId of defaultTags) {
              await client.query('INSERT INTO transaction_tags (transaction_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [newTx.id, tagId]);
            }
          }
        }
      }
    }
    await client.query('COMMIT');
    res.json({ success: true, count: transactions.length });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 5.1 BULK DELETE Transactions
router.post('/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: "ID non validi" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Per ogni transazione, se ha un installment_id, decrementiamo
    for (const id of ids) {
      const txRes = await client.query('SELECT installment_id FROM transactions WHERE id = $1', [id]);
      if (txRes.rows.length > 0 && txRes.rows[0].installment_id) {
        await client.query('UPDATE installments SET paid_installments = GREATEST(0, paid_installments - 1) WHERE id = $1', [txRes.rows[0].installment_id]);
      }
    }

    await client.query('DELETE FROM transactions WHERE id = ANY($1)', [ids]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 5.2 BULK UPDATE Transactions
router.post('/bulk-update', async (req, res) => {
  const { ids, updates, tag_id } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: "ID non validi" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (updates && Object.keys(updates).length > 0) {
      let setClauses = [];
      let values = [];
      let count = 1;

      Object.keys(updates).forEach(key => {
        setClauses.push(`${key} = $${count++}`);
        values.push(updates[key]);
      });

      values.push(ids);
      const query = `UPDATE transactions SET ${setClauses.join(', ')} WHERE id = ANY($${count})`;
      await client.query(query, values);
    }

    if (tag_id) {
      const tagQueries = ids.map(txId => 
        client.query('INSERT INTO transaction_tags (transaction_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [txId, tag_id])
      );
      await Promise.all(tagQueries);
    }

    if (req.body.remove_tag_id) {
      await client.query('DELETE FROM transaction_tags WHERE transaction_id = ANY($1) AND tag_id = $2', [ids, req.body.remove_tag_id]);
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
