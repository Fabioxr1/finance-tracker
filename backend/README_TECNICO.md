# 📦 Backend — Documentazione Tecnica Dettagliata

> **Runtime:** Node.js 20 Alpine  
> **Framework:** Express.js  
> **Database:** PostgreSQL 15  
> **Porta:** 5000

---

## 📂 Struttura File

```
backend/
├── index.js              # Entry point: server Express, routing, initDB()
├── db.js                 # Pool di connessione PostgreSQL
├── init.sql              # Schema iniziale DB (solo primo avvio)
├── Dockerfile            # Container Node.js
├── package.json          # Dipendenze
├── transactions.log      # Log automatico operazioni transazioni
│
├── routes/               # Ogni file = un modulo REST
│   ├── accounts.js       # CRUD Conti
│   ├── categories.js     # CRUD Categorie
│   ├── dashboard.js      # Statistiche dashboard
│   ├── transactions.js   # CRUD + Bulk transazioni
│   ├── installments.js   # CRUD + Pagamento rate
│   ├── investments.js    # CRUD + Acquisti/Vendite titoli
│   ├── investment-plans.js # CRUD + Esecuzione PAC
│   ├── deadlines.js      # CRUD Scadenze
│   ├── subscriptions.js  # CRUD Abbonamenti
│   ├── tags.js           # CRUD Tag
│   ├── tag-stats.js      # Statistiche per tag
│   └── predictions.js    # Proiezioni finanziarie
│
├── utils/                # Logica di business estratta
│   ├── predictEngine.js  # Motore previsioni (classe PredictEngine)
│   ├── balanceCalculator.js # Calcolo saldo conto
│   ├── transactionService.js # Creazione centralizzata transazioni
│   ├── txFormatter.js    # Preparazione parametri per UPDATE
│   ├── logger.js         # Log su file delle operazioni
│   ├── investments.js    # Fetch prezzi Yahoo Finance
│   └── investmentCalculations.js # Logica calcolo performance investimenti
│
└── __tests__/            # Test unitari
    ├── balance.test.js
    ├── validation.test.js
    ├── investments.test.js # Test calcoli finanziari investimenti
    ├── test_engine.js
    ├── test_mutuo.js
    └── test_fine_anno.js
```

---

## 📄 File per File — Dettaglio Completo

---

### `index.js` — Entry Point del Server

**Responsabilità:** Avvio Express, registrazione middleware, mounting routes, auto-migrazione DB.

#### Middleware
- `cors()` — Accetta richieste cross-origin (dal frontend su porta diversa)
- `express.json()` — Parsing body JSON

#### Routes registrate
```javascript
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
```

#### Endpoint diretti (non in file route)
- **`GET /api/health`** — Health check: esegue `SELECT NOW()` per verificare connessione DB
- **`POST /api/query`** — Console SQL: esegue query SQL libere. Distingue SELECT (ritorna rows) da comandi (ritorna rowCount)

#### `initDB()` — Auto-migrazione
Eseguita ad ogni avvio del server. Garantisce compatibilità schema senza perdita dati:
1. `ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_system` — Flag conti di sistema
2. `ALTER TABLE installments ADD COLUMN IF NOT EXISTS tags INT[]` — Tag default finanziamenti
3. `CREATE TABLE IF NOT EXISTS tags` — Tabella tag
4. `ALTER TABLE tags ADD COLUMN IF NOT EXISTS description` — Colonna descrizione tag
5. `CREATE TABLE IF NOT EXISTS transaction_tags` — Ponte N:N transazioni-tag
6. Crea conto "Investimenti" di sistema se non esiste

> ⚠️ **Quando aggiungi una colonna o tabella:** inseriscila qui E in `init.sql`

---

### `db.js` — Connessione Database

```javascript
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

Crea un **Pool** di connessioni PostgreSQL. La stringa di connessione viene da `DATABASE_URL` (definita in docker-compose).

**Formato:** `postgresql://postgres:PASSWORD@db:5432/spese`

> Il nome host `db` è il nome del servizio Docker, risolto internamente dalla rete Docker.

---

### `init.sql` — Schema Iniziale

Eseguito **solo al primo avvio** (quando `pgdata/` è vuota). Contiene:
- Creazione di tutte le tabelle
- Dati seed: categorie predefinite (Stipendio, Spesa, Bollette, ecc.)
- Conto di sistema "Investimenti"

> ⚠️ Se modifichi `init.sql` in un ambiente già avviato, devi usare `initDB()` per le migrazioni.

---

## 📁 Routes — Dettaglio per File

