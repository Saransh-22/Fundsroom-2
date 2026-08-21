-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INTEGER REFERENCES roles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  UNIQUE(name)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  UNIQUE(name)
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES items(id),
  location_id INTEGER NOT NULL REFERENCES locations(id),
  batch_number VARCHAR(100) NOT NULL,
  physical_quantity INTEGER NOT NULL CHECK (physical_quantity >= 0),
  reserved_quantity INTEGER NOT NULL CHECK (reserved_quantity >= 0),
  UNIQUE(item_id, location_id, batch_number),
  CHECK (reserved_quantity <= physical_quantity)
);

-- Work Orders table
CREATE TABLE IF NOT EXISTS work_orders (
  id SERIAL PRIMARY KEY,
  work_order_id VARCHAR(50) UNIQUE NOT NULL,
  location_id INTEGER NOT NULL REFERENCES locations(id),
  item_id INTEGER NOT NULL REFERENCES items(id),
  required_quantity INTEGER NOT NULL CHECK (required_quantity > 0),
  assigned_user_id INTEGER REFERENCES users(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('Assigned', 'In Progress', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Internal Transfers table
CREATE TABLE IF NOT EXISTS internal_transfers (
  id SERIAL PRIMARY KEY,
  transfer_id VARCHAR(50) UNIQUE NOT NULL,
  source_location_id INTEGER NOT NULL REFERENCES locations(id),
  destination_location_id INTEGER NOT NULL REFERENCES locations(id),
  item_id INTEGER NOT NULL REFERENCES items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status VARCHAR(20) NOT NULL CHECK (status IN ('Requested', 'Dispatched', 'Received')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer Orders table
CREATE TABLE IF NOT EXISTS customer_orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  sales_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer Order Items table
CREATE TABLE IF NOT EXISTS customer_order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES customer_orders(id),
  item_id INTEGER NOT NULL REFERENCES items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reserved_quantity INTEGER NOT NULL CHECK (reserved_quantity >= 0),
  UNIQUE(order_id, item_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_item_location ON inventory(item_id, location_id);
CREATE INDEX IF NOT EXISTS idx_work_order_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_internal_transfer_status ON internal_transfers(status);
CREATE INDEX IF NOT EXISTS idx_customer_order_user ON customer_orders(sales_user_id);
