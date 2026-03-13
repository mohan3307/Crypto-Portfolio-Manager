import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getListings, addToPortfolio, addToWatchlist } from '../services/api';
import { formatCurrency, formatPercent, getChangeClass } from '../utils/format';

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

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Crypto Market</div>
          <div className="page-subtitle">Top {listings.length} cryptocurrencies · {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}` : ''}</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: '200px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input placeholder="Search coins..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tabs" style={{ margin: 0 }}>
          {['all', 'gainers', 'losers'].map(f => (
            <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'gainers' ? '🟢 Gainers' : '🔴 Losers'}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('rank')}># <SortIcon col="rank" /></th>
                <th onClick={() => handleSort('name')}>Name <SortIcon col="name" /></th>
                <th onClick={() => handleSort('price')}>Price <SortIcon col="price" /></th>
                <th onClick={() => handleSort('change24h')}>24h % <SortIcon col="change24h" /></th>
                <th onClick={() => handleSort('marketCap')}>Market Cap <SortIcon col="marketCap" /></th>
                <th onClick={() => handleSort('volume24h')}>Volume (24h) <SortIcon col="volume24h" /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(coin => (
                <tr key={coin.id}>
                  <td><span className="rank-badge">#{coin.rank}</span></td>
                  <td>
                    <div className="coin-cell">
                      <img src={coin.logo} alt={coin.symbol} className="coin-logo"
                        onError={e => { e.target.style.display = 'none'; }} />
                      <div>
                        <div className="coin-name">{coin.name}</div>
                        <div className="coin-symbol">{coin.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'Space Mono', fontWeight: 600 }}>{formatCurrency(coin.price)}</td>
                  <td>
                    <span className={`badge ${coin.change24h >= 0 ? 'badge-green' : 'badge-red'}`}>
                      {formatPercent(coin.change24h)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatCurrency(coin.marketCap)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatCurrency(coin.volume24h)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => addWatch(coin)} title="Add to Watchlist">👁</button>
                      <button className="btn btn-primary btn-sm" onClick={() => addPortfolio(coin)}>+ Add</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
