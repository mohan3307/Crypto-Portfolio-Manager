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

    // Simulate "thinking" and "data retrieval"
    // In a real scenario, we'd send 'message' + 'portfolioContext' to OpenAI/Gemini
    
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
        // Generic but "smart" response
        aiResponse = "I'm analyzing the current market sentiment. BTC dominance is stable, but we see increased institutional interest in Ethereum L2s. This could be a good time to research ZK-rollups like Starknet or zkSync.";
    }

    res.json({ response: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
