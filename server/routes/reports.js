const express = require('express');
const router = express.Router();
const { readDBAsync } = require('../db');

// GET /api/reports/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const db = await readDBAsync();

    const validApps = db.applications.filter(a => a.status !== 'Payment Pending');
    const candidateIdsWithValidApps = new Set(validApps.map(a => String(a.candidateId)));
    const candidateIdsWithPendingApps = new Set(db.applications.filter(a => a.status === 'Payment Pending').map(a => String(a.candidateId)));

    const totalJobs = db.jobs.length;
    const activeJobs = db.jobs.filter(j => j.status === 'Active').length;
    
    const totalCandidates = db.candidates.filter(c => {
      const hasValid = candidateIdsWithValidApps.has(String(c.id));
      const hasPending = candidateIdsWithPendingApps.has(String(c.id));
      if (hasPending && !hasValid) return false;
      return true;
    }).length;
    
    const totalApplications = validApps.length;

    // Deduplicate scheduled interviews count
    const uniqueIntMap = new Map();
    (db.interviews || []).forEach(item => {
      if (!item.status || item.status === 'Scheduled') {
        const key = `${item.applicationId || item.candidateId}_${item.round || 'HR Screening'}`;
        if (!uniqueIntMap.has(key)) {
          uniqueIntMap.set(key, item);
        }
      }
    });
    const scheduledInterviews = uniqueIntMap.size;
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

