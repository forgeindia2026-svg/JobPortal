import React, { useState, useEffect } from 'react';
import {
  Trophy, Target, Gift, Users, User, ArrowLeft, Clock, Sparkles,
  CheckCircle2, Flame, Building2, Award, Zap, RefreshCw, Calendar,
  ChevronRight, ShieldCheck, TrendingUp
} from 'lucide-react';

export default function OffersAndTargetsView({ API_URL, currentUser, onBack }) {
  const [activeProcess, setActiveProcess] = useState('free'); // 'free' | 'paid'
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

  const stats = programData?.stats || {
    totalTeamClosed: 0,
    totalHrClosed: 0,
    freeTeamProgress: {
      targetCount: 20,
      completedCount: 0,
      remainingCount: 20,
      percentage: 0,
      isAchieved: false,
      rewardAmount: 30000,
      rewardTitle: '₹30,000 Team Cash Reward',
      description: 'Complete 20 candidates across any of our 10 partner banks to win ₹30,000 Team Cash Bonus!'
    },
    freeIndividualSlabs: [
      { count: 5, rewardAmount: 5000, rewardTitle: 'Incentive + ₹5,000 Cash Bonus', description: 'Close 5 candidates across any partner bank', myClosedCount: 0, remainingCount: 5, percentage: 0, isAchieved: false },
      { count: 10, rewardAmount: 10000, rewardTitle: 'Incentive + ₹10,000 Mega Bonus', description: 'Close 10 candidates across any partner bank', myClosedCount: 0, remainingCount: 10, percentage: 0, isAchieved: false },
      { count: 15, rewardAmount: 15000, rewardTitle: 'Incentive + ₹15,000 Super Bonus', description: 'Close 15 candidates across any partner bank', myClosedCount: 0, remainingCount: 15, percentage: 0, isAchieved: false },
      { count: 20, rewardAmount: 25000, rewardTitle: 'Incentive + ₹25,000 Bumper Bonus', description: 'Close 20 candidates across any partner bank', myClosedCount: 0, remainingCount: 20, percentage: 0, isAchieved: false }
    ],
    paidTeamProgress: {
      targetCount: 15,
      completedCount: 0,
      remainingCount: 15,
      percentage: 0,
      isAchieved: false,
      rewardAmount: 25000,
      rewardTitle: '₹25,000 Team Reward',
      description: 'Enroll 15 candidates into Paid IT Training Programs for ₹25,000 team reward!'
    },
    paidIndividualSlabs: [
      { count: 5, rewardAmount: 7500, rewardTitle: 'Incentive + ₹7,500 Bonus', description: 'Enroll 5 candidates into paid IT training tracks', myClosedCount: 0, remainingCount: 5, percentage: 0, isAchieved: false },
      { count: 10, rewardAmount: 15000, rewardTitle: 'Incentive + ₹15,000 Mega Bonus', description: 'Enroll 10 candidates into paid IT training tracks', myClosedCount: 0, remainingCount: 10, percentage: 0, isAchieved: false }
    ]
  };

  const isFree = activeProcess === 'free';
  const teamProgress = isFree ? stats.freeTeamProgress : stats.paidTeamProgress;
  const individualSlabs = isFree ? stats.freeIndividualSlabs : stats.paidIndividualSlabs;

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.25rem 1rem 4rem' }}>
      {/* TOP NAVIGATION BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >
            <ArrowLeft size={17} />
            <span>Back to Dashboard</span>
          </button>

          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            <span>Dashboard</span>
            <span style={{ margin: '0 6px' }}>/</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>Offers & Targets Hub</span>
          </div>
        </div>

        <button
          onClick={() => fetchProgram(true)}
          disabled={refreshing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            color: '#475569',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Status'}</span>
        </button>
      </div>

      {/* HERO CAMPAIGN BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ea580c 0%, #d97706 40%, #b45309 80%, #7c2d12 100%)',
          borderRadius: '24px',
          padding: '2rem 2.25rem',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -15px rgba(234, 88, 12, 0.45)',
          marginBottom: '2rem'
        }}
      >
        {/* Subtle background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '240px',
            height: '240px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <span
              style={{
                background: '#ffffff',
                color: '#c2410c',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Flame size={14} color="#ea580c" />
              SPECIAL RECRUITMENT EVENT
            </span>

            {program.isEventActive ? (
              <span
                style={{
                  background: 'rgba(254, 240, 138, 0.25)',
                  border: '1px solid #fef08a',
                  color: '#fef08a',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Clock size={13} />
                ENDS IN {program.daysRemaining} DAYS
              </span>
            ) : (
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}
              >
                EVENT COMPLETED
              </span>
            )}

            <span style={{ fontSize: '0.82rem', color: '#fed7aa', fontWeight: 600 }}>
              📅 {formatDate(program.startDate)} — {formatDate(program.endDate)}
            </span>
          </div>

          <h1
            style={{
              margin: '0 0 8px',
              fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
              fontWeight: 900,
              letterSpacing: '-0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.15)'
            }}
          >
            {program.programName}
          </h1>

          <p
            style={{
              margin: '0 0 1.5rem',
              fontSize: '0.98rem',
              color: '#ffedd5',
              maxWidth: '850px',
              lineHeight: 1.5
            }}
          >
            {program.subtitle}
          </p>

          {/* ELIGIBLE 10 PARTNER BANKS PILL LIST */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.18)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Building2 size={16} color="#fef08a" />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                All 10 Partner Banks Included in this Drive:
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(program.banks || []).map((bank, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.16)',
                    padding: '4px 11px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
                  {bank}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PROCESS SELECTOR TABS (FREE BANKING vs PAID IT) */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '2rem',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '4px'
        }}
      >
        <button
          onClick={() => setActiveProcess('free')}
          style={{
            padding: '10px 22px',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: isFree ? '#ffffff' : 'transparent',
            color: isFree ? '#c2410c' : '#64748b',
            fontWeight: 800,
            fontSize: '0.96rem',
            cursor: 'pointer',
            borderBottom: isFree ? '3px solid #ea580c' : '3px solid transparent',
            marginBottom: '-6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Building2 size={18} />
          <span>Free Process (Banking & Direct Drives)</span>
          <span
            style={{
              background: isFree ? '#ffedd5' : '#e2e8f0',
              color: isFree ? '#c2410c' : '#475569',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 800
            }}
          >
            Bandhan 20 = ₹30k
          </span>
        </button>

        <button
          onClick={() => setActiveProcess('paid')}
          style={{
            padding: '10px 22px',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: !isFree ? '#ffffff' : 'transparent',
            color: !isFree ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '0.96rem',
            cursor: 'pointer',
            borderBottom: !isFree ? '3px solid #2563eb' : '3px solid transparent',
            marginBottom: '-6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Zap size={18} />
          <span>Paid Process (IT Training Programs)</span>
          <span
            style={{
              background: !isFree ? '#dbeafe' : '#e2e8f0',
              color: !isFree ? '#1d4ed8' : '#475569',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 800
            }}
          >
            Up to ₹25k
          </span>
        </button>
      </div>

      {/* SECTION 1: TEAM TARGET (FULL WIDTH HERO CARD) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={22} color="#ea580c" />
              <span>Team Target (All Branches & Team Members)</span>
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.86rem', color: '#64748b' }}>
              Collective recruitment goal achieved together as one team.
            </p>
          </div>
          <span
            style={{
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800
            }}
          >
            SHARED TEAM REWARD
          </span>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1.5px solid #fed7aa',
            boxShadow: '0 8px 24px -6px rgba(234, 88, 12, 0.12)',
            padding: '1.75rem 2rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '1.75rem',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
                }}
              >
                🏆
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                    {teamProgress?.targetCount} Candidates Target
                  </h3>
                  <span
                    style={{
                      background: teamProgress?.isAchieved ? '#10b981' : '#f59e0b',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}
                  >
                    {teamProgress?.isAchieved ? 'TARGET UNLOCKED 🎉' : `${teamProgress?.percentage}% COMPLETE`}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                  {teamProgress?.description || `Complete ${teamProgress?.targetCount} candidates across any of our 10 partner banks!`}
                </p>
              </div>
            </div>

            {/* REWARD BADGE */}
            <div
              style={{
                textAlign: 'right',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                padding: '12px 20px',
                borderRadius: '16px',
                border: '1px solid #fcd34d'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
                Team Bonus
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#78350f' }}>
                ₹{Number(teamProgress?.rewardAmount || 30000).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 600 }}>
                + Regular Candidate Incentives
              </div>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, color: '#334155' }}>
                Team Closed Candidates: <strong style={{ color: '#ea580c', fontSize: '1rem' }}>{teamProgress?.completedCount || 0}</strong> / {teamProgress?.targetCount}
              </span>
              <span style={{ fontWeight: 800, color: teamProgress?.isAchieved ? '#059669' : '#d97706' }}>
                {teamProgress?.isAchieved ? 'Target Achieved! 🎊' : `${teamProgress?.remainingCount} more to unlock ₹${Number(teamProgress?.rewardAmount || 30000).toLocaleString('en-IN')}`}
              </span>
            </div>

            <div
              style={{
                width: '100%',
                height: '14px',
                background: '#f1f5f9',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${teamProgress?.percentage || 0}%`,
                  background: 'linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)',
                  borderRadius: '8px',
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: INDIVIDUAL MILESTONE BONUS SLABS */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={22} color="#059669" />
              <span>Individual Bonus Slabs (Your Personal Closures)</span>
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.86rem', color: '#64748b' }}>
              Cash bonuses unlocked by you individually on top of regular candidate incentives.
            </p>
          </div>
          <span
            style={{
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800
            }}
          >
            PERSONAL CASH BONUSES
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {(individualSlabs || []).map((slab, idx) => {
            const isCompleted = slab.isAchieved;
            const progressPct = slab.percentage || 0;

            return (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  border: isCompleted ? '2px solid #10b981' : '1.5px solid #e2e8f0',
                  boxShadow: isCompleted
                    ? '0 10px 25px -5px rgba(16, 185, 129, 0.2)'
                    : '0 4px 12px rgba(0,0,0,0.04)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Milestone Badge at Top */}
                {isCompleted && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      background: '#10b981',
                      color: '#ffffff',
                      padding: '4px 12px',
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      borderRadius: '0 0 0 12px',
                      letterSpacing: '0.5px'
                    }}
                  >
                    ACHIEVED 🎉
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: isCompleted ? '#d1fae5' : '#f1f5f9',
                        color: isCompleted ? '#059669' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 900
                      }}
                    >
                      {idx === 0 ? '🥉' : idx === 1 ? '🥈' : idx === 2 ? '🥇' : '💎'}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        Milestone {idx + 1}
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                        {slab.count} Candidates
                      </div>
                    </div>
                  </div>

                  {/* REWARD HIGHLIGHT */}
                  <div
                    style={{
                      background: isCompleted ? '#ecfdf5' : '#f8fafc',
                      border: isCompleted ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      marginBottom: '1rem'
                    }}
                  >
                    <div style={{ fontSize: '0.74rem', color: isCompleted ? '#065f46' : '#64748b', fontWeight: 700 }}>
                      CASH REWARD
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: isCompleted ? '#047857' : '#0f172a' }}>
                      ₹{Number(slab.rewardAmount).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: isCompleted ? '#059669' : '#64748b', fontWeight: 600 }}>
                      + Regular candidate incentive
                    </div>
                  </div>

                  <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                    {slab.description || `Close ${slab.count} candidates across partner banks.`}
                  </p>
                </div>

                {/* HR's PERSONAL PROGRESS */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#334155' }}>
                      Your Progress: <strong style={{ color: isCompleted ? '#059669' : '#ea580c' }}>{slab.myClosedCount || 0}</strong> / {slab.count}
                    </span>
                    <span style={{ fontWeight: 800, color: isCompleted ? '#059669' : '#64748b' }}>
                      {progressPct}%
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      background: '#f1f5f9',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      marginBottom: '8px'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${progressPct}%`,
                        background: isCompleted ? '#10b981' : '#3b82f6',
                        borderRadius: '6px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>

                  <div style={{ fontSize: '0.74rem', color: isCompleted ? '#059669' : '#d97706', fontWeight: 700 }}>
                    {isCompleted
                      ? '✓ Milestone reached! Eligible for payout!'
                      : `${slab.remainingCount} more candidate${slab.remainingCount > 1 ? 's' : ''} to unlock ₹${Number(slab.rewardAmount).toLocaleString('en-IN')}!`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER INFO & GUIDELINES */}
      <div
        style={{
          marginTop: '3rem',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}
      >
        <ShieldCheck size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
          <strong style={{ color: '#0f172a' }}>Event & Bonus Rules:</strong> All candidates joining between <strong>{formatDate(program.startDate)}</strong> and <strong>{formatDate(program.endDate)}</strong> across any of the 10 listed partner banks automatically qualify for this drive. Both Team Rewards and Individual Cash Bonuses will be settled alongside the monthly incentive payout schedule.
        </div>
      </div>
    </div>
  );
}
