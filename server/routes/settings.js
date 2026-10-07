const express = require('express');
const router = express.Router();
const { GlobalSettingsModel } = require('../db');

// GET /api/settings/it-training-incentives
router.get('/it-training-incentives', async (req, res) => {
  try {
    const settings = await GlobalSettingsModel.findOne({ type: 'IT_TRAINING_INCENTIVES' });
    res.json(settings ? settings.data : {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// POST /api/settings/it-training-incentives
router.post('/it-training-incentives', async (req, res) => {
  try {
    const data = req.body;
    const settings = await GlobalSettingsModel.findOneAndUpdate(
      { type: 'IT_TRAINING_INCENTIVES' },
      { data },
      { upsert: true, new: true }
    );
    res.json(settings.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

module.exports = router;
