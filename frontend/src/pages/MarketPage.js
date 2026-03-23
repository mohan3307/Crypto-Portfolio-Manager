import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';
import { getListings, addToPortfolio, addToWatchlist } from '../services/api';
import { formatCurrency } from '../utils/format';
import MarketSparkline from '../components/Charts/MarketSparkline';
import GlobalStats from '../components/Dashboard/GlobalStats';
import SpotlightCards from '../components/Dashboard/SpotlightCards';

const NETWORK_FILTERS = ['All Networks', 'Solana', 'Ethereum', 'BSC', 'Base', 'Polygon', 'Avalanche'];
const CATEGORY_FILTERS = ['Top', 'Trending', 'Memes', 'Solana Ecosystem', 'AI', 'DeFi'];

export default function MarketPage() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('marketCap');
  const [sortDir, setSortDir] = useState('desc');
  const [filter, setFilter] = useState('all');
  const [activeNetwork, setActiveNetwork] = useState('All Networks');
  const [activeCategory, setActiveCategory] = useState('Top');
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const res = await getListings();
      setListings(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    fetchListings(); 
    const i = setInterval(fetchListings, 30000); 
    return () => clearInterval(i); 
  }, []);

  useEffect(() => {
    let result = [...listings];
    if (search) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.symbol.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filter === 'gainers') result = result.filter(c => c.change24h > 0);
    if (filter === 'losers') result = result.filter(c => c.change24h < 0);
    
    // Mocking 1h and 7d if missing
    result = result.map(c => ({
      ...c,
      change1h: c.change1h || (Math.random() * 2 - 1),
      change7d: c.change7d || (c.change24h * 3 + (Math.random() * 10 - 5))
    }));

    result.sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    setFiltered(result);
  }, [listings, search, sortBy, sortDir, filter]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const addPortfolio = (e, coin) => {
    e.stopPropagation();
    const qty = prompt(`Enter quantity for ${coin.symbol.toUpperCase()}:`);
    if (!qty || isNaN(qty)) return;
    addToPortfolio({ 
      coinId: String(coin.id), 
      symbol: coin.symbol, 
      name: coin.name, 
      logo: coin.logo, 
      quantity: parseFloat(qty), 
      buyPrice: coin.price 
    }).then(() => toast.success('Added to Portfolio')).catch(() => toast.error('Error adding to portfolio'));
  };

  const addWatch = (e, coin) => {
    e.stopPropagation();
    addToWatchlist({ 
      coinId: String(coin.id), 
      symbol: coin.symbol, 
      name: coin.name, 
      logo: coin.logo 
    }).then(() => toast.success('Added to Watchlist')).catch(() => toast.error('Already in Watchlist'));
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="v4-ping-large" />
    </div>
  );

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      
      <GlobalStats listings={listings} />

      <div style={{ padding: '32px 0 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 16 }}>Today's Cryptocurrency Prices by Market Cap</h1>
        <SpotlightCards 
          trending={listings.slice(0, 3).map(c => ({ name: `${c.name}`, symbol: c.symbol, change: c.change24h, logo: c.logo }))} 
          gainers={listings.sort((a,b) => b.change24h - a.change24h).slice(0, 3).map(c => ({ name: `${c.name}`, symbol: c.symbol, change: c.change24h, logo: c.logo }))} 
        />
      </div>

      {/* ── Filter Bars ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 8 }}>
          {CATEGORY_FILTERS.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? 'var(--bg-elevated)' : 'transparent',
                color: activeCategory === cat ? 'var(--cmc-blue)' : 'var(--text-muted)',
                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
                border: activeCategory === cat ? 'none' : '1px solid var(--cmc-border)'
              }}>{cat}</button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', maxWidth: '70%' }}>
            {NETWORK_FILTERS.map(net => (
              <button key={net} onClick={() => setActiveNetwork(net)}
                style={{
                  background: activeNetwork === net ? 'var(--cmc-blue)' : 'var(--bg-input)',
                  color: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                  border: '1px solid var(--cmc-border)'
                }}>{net}</button>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ border: '1px solid var(--cmc-border)', background: 'var(--bg-input)', padding: '0 12px', display: 'flex', alignItems: 'center', borderRadius: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 14, marginRight: 8 }}>🔍</span>
                <input 
                  style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', fontSize: 13, height: 38, width: 200 }}
                  placeholder="Search coins..." value={search} onChange={e => setSearch(e.target.value)} 
                />
              </div>
          </div>
        </div>
      </div>

      <div className="v4-scroller" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--cmc-border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>
                <th onClick={() => handleSort('rank')} style={{ padding: '16px 12px 16px 24px', textAlign: 'left', cursor: 'pointer', borderBottom: '1px solid var(--cmc-border)' }}>#</th>
                <th onClick={() => handleSort('name')} style={{ padding: '16px 12px', textAlign: 'left', cursor: 'pointer', borderBottom: '1px solid var(--cmc-border)' }}>Name</th>
                <th onClick={() => handleSort('price')} style={{ padding: '16px 12px', textAlign: 'right', cursor: 'pointer', borderBottom: '1px solid var(--cmc-border)' }}>Price</th>
                <th onClick={() => handleSort('change1h')} style={{ padding: '16px 12px', textAlign: 'right', cursor: 'pointer', borderBottom: '1px solid var(--cmc-border)' }}>1h %</th>
                <th onClick={() => handleSort('change24h')} style={{ padding: '16px 12px', textAlign: 'right', cursor: 'pointer', borderBottom: '1px solid var(--cmc-border)' }}>24h %</th>
                <th onClick={() => handleSort('change7d')} style={{ padding: '16px 12px', textAlign: 'right', cursor: 'pointer', borderBottom: '1px solid var(--cmc-border)' }}>7d %</th>
                <th onClick={() => handleSort('marketCap')} style={{ padding: '16px 12px', textAlign: 'right', cursor: 'pointer', borderBottom: '1px solid var(--cmc-border)' }}>Market Cap</th>
                <th style={{ padding: '16px 12px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Volume (24h)</th>
                <th style={{ padding: '16px 12px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Circulating Supply</th>
                <th style={{ padding: '16px 12px', textAlign: 'center', borderBottom: '1px solid var(--cmc-border)' }}>Last 7 Days</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((coin) => (
                <tr key={coin.id} className="v4-row" onClick={() => navigate(`/coin/${coin.id}`)} 
                    style={{ borderBottom: '1px solid var(--cmc-border)', cursor: 'pointer' }}>
                  <td style={{ padding: '16px 12px 16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       <span onClick={(e) => addWatch(e, coin)} style={{ color: 'var(--text-dim)', fontSize: 16 }}>☆</span>
                       <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{coin.rank}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={coin.logo} width={24} height={24} style={{ borderRadius: '50%', background: '#fff' }} alt="" />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{coin.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{coin.symbol}</span>
                        <button onClick={(e) => { e.stopPropagation(); }} style={{ background: 'var(--bg-input)', color: 'var(--cmc-blue)', fontSize: 10, padding: '2px 8px', borderRadius: 4, visibility: 'hidden' }} className="buy-pill">Buy</button>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 600, color: '#fff', fontSize: 14 }}>{formatCurrency(coin.price)}</td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    <div style={{ color: coin.change1h >= 0 ? 'var(--cmc-green)' : 'var(--cmc-red)', fontSize: 14, fontWeight: 700 }}>
                      {coin.change1h >= 0 ? '▲' : '▼'} {Math.abs(coin.change1h).toFixed(2)}%
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    <div style={{ color: coin.change24h >= 0 ? 'var(--cmc-green)' : 'var(--cmc-red)', fontSize: 14, fontWeight: 700 }}>
                       {coin.change24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    <div style={{ color: coin.change7d >= 0 ? 'var(--cmc-green)' : 'var(--cmc-red)', fontSize: 14, fontWeight: 700 }}>
                       {coin.change7d >= 0 ? '▲' : '▼'} {Math.abs(coin.change7d).toFixed(2)}%
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{formatCurrency(coin.marketCap)}</div>
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{formatCurrency(coin.volume24h)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{Math.floor(coin.volume24h / coin.price).toLocaleString()} {coin.symbol}</div>
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'right', minWidth: 160 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                       <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{(coin.marketCap / coin.price).toLocaleString(undefined, { maximumFractionDigits: 0 })} {coin.symbol}</span>
                    </div>
                    <div style={{ height: 4, width: '100%', background: 'var(--bg-input)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: (Math.random() * 40 + 60) + '%', background: 'var(--cmc-gray)', borderRadius: 2 }} />
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px', width: 140 }}>
                    <div style={{ height: 36 }}>
                      <MarketSparkline data={coin.sparkline7d} change={coin.change7d} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      <style>{`
        .v4-row:hover { background: var(--bg-card-hover) !important; }
        .v4-row:hover .buy-pill { visibility: visible !important; }
        .v4-scroller::-webkit-scrollbar { width: 4px; height: 4px; }
        .v4-scroller::-webkit-scrollbar-thumb { background: var(--cmc-border); }
      `}</style>
    </div>
  );
}
