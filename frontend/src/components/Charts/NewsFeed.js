import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';

const RAW_HEADLINES = [
  { headline: 'BITCOIN SURGES PAST $70K AS INSTITUTIONAL ACCUMULATION ACCELERATES', sentiment: 'bullish', coin: 'BTC', time: '2M' },
  { headline: 'ETHEREUM L2 TVL SCALE REACHES CRITICAL THRESHOLD OF $45B', sentiment: 'bullish', coin: 'ETH', time: '5M' },
  { headline: 'SEC AUTHORIZES MULTIPLE SPOT ETF INSTRUMENTS FOR PRIME FUNDS', sentiment: 'bullish', coin: 'BTC', time: '11M' },
  { headline: 'SOLANA DEX VELOCITY SURPASSES $50B MONTHLY RECURRENCE', sentiment: 'bullish', coin: 'SOL', time: '18M' },
  { headline: 'GLOBAL AGGREGATE MARKET CAP RECOVERS TOWARDS $2.8T PEAK', sentiment: 'bullish', coin: 'TOTAL', time: '25M' },
];

const SENTIMENT_CONFIG = {
  bullish: { color: 'var(--green)', bg: 'rgba(0,230,118,0.1)', icon: '◈', label: 'BULLISH' },
  bearish: { color: 'var(--red)', bg: 'rgba(255,82,82,0.1)', icon: '◈', label: 'BEARISH' },
  neutral: { color: 'var(--gold)', bg: 'rgba(255,183,77,0.1)', icon: '◈', label: 'NEUTRAL' },
};

export default function NewsFeed({ compact = false }) {
  const { newsHeadlines } = useMarket();
  const [current, setCurrent] = useState(0);
  const [flash, setFlash]     = useState(false);

  const headlines = newsHeadlines.length > 0 ? newsHeadlines : RAW_HEADLINES;

  useEffect(() => {
    if (headlines.length === 0) return;
    const iv = setInterval(() => {
      setFlash(true);
      setTimeout(() => {
        setCurrent(c => (c + 1) % headlines.length);
        setFlash(false);
      }, 200);
    }, 6000);
    return () => clearInterval(iv);
  }, [headlines.length]);

  if (compact) {
    return (
      <div className="glass-ticker" style={{ height: 40, display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: 12, border: '1px solid rgba(59, 130, 246, 0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '0 16px', fontSize: 10, fontWeight: 900, color: 'var(--blue)', whiteSpace: 'nowrap', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)', letterSpacing: 1.5 }}>
          NEURAL INTEL
        </div>
        <div style={{ flex: 1, overflow: 'hidden', padding: '0 16px' }}>
          <div style={{ opacity: flash ? 0 : 1, transition: '0.3s', fontSize: 12, color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <span style={{ color: SENTIMENT_CONFIG[headlines[current]?.sentiment]?.color, marginRight: 10 }}>●</span>
            {headlines[current]?.headline.toUpperCase()}
          </div>
        </div>
        <div style={{ padding: '0 16px', fontSize: 10, color: '#4a5e78', fontWeight: 900, fontFamily: 'Space Mono' }}>
          T-{headlines[current]?.time}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-heavy" style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 20 }}>📡</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 14, color: '#fff', letterSpacing: -0.2 }}>TACTICAL FEED</div>
            <div style={{ fontSize: 10, color: '#4a5e78', fontWeight: 800 }}>LIVE NEURAL HEADLINES</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 900, color: 'var(--green)', letterSpacing: 1 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 10px var(--green)' }} />
          SYNC_ACTIVE
        </div>
      </div>
      
      <div style={{ padding: 10 }}>
        {headlines.slice(0, 6).map((item, idx) => {
          const sc = SENTIMENT_CONFIG[item.sentiment];
          const isCurrent = idx === current;
          return (
            <div key={idx} className="news-entry" style={{
              display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 20px', borderRadius: 16,
              background: isCurrent ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
              transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              marginBottom: 4,
              border: isCurrent ? '1px solid rgba(59, 130, 246, 0.1)' : '1px solid transparent'
            }}>
              <div style={{
                padding: '4px 8px', borderRadius: 4, background: sc.bg,
                fontSize: 9, fontWeight: 900, color: sc.color,
                letterSpacing: 0.5, flexShrink: 0, marginTop: 2, fontFamily: 'Space Mono'
              }}>
                {item.coin.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: isCurrent ? '#fff' : '#8899b4', fontWeight: isCurrent ? 800 : 500, lineHeight: 1.5 }}>
                  {item.headline.toUpperCase()}
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#4a5e78', fontWeight: 900, flexShrink: 0, marginTop: 4, fontFamily: 'Space Mono' }}>{item.time}</div>
            </div>
          );
        })}
      </div>

      <style>{`
        .news-entry:hover { background: rgba(255,255,255,0.02) !important; cursor: pointer; }
      `}</style>
    </div>
  );
}
