import api from '../lib/axios';

export const communicationService = {
  async sendMessage(data) {
    const res = await api.post('/messages', data);
    return res.data;
  },

  async getProjectMessages(projectId) {
    const res = await api.get(`/messages/project/${projectId}`);
    return res.data;
  },

  async getNotifications() {
    const res = await api.get('/notifications');
    return res.data;
  },

  async markNotificationRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
};

