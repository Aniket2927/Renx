import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import '../styles/Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Mock stock data for search
  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 182.52, change: 1.25 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.56, change: 2.34 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 159.13, change: -0.45 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 182.96, change: 0.75 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 178.81, change: -2.13 },
    { symbol: 'BTC-USD', name: 'Bitcoin USD', price: 56789.12, change: 2.3 },
    { symbol: 'ETH-USD', name: 'Ethereum USD', price: 1648.35, change: -0.44 }
  ];
  
  // Handle search input
  useEffect(() => {
    if (searchTerm) {
      const filteredResults = popularStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredResults.slice(0, 5)); // Limit to 5 results for UI
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);
  
  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.nav-search-bar') && !event.target.closest('.nav-search-results')) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const handleSearchFocus = () => {
    setShowSearchResults(true);
  };
  
  const handleSearchClear = () => {
    setSearchTerm('');
    setSearchResults([]);
  };
  
  const handleStockSelect = (stock) => {
    navigate(`/markets/${stock.symbol}`);
    setShowSearchResults(false);
    setSearchTerm('');
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="logo">RenX</Link>
        </div>
        
        {user && (
          <div className="nav-search-bar">
            <FaSearch className="nav-search-icon" />
            <input 
              type="text" 
              placeholder="Search stocks..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
            />
            {searchTerm && (
              <button className="nav-search-clear-btn" onClick={handleSearchClear}>
                <FaTimes />
              </button>
            )}
            
            {showSearchResults && (
              <div className="nav-search-results">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map(result => (
                      <div 
                        key={result.symbol} 
                        className="nav-search-result-item"
                        onClick={() => handleStockSelect(result)}
                      >
                        <div className="nav-result-symbol-name">
                          <span className="nav-result-symbol">{result.symbol}</span>
                          <span className="nav-result-name">{result.name}</span>
                        </div>
                        <span className={`nav-result-change ${result.change >= 0 ? 'positive' : 'negative'}`}>
                          {result.change >= 0 ? '+' : ''}{result.change.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </>
                ) : searchTerm ? (
                  <div className="nav-no-results">No stocks found</div>
                ) : (
                  <div className="nav-popular-stocks">
                    <div className="nav-popular-header">Popular Stocks</div>
                    {popularStocks.slice(0, 3).map(stock => (
                      <div 
                        key={stock.symbol} 
                        className="nav-search-result-item"
                        onClick={() => handleStockSelect(stock)}
                      >
                        <div className="nav-result-symbol-name">
                          <span className="nav-result-symbol">{stock.symbol}</span>
                          <span className="nav-result-name">{stock.name}</span>
                        </div>
                        <span className={`nav-result-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="nav-search-footer">
                  <button 
                    className="nav-view-all-markets-btn"
                    onClick={() => {
                      navigate('/markets');
                      setShowSearchResults(false);
                    }}
                  >
                    View All Markets
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="navbar-menu-toggle" onClick={toggleMenu}>
          <span className="menu-icon"></span>
        </div>
        
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {user ? (
            <>
              <div className="navbar-links">
                <Link 
                  to="/dashboard" 
                  className={location.pathname === '/dashboard' ? 'active' : ''}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/markets" 
                  className={location.pathname.includes('/markets') ? 'active' : ''}
                  onClick={closeMenu}
                >
                  Markets
                </Link>
                <Link 
                  to="/trades" 
                  className={location.pathname === '/trades' ? 'active' : ''}
                  onClick={closeMenu}
                >
                  Trades
                </Link>
                <Link 
                  to="/watchlist" 
                  className={location.pathname === '/watchlist' ? 'active' : ''}
                  onClick={closeMenu}
                >
                  Watchlist
                </Link>
              </div>
              
              <div className="navbar-auth">
                <div className="user-dropdown">
                  <button className="dropdown-button">
                    <span className="user-avatar">
                      {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </span>
                    <span className="user-name">{user.username}</span>
                  </button>
                  <div className="dropdown-content">
                    <Link to="/profile" onClick={closeMenu}>Profile</Link>
                    <button onClick={() => {
                      onLogout();
                      closeMenu();
                    }}>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link 
                to="/login" 
                className="login-btn"
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="register-btn"
                onClick={closeMenu}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 