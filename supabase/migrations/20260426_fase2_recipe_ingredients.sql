-- supabase/migrations/20260426_fase2_recipe_ingredients.sql
BEGIN;

-- Poblar recipe_ingredients desde recipes.ingredients JSONB.
-- Maneja tanto strings simples como objetos {name, quantity, unit}.
-- Idempotente: NO inserta si la receta ya tiene filas normalizadas.
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order)
SELECT
  r.id                                                          AS recipe_id,
  CASE
    WHEN jsonb_typeof(elem) = 'string' THEN (elem #>> '{}')
    ELSE COALESCE(elem ->> 'name', '')
  END                                                           AS name,
  CASE
    WHEN jsonb_typeof(elem) = 'object'
      AND (elem ->> 'quantity') IS NOT NULL
      AND (elem ->> 'quantity') ~ '^\d+(\.\d+)?$'
    THEN (elem ->> 'quantity')::NUMERIC
    ELSE NULL
  END                                                           AS quantity,
  CASE
    WHEN jsonb_typeof(elem) = 'object' THEN COALESCE(elem ->> 'unit', '')
    ELSE ''
  END                                                           AS unit,
  (idx - 1)::INT                                                AS sort_order
FROM recipes r,
  jsonb_array_elements(r.ingredients) WITH ORDINALITY AS t(elem, idx)
WHERE jsonb_typeof(r.ingredients) = 'array'
  AND jsonb_array_length(r.ingredients) > 0
  AND NOT EXISTS (
    SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id
  );

COMMIT;
