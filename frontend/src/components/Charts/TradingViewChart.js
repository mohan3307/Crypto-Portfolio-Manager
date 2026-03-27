import React, { useEffect, useRef, memo } from 'react';

const TV_SYMBOL_MAP = {
  BTC: 'BINANCE:BTCUSDT', ETH: 'BINANCE:ETHUSDT', SOL: 'BINANCE:SOLUSDT',
  BNB: 'BINANCE:BNBUSDT', XRP: 'BINANCE:XRPUSDT', DOGE: 'BINANCE:DOGEUSDT',
  ADA: 'BINANCE:ADAUSDT', AVAX: 'BINANCE:AVAXUSDT', DOT: 'BINANCE:DOTUSDT',
  POL: 'BINANCE:MATICUSDT', MATIC: 'BINANCE:MATICUSDT', LINK: 'BINANCE:LINKUSDT',
  UNI: 'BINANCE:UNIUSDT', ATOM: 'BINANCE:ATOMUSDT', LTC: 'BINANCE:LTCUSDT',
  NEAR: 'BINANCE:NEARUSDT', APT: 'BINANCE:APTUSDT', ARB: 'BINANCE:ARBUSDT',
  OP: 'BINANCE:OPUSDT', TON: 'BINANCE:TONUSDT', SHIB: 'BINANCE:SHIBUSDT',
  IMX: 'BINANCE:IMXUSDT', BLUR: 'BINANCE:BLURUSDT', SEI: 'BINANCE:SEIUSDT',
  SUI: 'BINANCE:SUIUSDT', ALGO: 'BINANCE:ALGOUSDT', FIL: 'BINANCE:FILUSDT',
  XMR: 'BINANCE:XMRUSDT', AAVE: 'BINANCE:AAVEUSDT', MKR: 'BINANCE:MKRUSDT',
  CRV: 'BINANCE:CRVUSDT', LDO: 'BINANCE:LDOUSDT', DYDX: 'BINANCE:DYDXUSDT',
  INJ: 'BINANCE:INJUSDT', STX: 'BINANCE:STXUSDT', TIA: 'BINANCE:TIAUSDT',
  WIF: 'BINANCE:WIFUSDT', PEPE: 'BINANCE:PEPEUSDT', BONK: 'BINANCE:BONKUSDT',
  FLOKI: 'BINANCE:FLOKIUSDT', TAO: 'BINANCE:TAOUSDT', KAS: 'BINANCE:KASUSDT',
  PENDLE: 'BINANCE:PENDLEUSDT', RNDR: 'BINANCE:RNDRUSDT', RENDER: 'BINANCE:RENDERUSDT',
  FET: 'BINANCE:FETUSDT', WLD: 'BINANCE:WLDUSDT', JUP: 'BINANCE:JUPUSDT',
  JTO: 'BINANCE:JTOUSDT', PYTH: 'BINANCE:PYTHUSDT', AR: 'BINANCE:ARUSDT',
  GALA: 'BINANCE:GALAUSDT', AXS: 'BINANCE:AXSUSDT', SAND: 'BINANCE:SANDUSDT',
  MANA: 'BINANCE:MANAUSDT', CAKE: 'BINANCE:CAKEUSDT', '1INCH': 'BINANCE:1INCHUSDT',
  LRC: 'BINANCE:LRCUSDT', BAT: 'BINANCE:BATUSDT', CHZ: 'BINANCE:CHZUSDT',
  ZIL: 'BINANCE:ZILUSDT', ENJ: 'BINANCE:ENJUSDT', VET: 'BINANCE:VETUSDT',
  THETA: 'BINANCE:THETAUSDT', XTZ: 'BINANCE:XTZUSDT', NEO: 'BINANCE:NEOUSDT',
  QTUM: 'BINANCE:QTUMUSDT', ICX: 'BINANCE:ICXUSDT', EGLD: 'BINANCE:EGLDUSDT',
  ICP: 'BINANCE:ICPUSDT', ETC: 'BINANCE:ETCUSDT', XLM: 'BINANCE:XLMUSDT',
  TRX: 'BINANCE:TRXUSDT', SNX: 'BINANCE:SNXUSDT', COMP: 'BINANCE:COMPUSDT',
  YFI: 'BINANCE:YFIUSDT', BAL: 'BINANCE:BALUSDT', OKB: 'BINANCE:OKBUSDT',
  STORJ: 'BINANCE:STORJUSDT', NMR: 'BINANCE:NMRUSDT', OCEAN: 'BINANCE:OCEANUSDT',
  HYPE: 'BINANCE:HYPEUSDT', BCH: 'BINANCE:BCHUSDT', HBAR: 'BINANCE:HBARUSDT',
  GRT: 'BINANCE:GRTUSDT', RAY: 'BINANCE:RAYUSDT', AERO: 'BINANCE:AEROUSDT',
};

const getTVSymbol = (symbol) => TV_SYMBOL_MAP[symbol] || `BINANCE:${symbol}USDT`;

function TradingViewChart({ symbol = 'BTC' }) {
  const containerRef = useRef(null);
  const tvSymbol = getTVSymbol(symbol);

  useEffect(() => {
    // We construct the official TradingView script injector which completely eliminates
    // iframe race conditions via strict evaluation of its inner JSON payload.
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${tvSymbol}",
        "interval": "15",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "backgroundColor": "#04070d",
        "gridColor": "#1a2840",
        "hide_top_toolbar": false,
        "hide_legend": false,
        "save_image": false,
        "calendar": false,
        "hide_volume": false,
        "support_host": "https://www.tradingview.com"
      }
    `;

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [tvSymbol]);

  return (
    <div className="tradingview-widget-container" style={{ height: '100%', width: '100%', minHeight: '500px' }}>
      <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }} ref={containerRef}></div>
    </div>
  );
}

export default memo(TradingViewChart);
