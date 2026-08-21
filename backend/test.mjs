import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
});

const res = await pool.query('SELECT 1');
console.log('Query result:', res.rows);
await pool.end();