# 🖥 Frontend — Documentazione Tecnica Dettagliata

> **Framework:** React 18 + Vite  
> **Styling:** Vanilla CSS con variabili CSS (design system in `index.css`)  
> **Icone:** lucide-react  
> **Grafici:** recharts  
> **Porta:** 3000

---

## 📂 Struttura File

```
frontend/src/
├── main.jsx                    # Entry point React (render App)
├── App.jsx                     # Layout principale (Sidebar + Routing manuale)
├── App.css                     # Stili specifici App
├── index.css                   # 🎨 ENTRY POINT CSS: importa i moduli da styles/
├── styles/                     # 🎨 DESIGN SYSTEM MODULARE
│   ├── vars.css                # Variabili, colori, font e ombre
│   ├── layout.css              # Reset, struttura (sidebar, main) e responsiveness
│   └── components.css          # Tutti i componenti (card, btn, table, modal)
│
├── utils/
│   ├── csvParser.js            # Parser CSV (Import/Export) con supporto 9 colonne
│   ├── transactionUtils.js     # Utility per transazioni (duplicazione, pulizia dati)
│   └── investmentUtils.js      # Calcoli dinamici per l'interfaccia investimenti (PAC, quote)
│
├── hooks/
│   ├── useInvestments.js       # 🛡️ Custom Hook: logica e stato della sezione Investimenti
│   └── useTransactions.js      # 🛡️ Custom Hook: logica e stato della sezione Transazioni
│
├── components/
│   ├── DashboardView.jsx       # Pagina Dashboard
│   ├── MonthlyAnalysisView.jsx # Pagina Analisi Mensile Dettagliata
│   ├── AccountsView.jsx        # Pagina Conti & Carte
│   ├── TransactionsView.jsx    # Pagina Transazioni (la più complessa)
│   ├── DeadlinesView.jsx       # Pagina Scadenze
│   ├── SubscriptionsView.jsx   # Pagina Abbonamenti
│   ├── TagsView.jsx            # Pagina Gestione Tag
│   ├── TagStats.jsx            # Pagina Analisi Tag
│   ├── InvestmentsView.jsx     # Pagina Investimenti
│   ├── InstallmentsView.jsx    # Pagina Rate & Finanziamenti
│   ├── SqlConsoleView.jsx      # Console SQL
│   ├── ConfigView.jsx          # Configurazione (categorie/conti)
│   │
│   ├── dashboard/              # Sotto-componenti Dashboard
│   │   ├── StatsCards.jsx      # 4 carte: Liquidità, Investimenti, Debito, Net Worth
│   │   ├── AccountsGrid.jsx   # Griglia conti con entrate/uscite/saldo
│   │   ├── CashFlowStats.jsx  # Flusso di cassa annuale
│   │   ├── HistoryChart.jsx   # Grafico a barre entrate vs uscite mensili (con min-height e gestione dati assenti)
│   │   ├── CategoryRanking.jsx # Classifica categorie entrate/uscite
│   │   ├── MonthlyTable.jsx   # Tabella dettaglio mese per mese
│   │   ├── DeadlineSummary.jsx # Riepilogo scadenze annuali
│   │   └── PredictionCard.jsx # Simulatore di Risparmio con slider
│   │
│   │   ├── TransactionFilters.jsx  # Barra filtri (anno, mese, tipo, conto, ecc.)
│   │   ├── TransactionForm.jsx     # Form aggiunta nuova transazione
│   │   ├── TransactionTable.jsx    # Container tabella
│   │   ├── TransactionDesktopRow.jsx # 🧩 Singola riga desktop (view/edit)
│   │   ├── TransactionMobileCard.jsx # 🧩 Singola card mobile (view/edit)
│   │   ├── TransactionPagination.jsx # Paginazione
│   │   └── CSVControls.jsx         # Pulsante importazione CSV
│   │
│   ├── deadlines/              # Sotto-componenti Scadenze
│   │   ├── DeadlineForm.jsx   # Form creazione/modifica scadenza
│   │   ├── DeadlineItem.jsx   # Singola scadenza nella lista
│   │   └── DeadlineList.jsx   # Lista scadenze
│   │
│   ├── installments/           # Sotto-componenti Rate
│   │   ├── InstallmentCard.jsx     # Card singolo finanziamento
│   │   ├── InstallmentForm.jsx     # Form creazione/modifica
│   │   ├── InstallmentPayModal.jsx # Modale pagamento rata
│   │   └── InstallmentStats.jsx    # Statistiche aggregate
│   │
│   └── investments/            # Sotto-componenti Investimenti
│       ├── InvestmentModals.jsx    # Modali: nuovo titolo, acquisto, vendita, modifica
│       ├── InvestmentStats.jsx     # Card statistiche portfolio
│       ├── PACSection.jsx          # Sezione Piani di Accumulo
│       ├── PortfolioChart.jsx      # Grafico a torta distribuzione
│       └── PortfolioTable.jsx      # Tabella titoli con performance
│
├── __tests__/
│   ├── csvParser.test.js       # Test parsing CSV
│   ├── transactionUtils.test.js # Test logica duplicazione
│   ├── investmentUtils.test.js  # Test calcoli UI investimenti
│   └── useInvestments.test.js   # Test hook investimenti (Mock API)
```

