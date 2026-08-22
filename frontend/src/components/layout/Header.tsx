import React from 'react';
import { Menu, UserCircle } from 'lucide-react';
import { useAuth } from '../../auth/authContext';
import { useLocation } from 'react-router-dom';

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return { title: 'Dashboard', subtitle: 'Overview of your operations' };
      case '/inventory': return { title: 'Inventory', subtitle: 'Manage stock across locations' };
      case '/work-orders': return { title: 'Work Orders', subtitle: 'Track and manage active work orders' };
      case '/transfers': return { title: 'Internal Transfers', subtitle: 'Move stock between locations' };
      case '/customer-orders': return { title: 'Customer Orders', subtitle: 'Manage sales and reservations' };
      default: return { title: 'Mini Operations ERP', subtitle: '' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={onMenuClick}
          className="mobile-menu-btn"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'none',
          }}
        >
          <Menu size={24} />
        </button>
        <style>{`
          @media (max-width: 768px) {
            .mobile-menu-btn { display: block !important; }
          }
        `}</style>
        
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, lineHeight: 1.2 }}>{pageInfo.title}</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>{pageInfo.subtitle}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right', display: 'none' }} className="user-info">
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{user.username}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.role.replace('_', ' ')}</div>
            </div>
            <style>{`
              @media (min-width: 640px) {
                .user-info { display: block !important; }
              }
            `}</style>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <UserCircle size={24} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
