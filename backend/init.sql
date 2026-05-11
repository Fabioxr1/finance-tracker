-- TABELLA CONTI
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'current', 'digital', 'savings', 'trade', 'debt'
    initial_balance DECIMAL(10, 2) DEFAULT 0.00,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABELLA CATEGORIE
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'income', 'expense'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RATE E FINANZIAMENTI (Deve stare prima di transactions per la FK)
CREATE TABLE installments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    monthly_amount DECIMAL(10, 2) NOT NULL,
    total_installments INT DEFAULT 0,
    paid_installments INT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    account_id INT REFERENCES accounts(id), 
    search_keyword VARCHAR(255), -- Parola chiave per associazione automatica transazioni
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABELLA TRANSAZIONI
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    account_id INT REFERENCES accounts(id),
    to_account_id INT REFERENCES accounts(id), 
    category_id INT REFERENCES categories(id),
    installment_id INT REFERENCES installments(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL, 
    type VARCHAR(10) NOT NULL, -- 'income', 'expense', 'transfer'
    recurrence_type VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'extraordinary', 'occasional', 'yearly', 'variable'
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INVESTIMENTI
CREATE TABLE investments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    isin VARCHAR(50),
    ticker VARCHAR(50), -- Per recupero prezzi real-time (Yahoo Finance)
    type VARCHAR(50), -- 'ETF', 'Fondo', 'BTP', 'Deposito'
    account_id INT REFERENCES accounts(id),
    manual_price DECIMAL(10, 4), -- Prezzo inserito manualmente
    use_manual_price BOOLEAN DEFAULT FALSE, -- Flag per ignorare API esterne
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MOVIMENTI INVESTIMENTI
CREATE TABLE investment_transactions (
    id SERIAL PRIMARY KEY,
    investment_id INT REFERENCES investments(id),
    date DATE NOT NULL,
    shares DECIMAL(15, 4),
    price_per_share DECIMAL(15, 4),
    total_amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(50), -- 'buy', 'sell'
    linked_transaction_id INT REFERENCES transactions(id) ON DELETE CASCADE
);

-- PIANI DI ACCUMULO (PAC)
CREATE TABLE investment_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    investment_id INT REFERENCES investments(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SCADENZE (DEADLINES)
CREATE TABLE deadlines (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15,2),
    category_id INT REFERENCES categories(id),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid'
    description TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ABBONAMENTI (SUBSCRIPTIONS)
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(100) NOT NULL, 
    amount DECIMAL(10,2) NOT NULL, 
    category_id INTEGER REFERENCES categories(id), 
    account_id INTEGER REFERENCES accounts(id), 
    day_of_month INTEGER DEFAULT 1, 
    active_months INTEGER[] DEFAULT '{1,2,3,4,5,6,7,8,9,10,11,12}',
    active BOOLEAN DEFAULT true, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABELLA TAG (Per etichettatura dinamica)
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20) DEFAULT '#3b82f6',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABELLA PONTE TRANSAZIONI-TAG
CREATE TABLE transaction_tags (
    transaction_id INT REFERENCES transactions(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (transaction_id, tag_id)
);

-- --- DATI INIZIALI ---

-- Categorie di base
INSERT INTO categories (name, type) VALUES
-- Entrate
('Stipendio', 'income'),
('Bonifico Entrata', 'income'),
('Regalo', 'income'),
('Altro', 'income'),
-- Uscite
('Spesa', 'expense'),
('Affitto/Mutuo', 'expense'),
('Bollette', 'expense'),
('Ristorante/Bar', 'expense'),
('Trasporti', 'expense'),
('Shopping', 'expense'),
('Salute', 'expense'),
('Svago', 'expense'),
('Abbonamenti', 'expense'),
('Investimenti', 'expense'),
('PAC', 'expense'),
('Altro', 'expense');

-- Conti di sistema iniziali
INSERT INTO accounts (name, type, initial_balance, is_system) VALUES 
('Investimenti', 'Portfolio', 0, true);

-- STORICO OPERAZIONI MASSIVE (Per funzione UNDO)
CREATE TABLE bulk_operations (
    id SERIAL PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL, -- 'update', 'delete'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bulk_operations_data (
    id SERIAL PRIMARY KEY,
    bulk_op_id INT REFERENCES bulk_operations(id) ON DELETE CASCADE,
    transaction_id INT, 
    old_data JSONB NOT NULL, -- Stato della transazione prima della modifica
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

