const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plot' },
  imageUrl: { type: String, required: true },
  cropName: { type: String, default: 'General' },
  diseaseName: { type: String, required: true },
  confidenceScore: { type: Number, required: true },
  severityPercentage: { type: Number, default: 0 },
  severityLevel: { type: String, enum: ['Mild', 'Moderate', 'Severe', 'Healthy'], default: 'Mild' },
  weatherSnapshot: {
    temperature: Number,
    humidity: Number,
    rainProbability: Number,
    windSpeed: Number,
    sprayRecommendation: String
  },
  advisory: {
    english: {
      organic: [String],
      chemical: [String],
      preventive: [String],
      summary: String
    },
    malayalam: {
      organic: [String],
      chemical: [String],
      preventive: [String],
      summary: String
    }
  },
  sources: [{ title: String, url: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Diagnosis', diagnosisSchema);
