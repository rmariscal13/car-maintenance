-- Catálogo de mantenimiento de coches + datos de cada usuario
-- Catálogo: lo lee cualquiera, solo se escribe con la clave de servicio.
-- Datos de usuario: cada persona ve y edita solo lo suyo (Row Level Security).

create table vehicle_models (
  id            text primary key,              -- p. ej. 'suzuki-alto-gf-10'
  make          text not null,                 -- Suzuki
  model         text not null,                 -- Alto
  generation    text,                          -- GF (AMF310)
  version       text,                          -- 1.0 GL
  year_from     int,
  year_to       int,
  engine_code   text,                          -- K10B
  engine_desc   text,
  fuel          text,
  power_kw      int,
  specs         jsonb not null default '[]',   -- [["Motor","K10B..."], ...]
  created_at    timestamptz not null default now()
);

create table model_sources (
  id        bigint generated always as identity primary key,
  model_id  text not null references vehicle_models(id) on delete cascade,
  title     text not null,
  url       text
);

-- Tareas de mantenimiento periódico
create table maintenance_tasks (
  id              bigint generated always as identity primary key,
  model_id        text not null references vehicle_models(id) on delete cascade,
  code            text not null,               -- 'aceite', 'bujias'...
  name            text not null,
  action          text not null,               -- Cambiar / Revisar / Pasar
  interval_km     int,
  interval_months int,
  special         text,                        -- 'itv' = regla especial
  info_only       boolean not null default false,
  source_type     text not null check (source_type in ('fabricante','gemelo','normativa','aproximado')),
  source_label    text,                        -- 'Plazo Suzuki', 'Plazo Nissan Pixo'...
  why             text,
  sort            int not null default 0,
  unique (model_id, code)
);

-- Piezas: las de una tarea (task_code) o recambios sueltos (group_name)
create table parts (
  id          bigint generated always as identity primary key,
  model_id    text not null references vehicle_models(id) on delete cascade,
  task_code   text,                            -- null si es un recambio suelto
  group_name  text,                            -- 'Bombillas', 'Visibilidad'...
  name        text not null,
  spec        text,                            -- 'H4 60/55W'
  confidence  text not null default 'confirmado' check (confidence in ('confirmado','comprobar')),
  store_url   text,                            -- página de la tienda filtrada por el modelo
  condition   text,                            -- p. ej. 'sin_aire' para variantes
  note        text,
  sort        int not null default 0
);

create table part_refs (
  id        bigint generated always as identity primary key,
  part_id   bigint not null references parts(id) on delete cascade,
  brand     text not null,
  reference text not null
);

-- Datos de usuario
create table cars (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  model_id    text not null references vehicle_models(id),
  name        text,
  plate       text,
  first_reg   date,
  km_now      int,
  km_date     date,
  has_ac      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table service_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  car_id      uuid not null references cars(id) on delete cascade,
  done_on     date not null,
  km          int not null,
  task_codes  text[] not null,                 -- incluye 'otro' para trabajos fuera del plan
  other       text,
  cost        numeric(10,2),
  place       text,
  notes       text,
  created_at  timestamptz not null default now()
);

create index on maintenance_tasks (model_id);
create index on parts (model_id);
create index on part_refs (part_id);
create index on cars (user_id);
create index on service_logs (car_id);

-- Seguridad
alter table vehicle_models    enable row level security;
alter table model_sources     enable row level security;
alter table maintenance_tasks enable row level security;
alter table parts             enable row level security;
alter table part_refs         enable row level security;
alter table cars              enable row level security;
alter table service_logs      enable row level security;

create policy "catalogo publico" on vehicle_models    for select using (true);
create policy "catalogo publico" on model_sources     for select using (true);
create policy "catalogo publico" on maintenance_tasks for select using (true);
create policy "catalogo publico" on parts             for select using (true);
create policy "catalogo publico" on part_refs         for select using (true);

create policy "mis coches" on cars for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "mi historial" on service_logs for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and exists (select 1 from cars c where c.id = car_id and c.user_id = (select auth.uid())));
