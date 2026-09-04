import React, { useState } from 'react';
import { Search, RefreshCw, ShieldAlert, CheckCircle2, XCircle, Info, Activity } from 'lucide-react';

export default function AuditTable({ logs = [], loading, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (log.username && log.username.toLowerCase().includes(term)) ||
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.resource && log.resource.toLowerCase().includes(term)) ||
      (log.details && log.details.toLowerCase().includes(term));

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getStatusBadge = (status, action) => {
    if (action === 'UNAUTHORIZED_ACCESS' || status === 'DENIED') {
      return (
        <span className="badge badge-inactive" style={{ fontSize: '0.675rem' }}>
          <ShieldAlert size={12} /> DENIED
        </span>
      );
    }
    if (status === 'FAILED') {
      return (
        <span className="badge badge-inactive" style={{ fontSize: '0.675rem' }}>
          <XCircle size={12} /> FAILED
        </span>
      );
    }
    return (
      <span className="badge badge-active" style={{ fontSize: '0.675rem' }}>
        <CheckCircle2 size={12} /> SUCCESS
      </span>
    );
  };

  const getActionBadge = (action) => {
    if (action === 'LOGIN_SUCCESS') return <span className="badge badge-support">{action}</span>;
    if (action === 'LOGIN_FAILED' || action === 'UNAUTHORIZED_ACCESS') return <span className="badge badge-inactive">{action}</span>;
    if (action === 'ZOHO_ACCESS') return <span className="badge badge-hr">{action}</span>;
    if (action === 'USER_CREATED' || action === 'ROLE_ASSIGNED') return <span className="badge badge-admin">{action}</span>;
    return <span className="badge badge-sales">{action}</span>;
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'N/A';
    try {
      const date = new Date(ts);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return ts;
    }
  };

  return (
    <div>
      {/* Search and Filters Bar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 280 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 36 }}
              placeholder="Search user, action, endpoint, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-input"
            style={{ width: 180, cursor: 'pointer' }}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="ALL">All Actions</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="UNAUTHORIZED_ACCESS">UNAUTHORIZED_ACCESS</option>
            <option value="ZOHO_ACCESS">ZOHO_ACCESS</option>
            <option value="USER_CREATED">USER_CREATED</option>
            <option value="USER_UPDATED">USER_UPDATED</option>
            <option value="ROLE_ASSIGNED">ROLE_ASSIGNED</option>
            <option value="PERMISSION_UPDATED">PERMISSION_UPDATED</option>
          </select>
        </div>

        <button onClick={onRefresh} className="btn btn-secondary btn-sm" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spinner' : ''} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource / Endpoint</th>
              <th>Status</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                  {loading ? 'Loading audit records...' : 'No matching audit logs found.'}
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {formatTimestamp(log.created_at)}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {log.username || <span style={{ color: 'var(--text-muted)' }}>SYSTEM</span>}
                  </td>
                  <td>{getActionBadge(log.action)}</td>
                  <td>
                    <code>{log.resource || '—'}</code>
                  </td>
                  <td>{getStatusBadge(log.status, log.action)}</td>
                  <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }} title={log.details}>
                    {log.details || '—'}
                  </td>
                  <td>
                    <small style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {log.ip_address || '127.0.0.1'}
                    </small>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
