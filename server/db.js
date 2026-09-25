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
  trainingPhases: [{
    title: String,
    duration: String,
    mode: String,
    stipend: String
  }],
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
      role: 'Software Developer Trainee',
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
    },
    {
      id: 'it_proc_3',
      processName: 'PROCESS 1',
      programTitle: 'FIC IT Full Stack Development Track',
      role: 'Full Stack Developer',
      salary: '4.5 - 6.5 LPA',
      location: 'PAN INDIA / Chennai / Bangalore',
      trainingPeriod: '6 Months',
      trainingSubtext: '3 Months Frontend & Backend Training | 3 Months Enterprise Live Projects',
      stipend: '12,000',
      stipendSubtext: 'Stipend ₹12,000 per month during training',
      trainingFee: '1.6 LPA',
      feeSubtext: 'Training Program Cost',
      bondPeriod: '1 Year Bond',
      originalsRequired: 'Originals Need to Submit',
      description: 'Full Stack engineering program covering React, Node.js, databases, microservices and enterprise application development.',
      selectionSteps: [
        { stepNumber: 1, title: 'Online Application & Screening', description: 'Resume review and initial candidate evaluation' },
        { stepNumber: 2, title: 'Full Stack Coding Challenge', description: 'Practical coding & problem solving assessment' },
        { stepNumber: 3, title: 'Technical Discussion', description: 'One-on-one interview with lead architect' },
        { stepNumber: 4, title: 'Offer & Onboarding', description: 'Admission clearance and training batch assignment' }
      ],
      order: 3,
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'it_proc_4',
      processName: 'PROCESS 2',
      programTitle: 'FIC IT Full Stack Advanced Placement',
      role: 'Full Stack Developer',
      salary: '5.5 - 7.5 LPA',
      location: 'PAN INDIA / Chennai / Bangalore',
      trainingPeriod: '6 Months',
      trainingSubtext: '3 Months Cloud & Architecture Specialization | 3 Months Client Deployment',
      stipend: '15,000',
      stipendSubtext: 'Stipend ₹15,000 per month during training',
      trainingFee: '2.0 LPA',
      feeSubtext: 'Training Program Cost',
      bondPeriod: '2 Years Bond',
      originalsRequired: 'Originals Need to Submit',
      description: 'Specialized enterprise full stack track with cloud architecture, DevOps, and tier-1 product firm placement.',
      selectionSteps: [
        { stepNumber: 1, title: 'Profile Shortlisting', description: 'Education & project review' },
        { stepNumber: 2, title: 'Advanced Coding Assessment', description: 'Full stack live implementation test' },
        { stepNumber: 3, title: 'Architecture Interview', description: 'System design and team fit round' },
        { stepNumber: 4, title: 'Onboarding & Deployment', description: 'Contract sign-off, document submission & training' }
      ],
      order: 4,
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'it_proc_5',
      processName: 'PROCESS 1',
      programTitle: 'FIC IT MERN Stack Development Program',
      role: 'MERN Stack Developer',
      salary: '4.0 - 6.0 LPA',
      location: 'PAN INDIA / Chennai / Bangalore',
      trainingPeriod: '6 Months',
      trainingSubtext: '3 Months MongoDB, Express, React, Node.js Intensive | 3 Months Industry Projects',
      stipend: '12,000',
      stipendSubtext: 'Stipend ₹12,000 per month during training',
      trainingFee: '1.6 LPA',
      feeSubtext: 'Training Program Cost',
      bondPeriod: '1 Year Bond',
      originalsRequired: 'Originals Need to Submit',
      description: 'Modern JavaScript stack specialization building single page applications, RESTful APIs, and scalable web apps.',
      selectionSteps: [
        { stepNumber: 1, title: 'Screening & Registration', description: 'Profile and degree verification' },
        { stepNumber: 2, title: 'JavaScript & React Assessment', description: 'Modern JS fundamentals and logic test' },
        { stepNumber: 3, title: 'Technical Evaluation', description: 'Discussion on web architecture and portfolio' },
        { stepNumber: 4, title: 'Batch Allocation', description: 'Documentation and training commencement' }
      ],
      order: 5,
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'it_proc_6',
      processName: 'PROCESS 2',
      programTitle: 'FIC IT MERN Stack Enterprise Track',
      role: 'MERN Stack Developer',
      salary: '5.0 - 7.0 LPA',
      location: 'PAN INDIA / Chennai / Bangalore',
      trainingPeriod: '6 Months',
      trainingSubtext: '3 Months Enterprise React, Next.js & Node Microservices | 3 Months Live Production App',
      stipend: '14,000',
      stipendSubtext: 'Stipend ₹14,000 per month during training',
      trainingFee: '1.9 LPA',
      feeSubtext: 'Training Program Cost',
      bondPeriod: '2 Years Bond',
      originalsRequired: 'Originals Need to Submit',
      description: 'Advanced MERN stack with Next.js, GraphQL, Redis, and high-performance cloud deployment.',
      selectionSteps: [
        { stepNumber: 1, title: 'Screening', description: 'Profile review' },
        { stepNumber: 2, title: 'Hands-on Coding Round', description: 'React & API integration task' },
        { stepNumber: 3, title: 'Tech Panel Interview', description: 'In-depth frontend and backend evaluation' },
        { stepNumber: 4, title: 'Batch Onboarding', description: 'Final onboarding and training start' }
      ],
      order: 6,
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'it_proc_7',
      processName: 'PROCESS 1',
      programTitle: 'FIC IT Java Enterprise Training Track',
      role: 'Java Developer',
      salary: '4.2 - 6.2 LPA',
      location: 'PAN INDIA / Chennai / Bangalore',
      trainingPeriod: '6 Months',
      trainingSubtext: '3 Months Core & Advanced Java, Spring Boot | 3 Months Enterprise Banking/Fintech Project',
      stipend: '12,000',
      stipendSubtext: 'Stipend ₹12,000 per month during training',
      trainingFee: '1.6 LPA',
      feeSubtext: 'Training Program Cost',
      bondPeriod: '1 Year Bond',
      originalsRequired: 'Originals Need to Submit',
      description: 'Enterprise backend development with Java, Spring Boot, Hibernate, microservices architecture, and SQL.',
      selectionSteps: [
        { stepNumber: 1, title: 'Registration & Screening', description: 'Academic review and eligibility check' },
        { stepNumber: 2, title: 'Core Java Assessment', description: 'OOPs concepts, data structures and algorithms' },
        { stepNumber: 3, title: 'Technical Interview', description: 'Interview with Java technical lead' },
        { stepNumber: 4, title: 'Offer Issuance & Training', description: 'Agreement sign-off and batch induction' }
      ],
      order: 7,
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'it_proc_8',
      processName: 'PROCESS 2',
      programTitle: 'FIC IT Java Microservices & Cloud Track',
      role: 'Java Developer',
      salary: '5.2 - 7.2 LPA',
      location: 'PAN INDIA / Chennai / Bangalore',
      trainingPeriod: '6 Months',
      trainingSubtext: '3 Months Spring Cloud, Kafka, Docker & Kubernetes | 3 Months Production FinTech App',
      stipend: '15,000',
      stipendSubtext: 'Stipend ₹15,000 per month during training',
      trainingFee: '2.0 LPA',
      feeSubtext: 'Training Program Cost',
      bondPeriod: '2 Years Bond',
      originalsRequired: 'Originals Need to Submit',
      description: 'High-scale distributed systems in Java with Spring Cloud, Kafka event streams, and cloud-native Kubernetes deployment.',
      selectionSteps: [
        { stepNumber: 1, title: 'Candidate Profile Screening', description: 'Qualification verification' },
        { stepNumber: 2, title: 'System Logic & Java Coding', description: 'Backend service coding assessment' },
        { stepNumber: 3, title: 'Senior Architect Interview', description: 'Microservices and database concepts discussion' },
        { stepNumber: 4, title: 'Batch Onboarding', description: 'Document handover & training commencement' }
      ],
      order: 8,
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'it_proc_9',
      processName: 'PROCESS 1',
      programTitle: 'FIC IT Python & Backend Development Track',
      role: 'Python Developer',
      salary: '4.0 - 6.0 LPA',
      location: 'PAN INDIA / Chennai / Bangalore',
      trainingPeriod: '6 Months',
      trainingSubtext: '3 Months Python, Django & FastAPI | 3 Months Live Data & Web Services Project',
      stipend: '12,000',
      stipendSubtext: 'Stipend ₹12,000 per month during training',
      trainingFee: '1.6 LPA',
      feeSubtext: 'Training Program Cost',
      bondPeriod: '1 Year Bond',
      originalsRequired: 'Originals Need to Submit',
      description: 'Robust Python backend development with Django, FastAPI, PostgreSQL, asynchronous workflows, and API design.',
      selectionSteps: [
        { stepNumber: 1, title: 'Profile Shortlisting', description: 'Resume and credentials check' },
        { stepNumber: 2, title: 'Python Fundamentals Assessment', description: 'Scripting, logic, and data handling test' },
        { stepNumber: 3, title: 'Technical Interview', description: 'Backend interview with engineering lead' },
        { stepNumber: 4, title: 'Induction & Training Start', description: 'Offer release and program orientation' }
      ],
      order: 9,
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'it_proc_10',
      processName: 'PROCESS 2',
      programTitle: 'FIC IT Python Data & AI/ML Engineering Track',
      role: 'Python Developer',
      salary: '5.0 - 7.0 LPA',
      location: 'PAN INDIA / Chennai / Bangalore',
      trainingPeriod: '6 Months',
      trainingSubtext: '3 Months Advanced Python, Pandas, Machine Learning & Cloud APIs | 3 Months Industry ML Pipeline',
      stipend: '14,000',
      stipendSubtext: 'Stipend ₹14,000 per month during training',
      trainingFee: '1.9 LPA',
      feeSubtext: 'Training Program Cost',
      bondPeriod: '2 Years Bond',
      originalsRequired: 'Originals Need to Submit',
      description: 'Data-intensive Python development with automated data pipelines, ML model deployment, and cloud integration.',
      selectionSteps: [
        { stepNumber: 1, title: 'Screening Round', description: 'Academic and background assessment' },
        { stepNumber: 2, title: 'Python & Data Structures Test', description: 'Practical coding challenge' },
        { stepNumber: 3, title: 'Lead Panel Discussion', description: 'Architecture, APIs and project discussion' },
        { stepNumber: 4, title: 'Onboarding & Batch Start', description: 'Final onboarding and session launch' }
      ],
      order: 10,
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'it_proc_fs_3',
      processName: 'PROCESS 3',
      programTitle: 'FIC IT Full Stack - Global Placement & Cloud Track',
      role: 'Full Stack Developer',
      salary: '6.5 - 9.0 LPA',
      location: 'PAN INDIA / Chennai / Bangalore',
      trainingPeriod: '6 Months',
      trainingSubtext: '3 Months Advanced Architecture & Microservices | 3 Months US/Client Live Production OJT',
      stipend: '18,000',
      stipendSubtext: 'Stipend ₹18,000 per month during training',
      trainingFee: '2.4 LPA (100% Placement Guarantee)',
      feeSubtext: 'Training Program Cost',
      bondPeriod: '2 Years Bond',
      originalsRequired: 'Originals Need to Submit',
      description: 'Elite Full Stack engineering track specializing in Distributed Cloud Architecture, DevOps, and tier-1 product firm placement.',
      trainingPhases: [
        { title: 'Phase 1: Full Stack Architecture & Microservices', duration: '3 Months', mode: 'Classroom & System Design Labs', stipend: 'STIPEND ₹18,000' },
        { title: 'Phase 2: Global Client Live Production Deployment', duration: '3 Months', mode: 'Enterprise Live Project (OJT)', stipend: 'STIPEND ₹18,000' }
      ],
      selectionSteps: [
        { stepNumber: 1, title: 'Profile & Code Review', description: 'GitHub / portfolio and credentials screening' },
        { stepNumber: 2, title: 'Live Architecture Assessment', description: 'System design and algorithmic challenge' },
        { stepNumber: 3, title: 'Executive Panel Interview', description: 'Director & technical architect interview' },
        { stepNumber: 4, title: 'Offer Letter & Onboarding', description: 'Contract sign-off, document submission & training' }
      ],
      order: 11,
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'it_proc_mern_3',
      processName: 'PROCESS 3',
      programTitle: 'FIC IT MERN Stack - Next.js & Cloud Native Track',
      role: 'MERN Stack Developer',
      salary: '6.0 - 8.5 LPA',
      location: 'PAN INDIA / Chennai / Bangalore',
      trainingPeriod: '6 Months',
      trainingSubtext: '3 Months Full Stack JS & Cloud Architecture | 3 Months Enterprise Product Deployment',
      stipend: '16,000',
      stipendSubtext: 'Stipend ₹16,000 per month during training',
      trainingFee: '2.2 LPA (100% Placement Guarantee)',
      feeSubtext: 'Training Program Cost',
      bondPeriod: '2 Years Bond',
      originalsRequired: 'Originals Need to Submit',
      description: 'Advanced MERN Stack development with Next.js, GraphQL, Redis caching, CI/CD, and high-performance cloud deployment.',
      trainingPhases: [
        { title: 'Phase 1: Advanced MERN & TypeScript', duration: '3 Months', mode: 'Classroom & Coding Labs', stipend: 'STIPEND ₹16,000' },
        { title: 'Phase 2: Cloud Native Microservices OJT', duration: '3 Months', mode: 'Real Project Training (OJT)', stipend: 'STIPEND ₹16,000' }
      ],
      selectionSteps: [
        { stepNumber: 1, title: 'Screening & Registration', description: 'Application review and portfolio verification' },
        { stepNumber: 2, title: 'MERN Hands-on Coding Challenge', description: 'React, Node.js and API building test' },
        { stepNumber: 3, title: 'Technical & Architecture Interview', description: 'Discussion on scalability and full stack patterns' },
        { stepNumber: 4, title: 'Batch Onboarding', description: 'Offer issuance, original documents handover, and training start' }
      ],
      order: 12,
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'it_proc_java_3',
      processName: 'PROCESS 3',
      programTitle: 'FIC IT Java - Distributed Banking & FinTech Track',
      role: 'Java Developer',
      salary: '6.5 - 9.0 LPA',
      location: 'PAN INDIA / Chennai / Bangalore',
      trainingPeriod: '6 Months',
      trainingSubtext: '3 Months Spring Cloud, Kafka & Kubernetes | 3 Months Tier-1 FinTech Implementation OJT',
      stipend: '18,000',
      stipendSubtext: 'Stipend ₹18,000 per month during training',
      trainingFee: '2.4 LPA (100% Placement Guarantee)',
      feeSubtext: 'Training Program Cost',
      bondPeriod: '2 Years Bond',
      originalsRequired: 'Originals Need to Submit',
      description: 'High-scale distributed systems in Java with Spring Cloud, Kafka event streaming, and cloud-native Kubernetes deployment.',
      trainingPhases: [
        { title: 'Phase 1: Enterprise Java & Microservices', duration: '3 Months', mode: 'Classroom & System Design', stipend: 'STIPEND ₹18,000' },
        { title: 'Phase 2: Banking & FinTech Systems OJT', duration: '3 Months', mode: 'Live Production OJT', stipend: 'STIPEND ₹18,000' }
      ],
      selectionSteps: [
        { stepNumber: 1, title: 'Academic & Profile Screening', description: 'Degree & basic concepts verification' },
        { stepNumber: 2, title: 'Core Java & Data Structures Round', description: 'Practical coding challenge' },
        { stepNumber: 3, title: 'System Architecture Interview', description: 'Senior technical panel interview' },
        { stepNumber: 4, title: 'Batch Onboarding & Induction', description: 'Offer issuance and training batch start' }
      ],
      order: 13,
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'it_proc_py_3',
      processName: 'PROCESS 3',
      programTitle: 'FIC IT Python - Generative AI & Data Systems Track',
      role: 'Python Developer',
      salary: '6.0 - 8.5 LPA',
      location: 'PAN INDIA / Chennai / Bangalore',
      trainingPeriod: '6 Months',
      trainingSubtext: '3 Months Python, FastAPI, LLM & Data Pipelines | 3 Months Enterprise AI Pipeline OJT',
      stipend: '16,000',
      stipendSubtext: 'Stipend ₹16,000 per month during training',
      trainingFee: '2.2 LPA (100% Placement Guarantee)',
      feeSubtext: 'Training Program Cost',
      bondPeriod: '2 Years Bond',
      originalsRequired: 'Originals Need to Submit',
      description: 'Data-intensive Python development with automated data pipelines, LLM fine-tuning, ML model deployment, and cloud integration.',
      trainingPhases: [
        { title: 'Phase 1: Advanced Python & AI Engineering', duration: '3 Months', mode: 'Classroom & AI Labs', stipend: 'STIPEND ₹16,000' },
        { title: 'Phase 2: Live AI/ML Cloud Pipeline OJT', duration: '3 Months', mode: 'Enterprise Project OJT', stipend: 'STIPEND ₹16,000' }
      ],
      selectionSteps: [
        { stepNumber: 1, title: 'Profile & Resume Screening', description: 'Background and credentials evaluation' },
        { stepNumber: 2, title: 'Python & Problem Solving Test', description: 'Hands-on coding and algorithmic round' },
        { stepNumber: 3, title: 'AI Engineering Panel Interview', description: 'Technical lead discussion on models and APIs' },
        { stepNumber: 4, title: 'Batch Onboarding & Launch', description: 'Final onboarding and batch induction' }
      ],
      order: 14,
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

    // Seed or synchronize IT Training Processes
    for (const itProc of initialData.itTrainingProcesses) {
      const exists = await ItTrainingProcessModel.findOne({ id: itProc.id });
      if (!exists) {
        await ItTrainingProcessModel.create(itProc);
        console.log(`✅ Seeded IT Process: ${itProc.role} - ${itProc.processName}`);
      }
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

