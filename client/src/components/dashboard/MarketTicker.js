import React from 'react';

const MarketTicker = ({ data = [] }) => {
  return (
    <div className="overflow-hidden">
      <div className="flex space-x-8 animate-ticker">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 whitespace-nowrap">
            <span className="font-medium">{item.symbol}</span>
            <span className="text-gray-600">${item.price?.toFixed(2) ?? '-'}</span>
            <span className={`${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}> 
              {item.change >= 0 ? '+' : ''}{item.change?.toFixed(2) ?? '-'}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker; 