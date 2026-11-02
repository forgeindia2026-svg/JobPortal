const fs = require('fs');
const file = 'c:/Users/Admin/Desktop/Jobs/admin/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = "{/* ===== ADD / EDIT HR MODAL ===== */}";
const targetIdx = content.indexOf(targetStr);

if (targetIdx !== -1) {
  const partnerModalJSX = `{/* ===== ADD / EDIT PARTNER MODAL ===== */}
      {partnerModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'white', margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  {partnerToEdit ? 'Edit Partner Details' : 'Add New Partner'}
                </h3>
                <p style={{ color: '#d1fae5', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  {partnerToEdit ? 'Update details, photo and credentials' : 'Create login credentials for the Partner'}
                </p>
              </div>
              <button onClick={() => { setPartnerModalOpen(false); setPartnerToEdit(null); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                <XCircle size={20} />
              </button>
            </div>

            {/* Form Body */}
            <div style={{ padding: '2rem' }}>
              {partnerError && (
                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid #fecaca' }}>
                  ⚠️ {partnerError}
                </div>
              )}

              {/* Profile Photo Upload */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', width: '84px', height: '84px', borderRadius: '50%', background: '#f1f5f9', border: '3px solid #e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  {partnerForm.profilePhoto ? (
                    <img src={partnerForm.profilePhoto} alt="Partner Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ fontSize: '2rem', color: '#059669', fontWeight: 800 }}>
                      {partnerForm.name ? partnerForm.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
                  <label style={{ cursor: partnerPhotoUploading ? 'not-allowed' : 'pointer', background: '#ecfdf5', color: '#059669', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: partnerPhotoUploading ? 0.7 : 1 }}>
                    {partnerPhotoUploading ? '⏳ Uploading...' : '📷 Upload Photo'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={partnerPhotoUploading}
                      style={{ display: 'none' }} 
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          setPartnerError('Image file is too large! Please select under 5MB.');
                          return;
                        }
                        setPartnerPhotoUploading(true);
                        setPartnerError('');
                        try {
                          const cloudUrl = await uploadToCloudinary(file);
                          setPartnerForm(prev => ({ ...prev, profilePhoto: cloudUrl }));
                        } catch (err) {
                          setPartnerError('Failed to upload image: ' + (err.message || ''));
                        } finally {
                          setPartnerPhotoUploading(false);
                        }
                      }}
                    />
                  </label>
                  {partnerForm.profilePhoto && (
                    <button 
                      type="button"
                      onClick={() => setPartnerForm(prev => ({ ...prev, profilePhoto: '' }))}
                      style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh K"
                  value={partnerForm.name}
                  onChange={e => setPartnerForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@partner.com"
                  value={partnerForm.email}
                  onChange={e => setPartnerForm(f => ({ ...f, email: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={partnerForm.mobile}
                  onChange={e => setPartnerForm(f => ({ ...f, mobile: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {!partnerToEdit && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>Assign Under HR *</label>
                  <select
                    value={partnerForm.parentHrId}
                    onChange={e => setPartnerForm(f => ({ ...f, parentHrId: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                  >
                    {hrs.map(h => (
                      <option key={h.id} value={h.id}>{h.name} ({h.referralCode})</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>
                  {partnerToEdit ? 'New Password (optional)' : 'Login Password *'}
                </label>
                <input
                  type="password"
                  placeholder={partnerToEdit ? "Leave blank to keep current password" : "Set a password for this Partner"}
                  value={partnerForm.password}
                  onChange={e => setPartnerForm(f => ({ ...f, password: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setPartnerModalOpen(false); setPartnerToEdit(null); }}
                  style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Cancel
                </button>
                <button
                  disabled={partnerSaving || partnerPhotoUploading}
                  onClick={async () => {
                    if (!partnerForm.name || !partnerForm.email) {
                      setPartnerError('Name and Email are required!');
                      return;
                    }
                    if (!partnerToEdit && !partnerForm.password) {
                      setPartnerError('Password is required for new Partner accounts!');
                      return;
                    }
                    setPartnerSaving(true);
                    setPartnerError('');
                    try {
                      let res;
                      if (partnerToEdit) {
                        res = await fetch(API_URL + '/api/users/agents/' + partnerToEdit.id, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(partnerForm)
                        });
                      } else {
                        const hrId = partnerForm.parentHrId || (hrs[0]?.id);
                        res = await fetch(API_URL + '/api/users/hr/' + hrId + '/agents', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(partnerForm)
                        });
                      }

                      const data = await res.json();
                      if (!res.ok || data.error) {
                        setPartnerError(data.error || 'Failed to save partner account');
                      } else {
                        setPartnerModalOpen(false);
                        setPartnerToEdit(null);
                        fetchAllData();
                      }
                    } catch (err) {
                      setPartnerError('Network error. Failed to save partner.');
                    } finally {
                      setPartnerSaving(false);
                    }
                  }}
                  style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', opacity: partnerSaving ? 0.7 : 1 }}
                >
                  {partnerSaving ? 'Saving...' : (partnerToEdit ? 'Save Changes' : 'Create Partner Account')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      `;

  content = content.substring(0, targetIdx) + partnerModalJSX + content.substring(targetIdx);
  fs.writeFileSync(file, content, 'utf8');
  console.log('SUCCESSFULLY_ADDED_PARTNER_MODAL_JSX');
} else {
  console.error('Target not found for partner modal JSX');
}

