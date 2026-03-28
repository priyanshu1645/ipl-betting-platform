const Bet = require('../models/Bet');
const Match = require('../models/Match');
const User = require('../models/User');

// @desc    Place a bet
// @route   POST /api/bets
// @access  Private
const placeBet = async (req, res) => {
  try {
    const { matchId, selectedTeam, amount } = req.body;

    if (amount < 20 || amount > 100) {
      return res.status(400).json({ message: 'Bet amount must be between 20 and 100 coins' });
    }

    const match = await Match.findById(matchId);
    if (!match || !match.isActive) {
      return res.status(400).json({ message: 'Match is either completed or not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.coins < amount) {
      return res.status(400).json({ message: 'Insufficient coins' });
    }

    // Check if user already bet on this match
    const existingBet = await Bet.findOne({ userId: req.user._id, matchId });
    if (existingBet) {
      return res.status(400).json({ message: 'You have already placed a bet on this match' });
    }

    // Deduct coins and create bet
    user.coins -= amount;
    await user.save();

    const bet = new Bet({
      userId: req.user._id,
      matchId,
      selectedTeam,
      amount,
    });

    const createdBet = await bet.save();

    // Inform client
    if (req.io) {
      req.io.emit('leaderboard_updated'); // Balances changed
    }

    res.status(201).json(createdBet);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'You have already placed a bet on this match' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Get user bets
// @route   GET /api/bets/mybets
// @access  Private
const getUserBets = async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user._id })
      .populate('matchId', 'teamA teamB multiplierA multiplierB result isActive')
      .sort({ createdAt: -1 });
    res.json(bets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  placeBet,
  getUserBets
};
