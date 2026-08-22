import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export const Alert: React.FC<{ 
  variant?: AlertVariant; 
  title?: string; 
  children: React.ReactNode;
  className?: string;
}> = ({ 
  variant = 'info', 
  title, 
  children,
  className = ''
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'success': return { bg: 'var(--success-bg)', border: 'var(--success)', text: 'var(--success-text)', icon: <CheckCircle size={20} color="var(--success)" /> };
      case 'warning': return { bg: 'var(--warning-bg)', border: 'var(--warning)', text: 'var(--warning-text)', icon: <AlertTriangle size={20} color="var(--warning)" /> };
      case 'error': return { bg: 'var(--danger-bg)', border: 'var(--danger)', text: 'var(--danger-text)', icon: <AlertCircle size={20} color="var(--danger)" /> };
      case 'info': default: return { bg: 'var(--info-bg)', border: 'var(--info)', text: 'var(--info-text)', icon: <Info size={20} color="var(--info)" /> };
    }
  };

  const styles = getStyles();

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '12px 16px',
      backgroundColor: styles.bg,
      border: `1px solid ${styles.border}`,
      borderRadius: 'var(--border-radius)',
      color: styles.text,
      marginBottom: '16px',
    }} className={className}>
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {styles.icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {title && <div style={{ fontWeight: 600, fontSize: '15px' }}>{title}</div>}
        <div style={{ fontSize: '14px', lineHeight: 1.4 }}>
          {children}
        </div>
      </div>
    </div>
  );
};
