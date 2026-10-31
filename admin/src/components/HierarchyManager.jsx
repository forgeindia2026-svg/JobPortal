import React, { useState, useEffect } from 'react';
import {
  Building2, Users, UserPlus, CheckCircle2, XCircle, Clock, ShieldCheck,
  Edit, Trash2, Mail, Phone, MapPin, RefreshCw, UserCheck, AlertCircle, ChevronRight,
  Eye, ArrowLeft, Briefcase, FileText, ExternalLink, Code, Search, Filter, Wallet
} from 'lucide-react';
import BranchManagerDashboard from './BranchManagerDashboard';
import BranchItProjectsTab from './BranchItProjectsTab';

export default function HierarchyManager({ API_URL, currentUser, hrs = [], onRefresh, initialMainView = 'branches' }) {
  // Navigation State
  const [mainView, setMainView] = useState(initialMainView || 'branches'); // 'branches' | 'pending_approvals' | 'it_projects' | 'hr_managers'

  useEffect(() => {
    if (initialMainView) setMainView(initialMainView);
  }, [initialMainView]);
  const [branchTab, setBranchTab] = useState('team_leaders'); // 'team_leaders' | 'it_projects' | 'branch_hrs' | 'recruitment'
  const [branchSearch, setBranchSearch] = useState('');

  // Core Data
  const [bms, setBms] = useState([]);
  const [tls, setTls] = useState([]);
  const [itProjects, setItProjects] = useState([]);
  const [hrManagers, setHrManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  // HR Manager Modal State
  const [hrManagerModalOpen, setHrManagerModalOpen] = useState(false);
  const [hrManagerToEdit, setHrManagerToEdit] = useState(null);
  const [hrManagerForm, setHrManagerForm] = useState({ name: '', email: '', password: '', mobile: '' });
  const [hrManagerSaving, setHrManagerSaving] = useState(false);
  const [hrManagerError, setHrManagerError] = useState('');

  // Selected Entities
  const [selectedBmId, setSelectedBmId] = useState(null);
  const selectedBm = bms.find(b => b.id === selectedBmId) || null;

  // BM Modal (Add / Edit Branch & Manager)
  const [bmModalOpen, setBmModalOpen] = useState(false);
  const [bmToEdit, setBmToEdit] = useState(null);
  const [bmForm, setBmForm] = useState({ name: '', email: '', password: '', mobile: '', branch: '', location: '', canAccessManipalPayout: false });
  const [bmSaving, setBmSaving] = useState(false);
  const [bmError, setBmError] = useState('');

  // Add Team Leader Modal (For designated branch)
  const [tlModalOpen, setTlModalOpen] = useState(false);
  const [tlForm, setTlForm] = useState({ name: '', email: '', password: '', mobile: '', branchManagerId: '', branch: '' });
  const [tlSaving, setTlSaving] = useState(false);
  const [tlError, setTlError] = useState('');

  // Assign HR to TL Modal
  const [assignModalTl, setAssignModalTl] = useState(null);
  const [assigningHrId, setAssigningHrId] = useState(null);

  // Approval action loading
  const [actionLoading, setActionLoading] = useState(null);
  const [successBanner, setSuccessBanner] = useState('');

  // Team Leader Drilldown states (Views 2 & 3)
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
    setTimeout(() => setSuccessBanner(''), 4500);
  };

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      const [bmRes, tlRes, itRes, hrmRes] = await Promise.all([
        fetch(`${API_URL}/api/users/branch-managers`),
        fetch(`${API_URL}/api/users/team-leaders`),
        fetch(`${API_URL}/api/branch-it-projects`),
        fetch(`${API_URL}/api/users/hr-managers`)
      ]);
      if (bmRes.ok) setBms(await bmRes.json());
      if (tlRes.ok) setTls(await tlRes.json());
      if (itRes.ok) setItProjects(await itRes.json());
      if (hrmRes.ok) setHrManagers(await hrmRes.json());
    } catch (err) {
      console.error('Error fetching hierarchy data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- HR Manager Handlers ---
  const handleOpenHrManagerModal = (hrm = null) => {
    setHrManagerToEdit(hrm);
    setHrManagerForm({
      name: hrm ? hrm.name : '',
      email: hrm ? hrm.email : '',
      password: '',
      mobile: hrm ? (hrm.mobile || '') : ''
    });
    setHrManagerError('');
    setHrManagerModalOpen(true);
  };

  const handleSaveHrManager = async (e) => {
    e.preventDefault();
    setHrManagerSaving(true);
    setHrManagerError('');
    try {
      const url = hrManagerToEdit
        ? `${API_URL}/api/users/hr-managers/${hrManagerToEdit.id}`
        : `${API_URL}/api/users/hr-managers`;
      const method = hrManagerToEdit ? 'PUT' : 'POST';
      const body = { ...hrManagerForm };
      if (hrManagerToEdit && !body.password) delete body.password;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        data = { error: res.status === 404 ? 'HR Manager API endpoint not found on server (404)' : `Server error (${res.status})` };
      }
      if (res.ok) {
        showSuccess(hrManagerToEdit ? `HR Manager "${data.name || data.hrManager?.name || hrManagerForm.name}" updated!` : `HR Manager "${data.name || data.hrManager?.name || hrManagerForm.name}" created!`);
        setHrManagerModalOpen(false);
        fetchHierarchy();
      } else {
        setHrManagerError(data.error || 'Failed to save HR Manager');
      }
    } catch (err) {
      console.error('Error saving HR Manager:', err);
      setHrManagerError(err.message || 'Network error saving HR Manager');
    } finally {
      setHrManagerSaving(false);
    }
  };

  const handleDeleteHrManager = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete HR Manager "${name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/users/hr-managers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccess(`HR Manager "${name}" deleted.`);
        fetchHierarchy();
      }
    } catch (err) {
      console.error('Error deleting HR Manager:', err);
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
      location: bm ? (bm.location || '') : '',
      canAccessManipalPayout: Boolean(bm?.canAccessManipalPayout)
    });
    setBmError('');
    setBmModalOpen(true);
  };

  const handleToggleManipalAccess = async (bm) => {
    try {
      const newStatus = !bm.canAccessManipalPayout;
      const res = await fetch(`${API_URL}/api/users/branch-managers/${bm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canAccessManipalPayout: newStatus })
      });
      if (res.ok) {
        showSuccess(`Manipal Payout access ${newStatus ? 'granted to' : 'revoked from'} ${bm.name}`);
        fetchHierarchy();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error toggling Manipal access:', err);
    }
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
        showSuccess(bmToEdit ? 'Branch updated successfully!' : 'New Branch & Manager created successfully!');
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

  const handleDeleteBm = async (id, name, branchName) => {
    if (!window.confirm(`Are you sure you want to delete branch "${branchName || 'this branch'}" (Manager: ${name})?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/users/branch-managers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccess(`Branch "${branchName}" deleted.`);
        if (selectedBmId === id) setSelectedBmId(null);
        fetchHierarchy();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error deleting BM:', err);
    }
  };

  // --- Team Leader Creation Handler ---
  const handleSaveTl = async (e) => {
    e.preventDefault();
    setTlSaving(true);
    setTlError('');

    try {
      const targetBm = selectedBm || bms.find(b => b.id === tlForm.branchManagerId);
      const res = await fetch(`${API_URL}/api/users/team-leaders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tlForm,
          branchManagerId: targetBm ? targetBm.id : '',
          branch: targetBm ? (targetBm.branch || targetBm.location) : tlForm.branch
        })
      });
      const resData = await res.json();
      if (res.ok) {
        showSuccess(`Team Leader "${tlForm.name}" created for ${targetBm ? targetBm.branch : 'branch'}!`);
        setTlModalOpen(false);
        setTlForm({ name: '', email: '', password: '', mobile: '', branchManagerId: '', branch: '' });
        fetchHierarchy();
        if (onRefresh) onRefresh();
      } else {
        setTlError(resData.error || 'Failed to create Team Leader');
      }
    } catch (err) {
      setTlError('Network error creating Team Leader');
    } finally {
      setTlSaving(false);
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

  // Filtered branches for main screen
  const filteredBms = bms.filter(bm => {
    if (!branchSearch.trim()) return true;
    const q = branchSearch.toLowerCase();
    return (
      (bm.branch && bm.branch.toLowerCase().includes(q)) ||
      (bm.name && bm.name.toLowerCase().includes(q)) ||
      (bm.email && bm.email.toLowerCase().includes(q)) ||
      (bm.location && bm.location.toLowerCase().includes(q))
    );
  });

  // Data scoped to selected branch
  const branchTls = selectedBm
    ? tls.filter(t => t.branchManagerId === selectedBm.id || (t.branch && selectedBm.branch && t.branch.toLowerCase() === selectedBm.branch.toLowerCase()))
    : [];
  const branchPendingTls = branchTls.filter(t => t.approvalStatus === 'pending');
  const branchTlIds = branchTls.map(t => t.id);
  const branchHrs = hrs.filter(h => branchTlIds.includes(h.teamLeaderId));
  const branchItProjects = selectedBm
    ? itProjects.filter(p => p.branchManagerId === selectedBm.id || (p.branch && selectedBm.branch && p.branch.toLowerCase() === selectedBm.branch.toLowerCase()))
    : [];

  return (
    <div style={{ color: '#1e293b' }}>
      {/* SUCCESS NOTIFICATION BANNER */}
      {successBanner && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '10px', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)' }}>
          <CheckCircle2 size={18} color="#059669" /> {successBanner}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DRILLDOWN VIEW: CANDIDATE BREAKDOWN FOR AN HR (Image 3)                 */}
      {/* ========================================================================= */}
      {selectedTlId && selectedHrForCandidateBreakdown && (() => {
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

            {/* Header Box */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Upcoming Candidates for {hr.name || hr.hrName}
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

            {/* Candidates Table */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              {/* DESKTOP TABLE */}
              <div className="hr-candidates-desktop-table" style={{ overflowX: 'auto' }}>
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
                          No candidates have applied through {hr.name || hr.hrName} yet.
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

              {/* MOBILE CARDS VIEW */}
              <div className="hr-candidates-mobile-cards" style={{ padding: '12px', display: 'none', flexDirection: 'column', gap: '10px' }}>
                {hrApps.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    No candidates have applied through {hr.name || hr.hrName} yet.
                  </div>
                ) : (
                  hrApps.map((app, idx) => {
                    const statusLower = String(app.status || 'applied').toLowerCase();
                    const isSuccess = ['selected', 'hired', 'approved', 'closed'].includes(statusLower);
                    const isPending = ['applied', 'pending', 'interview'].includes(statusLower);
                    return (
                      <div
                        key={app.id || idx}
                        style={{
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                              <span style={{
                                background: '#f1f5f9',
                                color: '#1e293b',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                minWidth: '22px',
                                height: '22px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                                padding: '0 4px'
                              }}>
                                {idx + 1}
                              </span>
                              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.96rem' }}>
                                {app.candidateName || 'Candidate'}
                              </div>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{app.candidateEmail}{app.candidateMobile ? ` • ${app.candidateMobile}` : ''}</div>
                          </div>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '20px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            background: isSuccess ? '#ecfdf5' : isPending ? '#e0f2fe' : '#fef2f2',
                            color: isSuccess ? '#059669' : isPending ? '#0369a1' : '#dc2626',
                            border: `1px solid ${isSuccess ? '#a7f3d0' : isPending ? '#bae6fd' : '#fecaca'}`
                          }}>
                            {app.status || 'Applied'}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', marginTop: '6px' }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Job Role</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{app.jobTitle || 'Role'}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{app.companyName || 'Company'}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Expected Amount</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669' }}>₹{(Number(app.incentiveAmount) || 0).toLocaleString()}</div>
                          </div>
                        </div>

                        {app.candidateResumeUrl && (
                          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                            <a href={app.candidateResumeUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 700 }}>
                              <FileText size={12} /> View Resume ➔
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 2. DRILLDOWN VIEW: TL ASSIGNED HRS TABLE (Image 2)                         */}
      {/* ========================================================================= */}
      {selectedTlId && !selectedHrForCandidateBreakdown && (() => {
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

        const { teamLeader, kpis, hrs: tlHrs } = tlOverviewData;
        return (
          <div>
            <button
              onClick={() => setSelectedTlId(null)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569', marginBottom: '1.25rem' }}
            >
              <ArrowLeft size={16} /> Back to {selectedBm ? `${selectedBm.branch || 'Branch'} Team Leaders` : 'Team Leaders'}
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

                <div className="tl-profile-header-actions" style={{ display: 'flex' }}>
                  <button
                    onClick={() => setAssignModalTl(teamLeader)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}
                  >
                    <UserCheck size={16} /> Manage HR Assignments
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="dashboard-kpi-grid" style={{ marginTop: '1.25rem', gap: '10px' }}>
                <div className="dashboard-kpi-card" style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div className="dashboard-kpi-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{kpis.totalHrs}</div>
                  <div className="dashboard-kpi-title" style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Assigned HRs</div>
                </div>
                <div className="dashboard-kpi-card" style={{ background: '#eff6ff', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div className="dashboard-kpi-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb' }}>{kpis.totalCandidates}</div>
                  <div className="dashboard-kpi-title" style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Candidates</div>
                </div>
                <div className="dashboard-kpi-card" style={{ background: '#f0fdf4', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div className="dashboard-kpi-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a' }}>₹{(kpis.totalAmount || 0).toLocaleString()}</div>
                  <div className="dashboard-kpi-title" style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Team Amount</div>
                </div>
                <div className="dashboard-kpi-card" style={{ background: '#fdf4ff', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div className="dashboard-kpi-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7' }}>{kpis.selectedCount}</div>
                  <div className="dashboard-kpi-title" style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Selected / Placed</div>
                </div>
              </div>
            </div>

            {/* HRs Table */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Assigned HRs under {teamLeader.name}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  Click "View Candidates" on any HR to see candidate details, applied jobs, and incentive breakdown.
                </p>
              </div>

              {/* DESKTOP TABLE (100% UNCHANGED) */}
              <div className="tl-hrs-desktop-table" style={{ overflowX: 'auto' }}>
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
                                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                              }}
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

              {/* MOBILE CARDS VIEW (Clean, touch-friendly, no cut-off) */}
              <div className="tl-hrs-mobile-cards" style={{ padding: '12px', display: 'none', flexDirection: 'column', gap: '10px' }}>
                {tlHrs.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    No HRs currently assigned under this Team Leader. Click "Manage HR Assignments" above to assign approved HRs.
                  </div>
                ) : (
                  tlHrs.map((hr, idx) => (
                    <div
                      key={hr.id}
                      style={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '14px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                            <span style={{
                              background: '#f1f5f9',
                              color: '#1e293b',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              minWidth: '22px',
                              height: '22px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '6px',
                              padding: '0 4px'
                            }}>
                              {idx + 1}
                            </span>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>{hr.name}</div>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>HR</div>
                        </div>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '10px', fontSize: '0.76rem', fontWeight: 800 }}>
                          {hr.referralCode || 'HR'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Candidates</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{hr.candidatesCount || 0} Candidates</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Total Upcoming</div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669' }}>₹{(hr.totalAmount || 0).toLocaleString()}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedHrForCandidateBreakdown(hr)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px 14px',
                          background: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                        }}
                      >
                        View Candidates ➔
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 3. DEDICATED BRANCH WORKSPACE (When a specific branch is selected)         */}
      {/* ========================================================================= */}
      {selectedBm && !selectedTlId && (
        <div>
          {/* Branch Workspace Header */}
          <div className="branch-workspace-header" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', marginBottom: '1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div className="branch-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div className="branch-header-top-box" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div className="branch-back-row">
                  <button
                    onClick={() => setSelectedBmId(null)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 15px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#334155', fontSize: '0.88rem' }}
                  >
                    <ArrowLeft size={16} /> All Branches
                  </button>
                </div>
                <div className="branch-title-block">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2 className="branch-title-heading" style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      📍 {selectedBm.branch ? selectedBm.branch.toUpperCase() : 'MAIN'} BRANCH
                    </h2>
                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                      Branch Command Center
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span>Manager: <strong style={{ color: '#0f172a' }}>{selectedBm.name}</strong></span>
                    {selectedBm.email && <span>• ✉ {selectedBm.email}</span>}
                    {selectedBm.mobile && <span>• 📱 {selectedBm.mobile}</span>}
                  </div>
                </div>
              </div>

              <div className="branch-header-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleOpenBmModal(selectedBm)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}
                >
                  <Edit size={14} /> Edit Branch
                </button>
                <button
                  onClick={() => {
                    setTlForm({ name: '', email: '', password: '', mobile: '', branchManagerId: selectedBm.id, branch: selectedBm.branch || '' });
                    setTlModalOpen(true);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)' }}
                >
                  <UserPlus size={15} /> Add Team Leader
                </button>
              </div>
            </div>
          </div>

          {/* Branch Navigation Pills (Responsive Scroll) */}
          <div className="branch-nav-pills" style={{ marginBottom: '1.25rem' }}>
            <button
              onClick={() => setBranchTab('team_leaders')}
              className="branch-pill-btn"
              style={{
                background: branchTab === 'team_leaders' ? '#2563eb' : '#fff',
                color: branchTab === 'team_leaders' ? '#fff' : '#475569',
                border: branchTab === 'team_leaders' ? '1px solid #2563eb' : '1px solid #cbd5e1'
              }}
            >
              <Users size={16} />
              <span className="desktop-tab-label">Team Leaders & Approvals ({branchTls.length})</span>
              <span className="mobile-tab-label">Team Leaders ({branchTls.length})</span>
              {branchPendingTls.length > 0 && (
                <span style={{ background: '#f59e0b', color: '#fff', padding: '1px 7px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800 }}>
                  {branchPendingTls.length} Pending
                </span>
              )}
            </button>

            <button
              onClick={() => setBranchTab('it_projects')}
              className="branch-pill-btn"
              style={{
                background: branchTab === 'it_projects' ? '#2563eb' : '#fff',
                color: branchTab === 'it_projects' ? '#fff' : '#475569',
                border: branchTab === 'it_projects' ? '1px solid #2563eb' : '1px solid #cbd5e1'
              }}
            >
              <Code size={16} />
              <span className="desktop-tab-label">IT Team & Projects ({branchItProjects.length})</span>
              <span className="mobile-tab-label">IT Projects ({branchItProjects.length})</span>
            </button>

            <button
              onClick={() => setBranchTab('branch_hrs')}
              className="branch-pill-btn"
              style={{
                background: branchTab === 'branch_hrs' ? '#2563eb' : '#fff',
                color: branchTab === 'branch_hrs' ? '#fff' : '#475569',
                border: branchTab === 'branch_hrs' ? '1px solid #2563eb' : '1px solid #cbd5e1'
              }}
            >
              <ShieldCheck size={16} />
              <span className="desktop-tab-label">Branch HRs ({branchHrs.length})</span>
              <span className="mobile-tab-label">HRs ({branchHrs.length})</span>
            </button>

            <button
              onClick={() => setBranchTab('recruitment')}
              className="branch-pill-btn"
              style={{
                background: branchTab === 'recruitment' ? '#2563eb' : '#fff',
                color: branchTab === 'recruitment' ? '#fff' : '#475569',
                border: branchTab === 'recruitment' ? '1px solid #2563eb' : '1px solid #cbd5e1'
              }}
            >
              <Briefcase size={16} />
              <span className="desktop-tab-label">Branch Overview</span>
              <span className="mobile-tab-label">Overview</span>
            </button>
          </div>

          {/* TAB 1: TEAM LEADERS UNDER THIS BRANCH */}
          {branchTab === 'team_leaders' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Team Leaders in {selectedBm.branch ? selectedBm.branch.toUpperCase() : 'this Branch'} ({branchTls.length})
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    Super Admin controls: Approve or reject new Team Leaders, view their team breakdowns, and assign HRs.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setTlForm({ name: '', email: '', password: '', mobile: '', branchManagerId: selectedBm.id, branch: selectedBm.branch || '' });
                    setTlModalOpen(true);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  <UserPlus size={15} /> Add Team Leader
                </button>
              </div>

              {/* DESKTOP TABLE (100% UNCHANGED) */}
              <div className="branch-tls-desktop-table" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '12px 16px' }}>Team Leader</th>
                      <th style={{ padding: '12px 16px' }}>Approval Status</th>
                      <th style={{ padding: '12px 16px' }}>Assigned HRs</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchTls.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                          <Users size={32} color="#94a3b8" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                          <div style={{ fontWeight: 700, color: '#334155' }}>No Team Leaders added in this branch yet.</div>
                          <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Click <strong>+ Add Team Leader</strong> above to assign a TL to {selectedBm.branch}.</div>
                        </td>
                      </tr>
                    ) : (
                      branchTls.map((tl) => (
                        <tr key={tl.id} style={{ borderBottom: '1px solid #f1f5f9', background: tl.approvalStatus === 'pending' ? '#fffdf7' : 'transparent' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div
                              onClick={() => handleOpenTlDetails(tl.id)}
                              style={{ fontWeight: 800, color: '#0284c7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
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
                          <td style={{ padding: '14px 16px' }}>
                            {(() => {
                              const tlHrs = hrs.filter(h => h.teamLeaderId === tl.id);
                              return (
                                <div>
                                  <div
                                    onClick={() => handleOpenTlDetails(tl.id)}
                                    style={{ fontWeight: 800, color: '#0284c7', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <span>{tlHrs.length} HRs assigned</span>
                                    <span style={{ fontSize: '0.7rem' }}>➔</span>
                                  </div>
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
                                    title="Assign HRs under this Team Leader"
                                  >
                                    <UserCheck size={14} /> Assign HRs
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

              {/* MOBILE CARDS VIEW (Clean, touch-friendly, no cut-off) */}
              <div className="branch-tls-mobile-cards" style={{ padding: '12px', flexDirection: 'column', gap: '12px' }}>
                {branchTls.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    <Users size={28} color="#94a3b8" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    <div style={{ fontWeight: 700, color: '#334155' }}>No Team Leaders in this branch yet.</div>
                  </div>
                ) : (
                  branchTls.map((tl) => {
                    const tlHrs = hrs.filter(h => h.teamLeaderId === tl.id);
                    return (
                      <div
                        key={tl.id}
                        style={{
                          background: '#fff',
                          border: tl.approvalStatus === 'pending' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }}
                      >
                        {/* Top: Name & Status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                          <div>
                            <div
                              onClick={() => handleOpenTlDetails(tl.id)}
                              style={{ fontWeight: 800, color: '#0284c7', fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <span>{tl.name}</span>
                              <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                View Team ➔
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                              ✉ {tl.email}
                            </div>
                            {tl.mobile && (
                              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '1px' }}>
                                📱 {tl.mobile}
                              </div>
                            )}
                          </div>

                          <div>
                            {tl.approvalStatus === 'approved' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                                <CheckCircle2 size={12} /> Approved
                              </span>
                            ) : tl.approvalStatus === 'rejected' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef2f2', color: '#dc2626', padding: '3px 8px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, border: '1px solid #fecaca' }}>
                                <XCircle size={12} /> Rejected
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fffbeb', color: '#b45309', padding: '3px 8px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 800, border: '1px solid #fde68a' }}>
                                <Clock size={12} color="#d97706" /> Pending
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Assigned HRs Box */}
                        <div
                          onClick={() => handleOpenTlDetails(tl.id)}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #f1f5f9',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            marginBottom: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Assigned HRs:</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7' }}>
                            {tlHrs.length} HRs assigned ➔
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                          {tl.approvalStatus === 'pending' ? (
                            <>
                              <button
                                disabled={actionLoading === tl.id}
                                onClick={() => handleTlApproval(tl.id, tl.name, 'approved')}
                                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px 10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                              >
                                <CheckCircle2 size={13} /> Approve
                              </button>
                              <button
                                disabled={actionLoading === tl.id}
                                onClick={() => handleTlApproval(tl.id, tl.name, 'rejected')}
                                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px 10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenTlDetails(tl.id)}
                                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px 10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                              >
                                <Eye size={13} /> View Team
                              </button>
                              <button
                                onClick={() => setAssignModalTl(tl)}
                                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px 10px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                              >
                                <UserCheck size={13} /> Assign HRs
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteTl(tl.id, tl.name)}
                            style={{ padding: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}
                            title="Delete Team Leader"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: IT TEAM & PROJECTS SPECIFIC TO THIS BRANCH */}
          {branchTab === 'it_projects' && (
            <BranchItProjectsTab
              API_URL={API_URL}
              currentUser={selectedBm}
              onRefresh={fetchHierarchy}
            />
          )}

          {/* TAB 3: BRANCH HRS */}
          {branchTab === 'branch_hrs' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Branch HRs in {selectedBm.branch ? selectedBm.branch.toUpperCase() : 'this Branch'} ({branchHrs.length})
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  HRs assigned to Team Leaders of this branch.
                </p>
              </div>

              {/* DESKTOP TABLE */}
              <div className="branch-hrs-desktop-table" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '14px 20px' }}>HR Name</th>
                      <th style={{ padding: '14px 20px' }}>Contact</th>
                      <th style={{ padding: '14px 20px' }}>Referral Code</th>
                      <th style={{ padding: '14px 20px' }}>Team Leader</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchHrs.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                          No HRs currently assigned under this branch's Team Leaders.
                        </td>
                      </tr>
                    ) : (
                      branchHrs.map((hr) => {
                        const assignedTl = tls.find(t => t.id === hr.teamLeaderId);
                        return (
                          <tr key={hr.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 20px', fontWeight: 800, color: '#0f172a' }}>
                              {hr.name}
                            </td>
                            <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '0.85rem' }}>
                              {hr.email}
                              {hr.mobile && ` • ${hr.mobile}`}
                            </td>
                            <td style={{ padding: '14px 20px', fontWeight: 800, color: '#0284c7' }}>
                              {hr.referralCode || 'HR'}
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{ background: '#eff6ff', color: '#1e40af', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                                👤 {assignedTl ? assignedTl.name : 'Unassigned'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW */}
              <div className="branch-hrs-mobile-cards" style={{ padding: '12px', flexDirection: 'column', gap: '10px' }}>
                {branchHrs.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    No HRs currently assigned under this branch's Team Leaders.
                  </div>
                ) : (
                  branchHrs.map((hr) => {
                    const assignedTl = tls.find(t => t.id === hr.teamLeaderId);
                    return (
                      <div
                        key={hr.id}
                        style={{
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{hr.name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{hr.email}</div>
                            {hr.mobile && <div style={{ fontSize: '0.78rem', color: '#64748b' }}>📱 {hr.mobile}</div>}
                          </div>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
                            {hr.referralCode || 'HR'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                          Team Leader: <strong style={{ color: '#1e40af' }}>{assignedTl ? assignedTl.name : 'Unassigned'}</strong>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: BRANCH RECRUITMENT OVERVIEW */}
          {branchTab === 'recruitment' && (
            <BranchManagerDashboard
              API_URL={API_URL}
              currentUser={selectedBm}
              onBack={() => setBranchTab('team_leaders')}
            />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MAIN SCREEN: COMPANY BRANCHES DIRECTORY (When no branch is selected)    */}
      {/* ========================================================================= */}
      {!selectedBm && !selectedTlId && (
        <div>
          {/* Top Banner & Heading */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={26} color="#3b82f6" /> Branch & Regional Operations
              </h2>
              <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                Select any branch to manage its Team Leaders, approve new TLs, assign HRs, and track branch IT projects.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { fetchHierarchy(); if (onRefresh) onRefresh(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}
              >
                <RefreshCw size={15} /> Refresh
              </button>
              <button
                onClick={() => handleOpenBmModal()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#fff', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
              >
                <UserPlus size={16} /> Add New Branch
              </button>
            </div>
          </div>

          {/* KPI Cards (2 Grid on Mobile, Auto-fit on Desktop) */}
          <div className="dashboard-kpi-grid" style={{ marginBottom: '1.5rem' }}>
            <div
              className="dashboard-kpi-card"
              onClick={() => setMainView('branches')}
              style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', border: mainView === 'branches' ? '2px solid #3b82f6' : '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Company Branches</span>
                <div className="dashboard-kpi-icon-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={18} color="#3b82f6" />
                </div>
              </div>
              <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{totalBms}</div>
              <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Active regional branches</span>
            </div>

            <div
              className="dashboard-kpi-card"
              style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Team Leaders</span>
                <div className="dashboard-kpi-icon-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} color="#0284c7" />
                </div>
              </div>
              <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{totalTls}</div>
              <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Across all company branches</span>
            </div>

            <div
              className="dashboard-kpi-card"
              onClick={() => setMainView('pending_approvals')}
              style={{
                background: pendingTls.length > 0 ? '#fffbeb' : '#fff',
                padding: '1.25rem',
                borderRadius: '14px',
                border: pendingTls.length > 0 ? '2px solid #f59e0b' : mainView === 'pending_approvals' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: pendingTls.length > 0 ? '#b45309' : '#64748b', textTransform: 'uppercase' }}>
                  Pending TL Approvals
                </span>
                <div className="dashboard-kpi-icon-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} color="#d97706" />
                </div>
              </div>
              <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#d97706' }}>{pendingTls.length}</div>
              <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: pendingTls.length > 0 ? '#92400e' : '#94a3b8' }}>
                {pendingTls.length > 0 ? '⚠️ Action Required (Click to review)' : 'All Team Leaders Approved'}
              </span>
            </div>

            <div
              className="dashboard-kpi-card"
              onClick={() => setMainView('it_projects')}
              style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', border: mainView === 'it_projects' ? '2px solid #3b82f6' : '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>IT Projects</span>
                <div className="dashboard-kpi-icon-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Code size={18} color="#10b981" />
                </div>
              </div>
              <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{itProjects.length}</div>
              <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Branch projects & countdowns</span>
            </div>

            <div
              className="dashboard-kpi-card"
              onClick={() => setMainView('hr_managers')}
              style={{
                background: '#fff',
                padding: '1.25rem',
                borderRadius: '14px',
                border: mainView === 'hr_managers' ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
                  👑 HR Managers
                </span>
                <div className="dashboard-kpi-icon-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} color="#7c3aed" />
                </div>
              </div>
              <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#7c3aed' }}>{hrManagers.length}</div>
              <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Centralized All Branches Oversight
              </span>
            </div>
          </div>

          {/* Pending Approval High-Priority Banner */}
          {pendingTls.length > 0 && mainView !== 'pending_approvals' && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '12px 18px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={20} color="#d97706" />
                <span style={{ color: '#92400e', fontWeight: 700, fontSize: '0.9rem' }}>
                  You have <strong>{pendingTls.length}</strong> Team Leader(s) waiting for Admin Approval.
                </span>
              </div>
              <button
                onClick={() => setMainView('pending_approvals')}
                style={{ padding: '6px 14px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Review Approvals Now ➔
              </button>
            </div>
          )}

          {/* View Filter Pill Bar */}
          <div className="branch-nav-pills" style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={() => setMainView('branches')}
              className="branch-pill-btn"
              style={{
                background: mainView === 'branches' ? '#2563eb' : '#fff',
                color: mainView === 'branches' ? '#fff' : '#475569',
                border: mainView === 'branches' ? '1px solid #2563eb' : '1px solid #cbd5e1'
              }}
            >
              <Building2 size={16} /> All Branches ({bms.length})
            </button>

            <button
              onClick={() => setMainView('hr_managers')}
              className="branch-pill-btn"
              style={{
                background: mainView === 'hr_managers' ? '#7c3aed' : '#fff',
                color: mainView === 'hr_managers' ? '#fff' : '#475569',
                border: mainView === 'hr_managers' ? '1px solid #7c3aed' : '1px solid #cbd5e1'
              }}
            >
              <ShieldCheck size={16} /> 👑 HR Managers ({hrManagers.length})
            </button>

            <button
              onClick={() => setMainView('pending_approvals')}
              className="branch-pill-btn"
              style={{
                background: mainView === 'pending_approvals' ? '#2563eb' : '#fff',
                color: mainView === 'pending_approvals' ? '#fff' : '#475569',
                border: mainView === 'pending_approvals' ? '1px solid #2563eb' : '1px solid #cbd5e1'
              }}
            >
              <Clock size={16} /> Pending Admin Approvals ({pendingTls.length})
            </button>

            <button
              onClick={() => setMainView('it_projects')}
              className="branch-pill-btn"
              style={{
                background: mainView === 'it_projects' ? '#2563eb' : '#fff',
                color: mainView === 'it_projects' ? '#fff' : '#475569',
                border: mainView === 'it_projects' ? '1px solid #2563eb' : '1px solid #cbd5e1'
              }}
            >
              <Code size={16} /> Company IT Projects ({itProjects.length})
            </button>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* VIEW A: ALL BRANCHES CARDS DIRECTORY                                  */}
          {/* --------------------------------------------------------------------- */}
          {mainView === 'branches' && (
            <div>
              {/* Search Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '1rem' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '450px' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search by branch name, manager, email..."
                    value={branchSearch}
                    onChange={e => setBranchSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                  Showing {filteredBms.length} of {bms.length} Branches
                </div>
              </div>

              {filteredBms.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '4rem 1rem', textAlign: 'center', color: '#64748b' }}>
                  <Building2 size={42} color="#94a3b8" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>No Branches Found</div>
                  <p style={{ margin: '6px 0 16px 0', fontSize: '0.88rem' }}>
                    {branchSearch ? 'Try a different search query or clear the filter.' : 'Click below to register the first branch for your company.'}
                  </p>
                  <button
                    onClick={() => handleOpenBmModal()}
                    style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add New Branch
                  </button>
                </div>
              ) : (
                <div className="branch-cards-grid">
                  {filteredBms.map((bm) => {
                    const bmTls = tls.filter(t => t.branchManagerId === bm.id || (t.branch && bm.branch && t.branch.toLowerCase() === bm.branch.toLowerCase()));
                    const bmPendingCount = bmTls.filter(t => t.approvalStatus === 'pending').length;
                    const bmTlIds = bmTls.map(t => t.id);
                    const bmHrsCount = hrs.filter(h => bmTlIds.includes(h.teamLeaderId)).length;
                    const bmItCount = itProjects.filter(p => p.branchManagerId === bm.id || (p.branch && bm.branch && p.branch.toLowerCase() === bm.branch.toLowerCase())).length;

                    return (
                      <div
                        key={bm.id}
                        style={{
                          background: '#fff',
                          borderRadius: '16px',
                          border: bmPendingCount > 0 ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                          padding: '1.25rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                        }}
                      >
                        <div>
                          {/* Card Top: Branch Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Branch Location
                              </span>
                              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '2px 0 0 0', color: '#0f172a' }}>
                                📍 {bm.branch ? bm.branch.toUpperCase() : 'MAIN BRANCH'}
                              </h3>
                            </div>
                            <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
                              Active
                            </span>
                          </div>

                          {/* Branch Manager Details */}
                          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                                {(bm.name || 'B')[0].toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>{bm.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Branch Manager</div>
                              </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
                              ✉ {bm.email}
                              {bm.mobile && ` • 📱 ${bm.mobile}`}
                            </div>
                          </div>

                          {/* 3 Metric Chips */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '14px' }}>
                            <div style={{ background: bmPendingCount > 0 ? '#fffbeb' : '#f1f5f9', border: bmPendingCount > 0 ? '1px solid #fde68a' : '1px solid #e2e8f0', padding: '6px 4px', borderRadius: '8px', textAlign: 'center' }}>
                              <div style={{ fontWeight: 800, fontSize: '1rem', color: bmPendingCount > 0 ? '#d97706' : '#0f172a' }}>
                                {bmTls.length}
                              </div>
                              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: bmPendingCount > 0 ? '#b45309' : '#64748b' }}>
                                {bmPendingCount > 0 ? `⚠️ ${bmPendingCount} Pending` : 'Team Leaders'}
                              </div>
                            </div>

                            <div style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 4px', borderRadius: '8px', textAlign: 'center' }}>
                              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                                {bmHrsCount}
                              </div>
                              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>
                                Branch HRs
                              </div>
                            </div>

                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 4px', borderRadius: '8px', textAlign: 'center' }}>
                              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#16a34a' }}>
                                {bmItCount}
                              </div>
                              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d' }}>
                                IT Projects
                              </div>
                            </div>
                          </div>

                          {/* Manipal Payout Access Control Banner */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px',
                            padding: '8px 10px',
                            background: bm.canAccessManipalPayout ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : '#f8fafc',
                            border: `1.5px solid ${bm.canAccessManipalPayout ? '#86efac' : '#e2e8f0'}`,
                            borderRadius: '10px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                              <Wallet size={15} style={{ color: bm.canAccessManipalPayout ? '#15803d' : '#94a3b8' }} />
                              <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: bm.canAccessManipalPayout ? '#14532d' : '#475569' }}>
                                  Manipal Payout Access
                                </div>
                                <div style={{ fontSize: '0.68rem', color: bm.canAccessManipalPayout ? '#166534' : '#94a3b8', fontWeight: 600 }}>
                                  {bm.canAccessManipalPayout ? '✓ Access Granted' : '✕ No Access'}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleToggleManipalAccess(bm); }}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                background: bm.canAccessManipalPayout ? '#ef4444' : '#16a34a',
                                color: '#ffffff',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: bm.canAccessManipalPayout ? '0 2px 6px rgba(239,68,68,0.2)' : '0 2px 6px rgba(22,163,74,0.2)'
                              }}
                            >
                              {bm.canAccessManipalPayout ? 'Revoke Access' : 'Grant Access'}
                            </button>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                          <button
                            onClick={() => { setSelectedBmId(bm.id); setBranchTab('team_leaders'); }}
                            style={{
                              flex: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '10px 14px',
                              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                            }}
                          >
                            Manage Branch & Teams ➔
                          </button>
                          <button
                            onClick={() => handleOpenBmModal(bm)}
                            style={{ padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#475569' }}
                            title="Edit Branch Manager"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBm(bm.id, bm.name, bm.branch)}
                            style={{ padding: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }}
                            title="Delete Branch"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* VIEW B: PENDING APPROVALS TABLE (Across all branches)                 */}
          {/* --------------------------------------------------------------------- */}
          {mainView === 'pending_approvals' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#fffbeb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#92400e' }}>
                    Pending Admin Approvals ({pendingTls.length})
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#b45309' }}>
                    These Team Leaders were created by Branch Managers and require Super Admin approval to activate.
                  </p>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '12px 16px' }}>Team Leader</th>
                      <th style={{ padding: '12px 16px' }}>Branch</th>
                      <th style={{ padding: '12px 16px' }}>Branch Manager</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTls.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#059669', fontWeight: 700 }}>
                          ✓ All Team Leaders across all branches are approved! No pending requests.
                        </td>
                      </tr>
                    ) : (
                      pendingTls.map((tl) => (
                        <tr key={tl.id} style={{ borderBottom: '1px solid #f1f5f9', background: '#fffdf7' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{tl.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{tl.email}{tl.mobile ? ` • ${tl.mobile}` : ''}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ background: '#eff6ff', color: '#1e40af', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}>
                              📍 {tl.branch || 'Branch'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#334155' }}>
                            <div style={{ fontWeight: 600 }}>{tl.branchManagerName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{tl.branchManagerEmail}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fffbeb', color: '#b45309', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, border: '1px solid #fde68a' }}>
                              <Clock size={13} color="#d97706" /> Pending Approval
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                disabled={actionLoading === tl.id}
                                onClick={() => handleTlApproval(tl.id, tl.name, 'approved')}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)' }}
                              >
                                <CheckCircle2 size={14} /> Approve TL
                              </button>
                              <button
                                disabled={actionLoading === tl.id}
                                onClick={() => handleTlApproval(tl.id, tl.name, 'rejected')}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '7px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                              >
                                <XCircle size={14} /> Reject
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

          {/* --------------------------------------------------------------------- */}
          {/* VIEW C: COMPANY-WIDE IT PROJECTS                                     */}
          {/* --------------------------------------------------------------------- */}
          {/* --------------------------------------------------------------------- */}
          {/* VIEW C: COMPANY-WIDE IT PROJECTS                                     */}
          {/* --------------------------------------------------------------------- */}
          {mainView === 'it_projects' && (
            <BranchItProjectsTab
              API_URL={API_URL}
              currentUser={currentUser || { role: 'admin', name: 'Super Admin' }}
              onRefresh={fetchHierarchy}
            />
          )}

          {/* --------------------------------------------------------------------- */}
          {/* VIEW D: HR MANAGERS (Centralized All Branches Oversight)                 */}
          {/* --------------------------------------------------------------------- */}
          {mainView === 'hr_managers' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#5b21b6' }}>
                      👑 Centralized HR Managers ({hrManagers.length})
                    </h3>
                    <span style={{ background: '#7c3aed', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                      All Branches Access
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#6d28d9' }}>
                    HR Managers have global oversight across all branches (Bangalore, Hosur, Coimbatore, etc.) to review Applied candidates, Executive HRs, Scheduled Interviews, and Campaign Targets.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenHrManagerModal()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}
                >
                  <UserPlus size={16} /> + Add HR Manager
                </button>
              </div>

              <div style={{ padding: '1.5rem' }}>
                {hrManagers.length === 0 ? (
                  <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    <ShieldCheck size={48} color="#c4b5fd" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>No HR Managers Registered Yet</div>
                    <p style={{ margin: '6px 0 16px 0', fontSize: '0.88rem' }}>
                      Click below to create login credentials for your company's centralized HR Manager.
                    </p>
                    <button
                      onClick={() => handleOpenHrManagerModal()}
                      style={{ padding: '10px 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Add First HR Manager
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {hrManagers.map(hrm => (
                      <div
                        key={hrm.id}
                        style={{
                          background: '#fff',
                          border: '1.5px solid #ede9fe',
                          borderRadius: '14px',
                          padding: '1.25rem',
                          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.06)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                                {(hrm.name || 'H')[0].toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{hrm.name}</div>
                                <div style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 700 }}>HR Manager (Centralized)</div>
                              </div>
                            </div>
                            <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                              Active
                            </span>
                          </div>

                          <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Mail size={13} color="#94a3b8" /> <span style={{ color: '#1e293b' }}>{hrm.email}</span>
                            </div>
                            {hrm.mobile && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Phone size={13} color="#94a3b8" /> <span style={{ color: '#1e293b' }}>{hrm.mobile}</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', color: '#7c3aed', fontWeight: 700 }}>
                              <MapPin size={13} color="#7c3aed" /> <span>Scope: All Branches (Bangalore, Hosur, Coimbatore...)</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                          <button
                            onClick={() => handleOpenHrManagerModal(hrm)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
                          >
                            <Edit size={13} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteHrManager(hrm.id, hrm.name)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#dc2626', cursor: 'pointer' }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT BRANCH & MANAGER                                      */}
      {/* ========================================================================= */}
      {bmModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              {bmToEdit ? 'Edit Branch & Manager' : 'Add New Branch & Manager'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.5rem 0' }}>
              Branch Managers oversee local branch operations and create Team Leaders.
            </p>

            {bmError && (
              <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {bmError}
              </div>
            )}

            <form onSubmit={handleSaveBm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Branch Name / Region *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chennai - Guindy or Bangalore"
                  value={bmForm.branch}
                  onChange={e => setBmForm({ ...bmForm, branch: e.target.value, location: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Branch Manager Full Name *</label>
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

              {/* Manipal Payout Access Permission Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  background: bmForm.canAccessManipalPayout ? '#f0fdf4' : '#f8fafc',
                  border: `1.5px solid ${bmForm.canAccessManipalPayout ? '#86efac' : '#cbd5e1'}`,
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
                onClick={() => setBmForm({ ...bmForm, canAccessManipalPayout: !bmForm.canAccessManipalPayout })}
              >
                <input
                  type="checkbox"
                  id="canAccessManipalPayout"
                  checked={bmForm.canAccessManipalPayout}
                  onChange={e => setBmForm({ ...bmForm, canAccessManipalPayout: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <label htmlFor="canAccessManipalPayout" style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wallet size={16} color="#c026d3" /> Grant Manipal Payout Status Access
                  </label>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                    Allows this Branch Manager to track, view, and manage candidate Manipal payouts.
                  </p>
                </div>
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
                  {bmSaving ? 'Saving...' : bmToEdit ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD TEAM LEADER (For selected branch)                            */}
      {/* ========================================================================= */}
      {tlModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Add Team Leader
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.5rem 0' }}>
              Assign a new Team Leader to <strong style={{ color: '#0284c7' }}>{selectedBm?.branch || 'Branch'}</strong>.
            </p>

            {tlError && (
              <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {tlError}
              </div>
            )}

            <form onSubmit={handleSaveTl} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Branch</label>
                <input
                  type="text"
                  disabled
                  value={selectedBm ? `${selectedBm.branch ? selectedBm.branch.toUpperCase() : 'MAIN'} (${selectedBm.name})` : tlForm.branch}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#334155', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Team Leader Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Moorthy"
                  value={tlForm.name}
                  onChange={e => setTlForm({ ...tlForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. moorthy@gmail.com"
                  value={tlForm.email}
                  onChange={e => setTlForm({ ...tlForm, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Login Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={tlForm.password}
                  onChange={e => setTlForm({ ...tlForm, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="10 digit mobile number"
                  value={tlForm.mobile}
                  onChange={e => setTlForm({ ...tlForm, mobile: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setTlModalOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={tlSaving}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', fontWeight: 700, cursor: tlSaving ? 'not-allowed' : 'pointer' }}
                >
                  {tlSaving ? 'Creating...' : 'Create Team Leader'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ASSIGN HRs TO APPROVED TL                                        */}
      {/* ========================================================================= */}
      {assignModalTl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
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

      {/* ========================================================================= */}
      {/* MODAL 4: ADD / EDIT HR MANAGER                                             */}
      {/* ========================================================================= */}
      {hrManagerModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              {hrManagerToEdit ? 'Edit HR Manager' : 'Add New HR Manager'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.5rem 0' }}>
              HR Managers have centralized oversight across ALL branches with access to Applied candidates, HRs, and Interviews.
            </p>

            {hrManagerError && (
              <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {hrManagerError}
              </div>
            )}

            <form onSubmit={handleSaveHrManager} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shalini Menon"
                  value={hrManagerForm.name}
                  onChange={e => setHrManagerForm({ ...hrManagerForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. hrmanager@forgeindia.com"
                  value={hrManagerForm.email}
                  onChange={e => setHrManagerForm({ ...hrManagerForm, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  {hrManagerToEdit ? 'Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!hrManagerToEdit}
                  placeholder={hrManagerToEdit ? 'Leave blank to keep unchanged' : 'Minimum 6 characters'}
                  value={hrManagerForm.password}
                  onChange={e => setHrManagerForm({ ...hrManagerForm, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={hrManagerForm.mobile}
                  onChange={e => setHrManagerForm({ ...hrManagerForm, mobile: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#6d28d9' }}>
                👑 Role: <strong>hr_manager</strong> • Centralized access to all branches.
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setHrManagerModalOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={hrManagerSaving}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontWeight: 700, cursor: hrManagerSaving ? 'not-allowed' : 'pointer' }}
                >
                  {hrManagerSaving ? 'Saving...' : hrManagerToEdit ? 'Update HR Manager' : 'Create HR Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
