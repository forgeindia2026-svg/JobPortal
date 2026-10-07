import React, { useEffect, useState } from 'react';
import { UserPlus, Users, Copy, Share2, Trash2, X, MousePointerClick, Link2, CheckCircle } from 'lucide-react';

/**
 * Partners tab inside the HR Workspace.
 * Each HR can create any number of partners. Every partner gets their own login
 * and unique referral link (?ref=AG-xxxxx) tracked under that partner.
 */
export default function AgentsManager({ API_URL, currentUser, candidatePortalBaseUrl, showToast }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchAgents = () => {
    fetch(`${API_URL}/api/users/hr/${currentUser.id}/agents`)
      .then(res => res.json())
      .then(data => { setAgents(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 30000);
    return () => clearInterval(interval);
  }, [API_URL, currentUser.id]);

  const linkFor = (agent) => `${candidatePortalBaseUrl}?ref=${agent.referralCode}`;

  const copyLink = (agent) => {
    navigator.clipboard.writeText(linkFor(agent));
    setCopiedId(agent.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareWhatsApp = (agent) => {
    const text = `Hey! Check out these amazing job openings at Forge India Connect: ${linkFor(agent)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/users/hr/${currentUser.id}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create partner');
      setModalOpen(false);
      setForm({ name: '', email: '', mobile: '', password: '' });
      showToast && showToast(`Partner ${data.name} added (${data.referralCode})`);
      fetchAgents();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (agent) => {
    if (!window.confirm(`Delete partner ${agent.name}? Their referral link will stop tracking.`)) return;
    try {
      const res = await fetch(`${API_URL}/api/users/hr/${currentUser.id}/agents/${agent.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast && showToast('Partner deleted');
      fetchAgents();
    } catch {
      showToast && showToast('Failed to delete partner', 'error');
    }
  };

  const totalClicks = agents.reduce((s, a) => s + (a.linkClicks || 0), 0);
  const totalApplied = agents.reduce((s, a) => s + (a.candidatesApplied || 0), 0);

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>My Partners</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '2px' }}>
            Add partners under you. Each partner gets their own login and referral link.
          </p>
        </div>
        <button id="add-agent-btn" className="btn-primary" onClick={() => { setError(''); setModalOpen(true); }}>
          <UserPlus size={16} /> Add Partner
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: '4px solid #8b5cf6', background: '#f5f3ff' }}>
          <div className="kpi-icon" style={{ background: '#ddd6fe', color: '#7c3aed' }}><Users size={20} /></div>
          <div><div className="kpi-val">{agents.length}</div><div className="kpi-label">Total Partners</div></div>
        </div>
        <div className="kpi-card" style={{ borderLeft: '4px solid #6366f1', background: '#eef2ff' }}>
          <div className="kpi-icon" style={{ background: '#c7d2fe', color: '#4f46e5' }}><MousePointerClick size={20} /></div>
          <div><div className="kpi-val">{totalClicks}</div><div className="kpi-label">Partners' Link Clicks</div></div>
        </div>
        <div className="kpi-card" style={{ borderLeft: '4px solid #10b981', background: '#ecfdf5' }}>
          <div className="kpi-icon" style={{ background: '#a7f3d0', color: '#059669' }}><CheckCircle size={20} /></div>
          <div><div className="kpi-val">{totalApplied}</div><div className="kpi-label">Candidates via Partners</div></div>
        </div>
      </div>

      {/* Partners Table */}
      <div className="table-container" style={{ marginTop: '1.5rem' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Partner</th>
              <th>Referral Code</th>
              <th>Referral Link</th>
              <th>Clicks</th>
              <th>Applied</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <tr key={agent.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{agent.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{agent.email}</div>
                  {agent.mobile && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{agent.mobile}</div>}
                  {agent.bankAccountNumber && agent.bankIfscCode && (
                    <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '4px', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>
                      <span style={{ fontWeight: 600 }}>A/c:</span> {agent.bankAccountNumber} | <span style={{ fontWeight: 600 }}>IFSC:</span> {agent.bankIfscCode}
                    </div>
                  )}
                </td>
                <td>
                  <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {agent.referralCode}
                  </span>
                </td>
                <td style={{ maxWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Link2 size={12} style={{ flexShrink: 0 }} /> {linkFor(agent)}
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: '#3b82f6' }}>{agent.linkClicks || 0}</td>
                <td style={{ fontWeight: 600, color: '#10b981' }}>{agent.candidatesApplied || 0}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn-secondary" title="Copy referral link" onClick={() => copyLink(agent)}
                      style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', color: copiedId === agent.id ? '#059669' : undefined }}>
                      <Copy size={12} /> {copiedId === agent.id ? 'Copied' : 'Copy'}
                    </button>
                    <button className="btn-secondary" title="Share on WhatsApp" onClick={() => shareWhatsApp(agent)}
                      style={{ padding: '4px 8px', color: '#16a34a' }}>
                      <Share2 size={14} />
                    </button>
                    <button className="btn-secondary" title="Delete partner" onClick={() => handleDelete(agent)}
                      style={{ padding: '4px 8px', color: '#ef4444' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && agents.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                  No partners yet. Click <b>Add Partner</b> to create your first partner.
                </td>
              </tr>
            )}
            {loading && (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Loading partners...</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Partner Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content animate-fade" style={{ maxWidth: '440px', borderRadius: '14px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', color: 'white', borderTopLeftRadius: '14px', borderTopRightRadius: '14px', padding: '1.25rem 1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'white', fontWeight: 800 }}>Add New Partner</h3>
                <p style={{ fontSize: '0.8rem', color: '#e0e7ff', marginTop: '2px' }}>Partner will be linked to you ({currentUser.referralCode})</p>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {error && (
                <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #fecaca' }}>{error}</div>
              )}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name *</label>
                <input id="agent-name" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Ravi Kumar" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email (Login ID) *</label>
                <input id="agent-email" type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="agent@example.com" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Mobile</label>
                <input id="agent-mobile" type="tel" className="form-input" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="10-digit mobile" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Password *</label>
                <input id="agent-password" type="text" className="form-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={4} placeholder="Set a login password" />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)} style={{ flex: 1, padding: '10px' }}>Cancel</button>
                <button id="agent-save-btn" type="submit" className="btn-primary" disabled={saving}
                  style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none' }}>
                  {saving ? 'Creating...' : 'Create Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
