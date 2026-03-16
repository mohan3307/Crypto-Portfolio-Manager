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

  if (!data) return <div className="card glass" style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a5e78', fontSize: 11 }}>INITIALIZING NEURAL LAYERS...</div>;

  // Mock historical data for the chart (mirroring the start of the projection)
  const historical = Array.from({ length: 20 }, (_, i) => data.projection[0] * (1 + (Math.random() - 0.5) * 0.02));

  return (
    <div className="card glass-heavy" style={{ padding: 0, height: '100%', overflow: 'hidden' }}>
      <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#eef2fa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Neural Engine (T+24H Forecast)</div>
            <div style={{ fontSize: 9, color: 'var(--blue)', fontWeight: 700 }}>ACTIVE MODEL: LSTM-V4 PRO</div>
          </div>
          <div style={{ textAlign: 'right' }}>
             <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--green)', fontFamily: 'Space Mono' }}>{data.symbol}</div>
             <div style={{ fontSize: 8, color: '#4a5e78' }}>LIVE FEED</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', height: 350 }}>
        <div style={{ padding: 20, position: 'relative' }}>
          <NeuralProjectionChart historical={historical} projection={data.projection} symbol={data.symbol} />
          <div style={{ position: 'absolute', top: 30, right: 30, padding: '8px 12px', background: 'rgba(59,130,246,0.1)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.2)', backdropFilter: 'blur(10px)' }}>
             <div style={{ fontSize: 8, color: 'var(--blue)', fontWeight: 800, mb: 4 }}>CONFIDENCE</div>
             <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{(data.telemetry.confidence * 100).toFixed(1)}%</div>
          </div>
        </div>

        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)', padding: 20, display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#8899b4' }}>TRAINING TELEMETRY</div>
          
          {[
            { label: 'Network Loss', val: data.telemetry.loss, icon: '📉' },
            { label: 'Backtest Accuracy', val: `${data.telemetry.accuracy}%`, icon: '🎯' },
            { label: 'Epochs Evaluated', val: data.telemetry.epoch, icon: '🔄' },
            { label: 'Neurons Active', val: '4,096', icon: '⚡' }
          ].map((item, i) => (
            <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', mb: 6 }}>
                <span style={{ fontSize: 9, color: '#4a5e78', textTransform: 'uppercase' }}>{item.label}</span>
                <span style={{ fontSize: 12 }}>{item.icon}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#eef2fa', fontFamily: 'Space Mono' }}>{item.val}</div>
            </div>
          ))}

          <div style={{ mt: 'auto', padding: '10px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 8, border: '1px solid rgba(16, 185, 129, 0.1)', textAlign: 'center' }}>
             <div style={{ fontSize: 8, color: 'var(--green)', fontWeight: 800 }}>PROJECTION STATUS</div>
             <div style={{ fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>STABLE PATH</div>
          </div>
        </div>
      </div>
    </div>
  );
}
