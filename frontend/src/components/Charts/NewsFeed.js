import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';

const RAW_HEADLINES = [
  { headline: 'Bitcoin surges past $70K as institutional demand continues to grow', sentiment: 'bullish', coin: 'BTC', time: '2m ago' },
  { headline: 'Ethereum Layer-2 TVL hits all-time high of $45 billion', sentiment: 'bullish', coin: 'ETH', time: '5m ago' },
  { headline: 'SEC approves three more spot Bitcoin ETF applications from major funds', sentiment: 'bullish', coin: 'BTC', time: '11m ago' },
  { headline: 'Solana decentralized exchanges surpass $50B monthly trading volume', sentiment: 'bullish', coin: 'SOL', time: '18m ago' },
  { headline: 'Crypto market cap reaches $2.8 trillion, highest since November 2021', sentiment: 'bullish', coin: 'TOTAL', time: '25m ago' },
];

const SENTIMENT_CONFIG = {
  bullish: { color: '#00d4aa', bg: 'rgba(0,212,170,0.12)', icon: '▲', label: 'BULLISH' },
  bearish: { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',  icon: '▼', label: 'BEARISH' },
  neutral: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '◆', label: 'NEUTRAL' },
};

export default function NewsFeed({ compact = false }) {
  const { newsHeadlines } = useMarket();
  const [current, setCurrent] = useState(0);
  const [flash, setFlash]     = useState(false);

  // Combine live news with initial fallback headlines
  const headlines = newsHeadlines.length > 0 ? newsHeadlines : RAW_HEADLINES;

  useEffect(() => {
    if (headlines.length === 0) return;
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
