import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, CheckCircle, RefreshCw } from 'lucide-react';

export default function CandidateDashboard({ candidate, API_URL, onBrowseJobs }) {
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidateData = async () => {
    setLoading(true);
    try {
      const candId = candidate ? (candidate.candidateId || candidate.id) : 'cand_1';
      const [appRes, intRes] = await Promise.all([
        fetch(`${API_URL}/api/applications?candidateId=${candId}`),
        fetch(`${API_URL}/api/interviews?candidateId=${candId}`)
      ]);

      const appsData = await appRes.json();
      const intsData = await intRes.json();

      setApplications(Array.isArray(appsData) ? appsData : []);
      setInterviews(Array.isArray(intsData) ? intsData : []);
    } catch (err) {
      console.error('Error loading candidate dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateData();
  }, [candidate]);

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : '';
    if (s.includes('selected')) return <span className="badge badge-selected">✓ Selected</span>;
    if (s.includes('interview')) return <span className="badge badge-interview-scheduled">● Interview Scheduled</span>;
    if (s.includes('shortlisted')) return <span className="badge badge-shortlisted">★ Shortlisted</span>;
    if (s.includes('rejected')) return <span className="badge badge-rejected">✕ Rejected</span>;
    return <span className="badge badge-applied">● {status}</span>;
  };

  const getProgressPercent = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'applied') return 25;
    if (s === 'under review') return 40;
    if (s === 'shortlisted') return 60;
    if (s === 'interview scheduled') return 80;
    if (s === 'selected') return 100;
    return 30;
  };

  return (
    <div className="section-container animate-fade">
      <div className="dashboard-header-bar">
        <div>
          <h2 className="dashboard-title">My Applications</h2>
          <p className="dashboard-subtitle">
            Track your job application progress and interview updates
          </p>
        </div>
        <button className="btn-secondary refresh-btn-mobile" onClick={fetchCandidateData}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div className="kpi-val">{applications.length}</div>
            <div className="kpi-label">Total Applied</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div className="kpi-val">{interviews.length}</div>
            <div className="kpi-label">Interviews Scheduled</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="kpi-val">
              {applications.filter(a => a.status.toLowerCase() === 'selected').length}
            </div>
            <div className="kpi-label">Selections</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            Submitted Applications ({applications.length})
          </h3>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading applications...</div>
          ) : applications.length === 0 ? (
            <div style={{
              background: '#fff',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '3rem 1.5rem',
              textAlign: 'center'
            }}>
              <Briefcase size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
              <h4 style={{ color: '#0f172a', marginBottom: '4px' }}>No Job Applications Found</h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                You haven't submitted any job applications yet.
              </p>
              <button className="btn-primary" onClick={onBrowseJobs}>
                Browse Open Jobs
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {applications.map(app => (
                <div key={app.id} style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                     <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {(() => {
                        const fallbackMap = {
                          'Axis Bank': '/logos/axis_bank.svg',
                          'IDFC First Bank': '/logos/idfc_first_bank.svg',
                          'Kotak Mahindra Bank': '/logos/kotak_bank.png',
                          'Bandhan Bank': '/logos/bandhan_bank.png',
                          'Aditya Birla Capital': '/logos/aditya_birla.jpg',
                          'Mahindra Finance': '/logos/mahindra_finance.png',
                          'Tech Mahindra': '/logos/tech_mahindra.svg',
                          'HDFC Life': '/logos/Hdfc.jpg'
                        };
                        const logoSrc = fallbackMap[app.companyName] || (app.companyLogo && app.companyLogo.includes('/logos/') ? `/logos/${app.companyLogo.split('/').pop()}` : app.companyLogo);
                        return logoSrc ? (
                          <img src={logoSrc} alt={app.companyName} style={{ width: '52px', height: '42px', borderRadius: '8px', objectFit: 'cover', overflow: 'hidden', border: '1.5px solid #e2e8f0' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Briefcase size={20} color="#64748b" />
                          </div>
                        );
                      })()}
                      <div>
                        <h4 style={{ fontSize: '1.1rem', color: '#0f172a' }}>{app.jobTitle}</h4>
                        <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>
                          {app.companyName} • Applied on {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(app.status)}
                    </div>
                  </div>

                  <div style={{ margin: '1rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>
                      <span>Progress Status</span>
                      <span>{app.status}</span>
                    </div>
                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${getProgressPercent(app.status)}%`,
                        background: 'linear-gradient(90deg, #3b82f6, #10b981)',
                        borderRadius: '99px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>

                  {app.adminNotes && (
                    <div style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: '#b45309',
                      marginTop: '0.75rem'
                    }}>
                      <strong>Recruiter Note:</strong> {app.adminNotes}
                    </div>
                  )}

                  {interviews.filter(i => i.applicationId === app.id).map(int => (
                    <div key={int.id} style={{
                      marginTop: '1rem',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      padding: '1rem',
                      borderRadius: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#1d4ed8', marginBottom: '6px' }}>
                        <Calendar size={18} /> Scheduled Interview: {int.round}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '0.85rem', color: '#1e3a8a' }}>
                        <div><strong>Date:</strong> {int.date} at {int.time}</div>
                        <div><strong>Mode:</strong> {int.mode}</div>
                        <div><strong>Interviewer:</strong> {int.interviewer || 'HR Team'}</div>
                        {int.meetingLink && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <strong>Link:</strong> <a href={int.meetingLink} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{int.meetingLink}</a>
                          </div>
                        )}
                        {int.location && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <strong>Location:</strong> {int.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