---

## 📄 File Principali — Dettaglio

---

### `main.jsx` — Entry Point

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

Semplice bootstrap React. Nessun router esterno (il routing è gestito manualmente in App.jsx).

---

### `App.jsx` — Layout e Navigazione

**Responsabilità:** Layout a sidebar + area contenuto. Routing manuale tramite stato `activeTab`.

#### Stato
- `activeTab` — Stringa che identifica la pagina attiva (es: `'dashboard'`, `'transazioni'`)
- `isSidebarOpen` — Boolean per sidebar mobile

#### Navigazione (sidebar)
| Tab Key | Icona | Componente Renderizzato |
|---------|-------|------------------------|
| `dashboard` | LayoutDashboard | `<DashboardView />` |
| `analisi-mensile` | CalendarRange | `<MonthlyAnalysisView />` |
| `conti` | Wallet | `<AccountsView />` |
| `transazioni` | ListOrdered | `<TransactionsView />` |
| `scadenze` | CalendarClock | `<DeadlinesView />` |
| `abbonamenti` | Repeat | `<SubscriptionsView />` |
| `tags` | Tag | `<TagsView />` |
| `analisi-tag` | BarChart3 | `<TagStats />` |
| `investimenti` | TrendingUp | `<InvestmentsView />` |
| `rate` | Car | `<InstallmentsView />` |
| `console` | Database | `<SqlConsoleView />` |
| `config` | Settings | `<ConfigView />` |

**Struttura HTML:**
```
div.app-container
├── header.mobile-header (visibile solo su mobile)
├── div.sidebar-overlay (visibile quando sidebar aperta su mobile)
├── aside.sidebar
│   ├── div.sidebar-logo
│   └── nav > div.nav-item (per ogni tab)
└── main.main-content
    └── {componente attivo}
```

> ⚠️ **Non c'è React Router.** Il routing è un semplice conditional rendering basato su `activeTab`.

---

### `index.css` & `styles/` — Design System Modulare

Il CSS è diviso in moduli per massimizzare la manutenibilità:
1.  **`index.css`**: File principale che importa i moduli.
2.  **`vars.css`**: Definisce le variabili `:root` (palette colori, ombre, spacing).
3.  **`layout.css`**: Gestisce il reset base e la struttura macro (Sidebar, Header, Main Content e Media Queries strutturali).
4.  **`components.css`**: Contiene lo stile di tutti gli elementi atomici (bottoni, card, tabelle, modali, input).

> ⚠️ **Regola:** Non aggiungere stili complessi direttamente in `index.css`. Inseriscili nel modulo appropriato in `styles/`.

---

