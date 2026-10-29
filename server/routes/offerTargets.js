const express = require('express');
const router = express.Router();
const { OfferTargetModel, ApplicationModel, UserModel } = require('../db');

const DEFAULT_TARGETS = [
  {
    title: 'Bandhan Bank Team Drive',
    processType: 'free',
    targetScope: 'team',
    companyOrProgram: 'Bandhan Bank',
    targetCount: 20,
    rewardAmount: 30000,
    rewardTitle: '₹30,000 Team Cash Reward',
    description: 'Complete 20 candidates in Bandhan Bank to win ₹30,000 Team Cash Reward!',
    validityText: 'This Month',
    status: 'active'
  },
  {
    title: '5 Candidates Milestone',
    processType: 'free',
    targetScope: 'individual',
    companyOrProgram: 'All Free Processes',
    targetCount: 5,
    rewardAmount: 5000,
    rewardTitle: 'Incentive + ₹5,000 Bonus',
    description: 'Close 5 candidates across any Free banking/direct openings to earn ₹5,000 extra cash bonus!',
    validityText: 'Ongoing',
    status: 'active'
  },
  {
    title: '10 Candidates Milestone',
    processType: 'free',
    targetScope: 'individual',
    companyOrProgram: 'All Free Processes',
    targetCount: 10,
    rewardAmount: 10000,
    rewardTitle: 'Incentive + ₹10,000 Mega Bonus',
    description: 'Close 10 candidates across any Free banking/direct openings to earn ₹10,000 extra cash bonus!',
    validityText: 'Ongoing',
    status: 'active'
  },
  {
    title: '20 Candidates Mega Milestone',
    processType: 'free',
    targetScope: 'individual',
    companyOrProgram: 'All Free Processes',
    targetCount: 20,
    rewardAmount: 25000,
    rewardTitle: 'Incentive + ₹25,000 Super Bonus',
    description: 'Close 20 candidates across any Free banking/direct openings to earn ₹25,000 extra cash bonus!',
    validityText: 'Special Drive',
    status: 'active'
  },
  {
    title: 'Manipal BFSI Academy Team Target',
    processType: 'paid',
    targetScope: 'team',
    companyOrProgram: 'Manipal Academy',
    targetCount: 15,
    rewardAmount: 25000,
    rewardTitle: '₹25,000 Team Reward',
    description: 'Enroll 15 candidates into Manipal BFSI Program for ₹25,000 team celebration bonus!',
    validityText: 'This Month',
    status: 'active'
  },
  {
    title: 'Paid Program Individual Milestone',
    processType: 'paid',
    targetScope: 'individual',
    companyOrProgram: 'All Paid Programs',
    targetCount: 5,
    rewardAmount: 7500,
    rewardTitle: 'Incentive + ₹7,500 Bonus',
    description: 'Enroll 5 candidates into any paid IT certification or training to unlock ₹7,500 bonus!',
    validityText: 'Ongoing',
    status: 'active'
  }
];

// Helper to check if an application is closed/selected
function isSelectedApp(status) {
  const s = String(status || '').toLowerCase().trim();
  if (['rejected', 'not interested', 'cancelled', 'payment pending', 'unpaid'].includes(s)) return false;
  return s.includes('select') || s.includes('joined') || s.includes('converted') || s.includes('hired');
}

