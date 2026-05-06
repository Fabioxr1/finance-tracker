const pool = require('../db');

class PredictEngine {
  constructor() {
    this.now = new Date();
    this.currentYear = this.now.getFullYear();
    this.currentMonthIndex = this.now.getMonth(); 
    this.monthsRemaining = 11 - this.currentMonthIndex; // Mesi da qui a fine anno (escluso il corrente)
    
    // Stato interno per accumulare i dati
    this.data = {
      currentBalance: 0,
      realIncomeYear: 0,
      realCoreExpenseYear: 0,
      realLoanExpenseYear: 0,
      realExtraExpenseYear: 0,
      
      avgMonthlyIncome: 0,
      avgMonthlyExpense: 0,
      
      futureIncome: 0,
      futureCoreExpense: 0,
      futureLoanObligations: 0,
      futureDeadlines: 0,
      
      fullYearIncomeTotal: 0,
      fullYearExpenseTotal: 0,
      freeBudget: 0,
      savingsRate: 0
    };
  }

  /**
   * Metodo principale che orchestra l'intera pipeline
   */
  async getPredictions() {
    try {
      await this.fetchLiquidity();
      await this.fetchRealYearData();
      await this.calculateAverages();
      await this.projectFuture();
      await this.calculateObligations();
      
      return this.formatOutput();
    } catch (err) {
      console.error("PredictEngine Class Error:", err);
      throw err;
    }
  }

  /**
   * 1. Recupera la liquidità attuale di tutti i conti
   */
  async fetchLiquidity() {
    const res = await pool.query(`
      SELECT SUM(
        initial_balance + 
        COALESCE((SELECT SUM(amount) FROM transactions WHERE account_id = a.id AND type = 'income'), 0) +
        COALESCE((SELECT SUM(amount) FROM transactions WHERE to_account_id = a.id AND type = 'transfer'), 0) -
        COALESCE((SELECT SUM(amount) FROM transactions WHERE account_id = a.id AND (type = 'expense' OR type = 'transfer')), 0)
      ) as total_liquid
      FROM accounts a
    `);
    this.data.currentBalance = Number(res.rows[0]?.total_liquid || 0);
  }

