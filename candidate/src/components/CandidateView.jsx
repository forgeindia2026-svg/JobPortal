import React, { useState, useEffect } from 'react';
import {
  MapPin, Briefcase, Building2, ChevronRight, Sparkles, ArrowLeft, Search,
  Code, TrendingUp, Headphones, Award, X, Wallet, User, Clock, Banknote, IndianRupee, ShieldCheck, CheckCircle2, Layers
} from 'lucide-react';
import JobDetailModal from './JobDetailModal';
import ApplicationModal from './ApplicationModal';
import CandidateDashboard from './CandidateDashboard';

const FALLBACK_CATEGORIES = [
  {
    id: 'cat_banking',
    name: 'Banking & Financial Services',
    description: 'Premier positions in retail banking, NBFCs, microfinance, wealth management, and insurance.',
    icon: 'Building2',
    status: 'Active'
  },
  {
    id: 'cat_it',
    name: 'IT & Software Development',
    description: 'Software engineering, cloud infrastructure, QA testing, UI/UX, and data analytics.',
    icon: 'Code',
    status: 'Active'
  },
  {
    id: 'cat_sales',
    name: 'Sales & Marketing',
    description: 'Business development, direct sales, field marketing, and digital marketing.',
    icon: 'TrendingUp',
    status: 'Active'
  },
  {
    id: 'cat_bpo',
    name: 'BPO & Customer Support',
    description: 'Inbound/outbound customer support, telesales, and technical desk operations.',
    icon: 'Headphones',
    status: 'Active'
  },
  {
    id: 'cat_nonit',
    name: 'Non-IT & Operations',
    description: 'Back-office administration, logistics, HR operations, and store management.',
    icon: 'Briefcase',
    status: 'Active'
  }
];

const FALLBACK_COMPANIES = [
  {
    id: 'comp_axis',
    categoryId: 'cat_banking',
    name: 'Axis Bank',
    logo: '/logos/axis_bank.svg',
    description: 'Leading private sector bank in India offering retail, corporate, and international banking services.',
    website: 'https://www.axisbank.com'
  },
  {
    id: 'comp_idfc',
    categoryId: 'cat_banking',
    name: 'IDFC First Bank',
    logo: '/logos/idfc_first_bank.svg',
    description: 'Tech-first Indian bank providing innovative banking products and customer-centric financial solutions.',
    website: 'https://www.idfcfirstbank.com'
  },
  {
    id: 'comp_kotak',
    categoryId: 'cat_banking',
    name: 'Kotak Mahindra Bank',
    logo: '/logos/kotak_bank.png',
    description: 'Full-service commercial bank delivering personal, corporate, and investment banking solutions.',
    website: 'https://www.kotak.com'
  },
  {
    id: 'comp_bandhan',
    categoryId: 'cat_banking',
    name: 'Bandhan Bank',
    logo: '/logos/bandhan_bank.png',
    description: 'Fast-growing universal bank focused on inclusive banking and microfinance across India.',
    website: 'https://www.bandhanbank.com'
  },
  {
    id: 'comp_birla',
    categoryId: 'cat_banking',
    name: 'Aditya Birla Capital',
    logo: '/logos/aditya_birla.jpg',
    description: 'Financial services umbrella brand for Aditya Birla Group businesses.',
    website: 'https://www.adityabirlacapital.com'
  },
  {
    id: 'comp_mahindra_fin',
    categoryId: 'cat_banking',
    name: 'Mahindra Finance',
    logo: '/logos/mahindra_finance.svg',
    description: 'Leading Non-Banking Financial Company (NBFC) in India specializing in rural and semi-urban financial services.',
    website: 'https://www.mahindrafinance.com'
  },
  {
    id: 'comp_techm',
    categoryId: 'cat_it',
    name: 'Tech Mahindra',
    logo: '/logos/tech_mahindra.svg',
    description: 'Global IT services provider offering digital transformation and consulting.',
    website: 'https://www.techmahindra.com'
  }
];

const FALLBACK_JOBS = [
  {
    id: 'job_axis_am',
    title: 'Assistance Manager',
    companyId: 'comp_axis',
    companyName: 'Axis Bank',
    companyLogo: '/logos/axis_bank.svg',
    categoryId: 'cat_banking',
    categoryName: 'Banking & Financial Services',
    location: 'Chennai / Coimbatore / Madurai',
    salary: '₹3.5 LPA - ₹5.0 LPA',
    jobType: 'Full Time',
    qualification: 'Any Graduate / Postgraduate',
    experience: '0 - 2 Years',
    ageLimit: '18 - 28 Years',
    trainingPeriod: 'Phase 1: 15 Days (Classroom Training) / Phase 2: 15 Days (On Job Training - OJT)',
    description: 'Responsible for driving retail banking operations, customer onboarding, and branch financial services.',
    status: 'Active'
  },
  {
    id: 'job_mahindra_so',
    title: 'Sales Officer - Rural Finance',
    companyId: 'comp_mahindra_fin',
    companyName: 'Mahindra Finance',
    companyLogo: '/logos/mahindra_finance.svg',
    categoryId: 'cat_banking',
    categoryName: 'Banking & Financial Services',
    location: 'Trichy / Salem / Vellore',
    salary: '₹3.0 LPA - ₹4.5 LPA',
    jobType: 'Full Time',
    qualification: 'Graduate in any discipline',
    experience: '0 - 3 Years',
    ageLimit: '20 - 29 Years',
    trainingPeriod: 'Phase 1: 10 Days Training / Phase 2: 10 Days Field Immersion',
    description: 'Handle vehicle financing, tractor loans, and rural customer relationship management.',
    status: 'Active'
  }
];

