import app from './app.js';
import { Pool } from 'pg';
import pool from './database/connection.js';

const PORT = process.env.PORT || 3000;

// Test database connection on startup
async function testConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});