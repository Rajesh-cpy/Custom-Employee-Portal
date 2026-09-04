import api from './api';

export const zohoService = {
  async getAuthorizedApps() {
    const response = await api.get('/zoho/authorized-apps');
    return response.data;
  },

  async getPeople() {
    const response = await api.get('/zoho/people');
    return response.data;
  },

  async getCrm() {
    const response = await api.get('/zoho/crm');
    return response.data;
  },

  async getDesk() {
    const response = await api.get('/zoho/desk');
    return response.data;
  },

  async getBooks() {
    const response = await api.get('/zoho/books');
    return response.data;
  }
};
