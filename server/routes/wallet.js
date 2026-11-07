const express = require('express');
const router = express.Router();
const { UserModel, WithdrawalRequestModel, WalletTransactionModel } = require('../db');
const { getMlmSettings, saveMlmSettings } = require('../services/mlmService');

// GET /api/wallet/my-wallet (userId query or header)
router.get('/my-wallet', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const user = await UserModel.findOne({
      $or: [{ id: userId }, { _id: userId.length === 24 ? userId : null }],
    }).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const transactions = await WalletTransactionModel.find({
      userId: user.id || String(user._id),
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const pendingWithdrawals = await WithdrawalRequestModel.find({
      userId: user.id || String(user._id),
      status: 'Pending',
    }).lean();

    const pendingTotal = pendingWithdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

    res.json({
      userId: user.id || String(user._id),
      name: user.name,
      role: user.role,
      referralCode: user.referralCode,
      walletBalance: Number(user.walletBalance) || 0,
      totalEarned: Number(user.totalEarned) || 0,
      totalWithdrawn: Number(user.totalWithdrawn) || 0,
      pendingWithdrawalsAmount: pendingTotal,
      upiId: user.upiId || user.bankAccountNumber || '',
      bankDetails: {
        accountNumber: user.bankAccountNumber || '',
        ifscCode: user.bankIfscCode || '',
      },
      transactions: transactions || [],
    });
  } catch (err) {
    console.error('Error fetching wallet:', err);
    res.status(500).json({ error: 'Failed to fetch wallet details.' });
  }
});

// POST /api/wallet/withdraw (Partner submits withdrawal request)
router.post('/withdraw', async (req, res) => {
  try {
    const { userId, amount, payoutMethod, upiId, bankDetails } = req.body;

    const withdrawAmt = Number(amount);
    if (!userId || isNaN(withdrawAmt) || withdrawAmt <= 0) {
      return res.status(400).json({ error: 'Valid user ID and withdrawal amount are required.' });
    }

    const user = await UserModel.findOne({
      $or: [{ id: userId }, { _id: userId.length === 24 ? userId : null }],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const currentBal = Number(user.walletBalance) || 0;
    if (withdrawAmt > currentBal) {
      return res.status(400).json({ error: `Insufficient wallet balance. Available: ₹${currentBal}` });
    }

    const settings = await getMlmSettings();
    const minAmount = settings.minWithdrawalAmount || 500;
    if (withdrawAmt < minAmount) {
      return res.status(400).json({ error: `Minimum withdrawal amount is ₹${minAmount}.` });
    }

    // Deduct from wallet balance
    const newBal = currentBal - withdrawAmt;
    user.walletBalance = newBal;
    if (upiId) user.upiId = upiId;
    if (bankDetails?.accountNumber) user.bankAccountNumber = bankDetails.accountNumber;
    if (bankDetails?.ifscCode) user.bankIfscCode = bankDetails.ifscCode;
    await user.save();

    const reqId = 'wth_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newRequest = await WithdrawalRequestModel.create({
      id: reqId,
      userId: user.id || String(user._id),
      userName: user.name || 'User',
      userRole: user.role || 'agent',
      userEmail: user.email || '',
      userMobile: user.mobile || '',
      amount: withdrawAmt,
      status: 'Pending',
      payoutMethod: payoutMethod || 'upi',
      upiId: upiId || user.upiId || '',
      bankDetails: bankDetails || {
        accountNumber: user.bankAccountNumber || '',
        ifscCode: user.bankIfscCode || '',
      },
      requestedAt: new Date().toISOString(),
    });

    // Record Debit Transaction
    const txId = 'tx_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    await WalletTransactionModel.create({
      id: txId,
      userId: user.id || String(user._id),
      userName: user.name,
      userRole: user.role,
      type: 'debit_withdrawal',
      amount: withdrawAmt,
      balanceAfter: newBal,
      description: `Withdrawal Request submitted (${payoutMethod === 'bank' ? 'Bank Transfer' : 'UPI: ' + (upiId || '')})`,
      withdrawalRequestId: reqId,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully.',
      withdrawal: newRequest,
      newWalletBalance: newBal,
    });
  } catch (err) {
    console.error('Error submitting withdrawal:', err);
    res.status(500).json({ error: 'Failed to submit withdrawal request.' });
  }
});

// GET /api/wallet/admin/withdrawals (Admin lists all withdrawal requests)
router.get('/admin/withdrawals', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = new RegExp(`^${status}$`, 'i');
    }

    const requests = await WithdrawalRequestModel.find(query).sort({ requestedAt: -1 }).lean();
    res.json(requests);
  } catch (err) {
    console.error('Error fetching withdrawal requests:', err);
    res.status(500).json({ error: 'Failed to fetch withdrawal requests.' });
  }
});

// PUT /api/wallet/admin/withdrawals/:id/status (Admin approves/rejects/pays request)
router.put('/admin/withdrawals/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, transactionRef, processedBy } = req.body;

    if (!['Paid', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be Paid, Rejected, or Pending.' });
    }

    const request = await WithdrawalRequestModel.findOne({ id });
    if (!request) {
      return res.status(404).json({ error: 'Withdrawal request not found.' });
    }

    if (request.status === status) {
      return res.json(request);
    }

    const previousStatus = request.status;
    request.status = status;
    request.adminNotes = adminNotes || request.adminNotes;
    request.transactionRef = transactionRef || request.transactionRef;
    request.processedBy = processedBy || request.processedBy || 'Admin';
    request.processedAt = new Date().toISOString();
    await request.save();

    // If marked Paid, increment user's totalWithdrawn
    if (status === 'Paid' && previousStatus !== 'Paid') {
      await UserModel.findOneAndUpdate(
        { $or: [{ id: request.userId }, { _id: request.userId.length === 24 ? request.userId : null }] },
        { $inc: { totalWithdrawn: request.amount } }
      );
    }

    // If Rejected, refund the amount back into user's wallet
    if (status === 'Rejected' && previousStatus === 'Pending') {
      const user = await UserModel.findOne({
        $or: [{ id: request.userId }, { _id: request.userId.length === 24 ? request.userId : null }],
      });
      if (user) {
        user.walletBalance = (Number(user.walletBalance) || 0) + Number(request.amount);
        await user.save();

        const refundTxId = 'tx_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        await WalletTransactionModel.create({
          id: refundTxId,
          userId: user.id || String(user._id),
          userName: user.name,
          userRole: user.role,
          type: 'adjustment',
          amount: request.amount,
          balanceAfter: user.walletBalance,
          description: `Refund: Withdrawal Request #${request.id} rejected (${adminNotes || 'Contact Admin'})`,
          withdrawalRequestId: request.id,
          createdAt: new Date().toISOString(),
        });
      }
    }

    res.json(request);
  } catch (err) {
    console.error('Error updating withdrawal request:', err);
    res.status(500).json({ error: 'Failed to update withdrawal request.' });
  }
});

// GET /api/wallet/admin/mlm-settings
router.get('/admin/mlm-settings', async (req, res) => {
  try {
    const settings = await getMlmSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch MLM settings.' });
  }
});

// POST /api/wallet/admin/mlm-settings
router.post('/admin/mlm-settings', async (req, res) => {
  try {
    const updated = await saveMlmSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save MLM settings.' });
  }
});

module.exports = router;
