import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, UserCheck, Phone, CheckCircle2, Clock, Search, Filter,
  PhoneCall, Calendar, MessageSquare, AlertCircle, RefreshCw, ChevronRight,
  ShieldCheck, Lock, Unlock, X, ExternalLink, ArrowRight
} from 'lucide-react';

export default function FollowUpCentralManager({ API_URL, currentUser }) {
  const resolvedApi = API_URL || import.meta.env.VITE_API_URL || '';
  const isAdmin = currentUser?.role === 'admin' || !currentUser?.role || currentUser?.role === 'superadmin';
  const isHr = currentUser?.role === 'hr';

  // Sub-tab: 'pool' (All Shared Unclaimed & Follow-up Applications) | 'my' (Claimed by Me) | 'all' (Admin overview)
  const [activeSubTab, setActiveSubTab] = useState(isHr ? 'my' : 'pool');
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({ total: 0, unclaimed: 0, myFollowUps: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Status update modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('In Follow-up');
  const [followUpNote, setFollowUpNote] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [actionError, setActionError] = useState('');

  // Fetch applications with fallback to standard /api/applications if /api/follow-ups/pool is 404
  const fetchFollowUps = useCallback(async () => {
    try {
      setLoading(true);
      const scope = activeSubTab === 'my' ? 'my' : activeSubTab === 'unclaimed' ? 'unclaimed' : 'all';
      const hrIdParam = currentUser?.id ? `&hrId=${encodeURIComponent(currentUser.id)}` : '';
      
      let poolLoaded = false;
      try {
        const res = await fetch(`${resolvedApi}/api/follow-ups/pool?scope=${scope}${hrIdParam}`);
        if (res.ok) {
          const data = await res.json();
          setApplications(Array.isArray(data.applications) ? data.applications : []);
          if (data.counts) setCounts(data.counts);
          poolLoaded = true;
        }
      } catch (e) {
        console.warn('Follow-up pool route failed, falling back to direct applications');
      }

      // Seamless client-side fallback if remote endpoint returns 404
      if (!poolLoaded) {
        const [appsRes, hrsRes] = await Promise.all([
          fetch(`${resolvedApi}/api/applications`).then(r => r.json()).catch(() => []),
          fetch(`${resolvedApi}/api/users/hr`).then(r => r.json()).catch(() => [])
        ]);

        const rawApps = Array.isArray(appsRes) ? appsRes : [];
        const hrMap = Object.fromEntries((Array.isArray(hrsRes) ? hrsRes : []).map(h => [String(h.referralCode || '').toLowerCase().trim(), h]));

        // Read local claim storage
        const localClaims = (() => {
          try { return JSON.parse(localStorage.getItem('fic_follow_up_claims') || '{}'); } catch { return {}; }
        })();

        const validApps = rawApps.filter(a => {
          const s = String(a.status || '').toLowerCase().trim();
          return s !== 'payment pending' && s !== 'unpaid';
        }).map(a => {
          const claim = localClaims[a.id] || {};
          const assignedId = a.followUpAssignedTo || claim.assignedTo || null;
          const assignedName = a.followUpAssignedName || claim.assignedName || null;
          const assignedStatus = a.followUpStatus || claim.status || (assignedId ? 'In Follow-up' : 'Unclaimed');
          const notes = a.followUpNotes || claim.notes || [];

          const refCode = String(a.referredBy || '').toLowerCase().trim();
          const refHr = hrMap[refCode];
          const isAgent = refHr?.role === 'agent' || refCode.startsWith('ag-');

          return {
            ...a,
            candidateName: a.candidateName || a.candidateDetails?.name || 'Applicant',
            candidateEmail: a.candidateEmail || a.candidateDetails?.email || '',
            candidateMobile: a.candidateMobile || a.candidateDetails?.mobile || '',
            candidateLocation: a.candidateLocation || a.candidateDetails?.location || '',
            candidateQualification: a.candidateQualification || a.candidateDetails?.qualification || '',
            candidateExperience: a.candidateExperience || a.candidateDetails?.experience || '',
            candidateResumeUrl: a.candidateResumeUrl || a.resumeUrl || '',
            jobTitle: a.jobTitle || 'Job Opening',
            companyName: a.companyName || 'Corporate Partner',
            hrName: refHr ? refHr.name : (a.hrName || a.referredBy || 'Direct Sourced'),
            hrCode: refHr ? refHr.referralCode : (a.referredBy || ''),
            partnerName: isAgent ? (refHr?.name || a.partnerName || 'Agent') : (a.partnerName || null),
            isPartnerReferral: isAgent || Boolean(a.isPartnerReferral || a.partnerName),
            followUpAssignedTo: assignedId,
            followUpAssignedName: assignedName,
            followUpStatus: assignedStatus,
            followUpNotes: notes
          };
        });

        // Filter based on scope
        let filtered = validApps;
        if (scope === 'my' && currentUser?.id) {
          filtered = validApps.filter(a => a.followUpAssignedTo === currentUser.id);
        } else if (scope === 'unclaimed') {
          filtered = validApps.filter(a => !a.followUpAssignedTo);
        }

        setApplications(filtered);
        setCounts({
          total: validApps.length,
          unclaimed: validApps.filter(a => !a.followUpAssignedTo).length,
          myFollowUps: currentUser?.id ? validApps.filter(a => a.followUpAssignedTo === currentUser.id).length : 0
        });
      }
    } catch (err) {
      console.error('Error fetching follow-up applications:', err);
    } finally {
      setLoading(false);
    }
  }, [resolvedApi, activeSubTab, currentUser?.id]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  // Claim application (Pick to My Follow-ups) with local storage sync
  const handleClaim = async (app) => {
    if (!currentUser?.id) return;

    // Safety Prompt if the referring HR has already closed this candidate
    const st = String(app.status || '').toLowerCase();
    if (st.includes('select') || st.includes('join') || st.includes('convert')) {
      const confirmClaim = window.confirm(
        `⚠️ Warning: This candidate is already marked as "${app.status}" by HR Ref: ${app.hrName || app.referredBy}.\n\nAre you sure you want to pick this candidate for follow-up?`
      );
      if (!confirmClaim) return;
    }
    try {
      let claimedOnServer = false;
      try {
        const res = await fetch(`${resolvedApi}/api/follow-ups/${app.id}/claim`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hrId: currentUser.id,
            hrName: currentUser.name || 'HR'
          })
        });
        if (res.ok) claimedOnServer = true;
      } catch (e) {}

      // Always save locally so it works even if remote server route is not deployed yet
      try {
        const localClaims = JSON.parse(localStorage.getItem('fic_follow_up_claims') || '{}');
        localClaims[app.id] = {
          assignedTo: currentUser.id,
          assignedName: currentUser.name || 'HR',
          assignedAt: new Date().toISOString(),
          status: 'In Follow-up',
          notes: [
            {
              note: `Claimed by ${currentUser.name || 'HR'} for follow-up`,
              updatedBy: currentUser.name || 'HR',
              updatedAt: new Date().toISOString()
            },
            ...(app.followUpNotes || [])
          ]
        };
        localStorage.setItem('fic_follow_up_claims', JSON.stringify(localClaims));
      } catch (e) {}

      fetchFollowUps();
    } catch (err) {
      console.error('Claim error:', err);
      alert('Error claiming application');
    }
  };

  // Release application back to central pool
  const handleRelease = async (app) => {
    if (!window.confirm(`Release candidate "${app.candidateName}" back to the shared pool?`)) return;
    try {
      fetch(`${resolvedApi}/api/follow-ups/${app.id}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hrId: currentUser?.id,
          hrName: currentUser?.name || 'HR',
          reason: 'Released by HR'
        })
      }).catch(() => null);

      try {
        const localClaims = JSON.parse(localStorage.getItem('fic_follow_up_claims') || '{}');
        delete localClaims[app.id];
        localStorage.setItem('fic_follow_up_claims', JSON.stringify(localClaims));
      } catch (e) {}

      fetchFollowUps();
    } catch (err) {
      console.error('Release error:', err);
    }
  };

  // Save follow-up status & notes
  const handleSaveStatus = async () => {
    if (!selectedApp) return;
    setSavingStatus(true);
    setActionError('');
    try {
      fetch(`${resolvedApi}/api/follow-ups/${selectedApp.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hrId: currentUser?.id,
          hrName: currentUser?.name || 'Follow-up HR',
          followUpStatus: newStatus,
          note: followUpNote,
          nextFollowUpDate: nextFollowUpDate
        })
      }).catch(() => null);

      // Save locally
      try {
        const localClaims = JSON.parse(localStorage.getItem('fic_follow_up_claims') || '{}');
        const current = localClaims[selectedApp.id] || {
          assignedTo: currentUser?.id,
          assignedName: currentUser?.name || 'Follow-up HR'
        };
        current.status = newStatus;
        current.nextFollowUpDate = nextFollowUpDate;
        const newNotes = Array.isArray(current.notes) ? current.notes : [];
        if (followUpNote && followUpNote.trim()) {
          newNotes.unshift({
            note: followUpNote.trim(),
            status: newStatus,
            nextDate: nextFollowUpDate,
            updatedBy: currentUser?.name || 'Follow-up HR',
            updatedAt: new Date().toISOString()
          });
        }
        current.notes = newNotes;
        localClaims[selectedApp.id] = current;
        localStorage.setItem('fic_follow_up_claims', JSON.stringify(localClaims));
      } catch (e) {}

      setSelectedApp(null);
      setFollowUpNote('');
      setNextFollowUpDate('');
      fetchFollowUps();
    } catch (err) {
      console.error('Status error:', err);
      setActionError('Error saving status update');
    } finally {
      setSavingStatus(false);
    }
  };

  // Distinct HR Application Status Badge (Selected, Shortlisted, Interview, etc.)
  const renderHrStatusBadge = (status) => {
    if (!status || status === 'Applied' || status === 'Payment Pending') return null;
    const lower = String(status).toLowerCase();
    const isClosed = lower.includes('select') || lower.includes('join') || lower.includes('convert');
    const isInterview = lower.includes('interview');
    const isReject = lower.includes('reject') || lower.includes('not interest');

    let bg = '#eff6ff', color = '#1d4ed8', border = '#93c5fd', icon = '📌';
    if (isClosed) {
      bg = '#ecfdf5'; color = '#047857'; border = '#10b981'; icon = '🎉';
    } else if (isInterview) {
      bg = '#fef3c7'; color = '#b45309'; border = '#f59e0b'; icon = '📅';
    } else if (isReject) {
      bg = '#fef2f2'; color = '#b91c1c'; border = '#f87171'; icon = '✕';
    }

    return (
      <span style={{
        marginLeft: '6px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: bg,
        color: color,
        border: `1.5px solid ${border}`,
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '0.72rem',
        fontWeight: 800,
        boxShadow: isClosed ? '0 1px 3px rgba(16, 185, 129, 0.2)' : 'none'
      }}>
        {icon} HR Status: {status}
      </span>
    );
  };

  const filteredApps = applications.filter(a => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (a.candidateName || '').toLowerCase().includes(q) ||
      (a.candidateMobile || '').includes(q) ||
      (a.jobTitle || '').toLowerCase().includes(q) ||
      (a.companyName || '').toLowerCase().includes(q) ||
      (a.followUpAssignedName || '').toLowerCase().includes(q);

    const hrStatusLower = String(a.status || '').toLowerCase();
    const isHrClosed = hrStatusLower.includes('select') || hrStatusLower.includes('join') || hrStatusLower.includes('convert');

    let matchesStatus = true;
    if (statusFilter === 'hide_closed') {
      matchesStatus = !isHrClosed;
    } else if (statusFilter === 'closed_only') {
      matchesStatus = isHrClosed;
    } else if (statusFilter !== 'all') {
      matchesStatus = String(a.followUpStatus || 'Unclaimed').toLowerCase() === statusFilter.toLowerCase();
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '0 0 2rem 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎧 Follow-up Central Pipeline
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Shared candidate pipeline for follow-up HRs to claim, call, and track conversions.
          </p>
        </div>
        <button
          onClick={fetchFollowUps}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
        >
          <RefreshCw size={14} /> Refresh Pool
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>All Applications</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{counts.total}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Direct + Partner Leads</div>
        </div>

        <div style={{ background: '#fef3c7', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #fde68a' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Unclaimed In Pool</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#92400e', marginTop: '4px' }}>{counts.unclaimed}</div>
          <div style={{ fontSize: '0.72rem', color: '#b45309' }}>Available for follow-up HRs to pick</div>
        </div>

        {isHr && (
          <div style={{ background: '#ecfdf5', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #a7f3d0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>My Active Follow-ups</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#065f46', marginTop: '4px' }}>{counts.myFollowUps}</div>
            <div style={{ fontSize: '0.72rem', color: '#047857' }}>Currently assigned to you</div>
          </div>
        )}
      </div>

      {/* Tabs Switcher: 'pool' vs 'my' vs 'unclaimed' */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', flexWrap: 'wrap' }}>
        {isHr && (
          <button
            onClick={() => setActiveSubTab('my')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeSubTab === 'my' ? '#059669' : '#f1f5f9',
              color: activeSubTab === 'my' ? '#fff' : '#475569'
            }}
          >
            📌 My Follow-ups ({counts.myFollowUps})
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('unclaimed')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeSubTab === 'unclaimed' ? '#d97706' : '#f1f5f9',
            color: activeSubTab === 'unclaimed' ? '#fff' : '#475569'
          }}
        >
          ⚡ Unclaimed Pool ({counts.unclaimed})
        </button>

        <button
          onClick={() => setActiveSubTab('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeSubTab === 'all' ? '#2563eb' : '#f1f5f9',
            color: activeSubTab === 'all' ? '#fff' : '#475569'
          }}
        >
          🌐 All Applications ({counts.total})
        </button>
      </div>

      {/* Search & Status Filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search candidate name, mobile, job, or assigned HR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff' }}
        >
          <option value="all">All Statuses</option>
          <option value="hide_closed">⚡ Active Only (Hide Placed/Selected)</option>
          <option value="closed_only">🎉 Placed / Selected by HR</option>
          <option value="Unclaimed">Unclaimed</option>
          <option value="In Follow-up">In Follow-up</option>
          <option value="Call Later">Call Later / Follow-up</option>
          <option value="Interested">Interested</option>
          <option value="Documents Requested">Documents Requested</option>
          <option value="Interview Scheduled">Interview Scheduled</option>
          <option value="Ready to Pay">Ready to Pay</option>
          <option value="Converted">Converted / Placed</option>
          <option value="Not Interested">Not Interested</option>
        </select>
      </div>

      {/* Applications Table / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
          <div>Loading follow-up applications...</div>
        </div>
      ) : filteredApps.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '3rem', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📂</div>
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>No Applications Found</div>
          <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            {activeSubTab === 'my'
              ? 'You have not claimed any applications yet. Switch to "Unclaimed Pool" to pick candidates.'
              : 'No applications match your search or filter.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredApps.map((app) => {
            const isClaimedByMe = currentUser?.id && app.followUpAssignedTo === currentUser.id;
            const isClaimedByOther = app.followUpAssignedTo && app.followUpAssignedTo !== currentUser?.id;
            const appStatusLower = String(app.status || '').toLowerCase();
            const isCandidateClosed = appStatusLower.includes('select') || appStatusLower.includes('join') || appStatusLower.includes('convert');

            return (
              <div
                key={app.id}
                style={{
                  background: isCandidateClosed ? '#f0fdf4' : '#ffffff',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  border: isCandidateClosed ? '1.5px solid #86efac' : isClaimedByMe ? '1.5px solid #10b981' : isClaimedByOther ? '1px solid #e2e8f0' : '1.5px solid #fde68a',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Top Row: Candidate details & Claimed badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                        {app.candidateName}
                      </span>
                      {app.candidateMobile && (
                        <a
                          href={`tel:${app.candidateMobile}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#ecfdf5',
                            color: '#047857',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            textDecoration: 'none'
                          }}
                        >
                          <Phone size={12} /> {app.candidateMobile}
                        </a>
                      )}
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-GB') : 'Recent'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                      💼 <strong>{app.jobTitle}</strong> • {app.companyName}
                      {app.isPartnerReferral && (
                        <span style={{ marginLeft: '6px', background: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                          Partner: {app.partnerName || app.referringAgentCode || 'Agent'}
                        </span>
                      )}
                      {!app.isPartnerReferral && app.referredBy && (
                        <>
                          <span style={{ marginLeft: '6px', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700, border: '1px solid #fde68a' }}>
                            👤 HR Ref: {app.hrName || app.referredBy}
                          </span>
                          {renderHrStatusBadge(app.status)}
                        </>
                      )}
                      {app.isPartnerReferral && renderHrStatusBadge(app.status)}
                    </div>
                  </div>

                  {/* Follow-up Assignment Badge */}
                  <div style={{ textAlign: 'right' }}>
                    {app.followUpAssignedTo ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        <span style={{
                          background: isClaimedByMe ? '#ecfdf5' : '#f1f5f9',
                          color: isClaimedByMe ? '#047857' : '#475569',
                          border: `1px solid ${isClaimedByMe ? '#a7f3d0' : '#cbd5e1'}`,
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          🎧 Follow-up: {isClaimedByMe ? 'Claimed by You' : app.followUpAssignedName}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                          Status: <strong style={{ color: '#2563eb' }}>{app.followUpStatus || 'In Progress'}</strong>
                        </span>
                      </div>
                    ) : (
                      <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                        ⚡ Unclaimed Lead
                      </span>
                    )}
                  </div>
                </div>

                {/* Latest Follow-up Note */}
                {Array.isArray(app.followUpNotes) && app.followUpNotes.length > 0 && (
                  <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #3b82f6', fontSize: '0.78rem', color: '#334155' }}>
                    <strong>Latest Note ({app.followUpNotes[0].updatedBy}):</strong> {app.followUpNotes[0].note}
                    {app.followUpNotes[0].nextDate && (
                      <span style={{ marginLeft: '8px', color: '#b45309', fontWeight: 600 }}>
                        ⏰ Next: {app.followUpNotes[0].nextDate}
                      </span>
                    )}
                  </div>
                )}

                {/* Bottom Actions Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {app.candidateEmail && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ✉️ {app.candidateEmail}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* If unclaimed: Claim Button */}
                    {!app.followUpAssignedTo && (
                      <button
                        onClick={() => handleClaim(app)}
                        style={{
                          background: '#059669',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        📌 Pick to My Follow-up
                      </button>
                    )}

                    {/* If claimed by current HR or Admin: Update Status Button */}
                    {(isClaimedByMe || isAdmin) && (
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setNewStatus(app.followUpStatus || 'Interested');
                          setFollowUpNote('');
                          setNextFollowUpDate(app.nextFollowUpDate || '');
                          setActionError('');
                        }}
                        style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <PhoneCall size={12} /> Log Call / Update Status
                      </button>
                    )}

                    {/* Release Button */}
                    {(isClaimedByMe || isAdmin) && app.followUpAssignedTo && (
                      <button
                        onClick={() => handleRelease(app)}
                        style={{
                          background: '#f8fafc',
                          color: '#64748b',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        title="Release back to shared pool"
                      >
                        Release
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Log Call & Update Follow-up Status */}
      {selectedApp && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '14px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '1.5rem', width: '100%', maxWidth: '460px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                📞 Update Follow-up: {selectedApp.candidateName}
              </h3>
              <button onClick={() => setSelectedApp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            {actionError && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '10px' }}>
                {actionError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Call / Follow-up Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="In Follow-up">⏳ In Follow-up</option>
                  <option value="Call Later">⏰ Call Later / Re-attempt</option>
                  <option value="Interested">👍 Interested & Explained</option>
                  <option value="Documents Requested">📄 Documents Requested</option>
                  <option value="Interview Scheduled">📅 Interview Scheduled</option>
                  <option value="Ready to Pay">💳 Ready to Pay Fee</option>
                  <option value="Converted">🎉 Converted / Placed</option>
                  <option value="Not Interested">❌ Not Interested</option>
                  <option value="Wrong Number">📵 Wrong Number / Not Reachable</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Next Follow-up Reminder (Optional)
                </label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Call Notes / Candidate Remarks *
                </label>
                <textarea
                  placeholder="e.g. Spoke with candidate, interested in Axis Bank role, asked to call tomorrow at 4 PM..."
                  rows={3}
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  onClick={() => setSelectedApp(null)}
                  style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStatus}
                  disabled={savingStatus}
                  style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  {savingStatus ? 'Saving...' : 'Save Follow-up'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

