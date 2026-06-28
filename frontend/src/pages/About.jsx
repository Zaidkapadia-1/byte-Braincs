import { Link } from 'react-router-dom';

const COLLEGE = {
  name: 'Atharva College of Engineering',
  dept: 'Department of Information Technology',
  affiliation: 'University of Mumbai',
  location: 'Malad (W), Mumbai – 400095',
  accreditation: 'NAAC A+',
};

const ORGANIZERS = [
  { name: 'Dr. Arjun Mehta', role: 'Faculty Coordinator', dept: 'IT Dept', initial: 'A', lead: true },
  { name: 'Prof. Sneha Rao', role: 'Faculty Mentor', dept: 'IT Dept', initial: 'S' },
  { name: 'Priya Sharma',  role: 'Student Lead', dept: 'IT · 4th Year', initial: 'P' },
  { name: 'Rajan Kulkarni', role: 'Tech Lead', dept: 'IT · 3rd Year', initial: 'R' },
  { name: 'Aisha Desai',   role: 'Operations Head', dept: 'IT · 3rd Year', initial: 'A' },
  { name: 'Dev Nair',      role: 'Design & Media', dept: 'IT · 2nd Year', initial: 'D' },
];

const PREVIOUS = [
  {
    year: '2023', name: 'TechSprint I',
    teams: 38, participants: 112,
    winner: 'Team NullPointer', winnerProject: 'AI-powered campus attendance system',
    prize: '₿10,000', highlight: 'First edition — 12+ college departments participated.',
  },
  {
    year: '2022', name: 'CodeStorm',
    teams: 24, participants: 71,
    winner: 'Team ByteForce', winnerProject: 'Real-time traffic congestion predictor',
    prize: '₿7,500', highlight: 'Introduced the ByteCoins reward system for the first time.',
  },
];

const TRACKS = [
  {
    id: '01', title: 'AI & Machine Learning',
    desc: 'Build intelligent systems — recommendation engines, classifiers, NLP tools, or computer vision apps — that solve real-world problems.',
    tags: ['Python', 'TensorFlow', 'scikit-learn'],
  },
  {
    id: '02', title: 'Cybersecurity',
    desc: 'Design defensive tools, vulnerability scanners, CTF challenges, or security audit systems for modern infrastructure.',
    tags: ['Networking', 'Cryptography', 'Pen Testing'],
  },
  {
    id: '03', title: 'Open Innovation',
    desc: 'No constraints. Any stack, any domain. Build anything that showcases engineering creativity and solves a meaningful problem.',
    tags: ['Open Stack', 'Any Domain', 'Any Language'],
  },
];