## 📄 Componenti — Dettaglio per Pagina

---

### 📊 `DashboardView.jsx` — Dashboard Principale

**Stato:**
- `year` — Anno selezionato (default: anno corrente)
- `availableYears` — Anni disponibili nel DB
- `dashboardData` — Oggetto con tutti i dati aggregati

**Fetch:** `GET /api/dashboard-stats?year={year}` — Ricarica quando cambia l'anno.

**Sotto-componenti renderizzati (in ordine):**
1. **`StatsCards`** — 4 carte hero: Liquidità Reale, Investimenti, Debito Residuo, Patrimonio Netto
2. **`PredictionCard`** — Simulatore di risparmio (fetch indipendente su `/api/predictions`)
3. **`DeadlineSummary`** — Riepilogo scadenze anno (fetch indipendente su `/api/deadlines`)
4. **`AccountsGrid`** — Griglia dettaglio per ogni conto
5. **`CashFlowStats`** — Barra flusso di cassa (entrate vs uscite)
6. **`HistoryChart`** — Grafico a barre mensile (usa `recharts`)
7. **`CategoryRanking`** — Classifica categorie con barre percentuali
8. **`MonthlyTable`** — Tabella 12 righe con dati per mese

---

### `dashboard/PredictionCard.jsx` — Simulatore Risparmio

**Fetch indipendente:** `GET /api/predictions`

**Stato:**
- `data` — Dati dal PredictEngine
- `simTarget` — Obiettivo risparmio % (slider, default 30%)

**Calcoli lato client:**
```
simFreeBudget = (entrate_anno × (1 - target%)) - uscite_anno
simMonthlyExpense = (uscite_anno + simFreeBudget) / 12
simRunway = saldo_attuale / simMonthlyExpense
simEndOfYearBalance = saldo + (entrate - (uscite + simFreeBudget))
```

**UI:** Due card affiancate:
- Sinistra: Budget Libero, Proiezione 31/12, Slider, Autonomia
- Destra: Dettaglio flussi (entrate reali, spese reali, entrate stimate, spese previste, scadenze+rate)

---

### 📋 `TransactionsView.jsx` — Gestione Transazioni

- Sinistra: Budget Libero, Proiezione 31/12, Slider, Autonomia
- Destra: Dettaglio flussi (entrate reali, spese reali, entrate stimate, spese previste, scadenze+rate)

---

L'architettura è stata rifattorizzata utilizzando il Custom Hook **`useTransactions.js`**, che separa completamente la logica di business (chiamate API, gestione stato, import/export) dalla presentazione UI.

