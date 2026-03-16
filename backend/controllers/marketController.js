const axios = require('axios');

// In-memory price cache (refreshed every 30s by cron job)
let priceCache = {};
let listingCache = [];
let trendingCache = [];
let lastUpdated = null;

const CMC_BASE = 'https://pro-api.coinmarketcap.com/v1';
const CMC_KEY = process.env.CMC_API_KEY;

// ── 120+ coin mock data ────────────────────────────────────────────────────
const getMockListings = () => [
  { id: 1,     name: 'Bitcoin',           symbol: 'BTC',   rank: 1,   price: 67234.50,  change24h: 2.34,   marketCap: 1320000000000, volume24h: 28000000000 },
  { id: 1027,  name: 'Ethereum',          symbol: 'ETH',   rank: 2,   price: 3521.80,   change24h: 1.87,   marketCap: 423000000000,  volume24h: 15000000000 },
  { id: 5426,  name: 'Solana',            symbol: 'SOL',   rank: 3,   price: 178.40,    change24h: 5.23,   marketCap: 82000000000,   volume24h: 3200000000  },
  { id: 1839,  name: 'BNB',               symbol: 'BNB',   rank: 4,   price: 412.30,    change24h: -0.54,  marketCap: 62000000000,   volume24h: 1800000000  },
  { id: 52,    name: 'XRP',               symbol: 'XRP',   rank: 5,   price: 0.6234,    change24h: 3.12,   marketCap: 35000000000,   volume24h: 1200000000  },
  { id: 74,    name: 'Dogecoin',          symbol: 'DOGE',  rank: 6,   price: 0.1823,    change24h: 8.45,   marketCap: 26000000000,   volume24h: 2100000000  },
  { id: 2010,  name: 'Cardano',           symbol: 'ADA',   rank: 7,   price: 0.4523,    change24h: 1.23,   marketCap: 16000000000,   volume24h: 780000000   },
  { id: 5805,  name: 'Avalanche',         symbol: 'AVAX',  rank: 8,   price: 38.72,     change24h: 4.56,   marketCap: 16000000000,   volume24h: 890000000   },
  { id: 6636,  name: 'Polkadot',          symbol: 'DOT',   rank: 9,   price: 9.87,      change24h: -2.31,  marketCap: 12000000000,   volume24h: 450000000   },
  { id: 3890,  name: 'Polygon',           symbol: 'POL',   rank: 10,  price: 0.8934,    change24h: -1.23,  marketCap: 8000000000,    volume24h: 520000000   },
  { id: 1975,  name: 'Chainlink',         symbol: 'LINK',  rank: 11,  price: 14.56,     change24h: 3.78,   marketCap: 9000000000,    volume24h: 620000000   },
  { id: 7083,  name: 'Uniswap',           symbol: 'UNI',   rank: 12,  price: 9.23,      change24h: 2.45,   marketCap: 7000000000,    volume24h: 390000000   },
  { id: 328,   name: 'Monero',            symbol: 'XMR',   rank: 13,  price: 167.34,    change24h: -0.87,  marketCap: 3000000000,    volume24h: 120000000   },
  { id: 11419, name: 'Toncoin',           symbol: 'TON',   rank: 14,  price: 5.82,      change24h: 2.90,   marketCap: 20000000000,   volume24h: 640000000   },
  { id: 5994,  name: 'Shiba Inu',         symbol: 'SHIB',  rank: 15,  price: 0.0000245, change24h: 6.78,   marketCap: 14000000000,   volume24h: 980000000   },
  { id: 4172,  name: 'Terra Luna Classic',symbol: 'LUNC',  rank: 16,  price: 0.0001234, change24h: -3.21,  marketCap: 720000000,     volume24h: 58000000    },
  { id: 20396, name: 'Aptos',             symbol: 'APT',   rank: 17,  price: 9.45,      change24h: 3.67,   marketCap: 3900000000,    volume24h: 245000000   },
  { id: 21794, name: 'Arbitrum',          symbol: 'ARB',   rank: 18,  price: 1.23,      change24h: 1.89,   marketCap: 3200000000,    volume24h: 187000000   },
  { id: 11840, name: 'Optimism',          symbol: 'OP',    rank: 19,  price: 2.87,      change24h: 4.12,   marketCap: 3000000000,    volume24h: 210000000   },
  { id: 3408,  name: 'USD Coin',          symbol: 'USDC',  rank: 20,  price: 1.0001,    change24h: 0.01,   marketCap: 32000000000,   volume24h: 8900000000  },
  { id: 825,   name: 'Tether',            symbol: 'USDT',  rank: 21,  price: 0.9998,    change24h: 0.02,   marketCap: 118000000000,  volume24h: 67000000000 },
  { id: 6945,  name: 'Axie Infinity',     symbol: 'AXS',   rank: 22,  price: 7.34,      change24h: -1.45,  marketCap: 2400000000,    volume24h: 98000000    },
  { id: 2,     name: 'Litecoin',          symbol: 'LTC',   rank: 23,  price: 87.23,     change24h: 0.78,   marketCap: 6500000000,    volume24h: 340000000   },
  { id: 1958,  name: 'TRON',              symbol: 'TRX',   rank: 24,  price: 0.1234,    change24h: 1.56,   marketCap: 10800000000,   volume24h: 430000000   },
  { id: 512,   name: 'Stellar',           symbol: 'XLM',   rank: 25,  price: 0.1456,    change24h: 2.34,   marketCap: 4200000000,    volume24h: 178000000   },
  { id: 8916,  name: 'Internet Computer', symbol: 'ICP',   rank: 26,  price: 12.78,     change24h: 5.67,   marketCap: 6000000000,    volume24h: 290000000   },
  { id: 3957,  name: 'UNUS SED LEO',      symbol: 'LEO',   rank: 27,  price: 5.89,      change24h: 0.34,   marketCap: 5400000000,    volume24h: 12000000    },
  { id: 4030,  name: 'Algorand',          symbol: 'ALGO',  rank: 28,  price: 0.1934,    change24h: 3.45,   marketCap: 1600000000,    volume24h: 98000000    },
  { id: 2280,  name: 'Filecoin',          symbol: 'FIL',   rank: 29,  price: 5.67,      change24h: -2.34,  marketCap: 2900000000,    volume24h: 187000000   },
  { id: 6538,  name: 'Cosmos',            symbol: 'ATOM',  rank: 30,  price: 8.92,      change24h: 1.23,   marketCap: 3500000000,    volume24h: 234000000   },
  { id: 3077,  name: 'VeChain',           symbol: 'VET',   rank: 31,  price: 0.0378,    change24h: 2.67,   marketCap: 2700000000,    volume24h: 145000000   },
  { id: 7278,  name: 'Aave',              symbol: 'AAVE',  rank: 32,  price: 98.45,     change24h: 4.23,   marketCap: 1500000000,    volume24h: 210000000   },
  { id: 5647,  name: 'Theta Network',     symbol: 'THETA', rank: 33,  price: 1.92,      change24h: -0.45,  marketCap: 1900000000,    volume24h: 87000000    },
  { id: 2011,  name: 'Tezos',             symbol: 'XTZ',   rank: 34,  price: 0.8934,    change24h: 1.89,   marketCap: 830000000,     volume24h: 45000000    },
  { id: 6758,  name: 'Elrond',            symbol: 'EGLD',  rank: 35,  price: 34.56,     change24h: 3.12,   marketCap: 870000000,     volume24h: 56000000    },
  { id: 7653,  name: 'Oasis Network',     symbol: 'ROSE',  rank: 36,  price: 0.0934,    change24h: -1.23,  marketCap: 570000000,     volume24h: 34000000    },
  { id: 4847,  name: 'Helium',            symbol: 'HNT',   rank: 37,  price: 6.23,      change24h: 2.78,   marketCap: 980000000,     volume24h: 67000000    },
  { id: 4705,  name: 'PAX Gold',          symbol: 'PAXG',  rank: 38,  price: 2389.00,   change24h: 0.56,   marketCap: 590000000,     volume24h: 23000000    },
  { id: 9816,  name: 'Immutable',         symbol: 'IMX',   rank: 39,  price: 1.87,      change24h: 5.34,   marketCap: 2700000000,    volume24h: 198000000   },
  { id: 16086, name: 'Blur',              symbol: 'BLUR',  rank: 40,  price: 0.2134,    change24h: 7.89,   marketCap: 650000000,     volume24h: 123000000   },
  { id: 27075, name: 'Sei',               symbol: 'SEI',   rank: 41,  price: 0.4523,    change24h: 6.12,   marketCap: 1900000000,    volume24h: 234000000   },
  { id: 22861, name: 'Sui',               symbol: 'SUI',   rank: 42,  price: 1.34,      change24h: 8.23,   marketCap: 3400000000,    volume24h: 567000000   },
  { id: 11367, name: 'FTX Token',         symbol: 'FTT',   rank: 43,  price: 1.23,      change24h: -5.67,  marketCap: 400000000,     volume24h: 45000000    },
  { id: 6210,  name: 'Sandbox',           symbol: 'SAND',  rank: 44,  price: 0.4123,    change24h: 3.45,   marketCap: 870000000,     volume24h: 98000000    },
  { id: 5765,  name: 'Decentraland',      symbol: 'MANA',  rank: 45,  price: 0.3234,    change24h: 2.34,   marketCap: 600000000,     volume24h: 67000000    },
  { id: 8000,  name: 'Lido DAO',          symbol: 'LDO',   rank: 46,  price: 1.89,      change24h: 4.56,   marketCap: 1700000000,    volume24h: 145000000   },
  { id: 9903,  name: 'Apecoin',           symbol: 'APE',   rank: 47,  price: 1.12,      change24h: -2.34,  marketCap: 420000000,     volume24h: 56000000    },
  { id: 3718,  name: 'BitTorrent',        symbol: 'BTT',   rank: 48,  price: 0.00000123,change24h: 1.23,   marketCap: 1200000000,    volume24h: 87000000    },
  { id: 2502,  name: 'Huobi Token',       symbol: 'HT',    rank: 49,  price: 2.78,      change24h: -0.89,  marketCap: 450000000,     volume24h: 23000000    },
  { id: 4066,  name: 'Chiliz',            symbol: 'CHZ',   rank: 50,  price: 0.0934,    change24h: 5.67,   marketCap: 900000000,     volume24h: 145000000   },
  { id: 1697,  name: 'Basic Attention',   symbol: 'BAT',   rank: 51,  price: 0.2134,    change24h: 2.12,   marketCap: 320000000,     volume24h: 34000000    },
  { id: 3602,  name: 'Bitcoin SV',        symbol: 'BSV',   rank: 52,  price: 48.23,     change24h: -1.45,  marketCap: 930000000,     volume24h: 45000000    },
  { id: 1321,  name: 'Ethereum Classic',  symbol: 'ETC',   rank: 53,  price: 23.45,     change24h: 0.67,   marketCap: 3100000000,    volume24h: 178000000   },
  { id: 4023,  name: 'Reserve Rights',    symbol: 'RSR',   rank: 54,  price: 0.0789,    change24h: 3.89,   marketCap: 780000000,     volume24h: 98000000    },
  { id: 2700,  name: 'Celsius',           symbol: 'CEL',   rank: 55,  price: 0.1234,    change24h: -8.90,  marketCap: 230000000,     volume24h: 12000000    },
  { id: 3513,  name: 'GateToken',         symbol: 'GT',    rank: 56,  price: 6.78,      change24h: 1.23,   marketCap: 680000000,     volume24h: 34000000    },
  { id: 2586,  name: 'SynthetixNetworkToken', symbol: 'SNX', rank: 57, price: 2.89,    change24h: 5.67,   marketCap: 940000000,     volume24h: 123000000   },
  { id: 7226,  name: 'Yearn Finance',     symbol: 'YFI',   rank: 58,  price: 5678.00,   change24h: 2.34,   marketCap: 200000000,     volume24h: 23000000    },
  { id: 4256,  name: 'KuCoin Token',      symbol: 'KCS',   rank: 59,  price: 8.23,      change24h: 0.78,   marketCap: 760000000,     volume24h: 12000000    },
  { id: 3408,  name: 'Compound',          symbol: 'COMP',  rank: 60,  price: 56.78,     change24h: 3.45,   marketCap: 420000000,     volume24h: 34000000    },
  { id: 2099,  name: 'Icon',              symbol: 'ICX',   rank: 61,  price: 0.2345,    change24h: 4.56,   marketCap: 340000000,     volume24h: 23000000    },
  { id: 1996,  name: 'Qtum',              symbol: 'QTUM',  rank: 62,  price: 3.45,      change24h: 1.23,   marketCap: 320000000,     volume24h: 45000000    },
  { id: 1684,  name: 'Zilliqa',           symbol: 'ZIL',   rank: 63,  price: 0.0245,    change24h: 2.34,   marketCap: 370000000,     volume24h: 34000000    },
  { id: 5176,  name: 'Ontology',          symbol: 'ONT',   rank: 64,  price: 0.2134,    change24h: -1.23,  marketCap: 190000000,     volume24h: 23000000    },
  { id: 3911,  name: 'Ocean Protocol',    symbol: 'OCEAN', rank: 65,  price: 0.6234,    change24h: 7.89,   marketCap: 430000000,     volume24h: 98000000    },
  { id: 2130,  name: 'Enjin Coin',        symbol: 'ENJ',   rank: 66,  price: 0.3456,    change24h: 3.45,   marketCap: 360000000,     volume24h: 45000000    },
  { id: 1376,  name: 'Neo',               symbol: 'NEO',   rank: 67,  price: 11.23,     change24h: 2.34,   marketCap: 790000000,     volume24h: 56000000    },
  { id: 2405,  name: 'IOTA',              symbol: 'MIOTA', rank: 68,  price: 0.1934,    change24h: 0.89,   marketCap: 540000000,     volume24h: 23000000    },
  { id: 3306,  name: 'Pancakeswap',       symbol: 'CAKE',  rank: 69,  price: 2.89,      change24h: 4.56,   marketCap: 810000000,     volume24h: 123000000   },
  { id: 6841,  name: '1inch Network',     symbol: '1INCH', rank: 70,  price: 0.3789,    change24h: 5.67,   marketCap: 360000000,     volume24h: 98000000    },
  { id: 9481,  name: 'dYdX',              symbol: 'DYDX',  rank: 71,  price: 1.78,      change24h: 6.78,   marketCap: 630000000,     volume24h: 145000000   },
  { id: 11887, name: 'EverGrow Coin',     symbol: 'EGC',   rank: 72,  price: 0.0000321, change24h: -3.45,  marketCap: 123000000,     volume24h: 8900000     },
  { id: 7461,  name: 'Curve DAO Token',   symbol: 'CRV',   rank: 73,  price: 0.4512,    change24h: 3.21,   marketCap: 590000000,     volume24h: 87000000    },
  { id: 4943,  name: 'Maker',             symbol: 'MKR',   rank: 74,  price: 1890.00,   change24h: 2.34,   marketCap: 1700000000,    volume24h: 78000000    },
  { id: 5728,  name: 'Balancer',          symbol: 'BAL',   rank: 75,  price: 4.23,      change24h: 5.67,   marketCap: 200000000,     volume24h: 23000000    },
  { id: 3945,  name: 'Render',            symbol: 'RNDR',  rank: 76,  price: 7.89,      change24h: 9.23,   marketCap: 3800000000,    volume24h: 456000000   },
  { id: 18876, name: 'Fetch.ai',          symbol: 'FET',   rank: 77,  price: 1.67,      change24h: 12.34,  marketCap: 1400000000,    volume24h: 234000000   },
  { id: 21259, name: 'Worldcoin',         symbol: 'WLD',   rank: 78,  price: 4.56,      change24h: 8.90,   marketCap: 760000000,     volume24h: 178000000   },
  { id: 28301, name: 'Pyth Network',      symbol: 'PYTH',  rank: 79,  price: 0.3456,    change24h: 6.78,   marketCap: 1200000000,    volume24h: 198000000   },
  { id: 28752, name: 'Jupiter',           symbol: 'JUP',   rank: 80,  price: 0.9234,    change24h: 5.45,   marketCap: 1300000000,    volume24h: 234000000   },
  { id: 25028, name: 'Stacks',            symbol: 'STX',   rank: 81,  price: 1.89,      change24h: 4.23,   marketCap: 2800000000,    volume24h: 189000000   },
  { id: 24478, name: 'Celestia',          symbol: 'TIA',   rank: 82,  price: 9.78,      change24h: 7.89,   marketCap: 1800000000,    volume24h: 345000000   },
  { id: 29814, name: 'Wormhole',          symbol: 'W',     rank: 83,  price: 0.2345,    change24h: 3.56,   marketCap: 760000000,     volume24h: 145000000   },
  { id: 30171, name: 'Notcoin',           symbol: 'NOT',   rank: 84,  price: 0.0078,    change24h: 15.67,  marketCap: 780000000,     volume24h: 456000000   },
  { id: 28176, name: 'Beam',              symbol: 'BEAM',  rank: 85,  price: 0.0234,    change24h: 11.23,  marketCap: 540000000,     volume24h: 89000000    },
  { id: 29743, name: 'Degen',             symbol: 'DEGEN', rank: 86,  price: 0.0123,    change24h: 18.90,  marketCap: 320000000,     volume24h: 123000000   },
  { id: 27613, name: 'Pepe',              symbol: 'PEPE',  rank: 87,  price: 0.00001234,change24h: 22.45,  marketCap: 5200000000,    volume24h: 1800000000  },
  { id: 28004, name: 'Bonk',              symbol: 'BONK',  rank: 88,  price: 0.00002345,change24h: 16.78,  marketCap: 1600000000,    volume24h: 890000000   },
  { id: 29613, name: 'dogwifhat',         symbol: 'WIF',   rank: 89,  price: 2.89,      change24h: 19.34,  marketCap: 2900000000,    volume24h: 1200000000  },
  { id: 30049, name: 'Brett',             symbol: 'BRETT', rank: 90,  price: 0.1234,    change24h: 14.56,  marketCap: 1200000000,    volume24h: 345000000   },
  { id: 29874, name: 'Floki',             symbol: 'FLOKI', rank: 91,  price: 0.0001789, change24h: 9.78,   marketCap: 1700000000,    volume24h: 456000000   },
  { id: 11841, name: 'Bittensor',         symbol: 'TAO',   rank: 92,  price: 321.00,    change24h: 7.23,   marketCap: 2100000000,    volume24h: 234000000   },
  { id: 22974, name: 'Injective',         symbol: 'INJ',   rank: 93,  price: 23.45,     change24h: 6.78,   marketCap: 2200000000,    volume24h: 345000000   },
  { id: 16352, name: 'Kaspa',             symbol: 'KAS',   rank: 94,  price: 0.1345,    change24h: 5.67,   marketCap: 3200000000,    volume24h: 290000000   },
  { id: 27833, name: 'Jito',              symbol: 'JTO',   rank: 95,  price: 2.78,      change24h: 8.90,   marketCap: 780000000,     volume24h: 165000000   },
  { id: 29389, name: 'Mantle',            symbol: 'MNT',   rank: 96,  price: 0.8934,    change24h: 4.56,   marketCap: 2800000000,    volume24h: 198000000   },
  { id: 26081, name: 'Pendle',            symbol: 'PENDLE',rank: 97,  price: 5.67,      change24h: 11.23,  marketCap: 760000000,     volume24h: 123000000   },
  { id: 21260, name: 'Blur',              symbol: 'BLUR2', rank: 98,  price: 0.1789,    change24h: 7.89,   marketCap: 450000000,     volume24h: 78000000    },
  { id: 7129,  name: 'Ren',               symbol: 'REN',   rank: 99,  price: 0.0567,    change24h: 2.34,   marketCap: 57000000,      volume24h: 12000000    },
  { id: 3155,  name: 'Quant',             symbol: 'QNT',   rank: 100, price: 89.23,     change24h: 3.45,   marketCap: 1100000000,    volume24h: 56000000    },
  { id: 2416,  name: 'Theta Fuel',        symbol: 'TFUEL', rank: 101, price: 0.0893,    change24h: 1.23,   marketCap: 450000000,     volume24h: 34000000    },
  { id: 3814,  name: 'Ampleforth',        symbol: 'AMPL',  rank: 102, price: 1.12,      change24h: 0.56,   marketCap: 60000000,      volume24h: 5600000     },
  { id: 13855, name: 'Moonbeam',          symbol: 'GLMR',  rank: 103, price: 0.1234,    change24h: 2.34,   marketCap: 310000000,     volume24h: 23000000    },
  { id: 12999, name: 'Flux',              symbol: 'FLUX',  rank: 104, price: 0.5678,    change24h: 4.56,   marketCap: 360000000,     volume24h: 45000000    },
  { id: 10791, name: 'Astar',             symbol: 'ASTR',  rank: 105, price: 0.0789,    change24h: 3.45,   marketCap: 390000000,     volume24h: 34000000    },
  { id: 4556,  name: 'iExec RLC',         symbol: 'RLC',   rank: 106, price: 1.89,      change24h: 5.67,   marketCap: 190000000,     volume24h: 23000000    },
  { id: 8646,  name: 'Livepeer',          symbol: 'LPT',   rank: 107, price: 11.23,     change24h: 6.78,   marketCap: 340000000,     volume24h: 34000000    },
  { id: 5692,  name: 'Storj',             symbol: 'STORJ', rank: 108, price: 0.4512,    change24h: 3.45,   marketCap: 180000000,     volume24h: 23000000    },
  { id: 28669, name: 'NEAR Protocol',     symbol: 'NEAR',  rank: 109, price: 6.78,      change24h: 4.56,   marketCap: 7200000000,    volume24h: 389000000   },
  { id: 6783,  name: 'Akash Network',     symbol: 'AKT',   rank: 110, price: 3.45,      change24h: 8.90,   marketCap: 870000000,     volume24h: 123000000   },
  { id: 7431,  name: 'Numeraire',         symbol: 'NMR',   rank: 111, price: 15.67,     change24h: 5.67,   marketCap: 180000000,     volume24h: 12000000    },
  { id: 7725,  name: 'Spell Token',       symbol: 'SPELL', rank: 112, price: 0.00345,   change24h: 4.56,   marketCap: 90000000,      volume24h: 8900000     },
  { id: 9104,  name: 'Gala',              symbol: 'GALA',  rank: 113, price: 0.0345,    change24h: 7.89,   marketCap: 1200000000,    volume24h: 198000000   },
  { id: 3897,  name: 'OKB',               symbol: 'OKB',   rank: 114, price: 43.21,     change24h: 1.23,   marketCap: 2600000000,    volume24h: 89000000    },
  { id: 7186,  name: 'Loopring',          symbol: 'LRC',   rank: 115, price: 0.2134,    change24h: 2.34,   marketCap: 280000000,     volume24h: 34000000    },
  { id: 1518,  name: 'Gnosis',            symbol: 'GNO',   rank: 116, price: 234.00,    change24h: 3.45,   marketCap: 280000000,     volume24h: 12000000    },
  { id: 4151,  name: 'Komodo',            symbol: 'KMD',   rank: 117, price: 0.3456,    change24h: 1.89,   marketCap: 56000000,      volume24h: 5600000     },
  { id: 4039,  name: 'Civic',             symbol: 'CVC',   rank: 118, price: 0.1234,    change24h: 3.45,   marketCap: 120000000,     volume24h: 12000000    },
  { id: 5740,  name: 'Steem',             symbol: 'STEEM', rank: 119, price: 0.2345,    change24h: 2.34,   marketCap: 87000000,      volume24h: 5600000     },
  { id: 3794,  name: 'Arweave',           symbol: 'AR',    rank: 120, price: 23.45,     change24h: 9.78,   marketCap: 1500000000,    volume24h: 234000000   },
].map(coin => ({
  ...coin,
  logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`
}));

// Add small random fluctuation to simulate live prices
const fluctuate = (price) => {
  const pct = (Math.random() - 0.5) * 0.002; // ±0.1%
  return parseFloat((price * (1 + pct)).toFixed(8));
};

exports.refreshPriceCache = async (io) => {
  try {
    if (!CMC_KEY || CMC_KEY === 'your_coinmarketcap_api_key_here') {
      // Use mock data with fluctuation
      if (listingCache.length === 0) {
        listingCache = getMockListings();
      } else {
        listingCache = listingCache.map(c => ({
          ...c,
          price: fluctuate(c.price),
          change24h: c.change24h + (Math.random() - 0.5) * 0.1
        }));
      }
      priceCache = {};
      listingCache.forEach(c => { priceCache[c.symbol] = c.price; });
      lastUpdated = new Date();
      
      // Broadcast to all connected clients
      if (io) {
        io.emit('priceUpdate', { listingCache, lastUpdated });
      }
      return;
    }

    const res = await axios.get(`${CMC_BASE}/cryptocurrency/listings/latest`, {
      headers: { 'X-CMC_PRO_API_KEY': CMC_KEY },
      params: { limit: 200, convert: 'USD' }
    });

    listingCache = res.data.data.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      rank: coin.cmc_rank,
      price: coin.quote.USD.price,
      change24h: coin.quote.USD.percent_change_24h,
      change7d: coin.quote.USD.percent_change_7d,
      marketCap: coin.quote.USD.market_cap,
      volume24h: coin.quote.USD.volume_24h,
      logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`
    }));

    priceCache = {};
    listingCache.forEach(c => { priceCache[c.symbol] = c.price; });
    lastUpdated = new Date();

    // Broadcast to all connected clients
    // Broadcast the full refresh
    io.emit('priceUpdate', { data: priceCache, lastUpdated: lastUpdated });
    console.log(`[Market] Cache refreshed at ${lastUpdated.toLocaleTimeString()}. Broadcasted to clients.`);
    
    // Check for triggered alerts
    checkGlobalAlerts(io);
  } catch (error) {
    console.error('Error refreshing price cache:', error);
  }
};

