const express = require('express');
const router = express.Router();
const { getListings, getTrending, getPrices, getChartData } = require('../controllers/marketController');
const auth = require('../middleware/auth');

router.get('/listings', auth, getListings);
router.get('/trending', auth, getTrending);
router.get('/prices', auth, getPrices);
router.get('/chart/:symbol/:timeframe', auth, getChartData);

module.exports = router;
