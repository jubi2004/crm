const express = require('express');
const Company = require('../models/Company');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/companies
router.get('/', protect, async (req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/companies
router.post('/', protect, async (req, res) => {
  try {
    const { name, industry, location, website, phone, email } = req.body;

    if (!name) return res.status(400).json({ message: 'Company name is required' });

    const company = await Company.create({ name, industry, location, website, phone, email });
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/companies/:id — company detail with associated leads
router.get('/:id', protect, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const leads = await Lead.find({ company: req.params.id })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ company, leads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/companies/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
