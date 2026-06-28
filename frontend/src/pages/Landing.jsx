import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const features = [
  {
    icon: '⚡',
    title: '24-Hour Sprint',
    desc: 'Compete in an intense 24-hour coding challenge designed to push your limits.',
  },
  {
    icon: '₿',
    title: 'ByteCoins Rewards',
    desc: 'Earn ByteCoins by completing event tasks. Top teams win exclusive prizes.',
  },
  {
    icon: '◈',
    title: 'Team or Solo',
    desc: 'Register as a team of 3 or go solo as an individual participant.',
  },
  {
    icon: '▦',
    title: 'Real-time Dashboard',
    desc: 'Track your team score, tasks, and leaderboard in real time.',
  },
];

const timeline = [
  { date: 'Day 1 — 9:00 AM', label: 'Registration & Kickoff', active: true },
  { date: 'Day 1 — 11:00 AM', label: 'Problem Statements Released' },
  { date: 'Day 1 — 12:00 PM', label: 'Hacking Begins' },
  { date: 'Day 2 — 10:00 AM', label: 'Submission Deadline' },
  { date: 'Day 2 — 2:00 PM', label: 'Presentations & Judging' },
  { date: 'Day 2 — 5:00 PM', label: 'Prize Distribution' },
];

export default function Landing() {
  const navigate = useNavigate();
  const participant = (() => {
    try { return JSON.parse(localStorage.getItem('bb_participant') || 'null'); } catch { return null; }
  })();

  function handleRegisterClick() {
    if (participant) {
      navigate('/register');
    } else {
      navigate('/signup');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--on-surface)' }}>

      {/* ── NAV ── */}
      <nav className="nav" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          Byte<span style={{ color: 'var(--secondary)' }}>Brainiacs</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {participant ? (
            <>
              <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>Hi, {participant.name}</span>
              <button className="btn btn-dark btn-sm" onClick={() => navigate('/register')}>
                Register Team
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  localStorage.removeItem('bb_participant_token');
                  localStorage.removeItem('bb_participant');
                  window.location.reload();
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 36px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center' }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
              color: 'var(--ink-secondary)', marginBottom: 20,
            }}>
              <span style={{ color: 'var(--secondary)' }}>▶</span>
              Department of Information Technology
            </div>

            <h1 style={{ fontSize: 52, fontWeight: 500, lineHeight: 1.15, letterSpacing: -1, marginBottom: 20 }}>
              Byte<span style={{ color: 'var(--secondary)' }}>Brainiacs</span><br />
              Hackathon
            </h1>

            <p style={{ fontSize: 15, color: 'var(--ink-secondary)', lineHeight: 1.7, maxWidth: 480, marginBottom: 36 }}>
              A 24-hour inter-departmental hackathon for IT students.
              Build, innovate, and compete for glory — and ByteCoins.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '12px 28px', fontSize: 14 }}
                onClick={handleRegisterClick}
              >
                Register Now
              </button>
              <a href="#about" className="btn btn-outline" style={{ padding: '12px 28px', fontSize: 14 }}>
                Learn More
              </a>
            </div>
          </div>

          {/* Stats ticket */}
          <div className="card" style={{
            minWidth: 220,
            borderLeft: '3px solid var(--secondary)',
            display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden',
          }}>
            {[
              { label: 'Duration', value: '24 Hours' },
              { label: 'Team Size', value: '1 – 3' },
              { label: 'Tracks', value: 'Open' },
              { label: 'ByteCoins', value: 'Up for Grabs' },
            ].map((s, i, arr) => (
              <div key={s.label} style={{
                padding: '18px 24px',
                borderBottom: i < arr.length - 1 ? '0.5px solid var(--outline-variant)' : 'none',
              }}>
                <div className="stat-label">{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 500, marginTop: 4 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: '0.5px', background: 'var(--outline-variant)' }} />

      {/* ── ABOUT ── */}
      <section id="about" style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 36px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)', marginBottom: 10 }}>
            About the Event
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 500, letterSpacing: -0.5 }}>What is ByteBrainiacs?</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 }}>
          {features.map(f => (
            <div key={f.title} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 28 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 500 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--ink-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: '0.5px', background: 'var(--outline-variant)' }} />

      {/* ── TIMELINE ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 36px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)', marginBottom: 10 }}>
            Schedule
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 500, letterSpacing: -0.5 }}>Event Timeline</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 560 }}>
          {timeline.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, position: 'relative' }}>
              {/* Line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%', marginTop: 4,
                  background: t.active ? 'var(--secondary)' : 'var(--outline-variant)',
                  border: `2px solid ${t.active ? 'var(--secondary)' : 'var(--outline-variant)'}`,
                  flexShrink: 0,
                }} />
                {i < timeline.length - 1 && (
                  <div style={{ width: 1, flex: 1, background: 'var(--outline-variant)', minHeight: 32 }} />
                )}
              </div>
              {/* Content */}
              <div style={{ paddingBottom: 28 }}>
                <div style={{ fontSize: 11, letterSpacing: 1, color: 'var(--label-muted)', marginBottom: 4, textTransform: 'uppercase' }}>
                  {t.date}
                </div>
                <div style={{ fontSize: 14, fontWeight: t.active ? 500 : 400, color: t.active ? 'var(--on-surface)' : 'var(--ink-secondary)' }}>
                  {t.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: '0.5px', background: 'var(--outline-variant)' }} />

      {/* ── CTA BANNER ── */}
      <section style={{ background: 'var(--surface-dark)', color: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)', marginBottom: 10 }}>
              Spots are limited
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Ready to compete?</h2>
            <p style={{ fontSize: 13, color: 'var(--label-muted)' }}>Create an account and register your team today.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: 14 }}
              onClick={handleRegisterClick}
            >
              Register Now
            </button>
            {!participant && (
              <Link to="/login" className="btn btn-outline" style={{ padding: '12px 28px', fontSize: 14, color: '#fff', borderColor: '#fff' }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '0.5px solid var(--outline-variant)', padding: '28px 36px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            Byte<span style={{ color: 'var(--secondary)' }}>Brainiacs</span>
          </span>
          <span style={{ fontSize: 11, color: 'var(--label-muted)' }}>
            Department of Information Technology · ByteBrainiacs Hackathon
          </span>
          <Link to="/admin/login" style={{ fontSize: 11, color: 'var(--label-muted)', textDecoration: 'none' }}>
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
