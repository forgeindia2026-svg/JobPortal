import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2, Users, FileText, CalendarDays, CheckCircle2, Clock,
  RefreshCw, Search, Download, ArrowLeft, ExternalLink, XCircle,
  FileCheck, ChevronRight, LogOut, Filter, MapPin, Phone, Mail,
  Award, Flame, Target, ShieldCheck, ChevronDown, Check, UserCheck, Briefcase
} from 'lucide-react';
import OffersAndTargetsView from './OffersAndTargetsView';

const CLOSED_STATUSES = ['selected', 'joined', 'joined manipal', 'converted', 'hired'];

const BANK_BRAND_COLORS = {
  'axis': '#97144D',
  'kotak': '#003366',
  'aditya birla': '#C8102E',
  'bandhan': '#002E6E',
  'idfc': '#9C1D26',
  'mahindra finance': '#E31837',
  'yes': '#005A9C',
  'hdfc': '#004C8F',
  'tata aig': '#003366',
  'suryoday': '#E84B18',
};

const getBankColor = (name) => {
  const lower = String(name || '').toLowerCase();
  for (const [key, color] of Object.entries(BANK_BRAND_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return '#1e293b';
};

const getStatusBadge = (status) => {
  const s = String(status || '').toLowerCase().trim();
  if (['selected', 'hired', 'joined', 'converted'].includes(s) && !s.includes('l1') && !s.includes('l2')) {
    return { bg: '#dcfce7', text: '#15803d', label: 'Selected / Placed' };
  }
  if (s.includes('l1') || s.includes('l2')) {
    return { bg: '#eff6ff', text: '#1d4ed8', label: status || 'L1 Selected' };
  }
  if (s.includes('interview')) {
    return { bg: '#ede9fe', text: '#6d28d9', label: 'Interview' };
  }
  if (s === 'shortlisted') {
    return { bg: '#e0f2fe', text: '#0369a1', label: 'Shortlisted' };
  }
  if (s === 'rejected' || s === 'not interested' || s === 'cancelled') {
    return { bg: '#fee2e2', text: '#b91c1c', label: 'Rejected' };
  }
  return { bg: '#fef3c7', text: '#b45309', label: status || 'Applied' };
};

export default function HrManagerDashboard({ API_URL, currentUser, sidebarOpen, setSidebarOpen, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'applied' | 'interviews' | 'hrs' | 'branches_teams' | 'jobs' | 'offers_targets'
  const [data, setData] = useState(null);
  const [reportKpis, setReportKpis] = useState(null);
  const [allInterviews, setAllInterviews] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [interviewFilter, setInterviewFilter] = useState('active'); // 'active' | 'all' | 'document' | 'selected' | 'rejected'
  const [loading, setLoading] = useState(true);

  // Application Filters
  const [branchFilter, setBranchFilter] = useState('all');
  const [tlFilter, setTlFilter] = useState('all');
  const [hrFilter, setHrFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | 'last7'
  const [appSearch, setAppSearch] = useState('');

  // HR list filters
  const [hrSearch, setHrSearch] = useState('');
  const [hrBranchFilter, setHrBranchFilter] = useState('all');

  // Status update modal
  const [statusModalApp, setStatusModalApp] = useState(null);
  const [newStatus, setNewStatus] = useState('Shortlisted');
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const [res, repRes, intRes, jobsRes] = await Promise.all([
        fetch(`${API_URL}/api/users/hr-managers/${currentUser.id}/overview`),
        fetch(`${API_URL}/api/reports/dashboard`).catch(() => null),
        fetch(`${API_URL}/api/interviews`).catch(() => null),
        fetch(`${API_URL}/api/jobs`).catch(() => null),
      ]);
      if (res && res.ok) {
        const json = await res.json();
        setData(json);
        if (Array.isArray(json.interviews) && json.interviews.length > 0) {
          setAllInterviews(json.interviews);
        }
      }
      if (repRes && repRes.ok) {
        const repJson = await repRes.json();
        if (repJson?.kpis) setReportKpis(repJson.kpis);
      }
      if (intRes && intRes.ok) {
        const intJson = await intRes.json();
        if (Array.isArray(intJson)) setAllInterviews(intJson);
      }
      if (jobsRes && jobsRes.ok) {
        const jobsJson = await jobsRes.json();
        if (Array.isArray(jobsJson)) setJobsList(jobsJson);
      }
    } catch (err) {
      console.error('Error fetching HR manager overview:', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, currentUser.id]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleUpdateStatus = async () => {
    if (!statusModalApp || !newStatus) return;
    try {
      setSavingStatus(true);
      const res = await fetch(`${API_URL}/api/applications/${statusModalApp.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setStatusModalApp(null);
        fetchOverview();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingStatus(false);
    }
  };

  const branches = data?.branches || [];
  const teamLeaders = data?.teamLeaders || [];
  const hrs = data?.hrs || [];
  const rawApplications = data?.applications || [];
  const applications = useMemo(
    () => rawApplications.filter((app) => app.status !== 'Payment Pending'),
    [rawApplications]
  );

  // Exact same Document Submission count as AdminDashboard.jsx
  const docSubmissionCount = useMemo(() => {
    const ids = new Set();
    applications.forEach((a) => {
      const s = String(a.status || '').toLowerCase().trim();
      if (
        ['document submission', 'document submitted', 'documents submitted', 'documents submission', 'document verification'].includes(s) ||
        s.includes('document')
      ) {
        ids.add(a.id);
      }
    });
    (allInterviews || []).forEach((int) => {
      const s = String(int.status || '').toLowerCase().trim();
      if (
        ['document submission', 'document submitted', 'documents submitted', 'documents submission', 'document verification'].includes(s) ||
        s.includes('document')
      ) {
        if (int.applicationId) ids.add(int.applicationId);
      }
    });
    return ids.size;
  }, [applications, allInterviews]);

  // Exact same Active Interviews filter as AdminDashboard.jsx
  const activeInterviews = useMemo(() => {
    return (allInterviews || []).filter((int) => {
      const intStatus = String(int.status || '').toLowerCase().trim();
      if (['rejected', 'not interested', 'cancelled'].includes(intStatus)) return false;
      if (['selected', 'hired', 'converted'].includes(intStatus)) return false;
      if (intStatus.includes('document')) return false;

      const app = rawApplications.find(
        (a) =>
          (int.applicationId && String(a.id) === String(int.applicationId)) ||
          (int.candidateId && String(a.candidateId) === String(int.candidateId))
      );

      if (app) {
        const appStatus = String(app.status || '').toLowerCase().trim();
        if (appStatus === 'payment pending' || appStatus === 'unpaid') return false;
        if (['rejected', 'not interested'].includes(appStatus)) return false;
        if (appStatus.includes('document')) return false;
        if (['selected', 'converted', 'hired'].includes(appStatus)) return false;
      }
      return true;
    });
  }, [allInterviews, rawApplications]);

  const displayedInterviews = useMemo(() => {
    if (interviewFilter === 'all') return allInterviews || [];
    if (interviewFilter === 'active') return activeInterviews;
    if (interviewFilter === 'document') {
      return (allInterviews || []).filter((int) => {
        const intStatus = String(int.status || '').toLowerCase().trim();
        if (intStatus.includes('document')) return true;
        const app = rawApplications.find(
          (a) =>
            (int.applicationId && String(a.id) === String(int.applicationId)) ||
            (int.candidateId && String(a.candidateId) === String(int.candidateId))
        );
        return app && String(app.status || '').toLowerCase().trim().includes('document');
      });
    }
    if (interviewFilter === 'selected') {
      return (allInterviews || []).filter((int) => {
        const intStatus = String(int.status || '').toLowerCase().trim();
        if (['selected', 'hired', 'converted'].includes(intStatus)) return true;
        const app = rawApplications.find(
          (a) =>
            (int.applicationId && String(a.id) === String(int.applicationId)) ||
            (int.candidateId && String(a.candidateId) === String(int.candidateId))
        );
        return app && ['selected', 'hired', 'converted'].includes(String(app.status || '').toLowerCase().trim());
      });
    }
    if (interviewFilter === 'rejected') {
      return (allInterviews || []).filter((int) => {
        const intStatus = String(int.status || '').toLowerCase().trim();
        if (['rejected', 'not interested', 'cancelled'].includes(intStatus)) return true;
        const app = rawApplications.find(
          (a) =>
            (int.applicationId && String(a.id) === String(int.applicationId)) ||
            (int.candidateId && String(a.candidateId) === String(int.candidateId))
        );
        return app && ['rejected', 'not interested'].includes(String(app.status || '').toLowerCase().trim());
      });
    }
    return activeInterviews;
  }, [allInterviews, activeInterviews, interviewFilter, rawApplications]);

  const processingCount = useMemo(() => {
    return applications.filter((a) => {
      const s = String(a.status || '').toLowerCase();
      return (
        !['selected', 'converted', 'rejected', 'not interested', 'interview scheduled'].includes(s) &&
        !s.includes('interview') &&
        !s.includes('document')
      );
    }).length;
  }, [applications]);

  const selectedCount = useMemo(
    () => applications.filter((a) => ['Selected', 'Converted'].includes(a.status)).length,
    [applications]
  );

  const rejectedCount = useMemo(
    () => applications.filter((a) => ['Rejected', 'Not Interested'].includes(a.status)).length,
    [applications]
  );

  const totalCandidatesCount = reportKpis?.totalCandidates ?? data?.kpis?.totalCandidates ?? applications.length;
  const totalJobsCount = reportKpis?.totalJobs ?? data?.kpis?.totalJobs ?? jobsList.length;
  const activeJobsCount = reportKpis?.activeJobs ?? data?.kpis?.activeJobs ?? jobsList.filter((j) => j.status === 'Active').length;

  // Date Filtered Applications
  const dateFilteredApplications = useMemo(() => {
    if (dateFilter === 'all') return applications;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const last7DaysStart = todayStart - 7 * 86400000;

    return applications.filter((app) => {
      const appDate = new Date(app.appliedAt || app.createdAt || 0).getTime();
      if (dateFilter === 'today') return appDate >= todayStart;
      if (dateFilter === 'yesterday') return appDate >= yesterdayStart && appDate < todayStart;
      if (dateFilter === 'last7') return appDate >= last7DaysStart;
      return true;
    });
  }, [applications, dateFilter]);

  // Filtered Applications for Master Applied Tab
  const filteredApps = useMemo(() => {
    return dateFilteredApplications.filter((app) => {
      const q = appSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (app.candidateName || '').toLowerCase().includes(q) ||
        (app.candidateEmail || '').toLowerCase().includes(q) ||
        (app.candidateMobile || '').includes(q) ||
        (app.jobTitle || '').toLowerCase().includes(q) ||
        (app.companyName || '').toLowerCase().includes(q) ||
        (app.referringHrName || app.hrName || '').toLowerCase().includes(q);

      const matchesBranch =
        branchFilter === 'all' ||
        String(app.branchName || '').toLowerCase() === branchFilter.toLowerCase();

      const matchesTl =
        tlFilter === 'all' ||
        String(app.referringTlId || '') === tlFilter ||
        String(app.referringTlName || app.tlName || '').toLowerCase() === tlFilter.toLowerCase();

      const matchesHr =
        hrFilter === 'all' ||
        String(app.referringHrCode || app.hrCode || '').toLowerCase() === hrFilter.toLowerCase();

      const s = String(app.status || '').toLowerCase().trim();
      const filterLower = statusFilter.toLowerCase();
      let matchesStatus = true;
      if (filterLower === 'all') {
        matchesStatus = true;
      } else if (filterLower === 'processing' || filterLower === 'in_screening') {
        matchesStatus =
          !['selected', 'converted', 'rejected', 'not interested', 'interview scheduled'].includes(s) &&
          !s.includes('interview') &&
          !s.includes('document');
      } else if (filterLower === 'document submission') {
        const isDoc =
          ['document submission', 'document submitted', 'documents submitted', 'documents submission', 'document verification'].includes(s) ||
          s.includes('document');
        const hasDocInt = (allInterviews || []).some(
          (int) =>
            (String(int.candidateId) === String(app.candidateId) || String(int.applicationId) === String(app.id)) &&
            String(int.status || '').toLowerCase().includes('document')
        );
        matchesStatus = isDoc || hasDocInt;
      } else if (filterLower === 'selected') {
        matchesStatus = ['selected', 'converted'].includes(s);
      } else if (filterLower === 'rejected') {
        matchesStatus = ['rejected', 'not interested'].includes(s);
      } else if (filterLower === 'interview') {
        matchesStatus = s.includes('interview') || Boolean(app.interviewDate);
      } else {
        matchesStatus = s === filterLower;
      }

      return matchesSearch && matchesBranch && matchesTl && matchesHr && matchesStatus;
    });
  }, [dateFilteredApplications, appSearch, branchFilter, tlFilter, hrFilter, statusFilter, allInterviews]);

  // Filtered HRs for Executive HRs tab
  const filteredHrs = useMemo(() => {
    return hrs.filter((h) => {
      const q = hrSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (h.name || '').toLowerCase().includes(q) ||
        (h.email || '').toLowerCase().includes(q) ||
        (h.mobile || '').includes(q) ||
        (h.referralCode || '').toLowerCase().includes(q);

      const matchesBranch =
        hrBranchFilter === 'all' ||
        String(h.branchName || '').toLowerCase() === hrBranchFilter.toLowerCase();

      return matchesSearch && matchesBranch;
    });
  }, [hrs, hrSearch, hrBranchFilter]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'applied', label: `Applied (${applications.length})`, icon: FileText },
    { id: 'interviews', label: `Interviews (${activeInterviews.length})`, icon: CalendarDays },
    { id: 'hrs', label: `Executive HRs (${hrs.length})`, icon: Users },
    { id: 'branches_teams', label: `Branches & Teams (${branches.length})`, icon: ShieldCheck },
    { id: 'jobs', label: `Job Openings (${totalJobsCount})`, icon: Briefcase },
    { id: 'offers_targets', label: 'Offers & Targets 🔥', icon: Flame },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (Standard Responsive Sidebar) */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        {/* User / Role Banner */}
        <div style={{ padding: '0 8px 1rem 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
            CENTRAL CONTROL PANEL
          </div>
          <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 800, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🏢</span> Central HR Manager
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
            {currentUser.name} • All Branches
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (setSidebarOpen) setSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={18} color={isActive ? '#ffffff' : '#94a3b8'} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Logout */}
        {onLogout && (
          <div style={{ padding: '1rem 0 0 0', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
            <button
              onClick={onLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <RefreshCw size={32} className="spin" style={{ margin: '0 auto 12px auto', color: '#0284c7' }} />
            <div style={{ color: '#64748b', fontWeight: 600 }}>Loading HR Management Operations Hub...</div>
          </div>
        ) : (
          <>
            {/* ======================================================== */}
            {/* TAB 1: DASHBOARD (ALL BRANCHES OVERVIEW HUB)             */}
            {/* ======================================================== */}
            {activeTab === 'dashboard' && (
              <div>
                {/* Hero Banner */}
                <div style={{ background: '#0c1424', borderRadius: '18px', padding: '1.75rem', border: '1.5px solid #1e293b', marginBottom: '1.5rem', color: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#1d4ed8', color: '#ffffff', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                          CENTRAL HR MANAGEMENT
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>All Branches Active</span>
                      </div>
                      <h1 style={{ fontSize: '1.65rem', fontWeight: 900, margin: '8px 0 4px 0' }}>
                        HR Operations Hub
                      </h1>
                      <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0, maxWidth: '650px' }}>
                        Centralized talent pipeline oversight across all company branches ({branches.map(b => b.branchName).join(', ') || 'Bangalore, Hosur'}).
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div
                        onClick={() => setActiveTab('branches_teams')}
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                        title="View Branches & Teams"
                      >
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa' }}>{branches.length}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Branches</div>
                      </div>
                      <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)' }} />
                      <div
                        onClick={() => setActiveTab('branches_teams')}
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                        title="View Team Leaders"
                      >
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a78bfa' }}>{teamLeaders.length}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Team Leaders</div>
                      </div>
                      <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)' }} />
                      <div
                        onClick={() => {
                          setHrBranchFilter('all');
                          setHrSearch('');
                          setActiveTab('hrs');
                        }}
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                        title="View Executive HRs"
                      >
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>{hrs.length}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Executive HRs</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recruitment Dashboard Overview Header + Refresh */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Recruitment Dashboard Overview</h2>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '2px 0 0 0' }}>Live candidate applications, job metrics, and interview tracking across all branches.</p>
                  </div>
                  <button
                    className="btn-secondary"
                    onClick={fetchOverview}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', color: '#0f172a' }}
                  >
                    <RefreshCw size={14} /> Refresh Stats
                  </button>
                </div>

                {/* 10 Top KPI Cards (8 Admin Overview KPI Cards + 2 Branch/HR Cards) */}
                <div className="kpi-grid" style={{ marginBottom: '1.75rem' }}>
                  {/* 1. Applications Received (155) */}
                  <div
                    className="kpi-card"
                    onClick={() => {
                      setBranchFilter('all');
                      setTlFilter('all');
                      setHrFilter('all');
                      setStatusFilter('all');
                      setDateFilter('all');
                      setAppSearch('');
                      setActiveTab('applied');
                    }}
                    style={{
                      background: '#fffbeb', border: '1px solid #fcd34d', cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
                    title="Click to view all Applications Received"
                  >
                    <div className="kpi-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                      <FileText size={22} />
                    </div>
                    <div>
                      <div className="kpi-val" style={{ color: '#78350f' }}>{applications.length}</div>
                      <div className="kpi-label" style={{ color: '#78350f', opacity: 0.8, fontWeight: 600 }}>Applications Received</div>
                    </div>
                  </div>

                  {/* 2. Total Candidates (147) */}
                  <div
                    className="kpi-card"
                    onClick={() => {
                      setBranchFilter('all');
                      setTlFilter('all');
                      setHrFilter('all');
                      setStatusFilter('all');
                      setDateFilter('all');
                      setAppSearch('');
                      setActiveTab('applied');
                    }}
                    style={{
                      background: '#f0fdfa', border: '1px solid #5eead4', cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
                    title="Click to view Total Candidates"
                  >
                    <div className="kpi-icon" style={{ background: '#ccfbf1', color: '#0d9488' }}>
                      <Users size={22} />
                    </div>
                    <div>
                      <div className="kpi-val" style={{ color: '#134e4a' }}>{totalCandidatesCount}</div>
                      <div className="kpi-label" style={{ color: '#134e4a', opacity: 0.8, fontWeight: 600 }}>Total Candidates</div>
                    </div>
                  </div>

                  {/* 3. Processing (87) */}
                  <div
                    className="kpi-card"
                    onClick={() => {
                      setBranchFilter('all');
                      setTlFilter('all');
                      setHrFilter('all');
                      setStatusFilter('processing');
                      setDateFilter('all');
                      setAppSearch('');
                      setActiveTab('applied');
                    }}
                    style={{
                      background: '#e0e7ff', border: '1px solid #a5b4fc', cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
                    title="Click to view Processing candidates"
                  >
                    <div className="kpi-icon" style={{ background: '#c7d2fe', color: '#4f46e5' }}>
                      <RefreshCw size={22} />
                    </div>
                    <div>
                      <div className="kpi-val" style={{ color: '#312e81' }}>{processingCount}</div>
                      <div className="kpi-label" style={{ color: '#312e81', opacity: 0.8, fontWeight: 600 }}>Processing</div>
                    </div>
                  </div>

                  {/* 4. Interviews Scheduled (8) */}
                  <div
                    className="kpi-card"
                    onClick={() => {
                      setInterviewFilter('active');
                      setActiveTab('interviews');
                    }}
                    style={{
                      background: '#fdf4ff', border: '1px solid #f0abfc', cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
                    title="Click to view Scheduled Interviews"
                  >
                    <div className="kpi-icon" style={{ background: '#fae8ff', color: '#c026d3' }}>
                      <CalendarDays size={22} />
                    </div>
                    <div>
                      <div className="kpi-val" style={{ color: '#701a75' }}>{activeInterviews.length}</div>
                      <div className="kpi-label" style={{ color: '#701a75', opacity: 0.8, fontWeight: 600 }}>Interviews Scheduled</div>
                    </div>
                  </div>

                  {/* 5. Document Submission (16) */}
                  <div
                    className="kpi-card"
                    onClick={() => {
                      setBranchFilter('all');
                      setTlFilter('all');
                      setHrFilter('all');
                      setStatusFilter('document submission');
                      setDateFilter('all');
                      setAppSearch('');
                      setActiveTab('applied');
                    }}
                    style={{
                      background: '#ecfeff', border: '1px solid #67e8f9', cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
                    title="Click to view Document Submission candidates"
                  >
                    <div className="kpi-icon" style={{ background: '#cffafe', color: '#0891b2' }}>
                      <FileCheck size={22} />
                    </div>
                    <div>
                      <div className="kpi-val" style={{ color: '#164e63' }}>{docSubmissionCount}</div>
                      <div className="kpi-label" style={{ color: '#164e63', opacity: 0.8, fontWeight: 600 }}>Document Submission</div>
                    </div>
                  </div>

                  {/* 6. Selected (2) */}
                  <div
                    className="kpi-card"
                    onClick={() => {
                      setBranchFilter('all');
                      setTlFilter('all');
                      setHrFilter('all');
                      setStatusFilter('selected');
                      setDateFilter('all');
                      setAppSearch('');
                      setActiveTab('applied');
                    }}
                    style={{
                      background: '#ecfdf5', border: '1px solid #6ee7b7', cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
                    title="Click to view Selected candidates"
                  >
                    <div className="kpi-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <div className="kpi-val" style={{ color: '#064e3b' }}>{selectedCount}</div>
                      <div className="kpi-label" style={{ color: '#064e3b', opacity: 0.8, fontWeight: 600 }}>Selected</div>
                    </div>
                  </div>

                  {/* 7. Rejected (48) */}
                  <div
                    className="kpi-card"
                    onClick={() => {
                      setBranchFilter('all');
                      setTlFilter('all');
                      setHrFilter('all');
                      setStatusFilter('rejected');
                      setDateFilter('all');
                      setAppSearch('');
                      setActiveTab('applied');
                    }}
                    style={{
                      background: '#fef2f2', border: '1px solid #fca5a5', cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
                    title="Click to view Rejected candidates"
                  >
                    <div className="kpi-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                      <XCircle size={22} />
                    </div>
                    <div>
                      <div className="kpi-val" style={{ color: '#7f1d1d' }}>{rejectedCount}</div>
                      <div className="kpi-label" style={{ color: '#7f1d1d', opacity: 0.8, fontWeight: 600 }}>Rejected</div>
                    </div>
                  </div>

                  {/* 8. Total Jobs (13 Active) (17) */}
                  <div
                    className="kpi-card"
                    onClick={() => setActiveTab('jobs')}
                    style={{
                      background: '#eff6ff', border: '1px solid #93c5fd', cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
                    title="Click to view all Job Openings"
                  >
                    <div className="kpi-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
                      <Briefcase size={22} />
                    </div>
                    <div>
                      <div className="kpi-val" style={{ color: '#1e3a8a' }}>{totalJobsCount}</div>
                      <div className="kpi-label" style={{ color: '#1e3a8a', opacity: 0.8, fontWeight: 600 }}>Total Jobs ({activeJobsCount} Active)</div>
                    </div>
                  </div>

                  {/* 9. Extra Card 1: Total Branches (2 - Active operations) */}
                  <div
                    onClick={() => setActiveTab('branches_teams')}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37,99,235,0.12)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
                    style={{ background: '#ffffff', borderRadius: '14px', padding: '1.15rem 1.25rem', border: '1.5px solid #bfdbfe', borderTop: '4px solid #2563eb', cursor: 'pointer', transition: 'all 0.2s' }}
                    title="Click to view Branches & Teams"
                  >
                    <div style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase' }}>Total Branches</div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1e3a8a', margin: '4px 0' }}>{branches.length}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Active operations</div>
                  </div>

                  {/* 10. Extra Card 2: Executive HRs (14 - Across all teams) */}
                  <div
                    onClick={() => {
                      setHrBranchFilter('all');
                      setHrSearch('');
                      setActiveTab('hrs');
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(124,58,237,0.12)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
                    style={{ background: '#ffffff', borderRadius: '14px', padding: '1.15rem 1.25rem', border: '1.5px solid #ddd6fe', borderTop: '4px solid #7c3aed', cursor: 'pointer', transition: 'all 0.2s' }}
                    title="Click to view all Executive HRs"
                  >
                    <div style={{ fontSize: '0.78rem', color: '#6d28d9', fontWeight: 800, textTransform: 'uppercase' }}>Executive HRs</div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#5b21b6', margin: '4px 0' }}>{hrs.length}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Across all teams</div>
                  </div>
                </div>

                {/* Branch-wise Breakdown Grid */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      🏢 Branch Operations & Squad Performance
                    </h2>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                      Click any branch to view its full pipeline
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                    {branches.map((b) => (
                      <div
                        key={b.branchId}
                        style={{
                          background: '#ffffff',
                          borderRadius: '16px',
                          padding: '1.25rem',
                          border: '1.5px solid #e2e8f0',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => {
                          setBranchFilter(b.branchName);
                          setActiveTab('applied');
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.borderColor = '#93c5fd';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                              BRANCH
                            </span>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 2px 0' }}>
                              {b.branchName}
                            </h3>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              Manager: <strong style={{ color: '#0f172a' }}>{b.managerName}</strong>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#2563eb' }}>
                              {b.totalApplications}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Applications</div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: '10px', marginTop: '14px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Team Leaders</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{b.totalTls}</div>
                          </div>
                          <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Executive HRs</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{b.totalHrs}</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.72rem', color: '#16a34a' }}>Hired</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#16a34a' }}>{b.selectedCandidates}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>📍 {b.location || 'Branch Office'}</span>
                          <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700 }}>
                            View Branch Pipeline →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: APPLIED (MASTER APPLICATIONS PIPELINE)             */}
            {/* ======================================================== */}
            {activeTab === 'applied' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Candidate Applications Pipeline ({filteredApps.length})
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                      All candidates referred across all company branches.
                    </p>
                  </div>

                  {/* Quick Date Filters */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'today', label: 'Today' },
                      { key: 'yesterday', label: 'Yesterday 🟡' },
                      { key: 'last7', label: 'Last 7D' },
                    ].map((d) => (
                      <button
                        key={d.key}
                        onClick={() => setDateFilter(d.key)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: dateFilter === d.key ? '#2563eb' : '#cbd5e1',
                          background: dateFilter === d.key ? '#2563eb' : '#ffffff',
                          color: dateFilter === d.key ? '#ffffff' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Controls Bar */}
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '14px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                      <input
                        type="text"
                        placeholder="Search candidate name, role, email, phone..."
                        value={appSearch}
                        onChange={(e) => setAppSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px 8px 34px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Branch Filter */}
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff', fontWeight: 600 }}
                  >
                    <option value="all">🏢 All Branches ({branches.length})</option>
                    {branches.map((b) => (
                      <option key={b.branchId} value={b.branchName}>{b.branchName}</option>
                    ))}
                  </select>

                  {/* TL Filter */}
                  <select
                    value={tlFilter}
                    onChange={(e) => setTlFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff', fontWeight: 600 }}
                  >
                    <option value="all">👔 All Team Leaders ({teamLeaders.length})</option>
                    {teamLeaders.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.branchName})</option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff', fontWeight: 600 }}
                  >
                    <option value="all">All Statuses ({applications.length})</option>
                    <option value="processing">Processing ({processingCount})</option>
                    <option value="document submission">Document Submission ({docSubmissionCount})</option>
                    <option value="in_screening">In Screening / Under Review</option>
                    <option value="applied">Applied</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview">Interview Scheduled</option>
                    <option value="l1 selected">L1 Selected</option>
                    <option value="l2 selected">L2 Selected</option>
                    <option value="selected">Selected / Placed ({selectedCount})</option>
                    <option value="offer released">Offer Released</option>
                    <option value="joined">Joined</option>
                    <option value="hold">Hold</option>
                    <option value="rejected">Rejected ({rejectedCount})</option>
                  </select>
                </div>

                {/* Applications Table */}
                {filteredApps.length === 0 ? (
                  <div style={{ background: '#ffffff', borderRadius: '14px', padding: '3rem', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
                    <FileText size={36} style={{ margin: '0 auto 10px auto', color: '#cbd5e1' }} />
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>No applications found</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Try adjusting your search query or filters.</div>
                  </div>
                ) : (
                  <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569' }}>Candidate</th>
                          <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569' }}>Branch & Squad</th>
                          <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569' }}>Company / Role</th>
                          <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569' }}>Status</th>
                          <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569' }}>Applied Date</th>
                          <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApps.map((app) => {
                          const badge = getStatusBadge(app.status);
                          const bankColor = getBankColor(app.companyName);

                          return (
                            <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{app.candidateName}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  {app.candidateEmail} {app.candidateMobile ? `• ${app.candidateMobile}` : ''}
                                </div>
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800 }}>
                                  🏢 {app.branchName || 'General'}
                                </span>
                                <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>
                                  HR: <strong>{app.referringHrName}</strong> {app.referringTlName ? `(TL: ${app.referringTlName})` : ''}
                                </div>
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: bankColor }} />
                                  <strong style={{ color: '#0f172a' }}>{app.companyName}</strong>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.jobTitle}</div>
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ background: badge.bg, color: badge.text, padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                                  {badge.label}
                                </span>
                              </td>

                              <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.8rem' }}>
                                {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                              </td>

                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <button
                                  onClick={() => {
                                    setStatusModalApp(app);
                                    setNewStatus(app.status || 'Shortlisted');
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #bfdbfe',
                                    background: '#eff6ff',
                                    color: '#1d4ed8',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Update Status
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: INTERVIEWS                                        */}
            {/* ======================================================== */}
            {activeTab === 'interviews' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Scheduled Interviews ({displayedInterviews.length})
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                      Live candidate interview rounds scheduled across all company branches.
                    </p>
                  </div>

                  {/* Filter Pills matching AdminDashboard */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { id: 'Active Scheduled', label: `Active Scheduled (${activeInterviews.length})` },
                      { id: 'All', label: `All History (${allInterviews.length})` },
                      { id: 'Document Stage', label: 'Document Stage' },
                      { id: 'Selected', label: 'Selected' },
                      { id: 'Rejected', label: 'Rejected' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setInterviewStatusFilter(f.id)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          border: interviewStatusFilter === f.id ? '1.5px solid #7c3aed' : '1px solid #cbd5e1',
                          background: interviewStatusFilter === f.id ? '#f5f3ff' : '#ffffff',
                          color: interviewStatusFilter === f.id ? '#6d28d9' : '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {displayedInterviews.length === 0 ? (
                  <div style={{ background: '#ffffff', borderRadius: '14px', padding: '3rem', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
                    <CalendarDays size={36} style={{ margin: '0 auto 10px auto', color: '#cbd5e1' }} />
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>No interviews in "{interviewStatusFilter}" stage</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                    {displayedInterviews.map((iv, idx) => (
                      <div key={iv.id || iv._id || idx} style={{ background: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1.5px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{iv.candidateName || 'Candidate'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {iv.candidateEmail || ''} {iv.candidatePhone ? `• ${iv.candidatePhone}` : ''}
                            </div>
                          </div>
                          <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                            {iv.status || 'Scheduled'}
                          </span>
                        </div>

                        <div style={{ marginTop: '10px', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                          💼 {iv.jobTitle || 'Role'} <span style={{ color: '#64748b', fontWeight: 600 }}>({iv.companyName || 'Company'})</span>
                        </div>

                        <div style={{ marginTop: '10px', background: '#f5f3ff', borderLeft: '3px solid #7c3aed', padding: '10px', borderRadius: '6px' }}>
                          <div style={{ fontWeight: 800, color: '#6d28d9', fontSize: '0.85rem' }}>
                            🗓 {iv.interviewDate || 'Date Pending'} {iv.interviewTime ? `at ${iv.interviewTime}` : ''}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#5b21b6', marginTop: '2px' }}>
                            Mode: {iv.mode || 'In-person / Virtual'} {iv.location ? `• ${iv.location}` : ''}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '0.78rem' }}>
                          <span style={{ color: '#1d4ed8', fontWeight: 700 }}>🏢 {iv.branchName || 'General'}</span>
                          <span style={{ color: '#64748b' }}>HR: <strong>{iv.hrName || 'Direct / Organic'}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: JOB OPENINGS (17 Total / 13 Active)                 */}
            {/* ======================================================== */}
            {activeTab === 'jobs' && (
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Job Openings ({jobsList.length} Total • {activeJobsCount} Active)
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                    All job openings across partner companies and banks. Click any job to filter candidates applied to that role.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                  {jobsList.map((j, idx) => {
                    const isActive = j.isActive !== false && (j.status || 'Active') !== 'Closed';
                    const companyTitle = j.companyName || (j.company && j.company.name) || 'Partner Company';
                    const jobAppsCount = applications.filter(a => a.jobId === (j.id || j._id) || a.jobTitle === j.title).length;
                    return (
                      <div
                        key={j.id || j._id || idx}
                        onClick={() => {
                          setSearchQuery(j.title || '');
                          setStatusFilter('all');
                          setActiveTab('applied');
                        }}
                        style={{
                          background: '#ffffff',
                          borderRadius: '14px',
                          padding: '1.25rem',
                          border: '1.5px solid #e2e8f0',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '1.02rem', color: '#0f172a' }}>{j.title}</div>
                            <div style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>{companyTitle}</div>
                          </div>
                          <span style={{
                            background: isActive ? '#dcfce7' : '#f1f5f9',
                            color: isActive ? '#15803d' : '#64748b',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 800
                          }}>
                            {isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px' }}>
                          📍 {j.location || 'Pan India'} {j.salary ? `• 💰 ${j.salary}` : ''}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '0.78rem' }}>
                          <span style={{ color: '#475569', fontWeight: 700 }}>{jobAppsCount} Applications</span>
                          <span style={{ color: '#2563eb', fontWeight: 700 }}>View Candidates →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: EXECUTIVE HRS                                     */}
            {/* ======================================================== */}
            {activeTab === 'hrs' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Executive HRs Master List ({filteredHrs.length})
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                      All HR executives working under Team Leaders across all branches.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Search HR by name, email, code..."
                      value={hrSearch}
                      onChange={(e) => setHrSearch(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '240px' }}
                    />
                    <select
                      value={hrBranchFilter}
                      onChange={(e) => setHrBranchFilter(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff', fontWeight: 600 }}
                    >
                      <option value="all">All Branches</option>
                      {branches.map((b) => (
                        <option key={b.branchId} value={b.branchName}>{b.branchName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569' }}>Executive HR</th>
                        <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569' }}>Referral Code</th>
                        <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569' }}>Branch</th>
                        <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569' }}>Reporting Team Leader</th>
                        <th style={{ padding: '12px 16px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Candidates Sourced</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHrs.map((h) => (
                        <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{h.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {h.email} {h.mobile ? `• ${h.mobile}` : ''}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ background: '#f1f5f9', color: '#0f172a', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem' }}>
                              {h.referralCode}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                              🏢 {h.branchName}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>
                            {h.teamLeaderName}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{h.candidatesApplied}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 5: BRANCHES & TEAMS                                  */}
            {/* ======================================================== */}
            {activeTab === 'branches_teams' && (
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Branches & Teams Hierarchy ({branches.length})
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                    Full operational branches tree with Managers, Team Leaders, and assigned HRs.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {branches.map((b) => {
                    const branchTls = teamLeaders.filter(
                      (t) => t.branchManagerId === b.branchId || t.branchName.toLowerCase() === b.branchName.toLowerCase()
                    );
                    const branchHrs = hrs.filter(
                      (h) => h.branchManagerId === b.branchId || h.branchName.toLowerCase() === b.branchName.toLowerCase()
                    );

                    return (
                      <div key={b.branchId} style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1.5px solid #e2e8f0' }}>
                        {/* Branch Head */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                          <div>
                            <span style={{ background: '#2563eb', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                              BRANCH OFFICE
                            </span>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 2px 0' }}>
                              {b.branchName}
                            </h3>
                            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                              Branch Manager: <strong style={{ color: '#0f172a' }}>{b.managerName}</strong> (📧 {b.managerEmail} {b.managerMobile ? `• 📱 ${b.managerMobile}` : ''})
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                              {branchTls.length} Team Leaders
                            </span>
                            <span style={{ background: '#eff6ff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8' }}>
                              {branchHrs.length} Executive HRs
                            </span>
                            <span style={{ background: '#ecfdf5', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, color: '#15803d' }}>
                              {b.totalApplications} Applications
                            </span>
                          </div>
                        </div>

                        {/* TLs under this branch */}
                        <div style={{ marginTop: '1rem' }}>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                            Team Leaders in {b.branchName} ({branchTls.length})
                          </h4>

                          {branchTls.length === 0 ? (
                            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>No Team Leaders registered in this branch yet.</div>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                              {branchTls.map((tl) => {
                                const tlHrs = branchHrs.filter((h) => h.teamLeaderId === tl.id);
                                return (
                                  <div key={tl.id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontWeight: 800, color: '#0f172a' }}>👔 {tl.name}</div>
                                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{tl.email}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700, marginTop: '6px' }}>
                                      {tlHrs.length} Assigned HRs: {tlHrs.map((h) => h.name).slice(0, 3).join(', ')}{tlHrs.length > 3 ? '...' : ''}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 6: OFFERS & TARGETS 🔥                              */}
            {/* ======================================================== */}
            {activeTab === 'offers_targets' && (
              <div>
                <OffersAndTargetsView API_URL={API_URL} currentUser={currentUser} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Status Update Modal */}
      {statusModalApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', width: '90%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a' }}>
              Update Application Status
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 14px 0' }}>
              Candidate: <strong>{statusModalApp.candidateName}</strong> ({statusModalApp.companyName})
            </p>

            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Select New Status:</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', marginBottom: '16px' }}
            >
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="HR Screening">HR Screening</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Document Submission">Document Submission</option>
              <option value="Selected">Selected</option>
              <option value="Closed">🔒 Closed</option>
              <option value="Joined Manipal">🎓 Joined Manipal</option>
              <option value="Rejected">Rejected</option>
            </select>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStatusModalApp(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={savingStatus}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                {savingStatus ? 'Saving...' : 'Save Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
