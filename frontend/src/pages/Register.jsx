import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const DEPARTMENTS = [
  'Information Technology',
  'Computer Engineering',
  'Computer Science',
  'AI & Data Science',
  'Information & Communication Technology',
  'Cyber Security',
  'Software Engineering',
];

const EMPTY = { name: '', email: '', phone: '' };

const STEPS = [
  { num: 1, label: 'Team Information' },
  { num: 2, label: 'Member Details' },
  { num: 3, label: 'Confirmation' },
];

export default function Register() {
  const navigate = useNavigate();
  const participant = (() => {
    try { return JSON.parse(localStorage.getItem('bb_participant') || 'null'); } catch { return null; }
  })();

  const [step, setStep] = useState(1);
  const [type, setType] = useState('team'); // 'team' | 'individual'
  const [form, setForm] = useState({
    teamName: '',
    department: '',
    contactEmail: '',
    contactPhone: '',
    members: [{ ...EMPTY }, { ...EMPTY }, { ...EMPTY }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  // ── helpers ──────────────────────────────────────────────
  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); setError(''); }
  function setMember(i, k, v) {
    setForm(f => {
      const members = [...f.members];
      members[i] = { ...members[i], [k]: v };
      return { ...f, members };
    });
  }
  function handleType(t) {
    setType(t);
    setError('');
    setForm(f => ({
      ...f,
      members: t === 'individual'
        ? [{ ...EMPTY }]
        : [{ ...EMPTY }, { ...EMPTY }, { ...EMPTY }],
    }));
  }

  // ── step 1 validation ────────────────────────────────────
  function step1Valid() {
    return form.teamName.trim() && form.department && form.contactEmail.trim() && form.contactPhone.trim();
  }

  // ── step 2 validation ────────────────────────────────────
  function step2Valid() {
    const count = type === 'individual' ? 1 : 3;
    return form.members.slice(0, count).every(m => m.name.trim() && m.email.trim());
  }

  // ── submit ───────────────────────────────────────────────
  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      const payload = {
        teamName: form.teamName,
        department: form.department,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        members: type === 'individual' ? [form.members[0]] : form.members,
      };
      const res = await api.post('/teams/register', payload);
      setSuccess({ teamCode: res.data.teamCode, teamName: form.teamName, type });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setStep(1); setType('team'); setError(''); setSuccess(null);
    setForm({ teamName: '', department: '', contactEmail: '', contactPhone: '', members: [{ ...EMPTY }, { ...EMPTY }, { ...EMPTY }] });
  }

  // ── sidebar ──────────────────────────────────────────────
  const memberCount = type === 'individual' ? 1 : 3;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>

      {/* ── NAV ── */}
      <nav className="nav">
        <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          Byte<span style={{ color: 'var(--secondary)' }}>Brainiacs</span>
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {participant?.name && (
            <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>{participant.name}</span>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              localStorage.removeItem('bb_participant_token');
              localStorage.removeItem('bb_participant');
              navigate('/');
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── PAGE HEADER ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', width: '100%', padding: '40px 36px 0' }}>
        <div style={{ marginBottom: 28 }}>
          <span className="chip" style={{ marginBottom: 12 }}>Registration Flow</span>
          <h1 style={{ fontSize: 36, fontWeight: 500, marginTop: 10, marginBottom: 8 }}>Initialize Team</h1>
          <p style={{ fontSize: 13, color: 'var(--ink-secondary)', lineHeight: 1.6, maxWidth: 540 }}>
            Register your squad for the upcoming ByteBrainiacs Hackathon.
            Ensure all participant details are accurate before submission.
          </p>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', width: '100%', padding: '0 36px 60px', flex: 1, display: 'flex', gap: 24 }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{
          width: 220, flexShrink: 0,
          background: 'var(--surface-low)',
          border: '0.5px solid var(--outline-variant)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 20px',
          display: 'flex', flexDirection: 'column',
          alignSelf: 'flex-start',
          position: 'sticky', top: 80,
        }}>
          {/* Status */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)', marginBottom: 4 }}>
              Status
            </div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {step === 3 && success ? (
                <span style={{ color: 'var(--success, #1a7a1a)' }}>Registered ✓</span>
              ) : (
                'Awaiting Input'
              )}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '0.5px solid var(--outline-variant)', margin: '0 0 20px' }} />

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {STEPS.map((s, idx) => {
              const isActive = step === s.num;
              const isDone = step > s.num || (step === 3 && success);
              return (
                <div key={s.num} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                  {/* connector line */}
                  {idx < STEPS.length - 1 && (
                    <div style={{
                      position: 'absolute', left: 15, top: 32, width: 1, height: 32,
                      background: isDone ? 'var(--secondary)' : 'var(--outline-variant)',
                    }} />
                  )}
                  {/* circle */}
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 500,
                    background: isActive ? 'var(--on-surface)' : isDone ? 'var(--secondary)' : 'transparent',
                    color: isActive || isDone ? '#fff' : 'var(--label-muted)',
                    border: `1.5px solid ${isActive ? 'var(--on-surface)' : isDone ? 'var(--secondary)' : 'var(--outline-variant)'}`,
                    transition: 'all 0.2s',
                  }}>
                    {isDone && step !== s.num ? '✓' : s.num}
                  </div>
                  {/* label */}
                  <div style={{
                    paddingTop: 6, paddingBottom: 28,
                    fontSize: 12,
                    color: isActive ? 'var(--on-surface)' : isDone ? 'var(--ink-secondary)' : 'var(--label-muted)',
                    fontWeight: isActive ? 500 : 400,
                  }}>
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />
          <hr style={{ border: 'none', borderTop: '0.5px solid var(--outline-variant)', margin: '16px 0' }} />

          {/* Sprint ID */}
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)', marginBottom: 6 }}>
              Sprint ID
            </div>
            <div style={{
              background: 'var(--surface-container)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 10px',
              fontSize: 13, fontWeight: 500,
            }}>
              ByteBrainiacs<br />
              <span style={{ fontSize: 11, color: 'var(--ink-secondary)', fontWeight: 400 }}>Hackathon 2024</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ══ STEP 1: Team Designation ══ */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>01. Team Designation</h2>
              <hr style={{ border: 'none', borderTop: '0.5px solid var(--outline-variant)', margin: '12px 0 28px' }} />

              {/* Deployment Type */}
              <div style={{ marginBottom: 24 }}>
                <div className="input-label" style={{ marginBottom: 10 }}>Deployment Type</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { val: 'team', label: 'Squad', sub: 'Team of 3 members' },
                    { val: 'individual', label: 'Solo Operative', sub: 'Individual participant' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleType(opt.val)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '14px 16px',
                        background: type === opt.val ? 'var(--surface)' : 'transparent',
                        border: `1.5px solid ${type === opt.val ? 'var(--secondary)' : 'var(--outline-variant)'}`,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                      }}
                    >
                      {/* Radio circle */}
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${type === opt.val ? 'var(--secondary)' : 'var(--outline-variant)'}`,
                        background: type === opt.val ? 'var(--secondary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {type === opt.val && (
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, fontFamily: 'var(--font)', color: 'var(--on-surface)' }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink-secondary)', marginTop: 2 }}>{opt.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Team Name */}
              <div className="input-wrap" style={{ marginBottom: 20 }}>
                <label className="input-label">
                  Team Name <span style={{ color: 'var(--secondary)' }}>*</span>
                </label>
                <input
                  id="teamName"
                  className="input"
                  placeholder="> Enter Designation"
                  value={form.teamName}
                  onChange={e => setField('teamName', e.target.value)}
                />
              </div>

              {/* Department */}
              <div className="input-wrap" style={{ marginBottom: 20 }}>
                <label className="input-label">
                  Primary Department <span style={{ color: 'var(--secondary)' }}>*</span>
                </label>
                <select
                  id="department"
                  className="input"
                  value={form.department}
                  onChange={e => setField('department', e.target.value)}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Contact row */}
              <div className="form-grid" style={{ marginBottom: 20 }}>
                <div className="input-wrap">
                  <label className="input-label">
                    Contact Email <span style={{ color: 'var(--secondary)' }}>*</span>
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    className="input"
                    placeholder="> team@email.com"
                    value={form.contactEmail}
                    onChange={e => setField('contactEmail', e.target.value)}
                  />
                </div>
                <div className="input-wrap">
                  <label className="input-label">
                    Contact Phone <span style={{ color: 'var(--secondary)' }}>*</span>
                  </label>
                  <input
                    id="contactPhone"
                    type="tel"
                    className="input"
                    placeholder="> +91 XXXXX XXXXX"
                    value={form.contactPhone}
                    onChange={e => setField('contactPhone', e.target.value)}
                  />
                </div>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              {/* Footer nav */}
              <hr style={{ border: 'none', borderTop: '0.5px solid var(--outline-variant)', margin: '24px 0 20px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ fontSize: 13, color: 'var(--ink-secondary)', textDecoration: 'none' }}>
                  ← Abort
                </Link>
                <button
                  id="step1-next"
                  className="btn btn-primary"
                  style={{ padding: '11px 28px' }}
                  onClick={() => {
                    if (!step1Valid()) { setError('Please fill in all required fields.'); return; }
                    setError(''); setStep(2);
                  }}
                >
                  Next Phase →
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 2: Member Details ══ */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>02. Member Details</h2>
              <hr style={{ border: 'none', borderTop: '0.5px solid var(--outline-variant)', margin: '12px 0 28px' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {Array.from({ length: memberCount }, (_, i) => (
                  <div key={i} style={{
                    background: 'var(--surface-low)',
                    border: '0.5px solid var(--outline-variant)',
                    borderRadius: 'var(--radius)',
                    padding: '20px',
                  }}>
                    {/* Operator header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: i === 0 ? 'var(--secondary)' : 'var(--on-surface)',
                        color: '#fff', fontSize: 11, fontWeight: 500,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)' }}>
                          {type === 'individual' ? 'Participant' : `Operator ${String(i + 1).padStart(2, '0')}`}
                        </div>
                        {i === 0 && (
                          <div style={{ fontSize: 10, color: 'var(--secondary)', letterSpacing: 1 }}>Team Lead</div>
                        )}
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="input-wrap col-span-2">
                        <label className="input-label">Full Name <span style={{ color: 'var(--secondary)' }}>*</span></label>
                        <input
                          id={`member-${i}-name`}
                          className="input"
                          placeholder={`> Operator ${i + 1} name`}
                          value={form.members[i]?.name || ''}
                          onChange={e => setMember(i, 'name', e.target.value)}
                        />
                      </div>
                      <div className="input-wrap">
                        <label className="input-label">Email <span style={{ color: 'var(--secondary)' }}>*</span></label>
                        <input
                          id={`member-${i}-email`}
                          type="email"
                          className="input"
                          placeholder="> email@domain.com"
                          value={form.members[i]?.email || ''}
                          onChange={e => setMember(i, 'email', e.target.value)}
                        />
                      </div>
                      <div className="input-wrap">
                        <label className="input-label">Phone (optional)</label>
                        <input
                          id={`member-${i}-phone`}
                          type="tel"
                          className="input"
                          placeholder="> +91 XXXXX"
                          value={form.members[i]?.phone || ''}
                          onChange={e => setMember(i, 'phone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}

              <hr style={{ border: 'none', borderTop: '0.5px solid var(--outline-variant)', margin: '28px 0 20px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn btn-ghost" onClick={() => { setError(''); setStep(1); }}>
                  ← Back
                </button>
                <button
                  id="step2-next"
                  className="btn btn-primary"
                  style={{ padding: '11px 28px' }}
                  disabled={loading}
                  onClick={() => {
                    if (!step2Valid()) { setError('Please fill in name and email for all members.'); return; }
                    handleSubmit();
                  }}
                >
                  {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Deploy Registration →'}
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 3: Confirmation ══ */}
          {step === 3 && success && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>03. Confirmation</h2>
              <hr style={{ border: 'none', borderTop: '0.5px solid var(--outline-variant)', margin: '12px 0 28px' }} />

              {/* Success ticket */}
              <div style={{
                border: '0.5px solid var(--outline-variant)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}>
                {/* Dark header */}
                <div style={{ background: 'var(--surface-dark)', padding: '28px 32px' }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)', marginBottom: 8 }}>
                    ✓ Registration Confirmed
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 500, color: '#fff', marginBottom: 4 }}>{success.teamName}</div>
                  {success.type === 'individual' && (
                    <span style={{ fontSize: 11, color: 'var(--secondary)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                      Solo Operative
                    </span>
                  )}
                </div>

                {/* Dashed divider */}
                <div style={{ position: 'relative', height: 0 }}>
                  <div style={{
                    position: 'absolute', left: 0, right: 0,
                    borderTop: '1.5px dashed var(--border-muted)',
                  }} />
                  <div style={{
                    position: 'absolute', left: -9, top: -9,
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'var(--surface)', border: '1.5px solid var(--border-muted)',
                  }} />
                  <div style={{
                    position: 'absolute', right: -9, top: -9,
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'var(--surface)', border: '1.5px solid var(--border-muted)',
                  }} />
                </div>

                {/* Body */}
                <div style={{ padding: '32px 32px 28px' }}>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)', marginBottom: 8 }}>
                      Your Team Code
                    </div>
                    <div style={{
                      fontSize: 48, fontWeight: 500, letterSpacing: 6,
                      color: 'var(--secondary)', fontFamily: 'var(--font)',
                      lineHeight: 1,
                    }}>
                      {success.teamCode}
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--ink-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                    Save this code. You will need it to track your ByteCoins balance and event status throughout the hackathon.
                  </p>

                  {success.type === 'individual' && (
                    <div className="alert alert-info" style={{ marginBottom: 20 }}>
                      You have registered as an Individual Participant. The admin has been notified.
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-dark" style={{ flex: 1, justifyContent: 'center' }} onClick={resetAll}>
                      Register Another Team
                    </button>
                    <Link to="/" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
                      Back to Home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer hint */}
      <div style={{ textAlign: 'center', padding: '16px', borderTop: '0.5px solid var(--outline-variant)' }}>
        <span style={{ fontSize: 11, color: 'var(--label-muted)' }}>
          ByteBrainiacs System Panel · Secure Connection Est.
        </span>
      </div>
    </div>
  );
}
