import { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    q: 'Who can participate in ByteBrainiacs?',
    a: 'Only students currently enrolled in the Department of Information Technology are eligible to participate.',
  },
  {
    q: 'How many members can a team have?',
    a: 'Teams can have 2 to 4 members. Solo participants are accepted and will be grouped into teams by the organizers after registration approval.',
  },
  {
    q: 'Is registration free?',
    a: 'Yes. Registration is completely free for all eligible students.',
  },
  {
    q: 'When do we get our Team Code?',
    a: 'Your Team Code is issued after your registration has been reviewed and approved by the organizing committee. You will receive it via email.',
  },
  {
    q: 'What are ByteCoins?',
    a: 'ByteCoins (₿C) are our in-event reward currency. Teams earn coins by completing tasks and challenges during the hackathon. Top earners win prizes.',
  },
  {
    q: 'Can I register for two teams?',
    a: 'No. Each participant can only be registered under one team. Duplicate registrations will be rejected.',
  },
];

const CONTACTS = [
  { role: 'Student Lead', name: 'Priya Sharma', email: 'priya.sharma@bytebrainiacs.in', phone: '+91 98765 43210' },
  { role: 'Faculty Coordinator', name: 'Dr. Arjun Mehta', email: 'dr.mehta@college.edu.in', phone: '+91 22 2880 5000' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    // Simulate send — replace with actual email API if needed
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--on-surface)' }}>

      {/* ── NAV ── */}
      <nav className="nav">
        <Link to="/" className="nav-brand">Byte<span>Brainiacs</span></Link>
        <div className="pub-nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link active">Contact</Link>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Register →</Link>
        </div>
      </nav>

      {/* ── PAGE HEADER ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 36px 48px', borderBottom: '0.5px solid var(--outline)' }}>
        <span className="eyebrow">// Get in Touch</span>
        <h1 style={{ fontSize: 44, fontWeight: 500, letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 16 }}>
          Contact &amp;<br /><span style={{ color: 'var(--secondary)' }}>Support</span>
        </h1>
        <p style={{ maxWidth: 520, fontSize: 14, lineHeight: 1.9, color: 'var(--on-surface-dim)' }}>
          Have a question about registration, tracks, or the event? Reach out to the organizing team directly
          or use the form below. We respond within 24 hours.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 40, alignItems: 'flex-start' }}>

          {/* LEFT — Contact cards + location + social */}
          <div>
            {/* Direct contacts */}
            <span className="eyebrow">// Direct Contacts</span>
            <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 20, letterSpacing: -0.5 }}>Organizing Committee</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
              {CONTACTS.map(c => (
                <div key={c.name} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: 4 }}>{c.role}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--on-surface)', marginBottom: 8 }}>{c.name}</div>
                    <a href={`mailto:${c.email}`} style={{
                      fontSize: 11, color: 'var(--ink-secondary)', textDecoration: 'none',
                      display: 'block', marginBottom: 4,
                    }}>
                      ✉ {c.email}
                    </a>
                    <div style={{ fontSize: 11, color: 'var(--ink-secondary)' }}>☎ {c.phone}</div>
                  </div>
                  <a href={`mailto:${c.email}`} className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>Email →</a>
                </div>
              ))}
            </div>

            {/* Location */}
            <span className="eyebrow">// Venue</span>
            <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 20, letterSpacing: -0.5 }}>Location</h2>

            <div className="card" style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--on-surface)', marginBottom: 4 }}>
                Atharva College of Engineering
              </div>
              <div style={{ fontSize: 11, color: 'var(--secondary)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                Department of Information Technology
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-secondary)', lineHeight: 1.8 }}>
                Malad–Marve Road, Charkop Naka<br />
                Malad (West), Mumbai – 400 095<br />
                Maharashtra, India
              </div>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '0.5px solid var(--outline)', display: 'flex', gap: 16, fontSize: 11 }}>
                <div>
                  <div style={{ color: 'var(--label-muted)', letterSpacing: 1, textTransform: 'uppercase', fontSize: 9, marginBottom: 4 }}>Nearest Station</div>
                  <div style={{ color: 'var(--on-surface-dim)' }}>Malad (W) · 2 km</div>
                </div>
                <div style={{ borderLeft: '0.5px solid var(--outline)', paddingLeft: 16 }}>
                  <div style={{ color: 'var(--label-muted)', letterSpacing: 1, textTransform: 'uppercase', fontSize: 9, marginBottom: 4 }}>Landmark</div>
                  <div style={{ color: 'var(--on-surface-dim)' }}>Charkop Bus Stop</div>
                </div>
              </div>
            </div>

            {/* Social / Links */}
            <span className="eyebrow">// Follow Us</span>
            <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 20, letterSpacing: -0.5 }}>Socials &amp; Links</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Instagram', handle: '@bytebrainiacs_it', href: '#' },
                { label: 'LinkedIn', handle: 'ByteBrainiacs Hackathon', href: '#' },
                { label: 'Email', handle: 'info@bytebrainiacs.in', href: 'mailto:info@bytebrainiacs.in' },
                { label: 'Telegram', handle: 'Join our channel', href: '#' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="card card-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                    <div>
                      <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--label-muted)', marginRight: 12 }}>{s.label}</span>
                      <span style={{ fontSize: 12, color: 'var(--on-surface-dim)' }}>{s.handle}</span>
                    </div>
                    <span style={{ color: 'var(--secondary)', fontSize: 12 }}>→</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT — Contact Form + FAQs */}
          <div>
            <span className="eyebrow">// Send a Message</span>
            <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 20, letterSpacing: -0.5 }}>Contact Form</h2>

            <div className="card" style={{ marginBottom: 36 }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: 28, marginBottom: 16 }}>✓</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--on-surface)', marginBottom: 8 }}>Message Sent</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-secondary)', marginBottom: 20 }}>
                    We'll get back to you within 24 hours.
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSent(false)}>Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="input-wrap">
                      <label className="input-label">Full Name</label>
                      <input
                        className="input" placeholder="> Your full name"
                        value={form.name} onChange={e => setField('name', e.target.value)} required
                      />
                    </div>
                    <div className="input-wrap">
                      <label className="input-label">Email</label>
                      <input
                        type="email" className="input" placeholder="> your@email.com"
                        value={form.email} onChange={e => setField('email', e.target.value)} required
                      />
                    </div>
                    <div className="input-wrap">
                      <label className="input-label">Subject</label>
                      <select
                        className="input"
                        value={form.subject} onChange={e => setField('subject', e.target.value)} required
                      >
                        <option value="">Select a topic</option>
                        <option>Registration Query</option>
                        <option>Team Formation</option>
                        <option>ByteCoins / Tasks</option>
                        <option>Technical Issue</option>
                        <option>Sponsorship / Partnership</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="input-wrap">
                      <label className="input-label">Message</label>
                      <textarea
                        className="input"
                        style={{ minHeight: 100, resize: 'vertical' }}
                        placeholder="> Describe your query..."
                        value={form.message} onChange={e => setField('message', e.target.value)} required
                      />
                    </div>
                  </div>
                  <button
                    type="submit" className="btn btn-primary w-full"
                    style={{ marginTop: 18, justifyContent: 'center' }}
                    disabled={loading}
                  >
                    {loading ? <span className="spinner" /> : 'Send Message →'}
                  </button>
                </form>
              )}
            </div>

            {/* FAQs */}
            <span className="eyebrow">// Quick Answers</span>
            <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 20, letterSpacing: -0.5 }}>FAQ</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {FAQS.map((f, i) => (
                <div
                  key={i}
                  style={{
                    border: '0.5px solid',
                    borderColor: openFaq === i ? 'var(--secondary-dim)' : 'var(--outline)',
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                    background: openFaq === i ? 'var(--surface-container)' : 'var(--surface-low)',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: '14px 16px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      font: 'inherit', color: 'var(--on-surface)', fontSize: 12, textAlign: 'left',
                    }}
                  >
                    <span style={{ fontWeight: openFaq === i ? 500 : 400 }}>{f.q}</span>
                    <span style={{ color: 'var(--secondary)', fontSize: 14, flexShrink: 0, marginLeft: 12 }}>
                      {openFaq === i ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div style={{
                      padding: '0 16px 14px',
                      fontSize: 12, color: 'var(--ink-secondary)', lineHeight: 1.7,
                      borderTop: '0.5px solid var(--outline)',
                      paddingTop: 12,
                    }}>
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '0.5px solid var(--outline)', padding: '24px 36px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Byte<span style={{ color: 'var(--secondary)' }}>Brainiacs</span></span>
          <span style={{ fontSize: 9, color: 'var(--label-muted)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Dept. of Information Technology · 2024
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/" style={{ fontSize: 10, color: 'var(--label-muted)', textDecoration: 'none' }}>Home</Link>
            <Link to="/about" style={{ fontSize: 10, color: 'var(--label-muted)', textDecoration: 'none' }}>About</Link>
            <Link to="/login" style={{ fontSize: 10, color: 'var(--label-muted)', textDecoration: 'none' }}>Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
