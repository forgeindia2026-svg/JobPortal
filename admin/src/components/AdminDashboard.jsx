import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, FolderTree, Building2, Briefcase, Users, FileText, Gift, Check, X,
  Calendar, CalendarDays, BarChart3, Plus, Edit, Trash2, ExternalLink, RefreshCw, XCircle, GraduationCap, UserPlus, Download, CheckCircle, CreditCard, ArrowLeft, Search, FileCheck, Clock, MousePointerClick,
  Copy, Lock, Eye, EyeOff, Wallet, ChevronRight, Send, Share2, LogOut,
  UserCog, ShieldCheck, Key, User, Mail, Phone, Shield, Trophy
} from 'lucide-react';

import JobFormModal from './JobFormModal';
import CategoryFormModal from './CategoryFormModal';
import CompanyFormModal from './CompanyFormModal';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import ItTrainingModal from './ItTrainingModal';
import ManualApplicationModal from './ManualApplicationModal';
import AgentsManager from './AgentsManager';
import HierarchyManager from './HierarchyManager';
import ClientDashboard from './ClientDashboard';
import ManipalPayoutManager from './ManipalPayoutManager';
import OfferTargetsManager from './OfferTargetsManager';
import { uploadToCloudinary } from '../utils/cloudinary';

// Bank themes & styling helpers for Admin Dashboard
const getBankBrandGradient = (name) => {
  const lowerName = (name || '').toLowerCase();
  if (lowerName.includes('idfc')) return 'linear-gradient(135deg, #881337 0%, #991b1b 50%, #7f1d1d 100%)';
  if (lowerName.includes('bandhan')) return 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f766e 100%)';
  if (lowerName.includes('hdfc')) return 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)';
  if (lowerName.includes('aditya birla')) return 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #991b1b 100%)';
  if (lowerName.includes('kotak')) return 'linear-gradient(135deg, #0f2b48 0%, #003366 50%, #1e3a8a 100%)';
  if (lowerName.includes('mahindra finance') || (lowerName.includes('mahindra') && !lowerName.includes('kotak'))) return 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #9f1239 100%)';
  if (lowerName.includes('axis')) return 'linear-gradient(135deg, #701a75 0%, #831843 50%, #581c87 100%)';
  if (lowerName.includes('icici')) return 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #9a3412 100%)';
  if (lowerName.includes('yes bank') || lowerName.includes('yes')) return 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #075985 100%)';
  if (lowerName.includes('tata aig') || lowerName.includes('tata')) return 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #172554 100%)';
  return 'linear-gradient(135deg, #1e293b 0%, #334155 100%)';
};

const getBankShadowColor = (name) => {
  const lowerName = (name || '').toLowerCase();
  if (lowerName.includes('idfc')) return 'rgba(153, 27, 27, 0.45)';
  if (lowerName.includes('bandhan')) return 'rgba(3, 105, 161, 0.45)';
  if (lowerName.includes('hdfc')) return 'rgba(29, 78, 216, 0.45)';
  if (lowerName.includes('aditya birla')) return 'rgba(185, 28, 28, 0.45)';
  if (lowerName.includes('kotak')) return 'rgba(0, 51, 102, 0.45)';
  if (lowerName.includes('mahindra finance') || (lowerName.includes('mahindra') && !lowerName.includes('kotak'))) return 'rgba(225, 29, 72, 0.45)';
  if (lowerName.includes('axis')) return 'rgba(131, 24, 67, 0.45)';
  if (lowerName.includes('icici')) return 'rgba(234, 88, 12, 0.45)';
  if (lowerName.includes('yes bank') || lowerName.includes('yes')) return 'rgba(2, 132, 199, 0.45)';
  if (lowerName.includes('tata aig') || lowerName.includes('tata')) return 'rgba(30, 58, 138, 0.45)';
  if (lowerName.includes('suryoday')) return 'rgba(234, 88, 12, 0.45)';
  return 'rgba(30, 41, 59, 0.35)';
};

const getNormalizedBankName = (rawName) => {
  const n = String(rawName || '').toLowerCase().trim();
  if (n.includes('kotak')) return 'Kotak Mahindra Bank';
  if (n.includes('mahindra finance') || (n.includes('mahindra') && !n.includes('kotak'))) return 'Mahindra Finance';
  if (n.includes('hdfc life')) return 'HDFC Life';
  if (n.includes('hdfc')) return 'HDFC Bank';
  if (n.includes('idfc')) return 'IDFC First Bank';
  if (n.includes('bandhan')) return 'Bandhan Bank';
  if (n.includes('axis')) return 'Axis Bank';
  if (n.includes('icici')) return 'ICICI Bank';
  if (n.includes('tata aig') || n.includes('tata')) return 'TATA AIG';
  if (n.includes('aditya birla')) return 'Aditya Birla Capital';
  if (n.includes('yes bank') || n.includes('yes')) return 'YES Bank';
  if (n.includes('suryoday')) return 'Suryoday Small Finance Bank';
  return rawName || 'Banking Partner';
};

const getBankLogo = (bankName) => {
  const n = String(bankName || '').toLowerCase().trim();
  if (n.includes('kotak')) return '/logos/kotak_bank.png';
  if (n.includes('mahindra finance') || (n.includes('mahindra') && !n.includes('kotak'))) return '/logos/mahindra_finance.png';
  if (n.includes('tata aig') || n.includes('tata')) return '/logos/tata_aig.png';
  if (n.includes('hdfc')) return '/logos/Hdfc.jpg';
  if (n.includes('idfc')) return '/logos/idfc_first_bank.svg';
  if (n.includes('bandhan')) return '/logos/bandhan_bank.png';
  if (n.includes('axis')) return '/logos/axis_bank.svg';
  if (n.includes('aditya birla')) return '/logos/aditya_birla.jpg';
  if (n.includes('yes bank') || n.includes('yes')) return '/logos/Yes_Bank_Logo.jpg';
  if (n.includes('suryoday')) return '/logos/suryoday.webp';
  return '/logo.png';
};

const getBankAppCategoryStatus = (app, interviewsList = []) => {
  if (!app) return 'processing';
  const s = String(app.status || '').toLowerCase().trim();

  // 1. Rejected
  if (['rejected', 'not interested'].includes(s)) return 'rejected';

  // 2. Closed
  if (['closed', 'joined', 'joined manipal', 'converted', 'hired'].includes(s)) return 'closed';

  // 3. Selected
  if (['selected', 'l1 selected', 'l2 selected'].includes(s)) return 'selected';

  // 3. Document Submission / Verification
  const hasDocInterview = (interviewsList || []).some(i => {
    const match = (i.applicationId && (String(i.applicationId) === String(app.id) || String(i.applicationId) === String(app._id))) ||
                  (i.candidateId && String(i.candidateId) === String(app.candidateId));
    if (!match) return false;
    const intStatus = String(i.status || '').toLowerCase().trim();
    return intStatus.includes('document');
  });
  if (s.includes('document') || s === 'document submission' || s === 'document submitted' || hasDocInterview) {
    return 'document';
  }

  // 4. Interviews
  const hasActiveInterview = (interviewsList || []).some(i => {
    const match = (i.applicationId && (String(i.applicationId) === String(app.id) || String(i.applicationId) === String(app._id))) ||
                  (i.candidateId && String(i.candidateId) === String(app.candidateId));
    if (!match) return false;
    const intStatus = String(i.status || '').toLowerCase().trim();
    if (['rejected', 'not interested', 'cancelled'].includes(intStatus)) return false;
    return true;
  });
  if (s.includes('interview') || hasActiveInterview) {
    return 'interview';
  }

  return 'processing';
};

const getBankBrandTheme = (rawName) => {
  const n = String(rawName || '').toLowerCase().trim();
  if (n.includes('aditya birla')) {
    return {
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fca5a5',
      name: 'Aditya Birla Capital'
    };
  }
  if (n.includes('axis')) {
    return {
      color: '#831843',
      bg: '#fdf2f8',
      border: '#f9a8d4',
      name: 'Axis Bank'
    };
  }
  if (n.includes('kotak')) {
    return {
      color: '#003366',
      bg: '#eff6ff',
      border: '#93c5fd',
      name: 'Kotak Mahindra Bank'
    };
  }
  if (n.includes('idfc')) {
    return {
      color: '#991b1b',
      bg: '#fef2f2',
      border: '#fca5a5',
      name: 'IDFC First Bank'
    };
  }
  if (n.includes('bandhan')) {
    return {
      color: '#0284c7',
      bg: '#f0fdfa',
      border: '#7dd3fc',
      name: 'Bandhan Bank'
    };
  }
  if (n.includes('hdfc')) {
    return {
      color: '#1d4ed8',
      bg: '#eff6ff',
      border: '#93c5fd',
      name: 'HDFC Bank'
    };
  }
  if (n.includes('mahindra finance') || (n.includes('mahindra') && !n.includes('kotak'))) {
    return {
      color: '#e11d48',
      bg: '#fff1f2',
      border: '#fda4af',
      name: 'Mahindra Finance'
    };
  }
  if (n.includes('tata aig') || n.includes('tata')) {
    return {
      color: '#1e40af',
      bg: '#eff6ff',
      border: '#93c5fd',
      name: 'TATA AIG'
    };
  }
  if (n.includes('yes bank') || n.includes('yes')) {
    return {
      color: '#0284c7',
      bg: '#f0f9ff',
      border: '#7dd3fc',
      name: 'YES Bank'
    };
  }
  if (n.includes('icici')) {
    return {
      color: '#c2410c',
      bg: '#fff7ed',
      border: '#fed7aa',
      name: 'ICICI Bank'
    };
  }
  if (n.includes('suryoday')) {
    return {
      color: '#c2410c',
      bg: '#fff7ed',
      border: '#fed7aa',
      name: 'Suryoday Small Finance Bank'
    };
  }
  return {
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    name: rawName || 'General'
  };
};

