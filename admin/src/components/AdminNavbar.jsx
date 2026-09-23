import React from 'react';
import { LogOut } from 'lucide-react';

export default function AdminNavbar({ currentUser, onLogout }) {
  return (
    <nav className="top-nav" style={{ background: '#0f172a' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <a href="#" className="brand" style={{ textDecoration: 'none' }}>
          <img 
            src="/logo.png" 
            alt="Forge India Connect" 
            style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              border: '2px solid #f59e0b',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
            }} 
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '1.1rem', fontWeight: 800 }}>
              <span style={{ color: '#ffffff' }}>FIC</span>
              <span style={{ color: '#f59e0b' }}>RecruitPro</span>
            </div>
            <span style={{ fontSize: '0.725rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Admin Management Portal
            </span>
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
