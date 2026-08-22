import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../auth/authContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';

interface Reservation {
  id: number;
  locationId: number;
  locationName: string;
  itemId: number;
  itemName: string;
  quantity: number;
}

interface CustomerOrder {
  id: number;
  orderId: string;
  customerId: number;
  customerName: string;
  status: string;
  reservations: Reservation[];
}

const CustomerOrders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [newOrder, setNewOrder] = useState({ orderId: '', customerId: 1 });
  const [orderFormError, setOrderFormError] = useState('');

  const [activeReservationOrderId, setActiveReservationOrderId] = useState<number | null>(null);
  const [newReservation, setNewReservation] = useState({ locationId: 1, itemId: 1, quantity: 1 });
  const [reservationError, setReservationError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customer-orders');
      setOrders(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch customer orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setOrderFormError('');
      const payload = {
        orderId: newOrder.orderId,
        customerId: Number(newOrder.customerId)
      };
      await api.post('/customer-orders', payload);
      setShowOrderForm(false);
      setNewOrder({ orderId: '', customerId: 1 });
      fetchOrders();
    } catch (err: any) {
      setOrderFormError(err.response?.data?.error || 'Failed to create order');
    }
  };

  const handleCreateReservation = async (e: React.FormEvent, orderDbId: number) => {
    e.preventDefault();
    try {
      setReservationError('');
      const payload = {
        locationId: Number(newReservation.locationId),
        itemId: Number(newReservation.itemId),
        quantity: Number(newReservation.quantity)
      };
      await api.post(`/customer-orders/${orderDbId}/reservations`, payload);
      setActiveReservationOrderId(null);
      setNewReservation({ locationId: 1, itemId: 1, quantity: 1 });
      fetchOrders();
    } catch (err: any) {
      // The concurrency / insufficient stock logic hits here from the backend transaction block
      setReservationError(err.response?.data?.error || 'Failed to reserve stock');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="default">Draft</Badge>;
      case 'PARTIAL_RESERVED': return <Badge variant="warning">Partial Reserved</Badge>;
      case 'FULL_RESERVED': return <Badge variant="success">Fully Reserved</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
      <div className="text-muted">Loading customer orders...</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        {(user?.role === 'ADMIN' || user?.role === 'SALES_USER') && (
          <Button onClick={() => setShowOrderForm(!showOrderForm)} variant={showOrderForm ? 'outline' : 'primary'}>
            {showOrderForm ? 'Cancel' : 'Create Customer Order'}
          </Button>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {showOrderForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Customer Order</CardTitle>
          </CardHeader>
          <CardContent>
            {orderFormError && <Alert variant="error" className="mb-4">{orderFormError}</Alert>}
            <form onSubmit={handleCreateOrder} className="flex flex-wrap gap-4 items-end">
              <Input label="Order ID (Reference)" type="text" value={newOrder.orderId} onChange={e => setNewOrder({...newOrder, orderId: e.target.value})} required className="flex-1" />
              <Input label="Customer ID" type="number" min="1" value={newOrder.customerId} onChange={e => setNewOrder({...newOrder, customerId: parseInt(e.target.value)})} required className="flex-1" />
              <Button type="submit">Create Order</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {orders.length === 0 ? (
        <Card>
          <CardContent>
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No customer orders found.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map(order => (
            <Card key={order.id}>
              <div className="flex justify-between items-center p-6 border-b border-[var(--border)] bg-[var(--surface-secondary)]">
                <div>
                  <h3 className="font-bold text-lg m-0">Order: {order.orderId}</h3>
                  <div className="text-sm text-muted mt-1">Customer: {order.customerName} (ID: {order.customerId})</div>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold m-0">Reservations</h4>
                  {(user?.role === 'ADMIN' || user?.role === 'SALES_USER') && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setActiveReservationOrderId(activeReservationOrderId === order.id ? null : order.id);
                        setReservationError('');
                      }}
                    >
                      {activeReservationOrderId === order.id ? 'Cancel Reservation' : 'Add Reservation'}
                    </Button>
                  )}
                </div>

                {activeReservationOrderId === order.id && (
                  <div className="mb-6 p-4 bg-[var(--surface-secondary)] rounded-[var(--border-radius-sm)] border border-[var(--border)]">
                    <h5 className="font-semibold text-sm mb-3">Reserve Stock</h5>
                    {reservationError && <Alert variant="error" className="mb-4">{reservationError}</Alert>}
                    <form onSubmit={(e) => handleCreateReservation(e, order.id)} className="flex flex-wrap gap-4 items-end">
                      <Input label="Location ID" type="number" min="1" value={newReservation.locationId} onChange={e => setNewReservation({...newReservation, locationId: parseInt(e.target.value)})} required className="flex-1" />
                      <Input label="Item ID" type="number" min="1" value={newReservation.itemId} onChange={e => setNewReservation({...newReservation, itemId: parseInt(e.target.value)})} required className="flex-1" />
                      <Input label="Quantity" type="number" min="1" value={newReservation.quantity} onChange={e => setNewReservation({...newReservation, quantity: parseInt(e.target.value)})} required className="flex-1" />
                      <Button type="submit">Reserve</Button>
                    </form>
                  </div>
                )}

                {(!order.reservations || order.reservations.length === 0) ? (
                  <div className="text-muted text-sm text-center p-4 bg-[var(--surface-secondary)] rounded border border-[var(--border)]">
                    No reservations have been made for this order yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHead>Location</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity Reserved</TableHead>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {order.reservations.map(res => (
                        <TableRow key={res.id}>
                          <TableCell>{res.locationName}</TableCell>
                          <TableCell>{res.itemName}</TableCell>
                          <TableCell className="font-medium text-success">{res.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
