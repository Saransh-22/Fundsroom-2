CREATE TABLE IF NOT EXISTS inventory_movements (
  id SERIAL PRIMARY KEY,
  inventory_id INTEGER REFERENCES inventory(id),
  item_id INTEGER NOT NULL REFERENCES items(id),
  location_id INTEGER NOT NULL REFERENCES locations(id),
  batch_number VARCHAR(100) NOT NULL,
  movement_type VARCHAR(10) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT')),
  quantity INTEGER NOT NULL CHECK (quantity <> 0),
  reference_type VARCHAR(50) NOT NULL,
  reference_id INTEGER,
  created_by_user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_inventory ON inventory_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_reference ON inventory_movements(reference_type, reference_id);

UPDATE work_orders
SET status = CASE status
  WHEN 'Assigned' THEN 'ASSIGNED'
  WHEN 'In Progress' THEN 'IN_PROGRESS'
  WHEN 'Completed' THEN 'COMPLETED'
  ELSE status
END;

ALTER TABLE work_orders DROP CONSTRAINT IF EXISTS work_orders_status_check;
ALTER TABLE work_orders ADD CONSTRAINT work_orders_status_check
  CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED'));

UPDATE internal_transfers
SET status = UPPER(status);

ALTER TABLE internal_transfers DROP CONSTRAINT IF EXISTS internal_transfers_status_check;
ALTER TABLE internal_transfers ADD CONSTRAINT internal_transfers_status_check
  CHECK (status IN ('REQUESTED', 'DISPATCHED', 'RECEIVED'));

ALTER TABLE internal_transfers DROP CONSTRAINT IF EXISTS internal_transfers_different_locations_check;
ALTER TABLE internal_transfers ADD CONSTRAINT internal_transfers_different_locations_check
  CHECK (source_location_id <> destination_location_id);
