# Taller: mantenimiento de coches

Web para elegir el modelo de tu coche, apuntar los mantenimientos hechos (fecha y km) y ver qué toca después: aceite, filtros, bujías, correa, ITV… Cada pieza lleva sus referencias exactas y enlaces de compra. La pestaña **Recambios** reúne lo que no es mantenimiento mecánico (bombillas, escobillas, batería…).

Se ve bien en el móvil. Cada persona entra con su email y contraseña y solo ve sus coches.

## Cómo está hecha

- `index.html`, `app.js`, `config.js`: la web, sin compilación. Usa [supabase-js](https://supabase.com/docs/reference/javascript) desde jsDelivr.
- Datos en [Supabase](https://supabase.com) (proyecto `car-maintenance`, París):
  - **Catálogo** (igual para todos, solo lectura desde la web): `vehicle_models`, `maintenance_tasks`, `parts`, `part_refs`, `model_sources`.
  - **Datos de cada usuario** (privados con Row Level Security): `cars`, `service_logs`, `car_tasks`.
- `supabase/migrations/`: el esquema de la base de datos.
- `supabase/seed_suzuki_alto.sql`: el Suzuki Alto 1.0 GL (2009–2014, motor K10B).
- `supabase/seeds/`: Toyota Yaris, Citroën Xsara Picasso y Renault Kangoo, cada uno con sus notas.

`config.js` lleva la URL del proyecto y la clave *publishable*. Esa clave es pública por diseño: la seguridad la ponen las reglas de Row Level Security.

## Añadir un modelo de coche

Se insertan filas en el catálogo; la web no cambia. Usa `supabase/seed_suzuki_alto.sql` como plantilla:

1. Una fila en `vehicle_models` con un `id` corto (por ejemplo `seat-ibiza-6j-12tsi`).
2. Sus tareas en `maintenance_tasks`, con plazo en km y/o meses y de dónde sale (`source_type`):
   - `fabricante`: manual del fabricante.
   - `gemelo`: plan de un coche gemelo con la misma mecánica.
   - `normativa`: obligación legal (ITV).
   - `aproximado`: no hay dato oficial, plazo orientativo.
3. Las piezas en `parts` (con `task_code` si van con una tarea, o `group_name` si son recambios sueltos) y sus referencias en `part_refs`. Marca `confidence` como `confirmado` o `comprobar`.
4. Las fuentes consultadas en `model_sources`.

Se puede ejecutar en el editor SQL de Supabase.

Los modelos grandes están en `supabase/seeds/` (un `.sql` y un `.md` con las fuentes y lo que no se pudo confirmar). Como no caben en una consulta, se cargan desde GitHub con la extensión `http`, comprobando antes el md5 del fichero:

```sql
do $$ declare c text; begin
  select content into c from extensions.http_get('https://raw.githubusercontent.com/rmariscal13/car-maintenance/<commit>/supabase/seeds/<modelo>.sql');
  if md5(c) <> '<md5 del fichero>' then raise exception 'md5 distinto'; end if;
  execute regexp_replace(c, '^(begin|commit);\s*$', '', 'gmi');
end $$;
```

En la web el modelo se elige en tres pasos, como en las tiendas de recambios: **marca** (`make`), **modelo** (`model` + `generation` + años) y **motorización** (`version`, potencia, combustible y `engine_code`). Cada motorización es una fila de `vehicle_models`.

## Ajustar el plan de un coche

Desde *Próximos*, el botón **Ajustar** de cada tarea permite cambiar su plazo (km y/o meses) u ocultarla, y **Añadir un mantenimiento propio** crea tareas con su propia recurrencia. Se guarda en `car_tasks`, una fila por tarea ajustada y por coche; el catálogo no cambia:

- Tarea del catálogo: `interval_km` / `interval_months` a `null` usan el plazo original y `0` deja de contar por esa vía. La web enseña siempre el plazo original junto al cambiado.
- Tarea propia: `custom = true` y `code` empieza por `u_`; sus códigos se anotan en `service_logs.task_codes` igual que los del catálogo. Si ya está en el historial, al borrarla se oculta para no perder su nombre.

## Solicitudes de modelos

Si alguien no encuentra su coche, lo pide desde la pestaña *Mi coche*. Las solicitudes se guardan en `model_requests`: cada persona ve las suyas y los administradores (`app_admins`) ven todas y las marcan como añadidas o descartadas. Para hacer administrador a alguien, en el editor SQL de Supabase:

```sql
insert into app_admins (user_id) select id from auth.users where email = 'tu@correo.com';
```

## Publicación

Cada cambio en `main` se publica solo en GitHub Pages (`.github/workflows/pages.yml`).

Configuración necesaria una sola vez:
- GitHub → *Settings → Pages → Source*: **GitHub Actions**.
- Supabase → *Authentication → URL Configuration*: pon la dirección de GitHub Pages en **Site URL** y en **Redirect URLs**, para que los enlaces de confirmación del email lleven a la web.
