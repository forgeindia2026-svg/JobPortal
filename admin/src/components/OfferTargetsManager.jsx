import React, { useState, useEffect } from 'react';
import {
  Trophy, Plus, Target, Users, User, Trash2, Edit2, CheckCircle2,
  X, RefreshCw, AlertCircle, Sparkles, Building2, Gift, Check, Flame
} from 'lucide-react';

export default function OfferTargetsManager({ API_URL, currentUser }) {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProcess, setFilterProcess] = useState('all');
  const [filterScope, setFilterScope] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [form, setForm] = useState({
    title: '',
    processType: 'free',
    targetScope: 'team',
    companyOrProgram: 'Bandhan Bank',
    targetCount: 20,
    rewardAmount: 30000,
    rewardTitle: '₹30,000 Team Cash Reward',
    description: '',
    validityText: 'This Month',
    status: 'active'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTargets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/offer-targets`);
      if (res.ok) {
        const json = await res.json();
        setTargets(json.targets || []);
      }
    } catch (err) {
      console.error('Error fetching targets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, [API_URL]);

  const handleOpenCreateModal = () => {
    setEditingTarget(null);
    setForm({
      title: '',
      processType: 'free',
      targetScope: 'team',
      companyOrProgram: 'Bandhan Bank',
      targetCount: 20,
      rewardAmount: 30000,
      rewardTitle: '₹30,000 Team Cash Reward',
      description: 'Complete 20 candidates in Bandhan Bank to win ₹30,000 Team Cash Reward!',
      validityText: 'This Month',
      status: 'active'
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (tgt) => {
    setEditingTarget(tgt);
    setForm({
      title: tgt.title || '',
      processType: tgt.processType || 'free',
      targetScope: tgt.targetScope || 'team',
      companyOrProgram: tgt.companyOrProgram || 'All',
      targetCount: tgt.targetCount || 10,
      rewardAmount: tgt.rewardAmount || 10000,
      rewardTitle: tgt.rewardTitle || '',
      description: tgt.description || '',
      validityText: tgt.validityText || 'Ongoing',
      status: tgt.status || 'active'
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.targetCount || !form.rewardAmount) {
      setError('Please provide Title, Target Count, and Reward Amount.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const url = editingTarget
        ? `${API_URL}/api/offer-targets/${editingTarget.id}`
        : `${API_URL}/api/offer-targets`;
      const method = editingTarget ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setSuccessMsg(editingTarget ? 'Target updated successfully!' : 'New Target created successfully!');
        setModalOpen(false);
        fetchTargets();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to save target.');
      }
    } catch (err) {
      setError('Network error saving target.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete target "${title}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/offer-targets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTargets(prev => prev.filter(t => t.id !== id));
        setSuccessMsg('Target deleted.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert('Failed to delete target');
    }
  };

  const handleToggleStatus = async (tgt) => {
    const newStatus = tgt.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`${API_URL}/api/offer-targets/${tgt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchTargets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTargets = targets.filter(t => {
    if (filterProcess !== 'all' && t.processType !== filterProcess) return false;
    if (filterScope !== 'all' && t.targetScope !== filterScope) return false;
    return true;
  });

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '1.5rem 1.75rem',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(234, 88, 12, 0.4)'
            }}
          >
            <Trophy size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
              🎯 Offers & Targets Management
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Configure Free & Paid process targets: Team Rewards (e.g. Bandhan 20 persons = ₹30k) and Individual Cash Bonuses.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchTargets}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 15px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button
            onClick={handleOpenCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              background: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)'
            }}
          >
            <Plus size={16} /> Create New Target
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '10px', color: '#065f46', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="#059669" /> {successMsg}
        </div>
      )}

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Targets</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{targets.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px', fontWeight: 600 }}>Active in portal</div>
        </div>

        <div style={{ background: '#fff7ed', padding: '1.25rem', borderRadius: '14px', border: '1px solid #fed7aa' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>Free Process Targets</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ea580c', marginTop: '4px' }}>
            {targets.filter(t => t.processType === 'free').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#c2410c', marginTop: '4px', fontWeight: 600 }}>Banking & Direct Drives</div>
        </div>

        <div style={{ background: '#f5f3ff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #ddd6fe' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase' }}>Paid Process Targets</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#7c3aed', marginTop: '4px' }}>
            {targets.filter(t => t.processType === 'paid').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6d28d9', marginTop: '4px', fontWeight: 600 }}>IT & Academy Courses</div>
        </div>

        <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>Team Rewards Configured</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2563eb', marginTop: '4px' }}>
            {targets.filter(t => t.targetScope === 'team').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '4px', fontWeight: 600 }}>Collaborative Drives</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Process:</span>
          <select
            value={filterProcess}
            onChange={e => setFilterProcess(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <option value="all">All Processes</option>
            <option value="free">Free Process Only</option>
            <option value="paid">Paid Process Only</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Scope:</span>
          <select
            value={filterScope}
            onChange={e => setFilterScope(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <option value="all">All Scopes</option>
            <option value="team">Team Target Only</option>
            <option value="individual">Individual Target Only</option>
          </select>
        </div>
      </div>

      {/* Targets Table / Cards */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Configured Offers & Targets ({filteredTargets.length})
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={26} className="spin" style={{ margin: '0 auto 8px auto' }} />
            <div>Loading targets...</div>
          </div>
        ) : filteredTargets.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            No targets match the selected filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px' }}>Target & Title</th>
                  <th style={{ padding: '12px 16px' }}>Process Type</th>
                  <th style={{ padding: '12px 16px' }}>Target Scope</th>
                  <th style={{ padding: '12px 16px' }}>Target Goal</th>
                  <th style={{ padding: '12px 16px' }}>Reward</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.map(tgt => (
                  <tr key={tgt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{tgt.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        🏢 {tgt.companyOrProgram} • 📅 {tgt.validityText}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: tgt.processType === 'free' ? '#fff7ed' : '#f5f3ff',
                          color: tgt.processType === 'free' ? '#c2410c' : '#6d28d9',
                          border: tgt.processType === 'free' ? '1px solid #fed7aa' : '1px solid #ddd6fe'
                        }}
                      >
                        {tgt.processType === 'free' ? '🆓 Free Process' : '🎓 Paid Process'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: tgt.targetScope === 'team' ? '#eff6ff' : '#f0fdf4',
                          color: tgt.targetScope === 'team' ? '#1d4ed8' : '#15803d',
                          border: tgt.targetScope === 'team' ? '1px solid #bfdbfe' : '1px solid #bbf7d0'
                        }}
                      >
                        {tgt.targetScope === 'team' ? '👥 Team Target' : '👤 Individual'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                      {tgt.targetCount} Candidates
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 900, color: '#b45309', fontSize: '1rem' }}>
                        ₹{Number(tgt.rewardAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{tgt.rewardTitle}</div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleToggleStatus(tgt)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: tgt.status === 'active' ? '#ecfdf5' : '#f1f5f9',
                          color: tgt.status === 'active' ? '#059669' : '#64748b'
                        }}
                      >
                        {tgt.status === 'active' ? '● Active' : '○ Inactive'}
                      </button>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEditModal(tgt)}
                          title="Edit Target"
                          style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(tgt.id, tgt.title)}
                          title="Delete Target"
                          style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT TARGET MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #ea580c 0%, #d97706 100%)', color: '#ffffff' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  {editingTarget ? 'Edit Target' : 'Create New Target / Offer'}
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', opacity: 0.9 }}>
                  Set up team rewards (e.g. Bandhan 20 = 30k) or individual milestone bonuses
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && (
                <div style={{ padding: '10px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Target Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bandhan Bank Mega Team Drive"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Process Type
                  </label>
                  <select
                    value={form.processType}
                    onChange={e => setForm({ ...form, processType: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#fff' }}
                  >
                    <option value="free">Free Process (Banking/Direct)</option>
                    <option value="paid">Paid Process (IT/Manipal)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Target Scope
                  </label>
                  <select
                    value={form.targetScope}
                    onChange={e => setForm({ ...form, targetScope: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#fff' }}
                  >
                    <option value="team">Team Target (Collaborative)</option>
                    <option value="individual">Individual Target (Per HR)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Company / Program Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bandhan Bank or All"
                    value={form.companyOrProgram}
                    onChange={e => setForm({ ...form, companyOrProgram: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Target Count (Persons) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 20"
                    value={form.targetCount}
                    onChange={e => setForm({ ...form, targetCount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Reward Amount (₹) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 30000"
                    value={form.rewardAmount}
                    onChange={e => setForm({ ...form, rewardAmount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Reward Title / Subtext
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹30,000 Team Cash Reward"
                    value={form.rewardTitle}
                    onChange={e => setForm({ ...form, rewardTitle: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Validity / Period
                </label>
                <input
                  type="text"
                  placeholder="e.g. This Month, Q4 Drive, Ongoing"
                  value={form.validityText}
                  onChange={e => setForm({ ...form, validityText: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Description / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Complete 20 selections in Bandhan Bank to win ₹30,000 team reward!"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#ea580c', color: '#ffffff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  {saving ? 'Saving...' : (editingTarget ? 'Update Target' : 'Create Target')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
