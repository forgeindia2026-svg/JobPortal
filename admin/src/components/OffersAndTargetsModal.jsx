import React, { useState, useEffect } from 'react';
import {
  Trophy, Target, Gift, Users, User, CheckCircle2, Clock, Sparkles, X,
  ChevronRight, Award, Zap, Building2, Flame, RefreshCw, AlertCircle
} from 'lucide-react';

export default function OffersAndTargetsModal({ isOpen, onClose, API_URL, currentUser }) {
  const [processTab, setProcessTab] = useState('free'); // 'free' | 'paid'
  const [scopeTab, setScopeTab] = useState('team'); // 'team' | 'individual'
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ targets: [], totalTeamClosed: 0, totalHrClosed: 0 });

  const fetchTargets = async () => {
    try {
      setLoading(true);
      const hrId = currentUser?.id || '';
      const res = await fetch(`${API_URL}/api/offer-targets?hrId=${hrId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching targets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTargets();
    }
  }, [isOpen, currentUser?.id]);

  if (!isOpen) return null;

  const allTargets = data.targets || [];
  const currentTargets = allTargets.filter(t => t.processType === processTab && t.targetScope === scopeTab);

  const freeCount = allTargets.filter(t => t.processType === 'free').length;
  const paidCount = allTargets.filter(t => t.processType === 'paid').length;

  const teamCount = allTargets.filter(t => t.processType === processTab && t.targetScope === 'team').length;
  const indCount = allTargets.filter(t => t.processType === processTab && t.targetScope === 'individual').length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ea580c 0%, #d97706 50%, #b45309 100%)',
            padding: '1.25rem 1.5rem',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem'
              }}
            >
              🎯
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.2px' }}>
                  Offers & Targets
                </h3>
                <span
                  style={{
                    background: '#fef08a',
                    color: '#854d0e',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    textTransform: 'uppercase'
                  }}
                >
                  Live Rewards
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#ffedd5', opacity: 0.95 }}>
                Achieve process milestones to unlock Team Rewards & Individual Cash Bonuses
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={fetchTargets}
              title="Refresh Targets"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Process Tabs (Free vs Paid) */}
        <div
          style={{
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '10px 1.5rem',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <button
            onClick={() => setProcessTab('free')}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '10px',
              border: processTab === 'free' ? '2px solid #ea580c' : '1px solid #cbd5e1',
              background: processTab === 'free' ? '#fff7ed' : '#ffffff',
              color: processTab === 'free' ? '#c2410c' : '#475569',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: processTab === 'free' ? '0 2px 6px rgba(234, 88, 12, 0.15)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🆓 Free Process</span>
            <span
              style={{
                background: processTab === 'free' ? '#ea580c' : '#e2e8f0',
                color: processTab === 'free' ? '#ffffff' : '#64748b',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: 800
              }}
            >
              {freeCount} Targets
            </span>
          </button>

          <button
            onClick={() => setProcessTab('paid')}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '10px',
              border: processTab === 'paid' ? '2px solid #7c3aed' : '1px solid #cbd5e1',
              background: processTab === 'paid' ? '#f5f3ff' : '#ffffff',
              color: processTab === 'paid' ? '#6d28d9' : '#475569',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: processTab === 'paid' ? '0 2px 6px rgba(124, 58, 237, 0.15)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🎓 Paid Process</span>
            <span
              style={{
                background: processTab === 'paid' ? '#7c3aed' : '#e2e8f0',
                color: processTab === 'paid' ? '#ffffff' : '#64748b',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: 800
              }}
            >
              {paidCount} Targets
            </span>
          </button>
        </div>

        {/* Scope Sub-Tabs (Team vs Individual) */}
        <div
          style={{
            padding: '12px 1.5rem',
            background: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setScopeTab('team')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                background: scopeTab === 'team' ? (processTab === 'free' ? '#ea580c' : '#7c3aed') : '#f1f5f9',
                color: scopeTab === 'team' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Users size={15} /> Team Target ({teamCount})
            </button>

            <button
              onClick={() => setScopeTab('individual')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                background: scopeTab === 'individual' ? (processTab === 'free' ? '#ea580c' : '#7c3aed') : '#f1f5f9',
                color: scopeTab === 'individual' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <User size={15} /> Individual Target ({indCount})
            </button>
          </div>

          {/* Quick Stats Pill */}
          <div
            style={{
              fontSize: '0.8rem',
              color: '#64748b',
              background: '#f8fafc',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              fontWeight: 600
            }}
          >
            {scopeTab === 'team' ? (
              <span>Team Closed: <strong style={{ color: '#0f172a' }}>{data.totalTeamClosed} candidates</strong></span>
            ) : (
              <span>Your Closed: <strong style={{ color: '#16a34a' }}>{data.totalHrClosed} candidates</strong></span>
            )}
          </div>
        </div>

        {/* Modal Body / Targets List */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={28} className="spin" style={{ margin: '0 auto 10px auto' }} />
              <div>Loading active offers & targets...</div>
            </div>
          ) : currentTargets.length === 0 ? (
            <div
              style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: '14px',
                border: '1px dashed #cbd5e1'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
              <h4 style={{ margin: 0, color: '#334155', fontSize: '1rem', fontWeight: 800 }}>
                No Active {scopeTab === 'team' ? 'Team' : 'Individual'} Targets Right Now
              </h4>
              <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Admin will update special targets for {processTab === 'free' ? 'Free Drives' : 'Paid Programs'} soon!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {currentTargets.map((tgt) => {
                const isBandhan = (tgt.companyOrProgram || '').toLowerCase().includes('bandhan');
                const isTeam = tgt.targetScope === 'team';

                return (
                  <div
                    key={tgt.id}
                    style={{
                      background: tgt.isAchieved ? '#f0fdf4' : '#ffffff',
                      borderRadius: '14px',
                      border: tgt.isAchieved ? '2px solid #86efac' : '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Top Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            background: isTeam ? '#ffedd5' : '#e0e7ff',
                            color: isTeam ? '#ea580c' : '#4f46e5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1.2rem',
                            flexShrink: 0
                          }}
                        >
                          {isTeam ? <Users size={22} /> : <Trophy size={22} />}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                              {tgt.title}
                            </h4>
                            <span
                              style={{
                                background: isBandhan ? '#e0f2fe' : '#f1f5f9',
                                color: isBandhan ? '#0369a1' : '#475569',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}
                            >
                              🏢 {tgt.companyOrProgram}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>Target: <strong style={{ color: '#0f172a' }}>{tgt.targetCount} Candidates Completed</strong></span>
                            <span>•</span>
                            <span style={{ color: '#059669', fontWeight: 700 }}>📅 {tgt.validityText}</span>
                          </div>
                        </div>
                      </div>

                      {/* Reward Badge */}
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                          border: '1px solid #fcd34d',
                          padding: '6px 14px',
                          borderRadius: '10px',
                          textAlign: 'right'
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
                          {isTeam ? 'Team Reward' : 'Cash Bonus'}
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#b45309' }}>
                          ₹{Number(tgt.rewardAmount || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Description if present */}
                    {tgt.description && (
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', lineHeight: 1.4 }}>
                        💡 {tgt.description}
                      </p>
                    )}

                    {/* Progress Bar Container */}
                    <div style={{ background: '#f1f5f9', borderRadius: '10px', padding: '10px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: 700, color: '#334155' }}>
                          {isTeam ? '👥 Team Completed:' : '👤 Your Selections:'} <strong>{tgt.completedCount} / {tgt.targetCount}</strong>
                        </span>
                        <span style={{ fontWeight: 800, color: tgt.isAchieved ? '#16a34a' : '#ea580c' }}>
                          {tgt.percentage}% Achieved
                        </span>
                      </div>

                      {/* Visual Bar */}
                      <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${tgt.percentage}%`,
                            height: '100%',
                            background: tgt.isAchieved
                              ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                              : 'linear-gradient(90deg, #ea580c, #f59e0b)',
                            borderRadius: '6px',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>

                      {/* Helper Note */}
                      <div style={{ marginTop: '6px', fontSize: '0.76rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {tgt.isAchieved ? (
                          <span style={{ color: '#16a34a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={14} /> Congratulations! Target Successfully Completed!
                          </span>
                        ) : (
                          <span style={{ color: '#64748b' }}>
                            ⚡ Innum <strong>{tgt.remainingCount} candidates</strong> complete panna reward unlock aagum!
                          </span>
                        )}
                        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                          Selected / Joined status only
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 1.5rem',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: '#64748b'
          }}
        >
          <span>🎯 Targets are set and verified by Admin. Payouts credited with incentives.</span>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#0f172a',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
