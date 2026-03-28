const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  multiplierA: { type: Number, required: true },
  multiplierB: { type: Number, required: true },
  result: { type: String, enum: ['pending', 'teamA', 'teamB'], default: 'pending' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
