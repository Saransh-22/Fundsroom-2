import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import pool from './connection.js';

async function seedDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Truncate tables to start fresh
    await client.query(`
      TRUNCATE TABLE
        customer_order_items,
        customer_orders,
        internal_transfers,
        work_orders,
        inventory,
        items,
        categories,
        locations,
        users,
        roles
      RESTART IDENTITY CASCADE;
    `);

    // Insert roles
    await client.query(
      `INSERT INTO roles (name) VALUES ('ADMIN'), ('OPERATIONS_USER'), ('SALES_USER')`
    );

    // Insert locations
    await client.query(
      `INSERT INTO locations (name, address) VALUES
       ('Location A', '123 Main St'),
       ('Location B', '456 Oak Ave')`
    );

    // Insert categories
    await client.query(
      `INSERT INTO categories (name) VALUES
       ('Electronics'),
       ('Office Supplies'),
       ('Hardware')`
    );

    // Insert items
    await client.query(
      `INSERT INTO items (sku, name, description, category_id) VALUES
       ('LAPTOP001', 'Laptop', 'High performance laptop', (SELECT id FROM categories WHERE name = 'Electronics')),
       ('MOUSE001', 'Mouse', 'Wireless mouse', (SELECT id FROM categories WHERE name = 'Electronics')),
       ('KEYBOARD001', 'Keyboard', 'Mechanical keyboard', (SELECT id FROM categories WHERE name = 'Electronics')),
       ('PAPER001', 'Printer Paper', 'A4 paper, 500 sheets', (SELECT id FROM categories WHERE name = 'Office Supplies')),
       ('PEN001', 'Ballpoint Pen', 'Blue ink pen', (SELECT id FROM categories WHERE name = 'Office Supplies')),
       ('SCREWDRIVER001', 'Screwdriver Set', 'Set of screwdrivers', (SELECT id FROM categories WHERE name = 'Hardware'))`
    );

    // Insert inventory
    await client.query(
      `INSERT INTO inventory (item_id, location_id, batch_number, physical_quantity, reserved_quantity) VALUES
       -- Laptop at Location A
       ((SELECT id FROM items WHERE sku = 'LAPTOP001'), (SELECT id FROM locations WHERE name = 'Location A'), 'BATCH001', 100, 0),
       ((SELECT id FROM items WHERE sku = 'LAPTOP001'), (SELECT id FROM locations WHERE name = 'Location B'), 'BATCH002', 50, 0),
       -- Mouse at Location A
       ((SELECT id FROM items WHERE sku = 'MOUSE001'), (SELECT id FROM locations WHERE name = 'Location A'), 'BATCH003', 200, 0),
       ((SELECT id FROM items WHERE sku = 'MOUSE001'), (SELECT id FROM locations WHERE name = 'Location B'), 'BATCH004', 100, 0),
       -- Keyboard at Location A
       ((SELECT id FROM items WHERE sku = 'KEYBOARD001'), (SELECT id FROM locations WHERE name = 'Location A'), 'BATCH005', 150, 0),
       ((SELECT id FROM items WHERE sku = 'KEYBOARD001'), (SELECT id FROM locations WHERE name = 'Location B'), 'BATCH006', 75, 0),
       -- Paper at Location A
       ((SELECT id FROM items WHERE sku = 'PAPER001'), (SELECT id FROM locations WHERE name = 'Location A'), 'BATCH007', 500, 0),
       ((SELECT id FROM items WHERE sku = 'PAPER001'), (SELECT id FROM locations WHERE name = 'Location B'), 'BATCH008', 300, 0),
       -- Pen at Location A
       ((SELECT id FROM items WHERE sku = 'PEN001'), (SELECT id FROM locations WHERE name = 'Location A'), 'BATCH009', 1000, 0),
       ((SELECT id FROM items WHERE sku = 'PEN001'), (SELECT id FROM locations WHERE name = 'Location B'), 'BATCH010', 500, 0),
       -- Screwdriver at Location A
       ((SELECT id FROM items WHERE sku = 'SCREWDRIVER001'), (SELECT id FROM locations WHERE name = 'Location A'), 'BATCH011', 100, 0),
       ((SELECT id FROM items WHERE sku = 'SCREWDRIVER001'), (SELECT id FROM locations WHERE name = 'Location B'), 'BATCH012', 50, 0)`
    );

    // Insert users
    const password = await bcrypt.hash('password123', 10);
    await client.query(
      `INSERT INTO users (username, email, password_hash, role_id) VALUES
       ('admin', 'admin@example.com', $1, (SELECT id FROM roles WHERE name = 'ADMIN')),
       ('operator', 'operator@example.com', $1, (SELECT id FROM roles WHERE name = 'OPERATIONS_USER')),
       ('sales', 'sales@example.com', $1, (SELECT id FROM roles WHERE name = 'SALES_USER'))`,
      [password]
    );

    await client.query('COMMIT');
    console.log('Database seeded successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
}

const isDirectCall = import.meta.url === `file://${process.argv[1]}`;
if (isDirectCall) {
  seedDatabase()
    .then(() => {
      console.log('Seeding finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;