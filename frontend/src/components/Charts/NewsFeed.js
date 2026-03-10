import React, { useState, useEffect } from 'react';

const RAW_HEADLINES = [
  { headline: 'Bitcoin surges past $70K as institutional demand continues to grow', sentiment: 'bullish', coin: 'BTC', time: '2m ago' },
  { headline: 'Ethereum Layer-2 TVL hits all-time high of $45 billion', sentiment: 'bullish', coin: 'ETH', time: '5m ago' },
  { headline: 'SEC approves three more spot Bitcoin ETF applications from major funds', sentiment: 'bullish', coin: 'BTC', time: '11m ago' },
  { headline: 'Solana decentralized exchanges surpass $50B monthly trading volume', sentiment: 'bullish', coin: 'SOL', time: '18m ago' },
  { headline: 'Crypto market cap reaches $2.8 trillion, highest since November 2021', sentiment: 'bullish', coin: 'TOTAL', time: '25m ago' },
  { headline: 'PEPE and DOGE lead meme coin rally with 20%+ gains in 24 hours', sentiment: 'bullish', coin: 'PEPE', time: '33m ago' },
  { headline: 'Federal Reserve signals potential rate cuts — boosting risk assets', sentiment: 'bullish', coin: 'MACRO', time: '41m ago  ' },
  { headline: 'Ripple wins major legal battle; XRP surges 8% on the news', sentiment: 'bullish', coin: 'XRP', time: '52m ago' },
  { headline: 'MicroStrategy increases Bitcoin holdings to 200,000 BTC', sentiment: 'bullish', coin: 'BTC', time: '1h ago' },
  { headline: 'Chainlink CCIP mainnet sees explosive DeFi protocol adoption', sentiment: 'bullish', coin: 'LINK', time: '1h ago' },
  { headline: 'Binance reports record $120B monthly trading volume for Q1 2025', sentiment: 'bullish', coin: 'BNB', time: '2h ago' },
  { headline: 'TON blockchain onboards 200 million Telegram users to Web3', sentiment: 'bullish', coin: 'TON', time: '2h ago' },
  { headline: 'Bitcoin mining difficulty hits new ATH as hashrate surges', sentiment: 'neutral', coin: 'BTC', time: '3h ago' },
  { headline: 'Crypto hedge funds report average 85% returns in 2024', sentiment: 'bullish', coin: 'FUND', time: '3h ago' },
  { headline: 'Crypto exchange outflows increase — possible accumulation signal', sentiment: 'neutral', coin: 'BTC', time: '4h ago' },
  { headline: 'China reiterates crypto ban enforcement; markets dip then recover', sentiment: 'bearish', coin: 'TETHER', time: '5h ago' },
  { headline: 'Altcoin season index hits 78 — all coins outperforming Bitcoin', sentiment: 'bullish', coin: 'ALT', time: '5h ago' },
  { headline: 'Ethereum gas fees average 3 gwei in record low congestion period', sentiment: 'bullish', coin: 'ETH', time: '6h ago' },
  { headline: 'Avalanche announces $100M DeFi ecosystem grants program', sentiment: 'bullish', coin: 'AVAX', time: '7h ago' },
  { headline: 'NFT market sees revival with 42% volume increase week-over-week', sentiment: 'bullish', coin: 'NFT', time: '8h ago' },
  { headline: 'Central banks worldwide accelerating CBDC development programs', sentiment: 'neutral', coin: 'MACRO', time: '9h ago' },
  { headline: 'Dogecoin whale accumulates $300M position ahead of DOGE ETF news', sentiment: 'bullish', coin: 'DOGE', time: '10h ago' },
  { headline: 'Render Network surges 15% on AI compute demand boom', sentiment: 'bullish', coin: 'RNDR', time: '11h ago' },
  { headline: 'Polkadot parachains reach 1B+ total transactions milestone', sentiment: 'bullish', coin: 'DOT', time: '12h ago' },
  { headline: 'Galaxy Digital reports $2.1B crypto VC funding in Q1 2025', sentiment: 'bullish', coin: 'VC', time: '13h ago' },
  { headline: 'Cardano Hydra Layer-2 achieves 1M TPS in testnet benchmark', sentiment: 'bullish', coin: 'ADA', time: '14h ago' },
  { headline: 'Bitcoin ETFs see record $2.4B net inflows in single day', sentiment: 'bullish', coin: 'BTC', time: '1d ago' },
  { headline: 'Stablecoin supply surpasses $200B as institutional demand grows', sentiment: 'neutral', coin: 'USDT', time: '1d ago' },
];

