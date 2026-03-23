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
import GlobalStats from '../components/Dashboard/GlobalStats';
import SpotlightCards from '../components/Dashboard/SpotlightCards';


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const COLORS = ['#fff', '#888', '#444', '#aaa', '#666', '#eee', '#222'];

const donutOptions = {
  responsive: true, maintainAspectRatio: false, cutout: '85%',
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#000', borderColor: '#fff', borderWidth: 1, titleFont: { size: 10, family: 'var(--font-mono)' }, bodyFont: { size: 11, family: 'var(--font-mono)' }, padding: 12 } }
};

function StatCard({ label, val, sub, cls }) {
  const accent = cls === 'red' ? 'var(--cmc-red)' : cls === 'green' ? 'var(--cmc-green)' : '#fff';
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{val}</div>
      <div className="stat-change" style={{ color: accent }}>{sub}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { listings } = useMarket();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [trending, setTrending] = useState([]);
  const [showCommand, setShowCommand] = useState(false);
  const [workspace, setWorkspace] = useState('TACTICAL');
  const [loading, setLoading] = useState(true);
  const [btcChart, setBtcChart] = useState([]);
  const [hideBalance, setHideBalance] = useState(false);

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

  const { summary, items = [] } = portfolio || { summary: { totalValue: 0, totalInvested: 0, totalPnL: 0, totalPnLPct: 0 }, items: [] };
  const sortedItems = [...(items || [])].sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0));

  const allocationData = {
    labels: sortedItems.slice(0, 7).map(i => i.symbol),
    datasets: [{ data: sortedItems.slice(0, 7).map(i => i.currentValue), backgroundColor: COLORS, borderWidth: 0, hoverOffset: 15 }]
  };

  const lineData = {
    labels: btcChart.map((d, i) => i % 12 === 0 ? new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
    datasets: [{ 
      label: 'BTC_VECTOR', 
      data: btcChart.map(d => d.price), 
      borderColor: 'var(--cmc-blue)', 
      backgroundColor: 'rgba(56, 97, 251, 0.1)', 
      fill: true, 
      tension: 0.4, 
      pointRadius: 0, 
      borderWidth: 2 
    }]
  };

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      
      <GlobalStats listings={listings} />

      <header className="v4-dashboard-header" style={{ padding: '32px 0 24px', borderBottom: 'none', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 48, height: 48, background: 'var(--cmc-blue)', color: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, boxShadow: '0 8px 16px rgba(56,97,251,0.2)' }}>CN</div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1, fontFamily: 'var(--font-display)' }}>PORTFOLIO_DASHBOARD</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
              <div className="live-badge">
                <div className="live-dot" />
                ASSET_MONITORING_ACTIVE
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>PRIVATE_NODE_v4.2</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setWorkspace('TACTICAL')} className={`v4-mode-btn ${workspace === 'TACTICAL' ? 'active' : ''}`} style={{ borderRadius: '8px' }}>TACTICAL</button>
            <button onClick={() => setWorkspace('ANALYTICS')} className={`v4-mode-btn ${workspace === 'ANALYTICS' ? 'active' : ''}`} style={{ borderRadius: '8px' }}>ANALYTICS</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: 32, marginBottom: 40 }}>
        
        {/* Main Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          <div className="card" style={{ padding: '32px', background: 'linear-gradient(135deg, var(--bg-card), var(--bg-void))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  CURRENT_BALANCE <span style={{ cursor: 'pointer' }} onClick={() => setHideBalance(!hideBalance)}>{hideBalance ? '👁️' : '🕶️'}</span>
                </div>
                <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: -1 }}>
                  {hideBalance ? '••••••••' : formatCurrency(summary.totalValue)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                  <span style={{ color: 'var(--cmc-green)', fontSize: 18, fontWeight: 800 }}>+{formatCurrency(summary.totalPnL)}</span>
                  <span style={{ background: 'var(--green-bg)', color: 'var(--cmc-green)', padding: '2px 8px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
                    {formatPercent(summary.totalPnLPct)} (24h)
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-primary" style={{ padding: '12px 24px', borderRadius: 12 }}>+ ADD NEW</button>
                <button className="btn-ghost" style={{ padding: '12px 24px', borderRadius: 12 }}>TRANSFER</button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
            <div className="card" style={{ padding: 28 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 4, height: 16, background: 'var(--cmc-blue)', borderRadius: 2 }} />
                    BALANCE_PERFORMANCE_VECTOR
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['1D', '7D', '1M', '1Y', 'ALL'].map(tf => <button key={tf} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 6, background: tf === '7D' ? 'var(--cmc-blue)' : 'var(--bg-input)', color: '#fff', border: 'none' }}>{tf}</button>)}
                  </div>
               </div>
               <div style={{ height: 320 }}>
                 <Line data={lineData} options={{ 
                    responsive: true, maintainAspectRatio: false, 
                    plugins: { legend: { display: false } },
                    scales: { 
                      x: { grid: { display: false }, ticks: { color: 'var(--text-muted)', font: { size: 10, family: 'var(--font-mono)' } } },
                      y: { grid: { color: 'rgba(255,255,255,0.03)', borderDash: [4, 4] }, border: { display: false }, ticks: { color: 'var(--text-muted)', font: { size: 10, family: 'var(--font-mono)' } } }
                    }
                 }} />
               </div>
            </div>
          </div>

          {workspace === 'TACTICAL' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
               <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 32 }}>
                  <div className="card" style={{ padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                       <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 4, height: 16, background: 'var(--cmc-red)', borderRadius: 2 }} />
                          NEURAL_VECTOR_SCANNER
                       </div>
                       <div className="badge-blue">QUANT_ENGINE_V4</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {[
                        { type: 'SIGNAL', msg: 'BTC/USDT: Bullish Momentum detected on 4H TF', val: '88%_CONF', color: 'var(--cmc-blue)' },
                        { type: 'WHALE', msg: '2,500 BTC ($185M) inflow from unknown cluster', val: 'CRITICAL', color: 'var(--cmc-red)' },
                        { type: 'ALPHA', msg: 'Institutional RSI divergence identified on ETH/BTC', val: 'DETECTED', color: 'var(--cmc-green)' }
                      ].map((evt, i) => (
                        <div key={i} className="v4-event-row" style={{ border: 'none', background: 'transparent', borderBottom: '1px solid var(--border-glow)', padding: '16px 0' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{evt.msg}</span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{new Date().toLocaleTimeString()} • {evt.type}</span>
                          </div>
                          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: evt.color, fontWeight: 900 }}>{evt.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                     <div className="card"><PredictiveGlance /></div>
                     <div className="card"><SentimentGauge /></div>
                  </div>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
                  <div className="card"><WhaleFlowMap /></div>
                  <div className="card"><StrategyBacktester /></div>
                  <div className="card"><EconomicCalendar /></div>
               </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
               <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
                  <div className="card"><NeuralForecastingHub /></div>
                  <div className="card"><MacroBarometer /></div>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                   <div className="card"><CorrelationMatrix /></div>
                   <div className="card"><SectorDecomposition /></div>
               </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 31 }}>
             <div className="card"><RiskTelemetry /></div>
             <div className="card"><AITrendScanner /></div>
             <div className="card"><RiskCalculator /></div>
          </div>
        </div>

        {/* Tactical Side Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
           <div className="card" style={{ padding: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 800, textAlign: 'center', marginBottom: 32 }}>LIQUIDITY_DENSITY_ALLOCATION</div>
              <div style={{ height: 260, position: 'relative' }}>
                 <Doughnut data={allocationData} options={donutOptions} />
                 <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 1 }}>NODES</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{items.length}</div>
                 </div>
              </div>
           </div>

           <div className="card-cmc"><OnChainFeed /></div>

           <div className="card" style={{ padding: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>TOP_ALPHA_GAINERS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {trending?.topGainers?.slice(0, 6).map((c, i) => (
                  <div key={i} className="v4-trending-row" style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-glow)', padding: '14px 0' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                       <img src={c.logo} width={22} height={22} alt="" style={{ borderRadius: '50%', background: '#fff' }} />
                       <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{c.symbol}</span>
                        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>TOP_{i+1}</span>
                       </div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--cmc-green)', fontWeight: 800 }}>+{c.change24h.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
              <button style={{ width: '100%', marginTop: 24, padding: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-glow)', borderRadius: 8, color: 'var(--cmc-blue)', fontSize: 11, fontWeight: 800 }}>VIEW_FULL_INTELLIGENCE</button>
           </div>

           <div className="card" style={{ padding: 28, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>FEAR_GREED_SURVEILLANCE</div>
              <FearGreedGauge />
           </div>

           <div className="card"><OrderBookDepth /></div>
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
