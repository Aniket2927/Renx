import api from '../../../services/api';

// API service for stock market data
export const stockAPI = {
  // Get real-time price for a symbol
  getPrice: async (symbol) => {
    try {
      const response = await api.get(`/stock/price/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching price:', error);
      throw error;
    }
  },
  
  // Get quotes for multiple symbols
  getQuotes: async (symbols) => {
    try {
      const symbolsParam = Array.isArray(symbols) ? symbols.join(',') : symbols;
      const response = await api.get(`/stock/quotes/${symbolsParam}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quotes:', error);
      throw error;
    }
  },
  
  // Get chart data (time series)
  getChartData: async (symbol, interval = '1day', outputsize = 30) => {
    try {
      const response = await api.get(`/stock/chart/${symbol}`, {
        params: { interval, outputsize }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  },
  
  // Get technical indicator
  getIndicator: async (symbol, indicator, interval = '1day', outputsize = 30, params = {}) => {
    try {
      const response = await api.get(`/stock/indicators/${symbol}/${indicator}`, {
        params: { interval, outputsize, ...params }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${indicator}:`, error);
      throw error;
    }
  },
  
  // Search for symbols
  searchSymbols: async (query, exchange = 'NASDAQ') => {
    try {
      const response = await api.get('/stock/symbols', {
        params: { exchange }
      });
      
      // Filter results based on search query
      const data = response.data.data;
      if (!query) return data;
      
      // Return filtered results based on symbol or name match
      return data.filter(item => 
        item.symbol.toLowerCase().includes(query.toLowerCase()) ||
        item.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 15); // Limit to 15 results
    } catch (error) {
      console.error('Error searching symbols:', error);
      throw error;
    }
  },
  
  // Get batch data (multiple endpoints in one request)
  getBatchData: async (symbol, endpoints = 'quote,time_series', params = {}) => {
    try {
      const response = await api.get(`/stock/batch/${symbol}`, {
        params: { endpoints, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching batch data:', error);
      throw error;
    }
  }
}; 