import React from 'react';

export default function CandidateNavbar() {
  return (
    <nav className="top-nav">
      <div className="top-nav-container">
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
          <div className="brand-text-wrapper">
            <div className="brand-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="brand-white" style={{ fontWeight: 800 }}>FIC</span>
              <span className="brand-accent" style={{ color: '#f59e0b', fontWeight: 800 }}>RecruitPro</span>
            </div>
            <span className="brand-badge">Candidate Portal</span>
          </div>
        </a>
      </div>
    </nav>
  );
}

