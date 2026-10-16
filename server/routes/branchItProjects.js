const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { BranchItProjectModel, UserModel } = require('../db');

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
    if (branch) filter.branch = new RegExp('^' + branch + '$', 'i');

    const projects = await BranchItProjectModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching Branch IT Projects:', error);
    res.status(500).json({ error: 'Failed to fetch Branch IT projects.' });
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

    let emailProofUrl = '';
    if (emailProofImage) {
      emailProofUrl = saveBase64Image(emailProofImage);
    }

    const newProject = new BranchItProjectModel({
      id: `it_proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      branchManagerId: branchManagerId || '',
      branch: branch || 'Main Branch',
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
