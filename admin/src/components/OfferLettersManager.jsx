import { uploadToCloudinary } from '../utils/cloudinary';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText,
  Upload,
  Search,
  Eye,
  Download,
  Trash2,
  Calendar,
  DollarSign,
  Building,
  User,
  CheckCircle,
  X,
  Filter
} from 'lucide-react';

// Helper to reliably extract offer letter from document fields or encoded notes
export function extractOffer(app) {
  if (!app) return null;
  const formatUrl = (u) => {
    if (!u) return '';
    let res = String(u).trim();
    if (res.includes('res.cloudinary.com')) {
      res = res.replace('/raw/upload/', '/image/upload/');
      if (res.toLowerCase().endsWith('.pdf')) {
        res = res.replace(/\.pdf$/i, '.jpg');
      }
    }
    return res;
  };

  if (app.offerLetterUrl && String(app.offerLetterUrl).trim()) {
    return {
      url: formatUrl(app.offerLetterUrl),
      ctc: app.offeredCtc || '',
      date: app.offerJoiningDate || app.joiningDate || ''
    };
  }
  const notes = app.adminNotes || app.coverNotes || app.notes;
  if (notes && typeof notes === 'string') {
    const match = notes.match(/\[OFFER:(\{.*?\})\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        if (parsed.url) {
          return {
            url: formatUrl(parsed.url),
            ctc: parsed.ctc || app.offeredCtc || '',
            date: parsed.date || app.offerJoiningDate || app.joiningDate || ''
          };
        }
      } catch (e) {}
    }
    const cldMatch = notes.match(/(https:\/\/res\.cloudinary\.com[^\s"'>]+)/);
    if (cldMatch) {
      return {
        url: formatUrl(cldMatch[1]),
        ctc: app.offeredCtc || '',
        date: app.offerJoiningDate || app.joiningDate || ''
      };
    }
  }
  return null;
}

export default function OfferLettersManager({ API_URL, currentUser, hrApplications, adminApplications }) {
  const [offerLetters, setOfferLetters] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Upload Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [offeredCtc, setOfferedCtc] = useState('');
  const [notes, setNotes] = useState('');
  const [fileBase64, setFileBase64] = useState('');
  const [rawFile, setRawFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  // Preview Lightbox State
  const [previewFile, setPreviewFile] = useState(null);

  const role = currentUser?.role || 'admin';
  const isHr = role === 'hr';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        role: role,
        userId: currentUser?.id || currentUser?._id || '',
        referralCode: currentUser?.referralCode || '',
        branch: currentUser?.branch || '',
        teamLeaderId: currentUser?.teamLeaderId || ''
      }).toString();

      const [offersRes, appsRes] = await Promise.all([
        fetch(`${API_URL}/api/offer-letters?${queryParams}`).then(r => r.json()).catch(() => []),
        fetch(`${API_URL}/api/applications`).then(r => r.json()).catch(() => [])
      ]);

      const validOffers = Array.isArray(offersRes) ? offersRes : [];
      const validApps = Array.isArray(appsRes) ? appsRes : [];
      
      // Combine all available application pools (props + API)
      const allSourceApps = [
        ...(Array.isArray(hrApplications) ? hrApplications : []),
        ...(Array.isArray(adminApplications) ? adminApplications : []),
        ...validApps
      ];

      // Deduplicate applications by ID
      const appMap = new Map();
      allSourceApps.forEach(a => {
        const key = String(a.id || a._id || '');
        if (key && !appMap.has(key)) appMap.set(key, a);
      });
      const combinedApps = Array.from(appMap.values());
      setApplications(combinedApps);

      const seenIds = new Set();
      const consolidated = [];

      // 1. Process items from dedicated /api/offer-letters
      validOffers.forEach(o => {
        const idKey = String(o.id || o._id || '');
        if (idKey && !seenIds.has(idKey)) {
          seenIds.add(idKey);
          consolidated.push(o);
        }
      });

      // 2. Extract any applications having offerLetterUrl or encoded in adminNotes
      const hrCode = String(currentUser?.referralCode || '').toLowerCase();
      const hrId = String(currentUser?.id || currentUser?._id || '');

      combinedApps.forEach(a => {
        const idKey = String(a.id || a._id || '');
        if (seenIds.has(idKey)) return;

        const offer = extractOffer(a);
        if (!offer) return;

        if (isHr) {
          const matchCode = hrCode && String(a.referredBy || '').toLowerCase() === hrCode;
          const matchHrId = hrId && (String(a.offerLetterUploadedBy || '') === hrId || String(a.hrId || '') === hrId);
          if (!matchCode && !matchHrId) return;
        }

        seenIds.add(idKey);
        consolidated.push({
          ...a,
          id: idKey,
          candidateName: a.candidateName || a.candidateDetails?.name || 'Candidate',
          candidateEmail: a.candidateEmail || a.candidateDetails?.email || '',
          candidateMobile: a.candidateMobile || a.candidateDetails?.mobile || '',
          jobTitle: a.jobTitle || 'Designation',
          companyName: a.companyName || 'Company',
          hrName: a.hrName || a.referringHrName || currentUser?.name || 'HR Executive',
          hrCode: a.referredBy || '',
          offerLetterUrl: offer.url,
          offeredCtc: offer.ctc,
          offerJoiningDate: offer.date,
          offerLetterUploadedAt: a.offerLetterUploadedAt || a.updatedAt || new Date().toISOString(),
          uploaderName: a.offerLetterUploaderName || a.uploaderName || currentUser?.name || 'HR Executive'
        });
      });

      setOfferLetters(consolidated);
    } catch (err) {
      console.error('Error fetching offer letters:', err);
      setError('Failed to load offer letters');
    } finally {
      setLoading(false);
    }
  }, [API_URL, role, currentUser, hrApplications, adminApplications]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Candidate options for HR to upload offer letters for
  const selectableCandidates = useMemo(() => {
    const hrCode = String(currentUser?.referralCode || '').toLowerCase();
    return applications.filter(app => {
      const s = String(app.status || '').toLowerCase().trim();
      const isClosedOrSelected = ['selected', 'closed', 'joined', 'converted', 'hired', 'joined manipal'].includes(s) || s.includes('select');
      const isMyCand = !isHr || String(app.referredBy || '').toLowerCase() === hrCode || String(app.hrCode || '').toLowerCase() === hrCode;
      return isClosedOrSelected && isMyCand;
    });
  }, [applications, currentUser, isHr]);

  const filteredLetters = useMemo(() => {
    return offerLetters.filter(item => {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        (item.candidateName && item.candidateName.toLowerCase().includes(q)) ||
        (item.jobTitle && item.jobTitle.toLowerCase().includes(q)) ||
        (item.companyName && item.companyName.toLowerCase().includes(q)) ||
        (item.hrName && item.hrName.toLowerCase().includes(q)) ||
        (item.branch && item.branch.toLowerCase().includes(q))
      );
    });
  }, [offerLetters, search]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError('File size must be under 15MB');
      return;
    }

    setFileName(file.name);
    setRawFile(file);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppId) {
      setError('Please select a candidate');
      return;
    }
    if (!fileBase64) {
      setError('Please select an offer letter document (PDF / JPG / PNG)');
      return;
    }

    try {
      setUploading(true);
      setError('');

      let finalOfferUrl = fileBase64;
      if (rawFile) {
        try {
          const cldRes = await uploadToCloudinary(rawFile);
          if (typeof cldRes === 'string' && cldRes.trim()) {
            finalOfferUrl = cldRes;
          } else if (cldRes && (cldRes.secure_url || cldRes.url)) {
            finalOfferUrl = cldRes.secure_url || cldRes.url;
          }
        } catch (cldErr) {
          console.warn('Cloudinary upload fallback to data URL:', cldErr);
        }
      }

      // Dual write: send to both /api/offer-letters and /api/applications/:id/status
      const payload = {
        applicationId: selectedAppId,
        offerLetterBase64: finalOfferUrl,
        offerLetterUrl: finalOfferUrl,
        joiningDate,
        offeredCtc,
        notes,
        offerNotes: notes,
        uploadedBy: currentUser?.id || currentUser?._id || '',
        uploaderName: currentUser?.name || 'HR Executive'
      };

      await Promise.allSettled([
        fetch(`${API_URL}/api/offer-letters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }),
        fetch(`${API_URL}/api/applications/${selectedAppId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offerLetterUrl: finalOfferUrl,
            offeredCtc,
            joiningDate,
            offerNotes: notes,
            adminNotes: notes ? `${notes} [OFFER:${JSON.stringify({ url: finalOfferUrl, ctc: offeredCtc, date: joiningDate })}]` : `[OFFER:${JSON.stringify({ url: finalOfferUrl, ctc: offeredCtc, date: joiningDate })}]`,
            uploadedBy: currentUser?.id || currentUser?._id || '',
            uploaderName: currentUser?.name || 'HR Executive'
          })
        })
      ]);

      setSuccess('Offer letter uploaded and attached successfully!');
      setTimeout(() => setSuccess(''), 4000);
      setModalOpen(false);
      setSelectedAppId('');
      setFileBase64('');
      setFileName('');
      setRawFile(null);
      setJoiningDate('');
      setOfferedCtc('');
      setNotes('');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to upload offer letter');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (appId, candName) => {
    if (!window.confirm(`Delete offer letter record for ${candName}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/offer-letters/${appId}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Offer letter removed successfully');
        setTimeout(() => setSuccess(''), 3000);
        loadData();
      }
    } catch (err) {
      setError('Failed to remove offer letter');
    }
  };

  const getFullFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  return (
    <div style={{ padding: '0 0 2rem 0' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={24} color="#2563eb" /> Offer Letters Repository
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
            Upload, verify, view, and store candidate offer letters safely across all branches and roles.
          </p>
        </div>

        {isHr && (
          <button
            className="btn-primary"
            onClick={() => { setModalOpen(true); setError(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px' }}
          >
            <Upload size={16} /> Upload Offer Letter
          </button>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Offer Letters</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{offerLetters.length}</div>
          <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>Archived & Downloadable</div>
        </div>

        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>With Joining Date</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
            {offerLetters.filter(o => o.offerJoiningDate).length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>Onboarding Tracked</div>
        </div>

        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>CTC Specified</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            {offerLetters.filter(o => o.offeredCtc).length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '4px' }}>Commercials Documented</div>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '10px', marginBottom: '1.25rem', fontWeight: 600 }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '10px', marginBottom: '1.25rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, background: '#f8fafc', padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search offer letters by candidate name, designation, company, HR, branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0f172a' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
          )}
        </div>
      </div>

      {/* Table & Cards */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading offer letters...</div>
        ) : filteredLetters.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <FileText size={48} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700, margin: 0 }}>No Offer Letters Found</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
              {search ? 'No offer letters match your search query.' : 'Offer letters uploaded for candidates will be archived and presented here.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Candidate</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Role & Company</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Offered CTC</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Joining Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>HR & Branch</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLetters.map((item, idx) => {
                  const fileUrl = getFullFileUrl(item.offerLetterUrl);
                  const isPdf = item.offerLetterUrl && item.offerLetterUrl.toLowerCase().includes('.pdf');

                  return (
                    <tr key={item.id || item._id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{item.candidateName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{item.candidateEmail || item.candidateMobile}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{item.jobTitle}</div>
                        <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>{item.companyName}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {item.offeredCtc ? (
                          <span style={{ background: '#ecfdf5', color: '#047857', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                            ₹{item.offeredCtc}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {item.offerJoiningDate ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: 600, fontSize: '0.85rem' }}>
                            <Calendar size={14} color="#64748b" /> {item.offerJoiningDate}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Pending</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>{item.hrName || 'Direct'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Branch: {item.branch || 'General'}</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => {
                              if (isPdf) {
                                window.open(fileUrl, '_blank');
                              } else {
                                setPreviewFile(fileUrl);
                              }
                            }}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}
                            title="View Offer Letter"
                          >
                            <Eye size={14} /> View
                          </button>

                          <a
                            href={fileUrl}
                            download={`${item.candidateName}_Offer_Letter`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', color: '#475569', textDecoration: 'none' }}
                            title="Download Offer Letter"
                          >
                            <Download size={14} />
                          </a>

                          {(role === 'admin' || isHr) && (
                            <button
                              onClick={() => handleDelete(item.id || item._id, item.candidateName)}
                              className="btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '0.8rem', background: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }}
                              title="Delete Offer Letter Record"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Offer Letter Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '550px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ background: '#2563eb', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Upload Candidate Offer Letter</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  1. Select Candidate *
                </label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="">-- Choose Candidate --</option>
                  {selectableCandidates.map(c => (
                    <option key={c.id || c._id} value={c.id || c._id}>
                      {c.candidateName} — {c.jobTitle} ({c.companyName})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  2. Choose Offer Letter File (PDF / JPG / PNG) *
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
                {fileName && <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '4px', fontWeight: 600 }}>Selected: {fileName}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    3. Offered CTC (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3.5 LPA or 35,000 / mo"
                    value={offeredCtc}
                    onChange={(e) => setOfferedCtc(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    4. Joining Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  5. Remarks / Verification Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes regarding branch onboarding or appointment clearance..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={uploading}
                  style={{ padding: '10px 22px', borderRadius: '8px' }}
                >
                  {uploading ? 'Uploading...' : 'Save Offer Letter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewFile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '850px', width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: '#0f172a' }}>Offer Letter Preview</span>
              <button onClick={() => setPreviewFile(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', justifyContent: 'center', background: '#f8fafc' }}>
              <img src={previewFile} alt="Offer Letter" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <a href={previewFile} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 16px', borderRadius: '8px' }}>
                Open Original Window
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

