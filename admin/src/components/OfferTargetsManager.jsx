import React, { useState, useEffect } from 'react';
import {
  Trophy, Plus, Target, Users, User, Trash2, Edit2, CheckCircle2,
  X, RefreshCw, AlertCircle, Sparkles, Building2, Gift, Check, Flame,
  Calendar, Clock, Save, ShieldAlert, Award, Zap, Tablet, Smartphone
} from 'lucide-react';

const ALL_BANKS = [
  'Bandhan Bank',
  'Axis Bank',
  'Suryoday Small Finance Bank',
  'Kotak Mahindra Bank',
  'IDFC First Bank',
  'YES Bank',
  'HDFC Bank',
  'ICICI Bank',
  'Aditya Birla Capital',
  'Mahindra Finance'
];

const DEFAULT_COMBO_SETS = [
  {
    id: 'combo_1',
    title: 'Set 1: Premium Banking Trio',
    roles: 'Aditya Birla, Tata Capital, HDFC Bank',
    targetCount: 3,
    rewardType: 'both',
    rewardAmount: 25000,
    rewardTitle: 'Brand New TAB or ₹25,000 Cash',
    extraIncentiveText: '+ Full Candidate Placement Incentives',
    description: 'Enroll candidates across Aditya Birla, Tata, and HDFC to claim a Brand New TAB or ₹25,000 Cash!'
  },
  {
    id: 'combo_2',
    title: 'Set 2: Hybrid Banking & IT Combo',
    roles: 'Any 2 Banking Candidates, 1 IT Training Candidate',
    targetCount: 3,
    rewardType: 'both',
    rewardAmount: 25000,
    rewardTitle: 'Brand New TAB or ₹25,000 Cash',
    extraIncentiveText: '+ Full Candidate Placement Incentives',
    description: 'Enroll any 2 Banking candidates + 1 IT Training candidate to unlock a Brand New TAB or ₹25,000 Cash!'
  },
  {
    id: 'combo_3',
    title: 'Set 3: Gold Academy Power Trio',
    roles: 'Axis Gold Academy, Kotak Gold Academy, Suryoday Small Finance Bank',
    targetCount: 3,
    rewardType: 'both',
    rewardAmount: 25000,
    rewardTitle: 'Brand New TAB or ₹25,000 Cash',
    extraIncentiveText: '+ Full Candidate Placement Incentives',
    description: 'Enroll candidates across Axis Gold, Kotak Gold, and Suryoday Bank to win the Mega Reward!'
  },
  {
    id: 'combo_4',
    title: 'Set 4: Master Placement Quad Combo',
    roles: 'Axis Gold, Kotak Gold, Aditya Birla, Any IT Track',
    targetCount: 4,
    rewardType: 'both',
    rewardAmount: 30000,
    rewardTitle: 'Premium TAB + ₹10,000 Cash Bonus',
    extraIncentiveText: '+ Full Candidate Placement Incentives',
    description: 'Achieve 4 closures across premium gold banks and IT training to claim the ultimate Bumper Reward!'
  }
];

