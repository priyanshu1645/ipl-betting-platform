const Match = require('../models/Match');
const Bet = require('../models/Bet');
const User = require('../models/User');

// @desc    Get all active matches
// @route   GET /api/matches
// @access  Public
const getMatches = async (req, res) => {
  try {
    const matches = await Match.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single match
// @route   GET /api/matches/:id
// @access  Public
const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (match) {
      res.json(match);
    } else {
      res.status(404).json({ message: 'Match not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a match
// @route   POST /api/matches
// @access  Private/Admin
const createMatch = async (req, res) => {
  try {
    const { teamA, teamB, multiplierA, multiplierB } = req.body;

    const match = new Match({
      teamA,
      teamB,
      multiplierA,
      multiplierB,
    });

    const createdMatch = await match.save();
    
    // Notify clients of new match
    if (req.io) req.io.emit('matches_updated');

    res.status(201).json(createdMatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resolve a match (Declare Winner)
// @route   PUT /api/matches/:id/resolve
// @access  Private/Admin
const resolveMatch = async (req, res) => {
  try {
    const { result } = req.body; // 'teamA' or 'teamB'
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.result !== 'pending') {
      return res.status(400).json({ message: 'Match already resolved' });
    }

    if (!['teamA', 'teamB'].includes(result)) {
      return res.status(400).json({ message: 'Invalid result' });
    }

    match.result = result;
    match.isActive = false; // Close betting
    await match.save();

    // Find all bets for this match
    const bets = await Bet.find({ matchId: match._id });
    
    // Process payouts
    for (let bet of bets) {
      if (bet.selectedTeam === result) {
        // User won
        const multiplier = result === 'teamA' ? match.multiplierA : match.multiplierB;
        bet.payout = bet.amount * multiplier;
        bet.result = 'win';
        
        // Reward user
        const user = await User.findById(bet.userId);
        if (user) {
          user.coins += bet.payout;
          await user.save();
        }
      } else {
        // User lost
        bet.payout = 0;
        bet.result = 'loss';
      }
      await bet.save();
    }

    if (req.io) {
      req.io.emit('match_resolved', { matchId: match._id, result, teamName: result === 'teamA' ? match.teamA : match.teamB });
      req.io.emit('leaderboard_updated');
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMatches,
  getMatchById,
  createMatch,
  resolveMatch
};
