import api from '../lib/axios';

export const businessService = {
  // Clients
  async getClients(params) {
    const res = await api.get('/clients', { params });
    return res.data;
  },
  async getClient(id) {
    const res = await api.get(`/clients/${id}`);
    return res.data;
  },
  async createClient(data) {
    const res = await api.post('/clients', data);
    return res.data;
  },
  async updateClient(id, data) {
    const res = await api.patch(`/clients/${id}`, data);
    return res.data;
  },
  async deleteClient(id) {
    const res = await api.delete(`/clients/${id}`);
    return res.data;
  },

  // Projects
  async getProjects(params) {
    const res = await api.get('/projects', { params });
    return res.data;
  },
  async getProject(id) {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },
  async createProject(data) {
    const res = await api.post('/projects', data);
    return res.data;
  },
  async updateProject(id, data) {
    const res = await api.patch(`/projects/${id}`, data);
    return res.data;
  },
  async deleteProject(id) {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },

  // Tasks
  async getTasks(params) {
    const res = await api.get('/tasks', { params });
    return res.data;
  },
  async createTask(data) {
    const res = await api.post('/tasks', data);
    return res.data;
  },
  async updateTask(id, data) {
    const res = await api.patch(`/tasks/${id}`, data);
    return res.data;
  },
  async deleteTask(id) {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },
  async addTaskComment(id, content) {
    const res = await api.post(`/tasks/${id}/comments`, { content });
    return res.data;
  },
};

