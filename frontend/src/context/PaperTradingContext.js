import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  getPaperPositions, 
  getPaperHistory, 
  openPaperPosition, 
  closePaperPosition, 
  resetPaperAccount 
} from '../services/api';

const PaperContext = createContext();

const INITIAL_BALANCE = 100000;

export const PaperTradingProvider = ({ children }) => {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const [loading, setLoading] = useState(true);

  // Initial fetch from backend
  useEffect(() => {
    const fetchPaperData = async () => {
      try {
        const [posRes, histRes] = await Promise.all([
          getPaperPositions(),
          getPaperHistory()
        ]);
        setPositions(posRes.data.data || []);
        setHistory(histRes.data.data || []);
        
        // Use balance from the user profile or the last trade if not explicit
        // For simplicity, we'll keep the balance in state, but ideally fetch from user profile
      } catch (err) {
        console.error("Paper Trading Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaperData();
  }, []);

  const updatePrices = (prices) => setLivePrices(prices);

  const openPosition = async ({ symbol, coinName, logo, type, quantity, price }) => {
    try {
      const res = await openPaperPosition({ symbol, coinName, logo, type, quantity, price });
      setPositions(prev => [res.data.data, ...prev]);
      if (res.data.balance) setBalance(res.data.balance);
      toast.success(`📈 Opened ${type.toUpperCase()} ${quantity} ${symbol} @ $${price.toLocaleString()}`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to open position');
      return false;
    }
  };

  const closePosition = async (positionId, currentPrice) => {
    const pos = positions.find(p => p.id === positionId || p._id === positionId);
    if (!pos) return;
    const cp = currentPrice || livePrices[pos.symbol] || pos.entryPrice;

    try {
      const res = await closePaperPosition(positionId, { currentPrice: cp });
      setHistory(prev => [res.data.data, ...prev].slice(0, 100));
      setPositions(prev => prev.filter(p => (p.id !== positionId && p._id !== positionId)));
      if (res.data.balance) setBalance(res.data.balance);

      const pnl = res.data.data.pnl;
      const emoji = pnl >= 0 ? '💚' : '🔴';
      toast.info(`${emoji} Closed ${pos.coinName}: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`);
    } catch (err) {
      toast.error('Failed to close position');
    }
  };

  const resetAccount = async () => {
    if (!window.confirm('Reset paper trading account on server? All positions and history will be lost.')) return;
    try {
      const res = await resetPaperAccount();
      setBalance(INITIAL_BALANCE);
      setPositions([]);
      setHistory([]);
      toast.success('Paper account reset to $100,000');
    } catch (err) {
      toast.error('Reset failed');
    }
  };

  const setStopLoss = (id, val) => setPositions(prev => prev.map(p => (p.id === id || p._id === id) ? { ...p, stopLoss: val } : p));
  const setTakeProfit = (id, val) => setPositions(prev => prev.map(p => (p.id === id || p._id === id) ? { ...p, takeProfit: val } : p));

  // Auto-close SL/TP logic remains frontend-side for immediate responsiveness
  useEffect(() => {
    positions.forEach(pos => {
      const cp = livePrices[pos.symbol];
      if (!cp) return;
      if (pos.stopLoss && ((pos.type === 'long' && cp <= pos.stopLoss) || (pos.type === 'short' && cp >= pos.stopLoss))) {
        toast.warn(`🛑 Stop Loss triggered for ${pos.coinName}`);
        closePosition(pos.id || pos._id, cp);
      }
      if (pos.takeProfit && ((pos.type === 'long' && cp >= pos.takeProfit) || (pos.type === 'short' && cp <= pos.takeProfit))) {
        toast.success(`🎯 Take Profit hit for ${pos.coinName}!`);
        closePosition(pos.id || pos._id, cp);
      }
    });
  }, [livePrices]);

  const totalEquity = positions.reduce((sum, p) => {
    const cp = livePrices[p.symbol] || p.entryPrice;
    const pnl = p.type === 'long' ? (cp - p.entryPrice) * p.quantity : (p.entryPrice - p.quantity) * p.quantity;
    return sum + p.entryPrice * p.quantity + pnl;
  }, 0);

  const totalPnL = positions.reduce((sum, p) => {
    const cp = livePrices[p.symbol] || p.entryPrice;
    return sum + (p.type === 'long' ? (cp - p.entryPrice) * p.quantity : (p.entryPrice - cp) * p.quantity);
  }, 0);

  const historyPnL = history.reduce((s, h) => s + h.pnl, 0);
  const winRate = history.length ? (history.filter(h => h.pnl > 0).length / history.length) * 100 : 0;

  return (
    <PaperContext.Provider value={{
      balance, positions, history, livePrices,
      totalEquity, totalPnL, historyPnL, winRate, loading,
      openPosition, closePosition, resetAccount,
      setStopLoss, setTakeProfit, updatePrices,
      INITIAL_BALANCE,
    }}>
      {children}
    </PaperContext.Provider>
  );
};

export const usePaperTrading = () => useContext(PaperContext);
