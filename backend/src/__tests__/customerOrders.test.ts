import request from 'supertest';
import app from '../app.js';
import pool from '../database/connection.js';

describe('Customer orders and transaction-safe reservations', () => {
  const suffix = Date.now();
  let salesToken: string;
  let adminToken: string;
  let operatorToken: string;
  let itemId: number;
  let locationId: number;

  beforeAll(async () => {
    salesToken = (await request(app).post('/api/auth/login').send({ username: 'sales', password: 'password123' })).body.token;
    adminToken = (await request(app).post('/api/auth/login').send({ username: 'admin', password: 'password123' })).body.token;
    operatorToken = (await request(app).post('/api/auth/login').send({ username: 'operator', password: 'password123' })).body.token;
    const base = (await pool.query('SELECT item_id,location_id FROM inventory ORDER BY id LIMIT 1')).rows[0];
    itemId = base.item_id;
    locationId = base.location_id;
  });

  const sales = () => ({ Authorization: `Bearer ${salesToken}` });
  async function inventory(batch: string, physical = 100) {
    return (await pool.query('INSERT INTO inventory (item_id,location_id,batch_number,physical_quantity,reserved_quantity) VALUES ($1,$2,$3,$4,0) RETURNING id', [itemId, locationId, batch, physical])).rows[0].id;
  }
  const order = (orderId: string, batchNumber: string, quantity: number) => ({ orderId, items: [{ itemId, locationId, batchNumber, quantity }] });

  it('creates an order and reserves available inventory', async () => {
    const batch = `ORDER-${suffix}`;
    const inventoryId = await inventory(batch);
    const response = await request(app).post('/api/customer-orders').set(sales()).send(order(`CO-${suffix}`, batch, 30));
    expect(response.status).toBe(201);
    expect(response.body.items[0]).toMatchObject({ itemId, quantity: 30, reservedQuantity: 30 });
    const stock = (await pool.query('SELECT physical_quantity,reserved_quantity FROM inventory WHERE id=$1', [inventoryId])).rows[0];
    expect(stock).toMatchObject({ physical_quantity: 100, reserved_quantity: 30 });
  });

  it('allows a reservation exactly equal to available stock', async () => {
    const batch = `EQUAL-${suffix}`;
    const inventoryId = await inventory(batch, 10);
    const response = await request(app).post('/api/customer-orders').set(sales()).send(order(`EQ-${suffix}`, batch, 10));
    expect(response.status).toBe(201);
    const stock = (await pool.query('SELECT reserved_quantity,physical_quantity-reserved_quantity AS available FROM inventory WHERE id=$1', [inventoryId])).rows[0];
    expect(stock).toMatchObject({ reserved_quantity: 10, available: 0 });
  });

  it('rejects excessive, zero, negative, and nonexistent inventory reservations without partial orders', async () => {
    const batch = `FAIL-${suffix}`;
    const inventoryId = await inventory(batch, 10);
    const beforeOrders = Number((await pool.query('SELECT count(*) FROM customer_orders')).rows[0].count);
    expect((await request(app).post('/api/customer-orders').set(sales()).send(order(`TOO-MUCH-${suffix}`, batch, 11))).status).toBe(422);
    expect((await request(app).post('/api/customer-orders').set(sales()).send(order(`ZERO-${suffix}`, batch, 0))).status).toBe(400);
    expect((await request(app).post('/api/customer-orders').set(sales()).send(order(`NEG-${suffix}`, batch, -1))).status).toBe(400);
    expect((await request(app).post('/api/customer-orders').set(sales()).send(order(`MISSING-${suffix}`, `MISSING-${suffix}`, 1))).status).toBe(404);
    expect((await request(app).post('/api/customer-orders').set(sales()).send({ orderId: `BAD-ITEM-${suffix}`, items: [{ itemId: 999999, locationId, batchNumber: batch, quantity: 1 }] })).status).toBe(404);
    expect((await request(app).post('/api/customer-orders').set(sales()).send({ orderId: `BAD-LOCATION-${suffix}`, items: [{ itemId, locationId: 999999, batchNumber: batch, quantity: 1 }] })).status).toBe(404);
    const stock = (await pool.query('SELECT reserved_quantity FROM inventory WHERE id=$1', [inventoryId])).rows[0];
    const afterOrders = Number((await pool.query('SELECT count(*) FROM customer_orders')).rows[0].count);
    expect(stock.reserved_quantity).toBe(0);
    expect(afterOrders).toBe(beforeOrders);
  });

  it('allows adding a reservation to an existing order and rejects operations users', async () => {
    const batch = `ADD-${suffix}`;
    await inventory(batch, 10);
    const created = await request(app).post('/api/customer-orders').set(sales()).send(order(`ADD-ORDER-${suffix}`, batch, 2));
    expect((await request(app).post(`/api/customer-orders/${created.body.id}/reservations`).set(sales()).send({ itemId, locationId, batchNumber: batch, quantity: 3 })).status).toBe(200);
    expect((await request(app).post('/api/customer-orders').set('Authorization', `Bearer ${operatorToken}`).send(order(`NOPE-${suffix}`, batch, 1))).status).toBe(403);
  });

  it('locks the inventory row so concurrent reservations cannot over-reserve', async () => {
    const batch = `CONCURRENT-${suffix}`;
    const inventoryId = await inventory(batch, 100);
    const [first, second] = await Promise.all([
      request(app).post('/api/customer-orders').set(sales()).send(order(`CONCURRENT-A-${suffix}`, batch, 80)),
      request(app).post('/api/customer-orders').set({ Authorization: `Bearer ${adminToken}` }).send(order(`CONCURRENT-B-${suffix}`, batch, 50)),
    ]);
    expect([first.status, second.status].filter((status) => status === 201)).toHaveLength(1);
    expect([first.status, second.status].filter((status) => status === 422)).toHaveLength(1);
    const stock = (await pool.query('SELECT physical_quantity,reserved_quantity,physical_quantity-reserved_quantity AS available FROM inventory WHERE id=$1', [inventoryId])).rows[0];
    expect(stock.reserved_quantity).toBeGreaterThan(0);
    expect(stock.reserved_quantity).toBeLessThanOrEqual(100);
    expect(stock.available).toBeGreaterThanOrEqual(0);
    expect([80, 50]).toContain(stock.reserved_quantity);
  });
});

afterAll(async () => { await pool.end(); });
