import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';

const SearchSymbol = ({ onAddToWatchlist, watchlist = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  
  // Mock symbol data for demo
  const availableSymbols = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'XRP', name: 'Ripple' },
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'LINK', name: 'Chainlink' },
    { symbol: 'MATIC', name: 'Polygon' },
    { symbol: 'AVAX', name: 'Avalanche' },
    { symbol: 'UNI', name: 'Uniswap' }
  ];
  
  const filteredSymbols = searchTerm 
    ? availableSymbols.filter(item => 
        item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableSymbols;
  
  // Helper: Validate symbol format
  const isValidSymbol = (symbol) => {
    return /^[A-Z]{2,5}$/.test(symbol);
  };

  const handleAdd = (symbol) => {
    if (!isValidSymbol(symbol)) {
      setError('Invalid symbol format. Use 2-5 uppercase letters.');
      return;
    }
    if (watchlist.includes(symbol)) {
      setError('Symbol already in watchlist.');
      return;
    }
    setError('');
    onAddToWatchlist(symbol);
  };

  return (
    <div className="search-symbol-container">
      <h3>Add Symbol to Watchlist</h3>
      
      <div className="search-input-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by symbol or name..."
          className="search-input"
        />
      </div>
      
      {error && <div className="search-symbol-error">{error}</div>}
      
      <div className="search-results">
        {filteredSymbols.map((item) => (
          <div key={item.symbol} className="search-result-item">
            <div className="symbol-info">
              <span className="symbol">{item.symbol}</span>
              <span className="name">{item.name}</span>
            </div>
            <button 
              className="add-btn"
              onClick={() => handleAdd(item.symbol)}
              disabled={watchlist.includes(item.symbol)}
              title={watchlist.includes(item.symbol) ? 'Already in watchlist' : 'Add to watchlist'}
            >
              <FaPlus />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchSymbol; 