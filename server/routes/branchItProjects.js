const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { BranchItProjectModel, BranchItMasterProjectModel, UserModel } = require('../db');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper to save base64 image
function saveBase64Image(dataString) {
  if (!dataString || typeof dataString !== 'string') return '';
  if (dataString.startsWith('/uploads/')) return dataString; // already a path

  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return dataString; // fallback if already a plain URL or invalid
  }

  const mimeType = matches[1];
  let extension = 'png';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
  else if (mimeType.includes('pdf')) extension = 'pdf';
  else if (mimeType.includes('webp')) extension = 'webp';

  const filename = `proof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extension}`;
  const filePath = path.join(uploadsDir, filename);

  const buffer = Buffer.from(matches[2], 'base64');
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${filename}`;
}

// GET all IT projects (filtered by branchManagerId or branch)
router.get('/', async (req, res) => {
  try {
    const { branchManagerId, branch } = req.query;
    const filter = {};
    if (branchManagerId) filter.branchManagerId = branchManagerId;
    if (branch && branch !== 'all') filter.branch = new RegExp('^' + branch + '$', 'i');

    const projects = await BranchItProjectModel.find(filter).sort({ createdAt: -1 }).lean();

    // Fetch all branch managers to enrich projects with branch manager name & email
    const bms = await UserModel.find({ role: 'branch_manager' }).lean();
    const bmMap = {};
    const branchToBmMap = {};
    bms.forEach(bm => {
      bmMap[bm.id] = bm;
      if (bm.branch) branchToBmMap[bm.branch.toLowerCase()] = bm;
    });

    const enriched = projects.map(p => {
      const bm = bmMap[p.branchManagerId] || branchToBmMap[(p.branch || '').toLowerCase()];
      return {
        ...p,
        branch: p.branch || (bm ? bm.branch : 'Main Branch'),
        branchManagerName: bm ? bm.name : (p.createdByName || 'Branch Manager'),
        branchManagerEmail: bm ? bm.email : ''
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error('Error fetching Branch IT Projects:', error);
    res.status(500).json({ error: 'Failed to fetch Branch IT projects.' });
  }
});

// GET Master IT Projects list
router.get('/master', async (req, res) => {
  try {
    const { branch } = req.query;
    let filter = {};
    if (branch && branch !== 'all') {
      filter = { $or: [{ branch: new RegExp('^' + branch + '$', 'i') }, { branch: '' }, { branch: null }] };
    }

    let masterProjects = await BranchItMasterProjectModel.find(filter).sort({ createdAt: -1 }).lean();

    // If completely empty, auto-seed with common IT projects and existing assigned project names
    if (masterProjects.length === 0) {
      const existingAssignments = await BranchItProjectModel.find({}).lean();
      const existingNames = [...new Set(existingAssignments.map(p => p.projectName).filter(Boolean))];

      const defaults = [
        { name: 'Candidate Portal App v2', description: 'Candidate self-service registration, job application & interview tracker' },
        { name: 'Recruitment Admin & Operations Dashboard', description: 'Admin, Branch Manager, Team Leader, and HR executive operations portal' },
        { name: 'Automated Interview Scheduling Engine', description: 'Multi-round interview slots scheduling and Google Meet integration' },
        { name: 'Payment & Candidate Incentive System', description: 'Incentive calculation, invoice generation and payout processing' }
      ];

      const toInsert = [...defaults];
      existingNames.forEach(name => {
        if (!toInsert.some(d => d.name.toLowerCase() === name.toLowerCase())) {
          toInsert.push({ name, description: 'Existing active IT project' });
        }
      });

      const docs = toInsert.map((p, idx) => ({
        id: `it_mst_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        name: p.name,
        description: p.description || '',
        status: 'Active',
        createdAt: new Date().toISOString()
      }));

      await BranchItMasterProjectModel.insertMany(docs);
      masterProjects = await BranchItMasterProjectModel.find(filter).sort({ createdAt: -1 }).lean();
    }

    // Attach count of team members assigned to each master project
    const allAssignments = await BranchItProjectModel.find({}).lean();
    const countMap = {};
    allAssignments.forEach(a => {
      const key = (a.projectName || '').toLowerCase().trim();
      countMap[key] = (countMap[key] || 0) + 1;
    });

    const enriched = masterProjects.map(mp => ({
      ...mp,
      assignedMembersCount: countMap[(mp.name || '').toLowerCase().trim()] || 0
    }));

    res.json(enriched);
  } catch (error) {
    console.error('Error fetching Master IT Projects:', error);
    res.status(500).json({ error: 'Failed to fetch master projects.' });
  }
});

