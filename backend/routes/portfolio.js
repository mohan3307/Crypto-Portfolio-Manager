const express = require('express');
const router = express.Router();
const { getPortfolio, addItem, updateItem, deleteItem } = require('../controllers/portfolioController');
const auth = require('../middleware/auth');

router.get('/', auth, getPortfolio);
router.post('/add', auth, addItem);
router.put('/:itemId', auth, updateItem);
router.delete('/:itemId', auth, deleteItem);

module.exports = router;
