import React, { useState, useEffect } from 'react';
import {
  Code, Plus, Search, Calendar, Clock, AlertTriangle, CheckCircle,
  FileText, Eye, Trash2, Edit2, X, Upload, Image, RefreshCw, CheckCircle2,
  ExternalLink, User, Layers, Building2, MapPin
} from 'lucide-react';

export default function BranchItProjectsTab({ API_URL, currentUser }) {
  const resolvedApi = API_URL || import.meta.env.VITE_API_URL || '';
  const isAdmin = currentUser?.role === 'admin' || !currentUser?.role || currentUser?.role === 'superadmin';
  const isBranchManager = currentUser?.role === 'branch_manager';

  const [projects, setProjects] = useState([]);
  const [availableBms, setAvailableBms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState({
    memberName: '',
    memberRole: 'Frontend Developer',
    projectName: '',
    description: '',
    deadline: '',
    status: 'In Progress',
    emailProofImage: '',
    branch: currentUser?.branch || '',
    branchManagerId: isBranchManager ? (currentUser?.id || '') : ''
  });
  const [previewImage, setPreviewImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Proof Lightbox Modal
  const [viewProofModal, setViewProofModal] = useState(null);

  // Fetch IT Projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const query = isBranchManager && currentUser?.id
        ? `?branchManagerId=${currentUser.id}`
        : currentUser?.branch
        ? `?branch=${encodeURIComponent(currentUser.branch)}`
        : '';
      const res = await fetch(`${resolvedApi}/api/branch-it-projects${query}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching IT projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Branch Managers for Admin dropdown
  useEffect(() => {
    fetch(`${resolvedApi}/api/users/branch-managers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableBms(data);
      })
      .catch(err => console.error('Error loading branch managers:', err));
  }, [resolvedApi]);

  useEffect(() => {
    fetchProjects();
  }, [currentUser]);

  // Handle image upload & base64 conversion
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setForm(prev => ({ ...prev, emailProofImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setForm({
      memberName: '',
      memberRole: 'Frontend Developer',
      projectName: '',
      description: '',
      deadline: '',
      status: 'In Progress',
      emailProofImage: '',
      branch: isBranchManager ? (currentUser?.branch || 'Main Branch') : (availableBms[0]?.branch || 'bangalore'),
      branchManagerId: isBranchManager ? (currentUser?.id || '') : (availableBms[0]?.id || '')
    });
    setPreviewImage('');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (proj) => {
    setEditingProject(proj);
    setForm({
      memberName: proj.memberName || '',
      memberRole: proj.memberRole || 'Developer',
      projectName: proj.projectName || '',
      description: proj.description || '',
      deadline: proj.deadline || '',
      status: proj.status || 'In Progress',
      emailProofImage: '',
      branch: proj.branch || currentUser?.branch || 'Main Branch',
      branchManagerId: proj.branchManagerId || ''
    });
    setPreviewImage(proj.emailProofUrl ? `${resolvedApi}${proj.emailProofUrl}` : '');
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.memberName.trim() || !form.projectName.trim() || !form.deadline) {
      setError('Please provide Member Name, Project Name, and Deadline.');
      return;
    }

    if (!form.branch) {
      setError('Please assign this IT project to a Branch.');
      return;
    }

    if (!editingProject && !form.emailProofImage) {
      setError('Please upload the Email Proof screenshot for the deadline.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const url = editingProject
        ? `${resolvedApi}/api/branch-it-projects/${editingProject.id}`
        : `${resolvedApi}/api/branch-it-projects`;

      const method = editingProject ? 'PUT' : 'POST';

      const payload = {
        ...form,
        branchManagerId: form.branchManagerId || (isBranchManager ? currentUser?.id : ''),
        branch: form.branch || currentUser?.branch || 'Main Branch',
        createdByName: currentUser?.name || 'Manager',
        createdByRole: currentUser?.role || 'branch_manager'
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg(editingProject ? 'Project updated successfully!' : 'IT Project added with Email proof!');
        setModalOpen(false);
        fetchProjects();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        const errJson = await res.json();
        setError(errJson.error || 'Failed to save project.');
      }
    } catch (err) {
      setError('Network error while saving project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this IT project?')) return;
    try {
      const res = await fetch(`${resolvedApi}/api/branch-it-projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        setSuccessMsg('Project deleted.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const handleQuickStatusChange = async (proj, newStatus) => {
    try {
      const res = await fetch(`${resolvedApi}/api/branch-it-projects/${proj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setProjects(prev => prev.map(p => p.id === proj.id ? updated : p));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Live Auto-reducing Countdown Status Calculator
  const getDeadlineStatus = (deadlineStr, status) => {
    if (status === 'Completed') {
      return {
        label: 'Completed',
        color: '#059669',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        text: '✅ Completed'
      };
    }
    if (!deadlineStr) {
      return {
        label: 'No Deadline',
        color: '#64748b',
        bg: '#f1f5f9',
        border: '#cbd5e1',
        text: 'No Date'
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = deadlineStr.split('-');
    const deadline = new Date(parts[0], parts[1] - 1, parts[2]);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 5) {
      return {
        label: `${diffDays} days left`,
        color: '#047857',
        bg: '#ecfdf5',
        border: '#6ee7b7',
        text: `🟢 ${diffDays} days left`
      };
    } else if (diffDays >= 2) {
      return {
        label: `${diffDays} days left`,
        color: '#b45309',
        bg: '#fffbeb',
        border: '#fde68a',
        text: `🟡 ${diffDays} days left`
      };
    } else if (diffDays === 1) {
      return {
        label: 'Due Tomorrow',
        color: '#c2410c',
        bg: '#fff7ed',
        border: '#ffedd5',
        text: `⏰ Due Tomorrow`
      };
    } else if (diffDays === 0) {
      return {
        label: 'Due Today',
        color: '#dc2626',
        bg: '#fef2f2',
        border: '#fecaca',
        text: `🔥 Due Today`
      };
    } else {
      const overdueDays = Math.abs(diffDays);
      return {
        label: `Overdue ${overdueDays}d`,
        color: '#b91c1c',
        bg: '#fef2f2',
        border: '#f87171',
        text: `🚨 Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`
      };
    }
  };

  // Get list of unique branches for filter dropdown
  const uniqueBranches = Array.from(new Set([
    ...projects.map(p => (p.branch || '').trim()),
    ...availableBms.map(b => (b.branch || '').trim())
  ])).filter(Boolean);

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      (p.memberName || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.projectName || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.memberRole || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.branch || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.branchManagerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());

    const isOverdue = (() => {
      if (p.status === 'Completed' || !p.deadline) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const parts = p.deadline.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d < today;
    })();

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'overdue' ? isOverdue : String(p.status || '').toLowerCase() === statusFilter.toLowerCase());

    const matchesBranch =
      branchFilter === 'all' ||
      (p.branch || '').toLowerCase() === branchFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesBranch;
  });

  // KPI calculations
  const totalMembers = new Set(projects.map(p => (p.memberName || '').trim().toLowerCase())).size;
  const activeProjects = projects.filter(p => p.status !== 'Completed').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const overdueProjects = projects.filter(p => {
    if (p.status === 'Completed' || !p.deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = p.deadline.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d < today;
  }).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner / Header */}
      <div className="it-projects-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#fff', padding: '1.25rem 1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
              <Code size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {isAdmin ? '🏢 Company IT Projects & Branch Operations' : '💻 Branch IT Team & Projects'}
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                {isAdmin
                  ? 'All branches IT projects, delivery deadlines, assigned branch manager & email communication proofs.'
                  : `Managing IT team and project deadlines for ${currentUser?.branch || 'this'} branch.`}
              </p>
            </div>
          </div>
        </div>

        <div className="it-projects-actions" style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchProjects}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>

          <button
            onClick={handleOpenAddModal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#fff', fontSize: '0.88rem', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
          >
            <Plus size={16} /> Add IT Member / Project
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="#059669" /> {successMsg}
        </div>
      )}

      {/* KPI Cards Row (2-Grid on Mobile, Auto-fit on Desktop) */}
      <div className="dashboard-kpi-grid">
        <div className="dashboard-kpi-card" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>IT Team Members</span>
            <div className="dashboard-kpi-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={16} color="#334155" />
            </div>
          </div>
          <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{totalMembers}</div>
          <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {isAdmin ? 'Across all branches' : 'Assigned in this branch'}
          </span>
        </div>

        <div className="dashboard-kpi-card" style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #bfdbfe' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>Active Projects</span>
            <div className="dashboard-kpi-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} color="#2563eb" />
            </div>
          </div>
          <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e40af' }}>{activeProjects}</div>
          <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#2563eb' }}>In progress / review</span>
        </div>

        <div className="dashboard-kpi-card" style={{ background: overdueProjects > 0 ? '#fef2f2' : '#f0fdf4', padding: '1.25rem', borderRadius: '14px', border: overdueProjects > 0 ? '1px solid #fecaca' : '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: overdueProjects > 0 ? '#991b1b' : '#166534', textTransform: 'uppercase' }}>
              {overdueProjects > 0 ? 'Overdue Deadlines' : 'On Track'}
            </span>
            <div className="dashboard-kpi-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px', background: overdueProjects > 0 ? '#fee2e2' : '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} color={overdueProjects > 0 ? '#dc2626' : '#16a34a'} />
            </div>
          </div>
          <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: overdueProjects > 0 ? '#dc2626' : '#16a34a' }}>
            {overdueProjects}
          </div>
          <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: overdueProjects > 0 ? '#ef4444' : '#16a34a' }}>
            {overdueProjects > 0 ? 'Action required immediately' : 'All running within schedule'}
          </span>
        </div>

        <div className="dashboard-kpi-card" style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '14px', border: '1px solid #86efac' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span className="dashboard-kpi-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#14532d', textTransform: 'uppercase' }}>Completed</span>
            <div className="dashboard-kpi-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={16} color="#16a34a" />
            </div>
          </div>
          <div className="dashboard-kpi-val" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#14532d' }}>{completedProjects}</div>
          <span className="dashboard-kpi-sub" style={{ fontSize: '0.75rem', color: '#16a34a' }}>Successfully delivered</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: '#fff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search Member, Project, Branch, or Manager..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
          />
          {search && (
            <X size={14} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setSearch('')} />
          )}
        </div>

        {/* Branch Filter (Crucial for Admin to avoid confusion) */}
        {isAdmin && uniqueBranches.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Branch:</span>
            <select
              value={branchFilter}
              onChange={e => setBranchFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#fff', fontWeight: 700, color: '#0369a1' }}
            >
              <option value="all">All Branches ({projects.length})</option>
              {uniqueBranches.map(b => (
                <option key={b} value={b}>{b.toUpperCase()}</option>
              ))}
            </select>
          </div>
        )}

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#fff', fontWeight: 600 }}
          >
            <option value="all">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
            <option value="overdue">Overdue Deadlines</option>
          </select>
        </div>
      </div>

      {/* Projects List Container */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              IT Projects Directory ({filteredProjects.length})
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {isAdmin
                ? 'Showing IT members clearly organized with their assigned Branch & Branch Manager'
                : 'Assignments and live countdown deadlines for this branch'}
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px auto' }} />
            <div>Loading IT Team Projects...</div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
            <Code size={42} style={{ opacity: 0.25, margin: '0 auto 12px auto' }} />
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#0f172a' }}>No IT Projects Found</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              {search || statusFilter !== 'all' || branchFilter !== 'all'
                ? 'No projects match your filter query.'
                : 'Click "+ Add IT Member / Project" to register your first IT project with email proof.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="applications-desktop-table" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '14px 18px' }}>IT Member</th>
                    {/* DEDICATED BRANCH & MANAGER COLUMN (Eliminates Admin Confusion!) */}
                    <th style={{ padding: '14px 18px' }}>Branch & Manager</th>
                    <th style={{ padding: '14px 18px' }}>Project & Scope</th>
                    <th style={{ padding: '14px 18px' }}>Target Deadline</th>
                    <th style={{ padding: '14px 18px' }}>Remaining Time (Live)</th>
                    <th style={{ padding: '14px 18px' }}>Email Proof</th>
                    <th style={{ padding: '14px 18px' }}>Status</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((proj) => {
                    const deadlineInfo = getDeadlineStatus(proj.deadline, proj.status);
                    const proofUrl = proj.emailProofUrl ? `${resolvedApi}${proj.emailProofUrl}` : null;

                    return (
                      <tr key={proj.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        {/* Member */}
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                              {(proj.memberName || 'IT')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>{proj.memberName}</div>
                              <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                                {proj.memberRole || 'Developer'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* BRANCH & MANAGER COLUMN */}
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '3px 9px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 800, width: 'fit-content', textTransform: 'capitalize' }}>
                              <Building2 size={12} color="#2563eb" />
                              {proj.branch || 'Main Branch'}
                            </span>
                            {proj.branchManagerName && (
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Mgr: <strong style={{ color: '#334155' }}>{proj.branchManagerName}</strong>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Project */}
                        <td style={{ padding: '16px 18px', maxWidth: '240px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>{proj.projectName}</div>
                          {proj.description && (
                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {proj.description}
                            </p>
                          )}
                        </td>

                        {/* Deadline Date */}
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontWeight: 700 }}>
                            <Calendar size={14} color="#64748b" />
                            {proj.deadline ? new Date(proj.deadline + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                          </div>
                        </td>

                        {/* Countdown Badge (Pakathula Reduce Aaga) */}
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: deadlineInfo.bg, color: deadlineInfo.color, border: `1px solid ${deadlineInfo.border}`, padding: '4px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem' }}>
                            <Clock size={13} />
                            {deadlineInfo.text}
                          </div>
                        </td>

                        {/* Email Proof */}
                        <td style={{ padding: '16px 18px' }}>
                          {proofUrl ? (
                            <button
                              onClick={() => setViewProofModal(proj)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}
                            >
                              <Eye size={13} /> View Proof
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No Proof</span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px 18px' }}>
                          <select
                            value={proj.status || 'In Progress'}
                            onChange={(e) => handleQuickStatusChange(proj, e.target.value)}
                            style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, border: '1px solid #cbd5e1', background: proj.status === 'Completed' ? '#dcfce7' : '#fff', color: proj.status === 'Completed' ? '#166534' : '#334155', cursor: 'pointer', outline: 'none' }}
                          >
                            <option value="In Progress">In Progress</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Completed">Completed</option>
                            <option value="Delayed">Delayed</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenEditModal(proj)}
                              title="Edit Project"
                              style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(proj.id)}
                              title="Delete Project"
                              style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="applications-mobile-cards" style={{ padding: '12px' }}>
              {filteredProjects.map((proj) => {
                const deadlineInfo = getDeadlineStatus(proj.deadline, proj.status);
                const proofUrl = proj.emailProofUrl ? `${resolvedApi}${proj.emailProofUrl}` : null;

                return (
                  <div key={proj.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{proj.memberName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                            {proj.memberRole || 'Developer'}
                          </span>
                          {/* Mobile Branch Tag */}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '2px 7px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize' }}>
                            <Building2 size={11} color="#2563eb" /> {proj.branch || 'Branch'}
                            {proj.branchManagerName && ` • ${proj.branchManagerName}`}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: deadlineInfo.bg, color: deadlineInfo.color, border: `1px solid ${deadlineInfo.border}`, padding: '4px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '0.75rem' }}>
                        {deadlineInfo.text}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: '4px' }}>
                        {proj.projectName}
                      </div>
                      {proj.description && (
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                          {proj.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#475569', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="#64748b" />
                        <span>Deadline: <strong>{proj.deadline ? new Date(proj.deadline + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}</strong></span>
                      </div>

                      {proofUrl && (
                        <button
                          onClick={() => setViewProofModal(proj)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          <Eye size={12} /> Email Proof
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '2px' }}>
                      <select
                        value={proj.status || 'In Progress'}
                        onChange={(e) => handleQuickStatusChange(proj, e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #cbd5e1', background: '#fff' }}
                      >
                        <option value="In Progress">In Progress</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Completed">Completed</option>
                        <option value="Delayed">Delayed</option>
                      </select>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEditModal(proj)}
                          style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(proj.id)}
                          style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* MODAL: ADD / EDIT IT PROJECT */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingProject ? 'Edit IT Project' : 'Add IT Member & Project'}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Assign branch, deadline, and upload email communication proof screenshot
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {error && (
                <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                  ⚠️ {error}
                </div>
              )}

              {/* BRANCH SELECTION (Especially for Super Admin) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Assign to Branch & Manager *
                </label>
                {isAdmin ? (
                  <select
                    required
                    value={form.branchManagerId}
                    onChange={e => {
                      const selBm = availableBms.find(b => b.id === e.target.value);
                      setForm({
                        ...form,
                        branchManagerId: e.target.value,
                        branch: selBm ? selBm.branch : ''
                      });
                    }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#fff', fontWeight: 600 }}
                  >
                    <option value="">-- Select Branch & Manager --</option>
                    {availableBms.map(bm => (
                      <option key={bm.id} value={bm.id}>
                        {bm.branch ? bm.branch.toUpperCase() : 'MAIN'} — {bm.name} ({bm.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={`${currentUser?.branch ? currentUser.branch.toUpperCase() : 'MAIN BRANCH'} (${currentUser?.name || 'Branch Manager'})`}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#334155', fontSize: '0.9rem', fontWeight: 700 }}
                  />
                )}
              </div>

              {/* Member Name & Role */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    IT Member Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karthik R"
                    value={form.memberName}
                    onChange={e => setForm({ ...form, memberName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Role / Specialization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend / React Dev"
                    value={form.memberRole}
                    onChange={e => setForm({ ...form, memberRole: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Project Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Candidate Portal App v2"
                  value={form.projectName}
                  onChange={e => setForm({ ...form, projectName: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Project Scope / Deliverables
                </label>
                <textarea
                  rows={2}
                  placeholder="Deliverable milestones, API endpoints, UI features..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Target Deadline & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Target Deadline * (Date)
                  </label>
                  <input
                    type="date"
                    required
                    value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Project Status
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#fff' }}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
              </div>

              {/* Email Proof Photo Upload */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px dashed #94a3b8' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  📸 Email Proof Screenshot {editingProject ? '(Optional to update)' : '* (Required)'}
                </label>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#64748b' }}>
                  Upload photo/screenshot of the email communication sent by the Branch Manager confirming the project deadline.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'block', width: '100%', fontSize: '0.85rem' }}
                />

                {previewImage && (
                  <div style={{ marginTop: '10px', position: 'relative', display: 'inline-block' }}>
                    <img
                      src={previewImage}
                      alt="Email Proof Preview"
                      style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: '8px', border: '1px solid #cbd5e1', objectFit: 'contain', background: '#fff' }}
                    />
                    <button
                      type="button"
                      onClick={() => { setPreviewImage(''); setForm(prev => ({ ...prev, emailProofImage: '' })); }}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
                >
                  {saving ? 'Saving...' : editingProject ? 'Update Project' : 'Save & Publish IT Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW EMAIL PROOF LIGHTBOX */}
      {viewProofModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Email Communication Proof
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '10px', marginTop: '3px' }}>
                  <span>Project: <strong>{viewProofModal.projectName}</strong></span>
                  <span>Member: <strong>{viewProofModal.memberName}</strong></span>
                  <span style={{ color: '#1e40af' }}>Branch: <strong>{viewProofModal.branch}</strong> ({viewProofModal.branchManagerName || 'Manager'})</span>
                </div>
              </div>
              <button
                onClick={() => setViewProofModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: '1rem', overflowY: 'auto', textAlign: 'center', background: '#0f172a' }}>
              <img
                src={`${resolvedApi}${viewProofModal.emailProofUrl}`}
                alt="Email Proof Full View"
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
              />
            </div>

            <div style={{ padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Target Deadline: <strong>{viewProofModal.deadline}</strong>
              </span>
              <a
                href={`${resolvedApi}${viewProofModal.emailProofUrl}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#0284c7', textDecoration: 'none', fontWeight: 700 }}
              >
                Open in Full Window <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
