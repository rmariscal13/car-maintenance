#!/bin/sh
# Se ejecuta una sola vez, al crear la base de datos vacía.
# Crea los roles que esperan GoTrue y PostgREST, igual que en Supabase.
set -eu

psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
  -v auth_pw="$AUTH_DB_PASSWORD" -v authn_pw="$AUTHENTICATOR_PASSWORD" <<'SQL'
-- Roles de la API (los mismos nombres que en Supabase, para que las reglas RLS sirvan tal cual)
create role anon          nologin noinherit;
create role authenticated nologin noinherit;
create role service_role  nologin noinherit bypassrls;
create role authenticator login noinherit password :'authn_pw';
grant anon, authenticated, service_role to authenticator;

-- GoTrue crea y mantiene el esquema auth con este usuario
create role supabase_auth_admin login noinherit createrole password :'auth_pw';
create schema auth authorization supabase_auth_admin;
grant create on database postgres to supabase_auth_admin;
alter role supabase_auth_admin set search_path = auth;
grant usage on schema auth to anon, authenticated, service_role;

-- Permisos del esquema public como en Supabase: todo para los roles de la API,
-- y las reglas de Row Level Security deciden qué filas ve cada uno.
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
SQL
