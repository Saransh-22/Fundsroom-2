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
        <nav>
          <Link to="/">Home</Link>
          {user && <span>{user.username} ({user.role})</span>}
          <button type="button" onClick={handleLogout}>Logout</button>
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
