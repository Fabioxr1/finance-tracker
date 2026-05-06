const pool = require('../db');
const predictEngine = require('../utils/predictEngine');

async function runStepTest() {
  console.log("--- INIZIO STRESS TEST (3 STEP) ---");

  try {
    const initial = await predictEngine.getPredictions();
    console.log(`\nSTATO INIZIALE (PULITO):`);
    console.log(`- Saldo Attuale: € ${initial.currentBalance}`);
    console.log(`- Saldo 31/12:   € ${initial.endOfYearBalance}`);
    console.log(`- Budget Libero: € ${initial.freeBudget}`);

    const catRes = await pool.query("SELECT id FROM categories WHERE name ILIKE '%spesa%' LIMIT 1");
    const catId = catRes.rows[0]?.id;
    const accountRes = await pool.query("SELECT id FROM accounts LIMIT 1");
    const accId = accountRes.rows[0]?.id;

    const steps = [100, 500, 1000];

    for (let amount of steps) {
      console.log(`\n--------------------------------------`);
      console.log(`STEP: Inserisco spesa di € ${amount}...`);

      await pool.query(`
        INSERT INTO transactions (account_id, category_id, amount, type, description, date)
        VALUES ($1, $2, $3, 'expense', 'STRESS_TEST', CURRENT_DATE)
      `, [accId, catId, amount]);

      const data = await predictEngine.getPredictions();
      console.log(`NUOVI DATI:`);
      console.log(`- Saldo Attuale: € ${data.currentBalance}`);
      console.log(`- Saldo 31/12:   € ${data.endOfYearBalance} (Diff: ${data.endOfYearBalance - initial.endOfYearBalance})`);
      console.log(`- Budget Libero: € ${data.freeBudget} (Diff: ${data.freeBudget - initial.freeBudget})`);

      // Pulizia per lo step successivo
      await pool.query("DELETE FROM transactions WHERE description = 'STRESS_TEST'");
    }

    console.log(`\n--- STRESS TEST COMPLETATO ---`);

  } catch (err) {
    console.error("Errore:", err);
  } finally {
    process.exit();
  }
}

runStepTest();
