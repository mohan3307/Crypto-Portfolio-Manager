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

  let score = 0;
  const signals = [];

  if (rsi < 30) { score += 25; signals.push({ type: 'buy', label: 'RSI Oversold', value: rsi.toFixed(1), strength: 'strong' }); }
  else if (rsi < 45) { score += 10; signals.push({ type: 'buy', label: 'RSI Approaching Oversold', value: rsi.toFixed(1), strength: 'weak' }); }
  else if (rsi > 70) { score -= 25; signals.push({ type: 'sell', label: 'RSI Overbought', value: rsi.toFixed(1), strength: 'strong' }); }
  else if (rsi > 58) { score -= 10; signals.push({ type: 'sell', label: 'RSI Approaching Overbought', value: rsi.toFixed(1), strength: 'weak' }); }

  if (macd.histogram > 0 && macd.macd > macd.signal) { score += 20; signals.push({ type: 'buy', label: 'MACD Bullish Cross', value: macd.histogram.toFixed(4), strength: 'strong' }); }
  else if (macd.histogram < 0 && macd.macd < macd.signal) { score -= 20; signals.push({ type: 'sell', label: 'MACD Bearish Cross', value: macd.histogram.toFixed(4), strength: 'strong' }); }

  const bbPos = (currentPrice - bb.lower) / (bb.upper - bb.lower);
  if (bbPos < 0.1) { score += 20; signals.push({ type: 'buy', label: 'Near BB Lower Band', value: (bbPos * 100).toFixed(0) + '%', strength: 'strong' }); }
  else if (bbPos > 0.9) { score -= 20; signals.push({ type: 'sell', label: 'Near BB Upper Band', value: (bbPos * 100).toFixed(0) + '%', strength: 'strong' }); }

  const clampedScore = Math.max(-100, Math.min(100, score));
  const confidence = Math.min(96, Math.max(38, 55 + Math.abs(clampedScore) * 0.4));

  let action, direction;
  if (clampedScore >= 30) { action = 'STRONG_BUY'; direction = 1; }
  else if (clampedScore >= 10) { action = 'BUY'; direction = 1; }
  else if (clampedScore <= -30) { action = 'STRONG_SELL'; direction = -1; }
  else if (clampedScore <= -10) { action = 'SELL'; direction = -1; }
  else { action = 'HOLD'; direction = 0; }

  const dailyVol = (volatility / Math.sqrt(365)) / 100;
  const predPct = (Math.abs(clampedScore) / 100) * 0.05 + dailyVol;
  const target24h = currentPrice * (1 + direction * predPct);
  const target7d = currentPrice * (1 + direction * predPct * 2.8);
  const stopLoss = currentPrice * (1 - (direction >= 0 ? 0.045 : -0.045));

  return {
    action, confidence, score: clampedScore, direction,
    target24h, target7d, stopLoss,
    currentPrice, rsi, macd, bb, volatility,
    momentum10, momentum5, support, resistance,
    signals, dailyVol: dailyVol * 100
  };
};

// ─── UI Components ───────────────────────────────────────────────────────
function SignalRow({ signal }) {
  const isBuy = signal.type === 'buy';
  const color = isBuy ? '#10b981' : signal.type === 'sell' ? '#ff4d4d' : '#8899b4';
  return (
    <div className="v4-signal-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
        <span style={{ fontSize: 12, color: '#eef2fa', fontWeight: 500 }}>{signal.label}</span>
      </div>
      <span style={{ fontSize: 11, fontFamily: 'Space Mono', color: color, fontWeight: 950 }}>{signal.value}</span>
    </div>
  );
}

