import request from 'supertest';
import app from '../app.js';
import pool from '../database/connection.js';

describe('Phase 2 operations', () => {
  let adminToken: string;
  let salesToken: string;
  let itemId: number;
  let sourceLocationId: number;
  let destinationLocationId: number;
  let transferId: number;
  const suffix = Date.now();

  beforeAll(async () => {
    adminToken = (await request(app).post('/api/auth/login').send({ username: 'admin', password: 'password123' })).body.token;
    salesToken = (await request(app).post('/api/auth/login').send({ username: 'sales', password: 'password123' })).body.token;
    const inventory = (await request(app).get('/api/inventory').set('Authorization', `Bearer ${adminToken}`)).body;
    itemId = inventory[0].itemId;
    sourceLocationId = inventory[0].locationId;
    destinationLocationId = inventory.find((row: any) => row.locationId !== sourceLocationId).locationId;
  });

  const admin = () => ({ Authorization: `Bearer ${adminToken}` });

  it('creates inventory and exposes available quantity', async () => {
    const response = await request(app).post('/api/inventory').set(admin()).send({ itemId, locationId: sourceLocationId, batchNumber: `TEST-${suffix}`, physicalQuantity: 10, reservedQuantity: 3 });
    expect(response.status).toBe(201);
    expect(response.body.availableQuantity).toBe(7);
  });

  it('rejects invalid inventory quantities and reservations over physical stock', async () => {
    const invalid = await request(app).post('/api/inventory').set(admin()).send({ itemId, locationId: sourceLocationId, batchNumber: `NEG-${suffix}`, physicalQuantity: -1, reservedQuantity: 0 });
    expect(invalid.status).toBe(400);
    const excessive = await request(app).post('/api/inventory').set(admin()).send({ itemId, locationId: sourceLocationId, batchNumber: `RES-${suffix}`, physicalQuantity: 2, reservedQuantity: 3 });
    expect(excessive.status).toBe(400);
  });

  it('prevents updates that would make inventory negative or reserved over physical', async () => {
    const created = await request(app).post('/api/inventory').set(admin()).send({ itemId, locationId: sourceLocationId, batchNumber: `UPDATE-${suffix}`, physicalQuantity: 4, reservedQuantity: 2 });
    const response = await request(app).patch(`/api/inventory/${created.body.id}`).set(admin()).send({ physicalQuantity: 1 });
    expect(response.status).toBe(422);
  });

  it('calculates a work order shortage and rejects invalid transitions', async () => {
    const created = await request(app).post('/api/work-orders').set(admin()).send({ workOrderId: `WO-${suffix}`, itemId, locationId: sourceLocationId, requiredQuantity: 100000 });
    expect(created.status).toBe(201);
    expect(created.body.shortage).toBeGreaterThan(0);
    const invalid = await request(app).patch(`/api/work-orders/${created.body.id}/status`).set(admin()).send({ status: 'COMPLETED' });
    expect(invalid.status).toBe(409);
  });

  it('rejects unauthorized operations and transfers exceeding available stock', async () => {
    const unauthorized = await request(app).post('/api/transfers').set('Authorization', `Bearer ${salesToken}`).send({ transferId: `NO-${suffix}`, sourceLocationId, destinationLocationId, itemId, quantity: 1 });
    expect(unauthorized.status).toBe(403);
    const excessive = await request(app).post('/api/transfers').set(admin()).send({ transferId: `BIG-${suffix}`, sourceLocationId, destinationLocationId, itemId, quantity: 1000000 });
    expect(excessive.status).toBe(201);
    const dispatch = await request(app).post(`/api/transfers/${excessive.body.id}/dispatch`).set(admin());
    expect(dispatch.status).toBe(422);
  });

  it('dispatches and receives stock only once with the required location effects', async () => {
    const sourceBefore = (await request(app).get('/api/inventory').set(admin())).body.find((row: any) => row.itemId === itemId && row.locationId === sourceLocationId).physicalQuantity;
    const destinationBefore = (await request(app).get('/api/inventory').set(admin())).body.find((row: any) => row.itemId === itemId && row.locationId === destinationLocationId).physicalQuantity;
    const created = await request(app).post('/api/transfers').set(admin()).send({ transferId: `TR-${suffix}`, sourceLocationId, destinationLocationId, itemId, quantity: 5 });
    transferId = created.body.id;
    expect((await request(app).post(`/api/transfers/${transferId}/receive`).set(admin())).status).toBe(409);
    expect((await request(app).post(`/api/transfers/${transferId}/dispatch`).set(admin())).status).toBe(200);
    expect((await request(app).post(`/api/transfers/${transferId}/dispatch`).set(admin())).status).toBe(409);
    const sourceAfterDispatch = (await request(app).get('/api/inventory').set(admin())).body.find((row: any) => row.itemId === itemId && row.locationId === sourceLocationId).physicalQuantity;
    const destinationAfterDispatch = (await request(app).get('/api/inventory').set(admin())).body.find((row: any) => row.itemId === itemId && row.locationId === destinationLocationId).physicalQuantity;
    expect(sourceAfterDispatch).toBe(sourceBefore - 5);
    expect(destinationAfterDispatch).toBe(destinationBefore);
    expect((await request(app).post(`/api/transfers/${transferId}/receive`).set(admin())).status).toBe(200);
    const destinationAfterReceipt = (await request(app).get('/api/inventory').set(admin())).body.find((row: any) => row.itemId === itemId && row.locationId === destinationLocationId).physicalQuantity;
    expect(destinationAfterReceipt).toBe(destinationBefore + 5);
    expect((await request(app).post(`/api/transfers/${transferId}/receive`).set(admin())).status).toBe(409);
  });
});

afterAll(async () => { await pool.end(); });
