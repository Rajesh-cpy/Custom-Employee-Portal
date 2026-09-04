const { query } = require('../config/db');

const auditModel = {
  async createLog({ userId = null, username = null, action, resource = null, status = 'SUCCESS', ipAddress = null, details = null }) {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : (details || '');
    const res = await query(
      `INSERT INTO audit_logs (user_id, username, action, resource, status, ip_address, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, username, action, resource, status, ipAddress, detailsStr]
    );
    return res.rows[0];
  },

  async getLogs(limit = 100) {
    const res = await query(
      `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return res.rows;
  }
};

module.exports = auditModel;
