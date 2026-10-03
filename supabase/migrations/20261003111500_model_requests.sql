-- Solicitudes de modelos: quien no encuentra su coche lo pide desde la web
-- y los administradores las revisan para ir añadiendo modelos al catálogo.

create table app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table app_admins enable row level security;
create policy "saber si soy admin" on app_admins for select using (user_id = (select auth.uid()));

-- Con security invoker basta: la regla de app_admins deja a cada uno ver solo su propia fila
create function is_admin() returns boolean
  language sql stable security invoker set search_path = public
  as $$ select exists (select 1 from app_admins where user_id = auth.uid()) $$;

create table model_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  make        text not null check (char_length(make) between 1 and 40),
  model       text not null check (char_length(model) between 1 and 60),
  year        int  not null check (year between 1950 and 2100),
  engine      text check (char_length(engine) <= 80),
  fuel        text check (fuel in ('gasolina','diesel','hibrido','hibrido_enchufable','electrico','glp','gnc')),
  notes       text check (char_length(notes) <= 500),
  status      text not null default 'pendiente' check (status in ('pendiente','hecho','descartado')),
  model_id    text references vehicle_models(id) on delete set null,  -- modelo del catálogo que la resuelve
  admin_note  text,
  created_at  timestamptz not null default now()
);
create index on model_requests (user_id);
create index on model_requests (status);
alter table model_requests enable row level security;

-- Cada persona crea sus solicitudes (máximo 10 pendientes) y ve las suyas; los admins ven y gestionan todas
create policy "pedir modelo" on model_requests for insert
  with check (user_id = (select auth.uid()) and status = 'pendiente' and model_id is null and admin_note is null
    and (select count(*) from model_requests r where r.user_id = (select auth.uid()) and r.status = 'pendiente') < 10);
create policy "ver solicitudes" on model_requests for select
  using (user_id = (select auth.uid()) or (select is_admin()));
create policy "gestionar solicitudes" on model_requests for update
  using ((select is_admin())) with check ((select is_admin()));
create policy "borrar solicitudes" on model_requests for delete
  using ((user_id = (select auth.uid()) and status = 'pendiente') or (select is_admin()));
