import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teams/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 40 }}>
      <span className="spinner" /> <span className="text-muted">Loading dashboard...</span>
    </div>
  );

  const { totalTeams = 0, totalSolo = 0, totalParticipants = 0, topTeams = [], recentRegs = [], trend = [] } = stats || {};
  const totalRegistrations = totalTeams + totalSolo;

  return (
    <div>
      <div className="page-header">
        <div className="page-breadcrumb">admin // overview</div>
        <h2 className="page-title">Dashboard</h2>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Registrations" value={totalRegistrations} sub="teams + solo" />
        <StatCard label="Team Entries" value={totalTeams} sub="4-member teams" />
        <StatCard label="Solo Operatives" value={totalSolo} sub="individual participants" accent />
        <StatCard label="Total Participants" value={totalParticipants} sub="across all entries" />
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Top Teams by ByteCoins */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3>ByteCoins Leaderboard</h3>
            <span className="chip outline">top 5</span>
          </div>
          {topTeams.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 12 }}>No data yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>Type</th>
                  <th>₿C</th>
                </tr>
              </thead>
              <tbody>
                {topTeams.map((t, i) => (
                  <tr key={t._id}>
                    <td className="text-muted" style={{ fontSize: 11 }}>{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 12 }}>{t.teamName}</div>
                      <div className="text-muted text-xs">{t.teamCode}</div>
                    </td>
                    <td>
                      <span className={`chip ${t.registrationType === 'solo' ? 'rust' : 'outline'}`}>
                        {t.registrationType}
                      </span>
                    </td>
                    <td style={{ color: 'var(--secondary)', fontWeight: 500 }}>{t.byteCoins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Registrations */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3>Recent Registrations</h3>
            <span className="chip outline">last 7</span>
          </div>
          {recentRegs.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 12 }}>No registrations yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentRegs.map(r => (
                <div key={r._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid var(--border-muted)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{r.teamName}</div>
                    <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>
                      {r.teamCode} · {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <span className={`chip ${r.registrationType === 'solo' ? 'rust' : ''}`}>
                    {r.registrationType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trend section */}
      {trend.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 20 }}>Registration Trend (7 days)</h3>
          <Sparkbar data={trend} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card" style={accent ? { borderColor: 'var(--secondary)' } : {}}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={accent ? { color: 'var(--secondary)' } : {}}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function Sparkbar({ data }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 80, overflowX: 'auto', paddingBottom: 4 }}>
      {data.map(d => (
        <div key={d._id} style={{ width: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <div
            style={{
              width: '100%',
              height: `${(d.count / max) * 60}px`,
              minHeight: 4,
              background: 'var(--secondary)',
              borderRadius: 2,
              opacity: 0.85,
            }}
          />
          <span style={{ fontSize: 9, letterSpacing: 0.5, color: 'var(--label-muted)' }}>
            {d._id.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}
