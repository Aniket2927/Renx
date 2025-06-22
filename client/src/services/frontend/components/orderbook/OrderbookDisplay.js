import React from 'react';

const OrderbookDisplay = ({ orderbook, userOrders, onCancelOrder }) => {
  const { bids = [], asks = [] } = orderbook;
  
  const isUserOrder = (order) => {
    return userOrders.some(userOrder => userOrder._id === order._id);
  };
  
  return (
    <div className="orderbook-display">
      <div className="orderbook-header">
        <div className="orderbook-title">
          <h3>Orderbook</h3>
        </div>
        <div className="orderbook-column-labels">
          <div className="price-label">Price (USD)</div>
          <div className="amount-label">Amount</div>
          <div className="total-label">Total (USD)</div>
        </div>
      </div>
      
      <div className="orderbook-content">
        <div className="asks-container">
          {asks.slice().reverse().map((ask) => (
            <div 
              key={ask._id} 
              className={`orderbook-row ask-row ${isUserOrder(ask) ? 'user-order' : ''}`}
            >
              <div className="price sell">${ask.price.toFixed(2)}</div>
              <div className="amount">{ask.amount}</div>
              <div className="total">${(ask.price * ask.amount).toFixed(2)}</div>
              {isUserOrder(ask) && (
                <button 
                  className="cancel-order-btn"
                  onClick={() => onCancelOrder(ask._id)}
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="spread">
          <div className="spread-label">
            Spread: ${calculateSpread(bids, asks).toFixed(2)} (
            {calculateSpreadPercentage(bids, asks).toFixed(2)}%)
          </div>
        </div>
        
        <div className="bids-container">
          {bids.map((bid) => (
            <div 
              key={bid._id} 
              className={`orderbook-row bid-row ${isUserOrder(bid) ? 'user-order' : ''}`}
            >
              <div className="price buy">${bid.price.toFixed(2)}</div>
              <div className="amount">{bid.amount}</div>
              <div className="total">${(bid.price * bid.amount).toFixed(2)}</div>
              {isUserOrder(bid) && (
                <button 
                  className="cancel-order-btn"
                  onClick={() => onCancelOrder(bid._id)}
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper functions to calculate spread
const calculateSpread = (bids, asks) => {
  if (bids.length === 0 || asks.length === 0) return 0;
  
  const highestBid = bids[0].price;
  const lowestAsk = asks[0].price;
  
  return lowestAsk - highestBid;
};

const calculateSpreadPercentage = (bids, asks) => {
  if (bids.length === 0 || asks.length === 0) return 0;
  
  const highestBid = bids[0].price;
  const lowestAsk = asks[0].price;
  const spread = lowestAsk - highestBid;
  
  return (spread / lowestAsk) * 100;
};

export default OrderbookDisplay; 