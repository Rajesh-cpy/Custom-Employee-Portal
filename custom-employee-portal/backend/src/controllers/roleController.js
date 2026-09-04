const roleModel = require('../models/roleModel');
const permissionModel = require('../models/permissionModel');
const auditService = require('../services/auditService');

const roleController = {
  /**
   * GET /api/roles
   */
  async getAllRoles(req, res) {
    try {
      const roles = await roleModel.getAllRoles();
      const rolesWithPerms = [];

      for (const role of roles) {
        const fullRole = await roleModel.getRoleWithPermissions(role.id);
        rolesWithPerms.push(fullRole);
      }

      return res.status(200).json({
        success: true,
        data: rolesWithPerms
      });
    } catch (error) {
      console.error('[Get Roles Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
      });
    }
  },

  /**
   * GET /api/roles/:id
   */
  async getRoleById(req, res) {
    try {
      const roleId = parseInt(req.params.id, 10);
      if (isNaN(roleId)) {
        return res.status(400).json({ success: false, error: 'Invalid role ID' });
      }

      const role = await roleModel.getRoleWithPermissions(roleId);
      if (!role) {
        return res.status(404).json({ success: false, error: 'Role not found' });
      }

      return res.status(200).json({
        success: true,
        data: role
      });
    } catch (error) {
      console.error('[Get Role Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
      });
    }
  },

  /**
   * PUT /api/roles/:id/permissions
   */
  async updatePermissions(req, res) {
    try {
      const roleId = parseInt(req.params.id, 10);
      if (isNaN(roleId)) {
        return res.status(400).json({ success: false, error: 'Invalid role ID' });
      }

      const { permissionIds } = req.body;
      if (!Array.isArray(permissionIds)) {
        return res.status(400).json({ success: false, error: 'permissionIds must be an array of numbers' });
      }

      const role = await roleModel.findById(roleId);
      if (!role) {
        return res.status(404).json({ success: false, error: 'Role not found' });
      }

      await roleModel.updateRolePermissions(roleId, permissionIds);
      const updated = await roleModel.getRoleWithPermissions(roleId);

      await auditService.log({
        userId: req.user.id,
        username: req.user.username,
        action: 'PERMISSION_UPDATED',
        resource: `/api/roles/${roleId}/permissions`,
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection.remoteAddress,
        details: `Updated permissions for role "${role.name}". New permission count: ${permissionIds.length}`
      });

      return res.status(200).json({
        success: true,
        message: `Permissions updated for role ${role.name}`,
        data: updated
      });
    } catch (error) {
      console.error('[Update Role Permissions Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
      });
    }
  }
};

module.exports = roleController;
