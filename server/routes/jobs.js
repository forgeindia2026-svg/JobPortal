const express = require('express');
const router = express.Router();
const { JobModel, CompanyModel, CategoryModel, invalidateDBCache } = require('../db');

// In-memory cache for companies & categories (rarely change)
let metaCache = { companies: null, categories: null, timestamp: 0 };
const META_TTL = 30000; // 30s cache

async function getJobMeta() {
  const now = Date.now();
  if (metaCache.companies && metaCache.categories && (now - metaCache.timestamp < META_TTL)) {
    return metaCache;
  }
  const [companies, categories] = await Promise.all([
    CompanyModel.find({}).lean(),
    CategoryModel.find({}).lean()
  ]);
  metaCache = { companies: companies || [], categories: categories || [], timestamp: now };
  return metaCache;
}

// GET /api/jobs (supports query: categoryId, companyId, status, search, location)
router.get('/', async (req, res) => {
  try {
    const { categoryId, companyId, status, search, location } = req.query;
    const filter = {};
    if (categoryId) filter.categoryId = categoryId;
    if (companyId) filter.companyId = companyId;
    if (status) filter.status = new RegExp(`^${status}$`, 'i');
    if (location) filter.location = new RegExp(location, 'i');
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { skills: searchRegex }
      ];
    }

    const [jobs, { companies, categories }] = await Promise.all([
      JobModel.find(filter).lean(),
      getJobMeta()
    ]);

    // Populate company and category details for easy UI rendering
    const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const populated = (jobs || []).map(job => {
      const company = companies.find(c => c.id === job.companyId);
      const category = categories.find(cat => cat.id === job.categoryId);
      let companyLogo = company ? (company.logo || '') : '';
      if (companyLogo.match(/^https?:\/\/localhost(:\d+)?/)) {
        companyLogo = companyLogo.replace(/^https?:\/\/localhost(:\d+)?/, baseUrl);
      } else if (companyLogo.startsWith('/')) {
        companyLogo = `${baseUrl}${companyLogo}`;
      }
      return {
        ...job,
        companyName: company ? company.name : 'Unknown Company',
        companyLogo,
        categoryName: category ? category.name : 'Uncategorized'
      };
    });

    populated.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
        return Number(a.order) - Number(b.order);
      }
      return 0;
    });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs from MongoDB Atlas.' });
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [job, { companies, categories }] = await Promise.all([
      JobModel.findOne({ id }).lean(),
      getJobMeta()
    ]);

    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    const company = companies.find(c => c.id === job.companyId);
    const category = categories.find(cat => cat.id === job.categoryId);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    let companyLogo = company ? (company.logo || '') : '';
    if (companyLogo.match(/^https?:\/\/localhost(:\d+)?/)) {
      companyLogo = companyLogo.replace(/^https?:\/\/localhost(:\d+)?/, baseUrl);
    } else if (companyLogo.startsWith('/')) {
      companyLogo = `${baseUrl}${companyLogo}`;
    }

    res.json({
      ...job,
      companyName: company ? company.name : 'Unknown Company',
      companyLogo,
      companyDescription: company ? company.description : '',
      companyWebsite: company ? company.website : '',
      categoryName: category ? category.name : 'Uncategorized'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job from MongoDB Atlas.' });
  }
});

// POST /api/jobs
router.post('/', async (req, res) => {
  try {
    const {
      companyId,
      categoryId,
      title,
      jobType = 'Full Time',
      location,
      experience,
      qualification,
      salary,
      trainingPeriod,
      trainingFee,
      feeRefundType,
      feeRefundDetails,
      interviewCrackFee,
      interviewFeeStage,
      interviewFeeDetails,
      ficTrainingPeriod,
      trainingDetails,
      trainingTitle,
      trainingSubtext,
      stipendTitle,
      stipendSubtext,
      salarySubtext,
      locationSubtext,
      trainingPhases = [],
      openings = 1,
      description,
      responsibilities = [],
      requirements = [],
      skills = [],
      interviewSteps = [],
      documentsRequired = [],
      lastDate,
      hrIncentiveFree = 0,
      hrIncentivePaid = 0,
      status = 'Active'
    } = req.body;

    if (!companyId || !categoryId || !title) {
      return res.status(400).json({ error: 'Company ID, Category ID, and Job Title are required.' });
    }

    const newJob = {
      id: 'job_' + Date.now(),
      companyId,
      categoryId,
      title,
      jobType,
      location: location || 'Flexible',
      experience: experience || '0 - 1 Years',
      qualification: qualification || 'Any Degree',
      salary: salary || 'As per industry standards',
      trainingPeriod: trainingPeriod || '',
      trainingFee: trainingFee || '',
      feeRefundType: feeRefundType || '',
      feeRefundDetails: feeRefundDetails || '',
      interviewCrackFee: interviewCrackFee || '',
      interviewFeeStage: interviewFeeStage || '',
      interviewFeeDetails: interviewFeeDetails || '',
      ficTrainingPeriod: ficTrainingPeriod || '',
      trainingDetails: trainingDetails || null,
      trainingTitle: trainingTitle || '',
      trainingSubtext: trainingSubtext || '',
      stipendTitle: stipendTitle || '',
      stipendSubtext: stipendSubtext || '',
      salarySubtext: salarySubtext || '',
      locationSubtext: locationSubtext || '',
      trainingPhases: Array.isArray(trainingPhases) ? trainingPhases : [],
      openings: Number(openings) || 1,
      description: description || '',
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      skills: Array.isArray(skills) ? skills : [],
      interviewSteps: Array.isArray(interviewSteps) ? interviewSteps : [],
      documentsRequired: Array.isArray(documentsRequired) ? documentsRequired : [],
      lastDate: lastDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      hrIncentiveFree: Number(hrIncentiveFree) || 0,
      hrIncentivePaid: Number(hrIncentivePaid) || 0,
      status,
      createdAt: new Date().toISOString()
    };

    const savedJob = await JobModel.create(newJob);
    invalidateDBCache();
    console.log('✅ New Job saved directly into MongoDB Atlas Cloud:', savedJob.id);
    res.status(201).json(savedJob.toObject());
  } catch (err) {
    console.error('Error creating job in MongoDB Atlas:', err);
    res.status(500).json({ error: 'Failed to save job into MongoDB Atlas.' });
  }
});

// PUT /api/jobs/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateObj = { ...req.body, updatedAt: new Date().toISOString() };
    const updated = await JobModel.findOneAndUpdate({ id }, { $set: updateObj }, { new: true }).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Job opening not found.' });
    }

    invalidateDBCache();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update job in MongoDB Atlas.' });
  }
});

// DELETE /api/jobs/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await JobModel.deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Job opening not found.' });
    }
    invalidateDBCache();
    res.json({ message: 'Job opening deleted successfully from MongoDB Atlas.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete job from MongoDB Atlas.' });
  }
});

module.exports = router;

