import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await api.get('/teams/analytics/summary');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, display: 'flex', gap: 12, alignItems: 'center' }}>
        <span className="spinner" /> <span className="text-muted">Loading Analytics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p className="text-muted">No analytics data available.</p>
      </div>
    );
  }

  const {
    totalRegistrations,
    statusBreakdown: { pending = 0, approved = 0, rejected = 0 } = {},
    typeBreakdown: { team = 0, solo = 0 } = {},
    departmentData = [],
    coinsStats: { totalCoins = 0, averageCoins = 0, maxCoins = 0 } = {},
    trendData = []
  } = data;

  const totalStatus = pending + approved + rejected;
  const appPct = totalStatus > 0 ? Math.round((approved / totalStatus) * 100) : 0;
  const penPct = totalStatus > 0 ? Math.round((pending / totalStatus) * 100) : 0;
  const rejPct = totalStatus > 0 ? Math.round((rejected / totalStatus) * 100) : 0;

  const totalType = team + solo;
  const teamPct = totalType > 0 ? Math.round((team / totalType) * 100) : 0;
  const soloPct = totalType > 0 ? Math.round((solo / totalType) * 100) : 0;

  const maxDeptCount = departmentData.length > 0 ? Math.max(...departmentData.map(d => d.count)) : 0;

  // Trend Chart Config
  const maxTrend = trendData.length > 0 ? Math.max(...trendData.map(d => d.count)) : 0;
  const chartWidth = 600;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 25;
  const graphWidth = chartWidth - paddingX * 2;
  const graphHeight = chartHeight - paddingY * 2;

  return (
    <div>
      {/* HEADER */}
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div className="page-breadcrumb">admin // insights</div>
        <h2 className="page-title">Analytics Dashboard</h2>
        <p className="text-muted" style={{ marginTop: 4, fontSize: 12 }}>
          Real-time metrics, participation counts, and event trends.
        </p>
      </div>

      {/* OVERVIEW STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label">Total Submissions</div>
          <div className="stat-value">{totalRegistrations}</div>
          <div className="stat-sub">Squads & Solo operatives</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total ByteCoins</div>
          <div className="stat-value" style={{ color: 'var(--secondary)' }}>₿{totalCoins}</div>
          <div className="stat-sub">Currently in circulation</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Coins</div>
          <div className="stat-value">₿{averageCoins}</div>
          <div className="stat-sub">Per approved team</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Peak balance</div>
          <div className="stat-value">₿{maxCoins}</div>
          <div className="stat-sub">Highest individual squad</div>
        </div>
      </div>

      {/* REGISTRATION TYPE BREAKDOWN */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        <CircularProgress percent={teamPct} color="var(--primary)" label="SQUAD ENTRIES" count={team} />
        <CircularProgress percent={soloPct} color="var(--secondary)" label="SOLO OPERATIVES" count={solo} />
      </div>

      {/* STATUS BREAKDOWN */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, letterSpacing: 0.5 }}>Submission Status Breakdown</h3>
          <span className="chip outline">{totalStatus} registrations</span>
        </div>
        <div style={{ height: 10, display: 'flex', borderRadius: 4, overflow: 'hidden', background: 'var(--outline)', margin: '18px 0' }}>
          {appPct > 0 && <div style={{ width: `${appPct}%`, background: 'var(--success)', transition: 'width 0.5s' }} />}
          {penPct > 0 && <div style={{ width: `${penPct}%`, background: '#f59e0b', transition: 'width 0.5s' }} />}
          {rejPct > 0 && <div style={{ width: `${rejPct}%`, background: 'var(--error)', transition: 'width 0.5s' }} />}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 8 }}>
          <LegendItem color="var(--success)" label="Approved" count={approved} percent={appPct} />
          <LegendItem color="#f59e0b" label="Pending" count={pending} percent={penPct} />
          <LegendItem color="var(--error)" label="Rejected" count={rejected} percent={rejPct} />
        </div>
      </div>

      {/* TWO COLUMN CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        
        {/* DEPARTMENT BREAKDOWN */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 14 }}>Department Distribution</h3>
            <span className="chip dim">top departments</span>
          </div>
          {departmentData.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 12, padding: '20px 0' }}>No department data yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {departmentData.map(dept => {
                const pct = Math.round((dept.count / maxDeptCount) * 100) || 0;
                return (
                  <div key={dept.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
                      <span style={{ color: 'var(--on-surface-variant)' }}>{dept.name}</span>
                      <span style={{ fontWeight: 600 }}>{dept.count}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--surface-highest)', border: '0.5px solid var(--outline)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--secondary)', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* REGISTRATION TIMELINE */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 14 }}>Registration Trend</h3>
            <span className="chip dim">daily counts</span>
          </div>
          {trendData.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 12, padding: '40px 0', textAlign: 'center' }}>No timeline data yet.</p>
          ) : (
            <div style={{ background: 'var(--surface-dark)', border: '0.5px solid var(--outline)', borderRadius: 'var(--radius)', padding: '16px 12px' }}>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%">
                {/* Horizontal Gridlines */}
                {[0, 0.5, 1].map((ratio, index) => {
                  const y = paddingY + ratio * graphHeight;
                  return (
                    <line
                      key={index}
                      x1={paddingX} y1={y}
                      x2={chartWidth - paddingX} y2={y}
                      stroke="var(--outline)" strokeWidth="0.5" strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Bars */}
                {trendData.map((d, i) => {
                  const stepX = trendData.length > 1 ? graphWidth / (trendData.length - 1) : graphWidth;
                  const x = paddingX + i * stepX;
                  const barHeight = maxTrend > 0 ? (d.count / maxTrend) * graphHeight : 0;
                  const y = chartHeight - paddingY - barHeight;

                  return (
                    <g key={d.date}>
                      <rect
                        x={x - 6} y={y}
                        width="12"
                        height={barHeight}
                        fill="var(--secondary)"
                        opacity="0.8"
                        rx="2"
                      />
                      <text x={x} y={chartHeight - 8} textAnchor="middle" fill="var(--ink-secondary)" style={{ fontSize: 8, fontFamily: 'var(--font)' }}>
                        {d.date.slice(5)}
                      </text>
                      <text x={x} y={y - 6} textAnchor="middle" fill="var(--on-surface)" style={{ fontSize: 9, fontWeight: 600, fontFamily: 'var(--font)' }}>
                        {d.count}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CircularProgress({ percent, color, label, count }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '18px 24px' }}>
      <svg width="80" height="80" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
        <circle cx="40" cy="40" r={radius} fill="transparent" stroke="var(--outline)" strokeWidth="5" />
        <circle
          cx="40" cy="40" r={radius} fill="transparent"
          stroke={color} strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease-in-out' }}
        />
        <text
          x="40" y="-36"
          transform="rotate(90)"
          textAnchor="middle" dominantBaseline="middle"
          fill="var(--on-surface)"
          style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font)' }}
        >
          {percent}%
        </text>
      </svg>
      <div>
        <div className="input-label" style={{ fontSize: 9, color: 'var(--label-muted)' }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 500, marginTop: 4 }}>{count} Registrations</div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, count, percent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
      <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{label}:</span>
      <span style={{ fontSize: 11, fontWeight: 600 }}>{count} ({percent}%)</span>
    </div>
  );
}
