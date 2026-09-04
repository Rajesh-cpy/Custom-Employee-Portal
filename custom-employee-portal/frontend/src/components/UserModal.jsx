import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { X, UserPlus, UserCheck, AlertCircle } from 'lucide-react';

export default function UserModal({ user, roles = [], onClose, onSaved }) {
  const isEditing = Boolean(user);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('HR');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setName(user.name || '');
      setRole(user.roles && user.roles.length > 0 ? user.roles[0] : 'HR');
      setIsActive(user.isActive !== undefined ? user.isActive : true);
    } else {
      setUsername('');
      setEmail('');
      setName('');
      setPassword('');
      setRole(roles.length > 0 ? roles[0].name : 'HR');
      setIsActive(true);
    }
  }, [user, roles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic frontend checks
    if (!name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!isEditing) {
      if (!username.trim()) {
        setError('Username is required');
        return;
      }
      if (!password.trim()) {
        setError('Password is required');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);
    try {
      if (isEditing) {
        await adminService.updateUser(user.id, {
          name: name.trim(),
          email: email.trim(),
          isActive,
          role
        });
      } else {
        await adminService.createUser({
          username: username.trim(),
          email: email.trim(),
          name: name.trim(),
          password,
          role,
          isActive
        });
      }
      onSaved(isEditing ? 'User updated successfully' : 'User created successfully');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save user account. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isEditing ? <UserCheck size={18} color="#818cf8" /> : <UserPlus size={18} color="#818cf8" />}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {isEditing ? `Edit User: ${user.username}` : 'Add New Enterprise User'}
            </h2>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 8,
              color: '#f87171',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isEditing}
              placeholder="e.g. j.doe"
              required={!isEditing}
            />
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. j.doe@brainwave.io"
              required
            />
          </div>

          {/* Password (Only on Create) */}
          {!isEditing && (
            <div className="form-group">
              <label className="form-label">Temporary Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
            </div>
          )}

          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Assigned Role</label>
            <select
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              {roles.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name} — {r.description}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 24px' }}>
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            <label htmlFor="isActiveCheck" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>
              Account Active Status (Enabled)
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : (isEditing ? 'Save Changes' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
