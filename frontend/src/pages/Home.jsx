import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const TERMINAL_LINES = [
  { text: '> initializing ByteBrainiacs Hackathon 2024...', delay: 0 },
  { text: '> loading participant registry...', delay: 800 },
  { text: '> teams registered: 42 | slots remaining: 8', delay: 1600 },
  { text: '> leaderboard synced. top team: BB-AX92K [480 ₿C]', delay: 2400 },
  { text: '> event status: REGISTRATION OPEN ✓', delay: 3200 },
  { text: '> 24h sprint begins: 12 Jul 2024 @ 09:00 AM', delay: 4000 },
  { text: '> run ./register --team or --solo to join', delay: 4800 },
];

function TerminalWidget() {
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const termRef = useRef(null);

  useEffect(() => {
    if (currentLine >= TERMINAL_LINES.length) {
      // restart after pause
      const t = setTimeout(() => {
        setLines([]);
        setCurrentLine(0);
        setCurrentText('');
        setCharIndex(0);
      }, 3000);
      return () => clearTimeout(t);
    }

    const line = TERMINAL_LINES[currentLine];
    if (charIndex < line.text.length) {
      const t = setTimeout(() => {
        setCurrentText(prev => prev + line.text[charIndex]);
        setCharIndex(c => c + 1);
      }, 28);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setLines(prev => [...prev, line.text]);
        setCurrentText('');
        setCharIndex(0);
        setCurrentLine(c => c + 1);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [currentLine, charIndex, currentText]);

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [lines, currentText]);

  return (
    <div style={{
      background: '#0a0a0a',
      border: '0.5px solid var(--outline)',
      borderRadius: 'var(--radius-sm)',
      padding: '14px 18px',
      fontFamily: "'Courier New', monospace",
      fontSize: 11,
      lineHeight: 1.8,
      maxWidth: 520,
      marginBottom: 40,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: 12, paddingBottom: 10,
        borderBottom: '0.5px solid var(--outline)',
      }}>
        {['#c0392b', '#e5a823', '#27ae60'].map((c, i) => (
          <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />
        ))}
        <span style={{ marginLeft: 8, fontSize: 9, letterSpacing: 1.5, color: 'var(--label-muted)', textTransform: 'uppercase' }}>bb-terminal — bash</span>
      </div>

      <div ref={termRef} style={{ maxHeight: 130, overflowY: 'hidden' }}>
        {lines.map((l, i) => (
          <div key={i} style={{ color: i === lines.length - 1 ? 'var(--on-surface-dim)' : 'var(--label-muted)' }}>{l}</div>
        ))}
        {currentLine < TERMINAL_LINES.length && (
          <div style={{ color: 'var(--secondary)' }}>
            {currentText}
            <span style={{ animation: 'termBlink 0.8s step-end infinite', borderRight: '1.5px solid var(--secondary)', marginLeft: 1 }}> </span>
          </div>
        )}
      </div>

      <style>{`@keyframes termBlink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

const TIMELINE = [
  { day: 'Day 1', time: '09:00 AM', label: 'Gates Open · Registration Check-in', desc: 'Collect your entry pass and kit at the IT dept reception.' },
  { day: 'Day 1', time: '10:00 AM', label: 'Opening Ceremony', desc: 'Welcome address by faculty coordinator and chief guest.' },
  { day: 'Day 1', time: '11:00 AM', label: 'Problem Statements Released', desc: 'All tracks go live simultaneously. Teams begin planning.' },
  { day: 'Day 1', time: '12:00 PM', label: 'Hacking Begins', desc: 'Clock starts. 24 hours on the board.', active: true },
  { day: 'Day 1', time: '06:00 PM', label: 'Mentor Check-in Round 1', desc: 'Faculty mentors visit each team for a 10-min progress review.' },
  { day: 'Day 1', time: '09:00 PM', label: 'ByteCoins Task Drop', desc: 'First batch of bonus tasks released — complete them for extra coins.' },
  { day: 'Day 2', time: '12:00 AM', label: 'Midnight Snack Break', desc: 'Mandatory 15-min rest. Fuel up before the final push.' },
  { day: 'Day 2', time: '06:00 AM', label: 'Mentor Check-in Round 2', desc: 'Last chance to get technical guidance before lock-in.' },
  { day: 'Day 2', time: '10:00 AM', label: 'Final Submission Deadline', desc: 'All code and demos must be pushed. No extensions.' },
  { day: 'Day 2', time: '11:00 AM', label: 'Presentations Begin', desc: 'Teams pitch their solution to the judging panel — 5 min per team.' },
  { day: 'Day 2', time: '02:00 PM', label: 'Judging & Deliberation', desc: 'Panel evaluates all submissions. Leaderboard freezes.' },
  { day: 'Day 2', time: '05:00 PM', label: 'Prize Distribution & Closing', desc: 'Top teams announced. ByteCoins prizes and certificates issued.' },
];

export default function Home() {
  const navigate = useNavigate();
  const participant = (() => {
    try { return JSON.parse(localStorage.getItem('bb_participant') || 'null'); } catch { return null; }
  })();

  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);

  useEffect(() => {
    api.get('/teams/stats')
      .then(r => setLeaderboard(r.data.topTeams || []))
      .catch(() => setLeaderboard(MOCK_LB))
      .finally(() => setLbLoading(false));
  }, []);

  const MOCK_LB = [
    { _id: '1', teamCode: 'BB-AX92K', teamName: 'Team NullPointer', byteCoins: 480, registrationType: 'team' },
    { _id: '2', teamCode: 'BB-ZR71M', teamName: 'Void Walkers', byteCoins: 410, registrationType: 'team' },
    { _id: '3', teamCode: 'BB-QT33P', teamName: 'Syntax Syndicate', byteCoins: 370, registrationType: 'team' },
    { _id: '4', teamCode: 'BB-LK09W', teamName: 'Neural Nomads', byteCoins: 290, registrationType: 'team' },
    { _id: '5', teamCode: 'BB-XM44D', teamName: 'Quantum Solo', byteCoins: 210, registrationType: 'solo' },
  ];

  const displayLB = leaderboard.length > 0 ? leaderboard : MOCK_LB;

  // Group timeline by day
  const days = [...new Set(TIMELINE.map(t => t.day))];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--on-surface)' }}>

      {/* ── NAV ── */}
      <nav className="nav">
        <Link to="/" className="nav-brand">Byte<span>Brainiacs</span></Link>
        <div className="pub-nav-links">
          <Link to="/" className="nav-link active">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {participant ? (
            <>
              <span style={{ fontSize: 10, color: 'var(--ink-secondary)' }}>{participant.name}</span>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>My Team</button>
              <button className="btn btn-ghost btn-sm" onClick={() => {
                localStorage.removeItem('bb_participant_token');
                localStorage.removeItem('bb_participant');
                localStorage.removeItem('bb_team_token');
                localStorage.removeItem('bb_team');
                window.location.reload();
              }}>Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Register →</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 36px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* dot grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, #f0ece4 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        {/* glow */}
        <div style={{
          position: 'absolute', top: -100, left: -100, width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(192,57,43,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
            fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
            color: 'var(--secondary)', border: '0.5px solid var(--secondary-dim)',
            padding: '5px 14px', borderRadius: 'var(--radius-sm)',
            background: 'var(--secondary-glow)',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--secondary)', display: 'inline-block' }} />
            Registration Open · 2024
          </div>

          <h1 style={{ fontSize: 60, fontWeight: 500, lineHeight: 1.05, letterSpacing: -2, marginBottom: 20 }}>
            Byte<span style={{ color: 'var(--secondary)' }}>Brainiacs</span><br />
            <span style={{ color: 'var(--ink-secondary)', fontSize: 44 }}>Hackathon '24</span>
          </h1>

          <p style={{ fontSize: 15, lineHeight: 1.8, maxWidth: 500, marginBottom: 40, color: 'var(--on-surface-dim)' }}>
            A 24-hour inter-departmental coding sprint for IT students.<br />
            Build real things. Earn ByteCoins. Win recognition.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 56 }}>
            {participant ? (
              <button className="btn btn-primary" style={{ padding: '13px 32px', fontSize: 13 }} onClick={() => navigate('/register')}>
                View My Registration →
              </button>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary" style={{ padding: '13px 32px', fontSize: 13 }}>Register Now →</Link>
                <Link to="/about" className="btn btn-outline" style={{ padding: '13px 28px', fontSize: 13 }}>Learn More</Link>
              </>
            )}
          </div>

          {/* quick stats strip */}
          <div style={{ display: 'flex', gap: 0, borderTop: '0.5px solid var(--outline)', paddingTop: 28 }}>
            {[
              { l: 'Duration', v: '24 Hours' },
              { l: 'Team Size', v: 'Up to 4' },
              { l: 'Eligibility', v: 'IT Dept' },
              { l: 'Entry', v: 'Free' },
            ].map((s, i) => (
              <div key={s.l} style={{
                paddingRight: 32, marginRight: 32,
                borderRight: i < 3 ? '0.5px solid var(--outline)' : 'none',
              }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--label-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{s.l}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--on-surface)' }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="accent-line" />

      {/* ── LEADERBOARD ── */}
      <section id="leaderboard" style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span className="eyebrow">// Live Rankings</span>
            <h2 style={{ fontSize: 32, fontWeight: 500, letterSpacing: -0.5 }}>ByteCoins Leaderboard</h2>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 14px', border: '0.5px solid var(--outline)',
            borderRadius: 'var(--radius-sm)', fontSize: 10,
            color: 'var(--ink-secondary)', background: 'var(--surface-low)',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            Live · Updates every 5 min
          </div>
        </div>

        {lbLoading ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 40 }}>
            <span className="spinner" /> <span style={{ color: 'var(--ink-secondary)', fontSize: 12 }}>Loading rankings...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Top 3 podium cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 8 }}>
              {displayLB.slice(0, 3).map((t, i) => (
                <div key={t._id} className="card" style={{
                  borderColor: i === 0 ? 'var(--secondary-dim)' : 'var(--outline)',
                  borderWidth: i === 0 ? '1px' : '0.5px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {i === 0 && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                      background: 'var(--secondary)',
                    }} />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 500, letterSpacing: 1,
                      color: i === 0 ? 'var(--secondary)' : 'var(--label-muted)',
                    }}>#{i + 1}</span>
                    <span className="chip outline">team</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--on-surface)', marginBottom: 16 }}>{t.teamName}</div>
                  <div style={{ fontSize: 28, fontWeight: 500, color: i === 0 ? 'var(--secondary)' : 'var(--on-surface)' }}>
                    ₿{t.byteCoins}
                  </div>
                </div>
              ))}
            </div>

            {/* Rest as table */}
            {displayLB.length > 3 && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Team Name</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'right' }}>₿C</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayLB.slice(3).map((t, i) => (
                      <tr key={t._id}>
                        <td style={{ color: 'var(--label-muted)', fontSize: 11 }}>#{i + 4}</td>
                        <td style={{ fontWeight: 500, color: 'var(--on-surface)' }}>{t.teamName}</td>
                        <td><span className="chip dim">team</span></td>
                        <td style={{ textAlign: 'right', fontWeight: 500, color: 'var(--on-surface)' }}>₿{t.byteCoins}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="accent-line" />

      {/* ── SCHEDULE ── */}
      <section id="schedule" style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 36px' }}>
        <span className="eyebrow">// Event Schedule</span>
        <h2 style={{ fontSize: 32, fontWeight: 500, letterSpacing: -0.5, marginBottom: 8 }}>Full 24-Hour Schedule</h2>
        <p style={{ color: 'var(--ink-secondary)', marginBottom: 48, fontSize: 13 }}>
          Every minute is planned. Here's what the 24 hours look like.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          {days.map(day => (
            <div key={day}>
              <div style={{
                fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                color: 'var(--secondary)', marginBottom: 20,
                paddingBottom: 10, borderBottom: '0.5px solid var(--outline)',
              }}>
                {day}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {TIMELINE.filter(t => t.day === day).map((t, i, arr) => (
                  <div key={i} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                    {/* line */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 16 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                        background: t.active ? 'var(--secondary)' : 'var(--surface-highest)',
                        border: `1px solid ${t.active ? 'var(--secondary)' : 'var(--outline)'}`,
                        boxShadow: t.active ? '0 0 8px rgba(192,57,43,0.5)' : 'none',
                      }} />
                      {i < arr.length - 1 && (
                        <div style={{ width: 1, flex: 1, background: 'var(--outline)', minHeight: 24 }} />
                      )}
                    </div>
                    {/* content */}
                    <div style={{
                      paddingBottom: 20,
                      background: t.active ? 'transparent' : 'transparent',
                    }}>
                      <div style={{
                        fontSize: 9, letterSpacing: 1.5, color: t.active ? 'var(--secondary)' : 'var(--label-muted)',
                        textTransform: 'uppercase', marginBottom: 3,
                      }}>{t.time}</div>
                      <div style={{
                        fontSize: 12, fontWeight: t.active ? 500 : 400,
                        color: t.active ? 'var(--on-surface)' : 'var(--on-surface-dim)',
                        marginBottom: 3,
                      }}>
                        {t.label}
                        {t.active && (
                          <span style={{ marginLeft: 8, fontSize: 9, color: 'var(--secondary)', letterSpacing: 1.5 }}>● NOW</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--label-muted)', lineHeight: 1.5 }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'var(--surface-low)', borderTop: '0.5px solid var(--outline)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: 10 }}>// Don't Miss Out</div>
            <h2 style={{ fontSize: 26, fontWeight: 500, marginBottom: 8 }}>Spots are limited. Register today.</h2>
            <p style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>Admin approval required. Team code issued after verification.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '12px 28px' }}>Register Now →</Link>
            <Link to="/about" className="btn btn-outline" style={{ padding: '12px 24px' }}>About Event</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '0.5px solid var(--outline)', padding: '24px 36px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Byte<span style={{ color: 'var(--secondary)' }}>Brainiacs</span></span>
          <span style={{ fontSize: 9, color: 'var(--label-muted)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Dept. of Information Technology · Hackathon 2024
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/about" style={{ fontSize: 10, color: 'var(--label-muted)', textDecoration: 'none', letterSpacing: 1 }}>About</Link>
            <Link to="/contact" style={{ fontSize: 10, color: 'var(--label-muted)', textDecoration: 'none', letterSpacing: 1 }}>Contact</Link>
            <Link to="/login" style={{ fontSize: 10, color: 'var(--label-muted)', textDecoration: 'none', letterSpacing: 1 }}>Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
