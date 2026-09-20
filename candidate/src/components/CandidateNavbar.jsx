import React, { useState, useEffect } from 'react';
import { Briefcase, Palette } from 'lucide-react';

export default function CandidateNavbar() {
  const [theme, setTheme] = useState(localStorage.getItem('portal_theme') || 'sapphire');
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portal_theme', theme);
  }, [theme]);

  const themes = [
    { id: 'sapphire', name: 'Sapphire Blue', color: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
    { id: 'purple', name: 'Cosmic Purple', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
    { id: 'emerald', name: 'Emerald Forest', color: '#059669', gradient: 'linear-gradient(135deg, #059669, #10b981)' },
    { id: 'sunset', name: 'Sunset Ruby', color: '#ea580c', gradient: 'linear-gradient(135deg, #ea580c, #f43f5e)' }
  ];

  return (
    <nav className="top-nav">
      <div className="top-nav-container">
        <a href="#" className="brand">
          <div className="brand-icon">
            <Briefcase size={22} />
          </div>
          <div className="brand-text-wrapper">
            <div className="brand-title">
              <span className="brand-white">Recruit</span>
              <span className="brand-accent">Pro</span>
            </div>
            <span className="brand-badge">Candidate Portal</span>
          </div>
        </a>

        <div className="nav-actions">
          {/* Theme Picker Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="theme-picker-btn"
              onClick={() => setShowThemePicker(!showThemePicker)}
              title="Change Color Theme"
            >
              <Palette size={16} />
              <span className="theme-btn-text">Theme</span>
              <span
                className="theme-dot"
                style={{ background: themes.find(t => t.id === theme)?.color || '#2563eb' }}
              />
            </button>

            {showThemePicker && (
              <div className="theme-picker-menu">
                <div className="theme-menu-title">Select Portal Theme</div>
                {themes.map(t => (
                  <button
                    key={t.id}
                    className={`theme-option ${theme === t.id ? 'active' : ''}`}
                    onClick={() => {
                      setTheme(t.id);
                      setShowThemePicker(false);
                    }}
                  >
                    <span className="theme-preview-swatch" style={{ background: t.gradient }} />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

