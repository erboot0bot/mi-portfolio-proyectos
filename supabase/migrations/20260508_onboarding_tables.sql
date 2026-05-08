-- supabase/migrations/20260508_onboarding_tables.sql
BEGIN;

-- Estado del onboarding conversacional (Telegram)
CREATE TABLE IF NOT EXISTS user_onboarding_state (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  step         TEXT NOT NULL DEFAULT 'vivienda_tipo',
  data         JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_onboarding_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_onboarding_state" ON user_onboarding_state
  FOR ALL USING (auth.uid() = user_id);

-- Dismissals del banner web
CREATE TABLE IF NOT EXISTS user_onboarding_dismissals (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step    TEXT NOT NULL,
  PRIMARY KEY (user_id, step)
);

ALTER TABLE user_onboarding_dismissals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_dismissals" ON user_onboarding_dismissals
  FOR ALL USING (auth.uid() = user_id);

COMMIT;
