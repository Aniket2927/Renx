import React from 'react';

const PortfolioCard = ({ data, isLoading = false, error = null }) => {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="trading-card fade-in">
        <h3 className="caption mb-2">Portfolio Value</h3>
        <div className="flex items-baseline space-x-2">
          <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-32 rounded"></div>
          <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-4 w-16 rounded"></div>
        </div>
        <div className="mt-2">
          <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-4 w-24 rounded"></div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="trading-card fade-in">
        <h3 className="caption mb-2">Portfolio Value</h3>
        <div className="flex items-center space-x-2 text-red-500">
          <span className="text-sm">Error loading portfolio data</span>
        </div>
        <div className="mt-2">
          <span className="body-small text-muted-foreground">Please try refreshing</span>
        </div>
      </div>
    );
  }

  // Handle missing data
  if (!data) {
    return (
      <div className="trading-card fade-in">
        <h3 className="caption mb-2">Portfolio Value</h3>
        <div className="flex items-baseline space-x-2">
          <span className="heading-2">$0.00</span>
          <span className="caption text-muted-foreground">0.00%</span>
        </div>
        <div className="mt-2">
          <span className="body-small text-muted-foreground">No portfolio data</span>
        </div>
      </div>
    );
  }

  const { value = 0, change = 0, changeAmount = 0 } = data;
  const isPositive = change >= 0;

  // Format values safely
  const formatValue = (val) => {
    if (typeof val !== 'number' || isNaN(val)) return '0.00';
    return val.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatPercent = (val) => {
    if (typeof val !== 'number' || isNaN(val)) return '0.00';
    return val.toFixed(2);
  };

  return (
    <div className="trading-card fade-in">
      <h3 className="caption mb-2">Portfolio Value</h3>
      <div className="flex items-baseline space-x-2">
        <span className="heading-2">${formatValue(value)}</span>
        <span className={`caption ${isPositive ? 'price-positive' : 'price-negative'}`}>
          {isPositive ? '+' : ''}{formatPercent(change)}%
        </span>
      </div>
      <div className="mt-2">
        <span className={`body-base ${isPositive ? 'price-positive' : 'price-negative'}`}>
          {isPositive ? '+' : ''}${formatValue(changeAmount)}
        </span>
        <span className="body-small ml-1">today</span>
      </div>
    </div>
  );
};

export default PortfolioCard; 