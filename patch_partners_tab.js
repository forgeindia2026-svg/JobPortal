const fs = require('fs');
const file = 'c:/Users/Admin/Desktop/Jobs/admin/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const startStr = "{activeTab === 'partners_admin' && (";
const endStr = "{activeTab === 'payouts' && (";

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const newBlock = `{activeTab === 'partners_admin' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>Partners Management</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Manage partners/agents, referral tracking, and incentives.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={() => {
                  setPartnerToEdit(null);
                  setPartnerForm({ name: '', email: '', password: '', mobile: '', parentHrId: hrs[0]?.id || '', profilePhoto: '' });
                  setPartnerError('');
                  setPartnerModalOpen(true);
                }}>
                  <Plus size={16} /> Add Partner
                </button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="table-container hrs-desktop-table">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email / Mobile</th>
                    <th>Referral Code</th>
                    <th>Link Clicks</th>
                    <th>Candidates Applied</th>
                    <th>Incentives Earned</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allAgents.map(partner => {
                    const partnerApps = validApplications.filter(app => String(app.referredBy || '').toLowerCase() === String(partner.referralCode || '').toLowerCase());
                    const closedCount = partnerApps.filter(a => CLOSED_STATUSES.includes(String(a.status || '').toLowerCase())).length;
                    const parentHr = hrs.find(h => h.id === partner.parentHrId);
                    return (
                      <tr key={partner.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#f1f5f9', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {partner.profilePhoto ? (
                                <img src={partner.profilePhoto} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ fontWeight: 800, color: '#059669', fontSize: '1.05rem' }}>
                                  {partner.name?.charAt(0)?.toUpperCase() || 'P'}
                                </div>
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#1e293b' }}>{partner.name}</div>
                              {parentHr && (
                                <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 600, marginTop: '2px' }}>
                                  HR: {parentHr.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{partner.email}</div>
                          {(partner.mobile || partner.phone) ? (
                            <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                              <span>📱</span>
                              <a href={'tel:' + (partner.mobile || partner.phone)} style={{ color: '#047857', textDecoration: 'none' }}>
                                {partner.mobile || partner.phone}
                              </a>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>📱</span> <span>—</span>
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                            {partner.referralCode}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#3b82f6' }}>{partner.linkClicks || 0}</td>
                        <td>
                          <div
                            onClick={() => {
                              setSelectedHrForCandidates(partner);
                              setHrCandidateSearch('');
                              setHrCandidateStatusFilter('all');
                            }}
                            style={{
                              background: '#ecfdf5',
                              color: '#065f46',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1.5px solid #a7f3d0',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              flexDirection: 'column',
                              gap: '2px',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#d1fae5';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 3px 6px rgba(16, 185, 129, 0.2)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#ecfdf5';
                              e.currentTarget.style.transform = 'none';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            title={'Click to view all candidates referred by ' + partner.name}
                          >
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              👥 {partnerApps.length}
                              <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>Candidates</span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                              {closedCount} closed →
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: '#059669' }}>
                          ₹{(partner.incentives || 0).toLocaleString()}
                        </td>
                        <td><span className="badge badge-active">Active</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn-secondary"
                              style={{ padding: '4px 8px', color: '#2563eb', background: '#eff6ff', borderColor: '#bfdbfe' }}
                              title="Edit Partner Details"
                              onClick={() => {
                                setPartnerToEdit(partner);
                                setPartnerForm({
                                  name: partner.name || '',
                                  email: partner.email || '',
                                  password: '',
                                  mobile: partner.mobile || '',
                                  parentHrId: partner.parentHrId || (hrs[0]?.id || ''),
                                  profilePhoto: partner.profilePhoto || ''
                                });
                                setPartnerError('');
                                setPartnerModalOpen(true);
                              }}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '0.775rem', color: '#059669', background: '#ecfdf5', borderColor: '#a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              title="Edit Partner Incentives"
                              onClick={() => {
                                setSelectedHrForIncentive(partner);
                                const initial = {};
                                partnerApps.forEach(app => { initial[app.id] = Number(app.incentiveAmount) || 0; });
                                setIncentiveInput(initial);
                                setIncentiveError('');
                                setIncentiveModalOpen(true);
                              }}
                            >
                              <Gift size={12} /> Candidate Incentives
                            </button>
                            <button
                              className="btn-secondary"
                              style={{ padding: '4px 8px', color: '#ef4444' }}
                              onClick={async () => {
                                if (!window.confirm('Delete Partner ' + partner.name + '?')) return;
                                try {
                                  const hrId = partner.parentHrId;
                                  const url = hrId ? (API_URL + '/api/users/hr/' + hrId + '/agents/' + partner.id) : (API_URL + '/api/users/agents/' + partner.id);
                                  await fetch(url, { method: 'DELETE' });
                                  fetchAllData();
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {allAgents.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No partners found. Add one to get started.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Partner Cards Grid (Visible on Mobile <= 768px, Hidden on Desktop) */}
            <div className="hrs-mobile-cards">
              {allAgents.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  No partners found. Add one to get started.
                </div>
              ) : (
                allAgents.map(partner => {
                  const partnerApps = validApplications.filter(app => String(app.referredBy || '').toLowerCase() === String(partner.referralCode || '').toLowerCase());
                  const closedCount = partnerApps.filter(a => CLOSED_STATUSES.includes(String(a.status || '').toLowerCase())).length;
                  return (
                    <div
                      key={partner.id}
                      style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            background: '#f8fafc',
                            border: '2px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 2px 5px rgba(0,0,0,0.06)'
                          }}>
                            {partner.profilePhoto ? (
                              <img src={partner.profilePhoto} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ fontWeight: 800, color: '#059669', fontSize: '1.15rem' }}>
                                {partner.name?.charAt(0)?.toUpperCase() || 'P'}
                              </div>
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {partner.name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {partner.email}
                            </div>
                            {partner.mobile && (
                              <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600 }}>
                                📱 {partner.mobile}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          <span className="badge badge-active" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Active</span>
                        </div>
                      </div>

                      {/* Metrics Pill Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
                        <div style={{ background: '#fef3c7', color: '#92400e', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 600 }}>Referral:</span>
                          <span style={{ fontWeight: 800 }}>{partner.referralCode}</span>
                        </div>
                        <div style={{ background: '#eff6ff', color: '#1e40af', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 600 }}>Clicks:</span>
                          <span style={{ fontWeight: 800 }}>{partner.linkClicks || 0}</span>
                        </div>
                        <div 
                          onClick={() => {
                            setSelectedHrForCandidates(partner);
                            setHrCandidateSearch('');
                            setHrCandidateStatusFilter('all');
                          }}
                          style={{ 
                            background: '#ecfdf5', 
                            color: '#065f46', 
                            padding: '6px 10px', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            border: '1.5px solid #a7f3d0',
                            cursor: 'pointer'
                          }}
                          title={'View candidates for ' + partner.name}
                        >
                          <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>Candidates:</span>
                          <span style={{ fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            {partnerApps.length} <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#047857' }}>({closedCount} closed)</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669' }}>→</span>
                          </span>
                        </div>
                        <div style={{ background: '#f0fdf4', color: '#166534', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 600 }}>Earned:</span>
                          <span style={{ fontWeight: 800 }}>₹{(partner.incentives || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: '7px 10px', fontSize: '0.78rem', color: '#2563eb', background: '#eff6ff', borderColor: '#bfdbfe', justifyContent: 'center' }}
                          onClick={() => {
                            setPartnerToEdit(partner);
                            setPartnerForm({
                              name: partner.name || '',
                              email: partner.email || '',
                              password: '',
                              mobile: partner.mobile || '',
                              parentHrId: partner.parentHrId || (hrs[0]?.id || ''),
                              profilePhoto: partner.profilePhoto || ''
                            });
                            setPartnerError('');
                            setPartnerModalOpen(true);
                          }}
                        >
                          <Edit size={13} /> Edit Partner
                        </button>

                        <button
                          className="btn-secondary"
                          style={{ padding: '7px 10px', fontSize: '0.78rem', color: '#059669', background: '#ecfdf5', borderColor: '#a7f3d0', justifyContent: 'center' }}
                          onClick={() => {
                            setSelectedHrForIncentive(partner);
                            const initial = {};
                            partnerApps.forEach(app => { initial[app.id] = Number(app.incentiveAmount) || 0; });
                            setIncentiveInput(initial);
                            setIncentiveError('');
                            setIncentiveModalOpen(true);
                          }}
                        >
                          <Gift size={13} /> Incentives
                        </button>

                        <button
                          className="btn-secondary"
                          style={{ padding: '7px 10px', fontSize: '0.78rem', color: '#ef4444', background: '#fef2f2', borderColor: '#fecaca', justifyContent: 'center' }}
                          onClick={async () => {
                            if (!window.confirm('Delete Partner ' + partner.name + '?')) return;
                            try {
                              const hrId = partner.parentHrId;
                              const url = hrId ? (API_URL + '/api/users/hr/' + hrId + '/agents/' + partner.id) : (API_URL + '/api/users/agents/' + partner.id);
                              await fetch(url, { method: 'DELETE' });
                              fetchAllData();
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        
        `;

  content = content.substring(0, startIdx) + newBlock + content.substring(endIdx);
  fs.writeFileSync(file, content, 'utf8');
  console.log('SUCCESSFULLY_UPDATED_PARTNERS_TAB');
} else {
  console.error('startIdx or endIdx not found', startIdx, endIdx);
}
