import React, { useState } from 'react';
import { 
  FaRobot, 
  FaCog, 
  FaChartArea, 
  FaEllipsisV,
  FaPlay,
  FaPause,
  FaTrash,
  FaPlus,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const TradingBots = () => {
  const [activeBot, setActiveBot] = useState(null);
  
  // Mock data for trading bots
  const bots = [
    {
      id: 1,
      name: 'Trend Following Bot',
      status: 'active',
      profit: '+12.3%',
      trades: 42,
      winRate: '67%',
      runtime: '12 days',
      description: 'Follows medium and long-term market trends with dynamic entry and exit points',
      strategy: 'momentum',
      riskLevel: 'medium'
    },
    {
      id: 2,
      name: 'Scalping Bot',
      status: 'paused',
      profit: '+5.7%',
      trades: 128,
      winRate: '58%',
      runtime: '7 days',
      description: 'Makes rapid small-profit trades based on minor price movements',
      strategy: 'scalping',
      riskLevel: 'high'
    },
    {
      id: 3,
      name: 'Conservative DCA',
      status: 'active',
      profit: '+3.2%',
      trades: 15,
      winRate: '73%',
      runtime: '21 days',
      description: 'Dollar cost averaging with focus on blue-chip assets',
      strategy: 'dca',
      riskLevel: 'low'
    }
  ];
  
  const getBotStatusColor = (status) => {
    switch(status) {
      case 'active': return '#2ecc71';
      case 'paused': return '#f1c40f';
      case 'stopped': return '#95a5a6';
      default: return '#e74c3c';
    }
  };
  
  const getRiskLevelColor = (level) => {
    switch(level) {
      case 'low': return '#2ecc71';
      case 'medium': return '#f1c40f';
      case 'high': return '#e74c3c';
      default: return '#95a5a6';
    }
  };
  
  const handleBotClick = (botId) => {
    setActiveBot(activeBot === botId ? null : botId);
  };
  
  return (
    <div className="trading-bots-widget">
      <div className="widget-header">
        <div className="widget-title">
          <FaRobot className="widget-icon" />
          <h3>Automated Trading Bots</h3>
        </div>
        
        <button className="create-bot-btn">
          <FaPlus />
          <span>New Bot</span>
        </button>
      </div>
      
      <div className="bots-list">
        {bots.map(bot => (
          <div 
            key={bot.id} 
            className={`bot-item ${activeBot === bot.id ? 'expanded' : ''}`}
            onClick={() => handleBotClick(bot.id)}
          >
            <div className="bot-header">
              <div className="bot-info">
                <div className="bot-name-status">
                  <h4>{bot.name}</h4>
                  <div 
                    className={`bot-status ${bot.status}`}
                    style={{ backgroundColor: getBotStatusColor(bot.status) }}
                  >
                    <span>{bot.status}</span>
                  </div>
                </div>
                <div className="bot-description">{bot.description}</div>
              </div>
              
              <div className="bot-stats">
                <div className="bot-stat">
                  <div className="stat-value profit">{bot.profit}</div>
                  <div className="stat-label">Profit</div>
                </div>
                
                <div className="bot-stat">
                  <div className="stat-value">{bot.trades}</div>
                  <div className="stat-label">Trades</div>
                </div>
                
                <div className="bot-stat">
                  <div className="stat-value">{bot.winRate}</div>
                  <div className="stat-label">Win Rate</div>
                </div>
              </div>
              
              <div className="bot-controls">
                {bot.status === 'active' ? (
                  <button className="bot-control-btn pause">
                    <FaPause />
                  </button>
                ) : (
                  <button className="bot-control-btn play">
                    <FaPlay />
                  </button>
                )}
                <button className="bot-control-btn settings">
                  <FaCog />
                </button>
                <button className="bot-control-btn more">
                  <FaEllipsisV />
                </button>
              </div>
            </div>
            
            {activeBot === bot.id && (
              <div className="bot-details">
                <div className="bot-details-section">
                  <div className="details-header">
                    <h5>Bot Settings</h5>
                  </div>
                  
                  <div className="bot-params">
                    <div className="param-item">
                      <div className="param-label">Strategy</div>
                      <div className="param-value">{bot.strategy}</div>
                    </div>
                    
                    <div className="param-item">
                      <div className="param-label">Risk Level</div>
                      <div 
                        className="param-value risk-level" 
                        style={{ color: getRiskLevelColor(bot.riskLevel) }}
                      >
                        {bot.riskLevel}
                      </div>
                    </div>
                    
                    <div className="param-item">
                      <div className="param-label">Running for</div>
                      <div className="param-value">{bot.runtime}</div>
                    </div>
                  </div>
                  
                  <div className="bot-actions">
                    <button className="bot-action-btn primary">
                      <FaChartArea />
                      <span>Performance</span>
                    </button>
                    
                    <button className="bot-action-btn secondary">
                      <FaCog />
                      <span>Settings</span>
                    </button>
                    
                    <button className="bot-action-btn danger">
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
                
                <div className="bot-details-section">
                  <div className="details-header">
                    <h5>Recent Trades</h5>
                  </div>
                  
                  <div className="recent-trades">
                    <div className="trade-item profit">
                      <div className="trade-asset">BTC/USD</div>
                      <div className="trade-type buy">BUY</div>
                      <div className="trade-price">$45,230.65</div>
                      <div className="trade-result">
                        <FaArrowUp className="up-arrow" />
                        <span>+2.3%</span>
                      </div>
                      <div className="trade-time">2 hours ago</div>
                    </div>
                    
                    <div className="trade-item loss">
                      <div className="trade-asset">ETH/USD</div>
                      <div className="trade-type sell">SELL</div>
                      <div className="trade-price">$3,120.45</div>
                      <div className="trade-result">
                        <FaArrowDown className="down-arrow" />
                        <span>-0.8%</span>
                      </div>
                      <div className="trade-time">5 hours ago</div>
                    </div>
                    
                    <div className="trade-item profit">
                      <div className="trade-asset">SOL/USD</div>
                      <div className="trade-type buy">BUY</div>
                      <div className="trade-price">$98.76</div>
                      <div className="trade-result">
                        <FaArrowUp className="up-arrow" />
                        <span>+4.1%</span>
                      </div>
                      <div className="trade-time">8 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="bots-summary">
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="stat-label">Active Bots</div>
            <div className="stat-value">2/3</div>
          </div>
          
          <div className="summary-stat">
            <div className="stat-label">Total Profit</div>
            <div className="stat-value profit">+7.8%</div>
          </div>
          
          <div className="summary-stat">
            <div className="stat-label">Monthly Trades</div>
            <div className="stat-value">185</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingBots; 