import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export const Badge: React.FC<{ children: React.ReactNode; variant?: BadgeVariant; className?: string }> = ({ 
  children, 
  variant = 'default',
  className = '' 
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success': return { bg: 'var(--success-bg)', text: 'var(--success-text)' };
      case 'warning': return { bg: 'var(--warning-bg)', text: 'var(--warning-text)' };
      case 'danger': return { bg: 'var(--danger-bg)', text: 'var(--danger-text)' };
      case 'info': return { bg: 'var(--info-bg)', text: 'var(--info-text)' };
      default: return { bg: 'var(--surface-secondary)', text: 'var(--text)' };
    }
  };

  const colors = getColors();

  return (
    <span 
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: 1.5,
        backgroundColor: colors.bg,
        color: colors.text,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
};
