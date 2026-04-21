-- Add store column to shopping_items
ALTER TABLE shopping_items
ADD COLUMN IF NOT EXISTS store TEXT DEFAULT 'General';

-- Expand meal_type CHECK constraint on menu_items
ALTER TABLE menu_items
DROP CONSTRAINT IF EXISTS menu_items_meal_type_check;
ALTER TABLE menu_items
ADD CONSTRAINT menu_items_meal_type_check
CHECK (meal_type IN ('breakfast','lunch','dinner','snack','almuerzo','comida','cena','desayuno'));
