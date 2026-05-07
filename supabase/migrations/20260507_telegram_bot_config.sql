-- ============================================================
-- telegram_bot_config: almacena el token del bot por usuario.
-- El token nunca se expone al cliente — solo service role lo lee.
-- ============================================================
CREATE TABLE IF NOT EXISTS telegram_bot_config (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_token       TEXT NOT NULL,
  bot_username    TEXT NOT NULL,
  webhook_secret  TEXT NOT NULL,
  webhook_registered BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- RLS: el usuario solo puede ver si TIENE bot configurado (no el token)
-- El token solo lo lee el service role (edge functions)
ALTER TABLE telegram_bot_config ENABLE ROW LEVEL SECURITY;

-- El cliente puede saber si tiene bot configurado (bot_username), pero NO ve bot_token ni webhook_secret
CREATE POLICY "bot_config_select" ON telegram_bot_config
  FOR SELECT USING (user_id = auth.uid());

-- INSERT/UPDATE/DELETE solo desde edge functions (service role)