export default function AdminDashboard({ API_URL, currentUser, onUpdateUser, sidebarOpen, setSidebarOpen, onLogout }) {
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });
  const [paymentSubTab, setPaymentSubTab] = useState('success');

  // Admin Profile & Security Settings state
  const [adminProfileData, setAdminProfileData] = useState({
    name: currentUser?.name || 'Super Admin',
    email: currentUser?.email || '',
    mobile: currentUser?.mobile || ''
  });
  const [adminProfileSaving, setAdminProfileSaving] = useState(false);
  const [adminProfileMsg, setAdminProfileMsg] = useState({ type: '', text: '' });

  const [adminPasswordData, setAdminPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [adminPasswordSaving, setAdminPasswordSaving] = useState(false);
  const [adminPasswordMsg, setAdminPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (currentUser) {
      setAdminProfileData({
        name: currentUser.name || 'Super Admin',
        email: currentUser.email || '',
        mobile: currentUser.mobile || ''
      });
    }
  }, [currentUser]);

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
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const handleAdminProfileSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAdminProfileSaving(true);
    setAdminProfileMsg({ type: '', text: '' });
    try {
      if (!adminProfileData.name.trim()) {
        setAdminProfileMsg({ type: 'error', text: 'Admin name cannot be empty.' });
        setAdminProfileSaving(false);
        return;
      }
      if (!adminProfileData.email.trim()) {
        setAdminProfileMsg({ type: 'error', text: 'Email address cannot be empty.' });
        setAdminProfileSaving(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/users/${currentUser.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminProfileData.name.trim(),
          email: adminProfileData.email.trim(),
          mobile: adminProfileData.mobile ? adminProfileData.mobile.trim() : ''
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setAdminProfileMsg({ type: 'error', text: data.error || 'Failed to update profile.' });
        return;
      }

      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem('admin_user', JSON.stringify(updatedUser));
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }
      setAdminProfileMsg({ type: 'success', text: 'Admin profile updated successfully!' });
      setTimeout(() => setAdminProfileMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setAdminProfileMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setAdminProfileSaving(false);
    }
  };

  const handleAdminPasswordChange = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAdminPasswordSaving(true);
    setAdminPasswordMsg({ type: '', text: '' });

    if (!adminPasswordData.oldPassword) {
      setAdminPasswordMsg({ type: 'error', text: 'Please enter your current password.' });
      setAdminPasswordSaving(false);
      return;
    }
    if (!adminPasswordData.newPassword) {
      setAdminPasswordMsg({ type: 'error', text: 'Please enter a new password.' });
      setAdminPasswordSaving(false);
      return;
    }
    if (adminPasswordData.newPassword.length < 4) {
      setAdminPasswordMsg({ type: 'error', text: 'New password must be at least 4 characters.' });
      setAdminPasswordSaving(false);
      return;
    }
    if (adminPasswordData.newPassword !== adminPasswordData.confirmPassword) {
      setAdminPasswordMsg({ type: 'error', text: 'New password and confirm password do not match.' });
      setAdminPasswordSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/${currentUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword: adminPasswordData.oldPassword,
          newPassword: adminPasswordData.newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setAdminPasswordMsg({ type: 'error', text: data.error || 'Failed to update password.' });
        return;
      }

      setAdminPasswordMsg({ type: 'success', text: 'Password updated successfully! Please keep your new password safe.' });
      setAdminPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setAdminPasswordMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setAdminPasswordMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setAdminPasswordSaving(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    setSelectedHrForCandidates(null);
    setSelectedBankForDashboard(null);
    setDashboardBankStatusFilter('all');
    setDashboardBankSearch('');
    setDashboardBankDateFilter('all');
    setDashboardBankCustomStartDate('');
    setDashboardBankCustomEndDate('');
    setDashboardBankHrFilter('all');
  };

  const [selectedBankForDashboard, setSelectedBankForDashboard] = useState(null);
  const [dashboardBankStatusFilter, setDashboardBankStatusFilter] = useState('all');
  const [dashboardBankSearch, setDashboardBankSearch] = useState('');
  const [dashboardBankDateFilter, setDashboardBankDateFilter] = useState('all');
  const [dashboardBankCustomStartDate, setDashboardBankCustomStartDate] = useState('');
  const [dashboardBankCustomEndDate, setDashboardBankCustomEndDate] = useState('');
  const [dashboardBankHrFilter, setDashboardBankHrFilter] = useState('all');

  const handleResetDashboardBankFilters = () => {
    setDashboardBankStatusFilter('all');
    setDashboardBankSearch('');
    setDashboardBankDateFilter('all');
    setDashboardBankCustomStartDate('');
    setDashboardBankCustomEndDate('');
    setDashboardBankHrFilter('all');
  };

  const [kpis, setKpis] = useState(null);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [interviewFilter, setInterviewFilter] = useState('active'); // 'active' | 'all' | 'document' | 'selected' | 'rejected'
  const [itProcesses, setItProcesses] = useState([]);
  const [globalItIncentives, setGlobalItIncentives] = useState({});
  const [hrs, setHrs] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [clientSubTab, setClientSubTab] = useState('pipeline'); // 'pipeline' | 'accounts'
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [clientForm, setClientForm] = useState({ name: '', email: '', mobile: '', password: '', allowedBanks: [], allowedJobs: [] });
  const [bankAccessModalOpen, setBankAccessModalOpen] = useState(false);
  const [accessModalTab, setAccessModalTab] = useState('banks'); // 'banks' | 'jobs'
  const [selectedClientForBanks, setSelectedClientForBanks] = useState(null);
  const [bankSelectionList, setBankSelectionList] = useState([]);
  const [jobSelectionList, setJobSelectionList] = useState([]);
  const [savingBankAccess, setSavingBankAccess] = useState(false);
  const [previewClientId, setPreviewClientId] = useState('all');

  const allAvailableBanks = useMemo(() => {
    const defaults = [
      'Aditya Birla Capital',
      'IDFC First Bank',
      'Bandhan Bank',
      'Kotak Mahindra Bank',
      'Axis Bank',
      'ICICI Bank',
      'HDFC Bank',
      'Mahindra Finance',
      'TATA AIG',
      'YES Bank',
      'Suryoday Small Finance Bank'
    ];
    (companies || []).filter(c => c.categoryId === 'cat_banking').forEach(c => {
      const bName = getNormalizedBankName(c.name);
      if (!defaults.includes(bName)) defaults.push(bName);
    });
    return defaults;
  }, [companies]);

  const getJobsForBank = (bName) => {
    return (jobs || []).filter(j => {
      const jCompName = getNormalizedBankName(j.companyName || '');
      return jCompName.toLowerCase() === bName.toLowerCase() ||
             bName.toLowerCase().includes(jCompName.toLowerCase()) ||
             jCompName.toLowerCase().includes(bName.toLowerCase());
    });
  };

  const handleOpenBankModal = (client = null) => {
    const targetClient = client || (clients && clients.length > 0 ? clients[0] : null);
    setSelectedClientForBanks(targetClient);
    if (targetClient && Array.isArray(targetClient.allowedBanks) && targetClient.allowedBanks.length > 0) {
      setBankSelectionList([...targetClient.allowedBanks]);
    } else {
      setBankSelectionList([]); // all banks
    }
    if (targetClient && Array.isArray(targetClient.allowedJobs) && targetClient.allowedJobs.length > 0) {
      setJobSelectionList([...targetClient.allowedJobs]);
    } else {
      setJobSelectionList([]); // all jobs
    }
    setAccessModalTab('banks');
    setBankAccessModalOpen(true);
  };

  const handleSaveBankAccess = async () => {
    if (!selectedClientForBanks) return;
    try {
      setSavingBankAccess(true);
      const updatedAllowedBanks = bankSelectionList.includes('__NONE__') ? ['__NONE__'] : bankSelectionList;
      const updatedAllowedJobs = jobSelectionList.includes('__NONE__') ? ['__NONE__'] : jobSelectionList;
      await fetch(`${API_URL}/api/users/client/${selectedClientForBanks.id}/banks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowedBanks: updatedAllowedBanks, allowedJobs: updatedAllowedJobs })
      });

      setClients(prev => {
        const updated = prev.map(c => c.id === selectedClientForBanks.id ? { ...c, allowedBanks: updatedAllowedBanks, allowedJobs: updatedAllowedJobs } : c);
        localStorage.setItem('admin_clients_cache', JSON.stringify(updated));
        return updated;
      });

      setBankAccessModalOpen(false);
      const bankSummary = updatedAllowedBanks.length === 0 
        ? 'All Banks' 
        : (updatedAllowedBanks.includes('__NONE__') ? 'None' : updatedAllowedBanks.join(', '));
      const jobSummary = updatedAllowedJobs.length === 0 
        ? 'All Jobs in Assigned Banks' 
        : (updatedAllowedJobs.includes('__NONE__') ? 'None' : `${updatedAllowedJobs.length} specific jobs`);
      alert(`Client access updated successfully for "${selectedClientForBanks.name}"!\n\nVisible Banks: ${bankSummary}\nVisible Jobs: ${jobSummary}`);
    } catch (err) {
      console.error('Error saving bank/job access:', err);
      alert('Failed to save access: ' + err.message);
    } finally {
      setSavingBankAccess(false);
    }
  };

  const candidatePortalBaseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5173'
    : 'https://jobs.forgeindiaconnect.in';

  const [copiedJobId, setCopiedJobId] = useState(null);

  const handleCopyJobLink = (jobId) => {
    const url = `${candidatePortalBaseUrl}/?job=${jobId}`;
    navigator.clipboard.writeText(url);
    setCopiedJobId(jobId);
    setTimeout(() => setCopiedJobId(null), 2500);
  };

  const handleWhatsAppShareJob = (job) => {
    const url = `${candidatePortalBaseUrl}/?job=${job.id}`;
    const text = `🔥 *Job Opening: ${job.title}*\n🏢 *Company:* ${job.companyName || 'Top MNC'}\n📍 *Location:* ${job.location || 'PAN India'}\n💰 *Salary:* ${job.salary || 'Best in Industry'}\n\n👉 *Apply here:* ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };
  const [clientShowPassword, setClientShowPassword] = useState(false);
  const [clientError, setClientError] = useState('');
  const [clientSaving, setClientSaving] = useState(false);
  const [copiedClientId, setCopiedClientId] = useState(null);

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
  const [photoUploading, setPhotoUploading] = useState(false);
  const [hrError, setHrError] = useState('');

  const [incentiveModalOpen, setIncentiveModalOpen] = useState(false);
  const [selectedHrForIncentive, setSelectedHrForIncentive] = useState(null);
  const [incentiveInput, setIncentiveInput] = useState({}); // { [applicationId]: amount }
  const [incentiveSaving, setIncentiveSaving] = useState(false);
  const [incentiveError, setIncentiveError] = useState('');

  // Candidate is closed: Only when closed, joined, converted, or hired (Selected candidates are NOT closed)
  const isCandidateClosedForIncentive = (app) => {
    if (!app) return false;
    const s = String(app.status || '').toLowerCase().trim();
    if (['payment pending', 'unpaid', 'rejected', 'not interested', 'cancelled', 'selected', 'l1 selected', 'l2 selected'].includes(s) || s.includes('select')) return false;

    return ['closed', 'joined', 'joined manipal', 'converted', 'hired', 'enrollment'].includes(s) ||
           s.includes('closed') || s.includes('joined') || s.includes('hired');
  };

  const CLOSED_STATUSES = ['closed', 'joined', 'joined manipal', 'converted', 'hired', 'enrollment'];
  const getHrClosedApps = (hr) => {
    if (!hr) return [];
    const code = String(hr.referralCode || '').toLowerCase();
    const agentCodes = Array.isArray(hr.agentCodes) ? hr.agentCodes : [];
    const allCodes = [code, ...agentCodes];
    
    return applications.filter(app => {
      const ref = String(app.referredBy || '').toLowerCase();
      return allCodes.includes(ref) && isCandidateClosedForIncentive(app);
    });
  };

  const [activeItCategoryTab, setActiveItCategoryTab] = useState('Placement');


  const [hrRefModalApp, setHrRefModalApp] = useState(null);
  const [selectedHrRef, setSelectedHrRef] = useState('');
  const [savingHrRef, setSavingHrRef] = useState(false);

  const [appDateFilter, setAppDateFilter] = useState('all');
  const [appCustomStartDate, setAppCustomStartDate] = useState('');
  const [appCustomEndDate, setAppCustomEndDate] = useState('');
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [appHrFilter, setAppHrFilter] = useState('all');

  const [manualAppModalOpen, setManualAppModalOpen] = useState(false);
  const [selectedHrForPartners, setSelectedHrForPartners] = useState(null);
  const [selectedHrForCandidates, setSelectedHrForCandidates] = useState(null);
  const [hrCandidateSearch, setHrCandidateSearch] = useState('');
  const [hrCandidateStatusFilter, setHrCandidateStatusFilter] = useState('all');
  const [clickStats, setClickStats] = useState(null);
  const [showClickStatsModal, setShowClickStatsModal] = useState(false);
  const [clickStatsSearch, setClickStatsSearch] = useState('');

  const handleOpenHrCandidates = (hr, initialFilter = 'all') => {
    setActiveTab('employees');
    setSidebarOpen(false);
    setSelectedHrForCandidates(hr);
    setHrCandidateStatusFilter(initialFilter);
    setHrCandidateSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      const [hrRes, agentsRes, clicksRes] = await Promise.all([
        fetch(`${API_URL}/api/users/hr`),
        fetch(`${API_URL}/api/users/agents/all`),
        fetch(`${API_URL}/api/users/stats/clicks`).catch(() => null)
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
      if (clicksRes && clicksRes.ok) {
        const clicksData = await clicksRes.json();
        setClickStats(clicksData);
      }
    } catch (err) {
      console.warn('User endpoints not available yet:', err.message);
    }

    // Clients fetch
    try {
      const clientRes = await fetch(`${API_URL}/api/users/clients`);
      if (clientRes.ok) {
        const clientData = await clientRes.json();
        if (Array.isArray(clientData) && clientData.length > 0) {
          setClients(clientData);
          localStorage.setItem('admin_clients_cache', JSON.stringify(clientData));
        } else {
          const cached = JSON.parse(localStorage.getItem('admin_clients_cache') || '[]');
          if (cached.length > 0) {
            setClients(cached);
          } else {
            const defaultClient = [{
              id: 'usr_client_default',
              name: 'Banking Client Partner',
              email: 'client@forgeindiaconnect.in',
              mobile: '9876543210',
              role: 'client',
              createdAt: '2026-10-22T00:00:00.000Z'
            }];
            setClients(defaultClient);
            localStorage.setItem('admin_clients_cache', JSON.stringify(defaultClient));
          }
        }
      } else {
        const cached = JSON.parse(localStorage.getItem('admin_clients_cache') || '[]');
        if (cached.length > 0) {
          setClients(cached);
        } else {
          const defaultClient = [{
            id: 'usr_client_default',
            name: 'Banking Client Partner',
            email: 'client@forgeindiaconnect.in',
            mobile: '9876543210',
            role: 'client',
            createdAt: '2026-10-22T00:00:00.000Z'
          }];
          setClients(defaultClient);
          localStorage.setItem('admin_clients_cache', JSON.stringify(defaultClient));
        }
      }
    } catch (err) {
      const cached = JSON.parse(localStorage.getItem('admin_clients_cache') || '[]');
      if (cached.length > 0) setClients(cached);
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

  const handleSaveClient = async (e) => {
    e.preventDefault();
    setClientSaving(true);
    setClientError('');

    try {
      const payload = {
        name: clientForm.name.trim(),
        email: clientForm.email.trim().toLowerCase(),
        mobile: clientForm.mobile.trim(),
        allowedBanks: Array.isArray(clientForm.allowedBanks) ? clientForm.allowedBanks : [],
        allowedJobs: Array.isArray(clientForm.allowedJobs) ? clientForm.allowedJobs : []
      };
      if (clientForm.password && clientForm.password.trim()) {
        payload.password = clientForm.password;
      }

      if (!payload.name || !payload.email) {
        setClientError('Name and Email ID are required.');
        setClientSaving(false);
        return;
      }

      if (!clientToEdit && !payload.password) {
        setClientError('Password is required for new client.');
        setClientSaving(false);
        return;
      }

      let res;
      let newOrUpdatedClient = null;

      if (clientToEdit) {
        res = await fetch(`${API_URL}/api/users/client/${clientToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/api/users/client`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res && res.ok) {
        newOrUpdatedClient = await res.json();
      } else if (res && !res.ok && res.status !== 404) {
        const errData = await res.json().catch(() => ({}));
        setClientError(errData.error || 'Failed to save client.');
        setClientSaving(false);
        return;
      } else {
        // Fallback for offline/local cache
        newOrUpdatedClient = {
          id: clientToEdit ? clientToEdit.id : 'usr_client_' + Date.now(),
          name: payload.name,
          email: payload.email,
          mobile: payload.mobile,
          role: 'client',
          allowedBanks: payload.allowedBanks,
          allowedJobs: payload.allowedJobs,
          createdAt: clientToEdit ? clientToEdit.createdAt : new Date().toISOString()
        };
      }

      // Update state and cache
      if (newOrUpdatedClient) {
        setClients(prev => {
          let updated;
          if (clientToEdit) {
            updated = prev.map(c => c.id === clientToEdit.id ? { ...c, ...newOrUpdatedClient } : c);
          } else {
            updated = [newOrUpdatedClient, ...prev.filter(c => c.email !== newOrUpdatedClient.email)];
          }
          localStorage.setItem('admin_clients_cache', JSON.stringify(updated));
          return updated;
        });
      }

      setClientModalOpen(false);
      setClientToEdit(null);
      setClientForm({ name: '', email: '', mobile: '', password: '', allowedBanks: [], allowedJobs: [] });
      alert(clientToEdit ? 'Client updated successfully!' : `Client account created successfully!\n\nUser ID: ${payload.email}\nPassword: ${payload.password}\n\nClient can now log in at the portal.`);
    } catch (err) {
      console.error('Error saving client:', err);
      setClientError('Error saving client: ' + err.message);
    } finally {
      setClientSaving(false);
    }
  };

  const handleDeleteClient = async (client) => {
    if (!window.confirm(`Are you sure you want to delete client account "${client.name}" (${client.email})?`)) {
      return;
    }

    try {
      await fetch(`${API_URL}/api/users/client/${client.id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API delete client failed, removing locally:', e);
    }

    setClients(prev => {
      const updated = prev.filter(c => c.id !== client.id);
      localStorage.setItem('admin_clients_cache', JSON.stringify(updated));
      return updated;
    });
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

  const validApplications = applications.filter(app => app.status !== 'Payment Pending');

  const docSubmissionCount = useMemo(() => {
    const ids = new Set();
    validApplications.forEach(a => {
      const s = String(a.status || '').toLowerCase().trim();
      if (['document submission', 'document submitted', 'documents submitted', 'documents submission', 'document verification'].includes(s) || s.includes('document')) {
        ids.add(a.id);
      }
    });
    (interviews || []).forEach(int => {
      const s = String(int.status || '').toLowerCase().trim();
      if (['document submission', 'document submitted', 'documents submitted', 'documents submission', 'document verification'].includes(s) || s.includes('document')) {
        if (int.applicationId) ids.add(int.applicationId);
      }
    });
    return ids.size;
  }, [validApplications, interviews]);

  const activeInterviews = useMemo(() => {
    return (interviews || []).filter(int => {
      const intStatus = String(int.status || '').toLowerCase().trim();
      if (['rejected', 'not interested', 'cancelled'].includes(intStatus)) return false;
      if (['selected', 'hired', 'converted'].includes(intStatus)) return false;
      if (intStatus.includes('document')) return false;

      const app = applications.find(a => 
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
  }, [interviews, applications]);

  const displayedInterviews = useMemo(() => {
    if (interviewFilter === 'all') return interviews || [];
    if (interviewFilter === 'active') return activeInterviews;
    if (interviewFilter === 'document') {
      return (interviews || []).filter(int => {
        const intStatus = String(int.status || '').toLowerCase().trim();
        if (intStatus.includes('document')) return true;
        const app = applications.find(a => 
          (int.applicationId && String(a.id) === String(int.applicationId)) ||
          (int.candidateId && String(a.candidateId) === String(int.candidateId))
        );
        return app && String(app.status || '').toLowerCase().trim().includes('document');
      });
    }
    if (interviewFilter === 'selected') {
      return (interviews || []).filter(int => {
        const intStatus = String(int.status || '').toLowerCase().trim();
        if (['selected', 'hired', 'converted'].includes(intStatus)) return true;
        const app = applications.find(a => 
          (int.applicationId && String(a.id) === String(int.applicationId)) ||
          (int.candidateId && String(a.candidateId) === String(int.candidateId))
        );
        return app && ['selected', 'hired', 'converted'].includes(String(app.status || '').toLowerCase().trim());
      });
    }
    if (interviewFilter === 'rejected') {
      return (interviews || []).filter(int => {
        const intStatus = String(int.status || '').toLowerCase().trim();
        if (['rejected', 'not interested', 'cancelled'].includes(intStatus)) return true;
        const app = applications.find(a => 
          (int.applicationId && String(a.id) === String(int.applicationId)) ||
          (int.candidateId && String(a.candidateId) === String(int.candidateId))
        );
        return app && ['rejected', 'not interested'].includes(String(app.status || '').toLowerCase().trim());
      });
    }
    return activeInterviews;
  }, [interviews, activeInterviews, interviewFilter, applications]);

  const manipalPayoutCandidates = useMemo(() => {
    return (applications || []).filter(app => {
      const s = String(app.status || '').toLowerCase().trim();
      if (s === 'payment pending' || s === 'unpaid') return false;

      const isJoinedManipal = s === 'joined manipal' || s.includes('joined manipal');
      const isExplicitlyPaid = String(app.manipalPayoutStatus || '').toLowerCase() === 'paid';

      // Count candidate in Manipal payout pipeline if Joined Manipal status or explicitly marked Paid
      return isJoinedManipal || isExplicitlyPaid;
    });
  }, [applications]);

  const manipalPaidCount = useMemo(() => {
    return manipalPayoutCandidates.filter(a => String(a.manipalPayoutStatus || '').toLowerCase() === 'paid').length;
  }, [manipalPayoutCandidates]);

  const manipalPendingCount = useMemo(() => {
    return manipalPayoutCandidates.filter(a => String(a.manipalPayoutStatus || 'pending').toLowerCase() !== 'paid').length;
  }, [manipalPayoutCandidates]);

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
        
        const isClosed = isCandidateClosedForIncentive(app);
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

  const totalHrClicks = useMemo(() => {
    return hrs.reduce((sum, h) => sum + (Number(h.linkClicks) || 0), 0);
  }, [hrs]);

  const totalAgentClicks = useMemo(() => {
    return allAgents.reduce((sum, a) => sum + (Number(a.linkClicks) || 0), 0);
  }, [allAgents]);

  const directAppsCount = useMemo(() => {
    return validApplications.filter(a => !a.referredBy || a.referredBy === 'DIRECT').length;
  }, [validApplications]);

  const recordedDirectClicks = clickStats?.directClicks ?? (kpis?.kpis?.directLinkClicks || 0);
  const effectiveDirectClicks = Math.max(recordedDirectClicks, directAppsCount);
  const grandTotalClicks = totalHrClicks + totalAgentClicks + effectiveDirectClicks;

  const [selectedHrForUpcomingDetails, setSelectedHrForUpcomingDetails] = useState(null);

  const todayAppCount = validApplications.filter(a => isToday(a.appliedAt)).length;
  const yesterdayAppCount = validApplications.filter(a => isYesterday(a.appliedAt)).length;
  const last7DaysAppCount = validApplications.filter(a => isLast7Days(a.appliedAt)).length;
  const thisMonthAppCount = validApplications.filter(a => isThisMonth(a.appliedAt)).length;
  const customAppCount = validApplications.filter(a => isInCustomDateRange(a.appliedAt, appCustomStartDate, appCustomEndDate)).length;

  const filteredApplications = validApplications.filter(app => {
    if (appDateFilter === 'today' && !isToday(app.appliedAt)) return false;
    if (appDateFilter === 'yesterday' && !isYesterday(app.appliedAt)) return false;
    if (appDateFilter === 'last7' && !isLast7Days(app.appliedAt)) return false;
    if (appDateFilter === 'thisMonth' && !isThisMonth(app.appliedAt)) return false;
    if (appDateFilter === 'custom' && (appCustomStartDate || appCustomEndDate) && !isInCustomDateRange(app.appliedAt, appCustomStartDate, appCustomEndDate)) return false;

    if (appStatusFilter !== 'all') {
      if (appStatusFilter.toLowerCase() === 'processing') {
        const procStatuses = ['applied', 'shortlisted', 'follow up', 'under review', 'hr screening', 'processing', 'pending'];
        const s = (app.status || '').toLowerCase();
        if (!procStatuses.includes(s) || s.includes('interview') || s.includes('document')) return false;
      } else if (appStatusFilter.toLowerCase() === 'selected') {
        const selStatuses = ['selected', 'converted'];
        if (!selStatuses.includes((app.status || '').toLowerCase())) return false;
      } else if (appStatusFilter.toLowerCase() === 'document submission') {
        const s = (app.status || '').toLowerCase().trim();
        const isDoc = ['document submission', 'document submitted', 'documents submitted', 'documents submission', 'document verification'].includes(s) || s.includes('document');
        const hasDocInterview = (interviews || []).some(int => int.applicationId === app.id && String(int.status || '').toLowerCase().includes('document'));
        if (!isDoc && !hasDocInterview) return false;
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

  const hrAllCandidates = useMemo(() => {
    if (!selectedHrForCandidates) return [];
    const refCode = String(selectedHrForCandidates.referralCode || '').trim().toLowerCase();
    return validApplications.filter(app => String(app.referredBy || '').trim().toLowerCase() === refCode);
  }, [selectedHrForCandidates, validApplications]);

  const hrFilteredCandidates = useMemo(() => {
    if (!selectedHrForCandidates) return [];
    return hrAllCandidates.filter(app => {
      if (hrCandidateStatusFilter !== 'all') {
        const filterLower = hrCandidateStatusFilter.toLowerCase().trim();
        const s = String(app.status || '').toLowerCase().trim();

        if (filterLower === 'processing') {
          const procStatuses = ['applied', 'shortlisted', 'follow up', 'under review', 'hr screening', 'processing', 'pending', 'interview scheduled', 'scheduled'];
          const isDoc = ['document submission', 'document submitted', 'documents submitted', 'documents submission', 'document verification'].includes(s) || s.includes('document');
          const isFinal = ['selected', 'closed', 'joined', 'converted', 'hired', 'rejected', 'not interested'].includes(s);
          if (isDoc || isFinal) return false;
        } else if (filterLower === 'document submission' || filterLower === 'document submitted' || filterLower === 'document') {
          const isDoc = ['document submission', 'document submitted', 'documents submitted', 'documents submission', 'document verification'].includes(s) || s.includes('document');
          const hasDocInt = (interviews || []).some(int => (String(int.candidateId) === String(app.candidateId) || String(int.applicationId) === String(app.id)) && String(int.status || '').toLowerCase().includes('document'));
          if (!isDoc && !hasDocInt) return false;
        } else if (filterLower === 'selected') {
          const isSel = ['selected', 'l1 selected', 'l2 selected'].includes(s) || s.includes('select');
          if (!isSel) return false;
        } else if (filterLower === 'closed') {
          const isCloOrSel = !['payment pending', 'unpaid', 'rejected', 'not interested', 'cancelled'].includes(s) && (s.includes('select') || s.includes('closed') || s.includes('joined') || s.includes('hired') || s.includes('convert') || s.includes('enroll'));
          if (!isCloOrSel) return false;
        } else if (filterLower === 'rejected') {
          const isRej = ['rejected', 'not interested'].includes(s);
          if (!isRej) return false;
        } else {
          if (s !== filterLower) return false;
        }
      }

      if (hrCandidateSearch.trim()) {
        const q = hrCandidateSearch.toLowerCase();
        const matchName = String(app.candidateName || '').toLowerCase().includes(q);
        const matchEmail = String(app.candidateEmail || '').toLowerCase().includes(q);
        const matchMobile = String(app.candidateMobile || '').toLowerCase().includes(q);
        const matchAppNo = String(app.applicationNumber || '').toLowerCase().includes(q);
        const matchJob = String(app.jobTitle || '').toLowerCase().includes(q);
        const matchCompany = String(app.companyName || '').toLowerCase().includes(q);

        if (!matchName && !matchEmail && !matchMobile && !matchAppNo && !matchJob && !matchCompany) {
          return false;
        }
      }

      return true;
    });
  }, [selectedHrForCandidates, hrAllCandidates, hrCandidateSearch, hrCandidateStatusFilter, interviews]);

  const hrCandidateStats = useMemo(() => {
    if (!selectedHrForCandidates) return { total: 0, closed: 0, selected: 0, documentSubmitted: 0, processing: 0, rejected: 0, incentives: 0, upcomingAmount: 0 };
    const total = hrAllCandidates.length;

    const isDoc = (app) => {
      const s = String(app.status || '').toLowerCase().trim();
      const isDocStatus = ['document submission', 'document submitted', 'documents submitted', 'documents submission', 'document verification'].includes(s) || s.includes('document');
      const hasDocInt = (interviews || []).some(int => (String(int.candidateId) === String(app.candidateId) || String(int.applicationId) === String(app.id)) && String(int.status || '').toLowerCase().includes('document'));
      return isDocStatus || hasDocInt;
    };

    const isSel = (app) => ['selected', 'l1 selected', 'l2 selected'].includes(String(app.status || '').toLowerCase().trim()) || String(app.status || '').toLowerCase().trim().includes('select');
    const isClo = (app) => ['closed', 'joined', 'converted', 'hired', 'enrollment', 'joined manipal'].includes(String(app.status || '').toLowerCase().trim()) || (!isSel(app) && (String(app.status || '').toLowerCase().trim().includes('closed') || String(app.status || '').toLowerCase().trim().includes('joined') || String(app.status || '').toLowerCase().trim().includes('hired')));
    const isRej = (app) => ['rejected', 'not interested'].includes(String(app.status || '').toLowerCase().trim());

    const documentSubmitted = hrAllCandidates.filter(a => isDoc(a) && !isSel(a) && !isClo(a) && !isRej(a)).length;
    const selected = hrAllCandidates.filter(a => isSel(a)).length;
    const closed = hrAllCandidates.filter(a => isClo(a)).length;
    const rejected = hrAllCandidates.filter(a => isRej(a)).length;
    const processing = hrAllCandidates.filter(a => !isDoc(a) && !isSel(a) && !isClo(a) && !isRej(a)).length;

    const incentives = selectedHrForCandidates.incentives || 0;

    const hrUpcoming = upcomingIncentivesData.find(u => 
      u.hr?.id === selectedHrForCandidates.id || 
      String(u.hr?.referralCode || '').trim().toLowerCase() === String(selectedHrForCandidates.referralCode || '').trim().toLowerCase()
    );
    const upcomingAmount = hrUpcoming ? hrUpcoming.upcomingAmount : 0;

    return { total, closed, selected, documentSubmitted, processing, rejected, incentives, upcomingAmount };
  }, [selectedHrForCandidates, hrAllCandidates, upcomingIncentivesData, interviews]);

  // Banking applications for Admin Dashboard (strictly excludes Payment Pending)
  const adminBankingApplications = useMemo(() => {
    return (validApplications || []).filter(app => {
      const s = String(app.status || '').toLowerCase().trim();
      if (!s || s.includes('payment pending') || s === 'unpaid' || s.includes('pending payment')) {
        return false;
      }
      const catId = String(app.categoryId || '').toLowerCase();
      const compName = String(app.companyName || '').toLowerCase();
      const jobTitle = String(app.jobTitle || '').toLowerCase();

      const isBankCategory = catId === 'cat_banking';
      const isBankCompany = /bank|banking|nbfc|kotak|axis|idfc|hdfc|icici|bandhan|yes bank|mahindra finance|aditya birla|tata aig/i.test(compName);
      const isBankJob = /bank|banking|relationship officer|relationship executive|branch manager|branch|casa|banca/i.test(jobTitle);

      return isBankCategory || isBankCompany || isBankJob;
    }).sort((a, b) => {
      const dateA = new Date(a.appliedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.appliedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [validApplications]);

  // Group applications by Bank / Company for Admin Dashboard
  // Group applications by Bank / Company for Admin Dashboard (matches ClientDashboard)
  const adminBankGroups = useMemo(() => {
    const map = {};

    adminBankingApplications.forEach(app => {
      const bName = getNormalizedBankName(app.companyName);
      if (!map[bName]) {
        map[bName] = {
          bankName: bName,
          logo: getBankLogo(bName),
          totalCount: 0,
          processing: 0,
          interview: 0,
          document: 0,
          selected: 0,
          closed: 0,
          rejected: 0,
          applications: []
        };
      }

      map[bName].totalCount++;
      map[bName].applications.push(app);

      const cat = getBankAppCategoryStatus(app, interviews);
      if (cat === 'selected') map[bName].selected++;
      else if (cat === 'closed') map[bName].closed++;
      else if (cat === 'rejected') map[bName].rejected++;
      else if (cat === 'interview') map[bName].interview++;
      else if (cat === 'document') map[bName].document++;
      else map[bName].processing++;
    });

    // Also include known active banking companies
    (companies || []).filter(c => c.categoryId === 'cat_banking').forEach(c => {
      const bName = getNormalizedBankName(c.name);
      if (!map[bName]) {
        map[bName] = {
          bankName: bName,
          logo: getBankLogo(bName),
          totalCount: 0,
          processing: 0,
          interview: 0,
          document: 0,
          selected: 0,
          closed: 0,
          rejected: 0,
          applications: []
        };
      }
    });

    return Object.values(map).sort((a, b) => b.totalCount - a.totalCount || a.bankName.localeCompare(b.bankName));
  }, [adminBankingApplications, companies, interviews]);

  // Selected Bank Object & its Candidates for Admin Dashboard
  const selectedAdminBankObj = useMemo(() => {
    if (!selectedBankForDashboard) return null;
    return adminBankGroups.find(b => b.bankName.toLowerCase() === selectedBankForDashboard.toLowerCase()) || {
      bankName: selectedBankForDashboard,
      logo: getBankLogo(selectedBankForDashboard),
      totalCount: 0,
      processing: 0,
      interview: 0,
      document: 0,
      selected: 0,
      closed: 0,
      rejected: 0,
      applications: []
    };
  }, [adminBankGroups, selectedBankForDashboard]);

  // Filter candidates for the selected bank
  const filteredDashboardBankCandidates = useMemo(() => {
    if (!selectedBankForDashboard) return [];

    let list = adminBankingApplications.filter(app => {
      const appBank = getNormalizedBankName(app.companyName);
      return appBank.toLowerCase() === selectedBankForDashboard.toLowerCase();
    });

    if (dashboardBankStatusFilter !== 'all') {
      list = list.filter(app => getBankAppCategoryStatus(app, interviews) === dashboardBankStatusFilter);
    }

    if (dashboardBankDateFilter === 'today') {
      list = list.filter(app => isToday(app.appliedAt));
    } else if (dashboardBankDateFilter === 'yesterday') {
      list = list.filter(app => isYesterday(app.appliedAt));
    } else if (dashboardBankDateFilter === 'last7days') {
      list = list.filter(app => isLast7Days(app.appliedAt));
    } else if (dashboardBankDateFilter === 'thismonth') {
      list = list.filter(app => isThisMonth(app.appliedAt));
    } else if (dashboardBankDateFilter === 'custom' && (dashboardBankCustomStartDate || dashboardBankCustomEndDate)) {
      list = list.filter(app => isInCustomDateRange(app.appliedAt, dashboardBankCustomStartDate, dashboardBankCustomEndDate));
    }

    if (dashboardBankHrFilter === 'direct') {
      list = list.filter(app => !app.referredBy || String(app.referredBy).toLowerCase() === 'direct');
    } else if (dashboardBankHrFilter !== 'all') {
      list = list.filter(app => String(app.referredBy || '').toLowerCase() === dashboardBankHrFilter.toLowerCase());
    }

    if (dashboardBankSearch.trim()) {
      const q = dashboardBankSearch.trim().toLowerCase();
      list = list.filter(app => {
        const name = String(app.candidateName || '').toLowerCase();
        const mobile = String(app.candidateMobile || '').toLowerCase();
        const email = String(app.candidateEmail || '').toLowerCase();
        const job = String(app.jobTitle || '').toLowerCase();
        const appNum = String(app.applicationNumber || '').toLowerCase();
        const ref = String(app.referredBy || '').toLowerCase();
        return name.includes(q) || mobile.includes(q) || email.includes(q) || job.includes(q) || appNum.includes(q) || ref.includes(q);
      });
    }

    return list;
  }, [adminBankingApplications, selectedBankForDashboard, dashboardBankStatusFilter, dashboardBankDateFilter, dashboardBankCustomStartDate, dashboardBankCustomEndDate, dashboardBankHrFilter, dashboardBankSearch, interviews]);

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

  const handleQuickUpdateCompanyOrder = async (companyId, newOrder) => {
    const parsedOrder = parseInt(newOrder, 10);
    if (isNaN(parsedOrder) || parsedOrder < 1) return;
    try {
      setCompanies(prev =>
        [...prev]
          .map(c => (c.id === companyId ? { ...c, displayOrder: parsedOrder } : c))
          .sort((a, b) => (Number(a.displayOrder ?? 99) - Number(b.displayOrder ?? 99)) || (a.name || '').localeCompare(b.name || ''))
      );
      const res = await fetch(`${API_URL}/api/companies/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayOrder: parsedOrder })
      });
      if (res.ok) {
        const compRes = await fetch(`${API_URL}/api/companies`);
        const compData = await compRes.json();
        if (Array.isArray(compData)) {
          setCompanies(compData);
        }
      }
    } catch (err) {
      console.error('Failed to update company order:', err);
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
        app.appliedAt ? `${new Date(app.appliedAt).toLocaleDateString('en-IN')} ${new Date(app.appliedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}` : 'N/A'
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    let dateSuffix = new Date().toISOString().split('T')[0];
    if (appDateFilter === 'custom' && (appCustomStartDate || appCustomEndDate)) {
      dateSuffix = `${appCustomStartDate || 'start'}_to_${appCustomEndDate || 'end'}`;
    } else if (appDateFilter !== 'all') {
      dateSuffix = `${appDateFilter}_${dateSuffix}`;
    }
    link.download = `Admin_Candidates_Export_${dateSuffix}.csv`;
    link.click();
  };

  const handleExportDashboardBankCSV = () => {
    if (!filteredDashboardBankCandidates || !filteredDashboardBankCandidates.length) {
      alert(`No candidates available to export for ${selectedBankForDashboard || 'selected bank'}.`);
      return;
    }
    const headers = ['App ID', 'Name', 'Mobile', 'Email', 'City', 'Experience', 'Job Title', 'Company', 'HR Reference', 'Fee', 'Incentive', 'Status', 'Applied At'];
    const rows = filteredDashboardBankCandidates.map(app => {
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
        getAppPaymentAmount(app),
        app.incentiveAmount || 0,
        app.status,
        app.appliedAt ? `${new Date(app.appliedAt).toLocaleDateString('en-IN')} ${new Date(app.appliedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}` : 'N/A'
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const bankSafe = (selectedBankForDashboard || 'Bank').replace(/\s+/g, '_');
    link.download = `${bankSafe}_Admin_Candidates_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const renderDashboardBankDetailView = () => (
    <div style={{ animation: 'fadeIn 0.2s ease-in-out', marginBottom: '2rem' }}>
      {/* Back button & Scope Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '1.25rem' }}>
        <button
          onClick={() => {
            setSelectedBankForDashboard(null);
            setDashboardBankStatusFilter('all');
            setDashboardBankSearch('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: '#0f172a',
            border: 'none',
            borderRadius: '10px',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
        >
          <ArrowLeft size={18} /> Back to Overview
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportDashboardBankCSV}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Download size={16} /> Export CSV
          </button>
          <span style={{
            fontSize: '0.88rem',
            fontWeight: 800,
            color: '#0f172a',
            background: '#f1f5f9',
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid #e2e8f0'
          }}>
            🏛️ {selectedBankForDashboard}
          </span>
        </div>
      </div>

      {/* Bank Hero Banner */}
      {selectedAdminBankObj && (
        <div style={{
          background: getBankBrandGradient(selectedAdminBankObj.bankName),
          borderRadius: '18px',
          padding: '1.5rem 1.75rem',
          marginBottom: '1.5rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: `0 12px 32px ${getBankShadowColor(selectedAdminBankObj.bankName)}`,
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Decorative Radial Lights */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-30px', left: '40px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 1 }}>
            <img
              src={selectedAdminBankObj.logo}
              alt={selectedAdminBankObj.bankName}
              onError={(e) => { e.currentTarget.src = '/logo.png'; }}
              style={{
                width: '58px',
                height: '58px',
                borderRadius: '14px',
                objectFit: 'contain',
                background: '#ffffff',
                padding: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.55rem', fontWeight: 800, color: '#ffffff' }}>
                  {selectedAdminBankObj.bankName}
                </h2>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.22)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  backdropFilter: 'blur(4px)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 800
                }}>
                  {selectedAdminBankObj.totalCount} Candidates
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', marginTop: '2px' }}>
                Banking Partner • Candidate pipeline & status management
              </div>
            </div>
          </div>

          {/* Quick Filter Badges on Banner */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', zIndex: 1 }}>
            <button
              onClick={() => setDashboardBankStatusFilter('all')}
              style={{
                border: dashboardBankStatusFilter === 'all' ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.3)',
                background: dashboardBankStatusFilter === 'all' ? '#ffffff' : 'rgba(255,255,255,0.15)',
                color: dashboardBankStatusFilter === 'all' ? '#0f172a' : '#ffffff',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              All: {selectedAdminBankObj.totalCount}
            </button>
            <button
              onClick={() => setDashboardBankStatusFilter('processing')}
              style={{
                border: dashboardBankStatusFilter === 'processing' ? '2px solid #fef08a' : '1px solid rgba(254, 240, 138, 0.4)',
                background: dashboardBankStatusFilter === 'processing' ? '#fef08a' : 'rgba(254, 240, 138, 0.2)',
                color: dashboardBankStatusFilter === 'processing' ? '#854d0e' : '#fef08a',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ⏳ Processing: {selectedAdminBankObj.processing}
            </button>
            <button
              onClick={() => setDashboardBankStatusFilter('interview')}
              style={{
                border: dashboardBankStatusFilter === 'interview' ? '2px solid #e9d5ff' : '1px solid rgba(233, 213, 255, 0.4)',
                background: dashboardBankStatusFilter === 'interview' ? '#e9d5ff' : 'rgba(233, 213, 255, 0.2)',
                color: dashboardBankStatusFilter === 'interview' ? '#581c87' : '#e9d5ff',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              📅 Interview: {selectedAdminBankObj.interview}
            </button>
            <button
              onClick={() => setDashboardBankStatusFilter('selected')}
              style={{
                border: dashboardBankStatusFilter === 'selected' ? '2px solid #bbf7d0' : '1px solid rgba(187, 247, 208, 0.4)',
                background: dashboardBankStatusFilter === 'selected' ? '#bbf7d0' : 'rgba(187, 247, 208, 0.25)',
                color: dashboardBankStatusFilter === 'selected' ? '#14532d' : '#bbf7d0',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ✓ Selected: {selectedAdminBankObj.selected}
            </button>
            <button
              onClick={() => setDashboardBankStatusFilter('closed')}
              style={{
                border: dashboardBankStatusFilter === 'closed' ? '2px solid #86efac' : '1px solid rgba(134, 239, 172, 0.4)',
                background: dashboardBankStatusFilter === 'closed' ? '#86efac' : 'rgba(134, 239, 172, 0.25)',
                color: dashboardBankStatusFilter === 'closed' ? '#065f46' : '#86efac',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🔒 Closed: {selectedAdminBankObj.closed || 0}
            </button>
            {selectedAdminBankObj.rejected > 0 && (
              <button
                onClick={() => setDashboardBankStatusFilter('rejected')}
                style={{
                  border: dashboardBankStatusFilter === 'rejected' ? '2px solid #fecaca' : '1px solid rgba(254, 202, 202, 0.4)',
                  background: dashboardBankStatusFilter === 'rejected' ? '#fecaca' : 'rgba(254, 202, 202, 0.2)',
                  color: dashboardBankStatusFilter === 'rejected' ? '#991b1b' : '#fecaca',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ✕ Rejected: {selectedAdminBankObj.rejected}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        marginBottom: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Row 1: Search + Switch Bank Dropdown + Status Filter Dropdown + HR Filter Dropdown */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={`Search ${selectedBankForDashboard} candidates...`}
              value={dashboardBankSearch}
              onChange={e => setDashboardBankSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
                background: '#ffffff'
              }}
            />
          </div>

          {/* Switch Bank Dropdown */}
          <div>
            <select
              value={selectedBankForDashboard || ''}
              onChange={e => {
                if (e.target.value) {
                  setSelectedBankForDashboard(e.target.value);
                  setDashboardBankStatusFilter('all');
                }
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#1e293b',
                background: '#ffffff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {adminBankGroups.map(b => (
                <option key={b.bankName} value={b.bankName}>
                  🏦 {b.bankName} ({b.totalCount})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div>
            <select
              value={dashboardBankStatusFilter}
              onChange={e => setDashboardBankStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                background: '#ffffff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">⚡ Status: All Candidates</option>
              <option value="processing">⏳ Processing ({selectedAdminBankObj.processing || 0})</option>
              <option value="interview">📅 Interview Scheduled ({selectedAdminBankObj.interview || 0})</option>
              <option value="document">📄 Document Verification ({selectedAdminBankObj.document || 0})</option>
              <option value="selected">✓ Selected ({selectedAdminBankObj.selected || 0})</option>
              <option value="closed">🔒 Closed ({selectedAdminBankObj.closed || 0})</option>
              <option value="rejected">✕ Rejected ({selectedAdminBankObj.rejected || 0})</option>
            </select>
          </div>

          {/* HR Reference Filter Dropdown */}
          <div>
            <select
              value={dashboardBankHrFilter}
              onChange={e => setDashboardBankHrFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                background: '#ffffff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">👤 HR: All References</option>
              <option value="direct">Direct (No HR Referral)</option>
              {hrs.map(h => (
                <option key={h.id} value={h.referralCode}>
                  {h.name} ({h.referralCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Date Quick Filter Pills + Custom Date Picker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          paddingTop: '8px',
          borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: '4px' }}>
              📅 Date:
            </span>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'last7days', label: 'Last 7 Days' },
              { id: 'thismonth', label: 'This Month' },
              { id: 'custom', label: 'Custom' }
            ].map(p => {
              const isActive = dashboardBankDateFilter === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setDashboardBankDateFilter(p.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    background: isActive ? '#eff6ff' : '#f8fafc',
                    color: isActive ? '#1d4ed8' : '#64748b',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              Showing <strong>{filteredDashboardBankCandidates.length}</strong> candidates
            </span>
            {(dashboardBankStatusFilter !== 'all' || dashboardBankSearch.trim() || dashboardBankDateFilter !== 'all' || dashboardBankHrFilter !== 'all') && (
              <button
                onClick={handleResetDashboardBankFilters}
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ✕ Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Custom Date Range Picker when custom selected */}
        {dashboardBankDateFilter === 'custom' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            background: '#f0f9ff',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #bae6fd'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0369a1' }}>
              Select Date Range:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#64748b' }}>From:</label>
              <input
                type="date"
                value={dashboardBankCustomStartDate}
                onChange={e => setDashboardBankCustomStartDate(e.target.value)}
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  background: '#ffffff'
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#64748b' }}>To:</label>
              <input
                type="date"
                value={dashboardBankCustomEndDate}
                onChange={e => setDashboardBankCustomEndDate(e.target.value)}
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  background: '#ffffff'
                }}
              />
            </div>
            {(dashboardBankCustomStartDate || dashboardBankCustomEndDate) && (
              <button
                onClick={() => {
                  setDashboardBankCustomStartDate('');
                  setDashboardBankCustomEndDate('');
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#64748b',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Candidate Cards Grid */}
      {filteredDashboardBankCandidates.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1.5px dashed #cbd5e1',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>No candidates found</div>
          <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            No applications match the search or status filter for {selectedBankForDashboard}.
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '14px'
        }}>
          {filteredDashboardBankCandidates.map(app => {
            const hr = app.referredBy ? hrs.find(h => h.referralCode === app.referredBy) : null;
            const paymentAmt = getAppPaymentAmount(app);
            const gradientBg = getBankBrandGradient(app.companyName);
            const shadowClr = getBankShadowColor(app.companyName);

            return (
              <div
                key={app.id || app._id}
                style={{
                  background: gradientBg,
                  borderRadius: '18px',
                  border: '1.5px solid rgba(255, 255, 255, 0.22)',
                  boxShadow: `0 10px 24px ${shadowClr}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  color: '#ffffff',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Decorative Radial Lights */}
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '110px', height: '110px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-20px', left: '20px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

                {/* Top Row: Candidate Name + Status Badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', position: 'relative', zIndex: 1 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1.15rem', lineHeight: 1.2 }}>
                      {app.candidateName}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.95)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span>{app.jobTitle}</span>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.22)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.78rem'
                      }}>
                        🏛️ {app.companyName}
                      </span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                {/* Meta sub-line: App ID & Date */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '8px', position: 'relative', zIndex: 1 }}>
                  <span style={{ fontWeight: 800, color: '#ffffff' }}>#{app.applicationNumber}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff', fontWeight: 600 }}>
                    <span>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</span>
                    {app.appliedAt && (
                      <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        • <Clock size={11} color="#ffffff" /> {new Date(app.appliedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    )}
                  </span>
                </div>

                {/* Contact & Bio Info */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '0.78rem', position: 'relative', zIndex: 1 }}>
                  <a
                    href={`tel:${app.candidateMobile}`}
                    style={{
                      color: '#ffffff',
                      background: 'rgba(255, 255, 255, 0.22)',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      padding: '4px 9px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    📱 {app.candidateMobile}
                  </a>
                  <a
                    href={`mailto:${app.candidateEmail}`}
                    style={{
                      color: '#ffffff',
                      background: 'rgba(255, 255, 255, 0.22)',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      padding: '4px 9px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      maxWidth: '180px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={app.candidateEmail}
                  >
                    ✉️ {app.candidateEmail}
                  </a>
                  <span style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.16)', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '4px 9px', borderRadius: '8px', fontWeight: 600 }}>
                    💼 {app.candidateExperience || 'Fresher'}
                  </span>
                  <span style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.16)', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '4px 9px', borderRadius: '8px', fontWeight: 600 }}>
                    🏙️ {app.candidateLocation || 'N/A'}
                  </span>
                  {app.candidateQualification && (
                    <span style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.16)', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '4px 9px', borderRadius: '8px', fontWeight: 600 }}>
                      🎂 {app.candidateQualification}
                    </span>
                  )}
                  {app.candidateResumeUrl && (
                    <a
                      href={app.candidateResumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#ffffff',
                        background: 'rgba(255, 255, 255, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        padding: '4px 9px',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 700,
                        textDecoration: 'none'
                      }}
                    >
                      <FileText size={12} color="#ffffff" /> Resume
                    </a>
                  )}
                </div>

                {/* Payment & HR Reference Bar */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.22)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#ffffff',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>HR: </span>
                    <span style={{ fontWeight: 800, color: '#ffffff' }}>
                      {hr ? hr.name : (app.referredBy || 'Direct')}
                    </span>
                    <button
                      onClick={() => {
                        setHrRefModalApp(app);
                        setSelectedHrRef(app.referredBy || '');
                      }}
                      title="Edit HR"
                      style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '4px', padding: '0 2px' }}
                    >
                      <Edit size={12} color="#ffffff" />
                    </button>
                  </div>
                  <div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Fee: </span>
                    <span style={{ fontWeight: 800, color: '#fef08a' }}>
                      ₹{paymentAmt}
                    </span>
                    {app.referredBy && app.incentiveAmount > 0 && (
                      <span style={{ marginLeft: '6px', color: '#bbf7d0', fontWeight: 800 }}>
                        (Inc: ₹{app.incentiveAmount})
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: currentUser?.role === 'admin' ? '1fr 1fr auto' : '1fr 1fr', gap: '8px', marginTop: '2px', position: 'relative', zIndex: 1 }}>
                  <button
                    style={{
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ffffff',
                      color: '#0f172a',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
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
                    style={{
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      background: 'rgba(255, 255, 255, 0.22)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                    onClick={() => {
                      setAppToSchedule(app);
                      setInterviewModalOpen(true);
                    }}
                  >
                    <Calendar size={13} color="#ffffff" /> Interview
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button
                      style={{
                        padding: '8px 10px',
                        fontSize: '0.8rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(254, 202, 202, 0.4)',
                        background: 'rgba(239, 68, 68, 0.35)',
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => handleDeleteApplication(app)}
                      title="Delete permanently"
                    >
                      <Trash2 size={13} color="#ffffff" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'hold on') {
      return (
        <span style={{
          background: '#fef3c7',
          color: '#92400e',
          border: '1px solid #f59e0b',
          padding: '3px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          ⏸️ Hold On
        </span>
      );
    }
    if (s.includes('document')) {
      return (
        <span style={{
          background: '#ecfeff',
          color: '#0e7490',
          border: '1px solid #67e8f9',
          padding: '3px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          📄 {status}
        </span>
      );
    }
    if (s === 'closed' || s === 'joined' || s === 'joined manipal' || s === 'hired' || s === 'converted') {
      return (
        <span style={{
          background: '#dcfce7',
          color: '#15803d',
          border: '1px solid #86efac',
          padding: '3px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          🔒 {status}
        </span>
      );
    }
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
          className={`nav-item ${activeTab === 'client_dashboard' ? 'active' : ''}`}
          onClick={() => handleTabChange('client_dashboard')}
        >
          <Building2 size={18} /> Client Dashboard ({clients.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'interviews' ? 'active' : ''}`}
          onClick={() => handleTabChange('interviews')}
        >
          <CalendarDays size={18} /> Interviews ({activeInterviews.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => handleTabChange('employees')}
        >
          <Users size={18} /> HR ({hrs.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'hierarchy' ? 'active' : ''}`}
          onClick={() => handleTabChange('hierarchy')}
        >
          <Building2 size={18} /> Branch & Teams
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
          className={`nav-item ${activeTab === 'offer_targets' ? 'active' : ''}`}
          onClick={() => handleTabChange('offer_targets')}
        >
          <Trophy size={18} style={{ color: '#f59e0b' }} /> Offers & Targets
        </button>

        <button
          className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => handleTabChange('payments')}
        >
          <CreditCard size={18} /> Payments
        </button>

        <button
          className={`nav-item ${activeTab === 'manipal-payout-status' ? 'active' : ''}`}
          onClick={() => handleTabChange('manipal-payout-status')}
        >
          <Wallet size={18} /> Manipal Payout
        </button>

        <button
          className={`nav-item ${activeTab === 'offer_targets' ? 'active' : ''}`}
          onClick={() => handleTabChange('offer_targets')}
          style={{
            background: activeTab === 'offer_targets' ? 'rgba(234, 88, 12, 0.2)' : undefined,
            color: activeTab === 'offer_targets' ? '#fb923c' : undefined
          }}
        >
          <Trophy size={18} color="#fb923c" /> Offers & Targets
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

        <button
          className={`nav-item ${activeTab === 'admin_profile' ? 'active' : ''}`}
          onClick={() => handleTabChange('admin_profile')}
          style={{
            marginTop: '0.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '0.75rem',
            color: activeTab === 'admin_profile' ? '#fff' : '#cbd5e1'
          }}
        >
          <UserCog size={18} style={{ color: '#f59e0b' }} /> Admin Profile & Settings
        </button>

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

      <div className="admin-main">
        {activeTab === 'dashboard' && (
          selectedBankForDashboard ? (
            renderDashboardBankDetailView()
          ) : (
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
              {/* 1. Applications Received (First as requested) */}
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

              {/* 2. Total Candidates */}
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

              {/* 3. Processing (Excluding Interview Scheduled, Selected, Rejected) */}
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
                  <div className="kpi-val" style={{ color: '#312e81' }}>
                    {validApplications.filter(a => {
                      const s = String(a.status || '').toLowerCase();
                      return !['selected', 'converted', 'rejected', 'not interested', 'interview scheduled'].includes(s) && !s.includes('interview') && !s.includes('document');
                    }).length}
                  </div>
                  <div className="kpi-label" style={{ color: '#312e81', opacity: 0.8, fontWeight: 600 }}>Processing</div>
                </div>
              </div>

              <div 
                className="kpi-card" 
                onClick={() => { setActiveTab('interviews'); setInterviewFilter('active'); }}
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
                  <div className="kpi-val" style={{ color: '#701a75' }}>{activeInterviews.length}</div>
                  <div className="kpi-label" style={{ color: '#701a75', opacity: 0.8, fontWeight: 600 }}>Interviews Scheduled</div>
                </div>
              </div>

              {/* 5. Document Submission */}
              <div 
                className="kpi-card" 
                onClick={() => { setActiveTab('applications'); setAppStatusFilter('Document Submission'); }}
                style={{
                  background: '#ecfeff', border: '1px solid #67e8f9', cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
              >
                <div className="kpi-icon" style={{ background: '#cffafe', color: '#0891b2' }}>
                  <FileCheck size={22} />
                </div>
                <div>
                  <div className="kpi-val" style={{ color: '#164e63' }}>
                    {docSubmissionCount}
                  </div>
                  <div className="kpi-label" style={{ color: '#164e63', opacity: 0.8, fontWeight: 600 }}>Document Submission</div>
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

              {/* 10. Total Link Clicks (HR + Direct) */}
              <div 
                className="kpi-card" 
                onClick={() => setShowClickStatsModal(true)}
                style={{
                  background: '#eef2ff', border: '1px solid #c7d2fe', cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
                title="Click to view full link click analytics"
              >
                <div className="kpi-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                  <MousePointerClick size={22} />
                </div>
                <div>
                  <div className="kpi-val" style={{ color: '#312e81' }}>{grandTotalClicks}</div>
                  <div className="kpi-label" style={{ color: '#312e81', opacity: 0.8, fontWeight: 600 }}>Total Link Clicks</div>
                  <div style={{ fontSize: '0.72rem', color: '#4f46e5', marginTop: '2px', fontWeight: 600 }}>
                    HRs: {totalHrClicks + totalAgentClicks} • Direct: {effectiveDirectClicks}
                  </div>
                </div>
              </div>

              {/* 11. Manipal Payout Status */}
              <div 
                className="kpi-card" 
                onClick={() => handleTabChange('manipal-payout-status')}
                style={{
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                  border: '1px solid #a7f3d0',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}
                title="Click to view bank-wise Manipal Payout Status"
              >
                <div className="kpi-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                  <Wallet size={22} />
                </div>
                <div>
                  <div className="kpi-val" style={{ color: '#065f46' }}>{manipalPayoutCandidates.length}</div>
                  <div className="kpi-label" style={{ color: '#065f46', opacity: 0.9, fontWeight: 700 }}>Manipal Payout Status</div>
                  <div style={{ fontSize: '0.72rem', marginTop: '3px', fontWeight: 600, display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#059669', background: '#d1fae5', padding: '1px 6px', borderRadius: '4px' }}>
                      ✓ Paid: {manipalPaidCount}
                    </span>
                    <span style={{ color: '#d97706', background: '#fef3c7', padding: '1px 6px', borderRadius: '4px' }}>
                      ⏳ Pending: {manipalPendingCount}
                    </span>
                  </div>
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
                const hrCode = String(hr.referralCode || '').toLowerCase();
                const hrApps = validApplications.filter(app => String(app.referredBy || '').toLowerCase() === hrCode);
                const closedApps = hrApps.filter(app => {
                  const s = String(app.status || '').toLowerCase().trim();
                  if (['payment pending', 'unpaid', 'rejected', 'not interested', 'cancelled'].includes(s)) return false;
                  return s.includes('select') || s.includes('closed') || s.includes('joined') || s.includes('hired') || s.includes('convert') || s.includes('enroll');
                });
                return {
                  ...hr,
                  totalSourced: hrApps.length,
                  totalClosed: closedApps.length
                };
              });
              const topClosers = [...hrStats].sort((a,b) => b.totalClosed - a.totalClosed);
              const topSourcers = [...hrStats].sort((a,b) => b.totalSourced - a.totalSourced);
              
              return (
                <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {/* Top Sourcers Card */}
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        🚀 Top Applications Received <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>({topSourcers.length} HRs)</span>
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>Click on any HR or count to view their candidates</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px', overflowY: 'auto', paddingRight: '6px' }}>
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
                                <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>{hr.name}</div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '500' }}>{hr.referralCode}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ fontWeight: '800', color: isScored ? '#2563eb' : '#94a3b8', fontSize: '1.25rem' }}>
                                {hr.totalSourced || 0}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Closers Card */}
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        🏆 Top Closers <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>({topClosers.length} HRs - Selected & Closed)</span>
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>Click on any HR or count to view their candidates</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px', overflowY: 'auto', paddingRight: '6px' }}>
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
                                <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>{hr.name}</div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '500' }}>{hr.referralCode}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ fontWeight: '800', color: isScored ? '#059669' : '#94a3b8', fontSize: '1.25rem' }}>
                                {hr.totalClosed || 0}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bank Cards Grid */}
            <div style={{ marginTop: '2.5rem', marginBottom: '2rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏦</span> Select a Bank to View Candidates
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
                  Click on any bank card below to view applicant details with full admin controls, interviews, and status updates.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '16px'
              }}>
                {adminBankGroups.map(bank => {
                  const gradientBg = getBankBrandGradient(bank.bankName);
                  const shadowClr = getBankShadowColor(bank.bankName);

                  return (
                    <div
                      key={bank.bankName}
                      onClick={() => {
                        setSelectedBankForDashboard(bank.bankName);
                        setDashboardBankStatusFilter('all');
                        setDashboardBankSearch('');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        background: gradientBg,
                        border: '1.5px solid rgba(255, 255, 255, 0.18)',
                        borderRadius: '20px',
                        padding: '1.35rem',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: `0 8px 24px ${shadowClr}, inset 0 1px 0 rgba(255,255,255,0.18)`
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
                        e.currentTarget.style.boxShadow = `0 16px 36px ${shadowClr}, inset 0 1px 0 rgba(255,255,255,0.25)`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = `0 8px 24px ${shadowClr}, inset 0 1px 0 rgba(255,255,255,0.18)`;
                      }}
                    >
                      {/* Decorative Radial Lights */}
                      <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', bottom: '-20px', left: '30px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

                      {/* Bank Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                        <img
                          src={bank.logo}
                          alt={bank.bankName}
                          onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            objectFit: 'contain',
                            background: '#ffffff',
                            padding: '5px',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {bank.bankName}
                          </h3>
                          <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.85)' }}>Banking Partner</span>
                        </div>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          backdropFilter: 'blur(4px)',
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          whiteSpace: 'nowrap'
                        }}>
                          {bank.totalCount} Applied
                        </div>
                      </div>

                      {/* Status Pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(254, 240, 138, 0.22)', color: '#fef08a', border: '1px solid rgba(254, 240, 138, 0.35)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                          ⏳ Processing: {bank.processing}
                        </span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(233, 213, 255, 0.22)', color: '#e9d5ff', border: '1px solid rgba(233, 213, 255, 0.35)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                          📅 Interview: {bank.interview}
                        </span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(187, 247, 208, 0.25)', color: '#bbf7d0', border: '1px solid rgba(187, 247, 208, 0.4)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          ✓ Selected: {bank.selected}
                        </span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(134, 239, 172, 0.25)', color: '#86efac', border: '1px solid rgba(134, 239, 172, 0.4)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          🔒 Closed: {bank.closed || 0}
                        </span>
                        {bank.rejected > 0 && (
                          <span style={{ fontSize: '0.75rem', background: 'rgba(254, 202, 202, 0.2)', color: '#fecaca', border: '1px solid rgba(254, 202, 202, 0.35)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                            ✕ Rejected: {bank.rejected}
                          </span>
                        )}
                      </div>

                      {/* Action Link */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '0.85rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        position: 'relative',
                        zIndex: 1
                      }}>
                        <span>View Candidates & Status</span>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '50%',
                          width: '26px',
                          height: '26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ChevronRight size={16} color="#ffffff" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

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
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-GB') : '-'}
                        </div>
                        {app.appliedAt && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                            <Clock size={11} color="#94a3b8" />
                            {new Date(app.appliedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </div>
                        )}
                      </td>
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
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Add hiring partner companies and arrange display order (1, 2, 3...) for website and mobile app.</p>
              </div>
              <button className="btn-primary" onClick={() => { setCompanyToEdit(null); setCompanyModalOpen(true); }}>
                <Plus size={16} /> Add Company
              </button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '90px' }}>Order #</th>
                    <th>Logo</th>
                    <th>Company Name</th>
                    <th>Category</th>
                    <th>Website</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...companies]
                    .sort((a, b) => (Number(a.displayOrder ?? 99) - Number(b.displayOrder ?? 99)) || (a.name || '').localeCompare(b.name || ''))
                    .map(comp => {
                    const cat = categories.find(c => c.id === comp.categoryId);
                    return (
                      <tr key={comp.id}>
                        <td style={{ width: '90px' }}>
                          <input
                            type="number"
                            min="1"
                            defaultValue={comp.displayOrder ?? 99}
                            key={`${comp.id}_${comp.displayOrder}`}
                            onBlur={(e) => {
                              const val = e.target.value;
                              if (val && Number(val) !== comp.displayOrder) {
                                handleQuickUpdateCompanyOrder(comp.id, val);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.target.blur();
                              }
                            }}
                            style={{
                              width: '56px',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1.5px solid #cbd5e1',
                              fontWeight: 700,
                              textAlign: 'center',
                              fontSize: '0.9rem',
                              color: '#1e293b',
                              backgroundColor: '#f8fafc'
                            }}
                            title="Edit order number (e.g. 1, 2, 3). Press Enter or click outside to save"
                          />
                        </td>
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
                              title="Edit Company Details & Order"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn-secondary"
                              style={{ padding: '4px 8px', color: '#ef4444' }}
                              onClick={() => handleDeleteCompany(comp.id)}
                              title="Delete Company"
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
                      <td>
                        <select
                          value={job.status || 'Active'}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
                              await fetch(`${API_URL}/api/jobs/${job.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: newStatus })
                              });
                              fetchAllData();
                            } catch (err) {
                              console.error('Error updating job status:', err);
                            }
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            border: (job.status || '').toLowerCase() === 'hold on' ? '1.5px solid #f59e0b' : (job.status || '').toLowerCase() === 'active' ? '1.5px solid #10b981' : '1.5px solid #cbd5e1',
                            background: (job.status || '').toLowerCase() === 'hold on' ? '#fef3c7' : (job.status || '').toLowerCase() === 'active' ? '#ecfdf5' : '#f8fafc',
                            color: (job.status || '').toLowerCase() === 'hold on' ? '#92400e' : (job.status || '').toLowerCase() === 'active' ? '#047857' : '#475569',
                            outline: 'none'
                          }}
                        >
                          <option value="Active">Active</option>
                          <option value="Hold On">⏸️ Hold On</option>
                          <option value="Draft">Draft</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn-secondary"
                            style={{
                              padding: '4px 8px',
                              background: copiedJobId === job.id ? '#ecfdf5' : '#f8fafc',
                              color: copiedJobId === job.id ? '#059669' : '#2563eb',
                              borderColor: copiedJobId === job.id ? '#a7f3d0' : '#cbd5e1'
                            }}
                            onClick={() => handleCopyJobLink(job.id)}
                            title={copiedJobId === job.id ? "Copied!" : "Copy Direct Job Link"}
                          >
                            {copiedJobId === job.id ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px', color: '#16a34a', borderColor: '#bbf7d0', background: '#f0fdf4' }}
                            onClick={() => handleWhatsAppShareJob(job)}
                            title="Share on WhatsApp"
                          >
                            <Send size={14} />
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px', color: '#64748b' }}
                            onClick={() => window.open(`${candidatePortalBaseUrl}/?job=${job.id}`, '_blank')}
                            title="Preview Candidate View"
                          >
                            <ExternalLink size={14} />
                          </button>
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
            {/* Desktop Controls (Hidden on Mobile) */}
            <div className="applications-desktop-controls">
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

              <button
                onClick={() => setAppDateFilter('custom')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
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
                marginBottom: '1.25rem',
                padding: '10px 16px',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '12px',
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
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      outline: 'none',
                      background: 'white'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>To Date:</label>
                  <input
                    type="date"
                    value={appCustomEndDate}
                    onChange={(e) => setAppCustomEndDate(e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      outline: 'none',
                      background: 'white'
                    }}
                  />
                </div>
                {(appCustomStartDate || appCustomEndDate) && (
                  <button
                    onClick={() => {
                      setAppCustomStartDate('');
                      setAppCustomEndDate('');
                    }}
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      color: '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Dates
                  </button>
                )}
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0284c7', marginLeft: 'auto' }}>
                  Total in Range: <strong>{customAppCount}</strong> applications
                </span>
              </div>
            )}

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
                  <option value="Document Submission">Document Submission</option>
                  <option value="Selected">Selected</option>
                  <option value="Closed">Closed</option>
                  <option value="Joined Manipal">Joined Manipal</option>
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
            </div>

            {/* Mobile-Only Header, Swipeable Date Chips & Compact Search (Visible on Mobile <= 768px, Hidden on Desktop) */}
            <div className="applications-mobile-controls">
              {/* Row 1: Header + Compact Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Applications
                  </h2>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px' }}>
                    {filteredApplications.length}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    onClick={exportToCSV}
                    style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  >
                    <Download size={13} /> CSV
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => setManualAppModalOpen(true)}
                      style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <UserPlus size={13} /> + Add
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Swipeable Horizontal Date Filter Chips */}
              <div style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                paddingBottom: '2px',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none'
              }}>
                <button
                  onClick={() => setAppDateFilter('all')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    flexShrink: 0,
                    background: appDateFilter === 'all' ? '#2563eb' : '#f1f5f9',
                    color: appDateFilter === 'all' ? '#fff' : '#475569'
                  }}
                >
                  All ({validApplications.length})
                </button>
                <button
                  onClick={() => setAppDateFilter('today')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    flexShrink: 0,
                    background: appDateFilter === 'today' ? '#059669' : '#ecfdf5',
                    color: appDateFilter === 'today' ? '#fff' : '#047857'
                  }}
                >
                  Today ({todayAppCount})
                </button>
                <button
                  onClick={() => setAppDateFilter('yesterday')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    flexShrink: 0,
                    background: appDateFilter === 'yesterday' ? '#d97706' : '#fffbeb',
                    color: appDateFilter === 'yesterday' ? '#fff' : '#b45309'
                  }}
                >
                  Yesterday ({yesterdayAppCount})
                </button>
                <button
                  onClick={() => setAppDateFilter('last7')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    flexShrink: 0,
                    background: appDateFilter === 'last7' ? '#7c3aed' : '#f5f3ff',
                    color: appDateFilter === 'last7' ? '#fff' : '#6d28d9'
                  }}
                >
                  Last 7D ({last7DaysAppCount})
                </button>
                <button
                  onClick={() => setAppDateFilter('thisMonth')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    flexShrink: 0,
                    background: appDateFilter === 'thisMonth' ? '#0891b2' : '#ecfeff',
                    color: appDateFilter === 'thisMonth' ? '#fff' : '#0e7490'
                  }}
                >
                  This Month ({thisMonthAppCount})
                </button>
                <button
                  onClick={() => setAppDateFilter('custom')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    flexShrink: 0,
                    background: appDateFilter === 'custom' ? '#0284c7' : '#f0f9ff',
                    color: appDateFilter === 'custom' ? '#fff' : '#0369a1'
                  }}
                >
                  Custom Range {appDateFilter === 'custom' && (appCustomStartDate || appCustomEndDate) ? `(${customAppCount})` : ''}
                </button>
              </div>

              {/* Mobile Custom Date Range Inputs */}
              {appDateFilter === 'custom' && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '10px 12px',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '10px',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1' }}>
                      📑 Statement Date Range:
                    </span>
                    {(appCustomStartDate || appCustomEndDate) && (
                      <button
                        onClick={() => {
                          setAppCustomStartDate('');
                          setAppCustomEndDate('');
                        }}
                        style={{
                          padding: '2px 8px',
                          fontSize: '0.7rem',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          background: '#fff',
                          color: '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>From Date</label>
                      <input
                        type="date"
                        value={appCustomStartDate}
                        onChange={(e) => setAppCustomStartDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.78rem',
                          outline: 'none',
                          background: 'white',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>To Date</label>
                      <input
                        type="date"
                        value={appCustomEndDate}
                        onChange={(e) => setAppCustomEndDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.78rem',
                          outline: 'none',
                          background: 'white',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Row 3: Compact Search Bar */}
              <div>
                <input
                  type="text"
                  placeholder="🔍 Search name, phone, App ID..."
                  value={appSearchQuery}
                  onChange={e => setAppSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
              </div>

              {/* Row 4: Two Compact Dropdowns (Status + HR) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <select
                  value={appStatusFilter}
                  onChange={e => setAppStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 8px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    outline: 'none',
                    background: '#ffffff',
                    color: '#334155'
                  }}
                >
                  <option value="all">Status: All</option>
                  <option value="Processing">Processing</option>
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="HR Screening">HR Screening</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Selected">Selected</option>
                  <option value="Closed">Closed</option>
                  <option value="Joined Manipal">Joined Manipal</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select
                  value={appHrFilter}
                  onChange={e => setAppHrFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 8px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    outline: 'none',
                    background: '#ffffff',
                    color: '#334155'
                  }}
                >
                  <option value="all">HR: All</option>
                  <option value="direct">Direct (No HR)</option>
                  {hrs.map(h => (
                    <option key={h.id} value={h.referralCode}>
                      {h.name} ({h.referralCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="table-container applications-desktop-table">
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
                      <td>
                        {(() => {
                          const bankTheme = getBankBrandTheme(app.companyName);
                          return (
                            <span style={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: bankTheme.color,
                              background: bankTheme.bg,
                              border: `1px solid ${bankTheme.border}`,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {app.companyName}
                            </span>
                          );
                        })()}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-GB') : '-'}
                        </div>
                        {app.appliedAt && (
                          <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', fontWeight: 500 }}>
                            <Clock size={12} color="#94a3b8" />
                            {new Date(app.appliedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </div>
                        )}
                      </td>
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

            {/* Mobile Cards View (Visible on Mobile <= 768px, Hidden on Desktop) */}
            <div className="applications-mobile-cards">
              {filteredApplications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                  No applications matching the selected filter criteria.
                </div>
              ) : (
                filteredApplications.map(app => {
                  const hr = app.referredBy ? hrs.find(h => h.referralCode === app.referredBy) : null;
                  const paymentAmt = getAppPaymentAmount(app);
                  const gradientBg = getBankBrandGradient(app.companyName);
                  const shadowClr = getBankShadowColor(app.companyName);

                  return (
                    <div
                      key={app.id}
                      style={{
                        background: gradientBg,
                        borderRadius: '18px',
                        border: '1.5px solid rgba(255, 255, 255, 0.22)',
                        boxShadow: `0 10px 24px ${shadowClr}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        color: '#ffffff',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Decorative Radial Lights */}
                      <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '110px', height: '110px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', bottom: '-20px', left: '20px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

                      {/* Top Row: Candidate Name + Status Badge */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', position: 'relative', zIndex: 1 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1.15rem', lineHeight: 1.2 }}>
                            {app.candidateName}
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.95)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span>{app.jobTitle}</span>
                            <span style={{
                              background: 'rgba(255, 255, 255, 0.22)',
                              color: '#ffffff',
                              border: '1px solid rgba(255, 255, 255, 0.35)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.78rem'
                            }}>
                              🏛️ {app.companyName}
                            </span>
                          </div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {getStatusBadge(app.status)}
                        </div>
                      </div>

                      {/* Meta sub-line: App ID & Date */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '8px', position: 'relative', zIndex: 1 }}>
                        <span style={{ fontWeight: 800, color: '#ffffff' }}>#{app.applicationNumber}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff', fontWeight: 600 }}>
                          <span>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</span>
                          {app.appliedAt && (
                            <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              • <Clock size={11} color="#ffffff" /> {new Date(app.appliedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Contact & Bio Info */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '0.78rem', position: 'relative', zIndex: 1 }}>
                        <a
                          href={`tel:${app.candidateMobile}`}
                          style={{
                            color: '#ffffff',
                            background: 'rgba(255, 255, 255, 0.22)',
                            border: '1px solid rgba(255, 255, 255, 0.35)',
                            padding: '4px 9px',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700,
                            textDecoration: 'none'
                          }}
                        >
                          📱 {app.candidateMobile}
                        </a>
                        <a
                          href={`mailto:${app.candidateEmail}`}
                          style={{
                            color: '#ffffff',
                            background: 'rgba(255, 255, 255, 0.22)',
                            border: '1px solid rgba(255, 255, 255, 0.35)',
                            padding: '4px 9px',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700,
                            textDecoration: 'none',
                            maxWidth: '180px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={app.candidateEmail}
                        >
                          ✉️ {app.candidateEmail}
                        </a>
                        <span style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.16)', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '4px 9px', borderRadius: '8px', fontWeight: 600 }}>
                          💼 {app.candidateExperience || 'Fresher'}
                        </span>
                        <span style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.16)', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '4px 9px', borderRadius: '8px', fontWeight: 600 }}>
                          🏙️ {app.candidateLocation || 'N/A'}
                        </span>
                        {app.candidateQualification && (
                          <span style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.16)', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '4px 9px', borderRadius: '8px', fontWeight: 600 }}>
                            🎂 {app.candidateQualification}
                          </span>
                        )}
                        {app.candidateResumeUrl && (
                          <a
                            href={app.candidateResumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: '#ffffff',
                              background: 'rgba(255, 255, 255, 0.25)',
                              border: '1px solid rgba(255, 255, 255, 0.4)',
                              padding: '4px 9px',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 700,
                              textDecoration: 'none'
                            }}
                          >
                            <FileText size={12} color="#ffffff" /> Resume
                          </a>
                        )}
                      </div>

                      {/* Payment & HR Reference Bar */}
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.22)',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        color: '#ffffff',
                        position: 'relative',
                        zIndex: 1
                      }}>
                        <div>
                          <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>HR: </span>
                          <span style={{ fontWeight: 800, color: '#ffffff' }}>
                            {hr ? hr.name : (app.referredBy || 'Direct')}
                          </span>
                          <button
                            onClick={() => {
                              setHrRefModalApp(app);
                              setSelectedHrRef(app.referredBy || '');
                            }}
                            title="Edit HR"
                            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '4px', padding: '0 2px' }}
                          >
                            <Edit size={12} color="#ffffff" />
                          </button>
                        </div>
                        <div>
                          <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Fee: </span>
                          <span style={{ fontWeight: 800, color: '#fef08a' }}>
                            ₹{paymentAmt}
                          </span>
                          {app.referredBy && app.incentiveAmount > 0 && (
                            <span style={{ marginLeft: '6px', color: '#bbf7d0', fontWeight: 800 }}>
                              (Inc: ₹{app.incentiveAmount})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: currentUser?.role === 'admin' ? '1fr 1fr auto' : '1fr 1fr', gap: '8px', marginTop: '2px', position: 'relative', zIndex: 1 }}>
                        <button
                          style={{
                            padding: '8px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            borderRadius: '8px',
                            border: 'none',
                            background: '#ffffff',
                            color: '#0f172a',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
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
                          style={{
                            padding: '8px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            background: 'rgba(255, 255, 255, 0.22)',
                            color: '#ffffff',
                            cursor: 'pointer',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                          onClick={() => {
                            setAppToSchedule(app);
                            setInterviewModalOpen(true);
                          }}
                        >
                          <Calendar size={13} color="#ffffff" /> Interview
                        </button>
                        {currentUser?.role === 'admin' && (
                          <button
                            style={{
                              padding: '8px 10px',
                              fontSize: '0.8rem',
                              borderRadius: '8px',
                              border: '1px solid rgba(254, 202, 202, 0.4)',
                              background: 'rgba(239, 68, 68, 0.35)',
                              color: '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onClick={() => handleDeleteApplication(app)}
                            title="Delete permanently"
                          >
                            <Trash2 size={13} color="#ffffff" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
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
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setInterviewFilter('active')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: interviewFilter === 'active' ? '#a855f7' : '#e2e8f0',
                    background: interviewFilter === 'active' ? '#f3e8ff' : '#ffffff',
                    color: interviewFilter === 'active' ? '#7e22ce' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >
                  Active Scheduled ({activeInterviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInterviewFilter('all')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: interviewFilter === 'all' ? '#3b82f6' : '#e2e8f0',
                    background: interviewFilter === 'all' ? '#eff6ff' : '#ffffff',
                    color: interviewFilter === 'all' ? '#1d4ed8' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >
                  All History ({interviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInterviewFilter('document')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: interviewFilter === 'document' ? '#06b6d4' : '#e2e8f0',
                    background: interviewFilter === 'document' ? '#ecfeff' : '#ffffff',
                    color: interviewFilter === 'document' ? '#0e7490' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >
                  Document Stage
                </button>
                <button
                  type="button"
                  onClick={() => setInterviewFilter('selected')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: interviewFilter === 'selected' ? '#10b981' : '#e2e8f0',
                    background: interviewFilter === 'selected' ? '#ecfdf5' : '#ffffff',
                    color: interviewFilter === 'selected' ? '#047857' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >
                  Selected
                </button>
                <button
                  type="button"
                  onClick={() => setInterviewFilter('rejected')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: interviewFilter === 'rejected' ? '#ef4444' : '#e2e8f0',
                    background: interviewFilter === 'rejected' ? '#fef2f2' : '#ffffff',
                    color: interviewFilter === 'rejected' ? '#b91c1c' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >
                  Rejected
                </button>
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
                  {displayedInterviews.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        No interviews found for the selected view.
                      </td>
                    </tr>
                  ) : (
                    displayedInterviews.map(int => {
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
                            let status = int.status || 'Scheduled';
                            if (app && app.status && !['interview scheduled', 'applied', 'pending'].includes(String(app.status).toLowerCase())) {
                              status = app.status;
                            }
                            let bg = '#e0f2fe';
                            let color = '#0284c7';
                            const sLower = status.toLowerCase();
                            if (sLower.includes('reject') || sLower.includes('not interested')) {
                              bg = '#fee2e2';
                              color = '#dc2626';
                            } else if (sLower.includes('select') || sLower.includes('hired')) {
                              bg = '#dcfce7';
                              color = '#16a34a';
                            } else if (sLower.includes('document')) {
                              bg = '#ecfeff';
                              color = '#0891b2';
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
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div>
            {selectedHrForCandidates ? (
              <div>
                {/* Back Navigation Buttons */}
                <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleTabChange('dashboard')}
                    className="btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      background: '#ffffff',
                      color: '#2563eb',
                      border: '1.5px solid #bfdbfe',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(37, 99, 235, 0.08)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#93c5fd'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                  >
                    <ArrowLeft size={16} /> Back to Dashboard
                  </button>
                  <button
                    onClick={() => setSelectedHrForCandidates(null)}
                    className="btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      background: '#ffffff',
                      color: '#475569',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                  >
                    All HRs List
                  </button>
                </div>

                {/* HR Profile Banner Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
                  border: '1px solid #c7d2fe',
                  borderRadius: '14px',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: '#e0e7ff',
                      border: '2px solid #a5b4fc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {selectedHrForCandidates.profilePhoto ? (
                        <img src={selectedHrForCandidates.profilePhoto} alt={selectedHrForCandidates.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ fontWeight: 800, color: '#4f46e5', fontSize: '1.5rem' }}>
                          {selectedHrForCandidates.name?.charAt(0)?.toUpperCase() || 'H'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {selectedHrForCandidates.name}
                        </h2>
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: '#dbeafe',
                          color: '#1d4ed8',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          border: '1px solid #bfdbfe'
                        }}>
                          Referral Code: {selectedHrForCandidates.referralCode}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '6px', fontSize: '0.85rem', color: '#475569' }}>
                        <span>✉️ {selectedHrForCandidates.email}</span>
                        {selectedHrForCandidates.mobile && <span>📱 {selectedHrForCandidates.mobile}</span>}
                        <span style={{ color: '#2563eb', fontWeight: 600 }}>🔗 {selectedHrForCandidates.linkClicks || 0} link clicks</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Earned Incentives</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>
                        ₹{(selectedHrForCandidates.incentives || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPI Summary Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  marginBottom: '1.5rem'
                }}>
                  {/* 1. UPCOMING INCENTIVE (FIRST) */}
                  <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #99f6e4', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase' }}>Upcoming Incentive</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f766e', marginTop: '4px' }}>
                      ₹{hrCandidateStats.upcomingAmount.toLocaleString()}
                    </div>
                  </div>

                  {/* 2. TOTAL CANDIDATES */}
                  <div
                    onClick={() => setHrCandidateStatusFilter('all')}
                    style={{
                      background: '#ffffff',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: hrCandidateStatusFilter === 'all' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      boxShadow: hrCandidateStatusFilter === 'all' ? '0 4px 12px rgba(37, 99, 235, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Click to view all candidates"
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Candidates</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                      {hrCandidateStats.total}
                    </div>
                  </div>

                  {/* 3. DOCUMENT SUBMITTED */}
                  <div
                    onClick={() => setHrCandidateStatusFilter('document submission')}
                    style={{
                      background: '#ffffff',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: (hrCandidateStatusFilter.toLowerCase().includes('document')) ? '2px solid #0891b2' : '1px solid #a5f3fc',
                      boxShadow: (hrCandidateStatusFilter.toLowerCase().includes('document')) ? '0 4px 12px rgba(8, 145, 178, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Click to filter Document Submitted candidates"
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0891b2', textTransform: 'uppercase' }}>Document Submitted</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0e7490', marginTop: '4px' }}>
                      {hrCandidateStats.documentSubmitted}
                    </div>
                  </div>

                  {/* 4. IN PROGRESS / REVIEW */}
                  <div
                    onClick={() => setHrCandidateStatusFilter('Processing')}
                    style={{
                      background: '#ffffff',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: hrCandidateStatusFilter.toLowerCase() === 'processing' ? '2px solid #ea580c' : '1px solid #fed7aa',
                      boxShadow: hrCandidateStatusFilter.toLowerCase() === 'processing' ? '0 4px 12px rgba(234, 88, 12, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Click to filter In Progress / Review candidates"
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>In Progress / Review</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c2410c', marginTop: '4px' }}>
                      {hrCandidateStats.processing}
                    </div>
                  </div>

                  {/* 5. SELECTED (SEPARATE) */}
                  <div
                    onClick={() => setHrCandidateStatusFilter('selected')}
                    style={{
                      background: '#ffffff',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: hrCandidateStatusFilter.toLowerCase() === 'selected' ? '2px solid #059669' : '1px solid #a7f3d0',
                      boxShadow: hrCandidateStatusFilter.toLowerCase() === 'selected' ? '0 4px 12px rgba(5, 150, 105, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Click to filter Selected candidates"
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Selected</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#047857', marginTop: '4px' }}>
                      {hrCandidateStats.selected}
                    </div>
                  </div>

                  {/* 6. CLOSED (SEPARATE) */}
                  <div
                    onClick={() => setHrCandidateStatusFilter('closed')}
                    style={{
                      background: '#ffffff',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: hrCandidateStatusFilter.toLowerCase() === 'closed' ? '2px solid #4f46e5' : '1px solid #c7d2fe',
                      boxShadow: hrCandidateStatusFilter.toLowerCase() === 'closed' ? '0 4px 12px rgba(79, 70, 229, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Click to filter Closed / Joined candidates"
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>Closed</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4338ca', marginTop: '4px' }}>
                      {hrCandidateStats.closed}
                    </div>
                  </div>

                  {/* 7. REJECTED */}
                  <div
                    onClick={() => setHrCandidateStatusFilter('Rejected')}
                    style={{
                      background: '#ffffff',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: hrCandidateStatusFilter.toLowerCase() === 'rejected' ? '2px solid #dc2626' : '1px solid #fecaca',
                      boxShadow: hrCandidateStatusFilter.toLowerCase() === 'rejected' ? '0 4px 12px rgba(220, 38, 38, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Click to filter Rejected candidates"
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>Rejected</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b91c1c', marginTop: '4px' }}>
                      {hrCandidateStats.rejected}
                    </div>
                  </div>

                  {/* 8. TOTAL INCENTIVES */}
                  <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #bbf7d0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>Total Incentives</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>
                      ₹{hrCandidateStats.incentives.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div style={{
                  background: '#f8fafc',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 300px', maxWidth: '450px', position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search candidate name, mobile, email, app ID, job..."
                      value={hrCandidateSearch}
                      onChange={e => setHrCandidateSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                        outline: 'none',
                        background: '#ffffff'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <select
                      value={hrCandidateStatusFilter}
                      onChange={e => setHrCandidateStatusFilter(e.target.value)}
                      style={{
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        outline: 'none',
                        background: '#ffffff',
                        color: '#334155'
                      }}
                    >
                      <option value="all">Status: All ({hrCandidateStats.total})</option>
                      <option value="Processing">Processing ({hrCandidateStats.processing})</option>
                      <option value="document submission">Document Submitted ({hrCandidateStats.documentSubmitted})</option>
                      <option value="Applied">Applied</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="HR Screening">HR Screening</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="selected">Selected ({hrCandidateStats.selected})</option>
                      <option value="closed">Closed ({hrCandidateStats.closed})</option>
                      <option value="Rejected">Rejected ({hrCandidateStats.rejected})</option>
                    </select>

                    {(hrCandidateSearch || hrCandidateStatusFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setHrCandidateSearch('');
                          setHrCandidateStatusFilter('all');
                        }}
                        style={{
                          padding: '8px 12px',
                          fontSize: '0.8rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#64748b',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Clear Filters
                      </button>
                    )}
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                      Showing {hrFilteredCandidates.length} of {hrCandidateStats.total} candidates
                    </span>
                  </div>
                </div>

                {/* Candidate Content: Table or Cards or Empty State */}
                {hrFilteredCandidates.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>👥</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      {hrAllCandidates.length === 0
                        ? `No candidates have applied under ${selectedHrForCandidates.name}'s referral link yet.`
                        : 'No candidates match your search or filter criteria.'}
                    </div>
                    {hrAllCandidates.length > 0 && (
                      <button
                        onClick={() => {
                          setHrCandidateSearch('');
                          setHrCandidateStatusFilter('all');
                        }}
                        className="btn-secondary"
                        style={{ marginTop: '10px', fontSize: '0.8rem' }}
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="table-container hr-candidates-desktop-table">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>App ID</th>
                            <th>Candidate Details</th>
                            <th>Applied Job</th>
                            <th>Company</th>
                            <th>Applied On</th>
                            <th>Payment</th>
                            <th>Incentive</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hrFilteredCandidates.map(app => (
                            <tr key={app.id}>
                              <td style={{ fontWeight: 700, color: '#2563eb' }}>{app.applicationNumber}</td>
                              <td>
                                <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem', marginBottom: '6px' }}>{app.candidateName}</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.85rem' }}>
                                  <div style={{ color: '#047857', background: '#d1fae5', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                    📱 <a href={`tel:${app.candidateMobile}`} style={{ color: 'inherit', textDecoration: 'none' }}>{app.candidateMobile}</a>
                                  </div>
                                  <div style={{ color: '#1d4ed8', background: '#dbeafe', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                    ✉️ <a href={`mailto:${app.candidateEmail}`} style={{ color: 'inherit', textDecoration: 'none' }}>{app.candidateEmail}</a>
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
                              <td>
                                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                                  {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-GB') : '-'}
                                </div>
                                {app.appliedAt && (
                                  <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', fontWeight: 500 }}>
                                    <Clock size={12} color="#94a3b8" />
                                    {new Date(app.appliedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                  </div>
                                )}
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
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards View */}
                    <div className="hr-candidates-mobile-cards">
                      {hrFilteredCandidates.map(app => {
                        const gradientBg = getBankBrandGradient(app.companyName);
                        const shadowClr = getBankShadowColor(app.companyName);
                        return (
                          <div
                            key={app.id}
                            style={{
                              background: gradientBg,
                              borderRadius: '18px',
                              border: '1.5px solid rgba(255, 255, 255, 0.22)',
                              boxShadow: `0 10px 24px ${shadowClr}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                              padding: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                              color: '#ffffff',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            {/* Decorative Radial Lights */}
                            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '110px', height: '110px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', bottom: '-20px', left: '20px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', position: 'relative', zIndex: 1 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1.15rem', lineHeight: 1.2 }}>
                                  {app.candidateName}
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.95)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <span>{app.jobTitle}</span>
                                  <span style={{
                                    background: 'rgba(255, 255, 255, 0.22)',
                                    color: '#ffffff',
                                    border: '1px solid rgba(255, 255, 255, 0.35)',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '0.78rem'
                                  }}>
                                    🏛️ {app.companyName}
                                  </span>
                                </div>
                              </div>
                              <div style={{ flexShrink: 0 }}>
                                {getStatusBadge(app.status)}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '8px', position: 'relative', zIndex: 1 }}>
                              <span style={{ fontWeight: 800, color: '#ffffff' }}>#{app.applicationNumber}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff', fontWeight: 600 }}>
                                <span>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</span>
                                {app.appliedAt && (
                                  <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                    • <Clock size={11} color="#ffffff" /> {new Date(app.appliedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                  </span>
                                )}
                              </span>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '0.78rem', position: 'relative', zIndex: 1 }}>
                              <a
                                href={`tel:${app.candidateMobile}`}
                                style={{
                                  color: '#ffffff',
                                  background: 'rgba(255, 255, 255, 0.22)',
                                  border: '1px solid rgba(255, 255, 255, 0.35)',
                                  padding: '4px 9px',
                                  borderRadius: '8px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontWeight: 700,
                                  textDecoration: 'none'
                                }}
                              >
                                📱 {app.candidateMobile}
                              </a>
                              <a
                                href={`mailto:${app.candidateEmail}`}
                                style={{
                                  color: '#ffffff',
                                  background: 'rgba(255, 255, 255, 0.22)',
                                  border: '1px solid rgba(255, 255, 255, 0.35)',
                                  padding: '4px 9px',
                                  borderRadius: '8px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  maxWidth: '180px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                                title={app.candidateEmail}
                              >
                                ✉️ {app.candidateEmail}
                              </a>
                              <span style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.16)', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '4px 9px', borderRadius: '8px', fontWeight: 600 }}>
                                💼 {app.candidateExperience || 'Fresher'}
                              </span>
                              <span style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.16)', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '4px 9px', borderRadius: '8px', fontWeight: 600 }}>
                                🏙️ {app.candidateLocation || 'N/A'}
                              </span>
                              {app.candidateQualification && (
                                <span style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.16)', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '4px 9px', borderRadius: '8px', fontWeight: 600 }}>
                                  🎂 {app.candidateQualification}
                                </span>
                              )}
                              {app.candidateResumeUrl && (
                                <a
                                  href={app.candidateResumeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    color: '#ffffff',
                                    background: 'rgba(255, 255, 255, 0.25)',
                                    border: '1px solid rgba(255, 255, 255, 0.4)',
                                    padding: '4px 9px',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontWeight: 700,
                                    textDecoration: 'none'
                                  }}
                                >
                                  <FileText size={12} color="#ffffff" /> Resume
                                </a>
                              )}
                            </div>

                            <div style={{
                              background: 'rgba(0, 0, 0, 0.22)',
                              borderRadius: '10px',
                              padding: '8px 12px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.8rem',
                              border: '1px solid rgba(255, 255, 255, 0.18)',
                              color: '#ffffff',
                              position: 'relative',
                              zIndex: 1
                            }}>
                              <div>
                                <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Fee: </span>
                                <strong style={{ color: '#fef08a' }}>₹{getAppPaymentAmount(app)}</strong>
                              </div>
                              <div>
                                <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Incentive: </span>
                                <strong style={{ color: '#bbf7d0' }}>₹{app.incentiveAmount || 0}</strong>
                                {app.incentiveAmount > 0 && (
                                  <button
                                    onClick={() => handleToggleIncentiveStatus(app)}
                                    style={{
                                      marginLeft: '6px',
                                      background: app.incentiveStatus === 'Paid' ? '#10b981' : '#fef08a',
                                      color: app.incentiveStatus === 'Paid' ? '#fff' : '#854d0e',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '2px 6px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {app.incentiveStatus === 'Paid' ? 'Paid ✓' : 'Pay'}
                                  </button>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', position: 'relative', zIndex: 1 }}>
                              <button
                                style={{
                                  padding: '8px 12px',
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: '#ffffff',
                                  color: '#0f172a',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
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
                                style={{
                                  padding: '8px 12px',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  borderRadius: '8px',
                                  border: '1px solid rgba(255, 255, 255, 0.4)',
                                  background: 'rgba(255, 255, 255, 0.22)',
                                  color: '#ffffff',
                                  cursor: 'pointer',
                                  backdropFilter: 'blur(4px)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px'
                                }}
                                onClick={() => {
                                  setAppToSchedule(app);
                                  setInterviewModalOpen(true);
                                }}
                              >
                                <Calendar size={13} color="#ffffff" /> Schedule
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : (
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

            <div className="table-container hrs-desktop-table">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email / Mobile</th>
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
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{hr.email}</div>
                        {(hr.mobile || hr.phone) ? (
                          <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            <span style={{ fontSize: '0.85rem' }}>📱</span>
                            <a href={`tel:${hr.mobile || hr.phone}`} style={{ color: '#047857', textDecoration: 'none' }}>
                              {hr.mobile || hr.phone}
                            </a>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>📱</span> <span>—</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {hr.referralCode}
                        </span>
                        {hr.teamLeaderName && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                              TL: {hr.teamLeaderName}
                            </span>
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, color: '#3b82f6' }}>{hr.linkClicks || 0}</td>
                      <td>
                        <div
                          onClick={() => {
                            setSelectedHrForCandidates(hr);
                            setHrCandidateSearch('');
                            setHrCandidateStatusFilter('all');
                          }}
                          style={{
                            background: '#ecfdf5',
                            color: '#065f46',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #a7f3d0',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            flexDirection: 'column',
                            gap: '2px',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#d1fae5';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 3px 6px rgba(16, 185, 129, 0.2)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = '#ecfdf5';
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          title={`Click to view all candidates referred by ${hr.name}`}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            👥 {validApplications.filter(app => String(app.referredBy || '').toLowerCase() === String(hr.referralCode || '').toLowerCase()).length}
                            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>Candidates</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                            {getHrClosedApps(hr).filter(a => CLOSED_STATUSES.includes(String(a.status || '').toLowerCase())).length} closed ➔
                          </div>
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

            {/* Mobile HR Cards Grid (Visible on Mobile <= 768px, Hidden on Desktop) */}
            <div className="hrs-mobile-cards">
              {hrs.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  No HRs found. Add one to get started.
                </div>
              ) : (
                hrs.map(hr => {
                  const appliedCount = validApplications.filter(app => String(app.referredBy || '').toLowerCase() === String(hr.referralCode || '').toLowerCase()).length;
                  const closedCount = getHrClosedApps(hr).filter(a => CLOSED_STATUSES.includes(String(a.status || '').toLowerCase())).length;
                  return (
                    <div
                      key={hr.id}
                      style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      {/* Top Row: Avatar + Name/Email + Active Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            background: '#f8fafc',
                            border: '2px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 2px 5px rgba(0,0,0,0.06)'
                          }}>
                            {hr.profilePhoto ? (
                              <img src={hr.profilePhoto} alt={hr.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ fontWeight: 800, color: '#4f46e5', fontSize: '1.15rem' }}>
                                {hr.name?.charAt(0)?.toUpperCase() || 'H'}
                              </div>
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {hr.name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {hr.email}
                            </div>
                            {hr.mobile && (
                              <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600 }}>
                                📱 {hr.mobile}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          <span className="badge badge-active" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Active</span>
                        </div>
                      </div>

                      {/* Metrics Pill Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
                        <div style={{ background: '#fef3c7', color: '#92400e', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 600 }}>Referral:</span>
                          <span style={{ fontWeight: 800 }}>{hr.referralCode}</span>
                        </div>
                        <div style={{ background: '#eff6ff', color: '#1e40af', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 600 }}>Clicks:</span>
                          <span style={{ fontWeight: 800 }}>{hr.linkClicks || 0}</span>
                        </div>
                        <div 
                          onClick={() => {
                            setSelectedHrForCandidates(hr);
                            setHrCandidateSearch('');
                            setHrCandidateStatusFilter('all');
                          }}
                          style={{ 
                            background: '#ecfdf5', 
                            color: '#065f46', 
                            padding: '6px 10px', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            border: '1.5px solid #a7f3d0',
                            cursor: 'pointer'
                          }}
                          title={`View candidates for ${hr.name}`}
                        >
                          <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>Candidates:</span>
                          <span style={{ fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            {appliedCount} <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#047857' }}>({closedCount} closed)</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669' }}>›</span>
                          </span>
                        </div>
                        <div style={{ background: '#f0fdf4', color: '#166534', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 600 }}>Earned:</span>
                          <span style={{ fontWeight: 800 }}>₹{(hr.incentives || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: '7px 10px', fontSize: '0.78rem', color: '#2563eb', background: '#eff6ff', borderColor: '#bfdbfe', justifyContent: 'center' }}
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
                          <Edit size={13} /> Edit HR
                        </button>

                        <button
                          className="btn-secondary"
                          style={{ padding: '7px 10px', fontSize: '0.78rem', color: '#059669', background: '#ecfdf5', borderColor: '#a7f3d0', justifyContent: 'center' }}
                          onClick={() => {
                            setSelectedHrForIncentive(hr);
                            const initial = {};
                            getHrClosedApps(hr).forEach(app => { initial[app.id] = Number(app.incentiveAmount) || 0; });
                            setIncentiveInput(initial);
                            setIncentiveError('');
                            setIncentiveModalOpen(true);
                          }}
                        >
                          <Gift size={13} /> Incentives
                        </button>

                        <button
                          className="btn-secondary"
                          style={{ padding: '7px 10px', fontSize: '0.78rem', color: '#ef4444', background: '#fef2f2', borderColor: '#fecaca', justifyContent: 'center' }}
                          onClick={() => {
                            if (!window.confirm(`Delete HR ${hr.name}?`)) return;
                            fetch(`${API_URL}/api/users/hr/${hr.id}`, { method: 'DELETE' })
                            .then(() => fetchAllData());
                          }}
                          title="Delete HR"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
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
        {activeTab === 'manipal-payout-status' && (
          <ManipalPayoutManager
            API_URL={API_URL}
            applications={applications}
            interviews={interviews}
            companies={companies}
            onUpdateApplication={(updatedApp) => {
              setApplications(prev => prev.map(a => 
                (String(a.id) === String(updatedApp.id) || String(a._id) === String(updatedApp._id) || (updatedApp.id && String(a._id) === String(updatedApp.id)))
                  ? { ...a, ...updatedApp }
                  : a
              ));
            }}
            onBack={() => handleTabChange('dashboard')}
          />
        )}
        {activeTab === 'hierarchy' && (
          <HierarchyManager
            API_URL={API_URL}
            currentUser={currentUser}
            hrs={hrs}
            onRefresh={fetchAllData}
          />
        )}
        {activeTab === 'offer_targets' && (
          <OfferTargetsManager
            API_URL={API_URL}
            currentUser={currentUser}
          />
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

        {activeTab === 'client_dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={24} color="#2563eb" /> Client Portal & Accounts
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Manage corporate client logins and view real-time banking pipelines.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => setClientSubTab('pipeline')}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: clientSubTab === 'pipeline' ? '#ffffff' : 'transparent',
                      color: clientSubTab === 'pipeline' ? '#1e293b' : '#64748b',
                      boxShadow: clientSubTab === 'pipeline' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    Live Pipeline View
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientSubTab('accounts')}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: clientSubTab === 'accounts' ? '#ffffff' : 'transparent',
                      color: clientSubTab === 'accounts' ? '#1e293b' : '#64748b',
                      boxShadow: clientSubTab === 'accounts' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    Client Accounts ({clients.length})
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setClientToEdit(null);
                    setClientForm({ name: '', email: '', mobile: '', password: '' });
                    setClientError('');
                    setClientModalOpen(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}
                >
                  <Plus size={16} /> Add Client
                </button>
              </div>
            </div>

            {clientSubTab === 'pipeline' ? (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={16} color="#2563eb" /> Preview Portal for Client:
                    </span>
                    <select
                      value={previewClientId}
                      onChange={(e) => setPreviewClientId(e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        background: '#ffffff',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all">🌟 All Banks (Super Admin Full Pipeline)</option>
                      {clients.map(c => (
                        <option key={c.id || c.email} value={c.id || c.email}>
                          👤 {c.name} ({Array.isArray(c.allowedBanks) && c.allowedBanks.length > 0 ? `${c.allowedBanks.length} Banks Assigned` : 'All Banks'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenBankModal(clients.find(c => (c.id || c.email) === previewClientId) || null)}
                    className="btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      background: '#2563eb',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <Building2 size={15} /> Manage Client Access (Banks & Jobs)
                  </button>
                </div>

                <ClientDashboard
                  API_URL={API_URL}
                  currentUser={currentUser}
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                  isEmbedded={true}
                  allowedBanksFilter={previewClientId !== 'all' ? (clients.find(c => (c.id || c.email) === previewClientId)?.allowedBanks || null) : null}
                  allowedJobsFilter={previewClientId !== 'all' ? (clients.find(c => (c.id || c.email) === previewClientId)?.allowedJobs || null) : null}
                  onOpenManageBanks={() => handleOpenBankModal(clients.find(c => (c.id || c.email) === previewClientId) || null)}
                />
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Email (Login User ID)</th>
                      <th>Mobile Number</th>
                      <th>Portal Access</th>
                      <th>Created Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                          No client accounts created yet. Click "+ Add Client" to create one.
                        </td>
                      </tr>
                    ) : (
                      clients.map(cl => (
                        <tr key={cl.id || cl.email}>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.95rem', border: '1px solid #bfdbfe' }}>
                                {(cl.name || 'C').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div>{cl.name || 'Client Partner'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>ID: {cl.id || 'usr_client'}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 600, color: '#1e293b' }}>{cl.email}</span>
                              <button
                                type="button"
                                title="Copy Email / User ID"
                                onClick={() => {
                                  navigator.clipboard.writeText(cl.email);
                                  setCopiedClientId(cl.id || cl.email);
                                  setTimeout(() => setCopiedClientId(null), 2000);
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copiedClientId === (cl.id || cl.email) ? '#10b981' : '#94a3b8' }}
                              >
                                {copiedClientId === (cl.id || cl.email) ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                          </td>
                          <td>
                            {cl.mobile ? (
                              <span style={{ color: '#334155', fontWeight: 500 }}>{cl.mobile}</span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>—</span>
                            )}
                          </td>
                          <td>
                            {Array.isArray(cl.allowedBanks) && cl.allowedBanks.length > 0 ? (
                              <div>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                                    <Building2 size={12} /> {cl.allowedBanks.length} Banks
                                  </span>
                                  {Array.isArray(cl.allowedJobs) && cl.allowedJobs.length > 0 ? (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                                      <Briefcase size={12} /> {cl.allowedJobs.length} Jobs
                                    </span>
                                  ) : (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}>
                                      All Jobs
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px', maxWidth: '240px', whiteSpace: 'normal', lineHeight: '1.3' }}>
                                  {cl.allowedBanks.join(', ')}
                                </div>
                              </div>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                                <CheckCircle size={12} /> All Banks & Jobs
                              </span>
                            )}
                          </td>
                          <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                            {cl.createdAt ? new Date(cl.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Active'}
                          </td>
                          <td>
                            <span className="badge badge-active">Active</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn-secondary"
                                style={{ padding: '5px 9px', color: '#1d4ed8', background: '#eff6ff', borderColor: '#bfdbfe' }}
                                title="Configure Allowed Banks & Jobs"
                                onClick={() => handleOpenBankModal(cl)}
                              >
                                <Building2 size={14} />
                              </button>
                              <button
                                className="btn-secondary"
                                style={{ padding: '5px 9px', color: '#2563eb', background: '#eff6ff', borderColor: '#bfdbfe' }}
                                title="Edit Client"
                                onClick={() => {
                                  setClientToEdit(cl);
                                  setClientForm({
                                    name: cl.name || '',
                                    email: cl.email || '',
                                    mobile: cl.mobile || '',
                                    password: '',
                                    allowedBanks: Array.isArray(cl.allowedBanks) ? cl.allowedBanks : [],
                                    allowedJobs: Array.isArray(cl.allowedJobs) ? cl.allowedJobs : []
                                  });
                                  setClientError('');
                                  setClientModalOpen(true);
                                }}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="btn-secondary"
                                style={{ padding: '5px 9px', color: '#ef4444' }}
                                title="Delete Client Account"
                                onClick={() => handleDeleteClient(cl)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'offer_targets' && (
          <OfferTargetsManager
            API_URL={API_URL}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'admin_profile' && (
          <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}>
                  <UserCog size={28} color="#f59e0b" /> Admin Profile & Security Settings
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '4px' }}>
                  Manage your Super Admin login credentials, contact info, and system security controls.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
                  color: '#92400e', 
                  padding: '6px 14px', 
                  borderRadius: '20px', 
                  fontWeight: 700, 
                  fontSize: '0.82rem',
                  border: '1px solid #fcd34d'
                }}>
                  <ShieldCheck size={16} /> Super Admin Privilege
                </span>
              </div>
            </div>

            {/* Profile Message Alert */}
            {adminProfileMsg.text && (
              <div style={{
                marginBottom: '1.25rem',
                padding: '14px 18px',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: adminProfileMsg.type === 'error' ? '#fef2f2' : '#f0fdf4',
                color: adminProfileMsg.type === 'error' ? '#dc2626' : '#15803d',
                border: `1px solid ${adminProfileMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`
              }}>
                {adminProfileMsg.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                <span>{adminProfileMsg.text}</span>
              </div>
            )}

            {/* Password Message Alert */}
            {adminPasswordMsg.text && (
              <div style={{
                marginBottom: '1.25rem',
                padding: '14px 18px',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: adminPasswordMsg.type === 'error' ? '#fef2f2' : '#f0fdf4',
                color: adminPasswordMsg.type === 'error' ? '#dc2626' : '#15803d',
                border: `1px solid ${adminPasswordMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`
              }}>
                {adminPasswordMsg.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                <span>{adminPasswordMsg.text}</span>
              </div>
            )}

            {/* 2-Column Responsive Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              
              {/* CARD 1: Profile Information */}
              <div style={{ 
                background: '#ffffff', 
                borderRadius: '16px', 
                padding: '1.75rem', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Admin Profile Details</h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>Your visible display name and contact credentials</p>
                  </div>
                </div>

                <form onSubmit={handleAdminProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Admin Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        value={adminProfileData.name} 
                        onChange={(e) => setAdminProfileData({ ...adminProfileData, name: e.target.value })}
                        required
                        placeholder="e.g. Super Admin"
                        style={{ 
                          width: '100%', 
                          padding: '10px 14px 10px 38px', 
                          borderRadius: '8px', 
                          border: '1px solid #cbd5e1', 
                          fontSize: '0.92rem', 
                          outline: 'none',
                          color: '#0f172a'
                        }}
                      />
                      <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Login Email Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="email" 
                        value={adminProfileData.email} 
                        onChange={(e) => setAdminProfileData({ ...adminProfileData, email: e.target.value })}
                        required
                        placeholder="e.g. admin@forgeindiaconnect.in"
                        style={{ 
                          width: '100%', 
                          padding: '10px 14px 10px 38px', 
                          borderRadius: '8px', 
                          border: '1px solid #cbd5e1', 
                          fontSize: '0.92rem', 
                          outline: 'none',
                          color: '#0f172a'
                        }}
                      />
                      <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Used to log into the Admin portal. Must be unique.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Mobile / WhatsApp Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="tel" 
                        value={adminProfileData.mobile} 
                        onChange={(e) => setAdminProfileData({ ...adminProfileData, mobile: e.target.value })}
                        placeholder="e.g. 9876543210"
                        style={{ 
                          width: '100%', 
                          padding: '10px 14px 10px 38px', 
                          borderRadius: '8px', 
                          border: '1px solid #cbd5e1', 
                          fontSize: '0.92rem', 
                          outline: 'none',
                          color: '#0f172a'
                        }}
                      />
                      <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Optional mobile number for alerts & authentication.
                    </span>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    <button 
                      type="submit" 
                      disabled={adminProfileSaving}
                      className="btn-primary" 
                      style={{ 
                        width: '100%', 
                        padding: '11px 16px', 
                        borderRadius: '8px', 
                        fontWeight: 700, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                        cursor: adminProfileSaving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <Check size={18} /> {adminProfileSaving ? 'Saving Profile...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* CARD 2: Security & Password Management */}
              <div style={{ 
                background: '#ffffff', 
                borderRadius: '16px', 
                padding: '1.75rem', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Key size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Change Password</h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>Verify old password to update login secret</p>
                  </div>
                </div>

                <form onSubmit={handleAdminPasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Current / Old Password <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showOldPass ? 'text' : 'password'} 
                        value={adminPasswordData.oldPassword} 
                        onChange={(e) => setAdminPasswordData({ ...adminPasswordData, oldPassword: e.target.value })}
                        required
                        placeholder="Enter current password"
                        style={{ 
                          width: '100%', 
                          padding: '10px 42px 10px 38px', 
                          borderRadius: '8px', 
                          border: '1px solid #cbd5e1', 
                          fontSize: '0.92rem', 
                          outline: 'none',
                          color: '#0f172a'
                        }}
                      />
                      <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <button
                        type="button"
                        onClick={() => setShowOldPass(!showOldPass)}
                        style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                      >
                        {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      New Password <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showNewPass ? 'text' : 'password'} 
                        value={adminPasswordData.newPassword} 
                        onChange={(e) => setAdminPasswordData({ ...adminPasswordData, newPassword: e.target.value })}
                        required
                        placeholder="At least 4-6 characters"
                        style={{ 
                          width: '100%', 
                          padding: '10px 42px 10px 38px', 
                          borderRadius: '8px', 
                          border: '1px solid #cbd5e1', 
                          fontSize: '0.92rem', 
                          outline: 'none',
                          color: '#0f172a'
                        }}
                      />
                      <Key size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                      >
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Confirm New Password <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showConfirmPass ? 'text' : 'password'} 
                        value={adminPasswordData.confirmPassword} 
                        onChange={(e) => setAdminPasswordData({ ...adminPasswordData, confirmPassword: e.target.value })}
                        required
                        placeholder="Repeat new password"
                        style={{ 
                          width: '100%', 
                          padding: '10px 42px 10px 38px', 
                          borderRadius: '8px', 
                          border: '1px solid #cbd5e1', 
                          fontSize: '0.92rem', 
                          outline: 'none',
                          color: '#0f172a'
                        }}
                      />
                      <ShieldCheck size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                      >
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    <button 
                      type="submit" 
                      disabled={adminPasswordSaving}
                      className="btn-primary" 
                      style={{ 
                        width: '100%', 
                        padding: '11px 16px', 
                        borderRadius: '8px', 
                        fontWeight: 700, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px',
                        background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                        boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)',
                        cursor: adminPasswordSaving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <Lock size={18} /> {adminPasswordSaving ? 'Updating Password...' : 'Update Login Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* CARD 3: Super Admin Privileges & System Status */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>System Authority & Account Overview</h3>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>FIC RecruitPro Master Control Account</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>
                    Active & Authenticated
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Identifier</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', marginTop: '4px', fontFamily: 'monospace' }}>
                    {currentUser?.id || 'usr_admin'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned System Role</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px', textTransform: 'capitalize' }}>
                    {currentUser?.role || 'admin'} (Super Admin)
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Authorized Portal Modules</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
                    All 12 Modules (Full Access)
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Client Account Form Modal */}
      {clientModalOpen && (
        <div className="modal-overlay" onClick={() => setClientModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', borderRadius: '16px', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
                    {clientToEdit ? 'Edit Client Account' : 'Add New Client Account'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    {clientToEdit ? 'Update client details or reset password' : 'Create client login to access Client Dashboard'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClientModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveClient} style={{ padding: '1.5rem' }}>
              {clientError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <XCircle size={16} /> {clientError}
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Client Name / Representative Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Banking Client Partner"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Email ID (Client User ID) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. client@bankingpartner.in"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  This email is used as the User ID to log in to the Client Portal.
                </span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Mobile Number (Optional Login ID)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={clientForm.mobile}
                  onChange={(e) => setClientForm({ ...clientForm, mobile: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Password {clientToEdit ? '(Leave blank to keep existing)' : <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={clientShowPassword ? 'text' : 'password'}
                    required={!clientToEdit}
                    placeholder={clientToEdit ? 'Enter new password if changing' : 'Enter login password (e.g. Client@123)'}
                    value={clientForm.password}
                    onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })}
                    style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setClientShowPassword(!clientShowPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    {clientShowPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Select Banks for Client Section */}
              <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={15} color="#2563eb" /> Visible Banks for this Client
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setClientForm(prev => ({ ...prev, allowedBanks: [] }))}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: clientForm.allowedBanks.length === 0 ? '#2563eb' : '#ffffff',
                        color: clientForm.allowedBanks.length === 0 ? '#ffffff' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      All Banks
                    </button>
                    <button
                      type="button"
                      onClick={() => setClientForm(prev => ({ ...prev, allowedBanks: [...allAvailableBanks] }))}
                      style={{ padding: '3px 8px', fontSize: '0.725rem', fontWeight: 600, borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', cursor: 'pointer' }}
                    >
                      Select All
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 10px 0' }}>
                  {clientForm.allowedBanks.length === 0 
                    ? '🌟 All Banks Allowed: Client sees all candidates from all banking partners.' 
                    : `🎯 Restricted: Client will only see candidates from the ${clientForm.allowedBanks.length} selected bank(s).`}
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                  gap: '6px',
                  maxHeight: '170px',
                  overflowY: 'auto',
                  padding: '2px'
                }}>
                  {allAvailableBanks.map(bName => {
                    const isSelected = clientForm.allowedBanks.includes('__NONE__') ? false : (clientForm.allowedBanks.length === 0 || clientForm.allowedBanks.includes(bName));
                    const toggleClientBank = () => {
                      setClientForm(prev => {
                        let curr;
                        if (prev.allowedBanks.length === 0) {
                          curr = allAvailableBanks.filter(b => b !== bName);
                        } else if (prev.allowedBanks.includes('__NONE__')) {
                          curr = [bName];
                        } else if (prev.allowedBanks.includes(bName)) {
                          curr = prev.allowedBanks.filter(b => b !== bName);
                        } else {
                          curr = [...prev.allowedBanks, bName];
                        }
                        return { ...prev, allowedBanks: curr.length > 0 ? curr : ['__NONE__'] };
                      });
                    };

                    return (
                      <div
                        key={bName}
                        onClick={toggleClientBank}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'all 0.15s'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleClientBank();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          style={{ accentColor: '#2563eb', cursor: 'pointer' }}
                        />
                        <img
                          src={getBankLogo(bName)}
                          alt={bName}
                          onError={e => { e.currentTarget.src = '/logo.png'; }}
                          style={{ width: '16px', height: '16px', objectFit: 'contain', borderRadius: '3px' }}
                        />
                        <span style={{ fontSize: '0.75rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1e3a8a' : '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {bName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setClientModalOpen(false)}
                  disabled={clientSaving}
                  style={{ padding: '8px 18px', borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={clientSaving}
                  style={{ padding: '8px 22px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                >
                  {clientSaving ? 'Saving...' : (clientToEdit ? 'Update Client' : 'Create Client')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Bank & Job Access Selection Modal */}
      {bankAccessModalOpen && (
        <div className="modal-overlay" onClick={() => setBankAccessModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', borderRadius: '16px', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
                    Manage Client Access (Banks & Jobs)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    Configure which Banks and specific Job roles this Client can view
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBankAccessModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {/* Client Selector (if multiple clients) */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Target Client Account:
                </label>
                {clients.length > 0 ? (
                  <select
                    value={selectedClientForBanks?.id || selectedClientForBanks?.email || ''}
                    onChange={(e) => {
                      const found = clients.find(c => (c.id || c.email) === e.target.value);
                      if (found) {
                        setSelectedClientForBanks(found);
                        if (Array.isArray(found.allowedBanks) && found.allowedBanks.length > 0) {
                          setBankSelectionList([...found.allowedBanks]);
                        } else {
                          setBankSelectionList([]);
                        }
                        if (Array.isArray(found.allowedJobs) && found.allowedJobs.length > 0) {
                          setJobSelectionList([...found.allowedJobs]);
                        } else {
                          setJobSelectionList([]);
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      background: '#ffffff',
                      outline: 'none'
                    }}
                  >
                    {clients.map(cl => (
                      <option key={cl.id || cl.email} value={cl.id || cl.email}>
                        👤 {cl.name} ({cl.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#ef4444', background: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                    No client accounts exist. Please create a Client Account first.
                  </div>
                )}
              </div>

              {/* TABS: Banks Access vs Specific Jobs Access */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setAccessModalTab('banks')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: accessModalTab === 'banks' ? '#2563eb' : '#f1f5f9',
                    color: accessModalTab === 'banks' ? '#ffffff' : '#475569',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Building2 size={16} /> 1. Allowed Banks ({bankSelectionList.length === 0 ? 'All' : bankSelectionList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAccessModalTab('jobs')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: accessModalTab === 'jobs' ? '#7c3aed' : '#f1f5f9',
                    color: accessModalTab === 'jobs' ? '#ffffff' : '#475569',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Briefcase size={16} /> 2. Allowed Jobs ({jobSelectionList.length === 0 ? 'All Jobs' : (jobSelectionList.includes('__NONE__') ? '0 Selected' : `${jobSelectionList.length} Selected`)})
                </button>
              </div>

              {accessModalTab === 'banks' ? (
                <div>
                  {/* Quick Actions & Status for Banks */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      {bankSelectionList.length === 0 ? (
                        <span style={{ color: '#16a34a' }}>🌟 All Banks Allowed (Full Access)</span>
                      ) : bankSelectionList.includes('__NONE__') ? (
                        <span style={{ color: '#ef4444' }}>⚠️ 0 Banks Selected (No Bank Access)</span>
                      ) : (
                        <span style={{ color: '#2563eb' }}>🎯 {bankSelectionList.length} of {allAvailableBanks.length} Banks Selected</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setBankSelectionList([])}
                        style={{
                          padding: '5px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: bankSelectionList.length === 0 ? '#2563eb' : '#ffffff',
                          color: bankSelectionList.length === 0 ? '#ffffff' : '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        All Banks (Default)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBankSelectionList([...allAvailableBanks])}
                        style={{
                          padding: '5px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setBankSelectionList(['__NONE__'])}
                        style={{
                          padding: '5px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: bankSelectionList.includes('__NONE__') ? '#ef4444' : '#ffffff',
                          color: bankSelectionList.includes('__NONE__') ? '#ffffff' : '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Grid of Banks */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                    gap: '8px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    padding: '4px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {allAvailableBanks.map(bName => {
                      const isChecked = bankSelectionList.includes('__NONE__') ? false : (bankSelectionList.length === 0 || bankSelectionList.includes(bName));
                      const bankJobCount = getJobsForBank(bName).length;

                      const toggleBank = () => {
                        if (bankSelectionList.length === 0) {
                          const remaining = allAvailableBanks.filter(b => b !== bName);
                          setBankSelectionList(remaining.length > 0 ? remaining : ['__NONE__']);
                        } else if (bankSelectionList.includes('__NONE__')) {
                          setBankSelectionList([bName]);
                        } else if (bankSelectionList.includes(bName)) {
                          const remaining = bankSelectionList.filter(b => b !== bName);
                          setBankSelectionList(remaining.length > 0 ? remaining : ['__NONE__']);
                        } else {
                          setBankSelectionList([...bankSelectionList, bName]);
                        }
                      };

                      return (
                        <div
                          key={bName}
                          onClick={toggleBank}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '6px',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            border: isChecked ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                            background: isChecked ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: isChecked ? '0 2px 6px rgba(59, 130, 246, 0.15)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleBank();
                              }}
                              onClick={(e) => e.stopPropagation()}
                              style={{ accentColor: '#2563eb', cursor: 'pointer', width: '16px', height: '16px', flexShrink: 0 }}
                            />
                            <img
                              src={getBankLogo(bName)}
                              alt={bName}
                              onError={e => { e.currentTarget.src = '/logo.png'; }}
                              style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px', flexShrink: 0 }}
                            />
                            <span style={{ fontSize: '0.8rem', fontWeight: isChecked ? 800 : 500, color: isChecked ? '#1e3a8a' : '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {bName}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '10px', flexShrink: 0 }}>
                            {bankJobCount} jobs
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* JOBS TAB */
                (() => {
                  const activeAssignedBanks = bankSelectionList.includes('__NONE__')
                    ? []
                    : (bankSelectionList.length === 0
                      ? allAvailableBanks
                      : allAvailableBanks.filter(b => bankSelectionList.includes(b)));

                  const allAssignedBankJobs = (jobs || []).filter(j => {
                    const norm = getNormalizedBankName(j.companyName || '');
                    return activeAssignedBanks.some(b =>
                      norm.toLowerCase() === b.toLowerCase() ||
                      b.toLowerCase().includes(norm.toLowerCase()) ||
                      norm.toLowerCase().includes(b.toLowerCase())
                    );
                  });

                  const isJobSelected = (job) => {
                    if (jobSelectionList.includes('__NONE__')) return false;
                    if (jobSelectionList.length === 0) return true; // All jobs allowed by default
                    const jId = job.id || job.title;
                    return jobSelectionList.includes(jId) ||
                           (job.title && jobSelectionList.includes(job.title)) ||
                           (job.id && jobSelectionList.includes(job.id));
                  };

                  const selectedJobsCount = jobSelectionList.includes('__NONE__')
                    ? 0
                    : (jobSelectionList.length === 0 ? allAssignedBankJobs.length : allAssignedBankJobs.filter(j => isJobSelected(j)).length);

                  const toggleJob = (job) => {
                    const jId = job.id || job.title;
                    const allJobIds = allAssignedBankJobs.map(j => j.id || j.title);

                    if (jobSelectionList.length === 0) {
                      // Currently All Jobs selected -> uncheck this specific one:
                      const remaining = allJobIds.filter(id => id !== jId && id !== job.id && id !== job.title);
                      setJobSelectionList(remaining.length > 0 ? remaining : ['__NONE__']);
                    } else if (jobSelectionList.includes('__NONE__')) {
                      // Currently None -> check this specific one:
                      setJobSelectionList([jId]);
                    } else if (isJobSelected(job)) {
                      // Currently checked -> uncheck it:
                      const remaining = jobSelectionList.filter(id => id !== jId && id !== job.id && id !== job.title && id !== '__NONE__');
                      setJobSelectionList(remaining.length > 0 ? remaining : ['__NONE__']);
                    } else {
                      // Currently unchecked -> check it:
                      const current = jobSelectionList.filter(id => id !== '__NONE__');
                      setJobSelectionList([...current, jId]);
                    }
                  };

                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                            {jobSelectionList.length === 0 ? (
                              <span style={{ color: '#16a34a' }}>🌟 All Jobs in Assigned Banks Allowed ({allAssignedBankJobs.length} Roles)</span>
                            ) : jobSelectionList.includes('__NONE__') || selectedJobsCount === 0 ? (
                              <span style={{ color: '#ef4444' }}>⚠️ 0 Jobs Selected (No Job Access)</span>
                            ) : (
                              <span style={{ color: '#7c3aed' }}>🎯 {selectedJobsCount} of {allAssignedBankJobs.length} Job Roles Selected</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {jobSelectionList.length === 0 
                              ? 'Client will see all applicants across all positions in assigned banks.' 
                              : 'Client will strictly only see applicants for these chosen jobs.'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setJobSelectionList([])}
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: jobSelectionList.length === 0 ? '#7c3aed' : '#ffffff',
                              color: jobSelectionList.length === 0 ? '#ffffff' : '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            All Jobs (Default)
                          </button>
                          <button
                            type="button"
                            onClick={() => setJobSelectionList(allAssignedBankJobs.map(j => j.id || j.title))}
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => setJobSelectionList(['__NONE__'])}
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: jobSelectionList.includes('__NONE__') ? '#ef4444' : '#ffffff',
                              color: jobSelectionList.includes('__NONE__') ? '#ffffff' : '#64748b',
                              cursor: 'pointer'
                            }}
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>

                      {/* List of Jobs grouped by Bank */}
                      <div style={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                        padding: '6px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        {activeAssignedBanks.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b', fontSize: '0.85rem' }}>
                            No banks are currently allowed. Please select banks in the <strong>Allowed Banks</strong> tab first.
                          </div>
                        ) : (
                          activeAssignedBanks.map(bName => {
                            const bankJobs = getJobsForBank(bName);
                            const bankJobIds = bankJobs.map(j => j.id || j.title);
                            const areAllBankJobsSelected = bankJobs.length > 0 && bankJobs.every(j => isJobSelected(j));

                            const toggleAllBankJobs = () => {
                              const allJobIds = allAssignedBankJobs.map(j => j.id || j.title);
                              if (areAllBankJobsSelected) {
                                // Uncheck all jobs for this bank:
                                if (jobSelectionList.length === 0) {
                                  const remaining = allJobIds.filter(id => !bankJobIds.includes(id));
                                  setJobSelectionList(remaining.length > 0 ? remaining : ['__NONE__']);
                                } else {
                                  const remaining = jobSelectionList.filter(id => !bankJobIds.includes(id) && id !== '__NONE__');
                                  setJobSelectionList(remaining.length > 0 ? remaining : ['__NONE__']);
                                }
                              } else {
                                // Check all jobs for this bank:
                                const current = jobSelectionList.length === 0 ? allJobIds : jobSelectionList.filter(id => id !== '__NONE__');
                                setJobSelectionList([...new Set([...current, ...bankJobIds])]);
                              }
                            };

                            return (
                              <div key={bName} style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '10px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <img
                                      src={getBankLogo(bName)}
                                      alt={bName}
                                      onError={e => { e.currentTarget.src = '/logo.png'; }}
                                      style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                                    />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                                      {bName}
                                    </span>
                                    <span style={{ fontSize: '0.725rem', color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: '10px' }}>
                                      {bankJobs.length} role{bankJobs.length > 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  {bankJobs.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={toggleAllBankJobs}
                                      style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        border: '1px solid #cbd5e1',
                                        background: areAllBankJobsSelected ? '#fef2f2' : '#f8fafc',
                                        color: areAllBankJobsSelected ? '#dc2626' : '#2563eb',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {areAllBankJobsSelected ? `Deselect All (${bName.split(' ')[0]})` : `Select All (${bName.split(' ')[0]})`}
                                    </button>
                                  )}
                                </div>

                                {bankJobs.length === 0 ? (
                                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', padding: '4px 0' }}>
                                    No active job vacancies created for this bank yet.
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {bankJobs.map(job => {
                                      const jobIdOrTitle = job.id || job.title;
                                      const isSelected = isJobSelected(job);
                                      return (
                                        <div
                                          key={jobIdOrTitle}
                                          onClick={() => toggleJob(job)}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '8px 10px',
                                            borderRadius: '8px',
                                            border: isSelected ? '1.5px solid #a855f7' : '1px solid #e2e8f0',
                                            background: isSelected ? '#faf5ff' : '#ffffff',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                          }}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              toggleJob(job);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ accentColor: '#7c3aed', cursor: 'pointer', width: '16px', height: '16px', flexShrink: 0 }}
                                          />
                                          <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontSize: '0.825rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#6b21a8' : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                              {job.title}
                                            </div>
                                            <div style={{ fontSize: '0.725rem', color: '#64748b', display: 'flex', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                                              {job.salary && <span>💰 {job.salary}</span>}
                                              {job.location && <span>📍 {job.location.substring(0, 30)}{job.location.length > 30 ? '...' : ''}</span>}
                                              {job.jobType && <span>🏷️ {job.jobType}</span>}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Bottom Summary Bar */}
              <div style={{ marginTop: '1.25rem', padding: '10px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                  <strong>Access Summary:</strong>{' '}
                  <span style={{ color: '#2563eb', fontWeight: 700 }}>
                    {bankSelectionList.length === 0 ? 'All Banks' : (bankSelectionList.includes('__NONE__') ? '0 Banks' : `${bankSelectionList.length} Banks`)}
                  </span>
                  {' • '}
                  <span style={{ color: '#7c3aed', fontWeight: 700 }}>
                    {jobSelectionList.length === 0 ? 'All Jobs in Allowed Banks' : (jobSelectionList.includes('__NONE__') ? '0 Jobs' : `${jobSelectionList.length} Specific Jobs`)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setBankAccessModalOpen(false)}
                    disabled={savingBankAccess}
                    style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.825rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSaveBankAccess}
                    disabled={savingBankAccess || !selectedClientForBanks}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                      border: 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: savingBankAccess ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                    }}
                  >
                    <CheckCircle size={16} /> {savingBankAccess ? 'Saving...' : 'Save Client Access'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <option value="Document Submission">Document Submission</option>
                  <option value="Selected">Selected</option>
                  <option value="Closed" style={{ fontWeight: 'bold', color: '#059669' }}>🔒 Closed</option>
                  <option value="Joined Manipal" style={{ fontWeight: 'bold', color: '#059669' }}>🎓 Joined Manipal (Payout & Incentive)</option>
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
                  <label style={{ cursor: photoUploading ? 'not-allowed' : 'pointer', background: '#eef2ff', color: '#4f46e5', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #c7d2fe', display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: photoUploading ? 0.7 : 1 }}>
                    {photoUploading ? '⏳ Uploading to Cloudinary...' : '📷 Upload Photo'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={photoUploading}
                      style={{ display: 'none' }} 
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          setHrError('Image file is too large! Please select an image under 5MB.');
                          return;
                        }
                        setPhotoUploading(true);
                        setHrError('');
                        try {
                          const cloudUrl = await uploadToCloudinary(file);
                          setHrForm(prev => ({ ...prev, profilePhoto: cloudUrl }));
                        } catch (err) {
                          console.error(err);
                          setHrError('Failed to upload image to Cloudinary: ' + (err.message || ''));
                        } finally {
                          setPhotoUploading(false);
                        }
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
                  disabled={hrSaving || photoUploading}
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
                      let cleanPhoto = hrForm.profilePhoto || '';
                      // If photo is still a base64 string, auto-upload to Cloudinary first to prevent 413 error
                      if (cleanPhoto.startsWith('data:image/')) {
                        try {
                          cleanPhoto = await uploadToCloudinary(cleanPhoto);
                          setHrForm(prev => ({ ...prev, profilePhoto: cleanPhoto }));
                        } catch (err) {
                          console.warn('Auto Cloudinary upload warning:', err);
                        }
                      }

                      // Save to local cache immediately
                      if (cleanPhoto) {
                        try {
                          const storedPhotos = JSON.parse(localStorage.getItem('hr_profile_photos') || '{}');
                          if (hrToEdit && hrToEdit.id) {
                            storedPhotos[hrToEdit.id] = cleanPhoto;
                          }
                          localStorage.setItem('hr_profile_photos', JSON.stringify(storedPhotos));
                        } catch (e) {}
                      } else if (hrToEdit && hrToEdit.id) {
                        try {
                          const storedPhotos = JSON.parse(localStorage.getItem('hr_profile_photos') || '{}');
                          delete storedPhotos[hrToEdit.id];
                          localStorage.setItem('hr_profile_photos', JSON.stringify(storedPhotos));
                        } catch (e) {}
                      }

                      const payload = { ...hrForm, profilePhoto: cleanPhoto };
                      let res;
                      if (hrToEdit) {
                        res = await fetch(`${API_URL}/api/users/hr/${hrToEdit.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload)
                        });
                        if (res.status === 404) {
                          // Fallback to profile route
                          res = await fetch(`${API_URL}/api/users/${hrToEdit.id}/profile`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              name: payload.name,
                              mobile: payload.mobile,
                              profilePhoto: payload.profilePhoto
                            })
                          });
                        }
                      } else {
                        res = await fetch(`${API_URL}/api/users/hr`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload)
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
                                  value={incentiveInput[app.id] !== undefined && Number(incentiveInput[app.id]) !== 0 ? incentiveInput[app.id] : ''}
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

      {/* Link Click Analytics Breakdown Modal */}
      {showClickStatsModal && (
        <div className="modal-overlay" onClick={() => setShowClickStatsModal(false)} style={{ zIndex: 9999 }}>
          <div 
            className="modal-content animate-fade click-stats-modal" 
            style={{ maxWidth: '820px', width: '95%', borderRadius: '16px', overflow: 'hidden', padding: 0, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} 
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="click-stats-header" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', padding: '1.25rem 1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MousePointerClick size={22} /> Link Click Analytics & Tracking
                </h3>
                <p style={{ margin: '4px 0 0 0', opacity: 0.85, fontSize: '0.85rem' }}>
                  Live breakdown of all HR referral links and direct candidate portal visits.
                </p>
              </div>
              <button 
                onClick={() => setShowClickStatsModal(false)} 
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', flexShrink: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content body */}
            <div className="click-stats-body" style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              {/* Summary stat cards */}
              <div className="click-stats-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '1.25rem' }}>
                <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', padding: '12px 14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div className="stat-num" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3730a3' }}>{grandTotalClicks}</div>
                  <div className="stat-label" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Link Clicks</div>
                </div>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px 14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div className="stat-num" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#065f46' }}>{effectiveDirectClicks}</div>
                  <div className="stat-label" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Direct Portal Visits</div>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div className="stat-num" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e40af' }}>{totalHrClicks}</div>
                  <div className="stat-label" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>HR Referral Clicks</div>
                </div>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px 14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div className="stat-num" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#92400e' }}>{totalAgentClicks}</div>
                  <div className="stat-label" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Partner Referral Clicks</div>
                </div>
              </div>

              {/* Direct visits card banner */}
              <div className="click-stats-direct-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    🌐
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>Direct Candidates (No Referral Code)</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Visitors who opened candidate portal directly via search or direct link</div>
                  </div>
                </div>
                <div className="click-stats-direct-right" style={{ textAlign: 'right' }}>
                  <span className="click-stats-direct-pill" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', background: '#d1fae5', padding: '4px 12px', borderRadius: '20px', whiteSpace: 'nowrap', display: 'inline-block' }}>
                    {effectiveDirectClicks} clicks
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
                    {directAppsCount} applications submitted
                  </div>
                </div>
              </div>

              {/* Search HRs */}
              <div className="click-stats-search-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>HR & Partner Referral Breakdown</h4>
                <div className="click-stats-search-input-wrap" style={{ position: 'relative', width: '240px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search HR name or code..."
                    value={clickStatsSearch}
                    onChange={e => setClickStatsSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 10px 6px 30px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="click-stats-table-wrap" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="click-stats-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#475569', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '10px 14px' }}>HR / Partner</th>
                      <th style={{ padding: '10px 14px' }}>Branch</th>
                      <th style={{ padding: '10px 14px' }}>Referral Code</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Link Clicks</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Applications</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hrs
                      .filter(h => {
                        if (!clickStatsSearch) return true;
                        const q = clickStatsSearch.toLowerCase();
                        return (h.name || '').toLowerCase().includes(q) || (h.referralCode || '').toLowerCase().includes(q) || (h.branch || '').toLowerCase().includes(q);
                      })
                      .sort((a, b) => (Number(b.linkClicks) || 0) - (Number(a.linkClicks) || 0))
                      .map(h => {
                        const hrApps = validApplications.filter(a => a.referredBy === h.referralCode);
                        const clicks = Number(h.linkClicks) || 0;
                        const convRate = clicks > 0 ? ((hrApps.length / clicks) * 100).toFixed(1) : (hrApps.length > 0 ? '100' : '0');
                        return (
                          <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>
                              {h.name}
                            </td>
                            <td style={{ padding: '10px 14px', color: '#64748b' }}>
                              {h.branch || 'Head Office'}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ background: '#eff6ff', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>
                                {h.referralCode}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#4f46e5' }}>
                              {clicks}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>
                              {hrApps.length}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                              {convRate}%
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setShowClickStatsModal(false)}
                style={{ padding: '8px 20px', borderRadius: '6px', fontWeight: 600 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
