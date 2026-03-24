import React, { useEffect, useRef, useState } from 'react';
import { useMarket } from '../../context/MarketContext';

const ZONES = [
  { label: 'Extreme Fear', min: 0,  max: 25,  color: '#e11d48', bg: 'rgba(225,29,72,0.15)'   },
  { label: 'Fear',         min: 25, max: 45,  color: '#f97316', bg: 'rgba(249,115,22,0.12)'  },
  { label: 'Neutral',      min: 45, max: 55,  color: '#f59e0b', bg: 'rgba(245,158,11,0.10)'  },
  { label: 'Greed',        min: 55, max: 75,  color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  { label: 'Extreme Greed',min: 75, max: 100, color: '#00d4aa', bg: 'rgba(0,212,170,0.15)'   },
];

function getZone(val) {
  return ZONES.find(z => val >= z.min && val <= z.max) || ZONES[2];
}

// Simulate a realistic Fear & Greed value using sin waves
function simValue() {
  const now = Date.now();
  const cycle1 = Math.sin(now / 800000) * 22;   // slow cycle
  const cycle2 = Math.sin(now / 120000) * 8;    // faster wiggle
  const noise  = (Math.random() - 0.5) * 3;
  return Math.max(5, Math.min(95, 55 + cycle1 + cycle2 + noise));
}

export default function FearGreedGauge() {
  const { fearGreed } = useMarket();
  const canvasRef = useRef(null);
  const [value, setValue] = useState(50);
  const [history, setHistory] = useState(() => Array.from({ length: 30 }, (_, i) => 30 + Math.random() * 40));

  useEffect(() => {
    if (fearGreed !== null && fearGreed !== undefined) {
      setValue(fearGreed);
      setHistory(h => [...h.slice(1), fearGreed]);
    }
  }, [fearGreed]);

  // Draw gauge canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    const cx = W / 2, cy = H * 0.72, R = Math.min(W, H * 1.5) * 0.42;
    ctx.clearRect(0, 0, W, H);

    // Gauge arc zones
    const startAng = Math.PI, endAng = 0;
    const zones = [
      { from: Math.PI,        to: Math.PI * 1.25, color: '#e11d48' },
      { from: Math.PI * 1.25, to: Math.PI * 1.45, color: '#f97316' },
      { from: Math.PI * 1.45, to: Math.PI * 1.55, color: '#f59e0b' },
      { from: Math.PI * 1.55, to: Math.PI * 1.75, color: '#22c55e' },
      { from: Math.PI * 1.75, to: Math.PI * 2,    color: '#00d4aa' },
    ];

    // Outer glow background
    const gGlow = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 1.2);
    gGlow.addColorStop(0, 'transparent');
    gGlow.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = gGlow;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.2, 0, Math.PI * 2); ctx.fill();

    // Zone arcs
    zones.forEach(z => {
      ctx.beginPath();
      ctx.arc(cx, cy, R, z.from, z.to);
      ctx.strokeStyle = z.color + '40'; ctx.lineWidth = 22; ctx.stroke();
    });

    // Active zone highlight
    const pct  = value / 100;
    const ang  = Math.PI + pct * Math.PI;
    const zone = getZone(value);
    ctx.beginPath();
    ctx.arc(cx, cy, R, Math.PI, ang);
    const gArc = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
    gArc.addColorStop(0, '#e11d48');
    gArc.addColorStop(0.5, '#f59e0b');
    gArc.addColorStop(1, '#00d4aa');
    ctx.strokeStyle = gArc; ctx.lineWidth = 20; ctx.lineCap = 'round'; ctx.stroke();

    // Tick marks
    for (let i = 0; i <= 10; i++) {
      const tAng = Math.PI + (i / 10) * Math.PI;
      const tx1 = cx + (R - 14) * Math.cos(tAng), ty1 = cy + (R - 14) * Math.sin(tAng);
      const tx2 = cx + (R - (i % 5 === 0 ? 22 : 18)) * Math.cos(tAng), ty2 = cy + (R - (i % 5 === 0 ? 22 : 18)) * Math.sin(tAng);
      ctx.beginPath(); ctx.moveTo(tx1, ty1); ctx.lineTo(tx2, ty2);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = i % 5 === 0 ? 2 : 1; ctx.stroke();
    }

    // Needle
    const needleAng = Math.PI + pct * Math.PI;
    const nLen = R * 0.82, nBase = 8;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(needleAng);
    ctx.beginPath();
    ctx.moveTo(0, nBase); ctx.lineTo(nLen, 0); ctx.lineTo(0, -nBase); ctx.closePath();
    const gNeedle = ctx.createLinearGradient(0, 0, nLen, 0);
    gNeedle.addColorStop(0, '#eef2fa');
    gNeedle.addColorStop(1, zone.color);
    ctx.fillStyle = gNeedle; ctx.fill();
    ctx.restore();

    // Center pivot
    const pivot = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
    pivot.addColorStop(0, '#eef2fa');
    pivot.addColorStop(1, '#475569');
    ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fillStyle = pivot; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = zone.color; ctx.fill();

    // Value text
    ctx.fillStyle = zone.color;
    ctx.font = `bold ${Math.round(R * 0.38)}px JetBrains Mono,monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(value), cx, cy - R * 0.24);

    // Zone labels on arc ends
    ctx.fillStyle = '#4a5e78'; ctx.font = `bold 9px Arial`; ctx.textAlign = 'center';
    ctx.fillText('FEAR', cx - R + 20, cy + 14);
    ctx.fillText('GREED', cx + R - 20, cy + 14);

  }, [value]);

  // Mini sparkline
  const sparkH = 36, sparkW = 200;
  const minH = Math.min(...history), maxH = Math.max(...history);
  const range = maxH - minH || 1;
  const pts = history.map((v, i) => `${(i / (history.length - 1)) * sparkW},${sparkH - ((v - minH) / range) * sparkH}`).join(' ');
  const zone = getZone(value);

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>😨</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>Fear & Greed Index</div>
          <div style={{ fontSize: 11, color: '#4a5e78' }}>Crypto Market Sentiment</div>
        </div>
      </div>

      {/* Gauge canvas */}
      <div style={{ textAlign: 'center' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 160, display: 'block' }} />
      </div>

      {/* Zone badge */}
      <div style={{ textAlign: 'center', marginTop: 4, marginBottom: 12 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 20,
          background: zone.bg, border: `1px solid ${zone.color}55`,
        }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: zone.color, fontFamily: 'JetBrains Mono,monospace', letterSpacing: 1 }}>
            {zone.label.toUpperCase()}
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: zone.color }}>{Math.round(value)}</span>
        </div>
      </div>

      {/* 30-day sparkline */}
      <div style={{ margin: '0 8px' }}>
        <div style={{ fontSize: 10, color: '#4a5e78', marginBottom: 6, textAlign: 'center' }}>30-DAY TREND</div>
        <svg viewBox={`0 0 ${sparkW} ${sparkH}`} width="100%" height={sparkH} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={zone.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={zone.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,${sparkH} ${pts} ${sparkW},${sparkH}`} fill="url(#sparkGrad)" />
          <polyline points={pts} fill="none" stroke={zone.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Last dot */}
          {(() => {
            const last = history[history.length - 1];
            const lx = sparkW, ly = sparkH - ((last - minH) / range) * sparkH;
            return <circle cx={lx} cy={ly} r="3" fill={zone.color} />;
          })()}
        </svg>
      </div>

      {/* Zone descriptions */}
      <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
        {ZONES.map(z => (
          <div key={z.label} style={{
            flex: 1, minWidth: 60, fontSize: 9, textAlign: 'center', padding: '4px 4px',
            borderRadius: 6, background: getZone(value).label === z.label ? z.bg : 'transparent',
            border: `1px solid ${getZone(value).label === z.label ? z.color + '55' : 'transparent'}`,
            color: getZone(value).label === z.label ? z.color : '#4a5e78',
            fontWeight: getZone(value).label === z.label ? 700 : 400, transition: '0.3s',
          }}>
            {z.label}
          </div>
        ))}
      </div>
    </div>
  );
}
