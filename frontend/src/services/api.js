import axios from 'axios';

const API = axios.create({
  baseURL: 'https://crypto-portfolio-manager-1.onrender.com/api',
  timeout: 10000
});

// Request interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
API.interceptors.response.use(
  (res) => res,
  (err) => {

    if (!err.response) {
      alert("Server not responding. Please wait a few seconds and try again.");
      return Promise.reject(err);
    }

    if (err.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);


// ================= AUTH =================

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');


// ================= MARKET =================

export const getListings = () => API.get('/market/listings');
export const getTrending = () => API.get('/market/trending');
export const getPrices = (symbols) =>
  API.get(`/market/prices${symbols ? `?symbols=${symbols}` : ''}`);
export const getChartData = (symbol, timeframe) =>
  API.get(`/market/chart/${symbol}/${timeframe}`);


// ================= PORTFOLIO =================

export const getPortfolio = () => API.get('/portfolio');
export const addToPortfolio = (data) => API.post('/portfolio/add', data);
export const updatePortfolioItem = (id, data) =>
  API.put(`/portfolio/${id}`, data);
export const deletePortfolioItem = (id) =>
  API.delete(`/portfolio/${id}`);


// ================= WATCHLIST =================

export const getWatchlist = () => API.get('/watchlist');
export const addToWatchlist = (data) => API.post('/watchlist/add', data);
export const removeFromWatchlist = (coinId) =>
  API.delete(`/watchlist/${coinId}`);


// ================= USER =================

export const updateProfile = (data) => API.put('/user/profile', data);
export const changePassword = (data) => API.put('/user/password', data);


export default API;