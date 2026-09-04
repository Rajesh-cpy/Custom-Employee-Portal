const permissionModel = require('../models/permissionModel');

const permissionController = {
  /**
   * GET /api/permissions
   */
  async getAllPermissions(req, res) {
    try {
      const permissions = await permissionModel.getAllPermissions();
      return res.status(200).json({
        success: true,
        data: permissions
      });
    } catch (error) {
      console.error('[Get Permissions Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
      });
    }
  }
};

module.exports = permissionController;
