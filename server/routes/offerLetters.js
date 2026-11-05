const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { ApplicationModel, UserModel, CandidateModel, JobModel, ItTrainingProcessModel, CompanyModel } = require('../db');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper: Resolve offer letter URL/data for persistent storage.
// - If it's already an HTTP URL, return as-is (Cloudinary/external URL)
// - If it's a base64 Data URL, return as-is (stored directly in MongoDB)
// - Otherwise return the string as-is
function saveOfferLetterBase64(dataString) {
  if (!dataString || typeof dataString !== 'string') return '';
  // Already a persistent URL (Cloudinary, etc.)
  if (dataString.startsWith('http://') || dataString.startsWith('https://')) return dataString;
  // Legacy local uploads path - return as-is
  if (dataString.startsWith('/uploads/')) return dataString;
  // Base64 Data URL - store directly in MongoDB (works on ephemeral servers like Render)
  if (dataString.startsWith('data:')) return dataString;
  // Any other string (e.g. plain URL without protocol)
  return dataString;
}

// GET /api/offer-letters (Role-filtered)
// Supports ?role=xxx&userId=xxx&branch=xxx&teamLeaderId=xxx&referralCode=xxx
router.get('/', async (req, res) => {
  try {
    const { role, userId, branch, teamLeaderId, referralCode } = req.query;

    const [allApps, candidates, jobs, itProcesses, companies, allUsers] = await Promise.all([
      ApplicationModel.find({ offerLetterUrl: { $exists: true, $ne: '' } }).sort({ offerLetterUploadedAt: -1 }).lean(),
      CandidateModel.find({}).lean(),
      JobModel.find({}).lean(),
      ItTrainingProcessModel.find({}).lean(),
      CompanyModel.find({}).lean(),
      UserModel.find({}).lean()
    ]);

    const candMap = Object.fromEntries(candidates.map(c => [String(c.id), c]));
    const jobMap = Object.fromEntries(jobs.map(j => [String(j.id), j]));
    (itProcesses || []).forEach(p => {
      if (!jobMap[String(p.id)]) {
        jobMap[String(p.id)] = {
          id: p.id,
          title: `${p.role || 'IT Trainee'} (${(p.processName || '').toUpperCase()})`,
          companyName: p.itCategory === 'Course' ? 'FIC IT Courses' : p.itCategory === 'Internship' ? 'FIC Free IT Internship' : 'FIC IT Training & Placement'
        };
      }
    });
    const compMap = Object.fromEntries(companies.map(c => [String(c.id), c]));
    const userMap = Object.fromEntries(allUsers.map(u => [String(u.id), u]));
    const refCodeMap = Object.fromEntries(allUsers.map(u => [String(u.referralCode || '').toLowerCase(), u]));

    // Populate apps
    const populated = allApps.map(app => {
      const cand = candMap[String(app.candidateId)] || app.candidateDetails || {};
      const job = jobMap[String(app.jobId)] || {};
      const comp = compMap[String(job.companyId)] || {};
      const refUser = refCodeMap[String(app.referredBy || '').toLowerCase()] || {};
      const uploader = userMap[String(app.offerLetterUploadedBy || '')] || {};

      return {
        ...app,
        candidateName: cand.name || app.candidateName || 'Candidate',
        candidateEmail: cand.email || app.candidateEmail || '',
        candidateMobile: cand.mobile || app.candidateMobile || '',
        candidateLocation: cand.location || '',
        jobTitle: job.title || app.jobTitle || 'Designation',
        companyName: comp.name || job.companyName || app.companyName || 'Company',
        hrName: refUser.name || app.hrName || app.referringHrName || 'Direct HR',
        hrCode: refUser.referralCode || app.referredBy || '',
        hrId: refUser.id || '',
        branch: refUser.branch || app.branch || 'General',
        teamLeaderId: refUser.teamLeaderId || '',
        branchManagerId: refUser.branchManagerId || '',
        uploaderName: uploader.name || app.offerLetterUploaderName || refUser.name || 'HR Executive'
      };
    });

    // Role filtering:
    let filtered = populated;

    if (role === 'hr') {
      const code = String(referralCode || '').toLowerCase();
      filtered = populated.filter(a => 
        (code && String(a.referredBy || '').toLowerCase() === code) ||
        (userId && String(a.hrId) === String(userId)) ||
        (userId && String(a.offerLetterUploadedBy) === String(userId))
      );
    } else if (role === 'team_leader') {
      const tlId = teamLeaderId || userId;
      // Get all HR IDs under this TL
      const teamHrCodes = allUsers
        .filter(u => u.role === 'hr' && String(u.teamLeaderId) === String(tlId))
        .map(u => String(u.referralCode || '').toLowerCase());
      
      filtered = populated.filter(a => 
        String(a.teamLeaderId) === String(tlId) ||
        teamHrCodes.includes(String(a.referredBy || '').toLowerCase())
      );
    } else if (role === 'branch_manager') {
      const bmBranch = (branch || '').toLowerCase();
      const bmId = userId;
      // TLs under BM
      const branchTlIds = allUsers
        .filter(u => u.role === 'team_leader' && String(u.branchManagerId) === String(bmId))
        .map(u => String(u.id));
      const branchHrCodes = allUsers
        .filter(u => u.role === 'hr' && (String(u.branchManagerId) === String(bmId) || branchTlIds.includes(String(u.teamLeaderId))))
        .map(u => String(u.referralCode || '').toLowerCase());

      filtered = populated.filter(a => 
        (bmBranch && String(a.branch || '').toLowerCase() === bmBranch) ||
        String(a.branchManagerId) === String(bmId) ||
        branchHrCodes.includes(String(a.referredBy || '').toLowerCase())
      );
    }
    // 'admin' and 'hr_manager' see all

    res.json(filtered);
  } catch (err) {
    console.error('Error fetching offer letters:', err);
    res.status(500).json({ error: 'Failed to fetch offer letters' });
  }
});

