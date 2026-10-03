-- Ajustes del plan de cada coche, hechos por su dueño. No tocan el catálogo.
-- Una fila por tarea ajustada:
--   · Tarea del catálogo (custom = false, code = maintenance_tasks.code): ocultarla o cambiar su plazo.
--     interval_km / interval_months: null = el plazo del catálogo; 0 = no se cuenta por km / por tiempo.
--   · Tarea propia (custom = true, code = 'u_…'): nombre, qué hacer y plazo los pone el usuario.
create table car_tasks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  car_id          uuid not null references cars(id) on delete cascade,
  code            text not null check (char_length(code) between 1 and 40),
  custom          boolean not null default false,
  name            text check (char_length(name) <= 80),
  action          text check (char_length(action) <= 40),
  hidden          boolean not null default false,
  interval_km     int check (interval_km between 0 and 1000000),
  interval_months int check (interval_months between 0 and 600),
  notes           text check (char_length(notes) <= 500),
  updated_at      timestamptz not null default now(),
  unique (car_id, code),
  check (not custom or (code like 'u\_%' and name is not null and char_length(name) >= 1)),
  check (custom or code not like 'u\_%')
);
create index on car_tasks (user_id);
alter table car_tasks enable row level security;

create policy "mis ajustes" on car_tasks for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and exists (select 1 from cars c where c.id = car_id and c.user_id = (select auth.uid())));
