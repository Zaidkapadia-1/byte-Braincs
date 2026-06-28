import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const adminToken = localStorage.getItem('bb_admin_token');
  const participantToken = localStorage.getItem('bb_participant_token');
  const teamToken = localStorage.getItem('bb_team_token');
  const url = cfg.url || '';

  // 1. Participant registration check
  if (url.includes('/my-registration')) {
    const token = participantToken || teamToken || adminToken;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  } 
  // 2. Team dashboard details & submissions
  else if (url.includes('/my-team') || url.includes('/tasks/submit')) {
    if (teamToken) cfg.headers.Authorization = `Bearer ${teamToken}`;
  }
  // 3. Admin & other endpoints
  else {
    if (adminToken) {
      cfg.headers.Authorization = `Bearer ${adminToken}`;
    } else if (teamToken) {
      cfg.headers.Authorization = `Bearer ${teamToken}`;
    } else if (participantToken) {
      cfg.headers.Authorization = `Bearer ${participantToken}`;
    }
  }
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    // Only redirect to login on 401 for admin-protected routes
    if (err.response?.status === 401) {
      const url = err.config?.url || '';
      // Admin routes — redirect to login
      if ((url.includes('/auth/') || url.includes('/admin')) && !url.includes('/auth/login')) {
        localStorage.removeItem('bb_admin_token');
        localStorage.removeItem('bb_admin');
        window.location.href = '/login';
      }
      // For all other 401s (public routes, team routes) — just reject, don't redirect
    }
    return Promise.reject(err);
  }
);

export default api;
