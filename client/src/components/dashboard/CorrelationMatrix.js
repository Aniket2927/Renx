import React from 'react';

const CorrelationMatrix = ({ symbols }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Correlation Matrix</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Symbol</th>
              {symbols.map(symbol => (
                <th key={symbol} className="px-4 py-2">{symbol}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {symbols.map(symbol => (
              <tr key={symbol}>
                <td className="px-4 py-2 font-semibold">{symbol}</td>
                {symbols.map(otherSymbol => (
                  <td key={`${symbol}-${otherSymbol}`} className="px-4 py-2">
                    {symbol === otherSymbol ? '1.00' : '0.00'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CorrelationMatrix; 