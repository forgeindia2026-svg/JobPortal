import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CompanyFormModal({ isOpen, onClose, companyToEdit, categories, API_URL, onSaveSuccess }) {
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState('Active');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (companyToEdit) {
      setCategoryId(companyToEdit.categoryId || '');
      setName(companyToEdit.name || '');
      setLogo(companyToEdit.logo || '');
      setDescription(companyToEdit.description || '');
      setWebsite(companyToEdit.website || '');
      setStatus(companyToEdit.status || 'Active');
    } else {
      if (categories.length > 0) setCategoryId(categories[0].id);
      setName('');
      setLogo('https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=200&auto=format&fit=crop&q=80');
      setDescription('');
      setWebsite('');
      setStatus('Active');
    }
  }, [companyToEdit, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = companyToEdit ? `${API_URL}/api/companies/${companyToEdit.id}` : `${API_URL}/api/companies`;
      const method = companyToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, name, logo, description, website, status })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save company');

      if (onSaveSuccess) onSaveSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{companyToEdit ? 'Edit Company' : 'Add New Company'}</h3>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input type="text" className="form-input" placeholder="e.g. Axis Bank, Infosys" required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Company Logo URL</label>
              <input type="text" className="form-input" placeholder="https://..." value={logo} onChange={e => setLogo(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Company Description</label>
              <textarea className="form-textarea" rows="3" placeholder="Brief overview of company..." value={description} onChange={e => setDescription(e.target.value)}></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input type="text" className="form-input" placeholder="https://company.com" value={website} onChange={e => setWebsite(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.25rem' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Company'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
