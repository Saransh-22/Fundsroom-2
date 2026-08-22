import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--background)' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 'var(--sidebar-width)',
        minWidth: 0, // Helps with table responsiveness
        transition: 'margin-left 0.3s ease',
      }} className="main-content">
        <style>{`
          @media (max-width: 768px) {
            .main-content { margin-left: 0 !important; }
          }
        `}</style>
        
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main style={{
          flex: 1,
          padding: '24px',
          overflowX: 'hidden',
          overflowY: 'auto',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
