import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';

export default function ApplicationModal({ job, candidate, isOpen, onClose, onSubmitSuccess, API_URL }) {
  const [activeJob, setActiveJob] = useState(job);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverNotes, setCoverNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successApp, setSuccessApp] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    setActiveJob(job);
  }, [job]);

  const effectiveJob = activeJob || job;
  const isInternship = effectiveJob?.title?.toLowerCase().includes('free') || effectiveJob?.title?.toLowerCase().includes('internship') || effectiveJob?.companyName?.toLowerCase().includes('free') || effectiveJob?.companyName?.toLowerCase().includes('internship');
  const isCasaProcess = effectiveJob?.title?.toLowerCase().includes('casa') || effectiveJob?.programName?.toLowerCase().includes('casa') || effectiveJob?.role?.toLowerCase().includes('casa') || effectiveJob?.description?.toLowerCase().includes('casa process');
  const feeAmount = isCasaProcess ? 149 : (effectiveJob?.isFicFlow && !isInternship ? 1499 : 49);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setName(candidate?.name || '');
      setEmail(candidate?.email || '');
      setMobile(candidate?.mobile || '');
      setLocation(candidate?.location || '');
      setQualification(candidate?.qualification || '');
      setExperience(candidate?.experience || '');
      setResumeUrl(candidate?.resumeUrl || '');
      setCoverNotes('');
      setError('');
      setSuccessApp(null);
      setShowPayment(false);
    }
  }, [isOpen, candidate]);

  const availableBranches = React.useMemo(() => {
    if (!job) return [];
    const combined = `${job.description || ''}\n${job.location || ''}`;
    const parenRegex = /([A-Za-z\s]+?)\s*\(([^)]+)\)/g;
    let match;
    const list = [];
    while ((match = parenRegex.exec(combined)) !== null) {
      const branches = match[2].split(/[,/|•\n]+/).map(b => b.trim()).filter(Boolean);
      list.push(...branches);
    }
    return [...new Set(list)];
  }, [job]);

  if (!isOpen || !job) return null;

  if (job?.status && job.status.toLowerCase() === 'hold on') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content animate-fade" style={{ maxWidth: '440px', textAlign: 'center', padding: '2rem 1.5rem', borderRadius: '16px' }} onClick={e => e.stopPropagation()}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', fontSize: '1.8rem', border: '2px solid #fde68a' }}>
            ⏸️
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Job Currently On Hold</h3>
          <p style={{ color: '#64748b', fontSize: '0.925rem', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
            Vacancies for <strong>{job.title}</strong> at {job.companyName} are temporarily paused.
          </p>
          <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', color: '#b45309', padding: '12px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            This job is currently hold on
          </div>
          <button
            className="btn-primary"
            onClick={onClose}
            style={{ width: '100%', padding: '11px', fontWeight: 700, borderRadius: '8px' }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!showPayment) {
      setShowPayment(true);
      return;
    }
  };

  const handleRazorpayPayment = async () => {
    setSubmitting(true);
    setError('');

    try {
      // 0. Pre-save Application as Payment Pending
      let pendingApp;
      try {
        pendingApp = await submitApplicationToDb('PENDING_' + Date.now(), 'Payment Pending', true);
      } catch (err) {
        throw new Error(err.message || 'Failed to initialize application.');
      }

      // 1. Create order on server
      const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: feeAmount })
      });
      const orderData = await orderRes.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: "INR",
        name: "FIC RecruitPro",
        description: `Application Fee - ${effectiveJob?.title || job?.title}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          // 3. Payment Success - Update Application Status
          try {
             setSubmitting(true);
             const updateRes = await fetch(`${API_URL}/api/applications/${pendingApp.id || pendingApp._id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Applied', paymentId: response.razorpay_payment_id })
             });
             const updatedData = await updateRes.json();
             if (!updateRes.ok) throw new Error(updatedData.error || 'Failed to update status');
             
             setSuccessApp(updatedData);
             if (onSubmitSuccess) onSubmitSuccess(updatedData);
          } catch(err) {
             setError('Payment succeeded but failed to update status. Please contact support.');
          } finally {
             setSubmitting(false);
          }
        },
        prefill: {
          name: name,
          email: email,
          contact: mobile
        },
        theme: {
          color: "#2563eb"
        },
        modal: {
          ondismiss: function() {
            setSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(response.error.description || 'Payment Failed');
        setSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const submitApplicationToDb = async (paymentId, status = 'Applied', isPending = false) => {

    try {
      const payload = {
        candidateId: candidate ? candidate.candidateId || candidate.id : null,
        jobId: effectiveJob ? effectiveJob.id : job.id,
        resumeUrl,
        coverNotes,
        status,
        paymentId: paymentId || 'FREE_TEST_' + Date.now(),
        paymentAmount: feeAmount,
        processName: effectiveJob?.processName || null,
        candidateDetails: {
          userId: candidate ? candidate.id : null,
          name,
          email,
          mobile,
          location,
          qualification,
          experience
        },
        referredBy: (
          localStorage.getItem('hr_referral') ||
          sessionStorage.getItem('hr_referral') ||
          (window.location.href.match(/[?&]ref=([A-Za-z0-9-]+)/i) ? window.location.href.match(/[?&]ref=([A-Za-z0-9-]+)/i)[1].toUpperCase() : null)
        )
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

      if (!isPending) {
        setSuccessApp(data);
        if (onSubmitSuccess) onSubmitSuccess(data);
      }
      return data;
    } catch (err) {
      if (!isPending) setError(err.message);
      throw err;
    } finally {
      if (!isPending) setSubmitting(false);
    }
  };


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          color: 'white',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          padding: '1.5rem',
          borderBottom: 'none'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.35rem', color: 'white', fontWeight: 'bold', margin: 0 }}>
                Apply for {effectiveJob?.rawRole || (effectiveJob?.title || '').replace(/\s*\(PROCESS\s*\d+\)/i, '')}
              </h3>
              {effectiveJob?.processName && (
                <span style={{
                  background: 'linear-gradient(135deg, #fef08a 0%, #facc15 100%)',
                  color: '#713f12',
                  padding: '3px 12px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.18)'
                }}>
                  ✨ {effectiveJob.processName.toUpperCase()}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.9rem', color: '#e0e7ff', marginTop: '4px' }}>{effectiveJob?.companyName || job.companyName} • {effectiveJob?.location || job.location}</p>
          </div>
          <button className="btn-close" onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '50%', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem' }}>
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
          ) : showPayment ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Application Fee Payment</h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
                Please pay the application fee of <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>₹{feeAmount}</strong> securely via Razorpay to complete your submission.
              </p>
              
              {error && (
                <div style={{
                  background: '#fef2f2', color: '#dc2626', padding: '10px 14px',
                  borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid #fecaca'
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '1rem', paddingBottom: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowPayment(false)} disabled={submitting} style={{ padding: '12px 24px', fontSize: '1rem' }}>
                  Back
                </button>
                <button type="button" className="btn-primary" onClick={handleRazorpayPayment} disabled={submitting} style={{ padding: '12px 24px', fontSize: '1rem' }}>
                  {submitting ? 'Processing...' : `Pay ₹${feeAmount} via Razorpay`}
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

              <div className="form-group" style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '1rem' }}>
                <label className="form-label" style={{ color: '#1e3a8a', fontWeight: 'bold' }}>Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ border: '1px solid #bfdbfe', background: '#fff' }}
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ background: '#ecfdf5', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #10b981', margin: 0 }}>
                  <label className="form-label" style={{ color: '#064e3b', fontWeight: 'bold' }}>Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    style={{ border: '1px solid #a7f3d0', background: '#fff' }}
                    required
                    pattern="[0-9]{10}"
                    maxLength="10"
                    title="Mobile number must be exactly 10 digits"
                    placeholder="e.g. 9876543210"
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div className="form-group" style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #f59e0b', margin: 0 }}>
                  <label className="form-label" style={{ color: '#78350f', fontWeight: 'bold' }}>Date of Birth *</label>
                  <input
                    type="date"
                    className="form-input"
                    style={{ border: '1px solid #fde68a', background: '#fff' }}
                    required
                    max={maxDate}
                    title="You must be at least 18 years old"
                    value={qualification}
                    onChange={e => setQualification(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ background: '#f3e8ff', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #a855f7', margin: 0 }}>
                  <label className="form-label" style={{ color: '#581c87', fontWeight: 'bold' }}>
                    {availableBranches.length > 0 ? 'City / Preferred Branch *' : 'City *'}
                  </label>
                  <input
                    type="text"
                    list="available-branch-list"
                    className="form-input"
                    style={{ border: '1px solid #e9d5ff', background: '#fff' }}
                    required
                    placeholder={availableBranches.length > 0 ? 'Select or type branch (e.g. Salem, Madurai...)' : 'e.g. Chennai'}
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                  {availableBranches.length > 0 && (
                    <datalist id="available-branch-list">
                      {availableBranches.map((b, idx) => (
                        <option key={idx} value={b} />
                      ))}
                    </datalist>
                  )}
                </div>
                <div className="form-group" style={{ background: '#fdf2f8', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ec4899', margin: 0 }}>
                  <label className="form-label" style={{ color: '#831843', fontWeight: 'bold' }}>Experience *</label>
                  <select
                    className="form-input"
                    style={{ border: '1px solid #fbcfe8', background: '#fff' }}
                    required
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                  >
                    <option value="">Select Experience</option>
                    <option value="Fresher">Fresher</option>
                    <option value="Experienced">Experienced</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ background: '#fff7ed', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #f97316', marginBottom: '1rem' }}>
                <label className="form-label" style={{ color: '#7c2d12', fontWeight: 'bold' }}>Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  style={{ border: '1px solid #ffedd5', background: '#fff' }}
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Send size={16} /> Continue to Payment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
