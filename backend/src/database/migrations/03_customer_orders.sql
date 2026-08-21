CREATE TABLE IF NOT EXISTS stock_reservations (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER NOT NULL REFERENCES customer_order_items(id) ON DELETE CASCADE,
  inventory_id INTEGER NOT NULL REFERENCES inventory(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_by_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(order_item_id, inventory_id)
);

CREATE INDEX IF NOT EXISTS idx_stock_reservations_inventory ON stock_reservations(inventory_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_order_item ON stock_reservations(order_item_id);
