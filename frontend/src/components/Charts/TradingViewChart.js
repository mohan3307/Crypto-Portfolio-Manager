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

let tvScriptLoadingPromise;

function TradingViewChart({ symbol = 'BTC' }) {
  const containerRef = useRef(null);
  const tvSymbol = getTVSymbol(symbol);
  
  // Stable ID mapping to the symbol
  const containerId = `tv_widget_core_${symbol}`;

  useEffect(() => {
    let widgetInstance = null;
    let isMounted = true;

    const onLoadScriptRef = () => {
      if (!isMounted) return;
      if (typeof window.TradingView !== 'undefined' && containerRef.current) {
        // Clear previous runs
        containerRef.current.innerHTML = '';
        
        widgetInstance = new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: '15',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: containerRef.current.id,
        });
      }
    };

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(onLoadScriptRef);

    return () => {
      isMounted = false;
      if (widgetInstance && typeof widgetInstance.remove === 'function') {
        try {
          widgetInstance.remove();
        } catch (e) { }
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [tvSymbol]);

  return (
    <div className="tradingview-widget-container" style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}>
      <div id={containerId} ref={containerRef} style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
}

export default memo(TradingViewChart);
