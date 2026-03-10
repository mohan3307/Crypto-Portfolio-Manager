export const formatCurrency = (value, decimals = 2) => {
  if (value === null || value === undefined) return '$—';
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1) return `$${value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  return `$${value.toFixed(6)}`;
};

export const formatPercent = (value) => {
  if (value === null || value === undefined) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const formatNumber = (value) => {
  if (!value) return '—';
  return value.toLocaleString('en-US');
};

export const getChangeColor = (value) => {
  if (value > 0) return '#00d4aa';
  if (value < 0) return '#ff4757';
  return '#a0aec0';
};

export const getChangeClass = (value) => {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
};

export const getCoinLogo = (coinId) =>
  `https://s2.coinmarketcap.com/static/img/coins/64x64/${coinId}.png`;
