const express = require('express');
const cors = require('cors');
const pool = require("./db");
const app = express();
app.use(cors());

const deadlinesRouter = require("./routes/deadlines");
const predictionsRouter = require("./routes/predictions");
const subscriptionsRouter = require("./routes/subscriptions");
const accountsRouter = require("./routes/accounts");
const categoriesRouter = require("./routes/categories");
const dashboardRouter = require("./routes/dashboard");
const transactionsRouter = require("./routes/transactions");
const investmentsRouter = require("./routes/investments");
const investmentPlansRouter = require("./routes/investment-plans");
const installmentsRouter = require("./routes/installments");
const tagsRouter = require("./routes/tags");
const tagStatsRouter = require("./routes/tag-stats");

app.use(express.json());
app.use("/api/deadlines", deadlinesRouter);
app.use("/api/predictions", predictionsRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/dashboard-stats", dashboardRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/investments", investmentsRouter);
app.use("/api/investment-plans", investmentPlansRouter);
app.use("/api/installments", installmentsRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/tag-stats", tagStatsRouter);

const PORT = process.env.PORT || 5000;

// --- API ROUTES ---

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', db_time: result.rows[0].now });
  } catch (err) {
    console.error("DATABASE HEALTH ERROR:", err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.post('/api/query', async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: 'Query mancante' });
  
  try {
    const result = await pool.query(sql);
    if (result.command === 'SELECT') {
      res.json({ type: 'select', data: result.rows, fields: result.fields.map(f => f.name) });
    } else {
      res.json({ type: 'command', message: `${result.command} completato con successo.`, rowCount: result.rowCount });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const initDB = async () => {
  try {
    await pool.query('ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false');
    await pool.query('ALTER TABLE installments ADD COLUMN IF NOT EXISTS tags INT[] DEFAULT \'{}\'');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        color VARCHAR(20) DEFAULT '#3b82f6',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`ALTER TABLE tags ADD COLUMN IF NOT EXISTS description TEXT`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transaction_tags (
        transaction_id INT REFERENCES transactions(id) ON DELETE CASCADE,
        tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (transaction_id, tag_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bulk_operations (
        id SERIAL PRIMARY KEY,
        operation_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bulk_operations_data (
        id SERIAL PRIMARY KEY,
        bulk_op_id INT REFERENCES bulk_operations(id) ON DELETE CASCADE,
        transaction_id INT, 
        old_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const checkRes = await pool.query("SELECT 1 FROM accounts WHERE name = 'Investimenti' AND is_system = true");
    if (checkRes.rows.length === 0) {
      await pool.query("INSERT INTO accounts (name, type, initial_balance, is_system) VALUES ('Investimenti', 'Portfolio', 0, true)");
      console.log(" [System Init]: Creato conto 'Investimenti' di sistema.");
    }
    console.log(" [System Init]: Database controllato e pronto.");
  } catch (err) {
    console.error(" [System Init Error]:", err.message);
  }
};

app.listen(PORT, async () => {
  await initDB();
  console.log(`Server running on port ${PORT}`);
});
