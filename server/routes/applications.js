const express = require('express');
const router = express.Router();
const { readDBAsync, ApplicationModel, CandidateModel, JobModel } = require('../db');

// GET /api/applications (supports ?candidateId=xxx & ?status=xxx & ?jobId=xxx)
router.get('/', async (req, res) => {
  try {
    const { candidateId, status, jobId } = req.query;
    const db = await readDBAsync();
    let apps = db.applications || [];

    if (candidateId) {
      apps = apps.filter(a => a.candidateId === candidateId);
    }
    if (jobId) {
      apps = apps.filter(a => a.jobId === jobId);
    }
    if (status) {
      apps = apps.filter(a => a.status && a.status.toLowerCase() === status.toLowerCase());
    }

    // Populate references
    const populated = apps.map(app => {
      const candidate = db.candidates.find(c => c.id === app.candidateId) || {};
      const job = db.jobs.find(j => j.id === app.jobId) || {};
      const company = db.companies.find(c => c.id === app.companyId || c.id === job.companyId) || {};

      return {
        ...app,
        candidateName: candidate.name || 'Anonymous',
        candidateEmail: candidate.email || '',
        candidateMobile: candidate.mobile || '',
        candidateLocation: candidate.location || '',
        candidateQualification: candidate.qualification || '',
        candidateExperience: candidate.experience || '',
        candidateResumeUrl: candidate.resumeUrl || '',
        jobTitle: job.title || 'Untitled Job',
        jobLocation: job.location || '',
        companyName: company.name || 'Unknown Company',
        companyLogo: company.logo || ''
      };
    });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications from MongoDB Atlas.' });
  }
});

// POST /api/applications (Candidate applies for job)
router.post('/', async (req, res) => {
  try {
    const { candidateId, jobId, resumeUrl, coverNotes } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required.' });
    }

    const db = await readDBAsync();
    const job = db.jobs.find(j => j.id === jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job post not found.' });
    }

    let cand = db.candidates.find(c => c.id === candidateId);
    if (!cand && req.body.candidateDetails) {
      const cDet = req.body.candidateDetails;
      const newCandData = {
        id: 'cand_' + Date.now(),
        userId: cDet.userId || 'usr_guest',
        name: cDet.name || 'Guest Candidate',
        email: cDet.email || 'guest@example.com',
        mobile: cDet.mobile || '',
        location: cDet.location || '',
        qualification: cDet.qualification || '',
        experience: cDet.experience || '',
        skills: Array.isArray(cDet.skills) ? cDet.skills : [],
        resumeUrl: resumeUrl || cDet.resumeUrl || '',
        createdAt: new Date().toISOString()
      };
      cand = await CandidateModel.create(newCandData);
    }

    const effectiveCandId = cand ? cand.id : (candidateId || 'cand_1');

    // Check if candidate already applied to this job
    const existingApp = await ApplicationModel.findOne({ candidateId: effectiveCandId, jobId });
    if (existingApp) {
      return res.status(400).json({ error: 'You have already applied for this position.', application: existingApp.toObject() });
    }

    const appNumber = 'JOB-' + Math.floor(100000 + Math.random() * 900000);
    const newApp = {
      id: 'app_' + Date.now(),
      applicationNumber: appNumber,
      candidateId: effectiveCandId,
      jobId,
      companyId: job.companyId,
      categoryId: job.categoryId,
      status: 'Applied',
      appliedAt: new Date().toISOString(),
      adminNotes: coverNotes ? `Candidate Notes: ${coverNotes}` : '',
      updatedAt: new Date().toISOString()
    };

    const savedApp = await ApplicationModel.create(newApp);
    console.log('✅ Application saved directly to MongoDB Atlas Cloud:', savedApp.id);
    res.status(201).json(savedApp.toObject());
  } catch (err) {
    console.error('Error applying in MongoDB Atlas:', err);
    res.status(500).json({ error: 'Failed to save application to MongoDB Atlas.' });
  }
});

// PUT /api/applications/:id/status (Admin updates candidate application status)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const updateObj = { updatedAt: new Date().toISOString() };
    if (status) updateObj.status = status;
    if (adminNotes !== undefined) updateObj.adminNotes = adminNotes;

    const updated = await ApplicationModel.findOneAndUpdate({ id }, { $set: updateObj }, { new: true }).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application status in MongoDB Atlas.' });
  }
});

module.exports = router;

