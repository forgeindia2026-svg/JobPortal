import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export default function JobFormModal({ isOpen, onClose, jobToEdit, categories, companies, API_URL, onSaveSuccess }) {
  const [companyId, setCompanyId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [programName, setProgramName] = useState('');
  const [jobType, setJobType] = useState('Full Time');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [qualification, setQualification] = useState('');
  const [salary, setSalary] = useState('');
  const [trainingPeriod, setTrainingPeriod] = useState('');
  
  // Structured Multi-Phase Training Period & Fee Refund States
  const [hasTraining, setHasTraining] = useState('Yes');
  const [trainingFee, setTrainingFee] = useState('');
  const [feeRefundType, setFeeRefundType] = useState('100% Refundable');
  const [feeRefundDetails, setFeeRefundDetails] = useState('');
  const [trainingTitle, setTrainingTitle] = useState('');
  const [trainingSubtext, setTrainingSubtext] = useState('');
  const [stipendTitle, setStipendTitle] = useState('');
  const [stipendSubtext, setStipendSubtext] = useState('');
  const [trainingPhases, setTrainingPhases] = useState([
    { duration: '', mode: '', stipend: '' }
  ]);

  // Interview Crack / Selection Fee States
  const [interviewCrackFee, setInterviewCrackFee] = useState('');
  const [interviewFeeStage, setInterviewFeeStage] = useState('After Clearing Interview');
  const [interviewFeeDetails, setInterviewFeeDetails] = useState('');
  const [ficTrainingPeriod, setFicTrainingPeriod] = useState('');

  const [openings, setOpenings] = useState('');
  const [description, setDescription] = useState('');
  const [lastDate, setLastDate] = useState('');
  const [status, setStatus] = useState('Active');

  const [responsibilities, setResponsibilities] = useState(['']);
  const [requirements, setRequirements] = useState(['']);
  const [skills, setSkills] = useState('');
  const [documentsRequired, setDocumentsRequired] = useState(['Resume']);
  const [interviewSteps, setInterviewSteps] = useState([
    { stepNumber: 1, title: '', description: '' }
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (jobToEdit) {
      setCompanyId(jobToEdit.companyId || '');
      setCategoryId(jobToEdit.categoryId || '');
      setTitle(jobToEdit.title || '');
      setProgramName(jobToEdit.programName || '');
      setJobType(jobToEdit.jobType || 'Full Time');
      setLocation(jobToEdit.location || '');
      setExperience(jobToEdit.experience || '');
      setQualification(jobToEdit.qualification || '');
      setSalary(jobToEdit.salary || '');
      setTrainingPeriod(jobToEdit.trainingPeriod || '');
      setTrainingFee(jobToEdit.trainingFee || '');
      setFeeRefundType(jobToEdit.feeRefundType || '100% Refundable');
      setFeeRefundDetails(jobToEdit.feeRefundDetails || '');
      setTrainingTitle(jobToEdit.trainingTitle || '');
      setTrainingSubtext(jobToEdit.trainingSubtext || '');
      setStipendTitle(jobToEdit.stipendTitle || '');
      setStipendSubtext(jobToEdit.stipendSubtext || '');
      setInterviewCrackFee(jobToEdit.interviewCrackFee || '');
      setInterviewFeeStage(jobToEdit.interviewFeeStage || 'After Clearing Interview');
      setInterviewFeeDetails(jobToEdit.interviewFeeDetails || '');
      setFicTrainingPeriod(jobToEdit.ficTrainingPeriod || '');
      
      if (jobToEdit.trainingPhases && jobToEdit.trainingPhases.length > 0) {
        setHasTraining(jobToEdit.hasTraining !== undefined ? jobToEdit.hasTraining : 'Yes');
        setTrainingPhases(jobToEdit.trainingPhases);
      } else if (jobToEdit.trainingDetails) {
        setHasTraining(jobToEdit.trainingDetails.hasTraining || 'Yes');
        setTrainingPhases([{
          duration: jobToEdit.trainingDetails.durationVal || '',
          mode: jobToEdit.trainingDetails.mode || '',
          stipend: jobToEdit.trainingDetails.stipend || ''
        }]);
      } else {
        setHasTraining(jobToEdit.trainingPeriod && jobToEdit.trainingPeriod.toLowerCase().includes('no') ? 'No' : 'Yes');
        setTrainingPhases([{
          duration: jobToEdit.trainingPeriod || '',
          mode: '',
          stipend: ''
        }]);
      }

      setOpenings(jobToEdit.openings || '');
      setDescription(jobToEdit.description || '');
      setLastDate(jobToEdit.lastDate || '');
      setStatus(jobToEdit.status || 'Active');
      setResponsibilities(jobToEdit.responsibilities && jobToEdit.responsibilities.length > 0 ? jobToEdit.responsibilities : ['']);
      setRequirements(jobToEdit.requirements && jobToEdit.requirements.length > 0 ? jobToEdit.requirements : ['']);
      setSkills(jobToEdit.skills ? jobToEdit.skills.join(', ') : '');
      setDocumentsRequired(jobToEdit.documentsRequired && jobToEdit.documentsRequired.length > 0 ? jobToEdit.documentsRequired : ['Resume']);
      setInterviewSteps(jobToEdit.interviewSteps && jobToEdit.interviewSteps.length > 0 ? jobToEdit.interviewSteps : [{ stepNumber: 1, title: '', description: '' }]);
    } else {
      if (categories.length > 0) setCategoryId(categories[0].id);
      if (companies.length > 0) setCompanyId(companies[0].id);
      setTitle('');
      setProgramName('');
      setJobType('Full Time');
      setLocation('');
      setExperience('');
      setQualification('');
      setSalary('');
      setTrainingPeriod('');
      setTrainingFee('');
      setFeeRefundType('100% Refundable');
      setFeeRefundDetails('');
      setTrainingTitle('');
      setTrainingSubtext('');
      setStipendTitle('');
      setStipendSubtext('');
      setInterviewCrackFee('');
      setInterviewFeeStage('After Clearing Interview');
      setInterviewFeeDetails('');
      setFicTrainingPeriod('');
      
      setHasTraining('Yes');
      setTrainingPhases([{ duration: '', mode: '', stipend: '' }]);

      setOpenings('');
      setDescription('');
      setLastDate('');
      setStatus('Active');
      setResponsibilities(['']);
      setRequirements(['']);
      setSkills('');
      setDocumentsRequired(['Resume']);
      setInterviewSteps([{ stepNumber: 1, title: '', description: '' }]);
    }
  }, [jobToEdit, categories, companies, isOpen]);

  if (!isOpen) return null;

  const handleAddTrainingPhase = () => {
    setTrainingPhases([...trainingPhases, { duration: '', mode: '', stipend: '' }]);
  };
  const handleRemoveTrainingPhase = (index) => {
    setTrainingPhases(trainingPhases.filter((_, i) => i !== index));
  };

  const handleAddResponsibility = () => setResponsibilities([...responsibilities, '']);
  const handleRemoveResponsibility = (idx) => setResponsibilities(responsibilities.filter((_, i) => i !== idx));

  const handleAddRequirement = () => setRequirements([...requirements, '']);
  const handleRemoveRequirement = (idx) => setRequirements(requirements.filter((_, i) => i !== idx));

  const handleAddDocument = () => setDocumentsRequired([...documentsRequired, '']);
  const handleRemoveDocument = (idx) => setDocumentsRequired(documentsRequired.filter((_, i) => i !== idx));

  const handleAddInterviewStep = () => {
    setInterviewSteps([
      ...interviewSteps,
      { stepNumber: interviewSteps.length + 1, title: '', description: '' }
    ]);
  };
  const handleRemoveInterviewStep = (idx) => {
    setInterviewSteps(interviewSteps.filter((_, i) => i !== idx).map((step, i) => ({ ...step, stepNumber: i + 1 })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const validPhases = trainingPhases.filter(p => p.duration.trim() !== '' || p.mode.trim() !== '' || p.stipend.trim() !== '');

      const formattedTrainingPeriod = hasTraining === 'Yes' && validPhases.length > 0
        ? validPhases.map((p, idx) => `${validPhases.length > 1 ? `Phase ${idx + 1}: ` : ''}${p.duration || ''}${p.mode ? ` (${p.mode})` : ''}${p.stipend ? ` - ${p.stipend}` : ''}`.trim()).join(' | ')
        : 'No Training Required (Direct Joining)';

      const payload = {
        companyId,
        categoryId,
        title,
        programName,
        jobType,
        location,
        experience,
        qualification,
        salary,
        trainingPeriod: formattedTrainingPeriod,
        trainingFee,
        feeRefundType,
        feeRefundDetails,
        trainingTitle,
        trainingSubtext,
        stipendTitle,
        stipendSubtext,
        interviewCrackFee,
        interviewFeeStage,
        interviewFeeDetails,
        ficTrainingPeriod,
        trainingPhases: validPhases,
        hasTraining,
        openings: Number(openings),
        description,
        responsibilities: responsibilities.filter(r => r.trim() !== ''),
        requirements: requirements.filter(r => r.trim() !== ''),
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        interviewSteps: interviewSteps.filter(s => s.title.trim() !== ''),
        documentsRequired: documentsRequired.filter(d => d.trim() !== ''),
        lastDate,
        status
      };

      const url = jobToEdit ? `${API_URL}/api/jobs/${jobToEdit.id}` : `${API_URL}/api/jobs`;
      const method = jobToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save job opening');

      if (onSaveSuccess) onSaveSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '840px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>
            {jobToEdit ? 'Edit Job Opening' : 'Create New Job Opening'}
          </h3>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Company *</label>
                <select className="form-select" value={companyId} onChange={e => setCompanyId(e.target.value)} required>
                  <option value="">Select Company</option>
                  {companies
                    .filter(comp => !categoryId || comp.categoryId === categoryId)
                    .map(comp => (
                      <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Branch Relationship Officer"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Program Name (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mahindra Finance Prarambh Program"
                  value={programName}
                  onChange={e => setProgramName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select className="form-select" value={jobType} onChange={e => setJobType(e.target.value)}>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Interview Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Chennai / Bangalore"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Experience Required</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="0 - 2 Years"
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Qualification Required</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Any Degree / B.Com"
                  value={qualification}
                  onChange={e => setQualification(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Salary Range</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="₹2,50,000 - ₹3,60,000 P.A."
                  value={salary}
                  onChange={e => setSalary(e.target.value)}
                />
              </div>
            </div>

            {/* Structured Multi-Phase Training Period Section */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                  🎓 Training Period & Program Structure
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    className="form-select"
                    style={{ width: 'auto', padding: '5px 12px', fontSize: '0.85rem', fontWeight: 600, borderColor: '#bfdbfe', background: '#eff6ff', color: '#1d4ed8' }}
                    value={hasTraining}
                    onChange={e => setHasTraining(e.target.value)}
                  >
                    <option value="Yes">Yes - Training Provided</option>
                    <option value="No">No - Direct Joining (No Training)</option>
                  </select>
                  {hasTraining === 'Yes' && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleAddTrainingPhase}
                      style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={14} /> Add Training Phase
                    </button>
                  )}
                </div>
              </div>

              {hasTraining === 'Yes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* CARD 1: Training Fee & Fee Refund Policy Box */}
                  <div style={{
                    background: '#ffffff',
                    border: '1.5px solid #93c5fd',
                    borderRadius: '10px',
                    padding: '1rem',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#1e40af', background: '#dbeafe', padding: '3px 10px', borderRadius: '6px' }}>
                        💳 CARD 1: Course / Training Fee & Refund Policy
                      </span>
                    </div>

                    <div className="form-row" style={{ margin: 0, marginBottom: '0.75rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.825rem', color: '#1e293b', fontWeight: 700 }}>
                          Training Fee / Course Charges
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. ₹25,000 / Free / Fully Sponsored"
                          value={trainingFee}
                          onChange={e => setTrainingFee(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.825rem', color: '#1e293b', fontWeight: 700 }}>
                          Fee Refund Policy / Type
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          list="fee-refund-policy-list"
                          placeholder="Type manually or select (e.g. 100% Refundable / Refunded Post Probation)"
                          value={feeRefundType}
                          onChange={e => setFeeRefundType(e.target.value)}
                        />
                        <datalist id="fee-refund-policy-list">
                          <option value="100% Refundable" />
                          <option value="50% Refundable" />
                          <option value="Refunded Post-Probation" />
                          <option value="Salary Deduction (No Upfront Fee)" />
                          <option value="Fully Sponsored by Bank / Company" />
                          <option value="Non-Refundable" />
                        </datalist>
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.825rem', color: '#1e293b', fontWeight: 700 }}>
                        Terms & Conditions
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 100% Fee refunded in 3 monthly installments after completing 6 months of continuous employment"
                        value={feeRefundDetails}
                        onChange={e => setFeeRefundDetails(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* CARD 2: Multi-Phase Training Breakdown */}
                  <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#1e40af', background: '#eff6ff', padding: '4px 10px', borderRadius: '6px', width: 'fit-content', border: '1px solid #bfdbfe' }}>
                    📅 CARD 2: Training Period Phase Breakdown
                  </div>

                  {trainingPhases.map((phase, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        padding: '1rem',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                          Training Phase #{idx + 1}
                        </span>
                        {trainingPhases.length > 1 && (
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => handleRemoveTrainingPhase(idx)}
                            title="Remove Phase"
                          >
                            <Trash2 size={16} color="#ef4444" />
                          </button>
                        )}
                      </div>

                      <div className="form-row" style={{ margin: 0 }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.825rem', color: '#475569' }}>Training Duration</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. 15 Days / 1 Month"
                            value={phase.duration}
                            onChange={e => {
                              const next = [...trainingPhases];
                              next[idx].duration = e.target.value;
                              setTrainingPhases(next);
                            }}
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.825rem', color: '#475569' }}>Training Mode / Format</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Classroom / OJT / Hybrid"
                            value={phase.mode}
                            onChange={e => {
                              const next = [...trainingPhases];
                              next[idx].mode = e.target.value;
                              setTrainingPhases(next);
                            }}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.825rem', color: '#475569' }}>Stipend / Salary During Training</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Full Salary Provided / ₹10,000 Stipend / Unpaid"
                          value={phase.stipend}
                          onChange={e => {
                            const next = [...trainingPhases];
                            next[idx].stipend = e.target.value;
                            setTrainingPhases(next);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CARD CUSTOMIZATION FOR CANDIDATE POSTER (Clock & Stipend Cards) */}
            <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '12px', border: '1.5px solid #86efac', marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#166534', fontSize: '0.95rem', marginBottom: '0.75rem', display: 'block' }}>
                📊 Candidate Infographic Card Customize (Clock & Stipend Cards)
              </label>
              
              <div className="form-row" style={{ marginBottom: '0.85rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.825rem', color: '#166534', fontWeight: 700 }}>
                    ⏱️ Training Card Main Value / Title (Clock Icon)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 12 Months or 3 Months"
                    value={trainingTitle}
                    onChange={e => setTrainingTitle(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.825rem', color: '#166534', fontWeight: 700 }}>
                    ⏱️ Training Card Subtext Lines
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Use | for line breaks e.g. 4 months Campus Training | 3 months Internship | 5 Months On the job Training"
                    value={trainingSubtext}
                    onChange={e => setTrainingSubtext(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row" style={{ margin: 0 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.825rem', color: '#166534', fontWeight: 700 }}>
                    💵 Stipend Card Title / Main Value
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. STIPEND or 6,000 or ₹6,000 / month"
                    value={stipendTitle}
                    onChange={e => setStipendTitle(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.825rem', color: '#166534', fontWeight: 700 }}>
                    💵 Stipend Card Subtext Lines
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Use | for line breaks e.g. ₹6,000 during Training"
                    value={stipendSubtext}
                    onChange={e => setStipendSubtext(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Number of Openings</label>
                <input
                  type="number"
                  className="form-input"
                  value={openings}
                  onChange={e => setOpenings(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Application Last Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={lastDate}
                  onChange={e => setLastDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Publishing Status</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Active">Active (Visible on Candidate Portal)</option>
                <option value="Draft">Draft</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Job Description</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Overview of the job role..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>Roles and Responsibilities</label>
                <button type="button" className="btn-secondary" onClick={handleAddResponsibility} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                  <Plus size={14} /> Add Line
                </button>
              </div>
              {responsibilities.map((resp, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Responsibility #${idx + 1}`}
                    value={resp}
                    onChange={e => {
                      const next = [...responsibilities];
                      next[idx] = e.target.value;
                      setResponsibilities(next);
                    }}
                  />
                  {responsibilities.length > 1 && (
                    <button type="button" className="btn-close" onClick={() => handleRemoveResponsibility(idx)}>
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>Requirements & Eligibility</label>
                <button type="button" className="btn-secondary" onClick={handleAddRequirement} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                  <Plus size={14} /> Add Requirement
                </button>
              </div>
              {requirements.map((req, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Requirement #${idx + 1}`}
                    value={req}
                    onChange={e => {
                      const next = [...requirements];
                      next[idx] = e.target.value;
                      setRequirements(next);
                    }}
                  />
                  {requirements.length > 1 && (
                    <button type="button" className="btn-close" onClick={() => handleRemoveRequirement(idx)}>
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Skills (Comma Separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Communication, Sales, Customer Service, MS Office"
                value={skills}
                onChange={e => setSkills(e.target.value)}
              />
            </div>

            {/* STRUCTURED INTERVIEW PROCESS & SELECTION CRACK FEE SECTION */}
            <div style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                  🎯 Interview Process & Selection Guidelines
                </label>
                <button type="button" className="btn-secondary" onClick={handleAddInterviewStep} style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add Step
                </button>
              </div>

              {/* CARD 1: INTERVIEW SELECTION BOX */}
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #a855f7',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1rem',
                boxShadow: '0 2px 8px rgba(168, 85, 247, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#6b21a8', background: '#f3e8ff', padding: '3px 10px', borderRadius: '6px' }}>
                    🏆 CARD 1: FIC Training Fee Details & Guidelines
                  </span>
                </div>

                <div className="form-row" style={{ margin: 0, marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.825rem', color: '#1e293b', fontWeight: 700 }}>
                      FIC Training Fee
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 30,000 / No Fee (100% Free Selection)"
                      value={interviewCrackFee}
                      onChange={e => setInterviewCrackFee(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.825rem', color: '#1e293b', fontWeight: 700 }}>
                      FIC Training Period
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 45 Days / 1-4 Months"
                      value={ficTrainingPeriod}
                      onChange={e => setFicTrainingPeriod(e.target.value)}
                    />
                  </div>
                </div>

              </div>

              {/* CARD 2: VERTICAL STEPPER INTERVIEW ROUNDS */}
              <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#6b21a8', background: '#f3e8ff', padding: '4px 10px', borderRadius: '6px', width: 'fit-content', border: '1px solid #d8b4fe', marginBottom: '0.75rem' }}>
                🪜 CARD 2: Sequential Interview Process Steps
              </div>

              {interviewSteps.map((step, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 32px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
                    #{idx + 1}
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Step Title (e.g., HR Screening)"
                    value={step.title}
                    onChange={e => {
                      const next = [...interviewSteps];
                      next[idx].title = e.target.value;
                      setInterviewSteps(next);
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Description / Instructions"
                    value={step.description}
                    onChange={e => {
                      const next = [...interviewSteps];
                      next[idx].description = e.target.value;
                      setInterviewSteps(next);
                    }}
                  />
                  {interviewSteps.length > 1 && (
                    <button type="button" className="btn-close" onClick={() => handleRemoveInterviewStep(idx)}>
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>Original Document Required For Interview</label>
                <button type="button" className="btn-secondary" onClick={handleAddDocument} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                  <Plus size={14} /> Add Doc
                </button>
              </div>
              {documentsRequired.map((doc, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Document Name (e.g., Resume, Aadhaar Card)"
                    value={doc}
                    onChange={e => {
                      const next = [...documentsRequired];
                      next[idx] = e.target.value;
                      setDocumentsRequired(next);
                    }}
                  />
                  {documentsRequired.length > 1 && (
                    <button type="button" className="btn-close" onClick={() => handleRemoveDocument(idx)}>
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving Job...' : 'Save Job Opening'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
