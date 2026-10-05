import React, { useState, useEffect } from 'react';
import { X, Send, UserPlus, Briefcase, User, Calendar, CreditCard, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ManualApplicationModal({
  isOpen,
  onClose,
  jobs = [],
  itProcesses = [],
  hrs = [],
  API_URL,
  onSuccess
}) {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [location, setLocation] = useState('Chennai');
  const [experience, setExperience] = useState('Fresher');
  const [resumeUrl, setResumeUrl] = useState('');
  
  const [referredBy, setReferredBy] = useState('');
  const [status, setStatus] = useState('Applied');
  const [appliedDate, setAppliedDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [paymentAmount, setPaymentAmount] = useState(49);
  const [paymentId, setPaymentId] = useState('');
  const [adminNotes, setAdminNotes] = useState('Manually registered by Super Admin');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Combine regular jobs and IT training processes
  const allJobOptions = [
    ...jobs.map(j => ({
      id: j.id,
      title: j.title,
      company: j.companyName || 'Unknown Company',
      location: j.location || 'Tamil Nadu',
      salary: j.salary || 'Best in Industry',
      type: 'Job Opening',
      isCasa: (j.title || '').toLowerCase().includes('casa'),
      isFree: (j.title || '').toLowerCase().includes('free') || (j.title || '').toLowerCase().includes('internship') || (j.companyName || '').toLowerCase().includes('free'),
      isFic: !!j.isFicFlow
    })),
    ...itProcesses.map(p => ({
      id: p.id,
      title: p.role || p.programTitle || 'IT Program',
      company: p.itCategory === 'Course' ? 'FIC IT Courses' : p.itCategory === 'Internship' ? 'FIC Free IT Internship' : 'FIC IT Training & Placement',
      location: p.location || 'PAN INDIA',
      salary: p.stipend || 'Stipend / Placement',
      type: 'IT Program',
      isCasa: false,
      isFree: p.itCategory === 'Internship',
      isFic: p.itCategory === 'Placement'
    }))
  ];

  // Auto-calculate fee amount when job changes
  useEffect(() => {
    if (!selectedJobId) return;
    const selected = allJobOptions.find(j => j.id === selectedJobId);
    if (!selected) return;

    if (selected.isCasa) {
      setPaymentAmount(149);
    } else if (selected.isFree) {
      setPaymentAmount(0);
    } else if (selected.isFic) {
      setPaymentAmount(1499);
    } else {
      setPaymentAmount(49);
    }

    if (!paymentId) {
      setPaymentId(`MANUAL_ADM_${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [selectedJobId]);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setError('');
      if (allJobOptions.length > 0 && !selectedJobId) {
        setSelectedJobId(allJobOptions[0].id);
      }
      setPaymentId(`MANUAL_ADM_${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedJob = allJobOptions.find(j => j.id === selectedJobId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedJobId) {
      setError('Please select a job opening or program.');
      return;
    }
    if (!name.trim()) {
      setError('Candidate Name is required.');
      return;
    }
    if (!mobile.trim() || mobile.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        jobId: selectedJobId,
        isAdminManual: true,
        candidateDetails: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          mobile: mobile.trim(),
          location: location.trim(),
          qualification: dob ? dob : 'Not Specified', // Saved into qualification which maps to DOB display
          experience: experience,
          resumeUrl: resumeUrl.trim()
        },
        resumeUrl: resumeUrl.trim(),
        referredBy: referredBy || null,
        status: status,
        appliedAt: appliedDate ? new Date(appliedDate).toISOString() : new Date().toISOString(),
        paymentId: paymentId || `MANUAL_ADMIN_${Date.now()}`,
        paymentAmount: Number(paymentAmount) || 0,
        adminNotes: adminNotes ? `[Admin Entry] ${adminNotes}` : 'Manually added by Admin'
      };

      const res = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to manually add application');
      }

      if (onSuccess) {
        onSuccess(data);
      }
      onClose();
    } catch (err) {
      console.error('Error adding manual application:', err);
      setError(err.message || 'Network error occurred while saving application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        style={{ maxWidth: '780px', maxHeight: '92vh', borderRadius: '16px', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: 'white',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid #3b82f6'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
              }}
            >
              <UserPlus size={22} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  Manual Job Application Entry
                </h3>
                <span
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    border: '1px solid rgba(239, 68, 68, 0.4)'
                  }}
                >
                  Admin Only
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Directly add walk-in, offline, or direct candidate applications to the recruitment pipeline.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-close"
            style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.08)', borderRadius: '50%', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="modal-body" style={{ padding: '1.5rem', background: '#fdfbf7', maxHeight: 'calc(92vh - 120px)', overflowY: 'auto' }}>
          {error && (
            <div
              style={{
                background: '#fef2f2',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
                border: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Section 1: Select Target Job */}
            <div style={{ background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Briefcase size={18} color="#2563eb" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  1. Target Job Opening / Program *
                </h4>
              </div>

              <div className="form-group" style={{ marginBottom: '8px' }}>
                <select
                  className="form-select"
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  required
                  style={{ fontWeight: 600, fontSize: '0.925rem', padding: '10px 12px' }}
                >
                  <option value="" disabled>-- Select Job Opening --</option>
                  <optgroup label="💼 Job Openings">
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.title} — {j.companyName || 'Company'} ({j.location || 'PAN Tamil Nadu'})
                      </option>
                    ))}
                  </optgroup>
                  {itProcesses.length > 0 && (
                    <optgroup label="🎓 IT Programs & Internships">
                      {itProcesses.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.role || p.programTitle} — {p.itCategory}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {selectedJob && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px', fontSize: '0.8rem', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#475569' }}>🏢 <strong>Company:</strong> {selectedJob.company}</span>
                  <span style={{ color: '#475569' }}>📍 <strong>Location:</strong> {selectedJob.location}</span>
                  <span style={{ color: '#047857' }}>💰 <strong>Salary/Stipend:</strong> {selectedJob.salary}</span>
                  <span style={{ color: '#2563eb' }}>🏷️ <strong>Default Fee:</strong> ₹{selectedJob.isCasa ? 149 : selectedJob.isFree ? 0 : selectedJob.isFic ? 1499 : 49}</span>
                </div>
              )}
            </div>

            {/* Section 2: Candidate Details */}
            <div style={{ background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <User size={18} color="#059669" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  2. Candidate Details *
                </h4>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 9876543210"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    maxLength={14}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="candidate@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth (DOB) *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City / Native Location *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Chennai, Coimbatore, Madurai"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience Level *</label>
                  <select
                    className="form-select"
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="0-6 Months">0 - 6 Months</option>
                    <option value="1 Year">1 Year</option>
                    <option value="2 Years">2 Years</option>
                    <option value="3+ Years">3+ Years</option>
                    <option value="5+ Years">5+ Years</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Resume / Document URL (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://drive.google.com/... or resume URL"
                  value={resumeUrl}
                  onChange={e => setResumeUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Section 3: HR Reference & Initial Status */}
            <div style={{ background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Calendar size={18} color="#7c3aed" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  3. HR Reference & Pipeline Status
                </h4>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">HR Reference Code</label>
                  <select
                    className="form-select"
                    value={referredBy}
                    onChange={e => setReferredBy(e.target.value)}
                  >
                    <option value="">Direct (No HR / Walk-in)</option>
                    {hrs.map(h => (
                      <option key={h.id} value={h.referralCode}>
                        👤 {h.name} ({h.referralCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Application Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                  >
                    <option value="Applied">Applied (Initial State)</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="HR Screening">HR Screening</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Application Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={appliedDate}
                  onChange={e => setAppliedDate(e.target.value)}
                />
              </div>
            </div>

            {/* Section 4: Payment Details */}
            <div style={{ background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <CreditCard size={18} color="#d97706" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  4. Payment & Administrative Fee
                </h4>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Payment Status</label>
                  <select
                    className="form-select"
                    value={paymentStatus}
                    onChange={e => {
                      setPaymentStatus(e.target.value);
                      if (e.target.value === 'Free') {
                        setPaymentAmount(0);
                      }
                    }}
                  >
                    <option value="Paid">Paid / Received (Online / Cash)</option>
                    <option value="Free">Free / Fee Waived (₹0)</option>
                    <option value="Offline">Offline / Cash Collection</option>
                    <option value="Pending">Payment Pending</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Amount (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Payment / Transaction Reference ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. MANUAL_ADM_123456 or UPI Ref"
                  value={paymentId}
                  onChange={e => setPaymentId(e.target.value)}
                />
              </div>
            </div>

            {/* Section 5: Admin Remarks */}
            <div style={{ background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FileText size={18} color="#475569" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  5. Admin Notes / Remarks
                </h4>
              </div>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Optional internal remarks about candidate or walk-in source..."
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
              />
            </div>

            {/* Submit Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={submitting}
                style={{ padding: '10px 20px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.35)'
                }}
              >
                <CheckCircle2 size={18} />
                {submitting ? 'Creating Application...' : 'Save & Add Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
