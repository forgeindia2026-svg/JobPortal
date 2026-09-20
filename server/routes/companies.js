const express = require('express');
const router = express.Router();
const { CompanyModel } = require('../db');

// GET /api/companies (optional query ?categoryId=xxx)
router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = categoryId ? { categoryId } : {};
    const companies = await CompanyModel.find(filter).lean();
    res.json(companies || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch companies from MongoDB Atlas.' });
  }
});

// POST /api/companies
router.post('/', async (req, res) => {
  try {
    const { categoryId, name, logo, description, website, status = 'Active' } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Company name and category ID are required.' });
    }

    const newCompany = {
      id: 'comp_' + Date.now(),
      categoryId,
      name,
      logo: logo || 'http://localhost:5000/logos/axis_bank.svg',
      description: description || '',
      website: website || '',
      status,
      createdAt: new Date().toISOString()
    };

    const saved = await CompanyModel.create(newCompany);
    res.status(201).json(saved.toObject());
  } catch (err) {
    res.status(500).json({ error: 'Failed to save company into MongoDB Atlas.' });
  }
});

// PUT /api/companies/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    const updated = await CompanyModel.findOneAndUpdate({ id }, { $set: updateData }, { new: true }).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Company not found.' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update company in MongoDB Atlas.' });
  }
});

// DELETE /api/companies/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CompanyModel.deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Company not found.' });
    }
    res.json({ message: 'Company deleted successfully from MongoDB Atlas.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete company from MongoDB Atlas.' });
  }
});

module.exports = router;