---

### `routes/accounts.js` — Gestione Conti

#### `GET /` — Lista conti con saldo calcolato
- Calcola il saldo reale di ogni conto sommando tutte le transazioni (lifetime)
- Formula: `initial_balance + income + transfer_in - expense - transfer_out`
- I trasferimenti: `-amount` dal conto origine, `+amount` sul conto destinazione
- Restituisce: array di conti con campo aggiuntivo `current_balance`

#### `POST /` — Crea nuovo conto
- Parametri: `name`, `type`, `initial_balance`

#### `PUT /:id` — Modifica conto
- **Protezione system:** Se `is_system = true` → ritorna 403
- **Protezione saldo:** Per modificare `initial_balance` serve `admin_password = 'fabio'`
- Senza password admin: aggiorna solo `name` e `type`

#### `DELETE /:id` — Elimina conto
- **Protezione system:** Se `is_system = true` → ritorna 403
- **Protezione FK:** Se il conto ha transazioni collegate → errore DB (CASCADE non attivo)

---

### `routes/categories.js` — Gestione Categorie

CRUD semplice. Nessuna logica speciale.
- `GET /` — Lista ordinata per tipo e nome
- `POST /` — Crea (name, type)
- `DELETE /:id` — Elimina

---

### `routes/dashboard.js` — Statistiche Dashboard

#### `GET /?year=YYYY` — Dati aggregati per la dashboard

Esegue **7 query parallele** e restituisce un oggetto unico:

1. **`totalBalance`** — Liquidità reale totale
   - `SUM(initial_balance) + SUM(income) - SUM(expense senza transfer) - SUM(buy) + SUM(sell)`
   - ⚠️ I **trasferimenti** sono esclusi dalle spese (sono movimenti interni)

2. **`totalInvestments`** — Valore investito netto (`buy - sell`)

3. **`totalDebt`** — Debito residuo (`total_amount finanziamenti - pagato`)

4. **`totalIncome` / `totalExpense`** — Entrate e uscite dell'anno selezionato

5. **`chartData`** — Array 12 mesi con entrate/uscite per il grafico a barre

6. **`expenseByCategory` / `incomeByCategory`** — Totali per categoria (include categorie a zero)

7. **`accountsBreakdown`** — Per ogni conto: entrate, uscite, trasferimenti in/out dell'anno + saldo lifetime

8. **`availableYears`** — Anni in cui esistono transazioni

9. **`netWorth`** — `totalBalance + totalInvestments - totalDebt`

---

### `routes/transactions.js` — Gestione Transazioni

Il file più complesso. Gestisce operazioni singole, di massa e importazione.

#### `GET /` — Lista con filtri e paginazione
**Filtri disponibili:** `year`, `month`, `type`, `account_id`, `category_id`, `description` (ILIKE), `installment_id`, `tag_id`, **`id` (ricerca esatta)**, **`amount` (ricerca testuale parziale)**

**Paginazione:** `page` (default 1), `limit` (default 50). Per l'esportazione CSV completa, il frontend richiede un `limit` molto alto (es. 100000).

**Risposta:**
```json
{
  "data": [...],
  "totalBalance": 1234.56,
  "absoluteTotal": 5678.90,
  "pagination": { "total": 150, "page": 1, "limit": 50, "totalPages": 3 }
}
```
- Include JOIN con categories, accounts, installments
- Include sub-query per i tag di ogni transazione (JSON aggregato)
- Utilizzato sia per la visualizzazione in tabella che per l'esportazione dati.

#### `POST /` — Crea transazione singola
1. **Associazione automatica finanziamento:** Se `installment_id` non è impostato, cerca tra i finanziamenti con `search_keyword` e confronta con la `description` (case-insensitive)
2. Chiama `transactionService.createTransaction()` per la creazione
3. Se associata a un finanziamento: incrementa `paid_installments`
4. Se il finanziamento ha tag di default E la transazione non ha tag → applica tag del finanziamento

#### `DELETE /:id` — Elimina transazione (in transazione DB)
1. Recupera la transazione prima di eliminarla
2. Se era collegata a un finanziamento → decrementa `paid_installments` (con `GREATEST(0, ...)`)
3. Logga l'eliminazione

#### `PUT /:id` — Modifica transazione (in transazione DB)
1. Recupera il vecchio `installment_id`
2. Aggiorna tutti i campi
3. Se `installment_id` è cambiato: decrementa il vecchio, incrementa il nuovo
4. Riscrive i tag: DELETE tutti + INSERT nuovi
5. Logga la modifica

