import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { exportTeamsToExcel } from '../utils/excel';

const STATUS_OPTIONS = ['all', 'pending', 'approved', 'rejected'];
const TYPE_OPTIONS = ['all', 'team', 'solo'];

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
  const [awardModal, setAwardModal] = useState(null);
  const [awardForm, setAwardForm] = useState({ amount: '', note: '', type: 'credit' });
  const [awardLoading, setAwardLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [revokeModal, setRevokeModal] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');

  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message: '...', type: 'success' | 'error' }

  function showToast(msg, type = 'success') {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  }

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

  async function handleApprove(id) {
    setActionLoading(true);
    try {
      await api.post(`/teams/${id}/approve`);
      showToast('Team approved successfully!');
      fetchTeams();
      if (selected?._id === id) setSelected(null);
    } catch (err) {
      showToast(err.response?.data?.error || 'Approval failed', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(e) {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post(`/teams/${rejectModal._id}/reject`, { reason: rejectReason });
      showToast('Team registration rejected!');
      setRejectModal(null);
      setRejectReason('');
      fetchTeams();
      if (selected?._id === rejectModal._id) setSelected(null);
    } catch (err) {
      showToast(err.response?.data?.error || 'Rejection failed', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleExport() {
    setExportLoading(true);
    try {
      const res = await api.get('/teams/export/all');
      exportTeamsToExcel(res.data);
      showToast('Excel file exported successfully!');
    } catch (e) {
      showToast('Export failed', 'error');
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
        type: awardForm.type,
        note: awardForm.note,
      });
      showToast('ByteCoins updated successfully!');
      setAwardModal(null);
      setAwardForm({ amount: '', note: '', type: 'credit' });
      fetchTeams();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update coins', 'error');
    } finally {
      setAwardLoading(false);
    }
  }

  async function handleRevoke(e) {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post(`/teams/${revokeModal._id}/revoke`, { reason: revokeReason });
      showToast('Team approval revoked successfully!');
      setRevokeModal(null);
      setRevokeReason('');
      setSelected(null);
      fetchTeams();
    } catch (err) {
      showToast(err.response?.data?.error || 'Revoke failed', 'error');
    } finally {
      setActionLoading(false);
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
          {TYPE_OPTIONS.map(o => (
            <option key={o} value={o}>
              {o === 'all' ? 'All Types' : o.charAt(0).toUpperCase() + o.slice(1)}
            </option>
          ))}
        </select>
        <select
          id="filter-status"
          className="input"
          style={{ width: 140 }}
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o} value={o}>
              {o === 'all' ? 'All Statuses' : o.charAt(0).toUpperCase() + o.slice(1)}
            </option>
          ))}
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
                    <span className={`chip ${t.registrationType === 'solo' ? 'rust' : 'outline'}`}>
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
                    <span className={`chip ${(t.status === 'approved' || t.status === 'verified') ? 'success' : (t.status === 'rejected' || t.status === 'flagged') ? 'error' : 'pending'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="text-muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                    {new Date(t.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelected(t)}>view</button>
                      {t.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-sm"
                            style={{ background: '#16a34a', color: '#fff', padding: '4px 10px', fontSize: 11 }}
                            disabled={actionLoading}
                            onClick={() => handleApprove(t._id)}
                          >✓ Approve</button>
                          <button
                            className="btn btn-sm"
                            style={{ background: 'var(--secondary)', color: '#fff', padding: '4px 10px', fontSize: 11 }}
                            onClick={() => { setRejectModal(t); setRejectReason(''); }}
                          >✕ Reject</button>
                        </>
                      )}
                      {(t.status === 'approved' || t.status === 'verified') && (
                        <button className="btn btn-sm" style={{ background: 'var(--secondary)', color: '#fff', padding: '4px 10px', fontSize: 11 }} onClick={() => setAwardModal(t)}>₿C</button>
                      )}
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
                <span className={`chip ${selected.registrationType === 'solo' ? 'rust' : ''}`} style={{ marginBottom: 8 }}>
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
              {selected.status === 'pending' && (
                <>
                  <button
                    className="btn btn-sm"
                    style={{ background: '#16a34a', color: '#fff' }}
                    disabled={actionLoading}
                    onClick={() => handleApprove(selected._id)}
                  >{actionLoading ? '...' : '✓ Approve'}</button>
                  <button
                    className="btn btn-sm"
                    style={{ background: 'var(--secondary)', color: '#fff' }}
                    onClick={() => { setRejectModal(selected); setRejectReason(''); }}
                  >✕ Reject</button>
                </>
              )}
              {(selected.status === 'approved' || selected.status === 'verified') && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm btn-dark" onClick={() => { setAwardModal(selected); setSelected(null); }}>₿ Coins</button>
                  <button
                    className="btn btn-sm"
                    style={{ background: '#7c1d1d', color: '#fff' }}
                    onClick={() => { setRevokeModal(selected); setRevokeReason(''); setSelected(null); }}
                  >⊘ Revoke</button>
                </div>
              )}
              <span style={{ fontSize: 11, color: 'var(--label-muted)', alignSelf: 'center', marginLeft: 4 }}>
                Current: <strong>{selected.status}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Award / Deduct ByteCoins Modal */}
      {awardModal && (
        <div className="modal-overlay" onClick={() => setAwardModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 20 }}>
              <div className="chip rust" style={{ marginBottom: 10 }}>ByteCoins</div>
              <h2>Manage ₿C — {awardModal.teamName}</h2>
              <p style={{ color: 'var(--secondary)', fontFamily: 'var(--font)', fontSize: 13, marginTop: 4 }}>
                Current balance: <strong>₿{awardModal.byteCoins}</strong>
              </p>
            </div>
            <form onSubmit={handleAward}>
              {/* Credit / Deduct Toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[{ val: 'credit', label: '+ Credit', color: '#16a34a' }, { val: 'deduct', label: '− Deduct', color: 'var(--secondary)' }].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setAwardForm(f => ({ ...f, type: opt.val }))}
                    style={{
                      padding: '10px',
                      border: `2px solid ${awardForm.type === opt.val ? opt.color : 'var(--outline)'}`,
                      borderRadius: 'var(--radius-sm)',
                      background: awardForm.type === opt.val ? `${opt.color}22` : 'transparent',
                      color: awardForm.type === opt.val ? opt.color : 'var(--label-muted)',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >{opt.label}</button>
                ))}
              </div>
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
                  style={{ flex: 1, justifyContent: 'center', background: awardForm.type === 'deduct' ? 'var(--secondary)' : undefined }}
                  disabled={awardLoading}
                >
                  {awardLoading
                    ? <span className="spinner" style={{ width: 14, height: 14 }} />
                    : awardForm.type === 'deduct' ? `− Deduct ₿${awardForm.amount || 0}` : `+ Award ₿${awardForm.amount || 0}`
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 20 }}>
              <div className="chip error" style={{ marginBottom: 10 }}>Reject Registration</div>
              <h2>Reject Team</h2>
              <p style={{ color: 'var(--secondary)', fontFamily: 'var(--font)', fontSize: 14, marginTop: 4 }}>{rejectModal.teamName}</p>
            </div>
            <form onSubmit={handleReject}>
              <div className="input-wrap" style={{ marginBottom: 16 }}>
                <label className="input-label">Reason for rejection</label>
                <textarea
                  className="input"
                  style={{ minHeight: 80, resize: 'vertical' }}
                  placeholder="> Explain why this registration is being rejected..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setRejectModal(null)}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={actionLoading}
                >
                  {actionLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Approval Modal */}
      {revokeModal && (
        <div className="modal-overlay" onClick={() => setRevokeModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 20 }}>
              <div className="chip error" style={{ marginBottom: 10 }}>Revoke Approval</div>
              <h2>Revoke — {revokeModal.teamName}</h2>
              <p style={{ fontSize: 12, color: 'var(--label-muted)', marginTop: 6, lineHeight: 1.6 }}>
                This will reset the team to <strong>Pending</strong>, clear their team code and reset ByteCoins to 0. They will be notified by email.
              </p>
            </div>
            <form onSubmit={handleRevoke}>
              <div className="input-wrap" style={{ marginBottom: 16 }}>
                <label className="input-label">Reason (optional)</label>
                <textarea
                  className="input"
                  style={{ minHeight: 80, resize: 'vertical' }}
                  placeholder="> Reason for revoking approval..."
                  value={revokeReason}
                  onChange={e => setRevokeReason(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setRevokeModal(null)}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center', background: '#7c1d1d' }}
                  disabled={actionLoading}
                >
                  {actionLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '⊘ Confirm Revoke'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 300,
          background: toast.type === 'success' ? '#122a1e' : '#2d1414',
          border: `1px solid ${toast.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
          color: toast.type === 'success' ? '#68d391' : '#fc8181',
          padding: '12px 20px', borderRadius: 'var(--radius)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'slideIn 0.3s ease-out',
        }}>
          <span style={{ fontSize: 16 }}>{toast.type === 'success' ? '✓' : '✕'}</span>
          <span style={{ fontSize: 12, fontWeight: 500, fontFamily: 'var(--font)' }}>{toast.message}</span>
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
