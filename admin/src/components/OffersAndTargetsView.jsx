import React, { useState, useEffect } from 'react';
import {
  Trophy, Target, Gift, Users, User, ArrowLeft, Clock, Sparkles,
  CheckCircle2, Flame, Building2, Award, Zap, RefreshCw, Calendar,
  ChevronRight, ShieldCheck, Check, Lock, Unlock, Tablet, Smartphone, Star,
  Share2, Copy, ExternalLink, Briefcase, HelpCircle, AlertCircle, Phone, ArrowRight, CheckCheck, Laptop
} from 'lucide-react';

const BANK_LOGOS = {
  'Axis Bank': '/logos/axis_bank.svg',
  'IDFC First Bank': '/logos/idfc_first_bank.svg',
  'Kotak Mahindra Bank': '/logos/kotak_bank.png',
  'Bandhan Bank': '/logos/bandhan_bank.png',
  'Aditya Birla Capital': '/logos/aditya_birla.jpg',
  'Aditya Birla': '/logos/aditya_birla.jpg',
  'Tata Capital': '/logos/tata_aig.png',
  'Mahindra Finance': '/logos/mahindra_finance.svg',
  'YES Bank': '/logos/Yes_Bank_Logo.jpg',
  'Suryoday Small Finance Bank': '/logos/suryoday.webp',
  'HDFC Bank': 'https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg',
  'ICICI Bank': 'https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg'
};

const BANK_COLORS = {
  'Bandhan Bank': {
    primary: '#0284c7',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 60%, #075985 100%)',
    bg: '#f0f9ff',
    border: '#7dd3fc',
    glow: 'rgba(2, 132, 199, 0.45)',
    desc: 'Indian banking & financial services company headquartered in Kolkata.'
  },
  'Axis Bank': {
    primary: '#831843',
    gradient: 'linear-gradient(135deg, #831843 0%, #701a75 60%, #581c87 100%)',
    bg: '#fdf2f8',
    border: '#f472b6',
    glow: 'rgba(131, 24, 67, 0.45)',
    desc: 'Leading private sector bank offering personal, business & wealth banking services across India.'
  },
  'Suryoday Small Finance Bank': {
    primary: '#ea580c',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 60%, #9a3412 100%)',
    bg: '#fff7ed',
    border: '#fdba74',
    glow: 'rgba(234, 88, 12, 0.45)',
    desc: 'Scheduled commercial bank providing inclusive retail and microfinance banking products.'
  },
  'Kotak Mahindra Bank': {
    primary: '#003366',
    gradient: 'linear-gradient(135deg, #003366 0%, #0c4a6e 60%, #0f172a 100%)',
    bg: '#f0f4f8',
    border: '#93c5fd',
    glow: 'rgba(0, 51, 102, 0.45)',
    desc: 'Premier private sector banking and financial services group across India.'
  },
  'IDFC First Bank': {
    primary: '#991b1b',
    gradient: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 60%, #450a0a 100%)',
    bg: '#fef2f2',
    border: '#fca5a5',
    glow: 'rgba(153, 27, 27, 0.45)',
    desc: 'Customer-first digital bank offering high interest savings, retail & SME business banking.'
  },
  'YES Bank': {
    primary: '#0284c7',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 60%, #0c4a6e 100%)',
    bg: '#f0f9ff',
    border: '#7dd3fc',
    glow: 'rgba(2, 132, 199, 0.45)',
    desc: 'Full-service commercial bank delivering corporate, retail, SME banking & digital payments.'
  },
  'HDFC Bank': {
    primary: '#1d4ed8',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 60%, #1e3a8a 100%)',
    bg: '#eff6ff',
    border: '#93c5fd',
    glow: 'rgba(29, 78, 216, 0.45)',
    desc: "India's largest private sector bank providing cutting-edge corporate and retail banking solutions."
  },
  'ICICI Bank': {
    primary: '#c2410c',
    gradient: 'linear-gradient(135deg, #c2410c 0%, #9a3412 60%, #7c2d12 100%)',
    bg: '#fff7ed',
    border: '#fed7aa',
    glow: 'rgba(194, 65, 12, 0.45)',
    desc: 'Multinational banking and financial services titan with extensive nationwide network.'
  },
  'Aditya Birla Capital': {
    primary: '#b91c1c',
    gradient: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 60%, #7f1d1d 100%)',
    bg: '#fef2f2',
    border: '#fca5a5',
    glow: 'rgba(185, 28, 28, 0.45)',
    desc: 'Financial services umbrella brand for Aditya Birla Group businesses across wealth & lending.'
  },
  'Mahindra Finance': {
    primary: '#e11d48',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 60%, #881337 100%)',
    bg: '#fff1f2',
    border: '#fda4af',
    glow: 'rgba(225, 29, 72, 0.45)',
    desc: 'Leading Non-Banking Financial Company serving rural and semi-urban India with pride.'
  }
};

const DEFAULT_PAID_COMBO_SETS = [
  {
    id: 'combo_1',
    title: 'Banking Combo',
    roles: [
      'Bandhan Bank (Customer Relationship Officer)',
      'Axis Bank (Assistant Manager)',
      'Aditya Birla Capital (Bank Relationship Officer)'
    ],
    targetCount: 5,
    rewardType: 'both',
    rewardAmount: 25000,
    rewardTitle: 'Brand New TAB or ₹25,000 Cash Rewards',
    extraIncentiveText: '+ Full Candidate Placement Incentives',
    description: 'Enroll candidates claim a Brand New TAB or ₹25,000 Cash!'
  },
  {
    id: 'combo_2',
    title: 'Set 2: Hybrid Banking & IT Combo',
    roles: [
      'Axis Bank (Customer Service Officer)',
      'Aditya Birla Capital (Sales Manager)',
      'FIC IT Track (Full Stack Developer)'
    ],
    targetCount: 3,
    rewardType: 'both',
    rewardAmount: 30000,
    rewardTitle: 'GET ₹30,000 CASH OR A ₹30,000 WORTH TABLET',
    extraIncentiveText: '+ Full Candidate Placement Incentives',
    description: 'Enroll 2 Banking candidates + 1 IT Training candidate to unlock ₹30,000 Cash OR a ₹30,000 Worth Tablet!'
  },
  {
    id: 'combo_3',
    title: 'Set 3: Gold Academy Power Trio',
    roles: [
      'Axis Bank (Gold Appraiser)',
      'Kotak Mahindra Bank (Gold Loan Officer)',
      'Suryoday Small Finance Bank (Branch Relationship Exec)'
    ],
    targetCount: 3,
    rewardType: 'both',
    rewardAmount: 30000,
    rewardTitle: 'GET ₹30,000 CASH OR A ₹30,000 WORTH TABLET',
    extraIncentiveText: '+ Full Candidate Placement Incentives',
    description: 'Enroll candidates across Axis Gold, Kotak Gold, and Suryoday Bank to win the Mega Reward!'
  },
  {
    id: 'combo_4',
    title: 'Set 4: Master Placement Quad Combo',
    roles: [
      'HDFC Bank (Personal Banker)',
      'Tata Capital (Loan Officer)',
      'Kotak Mahindra Bank (Branch Banking Officer)',
      'FIC IT Track (Cloud & Python Specialist)'
    ],
    targetCount: 4,
    rewardType: 'both',
    rewardAmount: 30000,
    rewardTitle: 'Premium TAB + ₹10,000 Cash Bonus',
    extraIncentiveText: '+ Full Candidate Placement Incentives',
    description: 'Achieve 4 closures across premium gold banks and IT training to claim the ultimate Bumper Reward!'
  }
];

const COMBO_CARD_THEMES = [
  {
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
    glow: 'rgba(37, 99, 235, 0.45)',
    border: 'rgba(147, 197, 253, 0.4)',
    accent: '#fef08a'
  },
  {
    gradient: 'linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)',
    glow: 'rgba(99, 102, 241, 0.45)',
    border: 'rgba(199, 210, 254, 0.4)',
    accent: '#fef08a'
  },
  {
    gradient: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)',
    glow: 'rgba(217, 119, 6, 0.45)',
    border: 'rgba(253, 230, 138, 0.4)',
    accent: '#fef08a'
  },
  {
    gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)',
    glow: 'rgba(16, 185, 129, 0.45)',
    border: 'rgba(167, 243, 208, 0.4)',
    accent: '#fef08a'
  }
];

