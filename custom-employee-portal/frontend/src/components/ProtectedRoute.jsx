import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ children, adminOnly = false, onNavigate }) {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (onNavigate) {
      onNavigate('login');
      return null;
    }
    window.location.href = '/login';
    return null;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="page-container" style={{ textAlign: 'center', marginTop: 80 }}>
        <div className="glass-panel" style={{ maxWidth: 540, margin: '0 auto', padding: 40 }}>
          <ShieldAlert size={56} color="#ef4444" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Admin Privileges Required</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            Access denied. You do not possess the administrative role required to view or modify system management controls.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="btn btn-primary"
          >
            <ArrowLeft size={16} /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}