export default function OfferTargetsManager({ API_URL, currentUser }) {
  const [loading, setLoading] = useState(true);
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [savingCombos, setSavingCombos] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Selected Bank to Configure (For Free Process)
  const [selectedBank, setSelectedBank] = useState('Bandhan Bank');
  const [selectedProcess, setSelectedProcess] = useState('free'); // 'free' | 'paid'

  // Master Program State
  const [program, setProgram] = useState({
    badgeText: 'SPECIAL RECRUITMENT EVENT',
    programName: 'Special Banking Placement Drive 2026',
    subtitle: 'All 10 Partner Banks Common Drive: Team Target (20 Hires = ₹30k Team Bonus) + Individual Cash Bonuses up to ₹25,000!',
    startDate: '2026-10-29',
    endDate: '2026-11-10',
    status: 'active',
    banks: ALL_BANKS,
    bankConfigs: {}
  });

  // Current Bank Editing State (Free Process)
  const [bankTeamTarget, setBankTeamTarget] = useState({
    targetCount: 20,
    rewardAmount: 30000,
    rewardTitle: '₹30,000 Team Cash Reward',
    description: 'Complete 20 candidates in Bandhan Bank to win ₹30,000 Team Cash Bonus!'
  });

  const [bankSlabs, setBankSlabs] = useState([
    { count: 5, rewardAmount: 5000, rewardTitle: 'Incentive + ₹5,000 Cash Bonus', description: 'Close 5 candidates to unlock ₹5,000 bonus!' },
    { count: 10, rewardAmount: 10000, rewardTitle: 'Incentive + ₹10,000 Mega Bonus', description: 'Close 10 candidates to unlock ₹10,000 bonus!' },
    { count: 15, rewardAmount: 15000, rewardTitle: 'Incentive + ₹15,000 Super Bonus', description: 'Close 15 candidates to unlock ₹15,000 bonus!' },
    { count: 20, rewardAmount: 25000, rewardTitle: 'Incentive + ₹25,000 Bumper Bonus', description: 'Close 20 candidates to unlock ₹25,000 bonus!' }
  ]);

  // Paid Process (FIC Training) 4 Combo Sets State
  const [paidComboSets, setPaidComboSets] = useState(DEFAULT_COMBO_SETS);

  // Load Data from API
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/offer-targets/program`);
      if (res.ok) {
        const json = await res.json();
        if (json.program) {
          setProgram(prev => ({
            ...prev,
            ...json.program,
            badgeText: json.program.badgeText || prev.badgeText || 'SPECIAL RECRUITMENT EVENT'
          }));
          syncBankState(selectedBank, selectedProcess, json.program.bankConfigs);

          if (json.program.paidComboSets && json.program.paidComboSets.length > 0) {
            setPaidComboSets(json.program.paidComboSets.map(s => ({
              ...s,
              roles: Array.isArray(s.roles) ? s.roles.join(', ') : (s.roles || '')
            })));
          }
        }
      }
    } catch (err) {
      console.error('Error loading program targets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [API_URL]);

  // Sync inputs when bank changes
  const syncBankState = (bankName, processType, configsMap) => {
    const configs = configsMap || program.bankConfigs || {};
    const bankConf = configs[bankName] || {};

    const team = bankConf.freeTeamTarget || {
      targetCount: 20,
      rewardAmount: 30000,
      rewardTitle: '₹30,000 Team Cash Reward',
      description: `Complete 20 candidates in ${bankName} to win ₹30,000 Team Cash Bonus!`
    };
    const slabs = bankConf.freeIndividualSlabs || [
      { count: 5, rewardAmount: 5000, rewardTitle: 'Incentive + ₹5,000 Cash Bonus', description: `Close 5 candidates in ${bankName} to unlock ₹5,000 bonus!` },
      { count: 10, rewardAmount: 10000, rewardTitle: 'Incentive + ₹10,000 Mega Bonus', description: `Close 10 candidates in ${bankName} to unlock ₹10,000 bonus!` },
      { count: 15, rewardAmount: 15000, rewardTitle: 'Incentive + ₹15,000 Super Bonus', description: `Close 15 candidates in ${bankName} to unlock ₹15,000 bonus!` },
      { count: 20, rewardAmount: 25000, rewardTitle: 'Incentive + ₹25,000 Bumper Bonus', description: `Close 20 candidates in ${bankName} to unlock ₹25,000 bonus!` }
    ];
    setBankTeamTarget(team);
    setBankSlabs(slabs);
  };

  const handleBankChange = (newBank) => {
    setSelectedBank(newBank);
    syncBankState(newBank, selectedProcess, program.bankConfigs);
  };

  const handleProcessChange = (newProcess) => {
    setSelectedProcess(newProcess);
  };

  const handleUpdateSlab = (idx, field, val) => {
    const updated = [...bankSlabs];
    updated[idx] = { ...updated[idx], [field]: val };
    setBankSlabs(updated);
  };

  const handleUpdateComboSet = (idx, field, val) => {
    const updated = [...paidComboSets];
    updated[idx] = { ...updated[idx], [field]: val };
    setPaidComboSets(updated);
  };

  // Save Campaign Master Settings
  const handleSaveCampaign = async (e) => {
    e && e.preventDefault && e.preventDefault();
    try {
      setSavingCampaign(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await fetch(`${API_URL}/api/offer-targets/program`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badgeText: program.badgeText || 'SPECIAL RECRUITMENT EVENT',
          programName: program.programName,
          subtitle: program.subtitle,
          startDate: program.startDate,
          endDate: program.endDate,
          status: program.status
        })
      });

      if (res.ok) {
        setSuccessMsg('✅ Campaign Drive Name, Badge & Dates saved successfully! Live portal updated.');
        setTimeout(() => setSuccessMsg(''), 5000);
        await loadData();
      } else {
        const errJson = await res.json().catch(() => ({}));
        setErrorMsg(errJson.error || 'Failed to update campaign timeline.');
      }
    } catch (err) {
      console.error('Error updating campaign:', err);
      setErrorMsg('Network error while updating campaign. Please retry.');
    } finally {
      setSavingCampaign(false);
    }
  };

  // Save Free Bank Targets
  const handleSaveBankTarget = async (e) => {
    e && e.preventDefault && e.preventDefault();
    try {
      setSavingBank(true);
      setErrorMsg('');
      setSuccessMsg('');

      const payload = {
        bankName: selectedBank,
        freeTeamTarget: bankTeamTarget,
        freeIndividualSlabs: bankSlabs
      };

      let saveSuccess = false;
      try {
        const res = await fetch(`${API_URL}/api/offer-targets/bank-target`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) saveSuccess = true;
      } catch (err1) {
        console.warn('Direct /bank-target call failed, falling back to /program:', err1);
      }

      if (!saveSuccess) {
        const existingConfigs = program.bankConfigs || {};
        const updatedConfigs = {
          ...existingConfigs,
          [selectedBank]: {
            ...(existingConfigs[selectedBank] || {}),
            freeTeamTarget: bankTeamTarget,
            freeIndividualSlabs: bankSlabs
          }
        };

        const resFallback = await fetch(`${API_URL}/api/offer-targets/program`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bankConfigs: updatedConfigs })
        });
        if (resFallback.ok) saveSuccess = true;
      }

      if (saveSuccess) {
        setSuccessMsg(`✅ Targets for ${selectedBank} (Free Process) saved successfully!`);
        setTimeout(() => setSuccessMsg(''), 5000);
        await loadData();
      } else {
        setErrorMsg(`Failed to save targets for ${selectedBank}.`);
      }
    } catch (err) {
      console.error('Error saving bank target:', err);
      setErrorMsg('Network error while saving bank target.');
    } finally {
      setSavingBank(false);
    }
  };

  // Save Paid Process (FIC Training) 4 Combo Sets
  const handleSavePaidComboSets = async (e) => {
    e && e.preventDefault && e.preventDefault();
    try {
      setSavingCombos(true);
      setErrorMsg('');
      setSuccessMsg('');

      const normalizedSets = paidComboSets.map(s => ({
        ...s,
        targetCount: Number(s.targetCount) || 3,
        rewardAmount: Number(s.rewardAmount) || 25000,
        roles: typeof s.roles === 'string'
          ? s.roles.split(',').map(r => r.trim()).filter(Boolean)
          : (s.roles || [])
      }));

      let saveSuccess = false;

      try {
        const res = await fetch(`${API_URL}/api/offer-targets/paid-combo-sets`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comboSets: normalizedSets })
        });
        if (res.ok) saveSuccess = true;
      } catch (err1) {
        console.warn('Direct /paid-combo-sets failed, falling back to /program:', err1);
      }

      if (!saveSuccess) {
        const resFallback = await fetch(`${API_URL}/api/offer-targets/program`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paidComboSets: normalizedSets })
        });
        if (resFallback.ok) saveSuccess = true;
      }

      if (saveSuccess) {
        setSuccessMsg('✅ All 4 FIC Training Combo Sets & TAB / ₹25k Rewards saved successfully!');
        setTimeout(() => setSuccessMsg(''), 5000);
        await loadData();
      } else {
        setErrorMsg('Failed to save FIC Training Combo Sets. Please retry.');
      }
    } catch (err) {
      console.error('Error saving paid combo sets:', err);
      setErrorMsg('Network error while saving combo sets.');
    } finally {
      setSavingCombos(false);
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
              Dynamic Database Config
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b' }}>
            Configure Campaign Master Dates, Free Process Bank Drives, and Paid Process (FIC Training) 4 Combo Sets (TAB / ₹25k Cash).
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
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
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* SUCCESS & ERROR ALERTS */}
      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', color: '#065f46', padding: '12px 18px', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', color: '#b91c1c', padding: '12px 18px', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} color="#dc2626" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: CAMPAIGN MASTER SETTINGS & TIMELINE */}
      <div
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #fffbf5 100%)',
          borderRadius: '20px',
          border: '2px solid #fed7aa',
          padding: '1.75rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 24px -6px rgba(234, 88, 12, 0.12)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#ffedd5', color: '#ea580c', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900 }}>
                STEP 1
              </span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#9a3412', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={20} color="#ea580c" />
                <span>Campaign Event Master Settings (Name, Badge & Dates)</span>
              </h3>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#78350f' }}>
              Change the Event Badge, Campaign Name, Subtitle, and Start/End Dates displayed across the portal.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveCampaign}
            disabled={savingCampaign}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '12px',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 6px 16px -2px rgba(234, 88, 12, 0.4)',
              transition: 'all 0.18s ease'
            }}
          >
            <Save size={16} />
            <span>{savingCampaign ? 'Saving Campaign...' : '💾 Save Campaign Event Details'}</span>
          </button>
        </div>

        <form onSubmit={handleSaveCampaign}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#431407', marginBottom: '6px' }}>
                🏷️ Event Badge Text (Card Top Badge)
              </label>
              <input
                type="text"
                value={program.badgeText || ''}
                onChange={e => setProgram({ ...program, badgeText: e.target.value })}
                placeholder="e.g. SPECIAL RECRUITMENT EVENT or FESTIVE DRIVE"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #fdba74',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: '#9a3412',
                  background: '#ffffff'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#431407', marginBottom: '6px' }}>
                📢 Campaign / Drive Name (Main Title)
              </label>
              <input
                type="text"
                value={program.programName || ''}
                onChange={e => setProgram({ ...program, programName: e.target.value })}
                required
                placeholder="e.g. Special Banking Placement Drive 2026"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #fdba74',
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  background: '#ffffff'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#431407', marginBottom: '6px' }}>
                📅 Event Start Date
              </label>
              <input
                type="date"
                value={program.startDate || ''}
                onChange={e => setProgram({ ...program, startDate: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', fontWeight: 700, background: '#ffffff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#431407', marginBottom: '6px' }}>
                ⏰ Event End Date (Countdown Target)
              </label>
              <input
                type="date"
                value={program.endDate || ''}
                onChange={e => setProgram({ ...program, endDate: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '2px solid #ea580c', fontSize: '0.92rem', fontWeight: 800, color: '#c2410c', background: '#ffffff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#431407', marginBottom: '6px' }}>
                ⚡ Campaign Status
              </label>
              <select
                value={program.status || 'active'}
                onChange={e => setProgram({ ...program, status: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', fontWeight: 700, background: '#ffffff' }}
              >
                <option value="active">Active (Visible on Portal)</option>
                <option value="inactive">Inactive (Hidden)</option>
                <option value="completed">Completed / Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#431407', marginBottom: '6px' }}>
              📝 Subtitle & Reward Highlights Description
            </label>
            <input
              type="text"
              value={program.subtitle || ''}
              onChange={e => setProgram({ ...program, subtitle: e.target.value })}
              placeholder="e.g. All 10 Partner Banks Common Drive..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
            />
          </div>
        </form>
      </div>

      {/* SECTION 2: PROCESS SELECTOR (FREE PROCESS vs PAID FIC TRAINING) */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900 }}>
                STEP 2
              </span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                {selectedProcess === 'free'
                  ? 'Free Process: Bank-Wise Target & Reward Slab Configuration (10 Partner Banks)'
                  : 'Paid Process: FIC Training 4 Combo Sets & Mega Rewards Manager (TAB or ₹25k Cash)'}
              </h3>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              {selectedProcess === 'free'
                ? 'Configure Team Goals and Individual Slabs for each of the 10 partner banks.'
                : 'Configure the 4 specialized academy combo challenges (Axis Gold, Kotak Gold, Surya, 2 Bank + 1 IT) to win a Brand New TAB or ₹25k Cash!'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleProcessChange('free')}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                border: selectedProcess === 'free' ? '2px solid #ea580c' : '1px solid #cbd5e1',
                background: selectedProcess === 'free' ? '#fff7ed' : '#ffffff',
                color: selectedProcess === 'free' ? '#c2410c' : '#64748b',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              Free Process (10 Banks)
            </button>
            <button
              type="button"
              onClick={() => handleProcessChange('paid')}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                border: selectedProcess === 'paid' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: selectedProcess === 'paid' ? '#eff6ff' : '#ffffff',
                color: selectedProcess === 'paid' ? '#1d4ed8' : '#64748b',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              Paid Process (4 FIC Combos)
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SUB-SECTION A: FREE PROCESS CONFIG (BANK-BY-BANK)             */}
        {/* ============================================================== */}
        {selectedProcess === 'free' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ width: '100%', maxWidth: '400px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  Select Bank to Configure:
                </label>
                <select
                  value={selectedBank}
                  onChange={e => handleBankChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '2px solid #0284c7',
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#0369a1',
                    background: '#ffffff'
                  }}
                >
                  {ALL_BANKS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleSaveBankTarget}
                disabled={savingBank}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '11px 26px',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px -2px rgba(2, 132, 199, 0.4)'
                }}
              >
                <Save size={16} />
                <span>{savingBank ? 'Saving...' : `💾 Save Targets for ${selectedBank}`}</span>
              </button>
            </div>

            {/* TEAM TARGET */}
            <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Team Target for {selectedBank}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Target Hires</label>
                  <input
                    type="number"
                    min="1"
                    value={bankTeamTarget.targetCount}
                    onChange={e => setBankTeamTarget({ ...bankTeamTarget, targetCount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Cash Bonus (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={bankTeamTarget.rewardAmount}
                    onChange={e => setBankTeamTarget({ ...bankTeamTarget, rewardAmount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800, color: '#047857' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Reward Title</label>
                  <input
                    type="text"
                    value={bankTeamTarget.rewardTitle}
                    onChange={e => setBankTeamTarget({ ...bankTeamTarget, rewardTitle: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                  />
                </div>
              </div>
            </div>

            {/* INDIVIDUAL SLABS */}
            <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Individual Slabs for {selectedBank}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {bankSlabs.map((slab, idx) => (
                  <div key={idx} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669', marginBottom: '8px' }}>
                      Milestone {idx + 1}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b' }}>Target Hires</label>
                      <input
                        type="number"
                        min="1"
                        value={slab.count}
                        onChange={e => handleUpdateSlab(idx, 'count', Number(e.target.value))}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b' }}>Cash Bonus (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={slab.rewardAmount}
                        onChange={e => handleUpdateSlab(idx, 'rewardAmount', Number(e.target.value))}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 900, color: '#047857' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SUB-SECTION B: PAID PROCESS (FIC TRAINING 4 COMBO SETS)        */}
        {/* ============================================================== */}
        {selectedProcess === 'paid' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '1.5px solid #334155', borderRadius: '14px', padding: '12px 18px', flex: 1, minWidth: '280px', color: '#ffffff' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tablet size={18} color="#fbbf24" />
                  <span>Grand Bumper Reward: Brand New TAB (Tablet) OR ₹25,000 Cash Prize + Incentives</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '3px' }}>
                  Candidates enrolled in these 4 Combo Sets count toward winning the Tablet or ₹25,000 Cash on top of all referral incentives!
                </div>
              </div>

              <button
                type="button"
                onClick={handleSavePaidComboSets}
                disabled={savingCombos}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
                  color: '#ffffff',
                  border: '1px solid #3b82f6',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  fontSize: '0.96rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px -2px rgba(15, 23, 42, 0.4)'
                }}
              >
                <Save size={18} />
                <span>{savingCombos ? 'Saving...' : '💾 Save All 4 FIC Training Sets'}</span>
              </button>
            </div>

            {/* 4 COMBO CARDS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {paidComboSets.map((set, idx) => (
                <div
                  key={set.id || idx}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1.5px solid #e2e8f0',
                    padding: '1.25rem',
                    boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                      SET {idx + 1} CHALLENGE
                    </span>
                    <span style={{ fontSize: '1.2rem' }}>
                      {idx === 0 ? '🏆' : idx === 1 ? '⚡' : idx === 2 ? '🥇' : '💎'}
                    </span>
                  </div>

                  {/* Set Title */}
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Set Title / Challenge Name
                    </label>
                    <input
                      type="text"
                      value={set.title}
                      onChange={e => handleUpdateComboSet(idx, 'title', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}
                    />
                  </div>

                  {/* Included Roles / Programs */}
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Included Roles / Banks (Comma Separated)
                    </label>
                    <input
                      type="text"
                      value={set.roles}
                      onChange={e => handleUpdateComboSet(idx, 'roles', e.target.value)}
                      placeholder="e.g. Axis Gold, Kotak Gold, Suryoday Bank"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}
                    />
                  </div>

                  {/* Target Count & Cash Value */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#64748b', marginBottom: '3px' }}>
                        Required Hires
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={set.targetCount}
                        onChange={e => handleUpdateComboSet(idx, 'targetCount', Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#64748b', marginBottom: '3px' }}>
                        Cash Value (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={set.rewardAmount}
                        onChange={e => handleUpdateComboSet(idx, 'rewardAmount', Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 900, color: '#047857' }}
                      />
                    </div>
                  </div>

                  {/* Reward Title */}
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#64748b', marginBottom: '3px' }}>
                      Reward Headline
                    </label>
                    <input
                      type="text"
                      value={set.rewardTitle}
                      onChange={e => handleUpdateComboSet(idx, 'rewardTitle', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.86rem' }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#64748b', marginBottom: '3px' }}>
                      Description & Perks
                    </label>
                    <input
                      type="text"
                      value={set.description}
                      onChange={e => handleUpdateComboSet(idx, 'description', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* BOTTOM SAVE BUTTON */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={handleSavePaidComboSets}
                disabled={savingCombos}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4)'
                }}
              >
                <Save size={18} />
                <span>{savingCombos ? 'Saving...' : '💾 Save All 4 FIC Training Sets & Rewards'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
