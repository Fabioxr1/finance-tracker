/**
 * Utility per il parsing e l'esportazione delle transazioni in formato CSV.
 * Supporta: Data, Tipo, Importo, Conto Origine, Conto Destinazione, Categoria, Ricorrenza, Tag, Descrizione.
 */

/**
 * Parsa le righe di un file CSV
 * @param {string[]} lines - Righe del file CSV (inclusa intestazione)
 * @param {Array} accounts - Lista dei conti disponibili
 * @param {Array} categories - Lista delle categorie disponibili
 */
export const parseCSVLines = (lines, accounts, categories) => {
  const separator = lines[0].includes(';') ? ';' : ',';
  const newTransactions = [];
  const errors = [];

  // Mappa delle ricorrenze (italiano -> backend)
  const recurrenceMap = {
    'mensile': 'monthly',
    'mensili': 'monthly',
    'variabile': 'variable',
    'variabili': 'variable',
    'occasionale': 'occasional',
    'occasionali': 'occasional',
    'annuale': 'yearly',
    'annuali': 'yearly',
    'straordinaria': 'extraordinary',
    'straordinario': 'extraordinary',
    'straordinarie': 'extraordinary',
    'straordinari': 'extraordinary'
  };

  // Mappa dei tipi (italiano -> backend)
  const typeMap = {
    'entrata': 'income',
    'uscita': 'expense',
    'trasferimento': 'transfer',
    'income': 'income',
    'expense': 'expense',
    'transfer': 'transfer'
  };

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    let cols = lines[i].split(separator).map(c => c.trim().replace(/^"|"$/g, ''));

    // --- 0. RILEVAMENTO ID (Opzionale) ---
    let id = null;
    let startIdx = 0;
    
    // Se la prima colonna è un numero e la seconda sembra una data (contiene / o -)
    // assumiamo che sia un file con ID per l'aggiornamento
    if (cols.length > 1 && !isNaN(Number(cols[0])) && cols[0] !== '' && (cols[1].includes('/') || cols[1].includes('-'))) {
      id = Number(cols[0]);
      startIdx = 1;
    }

    // Se la riga ha poche colonne, la ignoriamo o segnaliamo errore
    if ((cols.length - startIdx) < 4) {
      errors.push(`Riga ${i + 1}: Formato non valido (troppe poche colonne).`);
      continue;
    }

    // --- 1. DATA (DD/MM/YYYY -> YYYY-MM-DD) ---
    let rawDate = cols[startIdx];
    let date = rawDate;
    if (rawDate.includes('/')) {
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        // Gestione DD/MM/YYYY o D/M/YYYY
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        date = `${year}-${month}-${day}`;
      }
    }

    // --- 2. TIPO ---
    const rawType = cols[1 + startIdx]?.toLowerCase() || 'uscita';
    const type = typeMap[rawType] || 'expense';

    // --- 3. IMPORTO ---
    let amountStr = cols[2 + startIdx].replace('€', '').replace(',', '.').trim();
    let colShift = 0;

    // Gestione speciale per decimali con virgola in CSV con separatore virgola (es: 7,50)
    if (separator === ',') {
      const isCols3Account = accounts.some(a => a.name.toLowerCase() === (cols[3 + startIdx] || '').toLowerCase());
      const isCols4Account = accounts.some(a => a.name.toLowerCase() === (cols[4 + startIdx] || '').toLowerCase());
      const isCols3Numeric = cols[3 + startIdx] && !isNaN(parseFloat(cols[3 + startIdx].replace(',', '.')));

      if (!isCols3Account && isCols4Account && isCols3Numeric) {
        amountStr = cols[2 + startIdx].replace(',', '.') + '.' + cols[3 + startIdx].replace(',', '.');
        colShift = 1;
      }
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount)) {
      errors.push(`Riga ${i + 1}: Importo "${cols[2 + startIdx]}" non valido.`);
      continue;
    }

    // Determiniamo se è un formato "compatto" (es: 6 colonne) o completo (9 colonne)
    const isCompact = (cols.length - colShift - startIdx) < 9;

    // --- 4. CONTO ORIGINE ---
    const accName = cols[3 + colShift + startIdx];
    const acc = accounts.find(a => a.name.toLowerCase() === (accName || '').toLowerCase());
    if (!acc) {
      errors.push(`Riga ${i + 1}: Conto Origine "${accName || ''}" non trovato.`);
      continue;
    }

    // --- 5. CONTO DESTINAZIONE (Solo per Trasferimenti e formato NON compatto) ---
    let toAccId = null;
    if (type === 'transfer' && !isCompact && cols[4 + colShift + startIdx]) {
      const toAccName = cols[4 + colShift + startIdx];
      const toAcc = accounts.find(a => a.name.toLowerCase() === (toAccName || '').toLowerCase());
      if (toAcc) {
        toAccId = toAcc.id;
      } else {
        errors.push(`Riga ${i + 1}: Conto Destinazione "${toAccName}" non trovato.`);
        continue;
      }
    }

    // --- 6. CATEGORIA ---
    let catId = null;
    if (type !== 'transfer') {
      const catIdx = isCompact ? 4 + colShift + startIdx : 5 + colShift + startIdx;
      const catName = cols[catIdx] || 'Altro';
      let cat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase() && c.type === type);

      if (!cat) {
        cat = categories.find(c => (c.name.toLowerCase() === 'altro' || c.name.toLowerCase() === 'spese varie') && c.type === type);
        if (!cat) cat = categories.find(c => c.type === type);
      }

      if (cat) catId = cat.id;
    }

    // --- 7. RICORRENZA ---
    const recIdx = isCompact ? 6 + startIdx : 6 + colShift + startIdx;
    const rawRec = (isCompact ? 'mensile' : (cols[recIdx]?.toLowerCase() || 'mensile'));
    const recurrence_type = recurrenceMap[rawRec] || 'monthly';

    // --- 8. TAGS ---
    const tagIdx = isCompact ? 7 + startIdx : 7 + colShift + startIdx;
    const rawTags = isCompact ? '' : (cols[tagIdx] || '');
    const tagNames = rawTags.split(/[\s,]+/).filter(t => t.startsWith('#')).map(t => t.substring(1));

    // --- 9. DESCRIZIONE ---
    const descIdx = isCompact ? 5 + colShift + startIdx : 8 + colShift + startIdx;
    const description = cols[descIdx] || (type !== 'transfer' ? (isCompact ? cols[4 + colShift + startIdx] : cols[5 + colShift + startIdx]) : '');

    newTransactions.push({
      id, // L'ID (se presente) indica che si tratta di un aggiornamento
      date,
      type,
      amount,
      account_id: acc.id,
      to_account_id: toAccId,
      category_id: catId,
      recurrence_type,
      description,
      tagNames
    });
  }

  return { transactions: newTransactions, errors };
};

