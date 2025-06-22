import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaEllipsisV, 
  FaCreditCard, 
  FaExchangeAlt, 
  FaFileInvoice,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaCalendarAlt,
  FaChevronDown,
  FaBell,
  FaCog,
  FaEnvelope,
  FaArrowUp,
  FaArrowDown,
  FaTimes,
  FaClock
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import '../styles/AIComponents.css';

// Components
import LineChart from '../components/dashboard/LineChart';
import PieChart from '../components/dashboard/PieChart';
import BarChart from '../components/dashboard/BarChart';
import ProgressCircle from '../components/dashboard/ProgressCircle';
import Calendar from '../components/dashboard/Calendar';
import AITradingWidget from '../components/dashboard/AITradingWidget';
import TradingBots from '../components/dashboard/TradingBots';

const Dashboard = () => {
  // Get user from auth context
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for active filter or tab
  const [activePage, setActivePage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState("Latest");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Settings state
  const [theme, setTheme] = useState('Light');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Apply theme
  useEffect(() => {
    // Apply theme to body element
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${theme.toLowerCase()}`);
    
    // Save theme preference to local storage
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Load saved preferences
  useEffect(() => {
    // Load theme from local storage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    // Load notification settings
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications !== null) {
      setNotificationsEnabled(savedNotifications === 'true');
    }
  }, []);
  
  // Save notification settings when changed
  useEffect(() => {
    localStorage.setItem('notifications', notificationsEnabled.toString());
  }, [notificationsEnabled]);
  
  // Testing mode for market hours
  const [useTestTime, setUseTestTime] = useState(false);
  const [testAfterHours, setTestAfterHours] = useState(true);
  
  // State for market status
  const [marketStatus, setMarketStatus] = useState({
    isOpen: false,
    nyse: { isOpen: false },
    nasdaq: { isOpen: false },
    crypto: { isOpen: true }, // Crypto markets are always open
    currentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    timeRemainingText: ""
  });
  
  // Mock stock data for search
  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 182.52, change: 1.25 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.56, change: 2.34 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 159.13, change: -0.45 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 182.96, change: 0.75 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 178.81, change: -2.13 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 893.27, change: 5.43 },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: 472.22, change: 1.83 },
    { symbol: 'BTC-USD', name: 'Bitcoin USD', price: 56789.12, change: 2.3 },
    { symbol: 'ETH-USD', name: 'Ethereum USD', price: 1648.35, change: -0.44 },
    { symbol: 'SOL-USD', name: 'Solana USD', price: 142.56, change: 5.2 }
  ];
  
  // Mock data
  const balanceData = {
    wallet: {
      balance: "824,571.93",
      change: "+0.8% than last week",
      trend: "up"
    },
    main: {
      balance: "98,452.44",
      cardNumber: "**** **** **** 1234",
      validThru: "08/27",
      cardHolder: user?.name || "Adam Jackson"
    }
  };
  
  const transactions = [
    { id: 1, name: "Portu Studio", amount: "650,036.34", date: "March 01, 2024", avatar: "/avatars/avatar1.svg", status: "completed" },
    { id: 2, name: "Akademi Studio", amount: "120,036.34", date: "March 01, 2024", avatar: "/avatars/avatar2.svg", status: "pending" },
    { id: 3, name: "Kleon Studio", amount: "340,036.34", date: "March 01, 2024", avatar: "/avatars/avatar3.svg", status: "completed" },
    { id: 4, name: "Nextrun Studio", amount: "740,036.34", date: "March 01, 2024", avatar: "/avatars/avatar4.svg", status: "failed" },
    { id: 5, name: "Creation Studio", amount: "120,036.34", date: "March 01, 2024", avatar: "/avatars/avatar5.svg", status: "completed" }
  ];
  
  const invoices = [
    { id: 1, name: "Manager", title: "Manager", amount: "776", avatar: "/avatars/avatar1.svg" },
    { id: 2, name: "Evans Belly", title: "Programmer", amount: "770", avatar: "/avatars/avatar2.svg" },
    { id: 3, name: "Cahyadi Jem", title: "Graphic Designer", amount: "650", avatar: "/avatars/avatar3.svg" },
    { id: 4, name: "Evans John", title: "Software Engineer", amount: "450", avatar: "/avatars/avatar4.svg" },
    { id: 5, name: "Brian Brandon", title: "Developer", amount: "470", avatar: "/avatars/avatar5.svg" },
    { id: 6, name: "Bella Brownlee", title: "Tester", amount: "630", avatar: "/avatars/avatar6.svg" },
    { id: 7, name: "Evans Tika", title: "Team Leader", amount: "399", avatar: "/avatars/avatar7.svg" }
  ];
  
  const investmentStats = [
    { title: "Installment", amount: "$5,412", percentage: 30, color: "#2ecc71" },
    { title: "Investment", amount: "$3,784", percentage: 60, color: "#e74c3c" },
    { title: "Property", amount: "$3,784", percentage: 45, color: "#f39c12" }
  ];
  
  const notifications = [
    { id: 1, title: "New invoice received", time: "2 hours ago" },
    { id: 2, title: "Transaction completed", time: "5 hours ago" },
    { id: 3, title: "Server update scheduled", time: "1 day ago" }
  ];
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingData(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);
  
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
  
  // Handle click outside to close tooltip and search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close tooltips if clicking outside
      if (showTooltip && 
          !event.target.closest('.tooltip-dropdown') && 
          !event.target.closest('.header-icon-button')) {
        setShowTooltip(null);
      }
      
      // Close search results if clicking outside
      if (!event.target.closest('.search-bar') && !event.target.closest('.search-results')) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip]);
  
  // Format currency
  const formatCurrency = (value) => {
    return `$${value}`;
  };
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
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
  };
  
  // Handle tooltip toggle
  const toggleTooltip = (name) => {
    if (showTooltip === name) {
      setShowTooltip(null);
    } else {
      setShowTooltip(name);
    }
  };
  
  // Handle theme change
  const handleThemeChange = (e) => {
    e.stopPropagation(); // Prevent click from closing dropdown
    setTheme(e.target.value);
  };
  
  // Handle notifications toggle
  const handleNotificationsToggle = (e) => {
    e.stopPropagation(); // Prevent click from closing dropdown
    setNotificationsEnabled(!notificationsEnabled);
  };
  
  // Check if the market is open based on current time
  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hours * 60 + minutes; // Convert to minutes since midnight
      const currentTimeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      
      // NYSE and NASDAQ are open Monday-Friday, 9:15 AM - 3:30 PM EST
      // For simplicity, we're using local time (adjust for production)
      const isWeekday = day >= 1 && day <= 5; // Monday to Friday
      const marketOpenTime = 9 * 60 + 15; // 9:15 AM
      const marketCloseTime = 15 * 60 + 30; // 3:30 PM
      
      // Calculate time remaining until market opens/closes
      let timeRemainingText = "";
      if (isWeekday) {
        if (currentTime < marketOpenTime) {
          // Market will open today
          const minutesUntilOpen = marketOpenTime - currentTime;
          const hoursUntilOpen = Math.floor(minutesUntilOpen / 60);
          const minsUntilOpen = minutesUntilOpen % 60;
          timeRemainingText = `Opens in ${hoursUntilOpen}h ${minsUntilOpen}m`;
        } else if (currentTime >= marketOpenTime && currentTime < marketCloseTime) {
          // Market is open
          const minutesUntilClose = marketCloseTime - currentTime;
          const hoursUntilClose = Math.floor(minutesUntilClose / 60);
          const minsUntilClose = minutesUntilClose % 60;
          timeRemainingText = `Closes in ${hoursUntilClose}h ${minsUntilClose}m`;
        } else {
          // Market closed for today
          if (day === 5) { // Friday
            timeRemainingText = "Closed until Monday";
          } else {
            timeRemainingText = "Opens tomorrow at 9:15 AM";
          }
        }
      } else {
        // Weekend
        if (day === 6) { // Saturday
          timeRemainingText = "Closed until Monday";
        } else { // Sunday
          timeRemainingText = "Opens tomorrow at 9:15 AM";
        }
      }
      
      let isMarketHours;
      
      if (useTestTime) {
        // Use test mode to simulate market status
        isMarketHours = !testAfterHours;
        timeRemainingText = testAfterHours ? "Test mode: Market closed" : "Test mode: Market open";
      } else {
        // Normal operation - check real time
        isMarketHours = currentTime >= marketOpenTime && currentTime < marketCloseTime;
      }
      
      const isNyseOpen = isWeekday && isMarketHours;
      const isNasdaqOpen = isWeekday && isMarketHours;
      const isCryptoOpen = true; // Crypto is always open
      
      // For display purposes, we consider the "market" open if stock markets are open
      // Crypto being 24/7 shouldn't affect our main indicator when stock markets are closed
      setMarketStatus({
        isOpen: isNyseOpen || isNasdaqOpen,
        nyse: { isOpen: isNyseOpen },
        nasdaq: { isOpen: isNasdaqOpen },
        crypto: { isOpen: isCryptoOpen },
        currentTime: currentTimeFormatted,
        timeRemainingText: timeRemainingText
      });
    };
    
    // Check immediately
    checkMarketStatus();
    
    // Set up interval to check every minute
    const intervalId = setInterval(checkMarketStatus, 60000);
    
    return () => clearInterval(intervalId);
  }, [useTestTime, testAfterHours]);
  
  return (
    <div className="dashboard-container">
      {loadingData && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      )}
      
      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="header-right">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search stocks (e.g., AAPL, BTC...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
            />
            {searchTerm && (
              <button className="search-clear-btn" onClick={handleSearchClear}>
                <FaTimes />
              </button>
            )}
            
            {showSearchResults && (
              <div className="search-results">
                {searchResults.length > 0 ? (
                  <>
                    <div className="search-results-header">
                      <span>Symbol</span>
                      <span>Price</span>
                      <span>Change</span>
                    </div>
                    {searchResults.map(result => (
                      <div 
                        key={result.symbol} 
                        className="search-result-item"
                        onClick={() => handleStockSelect(result)}
                      >
                        <div className="result-symbol-name">
                          <span className="result-symbol">{result.symbol}</span>
                          <span className="result-name">{result.name}</span>
                        </div>
                        <span className="result-price">${result.price.toFixed(2)}</span>
                        <span className={`result-change ${result.change >= 0 ? 'positive' : 'negative'}`}>
                          {result.change >= 0 ? '+' : ''}{result.change.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </>
                ) : searchTerm ? (
                  <div className="no-results">No stocks found</div>
                ) : (
                  <div className="popular-stocks">
                    <div className="popular-header">Popular Stocks</div>
                    {popularStocks.slice(0, 5).map(stock => (
                      <div 
                        key={stock.symbol} 
                        className="search-result-item"
                        onClick={() => handleStockSelect(stock)}
                      >
                        <div className="result-symbol-name">
                          <span className="result-symbol">{stock.symbol}</span>
                          <span className="result-name">{stock.name}</span>
                        </div>
                        <span className="result-price">${stock.price.toFixed(2)}</span>
                        <span className={`result-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="search-footer">
                  <button 
                    className="view-all-markets-btn"
                    onClick={() => navigate('/markets')}
                  >
                    View All Markets
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="header-actions">
            <div className={`header-icon-button ${showTooltip === 'notifications' ? 'active' : ''}`} 
                 onClick={() => toggleTooltip('notifications')}>
              <FaBell />
              <span className="notification-badge">3</span>
              {showTooltip === 'notifications' && (
                <div className="tooltip-dropdown">
                  <h4>Notifications</h4>
                  {notifications.map(notification => (
                    <div key={notification.id} className="notification-item">
                      <p>{notification.title}</p>
                      <span>{notification.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={`header-icon-button ${showTooltip === 'settings' ? 'active' : ''}`}
                 onClick={() => toggleTooltip('settings')}>
              <FaCog />
              {showTooltip === 'settings' && (
                <div className="tooltip-dropdown" onClick={(e) => e.stopPropagation()}>
                  <h4>Quick Settings</h4>
                  <div className="settings-item">
                    <p>Theme</p>
                    <select 
                      value={theme} 
                      onChange={handleThemeChange}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option>Light</option>
                      <option>Dark</option>
                    </select>
                  </div>
                  <div className="settings-item">
                    <p>Notifications</p>
                    <label className="toggle" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={notificationsEnabled} 
                        onChange={handleNotificationsToggle}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            <div className={`header-icon-button ${showTooltip === 'messages' ? 'active' : ''}`}
                 onClick={() => toggleTooltip('messages')}>
              <FaEnvelope />
              <span className="notification-badge">5</span>
              {showTooltip === 'messages' && (
                <div className="tooltip-dropdown">
                  <h4>Recent Messages</h4>
                  <p>You have 5 unread messages</p>
                  <button className="view-all-btn">View All</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Market Status Indicator */}
      <div className="market-status-indicator">
        <div className="status-text">
          <span className={`status-dot ${marketStatus.isOpen ? 'active' : 'inactive'}`}></span>
          <div className="status-info">
            <p className="status-title">Market is <span className={`status-value ${marketStatus.isOpen ? 'open' : 'closed'}`}>{marketStatus.isOpen ? 'OPEN' : 'CLOSED'}</span></p>
            <p className="status-details">
              <FaClock style={{ marginRight: '5px' }} />
              Current time: {marketStatus.currentTime} • Market hours: 9:15 AM - 3:30 PM EST
            </p>
            <p className="status-countdown">{marketStatus.timeRemainingText}</p>
            <div className="test-mode-toggle">
              <label className="toggle">
                <input type="checkbox" checked={useTestTime} onChange={() => setUseTestTime(!useTestTime)} />
                <span className="toggle-slider"></span>
              </label>
              <span className="test-mode-label">Test Mode {useTestTime ? 'Enabled' : 'Disabled'}</span>
            </div>
            {useTestTime && (
              <div className="test-controls">
                <p className="test-note">
                  <strong>Test Mode:</strong> {testAfterHours ? "Simulating after-hours (market closed)" : "Simulating trading hours (market open)"}
                </p>
                <div className="test-buttons">
                  <button className={`test-btn ${!testAfterHours ? 'active' : ''}`} onClick={() => setTestAfterHours(false)}>Test During Hours</button>
                  <button className={`test-btn ${testAfterHours ? 'active' : ''}`} onClick={() => setTestAfterHours(true)}>Test After Hours</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="market-times">
          <div className="market-time-item">
            <span className="market-label">NYSE</span>
            <span className={`market-status ${marketStatus.nyse.isOpen ? 'open' : 'closed'}`}>{marketStatus.nyse.isOpen ? 'Open' : 'Closed'}</span>
          </div>
          <div className="market-time-item">
            <span className="market-label">NASDAQ</span>
            <span className={`market-status ${marketStatus.nasdaq.isOpen ? 'open' : 'closed'}`}>{marketStatus.nasdaq.isOpen ? 'Open' : 'Closed'}</span>
          </div>
          <div className="market-time-item">
            <span className="market-label">Crypto</span>
            <span className="market-status open">24/7</span>
          </div>
        </div>
      </div>
      
      {/* AI/ML Features Section */}
      <div className="bg-white rounded-lg shadow-md p-4" style={{marginTop: '24px'}}>
        <AITradingWidget />
      </div>
      {/* Advanced AI/ML Tools Section */}
      <div className="bg-white rounded-lg shadow-md p-4" style={{marginTop: '24px'}}>
        <AdvancedAIFeatures />
      </div>
      {/* Move calendar section to the bottom */}
      <div className="calendar-section">
        <div className="calendar-card">
          <Calendar />
        </div>
      </div>
    </div>
  );
};

function AdvancedAIFeatures() {
  // State for all tools
  const [signalInput, setSignalInput] = useState('');
  const [signalResult, setSignalResult] = useState(null);
  const [signalError, setSignalError] = useState('');
  const [signalLoading, setSignalLoading] = useState(false);

  const [sentimentInput, setSentimentInput] = useState('');
  const [sentimentResult, setSentimentResult] = useState(null);
  const [sentimentError, setSentimentError] = useState('');
  const [sentimentLoading, setSentimentLoading] = useState(false);

  const [patternResult, setPatternResult] = useState([]);
  const [patternError, setPatternError] = useState('');
  const [patternLoading, setPatternLoading] = useState(false);

  const [anomalyResult, setAnomalyResult] = useState([]);
  const [anomalyError, setAnomalyError] = useState('');
  const [anomalyLoading, setAnomalyLoading] = useState(false);

  const [tradeIdeaPrefs, setTradeIdeaPrefs] = useState({ risk: 'low', growth: 'high' });
  const [tradeIdeas, setTradeIdeas] = useState([]);
  const [tradeError, setTradeError] = useState('');
  const [tradeLoading, setTradeLoading] = useState(false);

  const [screenerParams, setScreenerParams] = useState({ 
    momentum: '', 
    volatility: '', 
    sentiment: '',
    minPrice: '',
    maxPrice: '',
    marketCap: '',
    sector: ''
  });
  const [screenerResults, setScreenerResults] = useState([]);
  const [screenerError, setScreenerError] = useState('');
  const [screenerLoading, setScreenerLoading] = useState(false);

  const [riskScore, setRiskScore] = useState(null);
  const [riskError, setRiskError] = useState('');
  const [riskLoading, setRiskLoading] = useState(false);

  const [predictionTab, setPredictionTab] = useState('shortterm');
  const [predictionInput, setPredictionInput] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionError, setPredictionError] = useState('');
  const [predictionLoading, setPredictionLoading] = useState(false);

  // Validation functions
  const validateStockSymbol = (symbol) => {
    if (!symbol) return 'Stock symbol is required';
    if (!/^[A-Z]{1,5}$/.test(symbol)) return 'Invalid stock symbol format';
    return '';
  };

  const validateSentimentInput = (text) => {
    if (!text) return 'Text input is required';
    if (text.length < 10) return 'Input must be at least 10 characters';
    if (text.length > 500) return 'Input must not exceed 500 characters';
    return '';
  };

  const validateScreenerParams = (params) => {
    const errors = {};
    if (params.momentum && (isNaN(params.momentum) || params.momentum < 0 || params.momentum > 100)) {
      errors.momentum = 'Momentum must be between 0 and 100';
    }
    if (params.volatility && (isNaN(params.volatility) || params.volatility < 0)) {
      errors.volatility = 'Volatility must be a positive number';
    }
    if (params.minPrice && params.maxPrice && parseFloat(params.minPrice) > parseFloat(params.maxPrice)) {
      errors.priceRange = 'Minimum price cannot be greater than maximum price';
    }
    return errors;
  };

  // API call functions
  const generateSignal = async (symbol) => {
    try {
      setSignalLoading(true);
      setSignalError('');
      
      const error = validateStockSymbol(symbol);
      if (error) {
        setSignalError(error);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = {
        signal: 'BUY',
        confidence: 0.85,
        timestamp: new Date().toISOString(),
        analysis: {
          technical: 'Strong momentum indicators',
          fundamental: 'Positive earnings growth',
          sentiment: 'Bullish market sentiment'
        }
      };
      
      setSignalResult(result);
    } catch (error) {
      setSignalError('Failed to generate signal. Please try again.');
    } finally {
      setSignalLoading(false);
    }
  };

  const analyzeSentiment = async (text) => {
    try {
      setSentimentLoading(true);
      setSentimentError('');
      
      const error = validateSentimentInput(text);
      if (error) {
        setSentimentError(error);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = {
        sentiment: 'Positive',
        score: 0.75,
        confidence: 0.82,
        keywords: ['growth', 'opportunity', 'positive'],
        sources: ['news', 'social', 'reports']
      };
      
      setSentimentResult(result);
    } catch (error) {
      setSentimentError('Failed to analyze sentiment. Please try again.');
    } finally {
      setSentimentLoading(false);
    }
  };

  const detectPatterns = async () => {
    try {
      setPatternLoading(true);
      setPatternError('');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      const result = [
        {
          pattern: 'Head & Shoulders',
          confidence: 0.88,
          timeframe: '1D',
          implications: 'Bearish reversal pattern'
        },
        {
          pattern: 'Ascending Triangle',
          confidence: 0.75,
          timeframe: '4H',
          implications: 'Bullish continuation pattern'
        }
      ];
      
      setPatternResult(result);
    } catch (error) {
      setPatternError('Failed to detect patterns. Please try again.');
    } finally {
      setPatternLoading(false);
    }
  };

  const detectAnomalies = async () => {
    try {
      setAnomalyLoading(true);
      setAnomalyError('');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      const result = [
        {
          type: 'Volume spike',
          severity: 'High',
          timestamp: new Date().toISOString(),
          details: 'Unusual trading volume detected'
        },
        {
          type: 'Price movement',
          severity: 'Medium',
          timestamp: new Date().toISOString(),
          details: 'Abnormal price drop detected'
        }
      ];
      
      setAnomalyResult(result);
    } catch (error) {
      setAnomalyError('Failed to detect anomalies. Please try again.');
    } finally {
      setAnomalyLoading(false);
    }
  };

  const generateTradeIdeas = async () => {
    try {
      setTradeLoading(true);
      setTradeError('');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = [
        {
          symbol: 'AAPL',
          risk: 'Low',
          growth: 'High',
          confidence: 0.85,
          reasoning: 'Strong fundamentals and technical indicators'
        },
        {
          symbol: 'MSFT',
          risk: 'Low',
          growth: 'Medium',
          confidence: 0.82,
          reasoning: 'Stable growth and market position'
        }
      ];
      
      setTradeIdeas(result);
    } catch (error) {
      setTradeError('Failed to generate trade ideas. Please try again.');
    } finally {
      setTradeLoading(false);
    }
  };

  const screenStocks = async () => {
    try {
      setScreenerLoading(true);
      setScreenerError('');

      const errors = validateScreenerParams(screenerParams);
      if (Object.keys(errors).length > 0) {
        setScreenerError(Object.values(errors)[0]);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      const result = [
        {
          symbol: 'AAPL',
          price: 182.52,
          momentum: 75,
          volatility: 1.2,
          sentiment: 0.8
        },
        {
          symbol: 'TSLA',
          price: 178.81,
          momentum: 82,
          volatility: 2.5,
          sentiment: 0.7
        }
      ];
      
      setScreenerResults(result);
    } catch (error) {
      setScreenerError('Failed to screen stocks. Please try again.');
    } finally {
      setScreenerLoading(false);
    }
  };

  const calculateRisk = async () => {
    try {
      setRiskLoading(true);
      setRiskError('');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = {
        score: 3.2,
        level: 'Low',
        factors: [
          { name: 'Market Risk', score: 2.5 },
          { name: 'Volatility', score: 3.0 },
          { name: 'Liquidity', score: 4.0 }
        ],
        recommendations: [
          'Consider diversifying portfolio',
          'Monitor market conditions'
        ]
      };
      
      setRiskScore(result);
    } catch (error) {
      setRiskError('Failed to calculate risk. Please try again.');
    } finally {
      setRiskLoading(false);
    }
  };

  const generatePrediction = async () => {
    try {
      setPredictionLoading(true);
      setPredictionError('');

      const error = validateStockSymbol(predictionInput);
      if (error) {
        setPredictionError(error);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      let result;
      
      switch (predictionTab) {
        case 'shortterm':
          result = {
            prediction: '+2.3%',
            model: 'LSTM',
            confidence: 0.82,
            timeframe: '3 days',
            factors: ['Technical indicators', 'Market sentiment', 'Volume analysis']
          };
          break;
        case 'volatility':
          result = {
            prediction: '1.8%',
            model: 'GARCH',
            confidence: 0.78,
            timeframe: '1 week',
            factors: ['Historical volatility', 'Market conditions', 'Trading volume']
          };
          break;
        case 'range':
          result = {
            prediction: {
              low: 210.5,
              high: 225.3
            },
            confidence: 0.90,
            timeframe: '1 month',
            factors: ['Price action', 'Support/Resistance levels', 'Market trends']
          };
          break;
      }
      
      setPredictionResult(result);
    } catch (error) {
      setPredictionError('Failed to generate prediction. Please try again.');
    } finally {
      setPredictionLoading(false);
    }
  };

  // Card styles with consistent design
  const cardStyles = [
    { border: 'border-green-300', badge: 'bg-green-100 text-green-700', label: 'AI' },
    { border: 'border-blue-300', badge: 'bg-blue-100 text-blue-700', label: 'Ready' },
    { border: 'border-yellow-300', badge: 'bg-yellow-100 text-yellow-700', label: 'Beta' },
    { border: 'border-purple-300', badge: 'bg-purple-100 text-purple-700', label: 'Experimental' },
    { border: 'border-pink-300', badge: 'bg-pink-100 text-pink-700', label: 'AI' },
    { border: 'border-cyan-300', badge: 'bg-cyan-100 text-cyan-700', label: 'AI' },
    { border: 'border-orange-300', badge: 'bg-orange-100 text-orange-700', label: 'AI' },
    { border: 'border-indigo-300', badge: 'bg-indigo-100 text-indigo-700', label: 'AI' },
  ];

  return (
    <div className="advanced-ai-features">
      <div className="section-header">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <span role="img" aria-label="ai">🧠</span> Advanced AI/ML Tools
        </h3>
        <div className="section-divider"></div>
      </div>

      <div className="tools-grid">
        {/* AI Signal Generator */}
        <div className={`tool-card ${cardStyles[0].border}`}>
          <span className={`tool-badge ${cardStyles[0].badge}`}>{cardStyles[0].label}</span>
          <div className="tool-content">
            <h4 className="tool-title">AI Signal Generator</h4>
            <p className="tool-description">Suggests <span className="font-bold">BUY</span>, <span className="font-bold">SELL</span>, <span className="font-bold">HOLD</span> tags on stocks based on AI models.</p>
            <div className="tool-inputs">
              <input
                className="tool-input"
                placeholder="Enter stock symbol (e.g. AAPL)"
                value={signalInput}
                onChange={e => setSignalInput(e.target.value.toUpperCase())}
              />
              <button
                className={`tool-button ${signalLoading ? 'loading' : ''}`}
                onClick={() => generateSignal(signalInput)}
                disabled={signalLoading}
              >
                Generate Signal
              </button>
            </div>
            {signalError && (
              <div className="tool-error">{signalError}</div>
            )}
            {signalResult && (
              <div className="tool-result">
                <div className="signal-tag buy">
                  <div className="signal-header">
                    <span className="signal-type">{signalResult.signal}</span>
                    <span className="signal-confidence">Confidence: {(signalResult.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="signal-details">
                    <div className="signal-section">
                      <h5>Technical Analysis</h5>
                      <p>{signalResult.analysis.technical}</p>
                    </div>
                    <div className="signal-section">
                      <h5>Fundamental Analysis</h5>
                      <p>{signalResult.analysis.fundamental}</p>
                    </div>
                    <div className="signal-section">
                      <h5>Market Sentiment</h5>
                      <p>{signalResult.analysis.sentiment}</p>
                    </div>
                  </div>
                  <div className="signal-timestamp">
                    Generated: {new Date(signalResult.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className={`tool-card ${cardStyles[1].border}`}>
          <span className={`tool-badge ${cardStyles[1].badge}`}>{cardStyles[1].label}</span>
          <div className="tool-content">
            <h4 className="tool-title">Sentiment Analysis</h4>
            <p className="tool-description">Analyzes financial news, social media, or reports for sentiment.</p>
            <div className="tool-inputs">
              <textarea 
                className="tool-input"
                placeholder="Paste news headline or tweet..." 
                value={sentimentInput} 
                onChange={e => setSentimentInput(e.target.value)} 
              />
              <button 
                className={`tool-button ${sentimentLoading ? 'loading' : ''}`}
                onClick={() => analyzeSentiment(sentimentInput)}
                disabled={sentimentLoading}
              >
                Analyze
              </button>
            </div>
            {sentimentError && (
              <div className="tool-error">{sentimentError}</div>
            )}
            {sentimentResult && (
              <div className="tool-result">
                <div className="sentiment-tag positive">
                  <div className="sentiment-header">
                    <span className="sentiment-type">{sentimentResult.sentiment}</span>
                    <span className="sentiment-score">Score: {sentimentResult.score.toFixed(2)}</span>
                  </div>
                  <div className="sentiment-details">
                    <div className="sentiment-section">
                      <h5>Confidence</h5>
                      <p>{(sentimentResult.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div className="sentiment-section">
                      <h5>Key Terms</h5>
                      <div className="keyword-tags">
                        {sentimentResult.keywords.map((keyword, i) => (
                          <span key={i} className="keyword-tag">{keyword}</span>
                        ))}
                      </div>
                    </div>
                    <div className="sentiment-section">
                      <h5>Sources</h5>
                      <div className="source-tags">
                        {sentimentResult.sources.map((source, i) => (
                          <span key={i} className="source-tag">{source}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pattern Recognition */}
        <div className={`tool-card ${cardStyles[2].border}`}>
          <span className={`tool-badge ${cardStyles[2].badge}`}>{cardStyles[2].label}</span>
          <div className="tool-content">
            <h4 className="tool-title">Pattern Recognition</h4>
            <p className="tool-description">Detects chart patterns (e.g., Head & Shoulders, Triangle).</p>
            <div className="tool-inputs">
              <button 
                className={`tool-button ${patternLoading ? 'loading' : ''}`}
                onClick={detectPatterns}
                disabled={patternLoading}
              >
                Detect Patterns
              </button>
            </div>
            {patternError && (
              <div className="tool-error">{patternError}</div>
            )}
            {patternResult.length > 0 && (
              <div className="tool-result">
                <div className="pattern-list">
                  {patternResult.map((pattern, i) => (
                    <div key={i} className="pattern-item">
                      <div className="pattern-header">
                        <span className="pattern-name">{pattern.pattern}</span>
                        <span className="pattern-confidence">
                          Confidence: {(pattern.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="pattern-details">
                        <div className="pattern-section">
                          <h5>Timeframe</h5>
                          <p>{pattern.timeframe}</p>
                        </div>
                        <div className="pattern-section">
                          <h5>Implications</h5>
                          <p>{pattern.implications}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className={`tool-card ${cardStyles[3].border}`}>
          <span className={`tool-badge ${cardStyles[3].badge}`}>{cardStyles[3].label}</span>
          <div className="tool-content">
            <h4 className="tool-title">Anomaly Detection</h4>
            <p className="tool-description">Flags abnormal price movement, volume spikes.</p>
            <div className="tool-inputs">
              <button 
                className={`tool-button ${anomalyLoading ? 'loading' : ''}`}
                onClick={detectAnomalies}
                disabled={anomalyLoading}
              >
                Run Detection
              </button>
            </div>
            {anomalyError && (
              <div className="tool-error">{anomalyError}</div>
            )}
            {anomalyResult.length > 0 && (
              <div className="tool-result">
                <div className="anomaly-list">
                  {anomalyResult.map((anomaly, i) => (
                    <div key={i} className="anomaly-item">
                      <div className="anomaly-header">
                        <span className={`anomaly-type ${anomaly.severity.toLowerCase()}`}>
                          {anomaly.type}
                        </span>
                        <span className="anomaly-severity">
                          Severity: {anomaly.severity}
                        </span>
                      </div>
                      <div className="anomaly-details">
                        <p>{anomaly.details}</p>
                        <span className="anomaly-timestamp">
                          Detected: {new Date(anomaly.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Trade Ideas */}
        <div className={`tool-card ${cardStyles[4].border}`}>
          <span className={`tool-badge ${cardStyles[4].badge}`}>{cardStyles[4].label}</span>
          <div className="tool-content">
            <h4 className="tool-title">AI Trade Ideas</h4>
            <p className="tool-description">Custom stock picks based on preferences (low risk, high growth, etc).</p>
            <div className="tool-inputs">
              <div className="preference-selectors">
                <div className="preference-group">
                  <label>Risk:</label>
                  <select 
                    className="tool-select"
                    value={tradeIdeaPrefs.risk} 
                    onChange={e => setTradeIdeaPrefs(v => ({...v, risk: e.target.value}))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="preference-group">
                  <label>Growth:</label>
                  <select 
                    className="tool-select"
                    value={tradeIdeaPrefs.growth} 
                    onChange={e => setTradeIdeaPrefs(v => ({...v, growth: e.target.value}))}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <button 
                className={`tool-button ${tradeLoading ? 'loading' : ''}`}
                onClick={generateTradeIdeas}
                disabled={tradeLoading}
              >
                Get Ideas
              </button>
            </div>
            {tradeError && (
              <div className="tool-error">{tradeError}</div>
            )}
            {tradeIdeas.length > 0 && (
              <div className="tool-result">
                <div className="trade-ideas-list">
                  {tradeIdeas.map((idea, i) => (
                    <div key={i} className="trade-idea-item">
                      <div className="trade-idea-header">
                        <span className="trade-symbol">{idea.symbol}</span>
                        <div className="trade-tags">
                          <span className={`risk-tag ${idea.risk.toLowerCase()}`}>
                            Risk: {idea.risk}
                          </span>
                          <span className={`growth-tag ${idea.growth.toLowerCase()}`}>
                            Growth: {idea.growth}
                          </span>
                        </div>
                      </div>
                      <div className="trade-idea-details">
                        <div className="trade-section">
                          <h5>Confidence</h5>
                          <p>{(idea.confidence * 100).toFixed(1)}%</p>
                        </div>
                        <div className="trade-section">
                          <h5>Reasoning</h5>
                          <p>{idea.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stock Screener */}
        <div className={`tool-card ${cardStyles[5].border}`}>
          <span className={`tool-badge ${cardStyles[5].badge}`}>{cardStyles[5].label}</span>
          <div className="tool-content">
            <h4 className="tool-title">Stock Screener with AI Filters</h4>
            <p className="tool-description">AI-enhanced screener using parameters like momentum, volatility, sentiment.</p>
            <div className="tool-inputs">
              <div className="screener-inputs">
                <input 
                  className="tool-input"
                  placeholder="Momentum (0-100)" 
                  value={screenerParams.momentum} 
                  onChange={e => setScreenerParams(v => ({...v, momentum: e.target.value}))} 
                />
                <input 
                  className="tool-input"
                  placeholder="Volatility (%)" 
                  value={screenerParams.volatility} 
                  onChange={e => setScreenerParams(v => ({...v, volatility: e.target.value}))} 
                />
                <input 
                  className="tool-input"
                  placeholder="Sentiment (0-1)" 
                  value={screenerParams.sentiment} 
                  onChange={e => setScreenerParams(v => ({...v, sentiment: e.target.value}))} 
                />
                <input 
                  className="tool-input"
                  placeholder="Min Price" 
                  value={screenerParams.minPrice} 
                  onChange={e => setScreenerParams(v => ({...v, minPrice: e.target.value}))} 
                />
                <input 
                  className="tool-input"
                  placeholder="Max Price" 
                  value={screenerParams.maxPrice} 
                  onChange={e => setScreenerParams(v => ({...v, maxPrice: e.target.value}))} 
                />
                <input 
                  className="tool-input"
                  placeholder="Market Cap (M)" 
                  value={screenerParams.marketCap} 
                  onChange={e => setScreenerParams(v => ({...v, marketCap: e.target.value}))} 
                />
                <select 
                  className="tool-select"
                  value={screenerParams.sector} 
                  onChange={e => setScreenerParams(v => ({...v, sector: e.target.value}))}
                >
                  <option value="">Select Sector</option>
                  <option value="tech">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="energy">Energy</option>
                  <option value="consumer">Consumer</option>
                </select>
              </div>
              <button 
                className={`tool-button ${screenerLoading ? 'loading' : ''}`}
                onClick={screenStocks}
                disabled={screenerLoading}
              >
                Screen Stocks
              </button>
            </div>
            {screenerError && (
              <div className="tool-error">{screenerError}</div>
            )}
            {screenerResults.length > 0 && (
              <div className="tool-result">
                <div className="screener-results-list">
                  {screenerResults.map((result, i) => (
                    <div key={i} className="screener-result-item">
                      <div className="screener-header">
                        <span className="screener-symbol">{result.symbol}</span>
                        <span className="screener-price">${result.price.toFixed(2)}</span>
                      </div>
                      <div className="screener-metrics">
                        <div className="metric">
                          <span className="metric-label">Momentum</span>
                          <span className="metric-value">{result.momentum}</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Volatility</span>
                          <span className="metric-value">{result.volatility}%</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Sentiment</span>
                          <span className="metric-value">{result.sentiment}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className={`tool-card ${cardStyles[6].border}`}>
          <span className={`tool-badge ${cardStyles[6].badge}`}>{cardStyles[6].label}</span>
          <div className="tool-content">
            <h4 className="tool-title">Risk Assessment Engine</h4>
            <p className="tool-description">Calculates risk score for each asset/user portfolio.</p>
            <div className="tool-inputs">
              <button 
                className={`tool-button ${riskLoading ? 'loading' : ''}`}
                onClick={calculateRisk}
                disabled={riskLoading}
              >
                Calculate Risk
              </button>
            </div>
            {riskError && (
              <div className="tool-error">{riskError}</div>
            )}
            {riskScore && (
              <div className="tool-result">
                <div className="risk-assessment">
                  <div className="risk-header">
                    <span className="risk-score">Risk Score: {riskScore.score}</span>
                    <span className={`risk-level ${riskScore.level.toLowerCase()}`}>
                      {riskScore.level}
                    </span>
                  </div>
                  <div className="risk-factors">
                    {riskScore.factors.map((factor, i) => (
                      <div key={i} className="risk-factor">
                        <span className="factor-name">{factor.name}</span>
                        <div className="factor-score">
                          <div 
                            className="score-bar" 
                            style={{ width: `${(factor.score / 5) * 100}%` }}
                          ></div>
                          <span className="score-value">{factor.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="risk-recommendations">
                    <h5>Recommendations</h5>
                    <ul>
                      {riskScore.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Prediction */}
        <div className={`tool-card prediction-card ${cardStyles[7].border}`}>
          <span className={`tool-badge ${cardStyles[7].badge}`}>{cardStyles[7].label}</span>
          <div className="tool-content">
            <h4 className="tool-title">AI Prediction for Stock Market</h4>
            <div className="prediction-tabs">
              <button 
                className={`tab-button ${predictionTab === 'shortterm' ? 'active' : ''}`}
                onClick={() => setPredictionTab('shortterm')}
              >
                Short-Term Price
              </button>
              <button 
                className={`tab-button ${predictionTab === 'volatility' ? 'active' : ''}`}
                onClick={() => setPredictionTab('volatility')}
              >
                Volatility
              </button>
              <button 
                className={`tab-button ${predictionTab === 'range' ? 'active' : ''}`}
                onClick={() => setPredictionTab('range')}
              >
                Price Range
              </button>
            </div>

            <div className="prediction-content">
              {predictionTab === 'shortterm' && (
                <>
                  <p className="tool-description">Predicts intraday or 3-day price movement (LSTM, GRU, Prophet).</p>
                  <div className="tool-inputs">
                    <input 
                      className="tool-input"
                      placeholder="Enter stock symbol (e.g. TSLA)" 
                      value={predictionInput} 
                      onChange={e => setPredictionInput(e.target.value.toUpperCase())} 
                    />
                    <button 
                      className={`tool-button ${predictionLoading ? 'loading' : ''}`}
                      onClick={generatePrediction}
                      disabled={predictionLoading}
                    >
                      Predict
                    </button>
                  </div>
                </>
              )}

              {predictionTab === 'volatility' && (
                <>
                  <p className="tool-description">Predicts future volatility (GARCH, LSTM).</p>
                  <div className="tool-inputs">
                    <input 
                      className="tool-input"
                      placeholder="Enter stock symbol (e.g. TSLA)" 
                      value={predictionInput} 
                      onChange={e => setPredictionInput(e.target.value.toUpperCase())} 
                    />
                    <button 
                      className={`tool-button ${predictionLoading ? 'loading' : ''}`}
                      onClick={generatePrediction}
                      disabled={predictionLoading}
                    >
                      Forecast
                    </button>
                  </div>
                </>
              )}

              {predictionTab === 'range' && (
                <>
                  <p className="tool-description">High/Low price range projection with confidence bands (Quantile Regression, Bootstrapped LSTM).</p>
                  <div className="tool-inputs">
                    <input 
                      className="tool-input"
                      placeholder="Enter stock symbol (e.g. TSLA)" 
                      value={predictionInput} 
                      onChange={e => setPredictionInput(e.target.value.toUpperCase())} 
                    />
                    <button 
                      className={`tool-button ${predictionLoading ? 'loading' : ''}`}
                      onClick={generatePrediction}
                      disabled={predictionLoading}
                    >
                      Estimate Range
                    </button>
                  </div>
                </>
              )}

              {predictionError && (
                <div className="tool-error">{predictionError}</div>
              )}

              {predictionResult && (
                <div className="tool-result">
                  <div className="prediction-details">
                    {predictionTab === 'shortterm' && (
                      <>
                        <div className="prediction-header">
                          <span className="prediction-value">{predictionResult.prediction}</span>
                          <span className="prediction-model">Model: {predictionResult.model}</span>
                        </div>
                        <div className="prediction-metrics">
                          <div className="metric">
                            <span className="metric-label">Confidence</span>
                            <span className="metric-value">
                              {(predictionResult.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="metric">
                            <span className="metric-label">Timeframe</span>
                            <span className="metric-value">{predictionResult.timeframe}</span>
                          </div>
                        </div>
                        <div className="prediction-factors">
                          <h5>Factors Considered</h5>
                          <ul>
                            {predictionResult.factors.map((factor, i) => (
                              <li key={i}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}

                    {predictionTab === 'volatility' && (
                      <>
                        <div className="prediction-header">
                          <span className="prediction-value">{predictionResult.prediction}</span>
                          <span className="prediction-model">Model: {predictionResult.model}</span>
                        </div>
                        <div className="prediction-metrics">
                          <div className="metric">
                            <span className="metric-label">Confidence</span>
                            <span className="metric-value">
                              {(predictionResult.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="metric">
                            <span className="metric-label">Timeframe</span>
                            <span className="metric-value">{predictionResult.timeframe}</span>
                          </div>
                        </div>
                        <div className="prediction-factors">
                          <h5>Factors Considered</h5>
                          <ul>
                            {predictionResult.factors.map((factor, i) => (
                              <li key={i}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}

                    {predictionTab === 'range' && (
                      <>
                        <div className="prediction-header">
                          <div className="range-values">
                            <span className="range-low">Low: ${predictionResult.prediction.low}</span>
                            <span className="range-high">High: ${predictionResult.prediction.high}</span>
                          </div>
                          <span className="prediction-confidence">
                            Confidence: {(predictionResult.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="prediction-metrics">
                          <div className="metric">
                            <span className="metric-label">Timeframe</span>
                            <span className="metric-value">{predictionResult.timeframe}</span>
                          </div>
                        </div>
                        <div className="prediction-factors">
                          <h5>Factors Considered</h5>
                          <ul>
                            {predictionResult.factors.map((factor, i) => (
                              <li key={i}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 