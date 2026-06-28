import { Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Register from './pages/Register';

// Team pages
import TeamLogin from './pages/TeamLogin';
import TeamDashboard from './pages/TeamDashboard';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminTeams from './pages/AdminTeams';
import AdminTasks from './pages/AdminTasks';
import AdminTransactions from './pages/AdminTransactions';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminLayout from './components/AdminLayout';

// Guard: team must be logged in
function TeamRoute({ children }) {
  const token = localStorage.getItem('bb_team_token');
  return token ? children : <Navigate to="/team-login" replace />;
}

// Guard: admin must be logged in
function AdminRoute({ children }) {
  const token = localStorage.getItem('bb_admin_token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ── Public (no login needed) ── */}
      <Route path="/register" element={<Register />} />

      {/* ── Team portal ── */}
      <Route path="/team-login" element={<TeamLogin />} />
      <Route path="/team-dashboard" element={<TeamRoute><TeamDashboard /></TeamRoute>} />

      {/* ── Admin ── */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="teams" element={<AdminTeams />} />
        <Route path="tasks" element={<AdminTasks />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}