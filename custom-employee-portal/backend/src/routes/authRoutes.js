const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin } = require('../middlewares/validationMiddleware');
const authenticateToken = require('../middlewares/authMiddleware');

// POST /api/auth/login
router.post('/login', validateLogin, authController.login);

// POST /api/auth/logout (Protected)
router.post('/logout', authenticateToken, authController.logout);

// GET /api/auth/me (Protected)
router.get('/me', authenticateToken, authController.getProfile);

module.exports = router;
