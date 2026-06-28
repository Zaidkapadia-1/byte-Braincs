import { useState, useEffect } from 'react';
import api from '../utils/api';

const PRIORITIES = ['critical', 'standard', 'optional'];
const EMPTY_FORM = { title: '', description: '', byteCoinsReward: '', priority: 'standard', deadline: '' };

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'approve'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [approveTask, setApproveTask] = useState(null);
  const [approveTeam, setApproveTeam] = useState('');
  const [approveLoading, setApproveLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null); // { message: '...', type: 'success' | 'error' }

  function showToast(msg, type = 'success') {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function fetchAll() {
    setLoading(true);
    try {
      const [tr, te] = await Promise.all([api.get('/tasks'), api.get('/teams', { params: { limit: 100 } })]);
      setTasks(tr.data);
      setTeams(te.data.teams);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setError('');
    setModal('create');
  }

  function openEdit(t) {
    setForm({
      title: t.title,
      description: t.description,
      byteCoinsReward: t.byteCoinsReward,
      priority: t.priority,
      deadline: t.deadline ? t.deadline.slice(0, 10) : '',
    });
    setEditId(t._id);
    setError('');
    setModal('edit');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    try {
      const payload = { ...form, byteCoinsReward: Number(form.byteCoinsReward) };
      if (!payload.deadline) delete payload.deadline;
      if (editId) {
        await api.put(`/tasks/${editId}`, payload);
        showToast('Task updated successfully!');
      } else {
        await api.post('/tasks', payload);
        showToast('Task created successfully!');
      }
      setModal(null);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task');
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      showToast('Task deleted successfully!');
      fetchAll();
    } catch (err) {
      showToast('Failed to delete task', 'error');
    }
  }

  async function handleToggleStatus(t) {
    try {
      await api.put(`/tasks/${t._id}`, { status: t.status === 'active' ? 'inactive' : 'active' });
      showToast(`Task ${t.status === 'active' ? 'deactivated' : 'activated'} successfully!`);
      fetchAll();
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  }

  async function handleApprove(e) {
    e.preventDefault();
    if (!approveTeam) return;
    setApproveLoading(true);
    try {
      await api.post(`/tasks/${approveTask._id}/approve/${approveTeam}`);
      showToast('Task completion approved successfully!');
      setModal(null);
      setApproveTask(null);
      setApproveTeam('');
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to approve', 'error');
    } finally {
      setApproveLoading(false);
    }
  }

  const priorityColor = { critical: 'error', standard: 'outline', optional: 'pending' };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-breadcrumb">Admin / Tasks</div>
          <h2 className="page-title">ByteCoins Tasks</h2>
          <p className="text-muted" style={{ marginTop: 4, fontSize: 12 }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''} configured</p>
        </div>
        <button id="create-task-btn" className="btn btn-dark btn-sm" onClick={openCreate} style={{ marginTop: 8 }}>
          + Create Task
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 40 }}>
          <span className="spinner" /> <span className="text-muted">Loading...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p className="text-muted">No tasks yet. Create the first one.</p>
          <button className="btn btn-dark" style={{ marginTop: 16 }} onClick={openCreate}>Create Task</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {tasks.map(t => (
            <div key={t._id} className="card" style={{ opacity: t.status === 'inactive' ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span className={`chip ${priorityColor[t.priority]}`}>{t.priority}</span>
                <span className={`chip ${t.status === 'active' ? 'success' : 'outline'}`}>{t.status}</span>
              </div>
              <h3 style={{ marginBottom: 8 }}>{t.title}</h3>
              <p className="text-muted" style={{ fontSize: 12, marginBottom: 16 }}>{t.description}</p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div className="stat-label">Reward</div>
                  <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--secondary)' }}>₿{t.byteCoinsReward}</div>
                </div>
                {t.deadline && (
                  <div style={{ textAlign: 'right' }}>
                    <div className="stat-label">Deadline</div>
                    <div style={{ fontSize: 12 }}>{new Date(t.deadline).toLocaleDateString('en-IN')}</div>
                  </div>
                )}
              </div>

              <hr className="divider-dashed" style={{ margin: '0 0 14px' }} />

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>Edit</button>
                <button
                  className={`btn btn-sm ${t.status === 'active' ? 'btn-outline' : 'btn-ghost'}`}
                  onClick={() => handleToggleStatus(t)}
                  style={{ fontSize: 11 }}
                >
                  {t.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  style={{ fontSize: 11 }}
                  onClick={() => { setApproveTask(t); setApproveTeam(''); setModal('approve'); }}
                >
                  Approve Team
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)} style={{ fontSize: 11 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 20 }}>
              <span className="chip">{modal === 'create' ? 'New Task' : 'Edit Task'}</span>
              <h2 style={{ marginTop: 10 }}>{modal === 'create' ? 'Create Task' : 'Edit Task'}</h2>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="input-wrap">
                  <label className="input-label">Title</label>
                  <input
                    id="task-title"
                    className="input"
                    placeholder="Task title"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>
                <div className="input-wrap">
                  <label className="input-label">Description</label>
                  <textarea
                    id="task-desc"
                    className="input"
                    style={{ minHeight: 80, resize: 'vertical' }}
                    placeholder="What needs to be done..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-grid">
                  <div className="input-wrap">
                    <label className="input-label">ByteCoins Reward</label>
                    <input
                      id="task-reward"
                      type="number"
                      min="1"
                      className="input"
                      placeholder="e.g. 100"
                      value={form.byteCoinsReward}
                      onChange={e => setForm(f => ({ ...f, byteCoinsReward: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">Priority</label>
                    <select
                      id="task-priority"
                      className="input"
                      value={form.priority}
                      onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    >
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="input-wrap col-span-2">
                    <label className="input-label">Deadline (optional)</label>
                    <input
                      id="task-deadline"
                      type="date"
                      className="input"
                      value={form.deadline}
                      onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button
                  id="save-task-btn"
                  type="submit"
                  className="btn btn-dark"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={saveLoading}
                >
                  {saveLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : (modal === 'create' ? 'Create Task' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {modal === 'approve' && approveTask && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 20 }}>
              <span className="chip rust">Approve Completion</span>
              <h2 style={{ marginTop: 10 }}>{approveTask.title}</h2>
              <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
                Award ₿{approveTask.byteCoinsReward} to the selected team
              </p>
            </div>
            <form onSubmit={handleApprove}>
              <div className="input-wrap">
                <label className="input-label">Select Team</label>
                <select
                  id="approve-team-select"
                  className="input"
                  value={approveTeam}
                  onChange={e => setApproveTeam(e.target.value)}
                  required
                >
                  <option value="">-- Select Team --</option>
                  {teams.filter(t => t.status === 'approved').map(t => (
                    <option key={t._id} value={t._id}>
                      {t.teamCode} — {t.teamName} ({t.byteCoins} ₿C)
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button
                  id="confirm-approve-btn"
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={approveLoading || !approveTeam}
                >
                  {approveLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : `Award ₿${approveTask.byteCoinsReward}`}
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
