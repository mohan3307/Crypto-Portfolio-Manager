import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const PaperContext = createContext();

const INITIAL_BALANCE = 100000;

export const PaperTradingProvider = ({ children }) => {
  const [balance, setBalance] = useState(() => {
    const s = localStorage.getItem('cn-paper');
    return s ? JSON.parse(s).balance : INITIAL_BALANCE;
  });
  const [positions, setPositions] = useState(() => {
    const s = localStorage.getItem('cn-paper');
    return s ? JSON.parse(s).positions : [];
  });
  const [history, setHistory] = useState(() => {
    const s = localStorage.getItem('cn-paper');
    return s ? JSON.parse(s).history : [];
  });
  const [livePrices, setLivePrices] = useState({});

  useEffect(() => {
    localStorage.setItem('cn-paper', JSON.stringify({ balance, positions, history }));
  }, [balance, positions, history]);

  const updatePrices = (prices) => setLivePrices(prices);

  const openPosition = ({ symbol, coinName, logo, type, quantity, price }) => {
    const cost = quantity * price;
    if (type === 'long' && cost > balance) {
      toast.error('Insufficient paper balance!'); return false;
    }
    const position = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      coinName, logo, type,
      quantity: parseFloat(quantity),
      entryPrice: parseFloat(price),
      openedAt: new Date().toISOString(),
      stopLoss: null, takeProfit: null,
    };
    setPositions(prev => [...prev, position]);
    if (type === 'long') setBalance(b => b - cost);
    toast.success(`📈 Opened ${type.toUpperCase()} ${quantity} ${symbol} @ $${price.toLocaleString()}`);
    return true;
  };

  const closePosition = (positionId, currentPrice) => {
    const pos = positions.find(p => p.id === positionId);
    if (!pos) return;
    const cp = currentPrice || livePrices[pos.symbol] || pos.entryPrice;
    const pnl = pos.type === 'long'
      ? (cp - pos.entryPrice) * pos.quantity
      : (pos.entryPrice - cp) * pos.quantity;
    const returnPct = (pnl / (pos.entryPrice * pos.quantity)) * 100;

    const closed = {
      ...pos, exitPrice: cp, closedAt: new Date().toISOString(),
      pnl, returnPct,
    };
    setHistory(prev => [closed, ...prev].slice(0, 100));
    setPositions(prev => prev.filter(p => p.id !== positionId));
    setBalance(b => b + pos.entryPrice * pos.quantity + pnl);

    const emoji = pnl >= 0 ? '💚' : '🔴';
    toast.info(`${emoji} Closed ${pos.coinName}: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`);
  };

  const resetAccount = () => {
    if (!window.confirm('Reset paper trading account? All positions and history will be lost.')) return;
    setBalance(INITIAL_BALANCE);
    setPositions([]);
    setHistory([]);
    toast.success('Paper account reset to $100,000');
  };

  const setStopLoss = (id, val) => setPositions(prev => prev.map(p => p.id === id ? { ...p, stopLoss: val } : p));
  const setTakeProfit = (id, val) => setPositions(prev => prev.map(p => p.id === id ? { ...p, takeProfit: val } : p));

  // Auto-close SL/TP
  useEffect(() => {
    positions.forEach(pos => {
      const cp = livePrices[pos.symbol];
      if (!cp) return;
      if (pos.stopLoss && ((pos.type === 'long' && cp <= pos.stopLoss) || (pos.type === 'short' && cp >= pos.stopLoss))) {
        toast.warn(`🛑 Stop Loss triggered for ${pos.coinName}`);
        closePosition(pos.id, cp);
      }
      if (pos.takeProfit && ((pos.type === 'long' && cp >= pos.takeProfit) || (pos.type === 'short' && cp <= pos.takeProfit))) {
        toast.success(`🎯 Take Profit hit for ${pos.coinName}!`);
        closePosition(pos.id, cp);
      }
    });
  }, [livePrices]);

  const totalEquity = positions.reduce((sum, p) => {
    const cp = livePrices[p.symbol] || p.entryPrice;
    const pnl = p.type === 'long' ? (cp - p.entryPrice) * p.quantity : (p.entryPrice - cp) * p.quantity;
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
      totalEquity, totalPnL, historyPnL, winRate,
      openPosition, closePosition, resetAccount,
      setStopLoss, setTakeProfit, updatePrices,
      INITIAL_BALANCE,
    }}>
      {children}
    </PaperContext.Provider>
  );
};

export const usePaperTrading = () => useContext(PaperContext);
