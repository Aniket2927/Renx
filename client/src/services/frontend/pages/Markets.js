import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/Markets.css';

const symbolMap = {
  'NIFTY 50': 'NSE:NIFTY',
  'NIFTY': 'NSE:NIFTY',
  'BANKNIFTY': 'NSE:BANKNIFTY',
  'AAPL': 'NASDAQ:AAPL',
  'APPLE': 'NASDAQ:AAPL',
  'GOOGL': 'NASDAQ:GOOGL',
  'GOOGLE': 'NASDAQ:GOOGL',
  'MSFT': 'NASDAQ:MSFT',
  'MICROSOFT': 'NASDAQ:MSFT',
  'TSLA': 'NASDAQ:TSLA',
  'TESLA': 'NASDAQ:TSLA',
  'AMZN': 'NASDAQ:AMZN',
  'AMAZON': 'NASDAQ:AMZN',
  'RELIANCE': 'NSE:RELIANCE',
  'TCS': 'NSE:TCS',
  'INFY': 'NSE:INFY',
  'INFOSYS': 'NSE:INFY',
  'HDFCBANK': 'NSE:HDFCBANK',
  'ICICIBANK': 'NSE:ICICIBANK',
  'HDFC': 'NSE:HDFC',
  'ITC': 'NSE:ITC',
  'SBIN': 'NSE:SBIN',
  'STATE BANK': 'NSE:SBIN',
  'KOTAKBANK': 'NSE:KOTAKBANK',
  'AXISBANK': 'NSE:AXISBANK',
  'WIPRO': 'NSE:WIPRO',
  'HCLTECH': 'NSE:HCLTECH',
  'LT': 'NSE:LT',
  'LARSEN': 'NSE:LT',
  'MARUTI': 'NSE:MARUTI',
  'SUNPHARMA': 'NSE:SUNPHARMA',
  'ONGC': 'NSE:ONGC',
  'COALINDIA': 'NSE:COALINDIA',
  'TATAMOTORS': 'NSE:TATAMOTORS',
  'TATASTEEL': 'NSE:TATASTEEL',
  'BTCUSD': 'BINANCE:BTCUSDT',
  // Add more mappings as needed
};

const getTradingViewSymbol = (input) => symbolMap[input.toUpperCase()] || input.toUpperCase();

const Markets = () => {
  const { symbol = 'NSE:NIFTY' } = useParams();
  const [inputValue, setInputValue] = useState('');
  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  const widgetRef = useRef(null);

  useEffect(() => {
    // Remove any previous widget
    if (widgetRef.current) {
      widgetRef.current.innerHTML = '';
      }
    // Create script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      // eslint-disable-next-line no-undef
      new window.TradingView.widget({
        width: '100%',
        height: 700,
        symbol: currentSymbol,
        interval: '5',
        timezone: 'Asia/Kolkata',
        theme: 'light',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: 'tradingview_chart',
        withdateranges: true,
        hide_side_toolbar: false,
        details: true,
        hotlist: true,
        calendar: true,
        studies: [],
      });
    };
    if (widgetRef.current) {
      widgetRef.current.appendChild(script);
    }
  }, [currentSymbol]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setCurrentSymbol(getTradingViewSymbol(inputValue.trim()));
    }
  };
  
  return (
    <div className="markets-tradingview-layout" style={{ height: '100vh', width: '100%' }}>
      <div className="markets-header">
        <form onSubmit={handleSubmit} className="markets-search-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter symbol (e.g., NIFTY 50, AAPL, RELIANCE, BTCUSD)"
            className="markets-search-input"
          />
          <button type="submit" className="markets-search-btn">Search</button>
        </form>
      </div>
      <div className="markets-chart-area" ref={widgetRef} id="tradingview_chart" style={{ width: '100%', height: '700px' }} />
    </div>
  );
};

export default Markets; 