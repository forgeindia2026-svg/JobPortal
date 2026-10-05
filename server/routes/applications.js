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
      let job = db.jobs.find(j => j.id === app.jobId);
      if (!job) {
        const itProc = (db.itTrainingProcesses || []).find(p => p.id === app.jobId);
        if (itProc) {
          const compName = itProc.itCategory === 'Course' ? 'FIC IT Courses' : itProc.itCategory === 'Internship' ? 'FIC Free IT Internship' : 'FIC IT Training & Placement';
          job = {
            id: itProc.id,
            title: itProc.role || itProc.programTitle || 'IT Trainee',
            location: itProc.location || 'PAN INDIA',
            companyId: 'comp_fic_it',
            companyName: compName
          };
        }
      }
      const company = db.companies.find(c => c.id === app.companyId || (job && c.id === job.companyId)) || {};

      let computedPaymentAmount = app.paymentAmount;
      if (!computedPaymentAmount) {
        const title = (job && job.title) ? String(job.title).toLowerCase() : '';
        const companyName = (job && job.companyName) ? String(job.companyName).toLowerCase() : '';
        if (title.includes('casa')) {
          computedPaymentAmount = 149;
        } else if (title.includes('free') || title.includes('internship') || companyName.includes('free') || companyName.includes('internship')) {
          computedPaymentAmount = 0;
        } else if (job && job.isFicFlow) {
          computedPaymentAmount = 1499;
        } else {
          computedPaymentAmount = 49;
        }
      }

      return {
        ...app,
        candidateName: candidate.name || 'Anonymous',
        candidateEmail: candidate.email || '',
        candidateMobile: candidate.mobile || '',
        candidateLocation: candidate.location || '',
        candidateQualification: candidate.qualification || '',
        candidateExperience: candidate.experience || '',
        candidateResumeUrl: candidate.resumeUrl || '',
        jobTitle: job ? (job.title || job.companyName || 'IT Training Enquiry') : 'Untitled Job',
        jobLocation: job ? (job.location || '') : '',
        companyName: (job && job.companyName) ? job.companyName : (company.name || 'Unknown Company'),
        companyLogo: company.logo || '/logo.png',
        paymentAmount: computedPaymentAmount
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
    const { candidateId, jobId, resumeUrl, coverNotes, referredBy, paymentId, paymentAmount } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required.' });
    }

    const db = await readDBAsync();
    let job = db.jobs.find(j => j.id === jobId);

    if (!job) {
      const itProc = (db.itTrainingProcesses || []).find(p => p.id === jobId);
      if (itProc) {
        const compName = itProc.itCategory === 'Course' ? 'FIC IT Courses' : itProc.itCategory === 'Internship' ? 'FIC Free IT Internship' : 'FIC IT Training & Placement';
        job = {
          id: itProc.id,
          title: itProc.role || itProc.programTitle || 'IT Trainee',
          companyId: 'comp_fic_it',
          companyName: compName,
          categoryId: 'cat_it'
        };
      }
    }

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
    let finalPaymentAmount = paymentAmount;
    if (!finalPaymentAmount) {
      const title = (job && job.title) ? String(job.title).toLowerCase() : '';
      const companyName = (job && job.companyName) ? String(job.companyName).toLowerCase() : '';
      if (title.includes('casa')) {
        finalPaymentAmount = 149;
      } else if (title.includes('free') || title.includes('internship') || companyName.includes('free') || companyName.includes('internship')) {
        finalPaymentAmount = 0;
      } else if (job && job.isFicFlow) {
        finalPaymentAmount = 1499;
      } else {
        finalPaymentAmount = 49;
      }
    }

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
      referredBy: referredBy || null,
      paymentId: paymentId || null,
      paymentAmount: finalPaymentAmount,
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

// PUT /api/applications/:id/status (Admin updates candidate application status or HR reference)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, referredBy } = req.body;

    const updateObj = { updatedAt: new Date().toISOString() };
    if (status) updateObj.status = status;
    if (adminNotes !== undefined) updateObj.adminNotes = adminNotes;
    if (referredBy !== undefined) updateObj.referredBy = referredBy || null;

    const updated = await ApplicationModel.findOneAndUpdate({ id }, { $set: updateObj }, { new: true }).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application status in MongoDB Atlas.' });
  }
});

// PUT /api/applications/:id/reference (Admin updates HR reference for an application)
router.put('/:id/reference', async (req, res) => {
  try {
    const { id } = req.params;
    const { referredBy } = req.body;

    const updated = await ApplicationModel.findOneAndUpdate(
      { id },
      { $set: { referredBy: referredBy || null, updatedAt: new Date().toISOString() } },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update HR reference in MongoDB Atlas.' });
  }
});

module.exports = router;

