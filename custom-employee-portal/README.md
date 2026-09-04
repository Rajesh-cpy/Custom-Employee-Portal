# BrainWave Custom Employee Portal with Zoho One Integration

A full-stack enterprise web portal featuring **Custom Employee Authentication**, **Role-Based Access Control (RBAC)**, **PostgreSQL Database Storage**, and secure **Backend Integration with Zoho One APIs via OAuth 2.0**.

---

## 1. Project Overview

The **BrainWave Custom Employee Portal** provides centralized single-sign-on access to enterprise Zoho One applications (Zoho People, Zoho CRM, Zoho Desk, Zoho Books) based strictly on employee department roles. 

### Key Architectural Highlights:
* **Zero Individual Zoho Credentials:** Employees never enter or know Zoho credentials. Authentication is handled by the internal portal with bcrypt password hashing and signed JWT sessions.
* **Server-to-Server Zoho OAuth 2.0:** A single backend service account manages OAuth token caching, automatic refresh, and proxying to Zoho REST endpoints.
* **Strict Backend RBAC Enforcement:** Authorization is enforced at the backend middleware layer on every request; direct API calls to unauthorized endpoints are rejected with `HTTP 403 Forbidden` regardless of client state.
* **Dynamic Frontend Dashboard:** The React dashboard fetches the authenticated user's authorized applications from the backend, displaying only permitted application cards.
* **Executive Administration:** Admin panel for user management, role assignments, dynamic permission configuration, and real-time security audit trails.

---

## 2. Technology Stack

* **Frontend:** React.js (Vite, Axios, Lucide Icons, Custom Glassmorphism CSS Design System)
* **Backend:** Node.js + Express.js (REST API, JWT Authentication, Custom RBAC Guards)
* **Database:** PostgreSQL (Relational schema with foreign keys, uniqueness constraints, and resilient zero-config fallback)
* **Third-Party Integration:** Zoho One REST APIs (OAuth 2.0 Server-to-Server Refresh Token Flow)
* **Testing:** Custom automated end-to-end backend test suite (33 assertions covering all edge cases)

---

## 3. Project Structure

```
custom-employee-portal/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # PostgreSQL connection pool & resilient engine
│   │   │   └── zoho.js              # Zoho OAuth endpoints and data center config
│   │   ├── controllers/
│   │   │   ├── authController.js    # Login, logout, session verification
│   │   │   ├── userController.js    # User CRUD, active toggle, role assignment
│   │   │   ├── roleController.js    # Role listings & permission updates
│   │   │   ├── permissionController.js # Available system permissions
│   │   │   ├── auditController.js   # Security audit logs
│   │   │   └── zohoController.js    # Protected Zoho application endpoints
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js    # JWT bearer verification & active user checks
│   │   │   ├── rbacMiddleware.js    # Reusable RBAC permission & role guards
│   │   │   ├── validationMiddleware.js # Input sanitizers & exact edge case handlers
│   │   │   └── errorMiddleware.js   # Centralized error handler
│   │   ├── models/
│   │   │   ├── schema.sql           # Complete PostgreSQL DDL schema
│   │   │   ├── seed.js              # Automated database migration and seed script
│   │   │   ├── userModel.js         # User database queries
│   │   │   ├── roleModel.js         # Role database queries
│   │   │   ├── permissionModel.js   # Permission queries
│   │   │   └── auditModel.js        # Audit log storage queries
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # /api/auth/*
│   │   │   ├── userRoutes.js        # /api/users/*
│   │   │   ├── roleRoutes.js        # /api/roles/*
│   │   │   ├── permissionRoutes.js  # /api/permissions/*
│   │   │   ├── auditRoutes.js       # /api/audit-logs/*
│   │   │   └── zohoRoutes.js        # /api/zoho/*
│   │   ├── services/
│   │   │   ├── zohoService.js       # Zoho OAuth manager & API client
│   │   │   └── auditService.js      # Structured audit logging service
│   │   ├── test/
│   │   │   └── api-test.js          # Automated end-to-end backend test suite
│   │   ├── .env.example
│   │   ├── .env
│   │   └── server.js                # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top header with profile, role badges, logout
│   │   │   ├── ProtectedRoute.jsx   # Client-side route & role guards
│   │   │   ├── AppCard.jsx          # Zoho application launch cards
│   │   │   ├── UserModal.jsx        # Create/Edit user modal
│   │   │   ├── RoleModal.jsx        # Role-permission mapping editor
│   │   │   ├── AuditTable.jsx       # Filterable audit log stream
│   │   │   ├── ZohoViewerModal.jsx  # Live Zoho data & JSON payload inspector
│   │   │   └── Toast.jsx            # Toast alert notifications
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # Login page with demo autofill & edge cases
│   │   │   ├── DashboardPage.jsx    # Authorized Zoho apps & RBAC tester
│   │   │   ├── AdminPage.jsx        # User CRUD, RBAC matrix, and audit logs
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance with JWT interceptors
│   │   │   ├── authService.js
│   │   │   ├── adminService.js
│   │   │   └── zohoService.js
│   │   ├── utils/
│   │   │   └── auth.js              # Token and user session utilities
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global React authentication context
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                # CSS design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 4. Database Schema & Relationships

The relational database is structured in PostgreSQL:

```
Users
  └── UserRoles (user_id -> users.id)
        └── Roles (role_id -> roles.id)
              └── RolePermissions (role_id -> roles.id)
                    └── Permissions (permission_id -> permissions.id)

