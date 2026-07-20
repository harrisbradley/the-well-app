import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!email || !password) {
      return setError('Please enter both email and password.');
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to log in. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at center, #101418 0%, #080A0C 100%)',
    }}>
      <div className="glass-panel fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px 32px',
        textAlign: 'center',
      }}>
        {/* Pulsing Sacred Well Logo */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(229, 193, 88, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          border: '1px solid rgba(229, 193, 88, 0.2)',
        }}>
          <svg 
            width="36" 
            height="36" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="var(--color-sacred-gold)" 
            strokeWidth="1.5"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M4 11h16M4 15h16" />
            <path d="M6 11V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" />
            <path d="M12 3v3" />
            <circle cx="12" cy="8" r="2" />
            <path d="M3 21h18" />
            <path d="M5 21v-6h14v6" />
          </svg>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '28px',
          color: 'var(--color-sacred-gold)',
          marginBottom: '8px',
        }}>
          Welcome Back
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-slate)',
          marginBottom: '32px',
        }}>
          Draw deep from the living water of Scripture
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            color: '#FCA5A5',
            fontSize: '13px',
            textAlign: 'left',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label className="input-label" htmlFor="email">Email Address</label>
            <input 
              className="input-field" 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
              placeholder="name@example.com"
              required 
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="input-label" htmlFor="password">Password</label>
            <input 
              className="input-field" 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            className="btn btn-primary" 
            type="button" 
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', padding: '14px' }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '24px 0',
          color: 'var(--text-dim)',
        }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />
          <span style={{ fontSize: '12px', padding: '0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* Google Sign In */}
        <button 
          className="btn btn-secondary" 
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '32px'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ fontSize: '14px', color: 'var(--text-slate)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--color-sacred-gold)', textDecoration: 'none', fontWeight: 600 }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