**Stato e Logica (gestiti dall'hook):**
- `transactions` — Array transazioni della pagina corrente
- `filters` — Oggetto filtri (include nuovi filtri per **ID** e **Prezzo**)
- `fetchData` — Funzione centralizzata di ricaricamento dati
- `handleFileUpload` — Logica di importazione CSV (supporta **Update via ID**)
- Operazioni CRUD (add, edit, delete, bulk delete/update)

**Componente UI (`TransactionsView.jsx`):**
Agisce come orchestratore dei sotto-componenti:
1. **`CSVControls`** — Pulsanti import/export
2. **`TransactionFilters`** — Barra filtri (ora con ricerca per ID e Prezzo "fuzzy")
3. **`TransactionForm`** — Inserimento rapido
4. **`TransactionTable`** — Orchestratore della visualizzazione:
    - Utilizza **`TransactionDesktopRow`** per il layout tabellare su PC.
    - Utilizza **`TransactionMobileCard`** per il layout a card su smartphone.
    - Entrambi gestiscono internamente la logica di **Editing Inline**.
5. **`TransactionPagination`** — Navigazione pagine

**Funzioni chiave:**
| Funzione | Cosa fa |
|----------|---------|
| `fetchData()` | Carica tutti i dati necessari in parallelo |
| `handleTypeChange()` | Cambia tipo → aggiorna categoria di default |
| `addTransaction()` | POST nuova transazione |
| `deleteTransaction()` | DELETE singola con conferma |
| `startEdit()` / `saveEdit()` | Editing inline nella tabella |
| `handleBulkDelete()` | Eliminazione massiva con conferma |
| `handleBulkUpdate()` | Modifica massiva (ricorrenza, categoria, tag) |
| `toggleSelectAll()` / `toggleSelectOne()` | Selezione checkbox |
| `handleFileUpload()` | Importazione CSV flessibile: supporta 6 colonne (base) o 9 colonne (esteso). |
| `handleExportCSV()` | Genera e scarica un file CSV con tutte le transazioni corrispondenti ai filtri attivi. |
| `exportTransactionsToCSV()` | Utility per convertire i dati JSON in stringa CSV (separatore `;`, decimale `.`). |

**Operazioni di massa (barra azioni):**
- Cambia tipo ricorrenza (dropdown)
- Sposta in categoria (dropdown)
- Aggiungi tag (dropdown)
- Rimuovi tag (dropdown)
- **Annulla Ultima Modifica (Pulsante Undo)**: Ripristina lo stato precedente dopo un'azione bulk
- Elimina selezionate (button)
- Deseleziona tutto (button)

---

### `utils/csvParser.js` — Parser CSV

Gestisce sia l'importazione che l'esportazione dei dati finanziari.

**Caratteristiche:**
1. **Flessibilità**: Riconosce automaticamente il numero di colonne:
   - **6 Colonne**: `Data;Tipo;Importo;Conto;Categoria;Descrizione` (Formato legacy/semplice).
   - **9 Colonne**: `Data;Tipo;Importo;Conto;Conto Destinazione;Categoria;Ricorrenza;Tag;Descrizione` (Formato completo).
2. **Standardizzazione**: 
   - Separatore: `;` (punto e virgola).
   - Decimale: `.` (punto) per evitare conflitti con i separatori di colonna.
3. **Normalizzazione**: Gestisce date `DD/MM/YYYY` e `YYYY-MM-DD`.
4. **Esportazione**: La funzione `exportTransactionsToCSV` genera file compatibili con Excel/LibreOffice senza spostamento di colonne.

---

### 💳 `AccountsView.jsx` — Conti & Carte

CRUD conti con visualizzazione saldo calcolato. Include protezione per conti di sistema e password admin per modifica saldo iniziale.

---

### 📅 `DeadlinesView.jsx` — Scadenze

Gestione scadenze con:
- Separazione visiva: In Scadenza vs Pagate
- Pagamento con toggle ricorrenza automatica
- Sotto-componenti: `DeadlineForm`, `DeadlineItem`, `DeadlineList`

---

### 🔄 `SubscriptionsView.jsx` — Abbonamenti

Gestione abbonamenti con:
- Selezione mesi attivi (checkbox per ogni mese)
- Giorno del mese di addebito
- Toggle attivo/disattivo
- Calcolo costo mensile e annuale

---

### 🏷 `TagsView.jsx` — Gestione Tag

CRUD tag con:
- Color picker per il colore
- Descrizione opzionale
- Preview del badge tag

---

### 📊 `TagStats.jsx` — Analisi Tag

Statistiche per tag con:
- Filtro anno e mese
- Barre percentuali per ogni tag
- Totale speso per tag nel periodo
- **Simulatore di Autonomia Finanziaria** (componente `RunwaySimulator`)

---

### 🛡️ `RunwaySimulator.jsx` — Simulatore di Autonomia Finanziaria

**Fetch indipendente:** `GET /api/tag-stats/runway`

**Concetto:** Calcola quanti mesi l'utente può vivere senza stipendio, con possibilità di escludere categorie di spesa (tag) per vedere come cambia l'autonomia.

**Stato:**
- `data` — Dati dal backend (saldo, media mensile, tag con media)
- `excludedTags` — Array di tag_id esclusi dall'utente

**Calcolo lato client:**
```
savedPerMonth = somma avgMonthly dei tag esclusi
adjustedMonthly = avgMonthlyTotal - savedPerMonth
adjustedRunway = currentBalance / adjustedMonthly
gainedMonths = adjustedRunway - baselineRunway
```

**UI:**
- 4 hero cards: Liquidità, Spesa Media/Mese, Mesi Autonomia, Scenario Base
- Barra visiva con colore dinamico (verde >12 mesi, giallo 6-12, rosso <6)
- Lista tag con toggle ON/OFF — click per escludere/includere
- Ogni tag mostra il costo medio mensile
- Pulsante "Ripristina tutto" per reset
- Aggiornamento istantaneo senza chiamate API (calcolo client-side)

---

### 📈 `InvestmentsView.jsx` — Investimenti

Gestione portfolio completa:
- Tabella titoli con gain/loss e % 
- Grafici distribuzione
- Sezione PAC
- Modali per: nuovo titolo, acquisto, vendita, modifica, storico movimenti
- **Architettura**: Utilizza il Custom Hook `useInvestments.js` per separare la logica dallo stile.
- Sotto-componenti: `InvestmentModals`, `InvestmentStats`, `PACSection`, `PortfolioChart`, `PortfolioTable`

---

### 🚗 `InstallmentsView.jsx` — Rate & Finanziamenti

Gestione debiti:
- Card per ogni finanziamento con barra progresso
- Ricalcolo dinamico (rate rimanenti, data fine stimata)
- Modale pagamento rata
- Statistiche aggregate
- Sotto-componenti: `InstallmentCard`, `InstallmentForm`, `InstallmentPayModal`, `InstallmentStats`

---

### 🖥 `SqlConsoleView.jsx` — Console SQL

Editor SQL con:
- Textarea per query libera
- Esecuzione via `POST /api/query`
- Visualizzazione risultati in tabella (SELECT) o messaggio (comando)

---

### ⚙️ `ConfigView.jsx` — Configurazione

Gestione categorie e conti dall'interfaccia:
- CRUD categorie (separate per income/expense)
- CRUD conti

---

## 🧪 Test Frontend

### `__tests__/csvParser.test.js`

Testa il parser CSV con:
- Formato separatore punto e virgola (`;`)
- Formato separatore virgola (`,`)
- Decimali con virgola italiana (`7,50`)
- Date in formato italiano (`DD/MM/YYYY`)
- Fallback categorie
- Gestione errori (conto non trovato)

### `__tests__/investmentUtils.test.js`
Testa i calcoli dinamici delle quote e dei totali per ETF e BTP (fattore 100).

### `__tests__/transactionUtils.test.js`
Testa la preparazione della transazione per la duplicazione (pulizia ID e campi joined).

```bash
docker exec -it reactspese_local-frontend-1 npm test
```

---

## 📡 Comunicazione con il Backend

Tutti i componenti usano:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

La variabile `VITE_API_URL` è impostata in `docker-compose.yml` come `http://${SERVER_IP}:5000/api`.

**Pattern fetch standard:**
```javascript
const res = await fetch(`${API_URL}/endpoint`);
const data = await res.json();
```

Per POST/PUT:
```javascript
const res = await fetch(`${API_URL}/endpoint`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

---

## ⚠️ Punti Critici Frontend

| Investimenti | I modali sono tutti in un singolo file `InvestmentModals.jsx` (23KB) — molto grande | `InvestmentModals.jsx` |

---

## 🌐 Risoluzione Problemi DNS (Fetch Failed)

Se l'applicazione non carica i prezzi in tempo reale (investimenti) e il backend logga errori `fetch failed`:

1.  **Causa:** Il container non risolve i DNS esterni.
2.  **Soluzione:** È stata forzata la configurazione DNS nel file `docker-compose.yml`.
3.  **Azione:** Riavviare l'ambiente con `docker compose up -d`.
4.  **Verifica:** Controllare che `VITE_API_URL` punti correttamente all'IP del server (`SERVER_IP` nel file `.env`).
