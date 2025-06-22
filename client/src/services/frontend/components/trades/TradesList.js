import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const TradesList = ({ trades, onEdit, onDelete }) => {
  if (!trades || trades.length === 0) {
    return <p className="no-data">No trades found.</p>;
  }
  
  return (
    <div className="trades-list">
      <table className="trades-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Price</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade._id}>
              <td>{trade.symbol}</td>
              <td className={trade.type}>{trade.type.toUpperCase()}</td>
              <td>{trade.amount}</td>
              <td>${trade.price.toFixed(2)}</td>
              <td>${(trade.amount * trade.price).toFixed(2)}</td>
              <td>
                <span className={`status-badge ${trade.status}`}>
                  {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                </span>
              </td>
              <td>{new Date(trade.createdAt).toLocaleDateString()}</td>
              <td className="actions">
                <button 
                  className="edit-btn" 
                  onClick={() => onEdit(trade)}
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button 
                  className="delete-btn" 
                  onClick={() => onDelete(trade._id)}
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradesList; 