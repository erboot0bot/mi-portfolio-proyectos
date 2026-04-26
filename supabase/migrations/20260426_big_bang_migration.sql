-- supabase/migrations/20260426_big_bang_migration.sql
BEGIN;

-- ══════════════════════════════════════════════════════
-- 1. RENOMBRAR projects → apps
-- ══════════════════════════════════════════════════════
ALTER TABLE projects RENAME TO apps;
ALTER TABLE apps ADD COLUMN type TEXT DEFAULT 'hogar'
  CHECK(type IN ('hogar','personal','vehiculo','finanzas','mascotas'));
UPDATE apps SET type = 'hogar';

-- ══════════════════════════════════════════════════════
-- 2. MIGRAR calendar_tasks → events
-- ══════════════════════════════════════════════════════
ALTER TABLE calendar_tasks RENAME COLUMN project_id TO app_id;
ALTER TABLE calendar_tasks ADD COLUMN event_type TEXT DEFAULT 'task';
ALTER TABLE calendar_tasks ADD COLUMN item_id UUID;
ALTER TABLE calendar_tasks ADD COLUMN metadata JSONB DEFAULT '{}';
UPDATE calendar_tasks SET event_type = 'task';
ALTER TABLE calendar_tasks RENAME TO events;

-- ══════════════════════════════════════════════════════
-- 3. CREAR tabla items (absorberá shopping_items)
-- ══════════════════════════════════════════════════════
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  type TEXT DEFAULT 'generic',
  title TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'shared' CHECK(visibility IN ('shared','private')),
  owner_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  checked BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════
-- 4. MIGRAR shopping_items → items
-- ══════════════════════════════════════════════════════
INSERT INTO items (id, app_id, module, type, title, metadata, checked, checked_at, created_at)
SELECT
  id,
  project_id,
  'supermercado',
  'product',
  name,
  jsonb_build_object(
    'quantity',   quantity,
    'unit',       COALESCE(unit, ''),
    'category',   COALESCE(category, 'otros'),
    'store',      COALESCE(store, 'General'),
    'price_unit', price_unit
  ),
  checked,
  checked_at,
  created_at
FROM shopping_items;

-- ══════════════════════════════════════════════════════
-- 5. MIGRAR menu_items → events (event_type = 'meal')
-- ══════════════════════════════════════════════════════
INSERT INTO events (
  id, app_id, event_type, title, start_time, all_day, metadata, created_at
)
SELECT
  id,
  project_id,
  'meal',
  COALESCE(custom_name, '(comida)'),
  (week_start::date + (day_of_week || ' days')::interval +
    CASE meal_type
      WHEN 'desayuno' THEN interval '8 hours'
      WHEN 'almuerzo' THEN interval '11 hours'
      WHEN 'comida'   THEN interval '14 hours'
      WHEN 'cena'     THEN interval '21 hours'
      ELSE interval '12 hours'
    END
  ),
  false,
  jsonb_build_object(
    'meal_type',   meal_type,
    'recipe_id',   recipe_id,
    'day_of_week', day_of_week,
    'week_start',  week_start::text,
    'custom_name', custom_name
  ),
  created_at
FROM menu_items;

-- ══════════════════════════════════════════════════════
-- 6. ACTUALIZAR project_id → app_id en recipes y project_members
-- ══════════════════════════════════════════════════════
ALTER TABLE recipes RENAME COLUMN project_id TO app_id;
ALTER TABLE project_members RENAME COLUMN project_id TO app_id;

-- ══════════════════════════════════════════════════════
-- 7. CREAR NUEVAS TABLAS (Fase 2+)
-- ══════════════════════════════════════════════════════
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  purchase_unit TEXT DEFAULT 'unidad',
  purchase_quantity INT DEFAULT 1,
  category TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  quantity INT DEFAULT 0,
  remaining_units INT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, app_id)
);

CREATE TABLE product_consumption (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  last_purchase_date DATE,
  avg_days_between_purchases INT,
  estimated_next_purchase DATE,
  confidence TEXT DEFAULT 'baja' CHECK(confidence IN ('alta','media','baja')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, app_id)
);

CREATE TABLE recipe_ingredients (
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  PRIMARY KEY (recipe_id, product_id)
);

CREATE TABLE diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════
-- 8. HABILITAR RLS EN NUEVAS TABLAS
-- ══════════════════════════════════════════════════════
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════
-- 9. FUNCIÓN HELPER PARA RLS
-- ══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION is_app_member(p_app_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM apps WHERE id = p_app_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM project_members
    WHERE app_id = p_app_id AND user_id = auth.uid() AND accepted = true
  )
$$;

-- ══════════════════════════════════════════════════════
-- 10. POLÍTICAS RLS ACTUALIZADAS
-- ══════════════════════════════════════════════════════

-- apps
DROP POLICY IF EXISTS "project_owner" ON apps;
DROP POLICY IF EXISTS "project_member_read" ON apps;
CREATE POLICY "apps_owner" ON apps
  FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "apps_member_read" ON apps
  FOR SELECT USING (
    id IN (SELECT app_id FROM project_members WHERE user_id = auth.uid() AND accepted = true)
  );

-- events (era calendar_tasks)
DROP POLICY IF EXISTS "tasks_by_project_member" ON events;
CREATE POLICY "events_by_app_member" ON events
  FOR ALL USING (is_app_member(app_id));

-- items (nuevo)
CREATE POLICY "items_by_app_member" ON items
  FOR ALL USING (is_app_member(app_id));

-- recipes
DROP POLICY IF EXISTS "recipes_by_member" ON recipes;
CREATE POLICY "recipes_by_app_member" ON recipes
  FOR ALL USING (is_app_member(app_id));

-- products (catálogo global, accesible por todos los usuarios autenticados)
CREATE POLICY "products_authenticated" ON products
  FOR ALL USING (auth.uid() IS NOT NULL);

-- inventory
CREATE POLICY "inventory_by_app_member" ON inventory
  FOR ALL USING (is_app_member(app_id));

-- product_consumption
CREATE POLICY "consumption_by_app_member" ON product_consumption
  FOR ALL USING (is_app_member(app_id));

-- recipe_ingredients
CREATE POLICY "recipe_ingredients_via_recipe" ON recipe_ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
        AND is_app_member(recipes.app_id)
    )
  );

-- diet_plans
CREATE POLICY "diet_plans_by_app_member" ON diet_plans
  FOR ALL USING (is_app_member(app_id));

-- project_members (actualizar política que referenciaba projects.project_id)
DROP POLICY IF EXISTS "members_by_owner" ON project_members;
CREATE POLICY "members_by_owner" ON project_members
  FOR ALL USING (
    app_id IN (
      SELECT id FROM apps WHERE owner_id = auth.uid()
    )
  );
-- "members_read_own" no referencia la columna renombrada, no necesita cambio

-- ══════════════════════════════════════════════════════
-- 11. ELIMINAR TABLAS ANTIGUAS
-- ══════════════════════════════════════════════════════
DROP TABLE IF EXISTS shopping_items;
DROP TABLE IF EXISTS menu_items;

COMMIT;
