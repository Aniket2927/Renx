import React from 'react';

const PortfolioCard = ({ data }) => {
  const { value, change, changeAmount } = data;
  const isPositive = change >= 0;

  return (
    <div className="trading-card fade-in">
      <h3 className="caption mb-2">Portfolio Value</h3>
      <div className="flex items-baseline space-x-2">
        <span className="heading-2">${value.toLocaleString()}</span>
        <span className={`caption ${isPositive ? 'price-positive' : 'price-negative'}`}>
          {isPositive ? '+' : ''}{change}%
        </span>
      </div>
      <div className="mt-2">
        <span className={`body-base ${isPositive ? 'price-positive' : 'price-negative'}`}>
          {isPositive ? '+' : ''}${changeAmount.toLocaleString()}
        </span>
        <span className="body-small ml-1">today</span>
      </div>
    </div>
  );
};

export default PortfolioCard; 