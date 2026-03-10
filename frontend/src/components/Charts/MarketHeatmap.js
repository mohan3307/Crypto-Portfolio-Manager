import React, { useEffect, useRef, useState } from 'react';

// ── Color helpers ─────────────────────────────────────────────────────────
const changeToColor = (pct) => {
  if (pct >= 10)  return { bg: '#00d4aa', alpha: 'rgba(0,212,170,0.85)' };
  if (pct >= 5)   return { bg: '#10b981', alpha: 'rgba(16,185,129,0.80)' };
  if (pct >= 2)   return { bg: '#34d399', alpha: 'rgba(52,211,153,0.75)' };
  if (pct >= 0)   return { bg: '#6ee7b7', alpha: 'rgba(110,231,183,0.65)' };
  if (pct >= -2)  return { bg: '#fb7185', alpha: 'rgba(251,113,133,0.65)' };
  if (pct >= -5)  return { bg: '#f43f5e', alpha: 'rgba(244,63,94,0.75)' };
  if (pct >= -10) return { bg: '#e11d48', alpha: 'rgba(225,29,72,0.80)' };
  return             { bg: '#be123c', alpha: 'rgba(190,18,60,0.85)' };
};

const fmt = (n) => {
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(1) + 'M';
  return '$' + n.toFixed(2);
};

const fmtPrice = (n) => {
  if (n >= 1000) return '$' + n.toLocaleString('en', { maximumFractionDigits: 0 });
  if (n >= 1)    return '$' + n.toFixed(2);
  if (n >= 0.01) return '$' + n.toFixed(4);
  return '$' + n.toFixed(8);
};

// ── Squarified treemap algorithm ──────────────────────────────────────────
function squarify(items, x, y, w, h) {
  if (!items.length) return [];
  const total = items.reduce((s, i) => s + i.value, 0);
  const rects = [];

  const layoutRow = (row, x, y, w, h) => {
    const rowTotal = row.reduce((s, i) => s + i.value, 0);
    const isWide = w > h;
    let offset = 0;
    row.forEach((item) => {
      const frac = item.value / rowTotal;
      if (isWide) {
        const rw = (rowTotal / total) * w;
        const rh = frac * h;
        rects.push({ ...item, x, y: y + offset, w: rw, h: rh });
        offset += rh;
      } else {
        const rw = frac * w;
        const rh = (rowTotal / total) * h;
        rects.push({ ...item, x: x + offset, y, w: rw, h: rh });
        offset += rw;
      }
    });
  };

  // Simple greedy squarification
  let currentRow = [];
  let remainX = x, remainY = y, remainW = w, remainH = h;
  let remainTotal = total;

  items.forEach((item, idx) => {
    currentRow.push(item);
    const isWide = remainW > remainH;
    const side = isWide ? remainH : remainW;
    const rowVal = currentRow.reduce((s, i) => s + i.value, 0);
    const maxAR = currentRow.reduce((worst, i) => {
      const r = (i.value / rowVal) * side;
      const l = (rowVal / remainTotal) * (isWide ? remainW : remainH);
      const ar = Math.max(l / r, r / l);
      return Math.max(worst, ar);
    }, 0);

    const checkNext = items[idx + 1];
    let nextAR = Infinity;
    if (checkNext) {
      const newRow = [...currentRow, checkNext];
      const newVal = rowVal + checkNext.value;
      nextAR = newRow.reduce((worst, i) => {
        const r = (i.value / newVal) * side;
        const l = (newVal / remainTotal) * (isWide ? remainW : remainH);
        const ar = Math.max(l / r, r / l);
        return Math.max(worst, ar);
      }, 0);
    }

    if (!checkNext || nextAR > maxAR) {
      layoutRow(currentRow, remainX, remainY, remainW, remainH);
      const rowVal2 = currentRow.reduce((s, i) => s + i.value, 0);
      remainTotal -= rowVal2;
      if (isWide) {
        const usedW = (rowVal2 / (rowVal2 + remainTotal + rowVal2 - rowVal2)) * remainW;
        const rowFrac = rowVal2 / total;
        const usedW2 = rowFrac * remainW;
        remainX += usedW2; remainW -= usedW2;
      } else {
        const rowFrac = rowVal2 / total;
        const usedH = rowFrac * remainH;
        remainY += usedH; remainH -= usedH;
      }
      currentRow = [];
    }
  });

  if (currentRow.length) layoutRow(currentRow, remainX, remainY, remainW, remainH);
  return rects;
}

