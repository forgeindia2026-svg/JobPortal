import React, { useState, useEffect } from 'react';
import {
  Building2, Users, UserPlus, CheckCircle2, XCircle, Clock, ShieldCheck,
  Edit, Trash2, Mail, Phone, MapPin, RefreshCw, UserCheck, AlertCircle, ChevronRight,
  Eye, ArrowLeft, Briefcase, FileText
} from 'lucide-react';

export default function HierarchyManager({ API_URL, currentUser, hrs = [], onRefresh }) {
  const [subTab, setSubTab] = useState('team_leaders'); // default to team_leaders so approvals are front & center
  const [bms, setBms] = useState([]);
  const [tls, setTls] = useState([]);
  const [loading, setLoading] = useState(true);

  // BM Modal
  const [bmModalOpen, setBmModalOpen] = useState(false);
  const [bmToEdit, setBmToEdit] = useState(null);
  const [bmForm, setBmForm] = useState({ name: '', email: '', password: '', mobile: '', branch: '', location: '' });
  const [bmSaving, setBmSaving] = useState(false);
  const [bmError, setBmError] = useState('');

  // Assign HR to TL Modal
  const [assignModalTl, setAssignModalTl] = useState(null);
  const [assigningHrId, setAssigningHrId] = useState(null);

  // Approval action loading
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedBmId, setSelectedBmId] = useState(null);
  const selectedBm = bms.find(b => b.id === selectedBmId) || null;
  const [successBanner, setSuccessBanner] = useState('');

  // Team Leader Drilldown states (as requested by user with Image 2 & Image 3)
  const [selectedTlId, setSelectedTlId] = useState(null);
  const [tlOverviewData, setTlOverviewData] = useState(null);
  const [tlOverviewLoading, setTlOverviewLoading] = useState(false);
  const [selectedHrForCandidateBreakdown, setSelectedHrForCandidateBreakdown] = useState(null);

  const fetchTlOverview = async (tlId) => {
    try {
      setTlOverviewLoading(true);
      const res = await fetch(`${API_URL}/api/users/team-leaders/${tlId}/overview`);
      if (res.ok) {
        const json = await res.json();
        setTlOverviewData(json);
      }
    } catch (err) {
      console.error('Error fetching TL overview:', err);
    } finally {
      setTlOverviewLoading(false);
    }
  };

  const handleOpenTlDetails = (tlId) => {
    setSelectedTlId(tlId);
    setSelectedHrForCandidateBreakdown(null);
    fetchTlOverview(tlId);
  };

  const showSuccess = (msg) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      const [bmRes, tlRes] = await Promise.all([
        fetch(`${API_URL}/api/users/branch-managers`),
        fetch(`${API_URL}/api/users/team-leaders`)
      ]);
      if (bmRes.ok) setBms(await bmRes.json());
      if (tlRes.ok) setTls(await tlRes.json());
    } catch (err) {
      console.error('Error fetching hierarchy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  // --- Branch Manager Handlers ---
  const handleOpenBmModal = (bm = null) => {
    setBmToEdit(bm);
    setBmForm({
      name: bm ? bm.name : '',
      email: bm ? bm.email : '',
      password: '',
      mobile: bm ? (bm.mobile || '') : '',
      branch: bm ? (bm.branch || '') : '',
      location: bm ? (bm.location || '') : ''
    });
    setBmError('');
    setBmModalOpen(true);
  };

  const handleSaveBm = async (e) => {
    e.preventDefault();
    setBmSaving(true);
    setBmError('');

    try {
      const url = bmToEdit
        ? `${API_URL}/api/users/branch-managers/${bmToEdit.id}`
        : `${API_URL}/api/users/branch-managers`;
      const method = bmToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bmForm)
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess(bmToEdit ? 'Branch Manager updated successfully!' : 'Branch Manager created successfully!');
        setBmModalOpen(false);
        fetchHierarchy();
        if (onRefresh) onRefresh();
      } else {
        setBmError(data.error || 'Failed to save Branch Manager');
      }
    } catch (err) {
      setBmError('Network error saving Branch Manager');
    } finally {
      setBmSaving(false);
    }
  };

  const handleDeleteBm = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete Branch Manager "${name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/users/branch-managers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccess(`Branch Manager "${name}" deleted.`);
        fetchHierarchy();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error deleting BM:', err);
    }
  };

  // --- TL Approval Handlers ---
  const handleTlApproval = async (tlId, tlName, status) => {
    const actionLabel = status === 'approved' ? 'Approve' : 'Reject';
    if (!window.confirm(`Are you sure you want to ${actionLabel} Team Leader "${tlName}"?`)) return;

    setActionLoading(tlId);
    try {
      const res = await fetch(`${API_URL}/api/users/team-leaders/${tlId}/approval`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess(`Team Leader "${tlName}" has been ${status} by Admin!`);
        fetchHierarchy();
        if (onRefresh) onRefresh();
      } else {
        alert(data.error || 'Failed to update approval status');
      }
    } catch (err) {
      console.error('Error updating approval:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTl = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete Team Leader "${name}"? Any HRs under this TL will be unassigned.`)) return;
    try {
      const res = await fetch(`${API_URL}/api/users/team-leaders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccess(`Team Leader "${name}" deleted.`);
        fetchHierarchy();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error deleting TL:', err);
    }
  };

  // --- HR to TL Assignment ---
  const handleToggleHrAssignment = async (hrId, isCurrentlyAssigned, targetTlId) => {
    setAssigningHrId(hrId);
    try {
      const res = await fetch(`${API_URL}/api/users/hr/${hrId}/assign-tl`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamLeaderId: isCurrentlyAssigned ? null : targetTlId })
      });
      if (res.ok) {
        fetchHierarchy();
        if (onRefresh) onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update HR assignment');
      }
    } catch (err) {
      console.error('Error assigning HR to TL:', err);
    } finally {
      setAssigningHrId(null);
    }
  };

  // Metrics
  const totalBms = bms.length;
  const totalTls = tls.length;
  const pendingTls = tls.filter(t => t.approvalStatus === 'pending');
  const approvedTls = tls.filter(t => t.approvalStatus === 'approved');

  return (
    <div style={{ color: '#1e293b' }}>
      {/* Top Banner & Heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={26} color="#3b82f6" /> Branch & Team Hierarchy Management
          </h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Super Admin Controls: Add Branch Managers, review & approve Team Leaders, and assign HRs under Team Leaders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { fetchHierarchy(); if (onRefresh) onRefresh(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          {subTab === 'branch_managers' && (
            <button
              onClick={() => handleOpenBmModal()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#fff', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
            >
              <UserPlus size={16} /> Add Branch Manager
            </button>
          )}
        </div>
      </div>

      {successBanner && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="#059669" /> {successBanner}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Branch Managers</span>
            <Building2 size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{totalBms}</div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Managing company branches</span>
        </div>

        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Team Leaders</span>
            <Users size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{totalTls}</div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Added across all branches</span>
        </div>

        <div style={{ background: pendingTls.length > 0 ? '#fffbeb' : '#fff', padding: '1.25rem', borderRadius: '14px', border: pendingTls.length > 0 ? '2px solid #f59e0b' : '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: pendingTls.length > 0 ? '#b45309' : '#64748b', textTransform: 'uppercase' }}>
              Pending Admin Approvals
            </span>
            <Clock size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#d97706' }}>{pendingTls.length}</div>
          <span style={{ fontSize: '0.75rem', color: pendingTls.length > 0 ? '#92400e' : '#94a3b8' }}>
            {pendingTls.length > 0 ? '⚠️ Action Required: Review & Approve' : 'All Team Leaders Approved'}
          </span>
        </div>

        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Approved Team Leaders</span>
            <CheckCircle2 size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#16a34a' }}>{approvedTls.length}</div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Active with login rights</span>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div style={{ display: selectedBm ? 'none' : 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setSubTab('team_leaders')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'team_leaders' ? '3px solid #3b82f6' : '3px solid transparent',
            color: subTab === 'team_leaders' ? '#2563eb' : '#64748b',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={18} /> Team Leaders & Admin Approvals ({tls.length})
          {pendingTls.length > 0 && (
            <span style={{ background: '#f59e0b', color: '#fff', borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 800 }}>
              {pendingTls.length} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('branch_managers')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'branch_managers' ? '3px solid #3b82f6' : '3px solid transparent',
            color: subTab === 'branch_managers' ? '#2563eb' : '#64748b',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Building2 size={18} /> Branch Managers ({bms.length})
        </button>
      </div>

      {/* SUB-TAB 1: TEAM LEADERS & APPROVALS */}
      {/* BRANCH DETAIL VIEW */}
      {selectedBm && (() => {
        const bmTls = tls.filter(t => t.branchManagerId === selectedBm.id);
        const bmTlIds = bmTls.map(t => t.id);
        const bmHrs = hrs.filter(h => bmTlIds.includes(h.teamLeaderId));
        return (
          <div>
            <button
              onClick={() => setSelectedBmId(null)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#475569', marginBottom: '1.25rem' }}
            >
              ← Back to Branch Managers
            </button>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{selectedBm.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>✉ {selectedBm.email}{selectedBm.mobile ? `  •  📱 ${selectedBm.mobile}` : ''}</div>
                </div>
                <span style={{ alignSelf: 'flex-start', background: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: '8px', fontWeight: 800 }}>
                  🏢 {selectedBm.branch || selectedBm.location || 'Main Branch'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{bmTls.length}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>Team Leaders</div></div>
                <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '10px', textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>{bmTls.filter(t => t.approvalStatus === 'approved').length}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>Approved</div></div>
                <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '10px', textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>{bmTls.filter(t => t.approvalStatus === 'pending').length}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pending</div></div>
                <div style={{ background: '#f5f3ff', padding: '12px', borderRadius: '10px', textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed' }}>{bmHrs.length}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>HRs in Branch</div></div>
              </div>
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>Team Leaders & their HRs</h4>
            {bmTls.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                No Team Leaders added under this branch yet.
              </div>
            ) : bmTls.map(tl => {
              const tlHrs = hrs.filter(h => h.teamLeaderId === tl.id);
              return (
                <div key={tl.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{tl.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{tl.email}{tl.mobile ? ` • ${tl.mobile}` : ''}</div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, background: tl.approvalStatus === 'approved' ? '#ecfdf5' : tl.approvalStatus === 'rejected' ? '#fef2f2' : '#fffbeb', color: tl.approvalStatus === 'approved' ? '#059669' : tl.approvalStatus === 'rejected' ? '#dc2626' : '#b45309' }}>
                      {tl.approvalStatus === 'approved' ? '✓ Approved' : tl.approvalStatus === 'rejected' ? '✕ Rejected' : '⏳ Pending Approval'}
                    </span>
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {tlHrs.length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No HRs assigned</span>
                    ) : tlHrs.map(hr => (
                      <span key={hr.id} style={{ background: '#f1f5f9', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                        👤 {hr.name} <span style={{ color: '#94a3b8' }}>({hr.referralCode})</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* TEAM LEADER DRILLDOWN VIEW (Matching user Image 2 & Image 3) */}
      {selectedTlId && (() => {
        if (tlOverviewLoading) {
          return (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={24} style={{ margin: '0 auto 10px auto', display: 'block', animation: 'spin 1s linear infinite' }} />
              Loading Team Leader overview...
            </div>
          );
        }

        if (!tlOverviewData) {
          return (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', textAlign: 'center' }}>
              <button
                onClick={() => setSelectedTlId(null)}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, marginBottom: '1rem' }}
              >
                ← Back
              </button>
              <p style={{ color: '#ef4444' }}>Unable to load Team Leader data.</p>
            </div>
          );
        }

        // VIEW 3: CANDIDATE BREAKDOWN FOR AN HR (Matching user's Image 3)
        if (selectedHrForCandidateBreakdown) {
          const hr = selectedHrForCandidateBreakdown;
          const hrApps = hr.applications || [];
          return (
            <div>
              <button
                onClick={() => setSelectedHrForCandidateBreakdown(null)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569', marginBottom: '1.25rem' }}
              >
                <ArrowLeft size={16} /> Back to Team HRs
              </button>

              {/* Header Box (Image 3) */}
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Upcoming Candidates for {hr.name}
                  </h3>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    Referral Code: <span style={{ color: '#0f172a', fontWeight: 800 }}>{hr.referralCode || 'HR'}</span>
                    {hr.email ? ` • ✉ ${hr.email}` : ''}
                    {hr.mobile ? ` • 📱 ${hr.mobile}` : ''}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669' }}>
                    ₹{(hr.totalAmount || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Total Expected</div>
                </div>
              </div>

              {/* Candidates Table (Image 3) */}
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                        <th style={{ padding: '14px 18px', width: '60px' }}>S.No</th>
                        <th style={{ padding: '14px 18px' }}>Candidate Details</th>
                        <th style={{ padding: '14px 18px' }}>Job Info</th>
                        <th style={{ padding: '14px 18px' }}>Status</th>
                        <th style={{ padding: '14px 18px', textAlign: 'right' }}>Expected Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hrApps.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                            No candidates have applied through {hr.name} yet.
                          </td>
                        </tr>
                      ) : (
                        hrApps.map((app, idx) => {
                          const statusLower = String(app.status || 'applied').toLowerCase();
                          const isSuccess = ['selected', 'hired', 'approved', 'closed'].includes(statusLower);
                          const isPending = ['applied', 'pending', 'interview'].includes(statusLower);
                          return (
                            <tr key={app.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '16px 18px', color: '#64748b', fontWeight: 600 }}>{idx + 1}</td>
                              <td style={{ padding: '16px 18px' }}>
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{app.candidateName || 'Candidate'}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                                  {app.candidateEmail}{app.candidateMobile ? ` • ${app.candidateMobile}` : ''}
                                </div>
                                {app.candidateResumeUrl && (
                                  <a href={app.candidateResumeUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '4px', textDecoration: 'none', fontWeight: 600 }}>
                                    <FileText size={12} /> View Resume
                                  </a>
                                )}
                              </td>
                              <td style={{ padding: '16px 18px' }}>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.jobTitle || 'Job Role'}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{app.companyName || 'Company'}</div>
                              </td>
                              <td style={{ padding: '16px 18px' }}>
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '20px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  background: isSuccess ? '#ecfdf5' : isPending ? '#e0f2fe' : '#fef2f2',
                                  color: isSuccess ? '#059669' : isPending ? '#0369a1' : '#dc2626',
                                  border: `1px solid ${isSuccess ? '#a7f3d0' : isPending ? '#bae6fd' : '#fecaca'}`
                                }}>
                                  {app.status || 'Applied'}
                                </span>
                              </td>
                              <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                                <span style={{ fontWeight: 800, color: '#059669', fontSize: '1.05rem' }}>
                                  ₹{(Number(app.incentiveAmount) || 0).toLocaleString()}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        }

        // VIEW 2: HRs TABLE UNDER TL (Matching user's Image 2)
        const { teamLeader, kpis, hrs: tlHrs } = tlOverviewData;
        return (
          <div>
            <button
              onClick={() => setSelectedTlId(null)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569', marginBottom: '1.25rem' }}
            >
              <ArrowLeft size={16} /> Back to Team Leaders
            </button>

            {/* TL Profile Header Card */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{teamLeader.name}</h3>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>
                      Team Leader
                    </span>
                    <span style={{ background: teamLeader.approvalStatus === 'approved' ? '#ecfdf5' : '#fffbeb', color: teamLeader.approvalStatus === 'approved' ? '#059669' : '#b45309', padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {teamLeader.approvalStatus === 'approved' ? '✓ Approved' : '⏳ Pending'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>
                    ✉ {teamLeader.email}{teamLeader.mobile ? ` • 📱 ${teamLeader.mobile}` : ''} • 🏢 Branch: {teamLeader.branch || 'Main Branch'}
                  </div>
                  {teamLeader.branchManagerName && (
                    <div style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 600, marginTop: '4px' }}>
                      Branch Manager: {teamLeader.branchManagerName}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setAssignModalTl(teamLeader)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}
                >
                  <UserCheck size={16} /> Manage HR Assignments
                </button>
              </div>

              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginTop: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{kpis.totalHrs}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Assigned HRs</div>
                </div>
                <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb' }}>{kpis.totalCandidates}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Candidates</div>
                </div>
                <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a' }}>₹{(kpis.totalAmount || 0).toLocaleString()}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Team Amount</div>
                </div>
                <div style={{ background: '#fdf4ff', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7' }}>{kpis.selectedCount}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Selected / Placed</div>
                </div>
              </div>
            </div>

            {/* HRs Table (Exact match of user's Image 2) */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Assigned HRs under {teamLeader.name}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  Click "View Candidates" on any HR to see candidate details, applied jobs, and incentive breakdown.
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '14px 20px' }}>HR Name</th>
                      <th style={{ padding: '14px 20px' }}>Referral Code</th>
                      <th style={{ padding: '14px 20px' }}>Upcoming Candidates</th>
                      <th style={{ padding: '14px 20px' }}>Total Upcoming Amount</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tlHrs.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                          No HRs currently assigned under this Team Leader. Click "Manage HR Assignments" above to assign approved HRs.
                        </td>
                      </tr>
                    ) : (
                      tlHrs.map((hr) => (
                        <tr key={hr.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{hr.name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>HR</div>
                          </td>
                          <td style={{ padding: '16px 20px', fontWeight: 800, color: '#0f172a' }}>
                            {hr.referralCode || 'HR'}
                          </td>
                          <td style={{ padding: '16px 20px', color: '#0f172a', fontWeight: 600 }}>
                            {hr.candidatesCount || 0} Candidates
                          </td>
                          <td style={{ padding: '16px 20px', fontWeight: 800, color: '#059669', fontSize: '1rem' }}>
                            ₹{(hr.totalAmount || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <button
                              onClick={() => setSelectedHrForCandidateBreakdown(hr)}
                              style={{
                                padding: '8px 18px',
                                background: '#2563eb',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                              onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
                            >
                              View Candidates
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {!selectedBm && !selectedTlId && subTab === 'team_leaders' && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Team Leaders & Approvals</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Team Leaders created by Branch Managers. Only Admin-approved Team Leaders can login and have HRs assigned to them.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px' }}>Team Leader</th>
                  <th style={{ padding: '12px 16px' }}>Branch Manager</th>
                  <th style={{ padding: '12px 16px' }}>Branch</th>
                  <th style={{ padding: '12px 16px' }}>Admin Approval Status</th>
                  <th style={{ padding: '12px 16px' }}>Approved HRs</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading Team Leaders...</td>
                  </tr>
                ) : tls.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                      No Team Leaders registered yet. Branch Managers can add Team Leaders from their Branch portal.
                    </td>
                  </tr>
                ) : (
                  tls.map((tl) => (
                    <tr key={tl.id} style={{ borderBottom: '1px solid #f1f5f9', background: tl.approvalStatus === 'pending' ? '#fffdf7' : 'transparent' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div
                          onClick={() => handleOpenTlDetails(tl.id)}
                          style={{ fontWeight: 800, color: '#0284c7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Click to view Team HRs & Candidates"
                        >
                          <span>{tl.name}</span>
                          <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            View Team ➔
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Mail size={12} /> {tl.email}
                        </div>
                        {tl.mobile && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Phone size={12} /> {tl.mobile}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#334155' }}>
                        <div style={{ fontWeight: 600 }}>{tl.branchManagerName}</div>
                        {tl.branchManagerEmail && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{tl.branchManagerEmail}</div>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                          {tl.branch || 'Main Branch'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {tl.approvalStatus === 'approved' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                            <CheckCircle2 size={14} /> Approved by Admin
                          </span>
                        ) : tl.approvalStatus === 'rejected' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #fecaca' }}>
                            <XCircle size={14} /> Rejected
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fffbeb', color: '#b45309', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, border: '1px solid #fde68a' }}>
                            <Clock size={14} color="#d97706" /> Pending Admin Approval
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => handleOpenTlDetails(tl.id)} title="Click to view Team HRs & Candidates">
                        {(() => {
                          const tlHrs = hrs.filter(h => h.teamLeaderId === tl.id);
                          return (
                            <div>
                              <div style={{ fontWeight: 800, color: '#0284c7', marginBottom: tlHrs.length > 0 ? '6px' : '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>{tlHrs.length} HRs assigned</span>
                                <span style={{ fontSize: '0.7rem', color: '#2563eb' }}>➔</span>
                              </div>
                              {tlHrs.length === 0 ? (
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>None assigned</span>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {tlHrs.map(h => (
                                    <div
                                      key={h.id}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: '#ecfdf5',
                                        color: '#065f46',
                                        border: '1px solid #a7f3d0',
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.78rem',
                                        fontWeight: 600,
                                        width: 'fit-content'
                                      }}
                                      title={h.email}
                                    >
                                      <span>👤 {h.name}</span>
                                      <span style={{ color: '#059669', fontSize: '0.72rem', background: '#d1fae5', padding: '1px 5px', borderRadius: '4px' }}>
                                        {h.referralCode || 'HR'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                          {tl.approvalStatus === 'pending' ? (
                            <>
                              <button
                                disabled={actionLoading === tl.id}
                                onClick={() => handleTlApproval(tl.id, tl.name, 'approved')}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)' }}
                              >
                                <CheckCircle2 size={14} /> Approve TL
                              </button>
                              <button
                                disabled={actionLoading === tl.id}
                                onClick={() => handleTlApproval(tl.id, tl.name, 'rejected')}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </>
                          ) : tl.approvalStatus === 'approved' ? (
                            <>
                              <button
                                onClick={() => handleOpenTlDetails(tl.id)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}
                                title="Click to view Team HRs & Candidates"
                              >
                                <Eye size={14} /> View Team ➔
                              </button>
                              <button
                                onClick={() => setAssignModalTl(tl)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                                title="Click to view and manage HRs under this Team Leader"
                              >
                                <UserCheck size={14} /> Assign HRs ({tl.assignedHrsCount || 0})
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleTlApproval(tl.id, tl.name, 'approved')}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#f1f5f9', color: '#16a34a', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                            >
                              Re-Approve
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteTl(tl.id, tl.name)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            title="Delete Team Leader"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BRANCH MANAGERS */}
      {!selectedBm && subTab === 'branch_managers' && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Registered Branch Managers</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Branch Managers oversee branches and recruit Team Leaders under them.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px' }}>Branch Manager</th>
                  <th style={{ padding: '12px 16px' }}>Branch / Location</th>
                  <th style={{ padding: '12px 16px' }}>Total TLs</th>
                  <th style={{ padding: '12px 16px' }}>Approved TLs</th>
                  <th style={{ padding: '12px 16px' }}>Total HRs</th>
                  <th style={{ padding: '12px 16px' }}>Created Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading Branch Managers...</td>
                  </tr>
                ) : bms.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                      No Branch Managers created yet. Click <strong>+ Add Branch Manager</strong> to create one!
                    </td>
                  </tr>
                ) : (
                  bms.map((bm) => (
                    <tr key={bm.id} onClick={() => setSelectedBmId(bm.id)} title="Click to view branch details" style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{bm.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Mail size={12} /> {bm.email}
                        </div>
                        {bm.mobile && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Phone size={12} /> {bm.mobile}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#0369a1' }}>
                          {bm.branch || bm.location || 'Main Branch'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                        {bm.tlsCount || 0}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#16a34a' }}>
                        {bm.approvedTlsCount || 0}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#8b5cf6' }}>
                        {bm.hrsCount || 0}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                        {bm.createdAt ? new Date(bm.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenBmModal(bm); }}
                            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}
                            title="Edit Branch Manager"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteBm(bm.id, bm.name); }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            title="Delete Branch Manager"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT BRANCH MANAGER */}
      {bmModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              {bmToEdit ? 'Edit Branch Manager' : 'Add New Branch Manager'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.5rem 0' }}>
              Branch Managers have authorization to add Team Leaders under their designated branch.
            </p>

            {bmError && (
              <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {bmError}
              </div>
            )}

            <form onSubmit={handleSaveBm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anandha Kumar"
                  value={bmForm.name}
                  onChange={e => setBmForm({ ...bmForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. anand.bm@forgeindiaconnect.in"
                  value={bmForm.email}
                  onChange={e => setBmForm({ ...bmForm, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  {bmToEdit ? 'New Password (leave empty to keep current)' : 'Login Password *'}
                </label>
                <input
                  type="password"
                  required={!bmToEdit}
                  placeholder="••••••••"
                  value={bmForm.password}
                  onChange={e => setBmForm({ ...bmForm, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="10 digit mobile number"
                  value={bmForm.mobile}
                  onChange={e => setBmForm({ ...bmForm, mobile: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Branch Name / Region *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chennai - Guindy Branch"
                  value={bmForm.branch}
                  onChange={e => setBmForm({ ...bmForm, branch: e.target.value, location: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setBmModalOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bmSaving}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', fontWeight: 700, cursor: bmSaving ? 'not-allowed' : 'pointer' }}
                >
                  {bmSaving ? 'Saving...' : bmToEdit ? 'Update Manager' : 'Create Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN HRs TO APPROVED TL */}
      {assignModalTl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Assign HRs to Team Leader
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    Team Leader: <strong style={{ color: '#0284c7' }}>{assignModalTl.name}</strong> ({assignModalTl.branch})
                  </p>
                </div>
                <button
                  onClick={() => setAssignModalTl(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Body - HR List */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', color: '#166534' }}>
                Only HRs approved by Admin will be mapped to this Team Leader. Toggle the button to assign or unassign.
              </div>

              {hrs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No HRs found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {hrs.map((hr) => {
                    const isAssignedToThisTl = hr.teamLeaderId === assignModalTl.id;
                    const isAssignedToOther = hr.teamLeaderId && hr.teamLeaderId !== assignModalTl.id;
                    const isBusy = assigningHrId === hr.id;

                    return (
                      <div
                        key={hr.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: isAssignedToThisTl ? '2px solid #059669' : '1px solid #e2e8f0',
                          background: isAssignedToThisTl ? '#ecfdf5' : '#fff'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{hr.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{hr.email} | Code: <strong>{hr.referralCode || 'N/A'}</strong></div>
                          {isAssignedToOther && (
                            <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '2px' }}>
                              Currently assigned to another TL: {hr.teamLeaderName || 'Other TL'}
                            </div>
                          )}
                        </div>

                        <div>
                          <button
                            disabled={isBusy}
                            onClick={() => handleToggleHrAssignment(hr.id, isAssignedToThisTl, assignModalTl.id)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '6px',
                              border: 'none',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: isBusy ? 'not-allowed' : 'pointer',
                              background: isAssignedToThisTl ? '#ef4444' : '#059669',
                              color: '#fff'
                            }}
                          >
                            {isBusy ? 'Saving...' : isAssignedToThisTl ? '✕ Remove HR' : '✓ Assign to TL'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setAssignModalTl(null)}
                style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 600, cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
