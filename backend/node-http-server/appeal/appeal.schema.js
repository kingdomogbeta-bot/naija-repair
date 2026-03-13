const mongoose = require('mongoose');

const appealSchema = new mongoose.Schema({
  taskerEmail: { type: String, required: true },
  idType: { type: String, required: true },
  idNumber: { type: String, required: true },
  idImage: { type: String, required: true },
  selfieImage: { type: String, required: true },
  status: { type: String, default: 'pending' },
  reviewedBy: String,
  reviewedAt: Date,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Appeal', appealSchema);
