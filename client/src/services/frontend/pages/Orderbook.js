import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { orderbookAPI } from '../../api';
import OrderForm from '../components/orderbook/OrderForm';
import OrderbookDisplay from '../components/orderbook/OrderbookDisplay';
import PriceChart from '../components/chart/PriceChart';

import '../styles/Orderbook.css';

const Orderbook = ({ user }) => {
  const { symbol } = useParams();
  const [orderbook, setOrderbook] = useState({ bids: [], asks: [] });
  const [userOrders, setUserOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderType, setOrderType] = useState('buy');
  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    if (symbol) {
      fetchOrderbook();
    }
  }, [symbol]);

  useEffect(() => {
    if (orderbook.asks.length > 0 && orderbook.bids.length > 0) {
      const lowestAsk = orderbook.asks[0].price;
      const highestBid = orderbook.bids[0].price;
      setCurrentPrice((lowestAsk + highestBid) / 2);
    }
  }, [orderbook]);

  const fetchOrderbook = async () => {
    setIsLoading(true);
    try {
      const response = await orderbookAPI.get(symbol);
      setOrderbook(response.data);
      
      // Filter out user's orders
      const allOrders = [...response.data.bids, ...response.data.asks];
      const myOrders = allOrders.filter(
        order => order.userId === user.id
      );
      setUserOrders(myOrders);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching orderbook:', err);
      setError('Failed to load orderbook. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async (orderData) => {
    try {
      await orderbookAPI.placeOrder({
        ...orderData,
        symbol
      });
      fetchOrderbook();
      setShowOrderForm(false);
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderbookAPI.cancelOrder(orderId);
        fetchOrderbook();
      } catch (error) {
        console.error('Error cancelling order:', error);
      }
    }
  };

  if (isLoading && orderbook.bids.length === 0 && orderbook.asks.length === 0) {
    return <div className="loading">Loading orderbook...</div>;
  }

  return (
    <div className="orderbook-page">
      <div className="orderbook-header">
        <h1>{symbol} Orderbook</h1>
        <div className="price-info">
          <div className="current-price">${currentPrice.toFixed(2)}</div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="orderbook-container">
        <div className="chart-container">
          <PriceChart symbol={symbol} />
        </div>

        <div className="orderbook-actions">
          <h3>Place Order</h3>
          <div className="action-buttons">
            <button
              className={`order-btn buy-btn ${orderType === 'buy' ? 'active' : ''}`}
              onClick={() => {
                setOrderType('buy');
                setShowOrderForm(true);
              }}
            >
              Buy {symbol}
            </button>
            <button
              className={`order-btn sell-btn ${orderType === 'sell' ? 'active' : ''}`}
              onClick={() => {
                setOrderType('sell');
                setShowOrderForm(true);
              }}
            >
              Sell {symbol}
            </button>
          </div>

          {showOrderForm && (
            <OrderForm
              symbol={symbol}
              type={orderType}
              currentPrice={currentPrice}
              onSubmit={handlePlaceOrder}
              onCancel={() => setShowOrderForm(false)}
            />
          )}
        </div>

        <OrderbookDisplay
          orderbook={orderbook}
          userOrders={userOrders}
          onCancelOrder={handleCancelOrder}
        />
      </div>

      {userOrders.length > 0 && (
        <div className="user-orders">
          <h3>Your Open Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Price</th>
                <th>Amount</th>
                <th>Filled</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {userOrders.map((order) => (
                <tr key={order._id}>
                  <td className={order.type}>{order.type.toUpperCase()}</td>
                  <td>${order.price.toFixed(2)}</td>
                  <td>{order.amount}</td>
                  <td>{order.filledAmount}</td>
                  <td>{order.status}</td>
                  <td>
                    {order.status === 'open' && (
                      <button
                        className="cancel-btn"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate mid-market price
const calculateMidMarketPrice = (bids, asks) => {
  if (bids.length === 0 && asks.length === 0) {
    return 0;
  }

  const highestBid = bids.length > 0 ? bids[0].price : 0;
  const lowestAsk = asks.length > 0 ? asks[0].price : 0;

  if (highestBid === 0) return lowestAsk;
  if (lowestAsk === 0) return highestBid;

  return (highestBid + lowestAsk) / 2;
};

export default Orderbook; 