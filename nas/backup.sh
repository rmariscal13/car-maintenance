#!/bin/sh
# Copia de seguridad completa de la base de datos (usuarios incluidos) en nas/backup/.
# Guarda las 30 últimas. Para hacerla cada noche, en el cron del NAS:
#   15 3 * * * /ruta/a/car-maintenance/nas/backup.sh
set -eu
cd "$(dirname "$0")"
mkdir -p backup
f="backup/car-maintenance-$(date +%Y%m%d-%H%M%S).sql.gz"
docker compose exec -T db pg_dumpall -U postgres | gzip > "$f"
ls -1t backup/car-maintenance-*.sql.gz | tail -n +31 | xargs -r rm --
echo "Copia guardada en nas/$f"
