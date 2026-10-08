import React, { useState, useEffect, useMemo } from 'react';
import { Share2, Users, MousePointerClick, Copy, ChevronDown, ChevronUp, Phone, Mail, MapPin, Calendar, Briefcase, LayoutDashboard, Gift, CalendarDays, Settings, Search, Download, Bell, X, FileText, CheckCircle, UserCog, GraduationCap, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import AgentsManager from './AgentsManager';
import SubAgentsManager from './SubAgentsManager';

const getCompanyColor = (name) => {
  const lowerName = (name || '').toLowerCase();
  if (lowerName.includes('idfc')) return '#991b1b';
  if (lowerName.includes('bandhan')) return '#0369a1';
  if (lowerName.includes('hdfc')) return '#1d4ed8';
  if (lowerName.includes('aditya birla')) return '#b91c1c';
  if (lowerName.includes('kotak')) return '#003366';
  if (lowerName.includes('mahindra finance')) return '#e11d48';
  if (lowerName.includes('axis')) return '#831843';
  if (lowerName.includes('icici')) return '#ea580c';
  if (lowerName.includes('yes bank')) return '#0284c7';
  if (lowerName.includes('tata aig')) return '#1e3a8a';
  if (lowerName.includes('fic') || lowerName.includes('pan india')) return '#d97706';
  return '#475569';
};

export default function HrDashboard({ API_URL, currentUser, sidebarOpen, setSidebarOpen, isAgent = false }) {
  const roleLabel = isAgent ? 'Partner' : 'HR';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expandedApp, setExpandedApp] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const [activeTab, setActiveTab] = useState('overview');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);

  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  
  const [showPartnerIncentiveModal, setShowPartnerIncentiveModal] = useState(false);
  const [selectedJobForIncentive, setSelectedJobForIncentive] = useState(null);
  const [partnerIncentiveForm, setPartnerIncentiveForm] = useState({ freeJobIncentive: 0, paidJobIncentive: 0, processIncentives: {} });

  // Modals for HR Actions
  const [statusModalApp, setStatusModalApp] = useState(null);
  const [newAppStatus, setNewAppStatus] = useState('');
  const [adminNoteInput, setAdminNoteInput] = useState('');
  
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [appToSchedule, setAppToSchedule] = useState(null);

  const [agentIncentiveModalApp, setAgentIncentiveModalApp] = useState(null);
  const [agentIncentiveInput, setAgentIncentiveInput] = useState('');
  const [savingAgentIncentive, setSavingAgentIncentive] = useState(false);

  const [profileData, setProfileData] = useState({
    name: currentUser.name || '',
    bankAccountNumber: currentUser.bankAccountNumber || '',
    bankIfscCode: currentUser.bankIfscCode || '',
    bankName: currentUser.bankName || '',
    bankBranch: currentUser.bankBranch || '',
    accountHolderName: currentUser.accountHolderName || ''
  });
  const hasBankDetails = Boolean(currentUser.bankAccountNumber && currentUser.bankIfscCode);
  const [isEditingBankDetails, setIsEditingBankDetails] = useState(!hasBankDetails);
  const [profileSaving, setProfileSaving] = useState(false);

  const handleProfileSave = async () => {
    setProfileSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${currentUser.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const data = await res.json();
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      setIsEditingBankDetails(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const candidatePortalBaseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5173'
    : 'https://jobs.forgeindiaconnect.in';

  const referralLink = `${candidatePortalBaseUrl}?ref=${currentUser.referralCode}`;

  const fetchStats = () => {
    fetch(`${API_URL}/api/users/hr/${currentUser.referralCode}/dashboard`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchInterviews = () => {
    fetch(`${API_URL}/api/interviews`)
      .then(res => res.json())
      .then(data => {
        // Only keep interviews related to candidates mapped to this HR
        if (stats?.applications) {
          const hrCandidateIds = stats.applications.map(a => a.candidateId);
          const hrInterviews = data.filter(i => hrCandidateIds.includes(i.candidateId));
          setInterviews(hrInterviews);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [API_URL, currentUser]);

  useEffect(() => {
    if (activeTab === 'interviews' && stats) {
      fetchInterviews();
    }
  }, [activeTab, stats]);

  useEffect(() => {
    if (activeTab === 'jobs') {
      Promise.all([
        fetch(`${API_URL}/api/jobs?status=Active`).then(res => res.json()),
        fetch(`${API_URL}/api/it-training-processes`).then(res => res.json()),
        fetch(`${API_URL}/api/settings/it-training-incentives`).then(res => res.json()).catch(() => ({})),
        fetch(`${API_URL}/api/partner-incentives?hrId=${isAgent ? currentUser.parentHrId : currentUser.id}`).then(res => res.json()).catch(() => ([]))
      ])
      .then(([jobsData, itData, globalIncentives, partnerIncentives]) => {
        const standardJobs = Array.isArray(jobsData) ? jobsData : [];
        let combinedItJob = null;
        if (Array.isArray(itData)) {
          const placementProcesses = itData.filter(it => it.itCategory === 'Placement');
          if (placementProcesses.length > 0) {
            const uniqueProcesses = [];
            const seen = new Set();
            placementProcesses.forEach(p => {
              const pName = p.processName?.toUpperCase().trim();
              if (pName && !seen.has(pName)) {
                seen.add(pName);
                p.hrIncentiveAmount = globalIncentives?.[pName] || 0;
                uniqueProcesses.push(p);
              }
            });
            uniqueProcesses.sort((a,b) => a.processName.localeCompare(b.processName));

            combinedItJob = {
              id: 'combined-it-training',
              isCombinedItTraining: true,
              title: 'FIC IT Training & 100% Placement Programme',
              companyName: 'PAN India Opportunities',
              processes: uniqueProcesses
            };
          }
        }
        
        const allJobs = combinedItJob ? [combinedItJob, ...standardJobs] : standardJobs;
        
        // Attach partner incentives to jobs
        const mappedJobs = allJobs.map(job => {
          const pi = partnerIncentives.find(p => p.jobId === job.id) || {};
          if (job.isCombinedItTraining) {
             job.partnerProcessIncentives = pi.processIncentives || {};
          } else {
             job.partnerIncentiveFree = pi.freeJobIncentive || 0;
             job.partnerIncentivePaid = pi.paidJobIncentive || 0;
          }
          return job;
        });

        setJobs(mappedJobs);
      })
      .catch(err => console.error('Error fetching jobs:', err));
    }
  }, [API_URL, activeTab]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = `Hey! Check out these amazing job openings at Forge India Connect: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const toggleExpand = (appId) => {
    setExpandedApp(expandedApp === appId ? null : appId);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/applications/${statusModalApp.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newAppStatus, adminNotes: adminNoteInput })
      });
      if (res.ok) {
        showToast('Status updated successfully');
        setStatusModalApp(null);
        fetchStats();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating status', 'error');
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
        fetchInterviews();
        showToast('Interview status updated');
      } else {
        showToast('Failed to update interview status', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating interview status', 'error');
    }
  };

  const handleSavePartnerIncentive = async () => {
    try {
      const payload = {
        hrId: currentUser.id,
        jobId: selectedJobForIncentive.id,
        ...partnerIncentiveForm
      };
      const res = await fetch(`${API_URL}/api/partner-incentives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Partner incentive saved successfully!');
        setShowPartnerIncentiveModal(false);
        // Refresh jobs to show updated partner incentives locally
        setJobs(prevJobs => prevJobs.map(j => {
          if (j.id === selectedJobForIncentive.id) {
            if (j.isCombinedItTraining) {
              return { ...j, partnerProcessIncentives: { ...partnerIncentiveForm.processIncentives } };
            } else {
              return { ...j, partnerIncentiveFree: partnerIncentiveForm.freeJobIncentive, partnerIncentivePaid: partnerIncentiveForm.paidJobIncentive };
            }
          }
          return j;
        }));
      } else {
        showToast('Failed to save partner incentive', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving partner incentive', 'error');
    }
  };

  const handleAssignAgentIncentive = async (e) => {
    e.preventDefault();
    if (!agentIncentiveModalApp) return;
    setSavingAgentIncentive(true);
    try {
      // HR assigns incentive for an agent's application
      const res = await fetch(`${API_URL}/api/users/hr/${currentUser.id}/agent-incentives`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ applicationId: agentIncentiveModalApp.id, amount: Number(agentIncentiveInput) || 0 }],
          referralCode: agentIncentiveModalApp.referredBy
        })
      });
      if (res.ok) {
        showToast('Agent incentive assigned');
        setAgentIncentiveModalApp(null);
        setAgentIncentiveInput('');
        fetchStats();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Failed to assign incentive', 'error');
      }
    } catch (err) {
      showToast('Error assigning incentive', 'error');
    } finally {
      setSavingAgentIncentive(false);
    }
  };

  // Filter Data
  const filteredApps = useMemo(() => {
    if (!stats?.applications) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    return stats.applications.filter(app => {
      const matchesSearch = app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (app.candidateMobile && app.candidateMobile.includes(searchTerm));
      const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'All' && app.appliedAt) {
        const appDate = new Date(app.appliedAt);
        const appDateMidnight = new Date(appDate.getFullYear(), appDate.getMonth(), appDate.getDate()).getTime();
        
        if (dateFilter === 'Today') {
          matchesDate = appDateMidnight === today;
        } else if (dateFilter === 'Yesterday') {
          const yesterday = today - 86400000;
          matchesDate = appDateMidnight === yesterday;
        } else if (dateFilter === 'Last 7 Days') {
          const sevenDaysAgo = today - (7 * 86400000);
          matchesDate = appDateMidnight >= sevenDaysAgo;
        } else if (dateFilter === 'This Month') {
          matchesDate = appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [stats, searchTerm, statusFilter, dateFilter]);

  const recentIncentiveApps = useMemo(() => {
    if (!stats || !stats.applications) return [];
    return [...stats.applications]
      .filter(app => app.status !== 'Rejected')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5); // top 5 recent applications
  }, [stats]);

  // Analytics Data
  const chartData = useMemo(() => {
    if (!stats?.applications) return [];
    const dateCounts = {};
    [...stats.applications].reverse().forEach(app => {
      const date = new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });
    
    const dataArray = Object.keys(dateCounts).map(date => ({
      name: date,
      Candidates: dateCounts[date]
    }));
    return dataArray.slice(-7);
  }, [stats]);

  // Export CSV
  const exportToCSV = () => {
    if (!filteredApps.length) return;
    const headers = ['Name', 'Mobile', 'Email', 'City', 'Experience', 'Job Title', 'Company', 'Status', 'Applied At'];
    const rows = filteredApps.map(app => [
      app.candidateName,
      app.candidateMobile || 'N/A',
      app.candidateEmail || 'N/A',
      app.candidateLocation || 'N/A',
      app.candidateExperience || 'N/A',
      app.jobTitle,
      app.companyName,
      app.status,
      new Date(app.appliedAt).toLocaleDateString('en-IN')
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(item => `"${item}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Candidates_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const recentNotifications = useMemo(() => {
    if (!stats?.applications) return [];
    return stats.applications.slice(0, 3).map(app => ({
      id: app.id,
      text: `${app.candidateName} just applied for ${app.jobTitle}!`,
      time: new Date(app.appliedAt).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})
    }));
  }, [stats]);

  const getStatusBadge = (status) => {
    if (status === 'Applied') return <span style={{ color: '#0f172a', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Applied</span>;
    if (status === 'Shortlisted') return <span style={{ color: '#047857', background: '#d1fae5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Shortlisted</span>;
    if (status === 'Interview Scheduled') return <span style={{ color: '#1d4ed8', background: '#dbeafe', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Interview Scheduled</span>;
    if (status === 'Selected' || status === 'Converted') return <span style={{ color: '#047857', background: '#ecfdf5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #10b981' }}>{status}</span>;
    if (status === 'Rejected' || status === 'Not Interested') return <span style={{ color: '#be123c', background: '#ffe4e6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{status}</span>;
    if (status === 'Follow up') return <span style={{ color: '#b45309', background: '#fef3c7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Follow up</span>;
    return <span style={{ color: '#475569', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{status}</span>;
  };

  return (
    <div className="admin-layout animate-fade">
      
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'mobile-open' : ''}`} style={{ padding: '1.5rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '4px' }}>{roleLabel} Workspace</h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Manage your referrals</p>
        </div>

        <div className="sidebar-nav" style={{ display: 'flex', flexDirection: window.innerWidth > 768 ? 'column' : 'row', gap: '0.5rem', overflowX: 'auto', paddingBottom: window.innerWidth > 768 ? '0' : '0.5rem' }}>
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setActiveTab('overview'); setSidebarOpen && setSidebarOpen(false); }} style={{ whiteSpace: 'nowrap' }}>
            <LayoutDashboard size={18} /><span>Overview</span>
          </button>

          <button className={`nav-item ${activeTab === 'applied' ? 'active' : ''}`} onClick={() => { setActiveTab('applied'); setSidebarOpen && setSidebarOpen(false); }} style={{ whiteSpace: 'nowrap' }}>
            <Users size={18} /><span>Applied</span>
          </button>

          <button className={`nav-item ${activeTab === 'interviews' ? 'active' : ''}`} onClick={() => { setActiveTab('interviews'); setSidebarOpen && setSidebarOpen(false); }} style={{ whiteSpace: 'nowrap' }}>
            <CalendarDays size={18} /><span>Interviews</span>
          </button>

          <button id="hr-agents-tab" className={`nav-item ${activeTab === 'agents' ? 'active' : ''}`} onClick={() => { setActiveTab('agents'); setSidebarOpen && setSidebarOpen(false); }} style={{ whiteSpace: 'nowrap' }}>
            <UserCog size={18} /><span>{isAgent ? 'My Partners' : 'Partners'}</span>
          </button>
          
          <button className={`nav-item ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => { setActiveTab('jobs'); setSidebarOpen && setSidebarOpen(false); }} style={{ whiteSpace: 'nowrap' }}>
            <Briefcase size={18} /><span>Incentive Slot</span>
          </button>

          <button className={`nav-item ${activeTab === 'incentives' ? 'active' : ''}`} onClick={() => { setActiveTab('incentives'); setSidebarOpen && setSidebarOpen(false); }} style={{ whiteSpace: 'nowrap' }}>
            <Gift size={18} /><span>Incentives</span>
          </button>

          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setSidebarOpen && setSidebarOpen(false); }} style={{ whiteSpace: 'nowrap' }}>
            <Settings size={18} /><span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-main" style={{ flex: 1, padding: window.innerWidth > 768 ? '2rem' : '1rem' }}>
        
        {/* Header with Notifications */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', color: '#0f172a' }}>{activeTab === 'overview' ? `Welcome, ${currentUser.name}!` : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <p style={{ color: '#64748b' }}>Here is your personal {roleLabel} Dashboard.</p>
          </div>
          
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', padding: '10px', cursor: 'pointer', position: 'relative' }}
            >
              <Bell size={20} color="#64748b" />
              {recentNotifications.length > 0 && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                  {recentNotifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div style={{ position: 'absolute', right: 0, top: '45px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', width: '300px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a' }}>Recent Activity</h4>
                  <X size={16} color="#64748b" cursor="pointer" onClick={() => setShowNotifications(false)} />
                </div>
                <div style={{ padding: '8px' }}>
                  {recentNotifications.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>No recent notifications</div>
                  ) : (
                    recentNotifications.map((notif, idx) => (
                      <div key={idx} style={{ padding: '10px', display: 'flex', gap: '12px', borderBottom: idx !== recentNotifications.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <div style={{ background: '#ecfdf5', color: '#10b981', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Users size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>{notif.text}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>{notif.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {activeTab === 'agents' && !isAgent && (
          <AgentsManager
            API_URL={API_URL}
            currentUser={currentUser}
            candidatePortalBaseUrl={candidatePortalBaseUrl}
            showToast={showToast}
          />
        )}

        {activeTab === 'agents' && isAgent && (
          <SubAgentsManager
            API_URL={API_URL}
            currentUser={currentUser}
            candidatePortalBaseUrl={candidatePortalBaseUrl}
            showToast={showToast}
          />
        )}

        {activeTab === 'overview' && (
          <div className="animate-fade">
            
            <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', padding: '1.5rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', fontWeight: 'bold' }}>Your Unique Referral Link</h3>
                <p style={{ color: '#e0e7ff', fontSize: '0.85rem' }}>Share this link with candidates. Anyone who opens or applies using this link will be tracked under your account.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input type="text" readOnly value={referralLink} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', color: '#0f172a', fontWeight: 'bold', minWidth: '200px', fontSize: '0.9rem' }} />
                <button className="btn-primary" onClick={copyToClipboard} style={{ background: copied ? '#059669' : '#10b981', border: 'none', transition: 'background 0.3s' }}>
                  <Copy size={16} /> {copied ? 'Copied' : 'Copy'}
                </button>
                <button className="btn-primary" onClick={shareOnWhatsApp} style={{ background: '#25D366', border: 'none', color: 'white' }}>
                  <Share2 size={16} /> WhatsApp
                </button>
              </div>
            </div>

            {recentIncentiveApps.length > 0 && (
              <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 600, margin: 0 }}>Recent Activity Alerts</h3>
                {recentIncentiveApps.map(app => {
                  const amt = currentUser.role === 'agent' ? app.agentIncentiveAmount : app.incentiveAmount;
                  const amtStr = amt ? `₹${amt}` : '';
                  return (
                    <div key={app.id} style={{
                      background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '12px 16px',
                      display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      color: '#92400e', fontSize: '0.95rem'
                    }}>
                      <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '50%', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={20} />
                      </div>
                      <div style={{ flex: 1, lineHeight: '1.4' }}>
                        🎉 Candidate <span style={{ fontWeight: 600 }}>{app.candidateName}</span> just applied for <span style={{ fontWeight: 600 }}>{app.jobTitle || 'a role'}</span> at <span style={{ fontWeight: 600 }}>{app.companyName || 'our partner company'}</span>! your incentive <span style={{ color: '#059669', fontWeight: 'bold' }}>{amtStr}</span> is on the way. Close fast! 🔥
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="kpi-grid">
              <div className="kpi-card" style={{ borderLeft: '4px solid #6366f1', background: '#eef2ff' }}>
                <div className="kpi-icon" style={{ background: '#c7d2fe', color: '#4f46e5' }}><MousePointerClick size={20} /></div>
                <div><div className="kpi-val">{stats ? stats.linkClicks : 0}</div><div className="kpi-label">Total Link Clicks</div></div>
              </div>
              <div className="kpi-card" style={{ borderLeft: '4px solid #10b981', background: '#ecfdf5' }}>
                <div className="kpi-icon" style={{ background: '#a7f3d0', color: '#059669' }}><Users size={20} /></div>
                <div><div className="kpi-val">{stats ? stats.totalApplications : 0}</div><div className="kpi-label">Candidates Applied</div></div>
              </div>
            </div>

            {chartData.length > 0 && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1.5rem' }}>Application Trends (Last 7 Days)</h3>
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="Candidates" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Applied Candidates Tab */}
        {activeTab === 'applied' && (
          <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 className="section-title" style={{ margin: 0 }}>Your Candidates</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="#64748b" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                  <input type="text" placeholder="Search name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '8px 12px 8px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '220px', outline: 'none' }} />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: 'white' }}>
                  <option value="All">All Statuses</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: 'white' }}>
                  <option value="All">All Time</option>
                  <option value="Today">Today</option>
                  <option value="Yesterday">Yesterday</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="This Month">This Month</option>
                </select>
                <button onClick={exportToCSV} className="btn-primary" style={{ background: '#0f172a', border: 'none', padding: '8px 16px', display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.85rem' }}>
                  <Download size={16} /> Export CSV
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredApps.map(app => (
                <div key={app.id} style={{
                  background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden',
                  transition: 'box-shadow 0.2s', boxShadow: expandedApp === app.id ? '0 4px 15px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <div onClick={() => toggleExpand(app.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 }}>
                        {app.candidateName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{app.candidateName}</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{app.candidateMobile}</div>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>{app.jobTitle}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{app.companyName}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {getStatusBadge(app.status)}
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      {expandedApp === app.id ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                    </div>
                  </div>

                  {expandedApp === app.id && (
                    <div style={{ borderTop: '1px solid #e2e8f0', padding: '20px', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}><Users size={16} /></div>
                            <div><div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Full Name</div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>{app.candidateName}</div></div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><Phone size={16} /></div>
                            <div><div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Mobile Number</div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>{app.candidateMobile || 'N/A'}</div></div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}><Calendar size={16} /></div>
                            <div><div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Date of Birth</div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>{app.candidateDOB ? new Date(app.candidateDOB).toLocaleDateString('en-IN') : 'N/A'}</div></div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}><MapPin size={16} /></div>
                            <div><div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>City</div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>{app.candidateLocation || 'N/A'}</div></div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}><Briefcase size={16} /></div>
                            <div><div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Experience</div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>{app.candidateExperience || 'N/A'}</div></div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}><Mail size={16} /></div>
                            <div><div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Email Address</div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>{app.candidateEmail || 'N/A'}</div></div>
                          </div>
                        </div>
                        
                        {/* HR Actions Panel */}
                        <div style={{ minWidth: '220px', background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                          <h4 style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '12px', marginTop: 0 }}>HR Actions</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                              className="btn-primary"
                              style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem', display: 'flex', justifyContent: 'center' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusModalApp(app);
                                setNewAppStatus(app.status);
                                setAdminNoteInput(app.adminNotes || '');
                              }}
                            >
                              Update Status
                            </button>
                            <button
                              className="btn-secondary"
                              style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', background: '#f8fafc', color: '#2563eb', border: '1px solid #bfdbfe' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setAppToSchedule(app);
                                setInterviewModalOpen(true);
                              }}
                            >
                              Schedule Interview
                            </button>
                            {app.candidateResumeUrl && (
                              <a href={app.candidateResumeUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px 12px', background: '#ecfdf5', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>
                                <FileText size={14} /> View Resume
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {filteredApps.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                  <Search size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                  <p style={{ fontSize: '1rem', fontWeight: 500 }}>No candidates found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interviews Tab */}
        {activeTab === 'interviews' && (
          <div className="animate-fade">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#0f172a', margin: 0 }}>Scheduled Interviews</h3>
            </div>

            {interviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <CalendarDays size={64} color="#94a3b8" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.4rem', color: '#334155', marginBottom: '0.5rem' }}>No Scheduled Interviews</h3>
                <p style={{ color: '#64748b' }}>When you schedule interviews for candidates, they will appear here.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Process</th>
                      <th>Date & Time</th>
                      <th>Mode & Details</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interviews.map(int => {
                      const relatedApp = stats?.applications?.find(a => a.id === int.applicationId);
                      return (
                      <tr key={int.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{relatedApp ? relatedApp.candidateName : int.candidateName}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{relatedApp ? relatedApp.jobTitle : int.jobTitle}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{relatedApp ? relatedApp.companyName : int.companyName}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} color="#2563eb" /> {new Date(int.date).toLocaleDateString()}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            🕒 {int.time}
                          </div>
                        </td>
                        <td>
                          <span style={{ 
                            background: int.mode === 'Online' ? '#dbeafe' : '#fef3c7', 
                            color: int.mode === 'Online' ? '#1d4ed8' : '#b45309',
                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600
                          }}>
                            {int.mode}
                          </span>
                          {int.mode === 'Online' && int.meetingLink && (
                            <a href={int.meetingLink} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: '0.8rem', color: '#2563eb', marginTop: '6px' }}>Join Link</a>
                          )}
                          {int.mode === 'Offline' && int.location && (
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>{int.location}</div>
                          )}
                        </td>

                        <td>
                          <select
                            className="status-dropdown"
                            value={int.status || 'Scheduled'}
                            onChange={(e) => handleInterviewStatusChange(int.id || int._id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              backgroundColor: '#f8fafc',
                              color: '#0f172a',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Document Submitted">Document Submitted</option>
                            <option value="L1 Selected">L1 Selected</option>
                            <option value="L2 Selected">L2 Selected</option>
                            <option value="2 Times re-scheduled interview">2 Times re-scheduled interview</option>
                            <option value="Enrollment">Enrollment</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            onClick={() => {
                              const relatedApp = stats?.applications?.find(a => a.id === int.applicationId);
                              if (relatedApp) {
                                setStatusModalApp(relatedApp);
                                setNewAppStatus(relatedApp.status);
                                setAdminNoteInput(relatedApp.adminNotes || '');
                              } else {
                                alert("Application details not found for this interview.");
                              }
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

        {/* Settings Tab */}
        {activeTab === 'jobs' && (
          <div className="animate-fade">
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>Incentive Slot</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                View all active job requirements and the incentive you earn for each successful selection.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {jobs.map((job, index) => {
                const compColor = getCompanyColor(job.companyName);
                const bgGradient = `linear-gradient(135deg, ${compColor} 0%, ${compColor}dd 100%)`;

                if (job.isCombinedItTraining) {
                  return (
                    <div key={job.id} style={{ background: bgGradient, borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ padding: '4px', background: '#ffffff', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.5)', flexShrink: 0, width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src="/logo.png" alt="FIC Logo" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px' }} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff', fontWeight: 800, lineHeight: 1.2 }}>{job.title}</h3>
                          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', marginTop: '2px', fontWeight: 500 }}>{job.companyName}</div>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                          {isAgent ? 'Partner Incentive per Candidate:' : 'Your Incentive per Candidate:'}
                        </div>
                        {job.processes.map((p) => (
                          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.15)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.processName}</span>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                              Rs. {isAgent ? (job.partnerProcessIncentives?.[p.processName] || 0) : (p.hrIncentiveAmount || 0)}
                            </div>
                          </div>
                        ))}
                        {!isAgent && (
                          <button
                            onClick={() => {
                              setSelectedJobForIncentive(job);
                              setPartnerIncentiveForm({
                                freeJobIncentive: 0,
                                paidJobIncentive: 0,
                                processIncentives: job.partnerProcessIncentives || {}
                              });
                              setShowPartnerIncentiveModal(true);
                            }}
                            style={{ background: 'white', color: bgGradient.match(/#([0-9a-fA-F]{6})/)?.[1] ? `#${bgGradient.match(/#([0-9a-fA-F]{6})/)[1]}` : '#333', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }}
                          >
                            Set Partner Incentive
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                <div key={job.id} style={{ background: bgGradient, borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {job.companyLogo ? (
                      <div style={{ padding: '4px', background: '#ffffff', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.5)', flexShrink: 0, width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={job.companyLogo} alt={job.companyName} style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px' }} />
                      </div>
                    ) : (
                      <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
                        <Briefcase size={24} color="#ffffff" />
                      </div>
                    )}
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff', fontWeight: 800, lineHeight: 1.2 }}>{job.title}</h3>
                      <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', marginTop: '2px', fontWeight: 500 }}>{job.companyName}</div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                      {isAgent ? 'Partner Incentive per Candidate:' : 'Your Incentive per Candidate:'}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 12px', borderRadius: '24px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Free Job:</span> Rs. {isAgent ? (job.partnerIncentiveFree || 0) : (job.hrIncentiveFree || 0)}
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 12px', borderRadius: '24px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Paid Job:</span> Rs. {isAgent ? (job.partnerIncentivePaid || 0) : (job.hrIncentivePaid || 0)}
                      </div>
                    </div>
                    {!isAgent && (
                      <button
                        onClick={() => {
                          setSelectedJobForIncentive(job);
                          setPartnerIncentiveForm({
                            freeJobIncentive: job.partnerIncentiveFree || 0,
                            paidJobIncentive: job.partnerIncentivePaid || 0,
                            processIncentives: {}
                          });
                          setShowPartnerIncentiveModal(true);
                        }}
                        style={{ background: 'white', color: bgGradient.match(/#([0-9a-fA-F]{6})/)?.[1] ? `#${bgGradient.match(/#([0-9a-fA-F]{6})/)[1]}` : '#333', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }}
                      >
                        Set Partner Incentive
                      </button>
                    )}
                  </div>
                </div>
              )})}
              {jobs.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748b', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  No active incentive slots found.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-fade" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={22} color="#3b82f6" /> Profile Settings
            </h3>
            
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.name} 
                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                    className="form-input" 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Email Address</label>
                  <input 
                    type="email" 
                    defaultValue={currentUser.email} 
                    readOnly
                    disabled 
                    style={{ background: '#f8fafc', width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b', cursor: 'not-allowed', outline: 'none' }} 
                    title="Email address cannot be changed"
                  />
                  <small style={{ color: '#ef4444', display: 'block', marginTop: '4px' }}>* Login email cannot be changed.</small>
                </div>
                <div style={{ borderTop: '1px solid #e2e8f0', margin: '1rem 0' }}></div>
                <h4 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0' }}>Bank Account Details</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '-10px' }}>Required for incentive payouts</p>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Account Holder Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter account holder name" 
                    value={profileData.accountHolderName}
                    onChange={e => setProfileData({ ...profileData, accountHolderName: e.target.value })}
                    className="form-input" 
                    disabled={!isEditingBankDetails}
                    style={{ background: !isEditingBankDetails ? '#f8fafc' : '#fff', cursor: !isEditingBankDetails ? 'not-allowed' : 'text' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Bank Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter bank name" 
                    value={profileData.bankName}
                    onChange={e => setProfileData({ ...profileData, bankName: e.target.value })}
                    className="form-input" 
                    disabled={!isEditingBankDetails}
                    style={{ background: !isEditingBankDetails ? '#f8fafc' : '#fff', cursor: !isEditingBankDetails ? 'not-allowed' : 'text' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Account Number</label>
                  <input 
                    type="text" 
                    placeholder="Enter account number" 
                    value={profileData.bankAccountNumber}
                    onChange={e => setProfileData({ ...profileData, bankAccountNumber: e.target.value })}
                    className="form-input" 
                    disabled={!isEditingBankDetails}
                    style={{ background: !isEditingBankDetails ? '#f8fafc' : '#fff', cursor: !isEditingBankDetails ? 'not-allowed' : 'text' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>IFSC Code</label>
                  <input 
                    type="text" 
                    placeholder="Enter IFSC code" 
                    value={profileData.bankIfscCode}
                    onChange={e => setProfileData({ ...profileData, bankIfscCode: e.target.value })}
                    className="form-input" 
                    disabled={!isEditingBankDetails}
                    style={{ background: !isEditingBankDetails ? '#f8fafc' : '#fff', cursor: !isEditingBankDetails ? 'not-allowed' : 'text' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Branch Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter branch name" 
                    value={profileData.bankBranch}
                    onChange={e => setProfileData({ ...profileData, bankBranch: e.target.value })}
                    className="form-input" 
                    disabled={!isEditingBankDetails}
                    style={{ background: !isEditingBankDetails ? '#f8fafc' : '#fff', cursor: !isEditingBankDetails ? 'not-allowed' : 'text' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
                  {isEditingBankDetails ? (
                    <button 
                      className="btn-primary" 
                      onClick={handleProfileSave}
                      disabled={profileSaving}
                      style={{ padding: '10px 24px', opacity: profileSaving ? 0.7 : 1 }}
                    >
                      {profileSaving ? 'Saving...' : 'Save Details'}
                    </button>
                  ) : (
                    <button 
                      className="btn-secondary" 
                      onClick={() => setIsEditingBankDetails(true)}
                      style={{ padding: '10px 24px' }}
                    >
                      Edit Details
                    </button>
                  )}
                </div>
              </div>
            </div>
        )}

        {/* Incentives Tab */}
        {activeTab === 'incentives' && (
          <div className="animate-fade">
            {(() => {
              const closedStatuses = ['selected', 'converted', 'joined'];
              const closedApps = (stats?.applications || []).filter(a =>
                closedStatuses.includes(String(a.status || '').toLowerCase()) || Number(a.incentiveAmount) > 0
              );
              
              const totalEarned = closedApps.reduce((sum, app) => sum + (Number(isAgent ? app.agentIncentiveAmount : app.incentiveAmount) || 0), 0);
              const totalAvailable = closedApps.reduce((sum, app) => {
                 const amt = Number(isAgent ? app.agentIncentiveAmount : app.incentiveAmount) || 0;
                 return sum + ((!app.incentiveStatus || app.incentiveStatus === 'Pending') && amt > 0 ? amt : 0);
              }, 0);
              
              const withdrawableApps = closedApps.filter(app => {
                 const amt = Number(isAgent ? app.agentIncentiveAmount : app.incentiveAmount) || 0;
                 return (!app.incentiveStatus || app.incentiveStatus === 'Pending') && amt > 0;
              });

              const handleWithdraw = async () => {
                 if(withdrawableApps.length === 0) return;
                 if(!window.confirm(`Request withdrawal for ₹${totalAvailable.toLocaleString()}?`)) return;
                 
                 setLoading(true);
                 try {
                    await Promise.all(withdrawableApps.map(app => 
                       fetch(`${API_URL}/api/applications/${app.id}/incentive-status`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'Withdraw Requested' })
                       })
                    ));
                    fetchStats();
                    alert('Withdrawal request sent successfully!');
                 } catch(e) {
                    console.error(e);
                    alert('Failed to request withdrawal');
                 } finally {
                    setLoading(false);
                 }
              };

              return (
                <>
                  <div className="kpi-grid">
                    <div className="kpi-card" style={{ borderLeft: '4px solid #10b981', background: '#ffffff', display: 'flex', alignItems: 'center', padding: '1rem', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Gift size={20} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>Available Wallet Balance</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a' }}>₹{totalAvailable.toLocaleString()}</div>
                      </div>
                      <button 
                        onClick={handleWithdraw}
                        disabled={totalAvailable === 0}
                        style={{ background: totalAvailable > 0 ? '#10b981' : '#cbd5e1', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: totalAvailable > 0 ? 'pointer' : 'not-allowed', fontSize: '0.8rem' }}
                      >
                        Withdraw
                      </button>
                    </div>
                    <div className="kpi-card" style={{ borderLeft: '4px solid #3b82f6', background: '#ffffff', display: 'flex', alignItems: 'center', padding: '1rem', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={20} /></div>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>Total Incentives Earned</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a' }}>₹{totalEarned.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                <div className="table-container" style={{ marginTop: '1.5rem' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>Candidate-wise Incentives</h3>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{closedApps.length} closed candidate{closedApps.length === 1 ? '' : 's'}</span>
                  </div>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Company / Job</th>
                        <th>Status</th>
                        {!isAgent && <th>Referrer</th>}
                        <th style={{ textAlign: 'right' }}>{isAgent ? 'Your Incentive' : 'Admin Incentive (To HR)'}</th>
                        {!isAgent && <th style={{ textAlign: 'right' }}>Partner Incentive</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {closedApps.map(app => {
                        const isReferredByAgent = String(app.referredBy || '').toLowerCase() !== String(currentUser.referralCode || '').toLowerCase();
                        
                        return (
                          <tr key={app.id}>
                            <td style={{ fontWeight: 700 }}>
                              {app.candidateName}
                              {app.candidateMobile && <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{app.candidateMobile}</div>}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{app.companyName}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.jobTitle}</div>
                            </td>
                            <td>{getStatusBadge(app.status)}</td>
                            {!isAgent && (
                              <td>
                                {isReferredByAgent ? (
                                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: '#e0e7ff', color: '#4f46e5', padding: '2px 6px', borderRadius: '4px' }}>
                                    Partner ({app.referredBy})
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px' }}>
                                    Self
                                  </span>
                                )}
                              </td>
                            )}
                            <td style={{ textAlign: 'right', fontWeight: 800, color: (isAgent ? Number(app.agentIncentiveAmount) : Number(app.incentiveAmount)) > 0 ? '#059669' : '#94a3b8' }}>
                              {(isAgent ? Number(app.agentIncentiveAmount) : Number(app.incentiveAmount)) > 0 
                                ? `₹${(isAgent ? Number(app.agentIncentiveAmount) : Number(app.incentiveAmount)).toLocaleString()}` 
                                : 'Pending'}
                            </td>
                            {!isAgent && (
                              <td style={{ textAlign: 'right' }}>
                                {isReferredByAgent ? (
                                  <button
                                    className="btn-secondary"
                                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                    onClick={() => setAgentIncentiveModalApp(app)}
                                  >
                                    {Number(app.agentIncentiveAmount) > 0 ? `₹${Number(app.agentIncentiveAmount).toLocaleString()}` : 'Assign'}
                                  </button>
                                ) : (
                                  <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>N/A</span>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                      {closedApps.length === 0 && (
                        <tr>
                          <td colSpan={isAgent ? 4 : 6} style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                            No closed candidates yet. Incentives appear here once your candidates are Selected / Converted.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Status Modal */}
      {statusModalApp && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Update Status</h3>
              <button onClick={() => setStatusModalApp(null)} className="btn-icon"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateStatus} style={{ padding: '0 20px 20px 20px' }}>
              <div className="form-group">
                <label>Candidate: {statusModalApp.candidateName}</label>
                <select value={newAppStatus} onChange={e => setNewAppStatus(e.target.value)} className="form-input" required>
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Selected">Selected</option>
                  <option value="Converted">Converted</option>
                  <option value="Follow up">Follow up</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
              </div>

              <div className="modal-actions" style={{ padding: 0, marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setStatusModalApp(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Status</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={interviewModalOpen}
        onClose={() => setInterviewModalOpen(false)}
        application={appToSchedule}
        API_URL={API_URL}
        onScheduledSuccess={() => {
          setInterviewModalOpen(false);
          fetchStats();
          fetchInterviews();
        }}
      />

      {/* Partner Incentive Modal */}
      {agentIncentiveModalApp && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Assign Partner Incentive</h3>
              <button onClick={() => setAgentIncentiveModalApp(null)} className="btn-icon"><X size={20} /></button>
            </div>
            <form onSubmit={handleAssignAgentIncentive} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Candidate: <b>{agentIncentiveModalApp.candidateName}</b></div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Referred By: <b>{agentIncentiveModalApp.referredBy}</b></div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Admin Incentive (Yours): <b>₹{(Number(agentIncentiveModalApp.incentiveAmount) || 0).toLocaleString()}</b></div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Amount for Partner (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={agentIncentiveInput} 
                  onChange={e => setAgentIncentiveInput(e.target.value)} 
                  required 
                  min="0"
                  max={Number(agentIncentiveModalApp.incentiveAmount) || 0}
                  placeholder={`Max: ₹${Number(agentIncentiveModalApp.incentiveAmount) || 0}`}
                />
                <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                  Cannot exceed the incentive given to you by the Admin.
                </small>
              </div>

              <div className="modal-actions" style={{ padding: 0, marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setAgentIncentiveModalApp(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={savingAgentIncentive}>
                  {savingAgentIncentive ? 'Saving...' : 'Assign Amount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPartnerIncentiveModal && selectedJobForIncentive && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Set Partner Incentive</h3>
              <button onClick={() => setShowPartnerIncentiveModal(false)} className="btn-icon"><X size={20} /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{selectedJobForIncentive.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedJobForIncentive.companyName}</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedJobForIncentive.isCombinedItTraining ? (
                  <>
                    <div style={{ fontWeight: 600, color: '#334155' }}>Set Process Incentives:</div>
                    {selectedJobForIncentive.processes.map(p => (
                      <div key={p.id} className="form-group" style={{ marginBottom: '0' }}>
                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{p.processName}</span>
                          <span style={{ color: '#059669' }}>Your Incentive: Rs. {p.hrIncentiveAmount || 0}</span>
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          value={partnerIncentiveForm.processIncentives[p.processName] || 0}
                          onChange={(e) => setPartnerIncentiveForm({
                            ...partnerIncentiveForm,
                            processIncentives: {
                              ...partnerIncentiveForm.processIncentives,
                              [p.processName]: Number(e.target.value) || 0
                            }
                          })}
                          min="0"
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Free Job Incentive</span>
                        <span style={{ color: '#059669' }}>Your Incentive: Rs. {selectedJobForIncentive.hrIncentiveFree || 0}</span>
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={partnerIncentiveForm.freeJobIncentive}
                        onChange={(e) => setPartnerIncentiveForm({...partnerIncentiveForm, freeJobIncentive: Number(e.target.value) || 0})}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Paid Job Incentive</span>
                        <span style={{ color: '#059669' }}>Your Incentive: Rs. {selectedJobForIncentive.hrIncentivePaid || 0}</span>
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={partnerIncentiveForm.paidJobIncentive}
                        onChange={(e) => setPartnerIncentiveForm({...partnerIncentiveForm, paidJobIncentive: Number(e.target.value) || 0})}
                        min="0"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="modal-actions" style={{ padding: 0, marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowPartnerIncentiveModal(false)}>Cancel</button>
                <button type="button" className="btn-primary" onClick={handleSavePartnerIncentive}>Save Partner Incentive</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="animate-fade" style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '0.95rem'
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
