import React, { useState, useEffect, useRef } from 'react';

const fmt = (n, d = 2) => {
  if (!n) return '—';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(2) + 'K';
  return n >= 1 ? '$' + n.toFixed(d) : '$' + n.toFixed(6);
};
const fmtQ = n => n >= 1000 ? (n / 1000).toFixed(2) + 'K' : n.toFixed(3);
const fmtP = (n, d = 2) => {
  if (!n) return '—';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return n >= 1 ? n.toFixed(d) : n.toFixed(6);
};

function generateBook(midPrice, levels = 18) {
  const spread = midPrice * 0.0003;
  const asks = [], bids = [];
  let aTotal = 0, bTotal = 0;
  for (let i = 0; i < levels; i++) {
    const priceA = midPrice + spread / 2 + (i * midPrice * 0.0004) + Math.random() * midPrice * 0.0001;
    const sizeA = Math.pow(Math.random(), 1.8) * 8 + 0.05;
    const totalA = aTotal + sizeA * priceA;
    asks.push({ price: priceA, size: sizeA, total: sizeA * priceA, cumTotal: totalA });
    aTotal = totalA;

    const priceB = midPrice - spread / 2 - (i * midPrice * 0.0004) - Math.random() * midPrice * 0.0001;
    const sizeB = Math.pow(Math.random(), 1.8) * 8 + 0.05;
    const totalB = bTotal + sizeB * priceB;
    bids.push({ price: priceB, size: sizeB, total: sizeB * priceB, cumTotal: totalB });
    bTotal = totalB;
  }
  return { asks, bids, spread };
}

function generateTrades(midPrice, count = 20) {
  const trades = [];
  let t = Date.now();
  for (let i = 0; i < count; i++) {
    t -= Math.random() * 4000 + 500;
    const isBuy = Math.random() > 0.48;
    const price = midPrice * (1 + (Math.random() - 0.5) * 0.002);
    const size = Math.pow(Math.random(), 2) * 3 + 0.01;
    trades.push({ time: t, price, size, side: isBuy ? 'buy' : 'sell' });
  }
  return trades.sort((a, b) => b.time - a.time);
}

function DepthChart({ asks, bids, midPrice }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !asks.length || !bids.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.fillStyle = 'var(--bg-void,#04070d)'; ctx.fillRect(0, 0, W, H);

    const allBids = [...bids].reverse();
    const allAsks = [...asks];
    const maxCum = Math.max(allBids[allBids.length - 1]?.cumTotal || 0, allAsks[allAsks.length - 1]?.cumTotal || 0);
    const allPrices = [...allBids.map(b => b.price), ...allAsks.map(a => a.price)];
    const minPr = Math.min(...allPrices), maxPr = Math.max(...allPrices);
    const toX = p => (p - minPr) / (maxPr - minPr) * W;
    const toY = c => H - 6 - (c / maxCum) * (H - 16);

    // Bid fill
    const bidG = ctx.createLinearGradient(0, 0, 0, H);
    bidG.addColorStop(0, 'rgba(0,229,179,0.25)'); bidG.addColorStop(1, 'rgba(0,229,179,0.03)');
    ctx.beginPath();
    allBids.forEach((b, i) => {
      const x = toX(b.price), y = toY(b.cumTotal);
      if (i === 0) ctx.moveTo(x, H);
      ctx.lineTo(x, y);
    });
    ctx.lineTo(toX(allBids[allBids.length - 1]?.price || minPr), H);
    ctx.closePath(); ctx.fillStyle = bidG; ctx.fill();

    // Ask fill
    const askG = ctx.createLinearGradient(0, 0, 0, H);
    askG.addColorStop(0, 'rgba(240,62,85,0.25)'); askG.addColorStop(1, 'rgba(240,62,85,0.03)');
    ctx.beginPath();
    allAsks.forEach((a, i) => {
      const x = toX(a.price), y = toY(a.cumTotal);
      if (i === 0) ctx.moveTo(x, H);
      ctx.lineTo(x, y);
    });
    ctx.lineTo(toX(allAsks[allAsks.length - 1]?.price || maxPr), H);
    ctx.closePath(); ctx.fillStyle = askG; ctx.fill();

    // Lines
    ctx.beginPath(); ctx.strokeStyle = '#00e5b3'; ctx.lineWidth = 1.5;
    allBids.forEach((b, i) => {
      const x = toX(b.price), y = toY(b.cumTotal);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }); ctx.stroke();

    ctx.beginPath(); ctx.strokeStyle = '#f03e55'; ctx.lineWidth = 1.5;
    allAsks.forEach((a, i) => {
      const x = toX(a.price), y = toY(a.cumTotal);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }); ctx.stroke();

    // Mid price line
    const mx = toX(midPrice);
    ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, H); ctx.stroke(); ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = '#3d5470'; ctx.font = '9px JetBrains Mono,monospace';
    ctx.textAlign = 'left'; ctx.fillText(fmtP(minPr), 4, H - 2);
    ctx.textAlign = 'right'; ctx.fillText(fmtP(maxPr), W - 4, H - 2);
    ctx.textAlign = 'center'; ctx.fillText(fmtP(midPrice), mx, 12);
  }, [asks, bids, midPrice]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

