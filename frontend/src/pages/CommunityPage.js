import React, { useState, useEffect } from 'react';
import GlobalStats from '../components/Dashboard/GlobalStats';
import { getListings } from '../services/api';

const FEEDS = [
  { id: 1, author: 'Vitalik Buterin', handle: '@VitalikButerin', content: 'The shift to L2 is progressing faster than anticipated. Data availability is the next bottleneck.', time: '2h ago', likes: '12K', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
  { id: 2, author: 'CryptoWhale', handle: '@WhaleWatcher', content: 'Whale alert: 50,000 BTC moved from unknown wallet to Binance. Potential sell-off incoming.', time: '5h ago', likes: '8K', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png' },
  { id: 3, author: 'Solana Foundation', handle: '@Solana', content: 'Mainnet-beta performance is nominal. 65,000 TPS sustained with zero downtime in the last 24h.', time: '8h ago', likes: '15K', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png' },
  { id: 4, author: 'CZ Binance', handle: '@cz_binance', content: 'SAFU. We are constantly monitoring the liquidity vectors to ensure user safety.', time: '1d ago', likes: '45K', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png' },
];

export default function CommunityPage() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    getListings().then(res => setListings(res.data.data));
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <GlobalStats listings={listings} />

      <header style={{ margin: '32px 0 40px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>NEURAL_NETWORK_FEED</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>Community Hub</h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {FEEDS.map(post => (
          <div key={post.id} className="card-cmc" style={{ padding: 32, borderRadius: 20 }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <img src={post.logo} width={48} height={48} style={{ borderRadius: '50%', background: '#fff' }} alt="" />
              <div>
                <div style={{ fontWeight: 900, color: '#fff', fontSize: 16 }}>{post.author} <span style={{ color: 'var(--cmc-blue)', fontSize: 12, fontWeight: 700, marginLeft: 8 }}>{post.handle}</span></div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{post.time}</div>
              </div>
            </div>
            <p style={{ fontSize: 15, color: '#fff', lineHeight: 1.6, margin: '0 0 24px 0', fontWeight: 500 }}>{post.content}</p>
            <div style={{ display: 'flex', gap: 24, borderTop: '1px solid var(--cmc-border)', paddingTop: 20 }}>
               <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 800 }}>❤️ {post.likes}</div>
               <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 800 }}>💬 Comment</div>
               <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 800 }}>🔁 Share</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
