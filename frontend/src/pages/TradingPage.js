import React, { useState, useEffect, useRef } from 'react';
import TradingViewChart from '../components/Charts/TradingViewChart';
import ExecutionBlade from '../components/Tools/ExecutionBlade';
import AIPredictionPanel from '../components/Charts/AIPredictionPanel';
import OrderBook from '../components/Charts/OrderBook';
import TickerTape from '../components/Charts/TickerTape';
import { getChartData } from '../services/api';
import { useMarket } from '../context/MarketContext';
import { formatCurrency, formatPercent } from '../utils/format';

const COIN_COLORS = {
  BTC:'#f7931a', ETH:'#627eea', SOL:'#9945ff', BNB:'#f0b90b',
  XRP:'#346aa9', DOGE:'#c2a633', ADA:'#0033ad', DOT:'#e6007a',
  AVAX:'#e84142', MATIC:'#8247e5', POL:'#8247e5', LINK:'#375bd2',
  UNI:'#ff007a', ATOM:'#6f7390', LTC:'#bfbbbb', NEAR:'#00c08b',
  APT:'#29c0b4', ARB:'#28a0f0', OP:'#ff0420', TON:'#0098ea',
  SHIB:'#ffa409', LUNC:'#e8a44a', IMX:'#00d0b4', BLUR:'#ff5c5c',
  SEI:'#9a4f9a', SUI:'#4da2ff', ALGO:'#00b4d8', FIL:'#0090ff',
  XMR:'#ff6600', MANA:'#ff2d55', SAND:'#04d9ff', ICP:'#29abe2',
  VET:'#15bdff', THETA:'#2ab8e6', XTZ:'#a8e000', EGLD:'#23f7dd',
  GALA:'#01a1ff', AXS:'#0055d5', AAVE:'#b6509e', YFI:'#006ae3',
  COMP:'#00d395', MKR:'#1aab9b', SNX:'#5fcdf9', CRV:'#fd0000',
  LDO:'#f27c7c', DYDX:'#7547ff', LRC:'#1c60ff', STX:'#5546ff',
  TIA:'#7b2bf9', PYTH:'#9945ff', JUP:'#22d3ee', INJ:'#0098ea',
  KAS:'#49dafe', TAO:'#00c0a3', AR:'#1a1a1a', PENDLE:'#5acbd8',
  RENDER:'#0af', RNDR:'#0af', FET:'#1a1a2e', OCEAN:'#7b2ff7',
  FLOKI:'#f7a600', BONK:'#f7731a', WIF:'#d67a2c', PEPE:'#469c46',
  WLD:'#4286f4', BAT:'#ff5000', ZIL:'#29ccc4', ENJ:'#7866d5',
  CHZ:'#cd0124', CAKE:'#d1884f', '1INCH':'#94a8c5', NEO:'#58bf00',
  BTT:'#cc0000', KCS:'#0093dd', QTUM:'#2e9ad0', ICX:'#1fc5c9',
  STORJ:'#2683ff', LPT:'#00b0aa', OKB:'#2b60e1', ETC:'#328332',
  XLM:'#0c2d5e', TRX:'#ff0013', USDC:'#2775ca', USDT:'#26a17b',
  APE:'#0043ce', HBAR:'#00a0ff', GRT:'#6f4cff', BCH:'#8dc351',
};

const DEFAULT_WATCH = ['BTC','ETH','SOL','BNB','PEPE','SUI','NEAR','INJ'];

