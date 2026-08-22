import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  fullWidth = true, 
  className = '', 
  id, 
  ...props 
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: fullWidth ? '100%' : 'auto' }} className={className}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{
          padding: '8px 12px',
          borderRadius: 'var(--border-radius-sm)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          backgroundColor: 'var(--surface)',
          color: 'var(--text)',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          width: '100%',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? 'var(--danger)' : 'var(--primary)';
          e.target.style.boxShadow = `0 0 0 2px ${error ? 'var(--danger-bg)' : 'var(--primary-light)'}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '13px', color: 'var(--danger)' }}>{error}</span>
      )}
    </div>
  );
};
