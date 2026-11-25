import api from '../lib/axios';

export const analyticsService = {
  async getDashboardOverview() {
    const res = await api.get('/analytics/dashboard-overview');
    return res.data;
  },

  async getCharts() {
    const res = await api.get('/analytics/charts');
    return res.data;
  },
};

