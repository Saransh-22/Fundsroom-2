import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as controller from '../controllers/customerOrderController.js';

const router = Router();
router.use(authenticate, authorize(['ADMIN', 'SALES_USER']));
router.get('/customer-orders', controller.list);
router.get('/customer-orders/:id', controller.get);
router.post('/customer-orders', controller.create);
router.post('/customer-orders/:id/reservations', controller.reserve);
export default router;
