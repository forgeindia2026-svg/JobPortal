import React from 'react';
import { LogOut, Menu, UserCog } from 'lucide-react';

export default function AdminNavbar({ currentUser, onLogout, toggleSidebar, onOpenProfile }) {
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
            <span className="brand-subtitle" style={{ fontSize: '0.725rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Admin Management Portal
            </span>
          </div>
        </a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {currentUser && (
          <div 
            className="user-pill"
            onClick={() => onOpenProfile && onOpenProfile()}
            style={{ 
              cursor: onOpenProfile ? 'pointer' : 'default',
              userSelect: 'none',
              transition: 'all 0.2s ease'
            }}
            title={onOpenProfile ? "Click to view Admin Profile & Settings" : ""}
          >
            <UserCog size={16} style={{ color: '#f59e0b', marginRight: '3px' }} />
            <span className="desktop-text" style={{ fontWeight: 600 }}>{currentUser.name}</span>
            <span className="desktop-text" style={{ fontSize: '0.75rem', color: '#f59e0b', textTransform: 'capitalize' }}>
              ({currentUser.role})
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }}
              className="navbar-logout-btn"
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
              <LogOut size={16} /> <span className="desktop-text">Logout</span>
            </button>
            <button className="mobile-menu-btn" onClick={toggleSidebar} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '4px', display: 'none' }} title="Toggle Menu">
              <Menu size={20} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
