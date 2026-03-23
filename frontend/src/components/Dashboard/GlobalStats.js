import React from 'react';
import { formatCurrency } from '../../utils/format';

const StatItem = ({ label, value, change, color, isLink }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', cursor: isLink ? 'pointer' : 'default' }}>
    <span style={{ fontWeight: 500 }}>{label}:</span>
    <span style={{ color: color || 'var(--cmc-blue)', fontWeight: 600 }}>{value}</span>
    {change !== undefined && (
      <span style={{ color: change >= 0 ? 'var(--cmc-green)' : 'var(--cmc-red)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
        {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
      </span>
    )}
  </div>
);

const Separator = () => <div style={{ width: 1, height: 12, background: 'var(--cmc-border)', margin: '0 4px' }} />;

export default function GlobalStats({ listings = [] }) {
  const cryptoCount = listings.length ? listings.length.toLocaleString() : '10,000+';
  const exchangeCount = 764;
  const totalMCap = listings.reduce((a, b) => a + (b.marketCap || 0), 0) || 2854321987654;
  const totalVol = listings.reduce((a, b) => a + (b.volume24h || 0), 0) || 124532198765;
  const btcDom = (listings.find(c => c.symbol === 'BTC')?.marketCap || 0) / (totalMCap || 1) * 100 || 52.4;
  const ethDom = (listings.find(c => c.symbol === 'ETH')?.marketCap || 0) / (totalMCap || 1) * 100 || 17.2;

  return (
    <div style={{ 
      background: 'var(--bg-void)', 
      borderBottom: '1px solid var(--cmc-border)', 
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
      backgroundOpacity: 0.9
    }}>
      <StatItem label="Cryptos" value={cryptoCount} isLink />
      <Separator />
      <StatItem label="Exchanges" value={exchangeCount} isLink />
      <Separator />
      <StatItem label="Market Cap" value={formatCurrency(totalMCap)} change={2.4} isLink />
      <Separator />
      <StatItem label="24h Vol" value={formatCurrency(totalVol)} change={-12.5} isLink />
      <Separator />
      <StatItem label="Dominance" value={`BTC: ${btcDom.toFixed(1)}% ETH: ${ethDom.toFixed(1)}%`} isLink />
      <Separator />
      <StatItem label="ETH Gas" value="24 Gwei" color="var(--cmc-blue)" isLink />
      <Separator />
      <StatItem label="Fear & Greed" value="Index: 65 (Greed)" color="var(--cmc-green)" isLink />
      <Separator />
      <StatItem label="DeFi MCap" value="$84.2B" change={1.2} isLink />
      <Separator />
      <StatItem label="Total TVL" value="$104.5B" change={-0.4} isLink />
    </div>
  );
}
