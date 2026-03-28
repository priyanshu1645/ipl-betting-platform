const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  selectedTeam: { type: String, enum: ['teamA', 'teamB'], required: true },
  amount: { type: Number, required: true, min: 20, max: 100 },
  result: { type: String, enum: ['win', 'loss', 'pending'], default: 'pending' },
  payout: { type: Number, default: 0 }
}, { timestamps: true });

// Ensure a user can only bet once per match
betSchema.index({ userId: 1, matchId: 1 }, { unique: true });

module.exports = mongoose.model('Bet', betSchema);
