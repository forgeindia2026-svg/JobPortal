import React, { useState, useEffect } from 'react';
import {
  Trophy, Target, Gift, Users, User, ArrowLeft, Clock, Sparkles,
  CheckCircle2, Flame, Building2, Award, Zap, RefreshCw, Calendar,
  ChevronRight, ShieldCheck, Check, Lock, Unlock, Tablet, Smartphone, Star
} from 'lucide-react';

const BANK_LOGOS = {
  'Axis Bank': '/logos/axis_bank.svg',
  'IDFC First Bank': '/logos/idfc_first_bank.svg',
  'Kotak Mahindra Bank': '/logos/kotak_bank.png',
  'Bandhan Bank': '/logos/bandhan_bank.png',
  'Aditya Birla Capital': '/logos/aditya_birla.jpg',
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

export default function OffersAndTargetsView({ API_URL, currentUser, onBack }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'bank_detail'
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
              onClick={viewMode === 'bank_detail' ? handleBackToBanks : undefined}
              style={{
                cursor: viewMode === 'bank_detail' ? 'pointer' : 'default',
                color: viewMode === 'bank_detail' ? '#0284c7' : '#0f172a',
                fontWeight: viewMode === 'bank_detail' ? 600 : 700
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
    </div>
  );
}
