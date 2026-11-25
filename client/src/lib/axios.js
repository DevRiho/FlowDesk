import axios from 'axios';

// Central Axios instance configured with base URL, timeout, and credential sharing.
// withCredentials: true ensures that httpOnly refresh-token cookies are automatically attached
// to cross-origin or proxy requests.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: injects the in-memory access token into outgoing Authorization headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flowdesk_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: catches 401 Unauthorized responses to trigger token renewal (in Phase 2)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Transparent token refresh logic will be hooked here in Phase 2
    return Promise.reject(error);
  }
);

export default api;

