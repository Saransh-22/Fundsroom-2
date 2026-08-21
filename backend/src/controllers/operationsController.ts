import type { Request, Response } from 'express';
import * as service from '../services/operationsService.js';
import { inventorySchema, inventoryUpdateSchema, transferSchema, workOrderSchema, workOrderStatusSchema } from '../validators/operationsValidators.js';
import { HttpError } from '../utils/httpError.js';

type AuthRequest = Request & { user?: { id: number } };
const id = (value: string) => { const parsed=Number(value); if(!Number.isInteger(parsed)||parsed<1) throw new HttpError(400,'Invalid identifier'); return parsed; };
const body = <T>(schema:any, input:unknown):T => { const parsed=schema.safeParse(input); if(!parsed.success) throw new HttpError(400,parsed.error.issues.map((issue:any)=>issue.message).join(', ')); return parsed.data; };
async function execute(res:Response, fn:()=>Promise<unknown>, status=200) { try { res.status(status).json(await fn()); } catch(error:any) { if(error instanceof HttpError) res.status(error.statusCode).json({error:error.message}); else if(error?.code==='23503') res.status(422).json({error:'Referenced record does not exist'}); else if(error?.code==='23505') res.status(409).json({error:'Duplicate record'}); else { console.error(error); res.status(500).json({error:'Internal server error'}); } } }
export const getInventory=(req:Request,res:Response)=>execute(res,()=>service.listInventory());
export const postInventory=(req:AuthRequest,res:Response)=>execute(res,()=>service.createInventory(body(inventorySchema,req.body),req.user!),201);
export const patchInventory=(req:AuthRequest,res:Response)=>execute(res,()=>service.updateInventory(id(String(req.params.id)),body(inventoryUpdateSchema,req.body),req.user!));
export const getWorkOrders=(req:Request,res:Response)=>execute(res,()=>service.listWorkOrders());
export const postWorkOrder=(req:Request,res:Response)=>execute(res,()=>service.createWorkOrder(body(workOrderSchema,req.body)),201);
export const patchWorkOrder=(req:Request,res:Response)=>execute(res,()=>service.updateWorkOrderStatus(id(String(req.params.id)),body<any>(workOrderStatusSchema,req.body).status));
export const getTransfers=(req:Request,res:Response)=>execute(res,()=>service.listTransfers());
export const postTransfer=(req:Request,res:Response)=>execute(res,()=>service.createTransfer(body(transferSchema,req.body)),201);
export const dispatch=(req:AuthRequest,res:Response)=>execute(res,()=>service.dispatchTransfer(id(String(req.params.id)),req.user!));
export const receive=(req:AuthRequest,res:Response)=>execute(res,()=>service.receiveTransfer(id(String(req.params.id)),req.user!));
