# Dynamic Job Recruitment Portal
## Complete Project Plan & Development Specification

### 1. Project Overview

This project is a dynamic recruitment/job portal where candidates receive one website link and can browse jobs by category, company, and job role.

Example flow:

Candidate Link
→ Job Portal
→ Select Category
→ Banking
→ Select Company
→ Axis Bank
→ Select Job
→ Branch Relationship Officer
→ View Complete Job Details
→ Apply Now
→ Track Application Status

The important requirement is that the candidate-side content must be controlled dynamically from the Admin Dashboard. Admin can add categories, companies, jobs, job details, interview steps, required documents, and application settings without changing frontend code.

---

# 2. Main Objective

Build a professional recruitment platform with two major sections:

1. Candidate Portal
2. Admin Recruitment Dashboard

The system should support:

- Dynamic job categories
- Dynamic companies
- Multiple jobs under each company
- Complete job details
- Candidate registration/login
- Job application
- Resume upload
- Application tracking
- Interview scheduling
- Candidate status management
- Recruitment reports
- Admin-controlled content

---

# 3. High-Level Architecture

```text
                         JOB PORTAL
                             |
             +---------------+---------------+
             |                               |
       CANDIDATE PORTAL                ADMIN DASHBOARD
             |                               |
        Categories                     Dashboard
             |                               |
         Companies                    Categories
             |                               |
            Jobs                       Companies
             |                               |
       Job Details                   Job Openings
             |                               |
          Apply                       Candidates
             |                               |
      Application                    Applications
          Status                     Interviews
                                             |
                                           Reports
             |
             +--------------- API / BACKEND ----------------+
                              |
                         Node.js + Express
                              |
                         MongoDB Database
                              |
              +---------------+---------------+
              |                               |
          Cloudinary/S3                  Authentication
       Resume / Logo / Files          Admin / Candidate
```

---

# 4. Candidate Portal

## 4.1 Candidate Home Page

The candidate opens the recruitment link.

Example:

```text
yourcompany.com/jobs
```

Page sections:

- Company/Recruitment branding
- Search Jobs
- Job Categories
- Featured Jobs
- Latest Jobs
- Login
- Register

Categories can include:

- Banking
- IT
- Non-IT
- BPO
- Sales
- Finance
- Other

---

# 5. Candidate Job Browsing Flow

```text
Candidate
   |
   v
Job Portal
   |
   v
Select Category
   |
   +---- Banking
   |
   +---- IT
   |
   +---- Non-IT
   |
   v
Select Company
   |
   +---- Aditya Birla
   +---- Axis Bank
   +---- IDFC First Bank
   +---- Kotak Bank
   +---- Bandhan Bank
   |
   v
Select Job
   |
   v
Complete Job Details
   |
   v
Apply Now
```

The above companies are examples. Admin must be able to add or remove companies dynamically.

---

# 6. Banking Category Example

When candidate clicks:

```text
Banking Jobs
```

The system can show:

| Company | Job Role | Location | Experience |
|---|---|---|---|
| Aditya Birla | Relationship Executive | Bangalore | 0-2 Years |
| Axis Bank | Branch Relationship Officer | Chennai | 0-2 Years |
| IDFC First Bank | Relationship Manager | Bangalore | 1-3 Years |
| Kotak Bank | Sales Officer | Chennai | 0-2 Years |
| Bandhan Bank | Branch Executive | Coimbatore | 0-2 Years |

These records should come from the database, not hardcoded frontend data.

---

# 7. Company Details Page

When the candidate clicks Axis Bank, show the jobs available under that company.

Example:

```text
Axis Bank

Company Description

Available Jobs

1. Branch Relationship Officer
2. Relationship Manager
3. Sales Officer
```

Candidate can select one job.

---

# 8. Job Details Page

Example:

## Axis Bank

### Branch Relationship Officer

Job information:

- Category: Banking
- Company: Axis Bank
- Job Type: Full Time
- Location: Chennai
- Experience: 0-2 Years
- Qualification: Any Degree
- Salary: Admin-defined
- Openings: Admin-defined
- Last Date: Admin-defined