#### `POST /bulk` — Import massivo (Smart Update/Create)
- Riceve array `transactions`.
- **Logica ID**: Se una riga contiene un ID esistente, esegue `updateTransaction` (permette modifica via CSV).
- Se l'ID manca, esegue `createTransaction` (inserimento standard).
- Gestisce automaticamente l'associazione finanziamenti e i contatori delle rate anche durante gli aggiornamenti.
- Tutto in un'unica transazione DB (ROLLBACK se errore).

#### `POST /bulk-delete` — Eliminazione massiva
- Riceve array `ids`
- Per ogni ID: controlla se ha finanziamento → decrementa
- DELETE con `WHERE id = ANY($1)`

#### `POST /bulk-update` — Modifica massiva
- Riceve `ids`, `updates` (oggetto campo:valore), `tag_id` (aggiunta), `remove_tag_id` (rimozione)
- Costruisce query UPDATE dinamica
- Aggiunge/rimuove tag in massa

---

### `routes/installments.js` — Rate e Finanziamenti

#### `GET /` — Lista con ricalcolo dinamico
Per ogni finanziamento calcola:
- `remainingAmount` = `total_amount - paid_amount_total` (somma reale transazioni)
- `remainingInstallments` = `ceil(remainingAmount / monthly_amount)` 
- `dynamicTotalInstallments` = `paid_installments + remainingInstallments`
- `estimatedEndDate` = data stimata di fine debito
- `needsPayment` = true se non c'è stata nessuna transazione nel mese corrente
- `monthsPaid` = mesi dell'anno corrente in cui è stata pagata una rata
- Include query per i tag associati (`tags_full`)

> **Fonte di verità per il debito:** è `paid_amount_total` (somma delle transazioni reali), NON `paid_installments × monthly_amount`

#### `POST /` — Crea finanziamento
Parametri: `name`, `total_amount`, `monthly_amount`, `total_installments`, `paid_installments`, `start_date`, `end_date`, `description`, `account_id`, `search_keyword`, `tags`

#### `PUT /:id` — Modifica finanziamento
Aggiorna tutti i campi inclusi `tags` e `search_keyword`

#### `POST /:id/pay` — Paga una rata
1. Recupera i dati del finanziamento
2. Crea transazione di tipo `expense` tramite `transactionService`
3. Incrementa `paid_installments` (+1 per versamento, non per copertura importo)
4. I tag del finanziamento vengono passati alla transazione

> ⚠️ `paid_installments` conta i VERSAMENTI, non le rate coperte. La fonte di verità è sempre `paid_amount_total`.

#### `DELETE /:id` — Elimina finanziamento

---

### `routes/investments.js` — Portafoglio Investimenti

#### `GET /` — Portfolio con performance calcolate
Per ogni titolo:
1. Recupera tutte le `investment_transactions`
2. Calcola `totalShares` e `totalInvested` (con ricalcolo proporzionale per vendite)
3. `avgPrice` = prezzo medio di carico
4. **Prezzo attuale:**
   - Se `use_manual_price = true` → usa `manual_price`
   - Altrimenti → chiama Yahoo Finance tramite `getLivePrice(ticker)`
   - Se Yahoo fallisce → usa `avgPrice` come fallback
5. Utilizza `utils/investmentCalculations.js` per il calcolo centralizzato di quote, PMC, valore attuale e gain.
6. Per BTP/Obbligazioni: fattore di conversione × 100
7. Calcola: `currentValue`, `gain`, `gainPercent`

#### `POST /` — Crea titolo
#### `PUT /:id` — Modifica titolo
- Aggiorna anche l'`account_id` delle transazioni bancarie collegate
#### `DELETE /:id` — Elimina titolo
- Elimina in cascata: transazioni bancarie collegate → investment_transactions → investment

