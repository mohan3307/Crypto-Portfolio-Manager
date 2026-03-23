const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const protect = require('../middleware/auth');

router.post('/ask', protect, aiController.askAI);
router.get('/predictions', protect, aiController.getAIPredictions);

module.exports = router;
