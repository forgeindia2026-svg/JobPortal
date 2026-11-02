import React from 'react';
import { Building2, Code, ChevronRight } from 'lucide-react';

export default function CandidateLandingGrid({ onSelectCard, jobsCount, companiesCount }) {
  return (
    <div className="kpi-landing-grid">
      {/* CARD 1: Banking Jobs */}
      <div
        onClick={() => onSelectCard('banking')}
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          borderRadius: '20px',
          padding: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '14px',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), 0 2px 8px rgba(5, 150, 105, 0.25)',
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          minHeight: '220px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
          e.currentTarget.style.boxShadow = '0 20px 48px rgba(16, 185, 129, 0.45), 0 8px 20px rgba(5, 150, 105, 0.35)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.35), 0 2px 8px rgba(5, 150, 105, 0.25)';
        }}
      >
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
          <div style={{
            borderRadius: '50%', width: '56px', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            background: '#ffffff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 -2px 6px rgba(0,0,0,0.08)',
            border: '2.5px solid rgba(255,255,255,0.9)'
          }}>
            <Building2 size={28} color="#047857" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.3)', lineHeight: 1.2 }}>
              Banking Jobs
            </h3>
            <span style={{
              fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px',
              marginTop: '6px',
              background: 'rgba(255,255,255,0.22)',
              color: '#ecfdf5',
              padding: '3px 10px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.35)',
              backdropFilter: 'blur(4px)'
            }}>
              🏦 Direct Bank Openings
            </span>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.92)', lineHeight: '1.55', position: 'relative', zIndex: 1 }}>
          Direct corporate banking & financial services vacancies across Axis Bank, Bandhan Bank, IDFC First, Kotak, and Aditya Birla Capital.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            ⚡ View Banking Openings
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={18} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* CARD 2: FIC Banking Training 100% placement or Refund */}
      <div
        onClick={() => onSelectCard('fic_banking_training')}
        style={{
          background: 'linear-gradient(135deg, #7f1d1d 0%, #e11d48 40%, #f43f5e 80%, #9f1239 100%)',
          borderRadius: '20px',
          padding: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '14px',
          boxShadow: '0 8px 32px rgba(225, 29, 72, 0.45), 0 2px 8px rgba(159, 18, 57, 0.3)',
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          minHeight: '220px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
          e.currentTarget.style.boxShadow = '0 20px 48px rgba(225, 29, 72, 0.55), 0 8px 20px rgba(159, 18, 57, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(225, 29, 72, 0.45), 0 2px 8px rgba(159, 18, 57, 0.3)';
        }}
      >
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
          <div style={{
            borderRadius: '50%', width: '56px', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
            background: '#ffffff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25), inset 0 -2px 6px rgba(0,0,0,0.1)',
            border: '2.5px solid rgba(255,255,255,0.9)'
          }}>
            <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.3)', lineHeight: 1.2 }}>
              FIC Banking Training 100% placement or Refund
            </h3>
            <span style={{
              fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px',
              marginTop: '6px',
              background: 'rgba(255,255,255,0.2)',
              color: '#ffe4e6',
              padding: '3px 10px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              🌟 Exclusive Program Guarantee
            </span>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.92)', lineHeight: '1.55', position: 'relative', zIndex: 1 }}>
          Complete job guarantee upon successful training completion or get 100% of your training fees refunded. Click here to view participating banks and roles.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            View FIC Training Details
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={18} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* CARD 3: FIC IT Training & 100% placement */}
      <div
        onClick={() => onSelectCard('fic_it_placement')}
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 40%, #7c3aed 80%, #6d28d9 100%)',
          borderRadius: '20px',
          padding: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '14px',
          boxShadow: '0 8px 32px rgba(37, 99, 235, 0.45), 0 2px 8px rgba(109, 40, 217, 0.3)',
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          minHeight: '220px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
          e.currentTarget.style.boxShadow = '0 20px 48px rgba(37, 99, 235, 0.55), 0 8px 20px rgba(109, 40, 217, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(37, 99, 235, 0.45), 0 2px 8px rgba(109, 40, 217, 0.3)';
        }}
      >
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
          <div style={{
            borderRadius: '50%', width: '56px', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
            background: '#ffffff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25), inset 0 -2px 6px rgba(0,0,0,0.1)',
            border: '2.5px solid rgba(255,255,255,0.9)'
          }}>
            <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.3)', lineHeight: 1.2 }}>
              FIC IT Training &amp; 100% placement
            </h3>
            <span style={{
              fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px',
              marginTop: '6px',
              background: 'rgba(255,255,255,0.2)',
              color: '#e0f2fe',
              padding: '3px 10px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              💻 Exclusive IT Placement Programs
            </span>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.92)', lineHeight: '1.55', position: 'relative', zIndex: 1 }}>
          Complete IT Job Training with 100% placement guarantee in top IT companies. View multiple training processes, monthly stipend, bond terms, and selection roadmap.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            🎯 Selection &amp; Interview
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={18} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* CARD 4: MNC IT Jobs */}
      <div
        onClick={() => onSelectCard('mnc_it')}
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
          borderRadius: '20px',
          padding: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '14px',
          boxShadow: '0 8px 32px rgba(67, 56, 202, 0.45), 0 2px 8px rgba(30, 27, 75, 0.3)',
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          minHeight: '220px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
          e.currentTarget.style.boxShadow = '0 20px 48px rgba(67, 56, 202, 0.55), 0 8px 20px rgba(30, 27, 75, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(67, 56, 202, 0.45), 0 2px 8px rgba(30, 27, 75, 0.3)';
        }}
      >
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
          <div style={{
            borderRadius: '50%', width: '56px', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            background: '#ffffff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25), inset 0 -2px 6px rgba(0,0,0,0.1)',
            border: '2.5px solid rgba(255,255,255,0.9)'
          }}>
            <Code size={28} color="#4338ca" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.3)', lineHeight: 1.2 }}>
              MNC IT Jobs
            </h3>
            <span style={{
              fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px',
              marginTop: '6px',
              background: 'rgba(255,255,255,0.2)',
              color: '#e0e7ff',
              padding: '3px 10px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              🌐 Direct MNC Software Openings
            </span>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.92)', lineHeight: '1.55', position: 'relative', zIndex: 1 }}>
          Direct MNC hiring drives and software development positions across top Tier-1 and Tier-2 tech enterprises.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            🚀 Explore MNC IT Openings
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={18} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* CARD 5: FIC IT Training Courses */}
      <div
        onClick={() => onSelectCard('fic_it_course')}
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #075985 80%, #082f49 100%)',
          borderRadius: '20px',
          padding: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '14px',
          boxShadow: '0 8px 32px rgba(2, 132, 199, 0.45), 0 2px 8px rgba(3, 105, 161, 0.3)',
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          minHeight: '220px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
          e.currentTarget.style.boxShadow = '0 20px 48px rgba(2, 132, 199, 0.55), 0 8px 20px rgba(3, 105, 161, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(2, 132, 199, 0.45), 0 2px 8px rgba(3, 105, 161, 0.3)';
        }}
      >
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
          <div style={{
            borderRadius: '50%', width: '56px', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
            background: '#ffffff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25), inset 0 -2px 6px rgba(0,0,0,0.1)',
            border: '2.5px solid rgba(255,255,255,0.9)'
          }}>
            <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.3)', lineHeight: 1.2 }}>
              FIC IT Training Courses
            </h3>
            <span style={{
              fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px',
              marginTop: '6px',
              background: 'rgba(255,255,255,0.2)',
              color: '#e0f2fe',
              padding: '3px 10px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              📚 Learn from Industry Experts
            </span>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.92)', lineHeight: '1.55', position: 'relative', zIndex: 1 }}>
          Enroll in our comprehensive IT training courses designed for beginners to advanced professionals. Build real-world projects and accelerate your career.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            📖 View Courses
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={18} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* CARD 6: FIC Free IT Internship */}
      <div
        onClick={() => onSelectCard('fic_it_internship')}
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 40%, #065f46 80%, #022c22 100%)',
          borderRadius: '20px',
          padding: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '14px',
          boxShadow: '0 8px 32px rgba(5, 150, 105, 0.45), 0 2px 8px rgba(4, 120, 87, 0.3)',
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          minHeight: '220px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
          e.currentTarget.style.boxShadow = '0 20px 48px rgba(5, 150, 105, 0.55), 0 8px 20px rgba(4, 120, 87, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(5, 150, 105, 0.45), 0 2px 8px rgba(4, 120, 87, 0.3)';
        }}
      >
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
          <div style={{
            borderRadius: '50%', width: '56px', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
            background: '#ffffff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25), inset 0 -2px 6px rgba(0,0,0,0.1)',
            border: '2.5px solid rgba(255,255,255,0.9)'
          }}>
            <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.3)', lineHeight: 1.2 }}>
              FIC Free IT Internship
            </h3>
            <span style={{
              fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px',
              marginTop: '6px',
              background: 'rgba(255,255,255,0.2)',
              color: '#d1fae5',
              padding: '3px 10px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              💼 Zero Cost • Real Experience
            </span>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.92)', lineHeight: '1.55', position: 'relative', zIndex: 1 }}>
          Join our exclusive 100% Free Internship program. Work on live industry projects alongside experienced developers without paying any fees.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            🚀 View Internship Openings
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={18} color="#ffffff" />
          </div>
        </div>
      </div>
    </div>
  );
}
