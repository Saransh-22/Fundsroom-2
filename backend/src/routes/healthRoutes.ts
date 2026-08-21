import type { Request, Response } from 'express';
import { Router } from 'express';
import { Pool } from 'pg';
import pool from '../database/connection.js';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'ERROR', error: 'Database connection failed' });
  }
});

export default router;