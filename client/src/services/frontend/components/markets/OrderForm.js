import React, { useState } from 'react';
import { orderbookAPI } from '../../../../services/apiConfig';
import { toast } from 'react-toastify';

const OrderForm = ({ symbol, currentPrice }) => {
  const [activeTab, setActiveTab] = useState('market');
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(currentPrice);
  const [leverage, setLeverage] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle order submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    const order = {
      symbol,
      type: orderType,
      side,
      amount: parseFloat(amount) || 0,
      price: orderType === 'market' ? currentPrice : (parseFloat(price) || currentPrice),
      leverage
    };
    
    // Validate inputs
    if (!order.amount || order.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (orderType !== 'market' && (!order.price || order.price <= 0)) {
      toast.error('Please enter a valid price');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Send order to API
      await orderbookAPI.placeOrder(order);
      
      // Show success notification
      toast.success(`${side === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`);
      
      // Reset form
      setAmount('');
      setPrice(currentPrice);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate estimated cost
  const calculateCost = () => {
    const amountValue = parseFloat(amount) || 0;
    const priceValue = orderType === 'market' ? currentPrice : (parseFloat(price) || currentPrice);
    
    return (amountValue * priceValue / leverage).toFixed(2);
  };
  
  // Leverage options
  const leverageOptions = [2, 5, 10, 15, 20, 25, 50, 100];
  
  // Handle buy order
  const handleBuy = (e) => {
    e.preventDefault();
    setSide('buy');
    handleSubmit(e);
  };
  
  // Handle sell order
  const handleSell = (e) => {
    e.preventDefault();
    setSide('sell');
    handleSubmit(e);
  };
  
  return (
    <div className="order-form">
      <div className="order-tabs">
        <div 
          className={`order-tab ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => { setActiveTab('market'); setOrderType('market'); }}
        >
          Market
        </div>
        <div 
          className={`order-tab ${activeTab === 'limit' ? 'active' : ''}`}
          onClick={() => { setActiveTab('limit'); setOrderType('limit'); }}
        >
          Limit
        </div>
        <div 
          className={`order-tab ${activeTab === 'trigger' ? 'active' : ''}`}
          onClick={() => { setActiveTab('trigger'); setOrderType('trigger'); }}
        >
          Trigger
        </div>
      </div>
      
      <form>
        {/* Order Type Selection for Limit/Trigger tabs */}
        {activeTab !== 'market' && (
          <div className="order-type-selector">
            <button 
              type="button"
              className={`order-type-btn ${orderType === 'limit' ? 'active' : ''}`}
              onClick={() => setOrderType('limit')}
            >
              Limit
            </button>
            <button 
              type="button"
              className={`order-type-btn ${orderType === 'stop' ? 'active' : ''}`}
              onClick={() => setOrderType('stop')}
            >
              Stop
            </button>
            <button 
              type="button"
              className={`order-type-btn ${orderType === 'trailingStop' ? 'active' : ''}`}
              onClick={() => setOrderType('trailingStop')}
            >
              Trailing Stop
            </button>
          </div>
        )}
        
        {/* Leverage Selector */}
        <div className="form-group">
          <label>Leverage</label>
          <div className="leverage-slider">
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={leverage} 
              onChange={(e) => setLeverage(parseInt(e.target.value))} 
            />
            <div className="leverage-value">{leverage}x</div>
          </div>
          <div className="leverage-options">
            {leverageOptions.map(option => (
              <button 
                key={option}
                type="button"
                className={`leverage-option ${leverage === option ? 'active' : ''}`}
                onClick={() => setLeverage(option)}
              >
                {option}x
              </button>
            ))}
          </div>
        </div>
        
        {/* Amount input */}
        <div className="form-group">
          <label>Amount</label>
          <div className="input-with-addon">
            <input 
              type="text" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="0.00"
            />
            <div className="input-addon">
              <span>{symbol.split('-')[0]}</span>
            </div>
          </div>
          <div className="amount-shortcuts">
            <button type="button" onClick={() => setAmount((parseFloat(amount) || 0) + 0.1)}>+0.1</button>
            <button type="button" onClick={() => setAmount((parseFloat(amount) || 0) + 0.5)}>+0.5</button>
            <button type="button" onClick={() => setAmount((parseFloat(amount) || 0) + 1)}>+1</button>
            <button type="button" onClick={() => setAmount((parseFloat(amount) || 0) + 5)}>+5</button>
          </div>
        </div>
        
        {/* Price input (for limit/trigger orders) */}
        {orderType !== 'market' && (
          <div className="form-group">
            <label>Price</label>
            <div className="input-with-addon">
              <input 
                type="text" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                placeholder={currentPrice.toString()}
              />
              <div className="input-addon">
                <span>{symbol.split('-')[1]}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Order summary */}
        <div className="order-summary">
          <div className="summary-row">
            <span>Estimated Cost:</span>
            <span>{calculateCost()} {symbol.split('-')[1]}</span>
          </div>
          <div className="summary-row">
            <span>Fee:</span>
            <span>0.05%</span>
          </div>
        </div>
        
        {/* Submit buttons */}
        <div className="buy-sell-buttons">
          <button 
            type="button" 
            className="buy-btn"
            onClick={handleBuy}
            disabled={isSubmitting}
          >
            {isSubmitting && side === 'buy' ? 'Processing...' : 'Buy / Long'}
          </button>
          <button 
            type="button" 
            className="sell-btn"
            onClick={handleSell}
            disabled={isSubmitting}
          >
            {isSubmitting && side === 'sell' ? 'Processing...' : 'Sell / Short'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm; 