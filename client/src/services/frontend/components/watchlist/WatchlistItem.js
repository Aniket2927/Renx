import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';

const WatchlistItem = ({ symbol, priceData, onRemove }) => {
  if (!priceData) {
    return (
      <tr className="watchlist-table-row">
        <td>{symbol}</td>
        <td colSpan={6} style={{ color: '#888', textAlign: 'center' }}>Loading...</td>
      </tr>
    );
  }
  return (
    <tr className="watchlist-table-row">
      <td>{symbol}</td>
      <td>{priceData.name}</td>
      <td>${priceData.price?.toLocaleString() ?? '-'}</td>
      <td style={{ color: priceData.change >= 0 ? '#2ecc71' : '#e74c3c' }}>
        {priceData.change >= 0 ? '+' : ''}{priceData.change?.toFixed(2) ?? '-'}%
      </td>
      <td>${priceData.high?.toLocaleString() ?? '-'}</td>
      <td>${priceData.low?.toLocaleString() ?? '-'}</td>
      <td>
        <Link to={`/orderbook/${symbol}`} className="trade-btn" style={{ marginRight: 8 }}>
          Trade
        </Link>
        <button 
          className="remove-btn" 
          onClick={() => onRemove(symbol)}
          title="Remove from watchlist"
        >
          <FaTrash />
        </button>
      </td>
    </tr>
  );
};

export default WatchlistItem; 