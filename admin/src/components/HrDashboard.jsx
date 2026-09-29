import React, { useState, useEffect } from 'react';
import { Share2, Users, MousePointerClick, Copy, ChevronDown, ChevronUp, Phone, Mail, MapPin, Calendar, Briefcase } from 'lucide-react';

export default function HrDashboard({ API_URL, currentUser }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expandedApp, setExpandedApp] = useState(null);

  const candidatePortalBaseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5173'
    : 'https://jobs.forgeindiaconnect.in';

  const referralLink = `${candidatePortalBaseUrl}?ref=${currentUser.referralCode}`;

  const fetchStats = () => {
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
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [API_URL, currentUser]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = `Hey! Check out these amazing job openings at Forge India Connect: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const toggleExpand = (appId) => {
    setExpandedApp(expandedApp === appId ? null : appId);
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
            <p style={{ color: '#e0e7ff', fontSize: '0.95rem' }}>Share this link with candidates. Anyone who opens or applies using this link will be tracked under your account.</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              readOnly
              value={referralLink}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', color: '#0f172a', fontWeight: 'bold', minWidth: '250px' }}
            />
            <button className="btn-primary" onClick={copyToClipboard} style={{ background: copied ? '#059669' : '#10b981', border: 'none', transition: 'background 0.3s' }}>
              <Copy size={16} /> {copied ? '✓ Copied!' : 'Copy'}
            </button>
            <button className="btn-primary" onClick={shareOnWhatsApp} style={{ background: '#25D366', border: 'none', color: 'white' }}>
              <Share2 size={16} /> WhatsApp
            </button>
          </div>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card" style={{ borderLeft: '4px solid #6366f1' }}>
            <div className="kpi-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>
              <MousePointerClick size={22} />
            </div>
            <div>
              <div className="kpi-val">{stats ? stats.linkClicks : 0}</div>
              <div className="kpi-label">Total Link Clicks</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>People who opened your link</div>
            </div>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="kpi-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <Users size={22} />
            </div>
            <div>
              <div className="kpi-val">{stats ? stats.totalApplications : 0}</div>
              <div className="kpi-label">Total Candidates Applied</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                {stats && stats.linkClicks > 0
                  ? `${Math.round((stats.totalApplications / stats.linkClicks) * 100)}% conversion rate`
                  : 'Share your link to get started'}
              </div>
            </div>
          </div>
        </div>

        <div className="section-header" style={{ marginTop: '2rem' }}>
          <h3 className="section-title">Your Candidates</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stats?.applications?.map(app => (
            <div key={app.id} style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              transition: 'box-shadow 0.2s',
              boxShadow: expandedApp === app.id ? '0 4px 15px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              {/* Clickable header row */}
              <div
                onClick={() => toggleExpand(app.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '1rem', flexShrink: 0
                  }}>
                    {app.candidateName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{app.candidateName}</div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{app.candidateMobile}</div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>{app.jobTitle}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{app.companyName}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    background: '#ecfdf5', color: '#059669', padding: '4px 12px',
                    borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600
                  }}>{app.status}</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  {expandedApp === app.id ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                </div>
              </div>

              {/* Expanded details */}
              {expandedApp === app.id && (
                <div style={{
                  borderTop: '1px solid #e2e8f0',
                  padding: '20px',
                  background: '#f8fafc',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                      <Users size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>{app.candidateName}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                      <Phone size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mobile Number</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>{app.candidateMobile || 'N/A'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                      <Calendar size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date of Birth</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>
                        {app.candidateDOB ? new Date(app.candidateDOB).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>City</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>{app.candidateLocation || 'N/A'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Experience</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>{app.candidateExperience || 'N/A'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                      <Mail size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>{app.candidateEmail || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {stats?.applications?.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8',
              background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0'
            }}>
              <Users size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>No candidates have applied using your link yet.</p>
              <p style={{ fontSize: '0.85rem' }}>Share your referral link to start tracking!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
