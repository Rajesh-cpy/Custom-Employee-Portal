import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import Navbar from '../components/Navbar';
import UserModal from '../components/UserModal';
import RoleModal from '../components/RoleModal';
import AuditTable from '../components/AuditTable';
import Toast from '../components/Toast';
import { 
  Users, 
  ShieldCheck, 
  FileText, 
  UserPlus, 
  Edit, 
  Power, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Lock,
  Layers,
  ShieldAlert,
  Trash2
} from 'lucide-react';

export default function AdminPage({ onNavigate }) {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('users'); // 'users', 'roles', 'audit'

  // Data states
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // UI / Loading states
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  // Modals
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, permsRes, auditRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getRoles(),
        adminService.getPermissions(),
        adminService.getAuditLogs(100)
      ]);

      if (usersRes.success) setUsers(usersRes.data || []);
      if (rolesRes.success) setRoles(rolesRes.data || []);
      if (permsRes.success) setPermissions(permsRes.data || []);
      if (auditRes.success) setAuditLogs(auditRes.data || []);
    } catch (err) {
      setToast({
        message: err.response?.data?.error || 'Failed to load administrative data.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleToggleStatus = async (targetUser) => {
    const newStatus = !targetUser.isActive;
    try {
      await adminService.toggleUserStatus(targetUser.id, newStatus);
      setToast({
        message: `User ${targetUser.username} ${newStatus ? 'activated' : 'deactivated'} successfully`,
        type: 'success'
      });
      fetchAllData();
    } catch (err) {
      setToast({
        message: err.response?.data?.error || 'Failed to update user status.',
        type: 'error'
      });
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account "${targetUser.username}"?`)) {
      return;
    }
    try {
      await adminService.deleteUser(targetUser.id);
      setToast({
        message: `User ${targetUser.username} deleted permanently.`,
        type: 'success'
      });
      fetchAllData();
    } catch (err) {
      setToast({
        message: err.response?.data?.error || 'Failed to delete user account.',
        type: 'error'
      });
    }
  };

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setUserModalOpen(true);
  };

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserModalOpen(true);
  };

  const handleOpenEditRole = (r) => {
    setEditingRole(r);
    setRoleModalOpen(true);
  };

  const getRoleBadgeClass = (roleName) => {
    const r = (roleName || '').toLowerCase();
    if (r === 'admin') return 'badge-admin';
    if (r === 'hr') return 'badge-hr';
    if (r === 'sales') return 'badge-sales';
    if (r === 'support') return 'badge-support';
    if (r === 'finance') return 'badge-finance';
    return 'badge-admin';
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.roles && u.roles.some(r => r.toLowerCase().includes(term)))
    );
  });

  return (
    <div className="main-content">
      <Navbar currentView="admin" onNavigate={onNavigate} />

      <main className="page-container">
        {/* Admin Header */}
        <div
          className="glass-panel"
          style={{
            padding: '24px 32px',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-admin">
                <ShieldCheck size={12} /> Executive Control View
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              Administration & Access Control Center
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 2 }}>
              Manage users, assign RBAC enterprise roles, configure Zoho permissions, and inspect security audit logs.
            </p>
          </div>

          <button onClick={fetchAllData} className="btn btn-secondary btn-sm" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spinner' : ''} />
            <span>Refresh System Data</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
          <button
            onClick={() => setActiveTab('users')}
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Users size={16} /> User Accounts ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`btn ${activeTab === 'roles' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ShieldCheck size={16} /> Roles & Permissions ({roles.length})
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <FileText size={16} /> Security Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* Tab 1: User Management */}
        {activeTab === 'users' && (
          <div>
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ position: 'relative', width: 320, maxWidth: '100%' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="Search user by name, username, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button onClick={handleOpenCreateUser} className="btn btn-primary">
                <UserPlus size={16} /> Add New Employee
              </button>
            </div>

            {/* Users Table */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee Name</th>
                    <th>Username & Email</th>
                    <th>Assigned Role</th>
                    <th>Account Status</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                        {loading ? 'Loading users...' : 'No users found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td><code>#{u.id}</code></td>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td>
                          <div>@{u.username}</div>
                          <small style={{ color: 'var(--text-muted)' }}>{u.email}</small>
                        </td>
                        <td>
                          {u.roles && u.roles.map(r => (
                            <span key={r} className={`badge ${getRoleBadgeClass(r)}`}>
                              {r}
                            </span>
                          ))}
                        </td>
                        <td>
                          <span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>
                            {u.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="btn btn-secondary btn-sm"
                              title="Edit user details and role"
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`btn btn-sm ${u.isActive ? 'btn-secondary' : 'btn-secondary'}`}
                              title={u.isActive ? 'Deactivate account' : 'Activate account'}
                              disabled={u.id === user.id}
                            >
                              <Power size={14} color={u.isActive ? '#f87171' : '#34d399'} />
                              <span>{u.isActive ? 'Deactivate' : 'Activate'}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="btn btn-danger btn-sm"
                              title="Permanently delete user account"
                              disabled={u.id === user.id}
                              style={{ padding: '6px 10px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Role & Permission Matrix */}
        {activeTab === 'roles' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Role-to-Permission Matrix
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Configure application access and administrative authorizations per role. Changes apply immediately to authorization checks.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
              {roles.map(role => (
                <div key={role.id} className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span className={`badge ${getRoleBadgeClass(role.name)}`} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                        {role.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {role.permissions ? role.permissions.length : 0} Permissions
                      </span>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                      {role.description}
                    </p>

                    <div style={{ marginBottom: 20 }}>
                      <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                        Assigned Permissions:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {role.permissions && role.permissions.map(p => (
                          <span
                            key={typeof p === 'object' ? p.name : p}
                            style={{
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-mono)',
                              background: 'rgba(15, 23, 42, 0.8)',
                              padding: '4px 8px',
                              borderRadius: 6,
                              border: '1px solid var(--border-subtle)',
                              color: '#818cf8'
                            }}
                          >
                            {typeof p === 'object' ? p.name : p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEditRole(role)}
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                  >
                    <Edit size={14} /> Modify Role Permissions
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Security Audit Trail */}
        {activeTab === 'audit' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Enterprise Security Audit Logs
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Comprehensive, tamper-resistant trail of authentication attempts, Zoho API requests, and user management events.
              </p>
            </div>

            <AuditTable
              logs={auditLogs}
              loading={loading}
              onRefresh={fetchAllData}
            />
          </div>
        )}
      </main>

      {/* User Create / Edit Modal */}
      {userModalOpen && (
        <UserModal
          user={editingUser}
          roles={roles}
          onClose={() => setUserModalOpen(false)}
          onSaved={(msg) => {
            setToast({ message: msg, type: 'success' });
            fetchAllData();
          }}
        />
      )}

      {/* Role Permissions Edit Modal */}
      {roleModalOpen && (
        <RoleModal
          role={editingRole}
          allPermissions={permissions}
          onClose={() => setRoleModalOpen(false)}
          onSaved={(msg) => {
            setToast({ message: msg, type: 'success' });
            fetchAllData();
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