const Alert = require('../models/Alert');
const checkGlobalAlerts = async (io) => {
  try {
    const activeAlerts = await Alert.find({ active: true, triggered: false });
    if (activeAlerts.length === 0) return;

    for (const alert of activeAlerts) {
      const currentPrice = priceCache[alert.symbol];
      if (!currentPrice) continue;

      let triggered = false;
      if (alert.type === 'above' && currentPrice >= alert.value) triggered = true;
      if (alert.type === 'below' && currentPrice <= alert.value) triggered = true;

      if (triggered) {
        alert.triggered = true;
        alert.triggeredPrice = currentPrice;
        alert.triggeredAt = new Date();
        alert.active = false;
        await alert.save();

        // Push to specific user via socket room or broadcast globally if simple
        // For simplicity in this demo, we broadcast to all, but include userId
        io.emit('priceAlertTriggered', {
          userId: alert.userId,
          alertId: alert._id,
          message: `🚨 ${alert.coinName} crossed ${alert.type === 'above' ? 'ABOVE' : 'BELOW'} $${alert.value.toLocaleString()}`,
          symbol: alert.symbol,
          price: currentPrice
        });
      }
    }
  } catch (err) {
    console.error('Alert checker error:', err);
  }
};

// --- Real-time Ticker & Alert Simulation ---
// In a real app, this would be wired to a high-frequency websocket feed (e.g. Binance)
// Here, we simulate micro-fluctuations every 3 seconds for a "Pro" feel.

