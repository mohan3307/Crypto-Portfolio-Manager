import React from 'react';

export default function MarketSparkline({ data, change }) {
  if (!data || data.length < 2) return <div style={{ width: 120, height: 32 }} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 120, H = 32;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const lastX = W, lastY = H - ((data[data.length - 1] - min) / range) * (H - 4) - 2;
  const color = change >= 0 ? '#10b981' : '#ff4d4d';
  const fillId = `sf-${change >= 0 ? 'g' : 'r'}`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill area */}
      <polygon
        points={`0,${H} ${pts} ${W},${H}`}
        fill={`url(#${fillId})`}
      />
      {/* Line */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
        style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
      />
      {/* End dot */}
      <circle cx={lastX} cy={lastY} r={2.5} fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
}
