import request from 'supertest';
import app from '../app.js';
import pool from '../database/connection.js';

describe('Authentication and Authorization', () => {
  // Test health endpoint
  it('should return OK for health endpoint', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  // Test login with valid credentials
  it('should login successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toMatchObject({
      id: 1,
      username: 'admin',
      role: 'ADMIN',
    });
  });

  // Test login with invalid credentials
  it('should fail login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'incorrect-password' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  // Test protected endpoint without token
  it('should reject missing JWT', async () => {
    const response = await request(app).get('/api/protected');
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  // Test protected endpoint with invalid token
  it('should reject invalid JWT', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalidtoken');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  // Test protected endpoint with valid token (admin)
  it('should allow access to protected endpoint with valid token', async () => {
    // First, login to get a token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' });

    const token = loginResponse.body.token;

    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'This is a protected route');
    expect(response.body.user).toMatchObject({
      id: 1,
      username: 'admin',
      role: 'ADMIN',
    });
  });

  // Test role middleware: admin can access admin route
  it('should allow admin to access admin route', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' });

    const token = loginResponse.body.token;

    const response = await request(app)
      .get('/api/test-admin')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Admin access granted');
  });

  // Test role middleware: operator cannot access admin route
  it('should prevent operator from accessing admin route', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'operator', password: 'password123' });

    const token = loginResponse.body.token;

    const response = await request(app)
      .get('/api/test-admin')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Insufficient permissions');
  });

  // Test role middleware: sales can access sales route
  it('should allow sales to access sales route', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'sales', password: 'password123' });

    const token = loginResponse.body.token;

    const response = await request(app)
      .get('/api/test-sales')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Sales access granted');
  });

  // Test role middleware: admin cannot access sales route
  it('should prevent admin from accessing sales route', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' });

    const token = loginResponse.body.token;

    const response = await request(app)
      .get('/api/test-sales')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Insufficient permissions');
  });
});

afterAll(async () => {
  await pool.end();
});
