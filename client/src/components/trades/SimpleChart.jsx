import React, { useState, useEffect } from 'react';
import marketDataService from '../../services/marketDataService';

const SimpleChart = ({ symbol = 'AAPL' }) => {
  const [timeframe, setTimeframe] = useState('1m');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const fetchRealData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Determine the interval and output size based on timeframe
        const intervalMap = {
          '1d': { interval: '1hour', outputSize: 24 },
          '1w': { interval: '1day', outputSize: 7 },
          '1m': { interval: '1day', outputSize: 30 },
          '3m': { interval: '1day', outputSize: 90 }
        };
        
        const { interval, outputSize } = intervalMap[timeframe];
        
        // Fetch real historical data
        const historicalData = await marketDataService.getTimeSeries(symbol, interval, outputSize);
        
        // Transform data to the format expected by the chart
        const chartData = historicalData.map((item, index) => ({
          price: item.y[3], // Close price
          date: new Date(item.x).toISOString().split('T')[0],
          timestamp: item.x
        }));
        
        setData(chartData);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, [timeframe, symbol]);
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  
  // Skip rendering if no data
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }
  
  // Calculate chart values
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;
  
  // Padding to avoid points at the edge
  const padding = 20;
  const chartWidth = 100 - (padding * 2 / 10);
  const chartHeight = 100 - (padding * 2 / 3);
  
  // Generate path for line
  const pathData = data.map((point, index) => {
    const x = (index / (data.length - 1)) * chartWidth + padding / 10;
    const y = 100 - (((point.price - minPrice) / range) * chartHeight + padding / 3);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const pointIndex = Math.round((x / rect.width) * (data.length - 1));
    
    if (pointIndex >= 0 && pointIndex < data.length) {
      setHoveredPoint(data[pointIndex]);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };
  
  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };
  
  const currentPrice = data[data.length - 1]?.price || 0;
  const previousPrice = data[data.length - 2]?.price || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const percentChange = previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{symbol} Price Chart</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">
              ${currentPrice.toFixed(2)}
            </span>
            <span className={`text-sm font-medium ${percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
            </span>
          </div>
        </div>
        
        {/* Timeframe buttons */}
        <div className="flex space-x-1">
          {['1d', '1w', '1m', '3m'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart */}
      <div className="relative h-48">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f0f0f0" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Price line */}
          <path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * chartWidth + padding / 10;
            const y = 100 - (((point.price - minPrice) / range) * chartHeight + padding / 3);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="0.8"
                fill="#3b82f6"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        
        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="fixed z-50 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 40,
            }}
          >
            <div className="font-semibold">${hoveredPoint.price.toFixed(2)}</div>
            <div className="text-gray-300">{hoveredPoint.date}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleChart; 