  /**
   * 2. Recupera i dati reali già avvenuti nell'anno in corso
   */
  async fetchRealYearData() {
    const res = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' AND (recurrence_type IS NULL OR recurrence_type != 'extraordinary') THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' AND to_account_id IS NULL AND installment_id IS NULL AND description NOT ILIKE '%rata%' AND description NOT ILIKE '%finanziamento%' AND (recurrence_type IS NULL OR recurrence_type != 'extraordinary') THEN amount ELSE 0 END), 0) AS core_expense,
        COALESCE(SUM(CASE WHEN type = 'expense' AND to_account_id IS NULL AND (installment_id IS NOT NULL OR description ILIKE '%rata%' OR description ILIKE '%finanziamento%') THEN amount ELSE 0 END), 0) AS loan_expense,
        COALESCE(SUM(CASE WHEN type = 'expense' AND to_account_id IS NULL AND (recurrence_type = 'extraordinary') THEN amount ELSE 0 END), 0) AS extra_expense
      FROM transactions
      WHERE EXTRACT(YEAR FROM date) = $1
    `, [this.currentYear]);

    const row = res.rows[0];
    this.data.realIncomeYear = Number(row.income);
    this.data.realCoreExpenseYear = Number(row.core_expense);
    this.data.realLoanExpenseYear = Number(row.loan_expense);
    this.data.realExtraExpenseYear = Number(row.extra_expense);
  }

  /**
   * 3. Calcola le medie mensili basate sulla storia reale (Ultimi 6 mesi)
   * Logica: divide solo per i mesi in cui c'è stata effettiva attività
   */
  async calculateAverages() {
    const res = await pool.query(`
      WITH monthly_data AS (
        SELECT 
          date_trunc('month', date) as month,
          SUM(CASE WHEN type = 'income' AND (recurrence_type IS NULL OR recurrence_type != 'extraordinary') THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' AND to_account_id IS NULL AND installment_id IS NULL AND description NOT ILIKE '%rata%' AND description NOT ILIKE '%finanziamento%' AND (recurrence_type IS NULL OR recurrence_type != 'extraordinary') THEN amount ELSE 0 END) as core_expense
        FROM transactions
        WHERE date >= date_trunc('month', CURRENT_DATE) - INTERVAL '6 months'
        AND date < date_trunc('month', CURRENT_DATE)
        GROUP BY 1
      )
      SELECT 
        SUM(income) as total_income,
        SUM(core_expense) as total_expense,
        COUNT(CASE WHEN income > 0 THEN 1 END) as active_income_months,
        COUNT(CASE WHEN core_expense > 0 THEN 1 END) as active_expense_months
      FROM monthly_data
    `);

    const row = res.rows[0];
    const incomeMonths = Math.max(Number(row.active_income_months || 0), 1);
    const expenseMonths = Math.max(Number(row.active_expense_months || 0), 1);

    this.data.avgMonthlyIncome = Number(row.total_income || 0) / incomeMonths;
    this.data.avgMonthlyExpense = Number(row.total_expense || 0) / expenseMonths;
  }

  /**
   * 3bis. Raffinamento Medie per Tipologia (Opzionale, ma consigliato per precisione)
   * Questa query calcola il peso mensile specifico per ogni categoria
   */
  async refineAverages() {
    const res = await pool.query(`
      WITH category_stats AS (
        SELECT 
          c.name as category_name, 
          t.recurrence_type,
          SUM(CASE WHEN t.date >= date_trunc('month', CURRENT_DATE) - INTERVAL '12 months' THEN t.amount ELSE 0 END) as total_12m,
          SUM(CASE WHEN t.date >= date_trunc('month', CURRENT_DATE) - INTERVAL '6 months' THEN t.amount ELSE 0 END) as total_6m,
          COUNT(DISTINCT CASE WHEN t.date >= date_trunc('month', CURRENT_DATE) - INTERVAL '6 months' THEN date_trunc('month', t.date) END) as active_months_6m,
          COUNT(CASE WHEN t.date >= date_trunc('month', CURRENT_DATE) - INTERVAL '6 months' THEN 1 END) as frequency_6m
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.type = 'expense' AND t.to_account_id IS NULL AND t.installment_id IS NULL
        AND t.date >= date_trunc('month', CURRENT_DATE) - INTERVAL '12 months'
        AND t.date < date_trunc('month', CURRENT_DATE)
        AND (t.recurrence_type IS NULL OR t.recurrence_type != 'extraordinary')
        GROUP BY 1, 2
      ),
      weights AS (
        SELECT 
          CASE 
            WHEN recurrence_type = 'yearly' THEN total_12m / 12
            WHEN recurrence_type IN ('monthly', 'variable') THEN 
              CASE WHEN active_months_6m > 0 THEN total_6m / active_months_6m ELSE 0 END
            WHEN recurrence_type = 'occasional' THEN total_6m / 6
            WHEN recurrence_type IS NULL AND frequency_6m >= 3 THEN 
              CASE WHEN active_months_6m > 0 THEN total_6m / active_months_6m ELSE total_6m / 6 END
            ELSE 0
          END as monthly_weight
        FROM category_stats
      )
      SELECT SUM(monthly_weight) as total FROM weights
    `);
    
    const refinedTotal = Number(res.rows[0].total || 0);
    if (refinedTotal > 0) {
      this.data.avgMonthlyExpense = refinedTotal;
    }
  }

  /**
   * 4. Proietta le entrate e le spese variabili per i mesi restanti
   */
  async projectFuture() {
    await this.refineAverages(); // Usiamo la media raffinata se disponibile

    const res = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' AND (recurrence_type IS NULL OR recurrence_type != 'extraordinary') THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' AND to_account_id IS NULL AND installment_id IS NULL AND description NOT ILIKE '%rata%' AND description NOT ILIKE '%finanziamento%' AND (recurrence_type IS NULL OR recurrence_type != 'extraordinary') THEN amount ELSE 0 END), 0) as core_expense
      FROM transactions
      WHERE date >= date_trunc('month', CURRENT_DATE)
    `);

    const row = res.rows[0];
    const remainingIncomeThisMonth = Math.max(0, this.data.avgMonthlyIncome - Number(row.income));
    const remainingExpenseThisMonth = Math.max(0, this.data.avgMonthlyExpense - Number(row.core_expense));

    this.data.futureIncome = remainingIncomeThisMonth + (this.data.avgMonthlyIncome * this.monthsRemaining);
    this.data.futureCoreExpense = (remainingExpenseThisMonth + (this.data.avgMonthlyExpense * this.monthsRemaining)) * 1.05;
  }

  /**
   * 5. Calcola gli obblighi futuri (Rate e Scadenze)
   */
  async calculateObligations() {
    const insRes = await pool.query(`
      SELECT i.*, 
             (SELECT COALESCE(SUM(amount), 0) FROM transactions t WHERE t.installment_id = i.id) as paid_amount_total,
             EXISTS(SELECT 1 FROM transactions t WHERE t.installment_id = i.id AND t.date >= date_trunc('month', CURRENT_DATE)) as is_paid_this_month
      FROM installments i
    `);

    let loanObligations = 0;
    insRes.rows.forEach(ins => {
      const remainingDebt = Number(ins.total_amount) - Number(ins.paid_amount_total);
      if (remainingDebt <= 0) return;

      const monthlyAmount = Number(ins.monthly_amount);
      const remainingMonthsInDebt = Math.ceil(remainingDebt / monthlyAmount);
      const monthsPossibleInYear = this.monthsRemaining + (ins.is_paid_this_month ? 0 : 1);
      
      const installmentsThisYear = Math.min(remainingMonthsInDebt, monthsPossibleInYear);
      loanObligations += Math.min(remainingDebt, monthlyAmount * installmentsThisYear);
    });

    this.data.futureLoanObligations = loanObligations;

    const deadRes = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total FROM deadlines
      WHERE status = 'pending' AND EXTRACT(YEAR FROM due_date) = $1
    `, [this.currentYear]);
    this.data.futureDeadlines = Number(deadRes.rows[0].total);
  }

  /**
   * 6. Formatta l'output finale per il frontend
   */
  formatOutput() {
    const d = this.data;
    
    d.fullYearIncomeTotal = d.realIncomeYear + d.futureIncome;
    d.fullYearExpenseTotal = d.realCoreExpenseYear + d.futureCoreExpense + d.realLoanExpenseYear + d.futureLoanObligations + d.realExtraExpenseYear + d.futureDeadlines;
    
    d.freeBudget = (d.fullYearIncomeTotal * 0.7) - (d.realCoreExpenseYear + d.futureCoreExpense + d.futureDeadlines) - d.futureLoanObligations;
    d.savingsRate = d.fullYearIncomeTotal > 0 ? Math.round(((d.fullYearIncomeTotal - d.fullYearExpenseTotal) / d.fullYearIncomeTotal) * 100) : 0;

    return {
      currentBalance: Math.round(d.currentBalance),
      avgMonthlyIncome: Math.round(d.avgMonthlyIncome),
      avgMonthlyExpense: Math.round(d.avgMonthlyExpense),
      projectedIncome: Math.round(d.futureIncome),
      projectedExpense: Math.round(d.futureCoreExpense),
      realIncomeYear: Math.round(d.realIncomeYear),
      realExpenseYear: Math.round(d.realCoreExpenseYear + d.realLoanExpenseYear + d.realExtraExpenseYear),
      fullYearIncomeTotal: Math.round(d.fullYearIncomeTotal),
      fullYearExpenseTotal: Math.round(d.fullYearExpenseTotal),
      pendingDeadlines: Math.round(d.futureDeadlines),
      remainingInstallmentsTotal: Math.round(d.futureLoanObligations),
      endOfYearBalance: Math.round(d.currentBalance + d.futureIncome - d.futureCoreExpense - d.futureLoanObligations - d.futureDeadlines),
      freeBudget: Math.round(d.freeBudget),
      savingsRate: d.savingsRate,
      monthsRemaining: this.monthsRemaining + 1,
      monthsRunway: d.avgMonthlyExpense > 0 ? (d.currentBalance / d.avgMonthlyExpense).toFixed(1) : "999"
    };
  }
}

// Nuova istanza per ogni chiamata: garantisce date e dati sempre freschi
module.exports = {
  getPredictions: () => new PredictEngine().getPredictions()
};

