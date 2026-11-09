#!/bin/sh
# Prepara el despliegue en el NAS: crea .env con claves aleatorias y web/config.js.
# Uso: ./setup.sh [URL pública]   (por defecto http://casita:8095)
# Si .env ya existe no lo toca (las claves deben ser siempre las mismas).
set -eu
cd "$(dirname "$0")"

command -v openssl >/dev/null || { echo "Falta openssl"; exit 1; }

b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }
jwt() { # jwt <secreto> <rol>
  now=$(date +%s); exp=$((now + 10 * 365 * 24 * 3600))
  h=$(printf '{"alg":"HS256","typ":"JWT"}' | b64url)
  p=$(printf '{"role":"%s","iss":"supabase","iat":%s,"exp":%s}' "$2" "$now" "$exp" | b64url)
  s=$(printf '%s.%s' "$h" "$p" | openssl dgst -sha256 -hmac "$1" -binary | b64url)
  printf '%s.%s.%s' "$h" "$p" "$s"
}

if [ ! -f .env ]; then
  url="${1:-http://casita:8095}"
  port=$(printf '%s' "$url" | sed -n 's#^[a-z]*://[^:/]*:\([0-9]*\).*#\1#p'); port="${port:-80}"
  secret=$(openssl rand -hex 32)
  ( umask 077; : > .env )
  cat >> .env <<EOF
# Generado por setup.sh. No lo subas a git.
PUBLIC_URL=$url
PORT=$port
POSTGRES_PASSWORD=$(openssl rand -hex 24)
AUTH_DB_PASSWORD=$(openssl rand -hex 24)
AUTHENTICATOR_PASSWORD=$(openssl rand -hex 24)
JWT_SECRET=$secret
ANON_KEY=$(jwt "$secret" anon)
SERVICE_ROLE_KEY=$(jwt "$secret" service_role)
# true = nadie más puede crearse cuenta
DISABLE_SIGNUP=false
EOF
  echo "Creado .env para $url"
else
  echo ".env ya existe: se mantiene"
fi

anon=$(sed -n 's/^ANON_KEY=//p' .env)
mkdir -p web data/db data/caddy
cat > web/config.js <<EOF
// Generado por nas/setup.sh. La web habla con el propio NAS (misma dirección y puerto).
// La clave anon es pública por diseño: la seguridad la ponen las reglas de Row Level Security.
window.APP_CONFIG = {
  supabaseUrl: location.origin,
  supabaseKey: "$anon"
};
EOF
echo "Creado web/config.js"
