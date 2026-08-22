import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../auth/authContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';

interface WorkOrder {
  id: number;
  workOrderId: string;
  locationId: number;
  locationName: string;
  itemId: number;
  itemName: string;
  requiredQuantity: number;
  availableQuantity: number;
  shortage: number;
  assignedUserId: number | null;
  assignedUser: string | null;
  status: string;
}

const WorkOrders: React.FC = () => {
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [newOrder, setNewOrder] = useState({ workOrderId: '', locationId: 1, itemId: 1, requiredQuantity: 1 });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/work-orders');
      setWorkOrders(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch work orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormError('');
      const payload = {
        workOrderId: newOrder.workOrderId,
        locationId: Number(newOrder.locationId),
        itemId: Number(newOrder.itemId),
        requiredQuantity: Number(newOrder.requiredQuantity)
      };
      await api.post('/work-orders', payload);
      setShowForm(false);
      setNewOrder({ workOrderId: '', locationId: 1, itemId: 1, requiredQuantity: 1 });
      fetchWorkOrders();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create work order');
    }
  };

  const handleStatusChange = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'ASSIGNED' ? 'IN_PROGRESS' : currentStatus === 'IN_PROGRESS' ? 'COMPLETED' : null;
    if (!nextStatus) return;
    
    try {
      await api.patch(`/work-orders/${id}/status`, { status: nextStatus });
      fetchWorkOrders();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return <Badge variant="default">Assigned</Badge>;
      case 'IN_PROGRESS': return <Badge variant="info">In Progress</Badge>;
      case 'COMPLETED': return <Badge variant="success">Completed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
      <div className="text-muted">Loading work orders...</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        {(user?.role === 'ADMIN' || user?.role === 'OPERATIONS_USER') && (
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'primary'}>
            {showForm ? 'Cancel' : 'Create Work Order'}
          </Button>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Work Order</CardTitle>
          </CardHeader>
          <CardContent>
            {formError && <Alert variant="error" className="mb-4">{formError}</Alert>}
            <form onSubmit={handleCreate} className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
              <Input label="Work Order ID" type="text" value={newOrder.workOrderId} onChange={e => setNewOrder({...newOrder, workOrderId: e.target.value})} required />
              <Input label="Location ID" type="number" min="1" value={newOrder.locationId} onChange={e => setNewOrder({...newOrder, locationId: parseInt(e.target.value)})} required />
              <Input label="Item ID" type="number" min="1" value={newOrder.itemId} onChange={e => setNewOrder({...newOrder, itemId: parseInt(e.target.value)})} required />
              <Input label="Required Qty" type="number" min="1" value={newOrder.requiredQuantity} onChange={e => setNewOrder({...newOrder, requiredQuantity: parseInt(e.target.value)})} required />
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent style={{ padding: 0 }}>
          {workOrders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No work orders found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Order #</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Shortage</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {workOrders.map((wo) => (
                  <TableRow key={wo.id}>
                    <TableCell className="font-medium">{wo.workOrderId}</TableCell>
                    <TableCell>{wo.locationName}</TableCell>
                    <TableCell>{wo.itemName}</TableCell>
                    <TableCell>{wo.requiredQuantity}</TableCell>
                    <TableCell>{wo.availableQuantity}</TableCell>
                    <TableCell>
                      {wo.shortage > 0 ? (
                        <span className="text-danger font-bold">{wo.shortage}</span>
                      ) : (
                        <span className="text-success font-bold">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted">{wo.assignedUser || 'Unassigned'}</TableCell>
                    <TableCell>{getStatusBadge(wo.status)}</TableCell>
                    <TableCell>
                      {(user?.role === 'ADMIN' || user?.role === 'OPERATIONS_USER') && wo.status !== 'COMPLETED' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusChange(wo.id, wo.status)}
                        >
                          {wo.status === 'ASSIGNED' ? 'Start' : 'Complete'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkOrders;
