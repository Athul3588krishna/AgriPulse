const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  crop: { type: String, required: true },
  disease: { type: String, required: true },
  category: { type: String, enum: ['Biological', 'Chemical', 'Cultural', 'General'], default: 'General' },
  contentEn: { type: String, required: true },
  contentMl: { type: String, required: true },
  institution: { type: String, default: 'Kerala Agricultural University / ICAR' },
  referenceUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
