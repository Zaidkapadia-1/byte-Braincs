import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/participant/login', form);
      localStorage.setItem('bb_participant_token', res.data.token);
      localStorage.setItem('bb_participant', JSON.stringify({ name: res.data.name, email: res.data.email }));
      navigate('/register');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav className="nav">
        <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          Byte<span style={{ color: 'var(--secondary)' }}>Brainiacs</span>
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>New here?</span>
          <Link to="/signup" className="btn btn-dark btn-sm">Sign Up</Link>
        </div>
      </nav>

      {/* Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)', marginBottom: 10 }}>
              Participant Portal
            </div>
            <h1 style={{ fontSize: 30 }}>Welcome Back</h1>
            <p className="text-muted" style={{ marginTop: 6, fontSize: 13 }}>
              Sign in to access the team registration form.
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-wrap">
                  <label className="input-label">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    className="input"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>
                <div className="input-wrap">
                  <label className="input-label">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    className="input"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {error && <div className="alert alert-error" style={{ marginTop: 14 }}>{error}</div>}

              <button
                id="login-submit"
                type="submit"
                className="btn btn-primary w-full"
                style={{ marginTop: 20, justifyContent: 'center', padding: '13px', fontSize: 14 }}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : 'Sign In'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--ink-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 500 }}>
              Sign Up
            </Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--ink-secondary)' }}>
            <Link to="/" style={{ color: 'var(--label-muted)', textDecoration: 'none' }}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
