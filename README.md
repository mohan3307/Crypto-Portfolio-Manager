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
