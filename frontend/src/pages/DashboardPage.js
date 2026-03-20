import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { getPortfolio, getTrending, getChartData } from '../services/api';
import { useMarket } from '../context/MarketContext';
import { formatCurrency, formatPercent } from '../utils/format';
import FearGreedGauge from '../components/Charts/FearGreedGauge';
import OnChainFeed from '../components/Dashboard/OnChainFeed';
import AITrendScanner from '../components/Tools/AITrendScanner';
import RiskCalculator from '../components/Tools/RiskCalculator';
import EconomicCalendar from '../components/Tools/EconomicCalendar';
import SentimentGauge from '../components/Charts/SentimentGauge';
import PredictiveGlance from '../components/Dashboard/PredictiveGlance';
import OrderBookDepth from '../components/Dashboard/OrderBookDepth';
import RiskTelemetry from '../components/Dashboard/RiskTelemetry';
import CorrelationMatrix from '../components/Charts/CorrelationMatrix';
import MacroBarometer from '../components/Dashboard/MacroBarometer';
import NeuralForecastingHub from '../components/Dashboard/NeuralForecastingHub';
import StrategyBacktester from '../components/Dashboard/StrategyBacktester';
import WhaleFlowMap from '../components/Dashboard/WhaleFlowMap';
import SectorDecomposition from '../components/Dashboard/SectorDecomposition';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const COLORS = ['#fff', '#888', '#444', '#aaa', '#666', '#eee', '#222'];

const donutOptions = {
  responsive: true, maintainAspectRatio: false, cutout: '85%',
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#000', borderColor: '#fff', borderWidth: 1, titleFont: { size: 10, family: 'var(--font-mono)' }, bodyFont: { size: 11, family: 'var(--font-mono)' }, padding: 12 } }
};

