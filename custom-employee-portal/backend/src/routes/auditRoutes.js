const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authenticateToken = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/rbacMiddleware');

router.use(authenticateToken);
router.use(requirePermission('VIEW_AUDIT_LOGS'));

// GET /api/audit-logs - View recent security audit logs
router.get('/', auditController.getAuditLogs);

module.exports = router;
