const express = require('express');
const router = express.Router();
const Plot = require('../models/Plot');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

const DEMO_PLOTS = [
  { _id: 'plot-demo-1', name: 'Palakkad Paddy Field (North)', cropType: 'Paddy', areaAcres: 2.5, soilType: 'Clay Loam', location: { city: 'Alathur, Palakkad', latitude: 10.6436, longitude: 76.5413 }, createdAt: new Date() },
  { _id: 'plot-demo-2', name: 'Thrissur Organic Tomato Patch', cropType: 'Tomato', areaAcres: 1.2, soilType: 'Red Loam', location: { city: 'Ollur, Thrissur', latitude: 10.4851, longitude: 76.2341 }, createdAt: new Date() },
  { _id: 'plot-demo-3', name: 'Wayanad Spices Grove', cropType: 'BlackPepper', areaAcres: 3.0, soilType: 'Laterite', location: { city: 'Meppadi, Wayanad', latitude: 11.5517, longitude: 76.1264 }, createdAt: new Date() }
];

// Get all plots for logged in farmer
router.get('/', optionalProtect, async (req, res) => {
  try {
    let plots = [];
    if (req.user && req.user.id) {
      plots = await Plot.find({ userId: req.user.id }).sort({ createdAt: -1 });
    }
    if (plots.length === 0) {
      plots = DEMO_PLOTS;
    }
    res.json(plots);
  } catch (error) {
    res.json(DEMO_PLOTS);
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
