import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { PackageSearch } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;
      authLogin(token, user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: 'var(--background)' }}>
      {/* Left side - Branding/Marketing */}
      <div 
        className="login-hero"
        style={{ 
          flex: 1, 
          backgroundColor: 'var(--surface)', 
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <style>{`
          @media (max-width: 768px) {
            .login-hero { display: none !important; }
          }
        `}</style>
        
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <PackageSearch size={28} />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>Fundsroom ERP</span>
          </div>
          
          <h1 style={{ fontSize: '40px', fontWeight: 700, lineHeight: 1.1, marginBottom: '24px', color: 'var(--text)' }}>
            Operations, inventory and orders &mdash; in one place.
          </h1>
          
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            A unified platform for managing your enterprise operations. From stock reservations to internal transfers, we've got you covered.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          {/* Mobile branding only visible when hero is hidden */}
          <div className="mobile-branding" style={{ display: 'none', alignItems: 'center', gap: '12px', marginBottom: '32px', justifyContent: 'center' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <PackageSearch size={24} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>Fundsroom ERP</span>
          </div>
          <style>{`
            @media (max-width: 768px) {
              .mobile-branding { display: flex !important; }
            }
          `}</style>

          <Card>
            <CardContent>
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Welcome back</h2>
                <p className="text-muted" style={{ margin: 0 }}>Sign in to your operations portal</p>
              </div>

              {error && <Alert variant="error">{error}</Alert>}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Input
                  label="Username"
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your username"
                />
                <Input
                  label="Password"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="••••••••"
                />
                
                <Button type="submit" isLoading={loading} className="w-full mt-4" size="lg">
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
            <p>Demo accounts:</p>
            <p style={{ marginTop: '4px' }}><strong>admin</strong> | <strong>operator</strong> | <strong>sales</strong></p>
            <p style={{ marginTop: '4px' }}>Password for all: <strong>password123</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;