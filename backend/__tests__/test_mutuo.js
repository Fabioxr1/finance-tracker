const pool = require('../db');
const predictEngine = require('../utils/predictEngine');

async function runMutuoTestReal() {
  console.log("--- INIZIO TEST REALE (CON TRANSAZIONE RATA) ---");

  try {
    const initial = await predictEngine.getPredictions();
    console.log(`\nSTATO INIZIALE:`);
    console.log(`- Saldo Attuale: € ${initial.currentBalance}`);
    console.log(`- Rate Residue 2026: € ${initial.remainingInstallmentsTotal}`);
    console.log(`- Saldo 31/12: € ${initial.endOfYearBalance}`);

    const insRes = await pool.query("SELECT id, monthly_amount FROM installments WHERE paid_installments < total_installments LIMIT 1");
    const ins = insRes.rows[0];
    const accountRes = await pool.query("SELECT id FROM accounts LIMIT 1");
    const accId = accountRes.rows[0]?.id;

    if (!ins || !accId) {
      console.log("Errore: Dati insufficienti per il test.");
      return;
    }

    const rataAmount = Number(ins.monthly_amount);

    console.log(`\n--------------------------------------`);
    console.log(`SIMULAZIONE: Registro il pagamento della Rata di Maggio (€ ${rataAmount})...`);

    // Inserisco la transazione reale con la parola chiave 'Rata'
    await pool.query(`
      INSERT INTO transactions (account_id, amount, type, description, date)
      VALUES ($1, $2, 'expense', 'Pagamento Rata Test', CURRENT_DATE)
    `, [accId, rataAmount]);

    const after = await predictEngine.getPredictions();
    console.log(`\nRISULTATO DOPO IL PAGAMENTO:`);
    console.log(`- Saldo Attuale: € ${after.currentBalance} (Calato di € ${rataAmount})`);
    console.log(`- Rate Residue 2026: € ${after.remainingInstallmentsTotal} (Dovrebbe essere calato di € ${rataAmount})`);
    console.log(`- Saldo 31/12: € ${after.endOfYearBalance} (DOVREBBE ESSERE IDENTICO ALL'INIZIALE)`);

    // PULIZIA
    await pool.query("DELETE FROM transactions WHERE description = 'Pagamento Rata Test'");

    const diff = Math.abs(initial.endOfYearBalance - after.endOfYearBalance);
    if (diff < 10) {
      console.log(`\n✅ TEST SUPERATO! La proiezione è rimasta stabile perché il sistema ha scalato il debito futuro.`);
    } else {
      console.log(`\n❌ TEST FALLITO. Differenza: ${diff}`);
    }

  } catch (err) {
    console.error("Errore:", err);
  } finally {
    process.exit();
  }
}

runMutuoTestReal();
