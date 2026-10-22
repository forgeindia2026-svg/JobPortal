import React, { useState, useMemo } from 'react';
import {
  Wallet, ArrowLeft, Search, CheckCircle, Clock, Building2, Download,
  ExternalLink, Edit, Check, X, Filter, DollarSign, Calendar, AlertCircle, RefreshCw
} from 'lucide-react';

const getNormalizedBankName = (rawName) => {
  const n = String(rawName || '').toLowerCase().trim();
  if (n.includes('kotak')) return 'Kotak Mahindra Bank';
  if (n.includes('mahindra finance') || (n.includes('mahindra') && !n.includes('kotak'))) return 'Mahindra Finance';
  if (n.includes('hdfc life')) return 'HDFC Life';
  if (n.includes('hdfc')) return 'HDFC Bank';
  if (n.includes('idfc')) return 'IDFC First Bank';
  if (n.includes('bandhan')) return 'Bandhan Bank';
  if (n.includes('axis')) return 'Axis Bank';
  if (n.includes('icici')) return 'ICICI Bank';
  if (n.includes('tata aig') || n.includes('tata')) return 'TATA AIG';
  if (n.includes('aditya birla')) return 'Aditya Birla Capital';
  if (n.includes('yes bank') || n.includes('yes')) return 'YES Bank';
  return rawName || 'Banking Partner';
};

const getBankLogo = (bankName) => {
  const n = String(bankName || '').toLowerCase().trim();
  if (n.includes('kotak')) return '/logos/kotak_bank.png';
  if (n.includes('mahindra finance') || (n.includes('mahindra') && !n.includes('kotak'))) return '/logos/mahindra_finance.png';
  if (n.includes('tata aig') || n.includes('tata')) return '/logos/tata_aig.png';
  if (n.includes('hdfc')) return '/logos/Hdfc.jpg';
  if (n.includes('idfc')) return '/logos/idfc_first_bank.svg';
  if (n.includes('bandhan')) return '/logos/bandhan_bank.png';
  if (n.includes('axis')) return '/logos/axis_bank.svg';
  if (n.includes('aditya birla')) return '/logos/aditya_birla.jpg';
  if (n.includes('yes bank') || n.includes('yes')) return '/logos/Yes_Bank_Logo.jpg';
  return '/logo.png';
};

