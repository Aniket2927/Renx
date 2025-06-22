import React, { useState, useEffect } from 'react';

const TradeHistory = ({ symbol }) => {
  const [activeTab, setActiveTab] = useState('trades');
  const [trades, setTrades] = useState([]);
  
  // Generate mock trade data
  useEffect(() => {
    // Generate random mock trades
    const generateMockTrades = () => {
      const mockTrades = [];
      const basePrice = symbol.includes('BTC') ? 57000 : 
                        symbol.includes('ETH') ? 1650 : 
                        symbol.includes('SOL') ? 145 : 100;
      
      // Generate 20 random trades
      for (let i = 0; i < 20; i++) {
        const priceVariation = (Math.random() - 0.5) * 0.01; // -0.5% to +0.5%
        const price = basePrice * (1 + priceVariation);
        const amount = Math.random() * 2 + 0.1; // 0.1 to 2.1 units
        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        const time = new Date(Date.now() - i * 30000); // every 30 seconds
        
        mockTrades.push({
          id: `trade-${i}`,
          price,
          amount,
          side,
          time,
          total: price * amount
        });
      }
      
      return mockTrades;
    };
    
    setTrades(generateMockTrades());
    
    // Simulate new trades coming in
    const interval = setInterval(() => {
      const newTrade = {
        id: `trade-${Date.now()}`,
        price: symbol.includes('BTC') ? 57000 * (1 + (Math.random() - 0.5) * 0.005) : 
               symbol.includes('ETH') ? 1650 * (1 + (Math.random() - 0.5) * 0.005) : 
               symbol.includes('SOL') ? 145 * (1 + (Math.random() - 0.5) * 0.005) : 
               100 * (1 + (Math.random() - 0.5) * 0.005),
        amount: Math.random() * 2 + 0.1,
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        time: new Date(),
        total: 0 // will be calculated
      };
      
      newTrade.total = newTrade.price * newTrade.amount;
      
      setTrades(prevTrades => [newTrade, ...prevTrades.slice(0, 19)]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [symbol]);
  
  // Format time
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
  
  return (
    <div className="trade-history">
      <div className="trade-history-header">
        <h3>Market Trades</h3>
        <div className="history-tabs">
          <div 
            className={`history-tab ${activeTab === 'trades' ? 'active' : ''}`}
            onClick={() => setActiveTab('trades')}
          >
            Trades
          </div>
          <div 
            className={`history-tab ${activeTab === 'depth' ? 'active' : ''}`}
            onClick={() => setActiveTab('depth')}
          >
            Depth
          </div>
        </div>
      </div>
      
      {activeTab === 'trades' && (
        <div className="history-list">
          {trades.map(trade => (
            <div key={trade.id} className="history-item">
              <div className={`history-price ${trade.side}`}>
                {trade.price.toFixed(2)}
              </div>
              <div className="history-amount">
                {trade.amount.toFixed(4)}
              </div>
              <div className="history-time">
                {formatTime(trade.time)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activeTab === 'depth' && (
        <div className="depth-view">
          <div className="depth-header">
            <div>Price ({symbol.split('-')[1]})</div>
            <div>Size ({symbol.split('-')[0]})</div>
            <div>Total</div>
          </div>
          
          <div className="depth-sells">
            {Array(8).fill(0).map((_, i) => {
              const basePrice = symbol.includes('BTC') ? 57000 : 
                              symbol.includes('ETH') ? 1650 : 
                              symbol.includes('SOL') ? 145 : 100;
              const price = basePrice * (1 + (i + 1) * 0.001);
              const amount = Math.random() * 5 + 0.5;
              return (
                <div key={`sell-${i}`} className="depth-row sell">
                  <div className="depth-price">{price.toFixed(2)}</div>
                  <div className="depth-amount">{amount.toFixed(4)}</div>
                  <div className="depth-total">{(price * amount).toFixed(2)}</div>
                  <div className="depth-bar" style={{ width: `${amount * 10}%` }}></div>
                </div>
              );
            })}
          </div>
          
          <div className="depth-current-price">
            <div>{symbol.includes('BTC') ? 57000 : 
                 symbol.includes('ETH') ? 1650 : 
                 symbol.includes('SOL') ? 145 : 100}</div>
          </div>
          
          <div className="depth-buys">
            {Array(8).fill(0).map((_, i) => {
              const basePrice = symbol.includes('BTC') ? 57000 : 
                              symbol.includes('ETH') ? 1650 : 
                              symbol.includes('SOL') ? 145 : 100;
              const price = basePrice * (1 - (i + 1) * 0.001);
              const amount = Math.random() * 5 + 0.5;
              return (
                <div key={`buy-${i}`} className="depth-row buy">
                  <div className="depth-price">{price.toFixed(2)}</div>
                  <div className="depth-amount">{amount.toFixed(4)}</div>
                  <div className="depth-total">{(price * amount).toFixed(2)}</div>
                  <div className="depth-bar" style={{ width: `${amount * 10}%` }}></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeHistory; 