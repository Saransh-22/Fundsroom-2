import React from 'react';

export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div style={{ overflowX: 'auto', width: '100%' }} className={className}>
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
      fontSize: '14px',
    }}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead style={{
    backgroundColor: 'var(--surface-secondary)',
    borderBottom: '1px solid var(--border)',
  }}>
    {children}
  </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody>
    {children}
  </tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <tr style={{
    borderBottom: '1px solid var(--border)',
    transition: 'background-color 0.15s',
  }} className={`hover:bg-[var(--surface-secondary)] ${className}`}>
    <style>{`
      tr:hover { background-color: var(--surface-secondary); }
      tr:last-child { border-bottom: none; }
    `}</style>
    {children}
  </tr>
);

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <th style={{
    padding: '12px 16px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
  }} className={className}>
    {children}
  </th>
);

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <td style={{
    padding: '12px 16px',
    color: 'var(--text)',
    verticalAlign: 'middle',
  }} className={className}>
    {children}
  </td>
);
