import React, { useState, useEffect } from 'react';
import { getListings, getNFTs } from '../services/api';
import GlobalStats from '../components/Dashboard/GlobalStats';

export default function NFTPage() {
  const [listings, setListings] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getListings(), getNFTs()])
      .then(([lRes, nRes]) => {
        setListings(lRes.data.data);
        setNfts(nRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <GlobalStats listings={listings} />

      <header style={{ margin: '32px 0 40px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>DIGITAL_COLLECTIBLES_v4</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>Top NFT Collections</h1>
      </header>

      <div className="v4-scroller" style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--cmc-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)' }}>#</th>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid var(--cmc-border)' }}>Collection</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Volume (24h)</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Floor Price</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Market Cap</th>
              <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Owners</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', borderBottom: '1px solid var(--cmc-border)' }}>Sales</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="7" style={{ padding: 40, textAlign: 'center' }}>Loading NFT Data...</td></tr> : nfts.map((nft) => (
              <tr key={nft.name} className="v4-row" style={{ borderBottom: '1px solid var(--cmc-border)' }}>
                <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 700 }}>{nft.rank}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🖼️</div>
                    <span style={{ fontWeight: 800, color: '#fff', fontSize: 14 }}>{nft.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#fff' }}>{nft.volume} ETH</td>
                <td style={{ padding: '16px', textAlign: 'right', color: '#fff' }}>{nft.floorPrice} ETH</td>
                <td style={{ padding: '16px', textAlign: 'right', color: '#fff' }}>{nft.mcap.toLocaleString()} ETH</td>
                <td style={{ padding: '16px', textAlign: 'right', color: '#fff' }}>{nft.owners.toLocaleString()}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--cmc-green)', fontWeight: 800 }}>{nft.sales} Sales</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .v4-row:hover { background: var(--bg-card-hover) !important; }
      `}</style>
    </div>
  );
}
