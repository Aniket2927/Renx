import React from 'react';

const TradeHistory = ({ trades }) => {
  if (!trades || trades.length === 0) {
    return <p className="no-data">No trade history available.</p>;
  }
  
  return (
    <div className="trade-history">
      <table className="trade-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade._id}>
              <td>{trade.symbol}</td>
              <td className={trade.type}>{trade.type.toUpperCase()}</td>
              <td>{trade.amount}</td>
              <td>${trade.price.toFixed(2)}</td>
              <td>
                <span className={`status-badge ${trade.status}`}>
                  {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradeHistory; 