const express = require('express');
const router = express.Router();
const { OfferTargetModel, OfferProgramModel, ApplicationModel, UserModel } = require('../db');

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

function matchAppToBank(app, bankName) {
  if (!bankName || bankName === 'all') return true;
  const bLower = String(bankName).toLowerCase();
  const cName = String(app.companyName || '').toLowerCase();
  const jTitle = String(app.jobTitle || '').toLowerCase();
  const progName = String(app.programName || '').toLowerCase();

  if (bLower.includes('bandhan')) return cName.includes('bandhan') || jTitle.includes('bandhan');
  if (bLower.includes('axis')) return cName.includes('axis') || jTitle.includes('axis');
  if (bLower.includes('suryoday')) return cName.includes('suryoday') || jTitle.includes('suryoday');
  if (bLower.includes('kotak')) return cName.includes('kotak') || jTitle.includes('kotak');
  if (bLower.includes('idfc')) return cName.includes('idfc') || jTitle.includes('idfc');
  if (bLower.includes('yes')) return cName.includes('yes') || jTitle.includes('yes');
  if (bLower.includes('hdfc')) return cName.includes('hdfc') || jTitle.includes('hdfc');
  if (bLower.includes('icici')) return cName.includes('icici') || jTitle.includes('icici');
  if (bLower.includes('aditya') || bLower.includes('birla')) return cName.includes('aditya') || cName.includes('birla') || jTitle.includes('birla');
  if (bLower.includes('mahindra')) return (cName.includes('mahindra') && !cName.includes('kotak')) || jTitle.includes('mahindra');

  const simple = bLower.replace('bank', '').trim();
  return cName.includes(simple) || jTitle.includes(simple) || progName.includes(simple);
}

