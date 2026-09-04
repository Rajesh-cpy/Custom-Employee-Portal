import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage({ onNavigate }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="glass-panel" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: 40 }}>
        <Compass size={56} color="#818cf8" style={{ marginBottom: 16 }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>404</h1>
        <h2 style={{ fontSize: '1.2rem', marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
          The portal page you requested does not exist or has been relocated.
        </p>
        <button onClick={() => onNavigate('dashboard')} className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Dashboard
        </button>
      </div>
    </div>
  );
}
