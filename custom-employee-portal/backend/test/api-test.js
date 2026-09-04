const http = require('http');
const app = require('../server');
const seedDatabase = require('../src/models/seed');

let server;
const PORT = 5001;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting BrainWave Portal Backend Automated Test Suite');
  console.log('====================================================');

  process.env.NODE_ENV = 'test';
  await seedDatabase();

  await new Promise(res => {
    server = app.listen(PORT, () => {
      console.log(`[Test Server] Running on ${BASE_URL}`);
      res();
    });
  });

  try {
    // ----------------------------------------------------
    // 1. Health Check
    // ----------------------------------------------------
    console.log('\n--- Test Suite 1: Server Health ---');
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data.status === 'healthy', 'GET /api/health returns 200 OK');

    // ----------------------------------------------------
    // 2. Authentication & Login Validation Edge Cases
    // ----------------------------------------------------
    console.log('\n--- Test Suite 2: Login Validation & Edge Cases ---');
    
    // Both empty
    const resBothEmpty = await request('POST', '/api/auth/login', { username: '', password: '' });
    assert(resBothEmpty.status === 400 && resBothEmpty.data.error === 'Username and password are required', 'Both empty fields -> "Username and password are required" (400)');

    // Username empty
    const resNoUser = await request('POST', '/api/auth/login', { username: '', password: '123' });
    assert(resNoUser.status === 400 && resNoUser.data.error === 'Username is required', 'Empty username -> "Username is required" (400)');

    // Password empty
    const resNoPass = await request('POST', '/api/auth/login', { username: 'admin', password: '' });
    assert(resNoPass.status === 400 && resNoPass.data.error === 'Password is required', 'Empty password -> "Password is required" (400)');

    // Nonexistent username
    const resNonExistent = await request('POST', '/api/auth/login', { username: 'unknown_user_99', password: 'Password@123' });
    assert(resNonExistent.status === 401 && resNonExistent.data.error === 'No user exists with this username', 'Nonexistent user -> "No user exists with this username" (401)');

    // Incorrect password
    const resWrongPass = await request('POST', '/api/auth/login', { username: 'admin', password: 'WrongPassword@999' });
    assert(resWrongPass.status === 401 && resWrongPass.data.error === 'Incorrect password', 'Wrong password -> "Incorrect password" (401)');

    // Inactive account
    const resInactive = await request('POST', '/api/auth/login', { username: 'inactive_user', password: 'Inactive@123' });
    assert(resInactive.status === 401 && resInactive.data.error === 'Your account has been deactivated. Please contact the administrator.', 'Inactive account -> "Your account has been deactivated. Please contact the administrator." (401)');

    // Valid Logins
    const adminLogin = await request('POST', '/api/auth/login', { username: 'admin', password: 'Admin@123' });
    assert(adminLogin.status === 200 && adminLogin.data.token && adminLogin.data.user.roles.includes('Admin'), 'Admin login succeeds with JWT and Admin role');
    const adminToken = adminLogin.data.token;

    const hrLogin = await request('POST', '/api/auth/login', { username: 'hr_user', password: 'Hr@123' });
    assert(hrLogin.status === 200 && hrLogin.data.user.roles.includes('HR'), 'HR login succeeds with HR role');
    const hrToken = hrLogin.data.token;

    const salesLogin = await request('POST', '/api/auth/login', { username: 'sales_user', password: 'Sales@123' });
    assert(salesLogin.status === 200 && salesLogin.data.user.roles.includes('Sales'), 'Sales login succeeds with Sales role');
    const salesToken = salesLogin.data.token;

    const supportLogin = await request('POST', '/api/auth/login', { username: 'support_user', password: 'Support@123' });
    assert(supportLogin.status === 200 && supportLogin.data.user.roles.includes('Support'), 'Support login succeeds with Support role');
    const supportToken = supportLogin.data.token;

    const financeLogin = await request('POST', '/api/auth/login', { username: 'finance_user', password: 'Finance@123' });
    assert(financeLogin.status === 200 && financeLogin.data.user.roles.includes('Finance'), 'Finance login succeeds with Finance role');
    const financeToken = financeLogin.data.token;

    // ----------------------------------------------------
    // 3. RBAC Enforcement on Zoho Endpoints
    // ----------------------------------------------------
    console.log('\n--- Test Suite 3: RBAC Application Access Enforcement ---');

    // HR user accessing Zoho People -> Allowed (200)
    const hrPeople = await request('GET', '/api/zoho/people', null, hrToken);
    assert(hrPeople.status === 200 && hrPeople.data.success === true, 'HR user accessing /api/zoho/people -> 200 OK');

    // HR user accessing Zoho CRM -> Denied (403)
    const hrCrm = await request('GET', '/api/zoho/crm', null, hrToken);
    assert(hrCrm.status === 403 && hrCrm.data.error === 'Access denied. You do not have permission to access this application.', 'HR user accessing /api/zoho/crm -> 403 Forbidden');

    // HR user accessing Zoho Books -> Denied (403)
    const hrBooks = await request('GET', '/api/zoho/books', null, hrToken);
    assert(hrBooks.status === 403, 'HR user accessing /api/zoho/books -> 403 Forbidden');

    // Sales user accessing Zoho CRM -> Allowed (200)
    const salesCrm = await request('GET', '/api/zoho/crm', null, salesToken);
    assert(salesCrm.status === 200 && salesCrm.data.success === true, 'Sales user accessing /api/zoho/crm -> 200 OK');

    // Sales user accessing Zoho People -> Denied (403)
    const salesPeople = await request('GET', '/api/zoho/people', null, salesToken);
    assert(salesPeople.status === 403, 'Sales user accessing /api/zoho/people -> 403 Forbidden');

    // Support user accessing Zoho Desk -> Allowed (200)
    const supportDesk = await request('GET', '/api/zoho/desk', null, supportToken);
    assert(supportDesk.status === 200 && supportDesk.data.success === true, 'Support user accessing /api/zoho/desk -> 200 OK');

    // Finance user accessing Zoho Books -> Allowed (200)
    const financeBooks = await request('GET', '/api/zoho/books', null, financeToken);
    assert(financeBooks.status === 200 && financeBooks.data.success === true, 'Finance user accessing /api/zoho/books -> 200 OK');

    // Admin user accessing Zoho People, CRM, Desk, Books -> All Allowed (200)
    const adminPeople = await request('GET', '/api/zoho/people', null, adminToken);
    const adminCrm = await request('GET', '/api/zoho/crm', null, adminToken);
    const adminDesk = await request('GET', '/api/zoho/desk', null, adminToken);
    const adminBooks = await request('GET', '/api/zoho/books', null, adminToken);
    assert(
      adminPeople.status === 200 && adminCrm.status === 200 && adminDesk.status === 200 && adminBooks.status === 200,
      'Admin user has access to all authorized Zoho applications (People, CRM, Desk, Books)'
    );

    // ----------------------------------------------------
    // 4. Admin Management & RBAC Protection
    // ----------------------------------------------------
    console.log('\n--- Test Suite 4: Admin Management & Non-Admin Rejection ---');

    // Non-admin attempting to list users -> Denied (403)
    const nonAdminUserList = await request('GET', '/api/users', null, hrToken);
    assert(nonAdminUserList.status === 403, 'HR user calling GET /api/users -> 403 Forbidden');

    // Admin listing users -> Allowed (200)
    const adminUserList = await request('GET', '/api/users', null, adminToken);
    assert(adminUserList.status === 200 && Array.isArray(adminUserList.data.data), 'Admin listing users -> 200 OK with sanitized user array');

    // Admin creating a new user
    const newUserRes = await request('POST', '/api/users', {
      username: 'clara_audit',
      email: 'clara@brainwave.io',
      name: 'Clara Audit Specialist',
      password: 'AuditPassword@123',
      role: 'Finance'
    }, adminToken);
    assert(newUserRes.status === 201 && newUserRes.data.data.username === 'clara_audit', 'Admin creating new user -> 201 Created');

    // Duplicate username rejection
    const dupUser = await request('POST', '/api/users', {
      username: 'clara_audit',
      email: 'clara2@brainwave.io',
      name: 'Duplicate Clara',
      password: 'Password@123',
      role: 'Finance'
    }, adminToken);
    assert(dupUser.status === 409 && dupUser.data.error === 'Username already exists', 'Duplicate username -> 409 "Username already exists"');

    // Duplicate email rejection
    const dupEmail = await request('POST', '/api/users', {
      username: 'clara_unique',
      email: 'clara@brainwave.io',
      name: 'Duplicate Email',
      password: 'Password@123',
      role: 'Finance'
    }, adminToken);
    assert(dupEmail.status === 409 && dupEmail.data.error === 'Email already exists', 'Duplicate email -> 409 "Email already exists"');

    // Invalid role rejection
    const invalidRole = await request('POST', '/api/users', {
      username: 'invalid_role_user',
      email: 'invalid@brainwave.io',
      name: 'Invalid Role',
      password: 'Password@123',
      role: 'SuperPresident'
    }, adminToken);
    assert(invalidRole.status === 400 && invalidRole.data.error === 'Invalid role', 'Invalid role -> 400 "Invalid role"');

    // Toggle active status
    const createdUserId = newUserRes.data.data.id;
    const deactRes = await request('PATCH', `/api/users/${createdUserId}/status`, { isActive: false }, adminToken);
    assert(deactRes.status === 200 && deactRes.data.data.is_active === false, 'Admin deactivating user -> 200 OK');

    // ----------------------------------------------------
    // 5. Audit Logging Verification
    // ----------------------------------------------------
    console.log('\n--- Test Suite 5: Audit Logging Trail ---');

    // Admin fetching audit logs -> Allowed (200)
    const auditRes = await request('GET', '/api/audit-logs', null, adminToken);
    assert(auditRes.status === 200 && Array.isArray(auditRes.data.data) && auditRes.data.data.length > 0, 'Admin viewing audit logs -> 200 OK');

    // Verify critical actions logged
    const actions = auditRes.data.data.map(l => l.action);
    assert(actions.includes('LOGIN_SUCCESS'), 'Audit logs recorded LOGIN_SUCCESS');
    assert(actions.includes('UNAUTHORIZED_ACCESS'), 'Audit logs recorded UNAUTHORIZED_ACCESS');
    assert(actions.includes('ZOHO_ACCESS'), 'Audit logs recorded ZOHO_ACCESS');
    assert(actions.includes('USER_CREATED'), 'Audit logs recorded USER_CREATED');

    // Non-admin accessing audit logs -> Denied (403)
    const hrAudit = await request('GET', '/api/audit-logs', null, hrToken);
    assert(hrAudit.status === 403, 'Non-admin attempting to access audit logs -> 403 Forbidden');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    console.log('\n====================================================');
    console.log(`🏁 Backend Test Suite Completed: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
