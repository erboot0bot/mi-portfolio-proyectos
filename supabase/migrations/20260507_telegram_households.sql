-- ============================================================
-- 1. HOUSEHOLDS (para fase 2 — se crea ahora, UI después)
-- ============================================================
CREATE TABLE IF NOT EXISTS households (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. HOUSEHOLD MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS household_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (household_id, user_id)
);

-- ============================================================
-- 3. TELEGRAM LINK CODES (código de un solo uso, expira 10 min)
-- ============================================================
CREATE TABLE IF NOT EXISTS telegram_link_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telegram_link_codes_code
  ON telegram_link_codes(code)
  WHERE used = FALSE;

-- ============================================================
-- 4. USER TELEGRAM LINKS (vínculo persistente)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_telegram_links (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_id         BIGINT NOT NULL UNIQUE,
  telegram_username   TEXT,
  telegram_first_name TEXT,
  linked_at           TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. ALTER items — campos Telegram + household
-- ============================================================
ALTER TABLE items
  ADD COLUMN IF NOT EXISTS household_id      UUID REFERENCES households(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS source            TEXT DEFAULT 'web' CHECK (source IN ('web', 'telegram')),
  ADD COLUMN IF NOT EXISTS added_by_telegram BIGINT;

-- NOTE: ON DELETE CASCADE on household_id means items are deleted when a household is deleted.
-- This is intentional for Phase 1; Phase 2 may reconsider SET NULL to preserve items.

-- ============================================================
-- 6. FUNCIÓN limpieza automática de códigos expirados
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_link_codes()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM telegram_link_codes
  WHERE expires_at < now() AND used = FALSE;
$$;

-- To schedule automatic cleanup every 10 minutes (requires pg_cron extension enabled in Supabase):
-- SELECT cron.schedule('cleanup-link-codes', '*/10 * * * *', 'SELECT cleanup_expired_link_codes()');

-- ============================================================
-- RLS — HOUSEHOLDS
-- ============================================================
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "households_select" ON households
  FOR SELECT USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM household_members
      WHERE household_id = households.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "households_insert" ON households
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "households_update" ON households
  FOR UPDATE USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "households_delete" ON households
  FOR DELETE USING (created_by = auth.uid());

-- ============================================================
-- RLS — HOUSEHOLD MEMBERS
-- ============================================================
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hm_select" ON household_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM household_members hm2
      WHERE hm2.household_id = household_members.household_id
        AND hm2.user_id = auth.uid()
    )
  );

-- NOTE: New members are added by the Telegram bot via service role (bypasses RLS).
-- The NOT EXISTS branch handles the first admin member (creator bootstrapping).
-- Client-side invite acceptance is Phase 2 and will require a redesigned policy.
CREATE POLICY "hm_insert" ON household_members
  FOR INSERT WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM household_members
      WHERE household_id = household_members.household_id
    )
    OR EXISTS (
      SELECT 1 FROM household_members AS hm_admin
      WHERE hm_admin.household_id = household_members.household_id
        AND hm_admin.user_id = auth.uid()
        AND hm_admin.role = 'admin'
    )
  );

CREATE POLICY "hm_delete" ON household_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM household_members AS hm_admin
      WHERE hm_admin.household_id = household_members.household_id
        AND hm_admin.user_id = auth.uid()
        AND hm_admin.role = 'admin'
    )
  );

-- ============================================================
-- RLS — USER TELEGRAM LINKS
-- Solo el propio usuario ve/elimina su vínculo.
-- INSERT/UPDATE solo desde Edge Functions (service role).
-- ============================================================
ALTER TABLE user_telegram_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tg_links_select" ON user_telegram_links
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "tg_links_delete" ON user_telegram_links
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- RLS — TELEGRAM LINK CODES
-- ============================================================
ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- INSERT is allowed from authenticated JWT (user generates their own codes).
-- UPDATE (flipping used=TRUE) is done only by the bot via service role, so no UPDATE policy needed.
CREATE POLICY "tg_codes_select" ON telegram_link_codes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "tg_codes_insert" ON telegram_link_codes
  FOR INSERT WITH CHECK (user_id = auth.uid());
