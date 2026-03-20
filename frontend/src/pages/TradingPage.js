import React, { useState, useEffect, useRef } from 'react';
import ProTradingChart from '../components/Charts/ProTradingChart';
import ExecutionBlade from '../components/Tools/ExecutionBlade';
import NewsFeed from '../components/Charts/NewsFeed';
import AIPredictionPanel from '../components/Charts/AIPredictionPanel';
import OrderBook from '../components/Charts/OrderBook';
import TickerTape from '../components/Charts/TickerTape';
import { getListings, getChartData } from '../services/api';
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
    <div className="card" style={{ padding: '8px 16px', background: '#000', border: '2px solid var(--border)', minWidth: 130 }}>
      <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 900, fontFamily: 'var(--font-mono)', color: accent }}>{value}</div>
    </div>
  );
}

export default function TradingPage() {
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
    getListings().then(r => {
      const d = r.data.data;
      setListings(d);
      if (!selected) setSelected(d[0] || null);
      setLoading(false);
    }).catch(() => setLoading(false));

    const iv = setInterval(() =>
      getListings().then(r => setListings(r.data.data)).catch(() => {}),
    15000);
    return () => clearInterval(iv);
  }, []);

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
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'v4-spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div ref={fullRef} style={{
      background: '#000',
      height: fullScreen ? '100vh' : 'calc(100vh - 80px)',
      display: 'flex', flexDirection: 'column',
      width: '100%', maxWidth: '100%', overflow: 'hidden',
    }}>
      <TickerTape listings={listings} />

      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: fullScreen ? '240px minmax(0, 1fr)' : '260px minmax(0, 1fr) 380px',
        overflow: 'hidden',
      }}>

        {/* ── LEFT: Asset Navigator ── */}
        <div style={{ borderRight: '2px solid var(--border)', display: 'flex', flexDirection: 'column', background: '#000' }}>
          <div style={{ padding: '24px 16px 16px', flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 2, marginBottom: 16 }}>TACTICAL_NAVIGATOR</div>
            <div className="v4-search-wrap">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH_VECTOR..." />
            </div>
          </div>

          <div className="v4-scroller" style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
            {!search && (
              <>
                <div style={{ padding: '8px 16px', fontSize: 8, color: 'var(--text-dim)', fontWeight: 800, borderBottom: '1px solid var(--border)', background: '#080808' }}>WATCHLIST_NODES</div>
                {watchCoins.map(coin => <CoinRow key={coin.id} coin={coin} selected={selected} onSelect={setSelected} onWatch={toggleWatch} watching coinColor={COIN_COLORS[coin.symbol]} />)}
                
                <div style={{ padding: '16px 16px 8px', fontSize: 8, color: 'var(--text-dim)', fontWeight: 800, borderBottom: '1px solid var(--border)', background: '#080808', marginTop: 12 }}>CORE_LIQUIDITY</div>
                {otherCoins.map(coin => <CoinRow key={coin.id} coin={coin} selected={selected} onSelect={setSelected} onWatch={toggleWatch} watching={false} coinColor={COIN_COLORS[coin.symbol]} />)}
              </>
            )}
            {search && searchResult.map(coin => <CoinRow key={coin.id} coin={coin} selected={selected} onSelect={setSelected} onWatch={toggleWatch} watching={watchSyms.includes(coin.symbol)} coinColor={COIN_COLORS[coin.symbol]} />)}
          </div>
        </div>

        {/* ── CENTER: Tactical Charting ── */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {selected && (
            <div className="v4-trading-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 32, height: 32, border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={selected.logo} alt={selected.symbol} width={24} height={24} style={{ background: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18, color: '#fff', letterSpacing: -0.5, fontFamily: 'var(--font-mono)' }}>{selected.symbol}/USDT</div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800 }}>{selected.name.toUpperCase()}_NODE</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <StatPill label="LIVE_PRICE" value={formatCurrency(selected.price)} color="#fff" />
                <StatPill label="24H_DELTA" value={formatPercent(selected.change24h)} color={chgColor} />
                <StatPill label="MARKET_CAP" value={formatCurrency(selected.marketCap).split('.')[0]} color="#fff" />
              </div>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                <button onClick={() => toggleWatch(selected.symbol)} className={`v4-tactical-action ${watchSyms.includes(selected.symbol) ? 'active' : ''}`}>
                  {watchSyms.includes(selected.symbol) ? 'UNPIN_NODE' : 'PIN_NODE'}
                </button>
                <button onClick={toggleFullscreen} className="v4-tactical-action">⛶_TERMINAL_FOCUS</button>
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {selected && (
              <ProTradingChart 
                key={selected.symbol} 
                symbol={selected.symbol} 
                coinName={selected.name} 
                coinColor={coinColor}
                logo={selected.logo}
              />
            )}
            <div className="v4-neural-overlay">TERMINAL_v4.2 // FEED_ID: {Math.random().toString(16).slice(2, 8).toUpperCase()}</div>
          </div>

          {!fullScreen && (
            <div className="v4-bottom-tape">
              <NewsFeed compact />
            </div>
          )}
        </div>

        {/* ── RIGHT: Strategic Intel ── */}
        {!fullScreen && selected && (
          <div style={{ borderLeft: '2px solid var(--border)', display: 'flex', flexDirection: 'column', background: '#000' }}>
            <div className="v4-scroller" style={{ flex: 1, overflowY: 'auto' }}>
              {rightPanel === 'ai'    && <ExecutionBlade symbol={selected.symbol} currentPrice={selected.price} />}
              {rightPanel === 'order' && <OrderBook symbol={selected.symbol} midPrice={selected.price} />}
              {rightPanel === 'liq'   && <div style={{ padding: 20 }}><AIPredictionPanel coin={selected} prices={prices7d} /></div>}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .v4-search-wrap { background: #000; border: 2px solid var(--border); display: flex; alignItems: center; padding: 10px 14px; }
        .v4-search-wrap input { background: transparent; border: none; color: #fff; fontSize: 11px; fontWeight: 900; outline: none; width: 100%; fontFamily: var(--font-mono); }
        
        .v4-trading-header { padding: 16px 24px; border-bottom: 2px solid var(--border); display: flex; align-items: center; gap: 32px; background: #000; }
        
        .v4-tactical-action { background: #000; border: 1px solid var(--border); color: #fff; padding: 8px 16px; fontSize: 9px; fontWeight: 900; cursor: pointer; transition: 0.1s; fontFamily: var(--font-mono); }
        .v4-tactical-action:hover { background: #fff; color: #000; }
        .v4-tactical-action.active { background: #fff; color: #000; }

        .v4-neural-overlay { position: absolute; bottom: 16px; left: 20px; z-index: 10; fontSize: 8px; color: var(--text-dim); fontWeight: 800; fontFamily: var(--font-mono); letterSpacing: 2px; }
        
        .v4-bottom-tape { padding: 0; background: #000; border-top: 2px solid var(--border); }
        .v4-scroller::-webkit-scrollbar { width: 4px; }
        .v4-scroller::-webkit-scrollbar-thumb { background: var(--border-strong); }
      `}</style>
    </div>
  );
}

function CoinRow({ coin, selected, onSelect }) {
  const up = coin.change24h >= 0;
  const isActive = selected?.id === coin.id;
  
  return (
    <div className={`v4-coin-row ${isActive ? 'active' : ''}`} onClick={() => onSelect(coin)}>
      <div style={{ width: 24, height: 24, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <img src={coin.logo} alt={coin.symbol} width={16} height={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 13, color: '#fff', fontFamily: 'var(--font-mono)', letterSpacing: -0.5 }}>{coin.symbol}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{formatCurrency(coin.price)}</div>
        <div style={{ fontSize: 8, fontWeight: 900, color: up ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>{up ? '▲' : '▼'}{Math.abs(coin.change24h).toFixed(2)}%</div>
      </div>

      <style>{`
        .v4-coin-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; border-bottom: 1px solid var(--border); transition: 0.1s; }
        .v4-coin-row:hover { background: #080808; }
        .v4-coin-row.active { background: #fff !important; }
        .v4-coin-row.active * { color: #000 !important; }
      `}</style>
    </div>
  );
}
