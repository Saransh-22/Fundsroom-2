import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as controller from '../controllers/customerOrderController.js';

const router = Router();
const auth = [authenticate, authorize(['ADMIN', 'SALES_USER'])];
router.get('/customer-orders', ...auth, controller.list);
router.get('/customer-orders/:id', ...auth, controller.get);
router.post('/customer-orders', ...auth, controller.create);
router.post('/customer-orders/:id/reservations', ...auth, controller.reserve);
export default router;
