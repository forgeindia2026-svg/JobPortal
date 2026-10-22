import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2, Users, FileText, CalendarDays, CheckCircle, Clock,
  RefreshCw, Search, Download, ArrowLeft, ExternalLink, XCircle,
  FileCheck, ChevronRight
} from 'lucide-react';

// Brand colors & gradients matching the official bank themes
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
  return 'rgba(30, 41, 59, 0.35)';
};

// Strict normalization helper to prevent name collision (e.g. Kotak Mahindra Bank vs Mahindra Finance)
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
  return '/logo.png';
};

// Config for drill-down banner when navigated via KPI cards
const getKpiBannerConfig = (status) => {
  switch (status) {
    case 'processing':
      return {
        title: 'Processing Candidates',
        subtitle: 'Candidates currently undergoing screening, resume review, and verification.',
        gradient: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)',
        shadow: 'rgba(217, 119, 6, 0.45)',
        icon: Clock,
        iconBg: '#fef3c7',
        iconColor: '#b45309',
        badgeBg: 'rgba(254, 240, 138, 0.25)',
        badgeColor: '#fef08a'
      };
    case 'interview':
      return {
        title: 'Interview Stage Candidates',
        subtitle: 'Candidates with live interview rounds, scheduled interviews, and panel assessments.',
        gradient: 'linear-gradient(135deg, #4c1d95 0%, #6b21a8 50%, #7e22ce 100%)',
        shadow: 'rgba(147, 51, 234, 0.45)',
        icon: CalendarDays,
        iconBg: '#f3e8ff',
        iconColor: '#7e22ce',
        badgeBg: 'rgba(233, 213, 255, 0.25)',
        badgeColor: '#e9d5ff'
      };
    case 'document':
      return {
        title: 'Document Verification Candidates',
        subtitle: 'Candidates in document collection, KYC verification, and background review stage.',
        gradient: 'linear-gradient(135deg, #164e63 0%, #0e7490 50%, #0891b2 100%)',
        shadow: 'rgba(8, 145, 178, 0.45)',
        icon: FileCheck,
        iconBg: '#cffafe',
        iconColor: '#0e7490',
        badgeBg: 'rgba(207, 250, 254, 0.25)',
        badgeColor: '#a5f3fc'
      };
    case 'selected':
      return {
        title: 'Selected / Joined Candidates',
        subtitle: 'Candidates successfully selected, offered, or joined across banking partners.',
        gradient: 'linear-gradient(135deg, #14532d 0%, #15803d 50%, #16a34a 100%)',
        shadow: 'rgba(22, 163, 74, 0.45)',
        icon: CheckCircle,
        iconBg: '#dcfce7',
        iconColor: '#15803d',
        badgeBg: 'rgba(187, 247, 208, 0.25)',
        badgeColor: '#bbf7d0'
      };
    case 'rejected':
      return {
        title: 'Rejected / Archived Candidates',
        subtitle: 'Applications closed, archived, or marked not interested.',
        gradient: 'linear-gradient(135deg, #881337 0%, #be123c 50%, #e11d48 100%)',
        shadow: 'rgba(225, 29, 72, 0.45)',
        icon: XCircle,
        iconBg: '#fee2e2',
        iconColor: '#b91c1c',
        badgeBg: 'rgba(254, 202, 202, 0.25)',
        badgeColor: '#fca5a5'
      };
    default: // 'all'
      return {
        title: 'All Banking Candidates',
        subtitle: 'Complete talent pipeline across all partner banks and financial institutions.',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
        shadow: 'rgba(37, 99, 235, 0.45)',
        icon: Building2,
        iconBg: '#dbeafe',
        iconColor: '#1d4ed8',
        badgeBg: 'rgba(191, 219, 254, 0.25)',
        badgeColor: '#bfdbfe'
      };
  }
};

// Date filter helpers matching Admin Dashboard
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