// ── Main heatmap component ────────────────────────────────────────────────
export default function MarketHeatmap({ listings = [], onCoinSelect }) {
  const [hovered, setHovered] = useState(null);
  const [containerSize, setContainerSize] = useState({ w: 800, h: 420 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: Math.floor(width), h: Math.floor(height) });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Use top 50 by market cap
  const top50 = [...listings]
    .filter(c => c.marketCap > 0)
    .sort((a, b) => b.marketCap - a.marketCap)
    .slice(0, 50)
    .map(c => ({ ...c, value: Math.sqrt(c.marketCap) }));

  const rects = squarify(top50, 0, 0, containerSize.w, containerSize.h);
  const GAP = 3;

  return (
    <div style={{ position: 'relative', background: '#04070d', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🗺</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>Market Heatmap</div>
            <div style={{ fontSize: 11, color: '#4a5e78' }}>Top 50 by Market Cap · 24h Change</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11 }}>
          {[['▲10%+','#00d4aa'],['▲2-10%','#34d399'],['▲0-2%','#6ee7b7'],['▼0-2%','#fb7185'],['▼2-5%','#f43f5e'],['▼10%+','#be123c']].map(([lbl,clr]) => (
            <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4a5e78' }}>
              <span style={{ width: 10, height: 10, background: clr, borderRadius: 2, display: 'inline-block' }} />{lbl}
            </span>
          ))}
        </div>
      </div>

      {/* Treemap */}
      <div ref={containerRef} style={{ height: 420, position: 'relative' }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          {rects.map((rect) => {
            const clr = changeToColor(rect.change24h);
            const isHov = hovered === rect.id;
            const gx = rect.x + GAP / 2, gy = rect.y + GAP / 2;
            const gw = rect.w - GAP, gh = rect.h - GAP;
            if (gw <= 0 || gh <= 0) return null;

            const showSym   = gw > 36 && gh > 22;
            const showPct   = gw > 50 && gh > 38;
            const showPrice = gw > 70 && gh > 55;
            const showLogo  = gw > 60 && gh > 60;

            return (
              <g key={rect.id}
                onClick={() => onCoinSelect && onCoinSelect(rect)}
                onMouseEnter={() => setHovered(rect.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}>
                <rect
                  x={gx} y={gy} width={gw} height={gh}
                  rx={6} ry={6}
                  fill={clr.alpha}
                  stroke={isHov ? '#fff' : clr.bg}
                  strokeWidth={isHov ? 2 : 1}
                  opacity={isHov ? 1 : 0.85}
                />
                {showSym && (
                  <text x={gx + gw / 2} y={gy + (showPrice ? gh * 0.38 : gh * 0.48)}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="#fff" fontSize={Math.min(16, Math.max(10, Math.min(gw / 4.5, gh / 3)))}
                    fontWeight="800" fontFamily="JetBrains Mono,monospace">
                    {rect.symbol}
                  </text>
                )}
                {showPct && (
                  <text x={gx + gw / 2} y={gy + (showPrice ? gh * 0.58 : gh * 0.66)}
                    textAnchor="middle" dominantBaseline="middle"
                    fill={rect.change24h >= 0 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.9)'}
                    fontSize={Math.min(13, Math.max(9, Math.min(gw / 5.5, gh / 4)))}
                    fontWeight="700" fontFamily="JetBrains Mono,monospace">
                    {rect.change24h >= 0 ? '+' : ''}{rect.change24h.toFixed(2)}%
                  </text>
                )}
                {showPrice && (
                  <text x={gx + gw / 2} y={gy + gh * 0.76}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="rgba(255,255,255,0.6)"
                    fontSize={Math.min(10, Math.max(8, Math.min(gw / 7, gh / 5.5)))}
                    fontFamily="JetBrains Mono,monospace">
                    {fmtPrice(rect.price)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip */}
      {hovered && (() => {
        const coin = rects.find(r => r.id === hovered);
        if (!coin) return null;
        const clr = changeToColor(coin.change24h);
        return (
          <div style={{
            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            background: '#0d1829', border: `1px solid ${clr.bg}55`, borderRadius: 10,
            padding: '10px 16px', pointerEvents: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            display: 'flex', gap: 16, alignItems: 'center', fontSize: 13, color: '#e2e8f0',
            fontFamily: 'JetBrains Mono,monospace', zIndex: 10,
          }}>
            <img src={coin.logo} alt={coin.symbol} width={28} height={28} style={{ borderRadius: '50%' }} onError={e => e.target.style.display='none'} />
            <div>
              <span style={{ fontWeight: 700 }}>{coin.name}</span>&nbsp;
              <span style={{ color: '#4a5e78' }}>{coin.symbol}</span>
            </div>
            <div style={{ color: '#7b94b8' }}>{fmtPrice(coin.price)}</div>
            <div style={{ color: clr.bg, fontWeight: 700 }}>{coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%</div>
            <div style={{ color: '#4a5e78' }}>{fmt(coin.marketCap)}</div>
          </div>
        );
      })()}
    </div>
  );
}
