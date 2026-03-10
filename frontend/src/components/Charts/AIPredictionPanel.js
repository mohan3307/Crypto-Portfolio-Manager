import React, { useState, useEffect, useRef } from 'react';
import { formatCurrency, formatPercent } from '../../utils/format';

// ─── Technical Analysis Engine ────────────────────────────────────────────
const calcSMA = (data, period) =>
  data.map((_, i) => i < period - 1 ? null : data.slice(i - period + 1, i + 1).reduce((s, v) => s + v, 0) / period);

const calcEMA = (data, period) => {
  const k = 2 / (period + 1);
  return data.reduce((acc, val, i) => {
    if (i === 0) return [val];
    return [...acc, val * k + acc[i - 1] * (1 - k)];
  }, []);
};

const calcRSI = (data, period = 14) => {
  const changes = data.slice(1).map((v, i) => v - data[i]);
  const rsiArr = data.map((_, i) => {
    if (i < period) return null;
    const slice = changes.slice(i - period, i);
    const gains = slice.filter(c => c > 0).reduce((s, v) => s + v, 0) / period;
    const losses = Math.abs(slice.filter(c => c < 0).reduce((s, v) => s + v, 0)) / period;
    return losses === 0 ? 100 : 100 - 100 / (1 + gains / losses);
  });
  return rsiArr.filter(v => v !== null).pop() || 50;
};

