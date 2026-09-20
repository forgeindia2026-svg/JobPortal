import React from 'react';
import { Shield, LogOut } from 'lucide-react';

export default function AdminNavbar({ currentUser, onLogout }) {
  return (
    <nav className="top-nav" style={{ background: '#0f172a' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <a href="#" className="brand">
          <div className="brand-icon">
            <Shield size={22} />
          </div>
          <div>
            <span style={{ color: '#ffffff' }}>Recruitment</span>
            <span style={{ color: '#f59e0b' }}>Admin</span>
          </div>
        </a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {currentUser && (
          <div className="user-pill">
            <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', textTransform: 'capitalize' }}>
              ({currentUser.role})
            </span>
            <button
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginLeft: '8px'
              }}
              title="Logout"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
