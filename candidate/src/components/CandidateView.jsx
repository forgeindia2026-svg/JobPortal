import React, { useState, useEffect } from 'react';
import {
  MapPin, Briefcase, Building2, ChevronRight, Sparkles, ArrowLeft, Search,
  Code, TrendingUp, Headphones, Award
} from 'lucide-react';
import JobDetailModal from './JobDetailModal';
import ApplicationModal from './ApplicationModal';
import CandidateDashboard from './CandidateDashboard';

export default function CandidateView({ API_URL, currentUser }) {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'my_apps'
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [viewingJob, setViewingJob] = useState(null);
  const [applyingJob, setApplyingJob] = useState(null);
  const [userApplications, setUserApplications] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [catRes, compRes, jobsRes] = await Promise.all([
        fetch(`${API_URL}/api/categories`),
        fetch(`${API_URL}/api/companies`),
        fetch(`${API_URL}/api/jobs`)
      ]);

      const cats = await catRes.json();
      const comps = await compRes.json();
      const jbs = await jobsRes.json();

      setCategories(Array.isArray(cats) ? cats : []);
      setCompanies(Array.isArray(comps) ? comps : []);
      setJobs(Array.isArray(jbs) ? jbs : []);
    } catch (err) {
      console.error('Error loading candidate data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const candId = currentUser?.candidateId || currentUser?.id;
      const url = candId ? `${API_URL}/api/applications?candidateId=${candId}` : `${API_URL}/api/applications`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setUserApplications(data);
      }
    } catch (err) {
      console.error('Error fetching candidate apps:', err);
    }
  };

  useEffect(() => {
    fetchUserApplications();
  }, [currentUser]);

  const getCategoryStyle = (catId, catName) => {
    const nameLower = (catName || '').toLowerCase();
    const idLower = (catId || '').toLowerCase();

    if (idLower.includes('banking') || nameLower.includes('banking')) {
      return {
        gradient: 'linear-gradient(135deg, #059669, #10b981)',
        shadow: '0 12px 28px -4px rgba(16, 185, 129, 0.45)',
        badgeBg: '#ecfdf5',
        badgeText: '#047857',
        borderAccent: '#10b981',
        cardBg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, #ffffff 75%)',
        icon: <Building2 size={28} color="#fff" />
      };
    }
    if (idLower.includes('it') || nameLower.includes('it') || nameLower.includes('software')) {
      return {
        gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        shadow: '0 12px 28px -4px rgba(139, 92, 246, 0.45)',
        badgeBg: '#f5f3ff',
        badgeText: '#6d28d9',
        borderAccent: '#8b5cf6',
        cardBg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, #ffffff 75%)',
        icon: <Code size={28} color="#fff" />
      };
    }
    if (idLower.includes('sales') || nameLower.includes('sales') || nameLower.includes('marketing')) {
      return {
        gradient: 'linear-gradient(135deg, #ea580c, #f97316)',
        shadow: '0 12px 28px -4px rgba(249, 115, 22, 0.45)',
        badgeBg: '#fff7ed',
        badgeText: '#c2410c',
        borderAccent: '#f97316',
        cardBg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.06) 0%, #ffffff 75%)',
        icon: <TrendingUp size={28} color="#fff" />
      };
    }
    if (idLower.includes('bpo') || nameLower.includes('bpo') || nameLower.includes('customer')) {
      return {
        gradient: 'linear-gradient(135deg, #db2777, #ec4899)',
        shadow: '0 12px 28px -4px rgba(236, 72, 153, 0.45)',
        badgeBg: '#fdf2f8',
        badgeText: '#be185d',
        borderAccent: '#ec4899',
        cardBg: 'linear-gradient(135deg, rgba(236, 72, 153, 0.06) 0%, #ffffff 75%)',
        icon: <Headphones size={28} color="#fff" />
      };
    }
    if (idLower.includes('nonit') || nameLower.includes('non-it') || nameLower.includes('operation')) {
      return {
        gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
        shadow: '0 12px 28px -4px rgba(245, 158, 11, 0.45)',
        badgeBg: '#fffbeb',
        badgeText: '#b45309',
        borderAccent: '#f59e0b',
        cardBg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, #ffffff 75%)',
        icon: <Briefcase size={28} color="#fff" />
      };
    }

    return {
      gradient: 'linear-gradient(135deg, #0284c7, #06b6d4)',
      shadow: '0 12px 28px -4px rgba(6, 182, 212, 0.45)',
      badgeBg: '#e0f2fe',
      badgeText: '#0369a1',
      borderAccent: '#06b6d4',
      cardBg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.06) 0%, #ffffff 75%)',
      icon: <Award size={28} color="#fff" />
    };
  };

  const filteredCompanies = selectedCategory
    ? companies.filter(c => c.categoryId === selectedCategory.id)
    : companies;

  const filteredJobs = jobs.filter(job => {
    if (job.status && job.status.toLowerCase() !== 'active') return false;
    if (selectedCategory && job.categoryId !== selectedCategory.id) return false;
    if (selectedCompany && job.companyId !== selectedCompany.id) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title?.toLowerCase().includes(q);
      const matchLoc = job.location?.toLowerCase().includes(q);
      const matchComp = job.companyName?.toLowerCase().includes(q);
      return matchTitle || matchLoc || matchComp;
    }
    return true;
  });

  const handleApplyClick = (job) => {
    setViewingJob(null);
    setApplyingJob(job);
  };

  const isAlreadyApplied = (jobId) => {
    return userApplications.some(a => a.jobId === jobId);
  };

  const goToCategoriesPage = () => {
    setSelectedCategory(null);
    setSelectedCompany(null);
  };

  const goToCompaniesPage = () => {
    setSelectedCompany(null);
  };

  return (
    <div className="candidate-portal-wrapper">
      {/* Navigation Sub-Header */}
      <div className="sub-nav-bar">
        <div className="sub-nav-container">
          <button
            className={`portal-tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            <Sparkles size={16} /> Browse Jobs
          </button>
          <button
            className={`portal-tab-btn ${activeTab === 'my_apps' ? 'active' : ''}`}
            onClick={() => setActiveTab('my_apps')}
          >
            <Briefcase size={16} /> My Applications ({userApplications.length})
          </button>
        </div>
      </div>

      {activeTab === 'my_apps' ? (
        <CandidateDashboard candidate={currentUser} API_URL={API_URL} onBrowseJobs={() => setActiveTab('browse')} />
      ) : (
        <div className="section-container animate-fade">
          {/* PAGE 1: CATEGORIES VIEW */}
          {!selectedCategory && !selectedCompany && (
            <div>
              {/* Vibrant Hero Banner */}
              <div className="portal-hero-card">
                <div className="hero-content">
                  <div className="hero-pill-badge">
                    <Sparkles size={14} /> Official Recruitment Portal
                  </div>
                  <h1 className="hero-title">
                    Discover Your Next <span className="hero-gradient-text">Career Step</span>
                  </h1>
                  <p className="hero-subtitle">
                    Select a job category below to explore top verified companies, instant interview rounds, and direct openings.
                  </p>

                  {/* Search Bar */}
                  <div className="hero-search-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                      type="text"
                      className="hero-search-input"
                      placeholder="Search jobs by title, company, or location (e.g., Chennai, Relationship Officer)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION HEADER */}
              <div className="section-header">
                <div>
                  <h2 className="section-title">Select Job Category</h2>
                  <p className="section-subtitle">Click on a domain category to view hiring companies and active job openings</p>
                </div>
              </div>

              {loading ? (
                <div className="portal-loading-card">
                  <div className="spinner"></div>
                  <span>Loading job categories...</span>
                </div>
              ) : (
                <div className="category-grid" style={{ marginBottom: '2.5rem' }}>
                  {categories.map(cat => {
                    const posCount = jobs.filter(j => j.categoryId === cat.id).length;
                    const compCount = companies.filter(c => c.categoryId === cat.id).length;
                    const styleConfig = getCategoryStyle(cat.id, cat.name);

                    return (
                      <div
                        key={cat.id}
                        className="category-card-vibrant"
                        onClick={() => setSelectedCategory(cat)}
                        style={{ background: styleConfig.cardBg }}
                      >
                        <div
                          className="vibrant-cat-accent-bar"
                          style={{ background: styleConfig.gradient }}
                        />

                        <div className="vibrant-cat-header">
                          <div
                            className="vibrant-cat-icon"
                            style={{
                              background: styleConfig.gradient,
                              boxShadow: styleConfig.shadow
                            }}
                          >
                            {styleConfig.icon}
                          </div>
                          <span
                            className="vibrant-pos-badge"
                            style={{
                              background: styleConfig.badgeBg,
                              color: styleConfig.badgeText
                            }}
                          >
                            {compCount} Companies
                          </span>
                        </div>

                        <div className="vibrant-cat-content">
                          <h3 className="vibrant-cat-name">{cat.name}</h3>
                          {cat.description && (
                            <p className="vibrant-cat-desc">{cat.description}</p>
                          )}
                          <div className="vibrant-cat-footer">
                            <span className="vibrant-jobs-count">
                              ⚡ {posCount} Active Openings
                            </span>
                            <span className="vibrant-explore-btn" style={{ color: styleConfig.borderAccent }}>
                              Explore <ChevronRight size={18} />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}


          {/* PAGE 2: COMPANIES VIEW (e.g., Banking Companies) */}
          {selectedCategory && !selectedCompany && (
            <div>
              <div className="breadcrumb-wrapper">
                <button className="btn-secondary back-btn-mobile" onClick={goToCategoriesPage}>
                  <ArrowLeft size={16} /> Back
                </button>
                <div className="breadcrumb-nav">
                  <span className="breadcrumb-item" onClick={goToCategoriesPage}>Categories</span>
                  <ChevronRight size={14} />
                  <span className="breadcrumb-item active">{selectedCategory.name}</span>
                </div>
              </div>

              <div className="section-header">
                <div>
                  <h2 className="section-title">{selectedCategory.name} Companies</h2>
                  <p className="section-subtitle">Select a bank or hiring company below to view active job roles</p>
                </div>
              </div>

              <div className="company-card-grid" style={{ marginBottom: '3rem' }}>
                {filteredCompanies.length === 0 ? (
                  <div className="empty-state-card">
                    <Building2 size={44} color="#94a3b8" />
                    <h4>No Hiring Companies Found</h4>
                    <p>No companies currently listed under {selectedCategory.name}.</p>
                  </div>
                ) : (
                  filteredCompanies.map(comp => {
                    const compJobs = jobs.filter(j => j.companyId === comp.id);

                    return (
                      <div
                        key={comp.id}
                        className="company-visual-card-vibrant"
                        onClick={() => setSelectedCompany(comp)}
                      >
                        <div className="comp-card-top">
                          {comp.logo ? (
                            <img src={comp.logo} alt={comp.name} className="company-logo-vibrant" />
                          ) : (
                            <div className="company-logo-vibrant logo-placeholder">
                              <Building2 size={26} color="var(--primary)" />
                            </div>
                          )}
                          <div className="comp-info">
                            <h4 className="comp-title">{comp.name}</h4>
                            <span className="comp-count-tag">{compJobs.length} Open Positions</span>
                          </div>
                        </div>

                        {comp.description && (
                          <p className="comp-desc">{comp.description}</p>
                        )}

                        <div className="comp-card-bottom">
                          <span>View {comp.name} Jobs</span>
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* PAGE 3: JOB OPENINGS VIEW (e.g. Axis Bank Jobs) */}
          {selectedCategory && selectedCompany && (
            <div>
              <div className="breadcrumb-wrapper">
                <button className="btn-secondary back-btn-mobile" onClick={goToCompaniesPage}>
                  <ArrowLeft size={16} /> Back
                </button>
                <div className="breadcrumb-nav">
                  <span className="breadcrumb-item" onClick={goToCategoriesPage}>Categories</span>
                  <ChevronRight size={14} />
                  <span className="breadcrumb-item" onClick={goToCompaniesPage}>{selectedCategory.name}</span>
                  <ChevronRight size={14} />
                  <span className="breadcrumb-item active">{selectedCompany.name}</span>
                </div>
              </div>

              <div className="section-header">
                <div>
                  <h2 className="section-title">Openings at {selectedCompany.name}</h2>
                  <p className="section-subtitle">Showing {filteredJobs.length} available openings</p>
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="empty-state-card">
                  <Briefcase size={44} color="#94a3b8" />
                  <h4>No Active Jobs Found</h4>
                  <p>There are no open job roles listed for {selectedCompany.name} right now.</p>
                  <button className="btn-secondary" onClick={goToCompaniesPage} style={{ marginTop: '1rem' }}>
                    Choose Another Company
                  </button>
                </div>
              ) : (
                <div className="job-grid">
                  {filteredJobs.map(job => {
                    const applied = isAlreadyApplied(job.id);

                    return (
                      <div key={job.id} className="job-card-vibrant">
                        <div>
                          <div className="job-card-header">
                            {job.companyLogo ? (
                              <img src={job.companyLogo} alt={job.companyName} className="job-comp-logo-vibrant" />
                            ) : (
                              <div className="job-comp-logo-vibrant logo-placeholder">
                                <Building2 size={24} color="var(--primary)" />
                              </div>
                            )}
                            <div>
                              <h4 className="job-card-title">{job.title}</h4>
                              <div className="job-comp-name">{job.companyName || selectedCompany.name}</div>
                            </div>
                          </div>

                          <div className="job-tags-container">
                            <span className="tag-pill tag-location">
                              <MapPin size={13} /> {job.location}
                            </span>
                            <span className="tag-pill tag-exp">
                              <Briefcase size={13} /> {job.experience}
                            </span>
                            <span className="tag-pill tag-salary-vibrant">
                              {job.salary}
                            </span>
                            {job.trainingPeriod && (
                              <span className="tag-pill tag-training">
                                Training: {job.trainingPeriod}
                              </span>
                            )}
                          </div>

                          {job.description && (
                            <p className="job-snippet">{job.description}</p>
                          )}
                        </div>

                        <div className="job-card-footer">
                          <button className="btn-secondary" onClick={() => setViewingJob(job)}>
                            View Details
                          </button>
                          {applied ? (
                            <span className="applied-pill">
                              ✓ Applied
                            </span>
                          ) : (
                            <button className="btn-primary-gradient" onClick={() => handleApplyClick(job)}>
                              Apply Now
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <JobDetailModal
        job={viewingJob}
        onClose={() => setViewingJob(null)}
        onApplyClick={handleApplyClick}
        isAlreadyApplied={viewingJob ? isAlreadyApplied(viewingJob.id) : false}
      />

      <ApplicationModal
        job={applyingJob}
        candidate={currentUser}
        isOpen={!!applyingJob}
        onClose={() => setApplyingJob(null)}
        onSubmitSuccess={() => {
          fetchUserApplications();
        }}
        API_URL={API_URL}
      />
    </div>
  );
}

