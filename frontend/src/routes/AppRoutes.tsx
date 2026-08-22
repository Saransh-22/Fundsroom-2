import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '../auth/authContext';
import Layout from '../components/layout/Layout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Inventory from '../pages/Inventory';
import WorkOrders from '../pages/WorkOrders';
import Transfers from '../pages/Transfers';
import CustomerOrders from '../pages/CustomerOrders';
import { useAuth } from '../auth/authContext';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

const ProtectedLayout = () => (
  <ProtectedRoute>
    <Layout><Outlet /></Layout>
  </ProtectedRoute>
);

const AppRoutes: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Protected routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/work-orders" element={<WorkOrders />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/customer-orders" element={<CustomerOrders />} />
          </Route>
          {/* Redirect to home if path not found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRoutes;
