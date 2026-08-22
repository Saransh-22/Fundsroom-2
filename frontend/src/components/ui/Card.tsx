import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style }) => (
  <div style={{
    backgroundColor: 'var(--surface)',
    borderRadius: 'var(--border-radius)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden',
    ...style
  }} className={`card ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className = '', style }) => (
  <div style={{
    padding: '24px 24px 0 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    ...style
  }} className={className}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className = '', style }) => (
  <h3 style={{
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
    color: 'var(--text)',
    ...style
  }} className={className}>
    {children}
  </h3>
);

export const CardContent: React.FC<CardProps> = ({ children, className = '', style }) => (
  <div style={{
    padding: '24px',
    ...style
  }} className={className}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardProps> = ({ children, className = '', style }) => (
  <div style={{
    padding: '0 24px 24px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    ...style
  }} className={className}>
    {children}
  </div>
);
