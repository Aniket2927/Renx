import axios from 'axios';

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

// Error handling wrapper for API calls
const apiCall = async (endpoint: string, params: Record<string, any> = {}) => {
  try {
    const url = `${BASE_URL}/${endpoint}`;
    const response = await axios.get(url, { 
      params: { 
        ...params, 
        apikey: TWELVE_DATA_API_KEY 
      } 
    });
    
    return response.data;
  } catch (error: any) {
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

export const twelveDataAPI = {
  // Get real-time price for a symbol
  getPrice: async (symbol: string) => {
    return apiCall('price', { symbol });
  },
  
  // Get time series data for a symbol (candlestick data)
  getTimeSeries: async (symbol: string, interval: string = '1min', outputsize: number = 30) => {
    return apiCall('time_series', { 
      symbol, 
      interval, 
      outputsize
    });
  },
  
  // Get multiple stock quotes at once (more efficient)
  getQuotes: async (symbols: string[] | string) => {
    const symbolString = Array.isArray(symbols) ? symbols.join(',') : symbols;
    return apiCall('quote', { symbol: symbolString });
  },
  
  // Get technical indicators like RSI, MACD, etc.
  getIndicator: async (symbol: string, indicator: string, interval: string = '1day', outputsize: number = 30, params: Record<string, any> = {}) => {
    return apiCall(indicator, {
      symbol,
      interval,
      outputsize,
      ...params
    });
  },
  
  // Get stock symbols list (for search functionality)
  getSymbols: async (exchange: string = 'NASDAQ') => {
    return apiCall('stocks', { exchange });
  },

  // Get cryptocurrency data
  getCrypto: async (symbol: string, interval: string = '1day') => {
    return apiCall('time_series', { 
      symbol, 
      interval,
      outputsize: 30 
    });
  },

  // Get forex data
  getForex: async (symbol: string, interval: string = '1day') => {
    return apiCall('time_series', { 
      symbol, 
      interval,
      outputsize: 30 
    });
  },

  // Get market status
  getMarketStatus: async () => {
    return apiCall('market_state');
  },

  // Get earnings data
  getEarnings: async (symbol: string) => {
    return apiCall('earnings', { symbol });
  },

  // Get company profile
  getProfile: async (symbol: string) => {
    return apiCall('profile', { symbol });
  }
};

export default twelveDataAPI; 