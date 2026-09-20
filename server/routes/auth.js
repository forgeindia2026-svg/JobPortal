const express = require('express');
const router = express.Router();
const { UserModel, CandidateModel } = require('../db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'candidate', mobile, location, qualification, experience, skills } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ error: 'Account with this email already exists.' });
    }

    const userId = 'usr_' + Date.now();
    const newUser = {
      id: userId,
      name,
      email: email.toLowerCase(),
      passwordHash: 'dummy_hash_' + password,
      role: role === 'admin' ? 'admin' : 'candidate',
      mobile: mobile || '',
      location: location || '',
      qualification: qualification || '',
      experience: experience || '',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      createdAt: new Date().toISOString()
    };

    const savedUser = await UserModel.create(newUser);

    // If candidate, also create candidate profile entry in MongoDB Atlas
    if (newUser.role === 'candidate') {
      const candId = 'cand_' + Date.now();
      await CandidateModel.create({
        id: candId,
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        location: newUser.location,
        qualification: newUser.qualification,
        experience: newUser.experience,
        skills: newUser.skills,
        resumeUrl: '',
        createdAt: new Date().toISOString()
      });
    }

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        mobile: newUser.mobile,
        location: newUser.location,
        qualification: newUser.qualification,
        experience: newUser.experience,
        skills: newUser.skills
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register user in MongoDB Atlas.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const candProfile = await CandidateModel.findOne({
      $or: [{ userId: user.id }, { email: user.email }]
    }).lean();

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        candidateId: candProfile ? candProfile.id : null,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile || (candProfile ? candProfile.mobile : ''),
        location: user.location || (candProfile ? candProfile.location : ''),
        qualification: user.qualification || (candProfile ? candProfile.qualification : ''),
        experience: user.experience || (candProfile ? candProfile.experience : ''),
        skills: user.skills || (candProfile ? candProfile.skills : []),
        resumeUrl: candProfile ? candProfile.resumeUrl : ''
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to authenticate user.' });
  }
});

module.exports = router;

