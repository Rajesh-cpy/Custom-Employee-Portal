const express = require('express');
const router = express.Router();
const zohoController = require('../controllers/zohoController');
const authenticateToken = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/rbacMiddleware');

// All Zoho routes require authentication
router.use(authenticateToken);

// GET /api/zoho/authorized-apps - Fetch user's authorized applications
router.get('/authorized-apps', zohoController.getAuthorizedApps);

// GET /api/zoho/people - Zoho People (Requires VIEW_ZOHO_PEOPLE - HR / Admin)
router.get('/people', requirePermission('VIEW_ZOHO_PEOPLE'), zohoController.getPeople);

// GET /api/zoho/crm - Zoho CRM (Requires VIEW_ZOHO_CRM - Sales / Admin)
router.get('/crm', requirePermission('VIEW_ZOHO_CRM'), zohoController.getCrm);

// GET /api/zoho/desk - Zoho Desk (Requires VIEW_ZOHO_DESK - Support / Admin)
router.get('/desk', requirePermission('VIEW_ZOHO_DESK'), zohoController.getDesk);

// GET /api/zoho/books - Zoho Books (Requires VIEW_ZOHO_BOOKS - Finance / Admin)
router.get('/books', requirePermission('VIEW_ZOHO_BOOKS'), zohoController.getBooks);

module.exports = router;
