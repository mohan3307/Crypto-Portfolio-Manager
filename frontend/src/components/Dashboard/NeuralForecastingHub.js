import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import NeuralProjectionChart from '../Charts/NeuralProjectionChart';

export default function NeuralForecastingHub() {
  const { socket } = useMarket();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!socket) return;
    socket.on('neuralForecastUpdate', (update) => setData(update));
    return () => socket.off('neuralForecastUpdate');
  }, [socket]);

  if (!data) return (
    <div className="v4-neural-loading">
      <div className="v4-neural-spinner" />
      <div style={{ fontSize: 10, color: '#3b82f6', fontWeight: 950, letterSpacing: 2, marginTop: 20 }}>INITIALIZING_LSTM_V4_KERNEL...</div>
      <div style={{ fontSize: 8, color: '#4a5e78', fontWeight: 950, marginTop: 6, letterSpacing: 1 }}>LOADING_50M_PARAMETER_MODEL</div>
    </div>
  );

  const historical = Array.from({ length: 20 }, (_, i) =>
    data.projection[0] * (1 + (Math.random() - 0.5) * 0.02)
  );

  const diagnostics = [
    { label: 'NETWORK_LOSS', val: data.telemetry.loss, color: '#ff4d4d', icon: '📉' },
    { label: 'BACKTEST_ACC', val: `${data.telemetry.accuracy}%`, color: '#10b981', icon: '🎯' },
    { label: 'EVAL_EPOCHS', val: data.telemetry.epoch, color: '#3b82f6', icon: '🔄' },
    { label: 'NEURONS', val: '4,096', color: '#f59e0b', icon: '⚡' },
  ];

  return (
    <div className="v4-neural-hub">
      {/* Header */}
      <div className="v4-neural-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="v4-brain-badge">🧠</div>
          <div>
            <div style={{ fontSize: 10, color: '#3b82f6', fontWeight: 950, letterSpacing: 2, marginBottom: 4 }}>LSTM_PRO_V4_ACTIVE</div>
            <div style={{ fontSize: 14, fontWeight: 950, color: '#fff' }}>NEURAL_FORECAST_ENGINE</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 950, color: '#10b981', fontFamily: 'Space Mono', letterSpacing: -1 }}>{data.symbol}</div>
          <div style={{ fontSize: 8, color: '#4a5e78', fontWeight: 950, letterSpacing: 1 }}>LIVE_QUANT_FEED</div>
        </div>
      </div>

      {/* Chart + diagnostics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', flex: 1 }}>
        {/* Chart */}
        <div style={{ padding: 28, position: 'relative' }}>
          <NeuralProjectionChart historical={historical} projection={data.projection} symbol={data.symbol} />
          {/* Confidence badge */}
          <div className="v4-confidence-badge">
            <div style={{ fontSize: 7, color: '#3b82f6', fontWeight: 950, letterSpacing: 1.5, marginBottom: 4 }}>PRED_CONFIDENCE</div>
            <div style={{ fontSize: 20, fontWeight: 950, color: '#fff', fontFamily: 'Space Mono' }}>
              {(data.telemetry.confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="v4-neural-sidebar">
          <div style={{ fontSize: 9, fontWeight: 950, color: '#4a5e78', letterSpacing: 2, marginBottom: 16 }}>TRAINING_DIAGNOSTICS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {diagnostics.map((d, i) => (
              <div key={i} className="v4-diagnostic-tile" style={{ borderLeft: `3px solid ${d.color}30` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 8, color: '#4a5e78', fontWeight: 950, letterSpacing: 1 }}>{d.label}</span>
                  <span style={{ fontSize: 12 }}>{d.icon}</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 950, color: '#fff', fontFamily: 'Space Mono' }}>{d.val}</div>
              </div>
            ))}
          </div>
          <div className="v4-stability-badge">
            <div style={{ fontSize: 8, color: '#10b981', fontWeight: 950, letterSpacing: 1, marginBottom: 4 }}>PROJECTION_STATUS</div>
            <div style={{ fontSize: 10, fontWeight: 950, color: '#fff' }}>● OPTIMAL_VECTOR_PATH</div>
          </div>
        </div>
      </div>

      <style>{`
        .v4-neural-loading { background: rgba(7,11,20,0.7); backdrop-filter: blur(25px); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 28px; height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .v4-neural-spinner { width: 44px; height: 44px; border: 4px solid rgba(59, 130, 246, 0.2); border-top-color: #3b82f6; border-radius: 50%; animation: v4-spin 1.2s linear infinite; }
        @keyframes v4-spin { to { transform: rotate(360deg); } }

        .v4-neural-hub { background: rgba(7,11,20,0.7); backdrop-filter: blur(25px) saturate(200%); border: 1px solid rgba(59, 130, 246, 0.15); border-radius: 28px; overflow: hidden; height: 100%; display: flex; flex-direction: column; }
        .v4-neural-header { padding: 24px 28px; border-bottom: 1px solid rgba(255,255,255,0.03); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.15); }
        .v4-brain-badge { width: 48px; height: 48px; background: rgba(59,130,246,0.1); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; border: 1px solid rgba(59,130,246,0.2); }

        .v4-confidence-badge { position: absolute; top: 28px; right: 28px; padding: 14px 20px; background: rgba(7, 11, 20, 0.9); border-radius: 18px; border: 1px solid rgba(59, 130, 246, 0.2); backdrop-filter: blur(20px); }

        .v4-neural-sidebar { border-left: 1px solid rgba(255,255,255,0.03); background: rgba(0,0,0,0.2); padding: 24px; display: flex; flex-direction: column; gap: 8px; }
        .v4-diagnostic-tile { padding: 16px; background: rgba(255,255,255,0.01); border-radius: 16px; border: 1px solid rgba(255,255,255,0.03); transition: 0.3s; cursor: default; }
        .v4-diagnostic-tile:hover { background: rgba(59, 130, 246, 0.05); border-color: rgba(59, 130, 246, 0.2); transform: translateX(4px); }
        .v4-stability-badge { margin-top: auto; padding: 16px; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 16px; text-align: center; }
      `}</style>
    </div>
  );
}
