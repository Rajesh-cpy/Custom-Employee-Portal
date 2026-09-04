import api from './api';

export const adminService = {
  async getUsers() {
    const response = await api.get('/users');
    return response.data;
  },

  async createUser(userData) {
    const response = await api.post('/users', userData);
    return response.data;
  },

  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  async toggleUserStatus(id, isActive) {
    const response = await api.patch(`/users/${id}/status`, { isActive });
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async assignUserRole(id, role) {
    const response = await api.post(`/users/${id}/role`, { role });
    return response.data;
  },

  async getRoles() {
    const response = await api.get('/roles');
    return response.data;
  },

  async updateRolePermissions(roleId, permissionIds) {
    const response = await api.put(`/roles/${roleId}/permissions`, { permissionIds });
    return response.data;
  },

  async getPermissions() {
    const response = await api.get('/permissions');
    return response.data;
  },

  async getAuditLogs(limit = 100) {
    const response = await api.get(`/audit-logs?limit=${limit}`);
    return response.data;
  }
};
