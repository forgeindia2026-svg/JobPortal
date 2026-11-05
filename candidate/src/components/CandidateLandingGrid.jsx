import React from 'react';
import { Building2, ChevronRight } from 'lucide-react';

export default function CandidateLandingGrid({ onSelectCard, jobsCount, companiesCount }) {
  return (
    <div className="kpi-landing-grid">
      {/* CARD 1: Banking Jobs */}
      <div
        className="kpi-landing-card kpi-card-bw"
        onClick={() => onSelectCard('banking')}
      >
        <div className="kpi-card-header-flex">
          <div className="kpi-card-icon-wrap-bw">
            <Building2 size={24} color="#0f172a" />
          </div>
          <div>
            <h3 className="kpi-card-title-bw">
              Banking Jobs
            </h3>
          </div>
        </div>

        <div className="kpi-card-footer-bar-bw">
          <span className="kpi-card-action-bw">
            ⚡ View Banking Openings
          </span>
          <div className="kpi-card-arrow-bw">
            <ChevronRight size={16} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* CARD 2: FIC IT Training & 100% placement */}
      <div
        className="kpi-landing-card kpi-card-bw"
        onClick={() => onSelectCard('fic_it_placement')}
      >
        <div className="kpi-card-header-flex">
          <div className="kpi-card-icon-wrap-bw">
            <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h3 className="kpi-card-title-bw">
              FIC IT Training & 100% placement
            </h3>
          </div>
        </div>

        <div className="kpi-card-footer-bar-bw">
          <span className="kpi-card-action-bw">
            🎯 Selection & Interview
          </span>
          <div className="kpi-card-arrow-bw">
            <ChevronRight size={16} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* CARD 3: FIC IT Training Courses */}
      <div
        className="kpi-landing-card kpi-card-bw"
        onClick={() => onSelectCard('fic_it_course')}
      >
        <div className="kpi-card-header-flex">
          <div className="kpi-card-icon-wrap-bw">
            <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h3 className="kpi-card-title-bw">
              FIC IT Training Courses
            </h3>
          </div>
        </div>

        <div className="kpi-card-footer-bar-bw">
          <span className="kpi-card-action-bw">
            📖 View Courses
          </span>
          <div className="kpi-card-arrow-bw">
            <ChevronRight size={16} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* CARD 4: FIC Banking Training 100% placement or Refund */}
      <div
        className="kpi-landing-card kpi-card-bw"
        onClick={() => onSelectCard('fic_banking_training')}
      >
        <div className="kpi-card-header-flex">
          <div className="kpi-card-icon-wrap-bw">
            <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h3 className="kpi-card-title-bw">
              FIC Banking Training 100% placement or Refund
            </h3>
          </div>
        </div>

        <div className="kpi-card-footer-bar-bw">
          <span className="kpi-card-action-bw">
            ⚡ View Details
          </span>
          <div className="kpi-card-arrow-bw">
            <ChevronRight size={16} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* CARD 5: FIC Free IT Internship (Normal 2-grid item) */}
      <div
        className="kpi-landing-card kpi-card-bw"
        onClick={() => onSelectCard('fic_it_internship')}
      >
        <div className="kpi-card-header-flex">
          <div className="kpi-card-icon-wrap-bw">
            <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h3 className="kpi-card-title-bw">
              FIC Free IT Internship
            </h3>
          </div>
        </div>

        <div className="kpi-card-footer-bar-bw">
          <span className="kpi-card-action-bw">
            🚀 View Internships
          </span>
          <div className="kpi-card-arrow-bw">
            <ChevronRight size={16} color="#ffffff" />
          </div>
        </div>
      </div>
    </div>
  );
}