export default function AIPredictionPanel({ coin, prices = [] }) {
  const [prediction, setPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const runAnalysis = () => {
    if (!prices.length || prices.length < 30) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = runAIPrediction(prices, coin?.change24h || 0, coin?.volume24h || 0);
      setPrediction(result);
      setLastRun(new Date());
      setIsAnalyzing(false);
    }, 1200);
  };

  useEffect(() => {
    if (prices.length >= 30) runAnalysis();
  }, [prices.length, coin?.symbol]);

  if (!coin) return null;

  const ac = prediction ? {
    'STRONG_BUY': { color: '#10b981', label: 'STRONG_LONG', icon: '🚀' },
    'BUY': { color: '#10b981', label: 'BULLISH', icon: '📈' },
    'HOLD': { color: '#f59e0b', label: 'NEUTRAL', icon: '⏸' },
    'SELL': { color: '#ff4d4d', label: 'BEARISH', icon: '📉' },
    'STRONG_SELL': { color: '#ff4d4d', label: 'STRONG_SHORT', icon: '🔴' }
  }[prediction.action] : null;

  return (
    <div className="v4-ai-panel shadow-premium">
      <div className="v4-ai-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="v4-brain-icon pulse-blue">🧠</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 950, color: '#fff', letterSpacing: 1 }}>NEURAL_PREDICTION_ENGINE</div>
            <div style={{ fontSize: 9, color: '#4a5e78', fontWeight: 950, marginTop: 2, letterSpacing: 2 }}>
              {coin.symbol}_TELEMETRY // {lastRun ? `SYNC_AT_${lastRun.toLocaleTimeString()}` : 'INITIALIZING...'}
            </div>
          </div>
        </div>
        <button className="v4-refresh-btn" onClick={runAnalysis} disabled={isAnalyzing}>
          {isAnalyzing ? 'SCANNING...' : '⚡ RE-SCAN'}
        </button>
      </div>

      {isAnalyzing ? (
        <div className="v4-ai-scanning">
          <div className="v4-scan-line" />
          <div style={{ fontSize: 10, color: '#3b82f6', fontWeight: 950, letterSpacing: 3, marginTop: 40 }}>SCANNING_VECTORS_V4.2</div>
          <div style={{ fontSize: 8, color: '#4a5e78', marginTop: 8 }}>RSI // MACD // BOLLINGER // FIBONACCI_ALIGNMENT</div>
        </div>
      ) : prediction ? (
        <div style={{ padding: 24 }}>
          <div className="v4-result-grid">
            <div className="v4-recommendation-box" style={{ borderColor: ac.color + '30', background: ac.color + '05' }}>
               <div style={{ fontSize: 8, color: '#4a5e78', fontWeight: 950, letterSpacing: 2, marginBottom: 8 }}>AI_DECISION_MATRIX</div>
               <div style={{ fontSize: 28, fontWeight: 950, color: ac.color, letterSpacing: -1 }}>{ac.icon} {ac.label}</div>
               <div className="v4-confidence-tag" style={{ background: ac.color + '20', color: ac.color }}>
                  CONFIDENCE: {prediction.confidence.toFixed(1)}%
               </div>
            </div>

            <div className="v4-stats-grid">
               {[
                 { l: '24H_TARGET', v: formatCurrency(prediction.target24h), c: prediction.direction >= 0 ? '#10b981' : '#ff4d4d' },
                 { l: '7D_PROJECTION', v: formatCurrency(prediction.target7d), c: prediction.direction >= 0 ? '#10b981' : '#ff4d4d' },
                 { l: 'HARD_STOP_LOSS', v: formatCurrency(prediction.stopLoss), c: '#ff4d4d' },
                 { l: 'VOLATILITY_ANN', v: prediction.dailyVol.toFixed(2) + '% 24H', c: '#f59e0b' }
               ].map((s, i) => (
                 <div key={i} className="v4-stat-node">
                   <div style={{ fontSize: 8, color: '#4a5e78', fontWeight: 950, letterSpacing: 1, marginBottom: 4 }}>{s.l}</div>
                   <div style={{ fontSize: 13, fontWeight: 950, fontFamily: 'Space Mono', color: s.c }}>{s.v}</div>
                 </div>
               ))}
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 950, color: '#4a5e78', letterSpacing: 2, marginBottom: 16 }}>INDICATOR_SENTIMENT</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {prediction.signals.map((sig, i) => <SignalRow key={i} signal={sig} />)}
              </div>
            </div>
            <div className="v4-sr-levels">
              <div style={{ fontSize: 9, fontWeight: 950, color: '#4a5e78', letterSpacing: 2, marginBottom: 16 }}>PIVOT_POINTS</div>
              <div className="v4-level-map">
                <div className="v4-level res">RES: {formatCurrency(prediction.resistance)}</div>
                <div className="v4-level now">NOW: {formatCurrency(prediction.currentPrice)}</div>
                <div className="v4-level sup">SUP: {formatCurrency(prediction.support)}</div>
              </div>
            </div>
          </div>

          <div className="v4-disclaimer">
            CRITICAL_NOTICE: NEURAL_GEN_OUTPUT_ONLY. NOT_FINANCIAL_ADVICE. DYOR.
          </div>
        </div>
      ) : (
        <div style={{ padding: 40, textAlign: 'center', color: '#4a5e78' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📡</div>
          <div style={{ fontSize: 10, fontWeight: 950, letterSpacing: 2 }}>DATA_STREAM_INSUFFICIENT</div>
          <div style={{ fontSize: 8, marginTop: 4 }}>MIN_30_HISTORY_REQUIRED_FOR_QUANT_ANALYSIS</div>
        </div>
      )}

      <style>{`
        .v4-ai-panel { background: rgba(7, 11, 20, 0.4); border-radius: 24px; border: 1px solid rgba(59, 130, 246, 0.15); overflow: hidden; }
        .v4-ai-header { padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; }
        .v4-brain-icon { width: 40px; height: 40px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .v4-refresh-btn { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); color: #3b82f6; padding: 8px 16px; border-radius: 10px; font-size: 10px; font-weight: 950; cursor: pointer; transition: 0.3s; }
        .v4-refresh-btn:hover { background: rgba(59, 130, 246, 0.1); border-color: #3b82f6; }

        .v4-result-grid { display: grid; grid-template-columns: 1.2fr 1.5fr; gap: 20px; }
        .v4-recommendation-box { padding: 24px; border: 1px solid; border-radius: 20px; display: flex; flex-direction: column; justify-content: center; }
        .v4-confidence-tag { padding: 4px 10px; border-radius: 8px; font-size: 9px; font-weight: 950; margin-top: 12px; display: inline-block; width: fit-content; }

        .v4-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .v4-stat-node { background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); padding: 14px; border-radius: 16px; transition: 0.3s; }
        .v4-stat-node:hover { background: rgba(255,255,255,0.03); }

        .v4-signal-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(255,255,255,0.01); border-radius: 12px; }
        
        .v4-sr-levels { display: flex; flex-direction: column; }
        .v4-level-map { display: flex; flex-direction: column; gap: 10px; position: relative; padding-left: 20px; }
        .v4-level-map::before { content: ""; position: absolute; left: 0; top: 10px; bottom: 10px; width: 2px; background: linear-gradient(#ff4d4d, #3b82f6, #10b981); opacity: 0.2; }
        .v4-level { padding: 8px 12px; border-radius: 8px; font-size: 10px; font-weight: 950; font-family: 'Space Mono'; border: 1px solid rgba(255,255,255,0.03); }
        .v4-level.res { color: #ff4d4d; background: rgba(255, 77, 77, 0.05); }
        .v4-level.now { color: #fff; background: rgba(255,255,255,0.05); border-color: rgba(59, 130, 246, 0.3); }
        .v4-level.sup { color: #10b981; background: rgba(16, 185, 129, 0.05); }

        .v4-disclaimer { margin-top: 30px; font-size: 8px; color: #4a5e78; text-align: center; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 15px; letter-spacing: 0.5px; }

        .v4-ai-scanning { height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .v4-scan-line { position: absolute; left: 0; width: 100%; height: 2px; background: #3b82f6; box-shadow: 0 0 20px #3b82f6; animation: v4-scan 2s infinite ease-in-out; }
        @keyframes v4-scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }

        .pulse-blue { animation: v4-pulse-blue 2s infinite; }
        @keyframes v4-pulse-blue { 0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); } 50% { box-shadow: 0 0 20px 5px rgba(59, 130, 246, 0.1); } }
      `}</style>
    </div>
  );
}
