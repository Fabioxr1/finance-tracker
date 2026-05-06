/**
 * Transaction Service
 * Gestisce in modo centralizzato la creazione e validazione delle transazioni nel database.
 */

const { logTransaction } = require('./logger');

const TRANSACTION_COLUMNS = [
  'account_id', 'to_account_id', 'category_id', 'installment_id', 
  'amount', 'type', 'recurrence_type', 'date', 'description'
];

const transactionService = {
  /**
   * Crea una nuova transazione
   * @param {Object} client - Il client del database (Pool o Transaction Client)
   * @param {Object} data - I dati della transazione (chiavi = nomi colonne DB)
   * @returns {Object} La transazione creata
   */
  async createTransaction(client, data) {
    try {
      // 1. Estrazione Tag e Validazione Campi Obbligatori
      const { tags, tagNames, ...transactionData } = data; // Estraiamo tag e tagNames e teniamo il resto
      
      const requiredFields = ['amount', 'type', 'date'];
      if (transactionData.type !== 'transfer') {
        requiredFields.push('category_id');
      }

      for (const field of requiredFields) {
        if (transactionData[field] === undefined || transactionData[field] === null || transactionData[field] === "") {
          throw new Error(`Errore Validazione: Il campo '${field}' è obbligatorio.`);
        }
      }

      if (!transactionData.account_id && !transactionData.to_account_id) {
        throw new Error("Errore Validazione: È necessario fornire almeno uno tra 'account_id' o 'to_account_id'.");
      }

      // 2. Sanificazione Dati: Filtriamo solo le colonne reali del DB e convertiamo stringhe vuote in NULL
      const sanitizedData = {};
      for (const [key, value] of Object.entries(transactionData)) {
        if (TRANSACTION_COLUMNS.includes(key)) {
          sanitizedData[key] = value === "" ? null : value;
        }
      }

      // 3. Costruzione Dinamica della Query per la tabella transactions
      const keys = Object.keys(sanitizedData);
      const values = Object.values(sanitizedData);
      
      const columns = keys.join(', ');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

      const sql = `
        INSERT INTO transactions (${columns})
        VALUES (${placeholders})
        RETURNING *
      `;

      // 4. Esecuzione Inserimento Transazione
      const res = await client.query(sql, values);
      
      if (res.rows.length === 0) {
        throw new Error("Errore durante l'inserimento: Nessuna riga restituita.");
      }

      const newTx = res.rows[0];

      // 5. Inserimento Tag (se presenti come ID)
      if (tags && Array.isArray(tags) && tags.length > 0) {
        const tagQueries = tags.map(tagId => 
          client.query('INSERT INTO transaction_tags (transaction_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [newTx.id, tagId])
        );
        await Promise.all(tagQueries);
      }

      // 6. Inserimento Tag tramite Nomi (per Importazione CSV)
      if (tagNames && Array.isArray(tagNames) && tagNames.length > 0) {
        for (const tagName of tagNames) {
          const cleanName = tagName.toLowerCase().trim();
          if (!cleanName) continue;

          // Cerca o crea il tag
          let tagRes = await client.query('SELECT id FROM tags WHERE LOWER(name) = $1', [cleanName]);
          let tagId;

          if (tagRes.rows.length > 0) {
            tagId = tagRes.rows[0].id;
          } else {
            // Crea nuovo tag con colore di default
            const newTagRes = await client.query(
              'INSERT INTO tags (name, color) VALUES ($1, $2) RETURNING id',
              [cleanName, '#3b82f6']
            );
            tagId = newTagRes.rows[0].id;
          }

          // Associa il tag
          await client.query(
            'INSERT INTO transaction_tags (transaction_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [newTx.id, tagId]
          );
        }
      }
      
      // Log su Console
      console.log(`[Transaction Created]: ID=${newTx.id} | ${newTx.type.toUpperCase()} | ${newTx.amount}€ | ${newTx.description}`);

      // Log su File tramite logger centralizzato
      logTransaction(newTx, 'CREATE');

      return newTx;
    } catch (error) {
      console.error(" [TransactionService Error]:", error.message);
      // Rilanciamo l'errore per farlo gestire al chiamante (es. inviare 500 al frontend)
      throw error;
    }
  },

  /**
   * Aggiorna una transazione esistente
   * @param {Object} client - Il client del database (Pool o Transaction Client)
   * @param {number} id - ID della transazione da aggiornare
   * @param {Object} data - I dati da aggiornare
   * @returns {Object} La transazione aggiornata
   */
  async updateTransaction(client, id, data) {
    try {
      const { tags, tagNames, ...transactionData } = data;

      // 1. Sanificazione Dati: Filtriamo solo le colonne reali del DB e convertiamo stringhe vuote in NULL
      const sanitizedData = {};
      for (const [key, value] of Object.entries(transactionData)) {
        if (TRANSACTION_COLUMNS.includes(key) && value !== undefined) {
          sanitizedData[key] = value === "" ? null : value;
        }
      }

      // 2. Costruzione Dinamica della Query UPDATE
      const keys = Object.keys(sanitizedData);
      const values = Object.values(sanitizedData);
      
      if (keys.length > 0) {
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        const sql = `UPDATE transactions SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
        const res = await client.query(sql, [...values, id]);
        
        if (res.rows.length === 0) {
          throw new Error(`Transazione con ID ${id} non trovata.`);
        }
      }

      // 3. Gestione Tag (Reset e Re-inserimento)
      // Se vengono passati tags o tagNames, aggiorniamo la tabella ponte
      if (tags !== undefined || tagNames !== undefined) {
        await client.query('DELETE FROM transaction_tags WHERE transaction_id = $1', [id]);

        // Tag per ID
        if (tags && Array.isArray(tags) && tags.length > 0) {
          for (const tagId of tags) {
            await client.query('INSERT INTO transaction_tags (transaction_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, tagId]);
          }
        }

        // Tag per Nome (Import CSV)
        if (tagNames && Array.isArray(tagNames) && tagNames.length > 0) {
          for (const tagName of tagNames) {
            const cleanName = tagName.toLowerCase().trim();
            if (!cleanName) continue;

            let tagRes = await client.query('SELECT id FROM tags WHERE LOWER(name) = $1', [cleanName]);
            let tagId;
            if (tagRes.rows.length > 0) {
              tagId = tagRes.rows[0].id;
            } else {
              const newTagRes = await client.query('INSERT INTO tags (name, color) VALUES ($1, $2) RETURNING id', [cleanName, '#3b82f6']);
              tagId = newTagRes.rows[0].id;
            }
            await client.query('INSERT INTO transaction_tags (transaction_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, tagId]);
          }
        }
      }

      const updatedRes = await client.query('SELECT * FROM transactions WHERE id = $1', [id]);
      const updatedTx = updatedRes.rows[0];

      logTransaction(updatedTx, 'UPDATE');
      console.log(`[Transaction Updated]: ID=${id} | ${updatedTx.amount}€ | ${updatedTx.description}`);

      return updatedTx;
    } catch (error) {
      console.error(" [TransactionService Update Error]:", error.message);
      throw error;
    }
  }
};

module.exports = transactionService;
