import React from 'react';
import { X, MapPin, Briefcase, GraduationCap, Clock, CheckCircle2, FileText, Send, Building2, Layers, Award, ChevronRight, ChevronDown } from 'lucide-react';

export default function JobDetailModal({ job, onClose, onApplyClick, isAlreadyApplied }) {
  if (!job) return null;

  const getTrainingPhasesList = () => {
    if (job.trainingPhases && Array.isArray(job.trainingPhases) && job.trainingPhases.length > 0) {
      return job.trainingPhases;
    }
    if (job.trainingPeriod && typeof job.trainingPeriod === 'string') {
      const parts = job.trainingPeriod.split('|');
      return parts.map(part => {
        const text = part.trim();
        let duration = text;
        let mode = '';
        let stipend = '';

        const cleanText = text.replace(/^Phase\s*\d+\s*:\s*/i, '');
        
        const dashSplit = cleanText.split('-');
        if (dashSplit.length > 1) {
          stipend = dashSplit.slice(1).join('-').trim();
          duration = dashSplit[0].trim();
        } else {
          duration = cleanText;
        }

        const parenMatch = duration.match(/\((.*?)\)/);
        if (parenMatch) {
          mode = parenMatch[1];
          duration = duration.replace(/\((.*?)\)/, '').trim();
        }

        return { duration, mode, stipend };
      });
    }
    return [];
  };

  const trainingList = getTrainingPhasesList();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '780px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.companyName}
                style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '48px', height: '48px', borderRadius: '10px', background: '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'
              }}>
                <Building2 size={24} />
              </div>
            )}
            <div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', lineHeight: '1.2' }}>{job.title}</h2>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {job.companyName} • <span style={{ color: 'var(--primary)' }}>{job.categoryName}</span>
              </span>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            background: '#f8fafc',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Interview Location</span>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} color="#3b82f6" /> {job.location}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Salary Range</span>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px', color: '#047857' }}>
                {job.salary}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Experience</span>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Briefcase size={14} color="#6366f1" /> {job.experience}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Qualification</span>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GraduationCap size={14} color="#f59e0b" /> {job.qualification}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Openings</span>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px' }}>
                {job.openings} Positions
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Apply Before</span>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px', color: '#dc2626' }}>
                {job.lastDate}
              </p>
            </div>
          </div>

          {/* BOX BOX MODEL DESIGN FOR TRAINING PERIOD PHASES */}
          {trainingList.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
              border: '1.5px solid #bfdbfe',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px stroke #e2e8f0', paddingBottom: '0.65rem' }}>
                <Award size={20} color="#2563eb" />
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 700, margin: 0 }}>
                    Training Period Structure
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Multi-phase training schedule & stipend breakdown
                  </span>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem'
              }}>
                {trainingList.map((phase, idx) => (
                  <div key={idx} style={{
                    background: '#ffffff',
                    border: '1.5px solid #3b82f6',
                    borderRadius: '12px',
                    padding: '1rem',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '3px 12px 3px 10px',
                      borderBottomLeftRadius: '10px'
                    }}>
                      PHASE {idx + 1}
                    </div>

                    <div style={{ marginTop: '6px' }}>
                      <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                        Duration
                      </span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                        {phase.duration || 'N/A'}
                      </span>
                    </div>

                    {phase.mode && (
                      <div>
                        <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                          Training Mode
                        </span>
                        <span style={{
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          color: '#1d4ed8',
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          display: 'inline-block',
                          marginTop: '2px'
                        }}>
                          {phase.mode}
                        </span>
                      </div>
                    )}

                    {phase.stipend && (
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                        <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                          Stipend / Salary
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#047857' }}>
                          {phase.stipend}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '8px' }}>Job Overview</h4>
            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: '1.6' }}>{job.description}</p>
          </div>

          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '8px' }}>Key Responsibilities</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: '#334155' }}>
                    <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '8px' }}>Requirements & Eligibility</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {job.requirements.map((req, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: '#334155' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', marginTop: '8px', flexShrink: 0 }} />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {job.skills.map((skill, idx) => (
                  <span key={idx} style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '4px 12px',
                    borderRadius: '99px',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    border: '1px solid #bfdbfe'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.interviewSteps && job.interviewSteps.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} color="#2563eb" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
                    Recruitment & Selection Process
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Step-by-step interview rounds & selection pipeline
                  </span>
                </div>
              </div>

              <div className="interview-stepper-vertical">
                {job.interviewSteps.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <div className="stepper-step-card-vertical">
                      <div className="stepper-badge-row">
                        <span className="stepper-num-badge">{step.stepNumber || idx + 1}</span>
                        <span className="stepper-round-label">ROUND {idx + 1}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h5 className="stepper-step-title">{step.title}</h5>
                        {step.description && (
                          <p className="stepper-step-desc">{step.description}</p>
                        )}
                      </div>
                    </div>

                    {idx < job.interviewSteps.length - 1 && (
                      <div className="stepper-vertical-connector">
                        <ChevronDown size={22} color="#3b82f6" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {job.documentsRequired && job.documentsRequired.length > 0 && (
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={18} color="#6366f1" /> Original Document Required For Interview
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {job.documentsRequired.map((doc, idx) => (
                  <div key={idx} style={{
                    background: '#fff',
                    border: '1px solid var(--border-color)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FileText size={14} color="#94a3b8" /> {doc}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-header" style={{ top: 'auto', bottom: 0, borderTop: '1px solid var(--border-color)', borderBottom: 'none' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Job Reference ID: <strong>{job.id}</strong>
          </span>
          {isAlreadyApplied ? (
            <button className="btn-secondary" disabled style={{ opacity: 0.8, cursor: 'not-allowed', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
              ✓ Already Applied
            </button>
          ) : (
            <button className="btn-primary" style={{ padding: '10px 28px' }} onClick={() => onApplyClick(job)}>
              <Send size={16} /> Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
