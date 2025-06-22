import React, { useEffect, useRef, useState } from 'react';
import '../../styles/Markets.css';

const LineChart = ({ symbol, timeframe, data }) => {
  const chartRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Mock data generation function if real data is not provided
  const generateMockData = (symbol, timeframe, numPoints = 100) => {
    const basePrice = symbol.includes('BTC') ? 57000 : 
                      symbol.includes('ETH') ? 1650 : 
                      symbol.includes('SOL') ? 145 : 100;
    
    let lastPrice = basePrice;
    
    const prices = [];
    const timestamps = [];
    
    for (let i = 0; i < numPoints; i++) {
      // Generate price movement
      const changePercent = (Math.random() - 0.5) * 0.02; // -1% to 1%
      const price = lastPrice * (1 + changePercent);
      
      prices.push(price);
      timestamps.push(Date.now() - (numPoints - i) * 3600000);
      
      lastPrice = price;
    }
    
    return { prices, timestamps };
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
    const { prices, timestamps } = data || generateMockData(symbol, timeframe);
    
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
    const minPrice = Math.min(...prices) * 0.99; // Add 1% margin
    const maxPrice = Math.max(...prices) * 1.01; // Add 1% margin
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
    
    // Create line chart
    const lineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Create path element for the line
    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let pathD = '';
    
    // Create points and path
    prices.forEach((price, i) => {
      const x = padding.left + (chartWidth * i) / (prices.length - 1);
      const y = padding.top + chartHeight - (chartHeight * (price - minPrice)) / priceRange;
      
      if (i === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
      
      // Add circle at each data point
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '2');
      circle.setAttribute('fill', price > prices[Math.max(0, i-1)] ? '#2ecc71' : '#e74c3c');
      circle.setAttribute('stroke', 'white');
      circle.setAttribute('stroke-width', '1');
      
      // Add tooltip on hover
      circle.addEventListener('mouseover', (e) => {
        const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        tooltip.setAttribute('class', 'tooltip');
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x - 50);
        rect.setAttribute('y', y - 40);
        rect.setAttribute('width', '100');
        rect.setAttribute('height', '30');
        rect.setAttribute('rx', '5');
        rect.setAttribute('ry', '5');
        rect.setAttribute('fill', 'rgba(0, 0, 0, 0.8)');
        tooltip.appendChild(rect);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y - 20);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', '12');
        text.textContent = `$${price.toFixed(2)}`;
        tooltip.appendChild(text);
        
        svg.appendChild(tooltip);
      });
      
      circle.addEventListener('mouseout', () => {
        const tooltip = svg.querySelector('.tooltip');
        if (tooltip) {
          svg.removeChild(tooltip);
        }
      });
      
      lineGroup.appendChild(circle);
    });
    
    // Set path attributes
    linePath.setAttribute('d', pathD);
    linePath.setAttribute('fill', 'none');
    linePath.setAttribute('stroke', '#3498db');
    linePath.setAttribute('stroke-width', '2');
    linePath.setAttribute('stroke-linecap', 'round');
    linePath.setAttribute('stroke-linejoin', 'round');
    lineGroup.appendChild(linePath);
    
    // Create area under the line
    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let areaD = pathD;
    
    // Add bottom line to close the path
    const lastX = padding.left + chartWidth;
    const firstX = padding.left;
    const bottomY = padding.top + chartHeight;
    
    areaD += ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    
    areaPath.setAttribute('d', areaD);
    areaPath.setAttribute('fill', 'url(#areaGradient)');
    areaPath.setAttribute('opacity', '0.2');
    
    // Create gradient for area fill
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'areaGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#3498db');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', 'white');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.appendChild(gradient);
    svg.appendChild(defs);
    
    lineGroup.insertBefore(areaPath, linePath);
    svg.appendChild(lineGroup);
    
    // Add time labels
    const timeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Add 5 evenly spaced time labels
    for (let i = 0; i < 5; i++) {
      const index = Math.floor((i * (prices.length - 1)) / 4);
      const x = padding.left + (chartWidth * index) / (prices.length - 1);
      const y = height - padding.bottom / 2;
      
      const date = new Date(timestamps[index]);
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
    <div className="line-chart" ref={chartRef}></div>
  );
};

export default LineChart; 