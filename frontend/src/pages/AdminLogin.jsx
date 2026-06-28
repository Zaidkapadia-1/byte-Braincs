import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('bb_token', res.data.token);
      localStorage.setItem('bb_admin', JSON.stringify({ email: res.data.email, role: res.data.role }));
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div className="text-xs uppercase" style={{ letterSpacing: 2, color: 'var(--label-muted)', marginBottom: 8 }}>
            Byte Brainiacs
          </div>
          <h1 style={{ fontSize: 28 }}>Admin Terminal</h1>
          <p className="text-muted" style={{ marginTop: 6, fontSize: 12 }}>Restricted access — authorised personnel only</p>
        </div>

        <div className="card">
          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '0.5px solid var(--outline-variant)' }}>
            <span className="chip">Admin Login</span>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-wrap">
                <label className="input-label">Email</label>
                <input
                  id="admin-email"
                  type="email"
                  className="input"
                  placeholder="> admin@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              <div className="input-wrap">
                <label className="input-label">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  className="input"
                  placeholder="> ••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
            </div>
            {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}
            <button
              id="admin-login-btn"
              type="submit"
              className="btn btn-dark w-full"
              style={{ marginTop: 20, justifyContent: 'center', padding: '12px' }}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-muted" style={{ textAlign: 'center', marginTop: 20, fontSize: 11 }}>
          <a href="/register" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>← Back to registration</a>
        </p>
      </div>
    </div>
  );
}
