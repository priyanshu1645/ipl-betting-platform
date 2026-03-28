const express = require('express');
const router = express.Router();
const { placeBet, getUserBets } = require('../controllers/betController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, placeBet);
router.route('/mybets').get(protect, getUserBets);

module.exports = router;
