const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const permissionModel = require('../models/permissionModel');
const roleModel = require('../models/roleModel');
const auditService = require('../services/auditService');

const JWT_SECRET = process.env.JWT_SECRET || 'brainwave_jwt_secret_super_secure_key_2026_xyz987';

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token is required. Please log in.'
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Invalid Authorization header format. Format must be "Bearer <token>".'
      });
    }

    const token = parts[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Your session has expired. Please log in again.'
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token.'
      });
    }

    // Check that the user still exists in database
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account not found.'
      });
    }

    // Check that the user is still active
    if (!user.is_active) {
      await auditService.log({
        userId: user.id,
        username: user.username,
        action: 'INACTIVE_USER_BLOCKED',
        resource: req.originalUrl,
        status: 'DENIED',
        ipAddress: req.ip || req.connection.remoteAddress,
        details: 'Inactive user attempted API access with previously valid token.'
      });

      return res.status(401).json({
        success: false,
        error: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    // Fetch user's current roles and permissions from database
    const perms = await permissionModel.getPermissionsForUser(user.id);
    const userWithRoles = await userModel.getAllUsers();
    const userDetail = userWithRoles.find(u => u.id === user.id);
    const roles = userDetail && userDetail.roles ? userDetail.roles : (decoded.roles || []);

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      isActive: user.is_active,
      roles: roles,
      permissions: perms.map(p => p.name)
    };

    next();
  } catch (error) {
    console.error('[AuthMiddleware Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong during authentication. Please try again later.'
    });
  }
}

module.exports = authenticateToken;
