-- supabase/migrations/20260426_fase2_fix_recipe_ingredients_schema.sql
-- La tabla recipe_ingredients fue creada en Fase 1 con product_id como FK a products.
-- La arquitectura de Fase 2 requiere almacenar el nombre del ingrediente directamente
-- (los ingredientes de recetas son texto libre, no necesariamente productos del catálogo).
BEGIN;

DROP TABLE IF EXISTS recipe_ingredients;

CREATE TABLE recipe_ingredients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id  UUID REFERENCES recipes(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  quantity   NUMERIC,
  unit       TEXT DEFAULT '',
  sort_order INT  DEFAULT 0
);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipe_ingredients_via_recipe" ON recipe_ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
        AND is_app_member(recipes.app_id)
    )
  );

COMMIT;
