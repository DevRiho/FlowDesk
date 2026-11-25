import api from '../lib/axios';

export const aiService = {
  async getProjectRisk(projectId) {
    const res = await api.get(`/ai/projects/${projectId}/risk`);
    return res.data;
  },

  async askCopilot(query) {
    const res = await api.post('/ai/chat', { query });
    return res.data;
  },
};

