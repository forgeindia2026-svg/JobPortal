import React, { useState } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';

export default function ApplicationModal({ job, candidate, isOpen, onClose, onSubmitSuccess, API_URL }) {
  const [name, setName] = useState(candidate ? candidate.name : '');
  const [email, setEmail] = useState(candidate ? candidate.email : '');
  const [mobile, setMobile] = useState(candidate ? candidate.mobile : '');
  const [location, setLocation] = useState(candidate ? candidate.location : '');
  const [qualification, setQualification] = useState(candidate ? candidate.qualification : '');
  const [experience, setExperience] = useState(candidate ? candidate.experience : '');
  const [resumeUrl, setResumeUrl] = useState(candidate ? candidate.resumeUrl || '' : '');
  const [coverNotes, setCoverNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successApp, setSuccessApp] = useState(null);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        candidateId: candidate ? candidate.candidateId || candidate.id : null,
        jobId: job.id,
        resumeUrl,
        coverNotes,
        candidateDetails: {
          userId: candidate ? candidate.id : null,
          name,
          email,
          mobile,
          location,
          qualification,
          experience
        }
      };

      const res = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setSuccessApp(data);
      if (onSubmitSuccess) onSubmitSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Apply for {job.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{job.companyName} • {job.location}</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {successApp ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5',
                color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
              }}>
                <CheckCircle size={36} />
              </div>
              <h3 style={{ fontSize: '1.35rem', color: '#0f172a', marginBottom: '8px' }}>Application Submitted!</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1rem' }}>
                Your application has been received successfully by {job.companyName}.
              </p>
              <div style={{
                background: '#f8fafc', padding: '12px 18px', borderRadius: '8px',
                display: 'inline-block', fontWeight: 700, color: '#2563eb', border: '1px solid #bfdbfe'
              }}>
                Application Number: {successApp.applicationNumber}
              </div>
              <div style={{ marginTop: '2rem' }}>
                <button className="btn-primary" onClick={onClose} style={{ padding: '10px 24px' }}>
                  Back to Job Listings
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  background: '#fef2f2', color: '#dc2626', padding: '10px 14px',
                  borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #fecaca'
                }}>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Location / City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience</label>
                  <input
                    type="text"
                    className="form-input"
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Qualification</label>
                <input
                  type="text"
                  className="form-input"
                  value={qualification}
                  onChange={e => setQualification(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resume Link / Attachment URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={resumeUrl}
                  onChange={e => setResumeUrl(e.target.value)}
                  placeholder="/uploads/my_resume.pdf or Google Drive link"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Comments / Cover Note (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Briefly state why you are a great fit for this role..."
                  value={coverNotes}
                  onChange={e => setCoverNotes(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <Send size={16} /> {submitting ? 'Submitting Application...' : 'Confirm & Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
