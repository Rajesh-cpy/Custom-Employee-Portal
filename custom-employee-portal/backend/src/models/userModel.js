const { query } = require('../config/db');

const userModel = {
  async findById(id) {
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async findByUsername(username) {
    const res = await query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    return res.rows[0] || null;
  },

  async findByEmail(email) {
    const res = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    return res.rows[0] || null;
  },

  async getAllUsers() {
    const res = await query(`
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.name, 
        u.is_active, 
        u.created_at, 
        u.updated_at, 
        u.last_login_at
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      ORDER BY u.id ASC
    `);
    return res.rows;
  },

  async getUserWithRolesAndPermissions(userId) {
    const res = await query(`
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.name, 
        u.is_active, 
        u.last_login_at
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.id = $1
    `, [userId]);
    return res.rows[0] || null;
  },

  async createUser({ username, email, passwordHash, name, isActive = true }) {
    const res = await query(
      `INSERT INTO users (username, email, password_hash, name, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, name, is_active, created_at`,
      [username, email, passwordHash, name, isActive]
    );
    return res.rows[0];
  },

  async updateUser(id, { name, email, isActive }) {
    const res = await query(
      `UPDATE users 
       SET name = $1, email = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING id, username, email, name, is_active, updated_at`,
      [name, email, isActive, id]
    );
    return res.rows[0];
  },

  async updateLastLogin(id) {
    const res = await query(
      `UPDATE users 
       SET last_login_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING id, last_login_at`,
      [id]
    );
    return res.rows[0];
  },

  async toggleActiveStatus(id, isActive) {
    const res = await query(
      `UPDATE users 
       SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, username, is_active`,
      [isActive, id]
    );
    return res.rows[0];
  },

  async deleteUser(id) {
    await query('DELETE FROM user_roles WHERE user_id = $1', [id]);
    const res = await query('DELETE FROM users WHERE id = $1 RETURNING id, username', [id]);
    return res.rows[0] || null;
  },

  async assignRole(userId, roleId) {
    await query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
    const res = await query(
      `INSERT INTO user_roles (user_id, role_id) 
       VALUES ($1, $2) 
       RETURNING id, user_id, role_id`,
      [userId, roleId]
    );
    return res.rows[0];
  }
};

module.exports = userModel;
