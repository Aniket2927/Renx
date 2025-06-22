import React from 'react';
import { Link } from 'react-router-dom';

const MarketOverview = () => {
  // This would typically come from an API
  const marketData = [
    { symbol: 'BTC', name: 'Bitcoin', price: 42371.25, change: 2.5 },
    { symbol: 'ETH', name: 'Ethereum', price: 2274.68, change: -1.2 },
    { symbol: 'SOL', name: 'Solana', price: 147.32, change: 5.7 },
    { symbol: 'ADA', name: 'Cardano', price: 0.41, change: -0.8 }
  ];
  
  return (
    <div className="market-overview-container">
      <h3>Market Overview</h3>
      
      <div className="market-list">
        {marketData.map((item) => (
          <div key={item.symbol} className="market-item">
            <div className="market-symbol">
              <span className="symbol">{item.symbol}</span>
              <span className="name">{item.name}</span>
            </div>
            <div className="market-price">
              <span className="price">${item.price.toLocaleString()}</span>
              <span className={`change ${item.change >= 0 ? 'positive' : 'negative'}`}>
                {item.change >= 0 ? '+' : ''}{item.change}%
              </span>
            </div>
            <Link to={`/orderbook/${item.symbol}`} className="view-market-btn">
              Trade
            </Link>
          </div>
        ))}
      </div>
      
      <div className="market-footer">
        <Link to="/markets" className="view-all-markets">View All Markets</Link>
      </div>
    </div>
  );
};

export default MarketOverview; 