// POST create new Master IT Project
router.post('/master', async (req, res) => {
  try {
    const { name, description, branch, branchManagerId } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required.' });
    }

    const trimmedName = name.trim();
    const existing = await BranchItMasterProjectModel.findOne({
      name: new RegExp('^' + trimmedName + '$', 'i')
    }).lean();

    if (existing) {
      return res.status(200).json(existing);
    }

    const newMst = new BranchItMasterProjectModel({
      id: `it_mst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      description: (description || '').trim(),
      branch: (branch || '').trim(),
      branchManagerId: (branchManagerId || '').trim(),
      status: 'Active',
      createdAt: new Date().toISOString()
    });

    await newMst.save();
    res.status(201).json(newMst);
  } catch (error) {
    console.error('Error creating Master IT project:', error);
    res.status(500).json({ error: 'Failed to create master project.' });
  }
});

// DELETE Master IT Project
router.delete('/master/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await BranchItMasterProjectModel.deleteOne({ id });
    res.json({ message: 'Master project deleted successfully.' });
  } catch (error) {
    console.error('Error deleting Master IT project:', error);
    res.status(500).json({ error: 'Failed to delete master project.' });
  }
});

// GET single IT project
router.get('/:id', async (req, res) => {
  try {
    const project = await BranchItProjectModel.findOne({ id: req.params.id }).lean();
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
});

// POST create new IT Project with Email Proof
router.post('/', async (req, res) => {
  try {
    const {
      branchManagerId,
      branch,
      memberName,
      memberRole,
      projectName,
      description,
      deadline,
      emailProofImage,
      status,
      createdByName,
      createdByRole
    } = req.body;

    if (!memberName || !projectName || !deadline) {
      return res.status(400).json({ error: 'Member name, project name, and deadline are required.' });
    }

    let finalBranch = (branch || '').trim();
    let finalBmId = (branchManagerId || '').trim();

    // Link Branch Manager and Branch
    if (finalBmId) {
      const bm = await UserModel.findOne({ id: finalBmId, role: 'branch_manager' }).lean();
      if (bm && bm.branch) finalBranch = bm.branch;
    } else if (finalBranch) {
      const bm = await UserModel.findOne({ branch: new RegExp('^' + finalBranch + '$', 'i'), role: 'branch_manager' }).lean();
      if (bm) finalBmId = bm.id;
    }

    if (!finalBranch) finalBranch = 'Main Branch';

    let emailProofUrl = '';
    if (emailProofImage) {
      emailProofUrl = saveBase64Image(emailProofImage);
    }

    const newProject = new BranchItProjectModel({
      id: `it_proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      branchManagerId: finalBmId,
      branch: finalBranch,
      memberName: memberName.trim(),
      memberRole: memberRole ? memberRole.trim() : 'Developer',
      projectName: projectName.trim(),
      description: description || '',
      deadline: deadline, // 'YYYY-MM-DD'
      emailProofUrl: emailProofUrl,
      status: status || 'In Progress',
      createdByName: createdByName || '',
      createdByRole: createdByRole || '',
      createdAt: new Date().toISOString()
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating Branch IT Project:', error);
    res.status(500).json({ error: 'Failed to create Branch IT project.' });
  }
});

// PUT update IT Project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      memberName,
      memberRole,
      projectName,
      description,
      deadline,
      emailProofImage,
      status
    } = req.body;

    const project = await BranchItProjectModel.findOne({ id });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (memberName) project.memberName = memberName.trim();
    if (memberRole !== undefined) project.memberRole = memberRole.trim();
    if (projectName) project.projectName = projectName.trim();
    if (description !== undefined) project.description = description;
    if (deadline) project.deadline = deadline;
    if (status) {
      project.status = status;
      if (status === 'Completed' && !project.completedAt) {
        project.completedAt = new Date().toISOString();
      }
    }

    if (emailProofImage && emailProofImage.startsWith('data:')) {
      project.emailProofUrl = saveBase64Image(emailProofImage);
    }

    project.updatedAt = new Date().toISOString();
    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Error updating Branch IT Project:', error);
    res.status(500).json({ error: 'Failed to update Branch IT project.' });
  }
});

// DELETE IT Project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await BranchItProjectModel.findOne({ id });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Try deleting uploaded proof file if local
    if (project.emailProofUrl && project.emailProofUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', project.emailProofUrl);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    await BranchItProjectModel.deleteOne({ id });
    res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('Error deleting Branch IT Project:', error);
    res.status(500).json({ error: 'Failed to delete Branch IT project.' });
  }
});

module.exports = router;