export default function CandidateView({ API_URL, currentUser }) {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'my_apps'
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [companies, setCompanies] = useState(FALLBACK_COMPANIES);
  const [jobs, setJobs] = useState(FALLBACK_JOBS);
  const [selectedCategory, setSelectedCategory] = useState(FALLBACK_CATEGORIES[0]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [viewingJob, setViewingJob] = useState(null);
  const [applyingJob, setApplyingJob] = useState(null);
  const [userApplications, setUserApplications] = useState([]);

  // FIC Training dedicated view state ('bank_selection', 'fic_details', 'it_training', or null)
  const [ficView, setFicView] = useState(null); // 'bank_selection', 'it_training'
  const [selectedFicBank, setSelectedFicBank] = useState(null);
  const [itProcesses, setItProcesses] = useState([]);
  const [selectedItProcessId, setSelectedItProcessId] = useState(null);
  const [selectedItCategory, setSelectedItCategory] = useState('Placement'); // 'Placement', 'Course', 'Internship'

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Scroll to top when views change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [ficView, selectedCompany, viewingJob]);

  // Handle mobile hardware back button and page navigation
  useEffect(() => {
    const handlePopState = (e) => {
      const state = e.state;
      if (viewingJob) {
        if (!state || (state.page !== 'job_details' && !state.subView)) {
          setViewingJob(null);
        }
      } else if (ficView) {
        if (!state || (state.page !== 'fic_banks' && state.page !== 'fic_details' && state.page !== 'it_training')) {
          setFicView(null);
        }
      } else if (selectedCompany) {
        if (!state || state.page !== 'company') {
          setSelectedCompany(null);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [viewingJob, selectedCompany, ficView]);

  const handleOpenFicBankSelection = () => {
    window.history.pushState({ page: 'fic_banks' }, '');
    setFicView('bank_selection');
  };

  const handleOpenItTraining = (category = 'Placement') => {
    setSelectedItCategory(category);
    window.history.pushState({ page: 'it_training' }, '');
    setFicView('it_training');
    if (itProcesses.length > 0 && !selectedItProcessId) {
      setSelectedItProcessId(itProcesses[0].id);
    }
  };

  const handleOpenFicBankDetails = (comp) => {
    window.history.pushState({ page: 'fic_details' }, '');
    setSelectedFicBank(comp);
    setFicView('fic_details');
  };

  const handleCompanyClick = (comp) => {
    window.history.pushState({ page: 'company' }, '');
    setSelectedCompany(comp);
  };

  const handleViewJobDetails = (job) => {
    window.history.pushState({ page: 'job_details' }, '');
    setViewingJob(job);
  };

  const handleBackFromJobDetails = () => {
    if (window.history.state && window.history.state.page === 'job_details') {
      window.history.back();
    } else {
      setViewingJob(null);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [catRes, compRes, jobsRes, itRes] = await Promise.all([
        fetch(`${API_URL}/api/categories`),
        fetch(`${API_URL}/api/companies`),
        fetch(`${API_URL}/api/jobs`),
        fetch(`${API_URL}/api/it-training-processes`)
      ]);

      if (catRes.ok && compRes.ok && jobsRes.ok) {
        const cats = await catRes.json();
        const comps = await compRes.json();
        const jbs = await jobsRes.json();

        const catList = Array.isArray(cats) && cats.length > 0 ? cats : FALLBACK_CATEGORIES;
        const compList = Array.isArray(comps) && comps.length > 0 ? comps : FALLBACK_COMPANIES;
        const jobList = Array.isArray(jbs) && jbs.length > 0 ? jbs : FALLBACK_JOBS;

        setCategories(catList);
        setCompanies(compList);
        setJobs(jobList);

        const bankingCat = catList.find(c =>
          c.id === 'cat_banking' ||
          (c.name || '').toLowerCase().includes('banking')
        ) || catList[0];
        if (bankingCat) {
          setSelectedCategory(bankingCat);
        }
      }

      if (itRes && itRes.ok) {
        const itData = await itRes.json();
        if (Array.isArray(itData)) {
          setItProcesses(itData);
          if (itData.length > 0) {
            setSelectedItProcessId(itData[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Error loading candidate data:', err);
    }
  };

  const convertItProcToJob = (proc, processList = null) => ({
    id: proc.id,
    title: proc.role || 'Software Engineer Trainee',
    companyName: 'FIC IT Training & Placement',
    companyLogo: '/logo.png',
    categoryName: 'IT & Software Development',
    categoryId: 'cat_it',
    itCategory: proc.itCategory || 'Placement',
    programName: `${proc.processName}: ${proc.programTitle || 'FIC IT Training & 100% Placement Programme'}`,
    salary: proc.salary || '4.0 LPA + Incentives',
    experience: 'Fresher & Experience',
    location: proc.location || 'PAN INDIA',
    trainingPeriod: proc.trainingPeriod || '6 Months',
    trainingTitle: proc.trainingPeriod || '6 Months',
    trainingSubtext: proc.trainingSubtext || '3 Months Classroom Training | 3 Months Real Project Training',
    stipend: `STIPEND ₹${proc.stipend || '12,000'}`,
    stipendTitle: `STIPEND ₹${proc.stipend || '12,000'}`,
    stipendSubtext: proc.stipendSubtext || `₹${proc.stipend || '12,000'} per month during training`,
    trainingFee: proc.trainingFee || '1.6 LPA',
    feeRefundType: '100% Placement Guarantee',
    feeRefundDetails: '100% money back guarantee upon successful training completion',
    bondPeriod: proc.bondPeriod || '1 Year Bond',
    originalsRequired: proc.originalsRequired || 'Originals Need to Submit',
    description: proc.description || (proc.itCategory === 'Course' 
      ? `ROLE: ${proc.role || 'Software Engineer Trainee'} | Program: ${proc.programTitle || 'FIC IT Training Courses'} | Training Duration: ${proc.trainingPeriod || '3 Months'}.`
      : proc.itCategory === 'Internship'
      ? `ROLE: ${proc.role || 'Software Engineer Trainee'} | Program: ${proc.programTitle || 'FIC Free IT Internship'} | Training Duration: ${proc.trainingPeriod || '3 Months'} | Stipend: ₹${proc.stipend || '0'}.`
      : `ROLE: ${proc.role || 'Software Engineer Trainee'} | Program: ${proc.programTitle || 'FIC IT Training'} | Training Duration: ${proc.trainingPeriod || '6 Months'} | Stipend: ₹${proc.stipend || '12,000'} | Bond: ${proc.bondPeriod || '1 Year Bond'} | Originals: ${proc.originalsRequired || 'Originals Need to Submit'}.`),
    responsibilities: [
      'Complete comprehensive software development and full stack curriculum.',
      'Work on live enterprise projects under guidance of senior technical leads.',
      'Participate in mock technical interviews, system design sessions, and client presentations.',
      'Clear evaluation rounds and get deployed to hiring partner tech firms.'
    ],
    requirements: (proc.itCategory === 'Course' || proc.itCategory === 'Internship') ? [
      'Any Degree (B.E, B.Tech, B.Sc, BCA, MCA, M.Tech) with interest in IT careers.',
      'Basic logical thinking, computer fundamentals, and readiness to learn.'
    ] : [
      'Any Degree (B.E, B.Tech, B.Sc, BCA, MCA, M.Tech) with interest in IT careers.',
      'Basic logical thinking, computer fundamentals, and readiness to learn.',
      `Agreement to program terms: ${proc.bondPeriod || '1 Year Bond'}.`,
      `${proc.originalsRequired || 'Originals Need to Submit'} for document verification.`
    ],
    documentsRequired: [
      '10th & 12th Marksheets',
      'Degree Certificate / Consolidated Marksheet',
      'Aadhar Card & PAN Card',
      'Recent Passport Size Photos'
    ],
    interviewSteps: (proc.selectionSteps && proc.selectionSteps.length > 0) ? proc.selectionSteps : [
      { stepNumber: 1, title: 'Screening & Registration', description: 'Application review and initial profile shortlisting' },
      { stepNumber: 2, title: 'Technical Assessment', description: 'Basic coding, problem solving and aptitude round' },
      { stepNumber: 3, title: 'Technical & HR Interview', description: 'Discussion with hiring manager & interview clearance' },
      { stepNumber: 4, title: 'Batch Onboarding', description: 'Offer letter issuance, document submission, and training commencement' }
    ],
    trainingPhases: (proc.trainingPhases && proc.trainingPhases.length > 0) ? proc.trainingPhases : (
      (proc.trainingSubtext && proc.trainingSubtext.includes('|')) ? [
        { title: 'Phase 1 Training', duration: proc.trainingSubtext.split('|')[0].trim(), mode: 'Classroom Training', stipend: `STIPEND ₹${proc.stipend || '12,000'}` },
        { title: 'Phase 2 Training', duration: proc.trainingSubtext.split('|')[1].trim(), mode: 'Real Project Training (OJT)', stipend: `STIPEND ₹${proc.stipend || '12,000'}` }
      ] : [
        { title: 'Phase 1 Training', duration: proc.trainingPeriod || '3 Months', mode: 'Classroom Training', stipend: `STIPEND ₹${proc.stipend || '12,000'}` },
        { title: 'Phase 2 Training', duration: '3 Months', mode: 'Real Project Training (OJT)', stipend: `STIPEND ₹${proc.stipend || '12,000'}` }
      ]
    ),
    itProcessList: (processList && processList.length > 0) ? processList : itProcesses
  });

  const getGroupedItRoles = () => {
    const groups = [];
    itProcesses
      .filter(proc => (proc.itCategory || 'Placement') === selectedItCategory)
      .forEach(proc => {
      const rawRole = (proc.role || 'Software Developer Trainee').trim();
      const normKey = rawRole.toLowerCase()
        .replace(/\btrainee\b/gi, '')
        .replace(/\bengineer\b/gi, 'developer')
        .replace(/[^a-z0-9]/g, '')
        .trim() || 'softwaredeveloper';

      let group = groups.find(g => g.normKey === normKey);
      if (!group) {
        group = {
          role: rawRole,
          normKey: normKey,
          processes: [],
          primaryProcess: proc
        };
        groups.push(group);
      }
      group.processes.push(proc);
    });
    return groups;
  };

  const renderItTickerBanner = () => {
    const rolesList = getGroupedItRoles();
    const tickerData = rolesList.length > 0 ? rolesList.map((g, idx) => ({
      name: g.role,
      tag: `${g.processes.length} Active Tracks`,
      color: ['#60a5fa', '#4ade80', '#f472b6', '#fef08a', '#a78bfa', '#38bdf8'][idx % 6]
    })) : [
      { name: 'Software Developer Trainee', tag: '🔥 3 Tracks Active', color: '#60a5fa' },
      { name: 'Full Stack Developer', tag: '⚡ High CTC 9 LPA', color: '#4ade80' },
      { name: 'Java Developer', tag: '🎯 Spring & Microservices', color: '#fbcfe8' },
      { name: 'Python Developer', tag: '🚀 AI & Data Pipelines', color: '#fef08a' },
      { name: 'MERN Stack Developer', tag: '✨ React & Node.js', color: '#a78bfa' }
    ];

    return (
      <div className="bank-ticker-banner-container" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e3a8a 100%)',
        boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)',
        borderRadius: '14px',
        padding: '10px 1.25rem',
        marginTop: '1.5rem',
        marginBottom: '0.75rem',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        width: '100% !important',
        marginLeft: '0 !important',
        marginRight: '0 !important'
      }}>
        <div style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
          <div className="bank-ticker-track" style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            width: 'max-content',
            animation: 'bankTicker 14s linear infinite'
          }}>
            {[1, 2].map(group => (
              <div key={group} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingRight: '1.5rem' }}>
                {tickerData.map((item, i) => (
                  <div 
                    key={i} 
                    onClick={handleOpenItTraining}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: '#ffffff',
                      fontWeight: 700,
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '5px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <Code size={15} color={item.color} />
                    <span>{item.name}</span>
                    <span style={{ fontSize: '0.725rem', color: item.color, background: 'rgba(0,0,0,0.35)', padding: '2px 8px', borderRadius: '12px' }}>
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const fetchUserApplications = async () => {
    try {
      const candId = currentUser?.candidateId || currentUser?.id;
      const url = candId ? `${API_URL}/api/applications?candidateId=${candId}` : `${API_URL}/api/applications`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setUserApplications(data);
      }
    } catch (err) {
      console.error('Error fetching candidate apps:', err);
    }
  };

  useEffect(() => {
    fetchUserApplications();
  }, [currentUser]);

  const formatTrainingSummaryTag = (trainingPeriod) => {
    if (!trainingPeriod || typeof trainingPeriod !== 'string') return null;
    const parts = trainingPeriod.split('|').map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      const firstPhase = parts[0].replace(/^Phase\s*\d+\s*:\s*/i, '');
      const durationMatch = firstPhase.match(/([\d\-\s]+(?:month|mon|m|year|yr|w|week|day|d)s?)/i);
      if (durationMatch) {
        return `🎓 Training: ${durationMatch[1].trim()} (${parts.length} Phases)`;
      }
      return `🎓 Training: ${parts.length} Structured Phases`;
    }
    const clean = trainingPeriod.replace(/^Phase\s*\d+\s*:\s*/i, '');
    if (clean.length > 30) {
      return `🎓 Training Program Included`;
    }
    return `🎓 Training: ${clean}`;
  };

  const getLogoUrl = (compName, compLogo) => {
    const fallbackMap = {
      'Axis Bank': '/logos/axis_bank.svg',
      'IDFC First Bank': '/logos/idfc_first_bank.svg',
      'Kotak Mahindra Bank': '/logos/kotak_bank.png',
      'Bandhan Bank': '/logos/bandhan_bank.png',
      'Aditya Birla Capital': '/logos/aditya_birla.jpg',
      'Mahindra Finance': '/logos/mahindra_finance.svg',
      'Tech Mahindra': '/logos/tech_mahindra.svg',
      'HDFC Life': '/logos/Hdfc.jpg',
      'FIC IT Training & Placement': '/logo.png',
      'FIC IT Training': '/logo.png',
      'FIC': '/logo.png'
    };

    if (compName && fallbackMap[compName]) {
      return fallbackMap[compName];
    }
    if (!compLogo) return '';
    if (typeof compLogo === 'string' && compLogo.includes('/logos/')) {
      const filename = compLogo.split('/').pop();
      return `/logos/${filename}`;
    }
    return compLogo;
  };

  const getCategoryStyle = (catId, catName) => {
    const nameLower = (catName || '').toLowerCase();
    const idLower = (catId || '').toLowerCase();

    if (idLower.includes('banking') || nameLower.includes('banking')) {
      return {
        shadow: '0 12px 28px -4px rgba(16, 185, 129, 0.45)',
        badgeBg: 'rgba(255, 255, 255, 0.25)',
        badgeText: '#ffffff',
        borderAccent: '#059669',
        cardBg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        textColor: '#ffffff',
        mutedText: 'rgba(255, 255, 255, 0.9)',
        btnBg: '#ffffff',
        btnColor: '#047857',
        icon: <Building2 size={28} color="#047857" />,
        iconBg: '#ffffff'
      };
    }
    if (idLower.includes('it') || nameLower.includes('it') || nameLower.includes('software')) {
      return {
        shadow: '0 12px 28px -4px rgba(139, 92, 246, 0.45)',
        badgeBg: 'rgba(255, 255, 255, 0.25)',
        badgeText: '#ffffff',
        borderAccent: '#7c3aed',
        cardBg: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
        textColor: '#ffffff',
        mutedText: 'rgba(255, 255, 255, 0.9)',
        btnBg: '#ffffff',
        btnColor: '#6d28d9',
        icon: <Code size={28} color="#6d28d9" />,
        iconBg: '#ffffff'
      };
    }
    if (idLower.includes('sales') || nameLower.includes('sales') || nameLower.includes('marketing')) {
      return {
        shadow: '0 12px 28px -4px rgba(249, 115, 22, 0.45)',
        badgeBg: 'rgba(255, 255, 255, 0.25)',
        badgeText: '#ffffff',
        borderAccent: '#ea580c',
        cardBg: 'linear-gradient(135deg, #c2410c 0%, #f97316 100%)',
        textColor: '#ffffff',
        mutedText: 'rgba(255, 255, 255, 0.9)',
        btnBg: '#ffffff',
        btnColor: '#c2410c',
        icon: <TrendingUp size={28} color="#c2410c" />,
        iconBg: '#ffffff'
      };
    }
    if (idLower.includes('bpo') || nameLower.includes('bpo') || nameLower.includes('customer')) {
      return {
        shadow: '0 12px 28px -4px rgba(236, 72, 153, 0.45)',
        badgeBg: 'rgba(255, 255, 255, 0.25)',
        badgeText: '#ffffff',
        borderAccent: '#db2777',
        cardBg: 'linear-gradient(135deg, #be185d 0%, #ec4899 100%)',
        textColor: '#ffffff',
        mutedText: 'rgba(255, 255, 255, 0.9)',
        btnBg: '#ffffff',
        btnColor: '#be185d',
        icon: <Headphones size={28} color="#be185d" />,
        iconBg: '#ffffff'
      };
    }
    if (idLower.includes('nonit') || nameLower.includes('non-it') || nameLower.includes('operation')) {
      return {
        shadow: '0 12px 28px -4px rgba(245, 158, 11, 0.45)',
        badgeBg: 'rgba(255, 255, 255, 0.25)',
        badgeText: '#ffffff',
        borderAccent: '#d97706',
        cardBg: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
        textColor: '#ffffff',
        mutedText: 'rgba(255, 255, 255, 0.9)',
        btnBg: '#ffffff',
        btnColor: '#b45309',
        icon: <Briefcase size={28} color="#b45309" />,
        iconBg: '#ffffff'
      };
    }

    return {
      shadow: '0 12px 28px -4px rgba(6, 182, 212, 0.45)',
      badgeBg: 'rgba(255, 255, 255, 0.25)',
      badgeText: '#ffffff',
      borderAccent: '#0284c7',
      cardBg: 'linear-gradient(135deg, #0369a1 0%, #06b6d4 100%)',
      textColor: '#ffffff',
      mutedText: 'rgba(255, 255, 255, 0.9)',
      btnBg: '#ffffff',
      btnColor: '#0369a1',
      icon: <Award size={28} color="#0369a1" />,
      iconBg: '#ffffff'
    };
  };

  const companyPriorityMap = {
    'IDFC First Bank': 1,
    'Bandhan Bank': 2,
    'HDFC Life': 3,
    'Aditya Birla Capital': 4,
    'Kotak Mahindra Bank': 5,
    'Mahindra Finance': 6,
    'Axis Bank': 7
  };

  const rawCompanies = selectedCategory
    ? companies.filter(c => c.categoryId === selectedCategory.id)
    : companies;

  const filteredCompanies = [...rawCompanies].sort((a, b) => {
    const pA = companyPriorityMap[a.name] !== undefined ? companyPriorityMap[a.name] : 99;
    const pB = companyPriorityMap[b.name] !== undefined ? companyPriorityMap[b.name] : 99;
    return pA - pB;
  });

  const filteredJobs = jobs.filter(job => {
    if (job.status && job.status.toLowerCase() !== 'active') return false;
    if (selectedCategory && job.categoryId !== selectedCategory.id) return false;
    if (selectedCompany && job.companyId !== selectedCompany.id) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title?.toLowerCase().includes(q);
      const matchLoc = job.location?.toLowerCase().includes(q);
      const matchComp = job.companyName?.toLowerCase().includes(q);
      return matchTitle || matchLoc || matchComp;
    }
    return true;
  }).sort((a, b) => {
    const compA = a.companyName || (selectedCompany ? selectedCompany.name : '');
    const compB = b.companyName || (selectedCompany ? selectedCompany.name : '');
    const isAdityaA = compA.toLowerCase().includes('aditya birla');
    const isAdityaB = compB.toLowerCase().includes('aditya birla');

    if (isAdityaA && isAdityaB) {
      const getPriority = (title) => {
        const t = (title || '').toLowerCase();
        if (t.includes('direct')) return 1;
        if (t.includes('agency')) return 2;
        if (t.includes('banca')) return 3;
        return 99;
      };
      return getPriority(a.title) - getPriority(b.title);
    }
    return 0;
  });

  const handleApplyClick = (job) => {
    setViewingJob(null);
    setApplyingJob(job);
  };

  const isAlreadyApplied = (jobId) => {
    return userApplications.some(a => a.jobId === jobId);
  };

  const goToCategoriesPage = () => {
    setSelectedCategory(null);
    setSelectedCompany(null);
  };

  const goToCompaniesPage = () => {
    if (window.history.state && window.history.state.page === 'company') {
      window.history.back();
    } else {
      setSelectedCompany(null);
    }
  };

  return (
    <div className="candidate-portal-wrapper">
      {/* Navigation Sub-Header Removed per user request */}

      {activeTab === 'my_apps' ? (
        <CandidateDashboard candidate={currentUser} API_URL={API_URL} onBrowseJobs={() => setActiveTab('browse')} />
      ) : viewingJob ? (
        <div className="section-container animate-fade" style={{ paddingBottom: '3rem' }}>
          <JobDetailModal
            job={viewingJob}
            onClose={handleBackFromJobDetails}
            onApplyClick={handleApplyClick}
            isAlreadyApplied={isAlreadyApplied(viewingJob.id)}
            isFullPage={true}
            itProcesses={viewingJob.itProcessList && viewingJob.itProcessList.length > 0 ? viewingJob.itProcessList : itProcesses}
            onSelectItProcess={(proc) => handleViewJobDetails(convertItProcToJob(proc, viewingJob.itProcessList && viewingJob.itProcessList.length > 0 ? viewingJob.itProcessList : itProcesses))}
          />
        </div>
      ) : ficView === 'bank_selection' ? (
        /* DEDICATED FULL PAGE 1: FIC TRAINING BANK SELECTION */
        <div className="section-container animate-fade" style={{ paddingBottom: '3rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)', maxWidth: '640px', margin: '0 auto' }}>
            
            {/* HEADER MATCHING USER REFERENCE */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.25)' }}>
                  <Award size={24} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                    FIC Training 100% Placement or Refund
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
                    Select a bank below to view program roadmap & details
                  </p>
                </div>
              </div>
              <button className="btn-close" onClick={() => setFicView(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* BANK LIST CARDS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(companies && companies.length > 0 ? companies : [
                { id: 'b1', name: 'Axis Bank', description: 'Major Indian banking institution.' },
                { id: 'b2', name: 'IDFC First Bank', description: 'Leading Indian private sector bank offering personal and business banking.' },
                { id: 'b3', name: 'Kotak Mahindra Bank', description: 'Top Indian banking and financial services firm.' },
                { id: 'b4', name: 'Bandhan Bank', description: 'Premier private bank with nationwide commercial network.' },
                { id: 'b5', name: 'Aditya Birla Capital', description: 'Leading financial services provider across insurance, wealth and loans.' }
              ]).map(comp => {
                const cn = comp.name.toLowerCase();
                const matchKey = cn.includes('mahindra finance') ? 'mahindra finance' : cn.includes('kotak') ? 'kotak' : cn.includes('aditya') ? 'aditya' : cn.includes('idfc') ? 'idfc' : cn.split(' ')[0];
                const bankJobsCount = jobs.filter(j => j.companyId === comp.id || (j.companyName || '').toLowerCase().includes(matchKey)).length;
                return (
                  <div
                    key={comp.id}
                    onClick={() => handleOpenFicBankDetails(comp)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      padding: '1.1rem 1.25rem',
                      borderRadius: '14px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af' }}>
                        <Building2 size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {comp.name}
                        </h4>
                        <span style={{ fontSize: '0.825rem', color: '#15803d', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                          🔥 {bankJobsCount > 0 ? `${bankJobsCount} Open Positions` : '1 Open Positions'}
                        </span>
                      </div>
                    </div>

                    <button
                      style={{
                        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 18px',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                      }}
                    >
                      Click Now <ChevronRight size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : ficView === 'fic_details' && selectedFicBank ? (
        /* DEDICATED FULL PAGE 2: FIC TRAINING ROADMAP DETAILS FOR SELECTED BANK */
        <div className="section-container animate-fade" style={{ paddingBottom: '3rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)', maxWidth: '640px', margin: '0 auto' }}>
            
            {/* TOP BLUE BUTTON MATCHING REFERENCE */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <button
                style={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                  color: '#ffffff',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(30, 64, 175, 0.22)',
                  border: 'none',
                  width: '100%',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <Award size={18} color="#ffffff" /> FIC Training 100% placement or Refund ▲
              </button>
            </div>

            {/* BANK TITLE HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {selectedFicBank.name}
                </h3>
                <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
                  FIC Placement & Training Guarantee Program
                </span>
              </div>
              <button className="btn-close" onClick={() => {
                if (window.history.state && window.history.state.page === 'fic_details') {
                  window.history.back();
                } else {
                  setFicView('bank_selection');
                }
              }} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* DETAILS BODY */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* SUMMARY CARDS: COST & PERIOD (PER ROLE) */}
              {(() => {
                const cn = selectedFicBank.name.toLowerCase();
                const matchKey = cn.includes('mahindra finance') ? 'mahindra finance' : cn.includes('kotak') ? 'kotak' : cn.includes('aditya') ? 'aditya' : cn.includes('idfc') ? 'idfc' : cn.split(' ')[0];
                const bankJobs = jobs.filter(j => j.companyId === selectedFicBank.id || (j.companyName || '').toLowerCase().includes(matchKey));
                if (bankJobs.length > 0) {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {bankJobs.map(job => (
                        <div key={job.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {job.programName && (
                            <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.75rem' }}>
                              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{job.programName}</h3>
                            </div>
                          )}
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', margin: 0 }}>Role: {job.title}</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                            <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                              <span style={{ fontSize: '0.7rem', color: '#1e40af', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                                💰 FIC TRAINING COST
                              </span>
                              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1d4ed8', display: 'block', marginTop: '4px' }}>
                                {job.interviewCrackFee || job.trainingFee || selectedFicBank.trainingFee || '2,20,000'}
                              </span>
                            </div>
                            <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                              <span style={{ fontSize: '0.7rem', color: '#047857', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                                ⏱️ FIC TRAINING PERIOD
                              </span>
                              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#047857', display: 'block', marginTop: '4px' }}>
                                {job.ficTrainingPeriod || selectedFicBank.trainingPeriod || '120 days'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                // Fallback if no specific jobs found
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#1e40af', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                        💰 FIC TRAINING COST
                      </span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8', display: 'block', marginTop: '4px' }}>
                        {selectedFicBank.trainingFee || selectedFicBank.interviewCrackFee || '2,20,000'}
                      </span>
                    </div>

                    <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#047857', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                        ⏱️ FIC TRAINING PERIOD
                      </span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#047857', display: 'block', marginTop: '4px' }}>
                        {selectedFicBank.trainingPeriod || '120days'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* 4-STEP PAYMENT ROADMAP */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🗺️ 4-STEP PAYMENT ROADMAP
                </span>
                
                <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2563eb', display: 'block' }}>
                      Step 1: 50% Advance Payment
                    </span>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0 0 0' }}>
                      Starting the process 50% payment advance
                    </p>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2563eb', display: 'block' }}>
                      Step 2: Document Submission
                    </span>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0 0 0' }}>
                      Document submission for verification
                    </p>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2563eb', display: 'block' }}>
                      Step 3: Training Program
                    </span>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0 0 0' }}>
                      Training & preparation sessions
                    </p>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2563eb', display: 'block' }}>
                      Step 4: Balance Payment
                    </span>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0 0 0' }}>
                      After selected 50% payment
                    </p>
                  </div>
                </div>
              </div>

              {/* GUARANTEE BADGE */}
              <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)', border: '1.5px solid #86efac', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Award size={24} color="#16a34a" />
                <div>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#14532d', margin: 0 }}>
                    100% Placement Guarantee or Full Refund
                  </h5>
                  <p style={{ fontSize: '0.8rem', color: '#15803d', margin: '2px 0 0 0' }}>
                    Complete job guarantee upon successful training completion or 100% money back.
                  </p>
                </div>
              </div>

              {/* FOOTER ACTION BUTTON */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  onClick={() => {
                    handleCompanyClick(selectedFicBank);
                    setFicView(null);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'center'
                  }}
                >
                  View {selectedFicBank.name} Jobs & Apply →
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : ficView === 'it_training' ? (
        /* DEDICATED VIEW: IT TRAINING PROGRAM OPENINGS (EXACT SAME AS BANK OPENINGS PAGE IN IMAGE 3) */
        <div className="section-container animate-fade">
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              className="btn-secondary"
              onClick={() => {
                if (window.history.state && window.history.state.page === 'it_training') {
                  window.history.back();
                } else {
                  setFicView(null);
                }
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <ArrowLeft size={16} /> Back to Browse
            </button>
          </div>

          {/* RUNNING IT ADVERTISEMENT MARQUEE BANNER INSIDE IT OPENINGS */}
          {renderItTickerBanner()}

          <div className="section-header">
            <div>
              <h2 className="section-title">
                {selectedItCategory === 'Placement' ? 'Openings at FIC IT Training & Placement' :
                 selectedItCategory === 'Course' ? 'FIC IT Training Courses' : 'FIC Free IT Internship'}
              </h2>
              <p className="section-subtitle">
                Showing {getGroupedItRoles().length} career training role{getGroupedItRoles().length > 1 ? 's' : ''} 
                {selectedItCategory === 'Placement' ? ' with 100% placement guarantee' : ''}
              </p>
            </div>
          </div>

          <div className="job-grid" style={{ marginBottom: '2.5rem' }}>
            {getGroupedItRoles().map(group => {
              const primaryProc = group.primaryProcess || group.processes[0];
              const jobObj = convertItProcToJob(primaryProc, group.processes);
              const applied = isAlreadyApplied(jobObj.id);

              const processNames = group.processes.map(p => p.processName).join(', ');
              // Deduplicate bond text case-insensitively (avoid "2 Year Bond / 2 Years Bond")
              const bondText = (() => {
                const seen = new Set();
                const unique = group.processes.map(p => p.bondPeriod).filter(Boolean).filter(v => {
                  const key = v.toLowerCase().replace(/\s+/g, '');
                  if (seen.has(key)) return false;
                  seen.add(key);
                  return true;
                });
                return unique.length > 0 ? unique[0] : (primaryProc.bondPeriod || '');
              })();
              const feeText = group.processes.map(p => p.trainingFee).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' - ') || primaryProc.trainingFee;

              return (
                <div
                  key={group.normKey}
                  className="job-card-vibrant"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleViewJobDetails(jobObj)}
                >
                  <div>
                    <div className="job-card-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                          <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <h4 className="job-card-title">{group.role || 'Software Developer Trainee'}</h4>
                          <div className="job-comp-name">
                            FIC IT Training &amp; Placement
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="job-tags-container">
                      <span className="tag-pill tag-exp">
                        <Briefcase size={13} /> Fresher & Experience
                      </span>
                      <span className="tag-pill tag-salary">
                        {primaryProc.salary || '3.5 - 6.0 LPA'}
                      </span>
                      <span className="tag-pill tag-training">
                        🎓 Training: {primaryProc.trainingPeriod || '6 Months'}
                      </span>
                      {bondText && (
                        <span className="tag-pill" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                          📜 {bondText}
                        </span>
                      )}
                      {primaryProc.location && (
                        <span className="tag-pill tag-location">
                          <MapPin size={13} /> {primaryProc.location}
                        </span>
                      )}
                    </div>

                    <p className="job-snippet">
                      ROLE: {group.role} | Location: {primaryProc.location || 'PAN INDIA'} | Stipend: ₹{primaryProc.stipend || '12,000'} | Program Fees: {feeText} | {primaryProc.originalsRequired || 'Originals Need to Submit'}.
                    </p>
                  </div>

                  <div className="job-card-footer">
                    <button
                      className="btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewJobDetails(jobObj);
                      }}
                    >
                      View Details
                    </button>
                    {applied ? (
                      <span className="applied-pill" onClick={(e) => e.stopPropagation()}>
                        ✓ Applied
                      </span>
                    ) : (
                      <button
                        className="btn-primary-gradient"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyClick(jobObj);
                        }}
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="section-container animate-fade">
          {/* PAGE 1: CATEGORIES VIEW */}
          {!selectedCategory && !selectedCompany && (
            <div>
              {/* SECTION HEADER */}
              <div className="section-header">
                <div>
                  <h2 className="section-title">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'Select Job Category'}
                  </h2>
                  <p className="section-subtitle">
                    {searchQuery
                      ? `Found ${filteredJobs.length} matching job openings`
                      : 'Click on a domain category to view hiring companies and active job openings'}
                  </p>
                </div>
              </div>

              {searchQuery ? (
                <div className="job-grid" style={{ marginBottom: '2.5rem' }}>
                  {filteredJobs.length === 0 ? (
                    <div className="empty-state-card" style={{ gridColumn: '1 / -1' }}>
                      <Briefcase size={44} color="#94a3b8" />
                      <h4>No Matching Jobs Found</h4>
                      <p>Try searching with a different job title, location, or company name.</p>
                      <button className="btn-secondary" onClick={() => setSearchQuery('')} style={{ marginTop: '1rem' }}>
                        Clear Search Filter
                      </button>
                    </div>
                  ) : (
                    filteredJobs.map(job => {
                      const applied = isAlreadyApplied(job.id);
                      return (
                        <div key={job.id} className="job-card-vibrant" style={{ cursor: 'pointer' }} onClick={() => handleViewJobDetails(job)}>
                          <div>
                            <div className="job-card-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {getLogoUrl(job.companyName, job.companyLogo) ? (
                                  <img src={getLogoUrl(job.companyName, job.companyLogo)} alt={job.companyName} className="job-comp-logo-vibrant" />
                                ) : (
                                  <div className="job-comp-logo-vibrant logo-placeholder">
                                    <Building2 size={24} color="var(--primary)" />
                                  </div>
                                )}
                                <div>
                                  <h4 className="job-card-title">{job.title}</h4>
                                  <div className="job-comp-name">{job.companyName}</div>
                                </div>
                              </div>
                              {(job.title || '').toLowerCase().includes('hdfc') && (
                                <img
                                  src="/logos/Hdfc.jpg"
                                  alt="HDFC Bank"
                                  style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 }}
                                />
                              )}
                            </div>

                            <div className="job-tags-container">
                              <span className="tag-pill tag-exp">
                                <Briefcase size={13} /> {job.experience}
                              </span>
                              <span className="tag-pill tag-salary-vibrant">
                                {job.salary}
                              </span>
                              {job.trainingPeriod && (
                                <span className="tag-pill tag-training" title={job.trainingPeriod}>
                                  {formatTrainingSummaryTag(job.trainingPeriod)}
                                </span>
                              )}
                            </div>

                            {job.description && (
                              <p className="job-snippet">{job.description}</p>
                            )}
                          </div>

                          <div className="job-card-footer">
                            <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); handleViewJobDetails(job); }}>
                              View Details
                            </button>
                            {applied ? (
                              <span className="applied-pill" onClick={(e) => e.stopPropagation()}>
                                ✓ Applied
                              </span>
                            ) : (
                              <button className="btn-primary-gradient" onClick={(e) => { e.stopPropagation(); handleApplyClick(job); }}>
                                Apply Now
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : loading ? (
                <div className="portal-loading-card">
                  <div className="spinner"></div>
                  <span>Loading job categories...</span>
                </div>
              ) : (
                <div className="category-grid" style={{ marginBottom: '2.5rem' }}>
                  {categories.map(cat => {
                    const posCount = jobs.filter(j => j.categoryId === cat.id).length;
                    const compCount = companies.filter(c => c.categoryId === cat.id).length;
                    const styleConfig = getCategoryStyle(cat.id, cat.name);

                    return (
                      <div
                        key={cat.id}
                        className="category-card-vibrant"
                        onClick={() => setSelectedCategory(cat)}
                        style={{ background: styleConfig.cardBg, color: styleConfig.textColor }}
                      >
                        <div className="vibrant-cat-header">
                          <div
                            className="vibrant-cat-icon"
                            style={{
                              background: styleConfig.iconBg,
                              boxShadow: styleConfig.shadow
                            }}
                          >
                            {styleConfig.icon}
                          </div>
                          <span
                            className="vibrant-pos-badge"
                            style={{
                              background: styleConfig.badgeBg,
                              color: styleConfig.badgeText,
                              backdropFilter: 'blur(8px)',
                              border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}
                          >
                            <Building2 size={13} style={{ marginRight: '3px' }} /> {compCount} Companies
                          </span>
                        </div>

                        <div className="vibrant-cat-content">
                          <h3 className="vibrant-cat-name" style={{ color: styleConfig.textColor }}>{cat.name}</h3>
                          {cat.description && (
                            <p className="vibrant-cat-desc" style={{ color: styleConfig.mutedText }}>{cat.description}</p>
                          )}
                          <div className="vibrant-cat-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.25)' }}>
                            <span className="vibrant-jobs-count" style={{ background: 'rgba(255, 255, 255, 0.22)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.35)', whiteSpace: 'nowrap' }}>
                              ⚡ {posCount} Openings
                            </span>
                            <span className="vibrant-explore-btn" style={{ background: styleConfig.btnBg, color: styleConfig.btnColor, border: 'none', whiteSpace: 'nowrap' }}>
                              Explore <ChevronRight size={16} />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}


          {/* PAGE 2: COMPANIES VIEW (e.g., Banking Companies) */}
          {selectedCategory && !selectedCompany && (
            <div>



              {/* RUNNING ADVERTISEMENT MARQUEE BANNER (CATEGORY AWARE) */}
              {selectedCategory.id === 'cat_it' ? (
                renderItTickerBanner()
              ) : selectedCategory.id === 'cat_banking' ? (
                <div className="bank-ticker-banner-container">
                  <div style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
                    <div className="bank-ticker-track" style={{
                      display: 'flex',
                      whiteSpace: 'nowrap',
                      width: 'max-content',
                      animation: 'bankTicker 14s linear infinite'
                    }}>
                      {[1, 2].map(group => (
                        <div key={group} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingRight: '1.5rem' }}>
                          {[
                            { name: 'IDFC First Bank', tag: '🔥 2 Openings', color: '#fda4af' },
                            { name: 'Bandhan Bank', tag: '⚡ Urgent Hiring', color: '#fef08a' },
                            { name: 'Aditya Birla Capital', tag: '✨ 3 Openings', color: '#93c5fd' },
                            { name: 'Kotak Mahindra Bank', tag: '🎯 Direct Placement', color: '#86efac' },
                            { name: 'Axis Bank', tag: '💼 Active Drive', color: '#f472b6' }
                          ].map((bank, i) => (
                            <div 
                              key={i} 
                              onClick={() => {
                                const foundComp = filteredCompanies.find(c => c.name.toLowerCase().includes(bank.name.toLowerCase().split(' ')[0]));
                                if (foundComp) handleCompanyClick(foundComp);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                color: '#ffffff',
                                fontWeight: 700,
                                background: 'rgba(255, 255, 255, 0.08)',
                                padding: '5px 14px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                transition: 'background 0.2s ease'
                              }}
                            >
                              <Building2 size={15} color={bank.color} />
                              <span>{bank.name}</span>
                              <span style={{ fontSize: '0.725rem', color: bank.color, background: 'rgba(0,0,0,0.35)', padding: '2px 8px', borderRadius: '12px' }}>
                                {bank.tag}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="section-header">
                <div>
                  <h2 className="section-title">{selectedCategory.name} Companies</h2>
                  <p className="section-subtitle">Select a bank or hiring company below to view active job roles</p>
                </div>
              </div>

              <div className="company-card-grid" style={{ marginBottom: '3rem' }}>
                {filteredCompanies.length === 0 ? (
                  <div className="empty-state-card">
                    <Building2 size={44} color="#94a3b8" />
                    <h4>No Hiring Companies Found</h4>
                    <p>No companies currently listed under {selectedCategory.name}.</p>
                  </div>
                ) : (
                  filteredCompanies.map(comp => {
                    const compJobs = jobs.filter(j => j.companyId === comp.id);

                    return (
                      <div
                        key={comp.id}
                        className="company-visual-card-vibrant"
                        onClick={() => handleCompanyClick(comp)}
                      >
                        <div className="comp-card-top">
                          {getLogoUrl(comp.name, comp.logo) ? (
                            <img 
                              src={getLogoUrl(comp.name, comp.logo)} 
                              alt={comp.name} 
                              className="company-logo-vibrant" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="company-logo-vibrant logo-placeholder">
                              <Building2 size={26} color="var(--primary)" />
                            </div>
                          )}
                          <div className="comp-info">
                            <h4 className="comp-title">{comp.name}</h4>
                            <span className="comp-count-tag">{compJobs.length} Open Positions</span>
                          </div>
                        </div>

                        {comp.description && (
                          <p className="comp-desc">{comp.description}</p>
                        )}

                        <div className="comp-card-bottom">
                          <span>View {comp.name} Jobs</span>
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* FIC TRAINING KPI CARD (PLACED AT THE BOTTOM) */}
              <div 
                onClick={handleOpenFicBankSelection}
                style={{ 
                  background: '#ffffff', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '16px', 
                  padding: '1.5rem', 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease',
                  marginTop: '0.5rem',
                  marginBottom: '2.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ borderRadius: '50%', width: '54px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1.5px solid #e2e8f0', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      FIC Training 100% placement or Refund
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700, display: 'inline-block', marginTop: '4px' }}>
                      🌟 Exclusive Program Guarantee
                    </span>
                  </div>
                </div>
                
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
                  Complete job guarantee upon successful training completion or get 100% of your training fees refunded. Click here to view participating banks and roles.
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                    View FIC Training Details
                  </span>
                  <ChevronRight size={20} color="#0f172a" />
                </div>
              </div>

              {/* RUNNING IT ADVERTISEMENT MARQUEE BANNER ABOVE IT CARD */}
              {renderItTickerBanner()}

              {/* NEW FIC IT TRAINING & 100% PLACEMENT KPI CARD - 3D PREMIUM */}
              <div 
                onClick={() => handleOpenItTraining('Placement')}
                style={{ 
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 40%, #7c3aed 80%, #6d28d9 100%)',
                  borderRadius: '20px', 
                  padding: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 8px 32px rgba(37, 99, 235, 0.45), 0 2px 8px rgba(109, 40, 217, 0.3), inset 0 1px 0 rgba(255,255,255,0.18)',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  marginTop: '0.5rem',
                  marginBottom: '2.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(255,255,255,0.18)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
                  e.currentTarget.style.boxShadow = '0 20px 48px rgba(37, 99, 235, 0.55), 0 8px 20px rgba(109, 40, 217, 0.4), inset 0 1px 0 rgba(255,255,255,0.22)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(37, 99, 235, 0.45), 0 2px 8px rgba(109, 40, 217, 0.3), inset 0 1px 0 rgba(255,255,255,0.18)';
                }}
              >
                {/* Decorative glowing orbs */}
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-20px', left: '30px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '20px', right: '80px', width: '50px', height: '50px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                  {/* 3D Logo Circle */}
                  <div style={{ 
                    borderRadius: '50%', width: '58px', height: '58px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    flexShrink: 0, overflow: 'hidden',
                    background: '#ffffff',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.6), inset 0 -2px 6px rgba(0,0,0,0.1)',
                    border: '2.5px solid rgba(255,255,255,0.9)'
                  }}>
                    <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.3)', lineHeight: 1.2 }}>
                      FIC IT Training &amp; 100% placement
                    </h3>
                    <span style={{ 
                      fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px',
                      marginTop: '6px',
                      background: 'rgba(255,255,255,0.18)',
                      color: '#e0f2fe',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(4px)',
                      letterSpacing: '0.02em'
                    }}>
                      💻 Exclusive IT Placement Programs
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p style={{ 
                  margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.88)', 
                  lineHeight: '1.55', position: 'relative', zIndex: 1,
                  textShadow: '0 1px 2px rgba(0,0,0,0.15)'
                }}>
                  Complete IT Job Training with 100% placement guarantee in top IT companies. View multiple training processes, monthly stipend, bond terms, and selection roadmap.
                </p>

                {/* Footer Row */}
                <div style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  borderTop: '1px solid rgba(255,255,255,0.2)', 
                  paddingTop: '12px', marginTop: '2px',
                  position: 'relative', zIndex: 1
                }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '6px', textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
                    🎯 Selection &amp; Interview
                  </span>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: 'rgba(255,255,255,0.22)',
                    border: '1.5px solid rgba(255,255,255,0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    <ChevronRight size={18} color="#ffffff" />
                  </div>
                </div>
              </div>

              {/* NEW FIC COURSES KPI CARD */}
              <div 
                onClick={() => handleOpenItTraining('Course')}
                style={{ 
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #075985 80%, #082f49 100%)',
                  borderRadius: '20px', 
                  padding: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 8px 32px rgba(2, 132, 199, 0.45), 0 2px 8px rgba(3, 105, 161, 0.3), inset 0 1px 0 rgba(255,255,255,0.18)',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  marginBottom: '2.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(255,255,255,0.18)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
                  e.currentTarget.style.boxShadow = '0 20px 48px rgba(2, 132, 199, 0.55), 0 8px 20px rgba(3, 105, 161, 0.4), inset 0 1px 0 rgba(255,255,255,0.22)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(2, 132, 199, 0.45), 0 2px 8px rgba(3, 105, 161, 0.3), inset 0 1px 0 rgba(255,255,255,0.18)';
                }}
              >
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    borderRadius: '50%', width: '58px', height: '58px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    flexShrink: 0, overflow: 'hidden',
                    background: '#ffffff',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.6), inset 0 -2px 6px rgba(0,0,0,0.1)',
                    border: '2.5px solid rgba(255,255,255,0.9)'
                  }}>
                    <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.3)', lineHeight: 1.2 }}>
                      FIC IT Courses
                    </h3>
                    <span style={{ 
                      fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px',
                      marginTop: '6px',
                      background: 'rgba(255,255,255,0.18)',
                      color: '#e0f2fe',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(4px)',
                      letterSpacing: '0.02em'
                    }}>
                      📚 Learn from Industry Experts
                    </span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.88)', lineHeight: '1.55', position: 'relative', zIndex: 1, textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
                  Enroll in our comprehensive IT training courses designed for beginners to advanced professionals. Build real-world projects and accelerate your career.
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px', marginTop: '2px', position: 'relative', zIndex: 1 }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '6px', textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
                    📖 View Courses
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                    <ChevronRight size={18} color="#ffffff" />
                  </div>
                </div>
              </div>

              {/* NEW FIC FREE INTERNSHIP KPI CARD */}
              <div 
                onClick={() => handleOpenItTraining('Internship')}
                style={{ 
                  background: 'linear-gradient(135deg, #059669 0%, #047857 40%, #065f46 80%, #022c22 100%)',
                  borderRadius: '20px', 
                  padding: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 8px 32px rgba(5, 150, 105, 0.45), 0 2px 8px rgba(4, 120, 87, 0.3), inset 0 1px 0 rgba(255,255,255,0.18)',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  marginBottom: '2.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(255,255,255,0.18)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
                  e.currentTarget.style.boxShadow = '0 20px 48px rgba(5, 150, 105, 0.55), 0 8px 20px rgba(4, 120, 87, 0.4), inset 0 1px 0 rgba(255,255,255,0.22)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(5, 150, 105, 0.45), 0 2px 8px rgba(4, 120, 87, 0.3), inset 0 1px 0 rgba(255,255,255,0.18)';
                }}
              >
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    borderRadius: '50%', width: '58px', height: '58px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    flexShrink: 0, overflow: 'hidden',
                    background: '#ffffff',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.6), inset 0 -2px 6px rgba(0,0,0,0.1)',
                    border: '2.5px solid rgba(255,255,255,0.9)'
                  }}>
                    <img src="/logo.png" alt="FIC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.3)', lineHeight: 1.2 }}>
                      FIC Free Internship
                    </h3>
                    <span style={{ 
                      fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px',
                      marginTop: '6px',
                      background: 'rgba(255,255,255,0.18)',
                      color: '#d1fae5',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(4px)',
                      letterSpacing: '0.02em'
                    }}>
                      💼 Zero Cost • Real Experience
                    </span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.88)', lineHeight: '1.55', position: 'relative', zIndex: 1, textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
                  Join our exclusive 100% Free Internship program. Work on live industry projects alongside experienced developers without paying any fees.
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px', marginTop: '2px', position: 'relative', zIndex: 1 }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '6px', textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
                    🚀 View Internship Openings
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                    <ChevronRight size={18} color="#ffffff" />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* PAGE 3: JOB OPENINGS VIEW (e.g. Axis Bank Jobs) */}
          {selectedCategory && selectedCompany && (
            <div>

              <div className="section-header">
                <div>
                  <h2 className="section-title">Openings at {selectedCompany.name}</h2>
                  <p className="section-subtitle">Showing {filteredJobs.length} available openings</p>
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="empty-state-card">
                  <Briefcase size={44} color="#94a3b8" />
                  <h4>No Active Jobs Found</h4>
                  <p>There are no open job roles listed for {selectedCompany.name} right now.</p>
                  <button className="btn-secondary" onClick={goToCompaniesPage} style={{ marginTop: '1rem' }}>
                    Choose Another Company
                  </button>
                </div>
              ) : (
                <div className="job-grid">
                  {filteredJobs.map(job => {
                    const applied = isAlreadyApplied(job.id);

                    return (
                      <div key={job.id} className="job-card-vibrant" style={{ cursor: 'pointer' }} onClick={() => handleViewJobDetails(job)}>
                        <div>
                          <div className="job-card-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {getLogoUrl(job.companyName || (selectedCompany && selectedCompany.name), job.companyLogo) ? (
                                <img src={getLogoUrl(job.companyName || (selectedCompany && selectedCompany.name), job.companyLogo)} alt={job.companyName} className="job-comp-logo-vibrant" />
                              ) : (
                                <div className="job-comp-logo-vibrant logo-placeholder">
                                  <Building2 size={24} color="var(--primary)" />
                                </div>
                              )}
                              <div>
                                <h4 className="job-card-title">{job.title}</h4>
                                <div className="job-comp-name">{job.companyName || selectedCompany.name}</div>
                              </div>
                            </div>
                            {(job.title || '').toLowerCase().includes('hdfc') && (
                              <img
                                src="/logos/Hdfc.jpg"
                                alt="HDFC Bank"
                                style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 }}
                              />
                            )}
                          </div>

                          <div className="job-tags-container">
                            <span className="tag-pill tag-exp">
                              <Briefcase size={13} /> {job.experience}
                            </span>
                            <span className="tag-pill tag-salary-vibrant">
                              {job.salary}
                            </span>
                             {job.trainingPeriod && (
                               <span className="tag-pill tag-training" title={job.trainingPeriod}>
                                 {formatTrainingSummaryTag(job.trainingPeriod)}
                               </span>
                             )}
                          </div>

                          {job.description && (
                            <p className="job-snippet">{job.description}</p>
                          )}
                        </div>

                        <div className="job-card-footer">
                          <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); handleViewJobDetails(job); }}>
                            View Details
                          </button>
                          {applied ? (
                            <span className="applied-pill" onClick={(e) => e.stopPropagation()}>
                              ✓ Applied
                            </span>
                          ) : (
                            <button className="btn-primary-gradient" onClick={(e) => { e.stopPropagation(); handleApplyClick(job); }}>
                              Apply Now
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Application Form Modal */}

      <ApplicationModal
        job={applyingJob}
        candidate={currentUser}
        isOpen={!!applyingJob}
        onClose={() => setApplyingJob(null)}
        onSubmitSuccess={() => {
          fetchUserApplications();
        }}
        API_URL={API_URL}
      />
    </div>
  );
}

