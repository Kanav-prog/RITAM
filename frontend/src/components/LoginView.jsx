import React, { useState } from 'react';
import { apiClient } from '../api/client';

export default function LoginView({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiClient.login(email, password);
      onAuthenticated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-deep)', color: 'var(--text-primary)' }}>
      <form onSubmit={handleSubmit} style={{ width: 'min(360px, calc(100vw - 32px))', display: 'grid', gap: '12px', padding: '24px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-window)' }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '22px' }}>Sign in to RITAM</h1>
        <label style={{ display: 'grid', gap: '5px', fontSize: '12px' }}>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" style={{ padding: '9px', color: 'inherit', background: 'var(--bg-deep)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xs)' }} />
        </label>
        <label style={{ display: 'grid', gap: '5px', fontSize: '12px' }}>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" style={{ padding: '9px', color: 'inherit', background: 'var(--bg-deep)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xs)' }} />
        </label>
        {error && <div role="alert" style={{ color: 'var(--color-rose)', fontSize: '11px' }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ padding: '10px', color: '#06090e', background: 'var(--color-emerald)', border: 0, borderRadius: 'var(--radius-xs)', fontWeight: 700 }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
