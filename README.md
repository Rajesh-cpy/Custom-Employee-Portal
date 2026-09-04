# 🏢 BrainWave Custom Employee Portal with Zoho One Integration

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.2-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tests](https://img.shields.io/badge/Tests-33%20Passed%20%7C%200%20Failed-success)](file:///d:/BrainWave_Assignment/custom-employee-portal/backend/test/api-test.js)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade, full-stack web application delivering centralized single sign-on access to **Zoho One** applications (Zoho People, Zoho CRM, Zoho Desk, Zoho Books) powered by **Custom Employee Authentication**, **Granular Role-Based Access Control (RBAC)**, **PostgreSQL Relational Storage**, and **Server-to-Server Zoho OAuth 2.0 Integration**.

---

## 📑 Table of Contents

- [Key Architecture & Design Principles](#-key-architecture--design-principles)
- [Architecture Diagram](#-architecture-diagram)
- [Documentation & Deliverables](#-documentation--deliverables)
- [Technology Stack](#-technology-stack)
- [Directory Structure](#-directory-structure)
- [Quick Start Guide](#-quick-start-guide)
- [Production Deployment](#-production-deployment)
- [Environment Configuration](#-environment-configuration)
- [Role-Based Access Control (RBAC) Matrix](#-role-based-access-control-rbac-matrix)
- [Pre-Configured Demo Accounts](#-pre-configured-demo-accounts)
- [Zoho OAuth 2.0 Setup Guide](#-zoho-oauth-20-setup-guide)
- [REST API Specification](#-rest-api-specification)
- [Security & Production Hardening](#-security--production-hardening)
- [Automated Testing & Verification](#-automated-testing--verification)
- [3–5 Minute Demo Video Script](#-35-minute-demo-video-script)

---

## 🏛️ Key Architecture & Design Principles

1. **Zero Client-Side Zoho Credentials:** Employees never enter or possess individual Zoho credentials. All authentication is handled by the internal BrainWave portal using bcrypt password hashing and signed JWT sessions.
2. **Server-to-Server Service Account:** A single backend service account interacts with Zoho One REST endpoints using a persistent OAuth 2.0 refresh token with automatic token caching and seamless refresh cycles.
3. **Strict Backend-Enforced RBAC:** Authorization is validated at the backend middleware level on every API request. Unauthorized access attempts are rejected with `HTTP 403 Forbidden` and logged to the security audit trail.
4. **Dynamic Frontend Rendering:** The React dashboard queries the backend for the authenticated user's permission set, rendering only the Zoho applications the employee is authorized to access.
5. **Resilient Dual-Engine Database:** Supports production PostgreSQL with full relational constraints (`ON DELETE CASCADE`, unique indices) while offering a built-in memory store fallback for immediate zero-configuration evaluation.
6. **Comprehensive Security Audit Trail:** Every critical lifecycle event (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `UNAUTHORIZED_ACCESS`, `ZOHO_ACCESS`, `USER_CREATED`, `USER_UPDATED`, `USER_DEACTIVATED`, `ROLE_ASSIGNED`, `PERMISSION_UPDATED`) is recorded with timestamps, actor IDs, IP addresses, and sanitized payload details.

---

## 📊 Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                CLIENT BROWSER                                     |
|  +-----------------------------------------------------------------------------+  |
|  |                     React.js SPA (Vite + Glassmorphism UI)                  |  |
|  |  [Login Page]  -->  [Role-Guarded Dashboard]  -->  [Admin Management Panel] |  |
|  |  (Autofill Demo)   (Authorized Zoho App Cards)    (Users / Matrix / Audits) |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / JSON (Bearer JWT)
                                           v
+-----------------------------------------------------------------------------------+
|                           BRAINWAVE BACKEND (Node.js/Express)                     |
|                                                                                   |
|   +---------------------+  +---------------------+  +--------------------------+  |
|   |   authMiddleware    |  |   rbacMiddleware    |  |   validationMiddleware   |  |
|   | (JWT & Active Check)|  | (Permission Guards) |  | (Input Sanitization & UI)|  |
|   +----------+----------+  +----------+----------+  +-------------+------------+  |
|              |                        |                               |           |
|   +----------v------------------------v-------------------------------v--------+  |
|   |                        Controllers & Services                              |  |
|   |  [authController]   [userController]   [roleController]   [zohoController] |  |
|   |  [auditService]     [zohoService (OAuth Token Manager & API Proxy)]        |  |
|   +----------+--------------------------------------------------------+--------+  |
+--------------|--------------------------------------------------------|-----------+
               |                                                        |
               v SQL Queries                                            v HTTPS OAuth 2.0
+-------------------------------+                     +-----------------------------+
|     POSTGRESQL DATABASE       |                     |     ZOHO ONE REST APIS      |
|  - users        - roles       |                     |  - Zoho People (HR)         |
|  - permissions  - user_roles  |                     |  - Zoho CRM (Sales)         |
|  - role_perms   - audit_logs  |                     |  - Zoho Desk (Support)      |
|  (Relational Constraints)     |                     |  - Zoho Books (Finance)     |
+-------------------------------+                     +-----------------------------+
```

---

## 📑 Documentation & Deliverables

| Document | Format | Description |
| :--- | :--- | :--- |
| **[Architecture & User Flow Guide](custom-employee-portal/ARCHITECTURE_AND_USER_FLOW.md)** | Markdown | Complete end-to-end lifecycle, JWT flows, RBAC guard mechanics, and Zoho proxy architecture. |
| **[Architecture & User Flow PDF](custom-employee-portal/BrainWave_Architecture_and_User_Flow.pdf)** | PDF | Professionally styled and printable executive architecture and user flow report. |
| **[Database Schema DDL](custom-employee-portal/backend/src/models/schema.sql)** | SQL | Complete PostgreSQL DDL with tables, foreign keys, indexes, and initial seeds. |
| **[Backend Test Suite](custom-employee-portal/backend/test/api-test.js)** | JavaScript | 33 automated test assertions covering authentication, authorization, and RBAC edge cases. |

---

## 💻 Technology Stack

### Frontend
- **Framework:** React 18.2 (Vite bundler)
- **Routing & State:** React Router DOM v6, React Context API (`AuthContext`)
- **UI & Styling:** Custom Vanilla CSS Design System with dark mode glassmorphism, responsive CSS grid, micro-interactions, and accessible modal dialogs
- **Icons:** Lucide React
- **HTTP Client:** Axios with JWT request interceptors and centralized response error handling

### Backend
- **Runtime:** Node.js v18+
- **Server Framework:** Express.js v4.18
- **Authentication & Security:** JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS (`cors`), Environment Config (`dotenv`)
- **Database Layer:** PostgreSQL Client Pool (`pg`) with automatic fallback to an in-memory transactional datastore

---

## 📁 Directory Structure

```
BrainWave_Assignment/
├── README.md                                  # Repository entry point and production documentation
└── custom-employee-portal/
    ├── ARCHITECTURE_AND_USER_FLOW.md         # Detailed architectural documentation
    ├── BrainWave_Architecture_and_User_Flow.pdf # Printable PDF architecture document
    ├── architecture_pdf_template.html         # PDF rendering template
    │
    ├── backend/                               # Express.js REST API
    │   ├── src/
    │   │   ├── config/
    │   │   │   ├── db.js                     # PostgreSQL connection pool & memory fallback engine
    │   │   │   └── zoho.js                   # Zoho OAuth endpoints and data center configuration
    │   │   ├── controllers/
    │   │   │   ├── authController.js         # Login, logout, session verification
    │   │   │   ├── userController.js         # User CRUD, status toggle, role assignment, deletion
    │   │   │   ├── roleController.js         # Role listings & permission matrix management
    │   │   │   ├── permissionController.js   # Available system permissions
    │   │   │   ├── auditController.js        # Audit log streaming and filtering
    │   │   │   └── zohoController.js         # Protected Zoho One application endpoints
    │   │   ├── middlewares/
    │   │   │   ├── authMiddleware.js         # JWT bearer token verification & active account checks
    │   │   │   ├── rbacMiddleware.js         # Reusable RBAC permission and role guards
    │   │   │   ├── validationMiddleware.js   # Request body validator with clean UI error messages
    │   │   │   └── errorMiddleware.js        # Centralized error handler
    │   │   ├── models/
    │   │   │   ├── schema.sql                # Complete PostgreSQL relational schema
    │   │   │   ├── seed.js                   # Migration & database seeder
    │   │   │   ├── userModel.js              # User database queries
    │   │   │   ├── roleModel.js              # Role database queries
    │   │   │   ├── permissionModel.js        # Permission queries
    │   │   │   └── auditModel.js             # Audit log queries
    │   │   ├── routes/
    │   │   │   ├── authRoutes.js             # /api/auth/*
    │   │   │   ├── userRoutes.js             # /api/users/*
    │   │   │   ├── roleRoutes.js             # /api/roles/*
    │   │   │   ├── permissionRoutes.js       # /api/permissions/*
    │   │   │   ├── auditRoutes.js            # /api/audit-logs/*
    │   │   │   └── zohoRoutes.js             # /api/zoho/*
    │   │   ├── services/
    │   │   │   ├── zohoService.js            # Zoho OAuth token manager & API proxy service
    │   │   │   └── auditService.js           # Structured security audit logging service
    │   │   └── server.js                     # Express application entry point
    │   ├── test/
    │   │   └── api-test.js                   # Automated backend test suite (33 assertions)
    │   ├── .env.example                      # Backend environment template
    │   ├── .env                              # Active configuration
    │   └── package.json
    │
    └── frontend/                              # React.js SPA (Vite)
        ├── src/
        │   ├── components/
        │   │   ├── Navbar.jsx                # Top navigation header with profile & role badge
        │   │   ├── ProtectedRoute.jsx        # Client-side route & role authentication guards
        │   │   ├── AppCard.jsx               # Zoho application launch cards
        │   │   ├── UserModal.jsx             # User creation and modification modal
        │   │   ├── RoleModal.jsx             # Role-permission mapping editor modal
        │   │   ├── AuditTable.jsx            # Searchable and filterable audit trail table
        │   │   ├── ZohoViewerModal.jsx       # Live Zoho data & JSON response payload explorer
        │   │   └── Toast.jsx                 # Toast notification alerts
        │   ├── pages/
        │   │   ├── LoginPage.jsx             # Login interface with 1-click demo autofill shortcuts
        │   │   ├── DashboardPage.jsx         # Role-based Zoho app dashboard & interactive RBAC tester
        │   │   ├── AdminPage.jsx             # User management, RBAC matrix, and audit trail tabs
        │   │   └── NotFoundPage.jsx          # 404 handler
        │   ├── services/
        │   │   ├── api.js                    # Axios instance with auth interceptor
        │   │   ├── authService.js            # Auth API client
        │   │   ├── adminService.js           # Users, roles, permissions, audit logs API client
        │   │   └── zohoService.js            # Zoho One data API client
        │   ├── utils/
        │   │   └── auth.js                   # Token parsing and session helpers
        │   ├── context/
        │   │   └── AuthContext.jsx           # React authentication state context
        │   ├── App.jsx                       # Application route definitions
        │   ├── main.jsx                      # React application entry point
        │   └── index.css                     # Design system (glassmorphism, variables, grid)
        ├── index.html
        ├── vite.config.js
        └── package.json
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **PostgreSQL:** Optional (if not present, the server automatically boots with its built-in memory datastore for zero-config evaluation)

### 1. Start the Backend Server

```bash
# Navigate to backend directory
cd custom-employee-portal/backend

# Install dependencies
npm install

# Run database migration and seed default roles and users
npm run seed

# Run the automated test suite (33 assertions)
npm test

# Launch backend API server
npm start
```
* Backend API will be active at: `http://localhost:5000`
* Health check endpoint: `http://localhost:5000/api/health`

### 2. Start the Frontend Application

```bash
# In a new terminal, navigate to frontend directory
cd custom-employee-portal/frontend

# Install dependencies
npm install

# Launch Vite development server
npm run dev
```
* Frontend Portal will be available at: `http://localhost:5173`

---

## 🏭 Production Deployment

### 1. Production Build for Frontend

```bash
cd custom-employee-portal/frontend
npm run build
```
The optimized production bundle will be generated in `custom-employee-portal/frontend/dist`.

### 2. Serving Frontend via Nginx / Production Server

Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name portal.yourdomain.com;

    root /var/www/brainwave/frontend/dist;
    index index.html;

    # SPA Routing fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy backend API calls
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. Running Backend with PM2 (Process Manager)

```bash
cd custom-employee-portal/backend
npm install -g pm2
pm2 start server.js --name "brainwave-backend" -i max
pm2 save
pm2 startup
```

---

## ⚙️ Environment Configuration

### Backend Configuration (`custom-employee-portal/backend/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=production
CLIENT_URL=http://localhost:5173

# JWT Authentication
JWT_SECRET=super_secret_jwt_key_brainwave_2026_enterprise_production
JWT_EXPIRES_IN=8h

# PostgreSQL Connection (Optional; uses resilient memory engine if unreachable)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=brainwave_portal
DB_USER=postgres
DB_PASSWORD=postgres

# Zoho One OAuth 2.0 Credentials (Server-to-Server)
# Leave empty to operate in Sandbox Mode with realistic Zoho JSON payloads
ZOHO_CLIENT_ID=1000.YOUR_ZOHO_CLIENT_ID
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REFRESH_TOKEN=1000.your_zoho_refresh_token
ZOHO_DC=zoho.com
```

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Role | Permissions Assigned | Authorized Zoho Applications | Admin Panel Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `VIEW_ZOHO_PEOPLE`<br>`VIEW_ZOHO_CRM`<br>`VIEW_ZOHO_DESK`<br>`VIEW_ZOHO_BOOKS`<br>`MANAGE_USERS`<br>`MANAGE_ROLES`<br>`VIEW_AUDIT_LOGS` | 👥 **Zoho People**<br>📈 **Zoho CRM**<br>🎧 **Zoho Desk**<br>💳 **Zoho Books** | **Full Administrative Control:**<br>• Create / Edit / Deactivate / Delete Users<br>• Assign & Switch Roles<br>• Toggle Role-Permission Matrix<br>• Audit Trail Stream |
| **HR** | `VIEW_ZOHO_PEOPLE` | 👥 **Zoho People** | None (Admin panel access forbidden) |
| **Sales** | `VIEW_ZOHO_CRM` | 📈 **Zoho CRM** | None (Admin panel access forbidden) |
| **Support** | `VIEW_ZOHO_DESK` | 🎧 **Zoho Desk** | None (Admin panel access forbidden) |
| **Finance** | `VIEW_ZOHO_BOOKS` | 💳 **Zoho Books** | None (Admin panel access forbidden) |

---

## 👥 Pre-Configured Demo Accounts

The login interface features **1-Click Demo Fill** shortcuts for seamless testing and video recording:

| Username | Password | Role | Account Status | Permitted Zoho Apps & Views |
| :--- | :--- | :--- | :--- | :--- |
| `admin` | `Admin@123` | **Admin** | Active | Zoho People, CRM, Desk, Books + Admin Management Center |
| `hr_user` | `Hr@123` | **HR** | Active | Zoho People (Employee Directory, Attendance) |
| `sales_user` | `Sales@123` | **Sales** | Active | Zoho CRM (Leads, Deals, Accounts) |
| `support_user` | `Support@123` | **Support** | Active | Zoho Desk (Support Tickets, SLA Tracking) |
| `finance_user` | `Finance@123` | **Finance** | Active | Zoho Books (Invoices, Revenue, Receivables) |
| `inactive_user` | `Inactive@123` | **Sales** | **Deactivated** | Blocked with deactivation alert notice |

---

## 🔑 Zoho OAuth 2.0 Setup Guide

To connect with live Zoho One REST endpoints:

1. **Access Zoho Developer Console:** Visit [https://api-console.zoho.com/](https://api-console.zoho.com/).
2. **Create a Server-Based Client:**
   - Client Name: `BrainWave Employee Portal`
   - Homepage URL: `http://localhost:5173`
   - Authorized Redirect URI: `https://api-console.zoho.com/`
3. **Generate Code (Grant Token):**
   - Under the **Generate Code** tab, enter the required scopes:
     ```text
     ZohoCRM.modules.ALL,ZohoPeople.employee.ALL,Desk.tickets.ALL,ZohoBooks.invoices.ALL
     ```
   - Set Time Duration to **10 minutes** and click **Generate**.
4. **Exchange for Persistent Refresh Token:**
   Run the following cURL request in your terminal:
   ```bash
   curl -X POST https://accounts.zoho.com/oauth/v2/token \
     -d "code=YOUR_GRANT_TOKEN" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "grant_type=authorization_code"
   ```
5. **Add to `.env`:**
   Insert `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, and `ZOHO_REFRESH_TOKEN` into `custom-employee-portal/backend/.env`.

> 💡 **Zero-Config Sandbox Mode:** If live Zoho credentials are omitted, the built-in `zohoService.js` automatically returns realistic Zoho One JSON payloads so all UI views, data tables, and RBAC rejections remain 100% functional.

---

## 📡 REST API Specification

### Authentication Endpoints (`/api/auth`)
- `POST /api/auth/login`: Authenticate with username & password; returns JWT token, user profile, and assigned permissions.
- `POST /api/auth/logout`: Invalidate session and record `LOGOUT` audit log event.
- `GET /api/auth/me`: Validate active JWT token and retrieve updated permissions.

### Zoho One Application Endpoints (`/api/zoho`)
- `GET /api/zoho/authorized-apps`: Returns list of Zoho apps authorized for the caller's role.
- `GET /api/zoho/people`: Fetch Zoho People data *(Guarded by `VIEW_ZOHO_PEOPLE`)*.
- `GET /api/zoho/crm`: Fetch Zoho CRM data *(Guarded by `VIEW_ZOHO_CRM`)*.
- `GET /api/zoho/desk`: Fetch Zoho Desk data *(Guarded by `VIEW_ZOHO_DESK`)*.
- `GET /api/zoho/books`: Fetch Zoho Books data *(Guarded by `VIEW_ZOHO_BOOKS`)*.

### Administration Endpoints (`/api/users`, `/api/roles`, `/api/audit-logs`)
- `GET /api/users`: List all registered employees *(Requires `MANAGE_USERS`)*.
- `POST /api/users`: Create new employee account *(Requires `MANAGE_USERS`)*.
- `PUT /api/users/:id`: Modify employee profile & role *(Requires `MANAGE_USERS`)*.
- `PATCH /api/users/:id/status`: Toggle user activation status *(Requires `MANAGE_USERS`)*.
- `DELETE /api/users/:id`: Delete employee account *(Requires `MANAGE_USERS`)*.
- `GET /api/roles`: List roles and mapped permissions *(Requires `MANAGE_ROLES`)*.
- `PUT /api/roles/:id/permissions`: Update permissions assigned to a role *(Requires `MANAGE_ROLES`)*.
- `GET /api/permissions`: List all system permission definitions *(Requires `MANAGE_ROLES`)*.
- `GET /api/audit-logs`: Query chronological security audit trail *(Requires `VIEW_AUDIT_LOGS`)*.

---

## 🔒 Security & Production Hardening

- **Password Encryption:** Passwords hashed with `bcryptjs` using a salt work factor of 10. Plaintext credentials are never saved or exposed.
- **Signed JWT Sessions:** Stateless Bearer tokens signed with cryptographic secrets; payload contains only non-sensitive identity metadata.
- **Server-Side Token Isolation:** Zoho client credentials and refresh tokens remain strictly on the backend server.
- **Strict Role & Permission Enforcement:** Double-layered RBAC checking with both route-level permission middleware and active account state verification.
- **Sanitized Audit Trails:** Sensitive request data (passwords, tokens, database secrets) is systematically stripped before persisting audit logs.
- **Resilient Fallback Engine:** Handles database disconnections gracefully without server crashes or unhandled promise rejections.

---

## 🧪 Automated Testing & Verification

The repository includes a comprehensive automated test suite verifying 33 critical authentication, RBAC, and admin behaviors:

```bash
cd custom-employee-portal/backend
npm test
```

### Test Suite Coverage:
```text
============================================================
           BRAINWAVE PORTAL API TEST SUITE
============================================================
✔ Health check responds 200 OK
✔ Validation: empty username & password returns 400 with exact error
✔ Validation: empty username returns 400
✔ Validation: empty password returns 400
✔ Auth: Non-existent user returns 401
✔ Auth: Wrong password returns 401
✔ Auth: Deactivated user returns 403 with deactivation message
✔ Auth: Admin login returns 200 with JWT and permissions
✔ Auth: HR login returns 200 with VIEW_ZOHO_PEOPLE
✔ Auth: Sales login returns 200 with VIEW_ZOHO_CRM
✔ Auth: Support login returns 200 with VIEW_ZOHO_DESK
✔ Auth: Finance login returns 200 with VIEW_ZOHO_BOOKS
✔ RBAC: HR authorized for Zoho People (200)
✔ RBAC: HR forbidden from Zoho CRM (403 Forbidden)
✔ RBAC: HR forbidden from Zoho Books (403 Forbidden)
✔ RBAC: Sales authorized for Zoho CRM (200)
✔ RBAC: Sales forbidden from Zoho People (403 Forbidden)
✔ RBAC: Support authorized for Zoho Desk (200)
✔ RBAC: Finance authorized for Zoho Books (200)
✔ RBAC: Admin authorized for Zoho People (200)
✔ RBAC: Admin authorized for Zoho CRM (200)
✔ RBAC: Admin authorized for Zoho Desk (200)
✔ RBAC: Admin authorized for Zoho Books (200)
✔ Security: Non-admin calling /api/users returns 403
✔ Security: Non-admin calling /api/audit-logs returns 403
✔ Admin: List users returns 200 with user collection
✔ Admin: Create user returns 201
✔ Admin: Duplicate username returns 409 Conflict
✔ Admin: Duplicate email returns 409 Conflict
✔ Admin: Invalid role assignment returns 400 Bad Request
✔ Admin: Deactivate user returns 200 and blocks login
✔ Admin: Update role permissions returns 200
✔ Audit: Audit logs stream contains LOGIN_SUCCESS, UNAUTHORIZED_ACCESS, USER_CREATED

------------------------------------------------------------
Total: 33 passed, 0 failed (100% SUCCESS)
============================================================
```

---

## 🎬 3–5 Minute Demo Video Script

| Timestamp | Phase | What to Demonstrate & Explain |
| :--- | :--- | :--- |
| **0:00 – 1:00** | **Authentication & Validation Edge Cases** | 1. Attempt login with empty fields -> point out validation alerts.<br>2. Enter wrong password -> observe invalid credential warning.<br>3. Click **Inactive Account** demo shortcut -> demonstrate account deactivation rejection. |
| **1:00 – 2:30** | **Role-Based Access Control in Action** | 1. Log in as **HR Manager (`hr_user`)** -> Show only **Zoho People** card is rendered.<br>2. Open Zoho People -> view live employee directory and attendance.<br>3. In the **Live RBAC Tester**, test `GET /api/zoho/crm` -> observe instant **`403 Forbidden`** rejection.<br>4. Log in as **Sales Director (`sales_user`)** -> Show only **Zoho CRM** is displayed.<br>5. Log in as **Finance Controller (`finance_user`)** -> Show only **Zoho Books** is accessible. |
| **2:30 – 4:00** | **Admin Control Panel & User Management** | 1. Log in as **Admin (`admin`)** -> observe all 4 Zoho application cards.<br>2. Click **Admin Panel** in the top navigation bar.<br>3. Click **Add New Employee** -> register a new user and assign a department role.<br>4. Toggle user active/deactivated state.<br>5. Open **Roles & Permissions** tab -> show how permission toggles dynamically modify role capabilities. |
| **4:00 – 5:00** | **Security Audit Trail & Zoho Integration** | 1. Open **Security Audit Trail** tab.<br>2. Highlight live log entries for `LOGIN_SUCCESS`, `UNAUTHORIZED_ACCESS`, and `ZOHO_ACCESS` with timestamps and IP addresses.<br>3. Conclude with summary of zero-client-credential architecture. |

---

## 📄 License

This project is distributed under the MIT License.
