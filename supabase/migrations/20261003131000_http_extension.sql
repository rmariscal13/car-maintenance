-- Para cargar el catálogo desde los ficheros de supabase/seeds publicados en GitHub
-- (los ficheros son demasiado grandes para pegarlos en una sola consulta).
create extension if not exists http with schema extensions;
