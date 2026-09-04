import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, LayoutDashboard, ShieldCheck, UserCheck } from 'lucide-react';

export default function Navbar({ currentView, onNavigate }) {
  const { user, isAdmin, logout } = useAuth();

  const getRoleBadgeClass = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return 'badge-admin';
    if (r === 'hr') return 'badge-hr';
    if (r === 'sales') return 'badge-sales';
    if (r === 'support') return 'badge-support';
    if (r === 'finance') return 'badge-finance';
    return 'badge-admin';
  };

  return (
    <header
      style={{
        height: 70,
        background: 'rgba(17, 26, 46, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
          }}
        >
          <Shield size={20} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            BrainWave<span style={{ color: 'var(--accent-primary)', marginLeft: 4 }}>Portal</span>
          </h1>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            ENTERPRISE RBAC &bull; ZOHO ONE
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => onNavigate('dashboard')}
          className={`btn ${currentView === 'dashboard' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <LayoutDashboard size={15} /> Dashboard
        </button>

        {isAdmin && (
          <button
            onClick={() => onNavigate('admin')}
            className={`btn ${currentView === 'admin' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <ShieldCheck size={15} /> Admin Panel
          </button>
        )}
      </nav>

      {/* User Info & Logout */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user.name || user.username}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginTop: 2 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{user.username}</span>
                {user.roles && user.roles.map(r => (
                  <span key={r} className={`badge ${getRoleBadgeClass(r)}`} style={{ padding: '2px 8px', fontSize: '0.675rem' }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
                fontWeight: 700
              }}
            >
              {(user.name || user.username).charAt(0).toUpperCase()}
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-danger btn-sm"
            title="Sign Out"
            style={{ padding: '8px 12px' }}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
