const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const roleModel = require('../models/roleModel');
const auditService = require('../services/auditService');

const userController = {
  /**
   * GET /api/users
   */
  async getAllUsers(req, res) {
    try {
      const users = await userModel.getAllUsers();
      // Ensure password_hash is never returned
      const sanitized = users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        name: u.name,
        isActive: u.is_active,
        roles: u.roles || [],
        createdAt: u.created_at,
        updatedAt: u.updated_at,
        lastLoginAt: u.last_login_at
      }));

      return res.status(200).json({
        success: true,
        data: sanitized
      });
    } catch (error) {
      console.error('[Get Users Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
      });
    }
  },

  /**
   * GET /api/users/:id
   */
  async getUserById(req, res) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: 'Invalid user ID' });
      }

      const allUsers = await userModel.getAllUsers();
      const user = allUsers.find(u => u.id === userId);

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          isActive: user.is_active,
          roles: user.roles || [],
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          lastLoginAt: user.last_login_at
        }
      });
    } catch (error) {
      console.error('[Get User By ID Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
      });
    }
  },

  /**
   * POST /api/users
   */
  async createUser(req, res) {
    try {
      const { username, email, password, name, role, isActive = true } = req.body;

      // 1. Check duplicate username
      const existingUser = await userModel.findByUsername(username.trim());
      if (existingUser) {
        return res.status(409).json({ success: false, error: 'Username already exists' });
      }

      // 2. Check duplicate email
      const existingEmail = await userModel.findByEmail(email.trim());
      if (existingEmail) {
        return res.status(409).json({ success: false, error: 'Email already exists' });
      }

      // 3. Check valid role
      const roleObj = await roleModel.findByName(role.trim());
      if (!roleObj) {
        return res.status(400).json({ success: false, error: 'Invalid role' });
      }

      // 4. Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 5. Create user
      const newUser = await userModel.createUser({
        username: username.trim(),
        email: email.trim(),
        passwordHash,
        name: name.trim(),
        isActive: Boolean(isActive)
      });

      // 6. Assign role
      await userModel.assignRole(newUser.id, roleObj.id);

      // 7. Audit log
      await auditService.log({
        userId: req.user.id,
        username: req.user.username,
        action: 'USER_CREATED',
        resource: `/api/users/${newUser.id}`,
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection.remoteAddress,
        details: `Created new user "${newUser.username}" with role "${roleObj.name}".`
      });

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name,
          isActive: newUser.is_active,
          roles: [roleObj.name],
          createdAt: newUser.created_at
        }
      });
    } catch (error) {
      console.error('[Create User Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
      });
    }
  },

  /**
   * PUT /api/users/:id
   */
  async updateUser(req, res) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: 'Invalid user ID' });
      }

      const existingUser = await userModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const { name, email, isActive, role } = req.body;

      // If email changed, check conflict
      if (email && email.toLowerCase() !== existingUser.email.toLowerCase()) {
        const emailCheck = await userModel.findByEmail(email.trim());
        if (emailCheck && emailCheck.id !== userId) {
          return res.status(409).json({ success: false, error: 'Email already exists' });
        }
      }

      // If role changed, validate role
      let roleObj = null;
      if (role) {
        roleObj = await roleModel.findByName(role.trim());
        if (!roleObj) {
          return res.status(400).json({ success: false, error: 'Invalid role' });
        }
      }

      const updatedUser = await userModel.updateUser(userId, {
        name: name !== undefined ? name.trim() : existingUser.name,
        email: email !== undefined ? email.trim() : existingUser.email,
        isActive: isActive !== undefined ? Boolean(isActive) : existingUser.is_active
      });

      if (roleObj) {
        await userModel.assignRole(userId, roleObj.id);
      }

      await auditService.log({
        userId: req.user.id,
        username: req.user.username,
        action: 'USER_UPDATED',
        resource: `/api/users/${userId}`,
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection.remoteAddress,
        details: `Updated user profile for "${updatedUser.username}". Role: ${roleObj ? roleObj.name : 'Unchanged'}, Active: ${updatedUser.is_active}`
      });

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          name: updatedUser.name,
          isActive: updatedUser.is_active,
          updatedAt: updatedUser.updated_at
        }
      });
    } catch (error) {
      console.error('[Update User Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
      });
    }
  },

  /**
   * PATCH /api/users/:id/status
   */
  async toggleStatus(req, res) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: 'Invalid user ID' });
      }

      const { isActive } = req.body;
      if (isActive === undefined) {
        return res.status(400).json({ success: false, error: 'isActive status boolean is required' });
      }

      const existingUser = await userModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Prevent Admin from deactivating own account
      if (req.user.id === userId && !isActive) {
        return res.status(400).json({
          success: false,
          error: 'You cannot deactivate your own administrative account.'
        });
      }

      const updated = await userModel.toggleActiveStatus(userId, Boolean(isActive));

      await auditService.log({
        userId: req.user.id,
        username: req.user.username,
        action: 'USER_STATUS_TOGGLED',
        resource: `/api/users/${userId}`,
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection.remoteAddress,
        details: `Set user "${updated.username}" active state to: ${updated.is_active}`
      });

      return res.status(200).json({
        success: true,
        message: `User ${updated.is_active ? 'activated' : 'deactivated'} successfully`,
        data: updated
      });
    } catch (error) {
      console.error('[Toggle Status Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
      });
    }
  },

  /**
   * DELETE /api/users/:id
   */
  async deleteUser(req, res) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: 'Invalid user ID' });
      }

      if (req.user.id === userId) {
        return res.status(400).json({
          success: false,
          error: 'You cannot delete your own administrative account.'
        });
      }

      const existingUser = await userModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      await userModel.deleteUser(userId);

      await auditService.log({
        userId: req.user.id,
        username: req.user.username,
        action: 'USER_DELETED',
        resource: `/api/users/${userId}`,
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection.remoteAddress,
        details: `Deleted user account "${existingUser.username}" (ID: ${userId}).`
      });

      return res.status(200).json({
        success: true,
        message: `User ${existingUser.username} deleted successfully`
      });
    } catch (error) {
      console.error('[Delete User Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
      });
    }
  },

  /**
   * POST /api/users/:id/role
   */
  async assignUserRole(req, res) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: 'Invalid user ID' });
      }

      const { role } = req.body;
      if (!role) {
        return res.status(400).json({ success: false, error: 'Role is required' });
      }

      const existingUser = await userModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const roleObj = await roleModel.findByName(role.trim());
      if (!roleObj) {
        return res.status(400).json({ success: false, error: 'Invalid role' });
      }

      await userModel.assignRole(userId, roleObj.id);

      await auditService.log({
        userId: req.user.id,
        username: req.user.username,
        action: 'ROLE_ASSIGNED',
        resource: `/api/users/${userId}/role`,
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection.remoteAddress,
        details: `Assigned role "${roleObj.name}" to user "${existingUser.username}".`
      });

      return res.status(200).json({
        success: true,
        message: `Assigned role ${roleObj.name} to user ${existingUser.username}`,
        data: {
          userId,
          username: existingUser.username,
          role: roleObj.name
        }
      });
    } catch (error) {
      console.error('[Assign User Role Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
      });
    }
  }
};

module.exports = userController;
