const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://JobPortal:vmjpDTY7R3TPSmPA@cluster0.wkptyao.mongodb.net/recruitment_db?retryWrites=true&w=majority&appName=Cluster0';

let isMongoConnected = false;

// Define Mongoose Schemas & Models
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: String,
  passwordHash: String,
  role: String,
  mobile: String,
  location: String,
  qualification: String,
  experience: String,
  skills: [String],
  resumeUrl: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  description: String,
  icon: String,
  status: { type: String, default: 'Active' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: String
});

const companySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  categoryId: String,
  name: String,
  logo: String,
  description: String,
  website: String,
  status: { type: String, default: 'Active' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: String
});

const jobSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  companyId: String,
  categoryId: String,
  title: String,
  programName: String,
  jobType: String,
  location: String,
  experience: String,
  qualification: String,
  salary: String,
  trainingPeriod: String,
  trainingFee: String,
  feeRefundType: String,
  feeRefundDetails: String,
  interviewCrackFee: String,
  interviewFeeStage: String,
  interviewFeeDetails: String,
  ficTrainingPeriod: String,
  trainingDetails: mongoose.Schema.Types.Mixed,
  trainingPhases: [{
    duration: String,
    mode: String,
    stipend: String
  }],
  openings: Number,
  description: String,
  responsibilities: [String],
  requirements: [String],
  skills: [String],
  interviewSteps: [{
    stepNumber: Number,
    title: String,
    description: String
  }],
  documentsRequired: [String],
  lastDate: String,
  status: { type: String, default: 'Active' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: String
}, { strict: false });

const candidateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String,
  name: String,
  email: String,
  mobile: String,
  location: String,
  qualification: String,
  experience: String,
  skills: [String],
  resumeUrl: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const applicationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  applicationNumber: String,
  candidateId: String,
  jobId: String,
  companyId: String,
  categoryId: String,
  candidateDetails: mongoose.Schema.Types.Mixed,
  resumeUrl: String,
  coverNotes: String,
  status: String,
  appliedAt: { type: String, default: () => new Date().toISOString() },
  adminNotes: String,
  updatedAt: String
});

const interviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  applicationId: String,
  candidateId: String,
  jobId: String,
  companyId: String,
  round: String,
  date: String,
  time: String,
  mode: String,
  location: String,
  meetingLink: String,
  interviewer: String,
  status: { type: String, default: 'Scheduled' },
  notes: String,
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: String
});

const itTrainingProcessSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  processName: { type: String, required: true }, // e.g. "PROCESS 1", "PROCESS 2"
  programTitle: { type: String, default: 'FIC IT Training & Placement Programme' },
  role: { type: String, default: 'Software Engineer Trainee' },
  salary: { type: String, default: '3.5 - 5.0 LPA' },
  location: { type: String, default: 'PAN INDIA / Chennai / Bangalore' },
  trainingPeriod: { type: String, default: '6 Months' },
  trainingSubtext: { type: String, default: '3 Months Classroom Training | 3 Months Project Training' },
  stipend: { type: String, default: '12,000' },
  stipendSubtext: { type: String, default: 'Stipend ₹12,000 per month during training' },
  trainingFee: { type: String, default: '1.6 LPA' },
  feeSubtext: { type: String, default: 'Training Program Cost' },
  bondPeriod: { type: String, default: '1 Year Bond' },
  originalsRequired: { type: String, default: 'Originals Need to Submit' },
  description: { type: String, default: '' },
  selectionSteps: [{
    stepNumber: Number,
    title: String,
    description: String
  }],
  order: { type: Number, default: 1 },
  status: { type: String, default: 'Active' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: String
}, { strict: false });

const UserModel = mongoose.model('User', userSchema);
const CategoryModel = mongoose.model('Category', categorySchema);
const CompanyModel = mongoose.model('Company', companySchema);
const JobModel = mongoose.model('Job', jobSchema);
const CandidateModel = mongoose.model('Candidate', candidateSchema);
const ApplicationModel = mongoose.model('Application', applicationSchema);
const InterviewModel = mongoose.model('Interview', interviewSchema);
const ItTrainingProcessModel = mongoose.model('ItTrainingProcess', itTrainingProcessSchema);


