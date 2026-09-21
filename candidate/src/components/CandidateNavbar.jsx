import React from 'react';
import { Briefcase } from 'lucide-react';

export default function CandidateNavbar() {
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
      </div>
    </nav>
  );
}

