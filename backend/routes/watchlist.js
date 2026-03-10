const express = require('express');
const router = express.Router();
const { getWatchlist, addCoin, removeCoin } = require('../controllers/watchlistController');
const auth = require('../middleware/auth');

router.get('/', auth, getWatchlist);
router.post('/add', auth, addCoin);
router.delete('/:coinId', auth, removeCoin);

module.exports = router;