export default function TradingPage() {
  const { listings: liveListings } = useMarket();
  const [listings, setListings]     = useState([]);
  const [selected, setSelected]     = useState(null);
  const [prices7d, setPrices7d]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [watchSyms, setWatchSyms]   = useState(DEFAULT_WATCH);
  const [rightTab, setRightTab]     = useState('exec');
  const [showLeft, setShowLeft]     = useState(true);
  const [showRight, setShowRight]   = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapRef = useRef(null);

  /* ── data ── */
  useEffect(() => {
    if (liveListings && liveListings.length > 0) {
      setListings(liveListings);
      if (!selected) setSelected(liveListings[0]);
      else {
        const fresh = liveListings.find(c => c.symbol === selected.symbol);
        if (fresh) setSelected(fresh);
      }
      setLoading(false);
    }
  }, [liveListings, selected?.symbol]);

  useEffect(() => {
    if (!selected) return;
    getChartData(selected.symbol, '7d')
      .then(r => setPrices7d(r.data.data.map(d => d.price)))
      .catch(() => {});
  }, [selected?.symbol]);

  /* ── fullscreen ── */
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const el = wrapRef.current || document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleWatch = s => setWatchSyms(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const watchCoins  = listings.filter(c => watchSyms.includes(c.symbol));
  const otherCoins  = listings.filter(c => !watchSyms.includes(c.symbol));
  const searchRes   = search
    ? listings.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 50)
    : null;

  const coinColor = selected ? (COIN_COLORS[selected.symbol] || '#3b82f6') : '#3b82f6';
  const chgPositive = (selected?.change24h ?? 0) >= 0;

  if (loading) return (
    <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#000' }}>
      <div className="lt-spinner" />
      <div style={{ marginTop:12, fontSize:10, letterSpacing:3, color:'#3d5470' }}>INITIALIZING TERMINAL...</div>
    </div>
  );

  /* ── layout widths ── */
  const LEFT_W  = showLeft  ? 220 : 0;
  const RIGHT_W = showRight ? 340 : 0;

  return (
    <div ref={wrapRef} className="lt-root">

      {/* ══ TICKER TAPE ══ */}
      <TickerTape listings={listings} />

      {/* ══ TOP COMMAND BAR ══ */}
      <div className="lt-topbar">
        {/* Left: collapse toggle + asset info */}
        <div className="lt-topbar-left">
          <button className={`lt-icon-btn ${showLeft ? 'active' : ''}`} onClick={() => setShowLeft(v => !v)} title="Toggle Asset Panel">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="2" width="5" height="12" rx="1" fill="currentColor" opacity={showLeft ? 1 : 0.4}/>
              <rect x="8" y="2" width="7" height="2" rx="1" fill="currentColor"/>
              <rect x="8" y="7" width="7" height="2" rx="1" fill="currentColor"/>
              <rect x="8" y="12" width="7" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>

          {selected && (
            <div className="lt-asset-badge">
              <img src={selected.logo} alt={selected.symbol} className="lt-asset-logo" />
              <div>
                <div className="lt-asset-pair">{selected.symbol}<span>/USDT</span></div>
                <div className="lt-asset-name">{selected.name}</div>
              </div>
              <div className="lt-asset-price" style={{ color: coinColor }}>
                {formatCurrency(selected.price)}
              </div>
              <div className={`lt-asset-chg ${chgPositive ? 'up' : 'dn'}`}>
                {chgPositive ? '▲' : '▼'} {Math.abs(selected.change24h).toFixed(2)}%
              </div>
              <div className="lt-divider-v" />
              <div className="lt-stat"><span>MCap</span>{formatCurrency(selected.marketCap).split('.')[0]}</div>
            </div>
          )}
        </div>

        {/* Right: right-tab buttons + actions */}
        <div className="lt-topbar-right">
          {/* Right panel tab selector */}
          <div className="lt-tab-group">
            {[['exec','⚡ EXECUTION'],['order','📊 ORDER BOOK'],['ai','🤖 AI PREDICT']].map(([id, label]) => (
              <button
                key={id}
                className={`lt-tab ${rightTab === id ? 'active' : ''}`}
                onClick={() => { setRightTab(id); setShowRight(true); }}
              >{label}</button>
            ))}
          </div>

          <div className="lt-divider-v" />

          {selected && (
            <button
              className={`lt-pill-btn ${watchSyms.includes(selected.symbol) ? 'pinned' : ''}`}
              onClick={() => toggleWatch(selected.symbol)}
            >
              {watchSyms.includes(selected.symbol) ? '★ PINNED' : '☆ PIN'}
            </button>
          )}

          <button
            className={`lt-icon-btn ${showRight ? 'active' : ''}`}
            onClick={() => setShowRight(v => !v)}
            title="Toggle Execution Panel"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="10" y="2" width="5" height="12" rx="1" fill="currentColor" opacity={showRight ? 1 : 0.4}/>
              <rect x="1" y="2" width="7" height="2" rx="1" fill="currentColor"/>
              <rect x="1" y="7" width="7" height="2" rx="1" fill="currentColor"/>
              <rect x="1" y="12" width="7" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>

          <button className={`lt-icon-btn ${isFullscreen ? 'active' : ''}`} onClick={toggleFullscreen} title="Fullscreen">
            {isFullscreen
              ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 5V1H5M9 1H13V5M13 9V13H9M5 13H1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 1H1V5M9 1H13V5M13 9V13H9M5 13H1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            }
          </button>
        </div>
      </div>

      {/* ══ MAIN BODY ══ */}
      <div className="lt-body">

        {/* ── LEFT: Asset Navigator ── */}
        <div className="lt-left-panel" style={{ width: LEFT_W, minWidth: LEFT_W }}>
          <div className="lt-panel-inner">
            <div className="lt-search-wrap">
              <span className="lt-search-ico">⚲</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="lt-search-input"
              />
            </div>
            <div className="lt-coin-scroll">
              {!search && (
                <>
                  <div className="lt-section-lbl">★ WATCHLIST</div>
                  {watchCoins.map(coin => (
                    <CoinRow key={coin.id} coin={coin} selected={selected} onSelect={setSelected} color={COIN_COLORS[coin.symbol]} />
                  ))}
                  <div className="lt-section-lbl" style={{ marginTop: 8 }}>ALL MARKETS</div>
                  {otherCoins.map(coin => (
                    <CoinRow key={coin.id} coin={coin} selected={selected} onSelect={setSelected} color={COIN_COLORS[coin.symbol]} />
                  ))}
                </>
              )}
              {search && searchRes.map(coin => (
                <CoinRow key={coin.id} coin={coin} selected={selected} onSelect={setSelected} color={COIN_COLORS[coin.symbol]} />
              ))}
            </div>
          </div>
        </div>

        {/* ── CENTER: TradingView Chart (FULL SIZE) ── */}
        <div className="lt-chart-area">
          {selected && (
            <TradingViewChart
              key={selected.symbol}
              symbol={selected.symbol}
            />
          )}
          <div className="lt-watermark">CRYPTONOVA TERMINAL v4.2</div>
        </div>

        {/* ── RIGHT: Execution / Tools ── */}
        <div className="lt-right-panel" style={{ width: RIGHT_W, minWidth: RIGHT_W }}>
          <div className="lt-panel-inner" style={{ overflow:'auto' }}>
            {rightTab === 'exec'  && selected && <ExecutionBlade symbol={selected.symbol} currentPrice={selected.price} />}
            {rightTab === 'order' && selected && <OrderBook symbol={selected.symbol} midPrice={selected.price} />}
            {rightTab === 'ai'    && selected && <div style={{ padding: 16 }}><AIPredictionPanel coin={selected} prices={prices7d} /></div>}
          </div>
        </div>

      </div>

      {/* ══ STYLES ══ */}
      <style>{`
        .lt-root {
          width: 100%;
          height: calc(100vh - 60px);
          display: flex;
          flex-direction: column;
          background: #000;
          font-family: 'JetBrains Mono', 'Space Mono', monospace;
          overflow: hidden;
        }

        /* ── Topbar ── */
        .lt-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          height: 52px;
          min-height: 52px;
          background: #060a0f;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          gap: 12px;
          flex-shrink: 0;
        }
        .lt-topbar-left  { display: flex; align-items: center; gap: 10px; flex: 1; overflow: hidden; }
        .lt-topbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        .lt-icon-btn {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px; cursor: pointer; color: #5a7a9a;
          transition: all 0.15s;
        }
        .lt-icon-btn:hover { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.2); }
        .lt-icon-btn.active { background: rgba(59,130,246,0.15); color: #3b82f6; border-color: rgba(59,130,246,0.4); }

        .lt-asset-badge {
          display: flex; align-items: center; gap: 10px;
          padding: 6px 14px; border-radius: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden; flex-shrink: 0;
        }
        .lt-asset-logo { width: 26px; height: 26px; border-radius: 50%; background: #fff; flex-shrink: 0; }
        .lt-asset-pair { font-size: 14px; font-weight: 900; color: #fff; letter-spacing: -0.5px; line-height: 1.15; }
        .lt-asset-pair span { color: #4a6080; font-weight: 700; }
        .lt-asset-name  { font-size: 9px; color: #4a6080; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
        .lt-asset-price { font-size: 15px; font-weight: 900; letter-spacing: -0.5px; }
        .lt-asset-chg   { font-size: 11px; font-weight: 800; }
        .lt-asset-chg.up { color: #00d4aa; }
        .lt-asset-chg.dn { color: #ff4757; }
        .lt-stat { display: flex; flex-direction: column; font-size: 11px; color: #fff; font-weight: 700; }
        .lt-stat span { font-size: 8px; color: #4a6080; font-weight: 800; letter-spacing: 1px; margin-bottom: 1px; }

        .lt-divider-v { width: 1px; height: 20px; background: rgba(255,255,255,0.08); margin: 0 4px; flex-shrink: 0; }

        .lt-tab-group { display: flex; gap: 4px; }
        .lt-tab {
          padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);
          background: transparent; color: #5a7a9a; font-size: 10px; font-weight: 800;
          cursor: pointer; transition: all 0.15s; font-family: inherit; letter-spacing: 0.5px;
          white-space: nowrap;
        }
        .lt-tab:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .lt-tab.active { background: rgba(59,130,246,0.18); color: #60a5fa; border-color: rgba(59,130,246,0.5); }

        .lt-pill-btn {
          padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);
          background: transparent; color: #5a7a9a; font-size: 10px; font-weight: 800;
          cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .lt-pill-btn:hover { color: #fff; border-color: rgba(255,255,255,0.3); }
        .lt-pill-btn.pinned { background: rgba(245,158,11,0.15); color: #f59e0b; border-color: rgba(245,158,11,0.4); }

        /* ── Body ── */
        .lt-body {
          flex: 1;
          display: flex;
          overflow: hidden;
          min-height: 0;
        }

        /* ── Left Panel ── */
        .lt-left-panel {
          background: #030508;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: width 0.25s cubic-bezier(0.16,1,0.3,1), min-width 0.25s cubic-bezier(0.16,1,0.3,1);
          flex-shrink: 0;
        }
        .lt-panel-inner { display: flex; flex-direction: column; height: 100%; min-width: 220px; }

        .lt-search-wrap {
          display: flex; align-items: center; margin: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 6px; padding: 0 10px;
          transition: 0.15s;
        }
        .lt-search-wrap:focus-within { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); }
        .lt-search-ico { color: #4a6080; font-size: 12px; transform: rotate(-45deg); display: inline-block; }
        .lt-search-input {
          background: transparent; border: none; color: #fff; font-size: 11px; font-weight: 600;
          outline: none; width: 100%; padding: 9px 0 9px 8px; font-family: inherit;
        }

        .lt-section-lbl {
          padding: 8px 14px 6px;
          font-size: 8px; font-weight: 900; letter-spacing: 2px;
          color: #2d4a66;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }

        .lt-coin-scroll {
          flex: 1; overflow-y: auto; overflow-x: hidden;
        }
        .lt-coin-scroll::-webkit-scrollbar { width: 3px; }
        .lt-coin-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }

        /* Coin Row */
        .lt-coin-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 14px; cursor: pointer;
          border-bottom: 1px solid rgba(255,255,255,0.02);
          transition: background 0.12s;
        }
        .lt-coin-row:hover   { background: rgba(255,255,255,0.03); }
        .lt-coin-row.active  { background: rgba(255,255,255,0.07); border-left: 2px solid #3b82f6; padding-left: 12px; }
        .lt-cr-sym  { font-size: 12px; font-weight: 900; color: #d8e4f0; }
        .lt-cr-name { font-size: 9px; color: #3a5470; font-weight: 700; margin-top: 1px; }
        .lt-cr-price{ font-size: 12px; font-weight: 800; color: #fff; text-align: right; }
        .lt-cr-pct  { font-size: 9px; font-weight: 800; text-align: right; margin-top: 1px; }

        /* ── Chart Area ── */
        .lt-chart-area {
          flex: 1;
          min-width: 0;
          position: relative;
          background: #000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .lt-chart-area > div:first-child {
          flex: 1 !important;
          height: 100% !important;
          min-height: 0 !important;
        }

        .lt-watermark {
          position: absolute; bottom: 10px; right: 18px; z-index: 2;
          font-size: 8px; font-weight: 900; letter-spacing: 3px;
          color: rgba(255,255,255,0.04); pointer-events: none;
        }

        /* ── Right Panel ── */
        .lt-right-panel {
          background: #030508;
          border-left: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: width 0.25s cubic-bezier(0.16,1,0.3,1), min-width 0.25s cubic-bezier(0.16,1,0.3,1);
          flex-shrink: 0;
        }
        .lt-right-panel .lt-panel-inner { min-width: 340px; }

        /* ── Spinner ── */
        .lt-spinner {
          width: 28px; height: 28px;
          border: 2px solid rgba(255,255,255,0.08);
          border-top-color: #3b82f6; border-radius: 50%;
          animation: lt-spin 0.7s linear infinite;
        }
        @keyframes lt-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function CoinRow({ coin, selected, onSelect, color }) {
  const up = coin.change24h >= 0;
  const active = selected?.id === coin.id;
  return (
    <div className={`lt-coin-row ${active ? 'active' : ''}`} onClick={() => onSelect(coin)}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <img src={coin.logo} alt={coin.symbol} width={20} height={20}
          style={{ borderRadius:'50%', background:'#fff', flexShrink:0 }} />
        <div>
          <div className="lt-cr-sym" style={{ color: active ? (color || '#3b82f6') : '#d8e4f0' }}>{coin.symbol}</div>
          <div className="lt-cr-name">{coin.name}</div>
        </div>
      </div>
      <div>
        <div className="lt-cr-price">{formatCurrency(coin.price)}</div>
        <div className="lt-cr-pct" style={{ color: up ? '#00d4aa' : '#ff4757' }}>
          {up ? '▲' : '▼'}{Math.abs(coin.change24h).toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
