import api from './api';

export const authService = {
  async login(username, password) {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Clean exit even if network fails
    }
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
