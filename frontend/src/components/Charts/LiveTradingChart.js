import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getChartData } from '../../services/api';
import { formatCurrency } from '../../utils/format';

// ─── Indicator calculations ───────────────────────────────────────────────
const calcSMA = (data, period) =>
  data.map((_, i) =>
    i < period - 1 ? null : data.slice(i - period + 1, i + 1).reduce((s, v) => s + v, 0) / period
  );

const calcEMA = (data, period) => {
  const k = 2 / (period + 1);
  return data.reduce((acc, val, i) => {
    if (i === 0) return [val];
    return [...acc, val * k + acc[i - 1] * (1 - k)];
  }, []);
};

const calcRSI = (data, period = 14) => {
  const changes = data.slice(1).map((v, i) => v - data[i]);
  return data.map((_, i) => {
    if (i < period) return null;
    const slice = changes.slice(i - period, i);
    const gains = slice.filter(c => c > 0).reduce((s, v) => s + v, 0) / period;
    const losses = Math.abs(slice.filter(c => c < 0).reduce((s, v) => s + v, 0)) / period;
    if (losses === 0) return 100;
    return 100 - 100 / (1 + gains / losses);
  });
};

const calcBollinger = (data, period = 20, stdDev = 2) => {
  const sma = calcSMA(data, period);
  return data.map((_, i) => {
    if (i < period - 1) return { upper: null, lower: null, mid: null };
    const slice = data.slice(i - period + 1, i + 1);
    const mean = sma[i];
    const variance = slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period;
    const sd = Math.sqrt(variance);
    return { upper: mean + stdDev * sd, lower: mean - stdDev * sd, mid: mean };
  });
};

// Build OHLC candles from price series
const buildCandles = (data) => {
  if (!data.length) return [];
  const chunk = Math.max(1, Math.floor(data.length / 60));
  const candles = [];
  for (let i = 0; i < data.length - chunk; i += chunk) {
    const slice = data.slice(i, i + chunk).map(d => d.price);
    const open = slice[0], close = slice[slice.length - 1];
    candles.push({
      time: data[i].time,
      open,
      high: Math.max(...slice),
      low: Math.min(...slice),
      close,
      volume: Math.random() * 5000000 + 500000
    });
  }
  return candles;
};

// ─── Crosshair tooltip ────────────────────────────────────────────────────
const TIMEFRAMES = ['1h', '24h', '7d', '30d'];
const INDICATORS_LIST = ['SMA20', 'EMA50', 'BB', 'Volume'];

