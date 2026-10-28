import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Share2, Users, MousePointerClick, Copy, ChevronDown, ChevronUp, Phone, Mail, MapPin, Calendar, Briefcase, LayoutDashboard, Gift, CalendarDays, Settings, Search, Download, Bell, X, FileText, CheckCircle, UserCog, GraduationCap, Zap, TrendingUp, FileCheck, Check, Send, ExternalLink, Award, Sparkles, LogOut } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import AgentsManager from './AgentsManager';
import SubAgentsManager from './SubAgentsManager';
import { uploadToCloudinary } from '../utils/cloudinary';

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

const MOTIVATIONAL_QUOTES = [
  "Close it now and get the incentive amount in your account! 💸",
  "Seal the deal to claim your reward! 🚀",
  "Fast-track this profile for a quick payout! ⚡",
  "Convert this candidate and bank your earnings! 🏦",
  "Secure the hire and grab your cash bonus! 💰",
  "Your bonus is waiting—finish the process! 🔥",
  "Drive this to closure and watch your wallet grow! 📈",
  "Help them get hired to unlock your reward! 🎯"
];

export default function HrDashboard({ API_URL, currentUser, sidebarOpen, setSidebarOpen, isAgent = false, onLogout }) {
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
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return (hash === 'job_openings' || hash === 'it_programs' || hash === 'jobs' || hash === 'applied' || hash === 'interviews' || hash === 'agents' || hash === 'incentives' || hash === 'settings') ? hash : 'overview';
  });

  const [directJobs, setDirectJobs] = useState([]);
  const [directJobSearch, setDirectJobSearch] = useState('');
  const [directJobCompanyFilter, setDirectJobCompanyFilter] = useState('all');

  const [itProcesses, setItProcesses] = useState([]);
  const [itProgramSearch, setItProgramSearch] = useState('');
  const [itCategoryFilter, setItCategoryFilter] = useState('all');
  const [copiedItId, setCopiedItId] = useState(null);

  useEffect(() => {
    if (activeTab && window.location.hash.replace('#', '') !== activeTab) {
      window.history.pushState(null, '', `#${activeTab}`);
    }
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setActiveTab(hash);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const [visibleAlertsCount, setVisibleAlertsCount] = useState(5);

  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [hrs, setHrs] = useState([]);
  const [allApplications, setAllApplications] = useState([]);

  const filteredDirectJobs = useMemo(() => {
    return directJobs.filter(job => {
      const q = directJobSearch.toLowerCase().trim();
      const matchSearch = !q ||
        (job.title && job.title.toLowerCase().includes(q)) ||
        (job.companyName && job.companyName.toLowerCase().includes(q)) ||
        (job.location && job.location.toLowerCase().includes(q)) ||
        (job.categoryName && job.categoryName.toLowerCase().includes(q));

      const matchCompany = directJobCompanyFilter === 'all' || job.companyName === directJobCompanyFilter;

      return matchSearch && matchCompany;
    });
  }, [directJobs, directJobSearch, directJobCompanyFilter]);

  const filteredItPrograms = useMemo(() => {
    return itProcesses.filter(proc => {
      const q = itProgramSearch.toLowerCase().trim();
      const matchSearch = !q ||
        (proc.role && proc.role.toLowerCase().includes(q)) ||
        (proc.programTitle && proc.programTitle.toLowerCase().includes(q)) ||
        (proc.processName && proc.processName.toLowerCase().includes(q)) ||
        (proc.itCategory && proc.itCategory.toLowerCase().includes(q)) ||
        (proc.salary && proc.salary.toLowerCase().includes(q));

      const matchCategory = itCategoryFilter === 'all' || proc.itCategory === itCategoryFilter;

      return matchSearch && matchCategory;
    });
  }, [itProcesses, itProgramSearch, itCategoryFilter]);
  // Closed condition: Selected candidates are closed (across Banking & all sectors), along with Joined, Converted, Hired
  const isCandidateClosedForIncentive = (app) => {
    if (!app) return false;
    const s = String(app.status || '').toLowerCase().trim();
    if (['payment pending', 'unpaid', 'rejected', 'not interested', 'cancelled'].includes(s)) return false;

    return ['selected', 'joined', 'joined manipal', 'converted', 'hired', 'closed', 'enrollment'].includes(s) ||
           s.includes('select') || s.includes('joined') || s.includes('hired') || s.includes('closed');
  };

  const CLOSED_STATUSES = ['selected', 'joined', 'joined manipal', 'converted', 'hired', 'closed', 'enrollment'];
  
  const [showPartnerIncentiveModal, setShowPartnerIncentiveModal] = useState(false);
  const [selectedJobForIncentive, setSelectedJobForIncentive] = useState(null);
  const [partnerIncentiveForm, setPartnerIncentiveForm] = useState({ freeJobIncentive: '', paidJobIncentive: '', processIncentives: {} });

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
  const [photoUploading, setPhotoUploading] = useState(false);

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

  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handlePasswordChange = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      showToast('Please enter both old and new passwords', 'error');
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${currentUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      showToast('Password updated successfully!', 'success');
      setPasswordData({ oldPassword: '', newPassword: '' });
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setPasswordSaving(false);
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

  const fetchLeaderboardData = () => {
    Promise.all([
      fetch(`${API_URL}/api/users/hr`).then(res => res.json()).catch(() => []),
      fetch(`${API_URL}/api/applications`).then(res => res.json()).catch(() => [])
    ])
    .then(([hrData, appsData]) => {
      const storedPhotos = (() => {
        try { return JSON.parse(localStorage.getItem('hr_profile_photos') || '{}'); } catch { return {}; }
      })();
      const mergedHrs = (Array.isArray(hrData) ? hrData : []).map(hr => ({
        ...hr,
        profilePhoto: hr.profilePhoto || storedPhotos[hr.id] || ''
      }));
      setHrs(mergedHrs);
      setAllApplications(Array.isArray(appsData) ? appsData : []);
    })
    .catch(err => console.error('Error fetching leaderboard data:', err));
  };

  useEffect(() => {
    fetchStats();
    fetchLeaderboardData();
    const interval = setInterval(() => {
      fetchStats();
      fetchLeaderboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, [API_URL, currentUser]);

  useEffect(() => {
    if (stats) {
      fetchInterviews();
    }
  }, [activeTab, stats]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/jobs`).then(res => res.json()),
      fetch(`${API_URL}/api/it-training-processes`).then(res => res.json()),
      fetch(`${API_URL}/api/settings/it-training-incentives`).then(res => res.json()).catch(() => ({})),
      fetch(`${API_URL}/api/partner-incentives?hrId=${isAgent ? currentUser.parentHrId : currentUser.id}`).then(res => res.json()).catch(() => ([]))
    ])
    .then(([jobsData, itData, globalIncentives, partnerIncentives]) => {
      const standardJobs = Array.isArray(jobsData) ? jobsData : [];
      setDirectJobs(standardJobs);
      let combinedItJob = null;
      if (Array.isArray(itData)) {
        setItProcesses(itData);
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
  }, [API_URL, currentUser.id, currentUser.parentHrId, isAgent]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = `Hey! Check out these amazing job openings at Forge India Connect: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const [copiedJobId, setCopiedJobId] = useState(null);

  const copyJobReferralLink = (jobId) => {
    const url = `${candidatePortalBaseUrl}?job=${jobId}&ref=${currentUser.referralCode}`;
    navigator.clipboard.writeText(url);
    setCopiedJobId(jobId);
    showToast('Job referral link copied!');
    setTimeout(() => setCopiedJobId(null), 2500);
  };

  const shareJobOnWhatsApp = (job, procName = null) => {
    const jobId = job.id;
    const title = procName ? `${job.title} (${procName})` : job.title;
    const url = `${candidatePortalBaseUrl}?job=${jobId}&ref=${currentUser.referralCode}`;
    const text = `🔥 *Job Opening: ${title}*\n🏢 *Company:* ${job.companyName || 'Forge India Connect'}\n\n👉 *Apply here directly:* ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyItReferralLink = (itId) => {
    const url = `${candidatePortalBaseUrl}/?job=${itId}&ref=${currentUser.referralCode}`;
    navigator.clipboard.writeText(url);
    setCopiedItId(itId);
    showToast('IT Program referral link copied!');
    setTimeout(() => setCopiedItId(null), 2500);
  };

  const shareItOnWhatsApp = (proc) => {
    const url = `${candidatePortalBaseUrl}/?job=${proc.id}&ref=${currentUser.referralCode}`;
    const categoryLabel = proc.itCategory === 'Course' ? 'IT Course Certification' : proc.itCategory === 'Internship' ? 'Free IT Internship' : 'IT Training & 100% Placement Programme';
    const roleTitle = proc.role || 'Software Engineer Trainee';
    const track = proc.programTitle || proc.processName || '';
    const duration = proc.trainingPeriod || '6 Months';
    const stipend = (proc.stipend && proc.stipend !== '0') ? `\n💰 *Stipend:* ₹${proc.stipend}/month` : '';
    const salary = (proc.salary && proc.salary !== 'Not Applicable') ? `\n💼 *Salary Package:* ${proc.salary}` : '';

    const text = `🔥 *${categoryLabel}*\n🚀 *Role:* ${roleTitle}\n📚 *Track:* ${track}\n⏱️ *Duration:* ${duration}${stipend}${salary}\n\n👉 *View Details & Apply Here:* ${url}`;
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
        if (typeof fetchStats === 'function') fetchStats();
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
      const sanitizedProcesses = {};
      Object.entries(partnerIncentiveForm.processIncentives || {}).forEach(([k, v]) => {
        sanitizedProcesses[k] = Number(v) || 0;
      });

      const payload = {
        hrId: currentUser.id,
        jobId: selectedJobForIncentive.id,
        freeJobIncentive: Number(partnerIncentiveForm.freeJobIncentive) || 0,
        paidJobIncentive: Number(partnerIncentiveForm.paidJobIncentive) || 0,
        processIncentives: sanitizedProcesses
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
              return { ...j, partnerProcessIncentives: sanitizedProcesses };
            } else {
              return { ...j, partnerIncentiveFree: payload.freeJobIncentive, partnerIncentivePaid: payload.paidJobIncentive };
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

  const docSubmissionCount = useMemo(() => {
    if (!stats?.applications) return 0;
    return stats.applications.filter(a => {
      const s = String(a.status || '').toLowerCase().trim();
      const isDoc = ['document submission', 'document submitted', 'documents submitted', 'documents submission', 'document verification'].includes(s) || s.includes('document');
      const hasDocInt = (interviews || []).some(int => (String(int.candidateId) === String(a.candidateId) || String(int.applicationId) === String(a.id)) && String(int.status || '').toLowerCase().includes('document'));
      return isDoc || hasDocInt;
    }).length;
  }, [stats?.applications, interviews]);

  // Filter Data
  const filteredApps = useMemo(() => {
    if (!stats?.applications) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    return stats.applications.filter(app => {
      // Exclude Payment Pending from Applied tab
      if (app.status === 'Payment Pending') return false;

      const matchesSearch = app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (app.candidateMobile && app.candidateMobile.includes(searchTerm));
      let matchesStatus = true;
      if (statusFilter === 'Processing') {
        matchesStatus = !app.status || ['Applied', 'Shortlisted', 'Follow up'].includes(app.status);
      } else if (statusFilter === 'Document Submission' || statusFilter === 'Document Submitted') {
        const s = String(app.status || '').toLowerCase().trim();
        const isDoc = ['document submission', 'document submitted', 'documents submitted', 'documents submission', 'document verification'].includes(s) || s.includes('document');
        const hasDocInt = (interviews || []).some(int => (String(int.candidateId) === String(app.candidateId) || String(int.applicationId) === String(app.id)) && String(int.status || '').toLowerCase().includes('document'));
        matchesStatus = isDoc || hasDocInt;
      } else if (statusFilter !== 'All') {
        matchesStatus = app.status === statusFilter;
      }
      
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
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [stats]);

  const { totalIncentiveAmount, upcomingIncentiveAmount, upcomingCount } = useMemo(() => {
    let total = 0;
    let upcoming = 0;
    let upcomingCnt = 0;
    
    if (stats && stats.applications && jobs.length > 0) {
      stats.applications.forEach(app => {
        let amt = currentUser.role === 'agent' ? app.agentIncentiveAmount : app.incentiveAmount;
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
            if (currentUser.role === 'agent') {
               amt = isPaid ? (Number(job.partnerIncentivePaid) || 0) : (Number(job.partnerIncentiveFree) || 0);
            } else {
               amt = isPaid ? (Number(job.hrIncentivePaid) || 0) : (Number(job.hrIncentiveFree) || 0);
            }
          }
        }
        const val = Number(amt) || 0;
        
        const isClosed = isCandidateClosedForIncentive(app);
        const isRejected = ['Rejected', 'Not Interested'].includes(app.status);
        
        if (isClosed) {
          total += val;
        } else if (!isRejected) {
          upcoming += val;
          upcomingCnt += 1;
        }
      });
    }
    return { totalIncentiveAmount: total, upcomingIncentiveAmount: upcoming, upcomingCount: upcomingCnt };
  }, [stats, jobs, currentUser.role]);

  const verticalApps = recentIncentiveApps.slice(0, visibleAlertsCount);

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
      timestamp: new Date(date).getTime(),
      Candidates: dateCounts[date]
    })).sort((a, b) => a.timestamp - b.timestamp);
    
    return dataArray.map(({ name, Candidates }) => ({ name, Candidates })).slice(-7);
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
    if (status === 'Joined Manipal') return <span style={{ color: '#047857', background: '#dcfce7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #86efac' }}>🎓 Joined Manipal</span>;
    if (status === 'Selected' || status === 'Converted') return <span style={{ color: '#047857', background: '#ecfdf5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #10b981' }}>{status}</span>;
    if (status === 'Rejected' || status === 'Not Interested') return <span style={{ color: '#be123c', background: '#ffe4e6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{status}</span>;
    if (status === 'Follow up') return <span style={{ color: '#b45309', background: '#fef3c7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Follow up</span>;
    return <span style={{ color: '#475569', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{status}</span>;
  };

  return (
    <div className="admin-layout animate-fade">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
        />
      )}

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

          <button className={`nav-item ${activeTab === 'job_openings' ? 'active' : ''}`} onClick={() => { setActiveTab('job_openings'); setSidebarOpen && setSidebarOpen(false); }} style={{ whiteSpace: 'nowrap' }}>
            <Briefcase size={18} /><span>Job Openings ({directJobs.length || 14})</span>
          </button>

          <button className={`nav-item ${activeTab === 'it_programs' ? 'active' : ''}`} onClick={() => { setActiveTab('it_programs'); setSidebarOpen && setSidebarOpen(false); }} style={{ whiteSpace: 'nowrap' }}>
            <GraduationCap size={18} /><span>IT Programs ({itProcesses.length || 29})</span>
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
            <Award size={18} /><span>Incentive Slot</span>
          </button>

          <button className={`nav-item ${activeTab === 'incentives' ? 'active' : ''}`} onClick={() => { setActiveTab('incentives'); setSidebarOpen && setSidebarOpen(false); }} style={{ whiteSpace: 'nowrap' }}>
            <Gift size={18} /><span>Incentives</span>
          </button>

          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setSidebarOpen && setSidebarOpen(false); }} style={{ whiteSpace: 'nowrap' }}>
            <Settings size={18} /><span>Settings</span>
          </button>

          {onLogout && (
            <button 
              className="nav-item logout-nav-item" 
              onClick={() => { 
                setSidebarOpen && setSidebarOpen(false); 
                onLogout(); 
              }} 
              style={{ 
                marginTop: '1.25rem', 
                borderTop: '1px solid rgba(255,255,255,0.1)', 
                paddingTop: '0.85rem', 
                color: '#ef4444', 
                whiteSpace: 'nowrap',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={18} /><span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-main" style={{ flex: 1, padding: window.innerWidth > 768 ? '2rem' : '0.5rem' }}>
        
        {/* Header with Notifications */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', color: '#0f172a' }}>{activeTab === 'overview' ? `Welcome, ${currentUser.name}!` : activeTab === 'job_openings' ? 'Job Openings & Referral Links' : activeTab === 'it_programs' ? 'IT Programs & Referral Links' : activeTab === 'jobs' ? 'Incentive Slot' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
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
            
            



            <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', padding: '1.5rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0' }}>
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

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <span style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>
                  💼 Want to share a specific Banking / Direct Job Opening?
                </span>
                <button
                  onClick={() => { setActiveTab('job_openings'); }}
                  style={{
                    background: '#ffffff',
                    color: '#2563eb',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  View All {directJobs.length || 14} Job Links →
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <span style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>
                  🎓 Want to share a specific IT Training Program / Course / Internship?
                </span>
                <button
                  onClick={() => { setActiveTab('it_programs'); }}
                  style={{
                    background: '#fef08a',
                    color: '#854d0e',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  View All {itProcesses.length || 29} IT Program Links →
                </button>
              </div>
            </div>

            <div className="kpi-grid">
              <div className="kpi-card" style={{ borderLeft: '4px solid #6366f1', background: '#eef2ff' }}>
                <div className="kpi-icon" style={{ background: '#c7d2fe', color: '#4f46e5' }}><MousePointerClick size={20} /></div>
                <div><div className="kpi-val">{stats ? stats.linkClicks : 0}</div><div className="kpi-label">Total Link Clicks</div></div>
              </div>
              <div className="kpi-card" onClick={() => { setActiveTab('applied'); setStatusFilter('All'); }} style={{ borderLeft: '4px solid #10b981', background: '#ecfdf5', cursor: 'pointer' }}>
                <div className="kpi-icon" style={{ background: '#a7f3d0', color: '#059669' }}><Users size={20} /></div>
                <div><div className="kpi-val">{stats ? stats.totalApplications : 0}</div><div className="kpi-label">Candidates Applied</div></div>
              </div>
              <div className="kpi-card" onClick={() => { setActiveTab('applied'); setStatusFilter('Processing'); }} style={{ borderLeft: '4px solid #3b82f6', background: '#eff6ff', cursor: 'pointer' }}>
                <div className="kpi-icon" style={{ background: '#bfdbfe', color: '#2563eb' }}><Briefcase size={20} /></div>
                <div><div className="kpi-val">{stats?.applications?.filter(a => !a.status || ['Applied', 'Shortlisted', 'Follow up'].includes(a.status)).length || 0}</div><div className="kpi-label">Processing</div></div>
              </div>
              <div className="kpi-card" onClick={() => { setActiveTab('applied'); setStatusFilter('Interview Scheduled'); }} style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb', cursor: 'pointer' }}>
                <div className="kpi-icon" style={{ background: '#fde68a', color: '#d97706' }}><CalendarDays size={20} /></div>
                <div><div className="kpi-val">{stats?.applications?.filter(a => a.status === 'Interview Scheduled').length || 0}</div><div className="kpi-label">Interview Scheduled</div></div>
              </div>
              <div className="kpi-card" onClick={() => { setActiveTab('applied'); setStatusFilter('Document Submission'); }} style={{ borderLeft: '4px solid #06b6d4', background: '#ecfeff', cursor: 'pointer' }}>
                <div className="kpi-icon" style={{ background: '#cffafe', color: '#0891b2' }}><FileCheck size={20} /></div>
                <div><div className="kpi-val">{docSubmissionCount}</div><div className="kpi-label">Document Submission</div></div>
              </div>
              <div className="kpi-card" onClick={() => { setActiveTab('applied'); setStatusFilter('Selected'); }} style={{ borderLeft: '4px solid #059669', background: '#ecfdf5', cursor: 'pointer' }}>
                <div className="kpi-icon" style={{ background: '#a7f3d0', color: '#047857' }}><CheckCircle size={20} /></div>
                <div><div className="kpi-val">{stats?.applications?.filter(a => ['Selected', 'Converted', 'Hired'].includes(a.status)).length || 0}</div><div className="kpi-label">Selected</div></div>
              </div>
              <div className="kpi-card" onClick={() => { setActiveTab('applied'); setStatusFilter('Rejected'); }} style={{ borderLeft: '4px solid #ef4444', background: '#fef2f2', cursor: 'pointer' }}>
                <div className="kpi-icon" style={{ background: '#fecaca', color: '#b91c1c' }}><X size={20} /></div>
                <div><div className="kpi-val">{stats?.applications?.filter(a => ['Rejected', 'Not Interested'].includes(a.status)).length || 0}</div><div className="kpi-label">Rejected</div></div>
              </div>
              <div className="kpi-card" onClick={() => { setActiveTab('incentives'); }} style={{ borderLeft: '4px solid #8b5cf6', background: '#f5f3ff', cursor: 'pointer' }}>
                <div className="kpi-icon" style={{ background: '#ddd6fe', color: '#6d28d9' }}><Gift size={20} /></div>
                <div><div className="kpi-val">₹{totalIncentiveAmount.toLocaleString()}</div><div className="kpi-label">Total Incentive</div></div>
              </div>
              <div className="kpi-card" onClick={() => { setActiveTab('applied'); setStatusFilter('Processing'); }} style={{ borderLeft: '4px solid #f97316', background: '#fff7ed', cursor: 'pointer' }}>
                <div className="kpi-icon" style={{ background: '#ffedd5', color: '#c2410c' }}><TrendingUp size={20} /></div>
                <div>
                  <div className="kpi-val">₹{upcomingIncentiveAmount.toLocaleString()}</div>
                  <div className="kpi-label">Upcoming ({upcomingCount} Candidates) Incentives</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <button 
                className="btn-primary" 
                onClick={() => { setActiveTab('applied'); setSidebarOpen && setSidebarOpen(false); }}
                style={{ padding: '12px 28px', fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}
              >
                View Recent Applications ➔
              </button>
            </div>

            {/* Leaderboards */}
            {(() => {
              const validApps = allApplications.filter(app => app.status !== 'Payment Pending');
              const hrStats = hrs.map(hr => {
                const hrCode = String(hr.referralCode || '').toLowerCase();
                const hrApps = validApps.filter(app => String(app.referredBy || '').toLowerCase() === hrCode);
                const closedApps = hrApps.filter(app => isCandidateClosedForIncentive(app));
                return {
                  ...hr,
                  totalSourced: hrApps.length,
                  totalClosed: closedApps.length
                };
              });
              const topClosers = [...hrStats].sort((a,b) => b.totalClosed - a.totalClosed).slice(0, 5);
              const topSourcers = [...hrStats].sort((a,b) => b.totalSourced - a.totalSourced).slice(0, 5);
              
              return (
                <div style={{ marginTop: '2.5rem', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {/* Top Applications Received Card */}
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🚀 Top Applications Received <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>(Most Apps)</span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {topSourcers.map((hr, idx) => {
                        const isMe = String(hr.referralCode || '').toLowerCase() === String(currentUser?.referralCode || '').toLowerCase();
                        const isScored = Number(hr.totalSourced || 0) > 0;
                        return (
                          <div key={hr.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: isMe ? '#eff6ff' : '#f8fafc', border: isMe ? '1px solid #bfdbfe' : '1px solid #f1f5f9', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div style={{
                                  width: '48px',
                                  height: '48px',
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
                                  fontSize: '1.15rem'
                                }}>
                                  {hr.profilePhoto ? (
                                    <img src={hr.profilePhoto} alt={hr.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    (hr.name || 'HR').charAt(0).toUpperCase()
                                  )}
                                </div>
                                {isScored && (
                                  <div style={{
                                    position: 'absolute',
                                    bottom: '-2px',
                                    right: '-4px',
                                    minWidth: '20px',
                                    height: '20px',
                                    padding: '0 4px',
                                    borderRadius: '10px',
                                    background: idx === 0 ? 'linear-gradient(135deg, #eab308, #ca8a04)' : idx === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : idx === 2 ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#64748b',
                                    color: '#ffffff',
                                    fontSize: '0.65rem',
                                    fontWeight: '800',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid #ffffff',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                  }}>
                                    #{idx + 1}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {hr.name}
                                  {isMe && <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>You</span>}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '500' }}>{hr.referralCode}</div>
                              </div>
                            </div>
                            <div style={{ fontWeight: '800', color: isScored ? '#2563eb' : '#94a3b8', fontSize: '1.25rem' }}>
                              {hr.totalSourced || 0}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Closers Card */}
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🏆 Top Closers <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>(Selected/Closed)</span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {topClosers.map((hr, idx) => {
                        const isMe = String(hr.referralCode || '').toLowerCase() === String(currentUser?.referralCode || '').toLowerCase();
                        const isScored = Number(hr.totalClosed || 0) > 0;
                        return (
                          <div key={hr.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: isMe ? '#f0fdf4' : '#f8fafc', border: isMe ? '1px solid #bbf7d0' : '1px solid #f1f5f9', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div style={{
                                  width: '48px',
                                  height: '48px',
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
                                  fontSize: '1.15rem'
                                }}>
                                  {hr.profilePhoto ? (
                                    <img src={hr.profilePhoto} alt={hr.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    (hr.name || 'HR').charAt(0).toUpperCase()
                                  )}
                                </div>
                                {isScored && (
                                  <div style={{
                                    position: 'absolute',
                                    bottom: '-2px',
                                    right: '-4px',
                                    minWidth: '20px',
                                    height: '20px',
                                    padding: '0 4px',
                                    borderRadius: '10px',
                                    background: idx === 0 ? 'linear-gradient(135deg, #eab308, #ca8a04)' : idx === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : idx === 2 ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#64748b',
                                    color: '#ffffff',
                                    fontSize: '0.65rem',
                                    fontWeight: '800',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid #ffffff',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                  }}>
                                    #{idx + 1}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {hr.name}
                                  {isMe && <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>You</span>}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '500' }}>{hr.referralCode}</div>
                              </div>
                            </div>
                            <div style={{ fontWeight: '800', color: isScored ? '#059669' : '#94a3b8', fontSize: '1.25rem' }}>
                              {hr.totalClosed || 0}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

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

            {verticalApps.length > 0 && (
              <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 600, margin: 0 }}>Recent Activity Alerts</h3>                {verticalApps.map((app, idx) => {
                  let amt = currentUser.role === 'agent' ? app.agentIncentiveAmount : app.incentiveAmount;
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
                      if (currentUser.role === 'agent') {
                         amt = isPaid ? (Number(job.partnerIncentivePaid) || 0) : (Number(job.partnerIncentiveFree) || 0);
                      } else {
                         amt = isPaid ? (Number(job.hrIncentivePaid) || 0) : (Number(job.hrIncentiveFree) || 0);
                      }
                      console.log('VERTICAL APP:', app.candidateName, 'JOB:', job?.id, 'IS_PAID:', isPaid, 'FINAL AMT:', amt);
                    }
                  }
                  return (
                    <div key={app.id} style={{
                      background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '12px 16px',
                      display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      color: '#92400e', fontSize: '0.95rem'
                    }}>
                      <div style={{ background: '#fff', width: '36px', height: '36px', borderRadius: '50%', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid #fde68a' }}>
                        {app.companyLogo ? (
                          <img src={app.companyLogo} alt={app.companyName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <div style={{ background: '#fef3c7', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={20} />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, lineHeight: '1.4' }}>
                        ⚡ Candidate <span style={{ fontWeight: 600 }}>{app.candidateName}</span> just applied for <span style={{ fontWeight: 600 }}>{app.jobTitle || 'a role'}</span> at <span style={{ fontWeight: 600 }}>{app.companyName || 'our partner company'}</span>! 
                        {amt && amt > 0 ? (
                          <> <br/>Incentive: <span style={{ color: '#059669', fontWeight: 'bold' }}>₹{amt}</span>. {MOTIVATIONAL_QUOTES[(idx + 3) % MOTIVATIONAL_QUOTES.length]}</>
                        ) : (
                          <> <br/>{MOTIVATIONAL_QUOTES[(idx + 3) % MOTIVATIONAL_QUOTES.length]}</>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {visibleAlertsCount < recentIncentiveApps.length && (
                  <button 
                    onClick={() => setVisibleAlertsCount(prev => prev + 5)}
                    style={{
                      background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, 
                      cursor: 'pointer', padding: '10px', marginTop: '4px', alignSelf: 'center',
                      fontSize: '0.9rem', textDecoration: 'underline'
                    }}
                  >
                    See More
                  </button>
                )}
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
                  <option value="Processing">Processing</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Document Submission">Document Submission</option>
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
                      <th style={{ minWidth: '180px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interviews.map(int => {
                      const relatedApp = stats?.applications?.find(a => a.id === int.applicationId);
                      return (
                      <tr key={int.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{relatedApp ? relatedApp.candidateName : int.candidateName}</div>
                          {(relatedApp?.candidateMobile || int.candidateMobile) && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                              📱 {relatedApp?.candidateMobile || int.candidateMobile}
                            </div>
                          )}
                          {(relatedApp?.candidateResumeUrl || int.candidateResumeUrl) && (
                            <div style={{ marginTop: '4px' }}>
                              <a
                                href={relatedApp?.candidateResumeUrl || int.candidateResumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  fontSize: '0.75rem',
                                  color: '#059669',
                                  textDecoration: 'none',
                                  fontWeight: 700
                                }}
                              >
                                <FileText size={12} /> View Resume ➔
                              </a>
                            </div>
                          )}
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
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1.5px solid #cbd5e1',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              backgroundColor: '#f8fafc',
                              color: '#0f172a',
                              cursor: 'pointer',
                              outline: 'none'
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
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Dedicated Job Openings Tab with Individual Referral Links */}
        {activeTab === 'job_openings' && (
          <div className="animate-fade">
            {/* Header Hero Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #1d4ed8 100%)',
              borderRadius: '16px',
              padding: '1.75rem',
              color: 'white',
              marginBottom: '1.5rem',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                      INDIVIDUAL JOB REFERRALS
                    </span>
                    <span style={{ background: '#22c55e', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800 }}>
                      {directJobs.length} Active Openings
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px 0', color: '#ffffff' }}>
                    Job Openings & Referral Links
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.92rem', margin: 0, maxWidth: '680px', lineHeight: 1.5 }}>
                    Share dedicated opening links with candidates. When a candidate opens a link, they view <strong>only that specific job</strong>, and your referral code (<strong>{currentUser.referralCode}</strong>) is automatically tracked.
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', padding: '12px 18px', borderRadius: '12px', backdropFilter: 'blur(4px)', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', fontWeight: 700 }}>Your Referral Code</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fef08a', letterSpacing: '1px', marginTop: '2px' }}>
                    {currentUser.referralCode}
                  </div>
                </div>
              </div>

              {/* General Portal Link Reminder */}
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '0.85rem'
              }}>
                <span style={{ color: 'rgba(255,255,255,0.95)' }}>
                  🌐 <strong>Overall Portal Link:</strong> {referralLink}
                </span>
                <button
                  onClick={copyToClipboard}
                  style={{
                    background: copied ? '#10b981' : '#ffffff',
                    color: copied ? '#ffffff' : '#1e3a8a',
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {copied ? 'Copied General Link!' : 'Copy General Link'}
                </button>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search by job title, bank, or location..."
                    value={directJobSearch}
                    onChange={(e) => setDirectJobSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {directJobSearch && (
                    <button
                      onClick={() => setDirectJobSearch('')}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <select
                  value={directJobCompanyFilter}
                  onChange={(e) => setDirectJobCompanyFilter(e.target.value)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.875rem',
                    background: '#ffffff',
                    outline: 'none',
                    fontWeight: 600,
                    color: '#334155'
                  }}
                >
                  <option value="all">All Companies / Banks</option>
                  {Array.from(new Set(directJobs.map(j => j.companyName).filter(Boolean))).map(comp => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
                Showing {filteredDirectJobs.length} of {directJobs.length} jobs
              </div>
            </div>

            {/* Jobs Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '16px'
            }}>
              {filteredDirectJobs.map((job) => {
                const compColor = getCompanyColor(job.companyName);
                const directLink = `${candidatePortalBaseUrl}/?job=${job.id}&ref=${currentUser.referralCode}`;
                const isCopied = copiedJobId === job.id;

                return (
                  <div
                    key={job.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '14px',
                      border: '1.5px solid #e2e8f0',
                      padding: '1.25rem',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.08)';
                      e.currentTarget.style.borderColor = compColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.04)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    {/* Top border color strip */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: compColor }} />

                    {/* Job & Company Info */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          {job.companyLogo ? (
                            <img
                              src={job.companyLogo}
                              alt={job.companyName}
                              style={{ width: '42px', height: '42px', objectFit: 'contain', background: '#f8fafc', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0', flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexShrink: 0 }}>
                              <Briefcase size={20} />
                            </div>
                          )}
                          <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
                              {job.title}
                            </h3>
                            <div style={{ fontSize: '0.85rem', color: compColor, fontWeight: 700, marginTop: '2px' }}>
                              {job.companyName}
                            </div>
                          </div>
                        </div>

                        <span style={{
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          flexShrink: 0
                        }}>
                          {job.status || 'Active'}
                        </span>
                      </div>

                      {/* Specs Row */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {job.salary && (
                          <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '3px 9px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            💰 {job.salary}
                          </span>
                        )}
                        {job.location && (
                          <span style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '3px 9px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} color="#64748b" /> {job.location}
                          </span>
                        )}
                        {job.categoryName && (
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 9px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                            {job.categoryName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dedicated Referral Link Box */}
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                        Direct Job Referral Link
                      </div>
                      <div style={{
                        background: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px'
                      }}>
                        <code style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {directLink}
                        </code>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          onClick={() => copyJobReferralLink(job.id)}
                          style={{
                            flex: 1,
                            background: isCopied ? '#10b981' : '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: isCopied ? '0 2px 8px rgba(16, 185, 129, 0.3)' : '0 2px 8px rgba(37, 99, 235, 0.25)',
                            transition: 'all 0.2s'
                          }}
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{isCopied ? 'Copied Link!' : 'Copy Link'}</span>
                        </button>

                        <button
                          onClick={() => shareJobOnWhatsApp(job)}
                          style={{
                            background: '#25D366',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                          }}
                          title="Share on WhatsApp"
                        >
                          <Send size={14} />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => window.open(directLink, '_blank')}
                          style={{
                            background: '#f8fafc',
                            color: '#475569',
                            border: '1.5px solid #cbd5e1',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                          title="Preview Candidate View"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredDirectJobs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
                <Briefcase size={44} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 700, margin: '0 0 6px 0' }}>No Matching Jobs Found</h4>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>Try searching with a different job title or clear your filters.</p>
                <button
                  onClick={() => { setDirectJobSearch(''); setDirectJobCompanyFilter('all'); }}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Reset Search
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dedicated IT Programs Tab with Individual Referral Links */}
        {activeTab === 'it_programs' && (
          <div className="animate-fade">
            {/* Header Hero Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 45%, #4f46e5 100%)',
              borderRadius: '16px',
              padding: '1.75rem',
              color: 'white',
              marginBottom: '1.5rem',
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                      INDIVIDUAL IT PROGRAM REFERRALS
                    </span>
                    <span style={{ background: '#22c55e', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800 }}>
                      {itProcesses.length} IT Programs Available
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px 0', color: '#ffffff' }}>
                    IT Training Programs & Referral Links
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.92rem', margin: 0, maxWidth: '680px', lineHeight: 1.5 }}>
                    Share dedicated IT program tracks with candidates. When a candidate opens a link, they view <strong>only that specific training program</strong> (with roadmap, phases, stipend & fee details), and your referral code (<strong>{currentUser.referralCode}</strong>) is automatically tracked.
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', padding: '12px 18px', borderRadius: '12px', backdropFilter: 'blur(4px)', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', fontWeight: 700 }}>Your Referral Code</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fef08a', letterSpacing: '1px', marginTop: '2px' }}>
                    {currentUser.referralCode}
                  </div>
                </div>
              </div>

              {/* General IT Catalog Link */}
              <div style={{
                background: 'rgba(0,0,0,0.25)',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '0.85rem'
              }}>
                <span style={{ color: 'rgba(255,255,255,0.95)' }}>
                  🎓 <strong>Overall IT Catalog Link:</strong> {candidatePortalBaseUrl}/#it_training?ref={currentUser.referralCode}
                </span>
                <button
                  onClick={() => {
                    const catalogUrl = `${candidatePortalBaseUrl}/#it_training?ref=${currentUser.referralCode}`;
                    navigator.clipboard.writeText(catalogUrl);
                    showToast('Overall IT Catalog referral link copied!');
                  }}
                  style={{
                    background: '#ffffff',
                    color: '#3730a3',
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Copy IT Catalog Link
                </button>
              </div>
            </div>

            {/* Search & Category Filter Toolbar */}
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search by role, track (Python, Java, MERN), or process..."
                    value={itProgramSearch}
                    onChange={(e) => setItProgramSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {itProgramSearch && (
                    <button
                      onClick={() => setItProgramSearch('')}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setItCategoryFilter('all')}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1.5px solid',
                      borderColor: itCategoryFilter === 'all' ? '#4f46e5' : '#cbd5e1',
                      background: itCategoryFilter === 'all' ? '#4f46e5' : '#ffffff',
                      color: itCategoryFilter === 'all' ? '#ffffff' : '#475569'
                    }}
                  >
                    All ({itProcesses.length})
                  </button>
                  <button
                    onClick={() => setItCategoryFilter('Placement')}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1.5px solid',
                      borderColor: itCategoryFilter === 'Placement' ? '#8b5cf6' : '#cbd5e1',
                      background: itCategoryFilter === 'Placement' ? '#8b5cf6' : '#ffffff',
                      color: itCategoryFilter === 'Placement' ? '#ffffff' : '#475569'
                    }}
                  >
                    100% Placement ({itProcesses.filter(p => p.itCategory === 'Placement').length})
                  </button>
                  <button
                    onClick={() => setItCategoryFilter('Course')}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1.5px solid',
                      borderColor: itCategoryFilter === 'Course' ? '#0284c7' : '#cbd5e1',
                      background: itCategoryFilter === 'Course' ? '#0284c7' : '#ffffff',
                      color: itCategoryFilter === 'Course' ? '#ffffff' : '#475569'
                    }}
                  >
                    IT Courses ({itProcesses.filter(p => p.itCategory === 'Course').length})
                  </button>
                  <button
                    onClick={() => setItCategoryFilter('Internship')}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1.5px solid',
                      borderColor: itCategoryFilter === 'Internship' ? '#059669' : '#cbd5e1',
                      background: itCategoryFilter === 'Internship' ? '#059669' : '#ffffff',
                      color: itCategoryFilter === 'Internship' ? '#ffffff' : '#475569'
                    }}
                  >
                    Internships ({itProcesses.filter(p => p.itCategory === 'Internship').length})
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
                Showing {filteredItPrograms.length} of {itProcesses.length} IT programs
              </div>
            </div>

            {/* IT Programs Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '16px'
            }}>
              {filteredItPrograms.map((proc) => {
                const isPlacement = proc.itCategory === 'Placement';
                const isCourse = proc.itCategory === 'Course';
                const isIntern = proc.itCategory === 'Internship';

                const themeColor = isPlacement ? '#6366f1' : isCourse ? '#0284c7' : '#059669';
                const badgeBg = isPlacement ? '#eef2ff' : isCourse ? '#f0f9ff' : '#ecfdf5';
                const badgeColor = isPlacement ? '#4338ca' : isCourse ? '#0369a1' : '#047857';

                const directLink = `${candidatePortalBaseUrl}/?job=${proc.id}&ref=${currentUser.referralCode}`;
                const isCopied = copiedItId === proc.id;

                return (
                  <div
                    key={proc.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '14px',
                      border: '1.5px solid #e2e8f0',
                      padding: '1.25rem',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.08)';
                      e.currentTarget.style.borderColor = themeColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.04)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    {/* Top border color strip */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: themeColor }} />

                    {/* Header info */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            letterSpacing: '0.3px',
                            textTransform: 'uppercase'
                          }}>
                            {proc.processName || 'PROGRAM'}
                          </span>
                          <span style={{
                            background: badgeBg,
                            color: badgeColor,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            {isPlacement ? '100% Placement' : isCourse ? 'IT Course' : 'Free Internship'}
                          </span>
                        </div>

                        {proc.stipend && proc.stipend !== '0' && (
                          <span style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 800
                          }}>
                            Stipend ₹{proc.stipend}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                        {proc.role || 'Software Engineer Trainee'}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: themeColor, fontWeight: 600, lineHeight: 1.4, marginBottom: '10px' }}>
                        {proc.programTitle || 'FIC IT Placement Programme'}
                      </div>

                      {/* Detail Chips */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '0.78rem' }}>
                        <div>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>DURATION</span>
                          <strong style={{ color: '#0f172a' }}>{proc.trainingPeriod || '6 Months'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>SALARY / PACKAGE</span>
                          <strong style={{ color: '#0f172a' }}>{proc.salary || 'Not Applicable'}</strong>
                        </div>
                        {proc.trainingFee && (
                          <div>
                            <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>FEE STRUCTURE</span>
                            <strong style={{ color: '#0f172a' }}>{proc.trainingFee}</strong>
                          </div>
                        )}
                        {proc.bondPeriod && (
                          <div>
                            <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>BOND PERIOD</span>
                            <strong style={{ color: '#0f172a' }}>{proc.bondPeriod}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Referral Link & Actions */}
                    <div>
                      {/* Link Preview Bar */}
                      <div style={{
                        background: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px'
                      }}>
                        <code style={{ fontSize: '0.75rem', color: themeColor, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {directLink}
                        </code>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          onClick={() => copyItReferralLink(proc.id)}
                          style={{
                            flex: 1,
                            background: isCopied ? '#10b981' : themeColor,
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: isCopied ? '0 2px 8px rgba(16, 185, 129, 0.3)' : `0 2px 8px ${themeColor}44`,
                            transition: 'all 0.2s'
                          }}
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{isCopied ? 'Copied Link!' : 'Copy Link'}</span>
                        </button>

                        <button
                          onClick={() => shareItOnWhatsApp(proc)}
                          style={{
                            background: '#25D366',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                          }}
                          title="Share on WhatsApp"
                        >
                          <Send size={14} />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => window.open(directLink, '_blank')}
                          style={{
                            background: '#f8fafc',
                            color: '#475569',
                            border: '1.5px solid #cbd5e1',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                          title="Preview Candidate View"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredItPrograms.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
                <GraduationCap size={44} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 700, margin: '0 0 6px 0' }}>No Matching IT Programs Found</h4>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>Try searching with a different technology or clear your filters.</p>
                <button
                  onClick={() => { setItProgramSearch(''); setItCategoryFilter('all'); }}
                  style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Reset Search
                </button>
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
                              const initialProc = {};
                              if (job.partnerProcessIncentives) {
                                Object.entries(job.partnerProcessIncentives).forEach(([k, v]) => {
                                  if (Number(v) > 0) initialProc[k] = v;
                                });
                              }
                              setPartnerIncentiveForm({
                                freeJobIncentive: '',
                                paidJobIncentive: '',
                                processIncentives: initialProc
                              });
                              setShowPartnerIncentiveModal(true);
                            }}
                            style={{ background: 'white', color: bgGradient.match(/#([0-9a-fA-F]{6})/)?.[1] ? `#${bgGradient.match(/#([0-9a-fA-F]{6})/)[1]}` : '#333', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }}
                          >
                            Set Partner Incentive
                          </button>
                        )}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <button
                            onClick={() => copyJobReferralLink(job.id)}
                            style={{
                              flex: 1,
                              background: copiedJobId === job.id ? '#10b981' : 'rgba(255,255,255,0.22)',
                              border: '1px solid rgba(255,255,255,0.4)',
                              color: 'white',
                              padding: '7px 10px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              backdropFilter: 'blur(4px)',
                              transition: 'all 0.2s'
                            }}
                          >
                            {copiedJobId === job.id ? <Check size={14} /> : <Copy size={14} />}
                            {copiedJobId === job.id ? 'Copied!' : 'Copy Program Link'}
                          </button>
                          <button
                            onClick={() => shareJobOnWhatsApp(job)}
                            style={{
                              background: '#25D366',
                              border: 'none',
                              color: 'white',
                              padding: '7px 12px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 8px rgba(37, 211, 102, 0.4)'
                            }}
                            title="Share on WhatsApp"
                          >
                            <Send size={14} />
                          </button>
                        </div>
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
                            freeJobIncentive: (job.partnerIncentiveFree && Number(job.partnerIncentiveFree) > 0) ? job.partnerIncentiveFree : '',
                            paidJobIncentive: (job.partnerIncentivePaid && Number(job.partnerIncentivePaid) > 0) ? job.partnerIncentivePaid : '',
                            processIncentives: {}
                          });
                          setShowPartnerIncentiveModal(true);
                        }}
                        style={{ background: 'white', color: bgGradient.match(/#([0-9a-fA-F]{6})/)?.[1] ? `#${bgGradient.match(/#([0-9a-fA-F]{6})/)[1]}` : '#333', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }}
                      >
                        Set Partner Incentive
                      </button>
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        onClick={() => copyJobReferralLink(job.id)}
                        style={{
                          flex: 1,
                          background: copiedJobId === job.id ? '#10b981' : 'rgba(255,255,255,0.22)',
                          border: '1px solid rgba(255,255,255,0.4)',
                          color: 'white',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          backdropFilter: 'blur(4px)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {copiedJobId === job.id ? <Check size={14} /> : <Copy size={14} />}
                        {copiedJobId === job.id ? 'Copied!' : 'Copy Job Link'}
                      </button>
                      <button
                        onClick={() => shareJobOnWhatsApp(job)}
                        style={{
                          background: '#25D366',
                          border: 'none',
                          color: 'white',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          boxShadow: '0 2px 8px rgba(37, 211, 102, 0.4)'
                        }}
                        title="Share on WhatsApp"
                      >
                        <Send size={14} />
                      </button>
                    </div>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1rem' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', overflow: 'hidden', background: '#f1f5f9', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {profileData.profilePhoto ? (
                      <img src={profileData.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ fontWeight: 800, color: '#4f46e5', fontSize: '1.5rem' }}>
                        {profileData.name?.charAt(0)?.toUpperCase() || 'H'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ cursor: photoUploading ? 'not-allowed' : 'pointer', background: '#eef2ff', color: '#4f46e5', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #c7d2fe', display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: photoUploading ? 0.7 : 1 }}>
                      {photoUploading ? '⏳ Uploading to Cloudinary...' : '📷 Change Photo'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        disabled={photoUploading}
                        style={{ display: 'none' }} 
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) {
                            showToast('Photo must be less than 5MB', 'error');
                            return;
                          }
                          setPhotoUploading(true);
                          try {
                            const cloudUrl = await uploadToCloudinary(file);
                            setProfileData(prev => ({ ...prev, profilePhoto: cloudUrl }));
                            showToast('Photo uploaded to Cloudinary! Click Save Profile to apply.', 'success');
                          } catch (err) {
                            console.error(err);
                            showToast('Failed to upload photo to Cloudinary', 'error');
                          } finally {
                            setPhotoUploading(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
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
                <h4 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0' }}>Change Password</h4>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Current Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter current password"
                    value={passwordData.oldPassword}
                    onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    className="form-input" 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>New Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="form-input" 
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '0.5rem' }}>
                  <button 
                    className="btn-primary" 
                    onClick={handlePasswordChange}
                    disabled={passwordSaving || !passwordData.oldPassword || !passwordData.newPassword}
                    style={{ padding: '8px 20px', opacity: (passwordSaving || !passwordData.oldPassword || !passwordData.newPassword) ? 0.6 : 1 }}
                  >
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
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
              const closedApps = (stats?.applications || []).filter(a => isCandidateClosedForIncentive(a));
              
              const totalEarned = closedApps.reduce((sum, app) => {
                 const amt = Number(isAgent ? app.agentIncentiveAmount : app.incentiveAmount) || 0;
                 return sum + (app.incentiveStatus === 'Paid' ? amt : 0);
              }, 0);
              
              const totalAvailable = closedApps.reduce((sum, app) => {
                 const amt = Number(isAgent ? app.agentIncentiveAmount : app.incentiveAmount) || 0;
                 return sum + (app.incentiveConfirmed && (!app.incentiveStatus || app.incentiveStatus === 'Pending') && amt > 0 ? amt : 0);
              }, 0);
              
              const withdrawableApps = closedApps.filter(app => {
                 const amt = Number(isAgent ? app.agentIncentiveAmount : app.incentiveAmount) || 0;
                 return app.incentiveConfirmed && (!app.incentiveStatus || app.incentiveStatus === 'Pending') && amt > 0;
              });

              // Check if user has withdrawn in the last 30 days
              const hasRecentWithdrawal = closedApps.some(app => {
                 if (!app.incentiveUpdatedAt || (app.incentiveStatus !== 'Withdraw Requested' && app.incentiveStatus !== 'Paid')) return false;
                 const updatedAt = new Date(app.incentiveUpdatedAt);
                 const now = new Date();
                 const diffDays = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
                 return diffDays < 30;
              });

              const handleWithdraw = async () => {
                 if (hasRecentWithdrawal) {
                    alert('You have already made a withdrawal within the last 30 days. Please wait for the cooldown period to end.');
                    return;
                 }
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
                    alert('Withdrawal request submitted. It will be received in your bank within 24 to 48 hours.');
                 } catch(e) {
                    console.error(e);
                    alert('Failed to request withdrawal');
                 } finally {
                    setLoading(false);
                 }
              };

              const withdrawalHistory = [];
              closedApps.forEach(app => {
                if (app.incentiveStatus === 'Withdraw Requested' || app.incentiveStatus === 'Paid') {
                  const date = new Date(app.incentiveUpdatedAt).toLocaleDateString();
                  const existing = withdrawalHistory.find(w => w.date === date);
                  const amt = Number(isAgent ? app.agentIncentiveAmount : app.incentiveAmount) || 0;
                  if (existing) {
                    existing.amount += amt;
                    existing.apps.push(app);
                    if (app.incentiveStatus === 'Paid') existing.paidCount++;
                  } else {
                    withdrawalHistory.push({
                      id: date,
                      date: date,
                      amount: amt,
                      apps: [app],
                      paidCount: app.incentiveStatus === 'Paid' ? 1 : 0
                    });
                  }
                }
              });
              withdrawalHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

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
                        disabled={totalAvailable === 0 || hasRecentWithdrawal}
                        style={{ background: (totalAvailable > 0 && !hasRecentWithdrawal) ? '#10b981' : '#cbd5e1', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: (totalAvailable > 0 && !hasRecentWithdrawal) ? 'pointer' : 'not-allowed', fontSize: '0.8rem' }}
                        title={hasRecentWithdrawal ? 'You can only withdraw once every 30 days.' : ''}
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
                              {app.incentiveConfirmed ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                  <span>₹{(isAgent ? Number(app.agentIncentiveAmount) : Number(app.incentiveAmount)).toLocaleString()}</span>
                                  {app.incentiveStatus === 'Paid' && <span style={{ fontSize: '0.65rem', background: '#10b981', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>Paid ✓</span>}
                                  {app.incentiveStatus === 'Withdraw Requested' && <span style={{ fontSize: '0.65rem', background: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>Processing</span>}
                                </div>
                              ) : (
                                <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>Pending Admin Setup</span>
                              )}
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

                <div className="table-container" style={{ marginTop: '2.5rem' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>Withdrawal History</h3>
                  </div>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date Requested</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Candidates Included</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawalHistory.map(w => (
                        <tr key={w.id}>
                          <td style={{ fontWeight: 600 }}>{w.date}</td>
                          <td style={{ fontWeight: 800, color: '#059669' }}>₹{w.amount.toLocaleString()}</td>
                          <td>
                            {w.paidCount === w.apps.length ? (
                              <span style={{ background: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Paid ✓</span>
                            ) : (
                              <span style={{ background: '#3b82f6', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Processing</span>
                            )}
                          </td>
                          <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                            {w.apps.map(a => a.candidateName).join(', ')}
                          </td>
                        </tr>
                      ))}
                      {withdrawalHistory.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                            No withdrawals made yet.
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
                  <option value="Document Submission">Document Submission</option>
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
                          value={partnerIncentiveForm.processIncentives[p.processName] ?? ''}
                          placeholder="Enter incentive amount (Rs.)"
                          onChange={(e) => setPartnerIncentiveForm({
                            ...partnerIncentiveForm,
                            processIncentives: {
                              ...partnerIncentiveForm.processIncentives,
                              [p.processName]: e.target.value === '' ? '' : e.target.value
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
                        value={partnerIncentiveForm.freeJobIncentive ?? ''}
                        placeholder="Enter incentive amount (Rs.)"
                        onChange={(e) => setPartnerIncentiveForm({...partnerIncentiveForm, freeJobIncentive: e.target.value === '' ? '' : e.target.value})}
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
                        value={partnerIncentiveForm.paidJobIncentive ?? ''}
                        placeholder="Enter incentive amount (Rs.)"
                        onChange={(e) => setPartnerIncentiveForm({...partnerIncentiveForm, paidJobIncentive: e.target.value === '' ? '' : e.target.value})}
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
