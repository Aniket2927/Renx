import React, { useState, useEffect } from 'react';
import aiService from '../../services/ai/aiService';

const AISignalTag = ({ symbol, features }) => {
  const [signal, setSignal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchSignal() {
      try {
        const result = await aiService.getSignal(symbol, features);
        if (!isMounted) return;
        setSignal(result);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch signal');
        setLoading(false);
      }
    }

    fetchSignal();
    // Refresh signal every 5 minutes
    const interval = setInterval(fetchSignal, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol, features]);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-full px-3 py-1 text-sm">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-800 rounded-full px-3 py-1 text-sm">
        Error
      </div>
    );
  }

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'BUY':
        return 'bg-green-100 text-green-800';
      case 'SELL':
        return 'bg-red-100 text-red-800';
      case 'HOLD':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`${getSignalColor(signal.signal)} rounded-full px-3 py-1 text-sm font-medium`}>
        {signal.signal}
      </div>
      <div className="text-sm text-gray-500">
        {(signal.confidence * 100).toFixed(1)}% confidence
      </div>
    </div>
  );
};

export default AISignalTag; 