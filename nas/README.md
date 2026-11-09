# Taller en el NAS

La web y sus datos en tu propio servidor, sin depender de supabase.co. Se levantan solo las piezas de Supabase que usa la web, así que `index.html` y `app.js` no cambian:

| Servicio | Imagen | Para qué |
|---|---|---|
| `db` | `postgres:17-alpine` | La base de datos |
| `auth` | `supabase/gotrue` | El login (las mismas cuentas y contraseñas que en Supabase) |
| `rest` | `postgrest/postgrest` | La API que usa supabase-js |
| `web` | `caddy:2-alpine` | Sirve la web y reparte `/auth/v1` y `/rest/v1` |

Todo sale por un solo puerto (por defecto `8095`): `http://casita:8095`.

## Instalar

Necesitas Docker con `docker compose`. Desde la carpeta `nas/`:

```sh
./setup.sh http://casita:8095        # crea .env (claves aleatorias) y web/config.js
docker compose up -d                 # arranca los cuatro servicios
./restore.sh backup/supabase-export.sql   # crea las tablas y carga los datos
```

`backup/supabase-export.sql` es la exportación de Supabase. **Lleva datos personales y el hash de tu contraseña**: no se sube a git (está en `.gitignore`).

Sin exportación, para empezar de cero con solo el catálogo, carga en su lugar los ficheros de `supabase/seed_suzuki_alto.sql` y `supabase/seeds/`.

## Día a día

- **Actualizar la web**: `git pull`. Caddy sirve `index.html` y `app.js` directamente desde el repo; basta con recargar.
- **Copia de seguridad**: `./backup.sh` guarda un `.sql.gz` en `backup/` (las 30 últimas). Ponlo en el cron del NAS para hacerlo cada noche.
- **Cerrar el registro** a gente nueva: `DISABLE_SIGNUP=true` en `.env` y `docker compose up -d`.
- **Hacer admin a alguien**:
  ```sh
  docker compose exec db psql -U postgres -c "insert into app_admins (user_id) select id from auth.users where email = 'tu@correo.com'"
  ```
- **Nuevas migraciones** de `supabase/migrations/`: `docker compose exec -T db psql -U postgres < ../supabase/migrations/<fichero>.sql`.

## A tener en cuenta

- No hay servidor de correo: las cuentas nuevas quedan confirmadas al crearlas y no funciona "he olvidado mi contraseña". Para cambiar una contraseña a mano:
  ```sh
  docker compose exec db psql -U postgres -c "update auth.users set encrypted_password = crypt('nueva', gen_salt('bf')) where email = 'tu@correo.com'"
  ```
  (antes, una vez: `docker compose exec db psql -U postgres -c "create extension if not exists pgcrypto"`).
- Es HTTP en tu red local. Para usarla fuera de casa, ponla detrás de tu VPN o de un proxy con HTTPS y cambia `PUBLIC_URL` en `.env`.
- `.env` guarda las claves. Si lo pierdes, las sesiones abiertas dejan de valer (los datos no se pierden): vuelve a ejecutar `./setup.sh` y `docker compose up -d`.
