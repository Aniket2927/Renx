import React from 'react';

const WatchlistTable = ({ data, onSelectSymbol, selectedSymbol }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Watchlist</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="pb-3">Symbol</th>
              <th className="pb-3">Price</th>
              <th className="pb-3">Change</th>
              <th className="pb-3">Volume</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className={`text-sm hover:bg-blue-50 cursor-pointer ${selectedSymbol === item.symbol ? 'bg-blue-100 font-bold' : ''}`}
                onClick={() => onSelectSymbol && onSelectSymbol(item.symbol)}
              >
                <td className="py-3 font-medium">{item.symbol}</td>
                <td className="py-3">${item.price?.toFixed(2) ?? '-'}</td>
                <td className={`py-3 ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.change >= 0 ? '+' : ''}{item.change?.toFixed(2) ?? '-'}%
                </td>
                <td className="py-3 text-gray-500">{item.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WatchlistTable; 