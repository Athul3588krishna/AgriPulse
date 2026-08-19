const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const plotRoutes = require('./routes/plotRoutes');
const diagnosisRoutes = require('./routes/diagnosisRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plots', plotRoutes);
app.use('/api/diagnoses', diagnosisRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'AgriPulse AI Express API Gateway',
    time: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agripulse';

// Database connection with fallback log
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully.');
    app.listen(PORT, () => {
      console.log(`🚀 AgriPulse Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('⚠️ Mongo Connection Error, starting standalone Express API:', err.message);
    app.listen(PORT, () => {
      console.log(`🚀 AgriPulse Server running in standalone mode on port ${PORT}`);
    });
  });
