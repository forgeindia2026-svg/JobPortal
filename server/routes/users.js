const express = require('express');
const router = express.Router();
const { UserModel, ApplicationModel, readDBAsync } = require('../db');

// GET all HRs / Employees
router.get('/hr', async (req, res) => {
  try {
    const hrs = await UserModel.find({ role: 'hr' }).lean();
    res.json(hrs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch HR users' });
  }
});

// POST to create HR
router.post('/hr', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Account with this email already exists.' });
    }

    const userId = 'usr_' + Date.now();
    const referralCode = 'HR-' + Math.floor(10000 + Math.random() * 90000);

    const newUser = {
      id: userId,
      name,
      email: email.toLowerCase(),
      passwordHash: 'dummy_hash_' + password,
      role: 'hr',
      referralCode,
      linkClicks: 0,
      createdAt: new Date().toISOString()
    };

    const savedUser = await UserModel.create(newUser);
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create HR user.' });
  }
});

// DELETE an HR user
router.delete('/hr/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await UserModel.deleteOne({ id, role: 'hr' });
    res.json({ message: 'HR User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete HR user.' });
  }
});

// POST track link click - candidate referral link open panna auto call aagum (renamed to visit to avoid adblockers)
router.post('/hr/:referralCode/visit', async (req, res) => {
  try {
    const { referralCode } = req.params;
    await UserModel.updateOne(
      { referralCode: new RegExp('^' + referralCode + '$', 'i'), role: { $in: ['hr', 'agent'] } },
      { $inc: { linkClicks: 1 } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record visit.' });
  }
});

// ================= AGENTS (owned by an HR) =================

// GET all agents of an HR (with applied count)
router.get('/hr/:hrId/agents', async (req, res) => {
  try {
    const { hrId } = req.params;
    const agents = await UserModel.find({ role: 'agent', parentHrId: hrId }).sort({ createdAt: -1 }).lean();
    const codes = agents.map(a => a.referralCode).filter(Boolean);
    const counts = codes.length
      ? await ApplicationModel.aggregate([
          { $match: { referredBy: { $in: codes } } },
          { $group: { _id: '$referredBy', count: { $sum: 1 } } }
        ])
      : [];
    const countMap = Object.fromEntries(counts.map(c => [String(c._id).toUpperCase(), c.count]));
    res.json(agents.map(a => {
      const { passwordHash, ...rest } = a;
      return { ...rest, candidatesApplied: countMap[String(a.referralCode).toUpperCase()] || 0 };
    }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agents.' });
  }
});

// POST create agent under an HR
router.post('/hr/:hrId/agents', async (req, res) => {
  try {
    const { hrId } = req.params;
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const hrUser = await UserModel.findOne({ id: hrId, role: 'hr' }).lean();
    if (!hrUser) {
      return res.status(404).json({ error: 'HR user not found.' });
    }

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Account with this email already exists.' });
    }

    // Generate unique agent referral code
    let referralCode;
    for (let i = 0; i < 5; i++) {
      referralCode = 'AG-' + Math.floor(10000 + Math.random() * 90000);
      const clash = await UserModel.findOne({ referralCode }).lean();
      if (!clash) break;
    }

    const newAgent = await UserModel.create({
      id: 'agt_' + Date.now(),
      name,
      email: email.toLowerCase(),
      mobile: mobile || '',
      passwordHash: 'dummy_hash_' + password,
      role: 'agent',
      parentHrId: hrId,
      referralCode,
      linkClicks: 0,
      createdAt: new Date().toISOString()
    });

    const { passwordHash, ...safe } = newAgent.toObject();
    res.status(201).json(safe);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent.' });
  }
});

// DELETE an agent (only by its owner HR)
router.delete('/hr/:hrId/agents/:agentId', async (req, res) => {
  try {
    const { hrId, agentId } = req.params;
    const result = await UserModel.deleteOne({ id: agentId, role: 'agent', parentHrId: hrId });
    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Agent not found.' });
    }
    res.json({ message: 'Agent deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete agent.' });
  }
});

// PUT update HR incentives (Admin update)
router.put('/hr/:id/incentives', async (req, res) => {
  try {
    const { id } = req.params;
    const { incentives } = req.body;
    const amount = Number(incentives) || 0;

    const updatedUser = await UserModel.findOneAndUpdate(
      { id, role: 'hr' },
      { $set: { incentives: amount } },
      { returnDocument: 'after' }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'HR user not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update HR incentives.' });
  }
});

// PUT per-candidate incentives for an HR (Admin only)
// body: { items: [{ applicationId, amount }] }
// HR total incentives = sum of incentiveAmount across all applications referred by that HR
router.put('/hr/:id/candidate-incentives', async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    const hrUser = await UserModel.findOne({ id, role: 'hr' }).lean();
    if (!hrUser) {
      return res.status(404).json({ error: 'HR user not found' });
    }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items array is required.' });
    }

    const refRegex = new RegExp('^' + hrUser.referralCode + '$', 'i');
    const now = new Date().toISOString();

    for (const item of items) {
      const amount = Math.max(0, Number(item.amount) || 0);
      await ApplicationModel.updateOne(
        { id: item.applicationId, referredBy: refRegex },
        { $set: { incentiveAmount: amount, incentiveUpdatedAt: now } }
      );
    }

    const apps = await ApplicationModel.find({ referredBy: refRegex }, { incentiveAmount: 1 }).lean();
    const total = apps.reduce((sum, a) => sum + (Number(a.incentiveAmount) || 0), 0);

    const updatedUser = await UserModel.findOneAndUpdate(
      { id, role: 'hr' },
      { $set: { incentives: total } },
      { returnDocument: 'after' }
    );

    res.json({ total, user: updatedUser });
  } catch (error) {
    console.error('Error updating candidate incentives:', error);
    res.status(500).json({ error: 'Failed to update candidate incentives.' });
  }
});

