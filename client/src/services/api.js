import axios from 'axios';
import config from '../config/config';

// Create an axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData)
};

// Trades API
export const tradesAPI = {
  getAll: () => api.get('/trades'),
  getById: (id) => api.get(`/trades/${id}`),
  create: (tradeData) => api.post('/trades', tradeData),
  update: (id, tradeData) => api.put(`/trades/${id}`, tradeData),
  delete: (id) => api.delete(`/trades/${id}`)
};

// Orderbook API
export const orderbookAPI = {
  get: (symbol) => api.get(`/orderbook/${symbol}`),
  placeOrder: (orderData) => api.post('/orderbook/orders', orderData),
  cancelOrder: (orderId) => api.delete(`/orderbook/orders/${orderId}`),
  getUserOrders: () => api.get('/orderbook/orders/user')
};

// Watchlist API
export const watchlistAPI = {
  get: () => api.get('/watchlist'),
  addSymbol: (symbol) => api.post('/watchlist/symbols', { symbol }),
  removeSymbol: (symbol) => api.delete(`/watchlist/symbols/${symbol}`)
};

const API_URL = config.API_URL;

export const apiService = {
    async predictPrice(symbol, historicalData) {
        try {
            const response = await fetch(`${API_URL}${config.ENDPOINTS.PREDICT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ symbol, historical_data: historicalData }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error in price prediction:', error);
            throw error;
        }
    },

    async analyzeSentiment(text) {
        try {
            const response = await fetch(`${API_URL}${config.ENDPOINTS.SENTIMENT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error in sentiment analysis:', error);
            throw error;
        }
    },

    async getTradingSignal(symbol, features) {
        try {
            const response = await fetch(`${API_URL}${config.ENDPOINTS.SIGNALS}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ symbol, features }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error in trading signal:', error);
            throw error;
        }
    },

    async checkHealth() {
        try {
            const response = await fetch(`${API_URL}${config.ENDPOINTS.HEALTH}`);
            return await response.json();
        } catch (error) {
            console.error('Error in health check:', error);
            throw error;
        }
    }
};

export default api; 