import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

export default function ScheduleInterviewModal({ isOpen, onClose, application, API_URL, onScheduledSuccess }) {
  const [round, setRound] = useState('HR Screening');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState('Online');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [interviewer, setInterviewer] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !application) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        applicationId: application.id,
        candidateId: application.candidateId,
        jobId: application.jobId,
        companyId: application.companyId,
        round,
        date,
        time,
        mode,
        location: mode === 'Offline' ? location : '',
        meetingLink: mode === 'Online' ? meetingLink : '',
        interviewer,
        notes
      };

      const res = await fetch(`${API_URL}/api/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule interview');

      if (onScheduledSuccess) onScheduledSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Schedule Interview Round</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Candidate: <strong>{application.candidateName}</strong> ({application.jobTitle})
            </p>
          </div>
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
            <div className="form-group">
              <label className="form-label">Interview Round / Stage *</label>
              <select className="form-select" value={round} onChange={e => setRound(e.target.value)}>
                <option value="HR Screening">HR Screening</option>
                <option value="Telephonic Interview">Telephonic Interview</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="Branch Manager Round">Branch Manager Round</option>
                <option value="Final Offer Discussion">Final Offer Discussion</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Time *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="11:00 AM"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Interview Mode</label>
              <select className="form-select" value={mode} onChange={e => setMode(e.target.value)}>
                <option value="Online">Online Video Call</option>
                <option value="Offline">Offline / In-Person</option>
              </select>
            </div>

            {mode === 'Online' ? (
              <div className="form-group">
                <label className="form-label">Meeting Link (Google Meet / Zoom / Teams)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://meet.google.com/..."
                  value={meetingLink}
                  onChange={e => setMeetingLink(e.target.value)}
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Interview Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Axis Bank Branch, Mount Road, Chennai"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Interviewer Name / Panel</label>
              <input
                type="text"
                className="form-input"
                placeholder="Mr. Suresh Kumar (Branch Head)"
                value={interviewer}
                onChange={e => setInterviewer(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes for Candidate</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="What to bring or prepare for..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                <Send size={16} /> {submitting ? 'Scheduling...' : 'Schedule & Notify Candidate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
