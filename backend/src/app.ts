import type { Request, Response } from 'express';
import express from 'express';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { authenticate } from './middleware/authenticate.js';
import { authorize } from './middleware/authorize.js';
import operationsRoutes from './routes/operationsRoutes.js';
import customerOrderRoutes from './routes/customerOrderRoutes.js';

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

const app: express.Application = express();

// Middleware
app.use(express.json());

// Health route (no authentication required)
app.use('/api', healthRoutes);

// Authentication routes (no authentication required)
app.use('/api/auth', authRoutes);

// Example protected route (for testing)
app.get('/api/protected', authenticate, (req: AuthRequest, res: Response) => {
  res.status(200).json({ message: 'This is a protected route', user: req.user });
});

// Test routes for role-based access control
app.get('/api/test-admin', authenticate, authorize(['ADMIN']), (req: AuthRequest, res: Response) => {
  res.status(200).json({ message: 'Admin access granted' });
});

app.get('/api/test-operator', authenticate, authorize(['OPERATIONS_USER']), (req: AuthRequest, res: Response) => {
  res.status(200).json({ message: 'Operator access granted' });
});

app.get('/api/test-sales', authenticate, authorize(['SALES_USER']), (req: AuthRequest, res: Response) => {
  res.status(200).json({ message: 'Sales access granted' });
});

app.use('/api', customerOrderRoutes);
app.use('/api', (req, res, next) => { console.log('Entering operationsRoutes with URL:', req.url); next(); }, operationsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;