exports.startTickerSimulation = (io) => {
  setInterval(() => {
    if (Object.keys(priceCache).length === 0) return;
    
    // Select 3 top coins to "flit" prices
    const activeSymbols = ['BTC', 'ETH', 'SOL'];
    const microUpdates = {};
    
    activeSymbols.forEach(sym => {
        const basePrice = priceCache[sym];
        if (basePrice) {
            // Apply 0.01% - 0.05% fluctuation
            const change = 1 + (Math.random() - 0.5) * 0.001;
            microUpdates[sym] = basePrice * change;
        }
    });

    if (Object.keys(microUpdates).length > 0) {
        io.emit('tickerUpdate', microUpdates);
        checkGlobalAlerts(io);
    }
  }, 3000);

  // Sporadic Whale Alerts (simulated every 45-90 seconds)
  const sendWhaleAlert = () => {
    const symbols = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'PEPE'];
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    const amount = (Math.random() * 50 + 10).toFixed(1);
    const value = (amount * 50000).toLocaleString(); // Rough estimate
    const alert = {
        symbol: sym,
        amount: amount,
        value: value,
        from: "Unknown Wallet",
        to: "Binance",
        time: new Date().toLocaleTimeString()
    };
    io.emit('whaleAlert', alert);
    
    // Schedule next
    setTimeout(sendWhaleAlert, 45000 + Math.random() * 45000);
  };

  // Liquidation Map Simulation (high frequency)
  const sendLiquidation = () => {
    const symbols = ['BTC', 'ETH', 'SOL', 'PEPE', 'WIF'];
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    const sides = ['long', 'short'];
    const side = sides[Math.floor(Math.random() * sides.length)];
    const amount = (Math.random() * 200000 + 5000).toFixed(0);
    
    io.emit('liquidationUpdate', {
      symbol: sym,
      side: side,
      amount: parseInt(amount),
      price: priceCache[sym] || 0,
      timestamp: Date.now()
    });

    const nextDelay = 3000 + Math.random() * 7000;
    setTimeout(sendLiquidation, nextDelay);
  };
  
  setTimeout(sendWhaleAlert, 30000);
  setTimeout(sendLiquidation, 10000);
};

