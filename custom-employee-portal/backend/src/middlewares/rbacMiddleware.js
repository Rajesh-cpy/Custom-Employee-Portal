const auditService = require('../services/auditService');

/**
 * Reusable RBAC Permission Guard
 * Verifies if the authenticated user has the specified permission.
 */
function requirePermission(permissionName) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required.'
        });
      }

      // Check if user has permission
      const hasPerm = Array.isArray(user.permissions) && user.permissions.includes(permissionName);

      if (!hasPerm) {
        // Record unauthorized attempt in audit logs
        await auditService.log({
          userId: user.id,
          username: user.username,
          action: 'UNAUTHORIZED_ACCESS',
          resource: `${req.method} ${req.originalUrl}`,
          status: 'DENIED',
          ipAddress: req.ip || req.connection.remoteAddress,
          details: `Denied access to resource requiring permission: ${permissionName}. User roles: [${user.roles.join(', ')}]`
        });

        return res.status(403).json({
          success: false,
          error: 'Access denied. You do not have permission to access this application.'
        });
      }

      next();
    } catch (error) {
      console.error('[RBAC Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong while verifying permissions. Please try again later.'
      });
    }
  };
}

/**
 * Role-Based Access Guard
 * Verifies if the authenticated user possesses at least one of the specified roles.
 */
function requireRole(allowedRoles = []) {
  const rolesToCheck = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required.'
        });
      }

      const hasRole = Array.isArray(user.roles) && user.roles.some(r => 
        rolesToCheck.some(allowed => allowed.toLowerCase() === r.toLowerCase())
      );

      if (!hasRole) {
        await auditService.log({
          userId: user.id,
          username: user.username,
          action: 'UNAUTHORIZED_ACCESS',
          resource: `${req.method} ${req.originalUrl}`,
          status: 'DENIED',
          ipAddress: req.ip || req.connection.remoteAddress,
          details: `Denied access. Required role in [${rolesToCheck.join(', ')}]. User roles: [${user.roles.join(', ')}]`
        });

        return res.status(403).json({
          success: false,
          error: 'Access denied. You do not have permission to perform this action.'
        });
      }

      next();
    } catch (error) {
      console.error('[RBAC Role Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong while verifying role authorization. Please try again later.'
      });
    }
  };
}

module.exports = {
  requirePermission,
  requireRole
};
