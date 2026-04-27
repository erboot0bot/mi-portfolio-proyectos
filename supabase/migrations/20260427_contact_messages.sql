BEGIN;

CREATE TABLE contact_messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL CHECK(length(trim(name)) >= 2),
  email       TEXT        NOT NULL CHECK(email ~* '^[^@]+@[^@]+\.[^@]+$'),
  message     TEXT        NOT NULL CHECK(length(trim(message)) >= 10),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_insert" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_read" ON contact_messages
  FOR SELECT USING (auth.uid() IS NOT NULL);

COMMIT;
