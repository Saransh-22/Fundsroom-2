import type { Request, Response } from 'express';
import * as service from '../services/customerOrderService.js';
import { customerOrderSchema, reservationSchema } from '../validators/customerOrderValidators.js';
import { HttpError } from '../utils/httpError.js';

type AuthRequest = Request & { user?: { id: number } };
const parseId = (value: string | string[] | undefined) => { const id = Number(value); if (!Number.isInteger(id) || id < 1) throw new HttpError(400, 'Invalid identifier'); return id; };
const parse = (schema: any, input: unknown) => { const result = schema.safeParse(input); if (!result.success) throw new HttpError(400, result.error.issues.map((issue: any) => issue.message).join(', ')); return result.data; };
async function execute(res: Response, fn: () => Promise<unknown>, status = 200) { try { res.status(status).json(await fn()); } catch (error: any) { if (error instanceof HttpError) res.status(error.statusCode).json({ error: error.message }); else if (error?.code === '23503') res.status(422).json({ error: 'Referenced record does not exist' }); else { console.error(error); res.status(500).json({ error: 'Internal server error' }); } } }
export const list = (_req: Request, res: Response) => execute(res, () => service.listCustomerOrders());
export const get = (req: Request, res: Response) => execute(res, () => service.getCustomerOrder(parseId(req.params.id)));
export const create = (req: AuthRequest, res: Response) => execute(res, () => service.createCustomerOrder(parse(customerOrderSchema, req.body), req.user!), 201);
export const reserve = (req: AuthRequest, res: Response) => execute(res, () => service.addReservation(parseId(req.params.id), parse(reservationSchema, req.body), req.user!));
