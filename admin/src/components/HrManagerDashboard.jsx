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
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'applied' | 'interviews' | 'hrs' | 'branches_teams' | 'offers_targets'
  const [data, setData] = useState(null);
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
      const res = await fetch(`${API_URL}/api/users/hr-managers/${currentUser.id}/overview`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
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
  const applications = data?.applications || [];
  const kpis = data?.kpis || {
    totalBranches: branches.length,
    totalTls: teamLeaders.length,
    totalHrs: hrs.length,
    totalApplications: applications.length,
    selectedCandidates: 0,
    interviewCandidates: 0,
    processingCandidates: 0
  };

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
        (app.referringHrName || '').toLowerCase().includes(q);

      const matchesBranch =
        branchFilter === 'all' ||
        String(app.branchName || '').toLowerCase() === branchFilter.toLowerCase();

      const matchesTl =
        tlFilter === 'all' ||
        String(app.referringTlId || '') === tlFilter ||
        String(app.referringTlName || '').toLowerCase() === tlFilter.toLowerCase();

      const matchesHr =
        hrFilter === 'all' ||
        String(app.referringHrCode || '').toLowerCase() === hrFilter.toLowerCase();

      const matchesStatus =
        statusFilter === 'all' ||
        String(app.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesBranch && matchesTl && matchesHr && matchesStatus;
    });
  }, [dateFilteredApplications, appSearch, branchFilter, tlFilter, hrFilter, statusFilter]);

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

  // Interviews List
  const interviewsList = useMemo(() => {
    return applications.filter((app) => {
      const s = String(app.status || '').toLowerCase().trim();
      if (['rejected', 'not interested', 'cancelled', 'payment pending', 'unpaid', 'selected', 'joined'].includes(s)) {
        return false;
      }
      return s.includes('interview') || app.interviewDate;
    });
  }, [applications]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'applied', label: `Applied (${applications.length})`, icon: FileText },
    { id: 'interviews', label: `Interviews (${interviewsList.length})`, icon: CalendarDays },
    { id: 'hrs', label: `Executive HRs (${hrs.length})`, icon: Users },
    { id: 'branches_teams', label: `Branches & Teams (${branches.length})`, icon: ShieldCheck },
    { id: 'offers_targets', label: 'Offers & Targets 🔥', icon: Flame },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '260px',
          background: '#0a1120',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
          flexShrink: 0,
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="FIC Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#ffffff', fontWeight: 900, fontSize: '1.05rem' }}>FIC </span>
              <span style={{ color: '#f59e0b', fontWeight: 900, fontSize: '1.05rem' }}>RecruitPro</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#60a5fa', fontWeight: 800, letterSpacing: '0.5px' }}>
              HR MANAGEMENT HUB
            </div>
          </div>
        </div>

        {/* User Card */}
        <div style={{ padding: '1rem', borderBottom: '1px solid #1e293b', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Logged In As</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>{currentUser.name}</div>
          <div style={{ display: 'inline-block', background: '#1e3a8a', color: '#93c5fd', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800, marginTop: '4px' }}>
            🏢 Central HR Manager
          </div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>
            Overseeing All Branches
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
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
                  marginBottom: '4px',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#1e293b';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={18} color={isActive ? '#ffffff' : '#94a3b8'} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1e293b' }}>
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
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '1.75rem 2rem', overflowX: 'hidden' }}>
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
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa' }}>{branches.length}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Branches</div>
                      </div>
                      <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)' }} />
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a78bfa' }}>{teamLeaders.length}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Team Leaders</div>
                      </div>
                      <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)' }} />
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>{hrs.length}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Executive HRs</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6 Top KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '1.75rem' }}>
                  <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1.5px solid #bfdbfe', borderTop: '4px solid #2563eb' }}>
                    <div style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase' }}>Total Branches</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1e3a8a', margin: '4px 0' }}>{branches.length}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Active operations</div>
                  </div>

                  <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1.5px solid #ddd6fe', borderTop: '4px solid #7c3aed' }}>
                    <div style={{ fontSize: '0.78rem', color: '#6d28d9', fontWeight: 800, textTransform: 'uppercase' }}>Executive HRs</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#5b21b6', margin: '4px 0' }}>{hrs.length}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Across all teams</div>
                  </div>

                  <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1.5px solid #fed7aa', borderTop: '4px solid #ea580c' }}>
                    <div style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 800, textTransform: 'uppercase' }}>Total Applications</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#9a3412', margin: '4px 0' }}>{applications.length}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Submitted candidates</div>
                  </div>

                  <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1.5px solid #bbf7d0', borderTop: '4px solid #16a34a' }}>
                    <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase' }}>Selected / Placed</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#14532d', margin: '4px 0' }}>{kpis.selectedCandidates}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Hired candidates</div>
                  </div>

                  <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1.5px solid #e9d5ff', borderTop: '4px solid #9333ea' }}>
                    <div style={{ fontSize: '0.78rem', color: '#7e22ce', fontWeight: 800, textTransform: 'uppercase' }}>Interviews</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#6b21a8', margin: '4px 0' }}>{interviewsList.length}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Live assessment rounds</div>
                  </div>

                  <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1.5px solid #fef08a', borderTop: '4px solid #eab308' }}>
                    <div style={{ fontSize: '0.78rem', color: '#a16207', fontWeight: 800, textTransform: 'uppercase' }}>In Screening</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#854d0e', margin: '4px 0' }}>{kpis.processingCandidates}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Under review</div>
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
                    <option value="all">All Statuses</option>
                    <option value="applied">Applied</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview">Interview Scheduled</option>
                    <option value="selected">Selected / Hired</option>
                    <option value="rejected">Rejected</option>
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
                  <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
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
                <div style={{ marginBottom: '14px' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Scheduled Interviews ({interviewsList.length})
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                    Live candidate interview rounds scheduled across all company branches.
                  </p>
                </div>

                {interviewsList.length === 0 ? (
                  <div style={{ background: '#ffffff', borderRadius: '14px', padding: '3rem', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
                    <CalendarDays size={36} style={{ margin: '0 auto 10px auto', color: '#cbd5e1' }} />
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>No active interviews scheduled</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                    {interviewsList.map((app) => (
                      <div key={app.id} style={{ background: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1.5px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{app.candidateName}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.candidateEmail} • {app.candidateMobile}</div>
                          </div>
                          <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                            INTERVIEW
                          </span>
                        </div>

                        <div style={{ marginTop: '10px', background: '#f5f3ff', borderLeft: '3px solid #7c3aed', padding: '10px', borderRadius: '6px' }}>
                          <div style={{ fontWeight: 800, color: '#6d28d9', fontSize: '0.85rem' }}>
                            🗓 {app.interviewDate ? new Date(app.interviewDate).toLocaleString() : 'Date Pending'}
                          </div>
                          {app.interviewRound && (
                            <div style={{ fontSize: '0.75rem', color: '#5b21b6', marginTop: '2px' }}>Round: {app.interviewRound}</div>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '0.78rem' }}>
                          <span style={{ color: '#1d4ed8', fontWeight: 700 }}>🏢 {app.branchName || 'General'}</span>
                          <span style={{ color: '#64748b' }}>HR: {app.referringHrName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

                <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
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
