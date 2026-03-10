const Watchlist = require('../models/Watchlist');
const { getPriceDirect } = require('./marketController');

exports.getWatchlist = async (req, res) => {
  try {
    let watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) watchlist = await Watchlist.create({ user: req.user._id, coins: [] });

    const prices = getPriceDirect();
    // We'll return basic watchlist data; frontend fetches full market data
    res.json({ coins: watchlist.coins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addCoin = async (req, res) => {
  try {
    const { coinId, symbol, name, logo } = req.body;
    if (!coinId || !symbol || !name)
      return res.status(400).json({ error: 'Missing required fields.' });

    let watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) watchlist = await Watchlist.create({ user: req.user._id, coins: [] });

    const exists = watchlist.coins.find(c => c.coinId === coinId);
    if (exists) return res.status(400).json({ error: 'Coin already in watchlist.' });

    watchlist.coins.push({ coinId, symbol: symbol.toUpperCase(), name, logo });
    await watchlist.save();
    res.status(201).json({ message: 'Added to watchlist.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeCoin = async (req, res) => {
  try {
    const { coinId } = req.params;
    let watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) return res.status(404).json({ error: 'Watchlist not found.' });

    watchlist.coins = watchlist.coins.filter(c => c.coinId !== coinId);
    await watchlist.save();
    res.json({ message: 'Removed from watchlist.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