const calcMACD = (data) => {
  const ema12 = calcEMA(data, 12);
  const ema26 = calcEMA(data, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signal = calcEMA(macdLine.slice(macdLine.length - 9), 9);
  const lastMACD = macdLine[macdLine.length - 1];
  const lastSignal = signal[signal.length - 1];
  return { macd: lastMACD, signal: lastSignal, histogram: lastMACD - lastSignal };
};

const calcBollinger = (data, period = 20, stdMult = 2) => {
  const sma = calcSMA(data, period);
  const lastIdx = data.length - 1;
  const slice = data.slice(lastIdx - period + 1);
  const mean = sma[lastIdx];
  const variance = slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period;
  const sd = Math.sqrt(variance);
  return { upper: mean + stdMult * sd, lower: mean - stdMult * sd, mid: mean, sd };
};

const calcVolatility = (data) => {
  const returns = data.slice(1).map((v, i) => Math.log(v / data[i]));
  const mean = returns.reduce((s, v) => s + v, 0) / returns.length;
  const variance = returns.reduce((s, v) => s + (v - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance * 252) * 100; // annualized %
};

const calcMomentum = (data, period = 10) => {
  const last = data[data.length - 1];
  const prev = data[data.length - 1 - period];
  return ((last - prev) / prev) * 100;
};

const findSupportResistance = (data, lookback = 20) => {
  const slice = data.slice(-lookback);
  const support = Math.min(...slice);
  const resistance = Math.max(...slice);
  return { support, resistance };
};

// ─── AI Prediction Engine ─────────────────────────────────────────────────
const runAIPrediction = (prices, change24h, volume) => {
  if (prices.length < 30) return null;

  const currentPrice = prices[prices.length - 1];
  const rsi = calcRSI(prices);
  const macd = calcMACD(prices);
  const bb = calcBollinger(prices);
  const volatility = calcVolatility(prices);
  const momentum10 = calcMomentum(prices, 10);
  const momentum5 = calcMomentum(prices, 5);
  const { support, resistance } = findSupportResistance(prices);

  // Scoring system: -100 (strong sell) to +100 (strong buy)
  let score = 0;
  const signals = [];

  // RSI signal
  if (rsi < 30) { score += 25; signals.push({ type: 'buy', label: 'RSI Oversold', value: rsi.toFixed(1), strength: 'strong' }); }
  else if (rsi < 45) { score += 10; signals.push({ type: 'buy', label: 'RSI Approaching Oversold', value: rsi.toFixed(1), strength: 'weak' }); }
  else if (rsi > 70) { score -= 25; signals.push({ type: 'sell', label: 'RSI Overbought', value: rsi.toFixed(1), strength: 'strong' }); }
  else if (rsi > 58) { score -= 10; signals.push({ type: 'sell', label: 'RSI Approaching Overbought', value: rsi.toFixed(1), strength: 'weak' }); }
  else { signals.push({ type: 'neutral', label: 'RSI Neutral', value: rsi.toFixed(1), strength: 'neutral' }); }

  // MACD signal
  if (macd.histogram > 0 && macd.macd > macd.signal) { score += 20; signals.push({ type: 'buy', label: 'MACD Bullish Cross', value: macd.histogram.toFixed(4), strength: 'strong' }); }
  else if (macd.histogram < 0 && macd.macd < macd.signal) { score -= 20; signals.push({ type: 'sell', label: 'MACD Bearish Cross', value: macd.histogram.toFixed(4), strength: 'strong' }); }
  else { signals.push({ type: 'neutral', label: 'MACD Converging', value: macd.histogram.toFixed(4), strength: 'neutral' }); }

  // Bollinger Band signal
  const bbPos = (currentPrice - bb.lower) / (bb.upper - bb.lower);
  if (bbPos < 0.1) { score += 20; signals.push({ type: 'buy', label: 'Near BB Lower Band', value: (bbPos * 100).toFixed(0) + '%', strength: 'strong' }); }
  else if (bbPos > 0.9) { score -= 20; signals.push({ type: 'sell', label: 'Near BB Upper Band', value: (bbPos * 100).toFixed(0) + '%', strength: 'strong' }); }
  else { signals.push({ type: 'neutral', label: 'BB Mid Zone', value: (bbPos * 100).toFixed(0) + '%', strength: 'neutral' }); }

  // Momentum
  if (momentum10 > 5) { score += 15; signals.push({ type: 'buy', label: '10-Period Momentum', value: '+' + momentum10.toFixed(2) + '%', strength: 'moderate' }); }
  else if (momentum10 < -5) { score -= 15; signals.push({ type: 'sell', label: '10-Period Momentum', value: momentum10.toFixed(2) + '%', strength: 'moderate' }); }

  // 24h change trend
  if (change24h > 5) { score += 10; signals.push({ type: 'buy', label: '24h Strong Trend', value: '+' + change24h.toFixed(2) + '%', strength: 'moderate' }); }
  else if (change24h < -5) { score -= 10; signals.push({ type: 'sell', label: '24h Downtrend', value: change24h.toFixed(2) + '%', strength: 'moderate' }); }

  // Support/Resistance proximity
  const distToResistance = ((resistance - currentPrice) / currentPrice) * 100;
  const distToSupport = ((currentPrice - support) / currentPrice) * 100;
  if (distToResistance < 2) signals.push({ type: 'sell', label: 'Near Resistance', value: formatCurrency(resistance), strength: 'moderate' });
  if (distToSupport < 2) signals.push({ type: 'buy', label: 'Near Support', value: formatCurrency(support), strength: 'moderate' });

  // Normalize score to confidence
  const clampedScore = Math.max(-100, Math.min(100, score));
  const confidence = Math.min(95, Math.max(35, 50 + Math.abs(clampedScore) * 0.45));

  // Determine action
  let action, direction;
  if (clampedScore >= 30) { action = 'STRONG BUY'; direction = 1; }
  else if (clampedScore >= 10) { action = 'BUY'; direction = 1; }
  else if (clampedScore <= -30) { action = 'STRONG SELL'; direction = -1; }
  else if (clampedScore <= -10) { action = 'SELL'; direction = -1; }
  else { action = 'HOLD'; direction = 0; }

  // Price targets with volatility-adjusted ranges
  const dailyVol = (volatility / Math.sqrt(365)) / 100;
  const expectedMove = dailyVol * currentPrice;
  const predPct = (Math.abs(clampedScore) / 100) * 0.06 + dailyVol;
  const target24h = currentPrice * (1 + direction * predPct);
  const target7d = currentPrice * (1 + direction * predPct * 2.5);
  const stopLoss = currentPrice * (1 - (direction >= 0 ? 0.04 : -0.04));

  return {
    action, confidence, score: clampedScore, direction,
    target24h, target7d, stopLoss,
    currentPrice, rsi, macd, bb, volatility,
    momentum10, momentum5, support, resistance,
    signals, expectedMove, dailyVol: dailyVol * 100
  };
};

// ─── Sub-components ───────────────────────────────────────────────────────
function SignalBadge({ signal }) {
  const colors = { buy: { bg: 'rgba(0,212,170,0.1)', border: 'rgba(0,212,170,0.3)', text: '#00d4aa' }, sell: { bg: 'rgba(255,71,87,0.1)', border: 'rgba(255,71,87,0.3)', text: '#ff4757' }, neutral: { bg: 'rgba(168,168,168,0.08)', border: 'rgba(168,168,168,0.2)', text: '#8899b4' } };
  const c = colors[signal.type] || colors.neutral;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: c.bg, border: `1px solid ${c.border}`, borderRadius: '6px', marginBottom: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <span style={{ fontSize: '12px' }}>{signal.type === 'buy' ? '▲' : signal.type === 'sell' ? '▼' : '◆'}</span>
        <span style={{ fontSize: '12px', color: '#e8edf5' }}>{signal.label}</span>
      </div>
      <span style={{ fontSize: '11px', fontFamily: 'Space Mono', fontWeight: 700, color: c.text }}>{signal.value}</span>
    </div>
  );
}

function GaugeMeter({ confidence, action }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 200, H = canvas.height = 120;
    const cx = W / 2, cy = H - 10;
    const r = 80;
    ctx.clearRect(0, 0, W, H);

    // Background arc
    const zones = [
      { from: Math.PI, to: Math.PI * 1.2, color: '#ff4757' },
      { from: Math.PI * 1.2, to: Math.PI * 1.4, color: '#ff6b35' },
      { from: Math.PI * 1.4, to: Math.PI * 1.6, color: '#8899b4' },
      { from: Math.PI * 1.6, to: Math.PI * 1.8, color: '#06b6d4' },
      { from: Math.PI * 1.8, to: Math.PI * 2, color: '#00d4aa' },
    ];
    zones.forEach(z => {
      ctx.beginPath(); ctx.arc(cx, cy, r, z.from, z.to); ctx.strokeStyle = z.color + '50'; ctx.lineWidth = 16; ctx.stroke();
    });

    // Needle
    const actionToAngle = { 'STRONG SELL': 0, 'SELL': 0.2, 'HOLD': 0.5, 'BUY': 0.8, 'STRONG BUY': 1 };
    const pct = actionToAngle[action] ?? 0.5;
    const angle = Math.PI + pct * Math.PI;
    const nx = cx + (r - 8) * Math.cos(angle);
    const ny = cy + (r - 8) * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = '#e8edf5'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();

    // Center dot
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fillStyle = '#e8edf5'; ctx.fill();

    // Labels
    ctx.fillStyle = '#4a5e78'; ctx.font = '8px Arial'; ctx.textAlign = 'center';
    ctx.fillText('SELL', cx - r + 12, cy - 8);
    ctx.fillText('BUY', cx + r - 12, cy - 8);

    // Confidence text
    ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 16px Space Mono'; ctx.textAlign = 'center';
    ctx.fillText(Math.round(confidence) + '%', cx, cy - 24);
    ctx.fillStyle = '#8899b4'; ctx.font = '9px Arial';
    ctx.fillText('CONFIDENCE', cx, cy - 12);
  }, [confidence, action]);

  return <canvas ref={canvasRef} style={{ width: '200px', height: '120px' }} />;
}

