import { Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Register from './pages/Register';

// Admin pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminTeams from './pages/AdminTeams';
import AdminTasks from './pages/AdminTasks';
import AdminTransactions from './pages/AdminTransactions';
import AdminLayout from './components/AdminLayout';

// Guard: participant must be logged in
function ParticipantRoute({ children }) {
  const token = localStorage.getItem('bb_participant_token');
  return token ? children : <Navigate to="/login" replace />;
}

// Guard: admin must be logged in
function AdminRoute({ children }) {
  const token = localStorage.getItem('bb_token');
  return token ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ── Participant protected ── */}
      <Route path="/register" element={<ParticipantRoute><Register /></ParticipantRoute>} />

      {/* ── Admin ── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="teams" element={<AdminTeams />} />
        <Route path="tasks" element={<AdminTasks />} />
        <Route path="transactions" element={<AdminTransactions />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
