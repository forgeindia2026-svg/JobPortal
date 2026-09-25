import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FolderTree, Building2, Briefcase, Users, FileText,
  Calendar, BarChart3, Plus, Edit, Trash2, ExternalLink, RefreshCw, XCircle, GraduationCap
} from 'lucide-react';

import JobFormModal from './JobFormModal';
import CategoryFormModal from './CategoryFormModal';
import CompanyFormModal from './CompanyFormModal';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import ItTrainingModal from './ItTrainingModal';

export default function AdminDashboard({ API_URL, currentUser }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [kpis, setKpis] = useState(null);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [itProcesses, setItProcesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState(null);

  const [itModalOpen, setItModalOpen] = useState(false);
  const [itProcessToEdit, setItProcessToEdit] = useState(null);

  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [appToSchedule, setAppToSchedule] = useState(null);

  const [statusModalApp, setStatusModalApp] = useState(null);
  const [newAppStatus, setNewAppStatus] = useState('');
  const [adminNoteInput, setAdminNoteInput] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [kpiRes, catRes, compRes, jobsRes, appsRes, intRes, itRes] = await Promise.all([
        fetch(`${API_URL}/api/reports/dashboard`),
        fetch(`${API_URL}/api/categories`),
        fetch(`${API_URL}/api/companies`),
        fetch(`${API_URL}/api/jobs`),
        fetch(`${API_URL}/api/applications`),
        fetch(`${API_URL}/api/interviews`),
        fetch(`${API_URL}/api/it-training-processes/all`)
      ]);

      const kpiData = await kpiRes.json();
      const catData = await catRes.json();
      const compData = await compRes.json();
      const jobsData = await jobsRes.json();
      const appsData = await appsRes.json();
      const intData = await intRes.json();
      const itData = await itRes.json();

      setKpis(kpiData);
      setCategories(Array.isArray(catData) ? catData : []);
      setCompanies(Array.isArray(compData) ? compData : []);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setApplications(Array.isArray(appsData) ? appsData : []);
      setInterviews(Array.isArray(intData) ? intData : []);
      setItProcesses(Array.isArray(itData) ? itData : []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItProcess = async (processData) => {
    try {
      const isEditing = itProcessToEdit && itProcessToEdit.id;
      const url = isEditing
        ? `${API_URL}/api/it-training-processes/${itProcessToEdit.id}`
        : `${API_URL}/api/it-training-processes`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processData)
      });

      if (res.ok) {
        setItModalOpen(false);
        setItProcessToEdit(null);
        fetchAllData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save process');
      }
    } catch (err) {
      console.error('Error saving IT process:', err);
      alert('Error saving process');
    }
  };

  const handleDeleteItProcess = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/it-training-processes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error('Error deleting IT process:', err);
    }
  };

  const handleUpdateApplicationStatus = async () => {
    if (!statusModalApp || !newAppStatus) return;
    try {
      const res = await fetch(`${API_URL}/api/applications/${statusModalApp.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newAppStatus, adminNotes: adminNoteInput })
      });
      if (res.ok) {
        setStatusModalApp(null);
        fetchAllData();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job opening?')) return;
    try {
      await fetch(`${API_URL}/api/jobs/${id}`, { method: 'DELETE' });
      fetchAllData();
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await fetch(`${API_URL}/api/categories/${id}`, { method: 'DELETE' });
      fetchAllData();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm('Delete this company?')) return;
    try {
      await fetch(`${API_URL}/api/companies/${id}`, { method: 'DELETE' });
      fetchAllData();
    } catch (err) {
      console.error('Error deleting company:', err);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'active' || s === 'selected') return <span className="badge badge-active">✓ {status}</span>;
    if (s.includes('interview') || s === 'shortlisted') return <span className="badge badge-shortlisted">● {status}</span>;
    if (s === 'applied' || s === 'under review') return <span className="badge badge-applied">● {status}</span>;
    return <span className="badge badge-rejected">✕ {status}</span>;
  };

  return (
    <div className="admin-layout animate-fade">
      <div className="admin-sidebar">
        <div style={{ padding: '0 8px 1rem 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
            Recruitment Control Panel
          </div>
        </div>

        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} /> Dashboard & KPIs
        </button>

        <button
          className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <FolderTree size={18} /> Job Categories ({categories.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'companies' ? 'active' : ''}`}
          onClick={() => setActiveTab('companies')}
        >
          <Building2 size={18} /> Hiring Companies ({companies.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <Briefcase size={18} /> Job Openings ({jobs.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <FileText size={18} /> Applications Pipeline ({applications.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'interviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('interviews')}
        >
          <Calendar size={18} /> Scheduled Interviews ({interviews.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'it_training' ? 'active' : ''}`}
          onClick={() => setActiveTab('it_training')}
        >
          <GraduationCap size={18} /> IT Training Programs ({itProcesses.length})
        </button>

        <button
          className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <BarChart3 size={18} /> Analytics & Reports
        </button>
      </div>

      <div className="admin-main">
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Recruitment Dashboard Overview</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Live candidate applications, job metrics, and interview tracking.</p>
              </div>
              <button className="btn-secondary" onClick={fetchAllData} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={14} /> Refresh Stats
              </button>
            </div>

            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <Briefcase size={22} />
                </div>
                <div>
                  <div className="kpi-val">{kpis ? kpis.kpis.totalJobs : jobs.length}</div>
                  <div className="kpi-label">Total Jobs ({kpis ? kpis.kpis.activeJobs : 0} Active)</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                  <Users size={22} />
                </div>
                <div>
                  <div className="kpi-val">{kpis ? kpis.kpis.totalCandidates : 1}</div>
                  <div className="kpi-label">Total Candidates</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <FileText size={22} />
                </div>
                <div>
                  <div className="kpi-val">{kpis ? kpis.kpis.totalApplications : applications.length}</div>
                  <div className="kpi-label">Applications Received</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
                  <Calendar size={22} />
                </div>
                <div>
                  <div className="kpi-val">{kpis ? kpis.kpis.scheduledInterviews : interviews.length}</div>
                  <div className="kpi-label">Interviews Scheduled</div>
                </div>
              </div>
            </div>

            <div className="section-header" style={{ marginTop: '2rem' }}>
              <h3 className="section-title">Recent Applications</h3>
              <button className="btn-secondary" onClick={() => setActiveTab('applications')}>View All</button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>App No</th>
                    <th>Candidate</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 5).map(app => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 700, color: '#2563eb' }}>{app.applicationNumber}</td>
                      <td>
                        <strong>{app.candidateName}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.candidateEmail}</div>
                      </td>
                      <td>{app.jobTitle}</td>
                      <td>{app.companyName}</td>
                      <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => {
                            setStatusModalApp(app);
                            setNewAppStatus(app.status);
                            setAdminNoteInput(app.adminNotes || '');
                          }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Category Management</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Add, edit, and organize candidate job category domains.</p>
              </div>
              <button className="btn-primary" onClick={() => { setCategoryToEdit(null); setCategoryModalOpen(true); }}>
                <Plus size={16} /> Add Category
              </button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td style={{ fontWeight: 700 }}>{cat.name}</td>
                      <td>{cat.description || '-'}</td>
                      <td>{getStatusBadge(cat.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px' }}
                            onClick={() => { setCategoryToEdit(cat); setCategoryModalOpen(true); }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px', color: '#ef4444' }}
                            onClick={() => handleDeleteCategory(cat.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'companies' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Company Management</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Add hiring partner companies and upload logos.</p>
              </div>
              <button className="btn-primary" onClick={() => { setCompanyToEdit(null); setCompanyModalOpen(true); }}>
                <Plus size={16} /> Add Company
              </button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Company Name</th>
                    <th>Category</th>
                    <th>Website</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map(comp => {
                    const cat = categories.find(c => c.id === comp.categoryId);
                    return (
                      <tr key={comp.id}>
                        <td>
                          {comp.logo ? (
                            <img src={comp.logo} alt={comp.name} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain', backgroundColor: '#ffffff', padding: '2px', border: '1px solid #e2e8f0' }} />
                          ) : (
                            <Building2 size={24} color="#94a3b8" />
                          )}
                        </td>
                        <td style={{ fontWeight: 700 }}>{comp.name}</td>
                        <td>{cat ? cat.name : 'Uncategorized'}</td>
                        <td>
                          {comp.website ? (
                            <a href={comp.website} target="_blank" rel="noreferrer" style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              Visit <ExternalLink size={12} />
                            </a>
                          ) : '-'}
                        </td>
                        <td>{getStatusBadge(comp.status)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn-secondary"
                              style={{ padding: '4px 8px' }}
                              onClick={() => { setCompanyToEdit(comp); setCompanyModalOpen(true); }}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn-secondary"
                              style={{ padding: '4px 8px', color: '#ef4444' }}
                              onClick={() => handleDeleteCompany(comp.id)}
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
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Dynamic Job Openings</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Create, publish, and configure requirements for recruitment posts.</p>
              </div>
              <button className="btn-primary" onClick={() => { setJobToEdit(null); setJobModalOpen(true); }}>
                <Plus size={16} /> Create New Job
              </button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Salary</th>
                    <th>Openings</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{job.title}</td>
                      <td>{job.companyName}</td>
                      <td><span style={{ color: '#2563eb', fontWeight: 600 }}>{job.categoryName}</span></td>
                      <td>{job.location}</td>
                      <td style={{ color: '#047857', fontWeight: 600 }}>{job.salary}</td>
                      <td style={{ fontWeight: 700 }}>{job.openings}</td>
                      <td>{getStatusBadge(job.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px' }}
                            onClick={() => { setJobToEdit(job); setJobModalOpen(true); }}
                            title="Edit Job"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px', color: '#ef4444' }}
                            onClick={() => handleDeleteJob(job.id)}
                            title="Delete Job"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Applications Pipeline</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Review candidate profiles, change status, and schedule interview rounds.</p>
              </div>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Candidate Details</th>
                    <th>Applied Job</th>
                    <th>Company</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 700, color: '#2563eb' }}>{app.applicationNumber}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.candidateName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.candidateEmail} • {app.candidateMobile}</div>
                        <div style={{ fontSize: '0.775rem', color: '#475569' }}>{app.candidateQualification} ({app.candidateExperience})</div>
                        {app.candidateResumeUrl && (
                          <a href={app.candidateResumeUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.775rem', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                            <FileText size={12} /> View Resume
                          </a>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>{app.jobTitle}</td>
                      <td>{app.companyName}</td>
                      <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
                          <button
                            className="btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.775rem' }}
                            onClick={() => {
                              setStatusModalApp(app);
                              setNewAppStatus(app.status);
                              setAdminNoteInput(app.adminNotes || '');
                            }}
                          >
                            Update Status
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.775rem', background: '#eff6ff', color: '#1d4ed8' }}
                            onClick={() => {
                              setAppToSchedule(app);
                              setInterviewModalOpen(true);
                            }}
                          >
                            <Calendar size={12} /> Schedule Interview
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'interviews' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Scheduled Interviews</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Upcoming HR, Technical, and Branch interviews.</p>
              </div>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Round</th>
                    <th>Date & Time</th>
                    <th>Mode & Link / Address</th>
                    <th>Interviewer</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map(int => (
                    <tr key={int.id}>
                      <td style={{ fontWeight: 700 }}>{int.candidateName}</td>
                      <td>{int.jobTitle}</td>
                      <td>{int.companyName}</td>
                      <td><span className="badge badge-shortlisted">{int.round}</span></td>
                      <td style={{ fontWeight: 600 }}>{int.date} at {int.time}</td>
                      <td>
                        {int.mode === 'Online' ? (
                          <div>
                            <span style={{ color: '#059669', fontWeight: 600 }}>Online</span>
                            {int.meetingLink && (
                              <div><a href={int.meetingLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#2563eb' }}>Meeting Link</a></div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span style={{ color: '#d97706', fontWeight: 600 }}>Offline</span>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{int.location}</div>
                          </div>
                        )}
                      </td>
                      <td>{int.interviewer || 'HR Team'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '1.5rem' }}>Recruitment Analytics & Reports</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Applications by Category</h4>
                {kpis && kpis.charts && Object.entries(kpis.charts.appsByCategory).map(([cat, count]) => (
                  <div key={cat} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px' }}>
                      <span>{cat}</span>
                      <span>{count} Applications</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, count * 25)}%`, background: '#2563eb' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Applications by Company</h4>
                {kpis && kpis.charts && Object.entries(kpis.charts.appsByCompany).map(([comp, count]) => (
                  <div key={comp} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px' }}>
                      <span>{comp}</span>
                      <span>{count} Applications</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, count * 30)}%`, background: '#10b981' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'it_training' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>FIC IT Training & Placement Programs</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                  Manage multiple training processes (Process 1, Process 2, etc.) displayed to candidates.
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={() => {
                  setItProcessToEdit(null);
                  setItModalOpen(true);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={16} /> Add New Process
              </button>
            </div>

            {itProcesses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: '#64748b' }}>No IT Training Processes created yet.</p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setItProcessToEdit(null);
                    setItModalOpen(true);
                  }}
                  style={{ marginTop: '1rem' }}
                >
                  <Plus size={16} /> Add First Process
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Process Name</th>
                      <th>Program & Role</th>
                      <th>Training Duration</th>
                      <th>Stipend</th>
                      <th>Bond & Originals</th>
                      <th>Training Cost</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itProcesses.map(proc => (
                      <tr key={proc.id}>
                        <td>
                          <span style={{
                            fontWeight: 800,
                            color: '#1e40af',
                            background: '#dbeafe',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.85rem'
                          }}>
                            {proc.processName}
                          </span>
                        </td>
                        <td>
                          <strong>{proc.role || 'Software Engineer Trainee'}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{proc.programTitle}</div>
                        </td>
                        <td>
                          <strong>{proc.trainingPeriod || '6 Months'}</strong>
                          {proc.trainingSubtext && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{proc.trainingSubtext}</div>
                          )}
                        </td>
                        <td>
                          <strong style={{ color: '#047857' }}>₹{proc.stipend || '12,000'}</strong>
                          {proc.stipendSubtext && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{proc.stipendSubtext}</div>
                          )}
                        </td>
                        <td>
                          <div><strong>{proc.bondPeriod || '1 Year Bond'}</strong></div>
                          <span style={{ fontSize: '0.75rem', color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {proc.originalsRequired || 'Originals Required'}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: '#1d4ed8', fontSize: '1rem' }}>{proc.trainingFee || '1.6 LPA'}</strong>
                        </td>
                        <td>
                          {proc.status === 'Active' ? (
                            <span className="badge badge-active">✓ Active</span>
                          ) : (
                            <span className="badge badge-rejected">✕ Inactive</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn-icon"
                              title="Edit Process"
                              onClick={() => {
                                setItProcessToEdit(proc);
                                setItModalOpen(true);
                              }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn-icon text-danger"
                              title="Delete Process"
                              onClick={() => handleDeleteItProcess(proc.id, proc.processName)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <JobFormModal
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        jobToEdit={jobToEdit}
        categories={categories}
        companies={companies}
        API_URL={API_URL}
        onSaveSuccess={fetchAllData}
      />

      <ItTrainingModal
        isOpen={itModalOpen}
        onClose={() => {
          setItModalOpen(false);
          setItProcessToEdit(null);
        }}
        processToEdit={itProcessToEdit}
        onSave={handleSaveItProcess}
      />

      <CategoryFormModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categoryToEdit={categoryToEdit}
        API_URL={API_URL}
        onSaveSuccess={fetchAllData}
      />

      <CompanyFormModal
        isOpen={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        companyToEdit={companyToEdit}
        categories={categories}
        API_URL={API_URL}
        onSaveSuccess={fetchAllData}
      />

      <ScheduleInterviewModal
        isOpen={interviewModalOpen}
        onClose={() => setInterviewModalOpen(false)}
        application={appToSchedule}
        API_URL={API_URL}
        onScheduledSuccess={fetchAllData}
      />

      {statusModalApp && (
        <div className="modal-overlay" onClick={() => setStatusModalApp(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Application Status</h3>
              <button className="btn-close" onClick={() => setStatusModalApp(null)}><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
                Candidate: <strong>{statusModalApp.candidateName}</strong><br />
                Job: <strong>{statusModalApp.jobTitle}</strong> ({statusModalApp.companyName})
              </div>

              <div className="form-group">
                <label className="form-label">Select Candidate Status</label>
                <select className="form-select" value={newAppStatus} onChange={e => setNewAppStatus(e.target.value)}>
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="HR Screening">HR Screening</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Recruiter Notes for Candidate</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Enter feedback or instructions for candidate..."
                  value={adminNoteInput}
                  onChange={e => setAdminNoteInput(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
                <button className="btn-secondary" onClick={() => setStatusModalApp(null)}>Cancel</button>
                <button className="btn-primary" onClick={handleUpdateApplicationStatus}>Save Status</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
