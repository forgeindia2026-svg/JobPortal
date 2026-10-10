import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, FolderTree, Building2, Briefcase, Users, FileText, Gift, Check, X,
  Calendar, CalendarDays, BarChart3, Plus, Edit, Trash2, ExternalLink, RefreshCw, XCircle, GraduationCap, UserPlus, Download, CheckCircle, CreditCard
} from 'lucide-react';

import JobFormModal from './JobFormModal';
import CategoryFormModal from './CategoryFormModal';
import CompanyFormModal from './CompanyFormModal';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import ItTrainingModal from './ItTrainingModal';
import ManualApplicationModal from './ManualApplicationModal';
import AgentsManager from './AgentsManager';

export default function AdminDashboard({ API_URL, currentUser, sidebarOpen, setSidebarOpen }) {
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });
  const [paymentSubTab, setPaymentSubTab] = useState('success');

  useEffect(() => {
    if (window.location.hash.replace('#', '') !== activeTab) {
      window.history.pushState(null, '', `#${activeTab}`);
    }
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      setActiveTab(hash || 'dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const [kpis, setKpis] = useState(null);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [itProcesses, setItProcesses] = useState([]);
  const [globalItIncentives, setGlobalItIncentives] = useState({});
  const [hrs, setHrs] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  
  const [bankInfoModal, setBankInfoModal] = useState(null);

  const getAppPaymentAmount = (app) => {
    if (app.paymentAmount && Number(app.paymentAmount) > 0) {
      return Number(app.paymentAmount);
    }
    const title = (app.jobTitle || app.title || '').toLowerCase();
    const company = (app.companyName || '').toLowerCase();
    if (title.includes('casa')) return 149;
    if (title.includes('free') || title.includes('internship') || company.includes('free') || company.includes('internship')) return 0;
    if (app.isFicFlow) return 1499;
    return 49;
  };

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState(null);

  const [itModalOpen, setItModalOpen] = useState(false);
  const [itProcessToEdit, setItProcessToEdit] = useState(null);

  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [appToSchedule, setAppToSchedule] = useState(null);

  const [statusModalApp, setStatusModalApp] = useState(null);
  const [newAppStatus, setNewAppStatus] = useState('');
  const [adminNoteInput, setAdminNoteInput] = useState('');

  const [hrModalOpen, setHrModalOpen] = useState(false);
  const [hrToEdit, setHrToEdit] = useState(null);
  const [hrForm, setHrForm] = useState({ name: '', email: '', password: '', mobile: '', profilePhoto: '' });
  const [hrSaving, setHrSaving] = useState(false);
  const [hrError, setHrError] = useState('');

  const [incentiveModalOpen, setIncentiveModalOpen] = useState(false);
  const [selectedHrForIncentive, setSelectedHrForIncentive] = useState(null);
  const [incentiveInput, setIncentiveInput] = useState({}); // { [applicationId]: amount }
  const [incentiveSaving, setIncentiveSaving] = useState(false);
  const [incentiveError, setIncentiveError] = useState('');

  // Closed candidates (Selected / Joined) referred by an HR — incentive is given per candidate
  const CLOSED_STATUSES = ['selected', 'joined'];
  const getHrClosedApps = (hr) => {
    if (!hr) return [];
    const code = String(hr.referralCode || '').toLowerCase();
    const agentCodes = Array.isArray(hr.agentCodes) ? hr.agentCodes : [];
    const allCodes = [code, ...agentCodes];
    
    return applications.filter(app => {
      const ref = String(app.referredBy || '').toLowerCase();
      return allCodes.includes(ref) && CLOSED_STATUSES.includes(String(app.status || '').toLowerCase());
    });
  };

  const [activeItCategoryTab, setActiveItCategoryTab] = useState('Placement');


  const [hrRefModalApp, setHrRefModalApp] = useState(null);
  const [selectedHrRef, setSelectedHrRef] = useState('');
  const [savingHrRef, setSavingHrRef] = useState(false);

  const [appDateFilter, setAppDateFilter] = useState('all');
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [appHrFilter, setAppHrFilter] = useState('all');

  const [manualAppModalOpen, setManualAppModalOpen] = useState(false);
  const [selectedHrForPartners, setSelectedHrForPartners] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Main data fetches - critical for dashboard
      const [kpiRes, catRes, compRes, jobsRes, appsRes, intRes, itRes, globalItRes] = await Promise.all([
        fetch(`${API_URL}/api/reports/dashboard`),
        fetch(`${API_URL}/api/categories`),
        fetch(`${API_URL}/api/companies`),
        fetch(`${API_URL}/api/jobs`),
        fetch(`${API_URL}/api/applications`),
        fetch(`${API_URL}/api/interviews`),
        fetch(`${API_URL}/api/it-training-processes/all`),
        fetch(`${API_URL}/api/settings/it-training-incentives`)
      ]);

      const kpiData = await kpiRes.json();
      const catData = await catRes.json();
      const compData = await compRes.json();
      const jobsData = await jobsRes.json();
      const appsData = await appsRes.json();
      const intData = await intRes.json();
      const itData = await itRes.json();
      const globalItResData = await globalItRes.json();

      setKpis(kpiData);
      setCategories(Array.isArray(catData) ? catData : []);
      setCompanies(Array.isArray(compData) ? compData : []);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setApplications(Array.isArray(appsData) ? appsData.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)) : []);

      const rawInterviews = Array.isArray(intData) ? intData : [];
      const uniqueInterviewsMap = new Map();
      for (const item of rawInterviews) {
        const key = `${item.applicationId || item.candidateId || item.candidateName}_${item.round || 'round'}`;
        if (!uniqueInterviewsMap.has(key)) {
          uniqueInterviewsMap.set(key, item);
        }
      }
      setInterviews(Array.from(uniqueInterviewsMap.values()));
      setItProcesses(Array.isArray(itData) ? itData : []);
      setGlobalItIncentives(globalItResData || {});
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }

    // HR fetch - separate so it doesn't break main dashboard if endpoint is missing
    try {
      const [hrRes, agentsRes] = await Promise.all([
        fetch(`${API_URL}/api/users/hr`),
        fetch(`${API_URL}/api/users/agents/all`)
      ]);
            if (hrRes.ok) {
        const hrData = await hrRes.json();
        const storedPhotos = (() => {
          try { return JSON.parse(localStorage.getItem('hr_profile_photos') || '{}'); } catch { return {}; }
        })();
        const mergedHrs = (Array.isArray(hrData) ? hrData : []).map(hr => ({
          ...hr,
          profilePhoto: hr.profilePhoto || storedPhotos[hr.id] || ''
        }));
        setHrs(mergedHrs);
      }
      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        setAllAgents(Array.isArray(agentsData) ? agentsData : []);
      }
    } catch (err) {
      console.warn('User endpoints not available yet:', err.message);
    }
  };

  const saveGlobalItIncentives = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings/it-training-incentives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(globalItIncentives)
      });
      if (res.ok) {
        alert('IT Training Incentives saved successfully!');
      } else {
        alert('Failed to save IT Training Incentives.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving incentives.');
    }
  };

  const handleUpdateGlobalItIncentive = (processName, value) => {
    setGlobalItIncentives(prev => ({
      ...prev,
      [processName]: Number(value)
    }));
  };

  const handleSaveItProcess = async (processData) => {
    try {
      const isEditing = itProcessToEdit && itProcessToEdit.id;
      const url = isEditing
        ? `${API_URL}/api/it-training-processes/${itProcessToEdit.id}`
        : `${API_URL}/api/it-training-processes`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processData)
      });

      if (res.ok) {
        setItModalOpen(false);
        setItProcessToEdit(null);
        fetchAllData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save process');
      }
    } catch (err) {
      console.error('Error saving IT process:', err);
      alert('Error saving process');
    }
  };

  const handleDeleteItProcess = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/it-training-processes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error('Error deleting IT process:', err);
    }
  };

  const handleUpdateApplicationStatus = async () => {
    if (!statusModalApp || !newAppStatus) return;
    try {
      const res = await fetch(`${API_URL}/api/applications/${statusModalApp.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newAppStatus, adminNotes: adminNoteInput, referredBy: selectedHrRef })
      });
      if (res.ok) {
        setStatusModalApp(null);
        fetchAllData();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleApprovePayment = async (app) => {
    if (!window.confirm(`Mark payment for ${app.candidateName} as Paid and update application status to 'Applied'?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/applications/${app.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Applied', paymentId: `MANUAL_PAYMENT_${Date.now()}` })
      });
      if (res.ok) {
        fetchAllData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to approve payment');
      }
    } catch (err) {
      console.error('Error approving payment:', err);
      alert('Network error approving payment');
    }
  };

  const handleDeleteApplication = async (app) => {
    const confirmMsg = `Are you sure you want to permanently delete the application of "${app.candidateName}" (${app.applicationNumber})? This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;
    try {
      const res = await fetch(`${API_URL}/api/applications/${app.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAllData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete application');
      }
    } catch (err) {
      console.error('Error deleting application:', err);
      alert('Network error deleting application');
    }
  };

  const handleToggleIncentiveStatus = async (app) => {
    if (!app.incentiveAmount || app.incentiveAmount === 0) return;
    const newStatus = app.incentiveStatus === 'Paid' ? 'Pending' : 'Paid';
    if (!window.confirm(`Mark incentive payout of ₹${app.incentiveAmount} as ${newStatus}?`)) return;
    
    try {
      const res = await fetch(`${API_URL}/api/applications/${app.id}/incentive-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchAllData();
      } else {
        alert('Failed to update incentive status');
      }
    } catch (err) {
      console.error('Error updating incentive:', err);
      alert('Error updating incentive status');
    }
  };

  const handleBatchPayout = async (appIds, totalAmount, hrName) => {
    if (!window.confirm(`Mark ₹${totalAmount} as Paid for ${hrName}?`)) return;
    try {
      await Promise.all(appIds.map(id => 
        fetch(`${API_URL}/api/applications/${id}/incentive-status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Paid' })
        })
      ));
      fetchAllData();
    } catch (err) {
      console.error('Error in batch payout:', err);
      alert('Error updating payout status');
    }
  };

  const handleBatchCancel = async (hrId, appIds, totalAmount, hrName) => {
    if (!window.confirm(`Cancel/Remove pending ₹${totalAmount} for ${hrName}?`)) return;
    try {
      const items = appIds.map(id => ({ applicationId: id, amount: 0 }));
      const res = await fetch(`${API_URL}/api/users/hr/${hrId}/candidate-incentives`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      if (res.ok) {
        fetchAllData();
      } else {
        alert('Failed to cancel incentives');
      }
    } catch (err) {
      console.error('Error canceling incentives:', err);
      alert('Error canceling incentives');
    }
  };

  const handleUpdateHrReference = async () => {
    if (!hrRefModalApp) return;
    setSavingHrRef(true);
    try {
      const res = await fetch(`${API_URL}/api/applications/${hrRefModalApp.id}/reference`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referredBy: selectedHrRef || null })
      });
      if (res.ok) {
        setHrRefModalApp(null);
        fetchAllData();
      } else {
        alert('Failed to update HR reference');
      }
    } catch (err) {
      console.error('Error updating HR reference:', err);
      alert('Error updating HR reference');
    } finally {
      setSavingHrRef(false);
    }
  };

  const handleInterviewStatusChange = async (interviewId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/interviews/${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchAllData();
      } else {
        alert('Failed to update interview status');
      }
    } catch (err) {
      console.error('Error updating interview status:', err);
      alert('Error updating interview status');
    }
  };

  const handleDeleteInterview = async (intObj) => {
    if (!intObj) return;
    const id = intObj.id || intObj._id;
    const mongoId = intObj._id || intObj.id;
    const candidateName = intObj.candidateName;

    if (!window.confirm(`Are you sure you want to delete the interview schedule for ${candidateName || 'this candidate'}?`)) return;

    // Optimistically remove from state in UI immediately
    setInterviews(prev => prev.filter(i => (
      i.id !== id && i._id !== id && i._id !== mongoId &&
      !(i.applicationId && i.applicationId === intObj.applicationId && i.round === intObj.round)
    )));

    try {
      if (id) {
        await fetch(`${API_URL}/api/interviews/${id}`, { method: 'DELETE' });
      }
      if (mongoId && mongoId !== id) {
        await fetch(`${API_URL}/api/interviews/${mongoId}`, { method: 'DELETE' });
      }
    } catch (err) {
      console.error('Error deleting interview:', err);
    }
  };

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

  const validApplications = applications.filter(app => app.status !== 'Payment Pending');

  const getUpcomingIncentivesData = () => {
    const allReferrers = [...hrs, ...allAgents];
    const results = [];
    allReferrers.forEach(referrer => {
      let upcoming = 0;
      let upcomingCnt = 0;
      const upcomingApps = [];
      
      const code = String(referrer.referralCode || '').toLowerCase();
      const agentCodes = Array.isArray(referrer.agentCodes) ? referrer.agentCodes : [];
      const allCodes = [code, ...agentCodes].filter(Boolean);

      const refApps = validApplications.filter(app => {
         const ref = String(app.referredBy || '').toLowerCase();
         return allCodes.includes(ref);
      });

      refApps.forEach(app => {
        let amt = referrer.role === 'agent' || referrer.role === 'franchise' ? app.agentIncentiveAmount : app.incentiveAmount;
        if (!Number(amt)) {
          let job = jobs.find(j => j.id === app.jobId);
          if (!job) {
            job = jobs.find(j => 
              (j.title || '').trim().toLowerCase() === (app.jobTitle || '').trim().toLowerCase() && 
              (j.companyName || '').trim().toLowerCase() === (app.companyName || '').trim().toLowerCase()
            );
          }
          if (job) {
            const isPaid = Number(app.paymentAmount) >= 1499 || job.isFicFlow;
            if (referrer.role === 'agent' || referrer.role === 'franchise') {
               amt = isPaid ? (Number(job.partnerIncentivePaid) || 0) : (Number(job.partnerIncentiveFree) || 0);
            } else {
               amt = isPaid ? (Number(job.hrIncentivePaid) || 0) : (Number(job.hrIncentiveFree) || 0);
            }
          }
        }
        const val = Number(amt) || 0;
        
        const isClosed = ['selected', 'converted', 'hired'].includes(String(app.status||'').toLowerCase());
        const isRejected = ['rejected', 'not interested'].includes(String(app.status||'').toLowerCase());
        
        if (!isClosed && !isRejected) {
          upcoming += val;
          upcomingCnt += 1;
          upcomingApps.push(app);
        }
      });

      if (upcomingCnt > 0) {
        results.push({
          hr: referrer,
          hrName: referrer.name || 'Unknown',
          upcomingCount: upcomingCnt,
          upcomingAmount: upcoming,
          applications: upcomingApps
        });
      }
    });

    return results;
  };

  const upcomingIncentivesData = useMemo(() => getUpcomingIncentivesData(), [validApplications, hrs, allAgents, jobs]);
  const globalUpcomingIncentiveTotal = upcomingIncentivesData.reduce((sum, item) => sum + item.upcomingAmount, 0);

  const [selectedHrForUpcomingDetails, setSelectedHrForUpcomingDetails] = useState(null);

  const todayAppCount = validApplications.filter(a => isToday(a.appliedAt)).length;
  const yesterdayAppCount = validApplications.filter(a => isYesterday(a.appliedAt)).length;
  const last7DaysAppCount = validApplications.filter(a => isLast7Days(a.appliedAt)).length;
  const thisMonthAppCount = validApplications.filter(a => isThisMonth(a.appliedAt)).length;

  const filteredApplications = validApplications.filter(app => {
    if (appDateFilter === 'today' && !isToday(app.appliedAt)) return false;
    if (appDateFilter === 'yesterday' && !isYesterday(app.appliedAt)) return false;
    if (appDateFilter === 'last7' && !isLast7Days(app.appliedAt)) return false;
    if (appDateFilter === 'thisMonth' && !isThisMonth(app.appliedAt)) return false;

    if (appStatusFilter !== 'all') {
      if (appStatusFilter.toLowerCase() === 'processing') {
        const procStatuses = ['applied', 'shortlisted', 'interview scheduled', 'follow up'];
        if (!procStatuses.includes((app.status || '').toLowerCase())) return false;
      } else if (appStatusFilter.toLowerCase() === 'selected') {
        const selStatuses = ['selected', 'converted'];
        if (!selStatuses.includes((app.status || '').toLowerCase())) return false;
      } else {
        if ((app.status || '').toLowerCase() !== appStatusFilter.toLowerCase()) return false;
      }
    }

    if (appHrFilter !== 'all') {
      if (appHrFilter === 'direct') {
        if (app.referredBy) return false;
      } else {
        if (app.referredBy !== appHrFilter) return false;
      }
    }

    if (appSearchQuery.trim()) {
      const q = appSearchQuery.toLowerCase();
      const matchName = (app.candidateName || '').toLowerCase().includes(q);
      const matchEmail = (app.candidateEmail || '').toLowerCase().includes(q);
      const matchMobile = (app.candidateMobile || '').toLowerCase().includes(q);
      const matchAppNo = (app.applicationNumber || '').toLowerCase().includes(q);
      const matchJob = (app.jobTitle || '').toLowerCase().includes(q);
      const matchCompany = (app.companyName || '').toLowerCase().includes(q);
      const matchRef = (app.referredBy || '').toLowerCase().includes(q);

      if (!matchName && !matchEmail && !matchMobile && !matchAppNo && !matchJob && !matchCompany && !matchRef) {
        return false;
      }
    }

    return true;
  });

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job opening?')) return;
    try {
      await fetch(`${API_URL}/api/jobs/${id}`, { method: 'DELETE' });
      fetchAllData();
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await fetch(`${API_URL}/api/categories/${id}`, { method: 'DELETE' });
      fetchAllData();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm('Delete this company?')) return;
    try {
      await fetch(`${API_URL}/api/companies/${id}`, { method: 'DELETE' });
      fetchAllData();
    } catch (err) {
      console.error('Error deleting company:', err);
    }
  };

  const exportToCSV = () => {
    if (!filteredApplications || !filteredApplications.length) return;
    const headers = ['App ID', 'Name', 'Mobile', 'Email', 'City', 'Experience', 'Job Title', 'Company', 'HR Reference', 'Status', 'Applied At'];
    const rows = filteredApplications.map(app => {
      let hrRef = 'Direct';
      if (app.referredBy) {
        const hr = hrs.find(h => h.referralCode === app.referredBy);
        hrRef = hr ? `${hr.name} (${hr.referralCode})` : `Agent (${app.referredBy})`;
      }
      return [
        app.applicationNumber,
        app.candidateName,
        app.candidateMobile || 'N/A',
        app.candidateEmail || 'N/A',
        app.candidateLocation || 'N/A',
        app.candidateExperience || 'N/A',
        app.jobTitle,
        app.companyName,
        hrRef,
        app.status,
        new Date(app.appliedAt).toLocaleDateString('en-IN')
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Admin_Candidates_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'active' || s === 'selected') return <span className="badge badge-active">✓ {status}</span>;
    if (s.includes('interview') || s === 'shortlisted') return <span className="badge badge-shortlisted">● {status}</span>;
    if (s === 'applied' || s === 'under review') return <span className="badge badge-applied">● {status}</span>;
    return <span className="badge badge-rejected">✕ {status}</span>;
  };

  return (
    <div className="admin-layout animate-fade">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`admin-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div style={{ padding: '0 8px 1rem 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
            Recruitment Control Panel
          </div>
        </div>

        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabChange('dashboard')}
        >
          <LayoutDashboard size={18} /> Dashboard
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
          <CalendarDays size={18} /> Interviews ({interviews.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => handleTabChange('employees')}
        >
          <Users size={18} /> HR ({hrs.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'partners_admin' ? 'active' : ''}`}
          onClick={() => { handleTabChange('partners_admin'); setSelectedHrForPartners(null); }}
        >
          <UserPlus size={18} /> Partners
        </button>

        <button
          className={`nav-item ${activeTab === 'payouts' ? 'active' : ''}`}
          onClick={() => handleTabChange('payouts')}
        >
          <Gift size={18} /> Incentives & Payouts
        </button>

        <button
          className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => handleTabChange('payments')}
        >
          <CreditCard size={18} /> Payments
        </button>

        <button
          className={`nav-item ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => handleTabChange('jobs')}
        >
          <Briefcase size={18} /> Job Openings ({jobs.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'it_training' ? 'active' : ''}`}
          onClick={() => handleTabChange('it_training')}
        >
          <GraduationCap size={18} /> IT Programs ({itProcesses.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'companies' ? 'active' : ''}`}
          onClick={() => handleTabChange('companies')}
        >
          <Building2 size={18} /> Hiring Companies ({companies.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => handleTabChange('reports')}
        >
          <BarChart3 size={18} /> Analytics & Reports
        </button>
      </div>

      <div className="admin-main">
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Recruitment Dashboard Overview</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Live candidate applications, job metrics, and interview tracking.</p>
              </div>
              <button className="btn-secondary" onClick={fetchAllData} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={14} /> Refresh Stats
              </button>
            </div>

            <div className="kpi-grid">
              <div 
                className="kpi-card" 
                onClick={() => setActiveTab('applications')}
                style={{
                  background: '#f0fdfa', border: '1px solid #5eead4', cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
              >
                <div className="kpi-icon" style={{ background: '#ccfbf1', color: '#0d9488' }}>
                  <Users size={22} />
                </div>
                <div>
                  <div className="kpi-val" style={{ color: '#134e4a' }}>{kpis ? kpis.kpis.totalCandidates : 1}</div>
                  <div className="kpi-label" style={{ color: '#134e4a', opacity: 0.8, fontWeight: 600 }}>Total Candidates</div>
                </div>
              </div>

              <div 
                className="kpi-card" 
                onClick={() => setActiveTab('applications')}
                style={{
                  background: '#fffbeb', border: '1px solid #fcd34d', cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
              >
                <div className="kpi-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <FileText size={22} />
                </div>
                <div>
                  <div className="kpi-val" style={{ color: '#78350f' }}>{validApplications.length}</div>
                  <div className="kpi-label" style={{ color: '#78350f', opacity: 0.8, fontWeight: 600 }}>Applications Received</div>
                </div>
              </div>

              <div 
                className="kpi-card" 
                onClick={() => { setActiveTab('applications'); setAppStatusFilter('Processing'); }}
                style={{
                  background: '#e0e7ff', border: '1px solid #a5b4fc', cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
              >
                <div className="kpi-icon" style={{ background: '#c7d2fe', color: '#4f46e5' }}>
                  <RefreshCw size={22} />
                </div>
                <div>
                  <div className="kpi-val" style={{ color: '#312e81' }}>{validApplications.filter(a => !['Selected', 'Converted', 'Rejected', 'Not Interested'].includes(a.status)).length}</div>
                  <div className="kpi-label" style={{ color: '#312e81', opacity: 0.8, fontWeight: 600 }}>Processing</div>
                </div>
              </div>

              <div 
                className="kpi-card" 
                onClick={() => setActiveTab('interviews')}
                style={{
                  background: '#fdf4ff', border: '1px solid #f0abfc', cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
              >
                <div className="kpi-icon" style={{ background: '#fae8ff', color: '#c026d3' }}>
                  <Calendar size={22} />
                </div>
                <div>
                  <div className="kpi-val" style={{ color: '#701a75' }}>{interviews.length}</div>
                  <div className="kpi-label" style={{ color: '#701a75', opacity: 0.8, fontWeight: 600 }}>Interviews Scheduled</div>
                </div>
              </div>

              <div 
                className="kpi-card" 
                onClick={() => { setActiveTab('applications'); setAppStatusFilter('Selected'); }}
                style={{
                  background: '#ecfdf5', border: '1px solid #6ee7b7', cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
              >
                <div className="kpi-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                  <CheckCircle size={22} />
                </div>
                <div>
                  <div className="kpi-val" style={{ color: '#064e3b' }}>{validApplications.filter(a => ['Selected', 'Converted'].includes(a.status)).length}</div>
                  <div className="kpi-label" style={{ color: '#064e3b', opacity: 0.8, fontWeight: 600 }}>Selected</div>
                </div>
              </div>

              <div 
                className="kpi-card" 
                onClick={() => { setActiveTab('applications'); setAppStatusFilter('Rejected'); }}
                style={{
                  background: '#fef2f2', border: '1px solid #fca5a5', cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
              >
                <div className="kpi-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                  <X size={22} />
                </div>
                <div>
                  <div className="kpi-val" style={{ color: '#7f1d1d' }}>{validApplications.filter(a => ['Rejected', 'Not Interested'].includes(a.status)).length}</div>
                  <div className="kpi-label" style={{ color: '#7f1d1d', opacity: 0.8, fontWeight: 600 }}>Rejected</div>
                </div>
              </div>

              <div 
                className="kpi-card" 
                onClick={() => setActiveTab('jobs')}
                style={{
                  background: '#eff6ff', border: '1px solid #93c5fd', cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
              >
                <div className="kpi-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
                  <Briefcase size={22} />
                </div>
                <div>
                  <div className="kpi-val" style={{ color: '#1e3a8a' }}>{kpis ? kpis.kpis.totalJobs : jobs.length}</div>
                  <div className="kpi-label" style={{ color: '#1e3a8a', opacity: 0.8, fontWeight: 600 }}>Total Jobs ({kpis ? kpis.kpis.activeJobs : 0} Active)</div>
                </div>
              </div>

              <div 
                className="kpi-card" 
                onClick={() => { setActiveTab('hr-upcoming-incentives'); setSelectedHrForUpcomingDetails(null); }}
                style={{
                  background: '#fef3c7', border: '1px solid #fde68a', cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
              >
                <div className="kpi-icon" style={{ background: '#fde68a', color: '#d97706' }}>
                  <Gift size={22} />
                </div>
                <div>
                  <div className="kpi-val" style={{ color: '#92400e' }}>₹{globalUpcomingIncentiveTotal.toLocaleString()}</div>
                  <div className="kpi-label" style={{ color: '#92400e', opacity: 0.8, fontWeight: 600 }}>HR Upcoming Incentives</div>
                </div>
              </div>
            </div>

                        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
              <button 
                className="btn-primary" 
                onClick={() => setActiveTab('applications')}
                style={{ padding: '12px 28px', fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}
              >
                View Recent Applications ➔
              </button>
            </div>

            {(() => {
              const hrStats = hrs.map(hr => {
                const hrApps = validApplications.filter(app => app.referredBy === hr.referralCode);
                const closedApps = hrApps.filter(app => CLOSED_STATUSES.includes(String(app.status || '').toLowerCase()));
                return {
                  ...hr,
                  totalSourced: hrApps.length,
                  totalClosed: closedApps.length
                };
              });
              const topClosers = [...hrStats].sort((a,b) => b.totalClosed - a.totalClosed).slice(0, 5);
              const topSourcers = [...hrStats].sort((a,b) => b.totalSourced - a.totalSourced).slice(0, 5);
              
              return (
                <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {/* Top Closers Card */}
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🏆 Top Closers <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>(Selected/Closed)</span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {topClosers.map((hr, idx) => (
                        <div key={hr.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: idx === 0 ? '#fef08a' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#fed7aa' : '#f1f5f9', color: idx === 0 ? '#a16207' : idx === 1 ? '#475569' : idx === 2 ? '#9a3412' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>
                              {hr.profilePhoto ? (
                                <img src={hr.profilePhoto} alt={hr.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                `#${idx + 1}`
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>{hr.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>{hr.referralCode}</div>
                            </div>
                          </div>
                          <div style={{ fontWeight: '800', color: '#059669', fontSize: '1.15rem' }}>
                            {hr.totalClosed}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Sourcers Card */}
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🚀 Top Applications Received <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>(Most Apps)</span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {topSourcers.map((hr, idx) => (
                        <div key={hr.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: idx === 0 ? '#fef08a' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#fed7aa' : '#f1f5f9', color: idx === 0 ? '#a16207' : idx === 1 ? '#475569' : idx === 2 ? '#9a3412' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>
                              {hr.profilePhoto ? (
                                <img src={hr.profilePhoto} alt={hr.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                `#${idx + 1}`
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>{hr.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>{hr.referralCode}</div>
                            </div>
                          </div>
                          <div style={{ fontWeight: '800', color: '#2563eb', fontSize: '1.15rem' }}>
                            {hr.totalSourced}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Category Management</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Add, edit, and organize candidate job category domains.</p>
              </div>
              <button className="btn-primary" onClick={() => { setCategoryToEdit(null); setCategoryModalOpen(true); }}>
                <Plus size={16} /> Add Category
              </button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td style={{ fontWeight: 700 }}>{cat.name}</td>
                      <td>{cat.description || '-'}</td>
                      <td>{getStatusBadge(cat.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px' }}
                            onClick={() => { setCategoryToEdit(cat); setCategoryModalOpen(true); }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px', color: '#ef4444' }}
                            onClick={() => handleDeleteCategory(cat.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Payment Transactions</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Track candidate application fees and manual approvals.</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => setPaymentSubTab('success')}
                style={{
                  padding: '7px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', border: 'none',
                  background: paymentSubTab === 'success' ? '#059669' : '#f1f5f9',
                  color: paymentSubTab === 'success' ? 'white' : '#475569',
                }}
              >
                Payment Transactions
              </button>
              <button
                onClick={() => setPaymentSubTab('pending')}
                style={{
                  padding: '7px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', border: 'none',
                  background: paymentSubTab === 'pending' ? '#ea580c' : '#f1f5f9',
                  color: paymentSubTab === 'pending' ? 'white' : '#475569',
                }}
              >
                Payment Pending
              </button>
            </div>
            
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Candidate</th>
                    <th>Job Applied</th>
                      <th>HR Ref</th>
                    <th>Amount</th>
                    <th>Payment ID</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.filter(app => getAppPaymentAmount(app) > 0 && (paymentSubTab === 'pending' ? app.status === 'Payment Pending' : app.status !== 'Payment Pending')).map(app => (
                    <tr key={app.id}>
                      <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td>
                        <strong>{app.candidateName}</strong><br/>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.candidateMobile}</span>
                      </td>
                      <td>{app.jobTitle}</td>
                      <td>
                        {app.referredBy ? (() => {
                          const hr = hrs.find(h => h.referralCode === app.referredBy);
                          return (
                            <div>
                              <div style={{ fontWeight: 600, color: '#2563eb', fontSize: '0.85rem' }}>{hr ? hr.name : 'Unknown HR'}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.referredBy}</div>
                            </div>
                          );
                        })() : <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>Direct</span>}
                      </td>
                      <td>₹{getAppPaymentAmount(app)}</td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{app.paymentId || 'N/A'}</span></td>
                      <td>
                        <span className={`status-badge ${app.status === 'Payment Pending' ? 'pending' : 'active'}`}>
                          {app.status === 'Payment Pending' ? 'Pending' : 'Success'}
                        </span>
                      </td>
                      <td>
                        {app.status === 'Payment Pending' ? (
                          <button 
                            className="btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', gap: '4px', alignItems: 'center' }}
                            onClick={() => handleApprovePayment(app)}
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                        ) : (
                          <span style={{ color: '#10b981', fontSize: '0.85rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <Check size={14} /> Approved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {applications.filter(app => getAppPaymentAmount(app) > 0 && (paymentSubTab === 'pending' ? app.status === 'Payment Pending' : app.status !== 'Payment Pending')).length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No {paymentSubTab} payment records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'companies' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Company Management</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Add hiring partner companies and upload logos.</p>
              </div>
              <button className="btn-primary" onClick={() => { setCompanyToEdit(null); setCompanyModalOpen(true); }}>
                <Plus size={16} /> Add Company
              </button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Company Name</th>
                    <th>Category</th>
                    <th>Website</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map(comp => {
                    const cat = categories.find(c => c.id === comp.categoryId);
                    return (
                      <tr key={comp.id}>
                        <td>
                          {comp.logo ? (
                            <img src={comp.logo} alt={comp.name} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain', backgroundColor: '#ffffff', padding: '2px', border: '1px solid #e2e8f0' }} />
                          ) : (
                            <Building2 size={24} color="#94a3b8" />
                          )}
                        </td>
                        <td style={{ fontWeight: 700 }}>{comp.name}</td>
                        <td>{cat ? cat.name : 'Uncategorized'}</td>
                        <td>
                          {comp.website ? (
                            <a href={comp.website} target="_blank" rel="noreferrer" style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              Visit <ExternalLink size={12} />
                            </a>
                          ) : '-'}
                        </td>
                        <td>{getStatusBadge(comp.status)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn-secondary"
                              style={{ padding: '4px 8px' }}
                              onClick={() => { setCompanyToEdit(comp); setCompanyModalOpen(true); }}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn-secondary"
                              style={{ padding: '4px 8px', color: '#ef4444' }}
                              onClick={() => handleDeleteCompany(comp.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Dynamic Job Openings</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Create, publish, and configure requirements for recruitment posts.</p>
              </div>
              <button className="btn-primary" onClick={() => { setJobToEdit(null); setJobModalOpen(true); }}>
                <Plus size={16} /> Create New Job
              </button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Salary</th>
                    <th>Openings</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{job.title}</td>
                      <td>{job.companyName}</td>
                      <td><span style={{ color: '#2563eb', fontWeight: 600 }}>{job.categoryName}</span></td>
                      <td>{job.location}</td>
                      <td style={{ color: '#047857', fontWeight: 600 }}>{job.salary}</td>
                      <td style={{ fontWeight: 700 }}>{job.openings}</td>
                      <td>{getStatusBadge(job.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px' }}
                            onClick={() => { setJobToEdit(job); setJobModalOpen(true); }}
                            title="Edit Job"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px', color: '#ef4444' }}
                            onClick={() => handleDeleteJob(job.id)}
                            title="Delete Job"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Applications Pipeline</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Review candidate profiles, change status, and schedule interview rounds.</p>
              </div>
              {currentUser?.role === 'admin' && (
                <button
                  className="btn-primary"
                  onClick={() => setManualAppModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                    border: '1px solid #3b82f6',
                    padding: '9px 18px',
                    fontSize: '0.875rem'
                  }}
                >
                  <UserPlus size={16} /> Add Application (Manual)
                </button>
              )}
            </div>

            {/* Quick Date Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => setAppDateFilter('all')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: appDateFilter === 'all' ? '#2563eb' : '#f1f5f9',
                  color: appDateFilter === 'all' ? 'white' : '#475569',
                  transition: 'all 0.2s'
                }}
              >
                All Applications ({validApplications.length})
              </button>

              <button
                onClick={() => setAppDateFilter('today')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
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
                  padding: '7px 14px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
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
                  padding: '7px 14px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
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
                  padding: '7px 14px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
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
            </div>

            {/* Search and Dropdown Filters Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '1.25rem', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Search Candidate / App</label>
                <input
                  type="text"
                  placeholder="Search by Name, Phone, App ID..."
                  value={appSearchQuery}
                  onChange={e => setAppSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', background: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Filter By Status</label>
                <select
                  value={appStatusFilter}
                  onChange={e => setAppStatusFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', background: 'white' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="Processing">Processing</option>
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="HR Screening">HR Screening</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Filter By HR Reference</label>
                <select
                  value={appHrFilter}
                  onChange={e => setAppHrFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', background: 'white' }}
                >
                  <option value="all">All HR References</option>
                  <option value="direct">Direct (No HR)</option>
                  {hrs.map(h => (
                    <option key={h.id} value={h.referralCode}>
                      👤 {h.name} ({h.referralCode})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button 
                  onClick={exportToCSV} 
                  className="btn-primary" 
                  style={{ width: '100%', background: '#0f172a', border: 'none', padding: '9px 16px', display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}
                >
                  <Download size={16} /> Export CSV
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Candidate Details</th>
                    <th>Applied Job</th>
                    <th>Company</th>
                    <th>Applied On</th>
                    <th>HR Reference</th>
                    <th>Payment</th>
                    <th>HR Incentive</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No applications matching the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map(app => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 700, color: '#2563eb' }}>{app.applicationNumber}</td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem', marginBottom: '6px' }}>{app.candidateName}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.85rem' }}>
                          <div style={{ color: '#047857', background: '#d1fae5', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            📱 {app.candidateMobile}
                          </div>
                          <div style={{ color: '#1d4ed8', background: '#dbeafe', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            ✉️ {app.candidateEmail}
                          </div>
                          <div style={{ color: '#b45309', background: '#fef3c7', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            🎂 DOB: {app.candidateQualification || 'N/A'}
                          </div>
                          <div style={{ color: '#6d28d9', background: '#f3e8ff', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            🏙️ City: {app.candidateLocation || 'N/A'}
                          </div>
                          <div style={{ color: '#be185d', background: '#fce7f3', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, gridColumn: 'span 2' }}>
                            💼 Experience: {app.candidateExperience || 'N/A'}
                          </div>
                        </div>
                        {app.candidateResumeUrl && (
                          <a href={app.candidateResumeUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontWeight: 600, padding: '4px 8px', background: '#eff6ff', borderRadius: '6px' }}>
                            <FileText size={14} /> View Resume
                          </a>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>{app.jobTitle}</td>
                      <td>{app.companyName}</td>
                      <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', minWidth: '135px' }}>
                          <div>
                            {app.referredBy ? (() => {
                              const hr = hrs.find(h => h.referralCode === app.referredBy);
                              return (
                                <div>
                                  <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.85rem' }}>{hr ? hr.name : 'Unknown HR'}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.referredBy}</div>
                                </div>
                              );
                            })() : <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>Direct</span>}
                          </div>
                          <button
                            onClick={() => {
                              setHrRefModalApp(app);
                              setSelectedHrRef(app.referredBy || '');
                            }}
                            title="Edit or Assign HR Reference"
                            style={{
                              background: app.referredBy ? '#eff6ff' : '#f0fdf4',
                              color: app.referredBy ? '#2563eb' : '#16a34a',
                              border: `1px solid ${app.referredBy ? '#bfdbfe' : '#bbf7d0'}`,
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.725rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontWeight: 700,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Edit size={11} /> {app.referredBy ? 'Edit' : '+ Add'}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: getAppPaymentAmount(app) > 100 ? '#10b981' : '#f59e0b', fontSize: '0.9rem' }}>
                          ₹{getAppPaymentAmount(app)}
                        </div>
                        {app.paymentId && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', wordBreak: 'break-all', maxWidth: '100px' }}>
                            {app.paymentId.replace('FREE_TEST_', 'Free-')}
                          </div>
                        )}
                      </td>
                      <td>
                        {app.referredBy ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ fontWeight: 700, color: app.incentiveAmount > 0 ? '#10b981' : '#64748b', fontSize: '0.9rem' }}>
                              ₹{app.incentiveAmount || 0}
                            </div>
                            {app.incentiveAmount > 0 && (
                              <button
                                onClick={() => handleToggleIncentiveStatus(app)}
                                style={{
                                  background: app.incentiveStatus === 'Paid' ? '#10b981' : '#fef08a',
                                  color: app.incentiveStatus === 'Paid' ? '#fff' : '#854d0e',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  width: 'fit-content'
                                }}
                              >
                                {app.incentiveStatus === 'Paid' ? 'Paid ✓' : 'Pay Now'}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>-</span>
                        )}
                      </td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
                          <button
                            className="btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.775rem' }}
                            onClick={() => {
                              setStatusModalApp(app);
                              setNewAppStatus(app.status);
                              setAdminNoteInput(app.adminNotes || '');
                              setSelectedHrRef(app.referredBy || '');
                            }}
                          >
                            Update Status
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.775rem', background: '#eff6ff', color: '#1d4ed8' }}
                            onClick={() => {
                              setAppToSchedule(app);
                              setInterviewModalOpen(true);
                            }}
                          >
                            <Calendar size={12} /> Schedule Interview
                          </button>
                          {currentUser?.role === 'admin' && (
                            <button
                              className="btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '0.775rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                              onClick={() => handleDeleteApplication(app)}
                              title="Delete this application permanently"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'interviews' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Scheduled Interviews</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Upcoming HR, Technical, and Branch interviews.</p>
              </div>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>HR / Partner</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Date & Time</th>
                    <th>Mode & Link / Address</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map(int => {
                    const app = applications.find(a => a.id === int.applicationId);
                    const referrer = app && app.referredBy ? [...hrs, ...allAgents].find(r => r.referralCode === app.referredBy) : null;
                    return (
                      <tr key={int.id}>
                        <td style={{ fontWeight: 700 }}>{int.candidateName}</td>
                        <td>
                          {referrer ? (
                            <div>
                              <div style={{ fontWeight: 600, color: '#334155' }}>{referrer.name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{referrer.referralCode}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Direct</span>
                          )}
                        </td>
                        <td>{int.jobTitle}</td>
                      <td>{int.companyName}</td>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <div style={{ color: '#334155' }}>
                          {int.date ? new Date(int.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}
                        </div>
                        {int.time && (
                          <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
                            {(() => {
                              const p = int.time.split(':');
                              let h = parseInt(p[0], 10);
                              const m = p[1] || '00';
                              const ampm = h >= 12 ? 'PM' : 'AM';
                              h = h % 12 || 12;
                              return `${h}:${m} ${ampm}`;
                            })()}
                          </div>
                        )}
                      </td>
                      <td>
                        {int.mode === 'Online' ? (
                          <div>
                            <span style={{ color: '#059669', fontWeight: 600 }}>Online</span>
                            {int.meetingLink && (
                              <div><a href={int.meetingLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#2563eb' }}>Meeting Link</a></div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span style={{ color: '#d97706', fontWeight: 600 }}>Offline</span>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{int.location}</div>
                          </div>
                        )}
                      </td>
                      <td>
                        {(() => {
                          const status = int.status || 'Scheduled';
                          let bg = '#e0f2fe';
                          let color = '#0284c7';
                          if (status.toLowerCase() === 'rejected') {
                            bg = '#fee2e2';
                            color = '#dc2626';
                          } else if (status.toLowerCase() === 'selected' || status.toLowerCase() === 'hired') {
                            bg = '#dcfce7';
                            color = '#16a34a';
                          }
                          return (
                            <span className="badge" style={{ background: bg, color: color, padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                              {status}
                            </span>
                          );
                        })()}
                      </td>
                      <td>
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 8px', color: '#ef4444' }}
                          title="Delete Interview Schedule"
                          onClick={() => handleDeleteInterview(int)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>HR / Employees Management</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage HR accounts and view their referral links.</p>
              </div>
              <button className="btn-primary" onClick={() => {
                setHrToEdit(null);
                setHrForm({ name: '', email: '', password: '', mobile: '', profilePhoto: '' });
                setHrError('');
                setHrModalOpen(true);
              }}>
                <Plus size={16} /> Add HR
              </button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Referral Code</th>
                    <th>Link Clicks</th>
                    <th>Candidates Applied</th>
                    <th>Incentives Earned</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hrs.map(hr => (
                    <tr key={hr.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#f1f5f9', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {hr.profilePhoto ? (
                              <img src={hr.profilePhoto} alt={hr.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ fontWeight: 800, color: '#6366f1', fontSize: '1.05rem' }}>
                                {hr.name?.charAt(0)?.toUpperCase() || 'H'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{hr.name}</div>
                            {hr.mobile && <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{hr.mobile}</div>}
                          </div>
                        </div>
                      </td>
                      <td>{hr.email}</td>
                      <td>
                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {hr.referralCode}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#3b82f6' }}>{hr.linkClicks || 0}</td>
                      <td style={{ fontWeight: 600, color: '#10b981' }}>
                        {validApplications.filter(app => String(app.referredBy || '').toLowerCase() === String(hr.referralCode || '').toLowerCase()).length}
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                          {getHrClosedApps(hr).filter(a => CLOSED_STATUSES.includes(String(a.status || '').toLowerCase())).length} closed
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#059669' }}>
                        ₹{(hr.incentives || 0).toLocaleString()}
                      </td>
                      <td><span className="badge badge-active">Active</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px', color: '#2563eb', background: '#eff6ff', borderColor: '#bfdbfe' }}
                            title="Edit HR Details & Photo"
                            onClick={() => {
                              const storedPhotos = (() => {
                                try { return JSON.parse(localStorage.getItem('hr_profile_photos') || '{}'); } catch { return {}; }
                              })();
                              const currentPhoto = hr.profilePhoto || storedPhotos[hr.id] || '';
                              setHrToEdit(hr);
                              setHrForm({
                                name: hr.name || '',
                                email: hr.email || '',
                                password: '',
                                mobile: hr.mobile || '',
                                profilePhoto: currentPhoto
                              });
                              setHrError('');
                              setHrModalOpen(true);
                            }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.775rem', color: '#059669', background: '#ecfdf5', borderColor: '#a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="Edit HR Incentives"
                            onClick={() => {
                              setSelectedHrForIncentive(hr);
                              const initial = {};
                              getHrClosedApps(hr).forEach(app => { initial[app.id] = Number(app.incentiveAmount) || 0; });
                              setIncentiveInput(initial);
                              setIncentiveError('');
                              setIncentiveModalOpen(true);
                            }}
                          >
                            <Gift size={12} /> Candidate Incentives
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px', color: '#ef4444' }}
                            onClick={() => {
                              if (!window.confirm(`Delete HR ${hr.name}?`)) return;
                              fetch(`${API_URL}/api/users/hr/${hr.id}`, { method: 'DELETE' })
                              .then(() => fetchAllData());
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {hrs.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No HRs found. Add one to get started.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '1.5rem' }}>Recruitment Analytics & Reports</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Applications by Category</h4>
                {kpis && kpis.charts && Object.entries(kpis.charts.appsByCategory).map(([cat, count]) => (
                  <div key={cat} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px' }}>
                      <span>{cat}</span>
                      <span>{count} Applications</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, count * 25)}%`, background: '#2563eb' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Applications by Company</h4>
                {kpis && kpis.charts && Object.entries(kpis.charts.appsByCompany).map(([comp, count]) => (
                  <div key={comp} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px' }}>
                      <span>{comp}</span>
                      <span>{count} Applications</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, count * 30)}%`, background: '#10b981' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'it_training' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>FIC IT Training & Placement Programs</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                  Manage multiple training processes (Process 1, Process 2, etc.) displayed to candidates.
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={() => {
                  setItProcessToEdit(null);
                  setItModalOpen(true);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={16} /> Add New Process
              </button>
            </div>

            {itProcesses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: '#64748b' }}>No IT Training Processes created yet.</p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setItProcessToEdit(null);
                    setItModalOpen(true);
                  }}
                  style={{ marginTop: '1rem' }}
                >
                  <Plus size={16} /> Add First Process
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  {['Placement', 'Course', 'Internship'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveItCategoryTab(cat)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        fontSize: '1rem',
                        fontWeight: activeItCategoryTab === cat ? 'bold' : 'normal',
                        color: activeItCategoryTab === cat ? 'var(--primary-color)' : '#64748b',
                        borderBottom: activeItCategoryTab === cat ? '2px solid var(--primary-color)' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {cat} Programs
                    </button>
                  ))}
                </div>
                <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Process Name</th>
                      <th>Program & Role</th>
                      <th>Training Duration</th>
                      <th>Stipend</th>
                      <th>Bond & Originals</th>
                      <th>Training Cost</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itProcesses.filter(proc => (proc.itCategory || 'Placement') === activeItCategoryTab).map(proc => (
                      <tr key={proc.id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                            <span style={{
                              fontWeight: 800,
                              color: '#1e40af',
                              background: '#dbeafe',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.85rem'
                            }}>
                              {proc.processName}
                            </span>
                            <span style={{
                              fontWeight: 700,
                              color: proc.itCategory === 'Course' ? '#b45309' : proc.itCategory === 'Internship' ? '#047857' : '#6b21a8',
                              background: proc.itCategory === 'Course' ? '#fef3c7' : proc.itCategory === 'Internship' ? '#d1fae5' : '#f3e8ff',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              border: `1px solid ${proc.itCategory === 'Course' ? '#f59e0b' : proc.itCategory === 'Internship' ? '#10b981' : '#d8b4fe'}`
                            }}>
                              {proc.itCategory || 'Placement'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <strong>{proc.role || 'Software Engineer Trainee'}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{proc.programTitle}</div>
                        </td>
                        <td>
                          <strong>{proc.trainingPeriod || '6 Months'}</strong>
                          {proc.trainingSubtext && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{proc.trainingSubtext}</div>
                          )}
                        </td>
                        <td>
                          <strong style={{ color: '#047857' }}>₹{proc.stipend || '12,000'}</strong>
                          {proc.stipendSubtext && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{proc.stipendSubtext}</div>
                          )}
                        </td>
                        <td>
                          <div><strong>{proc.bondPeriod || '1 Year Bond'}</strong></div>
                          <span style={{ fontSize: '0.75rem', color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {proc.originalsRequired || 'Originals Required'}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: '#1d4ed8', fontSize: '1rem' }}>{proc.trainingFee || '1.6 LPA'}</strong>
                        </td>
                        <td>
                          {proc.status === 'Active' ? (
                            <span className="badge badge-active">✓ Active</span>
                          ) : (
                            <span className="badge badge-rejected">✕ Inactive</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn-icon"
                              title="Edit Process"
                              onClick={() => {
                                setItProcessToEdit(proc);
                                setItModalOpen(true);
                              }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn-icon text-danger"
                              title="Delete Process"
                              onClick={() => handleDeleteItProcess(proc.id, proc.processName)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'hr-upcoming-incentives' && (
          <div className="fade-in">
            <div className="dashboard-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="dashboard-title">HR Upcoming Incentives</h2>
                <p className="dashboard-subtitle">Track candidate applications that are currently in process and their expected incentives.</p>
              </div>
              {selectedHrForUpcomingDetails && (
                <button className="btn-secondary" onClick={() => setSelectedHrForUpcomingDetails(null)}>
                  &larr; Back to HR List
                </button>
              )}
            </div>

            {!selectedHrForUpcomingDetails ? (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>HR Name</th>
                      <th>Referral Code</th>
                      <th>Upcoming Candidates</th>
                      <th>Total Upcoming Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingIncentivesData.length > 0 ? upcomingIncentivesData.map((data, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{data.hrName}</div>
                          <span className="badge" style={{ marginTop: '4px' }}>{data.hr.role.toUpperCase()}</span>
                        </td>
                        <td><span className="badge badge-blue">{data.hr.referralCode}</span></td>
                        <td>{data.upcomingCount} Candidates</td>
                        <td style={{ fontWeight: '600', color: '#0d9488' }}>₹{data.upcomingAmount.toLocaleString()}</td>
                        <td>
                          <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setSelectedHrForUpcomingDetails(data)}>
                            View Candidates
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                          No upcoming incentives found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '600', marginBottom: '4px' }}>Upcoming Candidates for {selectedHrForUpcomingDetails.hrName}</h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Referral Code: {selectedHrForUpcomingDetails.hr.referralCode}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0d9488' }}>₹{selectedHrForUpcomingDetails.upcomingAmount.toLocaleString()}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Expected</div>
                  </div>
                </div>

                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                          <th>Candidate Details</th>
                        <th>Job Info</th>
                        <th>Status</th>
                        <th>Expected Incentive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedHrForUpcomingDetails.applications.map((app, index) => (
                        <tr key={app.id}>
                            <td style={{ fontWeight: 600, color: '#64748b' }}>{index + 1}</td>
                            <td>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{app.candidateName}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{app.candidateEmail}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{app.candidatePhone}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '500' }}>{app.jobTitle}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{app.companyName}</div>
                          </td>
                          <td>
                            <span className={`status-badge status-${(app.status || 'Received').replace(/\s+/g, '-').toLowerCase()}`}>
                              {app.status || 'Received'}
                            </span>
                          </td>
                          <td style={{ fontWeight: '600', color: '#0d9488' }}>
                            ₹{(() => {
                              let amt = selectedHrForUpcomingDetails.hr.role === 'agent' || selectedHrForUpcomingDetails.hr.role === 'franchise' ? app.agentIncentiveAmount : app.incentiveAmount;
                              if (!Number(amt)) {
                                let job = jobs.find(j => j.id === app.jobId);
                                if (!job) {
                                  job = jobs.find(j => 
                                    (j.title || '').trim().toLowerCase() === (app.jobTitle || '').trim().toLowerCase() && 
                                    (j.companyName || '').trim().toLowerCase() === (app.companyName || '').trim().toLowerCase()
                                  );
                                }
                                if (job) {
                                  const isPaid = Number(app.paymentAmount) >= 1499 || job.isFicFlow;
                                  if (selectedHrForUpcomingDetails.hr.role === 'agent' || selectedHrForUpcomingDetails.hr.role === 'franchise') {
                                     amt = isPaid ? (Number(job.partnerIncentivePaid) || 0) : (Number(job.partnerIncentiveFree) || 0);
                                  } else {
                                     amt = isPaid ? (Number(job.hrIncentivePaid) || 0) : (Number(job.hrIncentiveFree) || 0);
                                  }
                                }
                              }
                              return Number(amt) || 0;
                            })().toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'partners_admin' && (
          <div>
            {selectedHrForPartners ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                  <button 
                    onClick={() => setSelectedHrForPartners(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontWeight: 600 }}
                  >
                    ← Back to HR List
                  </button>
                  <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>Partners for {selectedHrForPartners.name}</h2>
                </div>
                <div style={{ background: '#fff', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)' }}>
                  <AgentsManager 
                    API_URL={API_URL} 
                    currentUser={{ id: selectedHrForPartners.id, role: 'hr' }} 
                    candidatePortalBaseUrl={window.location.origin} 
                  />
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>Partner Management</h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                    Select an HR to view and manage their partners.
                  </p>
                </div>
                
                <div className="kpi-grid">
                  {hrs.map((hr, i) => {
                    const colors = [
                      { bg: '#fef2f2', iconBg: '#fee2e2', iconColor: '#ef4444', text: '#7f1d1d', border: '#fca5a5' },
                      { bg: '#eff6ff', iconBg: '#dbeafe', iconColor: '#3b82f6', text: '#1e3a8a', border: '#93c5fd' },
                      { bg: '#ecfdf5', iconBg: '#d1fae5', iconColor: '#10b981', text: '#064e3b', border: '#6ee7b7' },
                      { bg: '#fdf4ff', iconBg: '#fae8ff', iconColor: '#d946ef', text: '#701a75', border: '#f0abfc' },
                      { bg: '#fffbeb', iconBg: '#fef3c7', iconColor: '#f59e0b', text: '#78350f', border: '#fcd34d' },
                      { bg: '#f5f3ff', iconBg: '#ede9fe', iconColor: '#8b5cf6', text: '#4c1d95', border: '#c4b5fd' },
                      { bg: '#f0fdfa', iconBg: '#ccfbf1', iconColor: '#14b8a6', text: '#134e4a', border: '#5eead4' },
                      { bg: '#fff1f2', iconBg: '#ffe4e6', iconColor: '#f43f5e', text: '#881337', border: '#fda4af' }
                    ];
                    const color = colors[i % colors.length];

                    return (
                    <div 
                      key={hr.id} 
                      className="kpi-card" 
                      onClick={() => setSelectedHrForPartners(hr)}
                      style={{ 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '16px',
                        background: color.bg,
                        border: `1px solid ${color.border}`,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
                    >
                      <div className="kpi-icon" style={{ background: color.iconBg, color: color.iconColor }}>
                        <Users size={22} />
                      </div>
                      <div>
                        <div className="kpi-val" style={{ fontSize: '1.25rem', marginBottom: '4px', color: color.text }}>{hr.name}</div>
                        <div className="kpi-label" style={{ color: color.text, opacity: 0.8, fontWeight: 600 }}>HR Ref: {hr.referralCode}</div>
                      </div>
                    </div>
                  )})}
                  {hrs.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No HR accounts found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'payouts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>HR Incentives & Payouts</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                  Track and manage incentive payments for HR referrals across all applications.
                </p>
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#1e293b', margin: '0 0 0.5rem 0' }}>IT Training Process Incentives (Global)</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>Set the universal HR incentive payout for each IT Training process. This applies universally to all candidate selections.</p>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {Array.from(new Set(itProcesses.filter(it => it.itCategory === 'Placement').map(p => p.processName?.toUpperCase().trim()))).filter(Boolean).sort().map(pName => (
                  <div key={pName} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                     <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{pName} (₹)</label>
                     <input 
                       type="number" 
                       value={globalItIncentives[pName] || ''} 
                       onChange={(e) => handleUpdateGlobalItIncentive(pName, e.target.value)} 
                       style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', width: '120px' }} 
                     />
                  </div>
                ))}
              </div>
              <button onClick={saveGlobalItIncentives} style={{ marginTop: '1rem', background: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Save Global Incentives</button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>HR Details</th>
                    <th>Referral Code</th>
                    <th>Closed Candidates</th>
                    <th>Total Incentive Earned</th>
                    <th>Payout Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const allReferrers = [...hrs, ...allAgents];
                    const hrPayoutsList = allReferrers.map(hr => {
                      const hrApps = applications.filter(app => app.referredBy === hr.referralCode && (app.status === 'Selected' || app.status === 'Converted'));
                      let totalIncentiveEarned = 0;
                      let totalPending = 0;
                      let totalRequested = 0;
                      let totalPaid = 0;
                      const pendingAppIds = [];

                      hrApps.forEach(app => {
                        const amt = app.incentiveAmount || 0;
                        totalIncentiveEarned += amt;
                        if (app.incentiveStatus === 'Paid') {
                          totalPaid += amt;
                        } else if (app.incentiveStatus === 'Withdraw Requested') {
                          totalRequested += amt;
                          if (amt > 0) pendingAppIds.push(app.id);
                        } else {
                          totalPending += amt;
                          if (amt > 0) pendingAppIds.push(app.id);
                        }
                      });

                      return {
                        id: hr.id,
                        referralCode: hr.referralCode,
                        hrName: hr.name,
                        hrEmail: hr.email,
                        role: hr.role,
                        closedCandidates: hrApps.length,
                        totalIncentiveEarned,
                        totalPending,
                        totalRequested,
                        totalPaid,
                        appIds: pendingAppIds,
                        bankAccountNumber: hr.bankAccountNumber,
                        bankIfscCode: hr.bankIfscCode
                      };
                    }); // Removed filter so ALL HRs show up
                    
                    if (hrPayoutsList.length === 0) {
                      return (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                            No incentives assigned yet. Assign incentives to HRs when candidates are Selected/Converted.
                          </td>
                        </tr>
                      );
                    }

                    return hrPayoutsList.map(hr => {
                      const totalToPay = hr.totalPending + hr.totalRequested;
                      return (
                      <tr key={hr.referralCode}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#1e293b', cursor: 'pointer', display: 'inline-block', borderBottom: '1px dashed #94a3b8' }} onClick={() => setBankInfoModal(hr)} title="Click to view Bank Details">
                            {hr.hrName} <span style={{ fontSize: '0.7rem', color: hr.role === 'agent' ? '#8b5cf6' : '#f59e0b', background: hr.role === 'agent' ? '#f3e8ff' : '#fef3c7', padding: '2px 4px', borderRadius: '4px', marginLeft: '6px' }}>{hr.role === 'agent' ? 'Partner' : 'HR'}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{hr.hrEmail}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#2563eb' }}>{hr.referralCode}</div>
                        </td>
                        <td style={{ fontWeight: 700, textAlign: 'center' }}>
                          <span style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '12px', color: '#334155' }}>
                            {hr.closedCandidates}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: '#059669', fontSize: '1rem' }}>₹{hr.totalIncentiveEarned}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              Paid: <span style={{ color: '#10b981', fontWeight: 600 }}>₹{hr.totalPaid}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              Pending: <span style={{ color: '#94a3b8', fontWeight: 600 }}>₹{hr.totalPending}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              Requested: <span style={{ color: hr.totalRequested > 0 ? '#f59e0b' : '#94a3b8', fontWeight: 600 }}>₹{hr.totalRequested}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  title={`Pay (₹${totalToPay})`}
                                  disabled={totalToPay === 0}
                                  onClick={() => handleBatchPayout(hr.appIds, totalToPay, hr.hrName)}
                                  style={{
                                    background: totalToPay > 0 ? '#d1fae5' : '#f1f5f9',
                                    color: totalToPay > 0 ? '#059669' : '#94a3b8',
                                    border: totalToPay > 0 ? '1px solid #34d399' : '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    padding: '6px',
                                    cursor: totalToPay > 0 ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Check size={16} strokeWidth={3} />
                                </button>
                                <button
                                  title={`Cancel (₹${totalToPay})`}
                                  disabled={totalToPay === 0}
                                  onClick={() => handleBatchCancel(allReferrers.find(h => h.referralCode === hr.referralCode)?.id, hr.appIds, totalToPay, hr.hrName)}
                                  style={{
                                    background: totalToPay > 0 ? '#fee2e2' : '#f1f5f9',
                                    color: totalToPay > 0 ? '#dc2626' : '#94a3b8',
                                    border: totalToPay > 0 ? '1px solid #f87171' : '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    padding: '6px',
                                    cursor: totalToPay > 0 ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <X size={16} strokeWidth={3} />
                                </button>
                              </div>
                            <button
                              onClick={() => {
                                const originalHr = allReferrers.find(h => h.referralCode === hr.referralCode);
                                if (originalHr) {
                                  setSelectedHrForIncentive(originalHr);
                                  const initial = {};
                                  const hrApps = applications.filter(app => app.referredBy === originalHr.referralCode && (app.status === 'Selected' || app.status === 'Converted'));
                                  hrApps.forEach(app => { initial[app.id] = Number(app.incentiveAmount) || 0; });
                                  setIncentiveInput(initial);
                                  setIncentiveError('');
                                  setIncentiveModalOpen(true);
                                }
                              }}
                              style={{
                                background: 'transparent',
                                color: '#2563eb',
                                border: '1px solid #bfdbfe',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Gift size={12} /> Manage Incentives
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <JobFormModal
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        jobToEdit={jobToEdit}
        categories={categories}
        companies={companies}
        API_URL={API_URL}
        onSaveSuccess={fetchAllData}
      />

      <ItTrainingModal
        isOpen={itModalOpen}
        onClose={() => {
          setItModalOpen(false);
          setItProcessToEdit(null);
        }}
        processToEdit={itProcessToEdit}
        onSave={handleSaveItProcess}
      />

      <CategoryFormModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categoryToEdit={categoryToEdit}
        API_URL={API_URL}
        onSaveSuccess={fetchAllData}
      />

      <CompanyFormModal
        isOpen={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        companyToEdit={companyToEdit}
        categories={categories}
        API_URL={API_URL}
        onSaveSuccess={fetchAllData}
      />

      <ScheduleInterviewModal
        isOpen={interviewModalOpen}
        onClose={() => setInterviewModalOpen(false)}
        application={appToSchedule}
        API_URL={API_URL}
        onScheduledSuccess={fetchAllData}
      />

      {statusModalApp && (
        <div className="modal-overlay" onClick={() => setStatusModalApp(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Application Status</h3>
              <button className="btn-close" onClick={() => setStatusModalApp(null)}><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
                Candidate: <strong>{statusModalApp.candidateName}</strong><br />
                Job: <strong>{statusModalApp.jobTitle}</strong> ({statusModalApp.companyName})
              </div>

              <div className="form-group">
                <label className="form-label">Select Candidate Status</label>
                <select className="form-select" value={newAppStatus} onChange={e => setNewAppStatus(e.target.value)}>
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="HR Screening">HR Screening</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Recruiter Notes for Candidate</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Enter feedback or instructions for candidate..."
                  value={adminNoteInput}
                  onChange={e => setAdminNoteInput(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">HR Reference (Optional)</label>
                <select className="form-select" value={selectedHrRef} onChange={e => setSelectedHrRef(e.target.value)}>
                  <option value="">-- Direct (No HR Reference) --</option>
                  {hrs.map(h => (
                    <option key={h.id} value={h.referralCode}>
                      👤 {h.name} ({h.referralCode})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
                <button className="btn-secondary" onClick={() => setStatusModalApp(null)}>Cancel</button>
                <button className="btn-primary" onClick={handleUpdateApplicationStatus}>Save Status</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT HR REFERENCE MODAL ===== */}
      {hrRefModalApp && (
        <div className="modal-overlay" onClick={() => setHrRefModalApp(null)}>
          <div className="modal-content" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white' }}>
              <h3 style={{ color: 'white', margin: 0, fontSize: '1.15rem' }}>Assign / Change HR Reference</h3>
              <button className="btn-close" style={{ color: 'white' }} onClick={() => setHrRefModalApp(null)}><XCircle size={20} /></button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.775rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Candidate Application</div>
                <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem' }}>{hrRefModalApp.candidateName}</div>
                <div style={{ color: '#475569', fontSize: '0.85rem' }}>Job: <strong>{hrRefModalApp.jobTitle}</strong> ({hrRefModalApp.companyName})</div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, color: '#334155' }}>Select HR Reference</label>
                <select
                  className="form-select"
                  value={selectedHrRef}
                  onChange={e => setSelectedHrRef(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}
                >
                  <option value="">-- Direct (No HR Reference) --</option>
                  {hrs.map(h => (
                    <option key={h.id} value={h.referralCode}>
                      👤 {h.name} ({h.referralCode}) - {h.email}
                    </option>
                  ))}
                </select>
                <p style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '6px' }}>
                  💡 Assigning an HR reference will link this candidate application to the selected HR's referral dashboard.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.5rem' }}>
                <button className="btn-secondary" onClick={() => setHrRefModalApp(null)}>Cancel</button>
                <button
                  className="btn-primary"
                  disabled={savingHrRef}
                  onClick={handleUpdateHrReference}
                  style={{ background: '#2563eb' }}
                >
                  {savingHrRef ? 'Saving...' : 'Save HR Reference'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD / EDIT HR MODAL ===== */}
      {hrModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  {hrToEdit ? 'Edit HR Employee' : 'Add New HR Employee'}
                </h3>
                <p style={{ color: '#c4b5fd', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  {hrToEdit ? 'Update details, photo and credentials' : 'Create login credentials for the HR'}
                </p>
              </div>
              <button onClick={() => { setHrModalOpen(false); setHrToEdit(null); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                <XCircle size={20} />
              </button>
            </div>

            {/* Form Body */}
            <div style={{ padding: '2rem' }}>
              {hrError && (
                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid #fecaca' }}>
                  ⚠️ {hrError}
                </div>
              )}

              {/* Profile Photo Upload */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', width: '84px', height: '84px', borderRadius: '50%', background: '#f1f5f9', border: '3px solid #e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  {hrForm.profilePhoto ? (
                    <img src={hrForm.profilePhoto} alt="HR Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ fontSize: '2rem', color: '#6366f1', fontWeight: 800 }}>
                      {hrForm.name ? hrForm.name.charAt(0).toUpperCase() : 'HR'}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
                  <label style={{ cursor: 'pointer', background: '#eef2ff', color: '#4f46e5', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #c7d2fe', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    📷 Upload Photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                          setHrError('Image file is too large! Please select an image under 2MB.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setHrForm(prev => ({ ...prev, profilePhoto: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  {hrForm.profilePhoto && (
                    <button 
                      type="button"
                      onClick={() => setHrForm(prev => ({ ...prev, profilePhoto: '' }))}
                      style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={hrForm.name}
                  onChange={e => setHrForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. priya@company.com"
                  value={hrForm.email}
                  onChange={e => setHrForm(f => ({ ...f, email: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={hrForm.mobile}
                  onChange={e => setHrForm(f => ({ ...f, mobile: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>
                  {hrToEdit ? 'New Password (optional)' : 'Login Password *'}
                </label>
                <input
                  type="password"
                  placeholder={hrToEdit ? "Leave blank to keep current password" : "Set a password for this HR"}
                  value={hrForm.password}
                  onChange={e => setHrForm(f => ({ ...f, password: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
                <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '5px' }}>
                  {hrToEdit ? '💡 Enter a new password only if you wish to reset it.' : '💡 Itha password use panni HR this portal-la login panuvaanga. A unique referral link will be auto-generated for them.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setHrModalOpen(false); setHrToEdit(null); }}
                  style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Cancel
                </button>
                <button
                  disabled={hrSaving}
                  onClick={async () => {
                    if (!hrForm.name || !hrForm.email) {
                      setHrError('Name and Email are required!');
                      return;
                    }
                    if (!hrToEdit && !hrForm.password) {
                      setHrError('Password is required for new HR accounts!');
                      return;
                    }
                    setHrSaving(true);
                    setHrError('');
                    try {
                      // Save to local cache immediately
                      if (hrForm.profilePhoto) {
                        try {
                          const storedPhotos = JSON.parse(localStorage.getItem('hr_profile_photos') || '{}');
                          if (hrToEdit && hrToEdit.id) {
                            storedPhotos[hrToEdit.id] = hrForm.profilePhoto;
                          }
                          localStorage.setItem('hr_profile_photos', JSON.stringify(storedPhotos));
                        } catch (e) {
                          console.error(e);
                        }
                      } else if (hrToEdit && hrToEdit.id) {
                        try {
                          const storedPhotos = JSON.parse(localStorage.getItem('hr_profile_photos') || '{}');
                          delete storedPhotos[hrToEdit.id];
                          localStorage.setItem('hr_profile_photos', JSON.stringify(storedPhotos));
                        } catch (e) {
                          console.error(e);
                        }
                      }
                      let res;
                      if (hrToEdit) {
                        res = await fetch(`${API_URL}/api/users/hr/${hrToEdit.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(hrForm)
                        });
                        if (res.status === 404) {
                          // Fallback to profile route
                          res = await fetch(`${API_URL}/api/users/${hrToEdit.id}/profile`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              name: hrForm.name,
                              mobile: hrForm.mobile,
                              profilePhoto: hrForm.profilePhoto
                            })
                          });
                        }
                      } else {
                        res = await fetch(`${API_URL}/api/users/hr`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(hrForm)
                        });
                      }

                      let data;
                      try {
                        data = await res.json();
                      } catch {
                        setHrError(`Server response error (${res.status}). Please try again.`);
                        setHrSaving(false);
                        return;
                      }

                      if (!res.ok || data.error) {
                        setHrError(data.error || `Error ${res.status}: Could not save HR account.`);
                      } else {
                        if (data && data.id && hrForm.profilePhoto) {
                          try {
                            const storedPhotos = JSON.parse(localStorage.getItem('hr_profile_photos') || '{}');
                            storedPhotos[data.id] = hrForm.profilePhoto;
                            localStorage.setItem('hr_profile_photos', JSON.stringify(storedPhotos));
                          } catch (e) {}
                        }
                        if (hrToEdit) {
                          setHrs(prev => prev.map(h => h.id === hrToEdit.id ? { ...h, ...hrForm } : h));
                        }
                        setHrModalOpen(false);
                        setHrToEdit(null);
                        fetchAllData();
                      }
                    } catch (err) {
                      console.error(err);
                      setHrError('Network error. Failed to save HR user.');
                    } finally {
                      setHrSaving(false);
                    }
                  }}
                  style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', opacity: hrSaving ? 0.7 : 1 }}
                >
                  {hrSaving ? 'Saving...' : (hrToEdit ? 'Save Changes' : 'Create HR Account')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Incentive Modal */}
      {incentiveModalOpen && selectedHrForIncentive && (
        <div className="modal-overlay" onClick={() => setIncentiveModalOpen(false)}>
          <div className="modal-content animate-fade" style={{ maxWidth: '640px', borderRadius: '14px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', borderTopLeftRadius: '14px', borderTopRightRadius: '14px', padding: '1.25rem 1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'white', fontWeight: 800 }}>🎁 Update HR Incentives</h3>
                <p style={{ fontSize: '0.825rem', color: '#d1fae5', marginTop: '2px' }}>{selectedHrForIncentive.name} ({selectedHrForIncentive.referralCode})</p>
              </div>
              <button onClick={() => setIncentiveModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer' }}>
                <XCircle size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {incentiveError && (
                <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #fecaca' }}>
                  {incentiveError}
                </div>
              )}

              {(() => {
                const closedApps = getHrClosedApps(selectedHrForIncentive);
                const total = Object.values(incentiveInput).reduce((s, v) => s + (Number(v) || 0), 0);
                return (
                  <>
                    <label className="form-label" style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', display: 'block' }}>
                      Closed Candidates ({closedApps.length})
                    </label>

                    {closedApps.length === 0 ? (
                      <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                        No closed candidates yet for {selectedHrForIncentive.name}.<br />
                        Mark an application as <b>Selected</b> / <b>Converted</b> to add an incentive.
                      </div>
                    ) : (
                      <div style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                        {closedApps.map((app, idx) => (
                          <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderTop: idx === 0 ? 'none' : '1px solid #f1f5f9' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{app.candidateName}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {app.companyName} · {app.jobTitle} {app.candidateMobile ? `· ${app.candidateMobile}` : ''}
                              </div>
                              <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '0.7rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 8px', borderRadius: '999px' }}>
                                {app.status}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontWeight: 700, color: '#059669' }}>₹</span>
                                <input
                                  type="number"
                                  className="form-input"
                                  style={{ width: '90px', fontWeight: 700, padding: '8px 10px' }}
                                  value={incentiveInput[app.id] ?? 0}
                                  onChange={e => setIncentiveInput(prev => ({ ...prev, [app.id]: e.target.value }))}
                                  min="0"
                                  placeholder="0"
                                />
                              </div>
                              {app.incentiveAmount > 0 && Number(incentiveInput[app.id] || 0) === app.incentiveAmount && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.preventDefault(); handleToggleIncentiveStatus(app); }}
                                  style={{
                                    background: app.incentiveStatus === 'Paid' ? '#10b981' : (app.incentiveStatus === 'Withdraw Requested' ? '#3b82f6' : '#fef08a'),
                                    color: app.incentiveStatus === 'Paid' ? '#fff' : (app.incentiveStatus === 'Withdraw Requested' ? '#fff' : '#854d0e'),
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '6px 10px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '75px'
                                  }}
                                  title={app.incentiveStatus === 'Withdraw Requested' ? 'HR requested withdrawal' : ''}
                                >
                                  {app.incentiveStatus === 'Paid' ? 'Paid ✓' : (app.incentiveStatus === 'Withdraw Requested' ? 'Pay Request' : 'Pay Now')}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '12px 16px' }}>
                      <span style={{ fontWeight: 700, color: '#065f46' }}>Total Incentives</span>
                      <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#047857' }}>₹{total.toLocaleString()}</span>
                    </div>
                    <small style={{ color: '#64748b', fontSize: '0.775rem', marginTop: '6px', display: 'block' }}>
                      Each candidate's incentive and the total will be shown in {selectedHrForIncentive.name}'s HR Workspace.
                    </small>
                  </>
                );
              })()}

              <div style={{ display: 'flex', gap: '12px', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIncentiveModalOpen(false)}
                  style={{ flex: 1, padding: '10px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={incentiveSaving}
                  onClick={async () => {
                    setIncentiveSaving(true);
                    setIncentiveError('');
                    try {
                      const items = Object.entries(incentiveInput).map(([applicationId, amount]) => ({ applicationId, amount: Number(amount) || 0 }));
                      const res = await fetch(`${API_URL}/api/users/hr/${selectedHrForIncentive.id}/candidate-incentives`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ items })
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || 'Failed to update incentives');
                      setIncentiveModalOpen(false);
                      fetchAllData();
                    } catch (err) {
                      setIncentiveError(err.message);
                    } finally {
                      setIncentiveSaving(false);
                    }
                  }}
                  style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                >
                  {incentiveSaving ? 'Saving...' : '✅ Save Incentive'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Application Modal - Admin Only */}
      {manualAppModalOpen && (
        <ManualApplicationModal
          isOpen={manualAppModalOpen}
          onClose={() => setManualAppModalOpen(false)}
          jobs={jobs.filter(j => j.status === 'Active' || !j.status)}
          itProcesses={itProcesses}
          hrs={hrs}
          API_URL={API_URL}
          onSuccess={() => {
            setManualAppModalOpen(false);
            fetchAllData();
          }}
        />
      )}

      {/* Bank Info Modal */}
      {bankInfoModal && (
        <div className="modal-overlay" onClick={() => setBankInfoModal(null)}>
          <div className="modal-content animate-fade" style={{ maxWidth: '400px', borderRadius: '16px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '1.5rem', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={20} /> Bank Details
                </h3>
                <button onClick={() => setBankInfoModal(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>{bankInfoModal.hrName} ({bankInfoModal.referralCode})</p>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {bankInfoModal.bankAccountNumber && bankInfoModal.bankIfscCode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Account Number</div>
                    <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700, letterSpacing: '1px' }}>{bankInfoModal.bankAccountNumber}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>IFSC Code</div>
                    <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700, letterSpacing: '1px' }}>{bankInfoModal.bankIfscCode}</div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ background: '#fef2f2', color: '#ef4444', display: 'inline-flex', padding: '12px', borderRadius: '50%', marginBottom: '1rem' }}>
                    <XCircle size={32} />
                  </div>
                  <h4 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '1.1rem' }}>No Bank Details</h4>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>This user has not updated their bank details in their Profile Settings yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
