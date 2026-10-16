require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const companyRoutes = require('./routes/companies');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const interviewRoutes = require('./routes/interviews');
const reportRoutes = require('./routes/reports');
const itTrainingRoutes = require('./routes/itTraining');
const paymentRoutes = require('./routes/payment');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Uploads directory static serving
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Logos directory static serving
const logosDir = path.join(__dirname, 'logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}
app.use('/logos', express.static(logosDir));

// Sample dummy resume creation for seed candidate if missing
const sampleResumePath = path.join(uploadsDir, 'sample_resume_rahul.pdf');
if (!fs.existsSync(sampleResumePath)) {
  fs.writeFileSync(sampleResumePath, 'Sample Resume Content for Rahul Sharma - B.Com Graduate');
}

const userRoutes = require('./routes/users');

const partnerIncentivesRoutes = require('./routes/partnerIncentives');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/it-training-processes', itTrainingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/partner-incentives', partnerIncentivesRoutes);
app.use('/api/branch-it-projects', require('./routes/branchItProjects'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Recruitment Portal API Server is running.' });
});

// Candidate APK Download endpoint
app.get('/api/download/candidate-apk', (req, res) => {
  const candidateApkPath = path.join(uploadsDir, 'CandidateApp.apk');
  const rootCandidateApkPath = path.join(__dirname, '..', 'CandidateApp.apk');
  const cJobsAppsApkPath = 'C:\\Jobsapps\\CandidateApp.apk';

  let targetPath = null;
  if (fs.existsSync(candidateApkPath)) targetPath = candidateApkPath;
  else if (fs.existsSync(rootCandidateApkPath)) targetPath = rootCandidateApkPath;
  else if (fs.existsSync(cJobsAppsApkPath)) targetPath = cJobsAppsApkPath;

  if (targetPath) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.download(targetPath, 'CandidateRecruitPro.apk', (err) => {
      if (err) console.error('Error downloading Candidate APK:', err);
    });
  } else {
    res.status(404).json({ error: 'Candidate APK not found. Please build or upload the APK.' });
  }
});

const { connectMongoDB } = require('./db');

// Connect to MongoDB Database
connectMongoDB();

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Recruitment Portal Backend running on http://localhost:${PORT}`);
});