function PredictionBar({ label, value, min, max, color, suffix = '' }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: '11px', fontFamily: 'Space Mono', fontWeight: 600, color }}>{typeof value === 'number' ? value.toFixed(2) : value}{suffix}</span>
      </div>
      <div style={{ height: '4px', background: 'var(--bg-input)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: '2px', transition: '0.5s ease' }}></div>
      </div>
    </div>
  );
}

// ─── Main AI Prediction Component ─────────────────────────────────────────
export default function AIPredictionPanel({ coin, prices = [] }) {
  const [prediction, setPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [showSignals, setShowSignals] = useState(false);
  const intervalRef = useRef(null);

  const runAnalysis = () => {
    if (!prices.length || prices.length < 30) return;
    setIsAnalyzing(true);
    // Simulate ML model processing time
    setTimeout(() => {
      const result = runAIPrediction(prices, coin?.change24h || 0, coin?.volume24h || 0);
      setPrediction(result);
      setLastRun(new Date());
      setIsAnalyzing(false);
    }, 800);
  };

  useEffect(() => {
    if (prices.length >= 30) runAnalysis();
    intervalRef.current = setInterval(runAnalysis, 30000);
    return () => clearInterval(intervalRef.current);
  }, [prices.length, coin?.symbol]);

  const actionConfig = {
    'STRONG BUY': { color: '#00d4aa', bg: 'rgba(0,212,170,0.12)', border: 'rgba(0,212,170,0.3)', icon: '🚀' },
    'BUY': { color: '#00d4aa', bg: 'rgba(0,212,170,0.08)', border: 'rgba(0,212,170,0.2)', icon: '📈' },
    'HOLD': { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: '⏸' },
    'SELL': { color: '#ff4757', bg: 'rgba(255,71,87,0.08)', border: 'rgba(255,71,87,0.2)', icon: '📉' },
    'STRONG SELL': { color: '#ff4757', bg: 'rgba(255,71,87,0.12)', border: 'rgba(255,71,87,0.3)', icon: '🔴' },
  };

  const ac = prediction ? (actionConfig[prediction.action] || actionConfig['HOLD']) : null;

  if (!coin) return null;

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>🤖</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>AI Prediction Engine</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {coin.name} · {lastRun ? `Updated ${lastRun.toLocaleTimeString()}` : 'Analyzing...'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={runAnalysis} disabled={isAnalyzing}
            style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}>
            {isAnalyzing ? '⚡ Analyzing...' : '↻ Refresh'}
          </button>
          <button onClick={() => setExpanded(e => !e)}
            style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}>
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Running technical analysis...</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>RSI · MACD · Bollinger · Momentum · S/R Levels</div>
        </div>
      )}

      {!isAnalyzing && prediction && expanded && (
        <div style={{ padding: '16px 18px' }}>
          {/* Action Banner */}
          <div style={{ background: ac.bg, border: `1px solid ${ac.border}`, borderRadius: '10px', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Recommendation</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: ac.color, fontFamily: 'Space Mono', letterSpacing: '1px' }}>
                {ac.icon} {prediction.action}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Score: <span style={{ color: prediction.score > 0 ? 'var(--green)' : prediction.score < 0 ? 'var(--red)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {prediction.score > 0 ? '+' : ''}{prediction.score}/100
                </span>
              </div>
            </div>
            <GaugeMeter confidence={prediction.confidence} action={prediction.action} />
          </div>

          {/* Price Targets */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: '24h Target', value: prediction.target24h, trend: prediction.direction >= 0 },
              { label: '7d Target', value: prediction.target7d, trend: prediction.direction >= 0 },
              { label: 'Stop Loss', value: prediction.stopLoss, trend: false },
            ].map(({ label, value, trend }) => (
              <div key={label} style={{ background: 'var(--bg-input)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontFamily: 'Space Mono', fontWeight: 700, fontSize: '13px', color: label === 'Stop Loss' ? 'var(--red)' : trend ? 'var(--green)' : 'var(--red)' }}>
                  {formatCurrency(value)}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {((value - prediction.currentPrice) / prediction.currentPrice * 100).toFixed(2)}%
                </div>
              </div>
            ))}
          </div>

          {/* Indicator Bars */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Technical Indicators</div>
            <PredictionBar label="RSI (14)" value={prediction.rsi} min={0} max={100} color={prediction.rsi < 30 ? '#00d4aa' : prediction.rsi > 70 ? '#ff4757' : '#8b5cf6'} />
            <PredictionBar label="Momentum (10P)" value={prediction.momentum10} min={-15} max={15} color={prediction.momentum10 >= 0 ? '#00d4aa' : '#ff4757'} suffix="%" />
            <PredictionBar label="Volatility (Ann.)" value={prediction.volatility} min={0} max={200} color="#f59e0b" suffix="%" />
            <PredictionBar label="Daily Expected Move" value={prediction.dailyVol} min={0} max={10} color="#3b82f6" suffix="%" />
          </div>

          {/* Support & Resistance */}
          <div style={{ background: 'var(--bg-input)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Support & Resistance</div>
            <div style={{ position: 'relative', height: '28px', background: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
              {/* Support to Resistance bar */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,212,170,0.2), rgba(255,71,87,0.2))' }}></div>
              {/* Current price marker */}
              {(() => {
                const range = prediction.resistance - prediction.support;
                const pos = ((prediction.currentPrice - prediction.support) / range) * 100;
                return (
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${Math.max(0, Math.min(100, pos))}%`, width: '2px', background: '#fff', transform: 'translateX(-50%)' }}>
                    <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', fontSize: '9px', color: '#fff', whiteSpace: 'nowrap', background: '#3b82f6', padding: '1px 4px', borderRadius: '2px' }}>
                      NOW
                    </div>
                  </div>
                );
              })()}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '9px', color: 'var(--green)', textTransform: 'uppercase', fontWeight: 600 }}>Support</div>
                <div style={{ fontSize: '12px', fontFamily: 'Space Mono', color: 'var(--green)' }}>{formatCurrency(prediction.support)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Current</div>
                <div style={{ fontSize: '12px', fontFamily: 'Space Mono', color: 'var(--text-primary)' }}>{formatCurrency(prediction.currentPrice)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '9px', color: 'var(--red)', textTransform: 'uppercase', fontWeight: 600 }}>Resistance</div>
                <div style={{ fontSize: '12px', fontFamily: 'Space Mono', color: 'var(--red)' }}>{formatCurrency(prediction.resistance)}</div>
              </div>
            </div>
          </div>

          {/* MACD Summary */}
          <div style={{ background: 'var(--bg-input)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>MACD Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { label: 'MACD', value: prediction.macd.macd.toFixed(4) },
                { label: 'Signal', value: prediction.macd.signal.toFixed(4) },
                { label: 'Histogram', value: prediction.macd.histogram.toFixed(4) },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
                  <div style={{ fontSize: '11px', fontFamily: 'Space Mono', fontWeight: 700, color: parseFloat(value) >= 0 ? 'var(--green)' : 'var(--red)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Signals Toggle */}
          <button onClick={() => setShowSignals(s => !s)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', marginBottom: showSignals ? '10px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {showSignals ? '▲' : '▼'} {prediction.signals.length} Technical Signals
          </button>

          {showSignals && prediction.signals.map((sig, i) => <SignalBadge key={i} signal={sig} />)}

          {/* Disclaimer */}
          <div style={{ marginTop: '12px', padding: '8px 10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '6px', fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            ⚠️ AI predictions use technical analysis signals only. Past patterns don't guarantee future results. This is not financial advice.
          </div>
        </div>
      )}

      {!prediction && !isAnalyzing && (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤖</div>
          <div>Insufficient data for analysis</div>
          <div style={{ fontSize: '11px', marginTop: '4px' }}>Need at least 30 price points</div>
        </div>
      )}
    </div>
  );
}
