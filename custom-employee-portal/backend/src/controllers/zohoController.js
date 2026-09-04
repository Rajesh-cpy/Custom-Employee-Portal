const zohoService = require('../services/zohoService');
const auditService = require('../services/auditService');

const zohoController = {
  /**
   * GET /api/zoho/authorized-apps
   * Returns list of Zoho applications authorized for current user
   */
  async getAuthorizedApps(req, res) {
    try {
      const user = req.user;
      const perms = new Set(user.permissions || []);

      const apps = [];

      if (perms.has('VIEW_ZOHO_PEOPLE')) {
        apps.push({
          id: 'zoho-people',
          name: 'Zoho People',
          category: 'Human Resources',
          icon: 'Users',
          color: 'from-blue-500 to-indigo-600',
          badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          description: 'Employee directory, leave management, attendance tracking, and HR service requests.',
          endpoint: '/api/zoho/people',
          requiredPermission: 'VIEW_ZOHO_PEOPLE',
          status: 'Active'
        });
      }

      if (perms.has('VIEW_ZOHO_CRM')) {
        apps.push({
          id: 'zoho-crm',
          name: 'Zoho CRM',
          category: 'Sales & Pipeline',
          icon: 'TrendingUp',
          color: 'from-amber-500 to-orange-600',
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          description: 'Lead management, sales pipeline, deal tracking, customer contacts, and sales analytics.',
          endpoint: '/api/zoho/crm',
          requiredPermission: 'VIEW_ZOHO_CRM',
          status: 'Active'
        });
      }

      if (perms.has('VIEW_ZOHO_DESK')) {
        apps.push({
          id: 'zoho-desk',
          name: 'Zoho Desk',
          category: 'Customer Support',
          icon: 'Headphones',
          color: 'from-emerald-500 to-teal-600',
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          description: 'Customer support tickets, SLA tracking, resolution queues, and agent performance.',
          endpoint: '/api/zoho/desk',
          requiredPermission: 'VIEW_ZOHO_DESK',
          status: 'Active'
        });
      }

      if (perms.has('VIEW_ZOHO_BOOKS')) {
        apps.push({
          id: 'zoho-books',
          name: 'Zoho Books',
          category: 'Finance & Accounting',
          icon: 'DollarSign',
          color: 'from-violet-500 to-purple-600',
          badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          description: 'Invoicing, financial reporting, accounts receivable/payable, and expense tracking.',
          endpoint: '/api/zoho/books',
          requiredPermission: 'VIEW_ZOHO_BOOKS',
          status: 'Active'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            roles: user.roles
          },
          authorizedApps: apps
        }
      });
    } catch (error) {
      console.error('[Get Authorized Apps Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.'
      });
    }
  },

  /**
   * GET /api/zoho/people
   */
  async getPeople(req, res) {
    try {
      const data = await zohoService.getPeopleData();

      await auditService.log({
        userId: req.user.id,
        username: req.user.username,
        action: 'ZOHO_ACCESS',
        resource: 'Zoho People (HR)',
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection.remoteAddress,
        details: `Authorized access to Zoho People. Source: ${data.source}`
      });

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('[Zoho People Controller Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Unable to communicate with Zoho People service. Please try again later.'
      });
    }
  },

  /**
   * GET /api/zoho/crm
   */
  async getCrm(req, res) {
    try {
      const data = await zohoService.getCrmData();

      await auditService.log({
        userId: req.user.id,
        username: req.user.username,
        action: 'ZOHO_ACCESS',
        resource: 'Zoho CRM (Sales)',
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection.remoteAddress,
        details: `Authorized access to Zoho CRM. Source: ${data.source}`
      });

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('[Zoho CRM Controller Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Unable to communicate with Zoho CRM service. Please try again later.'
      });
    }
  },

  /**
   * GET /api/zoho/desk
   */
  async getDesk(req, res) {
    try {
      const data = await zohoService.getDeskData();

      await auditService.log({
        userId: req.user.id,
        username: req.user.username,
        action: 'ZOHO_ACCESS',
        resource: 'Zoho Desk (Support)',
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection.remoteAddress,
        details: `Authorized access to Zoho Desk. Source: ${data.source}`
      });

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('[Zoho Desk Controller Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Unable to communicate with Zoho Desk service. Please try again later.'
      });
    }
  },

  /**
   * GET /api/zoho/books
   */
  async getBooks(req, res) {
    try {
      const data = await zohoService.getBooksData();

      await auditService.log({
        userId: req.user.id,
        username: req.user.username,
        action: 'ZOHO_ACCESS',
        resource: 'Zoho Books (Finance)',
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection.remoteAddress,
        details: `Authorized access to Zoho Books. Source: ${data.source}`
      });

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('[Zoho Books Controller Error]:', error);
      return res.status(500).json({
        success: false,
        error: 'Unable to communicate with Zoho Books service. Please try again later.'
      });
    }
  }
};

module.exports = zohoController;
