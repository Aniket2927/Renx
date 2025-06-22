import React from 'react';

const PLCard = ({ data }) => {
  const { todayPL, percentage, isPositive } = data;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-gray-500 text-sm font-medium mb-2">Today's P/L</h3>
      <div className="flex items-baseline space-x-2">
        <span className={`text-3xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}${todayPL.toLocaleString()}
        </span>
        <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          ({isPositive ? '+' : ''}{percentage}%)
        </span>
      </div>
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(Math.abs(percentage) * 5, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PLCard; 