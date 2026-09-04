const auditService = require('../services/auditService');

const auditController = {
  /**
   * GET /api/audit-logs
   */
  async getAuditLogs(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 100;
      const logs = await auditService.getRecentLogs(limit);

      return res.status(200).json({
        success: true,
        count: logs.length,
        data: logs
      });
    } catch (error) {
      console.error('[Get Audit Logs Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
      });
    }
  }
};

module.exports = auditController;
