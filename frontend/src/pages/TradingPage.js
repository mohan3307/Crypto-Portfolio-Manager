import React, { useState, useEffect, useRef } from 'react';
import TradingViewChart from '../components/Charts/TradingViewChart';
import OrderBook from '../components/Charts/OrderBook';
import AIPredictionPanel from '../components/Charts/AIPredictionPanel';
import TickerTape from '../components/Charts/TickerTape';
import NewsFeed from '../components/Charts/NewsFeed';
import LiquidationMap from '../components/Charts/LiquidationMap';
import { getListings, getChartData } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/format';

// ── Comprehensive coin color map (120+ coins) ─────────────────────────────
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

const DEFAULT_WATCH = ['BTC','ETH','SOL','BNB','XRP','DOGE','PEPE','WIF','SUI','INJ','AVAX','NEAR'];

function StatPill({ label, value, color }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:'7px 12px', minWidth:110 }}>
      <div style={{ fontSize:9, color:'#3d5470', letterSpacing:1, textTransform:'uppercase', marginBottom:3, fontFamily:'JetBrains Mono,monospace' }}>{label}</div>
      <div style={{ fontSize:13, fontWeight:700, fontFamily:'JetBrains Mono,monospace', color: color||'#eef2fa' }}>{value}</div>
    </div>
  );
}

