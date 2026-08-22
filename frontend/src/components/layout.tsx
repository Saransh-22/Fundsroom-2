import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Mini Operations ERP</h1>
        <nav style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          <Link to="/">Dashboard</Link>
          <Link to="/inventory">Inventory</Link>
          <Link to="/work-orders">Work Orders</Link>
          <Link to="/transfers">Transfers</Link>
          <Link to="/customer-orders">Customer Orders</Link>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px', alignItems: 'center' }}>
            {user && <span><strong>{user.username}</strong> ({user.role})</span>}
            <button type="button" onClick={handleLogout}>Logout</button>
          </div>
        </nav>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <p>&copy; 2026 Mini Operations ERP</p>
      </footer>
    </div>
  );
};

export default Layout;
