import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../auth/authContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';

interface Transfer {
  id: number;
  transferId: string;
  itemId: number;
  itemName: string;
  sourceLocationId: number;
  sourceLocationName: string;
  destinationLocationId: number;
  destinationLocationName: string;
  quantity: number;
  status: string;
}

const Transfers: React.FC = () => {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [newTransfer, setNewTransfer] = useState({ transferId: '', itemId: 1, sourceLocationId: 1, destinationLocationId: 2, quantity: 1 });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transfers');
      setTransfers(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormError('');
      const payload = {
        transferId: newTransfer.transferId,
        itemId: Number(newTransfer.itemId),
        sourceLocationId: Number(newTransfer.sourceLocationId),
        destinationLocationId: Number(newTransfer.destinationLocationId),
        quantity: Number(newTransfer.quantity)
      };
      await api.post('/transfers', payload);
      setShowForm(false);
      setNewTransfer({ transferId: '', itemId: 1, sourceLocationId: 1, destinationLocationId: 2, quantity: 1 });
      fetchTransfers();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to request transfer');
    }
  };

  const handleDispatch = async (id: number) => {
    try {
      await api.post(`/transfers/${id}/dispatch`);
      fetchTransfers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to dispatch transfer');
    }
  };

  const handleReceive = async (id: number) => {
    try {
      await api.post(`/transfers/${id}/receive`);
      fetchTransfers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to receive transfer');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED': return <Badge variant="warning">Requested</Badge>;
      case 'DISPATCHED': return <Badge variant="info">Dispatched</Badge>;
      case 'RECEIVED': return <Badge variant="success">Received</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
      <div className="text-muted">Loading transfers...</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        {(user?.role === 'ADMIN' || user?.role === 'OPERATIONS_USER') && (
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'primary'}>
            {showForm ? 'Cancel' : 'Request Transfer'}
          </Button>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Internal Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            {formError && <Alert variant="error" className="mb-4">{formError}</Alert>}
            <form onSubmit={handleCreate} className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
              <Input label="Transfer ID" type="text" value={newTransfer.transferId} onChange={e => setNewTransfer({...newTransfer, transferId: e.target.value})} required />
              <Input label="Item ID" type="number" min="1" value={newTransfer.itemId} onChange={e => setNewTransfer({...newTransfer, itemId: parseInt(e.target.value)})} required />
              <Input label="Source Location ID" type="number" min="1" value={newTransfer.sourceLocationId} onChange={e => setNewTransfer({...newTransfer, sourceLocationId: parseInt(e.target.value)})} required />
              <Input label="Dest Location ID" type="number" min="1" value={newTransfer.destinationLocationId} onChange={e => setNewTransfer({...newTransfer, destinationLocationId: parseInt(e.target.value)})} required />
              <Input label="Quantity" type="number" min="1" value={newTransfer.quantity} onChange={e => setNewTransfer({...newTransfer, quantity: parseInt(e.target.value)})} required />
              <Button type="submit">Submit Request</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent style={{ padding: 0 }}>
          {transfers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No transfers found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Transfer #</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {transfers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.transferId}</TableCell>
                    <TableCell>{t.itemName}</TableCell>
                    <TableCell>{t.sourceLocationName}</TableCell>
                    <TableCell>{t.destinationLocationName}</TableCell>
                    <TableCell>{t.quantity}</TableCell>
                    <TableCell>{getStatusBadge(t.status)}</TableCell>
                    <TableCell>
                      {(user?.role === 'ADMIN' || user?.role === 'OPERATIONS_USER') && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {t.status === 'REQUESTED' && (
                            <Button variant="outline" size="sm" onClick={() => handleDispatch(t.id)}>
                              Dispatch
                            </Button>
                          )}
                          {t.status === 'DISPATCHED' && (
                            <Button variant="outline" size="sm" onClick={() => handleReceive(t.id)}>
                              Receive
                            </Button>
                          )}
                        </div>
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

export default Transfers;
