import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function TeamLogin() {
  const [form, setForm] = useState({ teamCode: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function setField(f, v) { setForm(prev => ({ ...prev, [f]: v })); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.teamCode.trim()) { setError('Enter your team code.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/teams/team-login', {
        teamCode: form.teamCode.trim().toUpperCase(),
        password: form.password,
      });
      localStorage.removeItem('bb_admin_token');
      localStorage.removeItem('bb_admin');
      localStorage.removeItem('bb_participant_token');
      localStorage.removeItem('bb_participant');

      localStorage.setItem('bb_team_token', res.data.token);
      localStorage.setItem('bb_team', JSON.stringify({
        teamCode: res.data.teamCode,
        teamName: res.data.teamName,
        byteCoins: res.data.byteCoins,
      }));
      navigate('/team-dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your team code and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
      <nav className="nav">
        <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          Byte<span style={{ color: 'var(--secondary)' }}>Brainiacs</span>
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Participant Login</Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)', marginBottom: 10 }}>
              Team Portal
            </div>
            <h1 style={{ fontSize: 30 }}>Team Dashboard Login</h1>
            <p className="text-muted" style={{ marginTop: 6, fontSize: 13 }}>
              Use the team code and password sent to your email after approval.
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-wrap">
                  <label className="input-label">Team Code</label>
                  <input
                    id="team-code"
                    className="input"
                    placeholder="e.g. BB-AX92K"
                    value={form.teamCode}
                    onChange={e => setField('teamCode', e.target.value.toUpperCase())}
                    style={{ letterSpacing: 2, fontFamily: 'var(--font)' }}
                    required
                    autoFocus
                  />
                </div>
                <div className="input-wrap">
                  <label className="input-label">Team Password</label>
                  <input
                    id="team-password"
                    type="password"
                    className="input"
                    placeholder="Password from your approval email"
                    value={form.password}
                    onChange={e => setField('password', e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && <div className="alert alert-error" style={{ marginTop: 14 }}>{error}</div>}

              <button
                id="team-login-submit"
                type="submit"
                className="btn btn-primary w-full"
                style={{ marginTop: 20, justifyContent: 'center', padding: '13px', fontSize: 14 }}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : 'Access Team Dashboard →'}
              </button>
            </form>
          </div>

          <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--surface-low)', border: '0.5px solid var(--outline)', borderRadius: 'var(--radius-sm)' }}>
            <p style={{ fontSize: 11, color: 'var(--label-muted)', lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: 'var(--on-surface-dim)' }}>Don't have credentials?</strong><br />
              Team login details are sent via email after admin approves your registration.
              Solo participants receive credentials after being auto-assigned to a team.
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--ink-secondary)' }}>
            <Link to="/" style={{ color: 'var(--label-muted)', textDecoration: 'none' }}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