const RULES = [
  'Teams must consist of 1 to 4 members. Solo participants will be grouped into teams by the organizers.',
  'All members must be enrolled in the Department of Information Technology.',
  'Each team must register through the official portal. Admin approval is required before a team code is issued.',
  'All code must be written during the hackathon. Pre-existing projects or templates are not allowed.',
  'Teams may use any public APIs, libraries, or open-source tools, provided they are credited.',
  'Final submissions must include a working demo, source code, and a short project description.',
  'Judges\' decisions are final. Plagiarism or rule violations lead to immediate disqualification.',
];

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--on-surface)' }}>

      {/* ── NAV ── */}
      <nav className="nav">
        <Link to="/" className="nav-brand">Byte<span>Brainiacs</span></Link>
        <div className="pub-nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link active">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Register →</Link>
        </div>
      </nav>

      {/* ── PAGE HEADER ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 36px 48px', borderBottom: '0.5px solid var(--outline)' }}>
        <span className="eyebrow">// About ByteBrainiacs</span>
        <h1 style={{ fontSize: 44, fontWeight: 500, letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 16 }}>
          The Hackathon Built<br />
          <span style={{ color: 'var(--secondary)' }}>by IT, for IT.</span>
        </h1>
        <p style={{ maxWidth: 580, fontSize: 14, lineHeight: 1.9, color: 'var(--on-surface-dim)' }}>
          ByteBrainiacs is the annual 24-hour inter-departmental hackathon hosted by the Department of Information Technology.
          It's designed to push students beyond their coursework — into building, deploying, and competing with real products.
        </p>
      </div>

      {/* ── COLLEGE INFO ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 36px' }}>
        <span className="eyebrow">// Presenting Institution</span>
        <h2 style={{ fontSize: 28, fontWeight: 500, marginBottom: 32, letterSpacing: -0.5 }}>About the College</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="card" style={{ borderLeft: '2px solid var(--secondary)' }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--on-surface)', marginBottom: 6 }}>{COLLEGE.name}</div>
            <div style={{ fontSize: 12, color: 'var(--secondary)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>{COLLEGE.dept}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'Affiliation', v: COLLEGE.affiliation },
                { l: 'Location', v: COLLEGE.location },
                { l: 'Accreditation', v: COLLEGE.accreditation },
              ].map(f => (
                <div key={f.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid var(--outline-variant)' }}>
                  <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--label-muted)' }}>{f.l}</span>
                  <span style={{ fontSize: 12, color: 'var(--on-surface)' }}>{f.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--label-muted)', marginBottom: 16 }}>
              Why ByteBrainiacs?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '▶', text: 'Hands-on engineering experience beyond coursework.' },
                { icon: '▶', text: 'Earn ByteCoins — a custom reward system with real prizes.' },
                { icon: '▶', text: 'Network with peers, faculty mentors, and industry contacts.' },
                { icon: '▶', text: 'Build a project you can showcase in your portfolio.' },
                { icon: '▶', text: 'Certificates issued to all participants who complete the event.' },
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--secondary)', fontSize: 10, marginTop: 3, flexShrink: 0 }}>{b.icon}</span>
                  <span style={{ fontSize: 12, color: 'var(--on-surface-dim)', lineHeight: 1.6 }}>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="accent-line" />

      {/* ── PROBLEM TRACKS ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 36px' }}>
        <span className="eyebrow">// Problem Tracks</span>
        <h2 style={{ fontSize: 28, fontWeight: 500, marginBottom: 32, letterSpacing: -0.5 }}>Choose Your Track</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {TRACKS.map(t => (
            <div key={t.id} className="card card-hover" style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 24, alignItems: 'center' }}>
              <div style={{
                fontSize: 11, letterSpacing: 2, color: 'var(--secondary)',
                padding: '10px 0', fontWeight: 500, textAlign: 'center',
                borderRight: '0.5px solid var(--outline)',
              }}>
                {t.id}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--on-surface)', marginBottom: 6 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-secondary)', lineHeight: 1.6, marginBottom: 10 }}>{t.desc}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {t.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 9, letterSpacing: 1, padding: '3px 8px',
                      border: '0.5px solid var(--border-muted)', borderRadius: 'var(--radius-sm)',
                      color: 'var(--label-muted)', textTransform: 'uppercase',
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
              <Link to="/signup" className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>Join →</Link>
            </div>
          ))}
        </div>
      </section>

      <div className="accent-line" />

      {/* ── RULES ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 36px' }}>
        <span className="eyebrow">// Rules & Guidelines</span>
        <h2 style={{ fontSize: 28, fontWeight: 500, marginBottom: 32, letterSpacing: -0.5 }}>Rules of Engagement</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {RULES.map((r, i) => (
            <div key={i} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 20px' }}>
              <span style={{
                fontSize: 10, letterSpacing: 1.5, color: 'var(--secondary)',
                flexShrink: 0, marginTop: 2,
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 12, color: 'var(--on-surface-dim)', lineHeight: 1.7 }}>{r}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="accent-line" />

      {/* ── ORGANIZERS ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 36px' }}>
        <span className="eyebrow">// The Team</span>
        <h2 style={{ fontSize: 28, fontWeight: 500, marginBottom: 32, letterSpacing: -0.5 }}>Organizers</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {ORGANIZERS.map(o => (
            <div key={o.name} className="card card-hover" style={{ position: 'relative' }}>
              {o.lead && (
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <span className="chip rust" style={{ fontSize: 8 }}>Lead</span>
                </div>
              )}
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--surface-highest)',
                border: o.lead ? '1px solid var(--secondary-dim)' : '0.5px solid var(--outline)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 500, color: o.lead ? 'var(--secondary)' : 'var(--on-surface-dim)',
                marginBottom: 14,
              }}>
                {o.initial}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-surface)', marginBottom: 3 }}>{o.name}</div>
              <div style={{ fontSize: 10, color: 'var(--secondary)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>{o.role}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-secondary)' }}>{o.dept}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="accent-line" />

      {/* ── PREVIOUS EDITIONS ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 36px' }}>
        <span className="eyebrow">// Hall of Fame</span>
        <h2 style={{ fontSize: 28, fontWeight: 500, marginBottom: 8, letterSpacing: -0.5 }}>Previous Editions</h2>
        <p style={{ color: 'var(--ink-secondary)', marginBottom: 36, fontSize: 12 }}>
          ByteBrainiacs has been growing since 2022. Here's what happened before.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {PREVIOUS.map(h => (
            <div key={h.year} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: 4 }}>{h.year}</div>
                  <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--on-surface)' }}>{h.name}</div>
                </div>
                <span className="chip outline">{h.prize}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[{ l: 'Teams', v: h.teams }, { l: 'Participants', v: h.participants }].map(f => (
                  <div key={f.l} style={{ background: 'var(--surface-container)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--label-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{f.l}</div>
                    <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--on-surface)' }}>{f.v}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '0.5px solid var(--outline)', paddingTop: 14, marginBottom: 10 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--label-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Winner</div>
                <div style={{ fontSize: 13, color: 'var(--on-surface)', fontWeight: 500, marginBottom: 3 }}>🏆 {h.winner}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-secondary)' }}>{h.winnerProject}</div>
              </div>

              <div style={{ borderTop: '0.5px solid var(--outline)', paddingTop: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--on-surface-dim)', fontStyle: 'italic' }}>{h.highlight}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '0.5px solid var(--outline)', padding: '24px 36px', marginTop: 48 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Byte<span style={{ color: 'var(--secondary)' }}>Brainiacs</span></span>
          <span style={{ fontSize: 9, color: 'var(--label-muted)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Dept. of Information Technology · 2024
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/" style={{ fontSize: 10, color: 'var(--label-muted)', textDecoration: 'none' }}>Home</Link>
            <Link to="/contact" style={{ fontSize: 10, color: 'var(--label-muted)', textDecoration: 'none' }}>Contact</Link>
            <Link to="/login" style={{ fontSize: 10, color: 'var(--label-muted)', textDecoration: 'none' }}>Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
