import { z } from 'zod';

const positiveInteger = z.number().int().positive();
export const reservationSchema = z.object({
  itemId: positiveInteger,
  locationId: positiveInteger,
  quantity: positiveInteger,
  batchNumber: z.string().min(1).max(100).optional(),
});
export const customerOrderSchema = z.object({
  orderId: z.string().min(1).max(50),
  items: z.array(reservationSchema).min(1),
});
