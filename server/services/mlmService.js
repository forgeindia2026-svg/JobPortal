const { UserModel, GlobalSettingsModel, WalletTransactionModel, ApplicationModel } = require('../db');

const DEFAULT_MLM_SETTINGS = {
  maxDepth: 50,
  minWithdrawalAmount: 500,
  paidTiers: [
    { minLevel: 1, maxLevel: 10, amount: 100 },
    { minLevel: 11, maxLevel: 20, amount: 50 },
    { minLevel: 21, maxLevel: 30, amount: 40 },
    { minLevel: 31, maxLevel: 40, amount: 30 },
    { minLevel: 41, maxLevel: 50, amount: 20 },
  ],
  freeTiers: [
    { minLevel: 1, maxLevel: 10, amount: 10 },
    { minLevel: 11, maxLevel: 20, amount: 5 },
    { minLevel: 21, maxLevel: 30, amount: 4 },
    { minLevel: 31, maxLevel: 40, amount: 3 },
    { minLevel: 41, maxLevel: 50, amount: 2 },
  ],
};

async function getMlmSettings() {
  try {
    const record = await GlobalSettingsModel.findOne({ type: 'mlm-commission-slabs' }).lean();
    if (record && record.data) {
      return {
        maxDepth: record.data.maxDepth || DEFAULT_MLM_SETTINGS.maxDepth,
        minWithdrawalAmount: record.data.minWithdrawalAmount || DEFAULT_MLM_SETTINGS.minWithdrawalAmount,
        paidTiers: Array.isArray(record.data.paidTiers) ? record.data.paidTiers : DEFAULT_MLM_SETTINGS.paidTiers,
        freeTiers: Array.isArray(record.data.freeTiers) ? record.data.freeTiers : DEFAULT_MLM_SETTINGS.freeTiers,
      };
    }
  } catch (err) {
    console.error('Error fetching MLM settings:', err);
  }
  return DEFAULT_MLM_SETTINGS;
}

async function saveMlmSettings(newData) {
  const settings = {
    maxDepth: Number(newData.maxDepth) || DEFAULT_MLM_SETTINGS.maxDepth,
    minWithdrawalAmount: Number(newData.minWithdrawalAmount) || DEFAULT_MLM_SETTINGS.minWithdrawalAmount,
    paidTiers: Array.isArray(newData.paidTiers) ? newData.paidTiers : DEFAULT_MLM_SETTINGS.paidTiers,
    freeTiers: Array.isArray(newData.freeTiers) ? newData.freeTiers : DEFAULT_MLM_SETTINGS.freeTiers,
    updatedAt: new Date().toISOString(),
  };

  await GlobalSettingsModel.findOneAndUpdate(
    { type: 'mlm-commission-slabs' },
    { $set: { data: settings } },
    { upsert: true, new: true }
  );

  return settings;
}

function getTierAmount(tiers, depth) {
  if (!Array.isArray(tiers)) return 0;
  for (const tier of tiers) {
    if (depth >= Number(tier.minLevel) && depth <= Number(tier.maxLevel)) {
      return Number(tier.amount) || 0;
    }
  }
  return 0;
}

async function creditUserWallet({
  userId,
  amount,
  type,
  description,
  applicationId,
  candidateName,
  jobTitle,
  closerUserId,
  closerUserName,
  levelDepth,
}) {
  if (!userId || amount <= 0) return null;

  const user = await UserModel.findOne({ $or: [{ id: userId }, { _id: userId.length === 24 ? userId : null }] });
  if (!user) return null;

  const currentBal = Number(user.walletBalance) || 0;
  const currentEarned = Number(user.totalEarned) || 0;
  const newBal = currentBal + amount;
  const newEarned = currentEarned + amount;

  user.walletBalance = newBal;
  user.totalEarned = newEarned;
  await user.save();

  const txId = 'tx_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const tx = await WalletTransactionModel.create({
    id: txId,
    userId: user.id || String(user._id),
    userName: user.name || 'User',
    userRole: user.role || 'agent',
    type,
    amount,
    balanceAfter: newBal,
    description,
    applicationId,
    candidateName,
    jobTitle,
    closerUserId,
    closerUserName,
    levelDepth: Number(levelDepth) || 0,
    createdAt: new Date().toISOString(),
  });

  return tx;
}

