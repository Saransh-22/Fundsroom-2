import { z } from 'zod';

const positiveInteger = z.number().int().positive();

export const inventorySchema = z.object({ itemId: positiveInteger, locationId: positiveInteger, batchNumber: z.string().min(1).max(100), physicalQuantity: z.number().int().nonnegative(), reservedQuantity: z.number().int().nonnegative().default(0) }).refine((data) => data.reservedQuantity <= data.physicalQuantity, { message: 'Reserved quantity cannot exceed physical quantity', path: ['reservedQuantity'] });
export const inventoryUpdateSchema = z.object({ physicalQuantity: z.number().int().nonnegative().optional(), reservedQuantity: z.number().int().nonnegative().optional() }).refine((data) => data.physicalQuantity !== undefined || data.reservedQuantity !== undefined, 'At least one quantity is required');
export const workOrderSchema = z.object({ workOrderId: z.string().min(1).max(50), locationId: positiveInteger, itemId: positiveInteger, requiredQuantity: positiveInteger, assignedUserId: positiveInteger.optional() });
export const workOrderStatusSchema = z.object({ status: z.enum(['ASSIGNED', 'IN_PROGRESS', 'COMPLETED']) });
export const transferSchema = z.object({ transferId: z.string().min(1).max(50), sourceLocationId: positiveInteger, destinationLocationId: positiveInteger, itemId: positiveInteger, quantity: positiveInteger }).refine((data) => data.sourceLocationId !== data.destinationLocationId, { message: 'Source and destination locations must differ', path: ['destinationLocationId'] });
