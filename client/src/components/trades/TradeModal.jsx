import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaTimes, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const tradeSchema = Yup.object().shape({
  amount: Yup.number()
    .positive('Amount must be positive')
    .required('Amount is required'),
  price: Yup.number()
    .positive('Price must be positive')
    .required('Price is required')
});

const TradeModal = ({ isOpen, onClose, asset, signalType, price }) => {
  const [orderStatus, setOrderStatus] = useState(null);
  
  if (!isOpen) return null;
  
  // Parse currency symbol from asset (e.g., "BTC/USD" -> "BTC")
  const symbol = asset.split('/')[0];
  
  // Format price for display
  const formattedPrice = parseFloat(price.replace(/,/g, '')).toFixed(2);
  
  const initialValues = {
    asset,
    price: formattedPrice,
    amount: '',
    type: signalType // 'buy' or 'sell'
  };
  
  const handleSubmit = (values, { setSubmitting }) => {
    // Simulate API call to place order
    setTimeout(() => {
      console.log('Placing order:', values);
      // Show success message
      setOrderStatus({
        success: true,
        message: `Successfully placed ${values.type} order for ${values.amount} ${symbol} at $${values.price}`
      });
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
        setOrderStatus(null);
      }, 3344);
      
      setSubmitting(false);
    }, 1000);
  };
  
  return (
    <div className="modal">
      <div className="modal-content trade-modal">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="modal-header">
          <h3>
            {signalType === 'buy' ? (
              <span className="buy-action"><FaArrowUp /> Buy {symbol}</span>
            ) : signalType === 'sell' ? (
              <span className="sell-action"><FaArrowDown /> Sell {symbol}</span>
            ) : (
              <span>Trade {symbol}</span>
            )}
          </h3>
          <p className="modal-subtitle">Execute AI-recommended trade</p>
        </div>
        
        {orderStatus ? (
          <div className={`order-status ${orderStatus.success ? 'success' : 'error'}`}>
            <p>{orderStatus.message}</p>
          </div>
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={tradeSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values }) => (
              <Form className="trade-form">
                <div className="form-group">
                  <label htmlFor="asset">Asset</label>
                  <Field
                    type="text"
                    name="asset"
                    id="asset"
                    disabled
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="price">Price (USD)</label>
                  <Field
                    type="number"
                    name="price"
                    id="price"
                    step="0.01"
                    min="0"
                  />
                  <ErrorMessage name="price" component="div" className="error-message" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="amount">Amount ({symbol})</label>
                  <Field
                    type="number"
                    name="amount"
                    id="amount"
                    step="0.0001"
                    min="0"
                  />
                  <ErrorMessage name="amount" component="div" className="error-message" />
                </div>
                
                <div className="form-group">
                  <label>Total: ${(values.amount * values.price).toFixed(2)}</label>
                </div>
                
                <div className="trade-summary">
                  <div className="summary-item">
                    <span className="summary-label">Signal Type:</span>
                    <span className={`summary-value ${signalType}`}>
                      {signalType.toUpperCase()}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Order Type:</span>
                    <span className="summary-value">Market</span>
                  </div>
                </div>
                
                <div className="form-buttons">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className={`submit-btn ${signalType === 'buy' ? 'buy-btn' : 'sell-btn'}`}
                  >
                    {isSubmitting ? 'Processing...' : `${signalType === 'buy' ? 'Buy' : 'Sell'} ${symbol}`}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default TradeModal; 