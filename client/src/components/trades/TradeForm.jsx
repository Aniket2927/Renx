import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tradingAPI } from '../../services/api';
import { toast } from '@/hooks/use-toast';

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
  const queryClient = useQueryClient();
  
  const defaultValues = {
    symbol: '',
    type: 'buy',
    amount: '',
    price: '',
    ...initialValues
  };
  
  // Real API integration for order placement
  const placeOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const formattedOrder = {
        symbol: orderData.symbol,
        side: orderData.type,
        orderType: 'limit',
        quantity: orderData.amount.toString(),
        price: orderData.price.toString(),
        timeInForce: 'day',
        portfolioId: 'default'
      };
      
      const result = await tradingAPI.placeOrder(formattedOrder);
      return result;
    },
    onSuccess: (result, variables) => {
      toast({
        title: "Order Placed Successfully!",
        description: `${variables.type.toUpperCase()} order for ${variables.amount} shares of ${variables.symbol} at $${variables.price}`,
        duration: 5000,
      });
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['/api/trading/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trading/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trades/history'] });
      
      // Call parent onSubmit if provided
      if (onSubmit) {
        onSubmit(result);
      }
    },
    onError: (error, variables) => {
      console.error('Order placement failed:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  });
  
  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    // Validation
    if (!values.symbol || !values.amount || !values.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    if (parseFloat(values.amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Amount must be greater than 0.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    if (parseFloat(values.price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Price must be greater than 0.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Place order via real API
    placeOrderMutation.mutate(values);
    
    // Reset form on success
    if (!placeOrderMutation.isError) {
      resetForm();
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
              <button 
                type="submit" 
                disabled={isSubmitting || placeOrderMutation.isPending} 
                className="submit-btn"
              >
                {placeOrderMutation.isPending ? 'Placing Order...' : 
                 isSubmitting ? 'Processing...' : 
                 initialValues ? 'Update Trade' : 'Place Order'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default TradeForm; 