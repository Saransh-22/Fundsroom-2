import type { Request, Response } from 'express';
import { loginSchema } from '../validators/authValidator.js';
import { validateUser, generateToken } from '../services/authService.js';

export async function login(req: Request, res: Response) {
  // Validate input
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid input', details: parseResult.error.issues });
  }

  const { username, password } = parseResult.data;

  try {
    const user = await validateUser(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    // Do not send password hash in response
    res.status(200).json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}