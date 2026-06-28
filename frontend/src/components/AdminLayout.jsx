import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: '▦', end: true },
  { to: '/admin/teams', label: 'Teams', icon: '◈' },
  { to: '/admin/tasks', label: 'Tasks', icon: '◉' },
  { to: '/admin/transactions', label: 'Ledger', icon: '◎' },
  { to: '/admin/analytics', label: 'Analytics', icon: '▥' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('bb_admin') || '{}');

  function logout() {
    localStorage.removeItem('bb_admin_token');
    localStorage.removeItem('bb_admin');
    navigate('/login');
  }

  return (
    <div className="layout-sidebar">
      <aside className="sidebar">
        <div className="sidebar-logo">
          Byte<span>Brainiacs</span>
          <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--label-muted)', marginTop: 4, textTransform: 'uppercase' }}>
            Admin Terminal
          </div>
        </div>
        <nav className="sidebar-nav">
          {nav.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ marginBottom: 8 }}>{admin.email || 'admin'}</div>
          <button
            className="btn btn-ghost btn-sm w-full"
            onClick={logout}
            style={{ justifyContent: 'center' }}
          >
            Sign Out
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
