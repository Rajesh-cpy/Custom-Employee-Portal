const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const authenticateToken = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/rbacMiddleware');

router.use(authenticateToken);
router.use(requirePermission('MANAGE_ROLES'));

// GET /api/permissions - List all available permissions
router.get('/', permissionController.getAllPermissions);

module.exports = router;
