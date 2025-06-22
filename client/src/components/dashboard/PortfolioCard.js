import React from 'react';

const PortfolioCard = ({ data }) => {
  const { value, change, changeAmount } = data;
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-gray-500 text-sm font-medium mb-2">Portfolio Value</h3>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold">${value.toLocaleString()}</span>
        <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{change}%
        </span>
      </div>
      <div className="mt-2">
        <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}${changeAmount.toLocaleString()}
        </span>
        <span className="text-gray-500 text-sm ml-1">today</span>
      </div>
    </div>
  );
};

export default PortfolioCard; 