const initialData = {
  users: [
    {
      id: 'usr_admin',
      name: 'System Admin',
      email: 'admin@recruitment.com',
      passwordHash: '$2a$10$wE47x1KkS4eQ6bH5k6d8u.kZ7z8zY0X1Y2Z3A4B5C6D7E8F9G0H1I',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ],
  categories: [
    {
      id: 'cat_banking',
      name: 'Banking & Financial Services',
      description: 'Jobs in retail banking, NBFCs, investment, and financial services.',
      icon: 'Building2',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cat_it',
      name: 'IT & Software',
      description: 'Software engineering, web development, cloud computing, and IT support.',
      icon: 'Code',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cat_sales',
      name: 'Sales & Marketing',
      description: 'Business development, direct sales, field marketing, and digital marketing.',
      icon: 'TrendingUp',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cat_bpo',
      name: 'BPO & Customer Support',
      description: 'Inbound/outbound customer support, telesales, and technical desk operations.',
      icon: 'Headphones',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cat_nonit',
      name: 'Non-IT & Operations',
      description: 'Back-office administration, logistics, HR operations, and store management.',
      icon: 'Briefcase',
      status: 'Active',
      createdAt: new Date().toISOString()
    }
  ],
  companies: [
    {
      id: 'comp_axis',
      categoryId: 'cat_banking',
      name: 'Axis Bank',
      logo: '/logos/axis_bank.svg',
      description: 'Leading private sector bank in India offering retail, corporate, and international banking services.',
      website: 'https://www.axisbank.com',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'comp_idfc',
      categoryId: 'cat_banking',
      name: 'IDFC First Bank',
      logo: '/logos/idfc_first_bank.svg',
      description: 'Leading Indian private sector bank offering personal, NRI, and business banking products.',
      website: 'https://www.idfcfirstbank.com',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'comp_kotak',
      categoryId: 'cat_banking',
      name: 'Kotak Mahindra Bank',
      logo: '/logos/kotak_bank.png',
      description: 'Premier Indian financial institution providing commercial banking, wealth management, and insurance.',
      website: 'https://www.kotak.com',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'comp_bandhan',
      categoryId: 'cat_banking',
      name: 'Bandhan Bank',
      logo: '/logos/bandhan_bank.png',
      description: 'Indian banking and financial services company headquartered in Kolkata.',
      website: 'https://www.bandhanbank.com',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'comp_aditya',
      categoryId: 'cat_banking',
      name: 'Aditya Birla Capital',
      logo: '/logos/aditya_birla.jpg',
      description: 'Financial services umbrella brand for Aditya Birla Group businesses.',
      website: 'https://www.adityabirlacapital.com',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'comp_mahindra_fin',
      categoryId: 'cat_banking',
      name: 'Mahindra Finance',
      logo: '/logos/mahindra_finance.svg',
      description: 'Leading Non-Banking Financial Company (NBFC) in India specializing in rural and semi-urban financial services.',
      website: 'https://www.mahindrafinance.com',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'comp_techm',
      categoryId: 'cat_it',
      name: 'Tech Mahindra',
      logo: '/logos/tech_mahindra.svg',
      description: 'Global IT services provider offering digital transformation and consulting.',
      website: 'https://www.techmahindra.com',
      status: 'Active',
      createdAt: new Date().toISOString()
    }
  ],
  itTrainingProcesses: [
    {
      id: 'it_proc_1',
      processName: 'PROCESS 1',
      programTitle: 'FIC IT Training & 100% Placement Programme',
      role: 'Software Engineer Trainee',
      salary: '3.5 - 4.5 LPA',
      location: 'PAN INDIA / Chennai / Bangalore',
      trainingPeriod: '6 Months',
      trainingSubtext: '3 Months Classroom Training | 3 Months Real Project Training',
      stipend: '12,000',
      stipendSubtext: 'Stipend ₹12,000 per month during training',
      trainingFee: '1.6 LPA',
      feeSubtext: 'Training Program Cost',
      bondPeriod: '1 Year Bond',
      originalsRequired: 'Originals Need to Submit',
      description: 'Comprehensive software development track covering Full Stack technologies, live customer projects, and guaranteed placement.',
      selectionSteps: [
        { stepNumber: 1, title: 'Screening & Registration', description: 'Application review and initial profile shortlisting' },
        { stepNumber: 2, title: 'Technical Assessment', description: 'Basic coding, problem solving and aptitude round' },
        { stepNumber: 3, title: 'Technical & HR Interview', description: 'Discussion with hiring manager & interview clearance' },
        { stepNumber: 4, title: 'Batch Onboarding', description: 'Offer letter issuance, document submission, and training commencement' }
      ],
      order: 1,
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'it_proc_2',
      processName: 'PROCESS 2',
      programTitle: 'FIC IT Training & Placement - Advanced Track',
      role: 'Associate Software Developer',
      salary: '4.5 - 6.0 LPA',
      location: 'PAN INDIA / Chennai / Bangalore',
      trainingPeriod: '6 Months',
      trainingSubtext: '3 Months Classroom Training | 3 Months Enterprise Project OJT',
      stipend: '12,000',
      stipendSubtext: 'Stipend ₹12,000 per month during training',
      trainingFee: '2.0 LPA',
      feeSubtext: 'Training Program Cost',
      bondPeriod: '2 Years Bond',
      originalsRequired: 'Originals Need to Submit',
      description: 'Advanced engineering track focusing on Cloud, Full Stack, and Enterprise solutions with high-tier placement.',
      selectionSteps: [
        { stepNumber: 1, title: 'Screening & Registration', description: 'Application review and initial profile shortlisting' },
        { stepNumber: 2, title: 'Technical Assessment', description: 'Coding & core concepts evaluation' },
        { stepNumber: 3, title: 'Technical & HR Interview', description: 'Technical panel interview and HR discussion' },
        { stepNumber: 4, title: 'Batch Onboarding', description: 'Offer issuance, original documents handover, and training start' }
      ],
      order: 2,
      status: 'Active',
      createdAt: new Date().toISOString()
    }
  ]
};

// Seed MongoDB & Ensure Categories and Companies default exist in Atlas
async function seedMongoIfEmpty() {
  try {
    console.log('✨ Synchronizing MongoDB Atlas Cloud Database state...');
    
    // Seed admin if not present
    const adminExists = await UserModel.findOne({ id: 'usr_admin' });
    if (!adminExists) {
      await UserModel.create(initialData.users[0]);
    }

    // Seed categories if 0 exist
    const categoryCount = await CategoryModel.countDocuments();
    if (categoryCount === 0) {
      await CategoryModel.insertMany(initialData.categories);
      console.log('✅ Seeded default 5 job categories into MongoDB Atlas Cloud');
    }

    // Seed companies if 0 exist, or update logos for existing default companies
    const companyCount = await CompanyModel.countDocuments();
    if (companyCount === 0) {
      await CompanyModel.insertMany(initialData.companies);
      console.log('✅ Seeded default 6 hiring companies with official bank logos into MongoDB Atlas Cloud');
    } else {
      for (const comp of initialData.companies) {
        await CompanyModel.updateOne({ id: comp.id }, { $set: { logo: comp.logo } });
      }
    }

    // Seed IT Training Processes if 0 exist
    const itProcCount = await ItTrainingProcessModel.countDocuments();
    if (itProcCount === 0) {
      await ItTrainingProcessModel.insertMany(initialData.itTrainingProcesses);
      console.log('✅ Seeded default IT Training Processes into MongoDB Atlas Cloud');
    }

    console.log('✨ MongoDB Atlas Cloud Database connected and ready!');
  } catch (err) {
    console.error('Error maintaining MongoDB Atlas state:', err.message);
  }
}

// Connect to MongoDB Atlas
async function connectMongoDB() {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    isMongoConnected = true;
    console.log(`🍃 Connected to MongoDB Atlas Cloud Database successfully at ${MONGODB_URI}`);
    await seedMongoIfEmpty();
  } catch (err) {
    isMongoConnected = false;
    console.error(`❌ MongoDB Atlas connection error (${err.message})`);
  }
}

