import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, UserPlus, Clock, CheckCircle2, ShieldCheck, Mail, Phone, MapPin, Building2,
  RefreshCw, FileText, CheckCircle, Briefcase, Filter, Search, Award, TrendingUp, ChevronRight,
  LayoutDashboard, CalendarDays, Gift, ArrowLeft, ExternalLink, X, Code, FileCheck, Download, Calendar, Wallet, LogOut, Flame
} from 'lucide-react';
import BranchItProjectsTab from './BranchItProjectsTab';
import ManipalPayoutManager from './ManipalPayoutManager';
import OffersAndTargetsView from './OffersAndTargetsView';

export default function BranchManagerDashboard({ API_URL, currentUser, sidebarOpen, setSidebarOpen, onBack, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'team_leaders' | 'branch_hrs' | 'applications' | 'interviews' | 'incentives' | 'it_projects' | 'manipal_payout'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // TL Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '', branch: currentUser.branch || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // HR Modal
  const [hrModalOpen, setHrModalOpen] = useState(false);
  const [hrForm, setHrForm] = useState({ name: '', email: '', password: '', mobile: '', teamLeaderId: '' });
  const [hrSaving, setHrSaving] = useState(false);
  const [hrError, setHrError] = useState('');
  const [hrSuccessMsg, setHrSuccessMsg] = useState('');

  // Application search and filters (Admin-style)
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [appTlFilter, setAppTlFilter] = useState('all');
  const [appHrFilter, setAppHrFilter] = useState('all');
  const [appDateFilter, setAppDateFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'custom'
  const [appCustomStartDate, setAppCustomStartDate] = useState('');
  const [appCustomEndDate, setAppCustomEndDate] = useState('');

  // Drilldown states for Team Leader (matching Image 2 & Image 3)
  const [selectedTlId, setSelectedTlId] = useState(null);
  const [tlOverviewData, setTlOverviewData] = useState(null);
  const [tlOverviewLoading, setTlOverviewLoading] = useState(false);
  const [selectedHrForCandidateBreakdown, setSelectedHrForCandidateBreakdown] = useState(null);
  const [statusModalApp, setStatusModalApp] = useState(null);
  const [newAppStatus, setNewAppStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const handleUpdateStatus = async () => {
    if (!statusModalApp || !newAppStatus) return;
    try {
      setSavingStatus(true);
      const res = await fetch(`${API_URL}/api/applications/${statusModalApp.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newAppStatus })
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

  const handleCreateHr = async (e) => {
    e.preventDefault();
    setHrSaving(true);
    setHrError('');
    setHrSuccessMsg('');

    try {
      const res = await fetch(`${API_URL}/api/users/hr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...hrForm,
          branchManagerId: currentUser.id,
          branch: currentUser.branch || ''
        })
      });
      const resData = await res.json();
      if (res.ok) {
        setHrSuccessMsg(`HR "${resData.name}" added successfully! Referral code: ${resData.referralCode}`);
        setHrForm({ name: '', email: '', password: '', mobile: '', teamLeaderId: '' });
        setHrModalOpen(false);
        fetchOverview();
      } else {
        setHrError(resData.error || 'Failed to create HR');
      }
    } catch (err) {
      setHrError('Network error creating HR');
    } finally {
      setHrSaving(false);
    }
  };

  const handleDeleteHr = async (hrId, hrName) => {
    if (!window.confirm(`Are you sure you want to remove HR "${hrName}" from this branch?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/users/hr/${hrId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchOverview();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete HR');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting HR');
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

  const canAccessManipalPayout = Boolean(
    currentUser?.canAccessManipalPayout ||
    data?.branchManager?.canAccessManipalPayout
  );

  const [allApplications, setAllApplications] = useState([]);

  useEffect(() => {
    if (canAccessManipalPayout) {
      fetch(`${API_URL}/api/applications`)
        .then(res => res.ok ? res.json() : [])
        .then(apps => setAllApplications(apps))
        .catch(err => console.error('Error fetching all applications for Manipal Payout:', err));
    }
  }, [canAccessManipalPayout, API_URL]);

  const payoutApps = allApplications.length > 0 ? allApplications : applications;

  const manipalPayoutCandidates = useMemo(() => {
    return payoutApps.filter(app => {
      const s = String(app.status || '').toLowerCase().trim();
      if (s === 'payment pending' || s === 'unpaid') return false;
      const isJoinedManipal = s === 'joined manipal' || s.includes('joined manipal');
      const isExplicitlyPaid = String(app.manipalPayoutStatus || '').toLowerCase() === 'paid';
      return isJoinedManipal || isExplicitlyPaid;
    });
  }, [payoutApps]);

  const manipalPaidCount = useMemo(() => {
    return manipalPayoutCandidates.filter(a => String(a.manipalPayoutStatus || '').toLowerCase() === 'paid').length;
  }, [manipalPayoutCandidates]);

  const manipalPendingCount = useMemo(() => {
    return manipalPayoutCandidates.filter(a => String(a.manipalPayoutStatus || 'pending').toLowerCase() !== 'paid').length;
  }, [manipalPayoutCandidates]);

  // Exclude Payment Pending from Applied tab (they belong in Incentives & Payouts)
  const validApplications = applications.filter(app => app.status !== 'Payment Pending');

  // Date filtering helper functions
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth() === now.getMonth() &&
           d.getDate() === now.getDate();
  };

  const isYesterday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.getFullYear() === yesterday.getFullYear() &&
           d.getMonth() === yesterday.getMonth() &&
           d.getDate() === yesterday.getDate();
  };

  const isLast7Days = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return d >= sevenDaysAgo;
  };

  const isThisMonth = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth() === now.getMonth();
  };

  const isInCustomDateRange = (dateStr, startDateStr, endDateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    if (startDateStr) {
      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      if (d < start) return false;
    }
    if (endDateStr) {
      const end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);
      if (d > end) return false;
    }
    return true;
  };

  const todayAppCount = validApplications.filter(a => isToday(a.appliedAt)).length;
  const yesterdayAppCount = validApplications.filter(a => isYesterday(a.appliedAt)).length;
  const last7DaysAppCount = validApplications.filter(a => isLast7Days(a.appliedAt)).length;
  const thisMonthAppCount = validApplications.filter(a => isThisMonth(a.appliedAt)).length;
  const customAppCount = validApplications.filter(a => isInCustomDateRange(a.appliedAt, appCustomStartDate, appCustomEndDate)).length;

  // Filtered applications (Admin-style full suite)
  const filteredApps = validApplications.filter(app => {
    // 1. Date Filter
    if (appDateFilter === 'today' && !isToday(app.appliedAt)) return false;
    if (appDateFilter === 'yesterday' && !isYesterday(app.appliedAt)) return false;
    if (appDateFilter === 'last7' && !isLast7Days(app.appliedAt)) return false;
    if (appDateFilter === 'thisMonth' && !isThisMonth(app.appliedAt)) return false;
    if (appDateFilter === 'custom' && (appCustomStartDate || appCustomEndDate) && !isInCustomDateRange(app.appliedAt, appCustomStartDate, appCustomEndDate)) return false;

    // 2. Status Filter
    if (appStatusFilter !== 'all') {
      const s = String(app.status || '').toLowerCase().trim();
      const f = appStatusFilter.toLowerCase().trim();
      if (f === 'processing') {
        const procStatuses = ['applied', 'shortlisted', 'follow up', 'under review', 'hr screening', 'processing', 'pending'];
        if (!procStatuses.includes(s) || s.includes('interview') || s.includes('document')) return false;
      } else if (f === 'selected') {
        if (!['selected', 'converted', 'joined'].includes(s)) return false;
      } else if (f === 'document submission') {
        const isDoc = ['document submission', 'document submitted', 'documents submitted', 'documents submission', 'document verification'].includes(s) || s.includes('document');
        if (!isDoc) return false;
      } else {
        if (s !== f) return false;
      }
    }

    // 3. Team Leader Filter
    if (appTlFilter !== 'all') {
      const tl = tls.find(t => t.id === appTlFilter || t.name === appTlFilter);
      const matchesTl = tl && (app.referringTlId === tl.id || app.referringTlName === tl.name);
      if (!matchesTl) return false;
    }

    // 4. Branch HR Filter
    if (appHrFilter !== 'all') {
      const ref = String(app.referredBy || '').toLowerCase();
      const hr = hrs.find(h => String(h.referralCode || '').toLowerCase() === appHrFilter.toLowerCase() || h.id === appHrFilter);
      const matchesHr = hr && (ref === String(hr.referralCode || '').toLowerCase());
      if (!matchesHr) return false;
    }

    // 5. Search Filter
    if (appSearch.trim()) {
      const q = appSearch.toLowerCase().trim();
      const matchName = (app.candidateName || '').toLowerCase().includes(q);
      const matchEmail = (app.candidateEmail || '').toLowerCase().includes(q);
      const matchMobile = (app.candidateMobile || '').toLowerCase().includes(q);
      const matchAppNo = (app.applicationNumber || app.id || '').toLowerCase().includes(q);
      const matchJob = (app.jobTitle || '').toLowerCase().includes(q);
      const matchCompany = (app.companyName || '').toLowerCase().includes(q);
      const matchHr = (app.referringHrName || '').toLowerCase().includes(q);
      const matchTl = (app.referringTlName || '').toLowerCase().includes(q);
      const matchRef = (app.referredBy || '').toLowerCase().includes(q);

      if (!matchName && !matchEmail && !matchMobile && !matchAppNo && !matchJob && !matchCompany && !matchHr && !matchTl && !matchRef) {
        return false;
      }
    }

    return true;
  });

  const exportToCSV = () => {
    if (!filteredApps || !filteredApps.length) return;
    const headers = ['App ID', 'Candidate Name', 'Mobile', 'Email', 'Job Title', 'Company', 'Referred By (HR)', 'Team Leader', 'Status', 'Incentive', 'Date Applied'];
    const rows = filteredApps.map(app => [
      app.applicationNumber || app.id,
      app.candidateName,
      app.candidateMobile || 'N/A',
      app.candidateEmail || 'N/A',
      app.jobTitle,
      app.companyName,
      app.referringHrName || 'Direct',
      app.referringTlName || 'N/A',
      app.status,
      `₹${(Number(app.incentiveAmount) || 1000).toLocaleString('en-IN')}`,
      app.appliedAt ? `${new Date(app.appliedAt).toLocaleDateString('en-IN')} ${new Date(app.appliedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}` : 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `branch_applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const branchInterviews = applications.filter(app => {
    const s = String(app.status || '').toLowerCase().trim();
    if (['rejected', 'not interested', 'cancelled', 'payment pending', 'unpaid', 'selected', 'joined', 'converted'].includes(s)) return false;
    if (s.includes('document')) return false;
    return s.includes('interview') || (app.interviewDate && !s.includes('reject') && !s.includes('select'));
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

  const handleOpenHrCandidates = (hr, statusFilter = 'all') => {
    let hrApps = validApplications.filter(app => String(app.referredBy || '').toUpperCase() === String(hr.referralCode || '').toUpperCase());
    if (statusFilter === 'closed') {
      const CLOSED_STATUSES = ['closed', 'joined', 'converted', 'hired', 'joined manipal', 'enrollment', 'selected'];
      hrApps = hrApps.filter(app => {
        const s = String(app.status || '').toLowerCase().trim();
        if (s.includes('reject') || s.includes('not interested') || s.includes('drop') || s.includes('pending') || s.includes('interviewing') || s.includes('shortlist')) return false;
        return CLOSED_STATUSES.includes(s) || s.includes('select') || s.includes('closed') || s.includes('joined') || s.includes('hired') || s.includes('convert') || s.includes('enroll');
      });
    } else if (statusFilter === 'Selected') {
      hrApps = hrApps.filter(app => String(app.status || '').toLowerCase().trim().includes('select'));
    }
    setActiveTab('team_leaders');
    setSelectedTlId(null);
    setSelectedHrForCandidateBreakdown({
      ...hr,
      hrName: hr.name,
      applications: hrApps
    });
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
          className={`nav-item ${activeTab === 'it_projects' ? 'active' : ''}`}
          onClick={() => handleTabChange('it_projects')}
        >
          <Code size={18} /> IT Team & Projects
        </button>

        <button
          className={`nav-item ${activeTab === 'incentives' ? 'active' : ''}`}
          onClick={() => handleTabChange('incentives')}
        >
          <Gift size={18} /> Incentives & Payouts
        </button>

        <button
          className={`nav-item ${activeTab === 'offers_targets' ? 'active' : ''}`}
          onClick={() => handleTabChange('offers_targets')}
        >
          <Flame size={18} color="#f97316" /> Offers & Targets 🔥
        </button>

        {canAccessManipalPayout && (
          <button
            className={`nav-item ${activeTab === 'manipal_payout' ? 'active' : ''}`}
            onClick={() => handleTabChange('manipal_payout')}
          >
            <Wallet size={18} /> Manipal Payout ({manipalPayoutCandidates.length})
          </button>
        )}

        {onLogout && (
          <button
            className="nav-item logout-nav-item"
            onClick={() => {
              if (setSidebarOpen) setSidebarOpen(false);
              onLogout();
            }}
            style={{
              marginTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '0.85rem',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        )}
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
            {/* KPI Cards Row (2 Grid on Mobile, Auto-fit on Desktop) */}
            <div className="dashboard-kpi-grid">
              {/* 1. Applications Received (First) */}
              <div 
                className="dashboard-kpi-card"
                style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => handleTabChange('applications')}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#78350f', textTransform: 'uppercase' }}>Applications Received</span>
                  <div className="dashboard-kpi-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} color="#d97706" />
                  </div>
                </div>
                <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#78350f' }}>{validApplications.length}</div>
                <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>Branch Pipeline</span>
              </div>

              {/* 2. Total Candidates */}
              <div 
                className="dashboard-kpi-card"
                style={{ background: '#f0fdfa', border: '1px solid #5eead4', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => handleTabChange('applications')}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#134e4a', textTransform: 'uppercase' }}>Total Candidates</span>
                  <div className="dashboard-kpi-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} color="#0d9488" />
                  </div>
                </div>
                <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#134e4a' }}>{branchCandidatesCount}</div>
                <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 600 }}>In Branch Talent Pool</span>
              </div>

              {/* 3. Processing */}
              <div 
                className="dashboard-kpi-card"
                style={{ background: '#e0e7ff', border: '1px solid #a5b4fc', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => { handleTabChange('applications'); setAppStatusFilter('Processing'); }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#312e81', textTransform: 'uppercase' }}>Processing</span>
                  <div className="dashboard-kpi-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RefreshCw size={18} color="#4f46e5" />
                  </div>
                </div>
                <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#312e81' }}>{branchProcessingCount}</div>
                <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#4338ca', fontWeight: 600 }}>Active in Pipeline</span>
              </div>

              {/* 4. Interviews Scheduled */}
              <div 
                className="dashboard-kpi-card"
                style={{ background: '#fdf4ff', border: '1px solid #f0abfc', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => handleTabChange('interviews')}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#701a75', textTransform: 'uppercase' }}>Interviews Scheduled</span>
                  <div className="dashboard-kpi-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fae8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CalendarDays size={18} color="#c026d3" />
                  </div>
                </div>
                <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#701a75' }}>{branchInterviews.length}</div>
                <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#a21caf', fontWeight: 600 }}>Interviews Lineup</span>
              </div>

              {/* 5. Document Submission */}
              <div 
                className="dashboard-kpi-card"
                style={{ background: '#ecfeff', border: '1px solid #67e8f9', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => { handleTabChange('applications'); setAppStatusFilter('Document Submission'); }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#164e63', textTransform: 'uppercase' }}>Document Submission</span>
                  <div className="dashboard-kpi-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#cffafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileCheck size={18} color="#0891b2" />
                  </div>
                </div>
                <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#164e63' }}>
                  {validApplications.filter(a => {
                    const s = String(a.status || '').toLowerCase().trim();
                    const isDoc = ['document submission', 'document submitted', 'documents submitted', 'documents submission', 'document verification'].includes(s) || s.includes('document');
                    const hasDocInt = (branchInterviews || []).some(int => int.applicationId === a.id && String(int.status || '').toLowerCase().includes('document'));
                    return isDoc || hasDocInt;
                  }).length}
                </div>
                <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#0e7490', fontWeight: 600 }}>Verification Stage</span>
              </div>

              {/* 6. Selected / Placed */}
              <div 
                className="dashboard-kpi-card"
                style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => { handleTabChange('applications'); setAppStatusFilter('Selected'); }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#064e3b', textTransform: 'uppercase' }}>Selected</span>
                  <div className="dashboard-kpi-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={18} color="#059669" />
                  </div>
                </div>
                <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#064e3b' }}>{branchClosedApps.length}</div>
                <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Successful Placements</span>
              </div>

              {/* 6. Rejected */}
              <div 
                className="dashboard-kpi-card"
                style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => { handleTabChange('applications'); setAppStatusFilter('Rejected'); }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Rejected</span>
                  <div className="dashboard-kpi-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={18} color="#dc2626" />
                  </div>
                </div>
                <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#991b1b' }}>{branchRejectedCount}</div>
                <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 600 }}>Archived / Rejected</span>
              </div>

              {/* 7. Team Leaders */}
              <div 
                className="dashboard-kpi-card"
                style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => handleTabChange('team_leaders')}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>Team Leaders</span>
                  <div className="dashboard-kpi-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} color="#0284c7" />
                  </div>
                </div>
                <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0369a1' }}>{kpis.totalTls}</div>
                <div className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                  {kpis.approvedTls} Approved • {kpis.totalHrs} HRs
                </div>
              </div>

              {/* 8. HR Upcoming Incentives */}
              <div 
                className="dashboard-kpi-card"
                style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => handleTabChange('incentives')}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#78350f', textTransform: 'uppercase' }}>Upcoming Pool</span>
                  <div className="dashboard-kpi-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Gift size={18} color="#b45309" />
                  </div>
                </div>
                <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#78350f' }}>₹{totalBranchIncentives.toLocaleString('en-IN')}</div>
                <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>Branch Expected</span>
              </div>

              {/* 9. Manipal Payout Status (Only if Admin gave permission) */}
              {canAccessManipalPayout && (
                <div 
                  className="dashboard-kpi-card"
                  style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #86efac',
                    padding: '1.25rem',
                    borderRadius: '14px',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.08)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={() => handleTabChange('manipal_payout')}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 800, color: '#14532d', textTransform: 'uppercase' }}>
                      Manipal Payout Status
                    </span>
                    <div className="dashboard-kpi-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Wallet size={18} color="#15803d" />
                    </div>
                  </div>
                  <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#14532d' }}>
                    {manipalPayoutCandidates.length}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      ✓ Paid: {manipalPaidCount}
                    </span>
                    <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      ⏳ Pending: {manipalPendingCount}
                    </span>
                  </div>
                </div>
              )}
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

            {/* 2 Leadership Boards: Top Applications Received & Top Closers (Branch HRs Only) */}
            {(() => {
              const CLOSED_STATUSES = ['closed', 'joined', 'converted', 'hired', 'joined manipal', 'enrollment', 'selected'];
              const hrStats = hrs.map(hr => {
                const hrCode = hr.referralCode;
                const hrApps = validApplications.filter(app => String(app.referredBy || '').toUpperCase() === String(hrCode || '').toUpperCase());
                const closedApps = hrApps.filter(app => {
                  const s = String(app.status || '').toLowerCase().trim();
                  if (s.includes('reject') || s.includes('not interested') || s.includes('drop') || s.includes('pending') || s.includes('interviewing') || s.includes('shortlist')) return false;
                  return CLOSED_STATUSES.includes(s) || s.includes('select') || s.includes('closed') || s.includes('joined') || s.includes('hired') || s.includes('convert') || s.includes('enroll');
                });
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {/* Top Applications Received Card */}
                  <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        🚀 Top Applications Received <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>({topSourcers.length} Branch HRs)</span>
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>Ranked by total applications sourced from this branch</p>
                    </div>
                    {topSourcers.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>No HRs found in this branch yet.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '6px' }}>
                        {topSourcers.map((hr, idx) => {
                          const isScored = Number(hr.totalSourced || 0) > 0;
                          return (
                            <div
                              key={hr.id || idx}
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
                                  color: isScored ? '#0284c7' : '#94a3b8',
                                  background: isScored ? '#e0f2fe' : '#f1f5f9',
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
                        🏆 Top Closers <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>({topClosers.length} Branch HRs - Selected & Closed)</span>
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>Ranked by selected & closed candidates</p>
                    </div>
                    {topClosers.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>No HRs found in this branch yet.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '6px' }}>
                        {topClosers.map((hr, idx) => {
                          const isScored = Number(hr.totalClosed || 0) > 0;
                          return (
                            <div
                              key={hr.id || idx}
                              onClick={() => handleOpenHrCandidates(hr, 'closed')}
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
                      Upcoming Candidates for {selectedHrForCandidateBreakdown.hrName || selectedHrForCandidateBreakdown.name || 'HR'}
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
                              ₹{(Number(app.incentiveAmount) || 1000).toLocaleString('en-IN')}
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
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Branch HR Executives ({hrs.length})</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  Manage HR executives assigned under your branch and Team Leaders.
                </p>
              </div>
              <button
                onClick={() => { setHrModalOpen(true); setHrError(''); setHrSuccessMsg(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)' }}
              >
                <UserPlus size={16} /> Add New HR
              </button>
            </div>

            {hrSuccessMsg && (
              <div style={{ margin: '1rem 1.5rem 0 1.5rem', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '10px 14px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
                ✅ {hrSuccessMsg}
              </div>
            )}

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
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hrs.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No HRs added under your branch yet. Click <strong>+ Add New HR</strong> to create your first HR!
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
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDeleteHr(hr.id, hr.name)}
                            title="Remove HR from branch"
                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                          >
                            Remove
                          </button>
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
            {/* Header with Title, Counts, and Export */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Branch Candidate Applications
                  </h3>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: '14px' }}>
                    {filteredApps.length} shown
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
                    (Total: {validApplications.length})
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  All candidate applications referred through your branch HRs & Team Leaders.
                </p>
              </div>

              <button
                onClick={exportToCSV}
                className="btn-primary"
                style={{
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Download size={15} /> Export CSV
              </button>
            </div>

            {/* Date Range Filter Chips Bar */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '12px 1.5rem', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
              <button
                onClick={() => setAppDateFilter('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: appDateFilter === 'all' ? '#0f172a' : '#f1f5f9',
                  color: appDateFilter === 'all' ? 'white' : '#475569',
                  transition: 'all 0.2s'
                }}
              >
                🌐 All Time ({validApplications.length})
              </button>
              <button
                onClick={() => setAppDateFilter('today')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: appDateFilter === 'today' ? '#059669' : '#ecfdf5',
                  color: appDateFilter === 'today' ? 'white' : '#047857',
                  transition: 'all 0.2s',
                  boxShadow: appDateFilter === 'today' ? '0 4px 6px -1px rgba(5,150,105,0.3)' : 'none'
                }}
              >
                📅 Today ({todayAppCount})
              </button>
              <button
                onClick={() => setAppDateFilter('yesterday')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: appDateFilter === 'yesterday' ? '#d97706' : '#fffbeb',
                  color: appDateFilter === 'yesterday' ? 'white' : '#b45309',
                  transition: 'all 0.2s',
                  boxShadow: appDateFilter === 'yesterday' ? '0 4px 6px -1px rgba(217,119,6,0.3)' : 'none'
                }}
              >
                📅 Yesterday ({yesterdayAppCount})
              </button>
              <button
                onClick={() => setAppDateFilter('last7')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: appDateFilter === 'last7' ? '#7c3aed' : '#f5f3ff',
                  color: appDateFilter === 'last7' ? 'white' : '#6d28d9',
                  transition: 'all 0.2s'
                }}
              >
                🗓️ Last 7 Days ({last7DaysAppCount})
              </button>
              <button
                onClick={() => setAppDateFilter('thisMonth')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: appDateFilter === 'thisMonth' ? '#0891b2' : '#ecfeff',
                  color: appDateFilter === 'thisMonth' ? 'white' : '#0e7490',
                  transition: 'all 0.2s'
                }}
              >
                📆 This Month ({thisMonthAppCount})
              </button>
              <button
                onClick={() => setAppDateFilter('custom')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: appDateFilter === 'custom' ? '#0284c7' : '#f0f9ff',
                  color: appDateFilter === 'custom' ? 'white' : '#0369a1',
                  transition: 'all 0.2s',
                  boxShadow: appDateFilter === 'custom' ? '0 4px 6px -1px rgba(2,132,199,0.3)' : 'none'
                }}
              >
                📑 Custom Range {appDateFilter === 'custom' && (appCustomStartDate || appCustomEndDate) ? `(${customAppCount})` : ''}
              </button>
            </div>

            {/* Custom Date Range Picker (Bank Statement Style) */}
            {appDateFilter === 'custom' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 1.5rem',
                background: '#f0f9ff',
                borderBottom: '1px solid #bae6fd',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  📑 Bank Statement Range:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>From Date:</label>
                  <input
                    type="date"
                    value={appCustomStartDate}
                    onChange={(e) => setAppCustomStartDate(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', background: 'white' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>To Date:</label>
                  <input
                    type="date"
                    value={appCustomEndDate}
                    onChange={(e) => setAppCustomEndDate(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', background: 'white' }}
                  />
                </div>
                {(appCustomStartDate || appCustomEndDate) && (
                  <button
                    onClick={() => {
                      setAppCustomStartDate('');
                      setAppCustomEndDate('');
                    }}
                    style={{ padding: '5px 10px', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', cursor: 'pointer' }}
                  >
                    Clear Dates
                  </button>
                )}
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0284c7', marginLeft: 'auto' }}>
                  Total in Range: <strong>{customAppCount}</strong> applications
                </span>
              </div>
            )}

            {/* Advanced Search & Dropdown Filters Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', padding: '14px 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Search Candidate / App</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px' }}>
                  <Search size={14} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Search name, phone, job..."
                    value={appSearch}
                    onChange={e => setAppSearch(e.target.value)}
                    style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem', width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Filter By Status</label>
                <select
                  value={appStatusFilter}
                  onChange={e => setAppStatusFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.85rem', fontWeight: 600, color: '#334155', outline: 'none' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="processing">Processing</option>
                  <option value="applied">Applied</option>
                  <option value="under review">Under Review</option>
                  <option value="interview scheduled">Interview Scheduled</option>
                  <option value="Document Submission">Document Submission</option>
                  <option value="selected">Selected / Joined</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Filter By Team Leader</label>
                <select
                  value={appTlFilter}
                  onChange={e => {
                    setAppTlFilter(e.target.value);
                    setAppHrFilter('all');
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.85rem', fontWeight: 600, color: '#334155', outline: 'none' }}
                >
                  <option value="all">All Team Leaders ({tls.length})</option>
                  {tls.map(t => (
                    <option key={t.id} value={t.id}>
                      👔 {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Filter By Branch HR</label>
                <select
                  value={appHrFilter}
                  onChange={e => setAppHrFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.85rem', fontWeight: 600, color: '#334155', outline: 'none' }}
                >
                  <option value="all">All Branch HRs ({hrs.length})</option>
                  {(appTlFilter === 'all' ? hrs : hrs.filter(h => h.teamLeaderId === appTlFilter)).map(h => (
                    <option key={h.id} value={h.referralCode || h.id}>
                      👤 {h.name} ({h.referralCode})
                    </option>
                  ))}
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
                          <span 
                            onClick={() => { setStatusModalApp(app); setNewAppStatus(app.status || 'Applied'); }}
                            style={{
                              cursor: 'pointer',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              background: String(app.status || '').toLowerCase() === 'joined manipal' ? '#dcfce7' : (['selected', 'joined'].includes(String(app.status || '').toLowerCase()) ? '#ecfdf5' : '#eff6ff'),
                              color: String(app.status || '').toLowerCase() === 'joined manipal' ? '#047857' : (['selected', 'joined'].includes(String(app.status || '').toLowerCase()) ? '#059669' : '#1e40af'),
                              border: String(app.status || '').toLowerCase() === 'joined manipal' ? '1px solid #86efac' : 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Click to update status"
                          >
                            {app.status === 'Joined Manipal' ? '🎓 Joined Manipal' : (app.status || 'Applied')} ✎
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
        ) : activeTab === 'incentives' ? (
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
        ) : activeTab === 'it_projects' ? (
          /* TAB 6: IT TEAM & PROJECTS WITH EMAIL PROOF & COUNTDOWN */
          <BranchItProjectsTab API_URL={API_URL} currentUser={currentUser} />
        ) : activeTab === 'manipal_payout' && canAccessManipalPayout ? (
          /* TAB 7: MANIPAL PAYOUT STATUS */
          <ManipalPayoutManager
            API_URL={API_URL}
            applications={payoutApps}
            interviews={branchInterviews}
            companies={[]}
            onUpdateApplication={() => {
              fetchOverview();
              if (canAccessManipalPayout) {
                fetch(`${API_URL}/api/applications`)
                  .then(r => r.ok ? r.json() : [])
                  .then(a => setAllApplications(a));
              }
            }}
            onBack={() => handleTabChange('overview')}
          />
        ) : null}

        {activeTab === 'offers_targets' && (
          <OffersAndTargetsView API_URL={API_URL} currentUser={currentUser} />
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

      {/* Quick Status Update Modal for Branch Manager */}
      {statusModalApp && (
        <div className="modal-overlay" onClick={() => setStatusModalApp(null)}>
          <div className="modal-content animate-fade" style={{ maxWidth: '420px', background: '#fff', borderRadius: '12px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>Update Application Status</h3>
              <button className="btn-close" style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setStatusModalApp(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                Candidate: <strong style={{ color: '#0f172a' }}>{statusModalApp.candidateName}</strong><br />
                Job: <strong>{statusModalApp.jobTitle}</strong> ({statusModalApp.companyName})
              </div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Select Status</label>
                <select 
                  className="form-select"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  value={newAppStatus}
                  onChange={e => setNewAppStatus(e.target.value)}
                >
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="HR Screening">HR Screening</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Document Submission">Document Submission</option>
                  <option value="Selected">Selected</option>
                  <option value="Closed" style={{ fontWeight: 'bold', color: '#059669' }}>🔒 Closed</option>
                  <option value="Joined Manipal" style={{ fontWeight: 'bold', color: '#059669' }}>🎓 Joined Manipal</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }} onClick={() => setStatusModalApp(null)} disabled={savingStatus}>Cancel</button>
                <button className="btn-primary" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 700, cursor: savingStatus ? 'not-allowed' : 'pointer' }} onClick={handleUpdateStatus} disabled={savingStatus}>
                  {savingStatus ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add HR Modal for Branch Manager */}
      {hrModalOpen && (
        <div className="modal-overlay" onClick={() => setHrModalOpen(false)}>
          <div className="modal-content animate-fade" style={{ maxWidth: '480px', background: '#fff', borderRadius: '16px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Add New HR Executive</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#d1fae5' }}>Create login credentials for HR under {currentUser.branch || 'Branch'}</p>
              </div>
              <button onClick={() => setHrModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#fff' }}>✕</button>
            </div>

            <form onSubmit={handleCreateHr} style={{ padding: '1.5rem' }}>
              {hrError && (
                <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', border: '1px solid #fecaca' }}>
                  ⚠️ {hrError}
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={hrForm.name}
                  onChange={e => setHrForm({ ...hrForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="hr@example.com"
                  value={hrForm.email}
                  onChange={e => setHrForm({ ...hrForm, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Create secure password"
                  value={hrForm.password}
                  onChange={e => setHrForm({ ...hrForm, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={hrForm.mobile}
                  onChange={e => setHrForm({ ...hrForm, mobile: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Assign to Team Leader</label>
                <select
                  value={hrForm.teamLeaderId}
                  onChange={e => setHrForm({ ...hrForm, teamLeaderId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#fff' }}
                >
                  <option value="">Direct under Branch Manager (No TL)</option>
                  {tls.map(tl => (
                    <option key={tl.id} value={tl.id}>
                      {tl.name} ({tl.branch || currentUser.branch || 'Branch'}) - {tl.approvalStatus === 'approved' ? 'Approved' : 'Pending'}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Optionally select which Team Leader this HR reports to, or leave direct under branch.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setHrModalOpen(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={hrSaving}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 700, cursor: hrSaving ? 'not-allowed' : 'pointer' }}
                >
                  {hrSaving ? 'Creating HR...' : 'Create HR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
