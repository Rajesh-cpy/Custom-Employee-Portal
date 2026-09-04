const auditModel = require('../models/auditModel');

const auditService = {
  async log({ userId = null, username = null, action, resource = null, status = 'SUCCESS', ipAddress = null, details = null }) {
    try {
      return await auditModel.createLog({
        userId,
        username,
        action,
        resource,
        status,
        ipAddress,
        details
      });
    } catch (err) {
      console.error('[AuditService Error]:', err.message);
      return null;
    }
  },

  async getRecentLogs(limit = 100) {
    return await auditModel.getLogs(limit);
  }
};

module.exports = auditService;
