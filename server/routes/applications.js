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
      const candidate = db.candidates.find(c => c.id === app.candidateId) || app.candidateDetails || {};
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
      if (computedPaymentAmount === undefined || computedPaymentAmount === null) {
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

      const cDet = app.candidateDetails || {};

      return {
        ...app,
        candidateName: candidate.name || cDet.name || 'Anonymous',
        candidateEmail: candidate.email || cDet.email || '',
        candidateMobile: candidate.mobile || cDet.mobile || '',
        candidateLocation: candidate.location || cDet.location || '',
        candidateQualification: candidate.qualification || cDet.qualification || '',
        candidateExperience: candidate.experience || cDet.experience || '',
        candidateResumeUrl: candidate.resumeUrl || cDet.resumeUrl || '',
        jobTitle: job ? (job.title || job.companyName || 'IT Training Enquiry') : 'Untitled Job',
        jobLocation: job ? (job.location || '') : '',
        companyName: (job && job.companyName) ? job.companyName : (company.name || 'Unknown Company'),
        companyLogo: company.logo || '/logo.png',
        paymentAmount: Number(computedPaymentAmount)
      };
    });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications from MongoDB Atlas.' });
  }
});

// POST /api/applications (Candidate applies for job or Admin manually adds application)
router.post('/', async (req, res) => {
  try {
    const { candidateId, jobId, resumeUrl, coverNotes, referredBy, paymentId, paymentAmount, status, appliedAt, adminNotes, isAdminManual } = req.body;

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

    let cand = candidateId ? db.candidates.find(c => c.id === candidateId) : null;
    const cDet = req.body.candidateDetails || {};

    if (!cand && (cDet.mobile || cDet.email)) {
      cand = db.candidates.find(c => (cDet.mobile && c.mobile === cDet.mobile) || (cDet.email && c.email === cDet.email));
    }

    if (!cand && req.body.candidateDetails) {
      const newCandData = {
        id: 'cand_' + Date.now(),
        userId: cDet.userId || 'usr_guest',
        name: cDet.name || 'Guest Candidate',
        email: cDet.email || '',
        mobile: cDet.mobile || '',
        location: cDet.location || '',
        qualification: cDet.qualification || '',
        experience: cDet.experience || '',
        skills: Array.isArray(cDet.skills) ? cDet.skills : [],
        resumeUrl: resumeUrl || cDet.resumeUrl || '',
        createdAt: new Date().toISOString()
      };
      cand = await CandidateModel.create(newCandData);
    } else if (cand && req.body.candidateDetails) {
      // Update any empty or newly provided fields for the candidate
      const updateData = {};
      if (cDet.name && !cand.name) updateData.name = cDet.name;
      if (cDet.location) updateData.location = cDet.location;
      if (cDet.qualification) updateData.qualification = cDet.qualification;
      if (cDet.experience) updateData.experience = cDet.experience;
      if (resumeUrl || cDet.resumeUrl) updateData.resumeUrl = resumeUrl || cDet.resumeUrl;
      if (Object.keys(updateData).length > 0) {
        await CandidateModel.updateOne({ id: cand.id }, { $set: updateData });
      }
    }

    const effectiveCandId = cand ? cand.id : (candidateId || 'cand_' + Date.now());

    // Check if candidate already applied to this job (only block if not manual admin override)
    if (!isAdminManual) {
      const existingApp = await ApplicationModel.findOne({ candidateId: effectiveCandId, jobId });
      if (existingApp) {
        return res.status(400).json({ error: 'You have already applied for this position.', application: existingApp.toObject() });
      }
    }

    const appNumber = 'JOB-' + Math.floor(100000 + Math.random() * 900000);
    let finalPaymentAmount = paymentAmount;
    if (finalPaymentAmount === undefined || finalPaymentAmount === null) {
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

    let hrIncentive = 0;
    let agentIncentive = 0;

    if (referredBy) {
      const { UserModel, PartnerIncentiveModel, GlobalSettingsModel } = require('../db');
      const referrer = await UserModel.findOne({ referralCode: referredBy }).lean();
      
      if (referrer) {
        let hrId = referrer.role === 'hr' ? referrer.id : referrer.parentHrId;
        
        // 1. Calculate HR Incentive
        const itProc = db.itTrainingProcesses?.find(p => p.id === jobId);
        if (itProc && itProc.itCategory === 'Placement') {
          // IT Training Placement process
          const globalIncentives = await GlobalSettingsModel.findOne({ type: 'it-training-incentives' }).lean();
          const gData = globalIncentives ? globalIncentives.data : {};
          hrIncentive = Number(gData[itProc.processName?.toUpperCase().trim()]) || 0;
        } else {
          // Regular job
          hrIncentive = Number(finalPaymentAmount) > 0 ? (Number(job.hrIncentivePaid) || 0) : (Number(job.hrIncentiveFree) || 0);
        }

        // 2. Calculate Agent Incentive if referred by Agent
        if (referrer.role === 'agent') {
          const pi = await PartnerIncentiveModel.findOne({ hrId, jobId: itProc ? 'combined-it-training' : jobId }).lean();
          if (pi) {
            if (itProc && itProc.itCategory === 'Placement') {
               agentIncentive = Number(pi.processIncentives?.[itProc.processName?.toUpperCase().trim()]) || 0;
            } else {
               agentIncentive = Number(finalPaymentAmount) > 0 ? (Number(pi.paidJobIncentive) || 0) : (Number(pi.freeJobIncentive) || 0);
            }
          }
        }
      }
    }

    const newApp = {
      id: 'app_' + Date.now(),
      applicationNumber: appNumber,
      candidateId: effectiveCandId,
      jobId,
      companyId: job.companyId,
      categoryId: job.categoryId,
      candidateDetails: cDet,
      status: status || 'Applied',
      appliedAt: appliedAt || new Date().toISOString(),
      adminNotes: adminNotes || (coverNotes ? `Candidate Notes: ${coverNotes}` : (isAdminManual ? 'Manually added by Admin' : '')),
      referredBy: referredBy || null,
      paymentId: paymentId || (isAdminManual ? `MANUAL_ADMIN_${Date.now()}` : null),
      paymentAmount: Number(finalPaymentAmount),
      incentiveAmount: hrIncentive,
      agentIncentiveAmount: agentIncentive,
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

// DELETE /api/applications/:id (Admin deletes application)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ApplicationModel.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    res.json({ message: 'Application deleted successfully.' });
  } catch (err) {
    console.error('Error deleting application:', err);
    res.status(500).json({ error: 'Failed to delete application.' });
  }
});

// PUT /api/applications/:id/incentive-status (Update incentive payout status)
router.put('/:id/incentive-status', async (req, res) => {
  try {
    const { status } = req.body;
    const db = await readDBAsync();
    
    const appIndex = db.applications.findIndex(a => a.id === req.params.id);
    if (appIndex === -1) {
      return res.status(404).json({ error: 'Application not found' });
    }

    db.applications[appIndex].incentiveStatus = status;
    db.applications[appIndex].updatedAt = new Date().toISOString();

    await ApplicationModel.findOneAndUpdate(
      { id: req.params.id },
      { incentiveStatus: status, updatedAt: db.applications[appIndex].updatedAt }
    );

    res.json({ message: 'Incentive status updated successfully', application: db.applications[appIndex] });
  } catch (err) {
    console.error('Error updating incentive status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


