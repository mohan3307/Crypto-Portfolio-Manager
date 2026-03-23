import React, { useState, useEffect } from 'react';
import { getListings } from '../services/api';
import { formatCurrency } from '../utils/format';
import GlobalStats from '../components/Dashboard/GlobalStats';

const NFTS = [
  { rank: 1, name: 'Bored Ape Yacht Club', volume: 15432, sales: 24, floorPrice: 12.5, mcap: 125000, owners: 5400, logo: 'https://i.seadn.io/gae/Ju9Cqy-mHCzhM97W_VDe63U7T_uSOfu6_L_q7k8u9L9W-T5S-r0U6c-U_c6-c6?auto=format&w=256' },
  { rank: 2, name: 'Mutant Ape Yacht Club', volume: 8432, sales: 45, floorPrice: 2.1, mcap: 45000, owners: 12000, logo: 'https://i.seadn.io/gae/lHex9ppNo0_Y_H89vBoZ677fH0Z7R12W-T-Z_v9?auto=format&w=256' },
  { rank: 3, name: 'Pudgy Penguins', volume: 5432, sales: 12, floorPrice: 9.8, mcap: 88000, owners: 4800, logo: 'https://i.seadn.io/gae/pS--Z_v9?auto=format&w=256' },
  { rank: 4, name: 'Azuki', volume: 3219, sales: 8, floorPrice: 6.4, mcap: 64000, owners: 5100, logo: 'https://i.seadn.io/gae/B8_v9?auto=format&w=256' },
  { rank: 5, name: 'Doodles', volume: 1219, sales: 52, floorPrice: 1.2, mcap: 12000, owners: 10000, logo: 'https://i.seadn.io/gae/A--Z_v9?auto=format&w=256' },
];

export default function NFTPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <GlobalStats />

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
            {NFTS.map((nft) => (
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
