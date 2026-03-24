const express = require('express');
const router = express.Router();
const paperController = require('../controllers/paperController');
const auth = require('../middleware/auth');

router.get('/positions', auth, paperController.getPaperPositions);
router.get('/history', auth, paperController.getPaperHistory);
router.post('/open', auth, paperController.openPaperPosition);
router.post('/close/:id', auth, paperController.closePaperPosition);
router.post('/reset', auth, paperController.resetPaperAccount);

module.exports = router;
