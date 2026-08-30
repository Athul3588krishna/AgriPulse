const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Diagnosis = require('../models/Diagnosis');
const KnowledgeBase = require('../models/KnowledgeBase');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Get Admin Analytics Dashboard Summary
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'farmer' });
    const totalDiagnoses = await Diagnosis.countDocuments();
    const severeAlerts = await Diagnosis.countDocuments({ severityLevel: 'Severe' });

    // Aggregate top diseases
    const diseaseBreakdown = await Diagnosis.aggregate([
      { $group: { _id: '$diseaseName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Monthly diagnoses count (for charts)
    const monthlyStats = await Diagnosis.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      totalUsers,
      totalDiagnoses,
      severeAlerts,
      diseaseBreakdown,
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin stats', error: error.message });
  }
});

// Get User Directory
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Knowledge base endpoints
router.get('/kb', protect, async (req, res) => {
  try {
    const docs = await KnowledgeBase.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching knowledge base', error: error.message });
  }
});

router.post('/kb', protect, adminOnly, async (req, res) => {
  try {
    const { title, crop, disease, category, contentEn, contentMl, institution, referenceUrl } = req.body;
    const kbItem = await KnowledgeBase.create({
      title,
      crop,
      disease,
      category,
      contentEn,
      contentMl,
      institution,
      referenceUrl
    });
    res.status(201).json(kbItem);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to knowledge base', error: error.message });
  }
});

module.exports = router;
