-- Tabla para API keys de usuario, cifradas en la aplicación (AES-256-GCM)
-- El valor cifrado es inútil sin KEYS_ENCRYPTION_SECRET (env var de edge functions)
-- RLS: solo el propio usuario puede leer su fila vía API (solo columnas _set)
-- INSERT/UPDATE solo vía service_role (edge function save-api-keys)

create table if not exists public.user_api_keys (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  groq_key_enc      text,    -- AES-256-GCM cifrado, null si no configurada
  anthropic_key_enc text,    -- AES-256-GCM cifrado, null si no configurada
  -- Columnas derivadas: solo indican si la key está configurada (nunca exponen el valor)
  groq_key_set      boolean generated always as (groq_key_enc is not null) stored,
  anthropic_key_set boolean generated always as (anthropic_key_enc is not null) stored,
  updated_at        timestamptz not null default now()
);

alter table public.user_api_keys enable row level security;

-- El usuario autenticado puede leer su propia fila
-- (el valor cifrado es inútil sin el secret del servidor)
create policy "usuario lee sus propias keys" on public.user_api_keys
  for select
  using (auth.uid() = user_id);

-- No hay política INSERT/UPDATE para rol authenticated:
-- solo service_role (edge functions) puede escribir.
-- Esto garantiza que el cifrado siempre pasa por la edge function.