// POST /api/offer-letters (Upload / attach offer letter to application)
router.post('/', async (req, res) => {
  try {
    const { applicationId, offerLetterBase64, joiningDate, offeredCtc, notes, uploadedBy, uploaderName } = req.body;

    if (!applicationId) {
      return res.status(400).json({ error: 'Application ID is required' });
    }

    if (!offerLetterBase64) {
      return res.status(400).json({ error: 'Offer letter file is required' });
    }

    const savedFileUrl = saveOfferLetterBase64(offerLetterBase64);

    const updateFields = {
      offerLetterUrl: savedFileUrl,
      offerLetterUploadedAt: new Date().toISOString(),
      offerLetterUploadedBy: uploadedBy || '',
      offerLetterUploaderName: uploaderName || '',
      offerJoiningDate: joiningDate || '',
      offeredCtc: offeredCtc || '',
      offerNotes: notes || ''
    };

    const query = {
      $or: [
        { id: applicationId },
        ...(applicationId && applicationId.length === 24 ? [{ _id: applicationId }] : [])
      ]
    };

    const app = await ApplicationModel.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true }
    );

    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Offer letter uploaded and attached successfully', application: app });
  } catch (err) {
    console.error('Error uploading offer letter:', err);
    res.status(500).json({ error: 'Failed to upload offer letter' });
  }
});

// DELETE /api/offer-letters/:id (Remove offer letter attachment)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = {
      $or: [
        { id: id },
        ...(id && id.length === 24 ? [{ _id: id }] : [])
      ]
    };

    const app = await ApplicationModel.findOne(query);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (app.offerLetterUrl && app.offerLetterUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', app.offerLetterUrl);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    app.offerLetterUrl = '';
    app.offerLetterUploadedAt = '';
    app.offerLetterUploadedBy = '';
    app.offerLetterUploaderName = '';
    app.offerJoiningDate = '';
    app.offeredCtc = '';
    app.offerNotes = '';

    // Strip [OFFER:...] and Cloudinary URLs from adminNotes, notes, and coverNotes
    if (app.adminNotes) {
      app.adminNotes = app.adminNotes.replace(/\[OFFER:.*?\]/g, '').replace(/https:\/\/res\.cloudinary\.com[^\s"'>]+/g, '').trim();
    }
    if (app.notes) {
      app.notes = app.notes.replace(/\[OFFER:.*?\]/g, '').replace(/https:\/\/res\.cloudinary\.com[^\s"'>]+/g, '').trim();
    }
    if (app.coverNotes) {
      app.coverNotes = app.coverNotes.replace(/\[OFFER:.*?\]/g, '').replace(/https:\/\/res\.cloudinary\.com[^\s"'>]+/g, '').trim();
    }

    await app.save();

    res.json({ message: 'Offer letter removed successfully' });
  } catch (err) {
    console.error('Error removing offer letter:', err);
    res.status(500).json({ error: 'Failed to remove offer letter' });
  }
});

module.exports = router;

