import React, { memo } from 'react';

const TV_SYMBOL_MAP = {
  BTC:   'BINANCE:BTCUSDT',
  ETH:   'BINANCE:ETHUSDT',
  SOL:   'BINANCE:SOLUSDT',
  BNB:   'BINANCE:BNBUSDT',
  XRP:   'BINANCE:XRPUSDT',
  DOGE:  'BINANCE:DOGEUSDT',
  ADA:   'BINANCE:ADAUSDT',
  AVAX:  'BINANCE:AVAXUSDT',
  DOT:   'BINANCE:DOTUSDT',
  POL:   'BINANCE:MATICUSDT',
  MATIC: 'BINANCE:MATICUSDT',
  LINK:  'BINANCE:LINKUSDT',
  UNI:   'BINANCE:UNIUSDT',
  ATOM:  'BINANCE:ATOMUSDT',
  LTC:   'BINANCE:LTCUSDT',
  NEAR:  'BINANCE:NEARUSDT',
  APT:   'BINANCE:APTUSDT',
  ARB:   'BINANCE:ARBUSDT',
  OP:    'BINANCE:OPUSDT',
  TON:   'BINANCE:TONUSDT',
  SHIB:  'BINANCE:SHIBUSDT',
  IMX:   'BINANCE:IMXUSDT',
  BLUR:  'BINANCE:BLURUSDT',
  SEI:   'BINANCE:SEIUSDT',
  SUI:   'BINANCE:SUIUSDT',
  ALGO:  'BINANCE:ALGOUSDT',
  FIL:   'BINANCE:FILUSDT',
  XMR:   'BINANCE:XMRUSDT',
  AAVE:  'BINANCE:AAVEUSDT',
  MKR:   'BINANCE:MKRUSDT',
  CRV:   'BINANCE:CRVUSDT',
  LDO:   'BINANCE:LDOUSDT',
  DYDX:  'BINANCE:DYDXUSDT',
  INJ:   'BINANCE:INJUSDT',
  STX:   'BINANCE:STXUSDT',
  TIA:   'BINANCE:TIAUSDT',
  WIF:   'BINANCE:WIFUSDT',
  PEPE:  'BINANCE:PEPEUSDT',
  BONK:  'BINANCE:BONKUSDT',
  FLOKI: 'BINANCE:FLOKIUSDT',
  TAO:   'BINANCE:TAOUSDT',
  KAS:   'BINANCE:KASUSDT',
  PENDLE:'BINANCE:PENDLEUSDT',
  RNDR:  'BINANCE:RNDRUSDT',
  FET:   'BINANCE:FETUSDT',
  WLD:   'BINANCE:WLDUSDT',
  JUP:   'BINANCE:JUPUSDT',
  JTO:   'BINANCE:JTOUSDT',
  PYTH:  'BINANCE:PYTHUSDT',
  AR:    'BINANCE:ARUSDT',
  GALA:  'BINANCE:GALAUSDT',
  AXS:   'BINANCE:AXSUSDT',
  SAND:  'BINANCE:SANDUSDT',
  MANA:  'BINANCE:MANAUSDT',
  CAKE:  'BINANCE:CAKEUSDT',
  '1INCH':'BINANCE:1INCHUSDT',
  LRC:   'BINANCE:LRCUSDT',
  BAT:   'BINANCE:BATUSDT',
  CHZ:   'BINANCE:CHZUSDT',
  ZIL:   'BINANCE:ZILUSDT',
  ENJ:   'BINANCE:ENJUSDT',
  VET:   'BINANCE:VETUSDT',
  THETA: 'BINANCE:THETAUSDT',
  XTZ:   'BINANCE:XTZUSDT',
  NEO:   'BINANCE:NEOUSDT',
  QTUM:  'BINANCE:QTUMUSDT',
  ICX:   'BINANCE:ICXUSDT',
  EGLD:  'BINANCE:EGLDUSDT',
  ICP:   'BINANCE:ICPUSDT',
  ETC:   'BINANCE:ETCUSDT',
  XLM:   'BINANCE:XLMUSDT',
  TRX:   'BINANCE:TRXUSDT',
  SNX:   'BINANCE:SNXUSDT',
  COMP:  'BINANCE:COMPUSDT',
  YFI:   'BINANCE:YFIUSDT',
  BAL:   'BINANCE:BALUSDT',
  OKB:   'BINANCE:OKBUSDT',
  STORJ: 'BINANCE:STORJUSDT',
  NMR:   'BINANCE:NMRUSDT',
  OCEAN: 'BINANCE:OCEANUSDT',
  ACH:   'BINANCE:ARUSDT',
};

const getTVSymbol = (symbol) => TV_SYMBOL_MAP[symbol] || `BINANCE:${symbol}USDT`;

/**
 * ── TradingView Chart Component (Iframe Method) ──────────────────────────
 * Fixed theme and symbol resolution.
 */
function TradingViewChart({ symbol = 'BTC' }) {
  const tvSymbol = getTVSymbol(symbol);
  
  // Base URL for the free advanced chart widget (most compatible)
  const baseUrl = "https://www.tradingview.com/widgetembed/";
  
  // Construct parameters
  const params = [
    `symbol=${encodeURIComponent(tvSymbol)}`,
    "interval=D",
    "hidesidetoolbar=0",
    "symboledit=1",
    "saveimage=1",
    "toolbarbg=04070d",
    "theme=dark",
    "style=1",
    "timezone=Etc%2FUTC",
    "withdateranges=1",
    "studies=%5B%5D",
    "locale=en",
    "utm_source=localhost",
    "utm_medium=widget",
    "utm_campaign=chart",
    "frameElementId=tradingview_widget"
  ];

  const fullUrl = `${baseUrl}?${params.join('&')}`;

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      minHeight: '550px', 
      background: '#04070d', 
      border: '1px solid #1a2840',
      overflow: 'hidden',
      borderRadius: '8px'
    }}>
      <iframe
        id="tradingview_widget"
        title={`TradingView Chart for ${symbol}`}
        src={fullUrl}
        style={{ width: '100%', height: '100%', border: 'none' }}
        frameBorder="0"
        allowTransparency="true"
        scrolling="no"
        allowFullScreen
      ></iframe>
    </div>
  );
}

export default memo(TradingViewChart);