export default function OrderBook({ midPrice = 45000 }) {
  const [book, setBook] = useState(() => generateBook(midPrice));
  const [trades, setTrades] = useState(() => generateTrades(midPrice));
  const [tab, setTab] = useState('book');   // book | trades | depth
  const [flash, setFlash] = useState({});
  const prevBookRef = useRef({});

  // Simulate live updates
  useEffect(() => {
    const iv = setInterval(() => {
      const drift = midPrice * (Math.random() - 0.499) * 0.001;
      const newMid = (prevBookRef.current.mid || midPrice) + drift;
      prevBookRef.current.mid = newMid;
      setBook(generateBook(newMid));

      // Add new trade
      const isBuy = Math.random() > 0.48;
      const newTrade = {
        time: Date.now(),
        price: newMid * (1 + (Math.random() - 0.5) * 0.001),
        size: Math.pow(Math.random(), 2) * 3 + 0.01,
        side: isBuy ? 'buy' : 'sell',
      };
      setTrades(prev => [newTrade, ...prev].slice(0, 40));

      // Flash
      const flashId = Date.now();
      setFlash({ id: flashId, side: isBuy ? 'buy' : 'sell' });
      setTimeout(() => setFlash(f => f.id === flashId ? {} : f), 400);
    }, 1200);
    return () => clearInterval(iv);
  }, [midPrice]);

  const { asks, bids, spread } = book;
  const spreadPct = midPrice ? ((spread / 2) / midPrice * 100 * 2).toFixed(3) : '—';
  const bestAsk = asks[0]?.price;
  const bestBid = bids[0]?.price;
  const maxBidTotal = bids[0] ? Math.max(...bids.map(b => b.cumTotal)) : 1;
  const maxAskTotal = asks[0] ? Math.max(...asks.map(a => a.cumTotal)) : 1;

  return (
    <div style={{ background: 'var(--bg-void,#04070d)', border: '1px solid var(--border,#1a2840)', borderRadius: 12, overflow: 'hidden', fontFamily: 'JetBrains Mono,monospace', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#3d5470', letterSpacing: 1 }}>ORDER BOOK</span>
        <div style={{ display: 'flex', gap: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 5, padding: 2 }}>
          {[['book', '📒'], ['trades', '⚡'], ['depth', '📊']].map(([v, label]) => (
            <button key={v} onClick={() => setTab(v)}
              style={{ padding: '2px 8px', borderRadius: 3, border: 'none', background: tab === v ? 'var(--accent,#3b82f6)' : 'transparent', color: tab === v ? '#fff' : '#3d5470', fontSize: 11, cursor: 'pointer', transition: '0.15s', fontFamily: 'inherit' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Spread info */}
      {tab === 'book' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: 9, color: '#3d5470', padding: '5px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span>PRICE</span>
          <span style={{ textAlign: 'center' }}>SIZE</span>
          <span style={{ textAlign: 'right' }}>TOTAL</span>
        </div>
      )}

      {/* ── ORDER BOOK ── */}
      {tab === 'book' && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Asks (sells) — reversed so lowest ask is at bottom */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            {[...asks].reverse().map((a, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '2px 12px', position: 'relative', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,62,85,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, background: 'rgba(240,62,85,0.09)', width: `${(a.cumTotal / maxAskTotal) * 100}%`, transition: 'width 0.4s ease' }} />
                <span style={{ fontSize: 11, color: '#f03e55', fontWeight: 600, zIndex: 1 }}>{fmtP(a.price)}</span>
                <span style={{ fontSize: 11, color: '#7b94b8', textAlign: 'center', zIndex: 1 }}>{fmtQ(a.size)}</span>
                <span style={{ fontSize: 10, color: '#3d5470', textAlign: 'right', zIndex: 1 }}>{fmt(a.total)}</span>
              </div>
            ))}
          </div>

          {/* Spread */}
          <div style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.025)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 10, color: '#3d5470' }}>SPREAD</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: flash.side === 'buy' ? '#00e5b3' : flash.side === 'sell' ? '#f03e55' : '#7b94b8', transition: 'color 0.2s' }}>
              {fmtP(midPrice)}
            </span>
            <span style={{ fontSize: 9, color: '#3d5470' }}>{spreadPct}%</span>
          </div>

          {/* Bids (buys) */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {bids.map((b, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '2px 12px', position: 'relative', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,179,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, background: 'rgba(0,229,179,0.09)', width: `${(b.cumTotal / maxBidTotal) * 100}%`, transition: 'width 0.4s ease' }} />
                <span style={{ fontSize: 11, color: '#00e5b3', fontWeight: 600, zIndex: 1 }}>{fmtP(b.price)}</span>
                <span style={{ fontSize: 11, color: '#7b94b8', textAlign: 'center', zIndex: 1 }}>{fmtQ(b.size)}</span>
                <span style={{ fontSize: 10, color: '#3d5470', textAlign: 'right', zIndex: 1 }}>{fmt(b.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RECENT TRADES ── */}
      {tab === 'trades' && (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: 9, color: '#3d5470', padding: '5px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span>PRICE</span><span style={{ textAlign: 'center' }}>SIZE</span><span style={{ textAlign: 'right' }}>TIME</span>
          </div>
          {trades.map((t, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              padding: '3px 12px',
              background: i === 0 ? (t.side === 'buy' ? 'rgba(0,229,179,0.06)' : 'rgba(240,62,85,0.06)') : 'transparent',
              transition: 'background 0.3s',
            }}>
              <span style={{ fontSize: 11, color: t.side === 'buy' ? '#00e5b3' : '#f03e55', fontWeight: 600 }}>{fmtP(t.price)}</span>
              <span style={{ fontSize: 11, color: '#7b94b8', textAlign: 'center' }}>{fmtQ(t.size)}</span>
              <span style={{ fontSize: 10, color: '#3d5470', textAlign: 'right' }}>
                {new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── DEPTH CHART ── */}
      {tab === 'depth' && (
        <div style={{ flex: 1 }}>
          <DepthChart asks={asks} bids={bids} midPrice={midPrice} />
        </div>
      )}
    </div>
  );
}
