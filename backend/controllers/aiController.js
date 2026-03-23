const axios = require('axios');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');

// Note: This ideally uses a real LLM API. 
// For this environment, we will simulate a highly intelligent response 
// that can actually read the user's data if provided.

exports.askAI = async (req, res) => {
  try {
    const { message, portfolioContext } = req.body;
    const userId = req.user.id;

    let aiResponse = "";
    const msg = message.toLowerCase();

    if (msg.includes('portfolio') || msg.includes('balance') || msg.includes('holdings')) {
      const portfolio = await Portfolio.findOne({ user: userId });
      if (!portfolio || portfolio.items.length === 0) {
        aiResponse = "I've checked your portfolio, but it seems empty. You should add some assets in the Portfolio page so I can give you personalized advice!";
      } else {
        const totalValue = portfolio.items.reduce((sum, item) => sum + (item.quantity * (item.avgPrice || 0)), 0); // Mock value logic
        aiResponse = `Your portfolio currently contains ${portfolio.items.length} assets. Your total invested value is approximately $${totalValue.toFixed(2)}. I recommend diversifying more if you're heavily weighted in one coin!`;
      }
    } else if (msg.includes('performance') || msg.includes('profit')) {
        aiResponse = "Based on market trends, your top performing asset is likely Bitcoin. However, I notice some volatility in your altcoin holdings. Consider setting stop-losses for higher risk positions.";
    } else {
        aiResponse = "I'm analyzing the current market sentiment. BTC dominance is stable, but we see increased institutional interest in Ethereum L2s. This could be a good time to research ZK-rollups like Starknet or zkSync.";
    }

    res.json({ response: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAIPredictions = async (req, res) => {
  try {
    const symbols = ['BTC', 'ETH', 'SOL', 'PEPE', 'WIF', 'FET', 'NEAR'];
    const predictions = symbols.map(sym => {
      const baseProb = 50 + (Math.random() * 40); // 50-90% range
      const sentiment = Math.random() > 0.4 ? 'BULLISH' : 'BEARISH';
      const target = (Math.random() * 20 + 5).toFixed(2); // 5-25% target
      
      return {
        symbol: sym,
        trend: sentiment,
        confidence: baseProb.toFixed(1),
        targetMove: target,
        reasoning: `${sym} is showing a ${sentiment === 'BULLISH' ? 'Golden Cross' : 'Death Cross'} on the 4H timeframe with sustained whale inflow and high social volume metrics.`,
        riskReward: (1 + Math.random() * 4).toFixed(1),
        signals: [
          { name: 'MACD', value: sentiment === 'BULLISH' ? 'Pos_Divergence' : 'Neg_Divergence' },
          { name: 'RSI', value: (Math.random() > 0.5 ? 'Overbought' : 'Neutral') },
          { name: 'EMA200', value: 'Support_Hold' }
        ]
      };
    });
    
    res.json({ data: predictions, timestamp: Date.now() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
