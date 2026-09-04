import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Admin (Executive)', username: 'admin', password: 'Admin@123', role: 'Admin', desc: 'All Zoho Apps & Admin Controls' },
  { label: 'Regional Manager', username: 'manager_user', password: 'Manager@123', role: 'Manager', desc: 'Team Reports & CRM / People' },
  { label: 'HR Manager', username: 'hr_user', password: 'Hr@123', role: 'HR', desc: 'Zoho People Authorized' },
  { label: 'Sales Director', username: 'sales_user', password: 'Sales@123', role: 'Sales', desc: 'Zoho CRM Authorized' },
  { label: 'Support Specialist', username: 'support_user', password: 'Support@123', role: 'Support', desc: 'Zoho Desk Authorized' },
  { label: 'Finance Controller', username: 'finance_user', password: 'Finance@123', role: 'Finance', desc: 'Zoho Books Authorized' },
  { label: 'Inactive Account', username: 'inactive_user', password: 'Inactive@123', role: 'Deactivated', desc: 'Deactivation Edge Case' }
];

export default function LoginPage({ onNavigate }) {
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      onNavigate('dashboard');
    }
  }, [isAuthenticated, onNavigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Exact frontend validation edge cases
    const hasUser = username.trim().length > 0;
    const hasPass = password.trim().length > 0;

    if (!hasUser && !hasPass) {
      setError('Username and password are required');
      return;
    }
    if (!hasUser) {
      setError('Username is required');
      return;
    }
    if (!hasPass) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      onNavigate('dashboard');
    } catch (err) {
      const serverMsg = err.response?.data?.error || err.message;
      setError(serverMsg || 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demo) => {
    setUsername(demo.username);
    setPassword(demo.password);
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative'
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Portal Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 28px rgba(99, 102, 241, 0.45)'
            }}
          >
            <Shield size={30} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            BrainWave Portal
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Custom Employee Single-Sign-On &bull; Zoho One Integration
          </p>
        </div>

        {/* Login Glass Card */}
        <div className="glass-panel" style={{ padding: '32px 28px' }}>
          {error && (
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 10,
                color: '#f87171',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 20
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            {/* Username Input */}
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="Enter employee username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  placeholder="Enter secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 4
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px 20px', fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Fast Fill Credentials */}
        <div style={{ marginTop: 24, padding: 16, background: 'rgba(15, 23, 42, 0.6)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Quick Demo Login Accounts
            </span>
            <span style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 600 }}>Click to Autofill</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {DEMO_ACCOUNTS.map(demo => (
              <button
                key={demo.username}
                type="button"
                onClick={() => handleQuickFill(demo)}
                className="btn btn-secondary btn-sm"
                style={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 2
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{demo.role}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>@{demo.username}</span>
                </div>
                <span style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>{demo.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Security Footer */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Protected by Enterprise JWT Authentication &bull; Zoho One OAuth Gateway
        </div>
      </div>
    </div>
  );
}
