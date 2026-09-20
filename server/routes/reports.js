const express = require('express');
const router = express.Router();
const { readDBAsync } = require('../db');

// GET /api/reports/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const db = await readDBAsync();

    const totalJobs = db.jobs.length;
    const activeJobs = db.jobs.filter(j => j.status === 'Active').length;
    const totalCandidates = db.candidates.length;
    const totalApplications = db.applications.length;
    const scheduledInterviews = db.interviews.filter(i => i.status === 'Scheduled').length;
    const selectedCandidates = db.applications.filter(a => a.status === 'Selected').length;

    // Group applications by category
    const appsByCategory = {};
    db.applications.forEach(app => {
      const cat = db.categories.find(c => c.id === app.categoryId);
      const catName = cat ? cat.name : 'Other';
      appsByCategory[catName] = (appsByCategory[catName] || 0) + 1;
    });

    // Group applications by company
    const appsByCompany = {};
    db.applications.forEach(app => {
      const comp = db.companies.find(c => c.id === app.companyId);
      const compName = comp ? comp.name : 'Other';
      appsByCompany[compName] = (appsByCompany[compName] || 0) + 1;
    });

    // Applications status breakdown
    const statusBreakdown = {
      Applied: db.applications.filter(a => a.status === 'Applied').length,
      Shortlisted: db.applications.filter(a => a.status === 'Shortlisted').length,
      'Interview Scheduled': db.applications.filter(a => a.status === 'Interview Scheduled').length,
      Selected: db.applications.filter(a => a.status === 'Selected').length,
      Rejected: db.applications.filter(a => a.status === 'Rejected').length
    };

    res.json({
      kpis: {
        totalJobs,
        activeJobs,
        totalCandidates,
        totalApplications,
        scheduledInterviews,
        selectedCandidates
      },
      charts: {
        appsByCategory,
        appsByCompany,
        statusBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate dashboard report from MongoDB Atlas.' });
  }
});

module.exports = router;

