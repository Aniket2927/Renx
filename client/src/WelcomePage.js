import React, { useState, useEffect } from "react";
import "./App.css";
import TradesSection from "./components/trades/TradesSection";
import ProfileSection from "./components/profile/ProfileSection";
import { useNavigate } from "react-router-dom";
import AITradingWidget from './services/frontend/components/dashboard/AITradingWidget';

const Sidebar = ({ activeSection, setActiveSection, username }) => {
  const navigate = useNavigate();
  
  const handleSectionChange = (section) => {
    console.log(`Changing section to: ${section}`);
    if (section === 'profile') {
      navigate('/profile', { state: { username } });
    } else {
      setActiveSection(section);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo"> <span role="img" aria-label="logo">💹</span> Dashboard</div>
      <nav className="sidebar-nav">
        <button 
          className={activeSection === 'wallet' ? 'active' : ''}
          onClick={() => handleSectionChange('wallet')}
          aria-label="wallet"
        >
          <span role="img" aria-label="wallet">👛</span> Wallet
        </button>
        <button 
          className={activeSection === 'trades' ? 'active' : ''}
          onClick={() => handleSectionChange('trades')}
          aria-label="trades"
        >
          <span role="img" aria-label="trades">📈</span> Trades
        </button>
        <button 
          onClick={() => handleSectionChange('profile')}
          aria-label="profile"
        >
          <span role="img" aria-label="profile">👤</span> Profile
        </button>
        <button 
          className={activeSection === 'withdraw' ? 'active' : ''}
          onClick={() => handleSectionChange('withdraw')}
          aria-label="withdraw"
        >
          <span role="img" aria-label="withdraw">💸</span> Withdraw
        </button>
        <button 
          className={activeSection === 'security' ? 'active' : ''}
          onClick={() => handleSectionChange('security')}
          aria-label="security"
        >
          <span role="img" aria-label="security">🔒</span> Security
        </button>
        <button 
          className={activeSection === 'settings' ? 'active' : ''}
          onClick={() => handleSectionChange('settings')}
          aria-label="settings"
        >
          <span role="img" aria-label="settings">⚙️</span> Setting
        </button>
      </nav>
    </aside>
  );
};

const Topbar = ({ username, setActiveSection }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  
  const handleProfileClick = () => {
    navigate('/profile', { state: { username } });
    setShowDropdown(false);
  };
  
  return (
    <header className="topbar">
      <input className="search-bar" placeholder="Search here" />
      <div className="topbar-actions">
        <span className="notification-bell" title="Notifications">🔔</span>
        <div className="topbar-user" onClick={() => setShowDropdown(v => !v)}>
          <span className="user-avatar">{username ? username[0].toUpperCase() : 'U'}</span>
          <span className="user-name">{username || 'User'}</span>
          <span className="dropdown-arrow">▼</span>
          {showDropdown && (
            <div className="profile-dropdown">
              <button onClick={handleProfileClick}>Profile</button>
              <button>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const GreetingSection = ({ username }) => (
  <div className="greeting-section animate-in">
    <div className="greeting-avatar">
      <span role="img" aria-label="user">👋</span>
    </div>
    <div>
      <h2>Welcome back, {username || 'Trader'}!</h2>
      <p>Here's your AI-powered trading dashboard. Let's make smart moves today!</p>
    </div>
  </div>
);

const OverviewCards = () => (
  <div className="overview-cards animate-in">
    <div className="overview-card">
      <span className="overview-icon" role="img" aria-label="balance">💰</span>
      <div className="overview-value">$3,421.90</div>
      <div className="overview-label">Account Balance</div>
    </div>
    <div className="overview-card">
      <span className="overview-icon" role="img" aria-label="income">💵</span>
      <div className="overview-value">$1,358.24</div>
      <div className="overview-label">Total Income</div>
    </div>
    <div className="overview-card">
      <span className="overview-icon" role="img" aria-label="return">📊</span>
      <div className="overview-value">253.75%</div>
      <div className="overview-label">Rate of return</div>
    </div>
    <div className="overview-card">
      <span className="overview-icon" role="img" aria-label="trades">🔄</span>
      <div className="overview-value">1,533</div>
      <div className="overview-label">Number of trades</div>
    </div>
  </div>
);

const BalancesRow = () => (
  <div className="balances-row animate-in">
    <div className="balance-item bitcoin">
      <span className="coin">🟡 Bitcoin</span>
      <span className="amount">0.113232 <span className="up">↑</span></span>
    </div>
    <div className="balance-item ethereum">
      <span className="coin">🔵 Ethereum</span>
      <span className="amount">53.1432 <span className="down">↓</span></span>
    </div>
    <div className="balance-item zcash">
      <span className="coin">🟢 Zcash</span>
      <span className="amount">132.3432 <span className="up">↑</span></span>
    </div>
    <div className="balance-item ripple">
      <span className="coin">🟣 Ripple</span>
      <span className="amount">839.3432 <span className="down">↓</span></span>
    </div>
    <button className="add-more">+ Add More</button>
  </div>
);

const AITradingFeatures = () => {
  const features = [
    {
      icon: '🔗',
      title: 'Real-time Data Integration',
      desc: 'WebSocket connections, live price updates, order book, and market depth visualization.',
      className: 'real-time-data',
    },
    {
      icon: '🤖',
      title: 'AI Analysis',
      desc: 'Pattern recognition, price prediction models, sentiment analysis, risk assessment, and portfolio optimization.',
      className: 'ai-analysis',
    },
    {
      icon: '⚡',
      title: 'Trading Automation',
      desc: 'Automated order execution, stop-loss management, take-profit automation, and position sizing algorithms.',
      className: 'trading-automation',
    },
    {
      icon: '🛡️',
      title: 'Risk Management',
      desc: 'Portfolio diversification analysis, risk exposure monitoring, volatility tracking, and drawdown protection.',
      className: 'risk-management',
    },
    {
      icon: '📈',
      title: 'Performance Analytics',
      desc: 'Trade history tracking, performance metrics, ROI calculations, and risk-adjusted returns.',
      className: 'performance-analytics',
    },
    {
      icon: '🎛️',
      title: 'User Customization',
      desc: 'Custom dashboard layouts, personalized alerts, custom indicators, and strategy parameters.',
      className: 'user-customization',
    },
    {
      icon: '🔒',
      title: 'Security Features',
      desc: 'Two-factor authentication, API key management, session management, and activity logging.',
      className: 'security-features',
    },
  ];
  return (
    <div className="ai-features-cards-section animate-in">
      <h3>AI-Based Trading Application Features</h3>
      <div className="ai-features-cards-grid">
        {features.map((feature, idx) => (
          <div key={idx} className={`ai-feature-card ${feature.className}`}>
            <span className="ai-feature-icon" role="img" aria-label={feature.title}>{feature.icon}</span>
            <div className="ai-feature-title">{feature.title}</div>
            <div className="ai-feature-desc">{feature.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TradingStats = () => (
  <div className="trading-stats animate-in">
    <div className="trading-chart">
      <div className="chart-header">
        <span>Bitcoin</span>
        <div className="chart-tabs">
          <button>1d</button>
          <button>1w</button>
          <button>1m</button>
          <button>1y</button>
        </div>
      </div>
      <div className="chart-placeholder gradient-chart-bg">
        {/* Replace with chart library if needed */}
        <svg width="100%" height="120">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f8cff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#4f8cff" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke="url(#chartGradient)"
            strokeWidth="5"
            points="0,100 30,80 60,90 90,40 120,60 150,30 180,60 210,20 240,40 270,10 300,30 330,0 360,20"
          />
        </svg>
        <div className="chart-tooltip">Sep 12, 1998<br/>$5,423.53</div>
      </div>
    </div>
    <div className="stock-stats">
      <div className="stock-row"><span className="coin-dot bitcoin"></span>Bitcoin <span className="up">4.21%</span></div>
      <div className="stock-row"><span className="coin-dot ethereum"></span>Ethereum <span className="down">2.54%</span></div>
      <div className="stock-row"><span className="coin-dot zcash"></span>Zcash <span className="up">5.58%</span></div>
      <div className="stock-row"><span className="coin-dot ripple"></span>Ripple <span className="down">3.23%</span></div>
      <div className="stock-row"><span className="coin-dot dash"></span>Dash <span className="down">1.81%</span></div>
      <div className="stock-row"><span className="coin-dot litecoin"></span>Litecoin <span className="up">7.91%</span></div>
    </div>
  </div>
);

const BuySellPanel = () => (
  <div className="buy-sell-panel animate-in">
    <div className="buy-sell-tabs">
      <button className="tab active">Buy</button>
      <button className="tab">Sell</button>
    </div>
    <div className="buy-sell-form">
      <div className="form-row">
        <label>Amount</label>
        <input value=".00234324" readOnly />
        <span className="unit">BTC</span>
      </div>
      <div className="form-row">
        <label>Price Per Unit</label>
        <input value="6,473.32" readOnly />
        <span className="unit">USD</span>
      </div>
      <div className="form-row">
        <label>Total Cost</label>
        <input value="3,438.43" readOnly />
        <span className="unit">USD</span>
      </div>
      <button className="sell-btn gradient-btn">Sell</button>
    </div>
  </div>
);

function WelcomePage({ username, initialSection = 'wallet' }) {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log(`Active section changed to: ${activeSection}`);
    // Reset error state when section changes
    setError(null);
  }, [activeSection]);

  const renderContent = () => {
    console.log(`Rendering content for section: ${activeSection}`);
    
    try {
      switch(activeSection) {
        case 'trades':
          return <TradesSection />;
        case 'profile':
          return <ProfileSection username={username} />;
        case 'wallet':
          return (
            <>
              <GreetingSection username={username} />
              <OverviewCards />
              <BalancesRow />
              <AITradingFeatures />
              <div className="bg-white rounded-lg shadow-md p-4" style={{marginTop: '24px'}}>
                <AITradingWidget />
              </div>
              <div className="main-widgets">
                <TradingStats />
                <BuySellPanel />
              </div>
            </>
          );
        case 'withdraw':
          return (
            <div className="section-placeholder">
              <h2>Withdraw Section</h2>
              <p>This section is currently under development.</p>
            </div>
          );
        case 'security':
          return (
            <div className="section-placeholder">
              <h2>Security Section</h2>
              <p>This section is currently under development.</p>
            </div>
          );
        case 'settings':
          return (
            <div className="section-placeholder">
              <h2>Settings Section</h2>
              <p>This section is currently under development.</p>
            </div>
          );
        default:
          return (
            <>
              <GreetingSection username={username} />
              <OverviewCards />
              <BalancesRow />
              <AITradingFeatures />
              <div className="bg-white rounded-lg shadow-md p-4" style={{marginTop: '24px'}}>
                <AITradingWidget />
              </div>
              <div className="main-widgets">
                <TradingStats />
                <BuySellPanel />
              </div>
            </>
          );
      }
    } catch (err) {
      console.error("Error rendering content:", err);
      setError(err);
      return (
        <div className="error-message">
          <h3>Something went wrong</h3>
          <p>There was an error loading this section. Please try again later.</p>
          <button onClick={() => setActiveSection('wallet')}>Return to Wallet</button>
        </div>
      );
    }
  };

  return (
    <div className="dashboard-layout bg-animated">
      <div 
        className="background-image"
        style={{
          position: 'fixed',
          right: 0,
          bottom: 0,
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          zIndex: -1,
          backgroundImage: 'url("https://www.shutterstock.com/image-photo/ai-robot-calculating-income-return-on-2447402001")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} username={username} />
      <div className="main-content">
        <Topbar username={username} setActiveSection={setActiveSection} />
        
        <ErrorBoundary 
          fallback={
            <div className="error-message">
              <h3>Something went wrong</h3>
              <p>There was an error loading the {activeSection} section. Please try again later.</p>
              <button onClick={() => setActiveSection('wallet')}>Return to Wallet</button>
            </div>
          }
        >
          {error ? (
            <div className="error-message">
              <h3>Something went wrong</h3>
              <p>There was an error loading the {activeSection} section. Please try again later.</p>
              <button onClick={() => setActiveSection('wallet')}>Return to Wallet</button>
            </div>
          ) : (
            renderContent()
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default WelcomePage; 