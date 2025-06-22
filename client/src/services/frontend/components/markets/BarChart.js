import React, { useEffect, useRef, useState } from 'react';
import '../../styles/Markets.css';

const BarChart = ({ symbol, timeframe, data }) => {
  const chartRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Mock data generation function if real data is not provided
  const generateMockData = (symbol, timeframe, numBars = 50) => {
    const basePrice = symbol.includes('BTC') ? 57000 : 
                      symbol.includes('ETH') ? 1650 : 
                      symbol.includes('SOL') ? 145 : 100;
    
    let lastClose = basePrice;
    const volatility = basePrice * 0.02; // 2% volatility
    
    const bars = [];
    const volumes = [];
    
    for (let i = 0; i < numBars; i++) {
      // Generate price movement
      const changePercent = (Math.random() - 0.5) * 0.02; // -1% to 1%
      const close = lastClose * (1 + changePercent);
      
      // Generate OHLC data
      const range = volatility * Math.random();
      const open = lastClose;
      const high = Math.max(close, open) + range * 0.5;
      const low = Math.min(close, open) - range * 0.5;
      
      // Generate volume
      const volume = basePrice * 10 * (Math.random() + 0.5); // Random volume
      
      bars.push({ 
        open, 
        high, 
        low, 
        close, 
        timestamp: Date.now() - (numBars - i) * 3600000 
      });
      
      volumes.push(volume);
      lastClose = close;
    }
    
    return { bars, volumes };
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
    
    // Use provided data or generate mock data
    const { bars, volumes } = data || generateMockData(symbol, timeframe);
    
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
    const minPrice = Math.min(...bars.map(bar => bar.low)) * 0.999; // Add small margin
    const maxPrice = Math.max(...bars.map(bar => bar.high)) * 1.001; // Add small margin
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
    
    // Create OHLC bars
    const barGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const barWidth = Math.min(chartWidth / bars.length * 0.8, 15);
    
    bars.forEach((bar, i) => {
      const x = padding.left + (chartWidth * i) / bars.length + barWidth * 0.1;
      
      // Scale prices to chart height
      const scaledOpen = padding.top + chartHeight - (chartHeight * (bar.open - minPrice)) / priceRange;
      const scaledClose = padding.top + chartHeight - (chartHeight * (bar.close - minPrice)) / priceRange;
      const scaledHigh = padding.top + chartHeight - (chartHeight * (bar.high - minPrice)) / priceRange;
      const scaledLow = padding.top + chartHeight - (chartHeight * (bar.low - minPrice)) / priceRange;
      
      const centerX = x + barWidth / 2;
      
      // Draw the vertical high-low line
      const wickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      wickLine.setAttribute('x1', centerX);
      wickLine.setAttribute('y1', scaledHigh);
      wickLine.setAttribute('x2', centerX);
      wickLine.setAttribute('y2', scaledLow);
      wickLine.setAttribute('stroke', '#666');
      wickLine.setAttribute('stroke-width', '1');
      barGroup.appendChild(wickLine);
      
      // Draw the open tick (left)
      const openTick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      openTick.setAttribute('x1', centerX - barWidth / 2);
      openTick.setAttribute('y1', scaledOpen);
      openTick.setAttribute('x2', centerX);
      openTick.setAttribute('y2', scaledOpen);
      openTick.setAttribute('stroke', '#666');
      openTick.setAttribute('stroke-width', '1');
      barGroup.appendChild(openTick);
      
      // Draw the close tick (right)
      const closeTick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      closeTick.setAttribute('x1', centerX);
      closeTick.setAttribute('y1', scaledClose);
      closeTick.setAttribute('x2', centerX + barWidth / 2);
      closeTick.setAttribute('y2', scaledClose);
      closeTick.setAttribute('stroke', '#666');
      closeTick.setAttribute('stroke-width', '1');
      barGroup.appendChild(closeTick);
      
      // Add tooltip on hover of the entire bar area
      const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      hitArea.setAttribute('x', x);
      hitArea.setAttribute('y', scaledHigh);
      hitArea.setAttribute('width', barWidth);
      hitArea.setAttribute('height', scaledLow - scaledHigh);
      hitArea.setAttribute('fill', 'transparent');
      hitArea.setAttribute('stroke', 'none');
      
      hitArea.addEventListener('mouseover', () => {
        const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        tooltip.setAttribute('class', 'tooltip');
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', centerX - 80);
        rect.setAttribute('y', scaledHigh - 85);
        rect.setAttribute('width', '160');
        rect.setAttribute('height', '75');
        rect.setAttribute('rx', '5');
        rect.setAttribute('ry', '5');
        rect.setAttribute('fill', 'rgba(0, 0, 0, 0.8)');
        tooltip.appendChild(rect);
        
        // Price data in tooltip
        const labels = ['O', 'H', 'L', 'C'];
        const values = [bar.open, bar.high, bar.low, bar.close];
        
        labels.forEach((label, j) => {
          const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          labelText.setAttribute('x', centerX - 65 + j * 40);
          labelText.setAttribute('y', scaledHigh - 60);
          labelText.setAttribute('text-anchor', 'middle');
          labelText.setAttribute('fill', '#999');
          labelText.setAttribute('font-size', '12');
          labelText.textContent = label;
          tooltip.appendChild(labelText);
          
          const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          valueText.setAttribute('x', centerX - 65 + j * 40);
          valueText.setAttribute('y', scaledHigh - 40);
          valueText.setAttribute('text-anchor', 'middle');
          valueText.setAttribute('fill', 'white');
          valueText.setAttribute('font-size', '12');
          valueText.textContent = values[j].toFixed(2);
          tooltip.appendChild(valueText);
        });
        
        // Add date/time
        const date = new Date(bar.timestamp);
        let dateLabel = '';
        
        if (timeframe === '1D') {
          dateLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
          dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        }
        
        const dateText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        dateText.setAttribute('x', centerX);
        dateText.setAttribute('y', scaledHigh - 15);
        dateText.setAttribute('text-anchor', 'middle');
        dateText.setAttribute('fill', 'white');
        dateText.setAttribute('font-size', '12');
        dateText.textContent = dateLabel;
        tooltip.appendChild(dateText);
        
        svg.appendChild(tooltip);
      });
      
      hitArea.addEventListener('mouseout', () => {
        const tooltip = svg.querySelector('.tooltip');
        if (tooltip) {
          svg.removeChild(tooltip);
        }
      });
      
      barGroup.appendChild(hitArea);
    });
    
    svg.appendChild(barGroup);
    
    // Add volume bars at the bottom
    const volumeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const volumeHeight = chartHeight * 0.1;
    const maxVolume = Math.max(...volumes);
    
    bars.forEach((bar, i) => {
      const x = padding.left + (chartWidth * i) / bars.length + barWidth * 0.1;
      const volumeScale = volumes[i] / maxVolume;
      const y = height - padding.bottom - volumeHeight * volumeScale;
      
      // Determine if bar is up or down
      const isUp = bar.close >= bar.open;
      const volumeColor = isUp ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)';
      
      const volumeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      volumeRect.setAttribute('x', x);
      volumeRect.setAttribute('y', y);
      volumeRect.setAttribute('width', barWidth);
      volumeRect.setAttribute('height', volumeHeight * volumeScale);
      volumeRect.setAttribute('fill', volumeColor);
      volumeGroup.appendChild(volumeRect);
    });
    
    svg.appendChild(volumeGroup);
    
    // Add time labels
    const timeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Add time labels at regular intervals
    for (let i = 0; i < 5; i++) {
      const index = Math.floor((i * (bars.length - 1)) / 4);
      const x = padding.left + (chartWidth * index) / bars.length + barWidth / 2;
      const y = height - padding.bottom / 2;
      
      const date = new Date(bars[index].timestamp);
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
    
  }, [symbol, timeframe, data, dimensions]);
  
  return (
    <div className="bar-chart" ref={chartRef}></div>
  );
};

export default BarChart; 