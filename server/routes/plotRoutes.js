const express = require('express');
const router = express.Router();
const Plot = require('../models/Plot');
const { protect } = require('../middleware/authMiddleware');

// Get all plots for logged in farmer
router.get('/', protect, async (req, res) => {
  try {
    const plots = await Plot.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(plots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plots', error: error.message });
  }
});

// Create new plot
router.post('/', protect, async (req, res) => {
  try {
    const { name, cropType, areaAcres, soilType, location } = req.body;
    const plot = await Plot.create({
      userId: req.user.id,
      name,
      cropType,
      areaAcres,
      soilType,
      location: location || { city: 'Kochi', latitude: 9.9312, longitude: 76.2673 }
    });
    res.status(201).json(plot);
  } catch (error) {
    res.status(500).json({ message: 'Error creating plot', error: error.message });
  }
});

// Delete plot
router.delete('/:id', protect, async (req, res) => {
  try {
    await Plot.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Plot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plot', error: error.message });
  }
});

module.exports = router;
