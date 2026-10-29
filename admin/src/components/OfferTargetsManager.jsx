import React, { useState, useEffect } from 'react';
import {
  Trophy, Plus, Target, Users, User, Trash2, Edit2, CheckCircle2,
  X, RefreshCw, AlertCircle, Sparkles, Building2, Gift, Check, Flame,
  Calendar, Clock, Save, ShieldAlert, Award, Zap
} from 'lucide-react';

export default function OfferTargetsManager({ API_URL, currentUser }) {
  const [activeTab, setActiveTab] = useState('program'); // 'program' | 'custom_targets'
  const [loading, setLoading] = useState(true);
  const [savingProgram, setSavingProgram] = useState(false);
  const [programSuccess, setProgramSuccess] = useState('');
  const [programError, setProgramError] = useState('');

  // Unified Campaign Program State
  const [program, setProgram] = useState({
    programName: 'Special Banking Placement Drive 2026',
    subtitle: 'All 10 Partner Banks Common Drive: Team Target (20 Hires = ₹30k Team Bonus) + Individual Cash Bonuses up to ₹25,000!',
    startDate: '2026-10-29',
    endDate: '2026-11-10',
    status: 'active',
    banks: [
      'Bandhan Bank', 'Axis Bank', 'Suryoday Small Finance Bank',
      'Kotak Mahindra Bank', 'IDFC First Bank', 'YES Bank',
      'HDFC Bank', 'ICICI Bank', 'Aditya Birla Capital', 'Mahindra Finance'
    ],
    freeTeamTarget: {
      targetCount: 20,
      rewardAmount: 30000,
      rewardTitle: '₹30,000 Team Cash Reward',
      description: 'Complete 20 candidates across any of our 10 partner banks to win ₹30,000 Team Cash Bonus!'
    },
    freeIndividualSlabs: [
      { count: 5, rewardAmount: 5000, rewardTitle: 'Incentive + ₹5,000 Cash Bonus', description: 'Close 5 candidates across partner banks' },
      { count: 10, rewardAmount: 10000, rewardTitle: 'Incentive + ₹10,000 Mega Bonus', description: 'Close 10 candidates across partner banks' },
      { count: 15, rewardAmount: 15000, rewardTitle: 'Incentive + ₹15,000 Super Bonus', description: 'Close 15 candidates across partner banks' },
      { count: 20, rewardAmount: 25000, rewardTitle: 'Incentive + ₹25,000 Bumper Bonus', description: 'Close 20 candidates across partner banks' }
    ],
    paidTeamTarget: {
      targetCount: 15,
      rewardAmount: 25000,
      rewardTitle: '₹25,000 Team Reward',
      description: 'Enroll 15 candidates into Paid IT Training Programs for ₹25,000 team reward!'
    },
    paidIndividualSlabs: [
      { count: 5, rewardAmount: 7500, rewardTitle: 'Incentive + ₹7,500 Bonus', description: 'Enroll 5 candidates into paid IT training tracks' },
      { count: 10, rewardAmount: 15000, rewardTitle: 'Incentive + ₹15,000 Mega Bonus', description: 'Enroll 10 candidates into paid IT training tracks' }
    ]
  });

  // Custom Standalone Targets State
  const [targets, setTargets] = useState([]);
  const [filterProcess, setFilterProcess] = useState('all');
  const [filterScope, setFilterScope] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [form, setForm] = useState({
    title: '',
    processType: 'free',
    targetScope: 'team',
    companyOrProgram: 'All',
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

  // Fetch Program & Targets
  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch Program
      const progRes = await fetch(`${API_URL}/api/offer-targets/program`);
      if (progRes.ok) {
        const json = await progRes.json();
        if (json.program) {
          setProgram(prev => ({ ...prev, ...json.program }));
        }
      }

      // Fetch Custom Targets
      const tgtRes = await fetch(`${API_URL}/api/offer-targets`);
      if (tgtRes.ok) {
        const json = await tgtRes.json();
        setTargets(json.targets || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [API_URL]);

  // Handle Save Unified Program
  const handleSaveProgram = async (e) => {
    e.preventDefault();
    try {
      setSavingProgram(true);
      setProgramError('');
      setProgramSuccess('');

      const res = await fetch(`${API_URL}/api/offer-targets/program`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(program)
      });

      if (res.ok) {
        setProgramSuccess('Unified Campaign Drive & Target Slabs saved successfully!');
        setTimeout(() => setProgramSuccess(''), 4000);
      } else {
        const errJson = await res.json();
        setProgramError(errJson.error || 'Failed to update campaign program.');
      }
    } catch (err) {
      console.error('Error saving program:', err);
      setProgramError('Network error while saving program settings.');
    } finally {
      setSavingProgram(false);
    }
  };

  // Slabs manipulation
  const handleUpdateFreeSlab = (index, field, value) => {
    const updated = [...(program.freeIndividualSlabs || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProgram(prev => ({ ...prev, freeIndividualSlabs: updated }));
  };

  // Calculate days left
  const calculateDaysLeft = (endStr) => {
    try {
      const now = new Date();
      const end = new Date(`${endStr}T23:59:59`);
      const diff = end.getTime() - now.getTime();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } catch {
      return 0;
    }
  };

  // Custom targets handlers
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

  const handleSaveCustomTarget = async (e) => {
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
        setModalOpen(false);
        setSuccessMsg(editingTarget ? 'Target updated successfully!' : 'Target created successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
        loadData();
      } else {
        const json = await res.json();
        setError(json.error || 'Failed to save target.');
      }
    } catch (err) {
      setError('Network error while saving target.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTarget = async (id) => {
    if (!window.confirm('Are you sure you want to delete this target?')) return;
    try {
      const res = await fetch(`${API_URL}/api/offer-targets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMsg('Target deleted successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
        loadData();
      }
    } catch (err) {
      console.error('Delete target error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1rem' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
              Offers and Targets Management
            </h2>
            <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 10px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 800 }}>
              HR Motivation Engine
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b' }}>
            Configure Unified Campaign Drive Dates, Bank Targets, and Individual Milestone Bonuses.
          </p>
        </div>

        <button
          onClick={loadData}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '10px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            color: '#334155',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* TOP LEVEL NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.75rem', borderBottom: '2px solid #e2e8f0' }}>
        <button
          onClick={() => setActiveTab('program')}
          style={{
            padding: '10px 22px',
            border: 'none',
            background: activeTab === 'program' ? '#ffffff' : 'transparent',
            color: activeTab === 'program' ? '#ea580c' : '#64748b',
            fontWeight: 800,
            fontSize: '0.96rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'program' ? '3px solid #ea580c' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Flame size={18} />
          <span>Unified Campaign Drive (All 10 Banks Common)</span>
        </button>

        <button
          onClick={() => setActiveTab('custom_targets')}
          style={{
            padding: '10px 22px',
            border: 'none',
            background: activeTab === 'custom_targets' ? '#ffffff' : 'transparent',
            color: activeTab === 'custom_targets' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '0.96rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'custom_targets' ? '3px solid #2563eb' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Target size={18} />
          <span>Standalone Custom Targets ({targets.length})</span>
        </button>
      </div>

      {/* TAB 1: UNIFIED CAMPAIGN PROGRAM */}
      {activeTab === 'program' && (
        <div>
          {programSuccess && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 18px', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              <span>{programSuccess}</span>
            </div>
          )}

          {programError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 18px', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{programError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProgram}>
            {/* CAMPAIGN OVERVIEW CARD */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={20} color="#ea580c" />
                <span>1. Event & Timeline Settings (All 10 Banks Common)</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Program / Campaign Name
                  </label>
                  <input
                    type="text"
                    value={program.programName}
                    onChange={e => setProgram({ ...program, programName: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Campaign Status
                  </label>
                  <select
                    value={program.status}
                    onChange={e => setProgram({ ...program, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', fontWeight: 700, background: '#ffffff' }}
                  >
                    <option value="active">Active (Visible & Open on HR Dashboard)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                    <option value="completed">Completed / Closed</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Event Start Date
                  </label>
                  <input
                    type="date"
                    value={program.startDate}
                    onChange={e => setProgram({ ...program, startDate: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Event End Date (Coming 10th or Next Month)
                  </label>
                  <input
                    type="date"
                    value={program.endDate}
                    onChange={e => setProgram({ ...program, endDate: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #ea580c', fontSize: '0.92rem', fontWeight: 700, color: '#c2410c' }}
                  />
                  <div style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 700, marginTop: '4px' }}>
                    ⏳ Live Days Remaining: {calculateDaysLeft(program.endDate)} Days
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Subtitle / Subtext for HR Dashboard Banner
                </label>
                <input
                  type="text"
                  value={program.subtitle}
                  onChange={e => setProgram({ ...program, subtitle: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              {/* LIST OF 10 BANKS */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Included Partner Banks (Candidates in any of these banks will count toward the targets):
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(program.banks || []).map((b, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#f1f5f9',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Building2 size={14} color="#0284c7" />
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* TEAM TARGET CARD SETTINGS */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #fed7aa', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.05)' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#ea580c" />
                <span>2. Team Target & Cash Reward (e.g. 20 Candidates = ₹30,000)</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Team Target Candidate Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={program.freeTeamTarget?.targetCount || 20}
                    onChange={e => setProgram({
                      ...program,
                      freeTeamTarget: { ...program.freeTeamTarget, targetCount: Number(e.target.value) }
                    })}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 800 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Team Cash Reward Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={program.freeTeamTarget?.rewardAmount || 30000}
                    onChange={e => setProgram({
                      ...program,
                      freeTeamTarget: { ...program.freeTeamTarget, rewardAmount: Number(e.target.value) }
                    })}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Team Reward Title
                  </label>
                  <input
                    type="text"
                    value={program.freeTeamTarget?.rewardTitle || '₹30,000 Team Cash Reward'}
                    onChange={e => setProgram({
                      ...program,
                      freeTeamTarget: { ...program.freeTeamTarget, rewardTitle: e.target.value }
                    })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
                  />
                </div>
              </div>
            </div>

            {/* INDIVIDUAL MILESTONE BONUS SLABS */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #bbf7d0', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.05)' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#059669" />
                <span>3. Individual Cash Bonus Slabs (5=₹5k, 10=₹10k, 15=₹15k, 20=₹25k)</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {(program.freeIndividualSlabs || []).map((slab, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '14px',
                      border: '1.5px solid #e2e8f0',
                      padding: '1.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                        Milestone {idx + 1}
                      </span>
                      <span style={{ fontSize: '1.2rem' }}>
                        {idx === 0 ? '🥉' : idx === 1 ? '🥈' : idx === 2 ? '🥇' : '💎'}
                      </span>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                        Candidate Target Count
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={slab.count}
                        onChange={e => handleUpdateFreeSlab(idx, 'count', Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800, fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                        Bonus Cash Reward (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={slab.rewardAmount}
                        onChange={e => handleUpdateFreeSlab(idx, 'rewardAmount', Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 900, fontSize: '1rem', color: '#047857' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '2rem' }}>
              <button
                type="submit"
                disabled={savingProgram}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px -4px rgba(234, 88, 12, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Save size={18} />
                <span>{savingProgram ? 'Saving Settings...' : 'Save Campaign Settings & Slabs'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: CUSTOM STANDALONE TARGETS */}
      {activeTab === 'custom_targets' && (
        <div>
          {/* ACTION BUTTONS & FILTERS */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={filterProcess}
                onChange={e => setFilterProcess(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, background: '#fff' }}
              >
                <option value="all">All Processes</option>
                <option value="free">Free Process Only</option>
                <option value="paid">Paid Process Only</option>
              </select>

              <select
                value={filterScope}
                onChange={e => setFilterScope(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, background: '#fff' }}
              >
                <option value="all">All Scopes</option>
                <option value="team">Team Targets</option>
                <option value="individual">Individual Targets</option>
              </select>
            </div>

            <button
              onClick={handleOpenCreateModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37,99,235,0.3)'
              }}
            >
              <Plus size={16} />
              <span>Add Custom Target</span>
            </button>
          </div>

          {/* TARGETS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {targets
              .filter(t => filterProcess === 'all' || t.processType === filterProcess)
              .filter(t => filterScope === 'all' || t.targetScope === filterScope)
              .map(tgt => (
                <div
                  key={tgt.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1.5px solid #e2e8f0',
                    padding: '1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span
                        style={{
                          background: tgt.targetScope === 'team' ? '#fef3c7' : '#eff6ff',
                          color: tgt.targetScope === 'team' ? '#92400e' : '#1e40af',
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'uppercase'
                        }}
                      >
                        {tgt.targetScope === 'team' ? '👥 Team Target' : '👤 Individual'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                        {tgt.processType === 'free' ? 'Free Process' : 'Paid Process'}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                      {tgt.title}
                    </h4>

                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#059669', marginBottom: '8px' }}>
                      ₹{Number(tgt.rewardAmount).toLocaleString('en-IN')}
                    </div>

                    <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#64748b' }}>
                      {tgt.description || `Target: ${tgt.targetCount} Candidates.`}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      onClick={() => handleOpenEditModal(tgt)}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTarget(tgt.id)}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODAL FOR CUSTOM TARGET CREATE/EDIT */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '520px', padding: '1.75rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                {editingTarget ? 'Edit Custom Target' : 'Create Custom Target'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSaveCustomTarget}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Target Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Process</label>
                    <select
                      value={form.processType}
                      onChange={e => setForm({ ...form, processType: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="free">Free Process</option>
                      <option value="paid">Paid Process</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Scope</label>
                    <select
                      value={form.targetScope}
                      onChange={e => setForm({ ...form, targetScope: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="team">Team Target</option>
                      <option value="individual">Individual Target</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Target Count</label>
                    <input
                      type="number"
                      min="1"
                      value={form.targetCount}
                      onChange={e => setForm({ ...form, targetCount: Number(e.target.value) })}
                      required
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Reward Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.rewardAmount}
                      onChange={e => setForm({ ...form, rewardAmount: Number(e.target.value) })}
                      required
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Description</label>
                  <textarea
                    rows="2"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  {saving ? 'Saving...' : 'Save Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