AuditLogs (user_id -> users.id)
```

### Tables:
1. **`users`**: `id`, `username`, `email`, `password_hash`, `name`, `is_active`, `created_at`, `updated_at`, `last_login_at`
2. **`roles`**: `id`, `name`, `description`, `created_at`
3. **`permissions`**: `id`, `name`, `description`, `category`, `created_at`
4. **`user_roles`**: `id`, `user_id`, `role_id`, `assigned_at` (UNIQUE constraint on `[user_id, role_id]`)
5. **`role_permissions`**: `id`, `role_id`, `permission_id`, `assigned_at` (UNIQUE constraint on `[role_id, permission_id]`)
6. **`audit_logs`**: `id`, `user_id`, `username`, `action`, `resource`, `status`, `ip_address`, `details`, `created_at`

---

## 5. Seeded Roles, Permissions & Role Mapping

### Seeded Enterprise Roles:
* **Admin:** Full administrative control, user & role management, audit logs, and access to all Zoho applications.
* **HR:** Human Resources role with access to **Zoho People**.
* **Sales:** Sales department role with access to **Zoho CRM**.
* **Support:** Customer service role with access to **Zoho Desk**.
* **Finance:** Financial accounting role with access to **Zoho Books**.

### Application Permissions Matrix:
| Role | Assigned Permissions | Authorized Zoho Apps | Admin Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `VIEW_ZOHO_PEOPLE`, `VIEW_ZOHO_CRM`, `VIEW_ZOHO_DESK`, `VIEW_ZOHO_BOOKS`, `MANAGE_USERS`, `MANAGE_ROLES`, `VIEW_AUDIT_LOGS` | Zoho People, CRM, Desk, Books | Full User/Role/Audit Control |
| **HR** | `VIEW_ZOHO_PEOPLE` | Zoho People | None |
| **Sales** | `VIEW_ZOHO_CRM` | Zoho CRM | None |
| **Support** | `VIEW_ZOHO_DESK` | Zoho Desk | None |
| **Finance** | `VIEW_ZOHO_BOOKS` | Zoho Books | None |

---

## 6. Seeded Demo Users

For evaluation and demo video recording, the database includes pre-configured demo users:

| Username | Password | Role | Account Status | Permitted Application(s) |
| :--- | :--- | :--- | :--- | :--- |
| `admin` | `Admin@123` | **Admin** | Active | All Apps (People, CRM, Desk, Books) + Admin Center |
| `hr_user` | `Hr@123` | **HR** | Active | Zoho People |
| `sales_user` | `Sales@123` | **Sales** | Active | Zoho CRM |
| `support_user` | `Support@123` | **Support** | Active | Zoho Desk |
| `finance_user` | `Finance@123` | **Finance** | Active | Zoho Books |
| `inactive_user` | `Inactive@123` | **Sales** | **Deactivated** | Blocked with deactivation notice |

> 💡 **Quick Demo Feature:** The login screen features one-click autofill buttons for each demo account.

---

## 7. Zoho OAuth Setup Guide

To connect the portal with live Zoho One REST APIs:

1. **Sign up for Zoho One / Zoho Developer Account:**
   * Create a free trial or developer account at [https://www.zoho.com/one/](https://www.zoho.com/one/).
2. **Access Zoho API Console:**
   * Navigate to [https://api-console.zoho.com/](https://api-console.zoho.com/).
3. **Register a Server-based Application:**
   * Click **Add Client** → Choose **Server-based Applications**.
   * Client Name: `BrainWave Employee Portal`
   * Homepage URL: `http://localhost:5173`
   * Authorized Redirect URIs: `https://api-console.zoho.com/` (or your callback URL).
