import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { stockAPI } from '../api/stockAPI';

// Create stock market data context
const StockContext = createContext();

// List of default symbols to track
const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM'];

export const StockProvider = ({ children }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Fetch quotes for multiple symbols
  const fetchStocks = useCallback(async (symbols = DEFAULT_SYMBOLS) => {
    try {
      setLoading(true);
      const response = await stockAPI.getQuotes(symbols);
      
      if (response.success && response.data) {
        // Format the data to match the expected structure in components
        let formattedStocks;
        
        // Handle case where only one symbol was requested
        if (!Array.isArray(response.data)) {
          formattedStocks = [{
            symbol: response.data.symbol,
            name: response.data.name || '',
            price: parseFloat(response.data.close),
            change: parseFloat(response.data.change),
            volume: response.data.volume || '0',
            marketCap: response.data.market_cap || 'N/A',
            sector: response.data.sector || 'N/A'
          }];
        } else {
          formattedStocks = response.data.map(stock => ({
            symbol: stock.symbol,
            name: stock.name || '',
            price: parseFloat(stock.close),
            change: parseFloat(stock.change),
            volume: stock.volume || '0',
            marketCap: stock.market_cap || 'N/A',
            sector: stock.sector || 'N/A'
          }));
        }
        
        setStocks(formattedStocks);
        setLastUpdated(new Date());
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError(err.message || 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch single stock details
  const fetchStockDetails = useCallback(async (symbol) => {
    try {
      // Get batch data for efficiency (quote, time_series, etc.)
      const response = await stockAPI.getBatchData(
        symbol, 
        'quote,time_series', 
        { interval: '1day', outputsize: 30 }
      );
      
      if (response.success && response.data) {
        const { quote, time_series } = response.data;
        
        // Format stock details
        return {
          symbol: quote.symbol,
          name: quote.name || '',
          price: parseFloat(quote.close),
          change: parseFloat(quote.change),
          percentChange: parseFloat(quote.percent_change),
          open: parseFloat(quote.open),
          high: parseFloat(quote.high),
          low: parseFloat(quote.low),
          volume: quote.volume,
          marketCap: quote.market_cap || 'N/A',
          peRatio: quote.pe || 'N/A',
          dividend: quote.dividend || 'N/A',
          chartData: time_series ? time_series.values : []
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error(`Error fetching details for ${symbol}:`, err);
      throw err;
    }
  }, []);
  
  // Get chart data for a symbol
  const fetchChartData = useCallback(async (symbol, interval = '1day', outputsize = 30) => {
    try {
      const response = await stockAPI.getChartData(symbol, interval, outputsize);
      
      if (response.success && response.data && response.data.values) {
        // Format the data for charts
        return response.data.values.map(item => ({
          time: new Date(item.datetime).getTime() / 1000,
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
          volume: parseInt(item.volume, 10)
        }));
      } else {
        throw new Error('Invalid chart data format');
      }
    } catch (err) {
      console.error(`Error fetching chart data for ${symbol}:`, err);
      throw err;
    }
  }, []);
  
  // Search for stocks
  const searchStocks = useCallback(async (query) => {
    try {
      if (!query || query.length < 2) return [];
      
      // First try to get exact matches from current stocks
      const localMatches = stocks.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
        stock.name.toLowerCase().includes(query.toLowerCase())
      );
      
      // If we have enough local matches, return those
      if (localMatches.length >= 5) {
        return localMatches.slice(0, 8);
      }
      
      // Otherwise, search via API
      const apiResults = await stockAPI.searchSymbols(query);
      return apiResults;
    } catch (err) {
      console.error('Error searching stocks:', err);
      return [];
    }
  }, [stocks]);
  
  // Update stock prices (for real-time updates)
  const updatePrices = useCallback(async () => {
    if (stocks.length === 0) return;
    
    try {
      const symbols = stocks.map(stock => stock.symbol);
      await fetchStocks(symbols);
    } catch (err) {
      console.error('Error updating stock prices:', err);
    }
  }, [stocks, fetchStocks]);
  
  // Load initial stock data
  useEffect(() => {
    fetchStocks();
    
    // Set up periodic updates
    const updateInterval = setInterval(() => {
      updatePrices();
    }, 60000); // Update every minute
    
    return () => clearInterval(updateInterval);
  }, [fetchStocks, updatePrices]);
  
  // Context value
  const value = {
    stocks,
    loading,
    error,
    lastUpdated,
    fetchStocks,
    fetchStockDetails,
    fetchChartData,
    searchStocks,
    updatePrices
  };
  
  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};

// Custom hook to use the stock context
export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
}; 