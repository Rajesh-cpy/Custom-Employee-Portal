import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="#10b981" />,
    warning: <AlertTriangle size={18} color="#f59e0b" />,
    error: <XCircle size={18} color="#ef4444" />,
    info: <Info size={18} color="#6366f1" />
  };

  const borders = {
    success: 'rgba(16, 185, 129, 0.4)',
    warning: 'rgba(245, 158, 11, 0.4)',
    error: 'rgba(239, 68, 68, 0.4)',
    info: 'rgba(99, 102, 241, 0.4)'
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        background: '#111a2e',
        border: `1px solid ${borders[type] || borders.info}`,
        borderRadius: 12,
        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        maxWidth: 420,
        animation: 'slideIn 0.25s ease-out'
      }}
    >
      {icons[type]}
      <span style={{ fontSize: '0.875rem', color: '#f8fafc', flex: 1, fontWeight: 500 }}>
        {message}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: 4
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
