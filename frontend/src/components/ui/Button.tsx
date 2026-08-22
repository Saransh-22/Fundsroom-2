import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  className = '', 
  children, 
  disabled, 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const css = `
    .btn { ${baseStyles} }
    .btn-primary { background-color: var(--primary); color: white; border: 1px solid transparent; }
    .btn-primary:hover { background-color: var(--primary-hover); }
    .btn-secondary { background-color: var(--surface-secondary); color: var(--text); border: 1px solid transparent; }
    .btn-secondary:hover { background-color: #e2e8f0; }
    .btn-outline { background-color: transparent; color: var(--text); border: 1px solid var(--border); }
    .btn-outline:hover { background-color: var(--surface-secondary); }
    .btn-danger { background-color: var(--danger); color: white; border: 1px solid transparent; }
    .btn-danger:hover { background-color: #dc2626; }
    
    .btn-sm { padding: 6px 12px; font-size: 13px; border-radius: var(--border-radius-sm); }
    .btn-md { padding: 8px 16px; font-size: 14px; border-radius: var(--border-radius); }
    .btn-lg { padding: 12px 24px; font-size: 16px; border-radius: var(--border-radius); }
    
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
  `;

  return (
    <>
      <style>{css}</style>
      <button 
        className={`btn btn-${variant} btn-${size} ${className}`}
        disabled={disabled || isLoading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 500,
          transition: 'background-color 0.2s',
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          opacity: disabled || isLoading ? 0.6 : 1,
        }}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin" style={{ marginRight: '8px', height: '16px', width: '16px', animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: 0.75 }}></path>
          </svg>
        )}
        {children}
      </button>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};
