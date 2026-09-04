const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const permissionModel = require('../models/permissionModel');
const roleModel = require('../models/roleModel');
const auditService = require('../services/auditService');

const JWT_SECRET = process.env.JWT_SECRET || 'brainwave_jwt_secret_super_secure_key_2026_xyz987';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

const authController = {
  /**
   * POST /api/auth/login
   */
  async login(req, res) {
    const { username, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    try {
      // 1. Check if user exists
      const user = await userModel.findByUsername(username.trim());
      if (!user) {
        await auditService.log({
          username: username.trim(),
          action: 'LOGIN_FAILED',
          resource: '/api/auth/login',
          status: 'FAILED',
          ipAddress,
          details: 'Failed login attempt: Username does not exist.'
        });

        return res.status(401).json({
          success: false,
          error: 'No user exists with this username'
        });
      }

      // 2. Check if password is correct
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        await auditService.log({
          userId: user.id,
          username: user.username,
          action: 'LOGIN_FAILED',
          resource: '/api/auth/login',
          status: 'FAILED',
          ipAddress,
          details: 'Failed login attempt: Incorrect password.'
        });

        return res.status(401).json({
          success: false,
          error: 'Incorrect password'
        });
      }

      // 3. Check if account is active
      if (!user.is_active) {
        await auditService.log({
          userId: user.id,
          username: user.username,
          action: 'LOGIN_BLOCKED_INACTIVE',
          resource: '/api/auth/login',
          status: 'DENIED',
          ipAddress,
          details: 'Login rejected: Account is deactivated.'
        });

        return res.status(401).json({
          success: false,
          error: 'Your account has been deactivated. Please contact the administrator.'
        });
      }

      // 4. Retrieve roles and permissions
      const perms = await permissionModel.getPermissionsForUser(user.id);
      const allUsers = await userModel.getAllUsers();
      const currentUserEntry = allUsers.find(u => u.id === user.id);
      const roles = currentUserEntry && currentUserEntry.roles ? currentUserEntry.roles : [];

      // 5. Generate signed JWT (safe payload only - no password or Zoho secrets)
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        roles
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      // 6. Update last login timestamp
      await userModel.updateLastLogin(user.id);

      // 7. Log successful login
      await auditService.log({
        userId: user.id,
        username: user.username,
        action: 'LOGIN_SUCCESS',
        resource: '/api/auth/login',
        status: 'SUCCESS',
        ipAddress,
        details: `User successfully logged in with roles: [${roles.join(', ')}]`
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          isActive: user.is_active,
          roles,
          permissions: perms.map(p => p.name)
        }
      });
    } catch (error) {
      console.error('[Login Controller Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
      });
    }
  },

  /**
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      const user = req.user;
      if (user) {
        await auditService.log({
          userId: user.id,
          username: user.username,
          action: 'LOGOUT',
          resource: '/api/auth/logout',
          status: 'SUCCESS',
          ipAddress: req.ip || req.connection.remoteAddress,
          details: 'User logged out.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('[Logout Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
      });
    }
  },

  /**
   * GET /api/auth/me
   */
  async getProfile(req, res) {
    try {
      const user = req.user;
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          isActive: user.isActive,
          roles: user.roles,
          permissions: user.permissions
        }
      });
    } catch (error) {
      console.error('[Get Profile Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
      });
    }
  }
};

module.exports = authController;
