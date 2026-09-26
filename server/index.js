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

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Recruitment Portal API Server is running.' });
});

const { connectMongoDB } = require('./db');

// Connect to MongoDB Database
connectMongoDB();

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Recruitment Portal Backend running on http://localhost:${PORT}`);
});
