const express = require('express');
const router = express.Router();
const { PartnerIncentiveModel } = require('../db');

// GET /api/partner-incentives?hrId=xxx
router.get('/', async (req, res) => {
  try {
    const { hrId } = req.query;
    if (!hrId) {
      return res.status(400).json({ error: 'hrId is required' });
    }
    const incentives = await PartnerIncentiveModel.find({ hrId }).lean();
    res.json(incentives);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch partner incentives' });
  }
});

// POST /api/partner-incentives
// Body: { hrId, jobId, freeJobIncentive, paidJobIncentive, processIncentives }
router.post('/', async (req, res) => {
  try {
    const { hrId, jobId, freeJobIncentive, paidJobIncentive, processIncentives } = req.body;
    if (!hrId || !jobId) {
      return res.status(400).json({ error: 'hrId and jobId are required' });
    }

    const updateObj = {
      freeJobIncentive: Number(freeJobIncentive) || 0,
      paidJobIncentive: Number(paidJobIncentive) || 0,
      processIncentives: processIncentives || {},
      updatedAt: new Date().toISOString()
    };

    let record = await PartnerIncentiveModel.findOne({ hrId, jobId });
    if (record) {
      Object.assign(record, updateObj);
      await record.save();
    } else {
      record = await PartnerIncentiveModel.create({
        id: 'pi_' + Date.now() + '_' + Math.floor(Math.random()*1000),
        hrId,
        jobId,
        ...updateObj,
        createdAt: new Date().toISOString()
      });
    }

    res.json(record);
  } catch (err) {
    console.error('Error saving partner incentive:', err);
    res.status(500).json({ error: 'Failed to save partner incentive' });
  }
});

module.exports = router;
