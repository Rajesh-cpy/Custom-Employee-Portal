const { query } = require('../config/db');

const permissionModel = {
  async getAllPermissions() {
    const res = await query('SELECT * FROM permissions ORDER BY category ASC, name ASC');
    return res.rows;
  },

  async findByName(name) {
    const res = await query('SELECT * FROM permissions WHERE name = $1', [name]);
    return res.rows[0] || null;
  },

  async getPermissionsForUser(userId) {
    const res = await query(`
      SELECT DISTINCT p.id, p.name, p.description, p.category
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = $1
    `, [userId]);
    return res.rows;
  },

  async getPermissionsForRole(roleId) {
    const res = await query(`
      SELECT p.id, p.name, p.description, p.category
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1
    `, [roleId]);
    return res.rows;
  }
};

module.exports = permissionModel;
