import api from '../lib/axios';

export const fileService = {
  async getFiles(params) {
    const res = await api.get('/files', { params });
    return res.data;
  },

  async uploadFile(formData) {
    const res = await api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async deleteFile(id) {
    const res = await api.delete(`/files/${id}`);
    return res.data;
  },
};

