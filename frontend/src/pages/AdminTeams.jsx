import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { exportTeamsToExcel } from '../utils/excel';

const STATUS_OPTIONS = ['all', 'pending', 'verified', 'flagged'];
const TYPE_OPTIONS = ['all', 'team', 'individual'];

export default function AdminTeams() {
  const [teams, setTeams] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // team for detail modal
  const [awardModal, setAwardModal] = useState(null); // team for award coins
  const [awardForm, setAwardForm] = useState({ amount: '', note: '' });
  const [awardLoading, setAwardLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, search, type, status };
      const res = await api.get('/teams', { params });
      setTeams(res.data.teams);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, type, status]);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  async function updateStatus(id, newStatus) {
    await api.patch(`/teams/${id}/status`, { status: newStatus });
    fetchTeams();
    if (selected?._id === id) setSelected(s => ({ ...s, status: newStatus }));
  }

  async function handleExport() {
    setExportLoading(true);
    try {
      const res = await api.get('/teams/export/all');
      exportTeamsToExcel(res.data);
    } catch (e) {
      alert('Export failed');
    } finally {
      setExportLoading(false);
    }
  }

  async function handleAward(e) {
    e.preventDefault();
    setAwardLoading(true);
    try {
      await api.post(`/teams/${awardModal._id}/bytecoins`, {
        amount: Number(awardForm.amount),
        note: awardForm.note,
      });
      setAwardModal(null);
      setAwardForm({ amount: '', note: '' });
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to award coins');
    } finally {
      setAwardLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="page-breadcrumb">admin // teams</div>
          <h2 className="page-title">Registered Teams</h2>
          <p className="text-muted" style={{ marginTop: 4, fontSize: 12 }}>{total} total registration{total !== 1 ? 's' : ''}</p>
        </div>
        <button
          id="export-excel"
          className="btn btn-dark btn-sm"
          onClick={handleExport}
          disabled={exportLoading}
          style={{ marginTop: 8 }}
        >
          {exportLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '↓ Export Excel'}
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          id="search-teams"
          className="input"
          style={{ flex: '1 1 200px', maxWidth: 300 }}
          placeholder="> search_teams..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          id="filter-type"
          className="input"
          style={{ width: 140 }}
          value={type}
          onChange={e => { setType(e.target.value); setPage(1); }}
        >
          {TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select
          id="filter-status"
          className="input"
          style={{ width: 140 }}
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
        >
          {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span className="spinner" /> <span className="text-muted">Loading...</span>
          </div>
        ) : teams.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p className="text-muted">No teams found.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Team</th>
                <th>Type</th>
                <th>Members</th>
                <th>Dept</th>
                <th>₿Coins</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(t => (
                <tr key={t._id}>
                  <td style={{ fontFamily: 'var(--font)', fontSize: 12, color: 'var(--secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {t.teamCode}
                  </td>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{t.teamName}</td>
                  <td>
                    <span className={`chip ${t.registrationType === 'individual' ? 'rust' : 'outline'}`}>
                      {t.registrationType}
                    </span>
                  </td>
                  <td className="text-muted" style={{ fontSize: 12 }}>{t.members.length}</td>
                  <td style={{ fontSize: 12, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.department}
                  </td>
                  <td style={{ fontWeight: 500, color: t.byteCoins > 0 ? 'var(--secondary)' : undefined }}>
                    {t.byteCoins}
                  </td>
                  <td>
                    <span className={`chip ${t.status === 'verified' ? 'success' : t.status === 'flagged' ? 'error' : 'pending'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="text-muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                    {new Date(t.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelected(t)}>view</button>
                      <button className="btn btn-sm" style={{ background: 'var(--secondary)', color: '#fff', padding: '4px 10px', fontSize: 11 }} onClick={() => setAwardModal(t)}>₿C</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination" style={{ marginTop: 16, justifyContent: 'center' }}>
          <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <span className={`chip ${selected.registrationType === 'individual' ? 'rust' : ''}`} style={{ marginBottom: 8 }}>
                  {selected.registrationType}
                </span>
                <h2 style={{ marginTop: 8 }}>{selected.teamName}</h2>
                <p style={{ color: 'var(--secondary)', fontFamily: 'var(--font)', fontSize: 16, fontWeight: 500, marginTop: 4 }}>{selected.teamCode}</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕ Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <InfoRow label="Department" value={selected.department} />
              <InfoRow label="Contact Email" value={selected.contactEmail} />
              <InfoRow label="Contact Phone" value={selected.contactPhone} />
              <InfoRow label="ByteCoins" value={selected.byteCoins} accent />
              <InfoRow label="Registered" value={new Date(selected.createdAt).toLocaleString('en-IN')} />
              <InfoRow label="Status" value={selected.status} />
            </div>

            <hr className="divider-dashed" style={{ margin: '16px 0' }} />

            <div style={{ marginBottom: 20 }}>
              <div className="input-label" style={{ marginBottom: 12 }}>Members</div>
              {selected.members.map((m, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'var(--surface-container)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{m.name}</div>
                  <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>{m.email}{m.phone ? ` · ${m.phone}` : ''}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="text-muted text-xs uppercase" style={{ alignSelf: 'center', flex: 1 }}>Update Status:</span>
              {['verified', 'pending', 'flagged'].map(s => (
                <button
                  key={s}
                  className={`btn btn-sm ${selected.status === s ? 'btn-dark' : 'btn-ghost'}`}
                  onClick={() => updateStatus(selected._id, s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Award ByteCoins Modal */}
      {awardModal && (
        <div className="modal-overlay" onClick={() => setAwardModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 20 }}>
              <div className="chip rust" style={{ marginBottom: 10 }}>ByteCoins</div>
              <h2>Award ₿C to</h2>
              <p style={{ color: 'var(--secondary)', fontFamily: 'var(--font)', fontSize: 14, marginTop: 4 }}>{awardModal.teamName} ({awardModal.teamCode})</p>
            </div>
            <form onSubmit={handleAward}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="input-wrap">
                  <label className="input-label">Amount</label>
                  <input
                    id="award-amount"
                    type="number"
                    min="1"
                    className="input"
                    placeholder="> 50"
                    value={awardForm.amount}
                    onChange={e => setAwardForm(f => ({ ...f, amount: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>
                <div className="input-wrap">
                  <label className="input-label">Note (optional)</label>
                  <input
                    id="award-note"
                    className="input"
                    placeholder="> Reason..."
                    value={awardForm.note}
                    onChange={e => setAwardForm(f => ({ ...f, note: e.target.value }))}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setAwardModal(null)}>Cancel</button>
                <button
                  id="award-submit"
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={awardLoading}
                >
                  {awardLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Award Coins'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, accent }) {
  return (
    <div style={{ padding: '10px 14px', background: 'var(--surface-container)', borderRadius: 'var(--radius-sm)' }}>
      <div className="input-label" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: accent ? 500 : undefined, color: accent ? 'var(--secondary)' : undefined }}>{value}</div>
    </div>
  );
}
