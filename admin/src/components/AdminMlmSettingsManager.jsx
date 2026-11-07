import React, { useState, useEffect, useCallback } from 'react';
import { Layers, CheckCircle2, XCircle, Clock, Save, RefreshCw, Send, AlertCircle, QrCode, Building2, Plus, Trash2 } from 'lucide-react';

export default function AdminMlmSettingsManager({ API_URL, currentUser, showToast }) {
  const [activeSubTab, setActiveSubTab] = useState('slabs'); // 'slabs' | 'withdrawals'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // MLM Slabs Settings
  const [settings, setSettings] = useState({
    maxDepth: 50,
    minWithdrawalAmount: 500,
    paidTiers: [],
    freeTiers: [],
  });

  // Withdrawals State
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalFilter, setWithdrawalFilter] = useState('Pending');
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [actionStatus, setActionStatus] = useState('Paid'); // 'Paid' | 'Rejected'
  const [transactionRef, setTransactionRef] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/admin/mlm-settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching MLM settings:', err);
    }
  }, [API_URL]);

  const fetchWithdrawals = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/admin/withdrawals?status=${withdrawalFilter}`);
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
    }
  }, [API_URL, withdrawalFilter]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchSettings(), fetchWithdrawals()]).finally(() => setLoading(false));
  }, [fetchSettings, fetchWithdrawals]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/admin/mlm-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');
      showToast && showToast('MLM Commission Slabs saved successfully!');
    } catch (err) {
      showToast && showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTierChange = (type, index, field, value) => {
    setSettings(prev => {
      const list = [...(prev[type] || [])];
      list[index] = { ...list[index], [field]: Number(value) || 0 };
      return { ...prev, [type]: list };
    });
  };

  const handleAddTier = (type) => {
    setSettings(prev => {
      const list = [...(prev[type] || [])];
      const lastTier = list[list.length - 1];
      const nextMin = lastTier ? Number(lastTier.maxLevel) + 1 : 1;
      const nextMax = nextMin + 9;
      list.push({ minLevel: nextMin, maxLevel: nextMax, amount: 10 });
      return { ...prev, [type]: list };
    });
  };

  const handleRemoveTier = (type, index) => {
    setSettings(prev => {
      const list = prev[type].filter((_, i) => i !== index);
      return { ...prev, [type]: list };
    });
  };

  const handleOpenAction = (item, status) => {
    setSelectedWithdrawal(item);
    setActionStatus(status);
    setTransactionRef('');
    setAdminNotes('');
    setActionModalOpen(true);
  };

  const handleUpdateWithdrawalStatus = async () => {
    if (!selectedWithdrawal) return;
    setProcessingAction(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/admin/withdrawals/${selectedWithdrawal.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionStatus,
          transactionRef,
          adminNotes,
          processedBy: currentUser?.name || 'Admin',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update request');
      showToast && showToast(`Withdrawal #${selectedWithdrawal.id} marked as ${actionStatus}`);
      setActionModalOpen(false);
      fetchWithdrawals();
    } catch (err) {
      showToast && showToast(err.message, 'error');
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw className="spin" size={28} style={{ margin: '0 auto 12px' }} />
        <p>Loading Commission Slabs & Payouts...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* 1. Header & Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={28} color="#2563eb" /> Multi-Tier MLM Commission & Payouts
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Configure level slab payouts for Paid/Free closes and approve partner withdrawal requests.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '12px', gap: '4px' }}>
          <button
            onClick={() => setActiveSubTab('slabs')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: activeSubTab === 'slabs' ? '#fff' : 'transparent',
              color: activeSubTab === 'slabs' ? '#0f172a' : '#64748b',
              boxShadow: activeSubTab === 'slabs' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Commission Slabs Configuration
          </button>

          <button
            onClick={() => setActiveSubTab('withdrawals')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: activeSubTab === 'withdrawals' ? '#fff' : 'transparent',
              color: activeSubTab === 'withdrawals' ? '#0f172a' : '#64748b',
              boxShadow: activeSubTab === 'withdrawals' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Partner Withdrawal Requests
          </button>
        </div>
      </div>

      {/* 2. TAB: COMMISSION SLABS */}
      {activeSubTab === 'slabs' && (
        <form onSubmit={handleSaveSettings}>
          {/* General Limits Card */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem' }}>
              ⚙️ Global Depth & Payout Limits
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Maximum Upline Depth Cap (Levels) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxDepth || 50}
                  onChange={(e) => setSettings({ ...settings, maxDepth: Number(e.target.value) || 50 })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700 }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Commission stops distributing after this upline depth (protects company margin).
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Minimum Withdrawal Request Amount (₹) *
                </label>
                <input
                  type="number"
                  min="50"
                  value={settings.minWithdrawalAmount || 500}
                  onChange={(e) => setSettings({ ...settings, minWithdrawalAmount: Number(e.target.value) || 500 })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700 }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Partners must accumulate at least this balance before requesting bank/UPI payout.
                </span>
              </div>
            </div>
          </div>

          {/* PAID CLOSES SLABS CARD */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💎 Paid Job / Training Close Slabs (Payment ≥ ₹1,499)
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
                  Amount credited to each upline partner per candidate closed based on their distance level.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAddTier('paidTiers')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#2563eb',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} /> Add Tier
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 14px' }}>Min Level</th>
                    <th style={{ padding: '10px 14px' }}>Max Level</th>
                    <th style={{ padding: '10px 14px' }}>Amount per Upline Partner (₹)</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(settings.paidTiers || []).map((tier, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <input
                          type="number"
                          min="1"
                          value={tier.minLevel}
                          onChange={(e) => handleTierChange('paidTiers', idx, 'minLevel', e.target.value)}
                          style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                        />
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <input
                          type="number"
                          min="1"
                          value={tier.maxLevel}
                          onChange={(e) => handleTierChange('paidTiers', idx, 'maxLevel', e.target.value)}
                          style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                        />
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 800, color: '#64748b' }}>₹</span>
                          <input
                            type="number"
                            min="0"
                            value={tier.amount}
                            onChange={(e) => handleTierChange('paidTiers', idx, 'amount', e.target.value)}
                            style={{ width: '120px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 800, color: '#059669' }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveTier('paidTiers', idx)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FREE CLOSES SLABS CARD */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🎯 Free Application / Internship Close Slabs
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
                  Amount credited to each upline partner for regular/free job candidate selections.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAddTier('freeTiers')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#2563eb',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} /> Add Tier
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 14px' }}>Min Level</th>
                    <th style={{ padding: '10px 14px' }}>Max Level</th>
                    <th style={{ padding: '10px 14px' }}>Amount per Upline Partner (₹)</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(settings.freeTiers || []).map((tier, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <input
                          type="number"
                          min="1"
                          value={tier.minLevel}
                          onChange={(e) => handleTierChange('freeTiers', idx, 'minLevel', e.target.value)}
                          style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                        />
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <input
                          type="number"
                          min="1"
                          value={tier.maxLevel}
                          onChange={(e) => handleTierChange('freeTiers', idx, 'maxLevel', e.target.value)}
                          style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                        />
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 800, color: '#64748b' }}>₹</span>
                          <input
                            type="number"
                            min="0"
                            value={tier.amount}
                            onChange={(e) => handleTierChange('freeTiers', idx, 'amount', e.target.value)}
                            style={{ width: '120px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 800, color: '#059669' }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveTier('freeTiers', idx)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Save size={18} />
              {saving ? 'Saving Slabs...' : 'Save Commission Slabs'}
            </button>
          </div>
        </form>
      )}

      {/* 3. TAB: WITHDRAWAL REQUESTS */}
      {activeSubTab === 'withdrawals' && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Partner Withdrawal Requests
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
                Review partner bank/UPI requests and approve payouts.
              </p>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {['Pending', 'Paid', 'Rejected', 'all'].map((st) => (
                <button
                  key={st}
                  onClick={() => setWithdrawalFilter(st)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: withdrawalFilter === st ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    background: withdrawalFilter === st ? '#eff6ff' : '#fff',
                    color: withdrawalFilter === st ? '#1d4ed8' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {st === 'all' ? 'All' : st}
                </button>
              ))}
            </div>
          </div>

          {withdrawals.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
              <Clock size={44} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <h4 style={{ fontSize: '1.1rem', color: '#475569', margin: '0 0 4px' }}>No Withdrawal Requests</h4>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>There are currently no requests with status: {withdrawalFilter}.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Requested At</th>
                    <th style={{ padding: '12px 16px' }}>Partner Info</th>
                    <th style={{ padding: '12px 16px' }}>Amount</th>
                    <th style={{ padding: '12px 16px' }}>Payout Method & Details</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((item) => {
                    const isPending = item.status === 'Pending';
                    const isPaid = item.status === 'Paid';
                    const dateStr = item.requestedAt ? new Date(item.requestedAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
                    }) : '-';

                    return (
                      <tr key={item.id || item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>{dateStr}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.userName}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.userMobile || item.userEmail || `ID: ${item.userId}`}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '1rem', color: '#059669', whiteSpace: 'nowrap' }}>
                          ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {item.payoutMethod === 'upi' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <QrCode size={16} color="#059669" />
                              <strong style={{ color: '#065f46' }}>{item.upiId || 'UPI'}</strong>
                            </div>
                          ) : (
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                <Building2 size={16} color="#2563eb" />
                                <span>A/C: {item.bankDetails?.accountNumber}</span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                IFSC: {item.bankDetails?.ifscCode} {item.bankDetails?.accountHolder ? `• ${item.bankDetails?.accountHolder}` : ''}
                              </div>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: isPaid ? '#059669' : isPending ? '#d97706' : '#dc2626',
                            background: isPaid ? '#ecfdf5' : isPending ? '#fef3c7' : '#fef2f2',
                          }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {isPending ? (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                onClick={() => handleOpenAction(item, 'Paid')}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: '#059669',
                                  color: '#fff',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  cursor: 'pointer'
                                }}
                              >
                                ✓ Approve & Paid
                              </button>
                              <button
                                onClick={() => handleOpenAction(item, 'Rejected')}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #fecaca',
                                  background: '#fff',
                                  color: '#dc2626',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  cursor: 'pointer'
                                }}
                              >
                                ✕ Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              {item.transactionRef ? `Ref: ${item.transactionRef}` : 'Processed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. Action Modal (Mark Paid / Reject) */}
      {actionModalOpen && selectedWithdrawal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem', backdropFilter: 'blur(4px)'
        }}>
          <div style={{ background: '#fff', borderRadius: '18px', maxWidth: '460px', width: '100%', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
              {actionStatus === 'Paid' ? '✅ Confirm Payout' : '❌ Reject Withdrawal Request'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem' }}>
              Partner: <strong>{selectedWithdrawal.userName}</strong> • Amount: <strong style={{ color: '#059669' }}>₹{selectedWithdrawal.amount}</strong>
            </p>

            {actionStatus === 'Paid' ? (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Bank Reference / UTR Number
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. UTR-9823749823 or GPay Ref"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Reason for Rejection *
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Incorrect UPI ID. Balance has been refunded to wallet."
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  required
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setActionModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateWithdrawalStatus}
                disabled={processingAction}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: actionStatus === 'Paid' ? '#059669' : '#dc2626',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: processingAction ? 'not-allowed' : 'pointer',
                }}
              >
                {processingAction ? 'Processing...' : actionStatus === 'Paid' ? 'Confirm Payment' : 'Reject & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
