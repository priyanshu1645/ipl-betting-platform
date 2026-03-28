const express = require('express');
const router = express.Router();
const { getMatches, getMatchById, createMatch, resolveMatch } = require('../controllers/matchController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getMatches).post(protect, admin, createMatch);
router.route('/:id').get(getMatchById);
router.route('/:id/resolve').put(protect, admin, resolveMatch);

module.exports = router;