const SENTIMENT_CONFIG = {
  bullish: { color: '#00d4aa', bg: 'rgba(0,212,170,0.12)', icon: '▲', label: 'BULLISH' },
  bearish: { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',  icon: '▼', label: 'BEARISH' },
  neutral: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '◆', label: 'NEUTRAL' },
};

export default function NewsFeed({ compact = false }) {
  const [headlines] = useState(() => [...RAW_HEADLINES].sort(() => Math.random() - 0.5));
  const [current, setCurrent] = useState(0);
  const [flash, setFlash]     = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setFlash(true);
      setTimeout(() => {
        setCurrent(c => (c + 1) % headlines.length);
        setFlash(false);
      }, 200);
    }, 5500);
    return () => clearInterval(iv);
  }, [headlines.length]);

  if (compact) {
    // Scrolling ticker tape mode
    return (
      <div style={{ overflow: 'hidden', position: 'relative', height: 36, display: 'flex', alignItems: 'center', background: 'rgba(0,212,170,0.04)', borderRadius: 8, border: '1px solid rgba(0,212,170,0.12)' }}>
        <div style={{ padding: '0 12px', fontSize: 10, fontWeight: 700, color: '#00d4aa', whiteSpace: 'nowrap', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)', marginRight: 12 }}>
          📰 CRYPTO NEWS
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{
            opacity: flash ? 0 : 1, transition: 'opacity 0.2s',
            fontSize: 12, color: '#8899b4', whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            <span style={{ color: SENTIMENT_CONFIG[headlines[current]?.sentiment]?.color, fontWeight: 700, marginRight: 8 }}>
              {SENTIMENT_CONFIG[headlines[current]?.sentiment]?.icon}
            </span>
            {headlines[current]?.headline}
          </div>
        </div>
        <div style={{ padding: '0 12px', fontSize: 10, color: '#3d5470', flexShrink: 0 }}>
          {headlines[current]?.time}
        </div>
      </div>
    );
  }

  // Full card mode
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>📰</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>Crypto Headlines</div>
          <div style={{ fontSize: 11, color: '#4a5e78' }}>Live market news · auto-updating</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#00d4aa' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4aa', display: 'inline-block', animation: 'livepulse 1.8s infinite' }} />
          LIVE
        </div>
      </div>
      <div>
        {headlines.slice(0, 8).map((item, idx) => {
          const sc = SENTIMENT_CONFIG[item.sentiment];
          const isCurrent = idx === current;
          return (
            <div key={idx} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              padding: '10px 16px',
              background: isCurrent ? 'rgba(255,255,255,0.025)' : 'transparent',
              borderLeft: `3px solid ${isCurrent ? sc.color : 'transparent'}`,
              borderBottom: idx < 7 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              transition: '0.3s',
            }}>
              <div style={{
                padding: '3px 7px', borderRadius: 6, background: sc.bg,
                fontSize: 10, fontWeight: 700, color: sc.color,
                flexShrink: 0, marginTop: 2, fontFamily: 'JetBrains Mono,monospace',
              }}>
                {sc.icon} {item.coin}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: isCurrent ? '#e2e8f0' : '#7b94b8', lineHeight: 1.4, transition: '0.3s' }}>
                  {item.headline}
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#3d5470', flexShrink: 0, marginTop: 2 }}>{item.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