// GET active unified program details with calculated progress
router.get('/program', async (req, res) => {
  try {
    const { hrId } = req.query;

    let program = await OfferProgramModel.findOne({ id: 'active_program' }).lean();
    if (!program) {
      const created = await OfferProgramModel.create({
        id: 'active_program',
        badgeText: 'SPECIAL RECRUITMENT EVENT',
        programName: 'Special Banking Placement Drive 2026',
        subtitle: 'All 10 Partner Banks Common Drive: Team Target (20 Hires = ₹30k Team Bonus) + Individual Cash Bonuses up to ₹25,000!',
        startDate: '2026-10-29',
        endDate: '2026-11-10',
        status: 'active',
        banks: [
          'Bandhan Bank',
          'Axis Bank',
          'Suryoday Small Finance Bank',
          'Kotak Mahindra Bank',
          'IDFC First Bank',
          'YES Bank',
          'HDFC Bank',
          'ICICI Bank',
          'Aditya Birla Capital',
          'Mahindra Finance'
        ],
        freeTeamTarget: {
          targetCount: 20,
          rewardAmount: 30000,
          rewardTitle: '₹30,000 Team Cash Reward',
          description: 'Complete 20 candidates in Bandhan Bank to win ₹30,000 Team Cash Bonus!'
        },
        freeIndividualSlabs: [
          { count: 5, rewardAmount: 5000, rewardTitle: 'Incentive + ₹5,000 Cash Bonus', description: 'Close 5 candidates to unlock ₹5,000 bonus!' },
          { count: 10, rewardAmount: 10000, rewardTitle: 'Incentive + ₹10,000 Mega Bonus', description: 'Close 10 candidates to unlock ₹10,000 bonus!' },
          { count: 15, rewardAmount: 15000, rewardTitle: 'Incentive + ₹15,000 Super Bonus', description: 'Close 15 candidates to unlock ₹15,000 bonus!' },
          { count: 20, rewardAmount: 25000, rewardTitle: 'Incentive + ₹25,000 Bumper Bonus', description: 'Close 20 candidates to unlock ₹25,000 bonus!' }
        ],
        paidTeamTarget: {
          targetCount: 15,
          rewardAmount: 25000,
          rewardTitle: '₹25,000 Team Reward',
          description: 'Enroll 15 candidates in FIC Training (100% Placement or Refund) for ₹25,000 team reward!'
        },
        paidIndividualSlabs: [
          { count: 5, rewardAmount: 7500, rewardTitle: 'Incentive + ₹7,500 Bonus', description: 'Enroll 5 candidates in FIC Training to win ₹7,500 bonus!' },
          { count: 10, rewardAmount: 15000, rewardTitle: 'Incentive + ₹15,000 Mega Bonus', description: 'Enroll 10 candidates in FIC Training to win ₹15,000 bonus!' }
        ],
        bankConfigs: {}
      });
      program = created.toObject ? created.toObject() : created;
    }

    // Load HR user if hrId provided
    let hrUser = null;
    if (hrId) {
      hrUser = await UserModel.findOne({ id: hrId }).lean();
    }
    const hrCode = (hrUser?.referralCode || '').toLowerCase().trim();

    // Load all closed applications
    const allApps = await ApplicationModel.find({}).lean();
    const closedApps = allApps.filter(a => isSelectedApp(a.status));

    // Calculate days remaining & event active
    const now = new Date();
    const end = new Date(`${program.endDate || '2026-11-10'}T23:59:59`);
    const diffMs = end.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const isEventActive = program.status === 'active' && diffMs > 0;

    // Filter applications: Free vs Paid
    const freeClosedApps = closedApps.filter(a => {
      const s = String(a.status || '').toLowerCase();
      const isPaid = s.includes('manipal') || (a.jobTitle || '').toLowerCase().includes('manipal') || (a.trainingFee && a.trainingFee !== '0');
      return !isPaid;
    });
    const hrFreeClosedApps = hrCode ? freeClosedApps.filter(a => (a.referredBy || '').toLowerCase().trim() === hrCode) : [];

    const paidClosedApps = closedApps.filter(a => {
      const s = String(a.status || '').toLowerCase();
      const isPaid = s.includes('manipal') || (a.jobTitle || '').toLowerCase().includes('manipal') || (a.trainingFee && a.trainingFee !== '0') || (Number(a.incentiveAmount) > 2000);
      return isPaid;
    });
    const hrPaidClosedApps = hrCode ? paidClosedApps.filter(a => (a.referredBy || '').toLowerCase().trim() === hrCode) : [];

    // Bank list
    const bankList = Array.isArray(program.banks) && program.banks.length > 0 ? program.banks : [
      'Bandhan Bank',
      'Axis Bank',
      'Suryoday Small Finance Bank',
      'Kotak Mahindra Bank',
      'IDFC First Bank',
      'YES Bank',
      'HDFC Bank',
      'ICICI Bank',
      'Aditya Birla Capital',
      'Mahindra Finance'
    ];

    const bankConfigs = program.bankConfigs || {};
    const bankStats = {};

    bankList.forEach(bName => {
      const customConfig = bankConfigs[bName] || {};

      const freeTeamConfig = customConfig.freeTeamTarget || program.freeTeamTarget || {
        targetCount: 20,
        rewardAmount: 30000,
        rewardTitle: '₹30,000 Team Cash Reward',
        description: `Complete 20 candidates in ${bName} to win ₹30,000 Team Cash Bonus!`
      };

      const freeSlabsConfig = customConfig.freeIndividualSlabs || program.freeIndividualSlabs || [
        { count: 5, rewardAmount: 5000, rewardTitle: 'Incentive + ₹5,000 Cash Bonus', description: `Close 5 candidates in ${bName} to unlock ₹5,000 bonus!` },
        { count: 10, rewardAmount: 10000, rewardTitle: 'Incentive + ₹10,000 Mega Bonus', description: `Close 10 candidates in ${bName} to unlock ₹10,000 bonus!` },
        { count: 15, rewardAmount: 15000, rewardTitle: 'Incentive + ₹15,000 Super Bonus', description: `Close 15 candidates in ${bName} to unlock ₹15,000 bonus!` },
        { count: 20, rewardAmount: 25000, rewardTitle: 'Incentive + ₹25,000 Bumper Bonus', description: `Close 20 candidates in ${bName} to unlock ₹25,000 bonus!` }
      ];

      const paidTeamConfig = customConfig.paidTeamTarget || program.paidTeamTarget || {
        targetCount: 15,
        rewardAmount: 25000,
        rewardTitle: '₹25,000 Team Reward',
        description: `Enroll 15 candidates for ${bName} in FIC Training for ₹25,000 team reward!`
      };

      const paidSlabsConfig = customConfig.paidIndividualSlabs || program.paidIndividualSlabs || [
        { count: 5, rewardAmount: 7500, rewardTitle: 'Incentive + ₹7,500 Bonus', description: `Enroll 5 candidates for ${bName} in FIC Training to win ₹7,500 bonus!` },
        { count: 10, rewardAmount: 15000, rewardTitle: 'Incentive + ₹15,000 Mega Bonus', description: `Enroll 10 candidates for ${bName} in FIC Training to win ₹15,000 bonus!` }
      ];

      // Filter apps for this bank
      const bankFreeTeamApps = freeClosedApps.filter(a => matchAppToBank(a, bName));
      const bankFreeHrApps = hrFreeClosedApps.filter(a => matchAppToBank(a, bName));

      const bankPaidTeamApps = paidClosedApps.filter(a => matchAppToBank(a, bName));
      const bankPaidHrApps = hrPaidClosedApps.filter(a => matchAppToBank(a, bName));

      // Calculate Free team progress
      const bFreeTargetCount = Number(freeTeamConfig.targetCount) || 20;
      const bFreeCompleted = bankFreeTeamApps.length;
      const freeTeamProgress = {
        targetCount: bFreeTargetCount,
        completedCount: bFreeCompleted,
        remainingCount: Math.max(0, bFreeTargetCount - bFreeCompleted),
        percentage: Math.min(100, Math.round((bFreeCompleted / bFreeTargetCount) * 100)),
        isAchieved: bFreeCompleted >= bFreeTargetCount,
        rewardAmount: freeTeamConfig.rewardAmount || 30000,
        rewardTitle: freeTeamConfig.rewardTitle || '₹30,000 Team Cash Reward',
        description: freeTeamConfig.description || `Complete ${bFreeTargetCount} candidates in ${bName} to win ₹${Number(freeTeamConfig.rewardAmount || 30000).toLocaleString('en-IN')} Team Cash Bonus!`
      };

      // Free Individual Slabs
      const bHrFreeCount = bankFreeHrApps.length;
      const freeIndividualSlabs = freeSlabsConfig.map(slab => {
        const slabCount = Number(slab.count) || 5;
        return {
          ...slab,
          myClosedCount: bHrFreeCount,
          remainingCount: Math.max(0, slabCount - bHrFreeCount),
          percentage: Math.min(100, Math.round((bHrFreeCount / slabCount) * 100)),
          isAchieved: bHrFreeCount >= slabCount
        };
      });

      // Paid Team Progress
      const bPaidTargetCount = Number(paidTeamConfig.targetCount) || 15;
      const bPaidCompleted = bankPaidTeamApps.length;
      const paidTeamProgress = {
        targetCount: bPaidTargetCount,
        completedCount: bPaidCompleted,
        remainingCount: Math.max(0, bPaidTargetCount - bPaidCompleted),
        percentage: Math.min(100, Math.round((bPaidCompleted / bPaidTargetCount) * 100)),
        isAchieved: bPaidCompleted >= bPaidTargetCount,
        rewardAmount: paidTeamConfig.rewardAmount || 25000,
        rewardTitle: paidTeamConfig.rewardTitle || '₹25,000 Team Reward',
        description: paidTeamConfig.description || `Enroll ${bPaidTargetCount} candidates for ${bName} in FIC Training for ₹${Number(paidTeamConfig.rewardAmount || 25000).toLocaleString('en-IN')} team reward!`
      };

      // Paid Individual Slabs
      const bHrPaidCount = bankPaidHrApps.length;
      const paidIndividualSlabs = paidSlabsConfig.map(slab => {
        const slabCount = Number(slab.count) || 5;
        return {
          ...slab,
          myClosedCount: bHrPaidCount,
          remainingCount: Math.max(0, slabCount - bHrPaidCount),
          percentage: Math.min(100, Math.round((bHrPaidCount / slabCount) * 100)),
          isAchieved: bHrPaidCount >= slabCount
        };
      });

      bankStats[bName] = {
        bankName: bName,
        teamClosedFree: bFreeCompleted,
        hrClosedFree: bHrFreeCount,
        teamClosedPaid: bPaidCompleted,
        hrClosedPaid: bHrPaidCount,
        freeTeamProgress,
        freeIndividualSlabs,
        paidTeamProgress,
        paidIndividualSlabs
      };
    });

    // Calculate paidComboSets progress
    const DEFAULT_PAID_COMBO_SETS = [
      {
        id: 'combo_1',
        title: 'Set 1: Premium Banking Trio',
        roles: ['Aditya Birla', 'Tata Capital', 'HDFC Bank'],
        targetCount: 3,
        rewardType: 'both',
        rewardAmount: 25000,
        rewardTitle: 'Brand New TAB or ₹25,000 Cash',
        extraIncentiveText: '+ Full Candidate Placement Incentives',
        description: 'Enroll candidates across Aditya Birla, Tata, and HDFC to claim a Brand New TAB or ₹25,000 Cash!'
      },
      {
        id: 'combo_2',
        title: 'Set 2: Hybrid Banking & IT Combo',
        roles: ['Any 2 Banking Candidates', '1 IT Training Candidate'],
        targetCount: 3,
        rewardType: 'both',
        rewardAmount: 25000,
        rewardTitle: 'Brand New TAB or ₹25,000 Cash',
        extraIncentiveText: '+ Full Candidate Placement Incentives',
        description: 'Enroll any 2 Banking candidates + 1 IT Training candidate to unlock a Brand New TAB or ₹25,000 Cash!'
      },
      {
        id: 'combo_3',
        title: 'Set 3: Gold Academy Power Trio',
        roles: ['Axis Gold Academy', 'Kotak Gold Academy', 'Suryoday Small Finance Bank'],
        targetCount: 3,
        rewardType: 'both',
        rewardAmount: 25000,
        rewardTitle: 'Brand New TAB or ₹25,000 Cash',
        extraIncentiveText: '+ Full Candidate Placement Incentives',
        description: 'Enroll candidates across Axis Gold, Kotak Gold, and Suryoday Bank to win the Mega Reward!'
      },
      {
        id: 'combo_4',
        title: 'Set 4: Master Placement Quad Combo',
        roles: ['Axis Gold', 'Kotak Gold', 'Aditya Birla', 'Any IT Track'],
        targetCount: 4,
        rewardType: 'both',
        rewardAmount: 30000,
        rewardTitle: 'Premium TAB + ₹10,000 Cash Bonus',
        extraIncentiveText: '+ Full Candidate Placement Incentives',
        description: 'Achieve 4 closures across premium gold banks and IT training to claim the ultimate Bumper Reward!'
      }
    ];

    const rawComboSets = (Array.isArray(program.paidComboSets) && program.paidComboSets.length > 0)
      ? program.paidComboSets
      : DEFAULT_PAID_COMBO_SETS;

    const paidComboSets = rawComboSets.map(set => {
      let matchingCount = 0;
      if (hrCode) {
        matchingCount = hrPaidClosedApps.length;
      }
      const targetCount = Number(set.targetCount) || 3;
      const completedCount = Math.min(targetCount, matchingCount);
      const remainingCount = Math.max(0, targetCount - completedCount);
      const percentage = targetCount > 0 ? Math.min(100, Math.round((completedCount / targetCount) * 100)) : 0;
      const isAchieved = completedCount >= targetCount;

      return {
        ...set,
        completedCount,
        remainingCount,
        percentage,
        isAchieved
      };
    });

    res.json({
      program: {
        ...program,
        daysRemaining,
        isEventActive,
        bankConfigs,
        paidComboSets
      },
      bankStats,
      paidComboSets,
      stats: {
        totalTeamClosed: closedApps.length,
        totalHrClosed: hrCode ? hrFreeClosedApps.length + hrPaidClosedApps.length : 0
      }
    });
  } catch (error) {
    console.error('Error fetching offer program:', error);
    res.status(500).json({ error: 'Failed to fetch offer program.' });
  }
});

