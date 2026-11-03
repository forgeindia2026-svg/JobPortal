const express = require('express');
const router = express.Router();
const { ApplicationModel, UserModel, CandidateModel, JobModel, CompanyModel, ItTrainingProcessModel } = require('../db');

// Helper to enrich application for Follow-up view
async function populateApplication(app, candMap, jobMap, compMap, hrMap) {
  const cand = candMap[app.candidateId] || app.candidateDetails || {};
  const job = jobMap[app.jobId] || {};
  const comp = compMap[job.companyId] || compMap[app.companyId] || {};
  const refUser = hrMap[String(app.referredBy || '').toLowerCase().trim()];
  const isAgent = refUser?.role === 'agent';
  const partnerName = isAgent ? refUser.name : (app.partnerName || null);

  return {
    ...app,
    candidateName: cand.name || app.candidateDetails?.name || 'Applicant',
    candidateEmail: cand.email || app.candidateDetails?.email || '',
    candidateMobile: cand.mobile || app.candidateDetails?.mobile || '',
    candidateLocation: cand.location || app.candidateDetails?.location || '',
    candidateQualification: cand.qualification || app.candidateDetails?.qualification || '',
    candidateExperience: cand.experience || app.candidateDetails?.experience || '',
    candidateResumeUrl: cand.resumeUrl || app.resumeUrl || '',
    jobTitle: job.title || app.jobTitle || 'Job Opening',
    companyName: comp.name || job.companyName || 'Corporate Partner',
    partnerName: partnerName,
    isPartnerReferral: isAgent || Boolean(app.isPartnerReferral || app.partnerName),
    hrName: refUser ? refUser.name : (app.hrName || app.referredBy || 'Direct Sourced'),
    hrCode: refUser ? refUser.referralCode : (app.referredBy || '')
  };
}

// 1. GET /api/follow-ups/pool
// Query params: hrId (optional), scope: 'all' | 'unclaimed' | 'my'
router.get('/pool', async (req, res) => {
  try {
    const { hrId, scope } = req.query;

    // Fetch valid non-pending applications
    let query = {
      status: { $ne: 'Payment Pending' }
    };

    if (scope === 'my' && hrId) {
      query.followUpAssignedTo = hrId;
    } else if (scope === 'unclaimed') {
      query.$or = [
        { followUpAssignedTo: null },
        { followUpAssignedTo: '' },
        { followUpAssignedTo: { $exists: false } }
      ];
    }

    const [apps, candidates, jobs, companies, itProcesses, users] = await Promise.all([
      ApplicationModel.find(query).sort({ appliedAt: -1 }).lean(),
      CandidateModel.find({}).lean(),
      JobModel.find({}).lean(),
      CompanyModel.find({}).lean(),
      ItTrainingProcessModel.find({}).lean(),
      UserModel.find({}).lean()
    ]);

    const candMap = Object.fromEntries(candidates.map(c => [c.id, c]));
    const jobMap = Object.fromEntries(jobs.map(j => [j.id, j]));
    (itProcesses || []).forEach(p => {
      if (!jobMap[p.id]) {
        jobMap[p.id] = {
          id: p.id,
          title: `${p.role || 'IT Trainee'} (${(p.processName || 'FIC').toUpperCase()})`,
          companyName: p.itCategory === 'Course' ? 'FIC IT Courses' : 'FIC Free IT Internship'
        };
      }
    });
    const compMap = Object.fromEntries(companies.map(c => [c.id, c]));
    const hrMap = Object.fromEntries(users.map(u => [String(u.referralCode || '').toLowerCase().trim(), u]));

    const populated = await Promise.all(
      apps.map(a => populateApplication(a, candMap, jobMap, compMap, hrMap))
    );

    // Summary counts for tabs
    const allValidApps = await ApplicationModel.find({ status: { $ne: 'Payment Pending' } }).lean();
    const totalCount = allValidApps.length;
    const unclaimedCount = allValidApps.filter(a => !a.followUpAssignedTo).length;
    const myCount = hrId ? allValidApps.filter(a => a.followUpAssignedTo === hrId).length : 0;

    res.json({
      applications: populated,
      counts: {
        total: totalCount,
        unclaimed: unclaimedCount,
        myFollowUps: myCount
      }
    });
  } catch (error) {
    console.error('Error fetching follow-up pool:', error);
    res.status(500).json({ error: 'Failed to fetch follow-up pool.' });
  }
});

