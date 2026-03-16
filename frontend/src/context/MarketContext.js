import { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { getListings } from '../services/api';

const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [listings, setListings] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [prices, setPrices] = useState({});
  const [tickerUpdates, setTickerUpdates] = useState({}); // New micro-updates
  const [whaleAlerts, setWhaleAlerts] = useState([]);
  const [newsHeadlines, setNewsHeadlines] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initial fetch
    getListings().then(res => {
      setListings(res.data.data);
      setLastUpdated(res.data.lastUpdated);
      const priceMap = {};
      res.data.data.forEach(coin => { priceMap[coin.symbol] = coin.price; });
      setPrices(priceMap);
    }).catch(console.error);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const newSocket = io(apiUrl);
    setSocket(newSocket);

    newSocket.on('priceUpdate', (data) => {
      setListings(data.data);
      setLastUpdated(data.lastUpdated);
      
      const priceMap = {};
      data.data.forEach(coin => {
        priceMap[coin.symbol] = coin.price;
      });
      setPrices(priceMap);
      setTickerUpdates({}); // Reset micro-updates when full refresh happens
    });

    newSocket.on('tickerUpdate', (updates) => {
      setTickerUpdates(prev => ({ ...prev, ...updates }));
    });

    newSocket.on('whaleAlert', (alert) => {
      setWhaleAlerts(prev => [alert, ...prev].slice(0, 10));
    });

    newSocket.on('newsUpdate', (news) => {
      setNewsHeadlines(prev => [news, ...prev].slice(0, 20));
    });

    return () => newSocket.close();
  }, []);

  return (
    <MarketContext.Provider value={{ listings, prices, tickerUpdates, whaleAlerts, newsHeadlines, lastUpdated, socket }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
