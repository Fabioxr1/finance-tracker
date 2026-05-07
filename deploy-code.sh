#!/bin/bash

# Configurazione
VM_USER="fabio"
VM_IP="192.168.1.73"
VM_PATH="/home/fabio/reactspese_local"
# Percorso per il socket di controllo (connessione condivisa)
SSH_SOCKET="/tmp/ssh_mux_${VM_IP}_${VM_USER}"

echo "------------------------------------------------"
echo "🚀 DEPLOY OTTIMIZZATO (1 Sola Password) su $VM_IP"
echo "------------------------------------------------"

# Funzione per pulire il socket in caso di uscita
cleanup() {
    if [ -S "$SSH_SOCKET" ]; then
        ssh -S "$SSH_SOCKET" -O exit "$VM_USER@$VM_IP" 2>/dev/null
    fi
}
trap cleanup EXIT

# 1. Apertura connessione Maestra (Chiederà la password QUI)
echo "🔑 1. Apertura connessione sicura (inserisci la password)..."
ssh -M -fN -S "$SSH_SOCKET" -o ControlPersist=600 "$VM_USER@$VM_IP"

# 2. Trasferimento file via TAR (Esclude node_modules e .git, funziona senza rsync)
echo "📦 2. Trasferimento file alla VM (compresso e pulito)..."
tar czf - --exclude='node_modules' --exclude='.git' --exclude='dist' ./backend ./frontend ./docker-compose.yml | \
    ssh -S "$SSH_SOCKET" "$VM_USER@$VM_IP" "cd $VM_PATH && tar xzf -"

# 3. Esecuzione comandi remoti raggruppati (Niente password)
echo "⚙️ 3. Configurazione e Riavvio Docker..."
ssh -S "$SSH_SOCKET" "$VM_USER@$VM_IP" "
    cd $VM_PATH && \
    rm -rf frontend/node_modules backend/node_modules && \
    echo 'VITE_API_URL=http://$VM_IP:5000/api' > $VM_PATH/frontend/.env && \
    docker compose build --no-cache && docker compose up -d --force-recreate --renew-anon-volumes
"

echo "------------------------------------------------"
echo "✅ DEPLOY COMPLETATO CON SUCCESSO!"
echo "📱 App attiva su: http://$VM_IP:3000"
echo "------------------------------------------------"
