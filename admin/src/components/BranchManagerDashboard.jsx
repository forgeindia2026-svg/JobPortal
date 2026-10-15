import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Clock, CheckCircle2, ShieldCheck, Mail, Phone, MapPin, Building2,
  RefreshCw, FileText, CheckCircle, Briefcase, Filter, Search, Award, TrendingUp, ChevronRight,
  LayoutDashboard, CalendarDays, Gift, ArrowLeft, ExternalLink, X
} from 'lucide-react';

export default function BranchManagerDashboard({ API_URL, currentUser, sidebarOpen, setSidebarOpen, onBack }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'team_leaders' | 'branch_hrs' | 'applications' | 'interviews' | 'incentives'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // TL Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '', branch: currentUser.branch || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Application search and filter
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');

  // Drilldown states for Team Leader (matching Image 2 & Image 3)
  const [selectedTlId, setSelectedTlId] = useState(null);
  const [tlOverviewData, setTlOverviewData] = useState(null);
  const [tlOverviewLoading, setTlOverviewLoading] = useState(false);
  const [selectedHrForCandidateBreakdown, setSelectedHrForCandidateBreakdown] = useState(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/users/branch-managers/${currentUser.id}/overview`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching branch overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [currentUser.id]);

  const fetchTlOverview = async (tlId) => {
    try {
      setTlOverviewLoading(true);
      const res = await fetch(`${API_URL}/api/users/team-leaders/${tlId}/overview`);
      if (res.ok) {
        const json = await res.json();
        setTlOverviewData(json);
      }
    } catch (err) {
      console.error('Error fetching TL overview:', err);
    } finally {
      setTlOverviewLoading(false);
    }
  };

  const handleOpenTlDetails = (tlId) => {
    setSelectedTlId(tlId);
    setSelectedHrForCandidateBreakdown(null);
    fetchTlOverview(tlId);
  };

  const handleCreateTl = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_URL}/api/users/team-leaders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          branchManagerId: currentUser.id,
          branch: currentUser.branch || form.branch
        })
      });
      const resData = await res.json();
      if (res.ok) {
        setSuccessMsg('Team Leader added successfully! Awaiting Super Admin approval.');
        setForm({ name: '', email: '', password: '', mobile: '', branch: currentUser.branch || '' });
        setModalOpen(false);
        fetchOverview();
      } else {
        setError(resData.error || 'Failed to create Team Leader');
      }
    } catch (err) {
      setError('Network error creating Team Leader');
    } finally {
      setSaving(false);
    }
  };

  const kpis = data?.kpis || {
    totalTls: 0,
    approvedTls: 0,
    pendingTls: 0,
    totalHrs: 0,
    totalApplications: 0,
    selectedCandidates: 0,
    interviewCandidates: 0
  };

  const tls = data?.teamLeaders || [];
  const hrs = data?.hrs || [];
  const applications = data?.applications || [];

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

  const branchInterviews = applications.filter(app => {
    const s = String(app.status || '').toLowerCase();
    return s.includes('interview') || app.interviewDate;
  });

  const branchClosedApps = applications.filter(app => {
    const s = String(app.status || '').toLowerCase();
    return ['selected', 'joined', 'converted'].includes(s);
  });

  const totalBranchIncentives = branchClosedApps.reduce((acc, app) => acc + (Number(app.incentiveAmount) || 1000), 0);

  const branchCandidatesCount = new Set(validApplications.map(a => a.candidateId || a.candidateEmail)).size || validApplications.length;
  const branchProcessingCount = validApplications.filter(a => {
    const s = String(a.status || '').toLowerCase();
    return !['selected', 'converted', 'rejected', 'not interested', 'interview scheduled'].includes(s) && !s.includes('interview');
  }).length;
  const branchRejectedCount = validApplications.filter(a => {
    const s = String(a.status || '').toLowerCase();
    return s.includes('reject') || s.includes('not interest');
  }).length;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedTlId(null);
    setSelectedHrForCandidateBreakdown(null);
    if (setSidebarOpen) setSidebarOpen(false);
  };

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
            BRANCH CONTROL PANEL
          </div>
          <div style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} /> {currentUser.branch || 'Branch'} Manager
          </div>
        </div>

        <button
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          <LayoutDashboard size={18} /> Dashboard
        </button>

        <button
          className={`nav-item ${activeTab === 'team_leaders' ? 'active' : ''}`}
          onClick={() => handleTabChange('team_leaders')}
        >
          <Users size={18} /> Team Leaders ({tls.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'branch_hrs' ? 'active' : ''}`}
          onClick={() => handleTabChange('branch_hrs')}
        >
          <ShieldCheck size={18} /> Branch HRs ({hrs.length})
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
          <CalendarDays size={18} /> Interviews ({branchInterviews.length})
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
        {/* Admin Navigation Banner (Shown when Admin views this BM) */}
        {onBack && (
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px 18px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={onBack}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 2px 6px rgba(37,99,235,0.25)' }}
              >
                <ArrowLeft size={16} /> Back to Branch Managers List
              </button>
              <span style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: 700 }}>
                🏢 Admin View: <span style={{ color: '#0f172a' }}>{currentUser.name} ({currentUser.branch || 'Branch'} Branch)</span>
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
              Admin Drilldown Mode
            </span>
          </div>
        )}

        {/* Top Branch Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}>
              <Building2 size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {currentUser.name}
                </h1>
                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>
                  Branch Manager
                </span>
              </div>
              <p style={{ color: '#64748b', margin: '3px 0 0 0', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#0284c7" /> Managing Branch: <strong style={{ color: '#0f172a' }}>{currentUser.branch || 'Main Branch'}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={fetchOverview}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 15px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#475569', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={() => { setModalOpen(true); setError(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#fff', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
            >
              <UserPlus size={16} /> Add Team Leader
            </button>
          </div>
        </div>

        {successMsg && (
          <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#059669" /> {successMsg}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px auto' }} />
            <div>Loading Branch Operations...</div>
          </div>
        ) : activeTab === 'overview' ? (
          /* TAB 1: OVERVIEW SUMMARY */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* KPI Cards Row (Exact Match of User's Image 2 with 8 Rich KPI Cards) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
              {/* 1. Applications Received (First) */}
              <div 
                style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => handleTabChange('applications')}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#78350f', textTransform: 'uppercase' }}>Applications Received</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} color="#d97706" />
                  </div>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#78350f' }}>{validApplications.length}</div>
                <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>Branch Pipeline</span>
              </div>

              {/* 2. Total Candidates */}
              <div 
                style={{ background: '#f0fdfa', border: '1px solid #5eead4', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => handleTabChange('applications')}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#134e4a', textTransform: 'uppercase' }}>Total Candidates</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} color="#0d9488" />
                  </div>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#134e4a' }}>{branchCandidatesCount}</div>
                <span style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 600 }}>In Branch Talent Pool</span>
              </div>

              {/* 3. Processing */}
              <div 
                style={{ background: '#e0e7ff', border: '1px solid #a5b4fc', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => { handleTabChange('applications'); setAppStatusFilter('Processing'); }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#312e81', textTransform: 'uppercase' }}>Processing</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RefreshCw size={18} color="#4f46e5" />
                  </div>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#312e81' }}>{branchProcessingCount}</div>
                <span style={{ fontSize: '0.75rem', color: '#4338ca', fontWeight: 600 }}>Active in Pipeline</span>
              </div>

              {/* 4. Interviews Scheduled */}
              <div 
                style={{ background: '#fdf4ff', border: '1px solid #f0abfc', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => handleTabChange('interviews')}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#701a75', textTransform: 'uppercase' }}>Interviews Scheduled</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fae8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CalendarDays size={18} color="#c026d3" />
                  </div>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#701a75' }}>{branchInterviews.length}</div>
                <span style={{ fontSize: '0.75rem', color: '#a21caf', fontWeight: 600 }}>Interviews Lineup</span>
              </div>

              {/* 5. Selected / Placed */}
              <div 
                style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => { handleTabChange('applications'); setAppStatusFilter('Selected'); }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#064e3b', textTransform: 'uppercase' }}>Selected</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={18} color="#059669" />
                  </div>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#064e3b' }}>{branchClosedApps.length}</div>
                <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Successful Placements</span>
              </div>

              {/* 6. Rejected */}
              <div 
                style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => { handleTabChange('applications'); setAppStatusFilter('Rejected'); }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Rejected</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={18} color="#dc2626" />
                  </div>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#991b1b' }}>{branchRejectedCount}</div>
                <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 600 }}>Archived / Rejected</span>
              </div>

              {/* 7. Team Leaders */}
              <div 
                style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => handleTabChange('team_leaders')}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>Team Leaders</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} color="#0284c7" />
                  </div>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0369a1' }}>{kpis.totalTls}</div>
                <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                  {kpis.approvedTls} Approved • {kpis.totalHrs} HRs
                </div>
              </div>

              {/* 8. HR Upcoming Incentives */}
              <div 
                style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => handleTabChange('incentives')}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#78350f', textTransform: 'uppercase' }}>Upcoming Pool</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Gift size={18} color="#b45309" />
                  </div>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#78350f' }}>₹{totalBranchIncentives.toLocaleString('en-IN')}</div>
                <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>Branch Expected</span>
              </div>
            </div>

            {/* Branch Health Banner */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', padding: '2rem', color: '#fff', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <span style={{ background: '#0284c7', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    Branch Operational Status
                  </span>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '12px 0 6px 0' }}>
                    {currentUser.branch || 'Bangalore'} Branch Operations
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, maxWidth: '600px' }}>
                    Overseeing {kpis.totalTls} Team Leaders, {kpis.totalHrs} HR Executives, and {kpis.totalApplications} Candidate Pipelines.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem 1.5rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>{kpis.totalApplications}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Applied</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem 1.5rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4ade80' }}>{kpis.selectedCandidates}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Selected / Joined</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action & Hierarchy Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Team Leaders Preview */}
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Team Leaders ({tls.length})</h3>
                  <button
                    onClick={() => handleTabChange('team_leaders')}
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    View All ›
                  </button>
                </div>

                {tls.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                    No Team Leaders added yet. Click "+ Add Team Leader" to begin building your team.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {tls.slice(0, 3).map(tl => (
                      <div 
                        key={tl.id} 
                        onClick={() => { handleTabChange('team_leaders'); handleOpenTlDetails(tl.id); }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', cursor: 'pointer' }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{tl.name} ➔</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{tl.assignedHrsCount || 0} HRs assigned</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: tl.approvalStatus === 'approved' ? '#ecfdf5' : '#fffbeb', color: tl.approvalStatus === 'approved' ? '#059669' : '#d97706' }}>
                          {tl.approvalStatus === 'approved' ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Candidates Preview */}
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Branch Candidates ({validApplications.length})</h3>
                  <button
                    onClick={() => handleTabChange('applications')}
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    View All ›
                  </button>
                </div>

                {applications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                    No applications received under your branch HRs yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {applications.slice(0, 3).map(app => (
                      <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{app.candidateName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.jobTitle} • Ref by {app.referringHrName}</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: '#e0f2fe', color: '#0369a1' }}>
                          {app.status || 'Applied'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'team_leaders' ? (
          /* TAB 2: TEAM LEADERS (WITH DRILLDOWN MATCHING IMAGE 2 & 3) */
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
          })() : selectedTlId ? (
              /* VIEW 2: TL HR BREAKDOWN (Exact match of User's Image 2) */
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                {/* Back button */}
                <div style={{ padding: '1.25rem 1.5rem 0 1.5rem' }}>
                  <button
                    onClick={() => { setSelectedTlId(null); setTlOverviewData(null); }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#334155', fontSize: '0.88rem' }}
                  >
                    <ArrowLeft size={16} /> Back to Team Leaders
                  </button>
                </div>

                {tlOverviewLoading ? (
                  <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={26} className="spin" style={{ margin: '0 auto 10px auto' }} />
                    <div>Loading Team Leader Overview...</div>
                  </div>
                ) : tlOverviewData ? (
                  <div>
                    {/* TL Info & KPIs Card */}
                    <div style={{ margin: '1.25rem 1.5rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '14px', padding: '1.5rem', color: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{tlOverviewData.teamLeader?.name}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '2px' }}>
                            {tlOverviewData.teamLeader?.email} • {tlOverviewData.teamLeader?.mobile} • Branch: {tlOverviewData.teamLeader?.branch}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{tlOverviewData.kpis?.totalHrs || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Branch HRs</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{tlOverviewData.kpis?.totalCandidates || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Candidates</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>₹{tlOverviewData.kpis?.totalAmount?.toLocaleString('en-IN') || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Expected</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Table matching Image 2 */}
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
                          {(tlOverviewData.hrs || []).length === 0 ? (
                            <tr>
                              <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                No HRs assigned under this Team Leader yet.
                              </td>
                            </tr>
                          ) : (
                            tlOverviewData.hrs.map((hrItem) => (
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
                ) : null}
              </div>
            ) : (
              /* VIEW 1: MAIN TEAM LEADERS TABLE */
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Team Leaders ({tls.length})</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                      Click on any Team Leader to see their assigned HRs and candidate breakdown.
                    </p>
                  </div>
                  <button
                    onClick={() => { setModalOpen(true); setError(''); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
                  >
                    <UserPlus size={16} /> Add Team Leader
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                        <th style={{ padding: '12px 16px' }}>Team Leader</th>
                        <th style={{ padding: '12px 16px' }}>Contact Info</th>
                        <th style={{ padding: '12px 16px' }}>Branch</th>
                        <th style={{ padding: '12px 16px' }}>Approval Status</th>
                        <th style={{ padding: '12px 16px' }}>Assigned HRs</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tls.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                            No Team Leaders added yet. Click <strong>+ Add Team Leader</strong> to create your first TL!
                          </td>
                        </tr>
                      ) : (
                        tls.map((tl) => (
                          <tr key={tl.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                              <div 
                                onClick={() => handleOpenTlDetails(tl.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#0284c7' }}
                              >
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                                  {(tl.name || 'T')[0].toUpperCase()}
                                </div>
                                <span>{tl.name} ➔</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px', color: '#475569' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={13} color="#94a3b8" /> {tl.email}</div>
                              {tl.mobile && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', fontSize: '0.8rem', color: '#64748b' }}><Phone size={12} color="#94a3b8" /> {tl.mobile}</div>}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                                {tl.branch || currentUser.branch}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              {tl.approvalStatus === 'approved' ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                                  <CheckCircle2 size={13} /> Approved
                                </span>
                              ) : tl.approvalStatus === 'rejected' ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #fecaca' }}>
                                  Rejected
                                </span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fffbeb', color: '#d97706', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #fde68a' }}>
                                  <Clock size={13} /> Pending Approval
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0284c7' }}>
                              <span 
                                onClick={() => handleOpenTlDetails(tl.id)}
                                style={{ cursor: 'pointer', background: '#e0f2fe', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem' }}
                              >
                                {tl.assignedHrsCount || 0} HRs assigned
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                              <button
                                onClick={() => handleOpenTlDetails(tl.id)}
                                style={{
                                  background: '#2563eb',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '7px 14px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  fontSize: '0.82rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                                }}
                              >
                                View Team ➔
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
        ) : activeTab === 'branch_hrs' ? (
          /* TAB 3: BRANCH HRS */
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Branch HR Executives ({hrs.length})</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  HR executives assigned under your branch's Team Leaders by Super Admin.
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '12px 16px' }}>HR Name</th>
                    <th style={{ padding: '12px 16px' }}>Contact</th>
                    <th style={{ padding: '12px 16px' }}>Assigned Team Leader</th>
                    <th style={{ padding: '12px 16px' }}>Referral Code</th>
                    <th style={{ padding: '12px 16px' }}>Candidates Applied</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hrs.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No HRs assigned under your branch's Team Leaders yet. Super Admin assigns HRs to approved TLs.
                      </td>
                    </tr>
                  ) : (
                    hrs.map(hr => (
                      <tr key={hr.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                              {(hr.name || 'H')[0].toUpperCase()}
                            </div>
                            {hr.name}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#475569' }}>
                          <div>{hr.email}</div>
                          {hr.mobile && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{hr.mobile}</div>}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                            {hr.teamLeaderName || 'Assigned TL'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                            {hr.referralCode || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#059669' }}>
                          {hr.candidatesApplied || 0}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                            <CheckCircle2 size={12} /> Active in Branch
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'applications' ? (
          /* TAB 4: BRANCH APPLICATIONS */
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Branch Candidate Applications ({validApplications.length})</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  All candidate applications referred through your branch HRs & Team Leaders.
                </p>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px' }}>
                  <Search size={14} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Search candidate, job, HR..."
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
                    <th style={{ padding: '12px 16px' }}>Referred By (HR / TL)</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Date Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No matching candidate applications found for this branch.
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
                          <div style={{ fontWeight: 700, color: '#0284c7' }}>HR: {app.referringHrName}</div>
                          {app.referringTlName && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>TL: {app.referringTlName}</div>}
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
          /* TAB 5: BRANCH INTERVIEWS */
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Branch Interviews ({branchInterviews.length})</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Interviews scheduled for candidates referred by your branch team.
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
                    <th style={{ padding: '12px 16px' }}>Scheduled Date</th>
                  </tr>
                </thead>
                <tbody>
                  {branchInterviews.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No interviews currently scheduled for candidates under this branch.
                      </td>
                    </tr>
                  ) : (
                    branchInterviews.map((app, idx) => (
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
          /* TAB 6: INCENTIVES & PAYOUTS */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header Stats */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Branch Incentives Overview</h3>
                <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                  Total expected and earned incentive commissions across this branch's HR team.
                </p>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem 1.5rem', borderRadius: '12px', textAlign: 'right' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a' }}>₹{totalBranchIncentives.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>Total Expected Branch Payouts</div>
              </div>
            </div>

            {/* Closed Candidates */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Placed Candidates ({branchClosedApps.length})</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  Candidates who have been successfully selected or joined.
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
                    {branchClosedApps.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                          No candidates closed/selected in this branch yet.
                        </td>
                      </tr>
                    ) : (
                      branchClosedApps.map((app, idx) => (
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

      {/* CREATE TEAM LEADER MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Add New Team Leader</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Add a Team Leader to <strong>{currentUser.branch || 'your branch'}</strong>. Super Admin approval is required before they can log in.
            </p>

            {error && (
              <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTl} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@gmail.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="10 digit mobile"
                  value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Branch</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.branch || form.branch || 'Main Branch'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  {saving ? 'Creating...' : 'Submit for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
