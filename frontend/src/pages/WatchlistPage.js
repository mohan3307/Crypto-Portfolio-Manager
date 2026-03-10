import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getWatchlist, removeFromWatchlist, getListings } from '../services/api';
import { formatCurrency, formatPercent, getChangeClass } from '../utils/format';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [w, l] = await Promise.all([getWatchlist(), getListings()]);
      setWatchlist(w.data.coins);
      setListings(l.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 30000); return () => clearInterval(i); }, []);

  const handleRemove = async (coinId, name) => {
    try {
      await removeFromWatchlist(coinId);
      toast.success(`${name} removed from watchlist`);
      fetchData();
    } catch (e) { toast.error('Failed to remove'); }
  };

  const enrichedWatchlist = watchlist.map(wCoin => {
    const live = listings.find(l => String(l.id) === wCoin.coinId);
    return { ...wCoin, ...(live || {}) };
  });

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Watchlist</div>
          <div className="page-subtitle">{watchlist.length} coins monitored · Add coins from Market page</div>
        </div>
      </div>

      {enrichedWatchlist.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <h3>Your watchlist is empty</h3>
            <p>Go to the Market page and click 👁 to add coins to your watchlist</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Coin</th>
                  <th>Price</th>
                  <th>24h Change</th>
                  <th>Market Cap</th>
                  <th>Volume (24h)</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrichedWatchlist.map(coin => (
                  <tr key={coin.coinId}>
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
                    <td style={{ fontFamily: 'Space Mono', fontWeight: 600 }}>
                      {coin.price ? formatCurrency(coin.price) : '—'}
                    </td>
                    <td>
                      {coin.change24h !== undefined ? (
                        <span className={`badge ${coin.change24h >= 0 ? 'badge-green' : 'badge-red'}`}>
                          {formatPercent(coin.change24h)}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {coin.marketCap ? formatCurrency(coin.marketCap) : '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {coin.volume24h ? formatCurrency(coin.volume24h) : '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {new Date(coin.addedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRemove(coin.coinId, coin.name)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
