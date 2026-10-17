const express = require('express');
const router = express.Router();
const { UserModel, ApplicationModel, PartnerIncentiveModel, GlobalSettingsModel, readDBAsync, JobModel, CandidateModel, CompanyModel, InterviewModel, BranchItProjectModel } = require('../db');

// GET all HRs / Employees
router.get('/hr', async (req, res) => {
  try {
    const hrs = await UserModel.find({ role: 'hr' }).lean();
    const agents = await UserModel.find({ role: 'agent' }).lean();
    const tls = await UserModel.find({ role: 'team_leader' }).lean();
    
    const tlMap = {};
    tls.forEach(tl => {
      tlMap[tl.id] = tl;
    });

    // Map HR ID -> Array of agent referral codes
    const hrAgentsMap = {};
    agents.forEach(agent => {
      if (!hrAgentsMap[agent.parentHrId]) hrAgentsMap[agent.parentHrId] = [];
      if (agent.referralCode) {
        hrAgentsMap[agent.parentHrId].push(agent.referralCode.toLowerCase());
      }
    });

    const populatedHrs = hrs.map(hr => ({
      ...hr,
      agentCodes: hrAgentsMap[hr.id] || [],
      teamLeaderName: tlMap[hr.teamLeaderId]?.name || '',
      teamLeaderBranch: tlMap[hr.teamLeaderId]?.branch || ''
    }));

    res.json(populatedHrs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch HR users' });
  }
});

// POST to create HR
router.post('/hr', async (req, res) => {
  try {
    const { name, email, password, mobile, profilePhoto } = req.body;

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
      mobile: mobile || '',
      profilePhoto: profilePhoto || '',
      passwordHash: 'dummy_hash_' + password,
      role: 'hr',
      referralCode,
      linkClicks: 0,
      createdAt: new Date().toISOString()
    };

    const savedUser = await UserModel.create(newUser);
    const { passwordHash, ...safe } = savedUser.toObject();
    res.status(201).json(safe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create HR user.' });
  }
});

// PUT to update an HR user (Admin edit)
router.put('/hr/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, mobile, profilePhoto } = req.body;

    const hrUser = await UserModel.findOne({ id, role: 'hr' });
    if (!hrUser) {
      return res.status(404).json({ error: 'HR user not found.' });
    }

    if (email && email.toLowerCase() !== hrUser.email) {
      const clash = await UserModel.findOne({ email: email.toLowerCase(), id: { $ne: id } });
      if (clash) {
        return res.status(400).json({ error: 'Account with this email already exists.' });
      }
      hrUser.email = email.toLowerCase();
    }

    if (name) hrUser.name = name;
    if (mobile !== undefined) hrUser.mobile = mobile;
    if (profilePhoto !== undefined) hrUser.profilePhoto = profilePhoto;
    if (password && password.trim()) {
      hrUser.passwordHash = 'dummy_hash_' + password;
    }

    await hrUser.save();
    const { passwordHash, ...safe } = hrUser.toObject();
    res.json(safe);
  } catch (error) {
    console.error('Error updating HR user:', error);
    res.status(500).json({ error: 'Failed to update HR user.' });
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

// PUT update user password
router.put('/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    const user = await UserModel.findOne({ id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Validate old password (using the dummy hash matching pattern from auth)
    if (user.passwordHash !== 'dummy_hash_' + oldPassword) {
      return res.status(401).json({ error: 'Incorrect old password' });
    }

    // Update with new password
    await UserModel.updateOne(
      { id },
      { $set: { passwordHash: 'dummy_hash_' + newPassword } }
    );
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update password' });
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

// POST track direct visitor (no referral code)
router.post('/visit/direct', async (req, res) => {
  try {
    const updated = await GlobalSettingsModel.findOneAndUpdate(
      { type: 'platform_stats' },
      { $inc: { 'data.directLinkClicks': 1 } },
      { new: true, upsert: true }
    );
    res.json({ success: true, directLinkClicks: updated?.data?.directLinkClicks || 1 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record direct visit.' });
  }
});

// GET aggregated link click statistics (direct + all HRs + agents)
router.get('/stats/clicks', async (req, res) => {
  try {
    const platformStats = await GlobalSettingsModel.findOne({ type: 'platform_stats' }).lean();
    const directClicks = platformStats?.data?.directLinkClicks || 0;

    const hrs = await UserModel.find({ role: 'hr' }, 'id name referralCode linkClicks branch').lean();
    const agents = await UserModel.find({ role: 'agent' }, 'id name referralCode linkClicks parentHrId').lean();

    const hrClicksTotal = hrs.reduce((s, h) => s + (Number(h.linkClicks) || 0), 0);
    const agentClicksTotal = agents.reduce((s, a) => s + (Number(a.linkClicks) || 0), 0);

    res.json({
      directClicks,
      hrClicksTotal,
      agentClicksTotal,
      totalClicks: directClicks + hrClicksTotal + agentClicksTotal,
      hrs: hrs.map(h => ({
        id: h.id,
        name: h.name,
        referralCode: h.referralCode,
        branch: h.branch,
        linkClicks: Number(h.linkClicks) || 0
      })).sort((a, b) => b.linkClicks - a.linkClicks),
      agents: agents.map(a => ({
        id: a.id,
        name: a.name,
        referralCode: a.referralCode,
        linkClicks: Number(a.linkClicks) || 0,
        parentHrId: a.parentHrId
      })).sort((a, b) => b.linkClicks - a.linkClicks)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch click stats.' });
  }
});

// ================= AGENTS (owned by an HR) =================

// GET all agents (for admin)
router.get('/agents/all', async (req, res) => {
  try {
    const agents = await UserModel.find({ role: 'agent' }).sort({ createdAt: -1 }).lean();
    res.json(agents.map(a => {
      const { passwordHash, ...rest } = a;
      return rest;
    }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all agents.' });
  }
});

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
// ================= SUB-AGENTS (MLM) =================

// GET all sub-agents of an Agent (with applied count)
router.get('/agents/:agentId/subagents', async (req, res) => {
  try {
    const { agentId } = req.params;
    const subagents = await UserModel.find({ role: 'agent', parentAgentId: agentId }).sort({ createdAt: -1 }).lean();
    const codes = subagents.map(a => a.referralCode).filter(Boolean);
    const counts = codes.length
      ? await ApplicationModel.aggregate([
          { $match: { referredBy: { $in: codes } } },
          { $group: { _id: '$referredBy', count: { $sum: 1 } } }
        ])
      : [];
    const countMap = Object.fromEntries(counts.map(c => [String(c._id).toUpperCase(), c.count]));
    res.json(subagents.map(a => {
      const { passwordHash, ...rest } = a;
      return { ...rest, candidatesApplied: countMap[String(a.referralCode).toUpperCase()] || 0 };
    }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sub-agents.' });
  }
});

// POST create sub-agent under an Agent
router.post('/agents/:agentId/subagents', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const parentAgent = await UserModel.findOne({ id: agentId, role: 'agent' }).lean();
    if (!parentAgent) {
      return res.status(404).json({ error: 'Parent Agent not found.' });
    }

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Account with this email already exists.' });
    }

    // Generate unique sub-agent referral code
    let referralCode;
    for (let i = 0; i < 5; i++) {
      referralCode = 'AG-' + Math.floor(10000 + Math.random() * 90000);
      const clash = await UserModel.findOne({ referralCode }).lean();
      if (!clash) break;
    }

    const newSubAgent = await UserModel.create({
      id: 'agt_' + Date.now(),
      name,
      email: email.toLowerCase(),
      mobile: mobile || '',
      passwordHash: 'dummy_hash_' + password,
      role: 'agent',
      parentHrId: parentAgent.parentHrId, // inherit the top HR owner
      parentAgentId: agentId, // the immediate parent
      referralCode,
      linkClicks: 0,
      createdAt: new Date().toISOString()
    });

    const { passwordHash, ...safe } = newSubAgent.toObject();
    res.status(201).json(safe);
  } catch (error) {
    console.error('Error creating sub-agent:', error);
    res.status(500).json({ error: 'Failed to create sub-agent.' });
  }
});

// DELETE a sub-agent
router.delete('/agents/:agentId/subagents/:subAgentId', async (req, res) => {
  try {
    const { agentId, subAgentId } = req.params;
    const result = await UserModel.deleteOne({ id: subAgentId, role: 'agent', parentAgentId: agentId });
    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Sub-agent not found.' });
    }
    res.json({ message: 'Sub-agent deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sub-agent.' });
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

// PUT update user profile (Name, Bank Details, Profile Photo)
router.put('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bankAccountNumber, bankIfscCode, bankName, bankBranch, accountHolderName, profilePhoto, mobile } = req.body;
    
    const updateObj = { name, bankAccountNumber, bankIfscCode, bankName, bankBranch, accountHolderName };
    if (profilePhoto !== undefined) updateObj.profilePhoto = profilePhoto;
    if (mobile !== undefined) updateObj.mobile = mobile;

    const updatedUser = await UserModel.findOneAndUpdate(
      { id },
      { $set: updateObj },
      { returnDocument: 'after' }
    ).lean();

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { passwordHash, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});


// PUT per-candidate incentives for an HR (Admin only)
// body: { items: [{ applicationId, amount }] }
// HR total incentives = sum of incentiveAmount across all applications referred by that HR
router.put('/hr/:id/candidate-incentives', async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    const user = await UserModel.findOne({ id, role: { $in: ['hr', 'agent'] } }).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items array is required.' });
    }

    let codes = [user.referralCode];
    if (user.role === 'hr') {
      const agents = await UserModel.find({ parentHrId: id, role: 'agent' }).lean();
      codes = [...codes, ...agents.map(a => a.referralCode)];
    }
    codes = codes.filter(Boolean);
    const codesRegex = codes.map(c => new RegExp('^' + c + '$', 'i'));

    const now = new Date().toISOString();

    for (const item of items) {
      const amount = Math.max(0, Number(item.amount) || 0);
      await ApplicationModel.updateOne(
        { id: item.applicationId, referredBy: { $in: codesRegex } },
        { $set: { incentiveAmount: amount, incentiveUpdatedAt: now, incentiveConfirmed: true } }
      );
    }

    const apps = await ApplicationModel.find({ referredBy: { $in: codesRegex }, status: { $ne: 'Payment Pending' } }, { incentiveAmount: 1 }).lean();
    const total = apps.reduce((sum, a) => sum + (Number(a.incentiveAmount) || 0), 0);

    const updatedUser = await UserModel.findOneAndUpdate(
      { id, role: { $in: ['hr', 'agent'] } },
      { $set: { incentives: total } },
      { returnDocument: 'after' }
    );

    res.json({ total, user: updatedUser });
  } catch (error) {
    console.error('Error updating candidate incentives:', error);
    res.status(500).json({ error: 'Failed to update candidate incentives.' });
  }
});

// PUT per-candidate incentives for an Agent (Set by HR)
// body: { items: [{ applicationId, amount }], referralCode }
router.put('/hr/:hrId/agent-incentives', async (req, res) => {
  try {
    const { hrId } = req.params;
    const { items, referralCode } = req.body;

    const agentUser = await UserModel.findOne({ referralCode: new RegExp('^' + referralCode + '$', 'i'), parentHrId: hrId, role: 'agent' }).lean();
    if (!agentUser) {
      return res.status(404).json({ error: 'Agent not found or does not belong to you.' });
    }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items array is required.' });
    }

    const refRegex = new RegExp('^' + agentUser.referralCode + '$', 'i');

    for (const item of items) {
      const amount = Math.max(0, Number(item.amount) || 0);
      await ApplicationModel.updateOne(
        { id: item.applicationId, referredBy: refRegex },
        { $set: { agentIncentiveAmount: amount } }
      );
    }

    const apps = await ApplicationModel.find({ referredBy: refRegex, status: { $ne: 'Payment Pending' } }, { agentIncentiveAmount: 1 }).lean();
    const total = apps.reduce((sum, a) => sum + (Number(a.agentIncentiveAmount) || 0), 0);

    const updatedAgent = await UserModel.findOneAndUpdate(
      { id: agentUser.id, role: 'agent' },
      { $set: { incentives: total } },
      { returnDocument: 'after' }
    );

    res.json({ total, user: updatedAgent });
  } catch (error) {
    console.error('Error updating agent incentives:', error);
    res.status(500).json({ error: 'Failed to update agent incentives.' });
  }
});

// GET HR Dashboard Stats
router.get('/hr/:referralCode/dashboard', async (req, res) => {
  try {
    const { referralCode } = req.params;

    // Get HR user for click count
    const hrUser = await UserModel.findOne({ referralCode: new RegExp('^' + referralCode + '$', 'i'), role: { $in: ['hr', 'agent'] } }).lean();
    
    let codesRegex = [new RegExp('^' + referralCode + '$', 'i')];
    if (hrUser && hrUser.role === 'hr') {
      const agents = await UserModel.find({ parentHrId: hrUser.id, role: 'agent' }).lean();
      const agentCodes = agents.map(a => a.referralCode).filter(Boolean);
      agentCodes.forEach(c => codesRegex.push(new RegExp('^' + c + '$', 'i')));
    }

    // Find applications referred by this HR or their agents
    const applications = await ApplicationModel.find({ referredBy: { $in: codesRegex }, status: { $ne: 'Payment Pending' } }).lean();
    const db = await readDBAsync();
    
    // Fetch settings for dynamic incentive calculation if missing
    const partnerIncentives = await PartnerIncentiveModel.find({ hrId: hrUser.id }).lean();
    const incSetting = await GlobalSettingsModel.findOne({ type: 'incentives' }).lean();
    const agentCut = incSetting?.data?.agentCutPercentage || 50;

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

      let fallbackHrIncentive = 0;
      if (Number(app.paymentAmount || app.feeAmount) >= 1499 || job?.isFicFlow) {
        fallbackHrIncentive = job?.hrIncentivePaid || 0;
      } else {
        fallbackHrIncentive = job?.hrIncentiveFree !== undefined ? job.hrIncentiveFree : (job?.hrIncentiveAmount || 0);
      }
      const override = partnerIncentives.find(p => p.jobId === app.jobId);
      if (override && override.incentiveAmount) fallbackHrIncentive = override.incentiveAmount;

      // Fix for old applications saved with the bug
      let actualHrIncentive = app.incentiveAmount;
      if (actualHrIncentive > 0 && Number(app.paymentAmount || app.feeAmount || 49) < 1499 && !job?.isFicFlow) {
         if (actualHrIncentive === job?.hrIncentivePaid || actualHrIncentive > fallbackHrIncentive) {
             actualHrIncentive = fallbackHrIncentive;
         }
      }

      return {
        ...app,
        incentiveAmount: actualHrIncentive !== undefined ? actualHrIncentive : fallbackHrIncentive,
        agentIncentiveAmount: app.agentIncentiveAmount || (fallbackHrIncentive * agentCut / 100),
        candidateName: candidate.name || 'Anonymous',
        candidateEmail: candidate.email || '',
        candidateMobile: candidate.mobile || '',
        candidateLocation: candidate.location || '',
        candidateDOB: candidate.qualification || '',
        candidateExperience: candidate.experience || '',
        jobTitle: job ? (job.title || job.companyName) : 'Untitled Job',
        companyName: (job && job.companyName) ? job.companyName : (company.name || 'Unknown Company'),
        companyLogo: company.logo || ''
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

// ================= BRANCH MANAGERS (BM) =================

// GET all Branch Managers (Admin view)
router.get('/branch-managers', async (req, res) => {
  try {
    const bms = await UserModel.find({ role: 'branch_manager' }).sort({ createdAt: -1 }).lean();
    const tls = await UserModel.find({ role: 'team_leader' }).lean();
    const hrs = await UserModel.find({ role: 'hr' }).lean();
    const itProjects = await BranchItProjectModel.find({}).lean();

    const tlMap = {};
    tls.forEach(tl => {
      if (!tlMap[tl.branchManagerId]) tlMap[tl.branchManagerId] = [];
      tlMap[tl.branchManagerId].push(tl);
    });

    const populated = bms.map(bm => {
      const { passwordHash, ...safe } = bm;
      const myTls = tlMap[bm.id] || [];
      const approvedTls = myTls.filter(t => t.approvalStatus === 'approved');
      const myTlIds = myTls.map(t => t.id);
      const myHrs = hrs.filter(h => myTlIds.includes(h.teamLeaderId));
      const myItProjects = itProjects.filter(p => (
        (p.branchManagerId && p.branchManagerId === bm.id) ||
        (p.branch && bm.branch && p.branch.toLowerCase() === bm.branch.toLowerCase())
      ));

      return {
        ...safe,
        tlsCount: myTls.length,
        approvedTlsCount: approvedTls.length,
        pendingTlsCount: myTls.length - approvedTls.length,
        hrsCount: myHrs.length,
        itProjectsCount: myItProjects.length
      };
    });

    res.json(populated);
  } catch (error) {
    console.error('Error fetching branch managers:', error);
    res.status(500).json({ error: 'Failed to fetch branch managers.' });
  }
});

// GET comprehensive overview for a Branch Manager (KPIs, TLs, Branch HRs, Branch Applications)
router.get('/branch-managers/:id/overview', async (req, res) => {
  try {
    const { id } = req.params;
    const bm = await UserModel.findOne({ id, role: 'branch_manager' }).lean();
    if (!bm) {
      return res.status(404).json({ error: 'Branch Manager not found.' });
    }

    // 1. All TLs under this BM
    const tls = await UserModel.find({ role: 'team_leader', branchManagerId: id }).sort({ createdAt: -1 }).lean();
    const tlIds = tls.map(t => t.id);
    const tlMap = Object.fromEntries(tls.map(t => [t.id, t]));

    // 2. All HRs under these TLs
    const hrs = await UserModel.find({ role: 'hr', teamLeaderId: { $in: tlIds } }).sort({ createdAt: -1 }).lean();
    const hrCodes = hrs.map(h => (h.referralCode || '').toLowerCase()).filter(Boolean);
    const hrMap = Object.fromEntries(hrs.map(h => [(h.referralCode || '').toLowerCase(), h]));

    // Also get agents owned by these HRs (if any)
    const hrIds = hrs.map(h => h.id);
    const agents = await UserModel.find({ role: 'agent', parentHrId: { $in: hrIds } }).lean();
    const agentCodes = agents.map(a => (a.referralCode || '').toLowerCase()).filter(Boolean);
    const allBranchCodes = [...new Set([...hrCodes, ...agentCodes])];

    // 3. Applications referred by any of this branch's HRs or their agents (exclude Payment Pending)
    const applications = allBranchCodes.length
      ? await ApplicationModel.find({ 
          referredBy: { $in: allBranchCodes.map(c => new RegExp('^' + c + '$', 'i')) },
          status: { $ne: 'Payment Pending' }
        })
          .sort({ appliedAt: -1 })
          .lean()
      : [];

    // Populate candidate and job info for applications
    const candidateIds = applications.map(a => a.candidateId).filter(Boolean);
    const jobIds = applications.map(a => a.jobId).filter(Boolean);

    const [candidates, jobs, companies] = await Promise.all([
      CandidateModel.find({ id: { $in: candidateIds } }).lean(),
      JobModel.find({ id: { $in: jobIds } }).lean(),
      CompanyModel.find({}).lean()
    ]);

    const candMap = Object.fromEntries(candidates.map(c => [c.id, c]));
    const jobMap = Object.fromEntries(jobs.map(j => [j.id, j]));
    const compMap = Object.fromEntries(companies.map(c => [c.id, c]));

    const populatedApps = applications.map(app => {
      const cand = candMap[app.candidateId] || {};
      const job = jobMap[app.jobId] || {};
      const comp = compMap[job.companyId] || {};
      const refHr = hrMap[String(app.referredBy || '').toLowerCase()];

      return {
        ...app,
        candidateName: cand.name || app.candidateName || 'Anonymous',
        candidateEmail: cand.email || app.candidateEmail || '',
        candidateMobile: cand.mobile || app.candidateMobile || '',
        candidateLocation: cand.location || '',
        jobTitle: job.title || app.jobTitle || 'Job Role',
        companyName: comp.name || job.companyName || 'Company',
        referringHrName: refHr ? refHr.name : (app.referredBy || 'Direct'),
        referringTlName: refHr && tlMap[refHr.teamLeaderId] ? tlMap[refHr.teamLeaderId].name : ''
      };
    });

    // Populate HRs with candidate counts (excluding Payment Pending)
    const appCountByCode = {};
    applications.forEach(a => {
      if (a.status !== 'Payment Pending') {
        const c = String(a.referredBy || '').toLowerCase();
        appCountByCode[c] = (appCountByCode[c] || 0) + 1;
      }
    });

    const populatedHrs = hrs.map(h => {
      const { passwordHash, ...safe } = h;
      const code = (h.referralCode || '').toLowerCase();
      const myTl = tlMap[h.teamLeaderId];
      return {
        ...safe,
        teamLeaderName: myTl ? myTl.name : 'Unknown TL',
        candidatesApplied: appCountByCode[code] || 0
      };
    });

    // Populate TLs with HR count
    const hrCountByTl = {};
    hrs.forEach(h => {
      if (h.teamLeaderId) {
        hrCountByTl[h.teamLeaderId] = (hrCountByTl[h.teamLeaderId] || 0) + 1;
      }
    });

    const populatedTls = tls.map(t => {
      const { passwordHash, ...safe } = t;
      return {
        ...safe,
        assignedHrsCount: hrCountByTl[t.id] || 0
      };
    });

    // Calculate branch KPIs
    const approvedTlsCount = tls.filter(t => t.approvalStatus === 'approved').length;
    const pendingTlsCount = tls.filter(t => t.approvalStatus === 'pending').length;
    const selectedCount = applications.filter(a => ['selected', 'joined', 'converted'].includes(String(a.status || '').toLowerCase())).length;
    const interviewCount = applications.filter(a => String(a.status || '').toLowerCase().includes('interview')).length;

    const { passwordHash, ...safeBm } = bm;

    res.json({
      branchManager: safeBm,
      kpis: {
        totalTls: tls.length,
        approvedTls: approvedTlsCount,
        pendingTls: pendingTlsCount,
        totalHrs: hrs.length,
        totalApplications: applications.filter(a => a.status !== 'Payment Pending').length,
        selectedCandidates: selectedCount,
        interviewCandidates: interviewCount
      },
      teamLeaders: populatedTls,
      hrs: populatedHrs,
      applications: populatedApps
    });
  } catch (error) {
    console.error('Error fetching BM overview:', error);
    res.status(500).json({ error: 'Failed to fetch Branch Manager overview.' });
  }
});

// POST create Branch Manager (Admin only)
router.post('/branch-managers', async (req, res) => {
  try {
    const { name, email, password, mobile, branch, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Account with this email already exists.' });
    }

    const newBm = await UserModel.create({
      id: 'bm_' + Date.now(),
      name,
      email: email.toLowerCase(),
      mobile: mobile || '',
      branch: branch || location || 'Main Branch',
      location: location || branch || '',
      passwordHash: 'dummy_hash_' + password,
      role: 'branch_manager',
      approvalStatus: 'approved',
      createdAt: new Date().toISOString()
    });

    const { passwordHash, ...safe } = newBm.toObject();
    res.status(201).json(safe);
  } catch (error) {
    console.error('Error creating branch manager:', error);
    res.status(500).json({ error: 'Failed to create branch manager.' });
  }
});

// PUT update Branch Manager
router.put('/branch-managers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, mobile, branch, location } = req.body;

    const bm = await UserModel.findOne({ id, role: 'branch_manager' });
    if (!bm) {
      return res.status(404).json({ error: 'Branch Manager not found.' });
    }

    if (email && email.toLowerCase() !== bm.email) {
      const clash = await UserModel.findOne({ email: email.toLowerCase(), id: { $ne: id } });
      if (clash) {
        return res.status(400).json({ error: 'Account with this email already exists.' });
      }
      bm.email = email.toLowerCase();
    }

    if (name) bm.name = name;
    if (mobile !== undefined) bm.mobile = mobile;
    if (branch !== undefined) bm.branch = branch;
    if (location !== undefined) bm.location = location;
    if (password && password.trim()) {
      bm.passwordHash = 'dummy_hash_' + password;
    }

    await bm.save();
    const { passwordHash, ...safe } = bm.toObject();
    res.json(safe);
  } catch (error) {
    console.error('Error updating branch manager:', error);
    res.status(500).json({ error: 'Failed to update branch manager.' });
  }
});

// DELETE Branch Manager
router.delete('/branch-managers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await UserModel.deleteOne({ id, role: 'branch_manager' });
    res.json({ message: 'Branch Manager deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete branch manager.' });
  }
});

// ================= TEAM LEADERS (TL) =================

// GET all Team Leaders (Admin or BM filtered)
router.get('/team-leaders', async (req, res) => {
  try {
    const { branchManagerId } = req.query;
    const filter = { role: 'team_leader' };
    if (branchManagerId) filter.branchManagerId = branchManagerId;

    const tls = await UserModel.find(filter).sort({ createdAt: -1 }).lean();
    const bms = await UserModel.find({ role: 'branch_manager' }).lean();
    const hrs = await UserModel.find({ role: 'hr' }).lean();

    const bmMap = Object.fromEntries(bms.map(b => [b.id, b]));

    const populated = tls.map(tl => {
      const { passwordHash, ...safe } = tl;
      const assignedHrs = hrs.filter(h => h.teamLeaderId === tl.id);
      const bm = bmMap[tl.branchManagerId];

      return {
        ...safe,
        branchManagerName: bm ? bm.name : (tl.branch || 'Unassigned'),
        branchManagerEmail: bm ? bm.email : '',
        branch: tl.branch || (bm ? bm.branch : ''),
        assignedHrsCount: assignedHrs.length
      };
    });

    res.json(populated);
  } catch (error) {
    console.error('Error fetching team leaders:', error);
    res.status(500).json({ error: 'Failed to fetch team leaders.' });
  }
});

// POST create Team Leader (Branch Manager creates TL, pending Admin approval)
router.post('/team-leaders', async (req, res) => {
  try {
    const { name, email, password, mobile, branchManagerId, branch } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Account with this email already exists.' });
    }

    let bmBranch = branch || '';
    if (branchManagerId) {
      const bm = await UserModel.findOne({ id: branchManagerId, role: 'branch_manager' }).lean();
      if (bm && !bmBranch) bmBranch = bm.branch;
    }

    const newTl = await UserModel.create({
      id: 'tl_' + Date.now(),
      name,
      email: email.toLowerCase(),
      mobile: mobile || '',
      branch: bmBranch || 'Main Branch',
      branchManagerId: branchManagerId || null,
      passwordHash: 'dummy_hash_' + password,
      role: 'team_leader',
      approvalStatus: 'pending', // Requires Admin Approval
      createdAt: new Date().toISOString()
    });

    const { passwordHash, ...safe } = newTl.toObject();
    res.status(201).json(safe);
  } catch (error) {
    console.error('Error creating team leader:', error);
    res.status(500).json({ error: 'Failed to create team leader.' });
  }
});

// PUT Admin Approve or Reject Team Leader
router.put('/team-leaders/:id/approval', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either approved or rejected.' });
    }

    const tl = await UserModel.findOne({ id, role: 'team_leader' });
    if (!tl) {
      return res.status(404).json({ error: 'Team Leader not found.' });
    }

    tl.approvalStatus = status;
    tl.approvedBy = 'admin';
    tl.approvedAt = new Date().toISOString();
    await tl.save();

    const { passwordHash, ...safe } = tl.toObject();
    res.json({ message: `Team Leader ${status} successfully.`, teamLeader: safe });
  } catch (error) {
    console.error('Error updating TL approval:', error);
    res.status(500).json({ error: 'Failed to update approval status.' });
  }
});

// PUT update Team Leader
router.put('/team-leaders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, mobile, branch, branchManagerId } = req.body;

    const tl = await UserModel.findOne({ id, role: 'team_leader' });
    if (!tl) {
      return res.status(404).json({ error: 'Team Leader not found.' });
    }

    if (email && email.toLowerCase() !== tl.email) {
      const clash = await UserModel.findOne({ email: email.toLowerCase(), id: { $ne: id } });
      if (clash) {
        return res.status(400).json({ error: 'Account with this email already exists.' });
      }
      tl.email = email.toLowerCase();
    }

    if (name) tl.name = name;
    if (mobile !== undefined) tl.mobile = mobile;
    if (branch !== undefined) tl.branch = branch;
    if (branchManagerId !== undefined) tl.branchManagerId = branchManagerId;
    if (password && password.trim()) {
      tl.passwordHash = 'dummy_hash_' + password;
    }

    await tl.save();
    const { passwordHash, ...safe } = tl.toObject();
    res.json(safe);
  } catch (error) {
    console.error('Error updating team leader:', error);
    res.status(500).json({ error: 'Failed to update team leader.' });
  }
});