export default function TradingPage() {
  const [listings,   setListings]   = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [prices7d,   setPrices7d]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [watchSyms,  setWatchSyms]  = useState(DEFAULT_WATCH);
  const [rightPanel, setRightPanel] = useState('ai');
  const [fullScreen, setFullScreen] = useState(false);
  const fullRef = useRef(null);

  // ── Data loading ────────────────────────────────────────────────────────
  useEffect(() => {
    getListings().then(r => {
      const d = r.data.data;
      setListings(d);
      if (!selected) setSelected(d[0] || null);
      setLoading(false);
    }).catch(() => setLoading(false));

    const iv = setInterval(() =>
      getListings().then(r => setListings(r.data.data)).catch(() => {}),
    20000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!selected) return;
    getChartData(selected.symbol, '7d').then(r =>
      setPrices7d(r.data.data.map(d => d.price))
    ).catch(() => {});
  }, [selected?.symbol]);

  // ── Fullscreen API ──────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!fullScreen) {
      const el = fullRef.current || document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      setFullScreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      setFullScreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) setFullScreen(false);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  // ── Coin filtering ──────────────────────────────────────────────────────
  const watchCoins   = listings.filter(c => watchSyms.includes(c.symbol));
  const otherCoins   = listings.filter(c => !watchSyms.includes(c.symbol));
  const searchResult = search
    ? listings.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 40)
    : null;

  const coinColor = selected ? (COIN_COLORS[selected.symbol] || '#3b82f6') : '#3b82f6';
  const chgColor  = (selected?.change24h ?? 0) >= 0 ? '#00e5b3' : '#f03e55';
  const toggleWatch = s => setWatchSyms(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  if (loading) return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36, height:36, border:'2px solid #1a2840', borderTopColor:'#3b82f6', borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 12px' }} />
        <div style={{ fontSize:12, color:'#3d5470', fontFamily:'JetBrains Mono,monospace' }}>Connecting to markets...</div>
      </div>
    </div>
  );

  return (
    <div ref={fullRef} style={{
      background:'#04070d',
      height: fullScreen ? '100vh' : 'calc(100vh - 58px)',
      display:'flex', flexDirection:'column',
      fontFamily:'JetBrains Mono,monospace',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Ticker tape */}
      <TickerTape listings={listings} />

      {/* Main 3-column grid */}
      <div style={{
        flex:1, display:'grid',
        gridTemplateColumns: fullScreen ? '200px minmax(0, 1fr)' : '210px minmax(0, 1fr) 320px',
        overflow:'hidden',
      }}>

        {/* ── LEFT: Coin list ─────────────────────────────────────────── */}
        <div style={{ borderRight:'1px solid #1a2840', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Search */}
          <div style={{ padding:'10px 10px 8px', borderBottom:'1px solid #1a2840', flexShrink:0 }}>
            <div style={{ background:'#0a1120', border:'1px solid #1a2840', borderRadius:6, display:'flex', alignItems:'center', gap:6, padding:'5px 9px' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3d5470" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search 120+ coins..."
                style={{ background:'none', border:'none', color:'#eef2fa', fontSize:11, outline:'none', width:'100%', fontFamily:'inherit' }} />
              {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', color:'#3d5470', cursor:'pointer', fontSize:13 }}>×</button>}
            </div>
          </div>

          {/* List */}
          <div style={{ flex:1, overflowY:'auto', scrollbarWidth:'thin', scrollbarColor:'#1a2840 transparent' }}>
            {!search && (
              <>
                <div style={{ padding:'8px 14px 3px', fontSize:9, color:'#3d5470', fontWeight:700, letterSpacing:'1.5px' }}>WATCHLIST ({watchSyms.length})</div>
                {watchCoins.map(coin => <CoinRow key={`watch-${coin.id}`} coin={coin} selected={selected} onSelect={setSelected} onWatch={toggleWatch} watching coinColor={COIN_COLORS[coin.symbol]} />)}
                <div style={{ margin:'6px 14px', height:1, background:'rgba(255,255,255,0.05)' }} />
                <div style={{ padding:'6px 14px 3px', fontSize:9, color:'#3d5470', fontWeight:700, letterSpacing:'1.5px' }}>ALL MARKETS ({otherCoins.length})</div>
                {otherCoins.map(coin => <CoinRow key={`all-${coin.id}`} coin={coin} selected={selected} onSelect={setSelected} onWatch={toggleWatch} watching={false} coinColor={COIN_COLORS[coin.symbol]} />)}
              </>
            )}
            {search && searchResult.map(coin => <CoinRow key={`search-${coin.id}`} coin={coin} selected={selected} onSelect={setSelected} onWatch={toggleWatch} watching={watchSyms.includes(coin.symbol)} coinColor={COIN_COLORS[coin.symbol]} />)}
          </div>
        </div>

        {/* ── CENTER: Chart ────────────────────────────────────────────── */}
        <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Coin info bar */}
          {selected && (
            <div style={{ padding:'9px 14px', borderBottom:'1px solid #1a2840', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', background:'#060b14', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                <img src={selected.logo} alt={selected.symbol} width={32} height={32} style={{ borderRadius:'50%' }} onError={e => e.target.style.display='none'} />
                <div>
                  <div style={{ fontWeight:800, fontSize:14, color:coinColor }}>{selected.name}</div>
                  <div style={{ fontSize:9, color:'#3d5470' }}>{selected.symbol}/USDT · #{selected.rank}</div>
                </div>
              </div>
              <div style={{ width:1, height:30, background:'#1a2840', flexShrink:0 }} />
              <StatPill label="Price"      value={formatCurrency(selected.price)} />
              <StatPill label="24h Change" value={formatPercent(selected.change24h)} color={chgColor} />
              <StatPill label="Market Cap" value={formatCurrency(selected.marketCap)} />
              <StatPill label="24h Volume" value={formatCurrency(selected.volume24h)} />
              <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
                <button onClick={() => toggleWatch(selected.symbol)}
                  style={{ padding:'5px 10px', borderRadius:6, border:`1px solid ${watchSyms.includes(selected.symbol) ? '#f5a623' : '#1a2840'}`, background: watchSyms.includes(selected.symbol) ? 'rgba(245,166,35,0.1)' : 'transparent', color: watchSyms.includes(selected.symbol) ? '#f5a623' : '#3d5470', fontSize:14, cursor:'pointer', transition:'0.15s' }}>
                  {watchSyms.includes(selected.symbol) ? '★' : '☆'}
                </button>
                <button onClick={toggleFullscreen} title={fullScreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Chart'}
                  style={{ padding:'5px 10px', borderRadius:6, border:'1px solid #1a2840', background: fullScreen ? 'rgba(59,130,246,0.15)' : 'transparent', color: fullScreen ? '#3b82f6' : '#3d5470', fontSize:13, cursor:'pointer', transition:'0.15s' }}>
                  {fullScreen ? '⊡' : '⛶'}
                </button>
              </div>
            </div>
          )}

          {/* Chart */}
          <div style={{ flex:1, overflow:'auto', padding:10 }}>
            {selected && (
              <TradingViewChart
                key={selected.symbol}
                symbol={selected.symbol}
                coinName={selected.name}
                coinColor={coinColor}
              />
            )}
          </div>

          {/* News compact strip below chart */}
          {!fullScreen && (
            <div style={{ padding:'8px 12px', borderTop:'1px solid #1a2840', flexShrink:0 }}>
              <NewsFeed compact />
            </div>
          )}
        </div>

        {/* ── RIGHT: Tabs panel ───────────────────────────────────────── */}
        {!fullScreen && selected && (
          <div style={{ borderLeft:'1px solid #1a2840', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Tab bar */}
            <div style={{ display:'flex', borderBottom:'1px solid #1a2840', background:'#060b14', flexShrink:0 }}>
              {[['ai','🤖 AI Signal'],['order','📒 Order Book'],['news','📰 News'],['liq','🔥 Liquidations']].map(([v,lbl]) => (
                <button key={v} onClick={() => setRightPanel(v)}
                  style={{ flex:1, padding:'9px 4px', border:'none', borderBottom:`2px solid ${rightPanel===v ? coinColor : 'transparent'}`, background:'transparent', color: rightPanel===v ? coinColor : '#3d5470', fontSize:9, fontWeight:700, cursor:'pointer', transition:'0.15s', fontFamily:'inherit' }}>
                  {lbl}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex:1, overflow:'auto' }}>
              {rightPanel === 'ai'    && <div style={{ padding:10 }}><AIPredictionPanel coin={selected} prices={prices7d} /></div>}
              {rightPanel === 'order' && <OrderBook symbol={selected.symbol} midPrice={selected.price} />}
              {rightPanel === 'news'  && <div style={{ padding:'10px 12px' }}><NewsFeed /></div>}
              {rightPanel === 'liq'   && <div style={{ padding:10 }}><LiquidationMap /></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Coin row sub-component ────────────────────────────────────────────────
function CoinRow({ coin, selected, onSelect, onWatch, watching, coinColor }) {
  const up       = coin.change24h >= 0;
  const isActive = selected?.id === coin.id;
  const color    = coinColor || '#3b82f6';
  return (
    <div
      style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', cursor:'pointer', background: isActive ? `${color}14` : 'transparent', borderLeft:`3px solid ${isActive ? color : 'transparent'}`, transition:'0.12s' }}
      onClick={() => onSelect(coin)}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background='rgba(255,255,255,0.025)'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background='transparent'; }}>
      <img src={coin.logo} alt={coin.symbol} width={24} height={24} style={{ borderRadius:'50%', flexShrink:0 }} onError={e => e.target.style.display='none'} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:11, color: isActive ? color : '#eef2fa' }}>{coin.symbol}</div>
        <div style={{ fontSize:9, color:'#3d5470', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{coin.name}</div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontSize:11, fontWeight:600, color:'#eef2fa' }}>{formatCurrency(coin.price)}</div>
        <div style={{ fontSize:9, fontWeight:700, color: up ? '#00e5b3' : '#f03e55' }}>{up ? '▲' : '▼'}{Math.abs(coin.change24h).toFixed(2)}%</div>
      </div>
      <button onClick={e => { e.stopPropagation(); onWatch(coin.symbol); }}
        style={{ background:'none', border:'none', color: watching ? '#f5a623' : '#3d5470', fontSize:12, cursor:'pointer', padding:'0 2px', flexShrink:0, transition:'0.15s' }}>
        {watching ? '★' : '☆'}
      </button>
    </div>
  );
}
