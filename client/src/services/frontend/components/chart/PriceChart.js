import React from 'react';

const PriceChart = ({ symbol }) => {
  // This is a placeholder component - in a real application, 
  // you would use a charting library like Chart.js, recharts, or lightweight-charts
  
  return (
    <div className="price-chart-container">
      <div className="chart-header">
        <h3>{symbol} Price Chart</h3>
        <div className="chart-period">
          <button className="period-btn active">1D</button>
          <button className="period-btn">1W</button>
          <button className="period-btn">1M</button>
          <button className="period-btn">3M</button>
          <button className="period-btn">1Y</button>
          <button className="period-btn">All</button>
        </div>
      </div>
      <div className="chart-content">
        <div className="mock-chart">
          <svg width="100%" height="200" viewBox="0 0 800 200">
            {/* This is a dummy SVG path that looks like a price chart */}
            <path
              d={`M 0 150 
                  Q 50 120, 100 130 
                  T 200 110 
                  Q 250 80, 300 100 
                  T 400 70 
                  Q 450 40, 500 60 
                  T 600 50 
                  Q 650 70, 700 60 
                  T 800 50`}
              fill="none"
              stroke={symbol === 'BTC' ? '#f7931a' : symbol === 'ETH' ? '#627eea' : '#3cb054'}
              strokeWidth="2"
            />
            {/* Area under the line */}
            <path
              d={`M 0 150 
                  Q 50 120, 100 130 
                  T 200 110 
                  Q 250 80, 300 100 
                  T 400 70 
                  Q 450 40, 500 60 
                  T 600 50 
                  Q 650 70, 700 60 
                  T 800 50
                  L 800 200 L 0 200 Z`}
              fill={`url(#${symbol}Gradient)`}
              opacity="0.2"
            />
            {/* Define gradient */}
            <defs>
              <linearGradient id={`${symbol}Gradient`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={
                  symbol === 'BTC' ? '#f7931a' : 
                  symbol === 'ETH' ? '#627eea' : 
                  '#3cb054'
                } />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="price-info">
          <div className="current-price">
            ${symbol === 'BTC' ? '42,371.25' : symbol === 'ETH' ? '2,274.68' : '147.32'}
          </div>
          <div className={`price-change ${symbol === 'ETH' ? 'negative' : 'positive'}`}>
            {symbol === 'ETH' ? '-1.2%' : symbol === 'BTC' ? '+2.5%' : '+5.7%'} (24h)
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceChart; 