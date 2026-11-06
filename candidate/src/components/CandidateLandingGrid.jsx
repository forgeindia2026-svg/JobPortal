import React from 'react';
import { Building2, ChevronRight } from 'lucide-react';

export default function CandidateLandingGrid({ onSelectCard, jobsCount, companiesCount }) {
  return (
    <div className="kpi-landing-grid">
      {/* 1st: Banking Jobs (Vibrant Emerald Green) */}
      <div
        className="kpi-landing-card"
        onClick={() => onSelectCard('banking')}
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35), 0 2px 6px rgba(5, 150, 105, 0.2)',
        }}
      >
        <div style={{ position: 'absolute', top: '-25px', right: '-25px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="kpi-card-header-flex">
          <div className="kpi-card-icon-wrap">
            <Building2 size={24} color="#059669" />
          </div>
          <div>
            <h3 className="kpi-card-title-text">
              Banking Jobs
            </h3>
          </div>
        </div>

        <div className="kpi-card-footer-bar">
          <span className="kpi-card-action-text">
            ⚡ View Banking Openings
          </span>
          <div className="kpi-card-arrow-circle">
            <ChevronRight size={16} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* 2nd: FIC Banking Training 100% placement or Refund (Ruby Crimson / Rose) */}
      <div
        className="kpi-landing-card"
        onClick={() => onSelectCard('fic_banking_training')}
        style={{
          background: 'linear-gradient(135deg, #9f1239 0%, #be123c 40%, #e11d48 75%, #db2777 100%)',
          boxShadow: '0 8px 24px rgba(225, 29, 72, 0.38), 0 2px 6px rgba(219, 39, 119, 0.25)',
        }}
      >
        <div style={{ position: 'absolute', top: '-25px', right: '-25px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="kpi-card-header-flex">
          <div className="kpi-card-icon-wrap">
            <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h3 className="kpi-card-title-text">
              FIC Banking Training 100% placement or Refund
            </h3>
          </div>
        </div>

        <div className="kpi-card-footer-bar">
          <span className="kpi-card-action-text">
            ⚡ View Details
          </span>
          <div className="kpi-card-arrow-circle">
            <ChevronRight size={16} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* 3rd: FIC Free IT Internship (Vibrant Sunset Amber / Warm Coral Orange) */}
      <div
        className="kpi-landing-card"
        onClick={() => onSelectCard('fic_it_internship')}
        style={{
          background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 45%, #f59e0b 100%)',
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.38), 0 2px 6px rgba(194, 65, 12, 0.25)',
        }}
      >
        <div style={{ position: 'absolute', top: '-25px', right: '-25px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="kpi-card-header-flex">
          <div className="kpi-card-icon-wrap">
            <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h3 className="kpi-card-title-text">
              FIC Free IT Internship
            </h3>
          </div>
        </div>

        <div className="kpi-card-footer-bar">
          <span className="kpi-card-action-text">
            🚀 View Internships
          </span>
          <div className="kpi-card-arrow-circle">
            <ChevronRight size={16} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* 4th: FIC IT Training & 100% placement (Royal Blue / Electric Cobalt) */}
      <div
        className="kpi-landing-card"
        onClick={() => onSelectCard('fic_it_placement')}
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #3b82f6 100%)',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.38), 0 2px 6px rgba(30, 58, 138, 0.25)',
        }}
      >
        <div style={{ position: 'absolute', top: '-25px', right: '-25px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="kpi-card-header-flex">
          <div className="kpi-card-icon-wrap">
            <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h3 className="kpi-card-title-text">
              FIC IT Training & 100% placement
            </h3>
          </div>
        </div>

        <div className="kpi-card-footer-bar">
          <span className="kpi-card-action-text">
            🎯 Selection & Interview
          </span>
          <div className="kpi-card-arrow-circle">
            <ChevronRight size={16} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* 5th: FIC IT Training Courses (Deep Amethyst Purple / Violet) */}
      <div
        className="kpi-landing-card"
        onClick={() => onSelectCard('fic_it_course')}
        style={{
          background: 'linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #9333ea 100%)',
          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.38), 0 2px 6px rgba(88, 28, 135, 0.25)',
        }}
      >
        <div style={{ position: 'absolute', top: '-25px', right: '-25px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="kpi-card-header-flex">
          <div className="kpi-card-icon-wrap">
            <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h3 className="kpi-card-title-text">
              FIC IT Training Courses
            </h3>
          </div>
        </div>

        <div className="kpi-card-footer-bar">
          <span className="kpi-card-action-text">
            📖 View Courses
          </span>
          <div className="kpi-card-arrow-circle">
            <ChevronRight size={16} color="#ffffff" />
          </div>
        </div>
      </div>
    </div>
  );
}
