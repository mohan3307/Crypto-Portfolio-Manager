const mongoose = require('mongoose');

const PaperTradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  coinName: String,
  logo: String,
  type: {
    type: String,
    enum: ['long', 'short'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  entryPrice: {
    type: Number,
    required: true
  },
  exitPrice: Number,
  pnl: Number,
  returnPct: Number,
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  stopLoss: Number,
  takeProfit: Number,
  openedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: Date
});

module.exports = mongoose.model('PaperTrade', PaperTradeSchema);