export default function OffersAndTargetsView({
  API_URL,
  currentUser,
  onBack,
  referralLink,
  candidatePortalBaseUrl,
  applications = [],
  directJobs = [],
  onNavigateTab,
  showToast
}) {
  const [viewMode, setViewMode] = useState('categories'); // 'categories' | 'free_process' | 'paid_process' | 'bank_detail' | 'combo_detail'
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [selectedComboIdx, setSelectedComboIdx] = useState(0);
  const [copiedText, setCopiedText] = useState(null);
  const [rewardPreference, setRewardPreference] = useState('both'); // 'tab' | 'cash' | 'both'
  const [activeProcess, setActiveProcess] = useState('free'); // 'free' | 'paid'
  const [selectedBank, setSelectedBank] = useState('Bandhan Bank');
  const [loading, setLoading] = useState(true);
  const [programData, setProgramData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProgram = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const hrId = currentUser?.id || '';
      const res = await fetch(`${API_URL}/api/offer-targets/program?hrId=${hrId}`);
      if (res.ok) {
        const json = await res.json();
        setProgramData(json);
      }
    } catch (err) {
      console.error('Error fetching program:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProgram();
  }, [API_URL, currentUser?.id]);

  const program = programData?.program || {
    badgeText: 'SPECIAL RECRUITMENT EVENT',
    programName: 'Special Banking Placement Drive 2026',
    subtitle: 'All 10 Partner Banks Common Drive: Team Target (20 Hires = ₹30k Team Bonus) + Individual Cash Bonuses up to ₹25,000!',
    startDate: '2026-10-29',
    endDate: '2026-11-10',
    daysRemaining: 12,
    isEventActive: true,
    banks: [
      'Bandhan Bank', 'Axis Bank', 'Suryoday Small Finance Bank',
      'Kotak Mahindra Bank', 'IDFC First Bank', 'YES Bank',
      'HDFC Bank', 'ICICI Bank', 'Aditya Birla Capital', 'Mahindra Finance'
    ]
  };

  const bankList = program.banks && program.banks.length > 0 ? program.banks : [
    'Bandhan Bank', 'Axis Bank', 'Suryoday Small Finance Bank',
    'Kotak Mahindra Bank', 'IDFC First Bank', 'YES Bank',
    'HDFC Bank', 'ICICI Bank', 'Aditya Birla Capital', 'Mahindra Finance'
  ];

  const currentBankName = bankList.includes(selectedBank) ? selectedBank : bankList[0];
  const bankStats = programData?.bankStats?.[currentBankName] || {};

  const isFree = activeProcess === 'free';
  const teamProgress = bankStats.freeTeamProgress || {
    targetCount: 20,
    completedCount: 0,
    remainingCount: 20,
    percentage: 0,
    isAchieved: false,
    rewardAmount: 30000,
    rewardTitle: '₹30,000 Team Cash Reward',
    description: `Complete 20 candidates in ${currentBankName} to win ₹30,000 Team Cash Bonus!`
  };

  const individualSlabs = bankStats.freeIndividualSlabs || [
    { count: 5, rewardAmount: 5000, rewardTitle: 'Incentive + ₹5,000 Cash Bonus', description: `Close 5 candidates in ${currentBankName}`, myClosedCount: 0, remainingCount: 5, percentage: 0, isAchieved: false },
    { count: 10, rewardAmount: 10000, rewardTitle: 'Incentive + ₹10,000 Mega Bonus', description: `Close 10 candidates in ${currentBankName}`, myClosedCount: 0, remainingCount: 10, percentage: 0, isAchieved: false },
    { count: 15, rewardAmount: 15000, rewardTitle: 'Incentive + ₹15,000 Super Bonus', description: `Close 15 candidates in ${currentBankName}`, myClosedCount: 0, remainingCount: 15, percentage: 0, isAchieved: false },
    { count: 20, rewardAmount: 25000, rewardTitle: 'Incentive + ₹25,000 Bumper Bonus', description: `Close 20 candidates in ${currentBankName}`, myClosedCount: 0, remainingCount: 20, percentage: 0, isAchieved: false }
  ];

  const paidComboSets = (programData?.paidComboSets && programData.paidComboSets.length > 0)
    ? programData.paidComboSets
    : (programData?.program?.paidComboSets && programData.program.paidComboSets.length > 0)
    ? programData.program.paidComboSets
    : DEFAULT_PAID_COMBO_SETS;

  const bankTheme = BANK_COLORS[currentBankName] || { primary: '#0284c7', bg: '#f0f9ff', border: '#7dd3fc', glow: 'rgba(2, 132, 199, 0.25)' };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleOpenFreeProcess = () => {
    setActiveProcess('free');
    setViewMode('free_process');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPaidProcess = () => {
    setActiveProcess('paid');
    setViewMode('paid_process');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCategories = () => {
    setViewMode('categories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBankDetail = (bName) => {
    setSelectedBank(bName);
    setViewMode('bank_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToBanks = () => {
    setViewMode('free_process');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenComboDetail = (comboSet, idx) => {
    setSelectedCombo(comboSet);
    setSelectedComboIdx(idx);
    setViewMode('combo_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToChallengeSets = () => {
    setViewMode('paid_process');
    setActiveProcess('paid');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const portalBase = candidatePortalBaseUrl || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5173' : 'https://jobs.forgeindiaconnect.in');
  const hrRefCode = currentUser?.referralCode || currentUser?.id || '';
  const defaultRefLink = referralLink || `${portalBase}?ref=${hrRefCode}`;

  const getBrandDetails = (roleString, index) => {
    let rawRole = (roleString || '').trim();
    let bankPart = rawRole;
    let explicitRole = '';

    // Extract format: "Bank Name (Specific Role)"
    const parenMatch = rawRole.match(/^(.*?)\s*\((.*?)\)$/);
    if (parenMatch) {
      bankPart = parenMatch[1].trim();
      explicitRole = parenMatch[2].trim();
    } else if (rawRole.includes(' - ')) {
      const parts = rawRole.split(' - ');
      bankPart = parts[0].trim();
      explicitRole = parts[1].trim();
    }

    const lower = bankPart.toLowerCase().trim();

    // Check if there is a matching job in directJobs with strict non-empty check
    let dynamicJobRole = '';
    if (directJobs && directJobs.length > 0 && lower.length >= 3) {
      const matchedJob = directJobs.find(j => {
        const company = (j.company || j.bankName || '').toLowerCase().trim();
        if (!company || company.length < 3) return false;
        return company.includes(lower) || lower.includes(company);
      });
      if (matchedJob && matchedJob.title) {
        dynamicJobRole = matchedJob.title;
      }
    }

    // Priority: Explicit Role configured in Admin > Dynamic Job Role > Fallback
    const resolvedRole = explicitRole || dynamicJobRole;

    if (lower.includes('birla') || lower.includes('aditya')) {
      const role = resolvedRole || 'Bank Relationship Officer';
      return {
        name: 'Aditya Birla Capital',
        displayName: 'ADITYA BIRLA CAPITAL',
        shortName: 'Aditya Birla',
        brandKey: 'aditya_birla',
        logo: '/logos/aditya_birla.jpg',
        specificRole: role,
        openRoles: role,
        primary: '#b91c1c',
        gradient: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #dc2626 100%)',
        glow: 'rgba(185, 28, 28, 0.45)',
        accent: '#fecaca',
        tag: 'NBFC & Wealth Services',
        category: 'Banking / NBFC',
        salaryRange: '₹2.4L - ₹4.5L CTC + Attractive Incentives',
        minQualification: 'Any Graduate / 12th Pass / MBA',
        description: 'Leading NBFC under Aditya Birla Group with high market reputation and rapid candidate onboarding.',
        whyJoin: 'Rapid promotions, structured training, direct payroll placement, high incentive earnings.'
      };
    }
    if (lower.includes('bandhan')) {
      const role = resolvedRole || 'Customer Relationship Officer';
      return {
        name: 'Bandhan Bank',
        displayName: 'BANDHAN BANK',
        shortName: 'Bandhan Bank',
        brandKey: 'bandhan_bank',
        logo: '/logos/bandhan_bank.png',
        specificRole: role,
        openRoles: role,
        primary: '#0284c7',
        gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 60%, #075985 100%)',
        glow: 'rgba(2, 132, 199, 0.45)',
        accent: '#bae6fd',
        tag: 'Universal Commercial Bank',
        category: 'Commercial Bank',
        salaryRange: '₹2.2L - ₹3.8L CTC + Incentives',
        minQualification: 'Any Degree / 12th Pass',
        description: 'Rapidly growing universal bank delivering retail banking and MSME financial products.',
        whyJoin: 'Strong presence, reliable career increments, fast onboarding.'
      };
    }
    if (lower.includes('suryoday')) {
      const role = resolvedRole || 'Acquisition Manager (AM)';
      return {
        name: 'Suryoday Small Finance Bank',
        displayName: 'Suryoday Small Finance Bank',
        shortName: 'Suryoday Bank',
        brandKey: 'suryoday_bank',
        logo: '/logos/suryoday.webp',
        specificRole: role,
        openRoles: role,
        primary: '#ea580c',
        gradient: 'linear-gradient(135deg, #9a3412 0%, #ea580c 50%, #f97316 100%)',
        glow: 'rgba(234, 88, 12, 0.45)',
        accent: '#fed7aa',
        tag: 'Scheduled Commercial Banking',
        category: 'Small Finance Bank',
        salaryRange: '₹2.2L - ₹3.8L CTC + Quarterly Incentives',
        minQualification: 'Any Degree / +2 Passed candidates',
        description: 'Rapidly expanding scheduled commercial bank with high community impact and fast job offers.',
        whyJoin: 'High job stability, friendly branch environment, rapid promotion to branch team leads.'
      };
    }
    if (lower.includes('axis')) {
      const role = resolvedRole || 'Assistant Manager';
      return {
        name: 'Axis Bank',
        displayName: 'AXIS BANK',
        shortName: 'Axis Bank',
        brandKey: 'axis_bank',
        logo: '/logos/axis_bank.svg',
        specificRole: role,
        openRoles: role,
        primary: '#831843',
        gradient: 'linear-gradient(135deg, #701a75 0%, #831843 50%, #be185d 100%)',
        glow: 'rgba(131, 24, 67, 0.45)',
        accent: '#fbcfe8',
        tag: 'Leading Private Sector Bank',
        category: 'Private Sector Bank',
        salaryRange: '₹2.5L - ₹4.5L CTC + Spot Commission',
        minQualification: 'Any Degree / 10th / 12th',
        description: 'Certified Axis Bank programs with guaranteed branch placement upon assessment.',
        whyJoin: 'High demand specialized banking domain, quick placement turnaround, attractive spot perks.'
      };
    }
    if (lower.includes('tata')) {
      const role = resolvedRole || 'Loan Relationship Executive';
      return {
        name: 'Tata Capital',
        displayName: 'TATA CAPITAL',
        shortName: 'Tata Capital',
        brandKey: 'tata_capital',
        logo: '/logos/tata_aig.png',
        specificRole: role,
        openRoles: role,
        primary: '#0284c7',
        gradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #38bdf8 100%)',
        glow: 'rgba(2, 132, 199, 0.45)',
        accent: '#bae6fd',
        tag: 'Consumer Finance & Lending',
        category: 'Financial Services',
        salaryRange: '₹2.2L - ₹4.0L CTC + Monthly Performance Bonus',
        minQualification: 'Any Degree / Diploma / Experienced',
        description: 'The trusted financial services arm of Tata Group, delivering secure employment and great team culture.',
        whyJoin: 'Tata brand prestige, stable banking hours, healthcare coverage, consistent career increments.'
      };
    }
    if (lower.includes('hdfc')) {
      const role = resolvedRole || 'Personal Banker / Branch Exec';
      return {
        name: 'HDFC Bank',
        displayName: 'HDFC BANK',
        shortName: 'HDFC Bank',
        brandKey: 'hdfc_bank',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg',
        specificRole: role,
        openRoles: role,
        primary: '#1d4ed8',
        gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%)',
        glow: 'rgba(29, 78, 216, 0.45)',
        accent: '#bfdbfe',
        tag: "India's #1 Private Sector Bank",
        category: 'Commercial Bank',
        salaryRange: '₹2.8L - ₹5.5L CTC + Annual Banking Bonus',
        minQualification: 'Any Graduate (Freshers & Experienced eligible)',
        description: "India's largest banking titan offering premier banking certifications, nationwide postings, and executive prestige.",
        whyJoin: "India's premier banking titan, extensive career growth paths, comprehensive banking credentials."
      };
    }
    if (lower.includes('kotak')) {
      const role = resolvedRole || 'Gold Loan Officer';
      return {
        name: 'Kotak Mahindra Bank',
        displayName: 'KOTAK MAHINDRA BANK',
        shortName: 'Kotak Bank',
        brandKey: 'kotak_bank',
        logo: '/logos/kotak_bank.png',
        specificRole: role,
        openRoles: role,
        primary: '#003366',
        gradient: 'linear-gradient(135deg, #0c4a6e 0%, #003366 50%, #1e40af 100%)',
        glow: 'rgba(0, 51, 102, 0.45)',
        accent: '#bfdbfe',
        tag: 'Gold Appraisal & High-Value Lending',
        category: 'Private Sector Bank',
        salaryRange: '₹2.4L - ₹4.5L CTC + Branch Incentives',
        minQualification: 'Any Degree / Final Year Students Welcome',
        description: 'Fast-track placement in Kotak Mahindra Bank branches with professional appraisal certification.',
        whyJoin: 'Prestigious banking banner, fixed working hours, performance bonuses.'
      };
    }
    if (lower.includes('icici')) {
      const role = resolvedRole || 'Branch Relationship Executive';
      return {
        name: 'ICICI Bank',
        displayName: 'ICICI BANK',
        shortName: 'ICICI Bank',
        brandKey: 'icici_bank',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg',
        specificRole: role,
        openRoles: role,
        primary: '#c2410c',
        gradient: 'linear-gradient(135deg, #c2410c 0%, #9a3412 60%, #7c2d12 100%)',
        glow: 'rgba(194, 65, 12, 0.45)',
        accent: '#fed7aa',
        tag: 'Premier Private Sector Bank',
        category: 'Private Sector Bank',
        salaryRange: '₹2.4L - ₹4.2L CTC + Incentives',
        minQualification: 'Any Degree / Final Year Students',
        description: 'Major private banking leader with excellent training programs and nationwide career opportunities.',
        whyJoin: 'High growth potential, established corporate stature.'
      };
    }
    if (lower.includes('mahindra')) {
      const role = resolvedRole || 'Branch Executive / Relationship Officer';
      return {
        name: 'Mahindra Finance',
        displayName: 'MAHINDRA FINANCE',
        shortName: 'Mahindra Finance',
        brandKey: 'mahindra_finance',
        logo: '/logos/mahindra-finance-logo.png',
        specificRole: role,
        openRoles: role,
        primary: '#b91c1c',
        gradient: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #dc2626 100%)',
        glow: 'rgba(185, 28, 28, 0.45)',
        accent: '#fecaca',
        tag: 'Rural & Semi-Urban NBFC Leader',
        category: 'Financial Services',
        salaryRange: '₹2.2L - ₹3.8L CTC + Incentives',
        minQualification: 'Any Graduate / 12th Pass',
        description: 'Leading non-banking finance institution under the Mahindra Group providing vehicular and MSME loans.',
        whyJoin: 'Mahindra brand security, extensive rural-urban branch network, rapid performance increments.'
      };
    }
    if (lower.includes('it') || lower.includes('track') || lower.includes('software') || lower.includes('training')) {
      const role = resolvedRole || 'Full Stack Java / Python Developer';
      return {
        name: 'FIC IT Track',
        displayName: 'FIC IT & SOFTWARE TRACK',
        shortName: 'IT Training',
        brandKey: 'it_training',
        logo: null,
        isItTrack: true,
        specificRole: role,
        openRoles: role,
        primary: '#4f46e5',
        gradient: 'linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #6366f1 100%)',
        glow: 'rgba(99, 102, 241, 0.45)',
        accent: '#c7d2fe',
        tag: 'High Package Tech Placements',
        category: 'IT & Software Programs',
        salaryRange: '₹3.5L - ₹7.0L CTC with 100% Placement Guarantee',
        minQualification: 'B.E / B.Tech / BCA / MCA / B.Sc / Any Degree with coding interest',
        description: 'Specialized tech curriculum with live projects and corporate interview guarantee.',
        whyJoin: 'Top IT salary packages, MNC placement opportunities, hybrid/remote work options.'
      };
    }
    // Pure dynamic resolution: exactly what admin typed in bank and role slots
    const cleanSlotName = bankPart || `Partner Bank Slot ${index + 1}`;
    const cleanDisplayName = cleanSlotName.toUpperCase();
    const fallbackRole = resolvedRole || 'Banking Executive';

    return {
      name: cleanSlotName,
      displayName: cleanDisplayName,
      shortName: cleanSlotName,
      brandKey: `slot_${index + 1}`,
      logo: BANK_LOGOS[bankPart] || null,
      specificRole: fallbackRole,
      openRoles: fallbackRole,
      primary: '#0f172a',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      glow: 'rgba(15, 23, 42, 0.45)',
      accent: '#e2e8f0',
      tag: 'FIC Partner Institution',
      category: 'Banking / Placement Track',
      salaryRange: '₹2.2L - ₹4.5L CTC + Attractive Incentives',
      minQualification: 'Any Degree / 12th Pass',
      description: 'Refer candidates to complete this slot towards unlocking your Grand Bumper Reward!',
      whyJoin: 'Reliable placement partner, attractive incentive payouts.'
    };
  };

  const getSlotMatchingCandidates = (brandInfo) => {
    if (!applications || applications.length === 0) return [];
    const bKey = (brandInfo.shortName || brandInfo.name || '').toLowerCase();
    const roleKey = (brandInfo.specificRole || '').toLowerCase();

    return applications.filter(app => {
      const fullText = `${app.jobTitle || ''} ${app.company || ''} ${app.bankName || ''} ${app.role || ''} ${app.programName || ''}`.toLowerCase();
      
      let bankMatched = false;
      if (bKey.includes('birla') || bKey.includes('aditya')) {
        bankMatched = fullText.includes('birla') || fullText.includes('aditya');
      } else if (bKey.includes('tata')) {
        bankMatched = fullText.includes('tata');
      } else if (bKey.includes('hdfc')) {
        bankMatched = fullText.includes('hdfc');
      } else if (bKey.includes('axis')) {
        bankMatched = fullText.includes('axis');
      } else if (bKey.includes('kotak')) {
        bankMatched = fullText.includes('kotak');
      } else if (bKey.includes('suryoday')) {
        bankMatched = fullText.includes('suryoday');
      } else if (bKey.includes('it') || brandInfo.isItTrack) {
        bankMatched = fullText.includes('it') || fullText.includes('software') || fullText.includes('training') || fullText.includes('developer') || fullText.includes('python') || fullText.includes('java');
      } else {
        bankMatched = fullText.includes(bKey);
      }

      if (!bankMatched) return false;

      // If specific role exists, check if role words match too
      if (roleKey && roleKey.length > 3) {
        const roleTokens = roleKey.split(/[\s,()/-]+/).filter(t => t.length > 2);
        const hasRoleTokenMatch = roleTokens.some(tok => fullText.includes(tok));
        if (hasRoleTokenMatch) return true;
      }

      return bankMatched;
    });
  };

  const handleShareBrandWhatsApp = (brandInfo) => {
    const roleParam = brandInfo.specificRole ? `&role=${encodeURIComponent(brandInfo.specificRole)}` : '';
    const link = `${portalBase}?ref=${hrRefCode}&brand=${encodeURIComponent(brandInfo.shortName)}${roleParam}`;
    const msg = `🌟 *Special Recruitment Drive: ${brandInfo.name}*\n\n` +
      `💼 *Designation:* ${brandInfo.specificRole || brandInfo.openRoles}\n` +
      `💰 *Salary / CTC:* ${brandInfo.salaryRange}\n` +
      `🎓 *Eligibility:* ${brandInfo.minQualification}\n\n` +
      `📌 *Direct Application Link:* ${link}\n\n` +
      `Apply now to get fast-track interview scheduling!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleCopyBrandLink = (brandInfo) => {
    const roleParam = brandInfo.specificRole ? `&role=${encodeURIComponent(brandInfo.specificRole)}` : '';
    const link = `${portalBase}?ref=${hrRefCode}&brand=${encodeURIComponent(brandInfo.shortName)}${roleParam}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        setCopiedText(brandInfo.shortName);
        if (showToast) showToast(`Referral link for ${brandInfo.name} (${brandInfo.specificRole}) copied!`, 'success');
        setTimeout(() => setCopiedText(null), 2500);
      });
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0.75rem 0.6rem 3.5rem' }}>
      {/* TOP NAVIGATION BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {viewMode === 'bank_detail' ? (
            <button
              onClick={handleBackToBanks}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1.5px solid #0284c7',
                color: '#0369a1',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.12)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
            >
              <ArrowLeft size={16} />
              <span>← Back to All Banks</span>
            </button>
          ) : viewMode === 'combo_detail' ? (
            <button
              onClick={handleBackToChallengeSets}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1.5px solid #4f46e5',
                color: '#4338ca',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.15)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
            >
              <ArrowLeft size={16} />
              <span>← Back to Combo Sets</span>
            </button>
          ) : (viewMode === 'free_process' || viewMode === 'paid_process') ? (
            <button
              onClick={handleBackToCategories}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#334155',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
            >
              <ArrowLeft size={16} />
              <span>← Back to Hub</span>
            </button>
          ) : (
            <button
              onClick={onBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}

          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            <span>Dashboard</span>
            <span style={{ margin: '0 5px' }}>/</span>
            <span
              onClick={viewMode !== 'categories' ? handleBackToCategories : undefined}
              style={{
                cursor: viewMode !== 'categories' ? 'pointer' : 'default',
                color: viewMode !== 'categories' ? '#0284c7' : '#0f172a',
                fontWeight: viewMode !== 'categories' ? 600 : 700
              }}
            >
              Offers & Targets
            </span>

            {viewMode === 'free_process' && (
              <>
                <span style={{ margin: '0 5px' }}>/</span>
                <span style={{ fontWeight: 800, color: '#ea580c' }}>Free Process (10 Partner Banks)</span>
              </>
            )}

            {viewMode === 'bank_detail' && (
              <>
                <span style={{ margin: '0 5px' }}>/</span>
                <span
                  onClick={handleBackToBanks}
                  style={{ cursor: 'pointer', color: '#0284c7', fontWeight: 600 }}
                >
                  Free Process
                </span>
                <span style={{ margin: '0 5px' }}>/</span>
                <span style={{ fontWeight: 800, color: bankTheme.primary }}>{currentBankName}</span>
              </>
            )}

            {viewMode === 'paid_process' && (
              <>
                <span style={{ margin: '0 5px' }}>/</span>
                <span style={{ fontWeight: 800, color: '#4338ca' }}>Paid Process (FIC Training Sets)</span>
              </>
            )}

            {viewMode === 'combo_detail' && selectedCombo && (
              <>
                <span style={{ margin: '0 5px' }}>/</span>
                <span
                  onClick={handleBackToChallengeSets}
                  style={{ cursor: 'pointer', color: '#4f46e5', fontWeight: 600 }}
                >
                  Paid Process
                </span>
                <span style={{ margin: '0 5px' }}>/</span>
                <span style={{ fontWeight: 800, color: '#1e1b4b' }}>{selectedCombo.title}</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => fetchProgram(true)}
          disabled={refreshing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            color: '#475569',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* VIEW MODE 1: CATEGORY SELECTION (2 KPI CARDS: FREE vs PAID)   */}
      {/* ============================================================== */}
      {viewMode === 'categories' && (
        <div>
          {/* HERO CAMPAIGN BANNER */}
          <div
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #d97706 40%, #b45309 80%, #7c2d12 100%)',
              borderRadius: '20px',
              padding: 'clamp(1.2rem, 3.5vw, 2.2rem)',
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 16px 36px -12px rgba(234, 88, 12, 0.4)',
              marginBottom: '1.5rem'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '220px',
                height: '220px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <span
                  style={{
                    background: '#ffffff',
                    color: '#c2410c',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Flame size={13} color="#ea580c" />
                  {program.badgeText || 'SPECIAL RECRUITMENT EVENT'}
                </span>

                {program.isEventActive ? (
                  <span
                    style={{
                      background: 'rgba(254, 240, 138, 0.25)',
                      border: '1px solid #fef08a',
                      color: '#fef08a',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Clock size={12} />
                    ENDS IN {program.daysRemaining} DAYS
                  </span>
                ) : (
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}
                  >
                    EVENT COMPLETED
                  </span>
                )}

                <span style={{ fontSize: '0.78rem', color: '#fed7aa', fontWeight: 600 }}>
                  📅 {formatDate(program.startDate)} — {formatDate(program.endDate)}
                </span>
              </div>

              <h1
                style={{
                  margin: '0 0 6px',
                  fontSize: 'clamp(1.35rem, 3.5vw, 2.1rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.5px',
                  lineHeight: 1.25,
                  textShadow: '0 2px 4px rgba(0,0,0,0.15)'
                }}
              >
                {program.programName}
              </h1>

              <p
                style={{
                  margin: '0',
                  fontSize: '0.9rem',
                  color: '#ffedd5',
                  maxWidth: '850px',
                  lineHeight: 1.45
                }}
              >
                {program.subtitle}
              </p>
            </div>
          </div>

          {/* TWO CATEGORY CARDS: FREE PROCESS vs PAID PROCESS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '2rem'
            }}
          >
            {/* CARD 1: FREE PROCESS (10 DIRECT BANKING DRIVES) */}
            <div
              onClick={handleOpenFreeProcess}
              style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 60%, #9a3412 100%)',
                borderRadius: '18px',
                padding: '1.4rem 1.3rem',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 12px 28px -6px rgba(234, 88, 12, 0.45)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '210px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 18px 36px -6px rgba(234, 88, 12, 0.55)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(234, 88, 12, 0.45)';
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-35px',
                  right: '-35px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                        flexShrink: 0
                      }}
                    >
                      <Building2 size={22} color="#ea580c" />
                    </div>
                    <div>
                      <span
                        style={{
                          background: 'rgba(255, 255, 255, 0.22)',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        DIRECT BANKING DRIVES
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#ffedd5', fontWeight: 700, marginTop: '2px' }}>
                        10 Partner Banks Common Drive
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      background: '#ffffff',
                      color: '#c2410c',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 900
                    }}
                  >
                    CASH BONUSES 💰
                  </span>
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.25 }}>
                  Free Process (10 Direct Banking Drives)
                </h3>

                <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#ffedd5', lineHeight: 1.45 }}>
                  Free direct hiring drives across 10 partner banks. Team Target (20 Hires = ₹30k Team Bonus) + Individual Cash Bonuses up to ₹25,000!
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                    🏦 10 Partner Banks
                  </span>
                  <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                    👥 ₹30k Team Bonus
                  </span>
                  <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                    🎯 Up to ₹25k Individual Cash
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  color: '#c2410c',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                <span>Select Bank to View Targets</span>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* CARD 2: PAID PROCESS (FIC TRAINING & PLACEMENT) */}
            <div
              onClick={handleOpenPaidProcess}
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 60%, #4338ca 100%)',
                borderRadius: '18px',
                padding: '1.4rem 1.3rem',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 12px 28px -6px rgba(49, 46, 129, 0.45)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '210px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 18px 36px -6px rgba(49, 46, 129, 0.55)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(49, 46, 129, 0.45)';
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-35px',
                  right: '-35px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                        flexShrink: 0
                      }}
                    >
                      <Tablet size={22} color="#312e81" />
                    </div>
                    <div>
                      <span
                        style={{
                          background: 'rgba(255, 255, 255, 0.22)',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        FIC TRAINING & PLACEMENT
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#c7d2fe', fontWeight: 700, marginTop: '2px' }}>
                        4 Specialized Combo Sets
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      background: '#fef08a',
                      color: '#854d0e',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 900
                    }}
                  >
                    WIN TAB / ₹25k 📱
                  </span>
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.25 }}>
                  Paid Process (FIC Training & Placement)
                </h3>

                <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#e0e7ff', lineHeight: 1.45 }}>
                  Enroll candidates in any of the 4 specialized FIC Training Combo Sets. Win a Brand New TAB (Tablet) OR ₹25,000 Direct Cash Prize!
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                    📱 Brand New TAB
                  </span>
                  <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                    💰 ₹25,000 Cash Prize
                  </span>
                  <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                    🏆 4 Challenge Sets
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  color: '#312e81',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                <span>View Combo Challenges</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>

          {/* FOOTER INFO & GUIDELINES */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
              <strong style={{ color: '#0f172a' }}>Drive Terms & Guidelines:</strong> Candidates closed in any partner bank during the active drive period (<strong>{formatDate(program.startDate)} — {formatDate(program.endDate)}</strong>) count towards both the Team Bonus and Individual Cash Rewards. In FIC Training, closing any of the 4 Combo Sets unlocks a Brand New Tablet or ₹25,000 Cash on top of all referral incentives.
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW MODE 2: FREE PROCESS - 10 PARTNER BANKS GRID              */}
      {/* ============================================================== */}
      {viewMode === 'free_process' && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#ea580c" />
                <span>Select Bank to View Target & Reward Details</span>
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Click any partner bank below to open its dedicated Team Goal and Individual Bonus Slabs page.
              </p>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#c2410c', background: '#fff7ed', border: '1px solid #fdba74', padding: '4px 12px', borderRadius: '12px' }}>
              10 Partner Banks
            </span>
          </div>

          <style>{`
            .partner-banks-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
              gap: 14px;
            }
            @media (max-width: 768px) {
              .partner-banks-grid {
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 10px !important;
              }
              .partner-bank-card {
                padding: 0.85rem 0.75rem 0.75rem !important;
                border-radius: 14px !important;
                min-height: 160px !important;
              }
              .partner-bank-logo {
                width: 36px !important;
                height: 36px !important;
              }
              .partner-bank-name {
                font-size: 0.88rem !important;
              }
              .partner-bank-desc {
                font-size: 0.7rem !important;
                line-height: 1.3 !important;
                min-height: 28px !important;
              }
            }
          `}</style>

          <div className="partner-banks-grid">
            {bankList.map((bName) => {
              const bConfig = BANK_COLORS[bName] || {
                primary: '#ea580c',
                gradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                glow: 'rgba(234, 88, 12, 0.45)',
                desc: 'Scheduled commercial bank partner for 2026 placement drive.'
              };
              const bStats = programData?.bankStats?.[bName];
              const closedCount = bStats?.teamClosedFree || 0;
              const targetCount = bStats?.freeTeamProgress?.targetCount || 20;

              return (
                <div
                  key={bName}
                  onClick={() => handleOpenBankDetail(bName)}
                  className="partner-bank-card"
                  style={{
                    background: bConfig.gradient,
                    borderRadius: '16px',
                    padding: '1.1rem 1rem 0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '175px',
                    boxShadow: `0 10px 24px -4px ${bConfig.glow || 'rgba(0,0,0,0.35)'}`,
                    color: '#ffffff',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 16px 32px -4px ${bConfig.glow || 'rgba(0,0,0,0.45)'}`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = `0 10px 24px -4px ${bConfig.glow || 'rgba(0,0,0,0.35)'}`;
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-25px',
                      right: '-25px',
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
                      pointerEvents: 'none'
                    }}
                  />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div
                        className="partner-bank-logo"
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          padding: '4px',
                          flexShrink: 0,
                          boxShadow: '0 3px 8px rgba(0,0,0,0.15)'
                        }}
                      >
                        {BANK_LOGOS[bName] ? (
                          <img
                            src={BANK_LOGOS[bName]}
                            alt={bName}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <span style={{ fontWeight: 900, color: bConfig.primary, fontSize: '1rem' }}>
                            {bName.charAt(0)}
                          </span>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="partner-bank-name"
                          style={{
                            fontSize: '0.96rem',
                            fontWeight: 800,
                            color: '#ffffff',
                            lineHeight: 1.25,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={bName}
                        >
                          {bName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.92)', fontWeight: 600, marginTop: '2px' }}>
                          Target: <strong style={{ color: '#ffffff' }}>{targetCount} Hires</strong>
                        </div>
                      </div>
                    </div>

                    <p
                      className="partner-bank-desc"
                      style={{
                        margin: '0',
                        fontSize: '0.74rem',
                        color: 'rgba(255, 255, 255, 0.88)',
                        lineHeight: 1.38,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '32px'
                      }}
                    >
                      {bConfig.desc || 'Premier partner banking institution with dedicated drive vacancies.'}
                    </p>
                  </div>

                  <div
                    style={{
                      paddingTop: '8px',
                      marginTop: '8px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.22)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '4px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: '#ffffff',
                        background: 'rgba(0, 0, 0, 0.22)',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {closedCount} Closed
                    </span>

                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span>View</span>
                      <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FOOTER INFO & GUIDELINES */}
          <div
            style={{
              marginTop: '1.5rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
              <strong style={{ color: '#0f172a' }}>Direct Banking Drive Info:</strong> Candidates closed in any partner bank count towards both the Team Bonus (₹30k for 20 hires) and Individual Cash Bonuses up to ₹25,000.
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW MODE 3: PAID PROCESS - 4 FIC TRAINING COMBO SETS GRID    */}
      {/* ============================================================== */}
      {viewMode === 'paid_process' && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tablet size={20} color="#4f46e5" />
                <span>FIC Training & Placement Combo Sets</span>
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Select any of the 4 combo sets below to view its details and claim Brand New TAB or ₹25,000 Cash!
              </p>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#4338ca', background: '#eef2ff', border: '1px solid #c7d2fe', padding: '4px 12px', borderRadius: '12px' }}>
              4 Challenge Sets
            </span>
          </div>

          <style>{`
            .paid-sets-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
              gap: 14px;
            }
            @media (max-width: 768px) {
              .paid-sets-grid {
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 10px !important;
              }
              .paid-set-card {
                padding: 0.85rem 0.75rem 0.75rem !important;
                border-radius: 14px !important;
                min-height: 165px !important;
              }
              .paid-set-name {
                font-size: 0.88rem !important;
              }
            }
          `}</style>

          <div className="paid-sets-grid">
            {paidComboSets.map((set, idx) => {
              const theme = COMBO_CARD_THEMES[idx % COMBO_CARD_THEMES.length];
              const rolesList = Array.isArray(set.roles)
                ? set.roles
                : typeof set.roles === 'string'
                ? set.roles.split(',').map(r => r.trim()).filter(Boolean)
                : [];

              const completed = set.completedCount || 0;
              const target = Number(set.targetCount) || 3;
              const isAchieved = set.isAchieved || completed >= target;

              return (
                <div
                  key={set.id || idx}
                  onClick={() => handleOpenComboDetail(set, idx)}
                  className="paid-set-card"
                  style={{
                    background: theme.gradient,
                    borderRadius: '16px',
                    padding: '1.1rem 1rem 0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '175px',
                    boxShadow: `0 10px 24px -4px ${theme.glow}`,
                    color: '#ffffff',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 16px 32px -4px ${theme.glow}`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = `0 10px 24px -4px ${theme.glow}`;
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-25px',
                      right: '-25px',
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
                      pointerEvents: 'none'
                    }}
                  />

                  <div>
                    {/* TOP ROW: SET BADGE + TARGET */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.35)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        SET {idx + 1}
                      </span>

                      <span style={{ fontSize: '0.72rem', color: '#fef08a', fontWeight: 800 }}>
                        Target: {target} Hires
                      </span>
                    </div>

                    {/* SET TITLE */}
                    <div
                      className="paid-set-name"
                      style={{
                        fontSize: '0.96rem',
                        fontWeight: 900,
                        color: '#ffffff',
                        lineHeight: 1.25,
                        marginBottom: '6px'
                      }}
                    >
                      {set.title}
                    </div>

                    {/* REQUIRED COMBO ROLES PREVIEW (SHOW CLEAN BANK NAMES ONLY) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                      {rolesList.map((r, rIdx) => {
                        const cleanBankName = typeof r === 'string'
                          ? r.replace(/\s*\(.*?\)/g, '').split(' - ')[0].trim()
                          : r;
                        return (
                          <span
                            key={rIdx}
                            style={{
                              background: 'rgba(255, 255, 255, 0.22)',
                              color: '#ffffff',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {cleanBankName}
                          </span>
                        );
                      })}
                    </div>

                    {/* REWARD BADGE */}
                    <div style={{ fontSize: '0.72rem', color: '#fef08a', fontWeight: 800 }}>
                      🎁 Brand New TAB or ₹25,000 Cash
                    </div>
                  </div>

                  {/* BOTTOM ROW: STATUS + ACTION BUTTON */}
                  <div
                    style={{
                      paddingTop: '8px',
                      marginTop: '8px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.22)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '4px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: '#ffffff',
                        background: isAchieved ? '#10b981' : 'rgba(0, 0, 0, 0.25)',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {isAchieved ? '✓ Achieved' : `${completed}/${target} Hires`}
                    </span>

                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span>View</span>
                      <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FOOTER INFO & GUIDELINES */}
          <div
            style={{
              marginTop: '1.5rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
              <strong style={{ color: '#0f172a' }}>Combo Set Guidelines:</strong> Achieving any of the 4 combo sets unlocks a Brand New Tablet or ₹25,000 Direct Cash on top of all standard candidate placement referral incentives.
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW MODE 2: DEDICATED BANK PAGE (FREE PROCESS SUB-PAGE)       */}
      {/* ============================================================== */}
      {viewMode === 'bank_detail' && (
        <div>
          {/* DEDICATED BANK HERO HEADER */}
          <div
            style={{
              background: bankTheme.bg,
              border: `2px solid ${bankTheme.border}`,
              borderRadius: '18px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: `0 6px 20px -6px ${bankTheme.glow || 'rgba(0,0,0,0.06)'}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: `1.5px solid ${bankTheme.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  flexShrink: 0
                }}
              >
                {BANK_LOGOS[currentBankName] ? (
                  <img src={BANK_LOGOS[currentBankName]} alt={currentBankName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Building2 size={24} color={bankTheme.primary} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: 'clamp(1.15rem, 3.5vw, 1.45rem)', fontWeight: 900, color: bankTheme.primary, lineHeight: 1.2 }}>
                    {currentBankName}
                  </h1>
                  <span
                    style={{
                      background: '#ffffff',
                      color: bankTheme.primary,
                      border: `1px solid ${bankTheme.border}`,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.7rem',
                      fontWeight: 800
                    }}
                  >
                    Free Process
                  </span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#475569' }}>
                  Targets & Milestones for candidates placed in <strong>{currentBankName}</strong>.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', paddingTop: '4px', borderTop: `1px solid ${bankTheme.border}` }}>
              <div
                style={{
                  background: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: `1.5px solid ${bankTheme.border}`,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#334155'
                }}
              >
                Your Closures: <strong style={{ color: bankTheme.primary, fontSize: '1rem' }}>{individualSlabs[0]?.myClosedCount || 0}</strong>
              </div>
            </div>
          </div>

          {/* SECTION 1: TEAM TARGET */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={20} color="#2563eb" />
                  <span>{currentBankName} Collective Team Goal</span>
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  All HR team members & branches work together to unlock this big cash reward pool!
                </p>
              </div>
              <span
                style={{
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  padding: '3px 10px',
                  borderRadius: '14px',
                  fontSize: '0.7rem',
                  fontWeight: 900
                }}
              >
                👥 WHOLE TEAM COMBINED
              </span>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #172554 100%)',
                borderRadius: '18px',
                border: '1.5px solid rgba(245, 158, 11, 0.45)',
                boxShadow: '0 12px 30px -8px rgba(15, 23, 42, 0.45)',
                padding: 'clamp(1rem, 3vw, 1.75rem)',
                color: '#ffffff',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      color: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                      {teamProgress.rewardTitle || `₹${Number(teamProgress.rewardAmount).toLocaleString('en-IN')} Team Cash Reward`}
                    </h3>
                    <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.35 }}>
                      {teamProgress.description}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    background: teamProgress.isAchieved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                    border: teamProgress.isAchieved ? '1.5px solid #10b981' : '1.5px solid #f59e0b',
                    padding: '6px 14px',
                    borderRadius: '12px',
                    textAlign: 'right'
                  }}
                >
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 900, color: teamProgress.isAchieved ? '#34d399' : '#fef08a' }}>
                    {teamProgress.isAchieved ? '🎉 GOAL UNLOCKED' : 'CASH REWARD'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: teamProgress.isAchieved ? '#34d399' : '#fbbf24' }}>
                    ₹{Number(teamProgress.rewardAmount).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 800, marginBottom: '6px' }}>
                  <span style={{ color: '#e2e8f0' }}>
                    Collective Progress: <strong style={{ color: '#38bdf8' }}>{teamProgress.completedCount} Hires</strong> / {teamProgress.targetCount}
                  </span>
                  <span style={{ color: '#fbbf24' }}>
                    {teamProgress.percentage}%
                  </span>
                </div>

                <div style={{ width: '100%', height: '14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.12)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${teamProgress.percentage}%`,
                      background: 'linear-gradient(90deg, #38bdf8 0%, #6366f1 50%, #f59e0b 100%)',
                      borderRadius: '8px',
                      transition: 'width 0.6s ease'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '8px 4px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>TEAM CLOSURES</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>{teamProgress.completedCount}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '8px 4px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.64rem', color: '#fcd34d', fontWeight: 800, textTransform: 'uppercase' }}>REMAINING</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fbbf24', marginTop: '2px' }}>{teamProgress.remainingCount} <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Hires</span></div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '8px 4px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.64rem', color: '#6ee7b7', fontWeight: 800, textTransform: 'uppercase' }}>REWARD POOL</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>₹{Number(teamProgress.rewardAmount).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: INDIVIDUAL MILESTONE LADDER */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={20} color="#059669" />
                  <span>{currentBankName} Personal Milestone Ladder</span>
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Direct cash bonuses earned exclusively by you and credited straight to your personal payout!
                </p>
              </div>
              <span
                style={{
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  padding: '3px 10px',
                  borderRadius: '14px',
                  fontSize: '0.7rem',
                  fontWeight: 900
                }}
              >
                🎯 YOUR PERSONAL BONUS LADDER
              </span>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #065f46 100%)',
                borderRadius: '18px',
                border: '1.5px solid rgba(52, 211, 153, 0.4)',
                boxShadow: '0 12px 30px -8px rgba(6, 78, 59, 0.45)',
                padding: 'clamp(1rem, 3vw, 1.75rem)',
                color: '#ffffff',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: 'rgba(52, 211, 153, 0.2)',
                      border: '1px solid rgba(52, 211, 153, 0.4)',
                      color: '#34d399',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Gift size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                      Personal Cash Rewards Roadmap
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#a7f3d0' }}>
                      Close candidates in {currentBankName} to climb the tiers and win up to ₹25,000 cash!
                    </p>
                  </div>
                </div>

                {(() => {
                  const myCount = individualSlabs[0]?.myClosedCount || 0;
                  const nextSlab = individualSlabs.find(s => !s.isAchieved);
                  return (
                    <div
                      style={{
                        background: 'rgba(52, 211, 153, 0.15)',
                        border: '1.5px solid #10b981',
                        padding: '6px 14px',
                        borderRadius: '12px',
                        textAlign: 'right'
                      }}
                    >
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 900, color: '#6ee7b7' }}>
                        YOUR CURRENT PROGRESS
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                        <span style={{ color: '#34d399' }}>{myCount}</span> Closures
                      </div>
                      {nextSlab && (
                        <div style={{ fontSize: '0.68rem', color: '#fef08a', fontWeight: 700, marginTop: '2px' }}>
                          Need {nextSlab.remainingCount} more to win ₹{Number(nextSlab.rewardAmount).toLocaleString('en-IN')}!
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {(() => {
                const myCount = individualSlabs[0]?.myClosedCount || 0;
                const maxTarget = individualSlabs[individualSlabs.length - 1]?.count || 20;
                const fillPercent = Math.min(100, Math.max(0, (myCount / maxTarget) * 100));

                return (
                  <div style={{ margin: '1.75rem 0 1.5rem', position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        top: '19px',
                        left: '4%',
                        right: '4%',
                        height: '6px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '3px',
                        zIndex: 0
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${fillPercent}%`,
                          background: 'linear-gradient(90deg, #34d399 0%, #10b981 70%, #facc15 100%)',
                          borderRadius: '3px',
                          boxShadow: '0 0 10px rgba(52, 211, 153, 0.8)',
                          transition: 'width 0.6s ease'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                      {individualSlabs.map((slab, idx) => {
                        const isAchieved = slab.isAchieved;
                        const isNext = !isAchieved && (idx === 0 || individualSlabs[idx - 1]?.isAchieved);
                        const tierMedal = idx === 0 ? '🥉' : idx === 1 ? '🥈' : idx === 2 ? '🥇' : '💎';

                        return (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '24%' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                background: isAchieved ? '#10b981' : isNext ? '#064e3b' : 'rgba(255, 255, 255, 0.12)',
                                border: isAchieved ? '2.5px solid #a7f3d0' : isNext ? '2.5px solid #34d399' : '2px solid rgba(255, 255, 255, 0.25)',
                                color: isAchieved ? '#ffffff' : isNext ? '#34d399' : '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                boxShadow: isNext ? '0 0 14px rgba(52, 211, 153, 0.7)' : isAchieved ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none'
                              }}
                            >
                              {isAchieved ? <Check size={18} strokeWidth={3} /> : <span>{tierMedal}</span>}
                            </div>

                            <div style={{ marginTop: '8px' }}>
                              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: isAchieved ? '#6ee7b7' : isNext ? '#ffffff' : '#cbd5e1' }}>
                                {slab.count} Hires
                              </div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 900, color: isAchieved ? '#34d399' : '#fcd34d', marginTop: '1px' }}>
                                ₹{Number(slab.rewardAmount).toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '1.25rem' }}>
                {individualSlabs.map((slab, idx) => {
                  const isAchieved = slab.isAchieved;
                  const remaining = slab.remainingCount || 0;
                  const tierTitles = ['Tier 1', 'Tier 2', 'Tier 3', 'Elite Tier'];
                  const tierMedal = idx === 0 ? '🥉' : idx === 1 ? '🥈' : idx === 2 ? '🥇' : '💎';

                  return (
                    <div
                      key={idx}
                      style={{
                        background: isAchieved ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.06)',
                        border: isAchieved ? '1.5px solid #34d399' : '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '12px',
                        padding: '10px 8px',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 800, color: isAchieved ? '#6ee7b7' : '#cbd5e1' }}>
                        <span>{tierMedal}</span>
                        <span>{tierTitles[idx] || `Milestone ${idx + 1}`}</span>
                      </div>

                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: isAchieved ? '#34d399' : '#fef08a', marginTop: '2px' }}>
                        ₹{Number(slab.rewardAmount).toLocaleString('en-IN')}
                      </div>

                      <div style={{ fontSize: '0.68rem', color: '#a7f3d0', marginTop: '1px' }}>
                        Target: <strong>{slab.count} Hires</strong>
                      </div>

                      <div
                        style={{
                          marginTop: '6px',
                          padding: '3px 6px',
                          borderRadius: '6px',
                          background: isAchieved ? '#059669' : 'rgba(0, 0, 0, 0.25)',
                          fontSize: '0.64rem',
                          fontWeight: 800,
                          color: isAchieved ? '#ffffff' : '#94a3b8',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        {isAchieved ? (
                          <>
                            <CheckCircle2 size={11} />
                            <span>UNLOCKED</span>
                          </>
                        ) : (
                          <>
                            <Lock size={10} />
                            <span>Need {remaining}</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={handleBackToBanks}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 24px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1.5px solid #0284c7',
                color: '#0369a1',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(2, 132, 199, 0.12)'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
            >
              <ArrowLeft size={16} />
              <span>← Back to All Partner Banks</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW MODE 4: SINGLE KPI CARD FOR COMBO CHALLENGE DETAIL       */}
      {/* ============================================================== */}
      {viewMode === 'combo_detail' && selectedCombo && (() => {
        const theme = COMBO_CARD_THEMES[selectedComboIdx % COMBO_CARD_THEMES.length];
        const rolesList = Array.isArray(selectedCombo.roles)
          ? selectedCombo.roles
          : typeof selectedCombo.roles === 'string'
          ? selectedCombo.roles.split(',').map(r => r.trim()).filter(Boolean)
          : [];

        const brandSlots = rolesList.map((rName, idx) => {
          const brandInfo = getBrandDetails(rName, idx);
          const matchingApps = getSlotMatchingCandidates(brandInfo);
          const closedOrSelected = matchingApps.filter(app => {
            const s = String(app.status || '').toLowerCase().trim();
            if (s.includes('reject') || s.includes('not interested') || s.includes('drop') || s.includes('pending')) return false;
            return s.includes('select') || s.includes('closed') || s.includes('joined') || s.includes('hired') || s.includes('convert') || s.includes('enroll');
          });
          const inProgressApps = matchingApps.filter(app => {
            const s = String(app.status || '').toLowerCase().trim();
            return !s.includes('reject') && !s.includes('not interested') && !s.includes('drop') && !closedOrSelected.includes(app);
          });
          const isSlotCompleted = closedOrSelected.length > 0;
          const isSlotInProgress = !isSlotCompleted && inProgressApps.length > 0;
          return {
            ...brandInfo,
            slotNumber: idx + 1,
            matchingApps,
            closedOrSelected,
            inProgressApps,
            isSlotCompleted,
            isSlotInProgress
          };
        });

        const targetHires = Number(selectedCombo.targetCount || brandSlots.length || 3);
        const totalSlotsCount = brandSlots.length || 3;

        // Unique candidates who have been closed/selected/hired/enrolled across this combo
        const uniqueClosedCandidates = [];
        brandSlots.forEach(slot => {
          (slot.closedOrSelected || []).forEach(app => {
            const id = app.id || app._id || `${app.candidateName || ''}_${app.jobTitle || ''}_${app.bankName || ''}`;
            if (!uniqueClosedCandidates.includes(id)) {
              uniqueClosedCandidates.push(id);
            }
          });
        });
        const enrolledHiresCount = Math.max(uniqueClosedCandidates.length, brandSlots.filter(s => s.isSlotCompleted).length);
        const comboPercentage = targetHires > 0 ? Math.min(100, Math.round((enrolledHiresCount / targetHires) * 100)) : 0;
        const isComboAchieved = enrolledHiresCount >= targetHires;
        const remainingSlotsCount = Math.max(0, targetHires - enrolledHiresCount);
        const rewardAmountFormatted = Number(selectedCombo.rewardAmount || 25000).toLocaleString('en-IN');

        return (
          <div style={{ maxWidth: '860px', margin: '0 auto', animation: 'fadeIn 0.22s ease' }}>
            <style>{`
              .combo-poster-canvas {
                background: linear-gradient(180deg, #f0f7ff 0%, #ffffff 32%, #fffdf5 70%, #fff7ed 100%);
                border-radius: 24px;
                border: 2px solid #93c5fd;
                box-shadow: 0 20px 48px -12px rgba(2, 132, 199, 0.25), 0 4px 16px rgba(0,0,0,0.06);
                padding: 1.5rem;
                position: relative;
                overflow: hidden;
              }
              .combo-top-ribbon-wrap {
                display: flex;
                justifyContent: center;
                margin-bottom: 14px;
              }
              .combo-top-ribbon {
                background: linear-gradient(180deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
                color: #ffffff;
                padding: 8px 24px;
                border-radius: 999px;
                font-size: 1.05rem;
                font-weight: 900;
                text-align: center;
                box-shadow: 0 5px 16px rgba(185, 28, 28, 0.45), inset 0 1px 0 rgba(255,255,255,0.4);
                border: 2px solid #ffffff;
                letter-spacing: 0.3px;
                line-height: 1.35;
                display: inline-block;
              }
              .combo-banks-grid {
                display: grid;
                grid-template-columns: repeat(${brandSlots.length <= 2 ? brandSlots.length : 3}, minmax(0, 1fr));
                gap: 12px;
                margin-bottom: 14px;
              }
              .combo-bank-card {
                background: #ffffff;
                border-radius: 16px;
                padding: 14px 10px 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                position: relative;
                box-sizing: border-box;
                min-width: 0 !important;
                width: 100%;
                overflow: hidden;
              }
              .combo-bank-logo-box {
                height: 44px;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 6px;
              }
              .combo-bank-logo-img {
                max-height: 42px;
                max-width: 145px;
                object-fit: contain;
              }
              .combo-bank-name {
                font-size: 0.76rem;
                font-weight: 800;
                color: #1e293b;
                line-height: 1.25;
                min-height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                width: 100%;
                white-space: normal;
                word-break: break-word;
                overflow-wrap: break-word;
                padding: 0 2px;
                box-sizing: border-box;
              }
              .combo-bank-role-badge {
                background: linear-gradient(180deg, #fef9c3 0%, #fef08a 100%);
                border: 1.5px solid #fde047;
                color: #713f12;
                padding: 5px 6px;
                border-radius: 8px;
                font-size: 0.76rem;
                font-weight: 900;
                margin-top: 8px;
                width: 100%;
                box-shadow: 0 2px 6px rgba(234, 179, 8, 0.25);
                white-space: normal;
                word-break: break-word;
                line-height: 1.25;
                min-height: 38px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                box-sizing: border-box;
              }
              .combo-bank-action-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                margin-top: 10px;
                padding-top: 8px;
                border-top: 1px solid #f1f5f9;
                gap: 4px;
              }
              .combo-bank-slot-pill {
                font-size: 0.72rem;
                font-weight: 800;
                padding: 3px 8px;
                border-radius: 6px;
                display: inline-flex;
                align-items: center;
                gap: 3px;
                white-space: nowrap;
              }
              .combo-bank-action-btn {
                border-radius: 6px;
                padding: 4px 7px;
                cursor: pointer;
                display: flex;
                align-items: center;
              }
              .combo-blue-target {
                background: linear-gradient(90deg, #0284c7 0%, #1e40af 50%, #0369a1 100%);
                border-radius: 16px;
                padding: 12px 20px;
                color: #ffffff;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 14px 0;
                box-shadow: 0 8px 24px rgba(2, 132, 199, 0.35);
                border: 1.5px solid #7dd3fc;
                flex-wrap: nowrap;
                gap: 10px;
              }
              .combo-target-text-main {
                font-size: clamp(1.05rem, 2.8vw, 1.45rem);
                font-weight: 900;
                letter-spacing: 0.5px;
                line-height: 1.2;
              }
              .combo-target-text-sub {
                font-size: 0.84rem;
                color: #e0f2fe;
                font-weight: 700;
                margin-top: 2px;
              }
              .combo-rewards-split {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
                gap: 12px;
                align-items: center;
                margin: 16px 0;
                position: relative;
                width: 100%;
              }
              .combo-reward-card-inner {
                background: #ffffff;
                border-radius: 18px;
                padding: 12px 14px;
                display: flex;
                align-items: center;
                gap: 12px;
                box-sizing: border-box;
                min-width: 0 !important;
                width: 100%;
                overflow: hidden;
              }
              .combo-reward-graphic {
                width: 58px;
                height: 58px;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              }
              .combo-reward-banner {
                padding: 8px 10px;
                border-radius: 8px;
                text-align: center;
                width: 100%;
                box-sizing: border-box;
              }
              .combo-or-badge {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
                border: 3.5px solid #ffffff;
                color: #ffffff;
                font-weight: 900;
                font-size: 0.92rem;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(234, 88, 12, 0.45);
                flex-shrink: 0;
                z-index: 2;
              }
              .combo-incentive-boxes {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 14px;
                margin-top: 1.25rem;
                position: relative;
              }
              .combo-incentive-box {
                border-radius: 16px;
                padding: 14px 16px;
                color: #ffffff;
                position: relative;
                box-sizing: border-box;
              }

              /* ============================================================ */
              /* MOBILE RESPONSIVE ADAPTATIONS (MAX-WIDTH: 640PX)              */
              /* ============================================================ */
              @media (max-width: 640px) {
                .combo-poster-canvas {
                  padding: 0.75rem 0.5rem !important;
                  border-radius: 16px !important;
                  border-width: 1.5px !important;
                }
                .combo-top-ribbon-wrap {
                  margin-bottom: 8px !important;
                }
                .combo-top-ribbon {
                  padding: 6px 12px !important;
                  font-size: 0.76rem !important;
                  border-radius: 10px !important;
                  width: 100% !important;
                  line-height: 1.35 !important;
                  letter-spacing: 0px !important;
                }
                .combo-banks-grid {
                  grid-template-columns: repeat(${brandSlots.length <= 2 ? brandSlots.length : 3}, minmax(0, 1fr)) !important;
                  gap: 6px !important;
                  margin-bottom: 8px !important;
                }
                .combo-bank-card {
                  padding: 6px 3px 6px !important;
                  border-radius: 10px !important;
                  border-width: 1.5px !important;
                }
                .combo-bank-logo-box {
                  height: 26px !important;
                  margin-bottom: 2px !important;
                }
                .combo-bank-logo-img {
                  max-height: 24px !important;
                  max-width: 82px !important;
                }
                .combo-bank-name {
                  font-size: 0.58rem !important;
                  line-height: 1.15 !important;
                  min-height: 24px !important;
                  white-space: normal !important;
                  word-break: break-word !important;
                  overflow-wrap: break-word !important;
                  overflow: visible !important;
                  text-overflow: unset !important;
                  text-align: center !important;
                  width: 100% !important;
                  padding: 0 1px !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                }
                .combo-bank-role-badge {
                  font-size: 0.58rem !important;
                  padding: 3px 2px !important;
                  margin-top: 4px !important;
                  border-radius: 4px !important;
                  border-width: 1px !important;
                  white-space: normal !important;
                  word-break: break-word !important;
                  overflow: visible !important;
                  text-overflow: unset !important;
                  width: 100% !important;
                  line-height: 1.2 !important;
                  min-height: 32px !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  text-align: center !important;
                }
                .combo-bank-action-row {
                  margin-top: 6px !important;
                  padding-top: 5px !important;
                  gap: 2px !important;
                }
                .combo-bank-slot-pill {
                  font-size: 0.55rem !important;
                  padding: 2px 4px !important;
                  border-radius: 4px !important;
                }
                .combo-bank-action-btn {
                  padding: 2px 4px !important;
                  border-radius: 4px !important;
                }
                .combo-bank-action-btn svg {
                  width: 10px !important;
                  height: 10px !important;
                }
                .combo-blue-target {
                  padding: 8px 10px !important;
                  border-radius: 10px !important;
                  margin: 8px 0 !important;
                }
                .combo-target-icon-box {
                  width: 32px !important;
                  height: 32px !important;
                  border-radius: 8px !important;
                }
                .combo-target-icon-box svg {
                  width: 18px !important;
                  height: 18px !important;
                }
                .combo-target-text-main {
                  font-size: 0.85rem !important;
                }
                .combo-target-text-sub {
                  font-size: 0.66rem !important;
                }
                .combo-target-arrows {
                  font-size: 1.1rem !important;
                  letter-spacing: 1px !important;
                }
                .combo-rewards-split {
                  grid-template-columns: 1fr auto 1fr !important;
                  gap: 4px !important;
                  margin: 8px 0 !important;
                }
                .combo-reward-card-inner {
                  padding: 6px 4px !important;
                  border-radius: 10px !important;
                  gap: 5px !important;
                  border-width: 1.5px !important;
                }
                .combo-reward-graphic {
                  width: 34px !important;
                  height: 34px !important;
                  border-radius: 6px !important;
                }
                .combo-reward-graphic span {
                  font-size: 1rem !important;
                }
                .combo-reward-graphic small {
                  display: none !important;
                }
                .combo-reward-banner {
                  padding: 4px 4px !important;
                  border-radius: 6px !important;
                }
                .combo-reward-banner-get {
                  font-size: 0.56rem !important;
                  line-height: 1 !important;
                }
                .combo-reward-banner-amt {
                  font-size: 0.88rem !important;
                  line-height: 1.1 !important;
                }
                .combo-reward-banner-type {
                  font-size: 0.62rem !important;
                  line-height: 1 !important;
                }
                .combo-or-badge {
                  width: 26px !important;
                  height: 26px !important;
                  font-size: 0.68rem !important;
                  border-width: 2px !important;
                }
                .combo-incentive-boxes {
                  grid-template-columns: 1fr !important;
                  gap: 6px !important;
                  margin-top: 8px !important;
                }
                .combo-incentive-box {
                  padding: 8px 10px !important;
                  border-radius: 10px !important;
                }
                .combo-incentive-num {
                  width: 22px !important;
                  height: 22px !important;
                  font-size: 0.8rem !important;
                }
                .combo-incentive-title {
                  font-size: 0.78rem !important;
                }
                .combo-incentive-sub {
                  font-size: 0.66rem !important;
                }
                .combo-incentive-icon-box {
                  width: 32px !important;
                  height: 32px !important;
                  border-radius: 8px !important;
                }
                .combo-incentive-icon-box svg {
                  width: 16px !important;
                  height: 16px !important;
                }
                .combo-incentive-desc {
                  font-size: 0.7rem !important;
                  line-height: 1.35 !important;
                }
              }
            `}</style>

            {/* POSTER CANVAS CONTAINER */}
            <div className="combo-poster-canvas">
              {/* TOP HEADER CONTROLS (SET BADGE & EXPIRY) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={handleBackToChallengeSets}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      color: '#334155',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                    }}
                  >
                    <ArrowLeft size={12} />
                    <span>Back to Sets</span>
                  </button>

                  <span
                    style={{
                      background: theme.gradient,
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: '7px',
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    {selectedCombo.title || `Set ${selectedComboIdx + 1}`}
                  </span>
                </div>

                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>
                  Active until: <strong style={{ color: '#0f172a' }}>{formatDate(program.endDate)}</strong>
                </div>
              </div>

              {/* 1. TOP RED RIBBON BANNER */}
              <div className="combo-top-ribbon-wrap">
                <div className="combo-top-ribbon">
                  <span>For Payment Process in these </span>
                  <span style={{ color: '#fef08a', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                    {totalSlotsCount} Banks
                  </span>
                  <span> (HR Hiring Only)</span>
                </div>
              </div>

              {/* 2. THE 3 WHITE BANK CARDS (SIDE-BY-SIDE ON BOTH DESKTOP AND MOBILE) */}
              <div className="combo-banks-grid">
                {brandSlots.map((slot) => (
                  <div
                    key={slot.slotNumber}
                    className="combo-bank-card"
                    style={{
                      border: slot.isSlotCompleted
                        ? '2px solid #10b981'
                        : slot.isSlotInProgress
                        ? '2px solid #f59e0b'
                        : '1.5px solid #93c5fd',
                      boxShadow: slot.isSlotCompleted
                        ? '0 4px 14px rgba(16, 185, 129, 0.18)'
                        : '0 2px 10px rgba(2, 132, 199, 0.08)'
                    }}
                  >
                    {/* Bank Logo / Fallback Header */}
                    {slot.logo ? (
                      <div className="combo-bank-logo-box">
                        <img
                          src={slot.logo}
                          alt={slot.name}
                          className="combo-bank-logo-img"
                        />
                      </div>
                    ) : null}

                    {/* Bank Title */}
                    <div
                      className="combo-bank-name"
                      title={slot.displayName || slot.name}
                      style={{
                        color: slot.primary || '#1e3a8a',
                        fontWeight: 900
                      }}
                    >
                      {slot.displayName || slot.name}
                    </div>

                    {/* Exact Yellow Role Badge */}
                    <div className="combo-bank-role-badge" title={slot.specificRole || slot.openRoles}>
                      {slot.specificRole || slot.openRoles}
                    </div>

                    {/* Slot Completed Status Tag (Only when candidate is closed/hired) */}
                    {slot.isSlotCompleted && (
                      <div style={{ marginTop: '8px' }}>
                        <span
                          style={{
                            color: '#065f46',
                            background: '#d1fae5',
                            border: '1px solid #6ee7b7',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          ✓ Done
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 3. CENTRAL BLUE TARGET BANNER */}
              <div className="combo-blue-target">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    className="combo-target-icon-box"
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Users size={24} color="#ffffff" />
                  </div>
                  <div>
                    <div className="combo-target-text-main">
                      HIRE <span style={{ color: '#fef08a' }}>{targetHires} CANDIDATES</span>
                    </div>
                    <div className="combo-target-text-sub">
                      From the above <span style={{ color: '#fef08a' }}>{totalSlotsCount} banks</span> (For Payment Process)
                    </div>
                  </div>
                </div>

                <div className="combo-target-arrows" style={{ fontWeight: 900, color: 'rgba(255, 255, 255, 0.85)', letterSpacing: '2px', display: 'flex', alignItems: 'center' }}>
                  &gt;&gt;&gt;
                </div>
              </div>

              {/* 4. CENTRAL DUAL REWARD SHOWCASE (CASH VS TABLET - SIDE BY SIDE) */}
              <div className="combo-rewards-split">
                {/* CASH REWARD CARD */}
                <div
                  className="combo-reward-card-inner"
                  style={{
                    border: '2px solid #fecaca',
                    boxShadow: '0 6px 18px rgba(220, 38, 38, 0.12)'
                  }}
                >
                  <div
                    className="combo-reward-graphic"
                    style={{
                      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                      border: '1.5px solid #6ee7b7'
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>💵</span>
                    <small style={{ fontSize: '0.62rem', fontWeight: 900, color: '#047857' }}>Cash</small>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="combo-reward-banner"
                      style={{
                        background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
                        color: '#ffffff',
                        boxShadow: '0 4px 10px rgba(220, 38, 38, 0.35)',
                        transform: 'skewX(-2deg)'
                      }}
                    >
                      <div className="combo-reward-banner-get" style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        GET
                      </div>
                      <div className="combo-reward-banner-amt" style={{ fontWeight: 900, color: '#fef08a' }}>
                        ₹{rewardAmountFormatted}
                      </div>
                      <div className="combo-reward-banner-type" style={{ fontWeight: 900, letterSpacing: '0.5px' }}>
                        CASH
                      </div>
                    </div>
                  </div>
                </div>

                {/* OR BADGE */}
                <div className="combo-or-badge">
                  OR
                </div>

                {/* TABLET REWARD CARD */}
                <div
                  className="combo-reward-card-inner"
                  style={{
                    border: '2px solid #bfdbfe',
                    boxShadow: '0 6px 18px rgba(29, 78, 216, 0.12)'
                  }}
                >
                  <div
                    className="combo-reward-graphic"
                    style={{
                      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                      border: '1.5px solid #93c5fd'
                    }}
                  >
                    <Tablet size={26} color="#1d4ed8" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="combo-reward-banner"
                      style={{
                        background: 'linear-gradient(90deg, #1d4ed8 0%, #1e40af 100%)',
                        color: '#ffffff',
                        boxShadow: '0 4px 10px rgba(29, 78, 216, 0.35)',
                        transform: 'skewX(2deg)'
                      }}
                    >
                      <div className="combo-reward-banner-get" style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        GET A
                      </div>
                      <div className="combo-reward-banner-amt" style={{ fontWeight: 900, color: '#fef08a' }}>
                        ₹{rewardAmountFormatted}
                      </div>
                      <div className="combo-reward-banner-type" style={{ fontWeight: 900, letterSpacing: '0.5px' }}>
                        TABLET
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. DUAL INCENTIVE BREAKDOWN (REGULAR INCENTIVE + ADDITIONAL BONUS) */}
              <div className="combo-incentive-boxes">
                {/* BOX 1: REGULAR INCENTIVE */}
                <div
                  className="combo-incentive-box"
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 60%, #075985 100%)',
                    border: '1.5px solid #38bdf8',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.22)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div
                      className="combo-incentive-num"
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: '#fbbf24',
                        color: '#78350f',
                        fontWeight: 900,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      1
                    </div>
                    <div>
                      <div className="combo-incentive-title" style={{ fontWeight: 900, color: '#ffffff', letterSpacing: '0.3px', lineHeight: 1.15 }}>
                        REGULAR INCENTIVE
                      </div>
                      <div className="combo-incentive-sub" style={{ fontWeight: 800, color: '#fef08a' }}>
                        (Already Available)
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div
                      className="combo-incentive-icon-box"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.18)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Briefcase size={18} color="#fef08a" />
                    </div>
                    <p className="combo-incentive-desc" style={{ margin: 0, color: '#e0f2fe' }}>
                      You will continue to receive your existing hiring incentive as per company policy.
                    </p>
                  </div>
                </div>

                {/* BOX 2: ADDITIONAL BONUS */}
                <div
                  className="combo-incentive-box"
                  style={{
                    background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 60%, #7f1d1d 100%)',
                    border: '1.5px solid #f87171',
                    boxShadow: '0 4px 14px rgba(185, 28, 28, 0.22)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div
                      className="combo-incentive-num"
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: '#fbbf24',
                        color: '#78350f',
                        fontWeight: 900,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      2
                    </div>
                    <div>
                      <div className="combo-incentive-title" style={{ fontWeight: 900, color: '#ffffff', letterSpacing: '0.3px', lineHeight: 1.15 }}>
                        ADDITIONAL BONUS
                      </div>
                      <div className="combo-incentive-sub" style={{ fontWeight: 800, color: '#fef08a' }}>
                        (From Management)
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div
                      className="combo-incentive-icon-box"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.18)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Gift size={18} color="#fef08a" />
                    </div>
                    <p className="combo-incentive-desc" style={{ margin: 0, color: '#fee2e2' }}>
                      Along with your regular incentive, you will also get a <strong style={{ color: '#ffffff', textDecoration: 'underline' }}>Cash</strong> OR a <strong style={{ color: '#ffffff', textDecoration: 'underline' }}>Tablet</strong> bonus.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. LIVE PROGRESS TRACKER */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginTop: '12px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.78rem', fontWeight: 800 }}>
                  <span style={{ color: '#1e293b' }}>
                    Enrolled: <strong style={{ color: '#0284c7', fontSize: '0.9rem' }}>{enrolledHiresCount}</strong> of <strong>{targetHires}</strong> Hires
                  </span>
                  <span style={{ color: isComboAchieved ? '#059669' : '#0284c7' }}>
                    {comboPercentage}% Completed
                  </span>
                </div>

                <div style={{ width: '100%', height: '8px', borderRadius: '5px', background: '#e2e8f0', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${comboPercentage}%`,
                      background: isComboAchieved ? '#10b981' : 'linear-gradient(90deg, #0284c7 0%, #10b981 100%)',
                      borderRadius: '5px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                  {isComboAchieved
                    ? `🎉 Combo Challenge Achieved! You have unlocked your ₹${rewardAmountFormatted} Cash OR Tablet bonus!`
                    : `Place ${remainingSlotsCount} more candidate(s) across the ${totalSlotsCount} open bank slot(s) above to claim your Grand Bumper Reward!`}
                </div>
              </div>

              {/* 7. BOTTOM ACTION BUTTONS */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '12px'
                }}
              >
                <button
                  onClick={handleBackToChallengeSets}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #0284c7',
                    color: '#0369a1',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.12)'
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>← Back to Sets</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => {
                      const link = defaultRefLink;
                      const msg = `🌟 *Special Banking Placement Challenge: ${selectedCombo.title}*\n\n` +
                        `🎁 Win ₹${rewardAmountFormatted} Cash OR Brand New TAB by placing candidates across these ${totalSlotsCount} partner banks!\n` +
                        `📌 Candidate Application Link: ${link}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    style={{
                      background: '#25D366',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 8px rgba(37, 211, 102, 0.35)'
                    }}
                  >
                    <Share2 size={13} />
                    <span>Share Challenge on WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
