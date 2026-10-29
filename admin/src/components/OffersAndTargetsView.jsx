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
    title: 'Set 1: Premium Banking Trio',
    roles: ['Aditya Birla', 'Tata Capital', 'HDFC Bank'],
    targetCount: 3,
    rewardType: 'both',
    rewardAmount: 25000,
    rewardTitle: 'Brand New TAB or ₹25,000 Cash',
    extraIncentiveText: '+ Full Candidate Placement Incentives',
    description: 'Enroll candidates across Aditya Birla, Tata, and HDFC to claim a Brand New TAB or ₹25,000 Cash!'
  },
  {
    id: 'combo_2',
    title: 'Set 2: Hybrid Banking & IT Combo',
    roles: ['Any 2 Banking Candidates', '1 IT Training Candidate'],
    targetCount: 3,
    rewardType: 'both',
    rewardAmount: 25000,
    rewardTitle: 'Brand New TAB or ₹25,000 Cash',
    extraIncentiveText: '+ Full Candidate Placement Incentives',
    description: 'Enroll any 2 Banking candidates + 1 IT Training candidate to unlock a Brand New TAB or ₹25,000 Cash!'
  },
  {
    id: 'combo_3',
    title: 'Set 3: Gold Academy Power Trio',
    roles: ['Axis Gold Academy', 'Kotak Gold Academy', 'Suryoday Small Finance Bank'],
    targetCount: 3,
    rewardType: 'both',
    rewardAmount: 25000,
    rewardTitle: 'Brand New TAB or ₹25,000 Cash',
    extraIncentiveText: '+ Full Candidate Placement Incentives',
    description: 'Enroll candidates across Axis Gold, Kotak Gold, and Suryoday Bank to win the Mega Reward!'
  },
  {
    id: 'combo_4',
    title: 'Set 4: Master Placement Quad Combo',
    roles: ['Axis Gold', 'Kotak Gold', 'Aditya Birla', 'Any IT Track'],
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

  const getBrandDetails = (roleName, index) => {
    const lower = (roleName || '').toLowerCase().trim();
    if (lower.includes('birla') || lower.includes('aditya')) {
      return {
        name: 'Aditya Birla Capital',
        shortName: 'Aditya Birla',
        brandKey: 'aditya_birla',
        logo: '/logos/aditya_birla.jpg',
        gradient: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #dc2626 100%)',
        glow: 'rgba(185, 28, 28, 0.45)',
        accent: '#fecaca',
        tag: 'NBFC & Wealth Services',
        category: 'Banking / NBFC',
        openRoles: 'Branch Relationship Officer, Sales Executive, Wealth Associate',
        salaryRange: '₹2.4L - ₹4.5L CTC + Attractive Incentives',
        minQualification: 'Any Graduate / 12th Pass / MBA',
        description: 'Leading NBFC under Aditya Birla Group with high market reputation and rapid candidate onboarding.',
        whyJoin: 'Rapid promotions, structured training, direct payroll placement, high incentive earnings.'
      };
    }
    if (lower.includes('tata')) {
      return {
        name: 'Tata Capital',
        shortName: 'Tata Capital',
        brandKey: 'tata_capital',
        logo: '/logos/tata_aig.png',
        gradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #38bdf8 100%)',
        glow: 'rgba(2, 132, 199, 0.45)',
        accent: '#bae6fd',
        tag: 'Consumer Finance & Lending',
        category: 'Financial Services',
        openRoles: 'Loan Officer, Customer Relationship Executive, Retail Credit Executive',
        salaryRange: '₹2.2L - ₹4.0L CTC + Monthly Performance Bonus',
        minQualification: 'Any Degree / Diploma / Experienced',
        description: 'The trusted financial services arm of Tata Group, delivering secure employment and great team culture.',
        whyJoin: 'Tata brand prestige, stable banking hours, healthcare coverage, consistent career increments.'
      };
    }
    if (lower.includes('hdfc')) {
      return {
        name: 'HDFC Bank',
        shortName: 'HDFC Bank',
        brandKey: 'hdfc_bank',
        logo: '/logos/Hdfc.jpg',
        gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%)',
        glow: 'rgba(29, 78, 216, 0.45)',
        accent: '#bfdbfe',
        tag: "India's #1 Private Sector Bank",
        category: 'Commercial Bank',
        openRoles: 'Branch Banking Officer, Retail Operations, Personal Banker, Sales Mgr',
        salaryRange: '₹2.8L - ₹5.5L CTC + Annual Banking Bonus',
        minQualification: 'Any Graduate (Freshers & Experienced eligible)',
        description: "India's largest banking titan offering premier banking certifications, nationwide postings, and executive prestige.",
        whyJoin: "India's premier banking titan, extensive career growth paths, comprehensive banking credentials."
      };
    }
    if (lower.includes('axis')) {
      return {
        name: 'Axis Bank Gold Academy',
        shortName: 'Axis Bank',
        brandKey: 'axis_bank',
        logo: '/logos/axis_bank.svg',
        gradient: 'linear-gradient(135deg, #701a75 0%, #831843 50%, #be185d 100%)',
        glow: 'rgba(131, 24, 67, 0.45)',
        accent: '#fbcfe8',
        tag: 'Gold Appraisal & Retail Asset Banking',
        category: 'Private Sector Bank',
        openRoles: 'Gold Appraiser, Relationship Officer, Operations Exec',
        salaryRange: '₹2.5L - ₹4.2L CTC + Spot Commission',
        minQualification: 'Any Degree / 10th / 12th with Appraisal Interest',
        description: 'Certified Axis Gold Academy program with guaranteed branch placement upon assessment.',
        whyJoin: 'High demand specialized banking domain, quick placement turnaround, attractive spot perks.'
      };
    }
    if (lower.includes('kotak')) {
      return {
        name: 'Kotak Mahindra Gold Academy',
        shortName: 'Kotak Bank',
        brandKey: 'kotak_bank',
        logo: '/logos/kotak_bank.png',
        gradient: 'linear-gradient(135deg, #0c4a6e 0%, #003366 50%, #1e40af 100%)',
        glow: 'rgba(0, 51, 102, 0.45)',
        accent: '#bfdbfe',
        tag: 'Gold Appraisal & High-Value Lending',
        category: 'Private Sector Bank',
        openRoles: 'Gold Loan Officer, Customer Service Exec, Branch Mgr Track',
        salaryRange: '₹2.4L - ₹4.5L CTC + Branch Incentives',
        minQualification: 'Any Degree / Final Year Students Welcome',
        description: 'Fast-track placement in Kotak Mahindra Bank branches with professional appraisal certification.',
        whyJoin: 'Prestigious banking banner, fixed working hours, performance bonuses.'
      };
    }
    if (lower.includes('suryoday')) {
      return {
        name: 'Suryoday Small Finance Bank',
        shortName: 'Suryoday Bank',
        brandKey: 'suryoday_bank',
        logo: '/logos/suryoday.webp',
        gradient: 'linear-gradient(135deg, #9a3412 0%, #ea580c 50%, #f97316 100%)',
        glow: 'rgba(234, 88, 12, 0.45)',
        accent: '#fed7aa',
        tag: 'Scheduled Commercial Banking',
        category: 'Small Finance Bank',
        openRoles: 'Branch Relationship Exec, Microfinance Officer, CASA Sales',
        salaryRange: '₹2.2L - ₹3.8L CTC + Quarterly Incentives',
        minQualification: 'Any Degree / +2 Passed candidates',
        description: 'Rapidly expanding scheduled commercial bank with high community impact and fast job offers.',
        whyJoin: 'High job stability, friendly branch environment, rapid promotion to branch team leads.'
      };
    }
    if (lower.includes('it') || lower.includes('track') || lower.includes('software') || lower.includes('training')) {
      return {
        name: 'FIC IT & Software Training Track',
        shortName: 'IT Training',
        brandKey: 'it_training',
        logo: null,
        isItTrack: true,
        gradient: 'linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #6366f1 100%)',
        glow: 'rgba(99, 102, 241, 0.45)',
        accent: '#c7d2fe',
        tag: 'High Package Tech Placements',
        category: 'IT & Software Programs',
        openRoles: 'Full Stack Java, Python Developer, Data Analyst, Cloud QA',
        salaryRange: '₹3.5L - ₹7.0L CTC with 100% Placement Guarantee',
        minQualification: 'B.E / B.Tech / BCA / MCA / B.Sc / Any Degree with coding interest',
        description: 'Specialized tech curriculum with live projects and corporate interview guarantee.',
        whyJoin: 'Top IT salary packages, MNC placement opportunities, hybrid/remote work options.'
      };
    }
    return {
      name: roleName || `Partner Bank Slot ${index + 1}`,
      shortName: roleName,
      brandKey: `slot_${index + 1}`,
      logo: BANK_LOGOS[roleName] || null,
      gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      glow: 'rgba(15, 23, 42, 0.45)',
      accent: '#e2e8f0',
      tag: 'FIC Partner Institution',
      category: 'Banking / Placement Track',
      openRoles: 'Banking Executive / Operations Associate',
      salaryRange: '₹2.2L - ₹4.5L CTC + Attractive Incentives',
      minQualification: 'Any Degree / 12th Pass',
      description: 'Refer candidates to complete this slot towards unlocking your Brand New Tablet or ₹25k reward.',
      whyJoin: 'Reliable placement partner, attractive incentive payouts.'
    };
  };

  const getSlotMatchingCandidates = (brandInfo) => {
    if (!applications || applications.length === 0) return [];
    const bKey = (brandInfo.shortName || brandInfo.name || '').toLowerCase();
    return applications.filter(app => {
      const fullText = `${app.jobTitle || ''} ${app.company || ''} ${app.bankName || ''} ${app.role || ''} ${app.programName || ''}`.toLowerCase();
      if (bKey.includes('birla') || bKey.includes('aditya')) {
        return fullText.includes('birla') || fullText.includes('aditya');
      }
      if (bKey.includes('tata')) {
        return fullText.includes('tata');
      }
      if (bKey.includes('hdfc')) {
        return fullText.includes('hdfc');
      }
      if (bKey.includes('axis')) {
        return fullText.includes('axis');
      }
      if (bKey.includes('kotak')) {
        return fullText.includes('kotak');
      }
      if (bKey.includes('suryoday')) {
        return fullText.includes('suryoday');
      }
      if (bKey.includes('it') || brandInfo.isItTrack) {
        return fullText.includes('it') || fullText.includes('software') || fullText.includes('training') || fullText.includes('developer') || fullText.includes('python') || fullText.includes('java');
      }
      return fullText.includes(bKey);
    });
  };

  const handleShareBrandWhatsApp = (brandInfo) => {
    const link = `${portalBase}?ref=${hrRefCode}&brand=${encodeURIComponent(brandInfo.shortName)}`;
    const msg = `🌟 *Special Recruitment Drive: ${brandInfo.name}*\n\n` +
      `💼 *Roles:* ${brandInfo.openRoles}\n` +
      `💰 *Salary / CTC:* ${brandInfo.salaryRange}\n` +
      `🎓 *Eligibility:* ${brandInfo.minQualification}\n\n` +
      `📌 *Direct Application Link:* ${link}\n\n` +
      `Apply now to get fast-track interview scheduling!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleCopyBrandLink = (brandInfo) => {
    const link = `${portalBase}?ref=${hrRefCode}&brand=${encodeURIComponent(brandInfo.shortName)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        setCopiedText(brandInfo.shortName);
        if (showToast) showToast(`Referral link for ${brandInfo.name} copied!`, 'success');
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

                    {/* REQUIRED COMBO ROLES PREVIEW */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                      {rolesList.map((r, rIdx) => (
                        <span
                          key={rIdx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.18)',
                            color: '#ffffff',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {r}
                        </span>
                      ))}
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

        const completedSlotsCount = brandSlots.filter(s => s.isSlotCompleted).length;
        const totalSlotsCount = brandSlots.length;
        const comboPercentage = totalSlotsCount > 0 ? Math.min(100, Math.round((completedSlotsCount / totalSlotsCount) * 100)) : 0;
        const isComboAchieved = completedSlotsCount >= totalSlotsCount;
        const remainingSlotsCount = Math.max(0, totalSlotsCount - completedSlotsCount);

        return (
          <div style={{ maxWidth: '820px', margin: '0 auto', animation: 'fadeIn 0.22s ease' }}>
            {/* THE SINGLE KPI CARD */}
            <div
              style={{
                background: theme.gradient,
                borderRadius: '22px',
                padding: 'clamp(1.25rem, 3.5vw, 2rem)',
                color: '#ffffff',
                boxShadow: `0 16px 38px -8px ${theme.glow}`,
                border: isComboAchieved ? '2px solid #a7f3d0' : `1px solid ${theme.border}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* DECORATIVE BACKGROUND ACCENT */}
              <div
                style={{
                  position: 'absolute',
                  top: '-45px',
                  right: '-45px',
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* CARD HEADER ROW: BADGES & ACTIVE DATES */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: 'rgba(255, 255, 255, 0.22)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        color: '#ffffff',
                        padding: '3px 10px',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      SET {selectedComboIdx + 1} CHALLENGE
                    </span>

                    <span
                      style={{
                        background: isComboAchieved ? '#10b981' : '#fef08a',
                        color: isComboAchieved ? '#ffffff' : '#854d0e',
                        padding: '3px 10px',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Sparkles size={12} />
                      <span>{isComboAchieved ? 'CHALLENGE WON 🎉' : 'BUMPER PRIZE'}</span>
                    </span>
                  </div>

                  <span style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 700 }}>
                    Active until: <strong>{formatDate(program.endDate)}</strong>
                  </span>
                </div>

                {/* SET TITLE & DESCRIPTION */}
                <h2 style={{ margin: '0 0 6px', fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 900, color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  {selectedCombo.title}
                </h2>
                <p style={{ margin: '0 0 1.25rem', fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.92)', lineHeight: 1.45 }}>
                  {selectedCombo.description}
                </p>

                {/* GRAND REWARD HIGHLIGHT BOX */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.16)',
                    border: '1px solid rgba(255, 255, 255, 0.32)',
                    borderRadius: '14px',
                    padding: '12px 16px',
                    marginBottom: '1.25rem',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 900, color: '#fef08a', letterSpacing: '0.5px' }}>
                      🎁 UNLOCKS ON COMPLETION
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#854d0e', background: '#fef08a', padding: '2px 8px', borderRadius: '6px' }}>
                      TAB or ₹25k
                    </span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tablet size={22} color="#fef08a" style={{ flexShrink: 0 }} />
                    <span>{selectedCombo.rewardTitle || 'Brand New TAB (Tablet) OR ₹25,000 Cash Prize!'}</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)', marginTop: '4px' }}>
                    {selectedCombo.extraIncentiveText || '+ Full Candidate Placement Referral Incentives Included'}
                  </div>
                </div>

                {/* COMBO PARTNER BANKS LIST (THE 3 BANKS IN THIS SET) */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 900, color: 'rgba(255, 255, 255, 0.95)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={15} color="#fef08a" />
                    <span>Required Combo Banks / Roles ({totalSlotsCount} Hires Required):</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {brandSlots.map((slot) => (
                      <div
                        key={slot.slotNumber}
                        style={{
                          background: 'rgba(0, 0, 0, 0.22)',
                          border: slot.isSlotCompleted
                            ? '1.5px solid #10b981'
                            : slot.isSlotInProgress
                            ? '1.5px solid #f59e0b'
                            : '1px solid rgba(255, 255, 255, 0.22)',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '10px'
                        }}
                      >
                        {/* BANK LOGO + NAME */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px', flex: 1 }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              background: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              padding: '3px',
                              flexShrink: 0,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                            }}
                          >
                            {slot.logo ? (
                              <img src={slot.logo} alt={slot.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              <span style={{ fontWeight: 900, color: '#1e3a8a', fontSize: '0.9rem' }}>
                                {slot.shortName?.charAt(0) || 'B'}
                              </span>
                            )}
                          </div>

                          <div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#ffffff' }}>
                              {slot.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.82)' }}>
                              {slot.openRoles}
                            </div>
                          </div>
                        </div>

                        {/* STATUS & ACTIONS */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {slot.isSlotCompleted ? (
                            <span
                              style={{
                                background: '#10b981',
                                color: '#ffffff',
                                padding: '3px 9px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <CheckCircle2 size={13} />
                              <span>Completed (1/1)</span>
                            </span>
                          ) : slot.isSlotInProgress ? (
                            <span
                              style={{
                                background: '#f59e0b',
                                color: '#ffffff',
                                padding: '3px 9px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Flame size={13} />
                              <span>In Pipeline ({slot.inProgressApps.length})</span>
                            </span>
                          ) : (
                            <span
                              style={{
                                background: 'rgba(255, 255, 255, 0.16)',
                                color: '#ffffff',
                                padding: '3px 9px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 700
                              }}
                            >
                              Slot Open (0/1)
                            </span>
                          )}

                          {/* SHARE WHATSAPP BUTTON */}
                          <button
                            onClick={() => handleShareBrandWhatsApp(slot)}
                            title="Share on WhatsApp"
                            style={{
                              background: '#25D366',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '7px',
                              padding: '5px 10px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Share2 size={12} />
                            <span>Share</span>
                          </button>

                          {/* COPY LINK BUTTON */}
                          <button
                            onClick={() => handleCopyBrandLink(slot)}
                            title="Copy Candidate Link"
                            style={{
                              background: copiedText === slot.shortName ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
                              color: '#ffffff',
                              border: '1px solid rgba(255, 255, 255, 0.35)',
                              borderRadius: '7px',
                              padding: '5px 9px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Copy size={12} />
                            <span>{copiedText === slot.shortName ? 'Copied' : 'Link'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PROGRESS TRACKER */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.24)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    marginBottom: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                    <span>
                      Enrolled: <strong style={{ color: '#fef08a' }}>{completedSlotsCount}</strong> of <strong>{totalSlotsCount}</strong> Hires
                    </span>
                    <span style={{ color: '#fef08a' }}>
                      {comboPercentage}% Completed
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '8px', borderRadius: '5px', background: 'rgba(255, 255, 255, 0.2)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${comboPercentage}%`,
                        background: isComboAchieved ? '#10b981' : 'linear-gradient(90deg, #fef08a 0%, #34d399 100%)',
                        borderRadius: '5px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.88)', marginTop: '8px', fontWeight: 600 }}>
                    {isComboAchieved
                      ? '🎉 Combo Challenge Achieved! You can now claim your Brand New TAB or ₹25,000 Cash!'
                      : `Place 1 candidate in each of the ${remainingSlotsCount} remaining bank slot(s) above to claim your reward!`}
                  </div>
                </div>

                {/* BOTTOM ACTION BUTTONS */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <button
                    onClick={handleBackToChallengeSets}
                    style={{
                      background: 'rgba(255, 255, 255, 0.18)',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      color: '#ffffff',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.28)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'; }}
                  >
                    <ArrowLeft size={15} />
                    <span>← Back to Sets</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => {
                        const link = defaultRefLink;
                        const msg = `🌟 *Special Banking Placement Challenge: ${selectedCombo.title}*\n\n` +
                          `🎁 Win Brand New TAB or ₹25k Cash by placing candidates!\n` +
                          `📌 Candidate Application Link: ${link}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      style={{
                        background: '#25D366',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                      }}
                    >
                      <Share2 size={14} />
                      <span>Share on WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
