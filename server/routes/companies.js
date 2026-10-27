const express = require('express');
const router = express.Router();
const { CompanyModel } = require('../db');

// Fallback priority map for companies if displayOrder not explicitly stored yet
const defaultCompanyPriorityMap = {
  'YES Bank': 1,
  'IDFC First Bank': 2,
  'Bandhan Bank': 3,
  'HDFC Life': 4,
  'Aditya Birla Capital': 5,
  'Kotak Mahindra Bank': 6,
  'Mahindra Finance': 7,
  'Axis Bank': 8,
  'TATA AIG': 9,
  'Suryoday Small Finance Bank': 10
};

// GET /api/companies (optional query ?categoryId=xxx)
router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = categoryId ? { categoryId } : {};
    const companies = await CompanyModel.find(filter).sort({ displayOrder: 1, name: 1 }).lean();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const formatted = (companies || []).map(c => {
      let logo = c.logo || '';
      if (logo.startsWith('http://localhost:5000')) {
        logo = logo.replace('http://localhost:5000', baseUrl);
      } else if (logo.startsWith('/')) {
        logo = `${baseUrl}${logo}`;
      }
      const order = c.displayOrder !== undefined && c.displayOrder !== null && c.displayOrder !== ''
        ? Number(c.displayOrder)
        : (defaultCompanyPriorityMap[c.name] ?? 99);
      return { ...c, logo, displayOrder: order };
    });

    formatted.sort((a, b) => (a.displayOrder - b.displayOrder) || (a.name || '').localeCompare(b.name || ''));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch companies from MongoDB Atlas.' });
  }
});

// PUT /api/companies/reorder (Batch reorder)
router.put('/reorder', async (req, res) => {
  try {
    const { orders } = req.body; // array of { id, displayOrder }
    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: 'orders array is required' });
    }

    const updates = orders.map(({ id, displayOrder }) =>
      CompanyModel.updateOne(
        { id },
        { $set: { displayOrder: Number(displayOrder), updatedAt: new Date().toISOString() } }
      )
    );
    await Promise.all(updates);

    res.json({ message: 'Companies reordered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder companies.' });
  }
});

// POST /api/companies
router.post('/', async (req, res) => {
  try {
    const { categoryId, name, logo, description, website, status = 'Active', displayOrder } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Company name and category ID are required.' });
    }

    const orderNum = displayOrder !== undefined && displayOrder !== null && displayOrder !== ''
      ? Number(displayOrder)
      : (defaultCompanyPriorityMap[name] ?? 99);

    const newCompany = {
      id: 'comp_' + Date.now(),
      categoryId,
      name,
      logo: logo || '/logos/axis_bank.svg',
      description: description || '',
      website: website || '',
      status,
      displayOrder: orderNum,
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
    if (updateData.displayOrder !== undefined && updateData.displayOrder !== null && updateData.displayOrder !== '') {
      updateData.displayOrder = Number(updateData.displayOrder);
    }
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