async function distributeMlmCommission(application) {
  try {
    if (!application) return { success: false, reason: 'No application provided' };
    if (application.mlmCommissionDistributed) {
      return { success: false, reason: 'MLM commission already distributed for this application' };
    }

    const status = String(application.status || '').toLowerCase().trim();
    const isClosed =
      status.includes('select') ||
      status.includes('closed') ||
      status.includes('join') ||
      status.includes('hired') ||
      status.includes('convert');

    if (!isClosed) {
      return { success: false, reason: 'Status is not closed or selected' };
    }

    const refCode = String(application.referredBy || '').trim();
    if (!refCode || refCode.toLowerCase() === 'direct') {
      return { success: false, reason: 'Direct application - no referrer' };
    }

    const referrer = await UserModel.findOne({
      referralCode: { $regex: new RegExp(`^${refCode}$`, 'i') },
    }).lean();

    if (!referrer) {
      return { success: false, reason: 'Referrer user not found' };
    }

    const isPaid = Number(application.paymentAmount) >= 1499 || Boolean(application.isFicFlow);
    const candidateName =
      application.candidateName ||
      application.candidateDetails?.name ||
      application.candidateDetails?.fullName ||
      'Candidate';
    const jobTitle = application.jobTitle || 'Job Opening';
    const appId = application.id || String(application._id);

    const settings = await getMlmSettings();
    const activeTiers = isPaid ? settings.paidTiers : settings.freeTiers;
    const distributedLogs = [];

    // 1. Direct Closer Commission
    if (referrer.role === 'agent') {
      const closerIncentive =
        Number(application.agentIncentiveAmount) || (isPaid ? 200 : 50);

      if (closerIncentive > 0) {
        const closerTx = await creditUserWallet({
          userId: referrer.id,
          amount: closerIncentive,
          type: 'credit_direct',
          description: `Direct Commission for ${candidateName} (${jobTitle})`,
          applicationId: appId,
          candidateName,
          jobTitle,
          closerUserId: referrer.id,
          closerUserName: referrer.name,
          levelDepth: 0,
        });
        distributedLogs.push({ role: 'closer', name: referrer.name, amount: closerIncentive, tx: closerTx?.id });
      }

      // 2. Walk up the Upline Partner Tree
      let currentPartner = referrer;
      let depth = 1;

      while (currentPartner.parentAgentId && depth <= settings.maxDepth) {
        const parentAgent = await UserModel.findOne({
          id: currentPartner.parentAgentId,
          role: 'agent',
        }).lean();

        if (!parentAgent) break;

        const uplineAmount = getTierAmount(activeTiers, depth);
        if (uplineAmount > 0) {
          const uplineTx = await creditUserWallet({
            userId: parentAgent.id,
            amount: uplineAmount,
            type: 'credit_upline',
            description: `Upline Commission (Level ${depth}) for ${candidateName} closed by ${referrer.name}`,
            applicationId: appId,
            candidateName,
            jobTitle,
            closerUserId: referrer.id,
            closerUserName: referrer.name,
            levelDepth: depth,
          });
          distributedLogs.push({
            role: 'upline',
            level: depth,
            name: parentAgent.name,
            amount: uplineAmount,
            tx: uplineTx?.id,
          });
        }

        currentPartner = parentAgent;
        depth++;
      }
    }

    // 3. Root HR Commission
    const rootHrId = referrer.role === 'hr' ? referrer.id : referrer.parentHrId;
    if (rootHrId) {
      const hrIncentive = Number(application.incentiveAmount) || (isPaid ? 300 : 100);
      if (hrIncentive > 0) {
        const hrTx = await creditUserWallet({
          userId: rootHrId,
          amount: hrIncentive,
          type: 'credit_hr_override',
          description: `HR Network Override for ${candidateName} (${jobTitle}) closed by ${referrer.name}`,
          applicationId: appId,
          candidateName,
          jobTitle,
          closerUserId: referrer.id,
          closerUserName: referrer.name,
          levelDepth: 0,
        });
        distributedLogs.push({ role: 'hr', hrId: rootHrId, amount: hrIncentive, tx: hrTx?.id });
      }
    }

    // 4. Mark application as distributed in MongoDB
    await ApplicationModel.findOneAndUpdate(
      { $or: [{ id: appId }, { _id: appId.length === 24 ? appId : null }] },
      {
        $set: {
          mlmCommissionDistributed: true,
          mlmDistributedAt: new Date().toISOString(),
          mlmDistributedLogs: distributedLogs,
        },
      }
    );

    return {
      success: true,
      distributedLogs,
    };
  } catch (err) {
    console.error('Error in distributeMlmCommission:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  DEFAULT_MLM_SETTINGS,
  getMlmSettings,
  saveMlmSettings,
  getTierAmount,
  creditUserWallet,
  distributeMlmCommission,
};