4. **Obtain Client Credentials:**
   * Copy the **Client ID** and **Client Secret**.
5. **Generate Refresh Token (Self-Client flow):**
   * In Zoho API Console, open the **Generate Code** tab for your client.
   * Scope: `ZohoCRM.modules.ALL,ZohoPeople.employee.ALL,Desk.tickets.ALL,ZohoBooks.invoices.ALL`
   * Time Duration: 10 minutes
   * Click **Generate** and exchange the grant token for a persistent **Refresh Token**:
     ```bash
     curl -X POST https://accounts.zoho.com/oauth/v2/token \
       -d "code=YOUR_GRANT_TOKEN" \
       -d "client_id=YOUR_CLIENT_ID" \
       -d "client_secret=YOUR_CLIENT_SECRET" \
       -d "grant_type=authorization_code"
     ```
6. **Configure Backend `.env`:**
   Add credentials to `backend/.env`:
   ```env
   ZOHO_CLIENT_ID=1000.YOUR_CLIENT_ID
   ZOHO_CLIENT_SECRET=your_client_secret
   ZOHO_REFRESH_TOKEN=1000.your_refresh_token
   ZOHO_DC=zoho.com
   ```
7. **Zero-Setup Fallback & Demo Mode:**
   If credentials are not yet configured in `.env`, `zohoService.js` operates in authenticated enterprise sandbox mode, providing realistic Zoho JSON payloads and uninterrupted evaluation.

---

## 8. Installation & Setup

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)
* **PostgreSQL** (Optional for local persistent database; app includes zero-dependency fallback)

### 1. Clone & Configure Backend
```bash
cd custom-employee-portal/backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env (already populated with working defaults)
cp .env.example .env

# Run database migration & seeding
npm run seed

# Run automated backend test suite (33 assertions)
npm test

# Start backend server
npm start
```
The backend starts at `http://localhost:5000`.

### 2. Configure & Start Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite React development server
npm run dev
```
The frontend opens at `http://localhost:5173`.

---

## 9. API Endpoints Documentation

### Authentication (`/api/auth`)
* `POST /api/auth/login`: Authenticate employee, return signed JWT and user profile.
* `POST /api/auth/logout`: Log out user and record `LOGOUT` audit event.
* `GET /api/auth/me`: Validate JWT token and fetch latest user roles and permissions.

### Zoho One Application Access (`/api/zoho`)
* `GET /api/zoho/authorized-apps`: Return list of Zoho apps authorized for authenticated user.
* `GET /api/zoho/people`: Fetch Zoho People data *(Guarded by `VIEW_ZOHO_PEOPLE`)*.
* `GET /api/zoho/crm`: Fetch Zoho CRM data *(Guarded by `VIEW_ZOHO_CRM`)*.
* `GET /api/zoho/desk`: Fetch Zoho Desk data *(Guarded by `VIEW_ZOHO_DESK`)*.
* `GET /api/zoho/books`: Fetch Zoho Books data *(Guarded by `VIEW_ZOHO_BOOKS`)*.

