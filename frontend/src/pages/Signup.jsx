import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const BLOCKED_DOMAINS = [
  'test.com', 'fake.com', 'example.com', 'mailinator.com',
  'guerrillamail.com', 'trashmail.com', 'tempmail.com', 'yopmail.com'
];

function validateForm({ name, email, phone, password, confirm }) {
  if (!name.trim() || name.trim().length < 2)
    return 'Enter your full name (at least 2 characters).';

  const emailLower = email.toLowerCase();
  const domain = emailLower.split('@')[1] || '';
  if (BLOCKED_DOMAINS.includes(domain))
    return 'Please use a real email address.';
  if (/^(test|fake|sample|dummy|abc|xyz|asdf|qwerty)\d*@/i.test(emailLower))
    return 'Please use a real email address.';

  const phoneClean = phone.replace(/\D/g, '');
  if (phoneClean.length < 10)
    return 'Enter a valid 10-digit phone number.';

  if (password.length < 8)
    return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password))
    return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(password))
    return 'Password must contain at least one number.';
  if (password !== confirm)
    return 'Passwords do not match.';

  return null;
}

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function setField(f, v) { setForm(prev => ({ ...prev, [f]: v })); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const validationError = validateForm(form);
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const res = await api.post('/participant/signup', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      localStorage.removeItem('bb_admin_token');
      localStorage.removeItem('bb_admin');
      localStorage.removeItem('bb_team_token');
      localStorage.removeItem('bb_team');

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
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav className="nav">
        <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          Byte<span style={{ color: 'var(--secondary)' }}>Brainiacs</span>
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>Have an account?</span>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
        </div>
      </nav>

      {/* Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)', marginBottom: 10 }}>
              Participant Portal
            </div>
            <h1 style={{ fontSize: 30 }}>Create Account</h1>
            <p className="text-muted" style={{ marginTop: 6, fontSize: 13 }}>
              Sign up to register your team for ByteBrainiacs Hackathon.
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit}>
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
                    placeholder="Enter your college/real email"
                    value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    required
                  />
                </div>

                <div className="input-wrap">
                  <label className="input-label">Phone Number</label>
                  <input
                    id="signup-phone"
                    type="tel"
                    className="input"
                    placeholder="10-digit phone number"
                    value={form.phone}
                    onChange={e => setField('phone', e.target.value)}
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="input-wrap">
                    <label className="input-label">Password</label>
                    <input
                      id="signup-password"
                      type="password"
                      className="input"
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
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
                      placeholder="Re-enter password"
                      value={form.confirm}
                      onChange={e => setField('confirm', e.target.value)}
                      required
                    />
                  </div>
                </div>

              </div>

              {/* password hint */}
              <p style={{ fontSize: 10, color: 'var(--label-muted)', marginTop: 8, lineHeight: 1.6 }}>
                Password must be 8+ characters with at least one uppercase letter and one number.
              </p>

              {error && <div className="alert alert-error" style={{ marginTop: 14 }}>{error}</div>}

              <button
                id="signup-submit"
                type="submit"
                className="btn btn-primary w-full"
                style={{ marginTop: 20, justifyContent: 'center', padding: '13px', fontSize: 14 }}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : 'Create Account & Register'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--ink-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 500 }}>
              Sign In
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