// GET all offer targets with progress
router.get('/', async (req, res) => {
  try {
    const { hrId } = req.query;

    let targets = await OfferTargetModel.find({}).sort({ createdAt: -1 }).lean();

    // Auto-seed if empty
    if (targets.length === 0) {
      const docs = DEFAULT_TARGETS.map((t, idx) => ({
        id: `tgt_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        ...t,
        createdAt: new Date().toISOString()
      }));
      await OfferTargetModel.insertMany(docs);
      targets = await OfferTargetModel.find({}).sort({ createdAt: -1 }).lean();
    }

    // Load HR user if hrId provided
    let hrUser = null;
    if (hrId) {
      hrUser = await UserModel.findOne({ id: hrId }).lean();
    }

    // Load all closed applications for progress tracking
    const allApps = await ApplicationModel.find({}).lean();
    const closedApps = allApps.filter(a => isSelectedApp(a.status));

    const hrCode = (hrUser?.referralCode || '').toLowerCase().trim();
    const hrClosedApps = hrCode ? closedApps.filter(a => (a.referredBy || '').toLowerCase().trim() === hrCode) : [];

    // Calculate progress for each target
    const enrichedTargets = targets.map(tgt => {
      const targetCompany = (tgt.companyOrProgram || '').toLowerCase().trim();
      const isTargetScopeTeam = tgt.targetScope === 'team';

      const pool = isTargetScopeTeam ? closedApps : hrClosedApps;

      let matchedApps = pool;
      if (targetCompany && targetCompany !== 'all' && !targetCompany.includes('all')) {
        matchedApps = pool.filter(a => {
          const cName = (a.companyName || '').toLowerCase();
          const jTitle = (a.jobTitle || '').toLowerCase();
          const progName = (a.programName || '').toLowerCase();
          return cName.includes(targetCompany) || jTitle.includes(targetCompany) || progName.includes(targetCompany);
        });
      }

      // Filter by free vs paid if applicable
      if (tgt.processType === 'paid') {
        matchedApps = matchedApps.filter(a => {
          const s = String(a.status || '').toLowerCase();
          const isManipal = s.includes('manipal') || (a.jobTitle || '').toLowerCase().includes('manipal') || (a.trainingFee && a.trainingFee !== '0');
          return isManipal || (Number(a.incentiveAmount) > 2000);
        });
      }

      const completedCount = matchedApps.length;
      const targetCount = Number(tgt.targetCount) || 1;
      const percentage = Math.min(100, Math.round((completedCount / targetCount) * 100));
      const remainingCount = Math.max(0, targetCount - completedCount);
      const isAchieved = completedCount >= targetCount;

      return {
        ...tgt,
        completedCount,
        remainingCount,
        percentage,
        isAchieved
      };
    });

    res.json({
      targets: enrichedTargets,
      totalTeamClosed: closedApps.length,
      totalHrClosed: hrClosedApps.length
    });
  } catch (error) {
    console.error('Error fetching offer targets:', error);
    res.status(500).json({ error: 'Failed to fetch offer targets.' });
  }
});

// POST create new target (Admin)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      processType,
      targetScope,
      companyOrProgram,
      targetCount,
      rewardAmount,
      rewardTitle,
      description,
      validityText,
      status
    } = req.body;

    if (!title || !targetCount || !rewardAmount) {
      return res.status(400).json({ error: 'Title, Target Count, and Reward Amount are required.' });
    }

    const newTarget = new OfferTargetModel({
      id: `tgt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      processType: processType || 'free',
      targetScope: targetScope || 'team',
      companyOrProgram: companyOrProgram ? companyOrProgram.trim() : 'All',
      targetCount: Number(targetCount),
      rewardAmount: Number(rewardAmount),
      rewardTitle: rewardTitle ? rewardTitle.trim() : `₹${Number(rewardAmount).toLocaleString('en-IN')} Reward`,
      description: (description || '').trim(),
      validityText: (validityText || 'Ongoing').trim(),
      status: status || 'active',
      createdAt: new Date().toISOString()
    });

    await newTarget.save();
    res.status(201).json(newTarget);
  } catch (error) {
    console.error('Error creating offer target:', error);
    res.status(500).json({ error: 'Failed to create offer target.' });
  }
});

// PUT update target
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const target = await OfferTargetModel.findOne({ id });
    if (!target) {
      return res.status(404).json({ error: 'Target not found.' });
    }

    const {
      title,
      processType,
      targetScope,
      companyOrProgram,
      targetCount,
      rewardAmount,
      rewardTitle,
      description,
      validityText,
      status
    } = req.body;

    if (title !== undefined) target.title = title.trim();
    if (processType !== undefined) target.processType = processType;
    if (targetScope !== undefined) target.targetScope = targetScope;
    if (companyOrProgram !== undefined) target.companyOrProgram = companyOrProgram.trim();
    if (targetCount !== undefined) target.targetCount = Number(targetCount);
    if (rewardAmount !== undefined) target.rewardAmount = Number(rewardAmount);
    if (rewardTitle !== undefined) target.rewardTitle = rewardTitle.trim();
    if (description !== undefined) target.description = description.trim();
    if (validityText !== undefined) target.validityText = validityText.trim();
    if (status !== undefined) target.status = status;

    target.updatedAt = new Date().toISOString();
    await target.save();

    res.json(target);
  } catch (error) {
    console.error('Error updating offer target:', error);
    res.status(500).json({ error: 'Failed to update offer target.' });
  }
});

// DELETE target
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await OfferTargetModel.deleteOne({ id });
    res.json({ message: 'Target deleted successfully.' });
  } catch (error) {
    console.error('Error deleting offer target:', error);
    res.status(500).json({ error: 'Failed to delete offer target.' });
  }
});

module.exports = router;
