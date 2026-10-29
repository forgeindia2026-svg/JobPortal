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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'bank_detail' | 'combo_detail'
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

  const handleOpenBankDetail = (bName) => {
    setSelectedBank(bName);
    setViewMode('bank_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToBanks = () => {
    setViewMode('grid');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenComboDetail = (comboSet, idx) => {
    setSelectedCombo(comboSet);
    setSelectedComboIdx(idx);
    setViewMode('combo_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToChallengeSets = () => {
    setViewMode('grid');
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
              <span>← Back to Combo Challenges</span>
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
              onClick={viewMode === 'bank_detail' ? handleBackToBanks : viewMode === 'combo_detail' ? handleBackToChallengeSets : undefined}
              style={{
                cursor: viewMode !== 'grid' ? 'pointer' : 'default',
                color: viewMode !== 'grid' ? '#0284c7' : '#0f172a',
                fontWeight: viewMode !== 'grid' ? 600 : 700
              }}
            >
              Offers & Targets
            </span>
            {viewMode === 'bank_detail' && (
              <>
                <span style={{ margin: '0 5px' }}>/</span>
                <span style={{ fontWeight: 800, color: bankTheme.primary }}>{currentBankName}</span>
              </>
            )}
            {viewMode === 'combo_detail' && selectedCombo && (
              <>
                <span style={{ margin: '0 5px' }}>/</span>
                <span
                  onClick={handleBackToChallengeSets}
                  style={{ cursor: 'pointer', color: '#4f46e5', fontWeight: 600 }}
                >
                  Combo Challenges
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
      {/* VIEW MODE 1: OVERVIEW PAGE (FREE BANK GRID OR PAID 4 COMBOS)    */}
      {/* ============================================================== */}
      {viewMode === 'grid' && (
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

          {/* PROCESS SELECTOR TABS (FREE DIRECT BANKING vs PAID FIC TRAINING) */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '1.5rem',
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: '2px',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <button
              onClick={() => { setActiveProcess('free'); }}
              style={{
                padding: '8px 16px',
                borderRadius: '10px 10px 0 0',
                border: 'none',
                background: isFree ? '#ffffff' : 'transparent',
                color: isFree ? '#c2410c' : '#64748b',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                borderBottom: isFree ? '3px solid #ea580c' : '3px solid transparent',
                marginBottom: '-4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              <Building2 size={16} />
              <span>Free Process (10 Direct Banking Drives)</span>
              <span
                style={{
                  background: isFree ? '#ffedd5' : '#e2e8f0',
                  color: isFree ? '#c2410c' : '#475569',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '0.68rem',
                  fontWeight: 800
                }}
              >
                Cash Rewards
              </span>
            </button>

            <button
              onClick={() => { setActiveProcess('paid'); }}
              style={{
                padding: '8px 16px',
                borderRadius: '10px 10px 0 0',
                border: 'none',
                background: !isFree ? '#ffffff' : 'transparent',
                color: !isFree ? '#1d4ed8' : '#64748b',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                borderBottom: !isFree ? '3px solid #2563eb' : '3px solid transparent',
                marginBottom: '-4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              <Tablet size={16} color={!isFree ? '#1d4ed8' : '#64748b'} />
              <span>Paid Process (FIC Training - Win TAB or ₹25k Cash)</span>
              <span
                style={{
                  background: !isFree ? '#dbeafe' : '#e2e8f0',
                  color: !isFree ? '#1d4ed8' : '#475569',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '0.68rem',
                  fontWeight: 800
                }}
              >
                📱 TAB Reward
              </span>
            </button>
          </div>

          {/* ============================================================== */}
          {/* DISPLAY A: FREE PROCESS - 10 PARTNER BANKS GRID                */}
          {/* ============================================================== */}
          {isFree && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={18} color="#0284c7" />
                    <span>Select Bank to View Target & Reward Details</span>
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Click any partner bank below to open its dedicated Team Goal and Individual Bonus Slabs page.
                  </p>
                </div>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '3px 10px', borderRadius: '12px' }}>
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
                      {/* SUBTLE BACKGROUND DECORATIVE CIRCLE */}
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
                        {/* TOP ROW: LOGO + BANK TITLE + TARGET */}
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

                        {/* MIDDLE: DESCRIPTION (TRUNCATED TO 2 LINES FOR PERFECT ROW ALIGNMENT) */}
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
            </div>
          )}

          {/* ============================================================== */}
          {/* DISPLAY B: PAID PROCESS - 4 FIC TRAINING COMBO SETS           */}
          {/* ============================================================== */}
          {!isFree && (
            <div style={{ marginBottom: '2.5rem' }}>
              <style>{`
                .paid-combo-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 16px;
                }
                .paid-spotlight-banner {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 16px;
                  padding: 1.25rem 1.5rem;
                }
                .paid-combo-card {
                  padding: 1.25rem;
                  border-radius: 16px;
                }
                @media (max-width: 860px) {
                  .paid-combo-grid {
                    grid-template-columns: 1fr !important;
                    gap: 14px !important;
                  }
                  .paid-spotlight-banner {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    padding: 1rem 1rem !important;
                    gap: 12px !important;
                  }
                  .paid-spotlight-badge {
                    width: 100% !important;
                    text-align: center !important;
                  }
                  .paid-combo-card {
                    padding: 1.1rem 1rem !important;
                    border-radius: 14px !important;
                  }
                }
              `}</style>

              {/* SPOTLIGHT BANNER FOR TAB / ₹25k REWARD */}
              <div
                className="paid-spotlight-banner"
                style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a8a 100%)',
                  borderRadius: '18px',
                  border: '1.5px solid #334155',
                  marginBottom: '1.5rem',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px -6px rgba(15, 23, 42, 0.4)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Tablet size={26} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800 }}>
                        BUMPER PRIZE
                      </span>
                      <h3 style={{ margin: 0, fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)', fontWeight: 800, color: '#ffffff' }}>
                        Brand New TAB (Tablet) OR ₹25,000 Cash Prize!
                      </h3>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4, maxWidth: '780px' }}>
                      Achieve any of the 4 Specialized FIC Training Combo Sets below to win a Brand New Tablet or ₹25k Direct Cash + Standard Candidate Referral Incentives!
                    </p>
                  </div>
                </div>

                <div
                  className="paid-spotlight-badge"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    textAlign: 'center',
                    flexShrink: 0
                  }}
                >
                  <div style={{ fontSize: '0.64rem', textTransform: 'uppercase', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.5px' }}>
                    GRAND REWARD
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fbbf24' }}>
                    📱 TAB / ₹25k
                  </div>
                </div>
              </div>

              {/* 4 COMBO CHALLENGE CARDS GRID */}
              <div className="paid-combo-grid">
                {paidComboSets.map((set, idx) => {
                  const theme = COMBO_CARD_THEMES[idx % COMBO_CARD_THEMES.length];
                  const rolesList = Array.isArray(set.roles)
                    ? set.roles
                    : typeof set.roles === 'string'
                    ? set.roles.split(',').map(r => r.trim()).filter(Boolean)
                    : [];

                  const completed = set.completedCount || 0;
                  const target = Number(set.targetCount) || 3;
                  const percentage = set.percentage || (target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0);
                  const isAchieved = set.isAchieved || completed >= target;
                  const remaining = Math.max(0, target - completed);

                  return (
                    <div
                      key={set.id || idx}
                      onClick={() => handleOpenComboDetail(set, idx)}
                      className="paid-combo-card"
                      style={{
                        background: theme.gradient,
                        borderRadius: '18px',
                        border: isAchieved ? '2px solid #a7f3d0' : `1px solid ${theme.border}`,
                        boxShadow: `0 12px 28px -6px ${theme.glow}`,
                        color: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.22s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 18px 36px -6px ${theme.glow}`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = `0 12px 28px -6px ${theme.glow}`;
                      }}
                    >
                      {/* SUBTLE BACKGROUND DECORATIVE ACCENT */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '-40px',
                          right: '-40px',
                          width: '140px',
                          height: '140px',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                          pointerEvents: 'none'
                        }}
                      />

                      <div>
                        {/* CARD TOP BADGE */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span
                            style={{
                              background: 'rgba(255, 255, 255, 0.2)',
                              color: '#ffffff',
                              border: '1px solid rgba(255, 255, 255, 0.35)',
                              padding: '3px 10px',
                              borderRadius: '8px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            SET {idx + 1} CHALLENGE
                          </span>

                          <span style={{ fontSize: '1.2rem' }}>
                            {idx === 0 ? '🏆' : idx === 1 ? '⚡' : idx === 2 ? '🥇' : '💎'}
                          </span>
                        </div>

                        {/* SET TITLE */}
                        <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
                          {set.title}
                        </h4>

                        <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.45 }}>
                          {set.description}
                        </p>

                        {/* GRAND REWARD HIGHLIGHT BOX */}
                        <div
                          style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            marginBottom: '14px',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
                            <span style={{ fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 900, color: '#fef08a', letterSpacing: '0.5px' }}>
                              🎁 UNLOCKS ON COMPLETION
                            </span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#854d0e', background: '#fef08a', padding: '2px 8px', borderRadius: '6px' }}>
                              TAB or ₹25k
                            </span>
                          </div>
                          <div style={{ fontSize: '1.08rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                            <Tablet size={20} color="#fef08a" style={{ flexShrink: 0 }} />
                            <span>{set.rewardTitle || 'Brand New TAB or ₹25,000 Cash'}</span>
                          </div>
                          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)', marginTop: '4px' }}>
                            {set.extraIncentiveText || '+ Full Candidate Placement Incentives'}
                          </div>
                        </div>

                        {/* INCLUDED ROLES / COMBO CHIPS */}
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.9)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                            REQUIRED COMBINATION ({target} HIRES):
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {rolesList.map((roleName, rIdx) => (
                              <span
                                key={rIdx}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.2)',
                                  color: '#ffffff',
                                  border: '1px solid rgba(255, 255, 255, 0.35)',
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}
                              >
                                {roleName}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* PROGRESS BAR */}
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 800, marginBottom: '6px' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                              Enrolled: <strong>{completed}</strong> / {target}
                            </span>
                            <span style={{ color: '#fef08a' }}>
                              {percentage}%
                            </span>
                          </div>

                          <div style={{ width: '100%', height: '8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.22)', border: '1px solid rgba(255, 255, 255, 0.35)', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${percentage}%`,
                                background: isAchieved ? '#10b981' : 'linear-gradient(90deg, #fef08a 0%, #ffffff 100%)',
                                borderRadius: '6px',
                                transition: 'width 0.4s ease',
                                boxShadow: '0 0 10px rgba(254, 240, 138, 0.6)'
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* STATUS TAG */}
                      <div
                        style={{
                          padding: '9px 12px',
                          borderRadius: '10px',
                          background: isAchieved ? 'rgba(16, 185, 129, 0.95)' : 'rgba(0, 0, 0, 0.25)',
                          border: isAchieved ? '1px solid #a7f3d0' : '1px solid rgba(255, 255, 255, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          color: '#ffffff'
                        }}
                      >
                        {isAchieved ? (
                          <>
                            <CheckCircle2 size={16} color="#ffffff" />
                            <span>🎉 COMBO ACHIEVED — CLAIM TAB / ₹25K!</span>
                          </>
                        ) : (
                          <>
                            <Lock size={13} color="rgba(255, 255, 255, 0.85)" />
                            <span>Need {remaining} more candidate{remaining === 1 ? '' : 's'} to win TAB / ₹25k</span>
                          </>
                        )}
                      </div>

                      {/* VIEW 3 BRANDS & REFER CANDIDATES ACTION BUTTON */}
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: '1px solid rgba(255, 255, 255, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 900,
                          color: '#ffffff',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          backdropFilter: 'blur(6px)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>👉 View {rolesList.length || 3} Brands & Refer</span>
                        </span>
                        <ChevronRight size={17} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
              <strong style={{ color: '#0f172a' }}>Drive Terms & Guidelines:</strong> Candidates closed in any partner bank during the active drive period (<strong>{formatDate(program.startDate)} — {formatDate(program.endDate)}</strong>) count towards both the Team Bonus and Individual Cash Rewards. In FIC Training, closing any of the 4 Combo Sets unlocks a Brand New Tablet or ₹25,000 Cash on top of all referral incentives.
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
      {/* VIEW MODE 3: DEDICATED COMBO CHALLENGE DETAIL PAGE             */}
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
          <div style={{ animation: 'fadeIn 0.25s ease' }}>
            {/* HERO BANNER */}
            <div
              style={{
                background: theme.gradient,
                borderRadius: '20px',
                padding: '1.75rem',
                color: '#ffffff',
                marginBottom: '1.75rem',
                boxShadow: `0 14px 34px -8px ${theme.glow}`,
                border: isComboAchieved ? '2px solid #a7f3d0' : `1px solid ${theme.border}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* DECORATIVE BACKGROUND ACCENTS */}
              <div
                style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: 'rgba(255, 255, 255, 0.22)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        color: '#ffffff',
                        padding: '4px 12px',
                        borderRadius: '10px',
                        fontSize: '0.74rem',
                        fontWeight: 900,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}
                    >
                      SET {selectedComboIdx + 1} CHALLENGE
                    </span>

                    <span
                      style={{
                        background: '#fef08a',
                        color: '#854d0e',
                        padding: '4px 10px',
                        borderRadius: '10px',
                        fontSize: '0.74rem',
                        fontWeight: 900,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Sparkles size={13} />
                      <span>MEGA BUMPER PRIZE</span>
                    </span>
                  </div>

                  <span style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 700 }}>
                    Active until: <strong>{formatDate(program.endDate)}</strong>
                  </span>
                </div>

                <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)', fontWeight: 900, color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.25)' }}>
                  {selectedCombo.title}
                </h1>

                <p style={{ margin: '0 0 1.25rem', fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.92)', lineHeight: 1.5, maxWidth: '820px' }}>
                  {selectedCombo.description}
                </p>

                {/* PROGRESS BAR */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.22)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '14px',
                    padding: '12px 16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#ffffff' }}>
                      Challenge Progress: <strong style={{ color: '#fef08a' }}>{completedSlotsCount}</strong> of <strong>{totalSlotsCount}</strong> Brand Slots Completed
                    </span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#fef08a' }}>
                      {comboPercentage}% Completed
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '10px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.2)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${comboPercentage}%`,
                        background: isComboAchieved ? '#10b981' : 'linear-gradient(90deg, #fef08a 0%, #34d399 100%)',
                        borderRadius: '6px',
                        transition: 'width 0.4s ease',
                        boxShadow: '0 0 12px rgba(254, 240, 138, 0.6)'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 700 }}>
                    {isComboAchieved ? (
                      <>
                        <CheckCircle2 size={16} color="#34d399" />
                        <span style={{ color: '#34d399', fontWeight: 800 }}>Challenge Achieved! You can now claim your Brand New TAB or ₹25,000 Cash!</span>
                      </>
                    ) : (
                      <>
                        <Lock size={14} color="rgba(255, 255, 255, 0.8)" />
                        <span>Refer and close {remainingSlotsCount} more candidate{remainingSlotsCount === 1 ? '' : 's'} across the open brand slots below to unlock the Bumper Reward.</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* GRAND PRIZE SPOTLIGHT DUAL CARDS (TABLET VS ₹25,000 CASH) */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <span
                  style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '3px 12px',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    marginBottom: '6px'
                  }}
                >
                  🎁 UNLOCKS ON COMPLETION
                </span>
                <h2 style={{ margin: 0, fontSize: 'clamp(1.2rem, 3vw, 1.55rem)', fontWeight: 900, color: '#0f172a' }}>
                  Winner's Choice: Brand New TAB or ₹25,000 Cash!
                </h2>
                <p style={{ margin: '4px auto 0', fontSize: '0.84rem', color: '#64748b', maxWidth: '640px' }}>
                  Once you place 1 candidate in each of the {totalSlotsCount} partner brands below, you can choose either the Brand New Tablet or ₹25,000 Direct Cash Transfer!
                </p>
              </div>

              {/* DUAL REWARD CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '14px' }}>
                {/* REWARD OPTION 1: BRAND NEW TAB */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '2px solid #38bdf8',
                    color: '#ffffff',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 24px -4px rgba(56, 189, 248, 0.25)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1.5px solid #38bdf8',
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Tablet size={24} />
                    </div>
                    <span style={{ background: '#0284c7', color: '#ffffff', padding: '3px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>
                      OPTION A
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                    Brand New TAB (Tablet)
                  </h3>
                  <p style={{ margin: '0 0 14px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    Brand New 10.1" Android Tablet with full accessories & box warranty delivered straight to your doorstep.
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 700 }}>
                      📱 10.1" IPS HD Screen
                    </span>
                    <span style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 700 }}>
                      ⚡ Octa-Core Processor
                    </span>
                    <span style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 700 }}>
                      🚚 Free Doorstep Delivery
                    </span>
                  </div>
                </div>

                {/* REWARD OPTION 2: ₹25,000 CASH */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '2px solid #86efac',
                    color: '#ffffff',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 24px -4px rgba(34, 197, 94, 0.25)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'rgba(134, 239, 172, 0.15)',
                        border: '1.5px solid #86efac',
                        color: '#86efac',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Award size={24} />
                    </div>
                    <span style={{ background: '#15803d', color: '#ffffff', padding: '3px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>
                      OPTION B
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                    ₹25,000 Direct Cash
                  </h3>
                  <p style={{ margin: '0 0 14px', fontSize: '0.8rem', color: '#bbf7d0', lineHeight: 1.4 }}>
                    Direct NEFT bank transfer or instant UPI payment credited directly to your registered account with zero deductions.
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', color: '#dcfce7', fontWeight: 700 }}>
                      💰 ₹25,000 Lump Sum
                    </span>
                    <span style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', color: '#dcfce7', fontWeight: 700 }}>
                      ⚡ Instant Bank NEFT / UPI
                    </span>
                    <span style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', color: '#dcfce7', fontWeight: 700 }}>
                      💯 Zero Deductions
                    </span>
                  </div>
                </div>
              </div>

              {/* INCENTIVE PLUS BANNER */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  fontSize: '0.8rem',
                  color: '#334155'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Gift size={16} color="#059669" />
                  <span>
                    <strong>PLUS:</strong> Standard candidate placement referral incentives are paid in full for all {totalSlotsCount} placed candidates!
                  </span>
                </div>
                <span style={{ color: '#059669', fontWeight: 800 }}>
                  TAB / ₹25k Reward + Full Candidate Incentives
                </span>
              </div>
            </div>

            {/* THE 3 BRANDS SHOWCASED SECTION */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={22} color="#4f46e5" />
                  <span>Required {totalSlotsCount} Partner Brands in this Combo Challenge</span>
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Refer at least 1 candidate for each brand below. When that candidate is Selected or Enrolled, the slot is marked Completed!
                </p>
              </div>

              {/* BRAND CARDS GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {brandSlots.map((slot) => {
                  return (
                    <div
                      key={slot.slotNumber}
                      style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: slot.isSlotCompleted ? '2px solid #10b981' : slot.isSlotInProgress ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                        boxShadow: slot.isSlotCompleted ? '0 10px 24px -4px rgba(16, 185, 129, 0.2)' : '0 4px 14px rgba(0,0,0,0.05)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* TOP ACCENT LINE */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: slot.gradient
                        }}
                      />

                      <div>
                        {/* SLOT HEADER ROW */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span
                            style={{
                              background: '#f1f5f9',
                              color: '#475569',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              textTransform: 'uppercase'
                            }}
                          >
                            SLOT {slot.slotNumber} OF {totalSlotsCount}
                          </span>

                          {slot.isSlotCompleted ? (
                            <span
                              style={{
                                background: '#dcfce7',
                                color: '#15803d',
                                border: '1px solid #86efac',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <CheckCircle2 size={12} />
                              <span>SLOT COMPLETED</span>
                            </span>
                          ) : slot.isSlotInProgress ? (
                            <span
                              style={{
                                background: '#fef3c7',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Flame size={12} />
                              <span>IN PROGRESS</span>
                            </span>
                          ) : (
                            <span
                              style={{
                                background: '#f1f5f9',
                                color: '#64748b',
                                border: '1px solid #e2e8f0',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: 700
                              }}
                            >
                              SLOT OPEN (0/1)
                            </span>
                          )}
                        </div>

                        {/* BRAND LOGO & TITLE */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '12px',
                              background: '#ffffff',
                              border: '1.5px solid #e2e8f0',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              padding: '4px',
                              flexShrink: 0
                            }}
                          >
                            {slot.logo ? (
                              <img src={slot.logo} alt={slot.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              <Laptop size={24} color="#6366f1" />
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.3 }}>
                              {slot.name}
                            </h4>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                color: '#4f46e5',
                                fontWeight: 700,
                                background: '#eef2ff',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                display: 'inline-block',
                                marginTop: '3px'
                              }}
                            >
                              {slot.tag}
                            </span>
                          </div>
                        </div>

                        {/* ROLES & PACKAGE HIGHLIGHTS */}
                        <div
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #f1f5f9',
                            borderRadius: '10px',
                            padding: '10px',
                            marginBottom: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px'
                          }}
                        >
                          <div style={{ fontSize: '0.76rem', color: '#334155' }}>
                            <strong style={{ color: '#0f172a' }}>Roles:</strong> {slot.openRoles}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 800 }}>
                            💰 {slot.salaryRange}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            🎓 <strong>Eligibility:</strong> {slot.minQualification}
                          </div>
                        </div>

                        {/* CANDIDATE STATUS TRACKING BOX */}
                        <div
                          style={{
                            padding: '10px 12px',
                            borderRadius: '10px',
                            background: slot.isSlotCompleted ? '#f0fdf4' : slot.isSlotInProgress ? '#fffbeb' : '#fafafa',
                            border: slot.isSlotCompleted ? '1px solid #bbf7d0' : slot.isSlotInProgress ? '1px solid #fde68a' : '1px solid #e5e7eb',
                            marginBottom: '14px'
                          }}
                        >
                          {slot.isSlotCompleted ? (
                            <div>
                              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCheck size={14} />
                                <span>Candidate Successfully Enrolled!</span>
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#166534', marginTop: '3px' }}>
                                Placed: <strong>{slot.closedOrSelected[0]?.candidateName || slot.closedOrSelected[0]?.name || 'Placed Candidate'}</strong> ({slot.closedOrSelected[0]?.status || 'Selected'})
                              </div>
                            </div>
                          ) : slot.isSlotInProgress ? (
                            <div>
                              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Flame size={14} />
                                <span>{slot.inProgressApps.length} Candidate(s) in Pipeline</span>
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#78350f', marginTop: '3px' }}>
                                Latest: <strong>{slot.inProgressApps[0]?.candidateName || slot.inProgressApps[0]?.name || 'Referred Candidate'}</strong> ({slot.inProgressApps[0]?.status || 'Interview Scheduled'})
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.35 }}>
                              No candidate placed yet. Share your referral link or register candidate to fill Slot {slot.slotNumber}.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {/* WHATSAPP SHARE */}
                          <button
                            onClick={() => handleShareBrandWhatsApp(slot)}
                            style={{
                              background: '#25D366',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#20ba5c'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; }}
                          >
                            <Share2 size={13} />
                            <span>WhatsApp</span>
                          </button>

                          {/* COPY REFERRAL LINK */}
                          <button
                            onClick={() => handleCopyBrandLink(slot)}
                            style={{
                              background: copiedText === slot.shortName ? '#10b981' : '#f1f5f9',
                              color: copiedText === slot.shortName ? '#ffffff' : '#334155',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '8px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Copy size={13} />
                            <span>{copiedText === slot.shortName ? 'Copied!' : 'Copy Link'}</span>
                          </button>
                        </div>

                        {/* DIRECT APPLICATION BUTTON */}
                        {onNavigateTab && (
                          <button
                            onClick={() => onNavigateTab('job_openings')}
                            style={{
                              background: '#ffffff',
                              color: '#4f46e5',
                              border: '1.5px solid #c7d2fe',
                              borderRadius: '8px',
                              padding: '7px',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                          >
                            <Briefcase size={13} />
                            <span>View All {slot.shortName} Job Openings →</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3-STEP GUIDE (HOW TO COMPLETE & WIN) */}
            <div
              style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                  How to Complete this Combo Challenge & Claim Reward
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Simple 3-step process to unlock your Brand New Tablet or ₹25,000 Cash
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                {/* STEP 1 */}
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 900 }}>
                      1
                    </span>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Refer Candidates</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45 }}>
                    Share your unique referral link for each of the {totalSlotsCount} partner brands with qualified candidates.
                  </p>
                </div>

                {/* STEP 2 */}
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 900 }}>
                      2
                    </span>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Candidate Selection</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45 }}>
                    As candidates complete their interviews and get Selected or Enrolled, each brand slot turns green (Completed).
                  </p>
                </div>

                {/* STEP 3 */}
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#f59e0b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 900 }}>
                      3
                    </span>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Claim TAB or ₹25k</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45 }}>
                    Once all {totalSlotsCount} slots are green, challenge is WON! Admin team delivers your Brand New Tablet or deposits ₹25,000 cash!
                  </p>
                </div>
              </div>
            </div>

            {/* BOTTOM BACK BUTTON */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleBackToChallengeSets}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: '1.5px solid #4f46e5',
                  color: '#4338ca',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.12)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
              >
                <ArrowLeft size={16} />
                <span>← Back to All Combo Challenges</span>
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