### Administration (`/api/users`, `/api/roles`, `/api/audit-logs`)
* `GET /api/users`: List all portal users *(Requires `MANAGE_USERS`)*.
* `POST /api/users`: Create new employee account *(Requires `MANAGE_USERS`)*.
* `PUT /api/users/:id`: Update employee details & role *(Requires `MANAGE_USERS`)*.
* `PATCH /api/users/:id/status`: Activate or deactivate user *(Requires `MANAGE_USERS`)*.
* `POST /api/users/:id/role`: Assign role to user *(Requires `MANAGE_USERS`)*.
* `GET /api/roles`: List roles and assigned permissions *(Requires `MANAGE_ROLES`)*.
* `PUT /api/roles/:id/permissions`: Update permissions assigned to role *(Requires `MANAGE_ROLES`)*.
* `GET /api/permissions`: List all available system permissions *(Requires `MANAGE_ROLES`)*.
* `GET /api/audit-logs`: View chronological security audit trail *(Requires `VIEW_AUDIT_LOGS`)*.

---

## 10. Security Implementation

* **Password Hashing:** Passwords hashed with bcrypt (salt rounds = 10). Plaintext passwords are never stored or logged.
* **JWT Authentication:** Signed tokens with configurable expiry (default: 8 hours). Payload contains safe identifiers (`id`, `username`, `email`, `roles`), excluding sensitive secrets.
* **Backend Authorization:** Middleware strictly verifies user existence, active status, and specific permission before executing business logic.
* **Credential Isolation:** Zoho Client ID, Client Secret, and Refresh Token exist exclusively in the backend `.env` file and are never sent to the client.
* **Security Audit Logging:** All critical actions (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `UNAUTHORIZED_ACCESS`, `ZOHO_ACCESS`, `USER_CREATED`, `ROLE_ASSIGNED`, `PERMISSION_UPDATED`) are persisted with timestamps, actor usernames, and IP addresses. Sensitive credentials (passwords, JWT secrets, Zoho tokens) are sanitized and excluded from logs.

---

## 11. 3–5 Minute Demo Script for Video Submission

1. **Login & Error Edge Cases (1 min):**
   * Demonstrate validation errors on empty fields ("Username and password are required", "Username is required", "Password is required").
   * Demonstrate invalid password ("Incorrect password") and nonexistent user ("No user exists with this username").
   * Click **Inactive Account** demo shortcut -> show deactivation message ("Your account has been deactivated. Please contact the administrator.").
2. **Role-Based Access Control (1.5 min):**
   * Login as **HR Manager (`hr_user`)** -> Show only **Zoho People** card on dashboard.
   * Open Zoho People -> inspect employee directory and attendance data.
   * Use the **Live RBAC Tester** to make a `GET /api/zoho/crm` call -> observe instant **`403 Forbidden`** rejection.
   * Logout and login as **Sales Director (`sales_user`)** -> Show only **Zoho CRM** is displayed; People and Books are unavailable.
   * Logout and login as **Finance Controller (`finance_user`)** -> Show only **Zoho Books** is displayed.
3. **Admin Management & Audit Trail (1.5 min):**
   * Login as **Admin (`admin`)** -> Show access to all 4 Zoho applications.
   * Open **Admin Panel** -> View Users table.
   * Click **Add New Employee** -> create a new user account with role assignment.
   * Toggle **Active/Deactivate** on a user.
   * Open **Roles & Permissions** tab -> toggle a permission on a role.
   * Open **Security Audit Trail** tab -> show real-time logged entries for `LOGIN_SUCCESS`, `UNAUTHORIZED_ACCESS`, and `ZOHO_ACCESS`.

---

## 12. Verification & Automated Test Results

The backend includes a comprehensive automated test suite in `backend/test/api-test.js`:
```bash
npm test
```
**Test Results: 33 Passed, 0 Failed**
* `GET /api/health` 200 OK
* Login edge cases: Both empty, empty username, empty password, nonexistent user, wrong password, inactive user (All 6 verified)
* Multi-role authentication for Admin, HR, Sales, Support, Finance
* RBAC guards: HR accessing CRM (403), HR accessing Books (403), Sales accessing People (403), Support accessing Desk (200), Finance accessing Books (200), Admin accessing all 4 Zoho apps (200)
* Admin security: Non-admin calling `/api/users` (403), Non-admin calling `/api/audit-logs` (403)
* User CRUD: Create user (201), duplicate username rejection (409), duplicate email rejection (409), invalid role rejection (400), deactivate user (200)
* Audit log verification: Persisted events for `LOGIN_SUCCESS`, `UNAUTHORIZED_ACCESS`, `ZOHO_ACCESS`, `USER_CREATED`