export default function LiveTradingChart({ symbol = 'BTC', coinName = 'Bitcoin', color = '#3b82f6' }) {
  const canvasRef = useRef(null);
  const rsiRef = useRef(null);
  const animRef = useRef(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [indicators, setIndicators] = useState(['SMA20', 'Volume']);
  const [candles, setCandles] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [crosshair, setCrosshair] = useState(null);
  const [livePrice, setLivePrice] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [chartType, setChartType] = useState('candle'); // candle | line | area
  const lastPriceRef = useRef(null);

  // Fetch chart data
  const fetchData = useCallback(async () => {
    try {
      const res = await getChartData(symbol, timeframe);
      const pts = res.data.data;
      setRawData(pts);
      const built = buildCandles(pts);
      setCandles(built);
      if (pts.length) {
        const last = pts[pts.length - 1].price;
        const first = pts[0].price;
        setLivePrice(last);
        setPriceChange(((last - first) / first) * 100);
        lastPriceRef.current = last;
      }
    } catch (e) { /* silent */ }
    finally { setLoading(false); }
  }, [symbol, timeframe]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Live price tick simulation every 3s
  useEffect(() => {
    const tick = setInterval(() => {
      if (!lastPriceRef.current) return;
      const fluctuation = (Math.random() - 0.499) * 0.003;
      const newPrice = lastPriceRef.current * (1 + fluctuation);
      lastPriceRef.current = newPrice;
      setLivePrice(newPrice);

      setCandles(prev => {
        if (!prev.length) return prev;
        const updated = [...prev];
        const last = { ...updated[updated.length - 1] };
        last.close = newPrice;
        last.high = Math.max(last.high, newPrice);
        last.low = Math.min(last.low, newPrice);
        last.volume = last.volume * (1 + (Math.random() - 0.5) * 0.05);
        updated[updated.length - 1] = last;
        return updated;
      });
    }, 3000);
    return () => clearInterval(tick);
  }, []);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    const prices = candles.flatMap(c => [c.high, c.low]);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const padTop = 24, padBottom = indicators.includes('Volume') ? 70 : 24, padLeft = 70, padRight = 10;
    const chartH = H - padTop - padBottom;
    const chartW = W - padLeft - padRight;

    const toX = (i) => padLeft + (i / (candles.length - 1)) * chartW;
    const toY = (p) => padTop + chartH - ((p - minP) / (maxP - minP || 1)) * chartH;

    // Background
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padTop + (chartH / gridLines) * i;
      ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
      ctx.moveTo(padLeft, y); ctx.lineTo(W - padRight, y); ctx.stroke();
      const price = maxP - ((maxP - minP) / gridLines) * i;
      ctx.fillStyle = '#4a5e78'; ctx.font = '10px Space Mono, monospace'; ctx.textAlign = 'right';
      ctx.fillText('$' + price.toLocaleString('en-US', { maximumFractionDigits: 2 }), padLeft - 4, y + 3);
    }

    // Bollinger Bands
    if (indicators.includes('BB')) {
      const closes = candles.map(c => c.close);
      const bb = calcBollinger(closes);
      ['upper', 'lower', 'mid'].forEach((band, bi) => {
        ctx.beginPath(); ctx.strokeStyle = bi === 2 ? 'rgba(245,158,11,0.5)' : 'rgba(139,92,246,0.3)';
        ctx.lineWidth = bi === 2 ? 1 : 1; ctx.setLineDash(bi === 2 ? [4, 4] : []);
        candles.forEach((c, i) => {
          if (bb[i][band] == null) return;
          const x = toX(i), y = toY(bb[i][band]);
          i === 0 || bb[i - 1][band] == null ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke(); ctx.setLineDash([]);
      });
    }

    // SMA20
    if (indicators.includes('SMA20')) {
      const closes = candles.map(c => c.close);
      const sma = calcSMA(closes, Math.min(20, Math.floor(closes.length / 3)));
      ctx.beginPath(); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;
      candles.forEach((_, i) => {
        if (sma[i] == null) return;
        const x = toX(i), y = toY(sma[i]);
        sma[i - 1] == null ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // EMA50
    if (indicators.includes('EMA50')) {
      const closes = candles.map(c => c.close);
      const ema = calcEMA(closes, Math.min(50, Math.floor(closes.length / 2)));
      ctx.beginPath(); ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 1.5;
      ema.forEach((v, i) => {
        const x = toX(i), y = toY(v);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Chart body
    if (chartType === 'line' || chartType === 'area') {
      const pts = candles.map((c, i) => ({ x: toX(i), y: toY(c.close) }));
      if (chartType === 'area') {
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.lineTo(pts[pts.length - 1].x, padTop + chartH);
        ctx.lineTo(pts[0].x, padTop + chartH);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
        grad.addColorStop(0, color + '30'); grad.addColorStop(1, color + '00');
        ctx.fillStyle = grad; ctx.fill();
      }
      ctx.beginPath();
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    } else {
      // Candlesticks
      const cw = Math.max(1, (chartW / candles.length) * 0.6);
      candles.forEach((c, i) => {
        const x = toX(i), isGreen = c.close >= c.open;
        const clr = isGreen ? '#00d4aa' : '#ff4757';
        const bodyTop = toY(Math.max(c.open, c.close));
        const bodyBot = toY(Math.min(c.open, c.close));
        const bodyH = Math.max(1, bodyBot - bodyTop);

        // Wick
        ctx.beginPath(); ctx.strokeStyle = clr; ctx.lineWidth = 1;
        ctx.moveTo(x, toY(c.high)); ctx.lineTo(x, bodyTop); ctx.stroke();
        ctx.moveTo(x, bodyBot); ctx.lineTo(x, toY(c.low)); ctx.stroke();

        // Body
        ctx.fillStyle = isGreen ? clr + 'cc' : clr + 'cc';
        ctx.strokeStyle = clr;
        ctx.lineWidth = 0.5;
        ctx.fillRect(x - cw / 2, bodyTop, cw, bodyH);
        ctx.strokeRect(x - cw / 2, bodyTop, cw, bodyH);
      });
    }

    // Volume bars
    if (indicators.includes('Volume')) {
      const volH = 50;
      const volY = H - volH;
      const vols = candles.map(c => c.volume);
      const maxVol = Math.max(...vols);
      candles.forEach((c, i) => {
        const x = toX(i);
        const barH = (c.volume / maxVol) * (volH - 10);
        const isGreen = c.close >= c.open;
        ctx.fillStyle = isGreen ? 'rgba(0,212,170,0.35)' : 'rgba(255,71,87,0.35)';
        const bw = Math.max(1, (chartW / candles.length) * 0.6);
        ctx.fillRect(x - bw / 2, volY + (volH - barH) - 10, bw, barH);
      });
      ctx.fillStyle = '#4a5e78'; ctx.font = '9px Arial'; ctx.textAlign = 'left';
      ctx.fillText('VOL', padLeft, H - 2);
    }

    // Current price line
    if (livePrice) {
      const y = toY(livePrice);
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.moveTo(padLeft, y); ctx.lineTo(W - padRight, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = color; ctx.beginPath();
      ctx.roundRect(W - padRight - 72, y - 10, 72, 20, 4); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Space Mono, monospace'; ctx.textAlign = 'center';
      ctx.fillText('$' + livePrice.toLocaleString('en-US', { maximumFractionDigits: 2 }), W - padRight - 36, y + 3);
    }

    // Crosshair
    if (crosshair) {
      const { x, y, candle } = crosshair;
      ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.moveTo(x, padTop); ctx.lineTo(x, padTop + chartH);
      ctx.moveTo(padLeft, y); ctx.lineTo(W - padRight, y); ctx.stroke(); ctx.setLineDash([]);

      if (candle) {
        // Tooltip
        const tw = 150, th = 90;
        let tx = x + 10;
        if (tx + tw > W) tx = x - tw - 10;
        ctx.fillStyle = '#111827'; ctx.strokeStyle = '#1e2d42'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(tx, padTop + 4, tw, th, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#8899b4'; ctx.font = '9px Arial'; ctx.textAlign = 'left';
        const timeStr = new Date(candle.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        ctx.fillText(timeStr, tx + 8, padTop + 18);
        [['O', candle.open], ['H', candle.high], ['L', candle.low], ['C', candle.close]].forEach(([label, val], li) => {
          const isC = label === 'C';
          ctx.fillStyle = isC ? (candle.close >= candle.open ? '#00d4aa' : '#ff4757') : '#e8edf5';
          ctx.font = isC ? 'bold 10px Space Mono' : '10px Space Mono';
          ctx.fillText(`${label}: $${val.toLocaleString('en-US', { maximumFractionDigits: 4 })}`, tx + 8, padTop + 32 + li * 14);
        });
      }
    }

    // Time axis labels
    const labelCount = 6;
    for (let i = 0; i <= labelCount; i++) {
      const idx = Math.floor((i / labelCount) * (candles.length - 1));
      if (!candles[idx]) continue;
      const x = toX(idx);
      const d = new Date(candles[idx].time);
      const label = timeframe === '1h' ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : timeframe === '24h' ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      ctx.fillStyle = '#4a5e78'; ctx.font = '9px Arial'; ctx.textAlign = 'center';
      ctx.fillText(label, x, H - (indicators.includes('Volume') ? 60 : 8));
    }

  }, [candles, crosshair, indicators, chartType, livePrice, color, timeframe]);

  // RSI canvas
  useEffect(() => {
    const canvas = rsiRef.current;
    if (!canvas || !candles.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const closes = candles.map(c => c.close);
    const rsi = calcRSI(closes);

    ctx.fillStyle = '#080c14'; ctx.fillRect(0, 0, W, H);

    // 70/30 lines
    [70, 50, 30].forEach(level => {
      const y = H - (level / 100) * H;
      ctx.beginPath(); ctx.strokeStyle = level === 50 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)';
      ctx.setLineDash(level === 50 ? [] : [4, 4]); ctx.lineWidth = 1;
      ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#4a5e78'; ctx.font = '9px Arial'; ctx.textAlign = 'right';
      ctx.fillText(level, 28, y + 3);
    });

    // RSI fill bands
    const grad70 = ctx.createLinearGradient(0, 0, 0, H * 0.3);
    grad70.addColorStop(0, 'rgba(255,71,87,0.15)'); grad70.addColorStop(1, 'rgba(255,71,87,0)');
    ctx.fillStyle = grad70;
    ctx.fillRect(0, 0, W, H * 0.3);

    const grad30 = ctx.createLinearGradient(0, H * 0.7, 0, H);
    grad30.addColorStop(0, 'rgba(0,212,170,0)'); grad30.addColorStop(1, 'rgba(0,212,170,0.15)');
    ctx.fillStyle = grad30;
    ctx.fillRect(0, H * 0.7, W, H * 0.3);

    // RSI line
    ctx.beginPath(); ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 1.5;
    let started = false;
    rsi.forEach((v, i) => {
      if (v == null) return;
      const x = (i / (candles.length - 1)) * W;
      const y = H - (v / 100) * H;
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#4a5e78'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'left';
    ctx.fillText('RSI(14)', 30, 12);
    const lastRSI = rsi.filter(v => v != null).pop();
    if (lastRSI != null) {
      const rsiColor = lastRSI > 70 ? '#ff4757' : lastRSI < 30 ? '#00d4aa' : '#8b5cf6';
      ctx.fillStyle = rsiColor; ctx.font = 'bold 9px Space Mono';
      ctx.fillText(lastRSI.toFixed(1), W - 35, 12);
    }
  }, [candles]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || !candles.length) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const padLeft = 70, padRight = 10;
    const W = canvas.width;
    const chartW = W - padLeft - padRight;
    const idx = Math.max(0, Math.min(candles.length - 1, Math.round(((mx - padLeft) / chartW) * (candles.length - 1))));
    setCrosshair({ x: padLeft + (idx / (candles.length - 1)) * chartW, y: my, candle: candles[idx] });
  }, [candles]);

  const toggleIndicator = (ind) => {
    setIndicators(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]);
  };

  const isUp = priceChange >= 0;

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>{coinName} / USD</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontFamily: 'Space Mono', fontWeight: 700, fontSize: '20px' }}>
                {livePrice ? formatCurrency(livePrice) : '—'}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: isUp ? 'var(--green)' : 'var(--red)' }}>
                {isUp ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--green)', background: 'var(--green-bg)', padding: '3px 9px', borderRadius: '20px' }}>
            <span style={{ width: '5px', height: '5px', background: 'var(--green)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
            LIVE
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Chart type */}
          <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: '6px', padding: '3px' }}>
            {[['candle', '🕯'], ['line', '📈'], ['area', '◭']].map(([t, icon]) => (
              <button key={t} onClick={() => setChartType(t)}
                style={{ padding: '4px 10px', borderRadius: '4px', border: 'none', fontSize: '13px', cursor: 'pointer', background: chartType === t ? 'var(--accent)' : 'transparent', color: chartType === t ? '#fff' : 'var(--text-muted)', transition: '0.2s' }}>
                {icon}
              </button>
            ))}
          </div>

          {/* Timeframe */}
          <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: '6px', padding: '3px' }}>
            {TIMEFRAMES.map(tf => (
              <button key={tf} onClick={() => setTimeframe(tf)}
                style={{ padding: '4px 10px', borderRadius: '4px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: timeframe === tf ? 'var(--accent)' : 'transparent', color: timeframe === tf ? '#fff' : 'var(--text-muted)', transition: '0.2s' }}>
                {tf}
              </button>
            ))}
          </div>

          {/* Indicators */}
          {INDICATORS_LIST.map(ind => (
            <button key={ind} onClick={() => toggleIndicator(ind)}
              style={{ padding: '4px 10px', borderRadius: '4px', border: `1px solid ${indicators.includes(ind) ? 'var(--accent)' : 'var(--border)'}`, fontSize: '11px', fontWeight: 600, cursor: 'pointer', background: indicators.includes(ind) ? 'var(--accent-glow)' : 'transparent', color: indicators.includes(ind) ? 'var(--accent)' : 'var(--text-muted)', transition: '0.2s' }}>
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div style={{ position: 'relative', height: '340px' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080c14' }}>
            <div className="spinner"></div>
          </div>
        )}
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
          onMouseMove={handleMouseMove} onMouseLeave={() => setCrosshair(null)} />
      </div>

      {/* RSI Panel */}
      <div style={{ borderTop: '1px solid var(--border)', height: '70px', position: 'relative' }}>
        <canvas ref={rsiRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      {/* Indicator Legend */}
      <div style={{ padding: '8px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[
          indicators.includes('SMA20') && { label: 'SMA 20', color: '#f59e0b' },
          indicators.includes('EMA50') && { label: 'EMA 50', color: '#8b5cf6' },
          indicators.includes('BB') && { label: 'Bollinger Bands', color: '#8b5cf6' },
          { label: 'RSI(14)', color: '#8b5cf6' },
        ].filter(Boolean).map(({ label, color: c }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <div style={{ width: '20px', height: '2px', background: c, borderRadius: '1px' }}></div>
            {label}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <div style={{ width: '8px', height: '8px', background: '#00d4aa', borderRadius: '1px' }}></div>
          Bullish Candle
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <div style={{ width: '8px', height: '8px', background: '#ff4757', borderRadius: '1px' }}></div>
          Bearish Candle
        </div>
      </div>
    </div>
  );
}
