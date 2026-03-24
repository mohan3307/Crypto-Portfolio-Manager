import React from 'react';
import { formatCurrency } from '../../utils/format';
import { useMarket } from '../../context/MarketContext';

const StatItem = ({ label, value, change, color, isLink }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#7b94b8', whiteSpace: 'nowrap', cursor: isLink ? 'pointer' : 'default' }}>
    <span style={{ fontWeight: 500 }}>{label}:</span>
    <span style={{ color: color || '#3861fb', fontWeight: 600 }}>{value}</span>
    {change !== undefined && (
      <span style={{ color: change >= 0 ? '#16c784' : '#ea3943', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
        {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
      </span>
    )}
  </div>
);

const Separator = () => <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.06)', margin: '0 4px' }} />;

export default function GlobalStats() {
  const { listings, globalStats } = useMarket();
  
  const cryptoCount = globalStats?.cryptos || listings.length || '10,000+';
  const exchangeCount = globalStats?.exchanges || 764;
  const totalMCap = globalStats?.totalMCap || 2854321987654;
  const totalVol = globalStats?.totalVol || 124532198765;
  const btcDom = globalStats?.btcDom || 52.4;
  const ethDom = globalStats?.ethDom || 17.2;
  const ethGas = globalStats?.ethGas || 24;
  const fearGreedValue = Math.round(globalStats?.fearGreed || 65);

  return (
    <div style={{ 
      background: '#04070d', 
      borderBottom: '1px solid rgba(255,255,255,0.06)', 
      padding: '8px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      overflowX: 'auto',
      scrollbarWidth: 'none',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(12px)',
    }}>
      <StatItem label="Cryptos" value={cryptoCount.toLocaleString()} isLink />
      <Separator />
      <StatItem label="Exchanges" value={exchangeCount} isLink />
      <Separator />
      <StatItem label="Market Cap" value={formatCurrency(totalMCap)} change={2.4} isLink />
      <Separator />
      <StatItem label="24h Vol" value={formatCurrency(totalVol)} change={-12.5} isLink />
      <Separator />
      <StatItem label="Dominance" value={`BTC: ${btcDom.toFixed(1)}% ETH: ${ethDom.toFixed(1)}%`} isLink />
      <Separator />
      <StatItem label="ETH Gas" value={`${ethGas} Gwei`} color="#3861fb" isLink />
      <Separator />
      <StatItem label="Fear & Greed" value={`${fearGreedValue}/100`} color={fearGreedValue > 50 ? '#16c784' : '#ea3943'} isLink />
      <Separator />
      <StatItem label="DeFi MCap" value={formatCurrency(globalStats?.defiMCap || 84200000000)} change={1.2} isLink />
      <Separator />
      <StatItem label="Total TVL" value={formatCurrency(globalStats?.totalTVL || 104500000000)} change={-0.4} isLink />
    </div>
  );
}