// DELETE Team Leader
router.delete('/team-leaders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Unassign HRs who were under this TL
    await UserModel.updateMany({ role: 'hr', teamLeaderId: id }, { $set: { teamLeaderId: null } });
    await UserModel.deleteOne({ id, role: 'team_leader' });
    res.json({ message: 'Team Leader deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team leader.' });
  }
});

// ================= HR TO TL ASSIGNMENT (Admin Approval) =================

// PUT Admin Assigns / Approves HR under a Team Leader
router.put('/hr/:id/assign-tl', async (req, res) => {
  try {
    const { id } = req.params;
    const { teamLeaderId } = req.body;

    const hrUser = await UserModel.findOne({ id, role: 'hr' });
    if (!hrUser) {
      return res.status(404).json({ error: 'HR user not found.' });
    }

    let tlName = '';
    if (teamLeaderId) {
      const tl = await UserModel.findOne({ id: teamLeaderId, role: 'team_leader' }).lean();
      if (!tl) {
        return res.status(404).json({ error: 'Team Leader not found.' });
      }
      if (tl.approvalStatus !== 'approved') {
        return res.status(400).json({ error: 'Cannot assign HR to a Team Leader that is not yet approved by Admin.' });
      }
      tlName = tl.name;
    }

    hrUser.teamLeaderId = teamLeaderId || null;
    await hrUser.save();

    res.json({
      message: teamLeaderId ? `HR successfully assigned to Team Leader ${tlName}.` : 'HR unassigned from Team Leader.',
      hr: hrUser
    });
  } catch (error) {
    console.error('Error assigning HR to TL:', error);
    res.status(500).json({ error: 'Failed to assign HR to Team Leader.' });
  }
});

