import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const EVENT_DATES = [
  { label: 'Registration Closes', date: '10 Jul 2024', done: false },
  { label: 'Hackathon Begins', date: '12 Jul 2024 · 09:00 AM', done: false },
  { label: 'Mentor Check-in #1', date: '12 Jul 2024 · 06:00 PM', done: false },
  { label: 'ByteCoins Task Drop', date: '12 Jul 2024 · 09:00 PM', done: false },
  { label: 'Midnight Break', date: '13 Jul 2024 · 12:00 AM', done: false },
  { label: 'Final Submission', date: '13 Jul 2024 · 10:00 AM', done: false },
  { label: 'Prize Distribution', date: '13 Jul 2024 · 05:00 PM', done: false },
];

export default function TeamDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const teamInfo = (() => {
    try { return JSON.parse(localStorage.getItem('bb_team') || 'null'); } catch { return null; }
  })();

  useEffect(() => {
    const token = localStorage.getItem('bb_team_token');
    if (!token) { navigate('/team-login'); return; }

    api.get('/teams/my-team', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setData(res.data))
      .catch(() => {
        localStorage.removeItem('bb_team_token');
        localStorage.removeItem('bb_team');
        navigate('/team-login');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem('bb_team_token');
    localStorage.removeItem('bb_team');
    navigate('/');
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const { team, transactions } = data || {};

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--on-surface)' }}>

      {/* ── NAV ── */}
      <nav className="nav">
        <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          Byte<span style={{ color: 'var(--secondary)' }}>Brainiacs</span>
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--label-muted)', letterSpacing: 1, fontFamily: 'var(--font)' }}>
            {team?.teamCode}
          </span>
          <Link to="/" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Home</Link>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 36px 60px' }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)' }}>
            // Team Dashboard
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 500, marginTop: 8, marginBottom: 4 }}>{team?.teamName}</h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--secondary)', fontWeight: 500 }}>
              {team?.teamCode}
            </span>
            <span className="chip outline">{team?.registrationType}</span>
            <span className="chip success">approved</span>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 36 }}>
          {[
            { label: 'ByteCoins', value: `₿${team?.byteCoins || 0}`, accent: true },
            { label: 'Team Members', value: team?.members?.length || 0 },
            { label: 'Department', value: team?.department || '—' },
            { label: 'Status', value: 'Active' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)', marginBottom: 8 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 26, fontWeight: 500, color: s.accent ? 'var(--secondary)' : 'var(--on-surface)' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* ── MEMBERS ── */}
          <div className="card">
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)', marginBottom: 16 }}>
              // Team Members
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {team?.members?.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  background: 'var(--surface-low)',
                  border: '0.5px solid var(--outline)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: i === 0 ? 'var(--secondary)' : 'var(--surface-highest)',
                    color: '#fff', fontSize: 12, fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {m.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
                      {m.name}
                      {i === 0 && <span style={{ marginLeft: 6, fontSize: 9, color: 'var(--secondary)', letterSpacing: 1 }}>LEAD</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--label-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.email}
                    </div>
                    {m.phone && (
                      <div style={{ fontSize: 10, color: 'var(--label-muted)' }}>{m.phone}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── EVENT TIMELINE ── */}
          <div className="card">
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)', marginBottom: 16 }}>
              // Event Timeline
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {EVENT_DATES.map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 16 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                      background: ev.done ? 'var(--secondary)' : 'var(--surface-highest)',
                      border: `1px solid ${ev.done ? 'var(--secondary)' : 'var(--outline)'}`,
                    }} />
                    {i < EVENT_DATES.length - 1 && (
                      <div style={{ width: 1, flex: 1, background: 'var(--outline)', minHeight: 20 }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: 16 }}>
                    <div style={{ fontSize: 10, color: 'var(--secondary)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
                      {ev.date}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--on-surface-dim)' }}>{ev.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── BYTECOINS HISTORY ── */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)', marginBottom: 16 }}>
              // ByteCoins History
            </div>
            {!transactions || transactions.length === 0 ? (
              <p style={{ color: 'var(--label-muted)', fontSize: 12 }}>No transactions yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Note</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 11, color: 'var(--label-muted)' }}>
                        {new Date(tx.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ fontSize: 12 }}>{tx.note || tx.taskTitle || '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500, color: tx.type === 'credit' ? 'var(--secondary)' : 'var(--error)' }}>
                        {tx.type === 'credit' ? '+' : '-'}₿{tx.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── ANNOUNCEMENTS ── */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)', marginBottom: 16 }}>
              // Announcements & Updates
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { msg: 'Welcome to ByteBrainiacs Hackathon 2024! Check the schedule for key dates.', time: 'Pinned' },
                { msg: 'ByteCoins task challenges will be released at 9:00 PM on Day 1. Stay tuned!', time: 'Pinned' },
              ].map((a, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  background: 'var(--surface-low)',
                  border: '0.5px solid var(--outline)',
                  borderLeft: '3px solid var(--secondary)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{ fontSize: 9, color: 'var(--secondary)', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' }}>{a.time}</div>
                  <div style={{ fontSize: 13, color: 'var(--on-surface-dim)', lineHeight: 1.6 }}>{a.msg}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
