const express = require('express');
const router = express.Router();
const { readDBAsync, InterviewModel, ApplicationModel } = require('../db');

// GET /api/interviews (supports ?candidateId=xxx or ?applicationId=xxx)
router.get('/', async (req, res) => {
  try {
    const { candidateId, applicationId } = req.query;

    // Clean up duplicate interviews in MongoDB Atlas if any exist
    try {
      const allDbInterviews = await InterviewModel.find({}).lean();
      const seenKeys = new Map();
      const duplicateIdsToDelete = [];

      for (const item of allDbInterviews) {
        const key = `${item.applicationId || item.candidateId}_${item.round || 'HR Screening'}`;
        if (seenKeys.has(key)) {
          const prev = seenKeys.get(key);
          const prevTime = new Date(prev.updatedAt || prev.createdAt || 0).getTime();
          const currTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
          if (currTime > prevTime) {
            duplicateIdsToDelete.push(prev._id);
            seenKeys.set(key, item);
          } else {
            duplicateIdsToDelete.push(item._id);
          }
        } else {
          seenKeys.set(key, item);
        }
      }

      if (duplicateIdsToDelete.length > 0) {
        await InterviewModel.deleteMany({ _id: { $in: duplicateIdsToDelete } });
        console.log(`🧹 Cleaned up ${duplicateIdsToDelete.length} duplicate interview records from MongoDB.`);
      }
    } catch (cleanupErr) {
      console.warn('Auto-cleanup warning:', cleanupErr.message);
    }

    const db = await readDBAsync();
    let interviews = db.interviews || [];

    if (candidateId) {
      interviews = interviews.filter(i => i.candidateId === candidateId);
    }
    if (applicationId) {
      interviews = interviews.filter(i => i.applicationId === applicationId);
    }

    // Deduplicate in response list as safety net
    const uniqueMap = new Map();
    for (const item of interviews) {
      const key = `${item.applicationId || item.candidateId}_${item.round || 'HR Screening'}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    }
    interviews = Array.from(uniqueMap.values());

    // Populate candidate, job, company
    const populated = interviews.map(int => {
      const candidate = db.candidates.find(c => c.id === int.candidateId) || {};
      const job = db.jobs.find(j => j.id === int.jobId) || {};
      const company = db.companies.find(c => c.id === int.companyId || c.id === job.companyId) || {};

      return {
        ...int,
        candidateName: candidate.name || 'Candidate',
        candidateEmail: candidate.email || '',
        candidateMobile: candidate.mobile || '',
        jobTitle: job.title || 'Job Role',
        companyName: company.name || 'Company',
        companyLogo: company.logo || ''
      };
    });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch interviews from MongoDB Atlas.' });
  }
});

// POST /api/interviews (Schedule interview - prevents duplicates by updating existing interview)
router.post('/', async (req, res) => {
  try {
    const {
      applicationId,
      candidateId,
      jobId,
      companyId,
      round = 'HR Screening',
      date,
      time,
      mode = 'Online',
      location = '',
      meetingLink = '',
      interviewer = '',
      notes = ''
    } = req.body;

    if (!applicationId || !date || !time) {
      return res.status(400).json({ error: 'Application ID, Date, and Time are required.' });
    }

    const app = await ApplicationModel.findOne({ id: applicationId });
    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // Check if an interview schedule already exists for this applicationId & round
    let existingInt = await InterviewModel.findOne({ applicationId, round });
    if (!existingInt) {
      existingInt = await InterviewModel.findOne({ applicationId });
    }

    let savedInterview;
    if (existingInt) {
      // Update existing interview schedule instead of creating a duplicate row
      existingInt.candidateId = candidateId || app.candidateId;
      existingInt.jobId = jobId || app.jobId;
      existingInt.companyId = companyId || app.companyId;
      existingInt.round = round;
      existingInt.date = date;
      existingInt.time = time;
      existingInt.mode = mode;
      existingInt.location = location;
      existingInt.meetingLink = meetingLink;
      existingInt.interviewer = interviewer;
      existingInt.notes = notes;
      existingInt.status = 'Scheduled';
      existingInt.updatedAt = new Date().toISOString();

      savedInterview = await existingInt.save();
    } else {
      const newInterview = {
        id: 'int_' + Date.now(),
        applicationId,
        candidateId: candidateId || app.candidateId,
        jobId: jobId || app.jobId,
        companyId: companyId || app.companyId,
        round,
        date,
        time,
        mode,
        location,
        meetingLink,
        interviewer,
        status: 'Scheduled',
        notes,
        createdAt: new Date().toISOString()
      };
      savedInterview = await InterviewModel.create(newInterview);
    }

    // Automatically update Application status to 'Interview Scheduled'
    await ApplicationModel.findOneAndUpdate(
      { id: applicationId },
      { $set: { status: 'Interview Scheduled', updatedAt: new Date().toISOString() } }
    );

    res.status(201).json(savedInterview.toObject ? savedInterview.toObject() : savedInterview);
  } catch (err) {
    console.error('Error scheduling interview:', err);
    res.status(500).json({ error: 'Failed to schedule interview in MongoDB Atlas.' });
  }
});

// PUT /api/interviews/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateObj = { ...req.body, updatedAt: new Date().toISOString() };
    const updated = await InterviewModel.findOneAndUpdate({ id }, { $set: updateObj }, { new: true }).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Interview schedule not found.' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update interview schedule in MongoDB Atlas.' });
  }
});

// DELETE /api/interviews/:id (Delete/Cancel interview schedule)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');

    const conditions = [{ id: id }, { applicationId: id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      conditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }

    const result = await InterviewModel.deleteMany({ $or: conditions });
    res.json({ message: 'Interview deleted successfully.', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete interview schedule.' });
  }
});

module.exports = router;