const NEWS_POOL = [
  { headline: 'Bitcoin surges past $70K as institutional demand continues to grow', sentiment: 'bullish', coin: 'BTC' },
  { headline: 'Ethereum Layer-2 TVL hits all-time high of $45 billion', sentiment: 'bullish', coin: 'ETH' },
  { headline: 'SEC approves three more spot Bitcoin ETF applications from major funds', sentiment: 'bullish', coin: 'BTC' },
  { headline: 'Solana decentralized exchanges surpass $50B monthly trading volume', sentiment: 'bullish', coin: 'SOL' },
  { headline: 'PEPE and DOGE lead meme coin rally with 20%+ gains in 24 hours', sentiment: 'bullish', coin: 'PEPE' },
  { headline: 'Federal Reserve signals potential rate cuts — boosting risk assets', sentiment: 'bullish', coin: 'MACRO' },
  { headline: 'Ripple wins major legal battle; XRP surges 8% on the news', sentiment: 'bullish', coin: 'XRP' },
  { headline: 'MicroStrategy increases Bitcoin holdings to 200,000 BTC', sentiment: 'bullish', coin: 'BTC' },
  { headline: 'Chainlink CCIP mainnet sees explosive DeFi protocol adoption', sentiment: 'bullish', coin: 'LINK' },
  { headline: 'Binance reports record $120B monthly trading volume for Q1 2025', sentiment: 'bullish', coin: 'BNB' },
  { headline: 'TON blockchain onboards 200 million Telegram users to Web3', sentiment: 'bullish', coin: 'TON' },
  { headline: 'Bitcoin mining difficulty hits new ATH as hashrate surges', sentiment: 'neutral', coin: 'BTC' },
  { headline: 'Altcoin season index hits 78 — all coins outperforming Bitcoin', sentiment: 'bullish', coin: 'ALT' },
  { headline: 'Ethereum gas fees average 3 gwei in record low congestion period', sentiment: 'bullish', coin: 'ETH' },
  { headline: 'Avalanche announces $100M DeFi ecosystem grants program', sentiment: 'bullish', coin: 'AVAX' },
  { headline: 'NFT market sees revival with 42% volume increase week-over-week', sentiment: 'bullish', coin: 'NFT' },
  { headline: 'Dogecoin whale accumulates $300M position ahead of DOGE ETF news', sentiment: 'bullish', coin: 'DOGE' },
  { headline: 'Render Network surges 15% on AI compute demand boom', sentiment: 'bullish', coin: 'RNDR' },
  { headline: 'Galaxy Digital reports $2.1B crypto VC funding in Q1 2025', sentiment: 'bullish', coin: 'VC' },
];

