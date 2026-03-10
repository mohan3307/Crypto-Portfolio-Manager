import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getChartData } from '../../services/api';

// ─── Math / Indicators ────────────────────────────────────────────────────────
const calcSMA = (arr, n) => arr.map((_, i) =>
  i < n - 1 ? null : arr.slice(i - n + 1, i + 1).reduce((s, v) => s + v, 0) / n);

const calcEMA = (arr, n) => {
  const k = 2 / (n + 1);
  return arr.reduce((acc, v, i) => {
    if (i === 0) return [v];
    return [...acc, v * k + acc[i - 1] * (1 - k)];
  }, []);
};

const calcBB = (arr, n = 20, mult = 2) => {
  const sma = calcSMA(arr, n);
  return arr.map((_, i) => {
    if (!sma[i]) return null;
    const sl = arr.slice(i - n + 1, i + 1);
    const sd = Math.sqrt(sl.reduce((s, v) => s + (v - sma[i]) ** 2, 0) / n);
    return { mid: sma[i], upper: sma[i] + mult * sd, lower: sma[i] - mult * sd };
  });
};

const calcRSI = (arr, n = 14) => {
  const diffs = arr.slice(1).map((v, i) => v - arr[i]);
  return arr.map((_, i) => {
    if (i < n) return null;
    const sl = diffs.slice(i - n, i);
    const gains = sl.filter(d => d > 0).reduce((s, v) => s + v, 0) / n;
    const losses = Math.abs(sl.filter(d => d < 0).reduce((s, v) => s + v, 0)) / n;
    return losses === 0 ? 100 : 100 - 100 / (1 + gains / losses);
  });
};

const calcMACD = (arr) => {
  const ema12 = calcEMA(arr, 12);
  const ema26 = calcEMA(arr, 26);
  const line = ema12.map((v, i) => v - ema26[i]);
  const signal = calcEMA(line, 9);
  const hist = line.map((v, i) => v - signal[i]);
  return { line, signal, hist };
};

const buildCandles = (data, count = 80) => {
  if (!data.length) return [];
  const chunk = Math.max(1, Math.floor(data.length / count));
  const out = [];
  for (let i = 0; i + chunk <= data.length; i += chunk) {
    const sl = data.slice(i, i + chunk);
    const prices = sl.map(d => d.price);
    out.push({
      time: sl[0].time,
      open: prices[0],
      close: prices[prices.length - 1],
      high: Math.max(...prices),
      low: Math.min(...prices),
      volume: prices[prices.length - 1] * (Math.random() * 8000 + 2000),
    });
  }
  return out;
};

const fmt = (n, d = 2) => {
  if (n === null || n === undefined) return '—';
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(2)  + 'B';
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(2)  + 'M';
  if (n >= 1e3)  return '$' + (n / 1e3).toFixed(2)  + 'K';
  if (n >= 1)    return '$' + n.toFixed(d);
  return '$' + n.toFixed(6);
};

