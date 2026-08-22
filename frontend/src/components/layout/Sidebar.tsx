import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, ArrowRightLeft, ShoppingCart, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/authContext';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'OPERATIONS_USER', 'SALES_USER'] },
    { name: 'Inventory', path: '/inventory', icon: <Package size={20} />, roles: ['ADMIN', 'OPERATIONS_USER'] },
    { name: 'Work Orders', path: '/work-orders', icon: <ClipboardList size={20} />, roles: ['ADMIN', 'OPERATIONS_USER'] },
    { name: 'Transfers', path: '/transfers', icon: <ArrowRightLeft size={20} />, roles: ['ADMIN', 'OPERATIONS_USER'] },
    { name: 'Customer Orders', path: '/customer-orders', icon: <ShoppingCart size={20} />, roles: ['ADMIN', 'SALES_USER'] },
  ];

  const visibleItems = navItems.filter(item => !user || item.roles.includes(user.role));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          onClick={onClose}
        />
      )}
      
      <aside 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        className="sidebar"
      >
        <style>{`
          @media (min-width: 769px) {
            .sidebar { transform: translateX(0) !important; }
          }
        `}</style>
        
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            F2
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>Fundsroom ERP</span>
        </div>

        <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {visibleItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth <= 768) onClose();
              }}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: 'var(--border-radius-sm)',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s',
              })}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
          <style>{`
            .nav-link:hover:not(.active) {
              background-color: var(--surface-secondary) !important;
              color: var(--text) !important;
            }
          `}</style>
        </nav>

        <div style={{ padding: '24px 12px', borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--border-radius-sm)',
              color: 'var(--text-muted)',
              backgroundColor: 'transparent',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--danger-bg)';
              e.currentTarget.style.color = 'var(--danger)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
