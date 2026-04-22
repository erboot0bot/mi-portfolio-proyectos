-- Shopping improvements: checked_at, price_unit, purchase_history
ALTER TABLE shopping_items
  ADD COLUMN IF NOT EXISTS checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS price_unit numeric(10,2);

CREATE TABLE IF NOT EXISTS purchase_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  store text NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  items jsonb NOT NULL,
  item_count int,
  total_price numeric(10,2),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "own purchases" ON purchase_history
  USING (auth.uid() = user_id);
