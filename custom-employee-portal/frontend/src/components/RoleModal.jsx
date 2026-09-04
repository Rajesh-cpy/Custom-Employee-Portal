import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { X, Shield, Check, AlertCircle } from 'lucide-react';

export default function RoleModal({ role, allPermissions = [], onClose, onSaved }) {
  const [selectedPermIds, setSelectedPermIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role && role.permissions) {
      // Find IDs of currently assigned permissions
      const assignedIds = role.permissions.map(p => {
        if (typeof p === 'object') return p.id;
        const found = allPermissions.find(perm => perm.name === p);
        return found ? found.id : null;
      }).filter(Boolean);
      setSelectedPermIds(assignedIds);
    }
  }, [role, allPermissions]);

  const togglePermission = (permId) => {
    setSelectedPermIds(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adminService.updateRolePermissions(role.id, selectedPermIds);
      onSaved(`Permissions updated for role ${role.name}`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role permissions.');
    } finally {
      setLoading(false);
    }
  };

  if (!role) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
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
              <Shield size={18} color="#818cf8" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Manage Permissions: {role.name}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {role.description}
              </span>
            </div>
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

        <form onSubmit={handleSave}>
          <div style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 4, margin: '16px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {allPermissions.map(perm => {
                const isSelected = selectedPermIds.includes(perm.id);
                return (
                  <div
                    key={perm.id}
                    onClick={() => togglePermission(perm.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 8,
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${isSelected ? 'rgba(99, 102, 241, 0.4)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isSelected ? '#818cf8' : 'var(--text-primary)' }}>
                        {perm.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {perm.description}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                        background: isSelected ? 'var(--accent-primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}
                    >
                      {isSelected && <Check size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {selectedPermIds.length} permissions assigned
            </span>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <div className="spinner" /> : 'Save Permissions'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
