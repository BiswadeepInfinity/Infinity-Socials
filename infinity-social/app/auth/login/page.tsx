'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Replace with Supabase auth call
    // const { error } = await supabase.auth.signInWithPassword({ email, password });
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--black)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background Orbs */}
      <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.2, background: 'radial-gradient(circle, #7c3aed, transparent)', top: '-100px', left: '-100px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.15, background: 'radial-gradient(circle, #3b82f6, transparent)', bottom: '-80px', right: '-80px', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', color: 'white', fontWeight: 700,
              boxShadow: '0 0 30px rgba(124,58,237,0.4)',
            }}>∞</div>
            <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Infinity Social</span>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '8px' }}>
            {isLogin ? 'Welcome back' : 'Join the community'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '32px', borderRadius: '28px' }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '28px' }}>
            {['Sign In', 'Sign Up'].map((tab, i) => (
              <button
                key={tab}
                id={`auth-tab-${tab.toLowerCase().replace(' ', '-')}`}
                onClick={() => setIsLogin(i === 0)}
                style={{
                  flex: 1, padding: '8px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 700,
                  background: (isLogin ? i === 0 : i === 1) ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: (isLogin ? i === 0 : i === 1) ? 'white' : 'var(--text-muted)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <form id="auth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>Username</label>
                <input
                  id="auth-username"
                  type="text"
                  placeholder="your_username"
                  required={!isLogin}
                  className="glass"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', outline: 'none' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--glass-border)')}
                />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>Email</label>
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', outline: 'none' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--glass-border)')}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>Password</label>
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', outline: 'none' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--glass-border)')}
              />
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary justify-center mt-2"
              style={{ width: '100%', padding: '13px', fontSize: '0.9rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  {isLogin ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Social Auth */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[{ icon: '🌐', label: 'Google' }, { icon: '🐙', label: 'GitHub' }].map(provider => (
              <button
                key={provider.label}
                id={`auth-${provider.label.toLowerCase()}`}
                className="btn-ghost flex-1 justify-center text-sm"
              >
                {provider.icon} {provider.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          By signing in, you agree to our{' '}
          <a href="/terms" style={{ color: 'var(--text-secondary)' }}>Terms</a>{' '}
          and{' '}
          <a href="/privacy" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
