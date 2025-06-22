import React, { useState } from 'react';
import StockQuote from '../components/StockQuote';
import StockChart from '../components/StockChart';
import '../styles/StockComponents.css';

const StockPage = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSymbol(inputValue.trim().toUpperCase());
    }
  };

  return (
    <div className="stock-page">
      <div className="stock-search">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter stock symbol (e.g., AAPL)"
            className="stock-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>

      <div className="stock-content">
        <StockQuote symbol={symbol} />
        <StockChart symbol={symbol} />
      </div>
    </div>
  );
};

export default StockPage; 