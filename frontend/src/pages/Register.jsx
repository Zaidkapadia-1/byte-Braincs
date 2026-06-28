import { useState, useEffect } from 'react';
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
    contactEmail: participant?.email || '',
    contactPhone: '',
    members: [
      { name: participant?.name || '', email: participant?.email || '', phone: '' },
      { ...EMPTY },
      { ...EMPTY },
      { ...EMPTY },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loadingRegCheck, setLoadingRegCheck] = useState(true);

  useEffect(() => {
    // If logged in as a team, redirect to team dashboard immediately
    const teamToken = localStorage.getItem('bb_team_token');
    if (teamToken) {
      navigate('/team-dashboard');
      return;
    }

    async function checkRegistration() {
      if (!participant) {
        navigate('/login');
        return;
      }
      try {
        const res = await api.get('/teams/my-registration');
        if (res.data.registered) {
          const t = res.data.team;
          setSuccess({
            teamName: t.teamName,
            email: t.contactEmail,
            type: t.registrationType,
            status: t.status,
            rejectionReason: t.rejectionReason,
            teamCode: t.teamCode,
            plainPassword: t.plainPassword,
            byteCoins: t.byteCoins,
            token: res.data.token
          });
          setStep(3);
        }
      } catch (err) {
        console.error('Error checking registration status:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('bb_participant');
          localStorage.removeItem('bb_participant_token');
          localStorage.removeItem('bb_team');
          localStorage.removeItem('bb_team_token');
          navigate('/login');
        }
      } finally {
        setLoadingRegCheck(false);
      }
    }
    checkRegistration();
  }, [participant, navigate]);

  if (loadingRegCheck) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" /> <span style={{ marginLeft: 10, color: 'var(--ink-secondary)' }}>Loading registration status...</span>
      </div>
    );
  }

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
      members: t === 'solo'
        ? [{ name: participant?.name || '', email: participant?.email || '', phone: '' }]
        : [
            { name: participant?.name || '', email: participant?.email || '', phone: '' },
            { ...EMPTY },
            { ...EMPTY },
            { ...EMPTY },
          ],
    }));
  }

  // ── step 1 validation ────────────────────────────────────
  function step1Valid() {
    return form.teamName.trim() && form.department && form.contactEmail.trim() && form.contactPhone.trim();
  }

  // ── step 2 validation ────────────────────────────────────
  function step2Valid() {
    const count = type === 'solo' ? 1 : 4;
    return form.members.slice(0, count).every(m => m.name.trim() && m.email.trim());
  }

  // ── submit ───────────────────────────────────────────────
  async function handleSubmit() {
    setError('');

    // Ensure all member emails and names are unique from each other
    if (type === 'team') {
      const memberEmails = form.members.map(m => m.email.toLowerCase().trim());
      const uniqueMemberEmails = new Set(memberEmails);
      if (uniqueMemberEmails.size !== memberEmails.length) {
        setError('Each squad member must have a unique email address.');
        return;
      }

      const memberNames = form.members.map(m => m.name.toLowerCase().trim());
      const uniqueMemberNames = new Set(memberNames);
      if (uniqueMemberNames.size !== memberNames.length) {
        setError('Each squad member must have a unique name.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        teamName: form.teamName,
        department: form.department,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        members: type === 'solo' ? [form.members[0]] : form.members,
      };
      await api.post('/teams/register', payload);
      setSuccess({ teamName: form.teamName, email: form.contactEmail, type });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setStep(1); setType('team'); setError(''); setSuccess(null);
    setForm({
      teamName: '',
      department: '',
      contactEmail: participant?.email || '',
      contactPhone: '',
      members: [
        { name: participant?.name || '', email: participant?.email || '', phone: '' },
        { ...EMPTY },
        { ...EMPTY },
        { ...EMPTY },
      ],
    });
  }

  // ── sidebar ──────────────────────────────────────────────
  const memberCount = type === 'solo' ? 1 : 4;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>

      {/* ── NAV ── */}
      <nav className="nav">
        <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          Byte<span style={{ color: 'var(--secondary)' }}>Brainiacs</span>
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {participant?.name ? (
            <>
              <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>{participant.name}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  localStorage.removeItem('bb_participant_token');
                  localStorage.removeItem('bb_participant');
                  localStorage.removeItem('bb_team_token');
                  localStorage.removeItem('bb_team');
                  navigate('/');
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── PAGE HEADER ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', width: '100%', padding: '40px 36px 0' }}>
        <div style={{ marginBottom: 28 }}>
          <span className="chip" style={{ marginBottom: 12 }}>Registration Flow</span>
          <h1 style={{ fontSize: 36, fontWeight: 500, marginTop: 10, marginBottom: 8 }}>
            {type === 'solo' ? 'Initialize Solo Registration' : 'Initialize Team'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ink-secondary)', lineHeight: 1.6, maxWidth: 540 }}>
            {type === 'solo'
              ? 'Register yourself as a solo participant for the upcoming ByteBrainiacs Hackathon.'
              : 'Register your squad for the upcoming ByteBrainiacs Hackathon. Ensure all participant details are accurate before submission.'}
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
                    {s.num === 1 && type === 'solo' ? 'Solo Designation' : s.num === 2 && type === 'solo' ? 'Operative Details' : s.label}
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
                    { val: 'team', label: 'Squad', sub: 'Team of 4 members' },
                    { val: 'solo', label: 'Solo Operative', sub: 'Individual participant' },
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
                          {type === 'solo' ? 'Participant' : `Operator ${String(i + 1).padStart(2, '0')}`}
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

          {/* ══ STEP 3: Pending / Approved / Rejected Confirmation ══ */}
          {step === 3 && success && (() => {
            const status = success.status || 'pending';
            const isApproved = status === 'approved' || status === 'verified';
            const isRejected = status === 'rejected' || status === 'flagged';
            const isPending = !isApproved && !isRejected;

            function handleGoToDashboard() {
              if (success.token) {
                localStorage.setItem('bb_team_token', success.token);
                localStorage.setItem('bb_team', JSON.stringify({
                  teamCode: success.teamCode,
                  teamName: success.teamName,
                  byteCoins: success.byteCoins || 0,
                }));
                navigate('/team-dashboard');
              } else {
                navigate('/team-login');
              }
            }

            return (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>
                  {isApproved ? '03. Approved' : isRejected ? '03. Rejected' : '03. Submitted'}
                </h2>
                <hr style={{ border: 'none', borderTop: '0.5px solid var(--outline-variant)', margin: '12px 0 28px' }} />

                <div style={{
                  border: '0.5px solid var(--outline-variant)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                }}>
                  {/* Header */}
                  <div style={{ background: 'var(--surface-dark)', padding: '28px 32px' }}>
                    {isPending && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12,
                        fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                        color: '#e5a823', border: '0.5px solid rgba(229,168,35,0.3)',
                        padding: '4px 12px', borderRadius: 4, background: 'rgba(229,168,35,0.08)',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e5a823', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        Awaiting Admin Approval
                      </div>
                    )}
                    {isApproved && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12,
                        fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                        color: 'var(--success)', border: '0.5px solid var(--success-dim)',
                        padding: '4px 12px', borderRadius: 4, background: 'var(--success-glow)',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                        Confirmed & Approved
                      </div>
                    )}
                    {isRejected && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12,
                        fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                        color: 'var(--error)', border: '0.5px solid var(--error-dim)',
                        padding: '4px 12px', borderRadius: 4, background: 'var(--error-glow)',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--error)', display: 'inline-block' }} />
                        Rejected
                      </div>
                    )}
                    <div style={{ fontSize: 26, fontWeight: 500, color: '#fff', marginBottom: 4 }}>{success.teamName}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                      {isApproved 
                        ? (success.type === 'solo' ? 'Your solo registration is active' : 'Your team registration is active') 
                        : isRejected 
                          ? 'Your registration was not approved' 
                          : (success.type === 'solo' ? 'Your solo registration is submitted' : 'Registration submitted successfully')
                      }
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '28px 32px' }}>
                    {isPending && (
                      <>
                        <div style={{
                          background: 'var(--surface-low)',
                          border: '0.5px solid var(--outline-variant)',
                          borderRadius: 'var(--radius)',
                          padding: '16px 20px',
                          marginBottom: 20,
                        }}>
                          <div style={{ fontSize: 11, color: 'var(--label-muted)', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>What happens next?</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                            {[
                              { step: '01', text: 'Our team reviews your registration details.' },
                              { step: '02', text: 'You receive an approval/rejection email at ' + success.email },
                              { step: '03', text: success.type === 'solo' 
                                ? 'On approval, you will be queued to form a team of 4 members and receive credentials.'
                                : 'On approval, your Team Code is sent via email + ₿50 ByteCoins awarded.' 
                              },
                            ].map(s => (
                              <div key={s.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <span style={{ fontSize: 10, fontFamily: 'var(--font)', color: 'var(--secondary)', flexShrink: 0, paddingTop: 2 }}>{s.step}</span>
                                <span style={{ fontSize: 12, color: 'var(--ink-secondary)', lineHeight: 1.5 }}>{s.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <p style={{ fontSize: 12, color: 'var(--label-muted)', marginBottom: 20 }}>
                          Approval typically takes 1–12 hours. Check your email inbox and spam folder.
                        </p>

                        <div style={{ display: 'flex', gap: 12 }}>
                          <button className="btn btn-dark" style={{ flex: 1, justifyContent: 'center' }} onClick={resetAll}>
                            {success.type === 'solo' ? 'Register Another Solo' : 'Register Another Team'}
                          </button>
                          <Link to="/" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
                            Back to Home
                          </Link>
                        </div>
                      </>
                    )}

                    {isApproved && (success.registrationType === 'solo' && !success.teamCode) && (
                      <>
                        <div style={{
                          background: 'var(--surface-low)',
                          border: '0.5px solid var(--outline-variant)',
                          borderRadius: 'var(--radius)',
                          padding: '20px',
                          marginBottom: 20,
                        }}>
                          <div style={{ fontSize: 11, color: 'var(--label-muted)', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Registration Status</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                              <span style={{ color: 'var(--ink-secondary)' }}>Status:</span>
                              <span style={{ color: 'var(--success)', fontWeight: 500 }}>Approved (Solo Operative)</span>
                            </div>
                          </div>
                        </div>

                        <div style={{
                          background: 'rgba(235, 94, 40, 0.1)',
                          border: '0.5px solid rgba(235, 94, 40, 0.3)',
                          borderRadius: 'var(--radius)',
                          padding: '16px 20px',
                          marginBottom: 20,
                          fontSize: 13,
                          color: 'var(--secondary)',
                          lineHeight: 1.6
                        }}>
                          <strong>Teaming In Progress:</strong> Your team code and pass will come when you are assigned to a team of 4 members. Once other solo participants are approved, you will be grouped automatically and receive your credentials.
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                          <Link to="/" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
                            Back to Home
                          </Link>
                        </div>
                      </>
                    )}

                    {isApproved && (success.registrationType !== 'solo' || success.teamCode) && (
                      <>
                        <div style={{
                          background: 'var(--surface-low)',
                          border: '0.5px solid var(--outline-variant)',
                          borderRadius: 'var(--radius)',
                          padding: '20px',
                          marginBottom: 20,
                        }}>
                          <div style={{ fontSize: 11, color: 'var(--label-muted)', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Deployment Credentials</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                              <span style={{ color: 'var(--ink-secondary)' }}>Team Code:</span>
                              <strong style={{ fontFamily: 'var(--font)', letterSpacing: 1, color: 'var(--secondary)' }}>{success.teamCode}</strong>
                            </div>
                            {success.plainPassword && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ color: 'var(--ink-secondary)' }}>Password:</span>
                                <strong style={{ fontFamily: 'var(--font)', color: 'var(--secondary)' }}>{success.plainPassword}</strong>
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                              <span style={{ color: 'var(--ink-secondary)' }}>Status:</span>
                              <span style={{ color: 'var(--success)', fontWeight: 500 }}>Approved</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                              <span style={{ color: 'var(--ink-secondary)' }}>Starting Balance:</span>
                              <strong style={{ color: 'var(--on-surface)' }}>₿{success.byteCoins || 50}</strong>
                            </div>
                          </div>
                        </div>

                        <p style={{ fontSize: 12, color: 'var(--label-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                          Your team profile is fully set up. Click below to access your team ledger, solve tasks, and track rankings.
                        </p>

                        <div style={{ display: 'flex', gap: 12 }}>
                          <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleGoToDashboard}>
                            Go to Team Dashboard →
                          </button>
                          <Link to="/" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
                            Back to Home
                          </Link>
                        </div>
                      </>
                    )}

                    {isRejected && (
                      <>
                        <div style={{
                          background: 'var(--surface-low)',
                          border: '0.5px solid var(--outline-variant)',
                          borderRadius: 'var(--radius)',
                          padding: '16px 20px',
                          marginBottom: 20,
                        }}>
                          <div style={{ fontSize: 11, color: 'var(--error)', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Rejection Reason</div>
                          <p style={{ fontSize: 13, color: 'var(--on-surface)', margin: '8px 0 0', lineHeight: 1.5 }}>
                            {success.rejectionReason || 'No feedback reason provided by administrator.'}
                          </p>
                        </div>

                        <p style={{ fontSize: 12, color: 'var(--label-muted)', marginBottom: 20 }}>
                          You can review the reason above and register your team again with corrected details.
                        </p>

                        <div style={{ display: 'flex', gap: 12 }}>
                          <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={resetAll}>
                            Register/Update Again
                          </button>
                          <Link to="/" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
                            Back to Home
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

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
