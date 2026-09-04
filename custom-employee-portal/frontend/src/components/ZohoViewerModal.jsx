import React, { useState, useEffect } from 'react';
import { zohoService } from '../services/zohoService';
import { X, ShieldCheck, RefreshCw, Layers, CheckCircle2, AlertCircle, Users, TrendingUp, Headphones, DollarSign, Code, Table } from 'lucide-react';

export default function ZohoViewerModal({ app, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewTab, setViewTab] = useState('ui'); // 'ui' or 'json'

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (app.id === 'zoho-people') res = await zohoService.getPeople();
      else if (app.id === 'zoho-crm') res = await zohoService.getCrm();
      else if (app.id === 'zoho-desk') res = await zohoService.getDesk();
      else if (app.id === 'zoho-books') res = await zohoService.getBooks();

      if (res && res.success) {
        setData(res.data);
      } else {
        setError(res?.error || 'Failed to fetch Zoho application records');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to establish connection to Zoho One services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (app) fetchData();
  }, [app]);

  if (!app) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 880, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}
            >
              <Layers size={22} color="#818cf8" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{app.name} Integration Explorer</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span className="badge badge-admin" style={{ padding: '2px 8px', fontSize: '0.675rem' }}>
                  Backend OAuth 2.0
                </span>
                <span>Endpoint: <code>{app.endpoint}</code></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={fetchData}
              className="btn btn-secondary btn-sm"
              disabled={loading}
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading ? 'spinner' : ''} />
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 8px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setViewTab('ui')}
            className={`btn btn-sm ${viewTab === 'ui' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Table size={14} /> Interactive Records
          </button>
          <button
            onClick={() => setViewTab('json')}
            className={`btn btn-sm ${viewTab === 'json' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Code size={14} /> Raw API Payload
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          {loading && (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Querying backend Zoho One OAuth Proxy...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="glass-panel" style={{ padding: 24, textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
              <AlertCircle size={36} color="#ef4444" style={{ marginBottom: 12 }} />
              <h3 style={{ color: '#f87171', fontSize: '1.1rem', marginBottom: 6 }}>Zoho Connection Notice</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>{error}</p>
              <button onClick={fetchData} className="btn btn-secondary btn-sm">Try Again</button>
            </div>
          )}

          {data && !loading && viewTab === 'json' && (
            <div style={{ background: '#0a0f1d', borderRadius: 8, padding: 16, border: '1px solid var(--border-subtle)' }}>
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#38bdf8', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}

          {data && !loading && viewTab === 'ui' && (
            <div>
              {/* Summary Metrics Bar */}
              {data.summary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
                  {Object.entries(data.summary).map(([k, v]) => (
                    <div key={k} className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(15, 23, 42, 0.6)' }}>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {k.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Zoho People Content */}
              {app.id === 'zoho-people' && data.employees && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)' }}>
                    Employee Directory (Zoho People Core)
                  </h4>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Employee Name</th>
                          <th>Role & Department</th>
                          <th>Email</th>
                          <th>Leave Balance</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.employees.map(emp => (
                          <tr key={emp.id}>
                            <td><code>{emp.id}</code></td>
                            <td style={{ fontWeight: 600 }}>{emp.name}</td>
                            <td>
                              <div>{emp.role}</div>
                              <small style={{ color: 'var(--text-muted)' }}>{emp.department}</small>
                            </td>
                            <td>{emp.email}</td>
                            <td>{emp.leaveBalance}</td>
                            <td>
                              <span className={`badge ${emp.status === 'Active' ? 'badge-active' : 'badge-sales'}`}>
                                {emp.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Zoho CRM Content */}
              {app.id === 'zoho-crm' && data.deals && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)' }}>
                    Active Deals Pipeline (Zoho CRM)
                  </h4>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Deal ID</th>
                          <th>Opportunity Name</th>
                          <th>Account</th>
                          <th>Stage</th>
                          <th>Amount</th>
                          <th>Probability</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.deals.map(deal => (
                          <tr key={deal.id}>
                            <td><code>{deal.id}</code></td>
                            <td style={{ fontWeight: 600 }}>{deal.dealName}</td>
                            <td>{deal.account}</td>
                            <td>
                              <span className="badge badge-sales">{deal.stage}</span>
                            </td>
                            <td style={{ fontWeight: 700, color: '#34d399' }}>{deal.amount}</td>
                            <td>{deal.probability}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Zoho Desk Content */}
              {app.id === 'zoho-desk' && data.tickets && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)' }}>
                    Support Resolution Queue (Zoho Desk)
                  </h4>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Ticket ID</th>
                          <th>Subject</th>
                          <th>Customer</th>
                          <th>Priority</th>
                          <th>Assignee</th>
                          <th>SLA Remaining</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.tickets.map(t => (
                          <tr key={t.id}>
                            <td><code>{t.id}</code></td>
                            <td style={{ fontWeight: 600 }}>{t.subject}</td>
                            <td>{t.customer}</td>
                            <td>
                              <span className={`badge ${t.priority === 'Urgent' || t.priority === 'High' ? 'badge-inactive' : 'badge-support'}`}>
                                {t.priority}
                              </span>
                            </td>
                            <td>{t.assignee}</td>
                            <td>{t.slaRemaining}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Zoho Books Content */}
              {app.id === 'zoho-books' && data.invoices && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)' }}>
                    Accounts & Invoicing Ledger (Zoho Books)
                  </h4>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Invoice #</th>
                          <th>Client</th>
                          <th>Amount</th>
                          <th>Balance Due</th>
                          <th>Status</th>
                          <th>Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.invoices.map(inv => (
                          <tr key={inv.invoiceNumber}>
                            <td><code>{inv.invoiceNumber}</code></td>
                            <td style={{ fontWeight: 600 }}>{inv.customer}</td>
                            <td style={{ fontWeight: 700 }}>{inv.amount}</td>
                            <td>{inv.balanceDue}</td>
                            <td>
                              <span className={`badge ${inv.status.includes('Paid') ? 'badge-active' : 'badge-sales'}`}>
                                {inv.status}
                              </span>
                            </td>
                            <td>{inv.dueDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span>Audited & verified by BrainWave RBAC Gateway</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary">
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
}
