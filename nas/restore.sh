#!/bin/sh
# Crea el esquema de la app y carga una copia de los datos exportados de Supabase.
# Uso: ./restore.sh backup/supabase-export.sql
# Hay que arrancar antes con "docker compose up -d" para que GoTrue cree el esquema auth.
set -eu
cd "$(dirname "$0")"
dump="${1:?Uso: ./restore.sh <fichero .sql exportado>}"
[ -f "$dump" ] || { echo "No existe $dump"; exit 1; }

psql() { docker compose exec -T db psql -v ON_ERROR_STOP=1 -U postgres -d postgres "$@"; }

echo "Esperando a que GoTrue prepare el esquema auth..."
i=0
until [ "$(psql -Atc "select to_regclass('auth.identities') is not null and exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'auth' and p.proname = 'uid')" 2>/dev/null)" = "t" ]; do
  i=$((i + 1)); [ $i -gt 60 ] && { echo "GoTrue no ha terminado: mira 'docker compose logs auth'"; exit 1; }
  sleep 2
done

if [ "$(psql -Atc "select to_regclass('public.cars') is not null")" = "t" ]; then
  echo "La tabla public.cars ya existe: no restauro encima. Borra data/db para empezar de cero."; exit 1
fi

echo "Creando el esquema de la app (supabase/migrations)..."
for f in ../supabase/migrations/*.sql; do
  case "$f" in
    *_http_extension.sql) echo "  (omitido) $(basename "$f"): solo servía para cargar el catálogo desde GitHub"; continue ;;
  esac
  echo "  $(basename "$f")"
  psql -q < "$f"
done

# Permisos como en Supabase (por si las migraciones crearon algo fuera de los permisos por defecto).
# Las reglas de Row Level Security siguen decidiendo qué filas ve cada uno.
psql -q -c "grant usage on schema public, auth to anon, authenticated, service_role;
  grant all on all tables in schema public to anon, authenticated, service_role;
  grant all on all sequences in schema public to anon, authenticated, service_role;
  grant all on all functions in schema public to anon, authenticated, service_role;"

echo "Cargando datos..."
psql -q < "$dump"

echo "Comprobando..."
psql -c "select 'vehicle_models' tabla, count(*) filas from vehicle_models union all select 'maintenance_tasks', count(*) from maintenance_tasks union all select 'parts', count(*) from parts union all select 'part_refs', count(*) from part_refs union all select 'model_sources', count(*) from model_sources union all select 'cars', count(*) from cars union all select 'service_logs', count(*) from service_logs union all select 'car_tasks', count(*) from car_tasks union all select 'model_requests', count(*) from model_requests union all select 'app_admins', count(*) from app_admins union all select 'auth.users', count(*) from auth.users"
docker compose restart rest >/dev/null
echo "Listo."
