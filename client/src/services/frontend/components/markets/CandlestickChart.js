import React, { useEffect, useRef, useState } from 'react';
import '../../styles/Markets.css';
import api from '../../../api';

const CandlestickChart = ({ symbol, timeframe, data }) => {
  const chartRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Fetch real candlestick data from API
  const fetchRealCandlestickData = async (symbol, timeframe) => {
    try {
      // Map timeframe to appropriate interval for API
      const intervalMap = {
        '1D': '5min',
        '1W': '15min',
        '1M': '1h',
        '3M': '4h',
        '1Y': '1day',
        '5Y': '1week'
      };
      
      const interval = intervalMap[timeframe] || '1day';
      
      // Determine appropriate number of candles based on timeframe
      const outputsizeMap = {
        '1D': 108,  // 5min candles for 1 day (9 hours * 12)
        '1W': 112,  // 15min candles for 1 week (8 hours * 4 * 5 days)
        '1M': 168,  // 1h candles for 1 month (~22 trading days * 8 hours)
        '3M': 180,  // 4h candles for 3 months
        '1Y': 252,  // 1day candles for 1 year
        '5Y': 260   // 1week candles for 5 years
      };
      
      const outputsize = outputsizeMap[timeframe] || 50;
      
      // Call backend API
      const response = await api.get(`/stock/chart/${symbol}`, {
        params: { interval, outputsize }
      });
      
      if (response.data && response.data.success && response.data.data && response.data.data.values) {
        const apiData = response.data.data.values;
        
        // Format the candles for our chart component
        const candles = apiData.map(item => ({
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
          timestamp: new Date(item.datetime).getTime()
        }));
        
        // Extract volumes
        const volumes = apiData.map(item => parseFloat(item.volume || 0));
        
        return { candles, volumes };
      }
      
      throw new Error('Invalid API response format');
    } catch (error) {
      console.error(`Error fetching candlestick data for ${symbol}:`, error);
      // Return fallback mock data if API fails
      return generateFallbackData(symbol, timeframe);
    }
  };
  
  // Fallback data generation function if API fails
  const generateFallbackData = (symbol, timeframe, numCandles = 50) => {
    const basePrice = symbol.includes('BTC') ? 57000 : 
                      symbol.includes('ETH') ? 1650 : 
                      symbol.includes('SOL') ? 145 : 100;
    
    let lastClose = basePrice;
    const volatility = basePrice * 0.02; // 2% volatility
    
    const candles = [];
    const volumes = [];
    
    for (let i = 0; i < numCandles; i++) {
      // Generate price movement
      const changePercent = (Math.random() - 0.5) * 0.02; // -1% to 1%
      const close = lastClose * (1 + changePercent);
      
      // Generate high, low, open
      const range = volatility * Math.random();
      const high = Math.max(close, lastClose) + range * 0.5;
      const low = Math.min(close, lastClose) - range * 0.5;
      const open = lastClose;
      
      // Generate volume
      const volume = basePrice * 10 * (Math.random() + 0.5); // Random volume
      
      candles.push({ open, high, low, close, timestamp: Date.now() - (numCandles - i) * 3600000 });
      volumes.push(volume);
      
      lastClose = close;
    }
    
    return { candles, volumes };
  };
  
  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        setDimensions({
          width: chartRef.current.clientWidth,
          height: chartRef.current.clientHeight
        });
      }
    };
    
    // Initial size
    updateDimensions();
    
    // Force update after a small delay to ensure container is properly sized
    const timeout = setTimeout(() => {
      updateDimensions();
    }, 100);
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timeout);
    };
  }, []);
  
  useEffect(() => {
    if (!chartRef.current || dimensions.width === 0) return;
    
    // Function to fetch and render data
    const loadChartData = async () => {
      try {
        // Use provided data or fetch real data
        const chartData = data || await fetchRealCandlestickData(symbol, timeframe);
        renderChart(chartData);
      } catch (error) {
        console.error('Error loading chart data:', error);
        // Use fallback data as last resort
        const fallbackData = generateFallbackData(symbol, timeframe);
        renderChart(fallbackData);
      }
    };
    
    // Start loading data
    loadChartData();
    
    // Function to render the chart with data
    function renderChart(chartData) {
      const { candles, volumes } = chartData;
    
    // Clear previous chart
    chartRef.current.innerHTML = '';
    
    // Create SVG element
    const width = dimensions.width;
    const height = dimensions.height || 400; // Default height if not available
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    chartRef.current.appendChild(svg);
    
    // Chart parameters
    const padding = { top: 20, right: 30, bottom: 30, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Find min and max prices
    const minPrice = Math.min(...candles.map(candle => candle.low)) * 0.999; // Add margin
    const maxPrice = Math.max(...candles.map(candle => candle.high)) * 1.001; // Add margin
    const priceRange = maxPrice - minPrice;
    
    // Create grid lines
    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight * i) / 5;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - padding.right);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#eee');
      line.setAttribute('stroke-width', '1');
      gridGroup.appendChild(line);
      
      // Price label
      const price = maxPrice - (priceRange * i) / 5;
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', padding.left - 10);
      text.setAttribute('y', y);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('alignment-baseline', 'middle');
      text.setAttribute('fill', '#999');
      text.setAttribute('font-size', '10');
      text.textContent = price.toFixed(2);
      gridGroup.appendChild(text);
    }
    svg.appendChild(gridGroup);
    
    // Create vertical grid lines (time divisions)
    for (let i = 0; i <= 4; i++) {
      const x = padding.left + (chartWidth * i) / 4;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', padding.top);
      line.setAttribute('x2', x);
      line.setAttribute('y2', padding.top + chartHeight);
      line.setAttribute('stroke', '#eee');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '3,3');
      gridGroup.appendChild(line);
    }
    
    // Create candles
    const candleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const candleWidth = Math.min(chartWidth / candles.length * 0.7, 15);
    
    candles.forEach((candle, i) => {
      const x = padding.left + (chartWidth * i) / candles.length + candleWidth * 0.15;
      
      // Scale prices to chart height
      const scaledOpen = padding.top + chartHeight - (chartHeight * (candle.open - minPrice)) / priceRange;
      const scaledClose = padding.top + chartHeight - (chartHeight * (candle.close - minPrice)) / priceRange;
      const scaledHigh = padding.top + chartHeight - (chartHeight * (candle.high - minPrice)) / priceRange;
      const scaledLow = padding.top + chartHeight - (chartHeight * (candle.low - minPrice)) / priceRange;
      
      // Determine candle color
      const isGreen = candle.close >= candle.open;
      const candleColor = isGreen ? '#2ecc71' : '#e74c3c';
      
      // Create a group for this candle
      const candleElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      candleElement.setAttribute('class', 'candle');
      
      // Draw the wick (high-low line)
      const wickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      wickLine.setAttribute('x1', x + candleWidth / 2);
      wickLine.setAttribute('y1', scaledHigh);
      wickLine.setAttribute('x2', x + candleWidth / 2);
      wickLine.setAttribute('y2', scaledLow);
      wickLine.setAttribute('stroke', candleColor);
      wickLine.setAttribute('stroke-width', '1');
      candleElement.appendChild(wickLine);
      
      // Draw the candle body
      const candleRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      candleRect.setAttribute('x', x);
      candleRect.setAttribute('y', isGreen ? scaledClose : scaledOpen);
      candleRect.setAttribute('width', candleWidth);
      candleRect.setAttribute('height', Math.max(1, Math.abs(scaledClose - scaledOpen)));
      candleRect.setAttribute('fill', candleColor);
      candleRect.setAttribute('stroke', isGreen ? '#27ae60' : '#c0392b');
      candleRect.setAttribute('stroke-width', '0.5');
      candleElement.appendChild(candleRect);
      
      // Add hit area for tooltip (invisible rectangle covering the entire candle)
      const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      hitArea.setAttribute('x', x);
      hitArea.setAttribute('y', scaledHigh);
      hitArea.setAttribute('width', candleWidth);
      hitArea.setAttribute('height', scaledLow - scaledHigh);
      hitArea.setAttribute('fill', 'transparent');
      hitArea.setAttribute('stroke', 'none');
      
      // Add tooltip on hover
      hitArea.addEventListener('mouseover', () => {
        const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        tooltip.setAttribute('class', 'tooltip');
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x - 55);
        rect.setAttribute('y', scaledHigh - 85);
        rect.setAttribute('width', '160');
        rect.setAttribute('height', '75');
        rect.setAttribute('rx', '5');
        rect.setAttribute('ry', '5');
        rect.setAttribute('fill', 'rgba(0, 0, 0, 0.8)');
        tooltip.appendChild(rect);
        
        // Price data in tooltip
        const labels = ['O', 'H', 'L', 'C'];
        const values = [candle.open, candle.high, candle.low, candle.close];
        
        labels.forEach((label, j) => {
          const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          labelText.setAttribute('x', x - 40 + j * 40);
          labelText.setAttribute('y', scaledHigh - 60);
          labelText.setAttribute('text-anchor', 'middle');
          labelText.setAttribute('fill', '#999');
          labelText.setAttribute('font-size', '12');
          labelText.textContent = label;
          tooltip.appendChild(labelText);
          
          const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          valueText.setAttribute('x', x - 40 + j * 40);
          valueText.setAttribute('y', scaledHigh - 40);
          valueText.setAttribute('text-anchor', 'middle');
          valueText.setAttribute('fill', 'white');
          valueText.setAttribute('font-size', '12');
          valueText.textContent = values[j].toFixed(2);
          tooltip.appendChild(valueText);
        });
        
        // Add date/time
        const date = new Date(candle.timestamp);
        let dateLabel = '';
        
        if (timeframe === '1D') {
          dateLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (timeframe === '1W' || timeframe === '1M') {
          dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } else {
          dateLabel = date.toLocaleDateString([], { month: 'short', year: '2-digit' });
        }
        
        const dateText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        dateText.setAttribute('x', x + candleWidth / 2);
        dateText.setAttribute('y', scaledHigh - 15);
        dateText.setAttribute('text-anchor', 'middle');
        dateText.setAttribute('fill', 'white');
        dateText.setAttribute('font-size', '12');
        dateText.textContent = dateLabel;
        tooltip.appendChild(dateText);
        
        // Highlight this candle
        candleRect.setAttribute('stroke-width', '1.5');
        wickLine.setAttribute('stroke-width', '1.5');
        
        svg.appendChild(tooltip);
      });
      
      hitArea.addEventListener('mouseout', () => {
        const tooltip = svg.querySelector('.tooltip');
        if (tooltip) {
          svg.removeChild(tooltip);
        }
        
        // Restore normal appearance
        candleRect.setAttribute('stroke-width', '0.5');
        wickLine.setAttribute('stroke-width', '1');
      });
      
      candleElement.appendChild(hitArea);
      candleGroup.appendChild(candleElement);
    });
    
    svg.appendChild(candleGroup);
    
    // Add volume bars at the bottom
    const volumeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const volumeHeight = chartHeight * 0.1;
    const maxVolume = Math.max(...volumes);
    
    candles.forEach((candle, i) => {
      const x = padding.left + (chartWidth * i) / candles.length + candleWidth * 0.15;
      const volumeScale = volumes[i] / maxVolume;
      const y = height - padding.bottom - volumeHeight * volumeScale;
      
      const isGreen = candle.close >= candle.open;
      const volumeColor = isGreen ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)';
      
      const volumeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      volumeRect.setAttribute('x', x);
      volumeRect.setAttribute('y', y);
      volumeRect.setAttribute('width', candleWidth);
      volumeRect.setAttribute('height', volumeHeight * volumeScale);
      volumeRect.setAttribute('fill', volumeColor);
      volumeGroup.appendChild(volumeRect);
    });
    
    svg.appendChild(volumeGroup);
    
    // Add time labels
    const timeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Add time labels at regular intervals
    for (let i = 0; i < 5; i++) {
      const index = Math.floor((i * (candles.length - 1)) / 4);
      const x = padding.left + (chartWidth * index) / candles.length + candleWidth / 2;
      const y = height - padding.bottom / 2;
      
      const date = new Date(candles[index].timestamp);
      let label = '';
      
      // Format the time label based on the timeframe
      if (timeframe === '1D') {
        label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (timeframe === '1W' || timeframe === '1M') {
        label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } else {
        label = date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      }
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#999');
      text.setAttribute('font-size', '10');
      text.textContent = label;
      timeGroup.appendChild(text);
    }
    
    svg.appendChild(timeGroup);
    
    // Add moving average line (example of technical indicator)
    const maLength = 10; // 10-period moving average
    if (candles.length >= maLength) {
      const maLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let maPath = '';
      
      for (let i = maLength - 1; i < candles.length; i++) {
        // Calculate simple moving average
        let sum = 0;
        for (let j = 0; j < maLength; j++) {
          sum += candles[i - j].close;
        }
        const ma = sum / maLength;
        
        // Plot MA point
        const x = padding.left + (chartWidth * i) / candles.length + candleWidth / 2;
        const y = padding.top + chartHeight - (chartHeight * (ma - minPrice)) / priceRange;
        
        if (i === maLength - 1) {
          maPath += `M ${x} ${y}`;
        } else {
          maPath += ` L ${x} ${y}`;
        }
      }
      
      maLine.setAttribute('d', maPath);
      maLine.setAttribute('fill', 'none');
      maLine.setAttribute('stroke', '#3498db');
      maLine.setAttribute('stroke-width', '1.5');
      maLine.setAttribute('stroke-linecap', 'round');
      svg.appendChild(maLine);
      
      // Add MA label
      const maLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      maLabel.setAttribute('x', padding.left + 10);
      maLabel.setAttribute('y', padding.top + 15);
      maLabel.setAttribute('fill', '#3498db');
      maLabel.setAttribute('font-size', '12');
      maLabel.textContent = `MA(${maLength})`;
      svg.appendChild(maLabel);
    }
    
    } // End of renderChart function
  }, [symbol, timeframe, data, dimensions, fetchRealCandlestickData]);
  
  return (
    <div className="candlestick-chart" ref={chartRef} style={{ width: '100%', height: '100%' }}></div>
  );
};

export default CandlestickChart; 