import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getListings, addToPortfolio, addToWatchlist } from '../services/api';
import { formatCurrency, formatPercent, getChangeClass } from '../utils/format';
import MarketSparkline from '../components/Charts/MarketSparkline';

export default function MarketPage() {
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [sortDir, setSortDir] = useState('asc');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchListings = async () => {
    try {
      const res = await getListings();
      setListings(res.data.data);
      setLastUpdated(res.data.lastUpdated);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchListings(); const i = setInterval(fetchListings, 30000); return () => clearInterval(i); }, []);

  useEffect(() => {
    let result = [...listings];
    if (search) result = result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'gainers') result = result.filter(c => c.change24h > 0);
    if (filter === 'losers') result = result.filter(c => c.change24h < 0);
    result.sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    setFiltered(result);
  }, [listings, search, sortBy, sortDir, filter]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <span style={{ opacity: 0.3 }}>↕</span>;
    return <span>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const addPortfolio = async (coin) => {
    const qty = prompt(`Add ${coin.name} to portfolio.\nEnter quantity:`);
    if (!qty || isNaN(qty)) return;
    try {
      await addToPortfolio({ coinId: String(coin.id), symbol: coin.symbol, name: coin.name, logo: coin.logo, quantity: parseFloat(qty), buyPrice: coin.price });
      toast.success(`${coin.name} added to portfolio!`);
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to add'); }
  };

  const addWatch = async (coin) => {
    try {
      await addToWatchlist({ coinId: String(coin.id), symbol: coin.symbol, name: coin.name, logo: coin.logo });
      toast.success(`${coin.name} added to watchlist!`);
    } catch (e) { toast.error(e.response?.data?.error || 'Already in watchlist'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  // Global Market Stats (Simulated Aggregates)
  const totalMCap = listings.reduce((a, b) => a + b.marketCap, 0);
  const totalVol = listings.reduce((a, b) => a + b.volume24h, 0);
  const btcDom = (listings.find(c => c.symbol === 'BTC')?.marketCap || 0) / totalMCap * 100;
  const ethDom = (listings.find(c => c.symbol === 'ETH')?.marketCap || 0) / totalMCap * 100;

  return (
    <div style={{ maxWidth: 1500, margin: '0 auto', padding: '0 10px' }}>
      
      {/* ── Global Market Board ── */}
      <div style={{ 
        display: 'flex', gap: 30, marginBottom: 30, padding: '20px 30px', 
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: 20, backdropFilter: 'blur(20px)' 
      }}>
        <div>
          <div style={{ fontSize: 10, color: '#4a5e78', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Global Market Cap</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#eef2fa' }}>{formatCurrency(totalMCap)}</div>
          <div style={{ fontSize: 11, color: 'var(--green)' }}>+2.4% 24h</div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.05)' }} />
        <div>
          <div style={{ fontSize: 10, color: '#4a5e78', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>24h Global Volume</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#eef2fa' }}>{formatCurrency(totalVol)}</div>
          <div style={{ fontSize: 11, color: '#8899b4' }}>Institutional Flow</div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.05)' }} />
        <div>
          <div style={{ fontSize: 10, color: '#4a5e78', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Market Dominance</div>
          <div style={{ display: 'flex', gap: 15 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f7931a' }}>BTC {btcDom.toFixed(1)}%</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#627eea' }}>ETH {ethDom.toFixed(1)}%</div>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
           <div style={{ fontSize: 10, color: '#4a5e78', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>System Hub</div>
           <span className="badge badge-green">LIVE TERMINAL API</span>
        </div>
      </div>

      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="page-title">Institutional Market Intelligence</div>
          <div className="page-subtitle">Real-time diagnostics for {listings.length} premium digital assets.</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input placeholder="Search assets (BTC, Solana, etc.)..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tabs" style={{ margin: 0 }}>
          {['all', 'gainers', 'losers'].map(f => (
            <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All Assets' : f === 'gainers' ? '🚀 Top Performers' : '🩸 Top Underperformers'}
            </button>
          ))}
        </div>
      </div>

      <div className="card glass-heavy" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="pro-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('rank')}># <SortIcon col="rank" /></th>
                <th onClick={() => handleSort('name')}>Asset <SortIcon col="name" /></th>
                <th onClick={() => handleSort('price')}>Price <SortIcon col="price" /></th>
                <th onClick={() => handleSort('change24h')}>24h % <SortIcon col="change24h" /></th>
                <th onClick={() => handleSort('marketCap')}>Market Cap <SortIcon col="marketCap" /></th>
                <th>Circulating Supply</th>
                <th>Last 7 Days</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(coin => (
                <tr key={coin.id}>
                  <td><span style={{ fontSize: 11, color: '#4a5e78', fontWeight: 700 }}>{coin.rank}</span></td>
                  <td>
                    <div className="coin-cell">
                      <img src={coin.logo} alt={coin.symbol} className="coin-logo"
                        onError={e => { e.target.style.display = 'none'; }} />
                      <div>
                        <div className="coin-name" style={{ fontSize: 13 }}>{coin.name}</div>
                        <div className="coin-symbol" style={{ fontSize: 11 }}>{coin.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'Space Mono', fontWeight: 700, fontSize: 14 }}>{formatCurrency(coin.price)}</td>
                  <td>
                    <span className={`badge ${coin.change24h >= 0 ? 'badge-green' : 'badge-red'}`} style={{ minWidth: 60, textAlign: 'center' }}>
                      {formatPercent(coin.change24h)}
                    </span>
                  </td>
                  <td style={{ color: '#eef2fa', fontSize: 12, fontWeight: 600 }}>{formatCurrency(coin.marketCap)}</td>
                  <td style={{ color: '#8899b4', fontSize: 11 }}>
                    <div style={{ fontWeight: 700, color: '#eef2fa' }}>{ (coin.circulatingSupply / 1000000).toFixed(1) }M {coin.symbol}</div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ width: coin.maxSupply ? `${(coin.circulatingSupply / coin.maxSupply * 100)}%` : '65%', height: '100%', background: 'var(--blue)' }} />
                    </div>
                  </td>
                  <td>
                    <MarketSparkline data={coin.sparkline7d} change={coin.change24h} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => addWatch(coin)} title="Add to Watchlist" style={{ padding: '6px' }}>👁</button>
                      <button className="btn btn-primary btn-sm" onClick={() => addPortfolio(coin)}>+ Buy</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .pro-table th {
          padding: 16px 20px !important;
          font-size: 10px !important;
          color: #4a5e78 !important;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
        }
        .pro-table td {
          padding: 20px !important;
          border-bottom: 1px solid rgba(255,255,255,0.02) !important;
        }
        .pro-table tr:hover {
          background: rgba(255,255,255,0.01) !important;
        }
        .glass-heavy {
          background: rgba(255, 255, 255, 0.02) !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
    </div>
  );
}
