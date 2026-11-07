const express = require('express');
const router = express.Router();
const {
  JobModel,
  CandidateModel,
  ApplicationModel,
  InterviewModel,
  CategoryModel,
  CompanyModel,
  GlobalSettingsModel
} = require('../db');

// In-memory cache for dashboard KPI report (15 seconds TTL)
let reportCache = { data: null, timestamp: 0 };
const REPORT_TTL = 15000;

// GET /api/reports/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const now = Date.now();
    if (reportCache.data && (now - reportCache.timestamp < REPORT_TTL)) {
      return res.json(reportCache.data);
    }

    const [
      totalJobs,
      activeJobs,
      platformStats,
      rawApps,
      rawCandidates,
      rawInterviews,
      categories,
      companies
    ] = await Promise.all([
      JobModel.countDocuments(),
      JobModel.countDocuments({ status: { $regex: /^active$/i } }),
      GlobalSettingsModel.findOne({ type: 'platform_stats' }).lean().catch(() => null),
      ApplicationModel.find({}, 'id status candidateId categoryId companyId').lean(),
      CandidateModel.find({}, 'id email mobile').lean(),
      InterviewModel.find({ status: { $in: ['Scheduled', null] } }, 'applicationId candidateId round status').lean(),
      CategoryModel.find({}, 'id name').lean(),
      CompanyModel.find({}, 'id name').lean()
    ]);

    const directLinkClicks = platformStats?.data?.directLinkClicks || 0;
    const applications = rawApps || [];
    const candidates = rawCandidates || [];

    const validApps = applications.filter(a => a.status !== 'Payment Pending');
    const candidateIdsWithValidApps = new Set(validApps.map(a => String(a.candidateId)));
    const candidateIdsWithPendingApps = new Set(applications.filter(a => a.status === 'Payment Pending').map(a => String(a.candidateId)));

    const activeCandidates = candidates.filter(c => {
      const hasValid = candidateIdsWithValidApps.has(String(c.id));
      const hasPending = candidateIdsWithPendingApps.has(String(c.id));
      if (hasPending && !hasValid) return false;
      return true;
    });

    const seenIdentifiers = new Set();
    let totalCandidates = 0;

    activeCandidates.forEach(c => {
      const email = c.email ? c.email.toLowerCase().trim() : null;
      const mobile = c.mobile ? c.mobile.trim() : null;
      
      const emailKey = email ? `email:${email}` : null;
      const mobileKey = mobile ? `mobile:${mobile}` : null;
      
      let isDuplicate = false;
      if (emailKey && seenIdentifiers.has(emailKey)) isDuplicate = true;
      if (mobileKey && seenIdentifiers.has(mobileKey)) isDuplicate = true;
      
      if (!isDuplicate) {
        totalCandidates++;
      }
      
      if (emailKey) seenIdentifiers.add(emailKey);
      if (mobileKey) seenIdentifiers.add(mobileKey);
    });
    
    const totalApplications = validApps.length;

    // Deduplicate scheduled interviews count
    const uniqueIntMap = new Map();
    (rawInterviews || []).forEach(item => {
      if (!item.status || item.status === 'Scheduled') {
        const key = `${item.applicationId || item.candidateId}_${item.round || 'HR Screening'}`;
        if (!uniqueIntMap.has(key)) {
          uniqueIntMap.set(key, item);
        }
      }
    });
    const scheduledInterviews = uniqueIntMap.size;
    const selectedCandidates = applications.filter(a => a.status === 'Selected').length;

    // Group applications by category
    const catMap = new Map((categories || []).map(c => [c.id, c.name]));
    const appsByCategory = {};
    applications.forEach(app => {
      const catName = catMap.get(app.categoryId) || 'Other';
      appsByCategory[catName] = (appsByCategory[catName] || 0) + 1;
    });

    // Group applications by company
    const compMap = new Map((companies || []).map(c => [c.id, c.name]));
    const appsByCompany = {};
    applications.forEach(app => {
      const compName = compMap.get(app.companyId) || 'Other';
      appsByCompany[compName] = (appsByCompany[compName] || 0) + 1;
    });

    // Applications status breakdown
    const statusBreakdown = {
      Applied: applications.filter(a => a.status === 'Applied').length,
      Shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
      'Interview Scheduled': applications.filter(a => a.status === 'Interview Scheduled').length,
      Selected: applications.filter(a => a.status === 'Selected').length,
      Rejected: applications.filter(a => a.status === 'Rejected').length
    };

    const responseData = {
      kpis: {
        totalJobs,
        activeJobs,
        totalCandidates,
        totalApplications,
        scheduledInterviews,
        selectedCandidates,
        directLinkClicks
      },
      charts: {
        appsByCategory,
        appsByCompany,
        statusBreakdown
      }
    };

    reportCache = { data: responseData, timestamp: now };
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate dashboard report from MongoDB Atlas.' });
  }
});

module.exports = router;

