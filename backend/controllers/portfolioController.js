const Portfolio = require('../models/Portfolio');
const { getPriceDirect } = require('./marketController');

exports.getPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: req.user._id, items: [] });
    }

    const prices = getPriceDirect();
    const enriched = portfolio.items.map(item => {
      const currentPrice = prices[item.symbol] || item.buyPrice;
      const currentValue = item.quantity * currentPrice;
      const totalInvestment = item.quantity * item.buyPrice;
      const profitLoss = currentValue - totalInvestment;
      const profitPct = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;
      return {
        _id: item._id,
        coinId: item.coinId,
        symbol: item.symbol,
        name: item.name,
        logo: item.logo || `https://s2.coinmarketcap.com/static/img/coins/64x64/${item.coinId}.png`,
        quantity: item.quantity,
        buyPrice: item.buyPrice,
        buyDate: item.buyDate,
        notes: item.notes,
        currentPrice,
        currentValue,
        totalInvestment,
        profitLoss,
        profitPct
      };
    });

    const totalValue = enriched.reduce((s, i) => s + i.currentValue, 0);
    const totalInvested = enriched.reduce((s, i) => s + i.totalInvestment, 0);
    const totalPnL = totalValue - totalInvested;
    const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    res.json({ items: enriched, summary: { totalValue, totalInvested, totalPnL, totalPnLPct } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { coinId, symbol, name, logo, quantity, buyPrice, buyDate, notes } = req.body;
    if (!coinId || !symbol || !name || !quantity || !buyPrice)
      return res.status(400).json({ error: 'Missing required fields.' });

    let portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) portfolio = await Portfolio.create({ user: req.user._id, items: [] });

    portfolio.items.push({ coinId, symbol: symbol.toUpperCase(), name, logo, quantity, buyPrice, buyDate: buyDate || Date.now(), notes });
    await portfolio.save();

    res.status(201).json({ message: 'Coin added to portfolio.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found.' });

    const item = portfolio.items.id(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found.' });

    Object.assign(item, req.body);
    await portfolio.save();
    res.json({ message: 'Updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found.' });

    portfolio.items = portfolio.items.filter(i => i._id.toString() !== itemId);
    await portfolio.save();
    res.json({ message: 'Removed from portfolio.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