### Job Description

Admin-defined description will be displayed here.

### Responsibilities

Admin can add multiple responsibilities.

Example:

- Customer relationship management
- Customer follow-up
- Account-related support
- Sales activities
- Branch operations support

### Requirements

Admin can add multiple requirements.

Example:

- Any degree
- Good communication skills
- Customer handling skills
- Basic computer knowledge

### Skills

Admin can add skills such as:

- Communication
- Customer Service
- Sales
- MS Office

### Interview Process

Example:

```text
1. HR Screening
        ↓
2. Telephonic Interview
        ↓
3. Branch Interview
        ↓
4. Final Selection
```

Admin must be able to add, edit, remove, and reorder interview steps.

### Documents Required

Example:

- Resume
- Government ID
- Education Certificate
- Passport Size Photo

### Apply Now

Candidate clicks:

```text
[ APPLY NOW ]
```

---

# 9. Candidate Registration

Candidate registration fields:

- Full Name
- Mobile Number
- Email
- Password / OTP
- Location
- Qualification
- Experience

Optional:

- Date of Birth
- Skills
- Resume

Authentication options can later include:

- Mobile OTP
- Email OTP
- Password login

---

# 10. Candidate Application

When candidate clicks Apply Now:

```text
Candidate Details

Full Name
Mobile Number
Email
Location
Qualification
Experience
Resume Upload

[ Submit Application ]
```

After submission:

```text
Application submitted successfully.
Application ID: JOB-XXXXXX
```

---

# 11. Candidate Application Status

Candidate should have an application tracking page.

Example:

```text
Application Status

Axis Bank
Branch Relationship Officer

✓ Application Submitted
✓ Shortlisted
✓ HR Screening
● Interview Scheduled
○ Final Selection
```

Possible statuses:

- Applied
- Under Review
- Shortlisted
- HR Screening
- Interview Scheduled
- Interview Completed
- Selected
- Rejected
- On Hold
- Withdrawn

---

# 12. Candidate Dashboard

Candidate dashboard:

```text
Dashboard
My Applications
Saved Jobs
Interviews
Profile
Notifications
Logout
```

Dashboard statistics:

```text
Applications       5
Shortlisted        2
Interviews         1
Selected           0
```

---

# 13. Admin Dashboard

Admin dashboard is the main management system.

Navigation:

```text
Dashboard
Categories
Companies
Job Openings
Candidates
Applications
Interview Schedule
Selected Candidates
Reports
Notifications
Settings
Logout
```

---

# 14. Admin Dashboard KPIs

Example:

```text
Total Jobs              48
Active Jobs             32
Total Candidates       856
Applications          1240
Interviews Scheduled    86
Selected Candidates     24
```

Charts/reports can show:

- Applications by category
- Applications by company
- Applications by job
- Candidate status
- Monthly applications
- Interview results
- Selection count

---

# 15. Admin Category Management

Admin can create categories.

Example form:

```text
Category Name
[ Banking ]

Description
[ Banking related job opportunities ]

Status
[ Active ]

[ Save Category ]
```

Actions:

- Add
- Edit
- Delete
- Activate
- Deactivate
- Search
- Filter

Example categories:

```text
Banking
IT
Non-IT
BPO
Sales
Finance
```

---

# 16. Admin Company Management

Admin can add companies.

Form:

```text
Company Name
[ Axis Bank ]

Category
[ Banking ]

Company Logo
[ Upload ]

Company Description
[ Text ]

Company Website
[ Optional ]

Status
[ Active ]

[ Save Company ]
```

Admin can:

- Add company
- Edit company
- Delete company
- Upload logo
- Activate/deactivate
- View company jobs

---

# 17. Admin Job Management

This is the most important module.

Admin clicks:

```text
Job Openings
→ Create New Job
```

Form:

```text
Company
[ Axis Bank ▼ ]

Category
[ Banking ▼ ]

Job Title
[ Branch Relationship Officer ]

Job Type
[ Full Time ▼ ]

Location
[ Chennai ]

Experience
[ 0 - 2 Years ]

Qualification
[ Any Degree ]

Salary
[ ₹25,000 - ₹35,000 ]

Number of Openings
[ 10 ]

Job Description
[ Rich Text Editor ]

Responsibilities
[ Add Responsibility ]

Requirements
[ Add Requirement ]

Skills
[ Add Skill ]

Interview Process
[ Add Step ]

Documents Required
[ Add Document ]

Application Last Date
[ Date ]

Status
[ Draft / Active / Closed ]

[ Save Draft ] [ Publish Job ]
```

---

# 18. Dynamic Job System

Jobs must not be hardcoded.

Database relationship:

```text
Category
   |
   v
Company
   |
   v
Job
   |
   +---- Job Details
   +---- Responsibilities
   +---- Requirements
   +---- Skills
   +---- Interview Steps
   +---- Documents
   |
   v
Applications
   |
   v
Candidates
```

Example:

```text
Banking
 |
 +-- Axis Bank
 |    |
 |    +-- Branch Relationship Officer
 |    +-- Relationship Manager
 |    +-- Sales Officer
 |
 +-- IDFC First Bank
 |    |
 |    +-- Relationship Manager
 |
 +-- Kotak Bank
 |    |
 |    +-- Branch Executive
 |
 +-- Bandhan Bank
      |
      +-- Sales Officer
```

If admin adds HDFC Bank, it should automatically appear under Banking.

No frontend code modification should be required.

---

# 19. Job Status

Every job should have a status:

```text
Draft
Active
Paused
Closed
Expired
```

Candidate portal should normally show only active jobs.

---

# 20. Candidate Management

Admin can view:

```text
Candidate Name
Email
Mobile
Category
Applied Job
Company
Application Date
Status
```

Filters:

- Category
- Company
- Job
- Status
- Date
- Location
- Experience

Actions:

- View profile
- View resume
- Change status
- Add note
- Schedule interview
- Contact candidate

---

# 21. Application Management

Admin application table:

| Candidate | Company | Job | Date | Status |
|---|---|---|---|---|
| Candidate A | Axis Bank | Branch Relationship Officer | 19 Sep | Shortlisted |
| Candidate B | Kotak Bank | Sales Officer | 19 Sep | Applied |
| Candidate C | IDFC First Bank | Relationship Manager | 18 Sep | Interview |

Actions:

```text
View
Shortlist
Reject
Schedule Interview
Change Status
Add Note
```

---

# 22. Interview Management

Admin can schedule interviews.

Form:

```text
Candidate
[ Candidate A ]

Company
[ Axis Bank ]

Job
[ Branch Relationship Officer ]

Interview Round
[ HR Screening ]

Date
[ DD/MM/YYYY ]

Time
[ HH:MM ]

Mode
[ Online / Offline ]

Location / Meeting Link
[ ... ]

Interviewer
[ ... ]

Notes
[ ... ]

[ Schedule Interview ]
```

Candidate receives the interview information in their dashboard.

---

# 23. Interview Status

Possible statuses:

```text
Scheduled
Rescheduled
Completed
Selected
Rejected
No Show
```

---

# 24. Reports Module

Admin reports:

### Job Reports

- Total jobs
- Active jobs
- Closed jobs
- Jobs by category
- Jobs by company

### Candidate Reports

- Total candidates
- New candidates
- Active candidates
- Selected candidates

### Application Reports

- Total applications
- Applications by company
- Applications by job
- Applications by category
- Application status

### Interview Reports

- Scheduled
- Completed
- Selected
- Rejected
- No Show

Export options:

- CSV
- Excel
- PDF

---

# 25. Notification System

Notifications can be sent when:

- Application submitted
- Candidate shortlisted
- Interview scheduled
- Interview rescheduled
- Candidate selected
- Job closing soon

Channels can be added later:

- In-app notification
- Email
- WhatsApp
- SMS

---

# 26. Search and Filter

Candidate side:

```text
Search Job
Search Company
Location
Category
Experience
Job Type
```

Admin side:

```text
Category
Company
Job
Candidate
Application Status
Interview Status
Date Range
```

