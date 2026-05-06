# Finance Tracker - Guida Tecnica

Questo progetto è un'applicazione per la gestione delle finanze personali basata su **React (Frontend)**, **Node.js/Express (Backend)** e **PostgreSQL (Database)**. L'intera applicazione è containerizzata con Docker.

## 🚀 Come avviare l'applicazione

Per far partire tutto l'ambiente di sviluppo:
```bash
docker compose up -d --build
```

## 🧪 Test Unitari

Abbiamo implementato una suite di test unitari per garantire la correttezza dei calcoli finanziari e della logica di importazione dati. Poiché l'ambiente è containerizzato, i test vanno lanciati tramite Docker.

### 1. Test del Backend (Logica Saldi e Calcoli)
Verifica che le entrate, le uscite e i calcoli degli investimenti (PMC/ROI) funzionino correttamente.
```bash
docker exec -it reactspese_local-backend-1 npm test
```

### 2. Test del Frontend (Logica Importazione e UI)
Verifica il parsing dei file CSV, la logica di duplicazione e i calcoli dinamici degli investimenti.
```bash
docker exec -it reactspese_local-frontend-1 npm test
```

## 📂 Struttura dei Test
- `backend/__tests__/`: Contiene i test per saldi, validazione e **investimenti (PMC/ROI)**.
- `frontend/src/__tests__/`: Contiene i test per parser CSV, **duplicazione transazioni** e **utility investimenti**.
- `backend/utils/`: Utility testabili (es. calcolatore saldi, investmentCalculations).
- `frontend/src/utils/`: Utility testabili (es. parser CSV, investmentUtils, transactionUtils).
