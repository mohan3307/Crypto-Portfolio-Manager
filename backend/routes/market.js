const express = require('express');
const router = express.Router();
const { getListings, getTrending, getPrices, getChartData } = require('../controllers/marketController');
const auth = require('../middleware/auth');

router.get('/listings', getListings);
router.get('/trending', getTrending);
router.get('/prices', getPrices);
router.get('/chart/:symbol/:timeframe', getChartData);

module.exports = router;
