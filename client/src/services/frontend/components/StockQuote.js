import React, { useState, useEffect } from 'react';
import stockService from '../services/stockService';

const StockQuote = ({ symbol }) => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true);
        const response = await stockService.getQuotes(symbol);
        
        if (response.success && response.data && response.data[symbol]) {
          setQuote(response.data[symbol]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchQuote, 30000);

    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) return <div>Loading quote...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!quote) return <div>No quote available</div>;

  const priceChange = parseFloat(quote.change);
  const percentChange = parseFloat(quote.percent_change);
  const isPositive = priceChange >= 0;

  return (
    <div className="stock-quote">
      <div className="quote-header">
        <h2>{quote.name} ({quote.symbol})</h2>
        <span className="exchange">{quote.exchange}</span>
      </div>
      
      <div className="quote-price">
        <span className="current-price">${parseFloat(quote.close).toFixed(2)}</span>
        <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({percentChange.toFixed(2)}%)
        </span>
      </div>
      
      <div className="quote-details">
        <div className="detail-item">
          <span className="label">Open:</span>
          <span className="value">${parseFloat(quote.open).toFixed(2)}</span>
        </div>
        <div className="detail-item">
          <span className="label">High:</span>
          <span className="value">${parseFloat(quote.high).toFixed(2)}</span>
        </div>
        <div className="detail-item">
          <span className="label">Low:</span>
          <span className="value">${parseFloat(quote.low).toFixed(2)}</span>
        </div>
        <div className="detail-item">
          <span className="label">Volume:</span>
          <span className="value">{parseInt(quote.volume).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default StockQuote; 