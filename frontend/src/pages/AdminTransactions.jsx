import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function AdminTransactions() {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/transactions/all')
      .then(r => setTxs(r.data))
      .finally(() => setLoading(false));
  }, []);

  const totalAwarded = txs.filter(t => t.type === 'credit').reduce((a, t) => a + t.amount, 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-breadcrumb">admin // ledger</div>
        <h2 className="page-title">ByteCoins Ledger</h2>
        <p className="text-muted" style={{ marginTop: 4, fontSize: 12 }}>
          {txs.length} transaction{txs.length !== 1 ? 's' : ''} · ₿{totalAwarded} total awarded
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{txs.length}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'var(--secondary)' }}>
          <div className="stat-label">Total ₿C Awarded</div>
          <div className="stat-value" style={{ color: 'var(--secondary)' }}>₿{totalAwarded}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Teams with ₿C</div>
          <div className="stat-value">{new Set(txs.map(t => t.teamCode)).size}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span className="spinner" /> <span className="text-muted">Loading ledger...</span>
          </div>
        ) : txs.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <p className="text-muted">No transactions yet. Award ByteCoins from the Teams or Tasks panel.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Team</th>
                <th>Task</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Note</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {txs.map(tx => (
                <tr key={tx._id}>
                  <td className="text-muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                    {new Date(tx.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{tx.teamName}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>{tx.teamCode}</div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                    {tx.taskTitle || <span className="text-muted">—</span>}
                  </td>
                  <td>
                    <span style={{
                      fontWeight: 500,
                      color: tx.type === 'credit' ? 'var(--success)' : 'var(--error)',
                      fontFamily: 'var(--font)',
                    }}>
                      {tx.type === 'credit' ? '+' : '-'}₿{tx.amount}
                    </span>
                  </td>
                  <td>
                    <span className={`chip ${tx.type === 'credit' ? 'success' : 'error'}`}>{tx.type}</span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--ink-secondary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tx.note || <span className="text-muted">—</span>}
                  </td>
                  <td className="text-muted" style={{ fontSize: 11 }}>{tx.approvedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
