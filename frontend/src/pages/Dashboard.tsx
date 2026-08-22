import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Package, ClipboardList, ArrowRightLeft, ShoppingCart, TrendingUp } from 'lucide-react';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalInventoryItems: 0,
    availableStock: 0,
    openWorkOrders: 0,
    pendingTransfers: 0,
    recentOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch data from existing endpoints silently to compute stats
        // We catch errors per endpoint because a user might not have role access to all
        let inventory = [];
        let workOrders = [];
        let transfers = [];
        let orders = [];
        
        try { const res = await api.get('/inventory'); inventory = res.data; } catch (e) {}
        try { const res = await api.get('/work-orders'); workOrders = res.data; } catch (e) {}
        try { const res = await api.get('/transfers'); transfers = res.data; } catch (e) {}
        try { const res = await api.get('/customer-orders'); orders = res.data; } catch (e) {}

        setStats({
          totalInventoryItems: inventory.length,
          availableStock: inventory.reduce((acc: number, item: any) => acc + item.availableQuantity, 0),
          openWorkOrders: workOrders.filter((wo: any) => wo.status !== 'COMPLETED').length,
          pendingTransfers: transfers.filter((t: any) => t.status === 'REQUESTED').length,
          recentOrders: orders.length,
        });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, subtitle }: any) => (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-muted font-medium">{title}</span>
          <div style={{ color: 'var(--primary)' }}>{icon}</div>
        </div>
        <div>
          <div style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1 }}>
            {loading ? '...' : value}
          </div>
          <div className="text-muted" style={{ fontSize: '13px', marginTop: '8px' }}>
            {subtitle}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatCard 
          title="Available Stock" 
          value={stats.availableStock} 
          subtitle="Total units available for sale or use"
          icon={<Package size={24} />} 
        />
        <StatCard 
          title="Open Work Orders" 
          value={stats.openWorkOrders} 
          subtitle="Assigned and in-progress tasks"
          icon={<ClipboardList size={24} />} 
        />
        <StatCard 
          title="Pending Transfers" 
          value={stats.pendingTransfers} 
          subtitle="Awaiting dispatch or receipt"
          icon={<ArrowRightLeft size={24} />} 
        />
        <StatCard 
          title="Customer Orders" 
          value={stats.recentOrders} 
          subtitle="Total customer orders tracked"
          icon={<ShoppingCart size={24} />} 
        />
      </div>

      <Card>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '18px', margin: 0, fontWeight: 600 }}>System Overview</h3>
          <p className="text-muted" style={{ margin: 0, fontSize: '14px', marginTop: '4px' }}>
            You are logged into the Mini Operations ERP system. Use the sidebar to navigate to your specific operational areas based on your role assignments.
          </p>
        </div>
        <div style={{ padding: '24px', backgroundColor: 'var(--surface-secondary)', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
             <TrendingUp size={24} />
             <span>All systems operational</span>
           </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
