const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authenticateToken = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/rbacMiddleware');

router.use(authenticateToken);

// GET /api/roles - List all roles (requires MANAGE_ROLES or MANAGE_USERS)
router.get('/', requirePermission('MANAGE_ROLES'), roleController.getAllRoles);

// GET /api/roles/:id - Get role with permissions
router.get('/:id', requirePermission('MANAGE_ROLES'), roleController.getRoleById);

// PUT /api/roles/:id/permissions - Update permissions assigned to role
router.put('/:id/permissions', requirePermission('MANAGE_ROLES'), roleController.updatePermissions);

module.exports = router;
