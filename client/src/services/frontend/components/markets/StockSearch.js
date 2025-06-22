import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaStar, FaRegStar } from 'react-icons/fa';
import '../../styles/Markets.css';
import api from '../../../api';

const StockSearch = ({ onSelectStock, watchlist = [], onAddToWatchlist, onRemoveFromWatchlist }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  
  // Cache for recently viewed stocks to improve performance
  const [recentlyViewedStocks, setRecentlyViewedStocks] = useState([]);

  // Fallback stock data in case API fails
  const fallbackStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 182.52, change: 1.25 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.56, change: 2.34 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 159.13, change: -0.45 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 182.96, change: 0.75 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 178.81, change: -2.13 },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: 472.22, change: 1.83 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 893.27, change: 5.43 },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', price: 416.95, change: 0.12 },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 186.68, change: 0.92 },
    { symbol: 'V', name: 'Visa Inc.', price: 272.69, change: -0.32 },
    { symbol: 'WMT', name: 'Walmart Inc.', price: 69.56, change: 0.46 },
    { symbol: 'PG', name: 'Procter & Gamble Co.', price: 166.03, change: -0.18 },
    { symbol: 'MA', name: 'Mastercard Inc.', price: 447.25, change: 1.35 },
    { symbol: 'UNH', name: 'UnitedHealth Group Inc.', price: 526.52, change: 2.77 },
    { symbol: 'HD', name: 'Home Depot Inc.', price: 353.76, change: 0.93 },
    { symbol: 'MRK', name: 'Merck & Co. Inc.', price: 125.12, change: -0.65 },
    { symbol: 'BAC', name: 'Bank of America Corp.', price: 37.65, change: 0.38 },
    { symbol: 'PFE', name: 'Pfizer Inc.', price: 28.41, change: -1.17 },
    { symbol: 'CSCO', name: 'Cisco Systems Inc.', price: 46.97, change: 0.22 },
    { symbol: 'XOM', name: 'Exxon Mobil Corp.', price: 114.88, change: -0.76 },
    { symbol: 'NFLX', name: 'Netflix Inc.', price: 632.66, change: 3.45 },
    { symbol: 'DIS', name: 'Walt Disney Co.', price: 94.48, change: 0.56 },
    { symbol: 'KO', name: 'Coca-Cola Co.', price: 65.04, change: 0.12 },
    { symbol: 'ADBE', name: 'Adobe Inc.', price: 531.27, change: 2.13 },
    { symbol: 'CRM', name: 'Salesforce Inc.', price: 253.90, change: 1.76 },
    { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', price: 156.84, change: 4.92 },
    { symbol: 'INTC', name: 'Intel Corp.', price: 30.76, change: -0.87 },
    { symbol: 'PYPL', name: 'PayPal Holdings Inc.', price: 61.83, change: -0.34 },
    { symbol: 'IBM', name: 'International Business Machines Corp.', price: 176.51, change: 0.65 },
    { symbol: 'GE', name: 'General Electric Co.', price: 159.94, change: 1.23 }
  ];

  useEffect(() => {
    // Real API call for live data
    if (searchTerm && searchTerm.length >= 2) {
      setLoading(true);
      
      const timer = setTimeout(async () => {
        try {
          // First check if we have any matches in recently viewed stocks for quick response
          const localMatches = recentlyViewedStocks.filter(stock => 
            stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
            stock.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          if (localMatches.length >= 3) {
            setSearchResults(localMatches.slice(0, 8));
            setLoading(false);
            return;
          }
          
          // Otherwise, fetch from backend API
          const response = await api.get('/stock/symbols', {
            params: { 
              exchange: 'NASDAQ'
            }
          });
          
          if (response.data && response.data.success && response.data.data) {
            const apiData = response.data.data;
            
            // Filter results based on search term
            const filteredResults = apiData
              .filter(stock => 
                stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .slice(0, 8); // Limit to 8 results for UI
              
            setSearchResults(filteredResults);
          } else {
            // Fallback to local data if API fails
            const filteredResults = fallbackStocks.filter(stock => 
              stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
              stock.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(filteredResults.slice(0, 8));
          }
        } catch (error) {
          console.error('Error searching stocks:', error);
          // Fallback to local data
          const filteredResults = fallbackStocks.filter(stock => 
            stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
            stock.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setSearchResults(filteredResults.slice(0, 8));
        } finally {
          setLoading(false);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, recentlyViewedStocks]);

  useEffect(() => {
    // Close search results when clicking outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchFocus = () => {
    setShowResults(true);
  };

  const handleStockSelect = (stock) => {
    if (onSelectStock) {
      onSelectStock(stock);
    }
    setShowResults(false);
    setSearchTerm('');
  };

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
    <div className="stock-search" ref={searchRef}>
      <div className="search-input-container">
        <FaSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Search stocks (e.g., AAPL, MSFT, GOOGL...)" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleSearchFocus}
          className="stock-search-input"
        />
        {loading && <div className="search-spinner"></div>}
      </div>
      
      {showResults && (searchTerm || searchResults.length > 0) && (
        <div className="search-results">
          {loading ? (
            <div className="search-loading">Loading...</div>
          ) : searchResults.length > 0 ? (
            <>
              {searchResults.map(stock => (
                <div 
                  key={stock.symbol} 
                  className="search-result-item"
                  onClick={() => handleStockSelect(stock)}
                >
                  <div className="result-info">
                    <div className="result-symbol">{stock.symbol}</div>
                    <div className="result-name">{stock.name}</div>
                  </div>
                  
                  <div className="result-price-info">
                    <div className="result-price">${stock.price.toFixed(2)}</div>
                    <div className={`result-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                    </div>
                  </div>
                  
                  <button 
                    className="watchlist-toggle"
                    onClick={(e) => handleWatchlistToggle(e, stock)}
                    title={watchlist.some(item => item.symbol === stock.symbol) ? "Remove from watchlist" : "Add to watchlist"}
                  >
                    {watchlist.some(item => item.symbol === stock.symbol) ? (
                      <FaStar className="star-icon active" />
                    ) : (
                      <FaRegStar className="star-icon" />
                    )}
                  </button>
                </div>
              ))}
            </>
          ) : searchTerm ? (
            <div className="no-results">No matching stocks found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default StockSearch; 