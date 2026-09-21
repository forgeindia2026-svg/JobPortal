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
          </div>          <div>
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
          )}          {/* STEP-BY-STEP TRAINING PHASES (STYLISH CONNECTED STEP FLOW MODEL) */}
          {trainingList.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #f0f7ff 0%, #faf5ff 100%)',
              border: '1.5px solid #c7d2fe',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #e0e7ff', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.25)' }}>
                    <Award size={20} color="#ffffff" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                      Training Program & Milestone Phases
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                      Structured learning period & stipend progression plan
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4338ca', background: '#e0e7ff', border: '1px solid #c7d2fe', padding: '4px 12px', borderRadius: '20px' }}>
                  🎓 {trainingList.length} Training {trainingList.length === 1 ? 'Phase' : 'Phases'}
                </span>
              </div>

              {/* CONNECTED TIMELINE / PHASE FLOW CARDS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: trainingList.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.25rem',
                alignItems: 'stretch'
              }}>
                {trainingList.map((phase, idx) => {
                  const themeColors = [
                    { border: '#818cf8', bgTop: 'linear-gradient(135deg, #4f46e5, #6366f1)', tagBg: '#e0e7ff', tagColor: '#3730a3', icon: '🎯' },
                    { border: '#34d399', bgTop: 'linear-gradient(135deg, #059669, #10b981)', tagBg: '#d1fae5', tagColor: '#065f46', icon: '🚀' },
                    { border: '#f59e0b', bgTop: 'linear-gradient(135deg, #d97706, #f59e0b)', tagBg: '#fef3c7', tagColor: '#92400e', icon: '⚡' }
                  ];
                  const theme = themeColors[idx % themeColors.length];

                  return (
                    <div key={idx} style={{
                      background: '#ffffff',
                      border: `1.5px solid ${theme.border}`,
                      borderRadius: '14px',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}>
                      {/* CARD TOP HEADER STRIP */}
                      <div style={{
                        background: theme.bgTop,
                        color: '#ffffff',
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between'
                      }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{theme.icon}</span> PHASE {idx + 1}
                        </span>
                        <span style={{ fontSize: '0.725rem', opacity: 0.95, fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>
                          Stage {idx + 1} of {trainingList.length}
                        </span>
                      </div>

                      {/* CARD BODY CONTENT */}
                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {/* DURATION */}
                          <div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                              ⏱️ Training Duration
                            </span>
                            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                              {phase.duration || 'N/A'}
                            </span>
                          </div>

                          {/* TRAINING MODE */}
                          {phase.mode && (
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                                🏫 Mode of Training
                              </span>
                              <span style={{
                                fontSize: '0.825rem',
                                fontWeight: 700,
                                color: theme.tagColor,
                                background: theme.tagBg,
                                border: `1px solid ${theme.border}`,
                                padding: '4px 12px',
                                borderRadius: '8px',
                                display: 'inline-block'
                              }}>
                                {phase.mode}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* STIPEND / SALARY HIGHLIGHT FOOTER */}
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          marginTop: '4px'
                        }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'block' }}>
                            💵 Stipend / Salary
                          </span>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#047857', display: 'block', marginTop: '2px' }}>
                            {phase.stipend || 'Performance Stipend'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1.5px solid #cbd5e1',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} color="#2563eb" />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
                  Placement Training Fees & Interview Guidelines
                </h4>
                <span style={{ fontSize: '0.775rem', color: '#64748b' }}>
                  Placement training fees, interview rounds & qualification guidelines
                </span>
              </div>
            </div>

            {/* CARD 1: PLACEMENT TRAINING FEE BOX (COMPACT & FRESH BLUE PALETTE) */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #60a5fa',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              boxShadow: '0 3px 10px rgba(37, 99, 235, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1e40af', background: '#dbeafe', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                  🏆 PLACEMENT TRAINING FEE DETAILS
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: job.interviewFeeStage && job.interviewFeeStage.includes('Free') ? '#15803d' : '#0369a1',
                  background: job.interviewFeeStage && job.interviewFeeStage.includes('Free') ? '#dcfce7' : '#e0f2fe',
                  border: `1px solid ${job.interviewFeeStage && job.interviewFeeStage.includes('Free') ? '#86efac' : '#bae6fd'}`,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  whiteSpace: 'nowrap'
                }}>
                  ⏳ {job.interviewFeeStage || 'After Clearing Interview'}
                </span>
              </div>

              {/* COMPACT REDUCED KPI CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', marginTop: '2px' }}>
                <div style={{ background: '#f8fafc', padding: '7px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block', letterSpacing: '0.04em' }}>
                    Placement Training Fee
                  </span>
                  <span style={{ fontSize: '0.925rem', fontWeight: 800, color: job.interviewCrackFee && job.interviewCrackFee.toLowerCase().includes('free') ? '#16a34a' : '#1d4ed8' }}>
                    {job.interviewCrackFee || '100% Free Selection'}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '7px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block', letterSpacing: '0.04em' }}>
                    Fee Payment Stage
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>
                    {job.interviewFeeStage || 'After Passing Final Interview'}
                  </span>
                </div>
              </div>

              {job.interviewFeeDetails && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '6px 10px', fontSize: '0.775rem', color: '#1e40af', fontWeight: 600 }}>
                  ℹ️ <strong>Selection Terms:</strong> {job.interviewFeeDetails}
                </div>
              )}
            </div>

            {/* CARD 2: SEQUENTIAL INTERVIEW ROUNDS (MODERN TIMELINE ROADMAP MODEL) */}
            {job.interviewSteps && job.interviewSteps.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b21a8', background: '#f3e8ff', border: '1px solid #e9d5ff', padding: '4px 12px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                    🪜 SEQUENTIAL INTERVIEW ROUNDS
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b21a8', background: '#faf5ff', border: '1px solid #e9d5ff', padding: '4px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                    🎯 Total Rounds: <strong>{job.interviewSteps.length}</strong>
                  </span>
                </div>

                {/* VERTICAL CONNECTED TIMELINE TRACK */}
                <div style={{
                  position: 'relative',
                  paddingLeft: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  marginTop: '6px'
                }}>
                  {/* CONTINUOUS VERTICAL TIMELINE LINE */}
                  <div style={{
                    position: 'absolute',
                    top: '18px',
                    bottom: '18px',
                    left: '13px',
                    width: '3px',
                    background: 'linear-gradient(to bottom, #9333ea, #3b82f6, #10b981)',
                    borderRadius: '4px'
                  }} />

                  {job.interviewSteps.map((step, idx) => (
                    <div key={idx} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start' }}>
                      {/* TIMELINE NODE DOT */}
                      <div style={{
                        position: 'absolute',
                        left: '-32px',
                        top: '12px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7e22ce, #3b82f6)',
                        color: '#ffffff',
                        fontSize: '0.775rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(126, 34, 206, 0.3)',
                        border: '2px solid #ffffff',
                        zIndex: 2
                      }}>
                        {step.stepNumber || idx + 1}
                      </div>

                      {/* ROUND CONTENT CARD */}
                      <div style={{
                        flex: 1,
                        background: '#ffffff',
                        border: '1.5px solid #e9d5ff',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                        boxShadow: '0 4px 14px rgba(147, 51, 234, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{
                            fontSize: '0.725rem',
                            fontWeight: 800,
                            color: '#6b21a8',
                            background: '#faf5ff',
                            border: '1px solid #e9d5ff',
                            padding: '2px 10px',
                            borderRadius: '6px',
                            letterSpacing: '0.05em'
                          }}>
                            ROUND {idx + 1}
                          </span>
                          <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>
                            Stage {idx + 1} of {job.interviewSteps.length}
                          </span>
                        </div>

                        <div>
                          <h5 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
                            {step.title}
                          </h5>
                          {step.description && (
                            <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0, marginTop: '4px', lineHeight: 1.45 }}>
                              {step.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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

          {/* COURSE / TRAINING FEES (ONLY FEE AMOUNT & REFUND AT THE VERY BOTTOM) */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
            border: '1.5px solid #bfdbfe',
            borderRadius: '14px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.65rem' }}>
              <Award size={20} color="#2563eb" />
              <div>
                <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 700, margin: 0 }}>
                  Course / Training Fees
                </h4>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Complete breakdown of course charges and refund eligibility
                </span>
              </div>
            </div>

            {/* CARD: COURSE / TRAINING FEE DETAILS */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #93c5fd',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', background: '#dbeafe', padding: '3px 10px', borderRadius: '6px' }}>
                    💳 COURSE / TRAINING FEE DETAILS
                  </span>
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: job.feeRefundType && job.feeRefundType.includes('100%') ? '#15803d' : '#1d4ed8',
                  background: job.feeRefundType && job.feeRefundType.includes('100%') ? '#dcfce7' : '#eff6ff',
                  border: `1px solid ${job.feeRefundType && job.feeRefundType.includes('100%') ? '#86efac' : '#bfdbfe'}`,
                  padding: '4px 12px',
                  borderRadius: '20px'
                }}>
                  🔄 {job.feeRefundType || '100% Refundable'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '4px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                    Course / Training Fee Amount
                  </span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: job.trainingFee && job.trainingFee.toLowerCase().includes('free') ? '#16a34a' : '#0f172a' }}>
                    {job.trainingFee || 'No Upfront Fee / Free'}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                    Fee Refund Eligibility
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2563eb' }}>
                    {job.feeRefundType || 'Subject to probation policy'}
                  </span>
                </div>
              </div>

              {job.feeRefundDetails && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '8px 12px', fontSize: '0.825rem', color: '#1e40af', fontWeight: 600 }}>
                  ℹ️ <strong>Terms:</strong> {job.feeRefundDetails}
                </div>
              )}
            </div>
          </div>
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
