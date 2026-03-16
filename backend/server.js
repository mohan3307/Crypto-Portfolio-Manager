const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
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
app.use('/api/ai', require('./routes/ai'));
app.use('/api/alerts', require('./routes/alerts'));

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

const marketController = require('./controllers/marketController');

// Initial cache refresh and start ticker/news simulation
marketController.refreshPriceCache(io);
marketController.startTickerSimulation(io);
marketController.startNewsSimulation(io);

// Cron job to refresh full listings cache every 30 seconds
cron.schedule('*/30 * * * * *', () => {
    marketController.refreshPriceCache(io);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;