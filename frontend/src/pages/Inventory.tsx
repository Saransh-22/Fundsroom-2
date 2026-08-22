import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Alert } from '../components/ui/Alert';

interface InventoryItem {
  id: number;
  itemId: number;
  itemName: string;
  sku: string;
  locationId: number;
  locationName: string;
  batchNumber: string;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inventory');
      setInventory(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
      <div className="text-muted">Loading inventory data...</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {error && <Alert variant="error">{error}</Alert>}

      <Card>
        <CardContent style={{ padding: 0 }}>
          {inventory.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No inventory records found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Physical Qty</TableHead>
                  <TableHead>Reserved Qty</TableHead>
                  <TableHead>Available Qty</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.itemName}</TableCell>
                    <TableCell className="text-muted">{item.sku}</TableCell>
                    <TableCell>{item.locationName}</TableCell>
                    <TableCell><span style={{ fontFamily: 'monospace', fontSize: '13px' }}>{item.batchNumber}</span></TableCell>
                    <TableCell>{item.physicalQuantity}</TableCell>
                    <TableCell className="text-warning">{item.reservedQuantity > 0 ? item.reservedQuantity : '-'}</TableCell>
                    <TableCell>
                      <span className="font-bold" style={{ color: item.availableQuantity > 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {item.availableQuantity}
                      </span>
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

export default Inventory;
