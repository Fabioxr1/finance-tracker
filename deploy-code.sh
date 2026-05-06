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

# 2. Trasferimento file via SCP usando il socket (Niente password)
echo "📦 2. Trasferimento file alla VM..."
scp -o ControlPath="$SSH_SOCKET" -r ./backend ./frontend ./docker-compose.yml "$VM_USER@$VM_IP:$VM_PATH/"

# 3. Esecuzione comandi remoti raggruppati (Niente password)
echo "⚙️ 3. Configurazione e Riavvio Docker..."
ssh -S "$SSH_SOCKET" "$VM_USER@$VM_IP" "
    echo 'VITE_API_URL=http://$VM_IP:5000/api' > $VM_PATH/frontend/.env && \
    cd $VM_PATH && \
    docker compose up --build -d
"

echo "------------------------------------------------"
echo "✅ DEPLOY COMPLETATO CON SUCCESSO!"
echo "📱 App attiva su: http://$VM_IP:3000"
echo "------------------------------------------------"
