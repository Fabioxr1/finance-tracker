#!/bin/bash

# Configurazione
VM_USER="fabio"
VM_IP="192.168.1.73"
VM_PATH="/home/fabio/reactspese_local"

echo "------------------------------------------------"
echo "☢️  DESTRUTTORE DI DATABASE E RE-DEPLOY"
echo "------------------------------------------------"

# 1. Backup Database Locale
echo "💾 1. Esportazione database locale..."
docker exec reactspese_local-db-1 pg_dump -U postgres spese > backup_db_locale.sql

# 2. Trasferimento file
echo "📦 2. Trasferimento file alla VM..."
ssh $VM_USER@$VM_IP "mkdir -p $VM_PATH"
scp -r ./backend ./frontend ./docker-compose.yml ./backup_db_locale.sql $VM_USER@$VM_IP:$VM_PATH/

# 3. Configurazione IP per il cellulare
echo "⚙️ 3. Configurazione IP API sulla VM..."
ssh $VM_USER@$VM_IP "echo 'VITE_API_URL=http://$VM_IP:5000/api' > $VM_PATH/frontend/.env"

# 4. RIAVVIO DOCKER
echo "🔄 4. Riavvio container sulla VM..."
ssh $VM_USER@$VM_IP "cd $VM_PATH && docker compose down && docker compose up --build -d"

echo "⏳ Attendiamo 10 secondi per l'avvio del database..."
sleep 10

# 5. PIALLATURA E IMPORTAZIONE
echo "🧹 5. Cancellazione database remoto e importazione dati puliti..."
# Questo comando cancella il database e lo ricrea per non avere conflitti
ssh $VM_USER@$VM_IP "docker exec -i reactspese_local-db-1 psql -U postgres -c 'DROP DATABASE IF EXISTS spese;' && \
                     docker exec -i reactspese_local-db-1 psql -U postgres -c 'CREATE DATABASE spese;' && \
                     docker exec -i reactspese_local-db-1 psql -U postgres -d spese < $VM_PATH/backup_db_locale.sql"

echo "------------------------------------------------"
echo "✅ DATABASE PIALLATO E RIGENERATO CON SUCCESSO!"
echo "📱 Accedi dal cellulare: http://$VM_IP:3000"
echo "------------------------------------------------"
