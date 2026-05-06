# 📘 Finance Tracker — Documentazione Tecnica Completa

> **Ultimo aggiornamento:** Maggio 2026  
> **Stack:** React 18 + Vite (Frontend) | Node.js + Express (Backend) | PostgreSQL 15 (Database)  
> **Infrastruttura:** Docker Compose (3 container)

---

## 📑 Indice

1. [Panoramica Progetto](#-panoramica-progetto)
2. [Architettura Generale](#-architettura-generale)
3. [Infrastruttura Docker](#-infrastruttura-docker)
4. [Variabili d'Ambiente](#-variabili-dambiente)
5. [Schema Database](#-schema-database)
6. [Auto-Migrazione (initDB)](#-auto-migrazione-initdb)
7. [API Endpoints — Riepilogo](#-api-endpoints--riepilogo)
8. [Navigazione Frontend — Riepilogo](#-navigazione-frontend--riepilogo)
9. [Flussi di Dati Critici](#-flussi-di-dati-critici)
10. [Test Unitari](#-test-unitari)
11. [Regole per le Modifiche](#-regole-per-le-modifiche)

---

## 🔭 Panoramica Progetto

Finance Tracker è un'applicazione **self-hosted** per la gestione completa delle finanze personali. Funzionalità principali:

| Modulo | Descrizione |
|--------|-------------|
| **Dashboard** | Riepilogo finanziario annuale con grafici, categorie, previsioni |
| **Conti & Carte** | Gestione conti bancari con saldo calcolato in tempo reale |
| **Transazioni** | CRUD completo, importazione CSV con **Update via ID**, filtri (ID, Prezzo), operazioni di massa, **Duplicazione** |
| **Scadenze** | Pagamenti ricorrenti annuali (bollo, assicurazione, ecc.) |
| **Abbonamenti** | Spese mensili ricorrenti (Netflix, Spotify, ecc.) |
| **Tag** | Etichettatura trasversale delle transazioni + analisi statistica |
| **Investimenti** | Portfolio con prezzi real-time (Yahoo Finance), PAC, acquisti/vendite, **Modular Hook** |
| **Rate & Finanziamenti** | Tracciamento debiti con ricalcolo dinamico e associazione automatica |
| **Simulatore** | Proiezione di risparmio a fine anno con slider obiettivo |
| **Console SQL** | Esecuzione diretta di query SQL sul database |
| **Test Suite** | Copertura calcoli finanziari e parsing dati (Vitest) |

---

## 🏗 Architettura Generale

```
┌─────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE                       │
│                                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────┐ │
│  │   Frontend   │   │   Backend    │   │  PostgreSQL  │ │
│  │  React+Vite  │──▶│  Express.js  │──▶│     15      │ │
│  │  :3000       │   │  :5000       │   │  :5432      │ │
│  └──────────────┘   └──────────────┘   └─────────────┘ │
│                                                         │
│  Volumi:                                                │
│  ./frontend → /app     ./backend → /app                 │
│                        ./pgdata → /var/lib/postgresql    │
└─────────────────────────────────────────────────────────┘
```

**Flusso:** Frontend (porta 3000) → chiama API REST su Backend (porta 5000) → query su PostgreSQL (porta 5432)

---

## 🐳 Infrastruttura Docker

### `docker-compose.yml`

| Servizio | Immagine | Porta | Note |
|----------|----------|-------|------|
| `frontend` | `node:20-alpine` | 3000 | Vite dev server con HMR (hot-module-replace) |
| `backend` | `node:20-alpine` | 5000 | Express con nodemon (auto-restart) |
| `db` | `postgres:15-alpine` | 5432 | Dati persistenti in `./pgdata` |

### Comandi principali

```bash
# Avvio completo
docker compose up -d --build

# Ricostruire solo il backend dopo modifiche strutturali
docker compose up -d --build backend

# Vedere i log del backend
docker logs -f reactspese_local-backend-1

# Accesso al database
docker exec -it reactspese_local-db-1 psql -U postgres -d spese
```

### Volumi montati
- `./frontend:/app` — Codice frontend (hot-reload)
- `./backend:/app` — Codice backend (nodemon)
- `./pgdata:/var/lib/postgresql/data` — Persistenza database
- `./backend/init.sql:/docker-entrypoint-initdb.d/init.sql` — Schema iniziale (solo primo avvio)

> ⚠️ **ATTENZIONE:** `init.sql` viene eseguito SOLO quando la cartella `pgdata` è vuota (primo avvio). Per modifiche successive usare le migrazioni in `initDB()`.

---

## 🔐 Variabili d'Ambiente

File: `.env` (root del progetto)

| Variabile | Valore Default | Uso |
|-----------|---------------|-----|
| `SERVER_IP` | `localhost` | IP usato dal frontend per chiamare le API |
| `DB_PASSWORD` | `postgres` | Password PostgreSQL |

Il frontend riceve l'URL API tramite `VITE_API_URL=http://${SERVER_IP}:5000/api` (definito in docker-compose).

---

## 🗄 Schema Database

### Tabelle e Relazioni

```
accounts ──────────────────────┐
  │                             │
  ├──▶ transactions (account_id, to_account_id)
  │         │
  │         ├──▶ transaction_tags ◀── tags
  │         │
  │         └──▶ installments (tramite installment_id)
  │
  ├──▶ investments
  │         │
  │         ├──▶ investment_transactions (linked_transaction_id → transactions)
  │         │
  │         └──▶ investment_plans
  │
  ├──▶ subscriptions
  │
  └──▶ deadlines ◀── categories
```

### Dettaglio Tabelle

#### `accounts` — Conti bancari/carte
| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `id` | SERIAL PK | |
| `name` | VARCHAR(255) | Nome del conto |
| `type` | VARCHAR(50) | `'current'`, `'digital'`, `'savings'`, `'trade'`, `'debt'`, `'Portfolio'` |
| `initial_balance` | DECIMAL(10,2) | Saldo iniziale impostato manualmente |
| `is_system` | BOOLEAN | `true` = conto di sistema (non modificabile/eliminabile). Es: "Investimenti" |

#### `categories` — Categorie entrate/uscite
| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `id` | SERIAL PK | |
| `name` | VARCHAR(255) | Nome categoria |
| `type` | VARCHAR(50) | `'income'` o `'expense'` |

#### `transactions` — Tutte le operazioni finanziarie
| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `id` | SERIAL PK | |
| `account_id` | FK → accounts | Conto di origine |
| `to_account_id` | FK → accounts | Conto di destinazione (solo per `transfer`) |
| `category_id` | FK → categories | Categoria (NULL nei trasferimenti) |
| `installment_id` | FK → installments | Se collegata a un finanziamento |
| `amount` | DECIMAL(10,2) | Importo (sempre positivo) |
| `type` | VARCHAR(10) | `'income'`, `'expense'`, `'transfer'` |
| `recurrence_type` | VARCHAR(20) | `'monthly'`, `'extraordinary'`, `'occasional'`, `'yearly'`, `'variable'` |
| `date` | DATE | Data dell'operazione |
| `description` | TEXT | Descrizione libera |

> **REGOLA CRITICA:** Il `type` determina come il saldo viene calcolato: `income` = +amount, `expense` = -amount, `transfer` = -amount dal conto origine, +amount sul conto destinazione.

#### `installments` — Rate e finanziamenti
| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `id` | SERIAL PK | |
| `name` | VARCHAR(255) | Nome (es: "Mutuo Casa") |
| `total_amount` | DECIMAL(10,2) | Capitale totale del debito |
| `monthly_amount` | DECIMAL(10,2) | Importo rata mensile standard |
| `paid_installments` | INT | Contatore versamenti effettuati |
| `account_id` | FK → accounts | Conto di addebito |
| `search_keyword` | VARCHAR(255) | **Parola chiave per associazione automatica** (vedi flusso sotto) |
| `tags` | INT[] | Array di tag_id da applicare automaticamente |

#### `investments` — Titoli in portafoglio
| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `ticker` | VARCHAR(50) | Ticker per Yahoo Finance (es: `SWDA.MI`) |
| `manual_price` | DECIMAL(10,4) | Prezzo manuale (quando API non disponibile) |
| `use_manual_price` | BOOLEAN | Se `true`, ignora Yahoo Finance |

#### `investment_transactions` — Movimenti di acquisto/vendita
| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `shares` | DECIMAL(15,4) | Numero quote |
| `price_per_share` | DECIMAL(15,4) | Prezzo per quota |
| `type` | VARCHAR(50) | `'buy'` o `'sell'` |
| `linked_transaction_id` | FK → transactions | Transazione bancaria collegata (giroconto) |

#### `investment_plans` — Piani di Accumulo (PAC)
| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `investment_id` | FK → investments | Titolo collegato |
| `amount` | DECIMAL(15,2) | Importo mensile del PAC |

#### `deadlines` — Scadenze
| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `status` | VARCHAR(50) | `'pending'` o `'paid'` |
| `is_recurring` | BOOLEAN | Se `true`, pagando crea automaticamente la scadenza per l'anno dopo |

#### `subscriptions` — Abbonamenti
| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `day_of_month` | INT | Giorno del mese di addebito |
| `active_months` | INT[] | Array mesi attivi (es: `{1,2,3,4,5,6,7,8,9,10,11,12}`) |
| `active` | BOOLEAN | Se l'abbonamento è attivo |

#### `tags` + `transaction_tags` — Sistema di etichettatura
- `tags`: definizione tag (nome, colore, descrizione)
- `transaction_tags`: tabella ponte N:N tra transazioni e tag

---

## 🔄 Auto-Migrazione (initDB)

File: `backend/index.js` → funzione `initDB()`

Questa funzione viene eseguita **ad ogni avvio** del server e garantisce che lo schema DB sia aggiornato senza cancellare dati esistenti. Usa `ADD COLUMN IF NOT EXISTS` e `CREATE TABLE IF NOT EXISTS`.

**Cosa fa attualmente:**
1. Aggiunge colonna `is_system` su `accounts` (se mancante)
2. Aggiunge colonna `tags` (INT[]) su `installments` (se mancante)
3. Crea tabella `tags` (se mancante)
4. Crea tabella `transaction_tags` (se mancante)
5. Crea il conto di sistema "Investimenti" (se mancante)

> **REGOLA:** Ogni futura modifica allo schema deve essere aggiunta qui E in `init.sql`.

---

## 🌐 API Endpoints — Riepilogo

| Metodo | Endpoint | File Route | Descrizione |
|--------|----------|-----------|-------------|
| GET | `/api/health` | `index.js` | Health check DB |
| — | Design System | `index.css` | Modulare: `vars.css`, `layout.css`, `components.css` |
| POST | `/api/query` | `index.js` | Console SQL (esegue query libere) |
| GET | `/api/dashboard-stats?year=` | `dashboard.js` | Stats complete per dashboard |
| GET | `/api/accounts` | `accounts.js` | Lista conti con saldo calcolato |
| POST | `/api/accounts` | `accounts.js` | Crea conto |
| PUT | `/api/accounts/:id` | `accounts.js` | Modifica conto (protetto per system) |
| DELETE | `/api/accounts/:id` | `accounts.js` | Elimina conto (protetto per system) |
| GET | `/api/categories` | `categories.js` | Lista categorie |
| POST | `/api/categories` | `categories.js` | Crea categoria |
| DELETE | `/api/categories/:id` | `categories.js` | Elimina categoria |
| GET | `/api/transactions` | `transactions.js` | Lista filtrata + paginata |
| POST | `/api/transactions` | `transactions.js` | Crea transazione |
| PUT | `/api/transactions/:id` | `transactions.js` | Modifica transazione |
| DELETE | `/api/transactions/:id` | `transactions.js` | Elimina transazione |
| POST | `/api/transactions/bulk` | `transactions.js` | Import massivo (CSV - 6 o 9 colonne) |
| GET | `/api/transactions?export=true` | `transactions.js` | Esportazione filtrata (usata per il CSV) |
| POST | `/api/transactions/bulk-delete` | `transactions.js` | Eliminazione massiva |
| POST | `/api/transactions/bulk-update` | `transactions.js` | Modifica massiva |
| GET | `/api/installments` | `installments.js` | Lista finanziamenti con ricalcolo |
| POST | `/api/installments` | `installments.js` | Crea finanziamento |
| PUT | `/api/installments/:id` | `installments.js` | Modifica finanziamento |
| DELETE | `/api/installments/:id` | `installments.js` | Elimina finanziamento |
| POST | `/api/installments/:id/pay` | `installments.js` | Paga una rata |
| GET | `/api/investments` | `investments.js` | Portfolio con performance |
| POST | `/api/investments` | `investments.js` | Crea titolo |
| PUT | `/api/investments/:id` | `investments.js` | Modifica titolo |
| DELETE | `/api/investments/:id` | `investments.js` | Elimina titolo + transazioni |
| PATCH | `/api/investments/:id/price` | `investments.js` | Aggiorna prezzo manuale |
| POST | `/api/investments/transactions` | `investments.js` | Acquisto/Vendita titolo |
| GET | `/api/investments/:id/transactions` | `investments.js` | Storico movimenti titolo |
| PUT | `/api/investments/transactions/:id` | `investments.js` | Modifica movimento |
| DELETE | `/api/investments/transactions/:id` | `investments.js` | Elimina movimento |
| GET | `/api/investment-plans` | `investment-plans.js` | Lista PAC |
| POST | `/api/investment-plans` | `investment-plans.js` | Crea PAC |
| DELETE | `/api/investment-plans/:id` | `investment-plans.js` | Elimina PAC |
| POST | `/api/investment-plans/:id/execute` | `investment-plans.js` | Esegui versamento PAC |
| GET | `/api/deadlines` | `deadlines.js` | Lista scadenze |
| POST | `/api/deadlines` | `deadlines.js` | Crea scadenza |
| PUT | `/api/deadlines/:id` | `deadlines.js` | Modifica/Paga scadenza |
| DELETE | `/api/deadlines/:id` | `deadlines.js` | Elimina scadenza |
| GET | `/api/subscriptions` | `subscriptions.js` | Lista abbonamenti |
| POST | `/api/subscriptions` | `subscriptions.js` | Crea abbonamento |
| PUT | `/api/subscriptions/:id` | `subscriptions.js` | Modifica abbonamento |
| DELETE | `/api/subscriptions/:id` | `subscriptions.js` | Elimina abbonamento |
| GET | `/api/tags` | `tags.js` | Lista tag |
| POST | `/api/tags` | `tags.js` | Crea tag |
| PUT | `/api/tags/:id` | `tags.js` | Modifica tag |
| DELETE | `/api/tags/:id` | `tags.js` | Elimina tag |
| GET | `/api/tag-stats?year=&month=` | `tag-stats.js` | Statistiche per tag |
| GET | `/api/tag-stats/runway` | `tag-stats.js` | Dati per simulatore autonomia finanziaria |
| GET | `/api/predictions` | `predictions.js` | Proiezioni finanziarie |

---

## 🖥 Navigazione Frontend — Riepilogo

| Tab Sidebar | Componente | Sotto-componenti |
|-------------|-----------|-----------------|
| Dashboard | `DashboardView.jsx` | `StatsCards`, `AccountsGrid`, `CashFlowStats`, `HistoryChart`, `CategoryRanking`, `MonthlyTable`, `DeadlineSummary`, `PredictionCard` |
| Conti & Carte | `AccountsView.jsx` | — |
| Transazioni | `TransactionsView.jsx` | `useTransactions` (Hook), `TransactionFilters`, `TransactionForm`, `TransactionTable` (DesktopRow, MobileCard), `TransactionPagination`, `CSVControls` |
| Scadenze | `DeadlinesView.jsx` | `DeadlineForm`, `DeadlineItem`, `DeadlineList` |
| Abbonamenti | `SubscriptionsView.jsx` | — |
| Gestione Tag | `TagsView.jsx` | — |
| Analisi Tag | `TagStats.jsx` | `RunwaySimulator` |
| Investimenti | `InvestmentsView.jsx` | `InvestmentModals`, `InvestmentStats`, `PACSection`, `PortfolioChart`, `PortfolioTable` |
| Rate & Finanziamenti | `InstallmentsView.jsx` | `InstallmentCard`, `InstallmentForm`, `InstallmentPayModal`, `InstallmentStats` |
| Console SQL | `SqlConsoleView.jsx` | — |
| Configurazione | `ConfigView.jsx` | — |

---

## 🔀 Flussi di Dati Critici

### 1. Calcolo Saldo Conto
```
Saldo = initial_balance 
      + SUM(income dove account_id = conto)
      + SUM(transfer dove to_account_id = conto)
      - SUM(expense dove account_id = conto)
      - SUM(transfer dove account_id = conto)
```
> File: `backend/routes/accounts.js` (GET /), `backend/utils/balanceCalculator.js` e `backend/utils/investmentCalculations.js`

### 2. Associazione Automatica Transazione → Finanziamento
Quando si crea una transazione (singola o bulk):
1. Se `installment_id` non è impostato E la transazione ha una `description`
2. Si cercano tutti i finanziamenti con `search_keyword` non vuota
3. Se la descrizione contiene la keyword (case-insensitive) → la transazione viene associata
4. Il contatore `paid_installments` viene incrementato
5. I tag di default del finanziamento vengono applicati alla transazione

### 3. Aggiornamento Massivo via CSV (Round-trip)
Il sistema supporta l'aggiornamento di transazioni esistenti tramite CSV:
1. L'esportazione include la colonna **ID**.
2. Se il file importato contiene un ID valido in prima colonna, il backend esegue un `UPDATE` invece di un `INSERT`.
3. Vengono gestiti automaticamente i ricalcoli dei finanziamenti e la sincronizzazione dei Tag.

> File: `backend/routes/transactions.js` (POST /bulk) e `frontend/src/utils/csvParser.js`

### 4. Investimenti — Flusso Acquisto/Vendita
1. L'utente crea un acquisto/vendita di un titolo
2. Viene creata una **transazione di tipo `transfer`** (giroconto)
   - **Acquisto:** dal conto bancario → al conto sistema "Investimenti"
   - **Vendita:** dal conto sistema "Investimenti" → al conto bancario
3. Viene creato un record in `investment_transactions` con `linked_transaction_id`
4. Il saldo del conto bancario diminuisce, il conto "Investimenti" aumenta

> File: `backend/routes/investments.js` (POST /transactions)

### 4. Motore Previsioni (PredictEngine)
Pipeline a 6 step eseguita ad ogni chiamata:
1. **fetchLiquidity()** — Somma saldi di tutti i conti
2. **fetchRealYearData()** — Entrate/uscite reali dell'anno in corso (separate: core, loan, extra)
3. **calculateAverages()** — Media mensile ultimi 6 mesi (solo mesi con attività)
4. **refineAverages()** — Raffinamento per tipologia di ricorrenza (monthly/yearly/occasional)
5. **projectFuture()** — Proiezione entrate/uscite per mesi restanti (+5% margine sicurezza)
6. **calculateObligations()** — Rate future + scadenze pendenti

**Output finale:**
- `endOfYearBalance` = saldo attuale + entrate future - spese future - rate - scadenze
- `freeBudget` = (entrate_anno × 70%) - spese_core - scadenze - rate
- `savingsRate` = % risparmio stimato a fine anno

> File: `backend/utils/predictEngine.js`

### 5. Scadenze Ricorrenti
Quando una scadenza con `is_recurring = true` viene marcata come `'paid'`:
- Si crea automaticamente una nuova scadenza per l'anno successivo (stessa data + 1 anno)
- Controllo anti-duplicato prima della creazione

> File: `backend/routes/deadlines.js` (PUT /:id)

---

## 🧪 Test Unitari

```bash
# Test Backend (logica saldi e calcoli)
docker exec -it reactspese_local-backend-1 npm test

# Test Frontend (parsing CSV)
docker exec -it reactspese_local-frontend-1 npm test
```

| File Test | Cosa Testa |
|-----------|-----------|
| `backend/__tests__/balance.test.js` | Calcolo saldi con income/expense/transfer |
| `backend/__tests__/validation.test.js` | Validazione campi transazione |
| `backend/__tests__/investments.test.js` | **Calcolo performance investimenti (PMC, ROI, BTP)** |
| `backend/__tests__/test_engine.js` | Motore previsioni |
| `backend/__tests__/test_mutuo.js` | Calcoli finanziamenti |
| `backend/__tests__/test_fine_anno.js` | Proiezioni fine anno |
| `backend/utils/transactionService.test.js` | Service creazione transazioni |
| `frontend/src/__tests__/csvParser.test.js` | Parsing CSV con formati decimali IT |
| `frontend/src/__tests__/transactionUtils.test.js` | Logica duplicazione transazioni |
| `frontend/src/__tests__/investmentUtils.test.js` | Calcoli dinamici UI Investimenti |

---

## ⚠️ Regole per le Modifiche

1. **MAI eliminare** funzioni o logiche esistenti senza conferma esplicita
2. **Modifiche chirurgiche**: intervenire solo sulle righe necessarie (usando `multi_replace_file_content`)
3. **Sicurezza Git**: prima di ogni sessione o modifica strutturale, eseguire un `commit` di stato.
4. **Backup fisico**: mantenere comunque copie in `backupsicirezzafile/` per modifiche critiche.
5. **Schema DB**: ogni modifica va sia in `init.sql` che in `initDB()` di `index.js`
6. **Test**: eseguire `npm test` dopo ogni modifica alla logica di calcolo o al parsing.
7. **Docker**: `docker compose up -d --build` dopo modifiche a `init.sql` o dipendenze.

---

> 📎 Per dettagli su ogni singolo file, consulta:
> - [📦 Backend — Documentazione Dettagliata](./backend/README_TECNICO.md)
> - [🖥 Frontend — Documentazione Dettagliata](./frontend/README_TECNICO.md)
