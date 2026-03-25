const express = require('express');
const router = express.Router();
const { 
  getListings, getTrending, getPrices, getChartData,
  getExchanges, getCategories, getNewsFeed, getNFTs, getCalendarEvents, getCommunityFeed, getFearGreed, getRiskTelemetry,
  getGlobalStats, getEconomicCalendar, getRoadmap, getStrategies
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
router.get('/fear-greed', getFearGreed);
router.get('/risk-telemetry', getRiskTelemetry);
router.get('/global-stats', getGlobalStats);
router.get('/calendar/macro', getEconomicCalendar);
router.get('/roadmap', getRoadmap);
router.get('/strategies', getStrategies);

module.exports = router;
