import api from '../lib/axios';

export const invoiceService = {
  async getInvoices(params) {
    const res = await api.get('/invoices', { params });
    return res.data;
  },

  async getInvoice(id) {
    const res = await api.get(`/invoices/${id}`);
    return res.data;
  },

  async createInvoice(data) {
    const res = await api.post('/invoices', data);
    return res.data;
  },

  async updateStatus(id, status) {
    const res = await api.patch(`/invoices/${id}/status`, { status });
    return res.data;
  },

  async initializePayment(invoiceId) {
    const res = await api.post('/payments/initialize', { invoiceId });
    return res.data;
  },
};

