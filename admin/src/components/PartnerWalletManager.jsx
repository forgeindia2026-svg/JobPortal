import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, Clock, CheckCircle2, AlertCircle, RefreshCw, Send, DollarSign, Building2, QrCode } from 'lucide-react';

export default function PartnerWalletManager({ API_URL, currentUser, showToast }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  // Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('upi'); // 'upi' or 'bank'
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountHolder: currentUser?.name || '',
    bankName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchWallet = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/my-wallet?userId=${currentUser.id}`);
      if (!res.ok) throw new Error('Failed to load wallet');
      const data = await res.json();
      setWallet(data);
      if (data.upiId && !upiId) setUpiId(data.upiId);
      if (data.bankDetails?.accountNumber) {
        setBankDetails(prev => ({
          ...prev,
          accountNumber: data.bankDetails.accountNumber || '',
          ifscCode: data.bankDetails.ifscCode || '',
        }));
      }
    } catch (err) {
      console.error('Wallet fetch error:', err);
      showToast && showToast('Failed to load wallet data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_URL, currentUser.id]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWallet();
  };

  const handleOpenWithdrawModal = () => {
    setFormError('');
    setWithdrawAmount('');
    setWithdrawModalOpen(true);
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const amt = Number(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setFormError('Please enter a valid amount to withdraw.');
      return;
    }
    if (amt > (wallet?.walletBalance || 0)) {
      setFormError(`Insufficient balance. Available: ₹${wallet?.walletBalance || 0}`);
      return;
    }
    if (payoutMethod === 'upi' && !upiId.trim()) {
      setFormError('Please provide a valid UPI ID (e.g. mobile@upi).');
      return;
    }
    if (payoutMethod === 'bank' && (!bankDetails.accountNumber || !bankDetails.ifscCode)) {
      setFormError('Please provide Account Number and IFSC Code.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          amount: amt,
          payoutMethod,
          upiId: payoutMethod === 'upi' ? upiId.trim() : '',
          bankDetails: payoutMethod === 'bank' ? bankDetails : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Withdrawal request failed');
      }

      showToast && showToast(`Withdrawal request of ₹${amt} submitted successfully!`);
      setWithdrawModalOpen(false);
      fetchWallet();
    } catch (err) {
      setFormError(err.message || 'Error submitting request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw className="spin" size={28} style={{ margin: '0 auto 12px' }} />
        <p>Loading your wallet & commission history...</p>
      </div>
    );
  }

  const balance = Number(wallet?.walletBalance) || 0;
  const totalEarned = Number(wallet?.totalEarned) || 0;
  const totalWithdrawn = Number(wallet?.totalWithdrawn) || 0;
  const pendingAmount = Number(wallet?.pendingWithdrawalsAmount) || 0;
  const transactions = wallet?.transactions || [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wallet size={28} color="#059669" /> Commission Wallet & Payouts
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Real-time balance, direct earnings, multi-level network overrides, and payout history.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.88rem'
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            Refresh
          </button>

          <button
            onClick={handleOpenWithdrawModal}
            disabled={balance <= 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: balance > 0 ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : '#cbd5e1',
              color: '#fff',
              fontWeight: 700,
              cursor: balance > 0 ? 'pointer' : 'not-allowed',
              fontSize: '0.92rem',
              boxShadow: balance > 0 ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Send size={16} />
            Request Withdrawal
          </button>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Available Balance */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(4, 120, 87, 0.22)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a7f3d0', fontWeight: 700 }}>
              Available Wallet Balance
            </span>
            <Wallet size={24} color="#6ee7b7" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, marginTop: '12px', letterSpacing: '-0.02em' }}>
            ₹{balance.toLocaleString('en-IN')}
          </div>
          {pendingAmount > 0 && (
            <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> ₹{pendingAmount.toLocaleString('en-IN')} pending withdrawal approval
            </div>
          )}
        </div>

        {/* Lifetime Earnings */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
              Total Lifetime Earned
            </span>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={20} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#1e293b', marginTop: '12px' }}>
            ₹{totalEarned.toLocaleString('en-IN')}
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            Direct closes + Upline multi-level overrides
          </p>
        </div>

        {/* Total Withdrawn */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
              Total Withdrawn (Paid)
            </span>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#1e293b', marginTop: '12px' }}>
            ₹{totalWithdrawn.toLocaleString('en-IN')}
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            Transferred directly to your Bank / UPI
          </p>
        </div>
      </div>

      {/* 3. Transaction History Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Transaction & Commission History
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
              Detailed audit trail of all direct earnings, upline team overrides, and payouts.
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>
            {transactions.length} Records
          </span>
        </div>

        {transactions.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <Wallet size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h4 style={{ fontSize: '1.1rem', color: '#475569', margin: '0 0 6px' }}>No Transactions Yet</h4>
            <p style={{ fontSize: '0.88rem', margin: 0 }}>
              When candidates referred by you or your sub-partner network are selected, commissions will credit here automatically.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 18px' }}>Date & Time</th>
                  <th style={{ padding: '12px 18px' }}>Type</th>
                  <th style={{ padding: '12px 18px' }}>Description</th>
                  <th style={{ padding: '12px 18px' }}>Level Depth</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Balance After</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isCredit = tx.type.startsWith('credit') || tx.type === 'adjustment';
                  const dateStr = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  }) : '-';

                  let badgeColor = '#2563eb';
                  let badgeBg = '#eff6ff';
                  let badgeLabel = 'Commission';

                  if (tx.type === 'credit_direct') {
                    badgeColor = '#059669';
                    badgeBg = '#ecfdf5';
                    badgeLabel = 'Direct Close';
                  } else if (tx.type === 'credit_upline') {
                    badgeColor = '#7c3aed';
                    badgeBg = '#f5f3ff';
                    badgeLabel = `Team Upline (L${tx.levelDepth || 1})`;
                  } else if (tx.type === 'credit_hr_override') {
                    badgeColor = '#ea580c';
                    badgeBg = '#fff7ed';
                    badgeLabel = 'HR Override';
                  } else if (tx.type === 'debit_withdrawal') {
                    badgeColor = '#dc2626';
                    badgeBg = '#fef2f2';
                    badgeLabel = 'Withdrawal';
                  }

                  return (
                    <tr key={tx.id || tx._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {dateStr}
                      </td>
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: badgeColor,
                          background: badgeBg,
                        }}>
                          {badgeLabel}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#1e293b', maxWidth: '320px' }}>
                        <div style={{ fontWeight: 600 }}>{tx.description}</div>
                        {tx.candidateName && (
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                            Candidate: {tx.candidateName} {tx.closerUserName ? `• Closed by: ${tx.closerUserName}` : ''}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        {tx.type === 'credit_upline' ? (
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                            Level {tx.levelDepth}
                          </span>
                        ) : tx.type === 'credit_direct' ? (
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>
                            Direct
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, whiteSpace: 'nowrap', fontSize: '0.95rem' }}>
                        <span style={{ color: isCredit ? '#059669' : '#dc2626' }}>
                          {isCredit ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        ₹{Number(tx.balanceAfter || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Request Withdrawal Modal */}
      {withdrawModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            maxWidth: '460px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={22} color="#059669" /> Request Commission Withdrawal
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.5rem' }}>
              Available Balance: <strong style={{ color: '#059669' }}>₹{balance.toLocaleString('en-IN')}</strong>
            </p>

            {formError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit}>
              {/* Amount Input */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Withdrawal Amount (₹) *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#64748b' }}>₹</span>
                  <input
                    type="number"
                    min="1"
                    max={balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 1000)"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 32px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Payout Method Toggle */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Select Payout Method *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('upi')}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: payoutMethod === 'upi' ? '2px solid #059669' : '1px solid #e2e8f0',
                      background: payoutMethod === 'upi' ? '#ecfdf5' : '#fff',
                      color: payoutMethod === 'upi' ? '#065f46' : '#64748b',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <QrCode size={18} /> UPI (GPay / PhonePe)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank')}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: payoutMethod === 'bank' ? '2px solid #059669' : '1px solid #e2e8f0',
                      background: payoutMethod === 'bank' ? '#ecfdf5' : '#fff',
                      color: payoutMethod === 'bank' ? '#065f46' : '#64748b',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Building2 size={18} /> Bank Account
                  </button>
                </div>
              </div>

              {/* UPI ID Field */}
              {payoutMethod === 'upi' ? (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    UPI ID (VPA) *
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. 9876543210@upi or yourname@okaxis"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
              ) : (
                /* Bank Details Fields */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={bankDetails.accountHolder}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                      placeholder="Name as per Bank"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Bank Account Number *
                    </label>
                    <input
                      type="text"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                      placeholder="Account Number"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      IFSC Code *
                    </label>
                    <input
                      type="text"
                      value={bankDetails.ifscCode}
                      onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. HDFC0001234"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#059669',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
