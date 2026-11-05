import React from 'react';
import { Building2, Code, ChevronRight } from 'lucide-react';

export default function CandidateLandingGrid({ onSelectCard, jobsCount, companiesCount }) {
  return (
    <div className="kpi-landing-grid">
      {/* CARD 1: Banking Jobs */}
      <div
        className="kpi-landing-card"
        onClick={() => onSelectCard('banking')}
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), 0 2px 8px rgba(5, 150, 105, 0.25)',
        }}
      >
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div className="kpi-card-header-flex">
          <div className="kpi-card-icon-wrap">
            <Building2 size={26} color="#047857" />
          </div>
          <div>
            <h3 className="kpi-card-title-text">
              Banking Jobs
            </h3>
            <span
              className="kpi-card-pill-tag"
              style={{
                background: 'rgba(255,255,255,0.22)',
                color: '#ecfdf5',
                borderColor: 'rgba(255,255,255,0.35)'
              }}
            >
              🏦 Direct Bank Openings
            </span>
          </div>
        </div>

        <p className="kpi-card-desc-text">
          Direct corporate banking & financial services vacancies across Axis Bank, Bandhan Bank, IDFC First, Kotak, and Aditya Birla Capital.
        </p>

        <div className="kpi-card-footer-bar">
          <span className="kpi-card-action-text">
            ⚡ View Banking Openings
          </span>
          <div className="kpi-card-arrow-circle">
            <ChevronRight size={16} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* CARD 2: FIC Banking Training 100% placement or Refund */}
      <div
        className="kpi-landing-card"
        onClick={() => onSelectCard('fic_banking_training')}
        style={{
          background: 'linear-gradient(135deg, #7f1d1d 0%, #e11d48 40%, #f43f5e 80%, #9f1239 100%)',
          boxShadow: '0 8px 32px rgba(225, 29, 72, 0.45), 0 2px 8px rgba(159, 18, 57, 0.3)',
        }}
      >
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div className="kpi-card-header-flex">
          <div className="kpi-card-icon-wrap">
            <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h3 className="kpi-card-title-text">
              FIC Banking Training 100% placement or Refund
            </h3>
            <span
              className="kpi-card-pill-tag"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#ffe4e6',
                borderColor: 'rgba(255,255,255,0.3)'
              }}
            >
              🌟 Exclusive Program Guarantee
            </span>
          </div>
        </div>

        <p className="kpi-card-desc-text">
          Complete job guarantee upon successful training completion or get 100% of your training fees refunded. Click here to view participating banks and roles.
        </p>

        <div className="kpi-card-footer-bar">
          <span className="kpi-card-action-text">
            View FIC Training Details
          </span>
          <div className="kpi-card-arrow-circle">
            <ChevronRight size={16} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* CARD 3: FIC IT Training & 100% placement */}
      <div
        className="kpi-landing-card"
        onClick={() => onSelectCard('fic_it_placement')}
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 40%, #7c3aed 80%, #6d28d9 100%)',
          boxShadow: '0 8px 32px rgba(37, 99, 235, 0.45), 0 2px 8px rgba(109, 40, 217, 0.3)',
        }}
      >
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div className="kpi-card-header-flex">
          <div className="kpi-card-icon-wrap">
            <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h3 className="kpi-card-title-text">
              FIC IT Training & 100% placement
            </h3>
            <span
              className="kpi-card-pill-tag"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#e0f2fe',
                borderColor: 'rgba(255,255,255,0.3)'
              }}
            >
              💻 Exclusive IT Placement Programs
            </span>
          </div>
        </div>

        <p className="kpi-card-desc-text">
          Complete IT Job Training with 100% placement guarantee in top IT companies. View multiple training processes, monthly stipend, bond terms, and selection roadmap.
        </p>

        <div className="kpi-card-footer-bar">
          <span className="kpi-card-action-text">
            🎯 Selection & Interview
          </span>
          <div className="kpi-card-arrow-circle">
            <ChevronRight size={16} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* CARD 4: MNC IT Jobs */}
      <div
        className="kpi-landing-card"
        onClick={() => onSelectCard('mnc_it')}
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
          boxShadow: '0 8px 32px rgba(67, 56, 202, 0.45), 0 2px 8px rgba(30, 27, 75, 0.3)',
        }}
      >
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div className="kpi-card-header-flex">
          <div className="kpi-card-icon-wrap">
            <Code size={26} color="#4338ca" />
          </div>
          <div>
            <h3 className="kpi-card-title-text">
              MNC IT Jobs
            </h3>
            <span
              className="kpi-card-pill-tag"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#e0e7ff',
                borderColor: 'rgba(255,255,255,0.3)'
              }}
            >
              🌐 Direct MNC Software Openings
            </span>
          </div>
        </div>

        <p className="kpi-card-desc-text">
          Direct MNC hiring drives and software development positions across top Tier-1 and Tier-2 tech enterprises.
        </p>

        <div className="kpi-card-footer-bar">
          <span className="kpi-card-action-text">
            🚀 Explore MNC IT Openings
          </span>
          <div className="kpi-card-arrow-circle">
            <ChevronRight size={16} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* CARD 5: FIC IT Training Courses */}
      <div
        className="kpi-landing-card"
        onClick={() => onSelectCard('fic_it_course')}
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #075985 80%, #082f49 100%)',
          boxShadow: '0 8px 32px rgba(2, 132, 199, 0.45), 0 2px 8px rgba(3, 105, 161, 0.3)',
        }}
      >
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div className="kpi-card-header-flex">
          <div className="kpi-card-icon-wrap">
            <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h3 className="kpi-card-title-text">
              FIC IT Training Courses
            </h3>
            <span
              className="kpi-card-pill-tag"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#e0f2fe',
                borderColor: 'rgba(255,255,255,0.3)'
              }}
            >
              📚 Learn from Industry Experts
            </span>
          </div>
        </div>

        <p className="kpi-card-desc-text">
          Enroll in our comprehensive IT training courses designed for beginners to advanced professionals. Build real-world projects and accelerate your career.
        </p>

        <div className="kpi-card-footer-bar">
          <span className="kpi-card-action-text">
            📖 View Courses
          </span>
          <div className="kpi-card-arrow-circle">
            <ChevronRight size={16} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* CARD 6: FIC Free IT Internship */}
      <div
        className="kpi-landing-card"
        onClick={() => onSelectCard('fic_it_internship')}
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 40%, #065f46 80%, #022c22 100%)',
          boxShadow: '0 8px 32px rgba(5, 150, 105, 0.45), 0 2px 8px rgba(4, 120, 87, 0.3)',
        }}
      >
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div className="kpi-card-header-flex">
          <div className="kpi-card-icon-wrap">
            <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h3 className="kpi-card-title-text">
              FIC Free IT Internship
            </h3>
            <span
              className="kpi-card-pill-tag"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#d1fae5',
                borderColor: 'rgba(255,255,255,0.3)'
              }}
            >
              💼 Zero Cost • Real Experience
            </span>
          </div>
        </div>

        <p className="kpi-card-desc-text">
          Join our exclusive 100% Free Internship program. Work on live industry projects alongside experienced developers without paying any fees.
        </p>

        <div className="kpi-card-footer-bar">
          <span className="kpi-card-action-text">
            🚀 View Internship Openings
          </span>
          <div className="kpi-card-arrow-circle">
            <ChevronRight size={16} color="#ffffff" />
          </div>
        </div>
      </div>
    </div>
  );
}
