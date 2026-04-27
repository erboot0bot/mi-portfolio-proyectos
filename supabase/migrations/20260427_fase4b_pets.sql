-- supabase/migrations/20260427_fase4b_pets.sql
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK(species IN ('perro','gato','pez','conejo','pajaro','reptil','otro')),
  icon TEXT,
  birth_date DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pets_access" ON pets
  USING (
    app_id IN (
      SELECT id FROM apps WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid() AND accepted = true
    )
  );
