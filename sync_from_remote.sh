#!/bin/bash

# --- CONFIGURAZIONE ---
REMOTE_IP="192.168.1.73"
REMOTE_USER="fabio" # o il tuo utente
DB_NAME="spese"
DB_USER="postgres"
LOCAL_BACKUP_FILE="remote_dump_$(date +%Y%m%d_%H%M%S).sql"

echo "🚀 Inizio sincronizzazione dal server remoto ($REMOTE_IP)..."

# 1. Creazione dump sul server remoto
echo "📦 Creazione dump sul server remoto..."
ssh $REMOTE_USER@$REMOTE_IP "docker exec reactspese_local-db-1 pg_dump -U $DB_USER $DB_NAME" > $LOCAL_BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Dump scaricato con successo: $LOCAL_BACKUP_FILE"
else
    echo "❌ Errore durante il download del dump. Controlla la connessione SSH o i nomi dei container."
    exit 1
fi

# 2. Ripristino sul Docker locale
echo "📥 Pulizia database locale e ripristino..."
# Cancello lo schema pubblico e lo ricreo vuoto per evitare conflitti
docker exec -i reactspese_local-db-1 psql -U $DB_USER -d $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

cat $LOCAL_BACKUP_FILE | docker exec -i reactspese_local-db-1 psql -U $DB_USER -d $DB_NAME

if [ $? -eq 0 ]; then
    echo "✨ Sincronizzazione completata! Il tuo database locale è ora aggiornato."
    # Riavvio il backend per sicurezza così ricarica i dati
    docker restart reactspese_local-backend-1
else
    echo "❌ Errore durante il ripristino locale."
    exit 1
fi
