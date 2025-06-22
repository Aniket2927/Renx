import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const tradeSchema = Yup.object().shape({
  symbol: Yup.string().required('Symbol is required'),
  type: Yup.string().required('Type is required'),
  amount: Yup.number()
    .positive('Amount must be positive')
    .required('Amount is required'),
  price: Yup.number()
    .positive('Price must be positive')
    .required('Price is required')
});

const TradeForm = ({ onSubmit, initialValues }) => {
  const defaultValues = {
    symbol: '',
    type: 'buy',
    amount: '',
    price: '',
    ...initialValues
  };
  
  const handleSubmit = (values, { setSubmitting }) => {
    if (initialValues) {
      onSubmit(initialValues._id, values);
    } else {
      onSubmit(values);
    }
    setSubmitting(false);
  };
  
  return (
    <div className="trade-form-container">
      <h3>{initialValues ? 'Edit Trade' : 'New Trade'}</h3>
      
      <Formik
        initialValues={defaultValues}
        validationSchema={tradeSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => (
          <Form className="trade-form">
            <div className="form-group">
              <label htmlFor="symbol">Symbol</label>
              <Field as="select" name="symbol" id="symbol">
                <option value="">Select a symbol</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="SOL">Solana (SOL)</option>
                <option value="ADA">Cardano (ADA)</option>
                <option value="XRP">Ripple (XRP)</option>
              </Field>
              <ErrorMessage name="symbol" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <div className="radio-group">
                <label className="radio-label">
                  <Field type="radio" name="type" value="buy" />
                  Buy
                </label>
                <label className="radio-label">
                  <Field type="radio" name="type" value="sell" />
                  Sell
                </label>
              </div>
              <ErrorMessage name="type" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
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
              <label>Total: ${(values.amount * values.price).toFixed(2)}</label>
            </div>
            
            <div className="form-buttons">
              <button type="submit" disabled={isSubmitting} className="submit-btn">
                {isSubmitting ? 'Processing...' : initialValues ? 'Update Trade' : 'Create Trade'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default TradeForm; 