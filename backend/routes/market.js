const express = require('express');
const router = express.Router();
const { 
  getListings, getTrending, getPrices, getChartData,
  getExchanges, getCategories, getNewsFeed, getNFTs, getCalendarEvents, getCommunityFeed 
} = require('../controllers/marketController');
const auth = require('../middleware/auth');

router.get('/listings', getListings);
router.get('/trending', getTrending);
router.get('/prices', getPrices);
router.get('/chart/:symbol/:timeframe', getChartData);

router.get('/exchanges', getExchanges);
router.get('/categories', getCategories);
router.get('/news/feed', getNewsFeed);
router.get('/nfts/top', getNFTs);
router.get('/calendar/events', getCalendarEvents);
router.get('/community/feed', getCommunityFeed);

module.exports = router;
