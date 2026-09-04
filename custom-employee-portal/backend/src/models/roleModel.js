const { query } = require('../config/db');

const roleModel = {
  async getAllRoles() {
    const res = await query('SELECT * FROM roles ORDER BY id ASC');
    return res.rows;
  },

  async findByName(name) {
    const res = await query('SELECT * FROM roles WHERE LOWER(name) = LOWER($1)', [name]);
    return res.rows[0] || null;
  },

  async findById(id) {
    const res = await query('SELECT * FROM roles WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async getRoleWithPermissions(roleId) {
    const roleRes = await query('SELECT * FROM roles WHERE id = $1', [roleId]);
    if (!roleRes.rows[0]) return null;

    const permRes = await query(`
      SELECT p.id, p.name, p.description, p.category
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1
    `, [roleId]);

    return {
      ...roleRes.rows[0],
      permissions: permRes.rows
    };
  },

  async getAllRolesWithPermissions() {
    const res = await query(`
      SELECT 
        r.id, 
        r.name, 
        r.description, 
        r.created_at
      FROM roles r
      JOIN role_permissions rp ON r.id = rp.role_id
    `);
    return res.rows;
  },

  async updateRolePermissions(roleId, permissionIds) {
    // Clear old permissions
    await query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);
    
    // Add new permissions
    const inserted = [];
    for (const permId of permissionIds) {
      const res = await query(
        `INSERT INTO role_permissions (role_id, permission_id) 
         VALUES ($1, $2) 
         RETURNING id, role_id, permission_id`,
        [roleId, permId]
      );
      if (res.rows[0]) inserted.push(res.rows[0]);
    }
    return inserted;
  }
};

module.exports = roleModel;