function StatCard({ label, val, sub, cls }) {
  const accent = cls === 'red' ? 'var(--red)' : cls === 'green' ? 'var(--green)' : '#fff';
  return (
    <div className="card" style={{ padding: '20px', background: '#000', border: '2px solid var(--border)' }}>
      <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)', letterSpacing: -1 }}>{val}</div>
      <div style={{ fontSize: 9, color: accent, fontWeight: 900, marginTop: 8, letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>{sub}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { listings } = useMarket();
  const [portfolio, setPortfolio] = useState(null);
  const [trending, setTrending] = useState([]);
  const [showCommand, setShowCommand] = useState(false);
  const [workspace, setWorkspace] = useState('TACTICAL');
  const [loading, setLoading] = useState(true);
  const [btcChart, setBtcChart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [p, t, c] = await Promise.all([getPortfolio(), getTrending(), getChartData('BTC', '7d')]);
        setPortfolio(p.data);
        setTrending(t.data);
        setBtcChart(c.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'v4-spin 1s linear infinite' }} />
    </div>
  );

  const { summary, items } = portfolio || { summary: { totalValue: 0, totalInvested: 0, totalPnL: 0, totalPnLPct: 0 }, items: [] };
  const sortedItems = [...items].sort((a, b) => b.currentValue - a.currentValue);

  const allocationData = {
    labels: sortedItems.slice(0, 7).map(i => i.symbol),
    datasets: [{ data: sortedItems.slice(0, 7).map(i => i.currentValue), backgroundColor: COLORS, borderWidth: 0, hoverOffset: 15 }]
  };

  const lineData = {
    labels: btcChart.map((d, i) => i % 12 === 0 ? new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
    datasets: [{ 
      label: 'BTC_VECTOR', 
      data: btcChart.map(d => d.price), 
      borderColor: '#fff', 
      backgroundColor: 'transparent', 
      fill: false, 
      tension: 0, 
      pointRadius: 0, 
      borderWidth: 2 
    }]
  };

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      
      <header className="v4-dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 40, height: 40, background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900 }}>CMD</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>TACTICAL_COMMAND_CENTRAL</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <div style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%' }} />
              <div style={{ fontSize: 9, color: 'var(--green)', fontWeight: 900, letterSpacing: 2 }}>NEURAL_ENGINE_ACTIVE_v4.2</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {['TACTICAL', 'ANALYTICS'].map(mode => (
            <button key={mode} onClick={() => setWorkspace(mode)} className={`v4-mode-btn ${workspace === mode ? 'active' : ''}`}>{mode}_SURVEILLANCE</button>
          ))}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 40, marginBottom: 40 }}>
        
        {/* Main Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <StatCard label="TACTICAL_EQUITY" val={formatCurrency(summary.totalValue)} sub={`${formatPercent(summary.totalPnLPct)} 24H_CHG`} cls="blue" />
            <StatCard label="ALLOCATED_POOL" val={formatCurrency(summary.totalInvested)} sub={`${items.length} ACTIVE_NODES`} cls="green" />
            <StatCard label="GROSS_DIFF" val={formatCurrency(summary.totalPnL)} sub="REALTIME_SYNC" cls={summary.totalPnL >= 0 ? 'green' : 'red'} />
            <StatCard label="NEURAL_SCAN" val="12.4%_CONF" sub="BULLISH_BIAS" cls="gold" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
            <div className="card" style={{ padding: 24, background: '#000', border: '2px solid var(--border)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: 2 }}>BENCHMARK_TELEMETRY // BTC_7D</div>
                  <div style={{ fontSize: 9, color: '#fff', fontWeight: 900 }}>LIVE_FEED</div>
               </div>
               <div style={{ height: 280 }}>
                 <Line data={lineData} options={{ 
                    responsive: true, maintainAspectRatio: false, 
                    plugins: { legend: { display: false } },
                    scales: { 
                      x: { grid: { display: false }, ticks: { color: 'var(--text-dim)', font: { size: 9, family: 'var(--font-mono)' } } },
                      y: { grid: { color: 'rgba(255,255,255,0.05)', borderDash: [2, 2] }, ticks: { color: 'var(--text-dim)', font: { size: 9, family: 'var(--font-mono)' } } }
                    }
                 }} />
               </div>
            </div>
            <div className="card" style={{ padding: 24, background: '#000', border: '2px solid var(--border)' }}>
               <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 20 }}>ORDER_BOOK_DENSITY</div>
               <OrderBookDepth />
            </div>
          </div>

          {workspace === 'TACTICAL' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
                  <div className="card" style={{ padding: 24, background: '#000', border: '2px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                       <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: 2 }}>NEURAL_VECTOR_SCANNER</div>
                       <div style={{ fontSize: 8, padding: '2px 6px', border: '1px solid #fff', color: '#fff' }}>OPTIMIZED</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {[
                        { type: 'SIGNAL', msg: 'BTC/USDT: Bullish Momentum detected on 4H TF', val: '88%_CONF' },
                        { type: 'WHALE', msg: '2,500 BTC ($185M) inflow from unknown cluster', val: 'CRITICAL' },
                        { type: 'ALPHA', msg: 'Institutional RSI divergence identified on ETH/BTC', val: 'DETECTED' }
                      ].map((evt, i) => (
                        <div key={i} className="v4-event-row" style={{ border: 'none', background: '#080808', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{evt.msg}</span>
                          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontWeight: 900 }}>{evt.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                     <PredictiveGlance />
                     <SentimentGauge />
                  </div>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                  <WhaleFlowMap />
                  <StrategyBacktester />
                  <EconomicCalendar />
               </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
               <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                  <NeuralForecastingHub />
                  <MacroBarometer />
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <CorrelationMatrix />
                  <SectorDecomposition />
               </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <RiskTelemetry />
            <AITrendScanner />
            <RiskCalculator />
          </div>
        </div>

        {/* Tactical Side Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
           <div className="card" style={{ padding: 24, background: '#000', border: '2px solid var(--border)' }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: 2, textAlign: 'center', marginBottom: 24 }}>LIQUIDITY_ALLOCATION</div>
              <div style={{ height: 240, position: 'relative' }}>
                 <Doughnut data={allocationData} options={donutOptions} />
                 <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 2 }}>ACTIVE_NODES</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{items.length}</div>
                 </div>
              </div>
           </div>

           <OnChainFeed />

           <div className="card" style={{ padding: 24, background: '#000', border: '2px solid var(--border)' }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 20 }}>TOP_ALPHA_GAINERS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {trending?.topGainers?.slice(0, 6).map((c, i) => (
                  <div key={i} className="v4-trending-row" style={{ background: '#080808', border: 'none', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                       <img src={c.logo} width={18} height={18} alt="" style={{ borderRadius: '2px', background: '#fff' }} />
                       <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{c.symbol}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>+{c.change24h.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
           </div>

           <div className="card" style={{ padding: 24, background: '#000', border: '2px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 20 }}>FEAR_GREED_SURVEILLANCE</div>
              <FearGreedGauge />
           </div>
        </div>
      </div>

      <style>{`
        .v4-dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding: 24px 0; border-bottom: 2px solid var(--border); }
        .v4-header-icon-box { width: 44px; height: 44px; background: #fff; color: #000; border-radius: 2px; display: flex; alignItems: center; justifyContent: center; fontSize: 18px; font-weight: 900; }
        
        .v4-mode-btn { background: #070707; border: 2px solid var(--border); color: var(--text-dim); padding: 10px 20px; font-size: 9px; font-weight: 900; letter-spacing: 2px; cursor: pointer; transition: 0.1s; }
        .v4-mode-btn.active { background: #fff; color: #000; border-color: #fff; }

        .v4-event-row { padding: 14px 18px; background: #050505; border: 1px solid var(--border); display: flex; justifyContent: space-between; alignItems: center; transition: 0.1s; }
        .v4-event-row:hover { border-color: var(--text-muted); transform: translateX(4px); }

        .v4-trending-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #050505; border: 1px solid var(--border); transition: 0.1s; }
        .v4-trending-row:hover { border-color: var(--text-muted); }

        .v4-tag { font-size: 8px; fontWeight: 900; letterSpacing: 1px; padding: 3px 6px; border-radius: 2px; }
        .v4-tag.blue { background: var(--blue-bg); color: var(--blue); border: 1px solid var(--blue); }
      `}</style>
    </div>
  );
}
