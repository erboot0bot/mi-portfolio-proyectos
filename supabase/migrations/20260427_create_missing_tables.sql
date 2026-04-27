-- supabase/migrations/20260427_create_missing_tables.sql
-- Crea las tablas que el código espera pero que nunca se crearon
-- (la migración big_bang nunca se ejecutó; la tabla base sigue llamándose "projects")
BEGIN;

-- ══════════════════════════════════════════════════════
-- HELPER RLS (no depende de "apps", usa "projects")
-- ══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION user_owns_project(p_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM projects WHERE id = p_id AND owner_id = auth.uid())
$$;

-- ══════════════════════════════════════════════════════
-- 1. EVENTS  (Calendar + Limpieza)
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  event_type    TEXT NOT NULL DEFAULT 'task',
  title         TEXT NOT NULL,
  description   TEXT,
  color         TEXT,
  all_day       BOOLEAN NOT NULL DEFAULT false,
  start_time    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time      TIMESTAMPTZ,
  recurrence    TEXT DEFAULT 'none',
  recurrence_end DATE,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS events_app_id_idx ON events (app_id);
CREATE INDEX IF NOT EXISTS events_type_idx   ON events (event_type);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_owner" ON events
  FOR ALL USING (user_owns_project(app_id));

-- ══════════════════════════════════════════════════════
-- 2. PRODUCTS  (catálogo global)
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  purchase_unit     TEXT DEFAULT 'unidad',
  purchase_quantity INT  DEFAULT 1,
  category          TEXT,
  metadata          JSONB DEFAULT '{}'
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_auth" ON products
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ══════════════════════════════════════════════════════
-- 3. ITEMS  (ShoppingList)
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  module      TEXT NOT NULL,
  type        TEXT DEFAULT 'generic',
  title       TEXT NOT NULL,
  description TEXT,
  visibility  TEXT DEFAULT 'shared' CHECK(visibility IN ('shared','private')),
  owner_id    UUID REFERENCES auth.users(id),
  metadata    JSONB DEFAULT '{}',
  checked     BOOLEAN DEFAULT false,
  checked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS items_app_module_idx ON items (app_id, module);
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items_owner" ON items
  FOR ALL USING (user_owns_project(app_id));

-- ══════════════════════════════════════════════════════
-- 4. PRODUCT_CONSUMPTION  (ShoppingList — predicciones)
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS product_consumption (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id                UUID REFERENCES products(id) ON DELETE CASCADE,
  app_id                    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  last_purchase_date        DATE,
  avg_days_between_purchases INT,
  estimated_next_purchase   DATE,
  confidence                TEXT DEFAULT 'baja' CHECK(confidence IN ('alta','media','baja')),
  updated_at                TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, app_id)
);
ALTER TABLE product_consumption ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consumption_owner" ON product_consumption
  FOR ALL USING (user_owns_project(app_id));

-- ══════════════════════════════════════════════════════
-- 5. PURCHASE_HISTORY  (ShoppingList — historial compras)
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS purchase_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id),
  store      TEXT,
  items      JSONB NOT NULL DEFAULT '[]',
  item_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history_owner" ON purchase_history
  FOR ALL USING (user_id = auth.uid());

-- ══════════════════════════════════════════════════════
-- 6. INVENTORY  (Inventario)
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS inventory (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  current_stock NUMERIC DEFAULT 0,
  min_stock     NUMERIC DEFAULT 0,
  unit          TEXT DEFAULT 'unidad',
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, app_id)
);
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory_owner" ON inventory
  FOR ALL USING (user_owns_project(app_id));

-- ══════════════════════════════════════════════════════
-- 7. PETS  (Mascotas)
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS pets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  species    TEXT NOT NULL CHECK(species IN ('perro','gato','pez','conejo','pajaro','reptil','otro')),
  icon       TEXT,
  birth_date DATE,
  notes      TEXT,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS pets_app_id_idx ON pets (app_id);
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pets_owner" ON pets
  FOR ALL USING (user_owns_project(app_id));

COMMIT;
