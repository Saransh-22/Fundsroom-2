import type { PoolClient } from 'pg';
import pool from '../database/connection.js';
import { HttpError } from '../utils/httpError.js';

type Actor = { id: number };
type Reservation = { itemId: number; locationId: number; quantity: number; batchNumber?: string };

const orderSelect = `SELECT o.id,o.order_id AS "orderId",o.sales_user_id AS "salesUserId",u.username AS "salesUser",o.created_at AS "createdAt",
  COALESCE(json_agg(json_build_object('id',oi.id,'itemId',oi.item_id,'itemName',it.name,'quantity',oi.quantity,'reservedQuantity',oi.reserved_quantity,'reservations',COALESCE(r.reservations,'[]'::json)) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL),'[]'::json) AS items
  FROM customer_orders o JOIN users u ON u.id=o.sales_user_id LEFT JOIN customer_order_items oi ON oi.order_id=o.id LEFT JOIN items it ON it.id=oi.item_id
  LEFT JOIN LATERAL (SELECT json_agg(json_build_object('id',sr.id,'inventoryId',sr.inventory_id,'locationId',i.location_id,'batchNumber',i.batch_number,'quantity',sr.quantity) ORDER BY sr.id) AS reservations FROM stock_reservations sr JOIN inventory i ON i.id=sr.inventory_id WHERE sr.order_item_id=oi.id) r ON true`;

export async function listCustomerOrders() {
  return (await pool.query(`${orderSelect} GROUP BY o.id,u.username ORDER BY o.id`)).rows;
}
export async function getCustomerOrder(id: number) {
  const result = await pool.query(`${orderSelect} WHERE o.id=$1 GROUP BY o.id,u.username`, [id]);
  if (!result.rowCount) throw new HttpError(404, 'Customer order not found');
  return result.rows[0];
}

async function reserve(client: PoolClient, orderId: number, reservation: Reservation, actor: Actor) {
  const inventoryResult = await client.query(
    `SELECT * FROM inventory WHERE item_id=$1 AND location_id=$2 ${reservation.batchNumber ? 'AND batch_number=$3' : ''} ORDER BY id LIMIT 1 FOR UPDATE`,
    reservation.batchNumber ? [reservation.itemId, reservation.locationId, reservation.batchNumber] : [reservation.itemId, reservation.locationId],
  );
  if (!inventoryResult.rowCount) throw new HttpError(404, 'Inventory not found for item and location');
  const inventory = inventoryResult.rows[0];
  const available = inventory.physical_quantity - inventory.reserved_quantity;
  if (reservation.quantity > available) throw new HttpError(422, 'Insufficient available inventory');

  let orderItem = (await client.query('SELECT * FROM customer_order_items WHERE order_id=$1 AND item_id=$2 FOR UPDATE', [orderId, reservation.itemId])).rows[0];
  if (!orderItem) {
    orderItem = (await client.query('INSERT INTO customer_order_items (order_id,item_id,quantity,reserved_quantity) VALUES ($1,$2,$3,$3) RETURNING *', [orderId, reservation.itemId, reservation.quantity])).rows[0];
  } else {
    await client.query('UPDATE customer_order_items SET quantity=quantity+$1,reserved_quantity=reserved_quantity+$1 WHERE id=$2', [reservation.quantity, orderItem.id]);
  }
  await client.query('UPDATE inventory SET reserved_quantity=reserved_quantity+$1 WHERE id=$2', [reservation.quantity, inventory.id]);
  await client.query('INSERT INTO stock_reservations (order_item_id,inventory_id,quantity,created_by_user_id) VALUES ($1,$2,$3,$4) ON CONFLICT (order_item_id,inventory_id) DO UPDATE SET quantity=stock_reservations.quantity + EXCLUDED.quantity', [orderItem.id, inventory.id, reservation.quantity, actor.id]);
}

export async function createCustomerOrder(data: { orderId: string; items: Reservation[] }, actor: Actor) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const order = (await client.query('INSERT INTO customer_orders (order_id,sales_user_id) VALUES ($1,$2) RETURNING id', [data.orderId, actor.id])).rows[0];
    for (const item of data.items) await reserve(client, order.id, item, actor);
    await client.query('COMMIT');
    return await getCustomerOrder(order.id);
  } catch (error: any) {
    await client.query('ROLLBACK');
    if (error?.code === '23505') throw new HttpError(409, 'Duplicate customer order');
    throw error;
  } finally { client.release(); }
}

export async function addReservation(orderId: number, data: Reservation, actor: Actor) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const order = await client.query('SELECT id FROM customer_orders WHERE id=$1 FOR UPDATE', [orderId]);
    if (!order.rowCount) throw new HttpError(404, 'Customer order not found');
    await reserve(client, orderId, data, actor);
    await client.query('COMMIT');
    return await getCustomerOrder(orderId);
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
