import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaPlus } from 'react-icons/fa';

const WatchlistWidget = ({ watchlist, onAddToWatchlist, onRemoveFromWatchlist }) => {
  // Mock price data for demo
  const getPriceData = (symbol) => {
    const priceMap = {
      BTC: { price: 42371.25, change: 2.5 },
      ETH: { price: 2274.68, change: -1.2 },
      SOL: { price: 147.32, change: 5.7 },
      ADA: { price: 0.41, change: -0.8 },
      XRP: { price: 0.61, change: 0.3 },
      DOT: { price: 6.73, change: -2.1 },
      LINK: { price: 15.89, change: 4.2 },
    };
    
    return priceMap[symbol] || { price: 0, change: 0 };
  };
  
  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="empty-watchlist">
        <p>Your watchlist is empty.</p>
        <button 
          className="add-symbol-btn"
          onClick={() => onAddToWatchlist('BTC')}
        >
          <FaPlus /> Add Symbol
        </button>
      </div>
    );
  }
  
  return (
    <div className="watchlist-widget">
      <div className="watchlist-items">
        {watchlist.map((symbol) => {
          const priceData = getPriceData(symbol);
          
          return (
            <div key={symbol} className="watchlist-item">
              <div className="symbol-info">
                <span className="symbol">{symbol}</span>
                <span className={`change ${priceData.change >= 0 ? 'positive' : 'negative'}`}>
                  {priceData.change >= 0 ? '+' : ''}{priceData.change}%
                </span>
              </div>
              
              <div className="price-info">
                <span className="price">${priceData.price.toLocaleString()}</span>
              </div>
              
              <div className="watchlist-actions">
                <Link to={`/orderbook/${symbol}`} className="trade-btn">
                  Trade
                </Link>
                <button 
                  className="remove-btn"
                  onClick={() => onRemoveFromWatchlist(symbol)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <button 
        className="add-symbol-btn"
        onClick={() => onAddToWatchlist('ETH')}
      >
        <FaPlus /> Add Symbol
      </button>
    </div>
  );
};

export default WatchlistWidget; 