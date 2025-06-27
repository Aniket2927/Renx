import axios from 'axios';
import config from '../config/config';

// Create a consolidated axios instance with enhanced configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3344/api',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Enhanced request interceptor with automatic authentication
api.interceptors.request.use(
  (config) => {
    // Try multiple token storage keys for compatibility
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add correlation ID for request tracking
    config.headers['X-Correlation-ID'] = generateCorrelationId();
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with intelligent error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration with automatic refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', { refreshToken });
          const { accessToken } = response.data.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('token', accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      // If refresh fails, clear auth data and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Enhanced error logging
    console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'Network Error'}`, error.response?.data || error.message);
    
    return Promise.reject(error);
  }
);

// Utility function for correlation ID generation
function generateCorrelationId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Consolidated Auth API with enhanced error handling
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },
  
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },
  
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  },
  
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/password', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  }
};

// Consolidated Trades API with enhanced functionality
export const tradesAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/trades');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch trades');
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/trades/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch trade');
    }
  },
  
  getTradeHistory: async (symbol) => {
    try {
      const response = await api.get(`/trades/history${symbol ? `?symbol=${symbol}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch trade history');
    }
  },
  
  create: async (tradeData) => {
    try {
      const response = await api.post('/trades', tradeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create trade');
    }
  },
  
  update: async (id, tradeData) => {
    try {
      const response = await api.put(`/trades/${id}`, tradeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update trade');
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/trades/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete trade');
    }
  }
};

// Consolidated Trading API for order management
export const tradingAPI = {
  placeOrder: async (orderData) => {
    try {
      const response = await api.post('/trading/orders', orderData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Order placement failed');
    }
  },
  
  getOrders: async () => {
    try {
      const response = await api.get('/trading/orders');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },
  
  cancelOrder: async (orderId) => {
    try {
      const response = await api.delete(`/trading/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Order cancellation failed');
    }
  },
  
  getPositions: async () => {
    try {
      const response = await api.get('/trading/positions');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch positions');
    }
  }
};

// Consolidated Orderbook API
export const orderbookAPI = {
  get: async (symbol) => {
    try {
      const response = await api.get(`/orderbook/${symbol}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orderbook');
    }
  },
  
  placeOrder: async (orderData) => {
    try {
      const response = await api.post('/orderbook/orders', orderData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Order placement failed');
    }
  },
  
  cancelOrder: async (orderId) => {
    try {
      const response = await api.delete(`/orderbook/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Order cancellation failed');
    }
  },
  
  getUserOrders: async () => {
    try {
      const response = await api.get('/orderbook/orders/user');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user orders');
    }
  }
};

// Consolidated Watchlist API
export const watchlistAPI = {
  get: async () => {
    try {
      const response = await api.get('/watchlist');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch watchlist');
    }
  },
  
  addSymbol: async (symbol) => {
    try {
      const response = await api.post('/watchlist/symbols', { symbol });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add symbol to watchlist');
    }
  },
  
  removeSymbol: async (symbol) => {
    try {
      const response = await api.delete(`/watchlist/symbols/${symbol}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove symbol from watchlist');
    }
  }
};

// Consolidated Portfolio API
export const portfolioAPI = {
  getSummary: async () => {
    try {
      const response = await api.get('/portfolio/summary');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch portfolio summary');
    }
  },
  
  getPerformance: async () => {
    try {
      const response = await api.get('/portfolio/performance');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch portfolio performance');
    }
  },
  
  getAll: async () => {
    try {
      const response = await api.get('/portfolios');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch portfolios');
    }
  }
};

// Consolidated AI API for predictions and analysis
export const aiAPI = {
  predictPrice: async (symbol, historicalData) => {
    try {
      const API_URL = config.API_URL;
      const response = await fetch(`${API_URL}${config.ENDPOINTS.PREDICT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ symbol, historical_data: historicalData }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in price prediction:', error);
      throw new Error(error.message || 'Price prediction failed');
    }
  },

  analyzeSentiment: async (text) => {
    try {
      const API_URL = config.API_URL;
      const response = await fetch(`${API_URL}${config.ENDPOINTS.SENTIMENT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in sentiment analysis:', error);
      throw new Error(error.message || 'Sentiment analysis failed');
    }
  },

  getTradingSignal: async (symbol, features) => {
    try {
      const API_URL = config.API_URL;
      const response = await fetch(`${API_URL}${config.ENDPOINTS.SIGNALS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ symbol, features }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in trading signal:', error);
      throw new Error(error.message || 'Trading signal failed');
    }
  },

  checkHealth: async () => {
    try {
      const API_URL = config.API_URL;
      const response = await fetch(`${API_URL}${config.ENDPOINTS.HEALTH}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in health check:', error);
      throw new Error(error.message || 'Health check failed');
    }
  }
};

// Consolidated Market Data API
export const marketAPI = {
  getQuote: async (symbol) => {
    try {
      const response = await api.get(`/market/quote/${symbol}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch market quote');
    }
  },
  
  getBatchQuotes: async (symbols) => {
    try {
      const response = await api.post('/market/quotes', { symbols });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch batch quotes');
    }
  },
  
  getTimeSeries: async (symbol, interval = '1day', outputsize = 'compact') => {
    try {
      const response = await api.get(`/market/timeseries/${symbol}`, {
        params: { interval, outputsize }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch time series data');
    }
  }
};

// Export the consolidated API instance and all service modules
export default api;

// Export consolidated API service object for backward compatibility
export const apiService = {
  // Re-export all APIs for easy access
  auth: authAPI,
  trades: tradesAPI,
  trading: tradingAPI,
  orderbook: orderbookAPI,
  watchlist: watchlistAPI,
  portfolio: portfolioAPI,
  ai: aiAPI,
  market: marketAPI,
  
  // Legacy methods for backward compatibility
  predictPrice: aiAPI.predictPrice,
  analyzeSentiment: aiAPI.analyzeSentiment,
  getTradingSignal: aiAPI.getTradingSignal,
  checkHealth: aiAPI.checkHealth
}; 