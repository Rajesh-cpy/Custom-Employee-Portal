const bcrypt = require('bcryptjs');
const { query, initDb } = require('../config/db');

const ROLES = [
  { name: 'Admin', description: 'Full administrative control and access to all authorized enterprise applications.' },
  { name: 'Manager', description: 'Departmental Manager role with access to team-related information, CRM pipeline, and People directory.' },
  { name: 'HR', description: 'Human Resources role with authorized access to Zoho People.' },
  { name: 'Sales', description: 'Sales team role with authorized access to Zoho CRM.' },
  { name: 'Support', description: 'Customer Support role with authorized access to Zoho Desk.' },
  { name: 'Finance', description: 'Finance and Accounting role with authorized access to Zoho Books.' }
];

const PERMISSIONS = [
  { name: 'VIEW_ZOHO_PEOPLE', description: 'Access Zoho People employee directory, leave, and attendance data', category: 'ZOHO_APPLICATION' },
  { name: 'VIEW_ZOHO_CRM', description: 'Access Zoho CRM leads, deals, contacts, and pipeline analytics', category: 'ZOHO_APPLICATION' },
  { name: 'VIEW_ZOHO_DESK', description: 'Access Zoho Desk customer support tickets and resolution queues', category: 'ZOHO_APPLICATION' },
  { name: 'VIEW_ZOHO_BOOKS', description: 'Access Zoho Books financial invoices, estimates, and billing reports', category: 'ZOHO_APPLICATION' },
  { name: 'MANAGE_USERS', description: 'Create, update, activate, and deactivate portal user accounts', category: 'ADMINISTRATION' },
  { name: 'MANAGE_ROLES', description: 'Assign roles to users and modify role-permission mappings', category: 'ADMINISTRATION' },
  { name: 'VIEW_AUDIT_LOGS', description: 'View system-wide security audit trails and user action logs', category: 'ADMINISTRATION' }
];

const ROLE_PERMISSION_MAPPING = {
  Admin: [
    'VIEW_ZOHO_PEOPLE',
    'VIEW_ZOHO_CRM',
    'VIEW_ZOHO_DESK',
    'VIEW_ZOHO_BOOKS',
    'MANAGE_USERS',
    'MANAGE_ROLES',
    'VIEW_AUDIT_LOGS'
  ],
  Manager: ['VIEW_ZOHO_PEOPLE', 'VIEW_ZOHO_CRM'],
  HR: ['VIEW_ZOHO_PEOPLE'],
  Sales: ['VIEW_ZOHO_CRM'],
  Support: ['VIEW_ZOHO_DESK'],
  Finance: ['VIEW_ZOHO_BOOKS']
};

const DEMO_USERS = [
  {
    username: 'admin',
    email: 'admin@brainwave.io',
    name: 'Administrator (Executive)',
    password: 'Admin@123',
    role: 'Admin',
    is_active: true
  },
  {
    username: 'manager_user',
    email: 'manager@brainwave.io',
    name: 'Michael Scott (Regional Manager)',
    password: 'Manager@123',
    role: 'Manager',
    is_active: true
  },
  {
    username: 'hr_user',
    email: 'hr@brainwave.io',
    name: 'Sarah Jenkins (HR Manager)',
    password: 'Hr@123',
    role: 'HR',
    is_active: true
  },
  {
    username: 'sales_user',
    email: 'sales@brainwave.io',
    name: 'Alex Rivera (Sales Director)',
    password: 'Sales@123',
    role: 'Sales',
    is_active: true
  },
  {
    username: 'support_user',
    email: 'support@brainwave.io',
    name: 'Maya Patel (Support Lead)',
    password: 'Support@123',
    role: 'Support',
    is_active: true
  },
  {
    username: 'finance_user',
    email: 'finance@brainwave.io',
    name: 'David Kim (Finance Controller)',
    password: 'Finance@123',
    role: 'Finance',
    is_active: true
  },
  {
    username: 'inactive_user',
    email: 'inactive@brainwave.io',
    name: 'John Doe (Deactivated Staff)',
    password: 'Inactive@123',
    role: 'Sales',
    is_active: false
  }
];

async function seedDatabase() {
  console.log('[Seed] Starting database migration and seeding...');
  await initDb();

  // 1. Create Tables if running against real PostgreSQL
  const createTablesSql = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(150) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      last_login_at TIMESTAMP WITH TIME ZONE NULL
    );

    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      description VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      description VARCHAR(255),
      category VARCHAR(50) DEFAULT 'GENERAL',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      id SERIAL PRIMARY KEY,
      role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
      assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
      username VARCHAR(100),
      action VARCHAR(100) NOT NULL,
      resource VARCHAR(150),
      status VARCHAR(50) NOT NULL,
      ip_address VARCHAR(100),
      details TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await query(createTablesSql);
  } catch (e) {
    // In-memory or pre-existing
  }

  // 2. Seed Roles
  const roleMap = {};
  for (const role of ROLES) {
    const existing = await query('SELECT * FROM roles WHERE LOWER(name) = LOWER($1)', [role.name]);
    let roleId;
    if (existing.rows.length === 0) {
      const res = await query('INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id, name', [role.name, role.description]);
      roleId = res.rows[0].id;
      console.log(`[Seed] Created Role: ${role.name} (ID: ${roleId})`);
    } else {
      roleId = existing.rows[0].id;
    }
    roleMap[role.name] = roleId;
  }

  // 3. Seed Permissions
  const permMap = {};
  for (const perm of PERMISSIONS) {
    const existing = await query('SELECT * FROM permissions WHERE name = $1', [perm.name]);
    let permId;
    if (existing.rows.length === 0) {
      const res = await query('INSERT INTO permissions (name, description, category) VALUES ($1, $2, $3) RETURNING id, name', [perm.name, perm.description, perm.category]);
      permId = res.rows[0].id;
      console.log(`[Seed] Created Permission: ${perm.name} (ID: ${permId})`);
    } else {
      permId = existing.rows[0].id;
    }
    permMap[perm.name] = permId;
  }

  // 4. Seed Role-Permissions Mapping
  for (const [roleName, permList] of Object.entries(ROLE_PERMISSION_MAPPING)) {
    const roleId = roleMap[roleName];
    for (const permName of permList) {
      const permId = permMap[permName];
      if (roleId && permId) {
        await query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)', [roleId, permId]);
      }
    }
  }
  console.log('[Seed] Role-Permission mappings seeded successfully.');

  // 5. Seed Demo Users
  const salt = await bcrypt.genSalt(10);
  for (const demo of DEMO_USERS) {
    const existing = await query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [demo.username]);
    let userId;
    if (existing.rows.length === 0) {
      const passwordHash = await bcrypt.hash(demo.password, salt);
      const res = await query(
        'INSERT INTO users (username, email, password_hash, name, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [demo.username, demo.email, passwordHash, demo.name, demo.is_active]
      );
      userId = res.rows[0].id;
      console.log(`[Seed] Created Demo User: ${demo.username} (${demo.role})`);
    } else {
      userId = existing.rows[0].id;
    }

    // Assign role
    const roleId = roleMap[demo.role];
    if (userId && roleId) {
      await query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, roleId]);
    }
  }

  // Initial audit log
  await query(
    `INSERT INTO audit_logs (username, action, resource, status, ip_address, details)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    ['SYSTEM', 'DATABASE_SEED', 'SYSTEM', 'SUCCESS', '127.0.0.1', 'Database initialized and seeded with enterprise roles, permissions, and demo accounts.']
  );

  console.log('[Seed] Database initialization and seeding completed successfully!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