export default function ClientDashboard({ API_URL, currentUser, sidebarOpen, setSidebarOpen, isEmbedded = false }) {
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // When selectedBank is null & selectedKpiStatus is null => Shows Bank Cards Overview (Page 1)
  // When selectedBank or selectedKpiStatus is set => Navigates INSIDE that dedicated drill-down page (Page 2)
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedKpiStatus, setSelectedKpiStatus] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const navigateToDetail = (bank = null, kpiStatus = null) => {
    setSelectedBank(bank);
    setSelectedKpiStatus(kpiStatus);
    setStatusFilter(kpiStatus || 'all');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSearchQuery('');

    try {
      const q = bank ? `bank=${encodeURIComponent(bank)}` : `status=${encodeURIComponent(kpiStatus || 'all')}`;
      window.history.pushState({ clientView: 'detail', bank, kpiStatus }, '', `#client-view?${q}`);
    } catch (e) {}
  };

  const navigateBackToOverview = (fromPopState = false) => {
    setSelectedBank(null);
    setSelectedKpiStatus(null);
    setStatusFilter('all');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSearchQuery('');

    if (!fromPopState) {
      if (window.history.state && window.history.state.clientView === 'detail') {
        window.history.back();
      } else {
        try {
          window.history.pushState({ clientView: 'overview' }, '', '#client-dashboard');
        } catch (e) {}
      }
    }
  };

  useEffect(() => {
    const handlePopState = (e) => {
      if (selectedBank || selectedKpiStatus) {
        navigateBackToOverview(true);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedBank, selectedKpiStatus]);

  // Fetch all live data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, compsRes, jobsRes, intsRes] = await Promise.all([
        fetch(`${API_URL}/api/applications`),
        fetch(`${API_URL}/api/companies`),
        fetch(`${API_URL}/api/jobs`),
        fetch(`${API_URL}/api/interviews`)
      ]);

      const [appsData, compsData, jobsData, intsData] = await Promise.all([
        appsRes.json(),
        compsRes.json(),
        jobsRes.json(),
        intsRes.json()
      ]);

      if (Array.isArray(appsData)) setApplications(appsData);
      if (Array.isArray(compsData)) setCompanies(compsData);
      if (Array.isArray(jobsData)) setJobs(jobsData);
      if (Array.isArray(intsData)) setInterviews(intsData);
    } catch (err) {
      console.error('Error fetching data for Client Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter ONLY Banking Applications (Strictly exclude Payment Pending)
  const bankingApplications = useMemo(() => {
    return applications.filter(app => {
      const statusLower = String(app.status || '').toLowerCase().trim();
      if (!statusLower || statusLower.includes('payment pending') || statusLower === 'unpaid' || statusLower.includes('pending payment')) {
        return false;
      }

      const catId = String(app.categoryId || '').toLowerCase();
      const compName = String(app.companyName || '').toLowerCase();
      const jobTitle = String(app.jobTitle || '').toLowerCase();
      
      const isBankCategory = catId === 'cat_banking';
      const isBankCompany = /bank|banking|nbfc|kotak|axis|idfc|hdfc|icici|bandhan|yes bank|mahindra finance|aditya birla|tata aig/i.test(compName);
      const isBankJob = /bank|banking|relationship officer|relationship executive|branch manager|branch|casa|banca/i.test(jobTitle);

      return isBankCategory || isBankCompany || isBankJob;
    });
  }, [applications]);

  // Status classifier helper
  const getAppCategoryStatus = (app) => {
    const s = String(app.status || '').toLowerCase().trim();
    if (['selected', 'l1 selected', 'l2 selected', 'hired', 'converted'].includes(s)) return 'selected';
    if (['rejected', 'not interested'].includes(s)) return 'rejected';
    if (s.includes('interview') || s === 'interview scheduled' || s === 'shortlisted') return 'interview';
    if (s.includes('document') || s === 'document submission' || s === 'document submitted') return 'document';
    return 'processing'; // applied, under review, hr screening, in progress, etc.
  };

  // Overall Banking Metrics
  const bankingStats = useMemo(() => {
    const total = bankingApplications.length;
    let processing = 0;
    let interview = 0;
    let document = 0;
    let selected = 0;
    let rejected = 0;

    bankingApplications.forEach(app => {
      const cat = getAppCategoryStatus(app);
      if (cat === 'selected') selected++;
      else if (cat === 'rejected') rejected++;
      else if (cat === 'interview') interview++;
      else if (cat === 'document') document++;
      else processing++;
    });

    return { total, processing, interview, document, selected, rejected };
  }, [bankingApplications]);

  // Group applications by Bank / Company
  const bankGroups = useMemo(() => {
    const map = {};

    bankingApplications.forEach(app => {
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
          rejected: 0,
          applications: []
        };
      }

      map[bName].totalCount++;
      map[bName].applications.push(app);
      const cat = getAppCategoryStatus(app);
      if (cat === 'selected') map[bName].selected++;
      else if (cat === 'rejected') map[bName].rejected++;
      else if (cat === 'interview') map[bName].interview++;
      else if (cat === 'document') map[bName].document++;
      else map[bName].processing++;
    });

    // Also include known active banking companies
    companies.filter(c => c.categoryId === 'cat_banking').forEach(c => {
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
          rejected: 0,
          applications: []
        };
      }
    });

    return Object.values(map).sort((a, b) => b.totalCount - a.totalCount || a.bankName.localeCompare(b.bankName));
  }, [bankingApplications, companies]);

  // Selected Bank Object & its Candidates
  const selectedBankObj = useMemo(() => {
    if (!selectedBank) return null;
    return bankGroups.find(b => b.bankName.toLowerCase() === selectedBank.toLowerCase()) || null;
  }, [bankGroups, selectedBank]);

  // Base applications for the active view scope (bank + status)
  const scopedApplications = useMemo(() => {
    let list = bankingApplications;

    if (selectedBank) {
      list = list.filter(app => {
        const appBank = getNormalizedBankName(app.companyName);
        return appBank.toLowerCase() === selectedBank.toLowerCase();
      });
    }

    const effectiveStatus = statusFilter !== 'all'
      ? statusFilter
      : (selectedKpiStatus && selectedKpiStatus !== 'all' ? selectedKpiStatus : 'all');

    if (effectiveStatus !== 'all') {
      list = list.filter(app => getAppCategoryStatus(app) === effectiveStatus);
    }

    return list;
  }, [bankingApplications, selectedBank, statusFilter, selectedKpiStatus]);

  // Date filter counts matching admin dashboard
  const todayCount = useMemo(() => scopedApplications.filter(a => isToday(a.appliedAt)).length, [scopedApplications]);
  const yesterdayCount = useMemo(() => scopedApplications.filter(a => isYesterday(a.appliedAt)).length, [scopedApplications]);
  const last7DaysCount = useMemo(() => scopedApplications.filter(a => isLast7Days(a.appliedAt)).length, [scopedApplications]);
  const thisMonthCount = useMemo(() => scopedApplications.filter(a => isThisMonth(a.appliedAt)).length, [scopedApplications]);
  const customCount = useMemo(() => scopedApplications.filter(a => isInCustomDateRange(a.appliedAt, customStartDate, customEndDate)).length, [scopedApplications, customStartDate, customEndDate]);

  const bankCandidates = useMemo(() => {
    if (!selectedBank && !selectedKpiStatus) return [];

    let list = scopedApplications;

    // Apply date filter
    if (dateFilter === 'today') {
      list = list.filter(app => isToday(app.appliedAt));
    } else if (dateFilter === 'yesterday') {
      list = list.filter(app => isYesterday(app.appliedAt));
    } else if (dateFilter === 'last7') {
      list = list.filter(app => isLast7Days(app.appliedAt));
    } else if (dateFilter === 'thisMonth') {
      list = list.filter(app => isThisMonth(app.appliedAt));
    } else if (dateFilter === 'custom' && (customStartDate || customEndDate)) {
      list = list.filter(app => isInCustomDateRange(app.appliedAt, customStartDate, customEndDate));
    }

    // Search query inside candidate name, mobile, email, application number, job role, bank name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(app =>
        String(app.candidateName || '').toLowerCase().includes(q) ||
        String(app.candidateMobile || '').toLowerCase().includes(q) ||
        String(app.candidateEmail || '').toLowerCase().includes(q) ||
        String(app.applicationNumber || '').toLowerCase().includes(q) ||
        String(app.jobTitle || '').toLowerCase().includes(q) ||
        String(app.companyName || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [scopedApplications, selectedBank, selectedKpiStatus, dateFilter, customStartDate, customEndDate, searchQuery]);

  // Export to CSV
  const exportToCSV = (scope = null) => {
    const listToExport = scope ? bankCandidates : bankingApplications;

    if (!listToExport.length) {
      alert('No applications available to export.');
      return;
    }

    const headers = ['App ID', 'Candidate Name', 'Mobile', 'Email', 'City', 'Bank / Company', 'Job Role', 'Status', 'Applied Date'];
    const rows = listToExport.map(app => [
      `"${app.applicationNumber || app.id || ''}"`,
      `"${app.candidateName || ''}"`,
      `"${app.candidateMobile || ''}"`,
      `"${app.candidateEmail || ''}"`,
      `"${app.candidateLocation || ''}"`,
      `"${app.companyName || ''}"`,
      `"${app.jobTitle || ''}"`,
      `"${app.status || 'Applied'}"`,
      `"${app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN') : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${bankName ? bankName.replace(/\s+/g, '_') : 'Banking'}_Candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase().trim();
    if (['selected', 'l1 selected', 'l2 selected', 'hired', 'converted'].includes(s)) {
      return (
        <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
          <CheckCircle size={13} /> {status}
        </span>
      );
    }
    if (s.includes('interview') || s === 'shortlisted') {
      return (
        <span style={{ background: '#f3e8ff', color: '#7e22ce', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
          <CalendarDays size={13} /> {status}
        </span>
      );
    }
    if (s.includes('document')) {
      return (
        <span style={{ background: '#cffafe', color: '#0e7490', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
          <FileCheck size={13} /> {status}
        </span>
      );
    }
    if (['rejected', 'not interested'].includes(s)) {
      return (
        <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
          <XCircle size={13} /> {status}
        </span>
      );
    }
    return (
      <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
        <Clock size={13} /> {status || 'Processing'}
      </span>
    );
  };

  const renderClientSidebar = () => {
    if (!sidebarOpen) return null;

    const banksList = Object.values(bankGroups);

    return (
      <>
        {/* Mobile Backdrop */}
        <div
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 9998,
            transition: 'opacity 0.2s'
          }}
        />

        {/* Slide-out Sidebar Drawer */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '280px',
            maxWidth: '85vw',
            background: '#0f172a',
            color: '#94a3b8',
            boxShadow: '-6px 0 24px rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '1.25rem 1rem',
            animation: 'slideInRight 0.25s ease-out'
          }}
        >
          {/* Header with Close Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f59e0b', fontWeight: 800 }}>
                Corporate Portal
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                {currentUser?.name || 'Client Partner'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                All Banking Sectors
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen && setSidebarOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#cbd5e1',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <XCircle size={18} />
            </button>
          </div>

          {/* Quick Nav Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              onClick={() => {
                navigateBackToOverview();
                setSidebarOpen && setSidebarOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                background: (selectedBank === null && selectedKpiStatus === null) ? '#2563eb' : 'rgba(255,255,255,0.04)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Building2 size={18} />
              <span>All Banks Overview</span>
            </button>

            {/* Stages Section */}
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em', marginTop: '14px', marginBottom: '4px', paddingLeft: '4px' }}>
              Candidate Stages
            </div>

            <button
              type="button"
              onClick={() => {
                navigateToDetail(null, 'processing');
                setSidebarOpen && setSidebarOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '8px',
                background: selectedKpiStatus === 'processing' ? 'rgba(217, 119, 6, 0.25)' : 'transparent',
                color: '#fef08a',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: 600
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} /> <span>Processing</span>
              </div>
              <span style={{ background: 'rgba(234, 179, 8, 0.25)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                {bankingStats.processing}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigateToDetail(null, 'interview');
                setSidebarOpen && setSidebarOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '8px',
                background: selectedKpiStatus === 'interview' ? 'rgba(126, 34, 206, 0.25)' : 'transparent',
                color: '#e9d5ff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: 600
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={16} /> <span>Interviews</span>
              </div>
              <span style={{ background: 'rgba(168, 85, 247, 0.25)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                {bankingStats.interview}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigateToDetail(null, 'document');
                setSidebarOpen && setSidebarOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '8px',
                background: selectedKpiStatus === 'document' ? 'rgba(8, 145, 178, 0.25)' : 'transparent',
                color: '#a5f3fc',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: 600
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={16} /> <span>Documents</span>
              </div>
              <span style={{ background: 'rgba(6, 182, 212, 0.25)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                {bankingStats.document}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigateToDetail(null, 'selected');
                setSidebarOpen && setSidebarOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '8px',
                background: selectedKpiStatus === 'selected' ? 'rgba(22, 163, 74, 0.25)' : 'transparent',
                color: '#bbf7d0',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: 600
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> <span>Selected</span>
              </div>
              <span style={{ background: 'rgba(34, 197, 94, 0.25)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                {bankingStats.selected}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigateToDetail(null, 'rejected');
                setSidebarOpen && setSidebarOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '8px',
                background: selectedKpiStatus === 'rejected' ? 'rgba(225, 29, 72, 0.25)' : 'transparent',
                color: '#fca5a5',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: 600
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle size={16} /> <span>Rejected</span>
              </div>
              <span style={{ background: 'rgba(239, 68, 68, 0.25)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                {bankingStats.rejected}
              </span>
            </button>

            {/* Banks List Section */}
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em', marginTop: '14px', marginBottom: '4px', paddingLeft: '4px' }}>
              Partner Banks ({banksList.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '200px', overflowY: 'auto' }}>
              {banksList.map(b => (
                <button
                  key={b.bankName}
                  type="button"
                  onClick={() => {
                    navigateToDetail(b.bankName, null);
                    setSidebarOpen && setSidebarOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: selectedBank === b.bankName ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                    color: selectedBank === b.bankName ? '#60a5fa' : '#cbd5e1',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                    {b.bankName}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>
                    {b.totalCount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                fetchData();
                setSidebarOpen && setSidebarOpen(false);
              }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', color: '#93c5fd', background: 'rgba(59,130,246,0.15)', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
            >
              <RefreshCw size={15} /> Refresh Stats
            </button>
            <button
              type="button"
              onClick={() => {
                exportToCSV(selectedBank || selectedKpiStatus);
                setSidebarOpen && setSidebarOpen(false);
              }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', color: '#86efac', background: 'rgba(34,197,94,0.15)', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
            >
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>
      </>
    );
  };

  // ==========================================
  // VIEW 2: INSIDE SPECIFIC BANK OR KPI STATUS PAGE ("Ulla Pokanum")
  // ==========================================
  if (selectedBank || selectedKpiStatus) {
    const kpiCfg = getKpiBannerConfig(selectedKpiStatus || 'all');
    const KpiIcon = kpiCfg.icon;

    return (
      <div className="client-dashboard-wrap" style={{ padding: isEmbedded ? '0' : '1.5rem' }}>
        {renderClientSidebar()}
        {/* Navigation Breadcrumb / Back Header (Desktop) */}
        <div className="client-top-nav-actions" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '1.25rem'
        }}>
          <button
            className="client-back-btn"
            onClick={() => navigateBackToOverview()}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
              transition: 'transform 0.2s'
            }}
          >
            <ArrowLeft size={18} /> Back to Overview
          </button>

          <button
            onClick={() => exportToCSV(selectedBank || selectedKpiStatus)}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        {/* Dynamic Detail Banner: Bank Banner OR KPI Status Banner */}
        {selectedBank ? (
          <div className="client-banner" style={{
            background: getBankBrandGradient(selectedBank),
            color: '#ffffff',
            padding: '1.75rem 2rem',
            borderRadius: '18px',
            boxShadow: `0 12px 32px ${getBankShadowColor(selectedBank)}`,
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden',
            border: '1.5px solid rgba(255, 255, 255, 0.2)'
          }}>
            {/* Decorative Radial Lights */}
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-30px', left: '40px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div className="client-bank-header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
              <button
                type="button"
                className="client-mobile-back-icon"
                onClick={() => navigateBackToOverview()}
                title="Back to Overview"
              >
                <ArrowLeft size={18} />
              </button>
              <img
                src={selectedBankObj?.logo || '/logo.png'}
                alt={selectedBank}
                onError={e => { e.currentTarget.src = '/logo.png'; }}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '14px',
                  objectFit: 'contain',
                  background: '#ffffff',
                  padding: '6px',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  flexShrink: 0
                }}
              />
              <div className="client-bank-title-wrap">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.85rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                    {selectedBank}
                  </h1>
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.22)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    backdropFilter: 'blur(4px)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap'
                  }}>
                    {bankCandidates.length} Candidates
                  </span>
                  <button
                    type="button"
                    className="client-mobile-export-btn"
                    onClick={() => exportToCSV(selectedBank || selectedKpiStatus)}
                    title="Export CSV"
                  >
                    <Download size={13} /> Export CSV
                  </button>
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                  Candidate pipeline & status for {selectedBank}.
                </p>
              </div>
            </div>

            {/* Quick Bank Stats Chips */}
            {selectedBankObj && (
              <div className="client-bank-chips-grid" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                <div onClick={() => setStatusFilter('processing')} style={{ background: 'rgba(254, 240, 138, 0.22)', border: '1px solid rgba(254, 240, 138, 0.4)', padding: '8px 14px', borderRadius: '10px', textAlign: 'center', backdropFilter: 'blur(4px)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fef08a' }}>{selectedBankObj.processing}</div>
                  <div style={{ fontSize: '0.72rem', color: '#fef9c3', fontWeight: 600 }}>Processing</div>
                </div>
                <div onClick={() => setStatusFilter('interview')} style={{ background: 'rgba(233, 213, 255, 0.22)', border: '1px solid rgba(233, 213, 255, 0.4)', padding: '8px 14px', borderRadius: '10px', textAlign: 'center', backdropFilter: 'blur(4px)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e9d5ff' }}>{selectedBankObj.interview}</div>
                  <div style={{ fontSize: '0.72rem', color: '#f3e8ff', fontWeight: 600 }}>Interview</div>
                </div>
                <div onClick={() => setStatusFilter('document')} style={{ background: 'rgba(207, 250, 254, 0.22)', border: '1px solid rgba(207, 250, 254, 0.4)', padding: '8px 14px', borderRadius: '10px', textAlign: 'center', backdropFilter: 'blur(4px)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a5f3fc' }}>{selectedBankObj.document}</div>
                  <div style={{ fontSize: '0.72rem', color: '#cffafe', fontWeight: 600 }}>Document</div>
                </div>
                <div onClick={() => setStatusFilter('selected')} style={{ background: 'rgba(187, 247, 208, 0.25)', border: '1px solid rgba(187, 247, 208, 0.45)', padding: '8px 14px', borderRadius: '10px', textAlign: 'center', backdropFilter: 'blur(4px)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#bbf7d0' }}>{selectedBankObj.selected}</div>
                  <div style={{ fontSize: '0.72rem', color: '#dcfce7', fontWeight: 600 }}>Selected</div>
                </div>
                <div onClick={() => setStatusFilter('rejected')} style={{ background: 'rgba(254, 202, 202, 0.2)', border: '1px solid rgba(254, 202, 202, 0.4)', padding: '8px 14px', borderRadius: '10px', textAlign: 'center', backdropFilter: 'blur(4px)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fca5a5' }}>{selectedBankObj.rejected}</div>
                  <div style={{ fontSize: '0.72rem', color: '#fee2e2', fontWeight: 600 }}>Rejected</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="client-banner" style={{
            background: kpiCfg.gradient,
            color: '#ffffff',
            padding: '1.75rem 2rem',
            borderRadius: '18px',
            boxShadow: `0 12px 32px ${kpiCfg.shadow}`,
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden',
            border: '1.5px solid rgba(255, 255, 255, 0.2)'
          }}>
            {/* Decorative Radial Lights */}
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-30px', left: '40px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div className="client-bank-header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
              <button
                type="button"
                className="client-mobile-back-icon"
                onClick={() => navigateBackToOverview()}
                title="Back to Overview"
              >
                <ArrowLeft size={18} />
              </button>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '14px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                color: kpiCfg.iconColor,
                flexShrink: 0
              }}>
                <KpiIcon size={30} />
              </div>
              <div className="client-bank-title-wrap">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.85rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                    {kpiCfg.title}
                  </h1>
                  <span style={{
                    background: kpiCfg.badgeBg,
                    color: kpiCfg.badgeColor,
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    backdropFilter: 'blur(4px)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap'
                  }}>
                    {bankCandidates.length} Candidates
                  </span>
                  <button
                    type="button"
                    className="client-mobile-export-btn"
                    onClick={() => exportToCSV(selectedBank || selectedKpiStatus)}
                    title="Export CSV"
                  >
                    <Download size={13} /> Export CSV
                  </button>
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                  {kpiCfg.subtitle}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="client-filter-box" style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          {/* Header Row: Title & Total Count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Applicants List
            </span>
            <span style={{
              background: '#eff6ff',
              color: '#2563eb',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.85rem'
            }}>
              {bankCandidates.length}
            </span>
          </div>

          {/* Date Filter Pills (Matching Admin Portal) */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            paddingBottom: '6px',
            marginBottom: '1rem',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none'
          }}>
            <button
              type="button"
              onClick={() => setDateFilter('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                flexShrink: 0,
                background: dateFilter === 'all' ? '#2563eb' : '#f1f5f9',
                color: dateFilter === 'all' ? '#ffffff' : '#475569',
                transition: 'all 0.2s',
                boxShadow: dateFilter === 'all' ? '0 3px 8px rgba(37, 99, 235, 0.25)' : 'none'
              }}
            >
              All ({scopedApplications.length})
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('today')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                flexShrink: 0,
                background: dateFilter === 'today' ? '#059669' : '#ecfdf5',
                color: dateFilter === 'today' ? '#ffffff' : '#047857',
                transition: 'all 0.2s',
                boxShadow: dateFilter === 'today' ? '0 3px 8px rgba(5, 150, 105, 0.25)' : 'none'
              }}
            >
              Today ({todayCount})
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('yesterday')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                flexShrink: 0,
                background: dateFilter === 'yesterday' ? '#d97706' : '#fffbeb',
                color: dateFilter === 'yesterday' ? '#ffffff' : '#b45309',
                transition: 'all 0.2s',
                boxShadow: dateFilter === 'yesterday' ? '0 3px 8px rgba(217, 119, 6, 0.25)' : 'none'
              }}
            >
              Yesterday ({yesterdayCount})
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('last7')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                flexShrink: 0,
                background: dateFilter === 'last7' ? '#7c3aed' : '#f5f3ff',
                color: dateFilter === 'last7' ? '#ffffff' : '#6d28d9',
                transition: 'all 0.2s',
                boxShadow: dateFilter === 'last7' ? '0 3px 8px rgba(124, 58, 237, 0.25)' : 'none'
              }}
            >
              Last 7D ({last7DaysCount})
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('thisMonth')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                flexShrink: 0,
                background: dateFilter === 'thisMonth' ? '#0891b2' : '#ecfeff',
                color: dateFilter === 'thisMonth' ? '#ffffff' : '#0e7490',
                transition: 'all 0.2s',
                boxShadow: dateFilter === 'thisMonth' ? '0 3px 8px rgba(8, 145, 178, 0.25)' : 'none'
              }}
            >
              This Month ({thisMonthCount})
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('custom')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                flexShrink: 0,
                background: dateFilter === 'custom' ? '#0284c7' : '#f0f9ff',
                color: dateFilter === 'custom' ? '#ffffff' : '#0369a1',
                transition: 'all 0.2s',
                boxShadow: dateFilter === 'custom' ? '0 3px 8px rgba(2, 132, 199, 0.25)' : 'none'
              }}
            >
              Custom Range {dateFilter === 'custom' && (customStartDate || customEndDate) ? `(${customCount})` : ''}
            </button>
          </div>

          {/* Custom Date Range Picker */}
          {dateFilter === 'custom' && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1' }}>
                📅 Statement Date Range:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: '#64748b' }}>From:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: '#64748b' }}>To:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
              </div>
              {(customStartDate || customEndDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          )}

          <div className="client-filter-controls" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
              {/* Search Box */}
              <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search name, mobile, role..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Bank Filter Dropdown */}
              <select
                value={selectedBank || 'all'}
                onChange={e => setSelectedBank(e.target.value === 'all' ? null : e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  color: '#334155',
                  background: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer',
                  flex: '1 1 200px'
                }}
              >
                <option value="all">🏦 All Banking Partners</option>
                {bankGroups.map(b => (
                  <option key={b.bankName} value={b.bankName}>
                    {b.bankName} ({b.totalCount})
                  </option>
                ))}
              </select>

              {/* Status Filter Dropdown */}
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  if (selectedKpiStatus) setSelectedKpiStatus(e.target.value);
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  color: '#334155',
                  background: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer',
                  flex: '1 1 180px'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="processing">Processing</option>
                <option value="interview">Interview Scheduled</option>
                <option value="document">Document Submission</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table / Cards content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#3b82f6' }} />
              <p>Loading candidates...</p>
            </div>
          ) : bankCandidates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <Users size={40} style={{ margin: '0 auto 12px auto', color: '#cbd5e1' }} />
              <h4 style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '6px' }}>No Candidates Found</h4>
              <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                No applications match this filter for {selectedBank}.
              </p>
              {(statusFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}
                  style={{
                    marginTop: '1rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW (Screens >= 768px) */}
              <div className="client-desktop-table" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>APP ID</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Candidate Name</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Contact Info</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Bank & Role</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Applied Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankCandidates.map((app, idx) => {
                      const candidateInterviews = interviews.filter(i =>
                        (i.applicationId && String(i.applicationId) === String(app.id)) ||
                        (i.candidateId && String(i.candidateId) === String(app.candidateId))
                      );
                      const latestInt = candidateInterviews[candidateInterviews.length - 1];

                      return (
                        <tr
                          key={app.id || idx}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#3b82f6', whiteSpace: 'nowrap' }}>
                            {app.applicationNumber || `#APP-${String(app.id).slice(-4)}`}
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>
                              {app.candidateName || 'Anonymous Candidate'}
                            </div>
                            {app.candidateQualification && (
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {app.candidateQualification}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '14px 16px', color: '#334155' }}>
                            <div>{app.candidateMobile || 'No Mobile'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {app.candidateLocation || app.candidateEmail || 'N/A'}
                            </div>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 700, color: '#1e293b' }}>{app.companyName || selectedBank}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              {app.jobTitle || 'Banking Executive'}
                            </div>
                          </td>

                          <td style={{ padding: '14px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>
                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }) : 'N/A'}
                          </td>

                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            {getStatusBadge(app.status)}
                            {latestInt && (
                              <div style={{ fontSize: '0.72rem', color: '#7e22ce', marginTop: '4px', fontWeight: 600 }}>
                                🗓 {latestInt.round || 'Round 1'} ({latestInt.interviewDate || 'Scheduled'})
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            {app.candidateResumeUrl ? (
                              <a
                                href={app.candidateResumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  background: '#eff6ff',
                                  color: '#2563eb',
                                  border: '1px solid #bfdbfe',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <ExternalLink size={12} /> Resume
                              </a>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No Resume</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW (Screens < 768px) */}
              <div className="client-mobile-cards">
                {bankCandidates.map((app, idx) => {
                  const candidateInterviews = interviews.filter(i =>
                    (i.applicationId && String(i.applicationId) === String(app.id)) ||
                    (i.candidateId && String(i.candidateId) === String(app.candidateId))
                  );
                  const latestInt = candidateInterviews[candidateInterviews.length - 1];

                  return (
                    <div
                      key={app.id || idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '14px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      {/* Top Row: App ID + Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.875rem' }}>
                          {app.applicationNumber || `#APP-${String(app.id).slice(-4)}`}
                        </span>
                        {getStatusBadge(app.status)}
                      </div>

                      {/* Candidate Name & Info */}
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                          {app.candidateName || 'Anonymous Candidate'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                          📱 {app.candidateMobile || 'No Mobile'} {app.candidateLocation ? `· 📍 ${app.candidateLocation}` : ''}
                        </div>
                      </div>

                      {/* Role */}
                      <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.875rem' }}>
                          {app.jobTitle || 'Banking Executive'}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                          {app.companyName || selectedBank}
                        </div>
                      </div>

                      {/* Interview if any */}
                      {latestInt && (
                        <div style={{ fontSize: '0.75rem', color: '#7e22ce', background: '#faf5ff', padding: '6px 10px', borderRadius: '6px', fontWeight: 600 }}>
                          🗓 Interview: {latestInt.round || 'Round 1'} ({latestInt.interviewDate || 'Scheduled'})
                        </div>
                      )}

                      {/* Footer Row: Date + Resume */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                        {app.candidateResumeUrl ? (
                          <a
                            href={app.candidateResumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <ExternalLink size={13} /> Resume
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No Resume</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: MAIN BANKS OVERVIEW (PAGE 1)
  // ==========================================
  return (
    <div className="client-dashboard-wrap" style={{ padding: isEmbedded ? '0' : '1.5rem' }}>
      {renderClientSidebar()}
      {/* Header Banner */}
      <div className="client-banner" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        padding: '1.75rem 2rem',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            padding: '14px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            flexShrink: 0
          }}>
            <Building2 size={32} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                Client Dashboard
              </h1>
              <span style={{
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Banking Sector
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '6px 0 0 0' }}>
              Click any Bank below to enter its applicant pipeline and review candidate statuses.
            </p>
          </div>
        </div>

        <div className="client-top-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={fetchData}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '10px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>

          <button
            onClick={() => exportToCSV(null)}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Top Banking KPI Cards - Themed with vibrant colors & clickable! */}
      <div className="client-kpi-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '2rem'
      }}>
        {[
          {
            id: 'total',
            title: 'Total Banking Apps',
            value: bankingStats.total,
            sublabel: 'All Openings',
            icon: Building2,
            gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderColor: '#93c5fd',
            shadowColor: 'rgba(37, 99, 235, 0.15)',
            hoverShadow: '0 12px 24px rgba(37, 99, 235, 0.25)',
            titleColor: '#1e40af',
            valueColor: '#1d4ed8',
            sublabelColor: '#2563eb',
            iconBg: '#2563eb',
            iconColor: '#ffffff',
            statusTarget: 'all'
          },
          {
            id: 'processing',
            title: 'Processing',
            value: bankingStats.processing,
            sublabel: 'Screening stage',
            icon: Clock,
            gradient: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
            borderColor: '#fde047',
            shadowColor: 'rgba(202, 138, 4, 0.15)',
            hoverShadow: '0 12px 24px rgba(202, 138, 4, 0.25)',
            titleColor: '#854d0e',
            valueColor: '#854d0e',
            sublabelColor: '#a16207',
            iconBg: '#ca8a04',
            iconColor: '#ffffff',
            statusTarget: 'processing'
          },
          {
            id: 'interviews',
            title: 'Interviews',
            value: bankingStats.interview,
            sublabel: 'Live rounds',
            icon: CalendarDays,
            gradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
            borderColor: '#d8b4fe',
            shadowColor: 'rgba(147, 51, 234, 0.15)',
            hoverShadow: '0 12px 24px rgba(147, 51, 234, 0.25)',
            titleColor: '#6b21a8',
            valueColor: '#6b21a8',
            sublabelColor: '#7e22ce',
            iconBg: '#9333ea',
            iconColor: '#ffffff',
            statusTarget: 'interview'
          },
          {
            id: 'documents',
            title: 'Documents',
            value: bankingStats.document,
            sublabel: 'Verification',
            icon: FileCheck,
            gradient: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
            borderColor: '#67e8f9',
            shadowColor: 'rgba(8, 145, 178, 0.15)',
            hoverShadow: '0 12px 24px rgba(8, 145, 178, 0.25)',
            titleColor: '#155e75',
            valueColor: '#155e75',
            sublabelColor: '#0e7490',
            iconBg: '#0891b2',
            iconColor: '#ffffff',
            statusTarget: 'document'
          },
          {
            id: 'selected',
            title: 'Selected',
            value: bankingStats.selected,
            sublabel: 'Offered / Joined',
            icon: CheckCircle,
            gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderColor: '#86efac',
            shadowColor: 'rgba(22, 163, 74, 0.15)',
            hoverShadow: '0 12px 24px rgba(22, 163, 74, 0.25)',
            titleColor: '#166534',
            valueColor: '#166534',
            sublabelColor: '#15803d',
            iconBg: '#16a34a',
            iconColor: '#ffffff',
            statusTarget: 'selected'
          },
          {
            id: 'rejected',
            title: 'Rejected',
            value: bankingStats.rejected,
            sublabel: 'Archived',
            icon: XCircle,
            gradient: 'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)',
            borderColor: '#fca5a5',
            shadowColor: 'rgba(225, 29, 72, 0.15)',
            hoverShadow: '0 12px 24px rgba(225, 29, 72, 0.25)',
            titleColor: '#991b1b',
            valueColor: '#991b1b',
            sublabelColor: '#be123c',
            iconBg: '#e11d48',
            iconColor: '#ffffff',
            statusTarget: 'rejected'
          }
        ].map(card => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              className="client-kpi-card"
              onClick={() => {
                if (card.statusTarget) {
                  navigateToDetail(null, card.statusTarget);
                }
              }}
              style={{
                background: card.gradient,
                border: `1.5px solid ${card.borderColor}`,
                borderRadius: '16px',
                padding: '1.25rem',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: `0 4px 14px ${card.shadowColor}`
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = card.hoverShadow;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = `0 4px 14px ${card.shadowColor}`;
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="kpi-title" style={{ fontSize: '0.875rem', fontWeight: 700, color: card.titleColor }}>
                  {card.title}
                </span>
                <div style={{
                  background: card.iconBg,
                  color: card.iconColor,
                  padding: '7px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 3px 8px ${card.shadowColor}`
                }}>
                  <IconComponent size={16} />
                </div>
              </div>

              <div className="kpi-num" style={{ fontSize: '1.95rem', fontWeight: 800, color: card.valueColor, lineHeight: 1.15 }}>
                {card.value}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '0.76rem', color: card.sublabelColor, fontWeight: 700 }}>
                  {card.sublabel}
                </span>
                <span style={{ fontSize: '0.72rem', color: card.sublabelColor, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  View <ChevronRight size={12} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section: Banks List Grid (Themed with brand logo colors like 2nd image!) */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            🏦 Select a Bank to View Candidates
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
            Click on any bank card below to open its dedicated page and view all applicant details.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '16px'
        }}>
          {bankGroups.map(bank => {
            const gradientBg = getBankBrandGradient(bank.bankName);
            const shadowClr = getBankShadowColor(bank.bankName);

            return (
              <div
                key={bank.bankName}
                onClick={() => {
                  navigateToDetail(bank.bankName, null);
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
  );
}
