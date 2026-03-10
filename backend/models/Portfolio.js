const mongoose = require('mongoose');

const portfolioItemSchema = new mongoose.Schema({
  coinId: { type: String, required: true },
  symbol: { type: String, required: true, uppercase: true },
  name: { type: String, required: true },
  logo: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 0 },
  buyPrice: { type: Number, required: true, min: 0 },
  buyDate: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
}, { timestamps: true });

const portfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [portfolioItemSchema]
}, { timestamps: true });

// Virtual: total investment per item
portfolioItemSchema.virtual('totalInvestment').get(function() {
  return this.quantity * this.buyPrice;
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
