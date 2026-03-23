import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { formatCurrency } from '../utils/format';
import ProTradingChart from '../components/Charts/ProTradingChart';
import GlobalStats from '../components/Dashboard/GlobalStats';
import { toast } from 'react-toastify';
import { addToWatchlist } from '../services/api';

const METADATA_LABELS = {
  website: 'coinmarketcap.com',
  explorer: 'etherscan.io',
  community: 'twitter.com/crypto',
  source: 'github.com/crypto'
};

export default function CoinPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listings } = useMarket();
  const [coin, setCoin] = useState(null);
  const [converter, setConverter] = useState({ crypto: 1, usd: 0 });

  useEffect(() => {
    if (listings.length > 0) {
      const found = listings.find(l => String(l.id) === id || l.symbol.toLowerCase() === id.toLowerCase());
      if (found) {
        setCoin(found);
        setConverter(prev => ({ ...prev, usd: found.price }));
      }
    }
  }, [id, listings]);

  const handleWatch = async () => {
    try {
      await addToWatchlist({ coinId: String(coin.id), symbol: coin.symbol, name: coin.name, logo: coin.logo });
      toast.success(`${coin.symbol} added to watchlist`);
    } catch (e) {
      toast.error('Failed to update watchlist');
    }
  };

  if (!coin) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="v4-ping-large" />
      </div>
    );
  }

  const isUp = coin.change24h >= 0;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
      <GlobalStats listings={listings} />

      <div style={{ marginTop: 32, display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        
        {/* LEFT: Coin Info Summary */}
        <div style={{ flex: '1 1 320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
             <button onClick={() => navigate(-1)} style={{ color: 'var(--text-muted)', fontSize: 18 }}>←</button>
             <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cryptocurrencies &gt; {coin.name}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <img src={coin.logo} width={32} height={32} style={{ borderRadius: '50%', background: '#fff' }} alt="" />
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0 }}>
              {coin.name} <span style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 600 }}>{coin.symbol}</span>
            </h1>
            <div style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
              Rank #{coin.rank}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>{formatCurrency(coin.price)}</div>
            <div style={{ 
              fontSize: 14, fontWeight: 700, 
              color: isUp ? 'var(--cmc-green)' : 'var(--cmc-red)',
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              {isUp ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}% (24h)
            </div>
          </div>

          <div className="card-cmc" style={{ padding: '0', borderRadius: 12, overflow: 'hidden' }}>
             {[
               { label: 'Market Cap', val: formatCurrency(coin.marketCap), dot: 'var(--cmc-blue)' },
               { label: 'Volume (24h)', val: formatCurrency(coin.volume24h), sub: `${Math.floor(coin.volume24h / coin.price).toLocaleString()} ${coin.symbol}` },
               { label: 'Circulating Supply', val: `${Math.floor(coin.marketCap / coin.price).toLocaleString()} ${coin.symbol}`, sub: '65%', bar: true },
               { label: 'Total Supply', val: `${Math.floor(coin.marketCap / coin.price * 1.5).toLocaleString()} ${coin.symbol}` },
               { label: 'Max Supply', val: '21,000,000 BTC' }
             ].map((s, i) => (
               <div key={i} style={{ padding: '16px 20px', borderBottom: i === 4 ? 'none' : '1px solid var(--cmc-border)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: s.bar ? 8 : 4 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {s.dot && <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />}
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</span>
                   </div>
                   <span style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>{s.val}</span>
                 </div>
                 {s.sub && !s.bar && <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'right' }}>{s.sub}</div>}
                 {s.bar && (
                   <div style={{ height: 4, width: '100%', background: 'var(--bg-input)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: s.sub, height: '100%', background: 'var(--cmc-blue)' }} />
                   </div>
                 )}
               </div>
             ))}
          </div>

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
             <button className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: 10, fontWeight: 800 }} onClick={handleWatch}>⭐ Watchlist</button>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button className="btn-ghost" style={{ padding: '10px', borderRadius: 8, fontSize: 11 }}>Official Site ↗</button>
                <button className="btn-ghost" style={{ padding: '10px', borderRadius: 8, fontSize: 11 }}>Explorers ↗</button>
             </div>
          </div>
        </div>

        {/* RIGHT: Big Chart & Markets */}
        <div style={{ flex: '1 1 800px' }}>
          <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--cmc-border)', marginBottom: 24 }}>
             {['Chart', 'Markets', 'News', 'Social', 'Historical'].map((t, idx) => (
               <div key={t} style={{ 
                 padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                 color: idx === 0 ? 'var(--cmc-blue)' : 'var(--text-muted)',
                 borderBottom: idx === 0 ? '2px solid var(--cmc-blue)' : 'none'
               }}>{t}</div>
             ))}
          </div>

          <div style={{ minHeight: 500, background: 'var(--bg-card)', border: '1px solid var(--cmc-border)', borderRadius: 16, overflow: 'hidden' }}>
             <ProTradingChart symbol={coin.symbol} coinName={coin.name} logo={coin.logo} />
          </div>

          <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div className="card-cmc" style={{ padding: 24 }}>
               <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 20 }}>Converter</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 <div style={{ background: 'var(--bg-input)', border: '1px solid var(--cmc-border)', borderRadius: 12, padding: '12px 16px' }}>
                   <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>{coin.symbol}</div>
                   <input type="number" value={converter.crypto} onChange={e => setConverter({ crypto: e.target.value, usd: e.target.value * coin.price })}
                          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, fontWeight: 700, width: '100%', outline: 'none' }} />
                 </div>
                 <div style={{ textAlign: 'center', fontSize: 20, color: 'var(--text-muted)' }}>⇅</div>
                 <div style={{ background: 'var(--bg-input)', border: '1px solid var(--cmc-border)', borderRadius: 12, padding: '12px 16px' }}>
                   <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>USD</div>
                   <input type="number" value={converter.usd} onChange={e => setConverter({ usd: e.target.value, crypto: e.target.value / coin.price })}
                          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, fontWeight: 700, width: '100%', outline: 'none' }} />
                 </div>
               </div>
            </div>

            <div className="card-cmc" style={{ padding: 24 }}>
               <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 16 }}>Performance Summary</h3>
               {[
                 { label: 'All Time High', val: formatCurrency(coin.price * 1.4), cap: 'Nov 12, 2021', change: -45.2, color: 'var(--cmc-red)' },
                 { label: 'All Time Low', val: formatCurrency(coin.price * 0.1), cap: 'Aug 15, 2018', change: 1245.8, color: 'var(--cmc-green)' },
                 { label: 'Market Dominance', val: '1.24%' }
               ].map((p, i) => (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                   <div>
                     <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{p.label}</div>
                     <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{p.cap}</div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{p.val}</div>
                     {p.change && <div style={{ fontSize: 11, color: p.color, fontWeight: 700 }}>{p.change > 0 ? '+' : ''}{p.change}%</div>}
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
