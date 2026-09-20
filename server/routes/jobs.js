const express = require('express');
const router = express.Router();
const { readDBAsync, JobModel } = require('../db');

// GET /api/jobs (supports query: categoryId, companyId, status, search, location)
router.get('/', async (req, res) => {
  try {
    const { categoryId, companyId, status, search, location } = req.query;
    const db = await readDBAsync();
    let jobs = db.jobs || [];

    if (categoryId) {
      jobs = jobs.filter(j => j.categoryId === categoryId);
    }
    if (companyId) {
      jobs = jobs.filter(j => j.companyId === companyId);
    }
    if (status) {
      jobs = jobs.filter(j => j.status && j.status.toLowerCase() === status.toLowerCase());
    }
    if (location) {
      jobs = jobs.filter(j => j.location && j.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j => 
        (j.title && j.title.toLowerCase().includes(q)) ||
        (j.description && j.description.toLowerCase().includes(q)) ||
        (j.skills && j.skills.some(s => s.toLowerCase().includes(q)))
      );
    }

    // Populate company and category details for easy UI rendering
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const populated = jobs.map(job => {
      const company = db.companies.find(c => c.id === job.companyId);
      const category = db.categories.find(cat => cat.id === job.categoryId);
      let companyLogo = company ? (company.logo || '') : '';
      if (companyLogo.startsWith('http://localhost:5000')) {
        companyLogo = companyLogo.replace('http://localhost:5000', baseUrl);
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

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs from MongoDB Atlas.' });
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDBAsync();
    const job = db.jobs.find(j => j.id === id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    const company = db.companies.find(c => c.id === job.companyId);
    const category = db.categories.find(cat => cat.id === job.categoryId);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    let companyLogo = company ? (company.logo || '') : '';
    if (companyLogo.startsWith('http://localhost:5000')) {
      companyLogo = companyLogo.replace('http://localhost:5000', baseUrl);
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
      trainingDetails,
      trainingPhases = [],
      openings = 1,
      description,
      responsibilities = [],
      requirements = [],
      skills = [],
      interviewSteps = [],
      documentsRequired = [],
      lastDate,
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
      trainingDetails: trainingDetails || null,
      trainingPhases: Array.isArray(trainingPhases) ? trainingPhases : [],
      openings: Number(openings) || 1,
      description: description || '',
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      skills: Array.isArray(skills) ? skills : [],
      interviewSteps: Array.isArray(interviewSteps) ? interviewSteps : [],
      documentsRequired: Array.isArray(documentsRequired) ? documentsRequired : [],
      lastDate: lastDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status,
      createdAt: new Date().toISOString()
    };

    const savedJob = await JobModel.create(newJob);
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
    res.json({ message: 'Job opening deleted successfully from MongoDB Atlas.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete job from MongoDB Atlas.' });
  }
});

module.exports = router;