#### `POST /transactions` — Acquisto/Vendita
Flusso completo:
1. Determina il conto target (quello dell'investimento o quello passato nel body)
2. Cerca/crea la categoria "Investimenti"
3. Recupera il conto sistema "Investimenti" (`is_system = true`)
4. Crea una transazione `transfer`:
   - **Buy:** `account_id = conto bancario` → `to_account_id = conto sistema`
   - **Sell:** `account_id = conto sistema` → `to_account_id = conto bancario`
5. Crea `investment_transaction` con `linked_transaction_id`

#### `PUT /transactions/:id` — Modifica movimento
- Aggiorna sia `investment_transactions` che la transazione bancaria collegata

#### `DELETE /transactions/:id` — Elimina movimento
- Elimina sia il movimento che la transazione bancaria collegata

#### `PATCH /:id/price` — Aggiornamento rapido prezzo

---

### `routes/investment-plans.js` — Piani di Accumulo (PAC)

#### `GET /` — Lista con stato mensile
- Per ogni piano: controlla se nel mese corrente è stata fatta almeno una `investment_transaction` con importo >= 90% del piano
- `needsExecution = true` se non ancora eseguito

#### `POST /:id/execute` — Esecuzione versamento PAC
1. Recupera piano e nome investimento
2. Cerca/crea categoria "PAC"
3. Crea transazione `transfer` (conto utente → conto sistema "Investimenti")
4. Crea `investment_transaction` con tipo `buy`

---

### `routes/deadlines.js` — Scadenze

#### `PUT /:id` — Modifica/Paga con ricorrenza automatica
- Se `status` cambia a `'paid'` E `is_recurring = true`:
  - Crea automaticamente una nuova scadenza per l'anno successivo (+1 anno)
  - Controlla duplicati prima di creare

---

### `routes/subscriptions.js` — Abbonamenti
CRUD standard. Gestisce `active_months` (array di mesi) e `day_of_month`.

---

### `routes/tags.js` — Gestione Tag
- `POST /` — Pulisce il nome (rimuove #, trim, lowercase). Gestisce errore duplicato (code 23505).
- `PUT /:id` — Stessa sanificazione nome

---

### `routes/tag-stats.js` — Statistiche Tag
- `GET /?year=YYYY&month=M` — Per ogni tag: totale speso, numero transazioni, percentuale sul totale periodo
- `month=0` significa "tutto l'anno"

#### `GET /runway` — Simulatore Autonomia Finanziaria
Calcola i dati per il simulatore "quanti mesi puoi vivere senza lavorare":
1. **Saldo attuale** — Somma saldi di tutti i conti (stessa logica di PredictEngine)
2. **Spesa media mensile per tag** — Ultimi 6 mesi (escluso mese corrente), divisa per mesi con attività reale
3. **Spesa media mensile totale** — Baseline senza filtri tag

**Risposta:**
```json
{
  "currentBalance": 40937.44,
  "avgMonthlyTotal": 1512.61,
  "baselineRunway": 27.1,
  "tags": [
    { "id": 14, "name": "variabile", "color": "#c061cb", "description": "...", "avgMonthly": 930.64, "total6m": 3722.55 }
  ]
}
```
Il frontend usa questi dati per permettere all'utente di escludere tag e ricalcolare l'autonomia in tempo reale.

---

### `routes/predictions.js` — Proiezioni
Wrapper sottile che chiama `predictEngine.getPredictions()`.

---

## 📁 Utils — Dettaglio per File

---

### `utils/predictEngine.js` — Motore Previsioni

Classe `PredictEngine` che crea una **nuova istanza per ogni chiamata** (date sempre fresche).

#### Pipeline (6 step):

**Step 1: `fetchLiquidity()`**
- Query: somma di tutti i saldi di tutti i conti (initial_balance + income + transfer_in - expense - transfer_out)

**Step 2: `fetchRealYearData()`**
- Separa i dati dell'anno corrente in 4 categorie:
  - `realIncomeYear` — Entrate (escluse straordinarie)
  - `realCoreExpenseYear` — Spese normali (escluse rate e straordinarie)
  - `realLoanExpenseYear` — Pagamenti rate/finanziamenti
  - `realExtraExpenseYear` — Spese straordinarie
- **Identificazione rate:** `installment_id IS NOT NULL` OPPURE descrizione contiene "rata" o "finanziamento"

**Step 3: `calculateAverages()`**
- Finestra: ultimi 6 mesi (escluso mese corrente)
- Divide per mesi con attività effettiva (non per 6 fisso)
- Produce `avgMonthlyIncome` e `avgMonthlyExpense`

**Step 3bis: `refineAverages()`**
- Raffinamento per tipo di ricorrenza:
  - `yearly` → totale 12 mesi / 12
  - `monthly`/`variable` → totale 6 mesi / mesi attivi
  - `occasional` → totale 6 mesi / 6
  - Senza tipo ma frequenza >= 3 → come monthly

**Step 4: `projectFuture()`**
- Per il mese corrente: proietta la differenza tra media e già speso
- Per i mesi restanti: media × mesi
- **Margine sicurezza:** +5% sulle spese proiettate

**Step 5: `calculateObligations()`**
- Per ogni finanziamento con debito residuo > 0:
  - Calcola rate rimanenti nell'anno
  - Limita al debito residuo effettivo
- Somma scadenze pendenti dell'anno

**Step 6: `formatOutput()`**
- `freeBudget` = (entrate_anno × 70%) - spese_core - scadenze - rate future
- `savingsRate` = ((entrate - uscite) / entrate) × 100
- `endOfYearBalance` = saldo attuale + entrate future - spese future - rate - scadenze
- `monthsRunway` = saldo attuale / spesa media mensile

---

### `utils/balanceCalculator.js`

Funzione pura `calculateBalance(initialBalance, transactions, accountId)`:
- Itera sulle transazioni
- income + amount, expense - amount, transfer ±amount
- Usata nei test unitari

---

### `utils/transactionService.js`

Servizio centralizzato per la creazione transazioni. **Tutte le route che creano transazioni usano questo.**

1. **Estrae tag**: Gestisce sia `tags` (array di ID) che `tagNames` (array di stringhe).
2. **Auto-creazione Tag**: Se viene passato `tagNames`, il servizio cerca il tag per nome (case-insensitive) o lo crea se non esiste, associandolo poi alla transazione.
3. **Valida campi obbligatori**: `amount`, `type`, `date`, `category_id` (eccetto transfer).
4. **Update Centralizzato**: Include `updateTransaction(id, data)` per gestire modifiche singole e bulk con sincronizzazione tag.
5. **Verifica account**: Almeno uno tra `account_id` o `to_account_id`.
6. **Logga**: Su console e su file per ogni operazione (CREATE/UPDATE).

> ⚠️ **Non duplicare mai la logica di creazione transazione nelle route.** Usare sempre questo service.

---

### `utils/txFormatter.js`

`prepareTransactionParams(tx)` — Restituisce array ordinato di parametri per l'UPDATE:
```
[account_id, to_account_id, category_id, amount, type, date, description, installment_id, recurrence_type]
```
Converte `undefined` in `null` per i campi opzionali.

---

### `utils/logger.js`

`logTransaction(tx, actionType)` — Scrive una riga nel file `transactions.log`:
```
TIMESTAMP | ID=123 | CREATE [EXPENSE] | 150€ | Spesa supermercato | ACC=1 | CAT=5
```
Per i transfer: `FROM=1 TO=2`

Usa `fs.appendFileSync` (sincrono, non blocca per righe singole).

---

### `utils/investments.js`

`getLivePrice(ticker)` — Chiama Yahoo Finance API (`yahoo-finance2` package):
- Cerca: `regularMarketPrice` → `postMarketPrice` → `bid` → `ask`
- Ritorna `null` se ticker vuoto o errore API
- Gli errori vengono loggati ma non bloccano l'applicazione

---

### `utils/investmentCalculations.js`

`calculateInvestmentPerformance(investment, transactions, livePrice)` — Funzione pura che esegue i calcoli finanziari per un titolo:
1. **Quote totali**: Somma algebrica `buy` e `sell`.
2. **Investito residuo**: Calcolato scaricando il costo storico (PMC) proporzionalmente in caso di vendita.
3. **PMC (Prezzo Medio di Carico)**: `totalInvested / totalShares`.
4. **Valore attuale**: `livePrice * totalShares` (gestendo il fattore 100 per i bond).
5. **Gain / ROI**: Differenza tra valore attuale e investito residuo.

> 🧪 Questa utility è coperta da test unitari completi in `backend/__tests__/investments.test.js`.

---

## ⚠️ Punti Critici — Dove Fare Attenzione

| Area | Rischio | File |
|------|---------|------|
| Calcolo saldo | I transfer devono togliere dal conto origine e aggiungere al destinazione | `accounts.js`, `balanceCalculator.js` |
| Dashboard totalBalance | I transfer NON devono essere contati come spese | `dashboard.js` riga 18 |
| Associazione rate | La keyword è case-insensitive e cerca in `description` | `transactions.js` |
| Debito residuo | Fonte di verità = `SUM(amount) delle transazioni`, NON `paid_installments × monthly_amount` | `installments.js`, `predictEngine.js` |
| Investimenti buy/sell | Crea un giroconto + un investment_transaction. Eliminando uno devi eliminare l'altro | `investments.js` |
| PredictEngine | Crea nuova istanza per chiamata. Margine 5% su spese. Esclude straordinarie dalle medie | `predictEngine.js` |
| Tag su rate | Se transazione è associata a finanziamento senza tag propri, eredita i tag del finanziamento | `transactions.js` POST / |
