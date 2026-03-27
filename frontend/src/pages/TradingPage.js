import React, { useState, useEffect, useRef } from 'react';
import TradingViewChart from '../components/Charts/TradingViewChart';
import ExecutionBlade from '../components/Tools/ExecutionBlade';
import NewsFeed from '../components/Charts/NewsFeed';
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
  VET:'#15bdff', THETA:'#2ab8e6', XTZ:'#a8e000', GNO:'#00a6c4',
  EGLD:'#23f7dd', ROSE:'#0092f6', HNT:'#474DFF', PAXG:'#c9b400',
  GALA:'#01a1ff', AXS:'#0055d5', AAVE:'#b6509e', YFI:'#006ae3',
  COMP:'#00d395', MKR:'#1aab9b', SNX:'#5fcdf9', CRV:'#fd0000',
  LDO:'#f27c7c', DYDX:'#7547ff', LRC:'#1c60ff', STX:'#5546ff',
  TIA:'#7b2bf9', PYTH:'#9945ff', JUP:'#22d3ee', INJ:'#0098ea',
  KAS:'#49dafe', TAO:'#00c0a3', AR:'#1a1a1a', PENDLE:'#5acbd8',
  RENDER:'#0af', RNDR:'#0af', FET:'#1a1a2e', OCEAN:'#7b2ff7',
  FLOKI:'#f7a600', BONK:'#f7731a', WIF:'#d67a2c', BRETT:'#87ceeb',
  PEPE:'#469c46', NOTCOIN:'#f5a623', BEAM:'#00a0ff', NOT:'#f5a623',
  DEGEN:'#a020f0', WLD:'#4286f4', W:'#00d4aa', BLUR2:'#ff5c5c',
  BAT:'#ff5000', ZIL:'#29ccc4', ONT:'#32a4be', ENJ:'#7866d5',
  CHZ:'#cd0124', CAKE:'#d1884f', '1INCH':'#94a8c5', NEO:'#58bf00',
  MIOTA:'#131f37', BTT:'#cc0000', HT:'#2a3785', KCS:'#0093dd',
  QTUM:'#2e9ad0', ICX:'#1fc5c9', REN:'#001c3d', QNT:'#2d5f8a',
  STORJ:'#2683ff', LPT:'#00b0aa', RLC:'#ffd700', ASTR:'#1b6dc1',
  FLUX:'#2b61e4', GLMR:'#e1147b', TFUEL:'#29c8c8', AMPL:'#f7821b',
  BAL:'#1e1e1e', SPELL:'#0ea5e9', AKT:'#ff444f', NMR:'#ff0079',
  OKB:'#2b60e1', GT:'#0877a2', CEL:'#4157a6', RSR:'#225475',
  BSV:'#eab300', ETC:'#328332', XLM:'#0c2d5e', TRX:'#ff0013',
  LEO:'#f5ae19', USDC:'#2775ca', USDT:'#26a17b', FTT:'#02a4c0',
  APE:'#0043ce', EGLD2:'#23f7dd', STEEM:'#4ba2f2',
};

const DEFAULT_WATCH = ['BTC','ETH','SOL','BNB','PEPE','SUI','NEAR','INJ'];

function StatPill({ label, value, color }) {
  const accent = color === '#10b981' ? 'var(--green)' : color === '#ff4d4d' ? 'var(--red)' : '#fff';
  return (
    <div className="pro-stat-pill">
      <div className="pro-stat-label">{label}</div>
      <div className="pro-stat-val" style={{ color: accent }}>{value}</div>
    </div>
  );
}

