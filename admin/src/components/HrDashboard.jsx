import React, { useState, useEffect } from 'react';
import { Share2, Users, FileText, CheckCircle, Copy } from 'lucide-react';

export default function HrDashboard({ API_URL, currentUser }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // The unique link the HR can share
  // Assume the candidate portal is running on port 5173 locally, or production URL
  const candidatePortalBaseUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:5173' 
    : 'https://jobs.forgeindiaconnect.in';
    
  const referralLink = `${candidatePortalBaseUrl}?ref=${currentUser.referralCode}`;

  useEffect(() => {
    fetch(`${API_URL}/api/users/hr/${currentUser.referralCode}/dashboard`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [API_URL, currentUser]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Link copied to clipboard!');
  };

  const shareOnWhatsApp = () => {
    const text = `Hey! Check out these amazing job openings at Forge India Connect: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="admin-layout animate-fade" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="admin-main" style={{ marginLeft: 0, width: '100%' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Welcome, {currentUser.name}!</h2>
          <p style={{ color: '#64748b' }}>Here is your personal HR Dashboard.</p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', padding: '2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your Unique Referral Link</h3>
            <p style={{ color: '#e0e7ff', fontSize: '0.95rem' }}>Share this link with candidates. Anyone who applies using this link will be tracked under your account.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              readOnly 
              value={referralLink} 
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', color: '#0f172a', fontWeight: 'bold', minWidth: '250px' }}
            />
            <button className="btn-primary" onClick={copyToClipboard} style={{ background: '#10b981', border: 'none' }}>
              <Copy size={16} /> Copy
            </button>
            <button className="btn-primary" onClick={shareOnWhatsApp} style={{ background: '#25D366', border: 'none', color: 'white' }}>
              <Share2 size={16} /> WhatsApp
            </button>
          </div>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="kpi-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <Users size={22} />
            </div>
            <div>
              <div className="kpi-val">{stats ? stats.totalApplications : 0}</div>
              <div className="kpi-label">Total Candidates Referred</div>
            </div>
          </div>
        </div>

        <div className="section-header" style={{ marginTop: '2rem' }}>
          <h3 className="section-title">Your Candidates</h3>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Candidate Details</th>
                <th>Applied Job</th>
                <th>Status</th>
                <th>Date Applied</th>
              </tr>
            </thead>
            <tbody>
              {stats?.applications?.map(app => (
                <tr key={app.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#1e293b' }}>{app.candidateName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{app.candidateMobile} | {app.candidateEmail}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{app.jobTitle} <br/> <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.companyName}</span></td>
                  <td>
                    <span className="badge badge-active">{app.status}</span>
                  </td>
                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {stats?.applications?.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No candidates have applied using your link yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
