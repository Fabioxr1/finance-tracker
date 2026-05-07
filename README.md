# 💎 Finance Tracker Pro

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/Frontend-React-61dafb.svg)
![Node](https://img.shields.io/badge/Backend-Node.js-339933.svg)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)

**Finance Tracker Pro** è un'applicazione avanzata per la gestione delle finanze personali, progettata per offrire una visione a 360° del proprio patrimonio, degli investimenti e delle previsioni di spesa.

## ✨ Funzionalità Principali

*   **📊 Dashboard Dinamica**: Riepilogo in tempo reale di saldo totale, net worth e flussi di cassa mensili.
*   **📈 Gestione Investimenti**: Monitoraggio avanzato di portafogli (Crypto, Azioni, ETF) con calcolo automatico di PMC e ROI.
*   **🛡️ Simulatore di Autonomia**: Calcola quanti mesi di indipendenza finanziaria hai in base alle tue spese medie e alla liquidità attuale.
*   **🔄 Abbonamenti & Ricorrenze**: Gestione centralizzata dei costi fissi mensili e annuali.
*   **🏷️ Analisi per Tag**: Sistema intelligente di tagging per categorizzare ogni singola spesa e analizzare i trend di consumo.
*   **⚙️ Configurazione Agile**: Gestione personalizzata di categorie e conti con interfaccia atomica.

## 🚀 Stack Tecnologico

*   **Frontend**: React 19, Lucide Icons, Recharts (Data Visualization).
*   **Backend**: Node.js, Express.js.
*   **Database**: PostgreSQL.
*   **DevOps**: Docker & Docker Compose per un deployment rapido e isolato.

## 🛠️ Installazione Rapida

Assicurati di avere Docker installato sul tuo sistema, quindi lancia:

```bash
docker compose up -d --build
```

L'applicazione sarà disponibile su `http://localhost:3000`.

## 🧪 Test Unitari

Il progetto include una suite completa di test per garantire l'integrità dei calcoli finanziari:

```bash
# Backend Tests (ROI, PMC, Balances)
docker exec -it reactspese_local-backend-1 npm test

# Frontend Tests (CSV Parsing, Utils)
docker exec -it reactspese_local-frontend-1 npm test
```

---
*Prodotto con ❤️ da [Fabio](https://github.com/Fabioxr1)*
