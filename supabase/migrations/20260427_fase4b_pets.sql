-- supabase/migrations/20260427_fase4b_pets.sql
BEGIN;

CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK(species IN ('perro','gato','pez','conejo','pajaro','reptil','otro')),
  icon TEXT,
  birth_date DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON pets (app_id);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pets_access" ON pets
  FOR ALL USING (is_app_member(app_id));

COMMIT;