// PUT update active program (Admin)
router.put('/program', async (req, res) => {
  try {
    const {
      badgeText,
      programName,
      subtitle,
      startDate,
      endDate,
      status,
      banks,
      freeTeamTarget,
      freeIndividualSlabs,
      paidTeamTarget,
      paidIndividualSlabs,
      paidComboSets,
      bankConfigs
    } = req.body;

    let program = await OfferProgramModel.findOne({ id: 'active_program' });
    if (!program) {
      program = new OfferProgramModel({ id: 'active_program' });
    }

    if (badgeText !== undefined) program.badgeText = badgeText.trim();
    if (programName !== undefined) program.programName = programName.trim();
    if (subtitle !== undefined) program.subtitle = subtitle.trim();
    if (startDate !== undefined) program.startDate = startDate.trim();
    if (endDate !== undefined) program.endDate = endDate.trim();
    if (status !== undefined) program.status = status;
    if (banks !== undefined) program.banks = Array.isArray(banks) ? banks : [banks];
    if (freeTeamTarget !== undefined) program.freeTeamTarget = freeTeamTarget;
    if (freeIndividualSlabs !== undefined) program.freeIndividualSlabs = freeIndividualSlabs;
    if (paidTeamTarget !== undefined) program.paidTeamTarget = paidTeamTarget;
    if (paidIndividualSlabs !== undefined) program.paidIndividualSlabs = paidIndividualSlabs;
    if (paidComboSets !== undefined) {
      program.paidComboSets = paidComboSets;
      program.markModified('paidComboSets');
    }
    if (bankConfigs !== undefined) {
      program.bankConfigs = bankConfigs;
      program.markModified('bankConfigs');
    }

    program.updatedAt = new Date().toISOString();
    await program.save();

    res.json({ message: 'Program updated successfully', program });
  } catch (error) {
    console.error('Error updating offer program:', error);
    res.status(500).json({ error: 'Failed to update offer program.' });
  }
});

