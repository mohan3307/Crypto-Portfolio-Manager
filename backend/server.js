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

// ✅ CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://crypto-portfolio-manager-one.vercel.app',
    'https://crypto-portfolio-manager-wine.vercel.app',
    'https://crypto-portfolio-manager-jtvoxidbl-mohan3307s-projects.vercel.app', // ← add this
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());

// ✅ API test route
app.get('/', (req, res) => {
  res.send('🚀 CryptoNova Backend API is running...');
});

// ✅ Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/market', require('./routes/market'));
app.use('/api/user', require('./routes/user'));

// ✅ Cached MongoDB connection (important for Vercel serverless)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    isConnected = true;
    console.log("✅ MongoDB Connected");

  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
};

// ✅ Ensure DB connected before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ✅ Export for Vercel
module.exports = app;