export default function TradingPage() {
  const { listings: liveListings } = useMarket();
  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [prices7d, setPrices7d] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [watchSyms, setWatchSyms] = useState(DEFAULT_WATCH);
  const [rightPanel, setRightPanel] = useState('ai');
  const [fullScreen, setFullScreen] = useState(false);
  const fullRef = useRef(null);

  useEffect(() => {
    if (liveListings && liveListings.length > 0) {
      setListings(liveListings);
      if (!selected) setSelected(liveListings[0]);
      
      if (selected) {
        const updatedSelected = liveListings.find(c => c.symbol === selected.symbol);
        if (updatedSelected) setSelected(updatedSelected);
      }
      setLoading(false);
    }
  }, [liveListings, selected?.symbol]);

  useEffect(() => {
    if (!selected) return;
    getChartData(selected.symbol, '7d').then(r =>
      setPrices7d(r.data.data.map(d => d.price))
    ).catch(() => {});
  }, [selected?.symbol]);

  const toggleFullscreen = () => {
    if (!fullScreen) {
      const el = fullRef.current || document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      setFullScreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setFullScreen(false);
    }
  };

  const watchCoins = listings.filter(c => watchSyms.includes(c.symbol));
  const otherCoins = listings.filter(c => !watchSyms.includes(c.symbol));
  const searchResult = search ? listings.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase())).slice(0, 40) : null;

  const coinColor = selected ? (COIN_COLORS[selected.symbol] || '#3b82f6') : '#3b82f6';
  const chgColor = (selected?.change24h ?? 0) >= 0 ? '#10b981' : '#ff4d4d';
  const toggleWatch = s => setWatchSyms(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  if (loading) return (
    <div className="pro-loader">
      <div className="pro-spinner" />
      <div style={{ marginTop: 12, fontSize: 10, letterSpacing: 2, color: '#3d5470' }}>INITIALIZING TERMINAL...</div>
    </div>
  );

  return (
    <div ref={fullRef} className="pro-terminal-wrapper" style={{ height: fullScreen ? '100vh' : 'calc(100vh - 80px)' }}>
      {!fullScreen && <TickerTape listings={listings} />}

      <div className="pro-grid-layout" style={{ gridTemplateColumns: fullScreen ? '240px minmax(0, 1fr)' : '280px minmax(0, 1fr) 380px' }}>
        
        {/* ── LEFT: Asset Navigator ── */}
        <div className="pro-panel border-right" style={{ background: '#020202' }}>
          <div className="pro-panel-header">
            <div className="pro-header-title">TACTICAL NAVIGATOR</div>
            <div className="pro-search-box">
              <span className="pro-search-icon">⚲</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH VECTOR..." spellCheck="false" />
            </div>
          </div>

          <div className="pro-scroller">
            {!search && (
              <>
                <div className="pro-section-header">WATCHLIST NODES</div>
                {watchCoins.map(coin => <CoinRow key={coin.id} coin={coin} selected={selected} onSelect={setSelected} watching coinColor={COIN_COLORS[coin.symbol]} />)}
                
                <div className="pro-section-header" style={{ marginTop: 8 }}>CORE LIQUIDITY</div>
                {otherCoins.map(coin => <CoinRow key={coin.id} coin={coin} selected={selected} onSelect={setSelected} watching={false} coinColor={COIN_COLORS[coin.symbol]} />)}
              </>
            )}
            {search && searchResult.map(coin => <CoinRow key={coin.id} coin={coin} selected={selected} onSelect={setSelected} watching={watchSyms.includes(coin.symbol)} coinColor={COIN_COLORS[coin.symbol]} />)}
          </div>
        </div>

        {/* ── CENTER: Tactical Charting ── */}
        <div className="pro-panel" style={{ background: '#000', position: 'relative' }}>
          {selected && (
            <div className="pro-chart-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img src={selected.logo} alt={selected.symbol} className="pro-logo" />
                <div>
                  <div className="pro-symbol-name">{selected.symbol}/USDT</div>
                  <div className="pro-sub-name">{selected.name}</div>
                </div>
              </div>

              <div className="pro-stats-group">
                <StatPill label="LIVE PRICE" value={formatCurrency(selected.price)} color="#ffffff" />
                <StatPill label="24H DELTA" value={formatPercent(selected.change24h)} color={chgColor} />
                <StatPill label="MARKET CAP" value={formatCurrency(selected.marketCap).split('.')[0]} color="#ffffff" />
              </div>

              <div className="pro-actions-group">
                {['ai', 'order', 'liq'].map(id => (
                  <button key={id} onClick={() => setRightPanel(id)} className={`pro-btn ${rightPanel === id ? 'active' : ''}`}>
                    {id === 'ai' ? 'EXECUTION' : id === 'order' ? 'ORDER BOOK' : 'LIQUIDITY'}
                  </button>
                ))}
                <div className="pro-divider-v" />
                <button onClick={() => toggleWatch(selected.symbol)} className={`pro-btn ${watchSyms.includes(selected.symbol) ? 'active' : ''}`}>
                  {watchSyms.includes(selected.symbol) ? '★ PINNED' : '☆ PIN'}
                </button>
                <button onClick={toggleFullscreen} className="pro-btn">⛶ FOCUS</button>
              </div>
            </div>
          )}

          <div className="pro-chart-container">
            {selected && (
              <TradingViewChart 
                key={selected.symbol} 
                symbol={selected.symbol} 
              />
            )}
            <div className="pro-watermark">CRYPTONOVA TERMINAL v4.2 // SECURE_SOCKET</div>
          </div>
        </div>

        {/* ── RIGHT: Strategic Intel ── */}
        {!fullScreen && selected && (
          <div className="pro-panel border-left" style={{ background: '#020202' }}>
            <div className="pro-scroller">
              {rightPanel === 'ai'    && <ExecutionBlade symbol={selected.symbol} currentPrice={selected.price} />}
              {rightPanel === 'order' && <OrderBook symbol={selected.symbol} midPrice={selected.price} />}
              {rightPanel === 'liq'   && <div style={{ padding: 20 }}><AIPredictionPanel coin={selected} prices={prices7d} /></div>}
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Professional Premium Structural CSS */
        .pro-terminal-wrapper {
          width: 100%; max-width: 100%; overflow: hidden;
          display: flex; flex-direction: column;
          background: #000;
          font-family: 'JetBrains Mono', 'Space Mono', monospace;
        }

        .pro-grid-layout {
          flex: 1; display: grid; overflow: hidden;
        }

        .pro-panel {
          display: flex; flex-direction: column; overflow: hidden;
        }

        .border-left { border-left: 1px solid rgba(255, 255, 255, 0.05); }
        .border-right { border-right: 1px solid rgba(255, 255, 255, 0.05); }

        .pro-panel-header {
          padding: 20px 20px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: #020202;
          flex-shrink: 0;
        }

        .pro-header-title {
          font-size: 9px; color: #4a5e78; font-weight: 800; letter-spacing: 2px; margin-bottom: 16px;
        }

        .pro-search-box {
          display: flex; align-items: center;
          background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 4px; padding: 0 12px; transition: 0.2s;
        }
        .pro-search-box:focus-within { border-color: rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.05); }
        .pro-search-box input {
          background: transparent; border: none; color: #fff; font-size: 11px; font-weight: 600;
          outline: none; width: 100%; padding: 10px 0; font-family: inherit; margin-left: 8px;
        }
        .pro-search-icon { color: #4a5e78; font-size: 12px; transform: rotate(-45deg); display: inline-block; }

        .pro-section-header {
          padding: 10px 20px; font-size: 9px; color: #3d5470; font-weight: 800;
          letter-spacing: 1.5px; background: rgba(255, 255, 255, 0.01);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          border-top: 1px solid rgba(255, 255, 255, 0.03);
        }

        .pro-scroller {
          flex: 1; overflow-y: auto; overflow-x: hidden;
        }
        .pro-scroller::-webkit-scrollbar { width: 4px; }
        .pro-scroller::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        /* Chart Header Formatting */
        .pro-chart-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 24px; background: #000;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          gap: 32px; flex-shrink: 0;
        }

        .pro-logo {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1); background: #fff;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.05);
        }

        .pro-symbol-name {
          font-weight: 900; font-size: 16px; color: #fff; letter-spacing: -0.5px; line-height: 1.2;
        }

        .pro-sub-name {
          font-size: 10px; color: #4a5e78; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
        }

        .pro-stats-group {
          display: flex; gap: 24px;
        }

        .pro-stat-pill {
          display: flex; flex-direction: column; gap: 4px;
        }

        .pro-stat-label {
          font-size: 9px; color: #4a5e78; font-weight: 800; letter-spacing: 1px;
        }

        .pro-stat-val {
          font-size: 13px; font-weight: 900; letter-spacing: -0.5px;
        }

        .pro-actions-group {
          margin-left: auto; display: flex; align-items: center; gap: 8px;
        }

        .pro-btn {
          background: transparent; border: 1px solid rgba(255, 255, 255, 0.1);
          color: #8c9eb5; padding: 7px 14px; font-size: 10px; font-weight: 800;
          cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 4px; font-family: inherit; letter-spacing: 0.5px;
        }
        .pro-btn:hover { background: rgba(255, 255, 255, 0.05); color: #fff; border-color: rgba(255, 255, 255, 0.3); }
        .pro-btn.active { background: #fff; color: #000; border-color: #fff; }

        .pro-divider-v {
          width: 1px; height: 16px; background: rgba(255, 255, 255, 0.1); margin: 0 4px;
        }

        .pro-chart-container {
          flex: 1; padding: 24px; position: relative; display: flex; flex-direction: column; overflow: hidden;
        }

        .pro-watermark {
          position: absolute; bottom: 12px; right: 24px; z-index: 10;
          font-size: 9px; font-weight: 800; letter-spacing: 2px;
          color: rgba(255, 255, 255, 0.05); pointer-events: none;
        }

        /* Loading State */
        .pro-loader {
          min-height: 80vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; background: #000;
        }
        .pro-spinner {
          width: 32px; height: 32px; border: 2px solid rgba(255, 255, 255, 0.1);
          border-top-color: #3b82f6; border-radius: 50%;
          animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Coin Row */
        .pro-coin-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 20px; cursor: pointer; border-bottom: 1px solid rgba(255, 255, 255, 0.02);
          transition: background 0.15s;
        }
        .pro-coin-row:hover { background: rgba(255, 255, 255, 0.02); }
        .pro-coin-row.active { background: rgba(255, 255, 255, 0.06); border-left: 3px solid #fff; padding-left: 17px; }

        .pro-coin-name { font-size: 13px; font-weight: 800; color: #e2e8f0; letter-spacing: -0.5px; }
        .pro-coin-price { font-size: 13px; font-weight: 800; color: #fff; letter-spacing: -0.5px; text-align: right; }
        .pro-coin-pct { font-size: 10px; font-weight: 800; text-align: right; margin-top: 2px; }
      `}</style>
    </div>
  );
}

function CoinRow({ coin, selected, onSelect }) {
  const up = coin.change24h >= 0;
  const isActive = selected?.id === coin.id;
  
  return (
    <div className={`pro-coin-row ${isActive ? 'active' : ''}`} onClick={() => onSelect(coin)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src={coin.logo} alt={coin.symbol} width={20} height={20} style={{ borderRadius: '50%', background: '#fff' }} />
        <div className="pro-coin-name">{coin.symbol}</div>
      </div>
      <div>
        <div className="pro-coin-price">{formatCurrency(coin.price)}</div>
        <div className="pro-coin-pct" style={{ color: up ? '#10b981' : '#ff4d4d' }}>{up ? '▲' : '▼'}{Math.abs(coin.change24h).toFixed(2)}%</div>
      </div>
    </div>
  );
}