// PUT update individual bank targets
router.put('/bank-target', async (req, res) => {
  try {
    const { bankName, freeTeamTarget, freeIndividualSlabs, paidTeamTarget, paidIndividualSlabs } = req.body;
    if (!bankName) return res.status(400).json({ error: 'bankName is required.' });

    let program = await OfferProgramModel.findOne({ id: 'active_program' });
    if (!program) {
      program = new OfferProgramModel({ id: 'active_program' });
    }

    const currentConfigs = program.bankConfigs || {};
    currentConfigs[bankName] = {
      ...(currentConfigs[bankName] || {}),
      ...(freeTeamTarget !== undefined ? { freeTeamTarget } : {}),
      ...(freeIndividualSlabs !== undefined ? { freeIndividualSlabs } : {}),
      ...(paidTeamTarget !== undefined ? { paidTeamTarget } : {}),
      ...(paidIndividualSlabs !== undefined ? { paidIndividualSlabs } : {})
    };

    program.bankConfigs = currentConfigs;
    program.markModified('bankConfigs');
    program.updatedAt = new Date().toISOString();
    await program.save();

    res.json({ message: `Targets for ${bankName} updated successfully`, bankConfig: currentConfigs[bankName] });
  } catch (err) {
    console.error('Error updating bank target:', err);
    res.status(500).json({ error: 'Failed to update bank target.' });
  }
});

// PUT update paid combo sets (Admin)
router.put('/paid-combo-sets', async (req, res) => {
  try {
    const { comboSets } = req.body;
    if (!Array.isArray(comboSets)) return res.status(400).json({ error: 'comboSets array is required.' });

    let program = await OfferProgramModel.findOne({ id: 'active_program' });
    if (!program) {
      program = new OfferProgramModel({ id: 'active_program' });
    }

    program.paidComboSets = comboSets;
    program.markModified('paidComboSets');
    program.updatedAt = new Date().toISOString();
    await program.save();

    res.json({ message: 'FIC Training Combo Sets updated successfully', paidComboSets: comboSets });
  } catch (err) {
    console.error('Error updating paid combo sets:', err);
    res.status(500).json({ error: 'Failed to update paid combo sets.' });
  }
});

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