// 2. POST /api/follow-ups/:appId/claim
// Body: { hrId, hrName }
router.post('/:appId/claim', async (req, res) => {
  try {
    const { appId } = req.params;
    const { hrId, hrName } = req.body;

    if (!hrId || !hrName) {
      return res.status(400).json({ error: 'hrId and hrName are required to claim application.' });
    }

    const app = await ApplicationModel.findOne({ id: appId });
    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // Check if already claimed by another HR
    if (app.followUpAssignedTo && app.followUpAssignedTo !== hrId) {
      return res.status(409).json({
        error: `Application already claimed by ${app.followUpAssignedName || 'another HR'}.`,
        claimedBy: app.followUpAssignedName
      });
    }

    app.followUpAssignedTo = hrId;
    app.followUpAssignedName = hrName;
    app.followUpAssignedAt = new Date().toISOString();
    if (!app.followUpStatus || app.followUpStatus === 'Pending Call') {
      app.followUpStatus = 'In Follow-up';
    }

    // Add note entry
    const history = Array.isArray(app.followUpNotes) ? app.followUpNotes : [];
    history.unshift({
      note: `Claimed by ${hrName} for follow-up`,
      updatedBy: hrName,
      updatedById: hrId,
      updatedAt: new Date().toISOString()
    });
    app.followUpNotes = history;

    await app.save();

    res.json({
      message: 'Application claimed successfully!',
      application: app
    });
  } catch (error) {
    console.error('Error claiming application:', error);
    res.status(500).json({ error: 'Failed to claim application.' });
  }
});

// 3. POST /api/follow-ups/:appId/release
// Body: { hrId, hrName, reason }
router.post('/:appId/release', async (req, res) => {
  try {
    const { appId } = req.params;
    const { hrId, hrName, reason } = req.body;

    const app = await ApplicationModel.findOne({ id: appId });
    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const prevOwner = app.followUpAssignedName || 'HR';
    app.followUpAssignedTo = null;
    app.followUpAssignedName = null;
    app.followUpAssignedAt = null;
    app.followUpStatus = 'Unclaimed';

    const history = Array.isArray(app.followUpNotes) ? app.followUpNotes : [];
    history.unshift({
      note: `Released back to central pool by ${hrName || prevOwner}${reason ? ': ' + reason : ''}`,
      updatedBy: hrName || prevOwner,
      updatedById: hrId,
      updatedAt: new Date().toISOString()
    });
    app.followUpNotes = history;

    await app.save();

    res.json({
      message: 'Application released to pool successfully!',
      application: app
    });
  } catch (error) {
    console.error('Error releasing application:', error);
    res.status(500).json({ error: 'Failed to release application.' });
  }
});

// 4. POST /api/follow-ups/:appId/status
// Body: { hrId, hrName, followUpStatus, note, nextFollowUpDate }
router.post('/:appId/status', async (req, res) => {
  try {
    const { appId } = req.params;
    const { hrId, hrName, followUpStatus, note, nextFollowUpDate } = req.body;

    const app = await ApplicationModel.findOne({ id: appId });
    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (followUpStatus) {
      app.followUpStatus = followUpStatus;
    }
    if (nextFollowUpDate !== undefined) {
      app.nextFollowUpDate = nextFollowUpDate;
    }

    // Auto assign to this HR if not already assigned
    if (!app.followUpAssignedTo && hrId) {
      app.followUpAssignedTo = hrId;
      app.followUpAssignedName = hrName || 'Follow-up HR';
      app.followUpAssignedAt = new Date().toISOString();
    }

    if (note && note.trim()) {
      const history = Array.isArray(app.followUpNotes) ? app.followUpNotes : [];
      history.unshift({
        note: note.trim(),
        status: followUpStatus || app.followUpStatus,
        nextDate: nextFollowUpDate,
        updatedBy: hrName || 'Follow-up HR',
        updatedById: hrId,
        updatedAt: new Date().toISOString()
      });
      app.followUpNotes = history;
    }

    app.followUpLastUpdated = new Date().toISOString();

    await app.save();

    res.json({
      message: 'Follow-up status updated successfully!',
      application: app
    });
  } catch (error) {
    console.error('Error updating follow-up status:', error);
    res.status(500).json({ error: 'Failed to update follow-up status.' });
  }
});

// 5. POST /api/follow-ups/toggle-hr/:hrId
// Body: { isFollowUpHr: boolean }
router.post('/toggle-hr/:hrId', async (req, res) => {
  try {
    const { hrId } = req.params;
    const { isFollowUpHr } = req.body;

    const hr = await UserModel.findOne({ id: hrId, role: 'hr' });
    if (!hr) {
      return res.status(404).json({ error: 'HR user not found.' });
    }

    hr.isFollowUpHr = Boolean(isFollowUpHr);
    await hr.save();

    res.json({
      message: `HR ${hr.name} ${hr.isFollowUpHr ? 'assigned as Follow-up HR' : 'removed from Follow-up HR'}!`,
      hr: {
        id: hr.id,
        name: hr.name,
        isFollowUpHr: hr.isFollowUpHr
      }
    });
  } catch (error) {
    console.error('Error toggling Follow-up HR:', error);
    res.status(500).json({ error: 'Failed to toggle Follow-up HR.' });
  }
});

module.exports = router;
