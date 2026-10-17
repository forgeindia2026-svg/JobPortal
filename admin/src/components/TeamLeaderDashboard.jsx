import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, Briefcase, Mail, Phone, MapPin, Building2, RefreshCw, FileText,
  CheckCircle2, LayoutDashboard, CalendarDays, Gift, ArrowLeft, ExternalLink, Search
} from 'lucide-react';

export default function TeamLeaderDashboard({ API_URL, currentUser, sidebarOpen, setSidebarOpen }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'team_hrs' | 'applications' | 'interviews' | 'incentives'
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedHrForCandidateBreakdown, setSelectedHrForCandidateBreakdown] = useState(null);
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');

  const fetchTlOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/users/team-leaders/${currentUser.id}/overview`);
      if (res.ok) {
        const data = await res.json();
        setOverviewData(data);
      }
    } catch (err) {
      console.error('Error fetching team leader overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTlOverview();
  }, [currentUser.id]);

  const kpis = overviewData?.kpis || {
    totalHrs: 0,
    totalCandidates: 0,
    totalAmount: 0,
    selectedCount: 0
  };

  const hrs = overviewData?.hrs || [];
  const applications = overviewData?.applications || [];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedHrForCandidateBreakdown(null);
    if (setSidebarOpen) setSidebarOpen(false);
  };

  const handleOpenHrCandidates = (hr, statusFilter = 'all') => {
    let hrApps = validApplications.filter(app => String(app.referredBy || '').toUpperCase() === String(hr.referralCode || '').toUpperCase());
    if (statusFilter === 'Selected') {
      const CLOSED_STATUSES = ['selected', 'joined', 'converted', 'hired'];
      hrApps = hrApps.filter(app => CLOSED_STATUSES.includes(String(app.status || '').toLowerCase()));
    }
    setActiveTab('team_hrs');
    setSelectedHrForCandidateBreakdown({
      ...hr,
      hrName: hr.name || hr.hrName,
      applications: hrApps
    });
    if (setSidebarOpen) setSidebarOpen(false);
  };

  // Exclude Payment Pending from Applied tab (they belong in Incentives & Payouts)
  const validApplications = applications.filter(app => app.status !== 'Payment Pending');

  // Filtered applications
  const filteredApps = validApplications.filter(app => {
    const matchesSearch =
      (app.candidateName || '').toLowerCase().includes(appSearch.toLowerCase()) ||
      (app.candidateEmail || '').toLowerCase().includes(appSearch.toLowerCase()) ||
      (app.jobTitle || '').toLowerCase().includes(appSearch.toLowerCase()) ||
      (app.companyName || '').toLowerCase().includes(appSearch.toLowerCase()) ||
      (app.referringHrName || '').toLowerCase().includes(appSearch.toLowerCase());

    const matchesStatus =
      appStatusFilter === 'all' ||
      String(app.status || '').toLowerCase() === appStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const tlInterviews = applications.filter(app => {
    const s = String(app.status || '').toLowerCase();
    return s.includes('interview') || app.interviewDate;
  });

  const tlClosedApps = applications.filter(app => {
    const s = String(app.status || '').toLowerCase();
    return ['selected', 'joined', 'converted'].includes(s);
  });

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (Matching Image 1 Styling) */}
      <div className={`admin-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div style={{ padding: '0 8px 1rem 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
            TEAM LEADER PANEL
          </div>
          <div style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <UserCheck size={13} /> {currentUser.name}
          </div>
        </div>

        <button
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          <LayoutDashboard size={18} /> Dashboard
        </button>

        <button
          className={`nav-item ${activeTab === 'team_hrs' ? 'active' : ''}`}
          onClick={() => handleTabChange('team_hrs')}
        >
          <Users size={18} /> My Team HRs ({hrs.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => handleTabChange('applications')}
        >
          <FileText size={18} /> Applied ({validApplications.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'interviews' ? 'active' : ''}`}
          onClick={() => handleTabChange('interviews')}
        >
          <CalendarDays size={18} /> Interviews ({tlInterviews.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'incentives' ? 'active' : ''}`}
          onClick={() => handleTabChange('incentives')}
        >
          <Gift size={18} /> Incentives & Payouts
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="admin-main">
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
              <UserCheck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {currentUser.name}
                </h1>
                <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>
                  Team Leader
                </span>
              </div>
              <p style={{ color: '#64748b', margin: '3px 0 0 0', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} color="#059669" /> Branch: <strong>{currentUser.branch || 'Main Branch'}</strong>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span style={{ color: '#059669', fontWeight: 600 }}>Admin Approved</span>
              </p>
            </div>
          </div>

          <button
            onClick={fetchTlOverview}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 15px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#475569', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <RefreshCw size={14} /> Refresh Team
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px auto' }} />
            <div>Loading Team Leader Overview...</div>
          </div>
        ) : activeTab === 'overview' ? (
          /* TAB 1: OVERVIEW SUMMARY */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* KPI Cards Row (2 Grid on Mobile, Auto-fit on Desktop) */}
            <div className="dashboard-kpi-grid">
              <div 
                className="dashboard-kpi-card"
                style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                onClick={() => handleTabChange('team_hrs')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Assigned HRs</span>
                  <div className="dashboard-kpi-icon-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} color="#059669" />
                  </div>
                </div>
                <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{kpis.totalHrs}</div>
                <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Active in your team</span>
              </div>

              <div 
                className="dashboard-kpi-card"
                style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                onClick={() => handleTabChange('applications')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Candidates Recruited</span>
                  <div className="dashboard-kpi-icon-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} color="#3b82f6" />
                  </div>
                </div>
                <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#3b82f6' }}>{validApplications.length}</div>
                <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total candidate applications</span>
              </div>

              <div 
                className="dashboard-kpi-card"
                style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                onClick={() => handleTabChange('incentives')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Expected Incentives</span>
                  <div className="dashboard-kpi-icon-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Gift size={18} color="#10b981" />
                  </div>
                </div>
                <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981' }}>₹{kpis.totalAmount?.toLocaleString('en-IN') || 0}</div>
                <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total upcoming team pool</span>
              </div>

              <div 
                className="dashboard-kpi-card"
                style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                onClick={() => handleTabChange('incentives')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Selected / Placed</span>
                  <div className="dashboard-kpi-icon-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={18} color="#f59e0b" />
                  </div>
                </div>
                <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f59e0b' }}>{kpis.selectedCount || 0}</div>
                <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Successful placements</span>
              </div>
            </div>

            {/* 2 Leadership Boards: Top Applications Received & Top Closers (Team HRs Only) */}
            {(() => {
              const CLOSED_STATUSES = ['selected', 'joined', 'converted', 'hired'];
              const hrStats = hrs.map(hr => {
                const hrCode = hr.referralCode;
                const hrApps = validApplications.filter(app => String(app.referredBy || '').toUpperCase() === String(hrCode || '').toUpperCase());
                const closedApps = hrApps.filter(app => CLOSED_STATUSES.includes(String(app.status || '').toLowerCase()));
                return {
                  ...hr,
                  name: hr.name || hr.hrName,
                  totalSourced: hrApps.length,
                  totalClosed: closedApps.length
                };
              });
              const topSourcers = [...hrStats].sort((a,b) => b.totalSourced - a.totalSourced);
              const topClosers = [...hrStats].sort((a,b) => b.totalClosed - a.totalClosed);

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '0.5rem' }}>
                  {/* Top Applications Received Card */}
                  <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        🚀 Top Applications Received <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>({topSourcers.length} Team HRs)</span>
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>Ranked by total applications sourced from your team</p>
                    </div>
                    {topSourcers.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>No HRs assigned to your team yet.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '6px' }}>
                        {topSourcers.map((hr, idx) => {
                          const isScored = Number(hr.totalSourced || 0) > 0;
                          return (
                            <div
                              key={hr.id || hr.hrId || idx}
                              onClick={() => handleOpenHrCandidates(hr, 'all')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 14px',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                border: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                userSelect: 'none'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#eff6ff';
                                e.currentTarget.style.borderColor = '#bfdbfe';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.08)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#f1f5f9';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                              title={`Click to view all ${hr.totalSourced || 0} candidates of ${hr.name}`}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                  <div style={{
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                    border: isScored ? (idx === 0 ? '2px solid #eab308' : idx === 1 ? '2px solid #94a3b8' : idx === 2 ? '2px solid #f97316' : '2px solid #e2e8f0') : '2px solid #e2e8f0',
                                    background: hr.profilePhoto ? '#f8fafc' : (isScored ? (idx === 0 ? '#fef08a' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#fed7aa' : '#f1f5f9') : '#f1f5f9'),
                                    color: hr.profilePhoto ? '#0f172a' : (isScored ? (idx === 0 ? '#a16207' : idx === 1 ? '#475569' : idx === 2 ? '#9a3412' : '#64748b') : '#64748b'),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '1.1rem'
                                  }}>
                                    {hr.profilePhoto ? (
                                      <img src={hr.profilePhoto} alt={hr.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                      (hr.name || 'H').substring(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  {isScored && idx < 3 && (
                                    <span style={{
                                      position: 'absolute',
                                      bottom: '-4px',
                                      right: '-4px',
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: idx === 0 ? '#eab308' : idx === 1 ? '#94a3b8' : '#f97316',
                                      color: '#fff',
                                      fontSize: '0.68rem',
                                      fontWeight: '800',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      border: '2px solid #fff',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                    }}>
                                      {idx + 1}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>{hr.name}</span>
                                    {isScored && idx === 0 && <span title="Top Sourced">👑</span>}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>
                                      {hr.referralCode}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <span style={{
                                  fontSize: '1.05rem',
                                  fontWeight: 800,
                                  color: isScored ? '#2563eb' : '#94a3b8',
                                  background: isScored ? '#dbeafe' : '#f1f5f9',
                                  padding: '4px 10px',
                                  borderRadius: '8px'
                                }}>
                                  {hr.totalSourced}
                                </span>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>Applied</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Top Closers Card */}
                  <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        🏆 Top Closers <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>({topClosers.length} Team HRs)</span>
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>Ranked by successful selections and closures</p>
                    </div>
                    {topClosers.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>No HRs assigned to your team yet.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '6px' }}>
                        {topClosers.map((hr, idx) => {
                          const isScored = Number(hr.totalClosed || 0) > 0;
                          return (
                            <div
                              key={hr.id || hr.hrId || idx}
                              onClick={() => handleOpenHrCandidates(hr, 'Selected')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 14px',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                border: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                userSelect: 'none'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#ecfdf5';
                                e.currentTarget.style.borderColor = '#a7f3d0';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.08)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#f1f5f9';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                              title={`Click to view all closed/selected candidates of ${hr.name}`}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                  <div style={{
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                    border: isScored ? (idx === 0 ? '2px solid #eab308' : idx === 1 ? '2px solid #94a3b8' : idx === 2 ? '2px solid #f97316' : '2px solid #e2e8f0') : '2px solid #e2e8f0',
                                    background: hr.profilePhoto ? '#f8fafc' : (isScored ? (idx === 0 ? '#fef08a' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#fed7aa' : '#f1f5f9') : '#f1f5f9'),
                                    color: hr.profilePhoto ? '#0f172a' : (isScored ? (idx === 0 ? '#a16207' : idx === 1 ? '#475569' : idx === 2 ? '#9a3412' : '#64748b') : '#64748b'),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '1.1rem'
                                  }}>
                                    {hr.profilePhoto ? (
                                      <img src={hr.profilePhoto} alt={hr.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                      (hr.name || 'H').substring(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  {isScored && idx < 3 && (
                                    <span style={{
                                      position: 'absolute',
                                      bottom: '-4px',
                                      right: '-4px',
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: idx === 0 ? '#eab308' : idx === 1 ? '#94a3b8' : '#f97316',
                                      color: '#fff',
                                      fontSize: '0.68rem',
                                      fontWeight: '800',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      border: '2px solid #fff',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                    }}>
                                      {idx + 1}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>{hr.name}</span>
                                    {isScored && idx === 0 && <span title="Top Closer">⭐</span>}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>
                                      {hr.referralCode}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <span style={{
                                  fontSize: '1.05rem',
                                  fontWeight: 800,
                                  color: isScored ? '#059669' : '#94a3b8',
                                  background: isScored ? '#d1fae5' : '#f1f5f9',
                                  padding: '4px 10px',
                                  borderRadius: '8px'
                                }}>
                                  {hr.totalClosed}
                                </span>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>Closed</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Team HRs Quick List (Direct access to Image 2 model) */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>My Team HR Executives ({hrs.length})</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    HR executives assigned to you with their candidate pipelines and expected payouts.
                  </p>
                </div>
                <button
                  onClick={() => handleTabChange('team_hrs')}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Full HR Breakdown ›
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '12px 16px' }}>HR Name</th>
                      <th style={{ padding: '12px 16px' }}>Referral Code</th>
                      <th style={{ padding: '12px 16px' }}>Upcoming Candidates</th>
                      <th style={{ padding: '12px 16px' }}>Total Upcoming Amount</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hrs.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                          No HR executives assigned under you yet.
                        </td>
                      </tr>
                    ) : (
                      hrs.map((hrItem) => (
                        <tr key={hrItem.hrId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{hrItem.hrName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>HR</div>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                            {hrItem.referralCode}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 600 }}>
                            {hrItem.candidateCount} Candidates
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0d9488', fontSize: '1rem' }}>
                            ₹{hrItem.totalAmount?.toLocaleString('en-IN') || 0}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <button
                              onClick={() => {
                                setActiveTab('team_hrs');
                                setSelectedHrForCandidateBreakdown(hrItem);
                              }}
                              style={{
                                background: '#2563eb',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                              }}
                            >
                              View Candidates
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'team_hrs' ? (
          /* TAB 2: MY TEAM HRS (EXACT MATCH OF USER'S IMAGE 2 AND IMAGE 3) */
          <div>
            {/* VIEW 3: HR CANDIDATE BREAKDOWN (Exact match of User's Image 3) */}
            {selectedHrForCandidateBreakdown ? (() => {
              const hrValidApps = (selectedHrForCandidateBreakdown.applications || []).filter(app => app.status !== 'Payment Pending');
              const hrExpectedTotal = hrValidApps.reduce((sum, a) => sum + (Number(a.incentiveAmount) || 1000), 0);
              return (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                {/* Back button */}
                <div style={{ padding: '1.25rem 1.5rem 0 1.5rem' }}>
                  <button
                    onClick={() => setSelectedHrForCandidateBreakdown(null)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#334155', fontSize: '0.88rem' }}
                  >
                    <ArrowLeft size={16} /> Back to Team HRs
                  </button>
                </div>

                {/* Header Banner */}
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Upcoming Candidates for {selectedHrForCandidateBreakdown.hrName}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                      Referral Code: <strong style={{ color: '#0f172a' }}>{selectedHrForCandidateBreakdown.referralCode}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0d9488' }}>
                      ₹{hrExpectedTotal.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Expected</div>
                  </div>
                </div>

                {/* Candidate Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                        <th style={{ padding: '12px 16px', width: '60px' }}>S.No</th>
                        <th style={{ padding: '12px 16px' }}>Candidate Details</th>
                        <th style={{ padding: '12px 16px' }}>Job Info</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Expected Amount</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Resume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hrValidApps.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                            No candidate applications found for this HR.
                          </td>
                        </tr>
                      ) : (
                        hrValidApps.map((app, idx) => (
                          <tr key={app.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 16px', color: '#64748b', fontWeight: 600 }}>{idx + 1}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.candidateName}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.candidateEmail}</div>
                              {app.candidateMobile && <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{app.candidateMobile}</div>}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{app.jobTitle}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.companyName}</div>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                background: ['selected', 'joined', 'converted'].includes(String(app.status || '').toLowerCase()) ? '#ecfdf5' : '#eff6ff',
                                color: ['selected', 'joined', 'converted'].includes(String(app.status || '').toLowerCase()) ? '#059669' : '#1e40af'
                              }}>
                                {app.status || 'Applied'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#0d9488', fontSize: '1rem' }}>
                              ₹{app.incentiveAmount?.toLocaleString('en-IN') || '1,000'}
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                              {app.resumeUrl ? (
                                <a
                                  href={app.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0284c7', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}
                                >
                                  View <ExternalLink size={12} />
                                </a>
                              ) : (
                                <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>None</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })() : (
              /* VIEW 2: TEAM HRS TABLE (Exact match of User's Image 2) */
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Team Leaders & Approvals: My Team HRs</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    HRs assigned under your leadership. Click <strong>View Candidates</strong> to see the candidate breakdown.
                  </p>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                        <th style={{ padding: '12px 16px' }}>HR Name</th>
                        <th style={{ padding: '12px 16px' }}>Referral Code</th>
                        <th style={{ padding: '12px 16px' }}>Upcoming Candidates</th>
                        <th style={{ padding: '12px 16px' }}>Total Upcoming Amount</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hrs.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                            No HRs assigned under you yet.
                          </td>
                        </tr>
                      ) : (
                        hrs.map((hrItem) => (
                          <tr key={hrItem.hrId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{hrItem.hrName}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>HR</div>
                            </td>
                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                              {hrItem.referralCode}
                            </td>
                            <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 600 }}>
                              {hrItem.candidateCount} Candidates
                            </td>
                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0d9488', fontSize: '1rem' }}>
                              ₹{hrItem.totalAmount?.toLocaleString('en-IN') || 0}
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                              <button
                                onClick={() => setSelectedHrForCandidateBreakdown(hrItem)}
                                style={{
                                  background: '#2563eb',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  fontSize: '0.85rem',
                                  boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                                }}
                              >
                                View Candidates
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'applications' ? (
          /* TAB 3: APPLICATIONS */
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Team Candidate Applications ({validApplications.length})</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  All candidate applications referred through your team's HR executives.
                </p>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px' }}>
                  <Search size={14} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Search candidate, job..."
                    value={appSearch}
                    onChange={e => setAppSearch(e.target.value)}
                    style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem', width: '180px' }}
                  />
                </div>

                <select
                  value={appStatusFilter}
                  onChange={e => setAppStatusFilter(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.85rem', fontWeight: 600, color: '#334155', outline: 'none' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="applied">Applied</option>
                  <option value="under review">Under Review</option>
                  <option value="interview scheduled">Interview Scheduled</option>
                  <option value="selected">Selected / Joined</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '12px 16px' }}>Candidate Name</th>
                    <th style={{ padding: '12px 16px' }}>Contact</th>
                    <th style={{ padding: '12px 16px' }}>Job Role & Company</th>
                    <th style={{ padding: '12px 16px' }}>Referring HR</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Date Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No candidate applications found for your team.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map(app => (
                      <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                          {app.candidateName}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#475569' }}>
                          <div>{app.candidateEmail}</div>
                          {app.candidateMobile && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{app.candidateMobile}</div>}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{app.jobTitle}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{app.companyName}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontWeight: 700, color: '#0284c7' }}>{app.referringHrName}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: ['selected', 'joined'].includes(String(app.status || '').toLowerCase()) ? '#ecfdf5' : '#eff6ff',
                            color: ['selected', 'joined'].includes(String(app.status || '').toLowerCase()) ? '#059669' : '#1e40af'
                          }}>
                            {app.status || 'Applied'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'interviews' ? (
          /* TAB 4: INTERVIEWS */
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Team Candidate Interviews ({tlInterviews.length})</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Interviews scheduled for candidates referred by your HR team.
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '12px 16px' }}>Candidate Details</th>
                    <th style={{ padding: '12px 16px' }}>Job Role & Company</th>
                    <th style={{ padding: '12px 16px' }}>Referring HR</th>
                    <th style={{ padding: '12px 16px' }}>Interview Status</th>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tlInterviews.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No interviews currently scheduled for your team's candidates.
                      </td>
                    </tr>
                  ) : (
                    tlInterviews.map((app, idx) => (
                      <tr key={app.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.candidateName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.candidateEmail}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{app.jobTitle}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.companyName}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontWeight: 700, color: '#0284c7' }}>{app.referringHrName}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                            {app.status || 'Interview Scheduled'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.85rem' }}>
                          {app.interviewDate ? new Date(app.interviewDate).toLocaleDateString() : 'Upcoming'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TAB 5: INCENTIVES & PAYOUTS */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header Stats */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Team Incentives Overview</h3>
                <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                  Commission incentives tracked across your team's HR executives.
                </p>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem 1.5rem', borderRadius: '12px', textAlign: 'right' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a' }}>₹{kpis.totalAmount?.toLocaleString('en-IN') || 0}</div>
                <div style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>Total Expected Team Payout</div>
              </div>
            </div>

            {/* Placed Candidates Table */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Placed Candidates ({tlClosedApps.length})</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  Successfully placed candidates under your HR team.
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '12px 16px' }}>Candidate Details</th>
                      <th style={{ padding: '12px 16px' }}>Job Role & Company</th>
                      <th style={{ padding: '12px 16px' }}>Referring HR</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Incentive Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tlClosedApps.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                          No candidates closed/selected in your team yet.
                        </td>
                      </tr>
                    ) : (
                      tlClosedApps.map((app, idx) => (
                        <tr key={app.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.candidateName}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.candidateEmail}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{app.jobTitle}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.companyName}</div>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0284c7' }}>
                            {app.referringHrName}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                              {app.status || 'Selected'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#16a34a', fontSize: '1rem' }}>
                            ₹{Number(app.incentiveAmount || 1000).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