---

# 27. Database Collections

MongoDB suggested collections:

```text
users
categories
companies
jobs
candidates
applications
interviews
notifications
admin_users
settings
```

---

# 28. Suggested Data Relationships

## Category

```text
_id
name
description
status
createdAt
updatedAt
```

## Company

```text
_id
categoryId
name
logo
description
website
status
createdAt
updatedAt
```

## Job

```text
_id
companyId
categoryId
title
jobType
location
experience
qualification
salary
openings
description
responsibilities[]
requirements[]
skills[]
interviewSteps[]
documentsRequired[]
lastDate
status
createdAt
updatedAt
```

## Candidate

```text
_id
name
email
mobile
location
qualification
experience
skills[]
resume
profilePhoto
createdAt
updatedAt
```

## Application

```text
_id
candidateId
jobId
companyId
status
appliedAt
adminNotes
updatedAt
```

## Interview

```text
_id
applicationId
candidateId
jobId
round
date
time
mode
location
meetingLink
interviewer
status
notes
createdAt
updatedAt
```

---

# 29. Backend API Structure

Suggested API structure:

```text
/api/auth
/api/categories
/api/companies
/api/jobs
/api/candidates
/api/applications
/api/interviews
/api/notifications
/api/reports
```

Example:

```text
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id

GET    /api/companies
POST   /api/companies
PUT    /api/companies/:id
DELETE /api/companies/:id

GET    /api/jobs
GET    /api/jobs/:id
POST   /api/jobs
PUT    /api/jobs/:id
DELETE /api/jobs/:id

POST   /api/applications
GET    /api/applications
PUT    /api/applications/:id/status
```

---

# 30. Authentication & Authorization

There should be separate roles:

```text
Admin
Candidate
```

Admin can:

- Manage categories
- Manage companies
- Manage jobs
- Manage candidates
- Manage applications
- Manage interviews
- View reports

Candidate can:

- View jobs
- Apply
- View own applications
- View interviews
- Update own profile

Candidates must not access admin APIs.

---

# 31. File Uploads

Files that may need storage:

- Company logo
- Candidate resume
- Candidate profile photo
- Candidate documents

Recommended:

```text
Frontend
   ↓
Backend
   ↓
Cloudinary / AWS S3
   ↓
File URL stored in MongoDB
```

Do not store large files directly inside MongoDB.

---

# 32. UI Design Direction

The dashboard should be professional and recruitment-focused.

Admin UI:

- Clean sidebar
- Compact KPI cards
- Tables
- Filters
- Search
- Status badges
- Modal/forms
- Pagination
- Responsive layout

Avoid:

- Overly colorful cards
- Excessive shadows
- Unnecessary animations
- Crowded layouts

Candidate UI:

- Clean job cards
- Company logo
- Job title
- Location
- Experience
- Salary
- Job type
- Apply button

---

# 33. Recommended Tech Stack

## Frontend

```text
React.js
Vite
Tailwind CSS
React Router
Axios
React Hook Form
Zod
```

## Backend

```text
Node.js
Express.js
JWT
Multer
Validation
REST API
```

## Database

```text
MongoDB
Mongoose
```

## Storage

```text
Cloudinary or AWS S3
```

## Deployment

```text
Frontend → Vercel
Backend → AWS EC2 / Render
Database → MongoDB Atlas
```

For production-scale deployment:

```text
Cloudflare
Nginx
AWS EC2
Load Balancer
Redis
Docker
CI/CD
```

These infrastructure components can be introduced after the core application is stable.

---

# 34. Development Phases

## Phase 1 — Requirement & UI

- Finalize candidate flow
- Finalize admin flow
- Create database design
- Create wireframes
- Create UI design
- Define API requirements

## Phase 2 — Backend Foundation

- Create Node.js project
- Configure Express
- Connect MongoDB
- Create environment variables
- Create authentication
- Create error handling
- Create validation

## Phase 3 — Admin Modules

Build in this order:

```text
Admin Login
↓
Categories
↓
Companies
↓
Jobs
↓
Candidates
↓
Applications
↓
Interviews
↓
Reports
```

