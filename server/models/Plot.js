const mongoose = require('mongoose');

const plotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  cropType: { type: String, required: true },
  areaAcres: { type: Number, default: 1 },
  soilType: { type: String, default: 'Loamy' },
  location: {
    city: { type: String, default: 'Kochi' },
    latitude: { type: Number, default: 9.9312 },
    longitude: { type: Number, default: 76.2673 }
  },
  sowingDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plot', plotSchema);
