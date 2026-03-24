const PaperTrade = require('../models/PaperTrade');
const User = require('../models/User');

// NOTE: We assume the user has a 'paperBalance' in their User model.
// Let's check User.js first or just add it.

exports.getPaperPositions = async (req, res) => {
  try {
    const userId = req.user.id;
    const trades = await PaperTrade.find({ user: userId, status: 'open' }).sort('-openedAt');
    res.json({ data: trades });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPaperHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const trades = await PaperTrade.find({ user: userId, status: 'closed' }).sort('-closedAt').limit(50);
    res.json({ data: trades });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.openPaperPosition = async (req, res) => {
  try {
    const { symbol, coinName, logo, type, quantity, price } = req.body;
    const userId = req.user.id;
    
    // Check balance logic (we'll look at User.js to see if we can update it)
    const user = await User.findById(userId);
    const cost = quantity * price;
    
    // Note: If user.paperBalance doesn't exist, we fallback to 100000
    const currentBalance = user.paperBalance || 100000;
    
    if (type === 'long' && cost > currentBalance) {
      return res.status(400).json({ error: 'Insufficient paper balance' });
    }

    const trade = new PaperTrade({
      user: userId,
      symbol, coinName, logo, type,
      quantity,
      entryPrice: price,
      status: 'open'
    });

    await trade.save();
    
    if (type === 'long') {
        user.paperBalance = currentBalance - cost;
        await user.save();
    }

    res.status(201).json({ data: trade, balance: user.paperBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.closePaperPosition = async (req, res) => {
    try {
      const { id } = req.params;
      const { currentPrice } = req.body;
      const userId = req.user.id;
  
      const trade = await PaperTrade.findOne({ _id: id, user: userId, status: 'open' });
      if (!trade) return res.status(404).json({ error: 'Position not found' });
  
      const pnl = trade.type === 'long'
        ? (currentPrice - trade.entryPrice) * trade.quantity
        : (trade.entryPrice - currentPrice) * trade.quantity;
      
      const returnPct = (pnl / (trade.entryPrice * trade.quantity)) * 100;
  
      trade.status = 'closed';
      trade.exitPrice = currentPrice;
      trade.closedAt = new Date();
      trade.pnl = pnl;
      trade.returnPct = returnPct;
      await trade.save();
  
      // Update balance
      const user = await User.findById(userId);
      const initialCost = trade.entryPrice * trade.quantity;
      user.paperBalance = (user.paperBalance || 100000) + initialCost + pnl;
      await user.save();
  
      res.json({ data: trade, balance: user.paperBalance });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

exports.resetPaperAccount = async (req, res) => {
    try {
      const userId = req.user.id;
      await PaperTrade.deleteMany({ user: userId });
      const user = await User.findById(userId);
      user.paperBalance = 100000;
      await user.save();
      res.json({ message: 'Paper account reset', balance: user.paperBalance });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};