// GET HR Dashboard Stats
router.get('/hr/:referralCode/dashboard', async (req, res) => {
  try {
    const { referralCode } = req.params;

    // Get HR user for click count
    const hrUser = await UserModel.findOne({ referralCode: new RegExp('^' + referralCode + '$', 'i'), role: { $in: ['hr', 'agent'] } }).lean();

    // Find applications referred by this HR
    const applications = await ApplicationModel.find({ referredBy: new RegExp('^' + referralCode + '$', 'i') }).lean();
    const db = await readDBAsync();

    const populated = applications.map(app => {
      const candidate = db.candidates.find(c => c.id === app.candidateId) || {};
      let job = db.jobs.find(j => j.id === app.jobId);
      if (!job) {
        const itProc = (db.itTrainingProcesses || []).find(p => p.id === app.jobId);
        if (itProc) {
          job = { title: itProc.role || itProc.programTitle, companyName: 'FIC IT' };
        }
      }
      const company = db.companies.find(c => c.id === app.companyId || (job && c.id === job.companyId)) || {};

      return {
        ...app,
        candidateName: candidate.name || 'Anonymous',
        candidateEmail: candidate.email || '',
        candidateMobile: candidate.mobile || '',
        candidateLocation: candidate.location || '',
        candidateDOB: candidate.qualification || '',
        candidateExperience: candidate.experience || '',
        jobTitle: job ? (job.title || job.companyName) : 'Untitled Job',
        companyName: (job && job.companyName) ? job.companyName : (company.name || 'Unknown Company')
      };
    });

    const stats = {
      totalApplications: applications.length,
      linkClicks: hrUser ? (hrUser.linkClicks || 0) : 0,
      totalIncentives: hrUser ? (hrUser.incentives || 0) : 0,
      applications: populated
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch HR dashboard stats.' });
  }
});

module.exports = router;
