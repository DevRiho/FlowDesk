import api from '../lib/axios';

export const authService = {
  // Register a new user
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login user and obtain access token
  async login(data) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Refresh access token via httpOnly cookie
  async refresh() {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  // Logout session
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current authenticated user
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Request password reset email
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password using reset token
  async resetPassword(token, password) {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },
};

