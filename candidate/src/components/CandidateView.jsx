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

  // Handle mobile hardware back button and page navigation
  useEffect(() => {
    const handlePopState = (e) => {
      const state = e.state;
      if (viewingJob) {
        if (!state || (state.page !== 'job_details' && !state.subView)) {
          setViewingJob(null);
        }
      } else if (selectedCompany) {
        if (!state || state.page !== 'company') {
          setSelectedCompany(null);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [viewingJob, selectedCompany]);

  const handleCompanyClick = (comp) => {
    window.history.pushState({ page: 'company' }, '');
    setSelectedCompany(comp);
  };

  const handleViewJobDetails = (job) => {
    window.history.pushState({ page: 'job_details' }, '');
    setViewingJob(job);
  };

  const handleBackFromJobDetails = () => {
    if (window.history.state && window.history.state.page === 'job_details') {
      window.history.back();
    } else {
      setViewingJob(null);
    }
  };

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

      const catList = Array.isArray(cats) ? cats : [];
      setCategories(catList);
      setCompanies(Array.isArray(comps) ? comps : []);
      setJobs(Array.isArray(jbs) ? jbs : []);

      // Auto-select Banking & Financial Services category on load
      const bankingCat = catList.find(c =>
        c.id === 'cat_banking' ||
        (c.name || '').toLowerCase().includes('banking')
      );
      if (bankingCat) {
        setSelectedCategory(bankingCat);
      }
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

  const formatTrainingSummaryTag = (trainingPeriod) => {
    if (!trainingPeriod || typeof trainingPeriod !== 'string') return null;
    const parts = trainingPeriod.split('|').map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      const firstPhase = parts[0].replace(/^Phase\s*\d+\s*:\s*/i, '');
      const durationMatch = firstPhase.match(/([\d\-\s]+(?:month|mon|m|year|yr|w|week|day|d)s?)/i);
      if (durationMatch) {
        return `🎓 Training: ${durationMatch[1].trim()} (${parts.length} Phases)`;
      }
      return `🎓 Training: ${parts.length} Structured Phases`;
    }
    const clean = trainingPeriod.replace(/^Phase\s*\d+\s*:\s*/i, '');
    if (clean.length > 30) {
      return `🎓 Training Program Included`;
    }
    return `🎓 Training: ${clean}`;
  };

  const getLogoUrl = (compName, compLogo) => {
    const fallbackMap = {
      'Axis Bank': '/logos/axis_bank.svg',
      'IDFC First Bank': '/logos/idfc_first_bank.svg',
      'Kotak Mahindra Bank': '/logos/kotak_bank.png',
      'Bandhan Bank': '/logos/bandhan_bank.png',
      'Aditya Birla Capital': '/logos/aditya_birla.jpg',
      'Mahindra Finance': '/logos/mahindra_finance.png',
      'Tech Mahindra': '/logos/tech_mahindra.svg'
    };

    if (compName && fallbackMap[compName]) {
      return fallbackMap[compName];
    }
    if (!compLogo) return '';
    if (typeof compLogo === 'string' && compLogo.includes('/logos/')) {
      const filename = compLogo.split('/').pop();
      return `/logos/${filename}`;
    }
    return compLogo;
  };

  const getCategoryStyle = (catId, catName) => {
    const nameLower = (catName || '').toLowerCase();
    const idLower = (catId || '').toLowerCase();

    if (idLower.includes('banking') || nameLower.includes('banking')) {
      return {
        shadow: '0 12px 28px -4px rgba(16, 185, 129, 0.45)',
        badgeBg: 'rgba(255, 255, 255, 0.25)',
        badgeText: '#ffffff',
        borderAccent: '#059669',
        cardBg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        textColor: '#ffffff',
        mutedText: 'rgba(255, 255, 255, 0.9)',
        btnBg: '#ffffff',
        btnColor: '#047857',
        icon: <Building2 size={28} color="#047857" />,
        iconBg: '#ffffff'
      };
    }
    if (idLower.includes('it') || nameLower.includes('it') || nameLower.includes('software')) {
      return {
        shadow: '0 12px 28px -4px rgba(139, 92, 246, 0.45)',
        badgeBg: 'rgba(255, 255, 255, 0.25)',
        badgeText: '#ffffff',
        borderAccent: '#7c3aed',
        cardBg: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
        textColor: '#ffffff',
        mutedText: 'rgba(255, 255, 255, 0.9)',
        btnBg: '#ffffff',
        btnColor: '#6d28d9',
        icon: <Code size={28} color="#6d28d9" />,
        iconBg: '#ffffff'
      };
    }
    if (idLower.includes('sales') || nameLower.includes('sales') || nameLower.includes('marketing')) {
      return {
        shadow: '0 12px 28px -4px rgba(249, 115, 22, 0.45)',
        badgeBg: 'rgba(255, 255, 255, 0.25)',
        badgeText: '#ffffff',
        borderAccent: '#ea580c',
        cardBg: 'linear-gradient(135deg, #c2410c 0%, #f97316 100%)',
        textColor: '#ffffff',
        mutedText: 'rgba(255, 255, 255, 0.9)',
        btnBg: '#ffffff',
        btnColor: '#c2410c',
        icon: <TrendingUp size={28} color="#c2410c" />,
        iconBg: '#ffffff'
      };
    }
    if (idLower.includes('bpo') || nameLower.includes('bpo') || nameLower.includes('customer')) {
      return {
        shadow: '0 12px 28px -4px rgba(236, 72, 153, 0.45)',
        badgeBg: 'rgba(255, 255, 255, 0.25)',
        badgeText: '#ffffff',
        borderAccent: '#db2777',
        cardBg: 'linear-gradient(135deg, #be185d 0%, #ec4899 100%)',
        textColor: '#ffffff',
        mutedText: 'rgba(255, 255, 255, 0.9)',
        btnBg: '#ffffff',
        btnColor: '#be185d',
        icon: <Headphones size={28} color="#be185d" />,
        iconBg: '#ffffff'
      };
    }
    if (idLower.includes('nonit') || nameLower.includes('non-it') || nameLower.includes('operation')) {
      return {
        shadow: '0 12px 28px -4px rgba(245, 158, 11, 0.45)',
        badgeBg: 'rgba(255, 255, 255, 0.25)',
        badgeText: '#ffffff',
        borderAccent: '#d97706',
        cardBg: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
        textColor: '#ffffff',
        mutedText: 'rgba(255, 255, 255, 0.9)',
        btnBg: '#ffffff',
        btnColor: '#b45309',
        icon: <Briefcase size={28} color="#b45309" />,
        iconBg: '#ffffff'
      };
    }

    return {
      shadow: '0 12px 28px -4px rgba(6, 182, 212, 0.45)',
      badgeBg: 'rgba(255, 255, 255, 0.25)',
      badgeText: '#ffffff',
      borderAccent: '#0284c7',
      cardBg: 'linear-gradient(135deg, #0369a1 0%, #06b6d4 100%)',
      textColor: '#ffffff',
      mutedText: 'rgba(255, 255, 255, 0.9)',
      btnBg: '#ffffff',
      btnColor: '#0369a1',
      icon: <Award size={28} color="#0369a1" />,
      iconBg: '#ffffff'
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
    if (window.history.state && window.history.state.page === 'company') {
      window.history.back();
    } else {
      setSelectedCompany(null);
    }
  };

  return (
    <div className="candidate-portal-wrapper">
      {/* Navigation Sub-Header Removed per user request */}

      {activeTab === 'my_apps' ? (
        <CandidateDashboard candidate={currentUser} API_URL={API_URL} onBrowseJobs={() => setActiveTab('browse')} />
      ) : viewingJob ? (
        <div className="section-container animate-fade" style={{ paddingBottom: '3rem' }}>
          <JobDetailModal
            job={viewingJob}
            onClose={handleBackFromJobDetails}
            onApplyClick={handleApplyClick}
            isAlreadyApplied={isAlreadyApplied(viewingJob.id)}
            isFullPage={true}
          />
        </div>
      ) : (
        <div className="section-container animate-fade">
          {/* PAGE 1: CATEGORIES VIEW */}
          {!selectedCategory && !selectedCompany && (
            <div>
              {/* SECTION HEADER */}
              <div className="section-header">
                <div>
                  <h2 className="section-title">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'Select Job Category'}
                  </h2>
                  <p className="section-subtitle">
                    {searchQuery
                      ? `Found ${filteredJobs.length} matching job openings`
                      : 'Click on a domain category to view hiring companies and active job openings'}
                  </p>
                </div>
              </div>

              {searchQuery ? (
                <div className="job-grid" style={{ marginBottom: '2.5rem' }}>
                  {filteredJobs.length === 0 ? (
                    <div className="empty-state-card" style={{ gridColumn: '1 / -1' }}>
                      <Briefcase size={44} color="#94a3b8" />
                      <h4>No Matching Jobs Found</h4>
                      <p>Try searching with a different job title, location, or company name.</p>
                      <button className="btn-secondary" onClick={() => setSearchQuery('')} style={{ marginTop: '1rem' }}>
                        Clear Search Filter
                      </button>
                    </div>
                  ) : (
                    filteredJobs.map(job => {
                      const applied = isAlreadyApplied(job.id);
                      return (
                        <div key={job.id} className="job-card-vibrant">
                          <div>
                            <div className="job-card-header">
                              {getLogoUrl(job.companyName, job.companyLogo) ? (
                                <img src={getLogoUrl(job.companyName, job.companyLogo)} alt={job.companyName} className="job-comp-logo-vibrant" />
                              ) : (
                                <div className="job-comp-logo-vibrant logo-placeholder">
                                  <Building2 size={24} color="var(--primary)" />
                                </div>
                              )}
                              <div>
                                <h4 className="job-card-title">{job.title}</h4>
                                <div className="job-comp-name">{job.companyName}</div>
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
                                <span className="tag-pill tag-training" title={job.trainingPeriod}>
                                  {formatTrainingSummaryTag(job.trainingPeriod)}
                                </span>
                              )}
                            </div>

                            {job.description && (
                              <p className="job-snippet">{job.description}</p>
                            )}
                          </div>

                          <div className="job-card-footer">
                            <button className="btn-secondary" onClick={() => handleViewJobDetails(job)}>
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
                    })
                  )}
                </div>
              ) : loading ? (
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
                        style={{ background: styleConfig.cardBg, color: styleConfig.textColor }}
                      >
                        <div className="vibrant-cat-header">
                          <div
                            className="vibrant-cat-icon"
                            style={{
                              background: styleConfig.iconBg,
                              boxShadow: styleConfig.shadow
                            }}
                          >
                            {styleConfig.icon}
                          </div>
                          <span
                            className="vibrant-pos-badge"
                            style={{
                              background: styleConfig.badgeBg,
                              color: styleConfig.badgeText,
                              backdropFilter: 'blur(8px)',
                              border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}
                          >
                            <Building2 size={13} style={{ marginRight: '3px' }} /> {compCount} Companies
                          </span>
                        </div>

                        <div className="vibrant-cat-content">
                          <h3 className="vibrant-cat-name" style={{ color: styleConfig.textColor }}>{cat.name}</h3>
                          {cat.description && (
                            <p className="vibrant-cat-desc" style={{ color: styleConfig.mutedText }}>{cat.description}</p>
                          )}
                          <div className="vibrant-cat-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.25)' }}>
                            <span className="vibrant-jobs-count" style={{ background: 'rgba(255, 255, 255, 0.22)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.35)', whiteSpace: 'nowrap' }}>
                              ⚡ {posCount} Openings
                            </span>
                            <span className="vibrant-explore-btn" style={{ background: styleConfig.btnBg, color: styleConfig.btnColor, border: 'none', whiteSpace: 'nowrap' }}>
                              Explore <ChevronRight size={16} />
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
                        onClick={() => handleCompanyClick(comp)}
                      >
                        <div className="comp-card-top">
                          {getLogoUrl(comp.name, comp.logo) ? (
                            <img 
                              src={getLogoUrl(comp.name, comp.logo)} 
                              alt={comp.name} 
                              className="company-logo-vibrant" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
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
                            {getLogoUrl(job.companyName || (selectedCompany && selectedCompany.name), job.companyLogo) ? (
                              <img src={getLogoUrl(job.companyName || (selectedCompany && selectedCompany.name), job.companyLogo)} alt={job.companyName} className="job-comp-logo-vibrant" />
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
                               <span className="tag-pill tag-training" title={job.trainingPeriod}>
                                 {formatTrainingSummaryTag(job.trainingPeriod)}
                               </span>
                             )}
                          </div>

                          {job.description && (
                            <p className="job-snippet">{job.description}</p>
                          )}
                        </div>

                        <div className="job-card-footer">
                          <button className="btn-secondary" onClick={() => handleViewJobDetails(job)}>
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

      {/* Application Form Modal */}

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

