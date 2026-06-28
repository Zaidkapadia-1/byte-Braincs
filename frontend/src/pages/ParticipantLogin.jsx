import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function ParticipantLogin() {
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function setField(f, v) { setForm(prev => ({ ...prev, [f]: v })); setError(''); }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/participant/login', { email: form.email, password: form.password });
      localStorage.setItem('bb_participant_token', res.data.token);
      localStorage.setItem('bb_participant', JSON.stringify({ name: res.data.name, email: res.data.email }));
      navigate('/register');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/participant/signup', { name: form.name, email: form.email, password: form.password });
      localStorage.setItem('bb_participant_token', res.data.token);
      localStorage.setItem('bb_participant', JSON.stringify({ name: res.data.name, email: res.data.email }));
      navigate('/register');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      {/* Nav */}
      <nav className="nav">
        <span className="nav-brand">
          Byte<span style={{ color: 'var(--secondary)' }}>Brainiacs</span>
        </span>
        <a href="/admin/login" className="nav-link" style={{ fontSize: 11 }}>Admin</a>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Hero text */}
          <div style={{ marginBottom: 36, textAlign: 'center' }}>
            <div className="text-xs uppercase" style={{ letterSpacing: 2, color: 'var(--label-muted)', marginBottom: 10 }}>
              Event Registration Portal
            </div>
            <h1 style={{ fontSize: 32, marginBottom: 8 }}>
              {tab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-muted" style={{ fontSize: 13 }}>
              {tab === 'login'
                ? 'Sign in to access your team registration.'
                : 'Create an account to register your team for the event.'}
            </p>
          </div>

          {/* Tab switch */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: 'var(--surface-high)', borderRadius: 'var(--radius-sm)', padding: 4 }}>
            {['login', 'signup'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(''); setForm({ name: '', email: '', password: '', confirm: '' }); }}
                style={{
                  flex: 1,
                  padding: '9px',
                  fontSize: 12,
                  letterSpacing: 0.5,
                  fontFamily: 'var(--font)',
                  fontWeight: tab === t ? 500 : 400,
                  cursor: 'pointer',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  background: tab === t ? 'var(--on-surface)' : 'transparent',
                  color: tab === t ? '#fff' : 'var(--ink-secondary)',
                  transition: 'all 0.15s',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div className="card">
            {tab === 'login' ? (
              <form onSubmit={handleLogin}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="input-wrap">
                    <label className="input-label">Email</label>
                    <input
                      id="login-email"
                      type="email"
                      className="input"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={e => setField('email', e.target.value)}
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
                      onChange={e => setField('password', e.target.value)}
                      required
                    />
                  </div>
                </div>
                {error && <div className="alert alert-error" style={{ marginTop: 14 }}>{error}</div>}
                <button
                  id="login-btn"
                  type="submit"
                  className="btn btn-primary w-full"
                  style={{ marginTop: 20, justifyContent: 'center', padding: '13px', fontSize: 13 }}
                  disabled={loading}
                >
                  {loading ? <span className="spinner" /> : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="input-wrap">
                    <label className="input-label">Full Name</label>
                    <input
                      id="signup-name"
                      className="input"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={e => setField('name', e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">Email</label>
                    <input
                      id="signup-email"
                      type="email"
                      className="input"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={e => setField('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">Password</label>
                    <input
                      id="signup-password"
                      type="password"
                      className="input"
                      placeholder="Minimum 6 characters"
                      value={form.password}
                      onChange={e => setField('password', e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">Confirm Password</label>
                    <input
                      id="signup-confirm"
                      type="password"
                      className="input"
                      placeholder="Re-enter your password"
                      value={form.confirm}
                      onChange={e => setField('confirm', e.target.value)}
                      required
                    />
                  </div>
                </div>
                {error && <div className="alert alert-error" style={{ marginTop: 14 }}>{error}</div>}
                <button
                  id="signup-btn"
                  type="submit"
                  className="btn btn-primary w-full"
                  style={{ marginTop: 20, justifyContent: 'center', padding: '13px', fontSize: 13 }}
                  disabled={loading}
                >
                  {loading ? <span className="spinner" /> : 'Create Account'}
                </button>
              </form>
            )}
          </div>

          <p className="text-muted" style={{ textAlign: 'center', marginTop: 16, fontSize: 11 }}>
            Only IT & Computer Engineering departments are eligible to participate.
          </p>
        </div>
      </div>
    </div>
  );
}
