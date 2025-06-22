const axios = require('axios');
require('dotenv').config();

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

// Error handling wrapper for API calls
const apiCall = async (endpoint, params = {}) => {
  try {
    const url = `${BASE_URL}/${endpoint}`;
    const response = await axios.get(url, { 
      params: { 
        ...params, 
        apikey: TWELVE_DATA_API_KEY 
      } 
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error calling Twelve Data API (${endpoint}):`, error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      // Return error data for better client-side handling
      throw {
        status: error.response.status,
        message: error.response.data.message || 'API Error',
        code: error.response.data.code || 'UNKNOWN_ERROR'
      };
    } else if (error.request) {
      // The request was made but no response was received
      throw {
        status: 503,
        message: 'Service temporarily unavailable',
        code: 'SERVICE_UNAVAILABLE'
      };
    } else {
      // Something happened in setting up the request
      throw {
        status: 500,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      };
    }
  }
};

const twelveDataAPI = {
  // Get real-time price for a symbol
  getPrice: async (symbol) => {
    return apiCall('price', { symbol });
  },
  
  // Get time series data for a symbol (candlestick data)
  getTimeSeries: async (symbol, interval = '1min', outputsize = 30) => {
    return apiCall('time_series', { 
      symbol, 
      interval, 
      outputsize
    });
  },
  
  // Get multiple stock quotes at once (more efficient)
  getQuotes: async (symbols) => {
    const symbolString = Array.isArray(symbols) ? symbols.join(',') : symbols;
    return apiCall('quote', { symbol: symbolString });
  },
  
  // Get technical indicators like RSI, MACD, etc.
  getIndicator: async (symbol, indicator, interval = '1day', outputsize = 30, params = {}) => {
    return apiCall(indicator, {
      symbol,
      interval,
      outputsize,
      ...params
    });
  },
  
  // Get stock symbols list (for search functionality)
  getSymbols: async (exchange = 'NASDAQ') => {
    return apiCall('stocks', { exchange });
  }
};

module.exports = twelveDataAPI; 