/**
 * Esporta un array di transazioni in formato CSV
 * @param {Array} transactions - Array di oggetti transazione (formato backend)
 */
export const exportTransactionsToCSV = (transactions) => {
  const header = "ID;Data;Tipo;Importo;Conto;Conto Destinazione;Categoria;Ricorrenza;Tag;Descrizione";

  const recurrenceMapRev = {
    'monthly': 'mensile',
    'variable': 'variabile',
    'occasional': 'occasionale',
    'yearly': 'annuale',
    'extraordinary': 'straordinaria'
  };

  const typeMapRev = {
    'income': 'Entrata',
    'expense': 'Uscita',
    'transfer': 'Trasferimento'
  };

  const rows = transactions.map(tx => {
    const date = new Date(tx.date).toLocaleDateString('it-IT');
    const type = typeMapRev[tx.type] || tx.type;
    const amount = tx.amount; // Usiamo il punto come decimale (standard sicuro)
    const account = tx.account_name || '';
    const toAccount = tx.to_account_name || '';
    const category = tx.category_name || '';
    const recurrence = recurrenceMapRev[tx.recurrence_type] || 'mensile';

    // Gestione Tag (array di oggetti o stringa)
    let tags = '';
    if (Array.isArray(tx.tags)) {
      tags = tx.tags.map(t => `#${t.name || t}`).join(' ');
    }

    const description = tx.description || '';

    return [
      tx.id,
      date,
      type,
      amount,
      account,
      toAccount,
      category,
      recurrence,
      tags,
      description
    ].join(';');
  });

  return [header, ...rows].join('\n');
};
