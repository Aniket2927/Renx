import axios from 'axios';

const API_URL = 'http://localhost:5000/api/stock';

const stockService = {
  // Get real-time price for a symbol
  getPrice: async (symbol) => {
    try {
      const response = await axios.get(`${API_URL}/price/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock price:', error);
      throw error;
    }
  },

  // Get multiple stock quotes at once
  getQuotes: async (symbols) => {
    try {
      const symbolString = Array.isArray(symbols) ? symbols.join(',') : symbols;
      const response = await axios.get(`${API_URL}/quotes/${symbolString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock quotes:', error);
      throw error;
    }
  },

  // Get chart data (time series)
  getChartData: async (symbol, interval = '1day', outputsize = 30) => {
    try {
      const response = await axios.get(`${API_URL}/chart/${symbol}`, {
        params: { interval, outputsize }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  },

  // Get technical indicator
  getIndicator: async (symbol, indicator, interval = '1day', outputsize = 30) => {
    try {
      const response = await axios.get(`${API_URL}/indicators/${symbol}/${indicator}`, {
        params: { interval, outputsize }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching indicator:', error);
      throw error;
    }
  },

  // Get batch data (multiple endpoints in one request)
  getBatchData: async (symbol, endpoints = ['quote', 'time_series']) => {
    try {
      const response = await axios.get(`${API_URL}/batch/${symbol}`, {
        params: { endpoints: endpoints.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching batch data:', error);
      throw error;
    }
  }
};

export default stockService; 