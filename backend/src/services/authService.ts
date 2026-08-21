import type { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwtUtils.js';
import pool from '../database/connection.js';

export interface User {
  id: number;
  username: string;
  role: string;
}

export async function validateUser(username: string, password: string): Promise<User | null> {
  const result = await pool.query(
    `SELECT u.id, u.username, u.password_hash, r.name AS role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.username = $1`,
    [username]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}

export function generateToken(user: User): string {
  return signToken({
    id: user.id,
    username: user.username,
    role: user.role,
  });
}