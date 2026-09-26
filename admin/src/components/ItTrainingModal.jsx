import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

export default function ItTrainingModal({ isOpen, onClose, onSave, processToEdit }) {
  const [formData, setFormData] = useState({
    processName: '',
    itCategory: 'Placement',
    programTitle: '',
    role: '',
    salary: '',
    location: '',
    trainingPeriod: '',
    trainingSubtext: '',
    stipend: '',
    stipendSubtext: '',
    trainingFee: '',
    feeSubtext: '',
    bondPeriod: '',
    originalsRequired: 'Originals Need to Submit',
    description: '',
    status: 'Active',
    order: 1
  });

  const [trainingPhases, setTrainingPhases] = useState([
    { title: 'Phase 1 Training', duration: '3 Months', mode: 'Classroom Training', stipend: 'STIPEND ₹12,000' },
    { title: 'Phase 2 Training', duration: '3 Months', mode: 'Real Project Training (OJT)', stipend: 'STIPEND ₹12,000' }
  ]);

  const [selectionSteps, setSelectionSteps] = useState([
    { stepNumber: 1, title: 'Screening & Registration', description: 'Application review and initial profile shortlisting' },
    { stepNumber: 2, title: 'Technical Assessment', description: 'Basic coding, problem solving and aptitude round' },
    { stepNumber: 3, title: 'Technical & HR Interview', description: 'Discussion with hiring manager & interview clearance' },
    { stepNumber: 4, title: 'Batch Onboarding', description: 'Offer letter issuance, document submission, and training commencement' }
  ]);

  useEffect(() => {
    if (processToEdit) {
      setFormData({
        processName: processToEdit.processName || '',
        itCategory: processToEdit.itCategory || 'Placement',
        programTitle: processToEdit.programTitle || '',
        role: processToEdit.role || '',
        salary: processToEdit.salary || '',
        location: processToEdit.location || '',
        trainingPeriod: processToEdit.trainingPeriod || '',
        trainingSubtext: processToEdit.trainingSubtext || '',
        stipend: processToEdit.stipend || '',
        stipendSubtext: processToEdit.stipendSubtext || '',
        trainingFee: processToEdit.trainingFee || '',
        feeSubtext: processToEdit.feeSubtext || '',
        bondPeriod: processToEdit.bondPeriod || '',
        originalsRequired: processToEdit.originalsRequired || 'Originals Need to Submit',
        description: processToEdit.description || '',
        status: processToEdit.status || 'Active',
        order: processToEdit.order || 1
      });
      if (processToEdit.trainingPhases && Array.isArray(processToEdit.trainingPhases) && processToEdit.trainingPhases.length > 0) {
        setTrainingPhases(processToEdit.trainingPhases);
      } else if (processToEdit.trainingSubtext && processToEdit.trainingSubtext.includes('|')) {
        const parts = processToEdit.trainingSubtext.split('|');
        setTrainingPhases([
          { title: 'Phase 1 Training', duration: parts[0]?.trim() || '3 Months', mode: 'Classroom Training', stipend: `STIPEND ₹${processToEdit.stipend || '12,000'}` },
          { title: 'Phase 2 Training', duration: parts[1]?.trim() || '3 Months', mode: 'Real Project Training (OJT)', stipend: `STIPEND ₹${processToEdit.stipend || '12,000'}` }
        ]);
      } else {
        setTrainingPhases([
          { title: 'Phase 1 Training', duration: processToEdit.trainingPeriod || '3 Months', mode: 'Classroom Training', stipend: `STIPEND ₹${processToEdit.stipend || '12,000'}` },
          { title: 'Phase 2 Training', duration: '3 Months', mode: 'Real Project Training (OJT)', stipend: `STIPEND ₹${processToEdit.stipend || '12,000'}` }
        ]);
      }
      if (processToEdit.selectionSteps && Array.isArray(processToEdit.selectionSteps)) {
        setSelectionSteps(processToEdit.selectionSteps);
      }
    } else {
      setFormData({
        processName: '',
        itCategory: 'Placement',
        programTitle: 'FIC IT Training & 100% Placement Programme',
        role: 'Software Engineer Trainee',
        salary: '4.0 LPA + Incentives',
        location: 'PAN INDIA / Chennai / Bangalore',
        trainingPeriod: '6 Months',
        trainingSubtext: '3 Months Classroom Training | 3 Months Project Training',
        stipend: '12,000',
        stipendSubtext: 'Stipend ₹12,000 per month during training',
        trainingFee: '1.6 LPA',
        feeSubtext: 'Training Program Cost',
        bondPeriod: '1 Year Bond',
        originalsRequired: 'Originals Need to Submit',
        description: '',
        status: 'Active',
        order: 1
      });
      setTrainingPhases([
        { title: 'Phase 1 Training', duration: '3 Months', mode: 'Classroom Training', stipend: 'STIPEND ₹12,000' },
        { title: 'Phase 2 Training', duration: '3 Months', mode: 'Real Project Training (OJT)', stipend: 'STIPEND ₹12,000' }
      ]);
      setSelectionSteps([
        { stepNumber: 1, title: 'Screening & Registration', description: 'Application review and initial profile shortlisting' },
        { stepNumber: 2, title: 'Technical Assessment', description: 'Basic coding, problem solving and aptitude round' },
        { stepNumber: 3, title: 'Technical & HR Interview', description: 'Discussion with hiring manager & interview clearance' },
        { stepNumber: 4, title: 'Batch Onboarding', description: 'Offer letter issuance, document submission, and training commencement' }
      ]);
    }
  }, [processToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhaseChange = (index, field, value) => {
    const updated = [...trainingPhases];
    updated[index][field] = value;
    setTrainingPhases(updated);
  };

  const addPhase = () => {
    setTrainingPhases(prev => [
      ...prev,
      { title: `Phase ${prev.length + 1} Training`, duration: '3 Months', mode: 'Project Training (OJT)', stipend: `STIPEND ₹${formData.stipend || '12,000'}` }
    ]);
  };

  const removePhase = (index) => {
    setTrainingPhases(prev => prev.filter((_, i) => i !== index));
  };

  const handleStepChange = (index, field, value) => {
    const updated = [...selectionSteps];
    updated[index][field] = value;
    setSelectionSteps(updated);
  };

  const addStep = () => {
    setSelectionSteps(prev => [
      ...prev,
      { stepNumber: prev.length + 1, title: '', description: '' }
    ]);
  };

  const removeStep = (index) => {
    const filtered = selectionSteps.filter((_, i) => i !== index);
    const reindexed = filtered.map((s, i) => ({ ...s, stepNumber: i + 1 }));
    setSelectionSteps(reindexed);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.processName.trim()) {
      alert('Please enter Process Name (e.g. PROCESS 1, PROCESS 2)');
      return;
    }
    onSave({
      ...formData,
      trainingPhases,
      selectionSteps
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content animate-scale" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {processToEdit ? `Edit ${processToEdit.processName}` : 'Add New IT Training Process'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Configure training, stipend, bond, and originals requirement for candidates
            </p>
          </div>
          <button className="btn-close" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
          
          {/* ROW 1: Process Name, Category & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Process Name (Candidate Button Tab) *
              </label>
              <input
                type="text"
                name="processName"
                value={formData.processName}
                onChange={handleChange}
                placeholder="e.g. PROCESS 1 or PROCESS 2"
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                IT Category
              </label>
              <select
                name="itCategory"
                value={formData.itCategory}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
              >
                <option value="Placement">Placement (100% Guarantee)</option>
                <option value="Course">Course</option>
                <option value="Internship">Free Internship</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* ROW 2: Program Title & Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Program Title
              </label>
              <input
                type="text"
                name="programTitle"
                value={formData.programTitle}
                onChange={handleChange}
                placeholder="e.g. FIC IT Training & 100% Placement"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Role / Designation
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g. Software Engineer Trainee"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* ROW 3: CTC & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Fixed CTC / Salary
              </label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. 3.5 - 5.0 LPA"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Job Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. PAN INDIA / Chennai"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* ROW 4: Training Duration & Stipend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                ⏱️ Training Duration
              </label>
              <input
                type="text"
                name="trainingPeriod"
                value={formData.trainingPeriod}
                onChange={handleChange}
                placeholder="e.g. 6 Months"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
              />
              <input
                type="text"
                name="trainingSubtext"
                value={formData.trainingSubtext}
                onChange={handleChange}
                placeholder="e.g. 3 Months Classroom | 3 Months OJT"
                style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', marginTop: '4px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                💵 Stipend Amount
              </label>
              <input
                type="text"
                name="stipend"
                value={formData.stipend}
                onChange={handleChange}
                placeholder="e.g. 12,000 or 12 K"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
              />
              <input
                type="text"
                name="stipendSubtext"
                value={formData.stipendSubtext}
                onChange={handleChange}
                placeholder="e.g. Stipend 12k each month during training"
                style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', marginTop: '4px' }}
              />
            </div>
          </div>

          {/* ROW 5: Training Cost, Bond Period & Originals */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                💰 Training Cost
              </label>
              <input
                type="text"
                name="trainingFee"
                value={formData.trainingFee}
                onChange={handleChange}
                placeholder="e.g. 1.6 LPA or 2 LPA"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                📜 Bond Period
              </label>
              <input
                type="text"
                name="bondPeriod"
                value={formData.bondPeriod}
                onChange={handleChange}
                placeholder="e.g. 1 Year Bond or 2 Years Bond"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                📁 Originals Requirement
              </label>
              <input
                type="text"
                name="originalsRequired"
                value={formData.originalsRequired}
                onChange={handleChange}
                placeholder="e.g. Originals Need to Submit"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* IT TRAINING PHASES - only for Placement */}
          {formData.itCategory === 'Placement' && (
          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🎓 IT Training Phases (Phase 1, Phase 2, etc.)
                </span>
                <p style={{ fontSize: '0.75rem', color: '#15803d', margin: '2px 0 0 0' }}>
                  Add multiple learning stages with custom duration, training mode, and stipend
                </p>
              </div>
              <button
                type="button"
                onClick={addPhase}
                style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Add Phase
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {trainingPhases.map((phase, idx) => (
                <div key={idx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', background: '#dbeafe', padding: '3px 10px', borderRadius: '4px' }}>
                      PHASE {idx + 1} (Stage {idx + 1} of {trainingPhases.length})
                    </span>
                    {trainingPhases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePhase(idx)}
                        style={{ background: '#fee2e2', border: 'none', color: '#dc2626', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
                      >
                        <Trash2 size={12} /> Remove Phase
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>
                        Phase Title
                      </label>
                      <input
                        type="text"
                        value={phase.title || `Phase ${idx + 1} Training`}
                        onChange={(e) => handlePhaseChange(idx, 'title', e.target.value)}
                        placeholder={`Phase ${idx + 1} Training`}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.825rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>
                        ⏱️ Duration
                      </label>
                      <input
                        type="text"
                        value={phase.duration || ''}
                        onChange={(e) => handlePhaseChange(idx, 'duration', e.target.value)}
                        placeholder="e.g. 3 Months"
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.825rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>
                        🏫 Mode
                      </label>
                      <input
                        type="text"
                        value={phase.mode || ''}
                        onChange={(e) => handlePhaseChange(idx, 'mode', e.target.value)}
                        placeholder="e.g. Classroom Training"
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.825rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>
                        💵 Stipend / Salary
                      </label>
                      <input
                        type="text"
                        value={phase.stipend || ''}
                        onChange={(e) => handlePhaseChange(idx, 'stipend', e.target.value)}
                        placeholder="e.g. STIPEND ₹12,000"
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.825rem' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* SELECTION & INTERVIEW STEPS - only for Placement */}
          {formData.itCategory === 'Placement' && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>
                📋 Selection & Interview Steps
              </span>
              <button
                type="button"
                onClick={addStep}
                style={{ background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Add Step
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectionSteps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                    placeholder="Step Title"
                    style={{ flex: '1', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                  <input
                    type="text"
                    value={step.description}
                    onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                    placeholder="Step Description"
                    style={{ flex: '1.5', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                  {selectionSteps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      style={{ background: '#fee2e2', border: 'none', color: '#dc2626', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          )}

          {/* FOOTER ACTIONS */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ padding: '10px 18px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}
            >
              <Save size={16} /> Save Process
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