export default function ManipalPayoutManager({
  API_URL,
  applications = [],
  interviews = [],
  companies = [],
  onUpdateApplication,
  onBack
}) {
  const [selectedBankFilter, setSelectedBankFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'paid'
  const [searchQuery, setSearchQuery] = useState('');
  const [editingAppId, setEditingAppId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Identify candidates who have Joined Manipal (or marked explicitly for payout)
  const selectedCandidates = useMemo(() => {
    return applications.filter(app => {
      const s = String(app.status || '').toLowerCase().trim();
      if (s === 'payment pending' || s === 'unpaid') return false;

      const isJoinedManipal = s === 'joined manipal' || s.includes('joined manipal');
      const isExplicitlyPaid = String(app.manipalPayoutStatus || '').toLowerCase() === 'paid';

      return isJoinedManipal || isExplicitlyPaid;
    });
  }, [applications]);

  // Overall Statistics
  const totalCount = selectedCandidates.length;
  const paidCandidates = useMemo(() => {
    return selectedCandidates.filter(a => String(a.manipalPayoutStatus || '').toLowerCase() === 'paid');
  }, [selectedCandidates]);

  const pendingCandidates = useMemo(() => {
    return selectedCandidates.filter(a => String(a.manipalPayoutStatus || 'pending').toLowerCase() !== 'paid');
  }, [selectedCandidates]);

  const totalPaidAmount = useMemo(() => {
    return paidCandidates.reduce((sum, a) => sum + (Number(a.manipalPayoutAmount) || 0), 0);
  }, [paidCandidates]);

  const totalPendingAmount = useMemo(() => {
    return pendingCandidates.reduce((sum, a) => sum + (Number(a.manipalPayoutAmount) || 0), 0);
  }, [pendingCandidates]);

  // Filtered candidates
  const filteredCandidates = useMemo(() => {
    let list = selectedCandidates;

    if (selectedBankFilter !== 'all') {
      list = list.filter(a => getNormalizedBankName(a.companyName).toLowerCase() === selectedBankFilter.toLowerCase());
    }

    if (statusFilter === 'paid') {
      list = list.filter(a => String(a.manipalPayoutStatus || '').toLowerCase() === 'paid');
    } else if (statusFilter === 'pending') {
      list = list.filter(a => String(a.manipalPayoutStatus || 'pending').toLowerCase() !== 'paid');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(a =>
        String(a.candidateName || '').toLowerCase().includes(q) ||
        String(a.candidateMobile || '').toLowerCase().includes(q) ||
        String(a.candidateEmail || '').toLowerCase().includes(q) ||
        String(a.applicationNumber || '').toLowerCase().includes(q) ||
        String(a.jobTitle || '').toLowerCase().includes(q) ||
        String(a.companyName || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedCandidates, selectedBankFilter, statusFilter, searchQuery]);

  // Group candidates by Bank
  const bankGroups = useMemo(() => {
    const map = {};

    filteredCandidates.forEach(app => {
      const bName = getNormalizedBankName(app.companyName);
      if (!map[bName]) {
        map[bName] = {
          bankName: bName,
          logo: getBankLogo(bName),
          candidates: [],
          paidCount: 0,
          pendingCount: 0
        };
      }
      map[bName].candidates.push(app);
      if (String(app.manipalPayoutStatus || '').toLowerCase() === 'paid') {
        map[bName].paidCount++;
      } else {
        map[bName].pendingCount++;
      }
    });

    return Object.values(map).sort((a, b) => b.candidates.length - a.candidates.length || a.bankName.localeCompare(b.bankName));
  }, [filteredCandidates]);

  // Save/Update Manipal Payout Status
  const handleSavePayout = async (app, newStatus, amount, date, notes) => {
    const targetId = app.id || app._id;
    setSavingId(targetId);

    try {
      const res = await fetch(`${API_URL}/api/applications/${targetId}/manipal-payout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          amount: amount !== undefined ? Number(amount) : (Number(app.manipalPayoutAmount) || 0),
          date: date !== undefined ? date : (app.manipalPayoutDate || new Date().toISOString().slice(0, 10)),
          notes: notes !== undefined ? notes : (app.manipalPayoutNotes || '')
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (onUpdateApplication) {
          onUpdateApplication({
            ...app,
            ...data.application,
            manipalPayoutStatus: newStatus,
            manipalPayoutAmount: amount !== undefined ? Number(amount) : app.manipalPayoutAmount,
            manipalPayoutDate: date !== undefined ? date : app.manipalPayoutDate,
            manipalPayoutNotes: notes !== undefined ? notes : app.manipalPayoutNotes
          });
        }
        showToast(`✅ Payout marked as ${newStatus} for ${app.candidateName || 'Candidate'}`);
        setEditingAppId(null);
      } else {
        alert('Failed to update Manipal payout status.');
      }
    } catch (err) {
      console.error('Error saving Manipal payout:', err);
      alert('Error updating Manipal payout status.');
    } finally {
      setSavingId(null);
    }
  };

  // Quick toggle between Paid and Pending
  const handleQuickToggle = (app) => {
    const current = String(app.manipalPayoutStatus || 'pending').toLowerCase();
    const nextStatus = current === 'paid' ? 'Pending' : 'Paid';
    handleSavePayout(app, nextStatus, app.manipalPayoutAmount, app.manipalPayoutDate, app.manipalPayoutNotes);
  };

  // Export to CSV
  const exportPayoutCSV = () => {
    if (!filteredCandidates.length) {
      alert('No payout data available to export.');
      return;
    }

    const headers = ['App ID', 'Candidate Name', 'Mobile', 'Email', 'Bank', 'Role', 'Payout Status', 'Payout Amount (INR)', 'Payout Date', 'Notes'];
    const rows = filteredCandidates.map(a => [
      `"${a.applicationNumber || a.id || ''}"`,
      `"${a.candidateName || ''}"`,
      `"${a.candidateMobile || ''}"`,
      `"${a.candidateEmail || ''}"`,
      `"${getNormalizedBankName(a.companyName)}"`,
      `"${a.jobTitle || ''}"`,
      `"${a.manipalPayoutStatus || 'Pending'}"`,
      `"${a.manipalPayoutAmount || 0}"`,
      `"${a.manipalPayoutDate || ''}"`,
      `"${(a.manipalPayoutNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Manipal_Payout_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Candidate pool for Add Modal (non-payment pending banking applications)
  const candidatePool = useMemo(() => {
    return applications.filter(a => {
      const s = String(a.status || '').toLowerCase().trim();
      return s !== 'payment pending' && s !== 'unpaid';
    });
  }, [applications]);

  const candidatePoolFiltered = useMemo(() => {
    if (!candidateSearchQuery.trim()) return candidatePool.slice(0, 30);
    const q = candidateSearchQuery.toLowerCase().trim();
    return candidatePool.filter(a =>
      String(a.candidateName || '').toLowerCase().includes(q) ||
      String(a.candidateMobile || '').toLowerCase().includes(q) ||
      String(a.applicationNumber || '').toLowerCase().includes(q) ||
      String(a.companyName || '').toLowerCase().includes(q)
    ).slice(0, 30);
  }, [candidatePool, candidateSearchQuery]);

  return (
    <div className="manipal-payout-container fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .manipal-payout-container {
            padding: 0 4px 3rem 4px !important;
          }
          .payout-header-top {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            margin-bottom: 1rem !important;
          }
          .payout-header-left {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
          .payout-back-btn {
            align-self: flex-start !important;
            padding: 7px 12px !important;
            font-size: 0.8rem !important;
          }
          .payout-title-h1 {
            font-size: 1.25rem !important;
            line-height: 1.25 !important;
          }
          .payout-subtitle {
            font-size: 0.78rem !important;
          }
          .payout-header-actions {
            display: flex !important;
            width: 100% !important;
            gap: 8px !important;
          }
          .payout-action-btn {
            flex: 1 !important;
            justify-content: center !important;
            padding: 9px 8px !important;
            font-size: 0.76rem !important;
            text-align: center !important;
            white-space: nowrap !important;
          }
          .payout-kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            margin-bottom: 1rem !important;
          }
          .payout-kpi-card {
            padding: 0.85rem !important;
            border-radius: 12px !important;
          }
          .payout-kpi-label {
            font-size: 0.68rem !important;
          }
          .payout-kpi-value {
            font-size: 1.45rem !important;
            margin: 2px 0 !important;
          }
          .payout-kpi-sub {
            font-size: 0.66rem !important;
            line-height: 1.2 !important;
          }
          .payout-filter-bar {
            padding: 0.85rem !important;
            gap: 10px !important;
            margin-bottom: 1rem !important;
          }
          .payout-filter-search {
            flex: 1 1 100% !important;
            width: 100% !important;
          }
          .payout-filter-bank {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .payout-filter-bank select {
            flex: 1 !important;
          }
          .payout-filter-tabs {
            width: 100% !important;
            display: flex !important;
          }
          .payout-filter-tab-btn {
            flex: 1 !important;
            text-align: center !important;
            padding: 7px 4px !important;
            font-size: 0.74rem !important;
          }
          .payout-bank-header {
            padding: 10px 14px !important;
          }
          .payout-desktop-table {
            display: none !important;
          }
          .payout-mobile-cards {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            padding: 12px !important;
          }
          .payout-mobile-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          }
        }
        @media (min-width: 769px) {
          .payout-mobile-cards {
            display: none !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          zIndex: 9999,
          fontSize: '0.9rem',
          fontWeight: 600,
          border: '1px solid #334155'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Top Header / Breadcrumb */}
      <div className="payout-header-top" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '1.5rem'
      }}>
        <div className="payout-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            className="payout-back-btn"
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(15,23,42,0.15)',
              whiteSpace: 'nowrap'
            }}
          >
            <ArrowLeft size={16} /> Back to Overview
          </button>
          <div className="payout-title-box">
            <h1 className="payout-title-h1" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet style={{ color: '#c026d3' }} size={26} /> Manipal Payout Status
            </h1>
            <p className="payout-subtitle" style={{ color: '#64748b', fontSize: '0.875rem', margin: '3px 0 0 0' }}>
              Track candidate payouts received from Manipal for selected candidates across all partner banks.
            </p>
          </div>
        </div>

        <div className="payout-header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="payout-action-btn"
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
            }}
          >
            + Add Candidate to Payout
          </button>

          <button
            onClick={exportPayoutCSV}
            className="payout-action-btn"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(16,185,129,0.25)'
            }}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="payout-kpi-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '1.5rem'
      }}>
        {/* Total Selected */}
        <div className="payout-kpi-card" style={{
          background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
          border: '1.5px solid #f0abfc',
          borderRadius: '14px',
          padding: '1.25rem',
          boxShadow: '0 4px 12px rgba(192, 38, 211, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span className="payout-kpi-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#701a75', textTransform: 'uppercase' }}>
              Total Selected
            </span>
            <div style={{ background: '#f5d0fe', color: '#a21caf', padding: '6px', borderRadius: '8px' }}>
              <Wallet size={16} />
            </div>
          </div>
          <div className="payout-kpi-value" style={{ fontSize: '1.95rem', fontWeight: 800, color: '#701a75', lineHeight: 1.15 }}>
            {totalCount}
          </div>
          <span className="payout-kpi-sub" style={{ fontSize: '0.75rem', color: '#86198f', fontWeight: 600 }}>
            Candidates in Payout Pipeline
          </span>
        </div>

        {/* Payout Paid */}
        <div className="payout-kpi-card" style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1.5px solid #86efac',
          borderRadius: '14px',
          padding: '1.25rem',
          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span className="payout-kpi-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#14532d', textTransform: 'uppercase' }}>
              Payout Paid
            </span>
            <div style={{ background: '#bbf7d0', color: '#15803d', padding: '6px', borderRadius: '8px' }}>
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="payout-kpi-value" style={{ fontSize: '1.95rem', fontWeight: 800, color: '#14532d', lineHeight: 1.15 }}>
            {paidCandidates.length}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', flexWrap: 'wrap', gap: '4px' }}>
            <span className="payout-kpi-sub" style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}>
              ✓ Received from Manipal
            </span>
            {totalPaidAmount > 0 && (
              <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 800 }}>
                ₹{totalPaidAmount.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Payout Pending */}
        <div className="payout-kpi-card" style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '1.5px solid #fde68a',
          borderRadius: '14px',
          padding: '1.25rem',
          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span className="payout-kpi-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#78350f', textTransform: 'uppercase' }}>
              Payout Pending
            </span>
            <div style={{ background: '#fef08a', color: '#b45309', padding: '6px', borderRadius: '8px' }}>
              <Clock size={16} />
            </div>
          </div>
          <div className="payout-kpi-value" style={{ fontSize: '1.95rem', fontWeight: 800, color: '#78350f', lineHeight: 1.15 }}>
            {pendingCandidates.length}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', flexWrap: 'wrap', gap: '4px' }}>
            <span className="payout-kpi-sub" style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700 }}>
              ⏳ Awaiting Manipal Transfer
            </span>
            {totalPendingAmount > 0 && (
              <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 800 }}>
                ₹{totalPendingAmount.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Banks Involved */}
        <div className="payout-kpi-card" style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1.5px solid #bfdbfe',
          borderRadius: '14px',
          padding: '1.25rem',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span className="payout-kpi-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase' }}>
              Partner Banks
            </span>
            <div style={{ background: '#bfdbfe', color: '#2563eb', padding: '6px', borderRadius: '8px' }}>
              <Building2 size={16} />
            </div>
          </div>
          <div className="payout-kpi-value" style={{ fontSize: '1.95rem', fontWeight: 800, color: '#1e3a8a', lineHeight: 1.15 }}>
            {bankGroups.length}
          </div>
          <span className="payout-kpi-sub" style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
            Active Banking Placements
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="payout-filter-bar" style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Search */}
        <div className="payout-filter-search" style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search candidate name, mobile, app ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.88rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Bank Filter */}
        <div className="payout-filter-bank" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>Bank:</span>
          <select
            value={selectedBankFilter}
            onChange={e => setSelectedBankFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: '#f8fafc',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Partner Banks ({selectedCandidates.length})</option>
            {Array.from(new Set(selectedCandidates.map(a => getNormalizedBankName(a.companyName)))).sort().map(bName => (
              <option key={bName} value={bName}>{bName}</option>
            ))}
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="payout-filter-tabs" style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setStatusFilter('all')}
            className="payout-filter-tab-btn"
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: statusFilter === 'all' ? '#ffffff' : 'transparent',
              color: statusFilter === 'all' ? '#0f172a' : '#64748b',
              boxShadow: statusFilter === 'all' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            All ({selectedCandidates.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className="payout-filter-tab-btn"
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: statusFilter === 'pending' ? '#ffffff' : 'transparent',
              color: statusFilter === 'pending' ? '#b45309' : '#64748b',
              boxShadow: statusFilter === 'pending' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            ⏳ Pending ({pendingCandidates.length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className="payout-filter-tab-btn"
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: statusFilter === 'paid' ? '#ffffff' : 'transparent',
              color: statusFilter === 'paid' ? '#15803d' : '#64748b',
              boxShadow: statusFilter === 'paid' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            ✓ Paid ({paidCandidates.length})
          </button>
        </div>
      </div>

      {/* Main Content: Bank-wise Candidate Sections */}
      {bankGroups.length === 0 ? (
        <div style={{
          background: '#ffffff',
          border: '1px dashed #cbd5e1',
          borderRadius: '16px',
          padding: '3.5rem 1.5rem',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <Wallet size={48} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#1e293b', fontWeight: 700, margin: '0 0 6px 0' }}>
            No Candidates in Payout Pipeline
          </h3>
          <p style={{ fontSize: '0.88rem', margin: '0 0 16px 0', maxWidth: '460px', marginLeft: 'auto', marginRight: 'auto' }}>
            Currently there are no candidates matching the selected filters. You can add any placed or selected candidate to start tracking their Manipal payout.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            + Add Candidate to Payout Tracking
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {bankGroups.map(bg => (
            <div
              key={bg.bankName}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              {/* Bank Header Bar */}
              <div className="payout-bank-header" style={{
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={bg.logo}
                    alt={bg.bankName}
                    onError={e => { e.currentTarget.src = '/logo.png'; }}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      objectFit: 'contain',
                      background: '#ffffff',
                      padding: '4px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      {bg.bankName}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {bg.candidates.length} Selected Candidates
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    background: '#dcfce7',
                    color: '#15803d',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    ✓ Paid: {bg.paidCount}
                  </span>
                  <span style={{
                    background: '#fef3c7',
                    color: '#b45309',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    ⏳ Pending: {bg.pendingCount}
                  </span>
                </div>
              </div>

              {/* Desktop Table of Candidates */}
              <div className="payout-desktop-table" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#fdfdfe', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '12px 16px' }}>App ID & Role</th>
                      <th style={{ padding: '12px 16px' }}>Candidate Details</th>
                      <th style={{ padding: '12px 16px' }}>Selection Date</th>
                      <th style={{ padding: '12px 16px' }}>Payout Status</th>
                      <th style={{ padding: '12px 16px' }}>Payout Amount</th>
                      <th style={{ padding: '12px 16px' }}>Payout Date & Notes</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bg.candidates.map((app, idx) => {
                      const isPaid = String(app.manipalPayoutStatus || '').toLowerCase() === 'paid';
                      const isEditing = editingAppId === (app.id || app._id);
                      const isSaving = savingId === (app.id || app._id);

                      return (
                        <tr
                          key={app.id || app._id || idx}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: isPaid ? 'rgba(240, 253, 244, 0.4)' : '#ffffff',
                            transition: 'background 0.15s'
                          }}
                        >
                          {/* App ID & Role */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 800, color: '#2563eb' }}>
                              {app.applicationNumber || `#APP-${String(app.id || app._id).slice(-4)}`}
                            </div>
                            <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.82rem', marginTop: '2px' }}>
                              {app.jobTitle || 'Banking Executive'}
                            </div>
                          </td>

                          {/* Candidate Details */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                              {app.candidateName || 'Anonymous Candidate'}
                            </div>
                            <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: '2px' }}>
                              📱 {app.candidateMobile || 'N/A'} {app.candidateLocation ? `· 📍 ${app.candidateLocation}` : ''}
                            </div>
                          </td>

                          {/* Selection / Applied Date */}
                          <td style={{ padding: '14px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>
                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                          </td>

                          {/* Payout Status Badge */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                background: isPaid ? '#dcfce7' : '#fef3c7',
                                color: isPaid ? '#15803d' : '#b45309',
                                border: `1px solid ${isPaid ? '#86efac' : '#fde68a'}`,
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                whiteSpace: 'nowrap'
                              }}>
                                {isPaid ? <CheckCircle size={13} /> : <Clock size={13} />}
                                {isPaid ? 'Paid' : 'Pending'}
                              </span>
                            </div>
                          </td>

                          {/* Payout Amount */}
                          <td style={{ padding: '14px 16px' }}>
                            {isEditing ? (
                              <input
                                type="number"
                                value={editAmount}
                                onChange={e => setEditAmount(e.target.value)}
                                placeholder="e.g. 15000"
                                style={{ width: '100px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                              />
                            ) : (
                              <span style={{ fontWeight: 700, color: isPaid ? '#15803d' : '#334155' }}>
                                ₹{Number(app.manipalPayoutAmount || 0).toLocaleString()}
                              </span>
                            )}
                          </td>

                          {/* Payout Date & Notes */}
                          <td style={{ padding: '14px 16px' }}>
                            {isEditing ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <input
                                  type="date"
                                  value={editDate}
                                  onChange={e => setEditDate(e.target.value)}
                                  style={{ padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                                />
                                <input
                                  type="text"
                                  value={editNotes}
                                  onChange={e => setEditNotes(e.target.value)}
                                  placeholder="UTR / Notes"
                                  style={{ padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                                />
                              </div>
                            ) : (
                              <div>
                                <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                                  {app.manipalPayoutDate ? new Date(app.manipalPayoutDate).toLocaleDateString('en-IN') : 'No Date Set'}
                                </div>
                                {app.manipalPayoutNotes && (
                                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                                    {app.manipalPayoutNotes}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {isEditing ? (
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                <button
                                  onClick={() => handleSavePayout(app, app.manipalPayoutStatus || 'Pending', editAmount, editDate, editNotes)}
                                  disabled={isSaving}
                                  style={{
                                    background: '#16a34a',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => setEditingAppId(null)}
                                  style={{
                                    background: '#e2e8f0',
                                    color: '#475569',
                                    border: 'none',
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                <button
                                  onClick={() => handleQuickToggle(app)}
                                  disabled={isSaving}
                                  title={`Toggle to ${isPaid ? 'Pending' : 'Paid'}`}
                                  style={{
                                    background: isPaid ? '#fef3c7' : '#dcfce7',
                                    color: isPaid ? '#92400e' : '#15803d',
                                    border: `1px solid ${isPaid ? '#fde68a' : '#86efac'}`,
                                    padding: '5px 12px',
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isSaving ? 'Updating...' : (isPaid ? 'Mark Pending' : 'Mark Paid')}
                                </button>

                                <button
                                  onClick={() => {
                                    setEditingAppId(app.id || app._id);
                                    setEditAmount(app.manipalPayoutAmount || '');
                                    setEditDate(app.manipalPayoutDate || new Date().toISOString().slice(0, 10));
                                    setEditNotes(app.manipalPayoutNotes || '');
                                  }}
                                  title="Edit Payout Details"
                                  style={{
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    border: '1px solid #cbd5e1',
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center'
                                  }}
                                >
                                  <Edit size={13} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View of Candidates */}
              <div className="payout-mobile-cards">
                {bg.candidates.map((app, idx) => {
                  const isPaid = String(app.manipalPayoutStatus || '').toLowerCase() === 'paid';
                  const isEditing = editingAppId === (app.id || app._id);
                  const isSaving = savingId === (app.id || app._id);

                  return (
                    <div
                      key={app.id || app._id || idx}
                      className="payout-mobile-card"
                      style={{
                        background: isPaid ? 'rgba(240, 253, 244, 0.6)' : '#ffffff',
                        border: `1px solid ${isPaid ? '#bbf7d0' : '#e2e8f0'}`,
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {/* Top Bar: ID and Status Pill */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.85rem' }}>
                          {app.applicationNumber || `#APP-${String(app.id || app._id).slice(-4)}`}
                        </span>
                        <span style={{
                          background: isPaid ? '#dcfce7' : '#fef3c7',
                          color: isPaid ? '#15803d' : '#b45309',
                          border: `1px solid ${isPaid ? '#86efac' : '#fde68a'}`,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {isPaid ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </div>

                      {/* Candidate Name & Role */}
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.96rem' }}>
                          {app.candidateName || 'Anonymous Candidate'}
                        </div>
                        <div style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 600, marginTop: '2px' }}>
                          {app.jobTitle || 'Banking Executive'}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.76rem', marginTop: '3px' }}>
                          📱 {app.candidateMobile || 'N/A'} {app.candidateLocation ? `· 📍 ${app.candidateLocation}` : ''}
                        </div>
                      </div>

                      {/* Details row: Applied Date & Payout Amount */}
                      <div style={{
                        background: '#f8fafc',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.78rem'
                      }}>
                        <div>
                          <span style={{ color: '#64748b' }}>Selected: </span>
                          <span style={{ fontWeight: 600, color: '#334155' }}>
                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Payout: </span>
                          <span style={{ fontWeight: 800, color: isPaid ? '#15803d' : '#0f172a' }}>
                            ₹{Number(app.manipalPayoutAmount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Payout Date & Notes if exists */}
                      {(app.manipalPayoutDate || app.manipalPayoutNotes) && !isEditing && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b', background: '#fdfdfe', padding: '4px 6px', borderRadius: '6px' }}>
                          {app.manipalPayoutDate && <span>Paid on: {new Date(app.manipalPayoutDate).toLocaleDateString('en-IN')} </span>}
                          {app.manipalPayoutNotes && <span style={{ fontStyle: 'italic' }}>({app.manipalPayoutNotes})</span>}
                        </div>
                      )}

                      {/* Edit Mode Inline Inputs */}
                      {isEditing && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Amount (₹)</label>
                              <input
                                type="number"
                                value={editAmount}
                                onChange={e => setEditAmount(e.target.value)}
                                placeholder="Amount"
                                style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Date</label>
                              <input
                                type="date"
                                value={editDate}
                                onChange={e => setEditDate(e.target.value)}
                                style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                              />
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>UTR / Notes</label>
                            <input
                              type="text"
                              value={editNotes}
                              onChange={e => setEditNotes(e.target.value)}
                              placeholder="e.g. UTR123456"
                              style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                            <button
                              onClick={() => handleSavePayout(app, app.manipalPayoutStatus || 'Pending', editAmount, editDate, editNotes)}
                              disabled={isSaving}
                              style={{
                                flex: 1,
                                background: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                cursor: 'pointer'
                              }}
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingAppId(null)}
                              style={{
                                flex: 1,
                                background: '#e2e8f0',
                                color: '#475569',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action buttons (when not editing) */}
                      {!isEditing && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                          <button
                            onClick={() => handleQuickToggle(app)}
                            disabled={isSaving}
                            style={{
                              flex: 1,
                              background: isPaid ? '#fef3c7' : '#dcfce7',
                              color: isPaid ? '#92400e' : '#15803d',
                              border: `1px solid ${isPaid ? '#fde68a' : '#86efac'}`,
                              padding: '8px',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            {isSaving ? 'Updating...' : (isPaid ? 'Mark as Pending' : '✓ Mark as Paid')}
                          </button>
                          <button
                            onClick={() => {
                              setEditingAppId(app.id || app._id);
                              setEditAmount(app.manipalPayoutAmount || '');
                              setEditDate(app.manipalPayoutDate || new Date().toISOString().slice(0, 10));
                              setEditNotes(app.manipalPayoutNotes || '');
                            }}
                            title="Edit Details"
                            style={{
                              background: '#f1f5f9',
                              color: '#475569',
                              border: '1px solid #cbd5e1',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Add Candidate to Manipal Payout Tracking
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Select any banking candidate to track their Manipal payout status.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Search */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <input
                type="text"
                placeholder="Search candidate by name, mobile, application number..."
                value={candidateSearchQuery}
                onChange={e => setCandidateSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Candidate List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px' }}>
              {candidatePoolFiltered.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No candidates found matching search.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {candidatePoolFiltered.map(c => {
                    const alreadyIn = selectedCandidates.some(s => (s.id || s._id) === (c.id || c._id));
                    return (
                      <div
                        key={c.id || c._id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          background: alreadyIn ? '#f8fafc' : '#ffffff'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                            {c.candidateName || 'Anonymous'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {c.applicationNumber || `#APP-${String(c.id || c._id).slice(-4)}`} · {getNormalizedBankName(c.companyName)} · {c.jobTitle}
                          </div>
                        </div>

                        <div>
                          {alreadyIn ? (
                            <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, background: '#dcfce7', padding: '3px 8px', borderRadius: '6px' }}>
                              ✓ In Payout Tracking
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                handleSavePayout(c, 'Pending', 15000, new Date().toISOString().slice(0, 10), 'Manipal Placed Candidate');
                                setShowAddModal(false);
                              }}
                              style={{
                                background: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              + Add as Pending
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '7px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
