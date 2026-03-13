const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
app.set('trust proxy', 1);

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://crypto-portfolio-manager-one.vercel.app',
    'https://crypto-portfolio-manager-f6jfhmd42-mohan3307s-projects.vercel.app',
    'https://crypto-portfolio-manager-wine.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('🚀 CryptoNova Backend API is running...');
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/market', require('./routes/market'));
app.use('/api/user', require('./routes/user'));

// ✅ Cached MongoDB connection (required for Vercel serverless)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("✅ MongoDB Connected");
};
connectDB().catch(err => console.log("❌ MongoDB Error:", err));

// ✅ Export app for Vercel (no app.listen)
module.exports = app;