## Phase 4 — Candidate Portal

Build:

```text
Home
↓
Categories
↓
Companies
↓
Jobs
↓
Job Details
↓
Register/Login
↓
Apply
↓
Application Status
↓
Candidate Dashboard
```

## Phase 5 — File Upload

Implement:

- Resume upload
- Company logo upload
- Profile photo
- Secure file URLs

## Phase 6 — Notifications

Implement:

- Application notification
- Shortlist notification
- Interview notification
- Selection notification

## Phase 7 — Testing

Test:

- Admin login
- Candidate login
- Category creation
- Company creation
- Job creation
- Job publishing
- Candidate application
- Resume upload
- Status changes
- Interview scheduling
- Reports
- Permissions

## Phase 8 — Deployment

```text
GitHub
   ↓
Backend Deployment
   ↓
Frontend Deployment
   ↓
MongoDB Atlas
   ↓
Domain
   ↓
SSL
   ↓
Production Testing
```

---

# 35. Real-Time Business Example

Admin creates:

```text
Category:
Banking

Company:
Axis Bank

Job:
Branch Relationship Officer

Location:
Chennai

Experience:
0-2 Years

Salary:
Admin-defined

Openings:
10
```

Admin clicks:

```text
Publish
```

Candidate immediately sees:

```text
Banking
   ↓
Axis Bank
   ↓
Branch Relationship Officer
```

Candidate opens the job and sees all details entered by Admin.

Candidate clicks:

```text
Apply Now
```

Application enters:

```text
Admin Dashboard
→ Applications
```

Admin changes:

```text
Applied
↓
Shortlisted
↓
Interview Scheduled
↓
Selected
```

Candidate sees the updated application status in their dashboard.

---

# 36. Future Features

After the first version is stable, the system can be expanded with:

- WhatsApp notifications
- Email automation
- SMS notifications
- AI resume screening
- Resume-to-job matching
- Automatic candidate shortlisting
- Interview reminders
- Recruiter accounts
- Multiple admin roles
- Company/recruiter portal
- Candidate document verification
- Offer letter generation
- Joining tracking
- Recruitment analytics
- Bulk candidate import
- Bulk interview scheduling
- Job sharing links
- Unique campaign links
- QR code for job campaigns

---

# 37. Recommended MVP

Do not build every feature initially.

### MVP Version

Candidate:

```text
Home
Categories
Companies
Jobs
Job Details
Register/Login
Apply
My Applications
Application Status
```

Admin:

```text
Dashboard
Categories
Companies
Jobs
Candidates
Applications
Interview Scheduling
Reports
```

Backend:

```text
Authentication
Categories API
Companies API
Jobs API
Applications API
Candidates API
Interviews API
```

Database:

```text
Users
Categories
Companies
Jobs
Candidates
Applications
Interviews
```

Once this MVP works correctly, add notifications, WhatsApp, AI screening, advanced analytics, and other automation.

---

# 38. Final Product Flow

```text
                     ADMIN
                       |
                 Create Category
                       |
                 Create Company
                       |
                   Create Job
                       |
                    Publish
                       |
                       v
                 DATABASE
                       |
                       v
                CANDIDATE PORTAL
                       |
                 Select Category
                       |
                  Select Company
                       |
                    Select Job
                       |
                 View Job Details
                       |
                    Apply Now
                       |
                 Submit Application
                       |
                       v
                    DATABASE
                       |
                       v
                     ADMIN
                       |
                  Review Candidate
                       |
                   Shortlist
                       |
               Schedule Interview
                       |
                  Update Status
                       |
                       v
                   CANDIDATE
                       |
                Track Application
                       |
                    Selected
```

# 39. Project Goal

The final system should work as a **dynamic recruitment management platform**, not just a static job listing website.

The core principle is:

> Admin controls the recruitment data. Candidate sees the latest published data automatically.

Therefore, adding a new category, company, or job should not require any frontend code changes.

This architecture makes the system suitable for real recruitment workflows and gives a clear path for future automation, notifications, analytics, AI screening, and production-scale deployment.