// Read database directly from MongoDB Atlas Cloud collections
async function readDBAsync() {
  try {
    const [users, categories, companies, jobs, candidates, applications, interviews] = await Promise.all([
      UserModel.find({}).lean(),
      CategoryModel.find({}).lean(),
      CompanyModel.find({}).lean(),
      JobModel.find({}).lean(),
      CandidateModel.find({}).lean(),
      ApplicationModel.find({}).lean(),
      InterviewModel.find({}).lean()
    ]);
    return {
      users: users || [],
      categories: categories || [],
      companies: companies || [],
      jobs: jobs || [],
      candidates: candidates || [],
      applications: applications || [],
      interviews: interviews || []
    };
  } catch (err) {
    console.error('Error reading from MongoDB Atlas Cloud:', err.message);
    return {
      users: [],
      categories: initialData.categories,
      companies: initialData.companies,
      jobs: [],
      candidates: [],
      applications: [],
      interviews: []
    };
  }
}

function readDB() {
  throw new Error('Sync readDB() deprecated. Use async readDBAsync() or Mongoose models directly.');
}

function writeDB() {
  throw new Error('Sync writeDB() deprecated. Use Mongoose models directly.');
}

module.exports = {
  connectMongoDB,
  readDBAsync,
  readDB,
  writeDB,
  UserModel,
  CategoryModel,
  CompanyModel,
  JobModel,
  CandidateModel,
  ApplicationModel,
  InterviewModel,
  ItTrainingProcessModel
};

