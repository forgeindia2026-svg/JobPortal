import React from 'react';
import { X, MapPin, Briefcase, GraduationCap, Clock, CheckCircle2, FileText, Send, Building2, Layers, Award, ChevronRight, ChevronDown, Wallet, User, Banknote, IndianRupee, ArrowLeft } from 'lucide-react';

export default function JobDetailModal({ job, onClose, onApplyClick, isAlreadyApplied, isFullPage = true }) {
  const [currentSubView, setCurrentSubView] = React.useState('main'); // 'main', 'afterSelection', or 'ficTraining'
  const [expandedAfterSelection, setExpandedAfterSelection] = React.useState(false);
  const [expandedFicTraining, setExpandedFicTraining] = React.useState(false);

  const navigateToSubView = (subViewName) => {
    window.history.pushState({ page: 'job_details', subView: subViewName }, '');
    setCurrentSubView(subViewName);
  };

  // Sync mobile back gesture & browser back button step-by-step
  React.useEffect(() => {
    const handlePopState = (e) => {
      const state = e.state;
      if (state && state.subView === 'ficTraining') {
        setCurrentSubView('ficTraining');
      } else if (state && state.subView === 'afterSelection') {
        setCurrentSubView('afterSelection');
      } else {
        setCurrentSubView('main');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Auto scroll to top when sub-view changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const modalContainers = document.querySelectorAll('.full-page-job-container, .modal-content, .modal-overlay');
    modalContainers.forEach(el => {
      if (el) el.scrollTop = 0;
    });
  }, [currentSubView]);

  if (!job) return null;

  const getTrainingPhasesList = () => {
    if (job.trainingPhases && Array.isArray(job.trainingPhases) && job.trainingPhases.length > 0) {
      return job.trainingPhases;
    }
    if (job.trainingPeriod && typeof job.trainingPeriod === 'string') {
      const parts = job.trainingPeriod.split('|');
      const parsed = parts.map(part => {
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

        return { duration, mode: mode || 'Classroom Training', stipend: stipend || job.stipend || 'Stipend Provided' };
      });
      if (parsed.length > 0) return parsed;
    }
    return [
      { duration: job.trainingPeriod || '1-4 months', mode: 'Classroom Training', stipend: job.stipend || 'Stipend Provided' },
      { duration: '3-6 months', mode: 'On the Job Training (OJT)', stipend: 'Performance Stipend & Full Salary' }
    ];
  };

  const formatFicTrainingPeriod = () => {
    if (job.ficTrainingPeriod) return job.ficTrainingPeriod;
    if (job.trainingPhases && job.trainingPhases.length > 0 && job.trainingPhases[0].duration) {
      return job.trainingPhases[0].duration;
    }
    const raw = job.trainingPeriod;
    if (!raw) return '45 Days';

    if (raw.includes('|') || raw.toLowerCase().includes('phase')) {
      const parts = raw.split('|').map(p => p.trim());
      for (const p of parts) {
        const clean = p.replace(/^Phase\s*\d+\s*:\s*/i, '');
        const match = clean.match(/([\d\-\s]+\s*(?:month|mon|m|year|yr|w|week|day|d)s?)/i);
        if (match) return match[1].trim();
      }
    }

    if (raw.length <= 30) {
      return raw;
    }

    return '45 Days';
  };

  const trainingList = getTrainingPhasesList();

  const fallbackMap = {
    'Axis Bank': '/logos/axis_bank.svg',
    'IDFC First Bank': '/logos/idfc_first_bank.svg',
    'Kotak Mahindra Bank': '/logos/kotak_bank.png',
    'Bandhan Bank': '/logos/bandhan_bank.png',
    'Aditya Birla Capital': '/logos/aditya_birla.jpg',
    'Mahindra Finance': '/logos/mahindra_finance.png',
    'Tech Mahindra': '/logos/tech_mahindra.svg'
  };

  const logoSrc = fallbackMap[job.companyName] || (job.companyLogo && job.companyLogo.includes('/logos/') ? `/logos/${job.companyLogo.split('/').pop()}` : job.companyLogo);

  // VIEW 3: FIC TRAINING 100% PLACEMENT OR REFUND DEDICATED PAGE
  if (currentSubView === 'ficTraining') {
    const ficTrainingContent = (
      <div className={isFullPage ? "full-page-job-container animate-fade" : "modal-content"} style={isFullPage ? { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)', maxWidth: '980px', margin: '0 auto' } : { maxWidth: '780px' }}>
        
        {/* HEADER BAR FOR FIC TRAINING PAGE */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(30, 64, 175, 0.25)' }}>
              <Award size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                FIC Training 100% Placement or Refund
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {job.title} • {job.companyName}
              </span>
            </div>
          </div>

          {!isFullPage && (
            <button className="btn-close" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* SUMMARY CARDS: COST & TRAINING PERIOD (DYNAMIC ADMIN VALUES) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1.5px solid #93c5fd',
              borderRadius: '14px',
              padding: '1.1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '0.725rem', color: '#1e40af', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                💳 FIC Training Cost
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>
                {job.interviewCrackFee || job.trainingFee || '30,000'}
              </span>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '1.5px solid #86efac',
              borderRadius: '14px',
              padding: '1.1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '0.725rem', color: '#166534', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                ⏱️ FIC Training Period
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#14532d' }}>
                {formatFicTrainingPeriod()}
              </span>
            </div>
          </div>

          {/* STEP-BY-STEP PROCESS ROADMAP */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="#2563eb" /> Training & Payment Guidelines
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* STEP 1 */}
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  1
                </div>
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    50% Payment Advance
                  </h5>
                  <p style={{ fontSize: '0.875rem', color: '#475569', margin: '4px 0 0 0', fontWeight: 600 }}>
                    50% of payment need to advance
                  </p>
                </div>
              </div>

              {/* STEP 2 */}
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#8b5cf6', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  2
                </div>
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Document Submission
                  </h5>
                  <p style={{ fontSize: '0.875rem', color: '#475569', margin: '4px 0 0 0', fontWeight: 600 }}>
                    Document submission for verification
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f59e0b', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  3
                </div>
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Training Program
                  </h5>
                  <p style={{ fontSize: '0.875rem', color: '#475569', margin: '4px 0 0 0', fontWeight: 600 }}>
                    Training
                  </p>
                </div>
              </div>

              {/* STEP 4 */}
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10b981', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  4
                </div>
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    After Selection Balance Payment
                  </h5>
                  <p style={{ fontSize: '0.875rem', color: '#475569', margin: '4px 0 0 0', fontWeight: 600 }}>
                    After selection 50% want to pay
                  </p>
                </div>
              </div>
            </div>
          </div>



          {/* 100% REFUND TERMS BOX */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
            border: '1.5px solid #86efac',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Award size={24} color="#16a34a" />
            <div>
              <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#14532d', margin: 0 }}>
                100% Placement Guarantee or Full Refund
              </h5>
            </div>
          </div>
        </div>

        {/* FOOTER BAR */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1.5px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            {isAlreadyApplied ? (
              <button className="btn-secondary" disabled style={{ opacity: 0.8, cursor: 'not-allowed', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                ✓ Already Applied
              </button>
            ) : (
              <button className="btn-primary-gradient" style={{
                padding: '12px 32px',
                fontSize: '0.95rem',
                fontWeight: 800,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }} onClick={() => onApplyClick(job)}>
                <Send size={18} color="#ffffff" /> Apply Now
              </button>
            )}
          </div>
        </div>
      </div>
    );

    if (isFullPage) return ficTrainingContent;
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div style={{ maxWidth: '780px', width: '100%' }} onClick={e => e.stopPropagation()}>
          {ficTrainingContent}
        </div>
      </div>
    );
  }

  // VIEW 2: AFTER SELECTION DEDICATED NEXT PAGE
  if (currentSubView === 'afterSelection') {
    const afterSelectionContent = (
      <div className={isFullPage ? "full-page-job-container animate-fade" : "modal-content"} style={isFullPage ? { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)', maxWidth: '980px', margin: '0 auto' } : { maxWidth: '780px' }}>
        
        {/* HEADER BAR FOR AFTER SELECTION SUB-PAGE */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#dcfce7', border: '1px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={20} color="#15803d" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                After Selection Details
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {job.title} • {job.companyName}
              </span>
            </div>
          </div>

          {!isFullPage && (
            <button className="btn-close" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* STEP-BY-STEP TRAINING PHASES */}
          {trainingList.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.25)' }}>
                    <Award size={20} color="#ffffff" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                      After selected the Job Training Program
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

              {/* CONNECTED PHASE FLOW CARDS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: trainingList.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
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

                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                              ⏱️ Training Duration
                            </span>
                            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                              {phase.duration || 'N/A'}
                            </span>
                          </div>

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



          {/* COURSE / TRAINING FEES (IMAGE 2 CARD RESTORED) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={18} color="#2563eb" />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 700, margin: 0 }}>
                  Course / Training Fees
                </h4>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Complete breakdown of course charges and refund eligibility
                </span>
              </div>
            </div>

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
                  🔄 {job.feeRefundType || 'Non-Refundable'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '4px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                    Course / Training Fee Amount
                  </span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: job.trainingFee && job.trainingFee.toLowerCase().includes('free') ? '#16a34a' : '#0f172a' }}>
                    {job.trainingFee || '2,90,000 (Including GST)'}
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
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', color: '#1e40af', fontWeight: 600, lineHeight: 1.5 }}>
                  ℹ️ <strong>Refund & Payment Terms:</strong> {job.feeRefundDetails}
                </div>
              )}
            </div>
          </div>

          {/* FIC TRAINING 100% PLACEMENT OR REFUND BUTTON (PLACED BELOW PLACEMENT & COURSE TRAINING FEES SECTION) */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
            <button
              onClick={() => navigateToSubView('ficTraining')}
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(30, 64, 175, 0.22)',
                border: '1px solid #60a5fa',
                letterSpacing: '0.01em',
                width: '100%',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Award size={18} color="#ffffff" /> FIC Training 100% placement or Refund →
            </button>
          </div>

        </div>

        {/* FOOTER BAR */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1.5px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            {isAlreadyApplied ? (
              <button className="btn-secondary" disabled style={{ opacity: 0.8, cursor: 'not-allowed', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                ✓ Already Applied
              </button>
            ) : (
              <button className="btn-primary-gradient" style={{
                padding: '12px 32px',
                fontSize: '0.95rem',
                fontWeight: 800,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }} onClick={() => onApplyClick(job)}>
                <Send size={18} color="#ffffff" /> Apply Now
              </button>
            )}
          </div>
        </div>
      </div>
    );

    if (isFullPage) return afterSelectionContent;
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div style={{ maxWidth: '780px', width: '100%' }} onClick={e => e.stopPropagation()}>
          {afterSelectionContent}
        </div>
      </div>
    );
  }

  // VIEW 1: MAIN JOB DETAILS PAGE
  const mainContent = (
    <div className={isFullPage ? "full-page-job-container animate-fade" : "modal-content"} style={isFullPage ? { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)', maxWidth: '980px', margin: '0 auto' } : { maxWidth: '780px' }}>
      {/* HEADER BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={job.companyName}
              style={{ width: '56px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1.5px solid #e2e8f0' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px', background: '#e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'
            }}>
              <Building2 size={22} />
            </div>
          )}
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', lineHeight: '1.2', margin: 0 }}>{job.title}</h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {job.companyName} • <span style={{ color: 'var(--primary)' }}>{job.categoryName}</span>
            </span>
          </div>
        </div>

        {!isFullPage && (
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        )}
      </div>

      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* INFOGRAPHIC POSTER GRID (3 COLUMNS x 2 ROWS GUARANTEED ON ALL SCREENS INCLUDING MOBILE) */}
        <div className="infographic-poster-container">
          <div className="infographic-poster-grid">
            {/* ITEM 1: CTC / SALARY */}
            <div className="infographic-poster-item">
              <div>
                <Wallet size={32} color="#334155" strokeWidth={1.75} style={{ marginBottom: '8px' }} />
                <p className="info-value">
                  {job.salary || '3.5 LAKH'}
                </p>
              </div>
              <div className="info-subtext">
                Fixed CTC per Annum<br />Incentives over and above
              </div>
            </div>

            {/* ITEM 2: ROLE / DESIGNATION */}
            <div className="infographic-poster-item">
              <div>
                <User size={32} color="#334155" strokeWidth={1.75} style={{ marginBottom: '8px' }} />
                <h3 className="info-title-sm">
                  {job.title}
                </h3>
              </div>
            </div>

            {/* ITEM 3: LOCATION */}
            <div className="infographic-poster-item">
              <div>
                <MapPin size={32} color="#334155" strokeWidth={1.75} style={{ marginBottom: '8px' }} />
                <p className="info-value" style={{ fontSize: '1.4rem', textTransform: 'uppercase' }}>
                  PAN INDIA
                </p>
              </div>
              <div className="info-subtext">
                Job Location<br />Based on Aadhar card or your nearby
              </div>
            </div>

            {/* ITEM 4: TRAINING DURATION */}
            <div className="infographic-poster-item">
              <div>
                <Clock size={32} color="#334155" strokeWidth={1.75} style={{ marginBottom: '8px' }} />
                <p className="info-value">
                  {trainingList.length > 0 
                    ? trainingList.map(t => t.duration).filter(Boolean).join(' + ') || 'Structured Plan'
                    : (job.trainingPeriod || 'Structured Period')}
                </p>
              </div>
              <div className="info-subtext">
                {job.trainingSubtext ? (
                  job.trainingSubtext.split('|').map((line, idx, arr) => (
                    <React.Fragment key={idx}>
                      {line.trim()}
                      {idx < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))
                ) : (
                  <>Campus Training & Internship OJT</>
                )}
              </div>
            </div>

            {/* ITEM 5: STIPEND / SALARY */}
            <div className="infographic-poster-item">
              <div>
                <Banknote size={32} color="#334155" strokeWidth={1.75} style={{ marginBottom: '8px' }} />
                <p className="info-value" style={{ fontSize: '1.3rem', textTransform: 'uppercase' }}>
                  {job.stipendTitle 
                    ? job.stipendTitle 
                    : (trainingList.length > 0 && trainingList[0].stipend 
                        ? trainingList[0].stipend 
                        : (job.stipend || 'STIPEND PROVIDED'))}
                </p>
              </div>
              <div className="info-subtext">
                {job.stipendSubtext ? (
                  job.stipendSubtext.split('|').map((line, idx, arr) => (
                    <React.Fragment key={idx}>
                      {line.trim()}
                      {idx < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))
                ) : (
                  <>Stipend during training<br />Regular salary post-training</>
                )}
              </div>
            </div>

            {/* ITEM 6: PROGRAM FEES */}
            <div className="infographic-poster-item">
              <div>
                <IndianRupee size={32} color="#334155" strokeWidth={1.75} style={{ marginBottom: '8px' }} />
                <p className="info-value">
                  {job.trainingFee || job.interviewCrackFee || '100% FREE'}
                </p>
              </div>
              <div className="info-subtext">
                Program Fees<br />{job.feeRefundType ? `(${job.feeRefundType})` : '(*Terms & Guidelines apply)'}
              </div>
            </div>
          </div>
        </div>

        {job.responsibilities && job.responsibilities.length > 0 && (
          <div>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '8px' }}>Roles & Responsibilities</h4>
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

        <div>
          <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '8px' }}>Job Overview</h4>
          <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: '1.6' }}>{job.description}</p>
        </div>

        {/* QUICK JOB METADATA BOX */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          background: '#f8fafc',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Job Location</span>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
              <MapPin size={14} color="#3b82f6" /> PAN INDIA (Nearby Branch)
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Salary Range</span>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px', color: '#047857', margin: 0 }}>
              {job.salary}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Experience</span>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
              <Briefcase size={14} color="#6366f1" /> {job.experience}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Qualification</span>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
              <GraduationCap size={14} color="#f59e0b" /> {job.qualification}
            </p>
          </div>

        </div>

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


        {/* SEQUENTIAL INTERVIEW ROUNDS (MODERN TIMELINE ROADMAP MODEL) */}
        {job.interviewSteps && job.interviewSteps.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b21a8', background: '#f3e8ff', border: '1px solid #e9d5ff', padding: '4px 12px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                🪜 INTERVIEW SELECTION
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b21a8', background: '#faf5ff', border: '1px solid #e9d5ff', padding: '4px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                🎯 Total Rounds: <strong>{job.interviewSteps.length}</strong>
              </span>
            </div>

            {/* VERTICAL CONNECTED TIMELINE TRACK */}
            <div className="mobile-timeline-track" style={{
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
                  <div className="timeline-dot" style={{
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

              {/* AFTER SELECTION BUTTON (NAVIGATES TO DEDICATED NEXT PAGE) */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                <div className="timeline-dot" style={{
                  position: 'absolute',
                  left: '-32px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.35)',
                  border: '2px solid #ffffff',
                  zIndex: 2
                }}>
                  <CheckCircle2 size={16} color="#ffffff" />
                </div>
                <button
                  onClick={() => setExpandedAfterSelection(prev => !prev)}
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                    letterSpacing: '0.02em',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  <Award size={18} color="#ffffff" /> After Selection {expandedAfterSelection ? '▲' : '→'}
                </button>
              </div>
            </div>

            {/* EXPANDABLE INLINE AFTER SELECTION SECTION (FLAT CLEAN UI WITHOUT NESTED BOXES) */}
            {expandedAfterSelection && (
              <div 
                className="animate-fade"
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.25rem',
                  borderTop: '2px dashed #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}
              >
                {/* HEADING */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.25)' }}>
                      <Award size={20} color="#ffffff" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                        After selected the Job Training Program
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                        Structured learning period & stipend progression plan
                      </span>
                    </div>
                  </div>
                  {trainingList.length > 0 && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4338ca', background: '#e0e7ff', border: '1px solid #c7d2fe', padding: '4px 12px', borderRadius: '20px' }}>
                      🎓 {trainingList.length} Training {trainingList.length === 1 ? 'Phase' : 'Phases'}
                    </span>
                  )}
                </div>

                {/* TRAINING PHASES CARDS (FLAT INLINE LAYOUT) */}
                {trainingList.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: trainingList.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1rem',
                    alignItems: 'stretch'
                  }}>
                    {trainingList.map((phase, idx) => {
                      return (
                        <div key={idx} style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '12px',
                          padding: '1.1rem 1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.85rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#1e40af', background: '#dbeafe', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '6px' }}>
                              PHASE {idx + 1}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                              Stage {idx + 1} of {trainingList.length}
                            </span>
                          </div>
                          
                          <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            {phase.title || `Phase ${idx + 1} Training`}
                          </h5>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', paddingTop: '4px' }}>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                                ⏱️ Duration
                              </span>
                              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'block', marginTop: '2px' }}>
                                {phase.duration || 'N/A'}
                              </span>
                            </div>

                            {phase.mode && (
                              <div>
                                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                                  🏫 Mode
                                </span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af', display: 'block', marginTop: '2px' }}>
                                  {phase.mode}
                                </span>
                              </div>
                            )}

                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                                💵 Stipend / Salary
                              </span>
                              <span style={{ fontSize: '0.925rem', fontWeight: 800, color: '#047857', display: 'block', marginTop: '2px' }}>
                                {phase.stipend || 'Performance Stipend'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* COURSE / TRAINING FEES CARD */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '1.1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={18} color="#2563eb" />
                      <h4 style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
                        Course / Training Fees
                      </h4>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#15803d',
                      background: '#dcfce7',
                      border: '1px solid #86efac',
                      padding: '3px 10px',
                      borderRadius: '20px'
                    }}>
                      🔄 {job.feeRefundType || '100% Placement Guarantee or Full Refund'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                        Course / Training Fee Amount
                      </span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: job.trainingFee && job.trainingFee.toLowerCase().includes('free') ? '#16a34a' : '#0f172a', display: 'block', marginTop: '2px' }}>
                        {job.trainingFee || '2,90,000 (Including GST)'}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                        Fee Refund Eligibility
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2563eb', display: 'block', marginTop: '2px' }}>
                        {job.feeRefundType || '100% Placement Guarantee or Full Refund'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FIC TRAINING BUTTON TO TOGGLE FIC ROADMAP INLINE */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={() => setExpandedFicTraining(prev => !prev)}
                    style={{
                      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                      color: '#ffffff',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(30, 64, 175, 0.22)',
                      border: 'none',
                      letterSpacing: '0.01em',
                      width: '100%',
                      justifyContent: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Award size={18} color="#ffffff" /> FIC Training 100% placement or Refund {expandedFicTraining ? '▲' : '▼'}
                  </button>
                </div>

                {/* EXPANDABLE INLINE FIC TRAINING ROADMAP */}
                {expandedFicTraining && (
                  <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '1rem' }}>
                        <span style={{ fontSize: '0.725rem', color: '#1e40af', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                          💰 FIC Training Cost
                        </span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1d4ed8', display: 'block', marginTop: '2px' }}>
                          {job.interviewCrackFee || '10,000'}
                        </span>
                      </div>

                      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '1rem' }}>
                        <span style={{ fontSize: '0.725rem', color: '#047857', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                          ⏱️ FIC Training Period
                        </span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857', display: 'block', marginTop: '2px' }}>
                          {job.ficTrainingPeriod || '7 Days'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        🗺️ 4-Step Payment Roadmap
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb' }}>Step 1: 50% Advance Payment</span>
                          <p style={{ fontSize: '0.825rem', color: '#475569', margin: '4px 0 0 0' }}>Starting the process 50% payment advance</p>
                        </div>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb' }}>Step 2: Document Submission</span>
                          <p style={{ fontSize: '0.825rem', color: '#475569', margin: '4px 0 0 0' }}>Document submission for verification</p>
                        </div>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb' }}>Step 3: Training Program</span>
                          <p style={{ fontSize: '0.825rem', color: '#475569', margin: '4px 0 0 0' }}>Training & preparation sessions</p>
                        </div>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb' }}>Step 4: Balance Payment</span>
                          <p style={{ fontSize: '0.825rem', color: '#475569', margin: '4px 0 0 0' }}>After selected 50% payment</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)', border: '1px solid #86efac', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Award size={22} color="#16a34a" />
                      <div>
                        <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#14532d', margin: 0 }}>
                          100% Placement Guarantee or Full Refund
                        </h5>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          )}

        {/* BOTTOM APPLY NOW ACTION BAR */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e2e8f0',
          marginTop: '1rem'
        }}>
          {isAlreadyApplied ? (
            <div style={{
              background: '#dcfce7',
              color: '#15803d',
              border: '1.5px solid #86efac',
              padding: '12px 32px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={20} color="#15803d" /> Applied Successfully
            </div>
          ) : (
            <button
              onClick={() => onApplyClick && onApplyClick(job)}
              className="btn-primary-gradient"
              style={{
                padding: '14px 44px',
                fontSize: '1.05rem',
                fontWeight: 800,
                borderRadius: '12px',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Send size={18} color="#ffffff" /> Apply Now
            </button>
          )}
        </div>

      </div>

    </div>
  );

  if (isFullPage) {
    return mainContent;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div style={{ maxWidth: '780px', width: '100%' }} onClick={e => e.stopPropagation()}>
        {mainContent}
      </div>
    </div>
  );
}
