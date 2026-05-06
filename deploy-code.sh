#!/bin/bash

# Configurazione
VM_USER="fabio"
VM_IP="192.168.1.73"
VM_PATH="/home/fabio/reactspese_local"

echo "------------------------------------------------"
echo "🚀 AGGIORNAMENTO CODICE (SOLO CODE) su $VM_IP"
echo "------------------------------------------------"

# 1. Trasferimento file via SCP (senza backup DB)
echo "📦 1. Trasferimento file alla VM..."
scp -r ./backend ./frontend ./docker-compose.yml $VM_USER@$VM_IP:$VM_PATH/

# 2. Configurazione IP per il cellulare
echo "⚙️ 2. Configurazione IP API sulla VM..."
ssh $VM_USER@$VM_IP "echo 'VITE_API_URL=http://$VM_IP:5000/api' > $VM_PATH/frontend/.env"

# 3. Riavvio e ricostruzione container sulla VM
echo "🔄 3. Riavvio e ricostruzione container sulla VM..."
ssh $VM_USER@$VM_IP "cd $VM_PATH && docker compose up --build -d"

echo "------------------------------------------------"
echo "✅ CODICE AGGIORNATO CON SUCCESSO!"
echo "📱 Le modifiche sono attive su: http://$VM_IP:3000"
echo "------------------------------------------------"
