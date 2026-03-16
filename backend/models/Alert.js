const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
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
  type: {
    type: String,
    enum: ['above', 'below'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  note: String,
  active: {
    type: Boolean,
    default: true
  },
  triggered: {
    type: Boolean,
    default: false
  },
  triggeredPrice: Number,
  triggeredAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
