const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/rbacMiddleware');
const { validateCreateUser, validateUpdateUser } = require('../middlewares/validationMiddleware');

// All User Management endpoints require authentication & MANAGE_USERS permission
router.use(authenticateToken);
router.use(requirePermission('MANAGE_USERS'));

// GET /api/users - List all users
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Get specific user
router.get('/:id', userController.getUserById);

// POST /api/users - Create new user
router.post('/', validateCreateUser, userController.createUser);

// PUT /api/users/:id - Update user details & role
router.put('/:id', validateUpdateUser, userController.updateUser);

// PATCH /api/users/:id/status - Activate / Deactivate user
router.patch('/:id/status', userController.toggleStatus);

// DELETE /api/users/:id - Delete user account
router.delete('/:id', userController.deleteUser);

// POST /api/users/:id/role - Assign role to user
router.post('/:id/role', userController.assignUserRole);

module.exports = router;
