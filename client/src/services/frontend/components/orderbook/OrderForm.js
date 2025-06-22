import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const orderSchema = Yup.object().shape({
  type: Yup.string().required('Type is required'),
  amount: Yup.number()
    .positive('Amount must be positive')
    .required('Amount is required'),
  price: Yup.number()
    .positive('Price must be positive')
    .required('Price is required')
});

const OrderForm = ({ symbol, type, currentPrice, onSubmit, onCancel }) => {
  const initialValues = {
    type,
    amount: '',
    price: currentPrice
  };
  
  const handleSubmit = (values, { setSubmitting }) => {
    onSubmit(values);
    setSubmitting(false);
  };
  
  return (
    <div className="order-form-container">
      <h3>{type === 'buy' ? 'Buy' : 'Sell'} {symbol}</h3>
      
      <Formik
        initialValues={initialValues}
        validationSchema={orderSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => (
          <Form className="order-form">
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
            
            <div className="form-buttons">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className={`submit-btn ${type === 'buy' ? 'buy-btn' : 'sell-btn'}`}
              >
                {isSubmitting ? 'Processing...' : `${type === 'buy' ? 'Buy' : 'Sell'} ${symbol}`}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default OrderForm; 