// GET all HRs assigned under a Team Leader (For TL Dashboard)
router.get('/team-leaders/:tlId/hrs', async (req, res) => {
  try {
    const { tlId } = req.params;
    const hrs = await UserModel.find({ role: 'hr', teamLeaderId: tlId }).lean();
    const codes = hrs.map(h => h.referralCode).filter(Boolean);

    // Get applications counts referred by these HRs
    const counts = codes.length
      ? await ApplicationModel.aggregate([
          { $match: { referredBy: { $in: codes } } },
          { $group: { _id: '$referredBy', count: { $sum: 1 } } }
        ])
      : [];
    const countMap = Object.fromEntries(counts.map(c => [String(c._id).toUpperCase(), c.count]));

    res.json(hrs.map(h => {
      const { passwordHash, ...safe } = h;
      return {
        ...safe,
        candidatesApplied: countMap[String(h.referralCode).toUpperCase()] || 0
      };
    }));
  } catch (error) {
    console.error('Error fetching HRs for TL:', error);
    res.status(500).json({ error: 'Failed to fetch HRs for this Team Leader.' });
  }
});

// GET complete Team Leader drilldown overview (TL details, assigned HRs, candidates, incentives)
router.get('/team-leaders/:tlId/overview', async (req, res) => {
  try {
    const { tlId } = req.params;
    const tl = await UserModel.findOne({ id: tlId, role: 'team_leader' }).lean();
    if (!tl) {
      return res.status(404).json({ error: 'Team Leader not found.' });
    }

    const bm = tl.branchManagerId ? await UserModel.findOne({ id: tl.branchManagerId }).lean() : null;
    const hrs = await UserModel.find({ role: 'hr', teamLeaderId: tlId }).lean();
    const codes = hrs.map(h => h.referralCode).filter(Boolean);

    const applications = codes.length
      ? await ApplicationModel.find({ 
          referredBy: { $in: codes },
          status: { $ne: 'Payment Pending' }
        }).sort({ appliedAt: -1 }).lean()
      : [];

    const candidateIds = applications.map(a => a.candidateId).filter(Boolean);
    const jobIds = applications.map(a => a.jobId).filter(Boolean);
    const [candidates, jobs] = await Promise.all([
      CandidateModel.find({ id: { $in: candidateIds } }).lean(),
      JobModel.find({ id: { $in: jobIds } }).lean()
    ]);

    const candMap = Object.fromEntries(candidates.map(c => [c.id, c]));
    const jobMap = Object.fromEntries(jobs.map(j => [j.id, j]));
    const hrCodeMap = Object.fromEntries(hrs.map(h => [String(h.referralCode).toUpperCase(), h]));

    const enrichedApps = applications.map(app => {
      const cand = candMap[app.candidateId];
      const job = jobMap[app.jobId];
      const referringHr = hrCodeMap[String(app.referredBy).toUpperCase()];
      return {
        ...app,
        candidateName: app.candidateName || cand?.name || 'Applicant',
        candidateEmail: app.candidateEmail || cand?.email || '',
        candidateMobile: app.candidateMobile || cand?.mobile || '',
        candidateResumeUrl: app.resumeUrl || app.candidateResumeUrl || cand?.resumeUrl || '',
        jobTitle: app.jobTitle || job?.title || 'Job Opening',
        companyName: app.companyName || job?.companyName || 'Company',
        referringHrName: referringHr?.name || 'Assigned HR',
        referringHrEmail: referringHr?.email || '',
        referringHrCode: app.referredBy || ''
      };
    });

    const populatedHrs = hrs.map(h => {
      const { passwordHash, ...safe } = h;
      const hrApps = enrichedApps.filter(a => String(a.referredBy).toUpperCase() === String(h.referralCode).toUpperCase());
      const totalAmount = hrApps.reduce((sum, a) => sum + (Number(a.incentiveAmount) || 0), 0);
      const cnt = hrApps.filter(a => a.status !== 'Payment Pending').length;
      return {
        ...safe,
        id: h.id,
        hrId: h.id,
        name: h.name,
        hrName: h.name,
        candidateCount: cnt,
        candidatesCount: cnt,
        totalAmount,
        applications: hrApps
      };
    });

    const totalTeamAmount = enrichedApps.reduce((sum, a) => sum + (Number(a.incentiveAmount) || 0), 0);
    const { passwordHash, ...safeTl } = tl;

    res.json({
      teamLeader: {
        ...safeTl,
        branchManagerName: bm ? bm.name : (tl.branch || 'Unassigned'),
        branchManagerEmail: bm ? bm.email : ''
      },
      kpis: {
        totalHrs: hrs.length,
        totalCandidates: enrichedApps.filter(a => a.status !== 'Payment Pending').length,
        totalAmount: totalTeamAmount,
        selectedCount: enrichedApps.filter(a => ['selected', 'hired', 'closed'].includes(String(a.status).toLowerCase())).length
      },
      hrs: populatedHrs,
      applications: enrichedApps
    });
  } catch (error) {
    console.error('Error fetching team leader overview:', error);
    res.status(500).json({ error: 'Failed to fetch team leader overview.' });
  }
});

module.exports = router;

