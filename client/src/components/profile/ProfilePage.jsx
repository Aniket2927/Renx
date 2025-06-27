import React, { useState } from 'react';
import './ProfileSection.css';
import { 
  FaUser, FaEnvelope, FaLock, FaIdCard, FaPhone, FaMapMarkerAlt, FaCamera, 
  FaSave, FaPencilAlt, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaCrown, 
  FaArrowUp, FaChartLine, FaExchangeAlt, FaBell, FaSlidersH, FaCoins,
  FaUserFriends, FaHistory, FaRobot, FaLink, FaUnlink, FaKey, FaPowerOff,
  FaTrash, FaSignOutAlt, FaPlusCircle, FaTimes, FaEdit, FaStar, FaCopy,
  FaShareAlt, FaLightbulb, FaThumbsUp, FaThumbsDown, FaInfoCircle
} from 'react-icons/fa';
import bellIcon from '../../assets/icons/bell.svg';
import deleteIcon from '../../assets/icons/delete.svg';

const ProfilePage = ({ username }) => {
  // Mock user data - in a real app, this would come from an API
  const [userData, setUserData] = useState({
    username: username || 'JohnTrader',
    email: 'john.trader@example.com',
    firstName: 'John',
    lastName: 'Smith',
    phone: '+1 (555) 123-4567',
    address: '123 Trading Street, Market City, TC 12345',
    profileImage: 'https://i.pravatar.cc/150?img=68', // placeholder image
    joinDate: '2023-01-15',
    tradingExperience: 'Intermediate',
    bio: 'Passionate crypto trader with 5 years of experience in market analysis and algorithmic trading.',
    verificationStatus: 'Tier 1',
    subscriptionPlan: 'Pro',
    nextBillingDate: '2023-12-15',
    usageStats: {
      apiCalls: 2145,
      tradesExecuted: 47,
      predictionsReceived: 89
    },
    aiSettings: {
      riskTolerance: 65,
      strategy: 'Swing',
      confidenceThreshold: 75,
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({...userData});
  const [activeTab, setActiveTab] = useState('profile');
  const [notification, setNotification] = useState(null);
  
  const [watchlist, setWatchlist] = useState([
    { id: 1, symbol: 'AAPL', name: 'Apple Inc.', price: 182.63, change: 1.25, alerts: { price: 190, aiEnabled: true } },
    { id: 2, symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.92, change: -0.58, alerts: { price: 390, aiEnabled: true } },
    { id: 3, symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.65, change: 2.34, alerts: { rsi: 70, aiEnabled: false } },
    { id: 4, symbol: 'AMZN', name: 'Amazon.com Inc.', price: 184.05, change: 0.87, alerts: { volume: 5000000, aiEnabled: true } }
  ]);
  
  const [connectedBrokers, setConnectedBrokers] = useState([
    { id: 1, name: 'Zerodha', status: 'Connected', lastSync: '2023-11-10 08:45 AM' },
    { id: 2, name: 'Upstox', status: 'Disconnected', lastSync: '2023-10-25 03:12 PM' },
    { id: 3, name: 'Fyers', status: 'Connected', lastSync: '2023-11-12 02:30 PM' }
  ]);
  
  const [referralData, setReferralData] = useState({
    code: 'JOHNT2023',
    earnings: 250.75,
    usersReferred: 12,
    pendingInvites: 5
  });
  
  const [aiTrainingHistory, setAiTrainingHistory] = useState([
    { id: 1, date: '2023-11-05', action: 'Trade Analysis', description: 'AI analyzed 24 of your trades to improve prediction model', feedback: null },
    { id: 2, date: '2023-10-28', action: 'Strategy Calibration', description: 'AI adjusted strategy based on your profit patterns', feedback: 'positive' },
    { id: 3, date: '2023-10-15', action: 'Risk Assessment', description: 'AI evaluated your risk tolerance from trading behavior', feedback: null }
  ]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to an API
    setUserData({...formData});
    setIsEditing(false);
    showNotification('Profile updated successfully!');
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // If canceling edit, reset form data to current user data
      setFormData({...userData});
    }
    setIsEditing(!isEditing);
  };

  // Show notification message
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3344);
  };

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload this file to a server
      // Here we're just creating a local URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profileImage: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // AI Settings Handlers
  const handleAISettingChange = (setting, value) => {
    setFormData({
      ...formData,
      aiSettings: {
        ...formData.aiSettings,
        [setting]: value
      }
    });
  };
  
  // Watchlist Handlers
  const removeFromWatchlist = (id) => {
    setWatchlist(watchlist.filter(item => item.id !== id));
    showNotification('Stock removed from watchlist');
  };
  
  const toggleAIAlert = (id) => {
    setWatchlist(watchlist.map(item => {
      if (item.id === id) {
        return {
          ...item,
          alerts: {
            ...item.alerts,
            aiEnabled: !item.alerts.aiEnabled
          }
        };
      }
      return item;
    }));
  };
  
  // Broker Connection Handlers
  const toggleBrokerConnection = (id) => {
    setConnectedBrokers(connectedBrokers.map(broker => {
      if (broker.id === id) {
        const newStatus = broker.status === 'Connected' ? 'Disconnected' : 'Connected';
        return {
          ...broker,
          status: newStatus,
          lastSync: newStatus === 'Connected' ? new Date().toLocaleString() : broker.lastSync
        };
      }
      return broker;
    }));
    showNotification('Broker connection updated');
  };
  
  // AI Training Feedback
  const provideFeedback = (id, type) => {
    setAiTrainingHistory(aiTrainingHistory.map(item => {
      if (item.id === id) {
        return {
          ...item,
          feedback: type
        };
      }
      return item;
    }));
    showNotification('Feedback submitted. Thank you!');
  };

  return (
    <div className="main-content-area">
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
      
      <div className="profile-section">
        <div className="profile-header">
          <h2>My Profile</h2>
          <button 
            className={`edit-button ${isEditing ? 'save-mode' : ''}`} 
            onClick={isEditing ? handleSubmit : toggleEditMode}
          >
            {isEditing ? <><FaSave /> Save</> : <><FaPencilAlt /> Edit</>}
          </button>
          {isEditing && (
            <button className="cancel-button" onClick={toggleEditMode}>
              Cancel
            </button>
          )}
        </div>

        <div className="profile-tabs">
          <button 
            className={activeTab === 'profile' ? 'active' : ''} 
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Personal Info
          </button>
          <button 
            className={activeTab === 'subscription' ? 'active' : ''} 
            onClick={() => setActiveTab('subscription')}
          >
            <FaCrown /> Subscription
          </button>
          <button 
            className={activeTab === 'ai' ? 'active' : ''} 
            onClick={() => setActiveTab('ai')}
          >
            <FaRobot /> AI Settings
          </button>
          <button 
            className={activeTab === 'watchlist' ? 'active' : ''} 
            onClick={() => setActiveTab('watchlist')}
          >
            <FaStar /> Watchlist & Alerts
          </button>
          <button 
            className={activeTab === 'security' ? 'active' : ''} 
            onClick={() => setActiveTab('security')}
          >
            <FaLock /> Security
          </button>
          <button 
            className={activeTab === 'referrals' ? 'active' : ''} 
            onClick={() => setActiveTab('referrals')}
          >
            <FaUserFriends /> Referrals
          </button>
          <button 
            className={activeTab === 'ai-training' ? 'active' : ''} 
            onClick={() => setActiveTab('ai-training')}
          >
            <FaHistory /> AI Training
          </button>
        </div>

        <div className="profile-content">
          {/* PERSONAL INFO TAB */}
          {activeTab === 'profile' && (
            <div className="profile-info">
              <div className="profile-image-container">
                <img 
                  src={formData.profileImage} 
                  alt="Profile" 
                  className="profile-image" 
                />
                {isEditing && (
                  <label className="image-upload-label">
                    <FaCamera />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="image-upload-input" 
                    />
                  </label>
                )}
                
                <div className="verification-badge">
                  <FaShieldAlt /> {userData.verificationStatus}
                </div>
              </div>

              <div className="profile-details">
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label><FaUser /> Username</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          name="username" 
                          value={formData.username} 
                          onChange={handleChange} 
                          required 
                        />
                      ) : (
                        <p>{userData.username}</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label><FaEnvelope /> Email</label>
                      {isEditing ? (
                        <input 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleChange} 
                          required 
                        />
                      ) : (
                        <p>{userData.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label><FaIdCard /> First Name</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          name="firstName" 
                          value={formData.firstName} 
                          onChange={handleChange} 
                        />
                      ) : (
                        <p>{userData.firstName}</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label><FaIdCard /> Last Name</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          name="lastName" 
                          value={formData.lastName} 
                          onChange={handleChange} 
                        />
                      ) : (
                        <p>{userData.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label><FaPhone /> Phone</label>
                      {isEditing ? (
                        <input 
                          type="tel" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleChange} 
                        />
                      ) : (
                        <p>{userData.phone}</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label><FaMapMarkerAlt /> Address</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          name="address" 
                          value={formData.address} 
                          onChange={handleChange} 
                        />
                      ) : (
                        <p>{userData.address}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>Trading Experience</label>
                    {isEditing ? (
                      <select 
                        name="tradingExperience" 
                        value={formData.tradingExperience} 
                        onChange={handleChange}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Professional">Professional</option>
                      </select>
                    ) : (
                      <p>{userData.tradingExperience}</p>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label>Bio</label>
                    {isEditing ? (
                      <textarea 
                        name="bio" 
                        value={formData.bio} 
                        onChange={handleChange} 
                        rows="4"
                      />
                    ) : (
                      <p>{userData.bio}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Member Since</label>
                    <p>{new Date(userData.joinDate).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="kyc-verification-status">
                    <h4><FaIdCard /> KYC Verification Status</h4>
                    <div className="verification-level">
                      <div className={`level ${userData.verificationStatus === 'Tier 1' ? 'active' : ''}`}>
                        <span className="level-number">1</span>
                        <span className="level-label">Basic</span>
                        {userData.verificationStatus === 'Tier 1' && <FaCheckCircle className="check-icon" />}
                      </div>
                      <div className={`level ${userData.verificationStatus === 'Tier 2' ? 'active' : ''}`}>
                        <span className="level-number">2</span>
                        <span className="level-label">Identity</span>
                        {userData.verificationStatus === 'Tier 2' && <FaCheckCircle className="check-icon" />}
                      </div>
                      <div className={`level ${userData.verificationStatus === 'Tier 3' ? 'active' : ''}`}>
                        <span className="level-number">3</span>
                        <span className="level-label">Advanced</span>
                        {userData.verificationStatus === 'Tier 3' && <FaCheckCircle className="check-icon" />}
                      </div>
                    </div>
                    <button className="upgrade-verification-btn">Upgrade Verification</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* SUBSCRIPTION TAB */}
          {activeTab === 'subscription' && (
            <div className="subscription-section">
              <div className="current-plan">
                <div className="plan-header">
                  <h3>Current Subscription</h3>
                  <div className={`plan-badge ${userData.subscriptionPlan.toLowerCase()}`}>
                    <FaCrown /> {userData.subscriptionPlan}
                  </div>
                </div>
                
                <div className="plan-details">
                  <div className="plan-info">
                    <div className="info-item">
                      <span className="info-label">Next Billing Date</span>
                      <span className="info-value">{userData.nextBillingDate}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Monthly Price</span>
                      <span className="info-value">
                        {userData.subscriptionPlan === 'Free' ? 'Free' : 
                         userData.subscriptionPlan === 'Pro' ? '$29.99' : '$59.99'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="usage-stats">
                    <h4>Current Usage</h4>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <div className="stat-value">{userData.usageStats.apiCalls}</div>
                        <div className="stat-label">API Calls</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{userData.usageStats.tradesExecuted}</div>
                        <div className="stat-label">Trades</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{userData.usageStats.predictionsReceived}</div>
                        <div className="stat-label">Predictions</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button className="upgrade-plan-btn">Upgrade Plan</button>
              </div>
              
              <div className="plan-comparison">
                <h3>Available Plans</h3>
                <div className="plans-grid">
                  <div className={`plan-card ${userData.subscriptionPlan === 'Free' ? 'current' : ''}`}>
                    <div className="plan-name">Free</div>
                    <div className="plan-price">$0<span>/month</span></div>
                    <ul className="plan-features">
                      <li><FaCheckCircle /> Basic stock data</li>
                      <li><FaCheckCircle /> 5 watchlist items</li>
                      <li><FaCheckCircle /> Daily market summary</li>
                      <li><FaTimesCircle /> AI predictions</li>
                      <li><FaTimesCircle /> Custom alerts</li>
                    </ul>
                    {userData.subscriptionPlan !== 'Free' && 
                      <button className="select-plan-btn">Downgrade</button>
                    }
                  </div>
                  
                  <div className={`plan-card ${userData.subscriptionPlan === 'Pro' ? 'current' : ''}`}>
                    <div className="plan-name">Pro</div>
                    <div className="plan-price">$29.99<span>/month</span></div>
                    <ul className="plan-features">
                      <li><FaCheckCircle /> Advanced stock data</li>
                      <li><FaCheckCircle /> 20 watchlist items</li>
                      <li><FaCheckCircle /> Real-time alerts</li>
                      <li><FaCheckCircle /> Basic AI predictions</li>
                      <li><FaCheckCircle /> 2 trading strategies</li>
                    </ul>
                    {userData.subscriptionPlan !== 'Pro' && 
                      <button className="select-plan-btn">
                        {userData.subscriptionPlan === 'Elite' ? 'Downgrade' : 'Upgrade'}
                      </button>
                    }
                  </div>
                  
                  <div className={`plan-card ${userData.subscriptionPlan === 'Elite' ? 'current' : ''}`}>
                    <div className="plan-name">Elite</div>
                    <div className="plan-price">$59.99<span>/month</span></div>
                    <ul className="plan-features">
                      <li><FaCheckCircle /> Premium financial data</li>
                      <li><FaCheckCircle /> Unlimited watchlist</li>
                      <li><FaCheckCircle /> Advanced AI predictions</li>
                      <li><FaCheckCircle /> All trading strategies</li>
                      <li><FaCheckCircle /> Priority support</li>
                    </ul>
                    {userData.subscriptionPlan !== 'Elite' && 
                      <button className="select-plan-btn">Upgrade</button>
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI SETTINGS TAB */}
          {activeTab === 'ai' && (
            <div className="ai-settings-section">
              <h3><FaRobot /> AI Model Customization</h3>
              
              <div className="settings-card">
                <div className="setting-item">
                  <div className="setting-header">
                    <h4>Risk Tolerance</h4>
                    <div className="setting-value">{formData.aiSettings.riskTolerance}%</div>
                  </div>
                  <p className="setting-description">Set your preferred level of risk for AI-generated trading suggestions</p>
                  <div className="slider-container">
                    <input 
                      type="range" 
                      min="10" 
                      max="90" 
                      value={formData.aiSettings.riskTolerance} 
                      onChange={(e) => handleAISettingChange('riskTolerance', parseInt(e.target.value))}
                      className="slider"
                    />
                    <div className="slider-labels">
                      <span>Conservative</span>
                      <span>Balanced</span>
                      <span>Aggressive</span>
                    </div>
                  </div>
                </div>
                
                <div className="setting-item">
                  <div className="setting-header">
                    <h4>Trading Strategy</h4>
                  </div>
                  <p className="setting-description">Select your preferred trading style for AI analysis</p>
                  <div className="strategy-options">
                    <div 
                      className={`strategy-option ${formData.aiSettings.strategy === 'Momentum' ? 'active' : ''}`}
                      onClick={() => handleAISettingChange('strategy', 'Momentum')}
                    >
                      <div className="strategy-icon"><FaChartLine /></div>
                      <div className="strategy-name">Momentum</div>
                    </div>
                    <div 
                      className={`strategy-option ${formData.aiSettings.strategy === 'Swing' ? 'active' : ''}`}
                      onClick={() => handleAISettingChange('strategy', 'Swing')}
                    >
                      <div className="strategy-icon"><FaExchangeAlt /></div>
                      <div className="strategy-name">Swing</div>
                    </div>
                    <div 
                      className={`strategy-option ${formData.aiSettings.strategy === 'Intraday' ? 'active' : ''}`}
                      onClick={() => handleAISettingChange('strategy', 'Intraday')}
                    >
                      <div className="strategy-icon"><FaArrowUp /></div>
                      <div className="strategy-name">Intraday</div>
                    </div>
                    <div 
                      className={`strategy-option ${formData.aiSettings.strategy === 'Value' ? 'active' : ''}`}
                      onClick={() => handleAISettingChange('strategy', 'Value')}
                    >
                      <div className="strategy-icon"><FaCoins /></div>
                      <div className="strategy-name">Value</div>
                    </div>
                  </div>
                </div>
                
                <div className="setting-item">
                  <div className="setting-header">
                    <h4>Confidence Threshold</h4>
                    <div className="setting-value">{formData.aiSettings.confidenceThreshold}%</div>
                  </div>
                  <p className="setting-description">Only receive AI alerts when confidence level exceeds this threshold</p>
                  <div className="slider-container">
                    <input 
                      type="range" 
                      min="50" 
                      max="95" 
                      step="5"
                      value={formData.aiSettings.confidenceThreshold} 
                      onChange={(e) => handleAISettingChange('confidenceThreshold', parseInt(e.target.value))}
                      className="slider"
                    />
                    <div className="slider-labels">
                      <span>More Signals</span>
                      <span>Balanced</span>
                      <span>Higher Accuracy</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="ai-settings-actions">
                <button className="save-settings-btn" onClick={handleSubmit}>
                  <FaSave /> Save AI Preferences
                </button>
                <button className="reset-settings-btn">
                  Reset to Defaults
                </button>
              </div>
            </div>
          )}

          {/* WATCHLIST & ALERTS TAB */}
          {activeTab === 'watchlist' && (
            <div className="watchlist-section">
              <div className="section-header">
                <h3><FaStar /> Watchlist & Alerts</h3>
                <button className="add-stock-btn">
                  <FaPlusCircle /> Add Stock
                </button>
              </div>
              
              <div className="watchlist-table-container">
                <table className="watchlist-table">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Change</th>
                      <th>Alerts</th>
                      <th>AI Alerts</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchlist.map(stock => (
                      <tr key={stock.id}>
                        <td className="symbol-cell">{stock.symbol}</td>
                        <td>{stock.name}</td>
                        <td>${stock.price.toFixed(2)}</td>
                        <td className={stock.change >= 0 ? 'positive-change' : 'negative-change'}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                        </td>
                        <td>
                          {Object.entries(stock.alerts).map(([type, value]) => {
                            if (type === 'aiEnabled') return null;
                            return (
                              <div key={type} className="alert-badge">
                                {type === 'price' && `Price ${value > stock.price ? '>' : '<'} $${value}`}
                                {type === 'volume' && `Volume > ${value.toLocaleString()}`}
                                {type === 'rsi' && `RSI ${value < 30 ? '<' : '>'} ${value}`}
                                {type === 'macd' && `MACD Cross`}
                              </div>
                            );
                          })}
                          <button className="add-alert-btn">
                            <FaPlusCircle /> Alert
                          </button>
                        </td>
                        <td>
                          <div 
                            className={`ai-toggle ${stock.alerts.aiEnabled ? 'enabled' : 'disabled'}`}
                            onClick={() => toggleAIAlert(stock.id)}
                          >
                            <div className="toggle-slider"></div>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons-container">
                            <button className="watchlist-alerts-btn" title="Alerts">
                              {/* Inline bell SVG */}
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24">
                                <path d="M256 512c35.3 0 64-28.7 64-64H192c0 35.3 28.7 64 64 64zm215.4-149.1c-20.9-21.1-55.5-52.6-55.5-154.9 0-77.7-54.5-139.1-127.9-155.2V32c0-17.7-14.3-32-32-32s-32 14.3-32 32v20.8C150.6 68.9 96 130.3 96 208c0 102.3-34.6 133.8-55.5 154.9-6 6.1-8.5 14.3-6.8 22.4 1.7 8.1 7.6 14.6 15.7 16.7C62.3 404.6 109.6 416 256 416s193.7-11.4 206.6-14.1c8.1-2.1 14-8.6 15.7-16.7 1.7-8.1-0.8-16.3-6.9-22.3z"/>
                              </svg>
                              <span>Alerts</span>
                            </button>
                            <button 
                              className="watchlist-remove-btn" 
                              title="Remove" 
                              onClick={() => removeFromWatchlist(stock.id)}
                            >
                              {/* Inline delete SVG */}
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24">
                                <path d="M432 32H320l-9.4-18.7A24 24 0 0 0 288 0H224a24 24 0 0 0-22.6 13.3L192 32H80a16 16 0 0 0 0 32h16v400a48 48 0 0 0 48 48h224a48 48 0 0 0 48-48V64h16a16 16 0 0 0 0-32zM96 464V64h320v400a16 16 0 0 1-16 16H112a16 16 0 0 1-16-16zm64-336a16 16 0 0 1 16-16h160a16 16 0 0 1 16 16v16H160zm32 64a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v224a16 16 0 0 1-16 16h-64a16 16 0 0 1-16-16z"/>
                              </svg>
                              <span>Remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="alert-types-info">
                <h4>Available Alert Types</h4>
                <div className="alert-types-grid">
                  <div className="alert-type-card">
                    <div className="alert-type-icon"><FaChartLine /></div>
                    <div className="alert-type-name">Price Alert</div>
                    <div className="alert-type-desc">Get notified when price crosses your target</div>
                  </div>
                  <div className="alert-type-card">
                    <div className="alert-type-icon"><FaExchangeAlt /></div>
                    <div className="alert-type-name">Volume Alert</div>
                    <div className="alert-type-desc">Alert when trading volume exceeds threshold</div>
                  </div>
                  <div className="alert-type-card">
                    <div className="alert-type-icon"><FaArrowUp /></div>
                    <div className="alert-type-name">Technical Indicators</div>
                    <div className="alert-type-desc">RSI, MACD, and other indicator alerts</div>
                  </div>
                  <div className="alert-type-card premium">
                    <div className="alert-type-icon"><FaRobot /></div>
                    <div className="alert-type-name">AI Prediction Alerts</div>
                    <div className="alert-type-desc">Get AI-powered trading recommendations</div>
                    <div className="premium-badge">Pro & Elite</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="security-section">
              <h3><FaLock /> Security Settings</h3>
              
              <div className="security-options-grid">
                <div className="security-option">
                  <div className="security-info">
                    <h4>Password</h4>
                    <p>Last changed: 30 days ago</p>
                  </div>
                  <button className="change-button">Change Password</button>
                </div>
                
                <div className="security-option">
                  <div className="security-info">
                    <h4>Two-Factor Authentication</h4>
                    <p>Status: Not Enabled</p>
                  </div>
                  <button className="enable-button">Enable 2FA</button>
                </div>
                
                <div className="security-option">
                  <div className="security-info">
                    <h4>Login History</h4>
                    <p>Track your account sign-ins</p>
                  </div>
                  <button className="view-button">View History</button>
                </div>
                
                <div className="security-option">
                  <div className="security-info">
                    <h4>Active Sessions</h4>
                    <p>You have 2 active sessions</p>
                  </div>
                  <button className="logout-button">
                    <FaSignOutAlt /> Logout All Sessions
                  </button>
                </div>
                
                <div className="security-option">
                  <div className="security-info">
                    <h4>Account Deletion</h4>
                    <p>Permanently delete your account and data</p>
                  </div>
                  <button className="delete-button">
                    <FaTrash /> Delete Account
                  </button>
                </div>
              </div>
              
              <div className="broker-connections">
                <h3><FaLink /> Connected Broker Accounts</h3>
                <div className="brokers-list">
                  {connectedBrokers.map(broker => (
                    <div key={broker.id} className="broker-item">
                      <div className="broker-info">
                        <div className="broker-name">{broker.name}</div>
                        <div className={`broker-status ${broker.status.toLowerCase()}`}>
                          {broker.status}
                        </div>
                        <div className="broker-sync">
                          Last synced: {broker.lastSync}
                        </div>
                      </div>
                      <button 
                        className={broker.status === 'Connected' ? 'disconnect-btn' : 'connect-btn'}
                        onClick={() => toggleBrokerConnection(broker.id)}
                      >
                        {broker.status === 'Connected' ? (
                          <><FaUnlink /> Disconnect</>
                        ) : (
                          <><FaLink /> Connect</>
                        )}
                      </button>
                    </div>
                  ))}
                  <div className="add-broker-container">
                    <button className="add-broker-btn">
                      <FaPlusCircle /> Connect New Broker
                    </button>
                  </div>
                </div>
                
                <div className="api-key-management">
                  <h4><FaKey /> API Token Management</h4>
                  <div className="api-key-info">
                    <p>Manage your API tokens for programmatic access to your trading data</p>
                    <button className="manage-keys-btn">Manage API Keys</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REFERRALS TAB */}
          {activeTab === 'referrals' && (
            <div className="referrals-section">
              <div className="referral-stats-card">
                <h3><FaUserFriends /> Your Referral Program</h3>
                
                <div className="referral-stats">
                  <div className="stat-item">
                    <div className="stat-value">${referralData.earnings.toFixed(2)}</div>
                    <div className="stat-label">Total Earnings</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{referralData.usersReferred}</div>
                    <div className="stat-label">Users Referred</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{referralData.pendingInvites}</div>
                    <div className="stat-label">Pending Invites</div>
                  </div>
                </div>
                
                <div className="referral-code-container">
                  <div className="referral-label">Your Referral Code</div>
                  <div className="referral-code-display">
                    <div className="referral-code">{referralData.code}</div>
                    <button className="copy-code-btn" title="Copy to clipboard">
                      <FaCopy />
                    </button>
                  </div>
                </div>
                
                <div className="referral-link-container">
                  <div className="referral-label">Your Referral Link</div>
                  <div className="referral-link-display">
                    <div className="referral-link">https://renx.ai/ref/{referralData.code}</div>
                    <button className="copy-link-btn" title="Copy to clipboard">
                      <FaCopy />
                    </button>
                  </div>
                </div>
                
                <div className="referral-share-options">
                  <div className="share-label">Share Your Referral</div>
                  <div className="share-buttons">
                    <button className="share-btn email">
                      <FaEnvelope /> Email
                    </button>
                    <button className="share-btn twitter">
                      <FaShareAlt /> Twitter
                    </button>
                    <button className="share-btn facebook">
                      <FaShareAlt /> Facebook
                    </button>
                    <button className="share-btn whatsapp">
                      <FaShareAlt /> WhatsApp
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="referral-rewards-info">
                <h3>How Referrals Work</h3>
                <div className="rewards-steps">
                  <div className="reward-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Share Your Code</h4>
                      <p>Invite friends using your unique referral code or link</p>
                    </div>
                  </div>
                  <div className="reward-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Friends Sign Up</h4>
                      <p>When they create an account using your code</p>
                    </div>
                  </div>
                  <div className="reward-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Earn Rewards</h4>
                      <p>Get $25 when they subscribe to any paid plan</p>
                    </div>
                  </div>
                </div>
                
                <div className="referral-terms">
                  <h4>Referral Program Terms</h4>
                  <p>Both you and your friend will receive 1 month of free Pro access when they sign up using your referral code and subscribe to a paid plan. There's no limit to how many friends you can refer!</p>
                </div>
              </div>
            </div>
          )}

          {/* AI TRAINING TAB */}
          {activeTab === 'ai-training' && (
            <div className="ai-training-section">
              <div className="section-header">
                <h3><FaHistory /> AI Training History</h3>
                <div className="info-tooltip">
                  <FaInfoCircle />
                  <div className="tooltip-content">
                    See how AI learns from your trading behavior and help improve it with your feedback
                  </div>
                </div>
              </div>
              
              <div className="ai-training-timeline">
                {aiTrainingHistory.map(item => (
                  <div key={item.id} className="timeline-item">
                    <div className="timeline-date">{item.date}</div>
                    <div className="timeline-content">
                      <div className="training-action">{item.action}</div>
                      <div className="training-description">{item.description}</div>
                      
                      <div className="feedback-container">
                        {item.feedback === null ? (
                          <>
                            <div className="feedback-prompt">Was this helpful?</div>
                            <div className="feedback-buttons">
                              <button 
                                className="feedback-btn positive" 
                                onClick={() => provideFeedback(item.id, 'positive')}
                              >
                                <FaThumbsUp /> Yes
                              </button>
                              <button 
                                className="feedback-btn negative" 
                                onClick={() => provideFeedback(item.id, 'negative')}
                              >
                                <FaThumbsDown /> No
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className={`feedback-result ${item.feedback}`}>
                            {item.feedback === 'positive' ? (
                              <><FaThumbsUp /> You found this helpful</>
                            ) : (
                              <><FaThumbsDown /> You didn't find this helpful</>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="ai-insights-card">
                <h3><FaLightbulb /> AI Insights From Your Trading</h3>
                <div className="insights-content">
                  <div className="insight-item">
                    <div className="insight-icon"><FaChartLine /></div>
                    <div className="insight-text">
                      <h4>Pattern Recognition</h4>
                      <p>AI has identified that you tend to prefer momentum-based trading strategies with mid-cap stocks.</p>
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon"><FaExchangeAlt /></div>
                    <div className="insight-text">
                      <h4>Risk Analysis</h4>
                      <p>Based on your trading history, your risk tolerance appears to be moderate. AI has adjusted its recommendations accordingly.</p>
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon"><FaSlidersH /></div>
                    <div className="insight-text">
                      <h4>Performance Optimization</h4>
                      <p>AI suggests focusing more on tech sector stocks based on your past success patterns.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
