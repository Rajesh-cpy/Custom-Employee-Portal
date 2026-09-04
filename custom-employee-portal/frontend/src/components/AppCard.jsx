import React from 'react';
import { Users, TrendingUp, Headphones, DollarSign, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AppCard({ app, onLaunch }) {
  const iconMap = {
    'zoho-people': <Users size={28} color="#60a5fa" />,
    'zoho-crm': <TrendingUp size={28} color="#fbbf24" />,
    'zoho-desk': <Headphones size={28} color="#34d399" />,
    'zoho-books': <DollarSign size={28} color="#e879f9" />
  };

  const borderAccents = {
    'zoho-people': 'rgba(59, 130, 246, 0.3)',
    'zoho-crm': 'rgba(245, 158, 11, 0.3)',
    'zoho-desk': 'rgba(16, 185, 129, 0.3)',
    'zoho-books': 'rgba(217, 70, 239, 0.3)'
  };

  const bgGradients = {
    'zoho-people': 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(17, 26, 46, 0.95) 100%)',
    'zoho-crm': 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(17, 26, 46, 0.95) 100%)',
    'zoho-desk': 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(17, 26, 46, 0.95) 100%)',
    'zoho-books': 'linear-gradient(135deg, rgba(217, 70, 239, 0.08) 0%, rgba(17, 26, 46, 0.95) 100%)'
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: bgGradients[app.id] || 'var(--bg-card)',
        borderColor: borderAccents[app.id] || 'var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'rgba(15, 23, 42, 0.8)',
              border: `1px solid ${borderAccents[app.id] || 'var(--border-subtle)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            {iconMap[app.id] || <Users size={28} />}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="badge badge-active" style={{ fontSize: '0.675rem' }}>
              <CheckCircle2 size={12} /> Authorized
            </span>
          </div>
        </div>

        {/* Title and Category */}
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {app.category}
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
            {app.name}
          </h3>
        </div>

        {/* Description */}
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
          {app.description}
        </p>
      </div>

      {/* Footer / Launch Button */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.725rem',
            color: 'var(--text-muted)',
            marginBottom: 16,
            padding: '6px 10px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.04)'
          }}
        >
          <ShieldCheck size={14} color="#818cf8" />
          <span>Permission: <code>{app.requiredPermission}</code></span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => onLaunch(app)}
            className="btn btn-primary"
            style={{ width: '100%', padding: '11px 16px', fontSize: '0.875rem' }}
          >
            <span>Launch {app.name} Explorer</span>
            <ExternalLink size={15} />
          </button>

          <a
            href={
              app.id === 'zoho-people' ? 'https://people.zoho.com' :
              app.id === 'zoho-crm' ? 'https://crm.zoho.com' :
              app.id === 'zoho-desk' ? 'https://desk.zoho.com' :
              app.id === 'zoho-books' ? 'https://books.zoho.com' : 'https://one.zoho.com'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem', textDecoration: 'none' }}
          >
            <span>Open {app.name} Portal Web</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
