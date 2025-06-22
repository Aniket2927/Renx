import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaSort, FaSortUp, FaSortDown, FaSync } from 'react-icons/fa';
import '../../styles/Markets.css';
import api from '../../../api';

const StockList = ({ onSelectStock, watchlist = [], onAddToWatchlist, onRemoveFromWatchlist }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('all');
  const [updatingPrices, setUpdatingPrices] = useState(false);
  
  // Default symbols to fetch if API call fails
  const defaultSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'WMT'];

  useEffect(() => {
    // Initial load of stock data from real API
    const loadStocks = async () => {
      try {
        setLoading(true);
        
        // Fetch real stock data from our backend API
        const response = await api.get(`/stock/quotes/${defaultSymbols.join(',')}`);
        
        if (response.data && response.data.success) {
          // Format the API response to match our expected structure
          const formattedStocks = Array.isArray(response.data.data) 
            ? response.data.data.map(stock => ({
                symbol: stock.symbol,
                name: stock.name || '',
                price: parseFloat(stock.close || 0),
                change: parseFloat(stock.change || 0),
                volume: stock.volume || 'N/A',
                marketCap: stock.market_cap || 'N/A',
                sector: stock.sector || 'N/A'
              }))
            : []; // Handle empty data case
            
          setStocks(formattedStocks);
        } else {
          throw new Error('Failed to fetch stock data');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading stocks:', error);
        setLoading(false);
        
        // Show error state or fallback data here if needed
      }
    };
    
    loadStocks();
    
    // Set up interval for live price updates
    const priceUpdateInterval = setInterval(() => {
      updatePrices();
    }, 60000); // Update every 60 seconds to respect API rate limits
    
    return () => clearInterval(priceUpdateInterval);
  }, [defaultSymbols, updatePrices]);

  // Function to update prices with real-time data
  const updatePrices = async () => {
    if (stocks.length === 0) return;
    
    try {
      setUpdatingPrices(true);
      
      // Get symbols from current stocks
      const symbols = stocks.map(stock => stock.symbol).join(',');
      
      // Fetch updated prices
      const response = await api.get(`/stock/quotes/${symbols}`);
      
      if (response.data && response.data.success && response.data.data) {
        // Update stock prices with real data
        const updatedData = response.data.data;
        
        setStocks(prevStocks => 
          prevStocks.map(stock => {
            // Find matching stock data from API response
            const updatedStock = Array.isArray(updatedData)
              ? updatedData.find(item => item.symbol === stock.symbol)
              : updatedData.symbol === stock.symbol ? updatedData : null;
              
            if (updatedStock) {
              return {
                ...stock,
                price: parseFloat(updatedStock.close || stock.price),
                change: parseFloat(updatedStock.change || stock.change)
              };
            }
            
            return stock;
          })
        );
      }
    } catch (error) {
      console.error('Error updating stock prices:', error);
    } finally {
      setUpdatingPrices(false);
    }
  };

  // Function to handle manual refresh
  const handleRefresh = () => {
    updatePrices();
  };

  // Sort stocks based on current sort settings
  const sortedStocks = () => {
    if (!stocks.length) return [];
    
    // Filter stocks if filter is applied
    let filtered = [...stocks];
    if (filterType === 'gainers') {
      filtered = filtered.filter(stock => stock.change > 0);
    } else if (filterType === 'losers') {
      filtered = filtered.filter(stock => stock.change < 0);
    } else if (filterType === 'watchlist') {
      filtered = filtered.filter(stock => 
        watchlist.some(item => item.symbol === stock.symbol)
      );
    }
    
    // Sort the filtered stocks
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'symbol') {
        comparison = a.symbol.localeCompare(b.symbol);
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'price') {
        comparison = a.price - b.price;
      } else if (sortField === 'change') {
        comparison = a.change - b.change;
      } else if (sortField === 'volume') {
        // Extract number from volume string for comparison
        const volumeA = parseFloat(a.volume.replace(/[^\d.-]/g, ''));
        const volumeB = parseFloat(b.volume.replace(/[^\d.-]/g, ''));
        comparison = volumeA - volumeB;
      } else if (sortField === 'marketCap') {
        // Extract number from marketCap string for comparison
        const capA = a.marketCap.endsWith('T') ? 
          parseFloat(a.marketCap.replace(/[^\d.-]/g, '')) * 1000 : 
          parseFloat(a.marketCap.replace(/[^\d.-]/g, ''));
        const capB = b.marketCap.endsWith('T') ? 
          parseFloat(b.marketCap.replace(/[^\d.-]/g, '')) * 1000 : 
          parseFloat(b.marketCap.replace(/[^\d.-]/g, ''));
        comparison = capA - capB;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Handle sort header click
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon based on current sort state
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <FaSort className="sort-icon" />;
    }
    
    return sortDirection === 'asc' ? 
      <FaSortUp className="sort-icon active" /> : 
      <FaSortDown className="sort-icon active" />;
  };

  // Handle watchlist toggle
  const handleWatchlistToggle = (e, stock) => {
    e.stopPropagation();
    
    const isInWatchlist = watchlist.some(item => item.symbol === stock.symbol);
    
    if (isInWatchlist) {
      onRemoveFromWatchlist && onRemoveFromWatchlist(stock);
    } else {
      onAddToWatchlist && onAddToWatchlist(stock);
    }
  };

  return (
    <div className="stock-list-container">
      <div className="stock-list-header">
        <h2>Markets</h2>
        
        <div className="stock-filters">
          <button 
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Stocks
          </button>
          <button 
            className={`filter-btn ${filterType === 'gainers' ? 'active' : ''}`}
            onClick={() => setFilterType('gainers')}
          >
            Gainers
          </button>
          <button 
            className={`filter-btn ${filterType === 'losers' ? 'active' : ''}`}
            onClick={() => setFilterType('losers')}
          >
            Losers
          </button>
          <button 
            className={`filter-btn ${filterType === 'watchlist' ? 'active' : ''}`}
            onClick={() => setFilterType('watchlist')}
          >
            Watchlist
          </button>
          
          <button className="refresh-btn" onClick={handleRefresh} disabled={updatingPrices}>
            <FaSync className={updatingPrices ? 'spinning' : ''} />
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading market data...</p>
        </div>
      ) : (
        <div className="stock-list-table-container">
          <table className="stock-list-table">
            <thead>
              <tr>
                <th></th>
                <th onClick={() => handleSort('symbol')} className="sortable">
                  Symbol {getSortIcon('symbol')}
                </th>
                <th onClick={() => handleSort('name')} className="sortable">
                  Name {getSortIcon('name')}
                </th>
                <th onClick={() => handleSort('price')} className="sortable">
                  Price {getSortIcon('price')}
                </th>
                <th onClick={() => handleSort('change')} className="sortable">
                  Change (24h) {getSortIcon('change')}
                </th>
                <th onClick={() => handleSort('volume')} className="sortable">
                  Volume {getSortIcon('volume')}
                </th>
                <th onClick={() => handleSort('marketCap')} className="sortable">
                  Market Cap {getSortIcon('marketCap')}
                </th>
                <th>Sector</th>
              </tr>
            </thead>
            <tbody>
              {sortedStocks().map((stock) => (
                <tr 
                  key={stock.symbol} 
                  className={updatingPrices ? 'updating' : ''}
                  onClick={() => onSelectStock && onSelectStock(stock)}
                >
                  <td>
                    <button 
                      className="watchlist-toggle-btn"
                      onClick={(e) => handleWatchlistToggle(e, stock)}
                      title={watchlist.some(item => item.symbol === stock.symbol) ? "Remove from watchlist" : "Add to watchlist"}
                    >
                      {watchlist.some(item => item.symbol === stock.symbol) ? (
                        <FaStar className="star-icon active" />
                      ) : (
                        <FaRegStar className="star-icon" />
                      )}
                    </button>
                  </td>
                  <td className="symbol-cell">{stock.symbol}</td>
                  <td>{stock.name}</td>
                  <td className="price-cell">${stock.price.toFixed(2)}</td>
                  <td className={`change-cell ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </td>
                  <td>{stock.volume}</td>
                  <td>{stock.marketCap}</td>
                  <td>{stock.sector}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {sortedStocks().length === 0 && (
            <div className="no-stocks-message">
              {filterType === 'watchlist' ? 
                "You haven't added any stocks to your watchlist yet." : 
                "No stocks match the current filter."}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockList; 