const PANEL_HEIGHTS = { main: 0.62, macd: 0.19, rsi: 0.19 };
const PAD = { top: 8, right: 80, bottom: 24, left: 8 };

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProTradingChart({ symbol = 'BTC', coinName = 'Bitcoin', coinColor = '#f7931a', logo }) {
  const mainRef   = useRef(null);
  const macdRef   = useRef(null);
  const rsiRef    = useRef(null);
  const volRef    = useRef(null);
  const containerRef = useRef(null);

  const [candles,    setCandles]    = useState([]);
  const [rawData,    setRawData]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [timeframe,  setTimeframe]  = useState('24h');
  const [chartType,  setChartType]  = useState('candle');   // candle | bar | line | area | heikin
  const [indicators, setIndicators] = useState(['SMA', 'BB', 'Vol', 'MACD', 'RSI']);
  const [crosshair,  setCrosshair]  = useState(null);
  const [livePrice,  setLivePrice]  = useState(null);
  const [priceFlash, setPriceFlash] = useState(null);       // 'up' | 'down'
  const [zoom,       setZoom]       = useState({ start: 0, end: 1 });
  const prevPriceRef = useRef(null);
  const lastPriceRef = useRef(null);
  const rafRef       = useRef(null);

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getChartData(symbol, timeframe);
      const pts  = res.data.data;
      setRawData(pts);
      const built = buildCandles(pts);
      setCandles(built);
      if (pts.length) {
        const p = pts[pts.length - 1].price;
        setLivePrice(p);
        lastPriceRef.current  = p;
        prevPriceRef.current  = p;
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [symbol, timeframe]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Live price tick ─────────────────────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      if (!lastPriceRef.current) return;
      const drift = (Math.random() - 0.499) * 0.0025;
      const newP  = lastPriceRef.current * (1 + drift);
      const dir   = newP >= lastPriceRef.current ? 'up' : 'down';
      prevPriceRef.current  = lastPriceRef.current;
      lastPriceRef.current  = newP;
      setLivePrice(newP);
      setPriceFlash(dir);
      setTimeout(() => setPriceFlash(null), 600);

      setCandles(prev => {
        if (!prev.length) return prev;
        const copy = [...prev];
        const last = { ...copy[copy.length - 1] };
        last.close  = newP;
        last.high   = Math.max(last.high, newP);
        last.low    = Math.min(last.low,  newP);
        last.volume = last.volume * (1 + (Math.random() - 0.5) * 0.06);
        copy[copy.length - 1] = last;
        return copy;
      });
    }, 1500);
    return () => clearInterval(iv);
  }, []);

  // ── Convert heikin-ashi ─────────────────────────────────────────────────────
  const displayCandles = (() => {
    if (chartType !== 'heikin' || !candles.length) return candles;
    return candles.reduce((acc, c, i) => {
      const prev = acc[i - 1] || c;
      const haClose = (c.open + c.high + c.low + c.close) / 4;
      const haOpen  = (prev.open + prev.close) / 2;
      const haHigh  = Math.max(c.high, haOpen, haClose);
      const haLow   = Math.min(c.low,  haOpen, haClose);
      acc.push({ ...c, open: haOpen, close: haClose, high: haHigh, low: haLow });
      return acc;
    }, []);
  })();

  // ── Visible slice ───────────────────────────────────────────────────────────
  const visCandles = (() => {
    const n = displayCandles.length;
    const s = Math.floor(zoom.start * n);
    const e = Math.max(s + 10, Math.ceil(zoom.end * n));
    return displayCandles.slice(s, e);
  })();

  const closes  = visCandles.map(c => c.close);
  const macdData = closes.length > 26 ? calcMACD(closes) : null;
  const rsiData  = closes.length > 14 ? calcRSI(closes)  : null;
  const smaData  = closes.length > 20 ? calcSMA(closes, Math.min(20, Math.floor(closes.length / 3))) : null;
  const ema9Data = closes.length > 9  ? calcEMA(closes, 9) : null;
  const bbData   = closes.length > 20 ? calcBB(closes) : null;

  // ── Canvas: MAIN ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = mainRef.current;
    if (!canvas || !visCandles.length) return;
    const ctx  = canvas.getContext('2d');
    const DPR  = window.devicePixelRatio || 1;
    const W    = canvas.offsetWidth;
    const H    = canvas.offsetHeight;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    const MAIN_H  = indicators.includes('Vol') ? H * 0.78 : H;
    const VOL_H   = H - MAIN_H;
    const pl = PAD.left, pr = PAD.right, pt = PAD.top, pb = 20;
    const chartW = W - pl - pr;
    const chartH = MAIN_H - pt - pb;

    const highs  = visCandles.map(c => c.high);
    const lows   = visCandles.map(c => c.low);
    const minP   = Math.min(...lows)  * 0.9995;
    const maxP   = Math.max(...highs) * 1.0005;
    const range  = maxP - minP || 1;

    const toX = i  => pl + (i / (visCandles.length - 1 || 1)) * chartW;
    const toY = p  => pt + chartH - ((p - minP) / range) * chartH;
    const candleW  = Math.max(1, chartW / visCandles.length * 0.72);

    // Background
    ctx.fillStyle = 'var(--bg-void, #04070d)';
    ctx.fillRect(0, 0, W, H);

    // Grid – horizontal
    const gridN = 6;
    for (let i = 0; i <= gridN; i++) {
      const y = pt + (chartH / gridN) * i;
      ctx.beginPath();
      ctx.strokeStyle = i === 0 || i === gridN ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      ctx.moveTo(pl, y); ctx.lineTo(W - pr, y);
      ctx.stroke();
      const price = maxP - (range / gridN) * i;
      ctx.fillStyle = '#3d5470';
      ctx.font = `500 10px JetBrains Mono, monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(fmt(price), W - 4, y + 3);
    }

    // Grid – vertical time labels
    const tickEvery = Math.max(1, Math.floor(visCandles.length / 8));
    visCandles.forEach((c, i) => {
      if (i % tickEvery !== 0) return;
      const x = toX(i);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      ctx.moveTo(x, pt); ctx.lineTo(x, MAIN_H - pb);
      ctx.stroke();
      const d = new Date(c.time);
      const label = timeframe === '1h'
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : timeframe === '24h'
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      ctx.fillStyle = '#3d5470';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, MAIN_H - 5);
    });

    // Bollinger Bands fill
    if (indicators.includes('BB') && bbData) {
      ctx.beginPath();
      bbData.forEach((b, i) => {
        if (!b) return;
        const x = toX(i);
        i === 0 || !bbData[i - 1] ? ctx.moveTo(x, toY(b.upper)) : ctx.lineTo(x, toY(b.upper));
      });
      for (let i = bbData.length - 1; i >= 0; i--) {
        const b = bbData[i];
        if (!b) continue;
        ctx.lineTo(toX(i), toY(b.lower));
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(167,139,250,0.04)';
      ctx.fill();
      ['upper', 'lower', 'mid'].forEach((k, ki) => {
        ctx.beginPath();
        ctx.strokeStyle = ki === 2 ? 'rgba(245,166,35,0.55)' : 'rgba(167,139,250,0.4)';
        ctx.lineWidth = ki === 2 ? 1.2 : 0.9;
        ctx.setLineDash(ki === 2 ? [4, 4] : []);
        let started = false;
        bbData.forEach((b, i) => {
          if (!b) return;
          const x = toX(i), y = toY(b[k]);
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    // SMA 20
    if (indicators.includes('SMA') && smaData) {
      ctx.beginPath(); ctx.strokeStyle = '#f5a623'; ctx.lineWidth = 1.5;
      let started = false;
      smaData.forEach((v, i) => {
        if (v == null) return;
        const x = toX(i), y = toY(v);
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // EMA 9
    if (indicators.includes('EMA') && ema9Data) {
      ctx.beginPath(); ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.2;
      ema9Data.forEach((v, i) => {
        const x = toX(i), y = toY(v);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // ── Candles / Bars / Line / Area ────────────────────────────────────────
    if (chartType === 'line' || chartType === 'area') {
      const pts = visCandles.map((c, i) => ({ x: toX(i), y: toY(c.close) }));
      if (chartType === 'area') {
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.lineTo(pts[pts.length - 1].x, toY(minP));
        ctx.lineTo(pts[0].x, toY(minP));
        ctx.closePath();
        const g = ctx.createLinearGradient(0, pt, 0, toY(minP));
        g.addColorStop(0, coinColor + '28');
        g.addColorStop(1, coinColor + '00');
        ctx.fillStyle = g; ctx.fill();
      }
      ctx.beginPath();
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = coinColor; ctx.lineWidth = 2; ctx.stroke();

    } else if (chartType === 'bar') {
      visCandles.forEach((c, i) => {
        const x = toX(i);
        const isGreen = c.close >= c.open;
        const clr = isGreen ? '#00e5b3' : '#f03e55';
        ctx.strokeStyle = clr; ctx.lineWidth = 1.2;
        // High-low wick
        ctx.beginPath(); ctx.moveTo(x, toY(c.high)); ctx.lineTo(x, toY(c.low)); ctx.stroke();
        // Open tick left
        ctx.beginPath(); ctx.moveTo(x - candleW * 0.5, toY(c.open)); ctx.lineTo(x, toY(c.open)); ctx.stroke();
        // Close tick right
        ctx.beginPath(); ctx.moveTo(x, toY(c.close)); ctx.lineTo(x + candleW * 0.5, toY(c.close)); ctx.stroke();
      });

    } else {
      // Candlestick (also heikin-ashi uses same render)
      visCandles.forEach((c, i) => {
        const x = toX(i);
        const isGreen = c.close >= c.open;
        const bull = '#00e5b3', bear = '#f03e55';
        const clr  = isGreen ? bull : bear;
        const bodyTop = toY(Math.max(c.open, c.close));
        const bodyBot = toY(Math.min(c.open, c.close));
        const bodyH   = Math.max(1.5, bodyBot - bodyTop);

        // Wick
        ctx.beginPath();
        ctx.strokeStyle = clr; ctx.lineWidth = Math.max(0.8, candleW * 0.12);
        ctx.moveTo(x, toY(c.high)); ctx.lineTo(x, bodyTop); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, bodyBot);    ctx.lineTo(x, toY(c.low)); ctx.stroke();

        // Body
        if (isGreen) {
          ctx.fillStyle = bodyH < 2 ? clr : clr + 'bb';
        } else {
          ctx.fillStyle = bodyH < 2 ? clr : clr + 'aa';
        }
        ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
        ctx.strokeStyle = clr; ctx.lineWidth = 0.5;
        ctx.strokeRect(x - candleW / 2, bodyTop, candleW, bodyH);
      });
    }

    // Volume bars (bottom strip)
    if (indicators.includes('Vol') && VOL_H > 10) {
      const vols   = visCandles.map(c => c.volume);
      const maxVol = Math.max(...vols) || 1;
      const volTop = MAIN_H;
      visCandles.forEach((c, i) => {
        const x   = toX(i);
        const isG = c.close >= c.open;
        const bh  = ((c.volume / maxVol) * (VOL_H - 8));
        ctx.fillStyle = isG ? 'rgba(0,229,179,0.28)' : 'rgba(240,62,85,0.28)';
        ctx.fillRect(x - candleW / 2, volTop + VOL_H - 4 - bh, candleW, bh);
      });
      ctx.fillStyle = '#3d5470'; ctx.font = '9px JetBrains Mono,monospace';
      ctx.textAlign = 'left'; ctx.fillText('VOL', pl + 2, H - 3);
    }

    // Current live price line
    if (livePrice) {
      const y = toY(livePrice);
      if (y >= pt && y <= pt + chartH) {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = coinColor + 'aa'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(W - pr, y); ctx.stroke();
        ctx.restore();

        // Price tag
        const tag = fmt(livePrice);
        const tagW = ctx.measureText(tag).width + 14;
        ctx.fillStyle = coinColor;
        ctx.beginPath();
        ctx.roundRect(W - pr + 2, y - 9, tagW, 18, 3);
        ctx.fill();
        ctx.fillStyle = '#000'; ctx.font = 'bold 10px JetBrains Mono,monospace';
        ctx.textAlign = 'center';
        ctx.fillText(tag, W - pr + 2 + tagW / 2, y + 3);
      }
    }

    // Crosshair
    if (crosshair) {
      const { xi, px, py, candle: ch } = crosshair;
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px, pt); ctx.lineTo(px, MAIN_H - pb); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pl, py);  ctx.lineTo(W - pr, py);      ctx.stroke();
      ctx.restore();

      // Price label on y-axis
      if (ch) {
        const priceVal = minP + ((MAIN_H - pb - py) / chartH) * range;
        const tagText  = fmt(priceVal);
        const tagW2 = 72;
        ctx.fillStyle = '#1a2840';
        ctx.strokeStyle = '#243347'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(W - pr + 2, py - 9, tagW2, 18, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#eef2fa'; ctx.font = '10px JetBrains Mono,monospace'; ctx.textAlign = 'center';
        ctx.fillText(tagText, W - pr + 2 + tagW2 / 2, py + 3);
      }
    }

  }, [visCandles, crosshair, indicators, chartType, livePrice, coinColor, smaData, bbData, ema9Data, zoom, timeframe]);

  // ── Canvas: MACD ───────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = macdRef.current;
    if (!canvas || !macdData) return;
    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1;
    const W   = canvas.offsetWidth;
    const H   = canvas.offsetHeight;
    canvas.width  = W * DPR; canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    ctx.fillStyle = 'var(--bg-void, #04070d)'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();

    const { line, signal, hist } = macdData;
    const allVals = [...line, ...signal, ...hist].filter(v => isFinite(v));
    const minV = Math.min(...allVals), maxV = Math.max(...allVals);
    const range = maxV - minV || 1;
    const n = visCandles.length;
    const toX = i => PAD.left + (i / (n - 1 || 1)) * (W - PAD.left - PAD.right);
    const toY = v => 4 + (H - 8) - ((v - minV) / range) * (H - 8);

    // Histogram
    hist.forEach((v, i) => {
      if (!isFinite(v) || i >= n) return;
      const x   = toX(i);
      const y0  = toY(0);
      const y1  = toY(v);
      const barH = Math.abs(y1 - y0);
      ctx.fillStyle = v >= 0 ? 'rgba(0,229,179,0.45)' : 'rgba(240,62,85,0.45)';
      ctx.fillRect(x - 2, Math.min(y0, y1), 4, barH);
    });

    // MACD line
    ctx.beginPath(); ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1.5;
    line.forEach((v, i) => {
      if (!isFinite(v) || i >= n) return;
      const x = toX(i), y = toY(v);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }); ctx.stroke();

    // Signal line
    ctx.beginPath(); ctx.strokeStyle = '#f5a623'; ctx.lineWidth = 1.2;
    signal.forEach((v, i) => {
      if (!isFinite(v) || i >= n) return;
      const x = toX(i), y = toY(v);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }); ctx.stroke();

    // Labels
    ctx.fillStyle = '#3d5470'; ctx.font = 'bold 9px JetBrains Mono,monospace'; ctx.textAlign = 'left';
    ctx.fillText('MACD(12,26,9)', PAD.left + 4, 12);
    const lv = line[line.length - 1], sv = signal[signal.length - 1];
    if (isFinite(lv)) { ctx.fillStyle = '#3b82f6'; ctx.fillText(lv.toFixed(2), PAD.left + 110, 12); }
    if (isFinite(sv)) { ctx.fillStyle = '#f5a623'; ctx.fillText(sv.toFixed(2), PAD.left + 154, 12); }
    ctx.fillStyle = '#3d5470'; ctx.textAlign = 'right';
    ctx.fillText(maxV.toFixed(2), W - PAD.right - 2, 12);
    ctx.fillText(minV.toFixed(2), W - PAD.right - 2, H - 3);
  }, [visCandles, macdData]);

  // ── Canvas: RSI ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = rsiRef.current;
    if (!canvas || !rsiData) return;
    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1;
    const W   = canvas.offsetWidth;
    const H   = canvas.offsetHeight;
    canvas.width  = W * DPR; canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    ctx.fillStyle = 'var(--bg-void, #04070d)'; ctx.fillRect(0, 0, W, H);
    const toX = i => PAD.left + (i / (visCandles.length - 1 || 1)) * (W - PAD.left - PAD.right);
    const toY = v => 4 + (H - 8) * (1 - v / 100);

    // Zone fills
    const gOB = ctx.createLinearGradient(0, 0, 0, toY(70));
    gOB.addColorStop(0, 'rgba(240,62,85,0.18)'); gOB.addColorStop(1, 'rgba(240,62,85,0)');
    ctx.fillStyle = gOB; ctx.fillRect(0, 0, W, toY(70));

    const gOS = ctx.createLinearGradient(0, toY(30), 0, H);
    gOS.addColorStop(0, 'rgba(0,229,179,0)'); gOS.addColorStop(1, 'rgba(0,229,179,0.18)');
    ctx.fillStyle = gOS; ctx.fillRect(0, toY(30), W, H - toY(30));

    [70, 50, 30].forEach(lvl => {
      const y = toY(lvl);
      ctx.beginPath(); ctx.strokeStyle = lvl === 50 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1; ctx.setLineDash(lvl !== 50 ? [3, 3] : []);
      ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#3d5470'; ctx.font = '9px JetBrains Mono,monospace';
      ctx.textAlign = 'right'; ctx.fillText(lvl, PAD.left - 2, y + 3);
    });

    // RSI line (color segments)
    ctx.beginPath(); ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 1.5;
    let started = false;
    rsiData.forEach((v, i) => {
      if (v == null || i >= visCandles.length) return;
      const x = toX(i), y = toY(v);
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    }); ctx.stroke();

    // Current RSI dot + label
    const lastRSI = rsiData.filter(v => v != null).pop();
    if (lastRSI != null) {
      const rsiColor = lastRSI > 70 ? '#f03e55' : lastRSI < 30 ? '#00e5b3' : '#a78bfa';
      ctx.fillStyle = '#3d5470'; ctx.font = 'bold 9px JetBrains Mono,monospace'; ctx.textAlign = 'left';
      ctx.fillText('RSI(14)', PAD.left + 4, 12);
      ctx.fillStyle = rsiColor; ctx.textAlign = 'left';
      ctx.fillText(lastRSI.toFixed(1), PAD.left + 60, 12);
      const zone = lastRSI > 70 ? ' OVERBOUGHT' : lastRSI < 30 ? ' OVERSOLD' : '';
      if (zone) { ctx.fillStyle = rsiColor + 'aa'; ctx.fillText(zone, PAD.left + 88, 12); }
    }
  }, [visCandles, rsiData]);

  // ── Mouse handling ─────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    const canvas = mainRef.current;
    if (!canvas || !visCandles.length) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width / (window.devicePixelRatio || 1);
    const scaleY = canvas.height / rect.height / (window.devicePixelRatio || 1);
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;
    const chartW = canvas.offsetWidth - PAD.left - PAD.right;
    const idx = Math.max(0, Math.min(visCandles.length - 1,
      Math.round(((mx - PAD.left) / chartW) * (visCandles.length - 1))));
    const x = PAD.left + (idx / (visCandles.length - 1 || 1)) * chartW;
    setCrosshair({ xi: idx, px: x, py: my, candle: visCandles[idx] });
  }, [visCandles]);

  const toggleInd = name =>
    setIndicators(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);

  const ch = crosshair?.candle;
  const isUp = livePrice && lastPriceRef.current
    ? livePrice >= (prevPriceRef.current || livePrice) : true;
  const priceColor = priceFlash === 'up' ? '#00e5b3' : priceFlash === 'down' ? '#f03e55' : '#eef2fa';

  const TF_LIST = ['1h', '24h', '7d', '30d'];
  const IND_LIST = [
    { id: 'SMA',  label: 'SMA 20',  color: '#f5a623' },
    { id: 'EMA',  label: 'EMA 9',   color: '#22d3ee' },
    { id: 'BB',   label: 'B-Bands', color: '#a78bfa' },
    { id: 'Vol',  label: 'Volume',  color: '#3b82f6' },
    { id: 'MACD', label: 'MACD',    color: '#3b82f6' },
    { id: 'RSI',  label: 'RSI',     color: '#a78bfa' },
  ];
  const TYPE_LIST = [
    { id: 'candle',  label: '🕯',  title: 'Candlestick' },
    { id: 'heikin',  label: 'HA',  title: 'Heikin-Ashi' },
    { id: 'bar',     label: '▐',  title: 'OHLC Bar' },
    { id: 'line',    label: '∿',   title: 'Line' },
    { id: 'area',    label: '◭',   title: 'Area' },
  ];

  return (
    <div style={{ background: 'var(--bg-void,#04070d)', border: '1px solid var(--border,#1a2840)', borderRadius: 12, overflow: 'hidden', fontFamily: 'JetBrains Mono,monospace' }}>

      {/* ── Top header bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderBottom: '1px solid var(--border,#1a2840)', flexWrap: 'wrap' }}>
        {/* Symbol + price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 220 }}>
          {logo && <img src={logo} alt={symbol} width={28} height={28} style={{ borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />}
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#eef2fa' }}>{symbol}/USDT</div>
            <div style={{ fontSize: 10, color: '#3d5470' }}>{coinName}</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: priceColor, transition: 'color 0.3s', letterSpacing: '-0.5px' }}>
              {livePrice ? fmt(livePrice) : '—'}
            </div>
          </div>
          <div style={{ background: 'rgba(0,229,179,0.07)', border: '1px solid rgba(0,229,179,0.2)', borderRadius: 20, padding: '2px 8px', fontSize: 9, fontWeight: 700, color: '#00e5b3', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, background: '#00e5b3', borderRadius: '50%', display: 'inline-block', animation: 'livepulse 1.8s infinite' }} />
            LIVE
          </div>
        </div>

        {/* OHLC strip from crosshair */}
        {ch && (
          <div style={{ display: 'flex', gap: 14, fontSize: 11, flex: 1 }}>
            {[['O', ch.open, '#7b94b8'], ['H', ch.high, '#00e5b3'], ['L', ch.low, '#f03e55'], ['C', ch.close, ch.close >= ch.open ? '#00e5b3' : '#f03e55']].map(([lbl, val, clr]) => (
              <span key={lbl} style={{ color: '#3d5470' }}>{lbl}: <span style={{ color: clr, fontWeight: 700 }}>{fmt(val)}</span></span>
            ))}
            <span style={{ color: '#3d5470' }}>Vol: <span style={{ color: '#7b94b8', fontWeight: 600 }}>{(ch.volume / 1e6).toFixed(2)}M</span></span>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Chart type buttons */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: 2, gap: 1 }}>
          {TYPE_LIST.map(({ id, label, title }) => (
            <button key={id} onClick={() => setChartType(id)} title={title}
              style={{ padding: '3px 9px', borderRadius: 4, border: 'none', background: chartType === id ? 'var(--accent,#3b82f6)' : 'transparent', color: chartType === id ? '#fff' : '#3d5470', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: '0.15s' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Toolbar row 2: timeframe + indicators ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap', background: 'rgba(255,255,255,0.01)' }}>
        {/* Timeframes */}
        <div style={{ display: 'flex', gap: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 5, padding: 2 }}>
          {TF_LIST.map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)}
              style={{ padding: '3px 10px', borderRadius: 3, border: 'none', background: timeframe === tf ? 'var(--accent,#3b82f6)' : 'transparent', color: timeframe === tf ? '#fff' : '#3d5470', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: '0.15s' }}>
              {tf}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />

        {/* Indicator toggles */}
        {IND_LIST.map(({ id, label, color }) => (
          <button key={id} onClick={() => toggleInd(id)}
            style={{ padding: '3px 9px', borderRadius: 4, border: `1px solid ${indicators.includes(id) ? color + '55' : 'rgba(255,255,255,0.08)'}`, background: indicators.includes(id) ? color + '12' : 'transparent', color: indicators.includes(id) ? color : '#3d5470', fontSize: 10, fontWeight: 700, cursor: 'pointer', transition: '0.15s', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: indicators.includes(id) ? color : 'transparent', border: `1px solid ${color}`, display: 'inline-block', transition: '0.15s' }} />
            {label}
          </button>
        ))}

        {/* Zoom slider */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#3d5470' }}>
          <span>ZOOM</span>
          <input type="range" min="1" max="100" defaultValue="100"
            onChange={e => { const v = parseInt(e.target.value) / 100; setZoom({ start: 1 - v, end: 1 }); }}
            style={{ width: 80, accentColor: 'var(--accent,#3b82f6)', cursor: 'pointer' }} />
        </div>
      </div>

      {/* ── Main chart canvas ── */}
      <div style={{ position: 'relative', height: 360, background: 'var(--bg-void,#04070d)' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 28, height: 28, border: '2px solid #1a2840', borderTopColor: coinColor, borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 8px' }} />
              <div style={{ fontSize: 10, color: '#3d5470' }}>Loading {symbol}...</div>
            </div>
          </div>
        )}
        <canvas ref={mainRef} style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setCrosshair(null)} />
      </div>

      {/* ── MACD panel ── */}
      {indicators.includes('MACD') && (
        <div style={{ height: 90, borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
          <canvas ref={macdRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
      )}

      {/* ── RSI panel ── */}
      {indicators.includes('RSI') && (
        <div style={{ height: 80, borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
          <canvas ref={rsiRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
      )}

      {/* ── Legend row ── */}
      <div style={{ display: 'flex', gap: 16, padding: '7px 14px', borderTop: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap', fontSize: 10 }}>
        {indicators.includes('SMA') && <span style={{ color: '#f5a623', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 18, height: 1.5, background: '#f5a623', display: 'inline-block' }} />SMA 20</span>}
        {indicators.includes('EMA') && <span style={{ color: '#22d3ee', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 18, height: 1.5, background: '#22d3ee', display: 'inline-block' }} />EMA 9</span>}
        {indicators.includes('BB')  && <span style={{ color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 18, height: 1.5, background: '#a78bfa', display: 'inline-block', borderTop: '1px dashed #a78bfa' }} />Bollinger</span>}
        <span style={{ color: '#00e5b3', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: '#00e5b3', borderRadius: 1 }} />Bullish</span>
        <span style={{ color: '#f03e55', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: '#f03e55', borderRadius: 1 }} />Bearish</span>
        {chartType === 'heikin' && <span style={{ color: '#f5a623', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)', padding: '1px 7px', borderRadius: 10 }}>HEIKIN-ASHI</span>}
        <span style={{ marginLeft: 'auto', color: '#3d5470' }}>{visCandles.length} candles · {symbol}/USDT</span>
      </div>
    </div>
  );
}
