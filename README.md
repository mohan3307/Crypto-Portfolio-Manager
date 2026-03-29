# 🚀 CryptoNova — Professional Crypto Portfolio Manager

A full-stack cryptocurrency portfolio management platform with real-time data, JWT auth, and AI price predictions.

## Tech Stack
- **Frontend**: React.js, Chart.js, Axios, React Router
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT
- **Data**: CoinMarketCap API (live prices every 30s)
- **Auth**: JWT + bcryptjs

## Quick Start

### 1. Clone & Install
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Environment Setup
Create `backend/.env`:
```
MONGO_URI=mongodb://localhost:27017/cryptonova
JWT_SECRET=your_super_secret_key_here
CMC_API_KEY=your_coinmarketcap_api_key
PORT=5000
```

### 3. Run
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

App runs at `http://localhost:3000`

## API Key
Get free CoinMarketCap API key at: https://coinmarketcap.com/api/


📊 Model Research – CryptoNova v4 Pro Terminal
1. 🔍 Overview of the Model

The CryptoNova v4 Pro Terminal is designed as an intelligent crypto trading and portfolio management system.

It combines:

Real-time market data
Technical analysis
AI-based prediction
Risk evaluation

👉 The goal of the model is to help users make smarter trading decisions instead of guessing.

2. 🧠 Type of Model Used

The system uses a hybrid analytical model, which includes:

a) 📈 Technical Indicator Model

The AI engine uses popular trading indicators:

RSI (Relative Strength Index)
EMA (Exponential Moving Average)
MACD (Moving Average Convergence Divergence)
Bollinger Bands

👉 These indicators help identify:

Overbought / Oversold conditions
Trend direction
Momentum changes
b) 🤖 AI Prediction Model

The system includes an AI Prediction Engine that:

Analyzes historical price data
Detects patterns
Predicts possible future trends

👉 Output:

Bullish signal 📈
Bearish signal 📉
Neutral signal ⚖️
c) 📊 Risk Calculation Model

The Risk Calculator:

Estimates possible profit/loss
Helps users understand trade risk before investing

👉 This reduces emotional trading and improves decision-making.

d) 📉 Correlation & Market Behavior Model
Correlation Matrix shows how coins move together
Helps in diversification strategy

👉 Example:
If Bitcoin goes up, some coins may follow — this is analyzed by the model.

3. ⚙️ Working Mechanism of the Model
Step-by-step process:
Collect live crypto data (prices, volume, trends)
Apply technical indicators (RSI, MACD, etc.)
Analyze historical patterns
Generate prediction signals
Display results on dashboard

👉 All updates happen in real-time using WebSockets (Socket.IO).

4. 📡 Data Sources Used

The model uses:

Live crypto APIs (price, volume)
News feeds (market sentiment)
User portfolio data

👉 This ensures accurate and up-to-date predictions.

5. 🧪 Model Features (From Your PPT)

Based on your file :

AI Prediction Engine with indicators
Fear & Greed Index (market sentiment)
Neural Forecasting charts
Whale Alert system (large transactions)
Market Heatmap
Strategy Hub
6. 📊 Advantages of the Model
✔️ Beginner-friendly predictions
✔️ Reduces risk using simulation (paper trading)
✔️ Real-time decision support
✔️ Combines multiple indicators (more accuracy)
✔️ All-in-one trading dashboard
7. ⚠️ Limitations of the Model
❌ Predictions are not 100% accurate
❌ Crypto market is highly volatile
❌ Depends on quality of input data
❌ Sudden news/events can affect accuracy
8. 🚀 Future Improvements
Add Machine Learning models (LSTM, Deep Learning)
Improve prediction accuracy
Add personalized trading suggestions
Integrate more global economic data
9. 🧾 Conclusion

The model used in CryptoNova v4 Pro Terminal is a powerful combination of technical analysis + AI prediction + real-time data processing.