exports.startNewsSimulation = (io) => {
  const sendRandomNews = () => {
    const item = NEWS_POOL[Math.floor(Math.random() * NEWS_POOL.length)];
    const news = {
      ...item,
      time: 'Just now',
      timestamp: Date.now()
    };
    io.emit('newsUpdate', news);
    
    // Schedule next news in 15-30 seconds
    const delay = 15000 + Math.random() * 15000;
    setTimeout(sendRandomNews, delay);
  };
  
  // Initial delay
  setTimeout(sendRandomNews, 5000);
};

exports.getListings = async (req, res) => {
  try {
    if (listingCache.length === 0) await exports.refreshPriceCache();
    res.json({ data: listingCache, lastUpdated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTrending = async (req, res) => {
  try {
    if (listingCache.length === 0) await exports.refreshPriceCache();
    const sorted = [...listingCache].sort((a, b) => b.change24h - a.change24h);
    res.json({
      topGainers: sorted.slice(0, 10),
      topLosers: sorted.slice(-10).reverse(),
      mostTraded: [...listingCache].sort((a, b) => b.volume24h - a.volume24h).slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPrices = async (req, res) => {
  try {
    if (Object.keys(priceCache).length === 0) await exports.refreshPriceCache();
    const { symbols } = req.query;
    if (symbols) {
      const syms = symbols.split(',').map(s => s.toUpperCase());
      const result = {};
      syms.forEach(s => { result[s] = priceCache[s] || null; });
      return res.json({ prices: result, lastUpdated });
    }
    res.json({ prices: priceCache, lastUpdated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChartData = async (req, res) => {
  try {
    const { symbol, timeframe = '24h' } = req.params;
    const coin = listingCache.find(c => c.symbol.toUpperCase() === symbol.toUpperCase());
    const basePrice = coin ? coin.price : 100;

    const points = timeframe === '1h' ? 60 : timeframe === '4h' ? 240 : timeframe === '24h' ? 96 : timeframe === '7d' ? 168 : timeframe === '30d' ? 720 : 2160;
    const now = Date.now();
    const intervalMs = timeframe === '1h' ? 60000 : timeframe === '4h' ? 60000 : timeframe === '24h' ? 900000 : timeframe === '7d' ? 3600000 : 3600000;

    let price = basePrice * (0.85 + Math.random() * 0.1);
    const chartData = [];
    for (let i = points; i >= 0; i--) {
      const trend = (Math.random() - 0.47) * 0.018;
      price = price * (1 + trend);
      chartData.push({ time: new Date(now - i * intervalMs).toISOString(), price: parseFloat(price.toFixed(8)) });
    }

    res.json({ symbol, timeframe, data: chartData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPriceDirect = () => priceCache;
