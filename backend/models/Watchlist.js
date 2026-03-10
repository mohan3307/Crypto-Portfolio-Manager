const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coins: [{
    coinId: { type: String, required: true },
    symbol: { type: String, required: true, uppercase: true },
    name: { type: String, required: true },
    logo: { type: String, default: '' },
    addedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
