import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '../auth/authContext';
import Layout from '../components/layout';
import Login from '../pages/Login';
// We'll add other pages later as we build them
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
            <Route path="/" element={<><h2>Welcome to the ERP</h2><p>This is the home page. More screens will be added in later phases.</p></>} />
            {/* Placeholder for other protected routes */}
          </Route>
          {/* Redirect to home if path not found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRoutes;
