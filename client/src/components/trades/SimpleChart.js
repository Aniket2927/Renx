import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ChartContainer = styled.div`
  position: relative;
  height: 300px;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const ChartSvg = styled.svg`
  width: 100%;
  height: 100%;
`;

const TimeControls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const TimeButton = styled.button`
  background: ${props => props.active ? '#4f8cff' : 'rgba(79, 140, 255, 0.1)'};
  color: ${props => props.active ? '#fff' : '#4f8cff'};
  border: none;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#4f8cff' : 'rgba(79, 140, 255, 0.2)'};
  }
`;

const PriceLabel = styled.div`
  position: absolute;
  left: 10px;
  top: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
`;

const DateLabel = styled.div`
  position: absolute;
  right: 10px;
  bottom: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #333;
`;

const ChartPoint = styled(motion.circle)`
  fill: #4f8cff;
  r: 4;
`;

const Tooltip = styled(motion.div)`
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  pointer-events: none;
  transform: translate(-50%, -100%);
  margin-top: -10px;
  z-index: 2;
`;

// Generate random data
const generateData = (points, min = 30000, max = 60000, volatility = 0.02) => {
  const data = [];
  let lastPrice = (min + max) / 2;
  
  for (let i = 0; i < points; i++) {
    // Add some randomness to price movement
    const change = lastPrice * (Math.random() * volatility * 2 - volatility);
    lastPrice += change;
    
    // Keep within bounds
    if (lastPrice < min) lastPrice = min + Math.random() * 1000;
    if (lastPrice > max) lastPrice = max - Math.random() * 1000;
    
    const date = new Date();
    date.setDate(date.getDate() - (points - i));
    
    data.push({
      price: lastPrice,
      date: date.toISOString().split('T')[0]
    });
  }
  
  return data;
};

const SimpleChart = () => {
  const [timeframe, setTimeframe] = useState('1m');
  const [data, setData] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    // Generate data based on timeframe
    const dataPoints = timeframe === '1d' ? 24 :
                      timeframe === '1w' ? 7 :
                      timeframe === '1m' ? 30 : 90;
    
    setData(generateData(dataPoints));
  }, [timeframe]);
  
  // Skip rendering if no data
  if (data.length === 0) {
    return <div>Loading chart data...</div>;
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
  const points = data.map((d, i) => {
    // X position (percentage of width)
    const x = padding + (i / (data.length - 1)) * chartWidth;
    
    // Y position (percentage of height, inverted)
    const normalizedPrice = (d.price - minPrice) / range;
    const y = 100 - (padding + normalizedPrice * chartHeight);
    
    return `${x},${y}`;
  }).join(' ');
  
  // Generate fill area
  const fillPoints = `${points} ${padding + chartWidth},100 ${padding},100`;
  
  // Handle mouse over point
  const handleMouseOver = (point, index, event) => {
    setHoveredPoint(index);
    
    // Get position for tooltip
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left,
      y: rect.top
    });
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };
  
  return (
    <div>
      <TimeControls>
        <TimeButton 
          active={timeframe === '1d'} 
          onClick={() => setTimeframe('1d')}
        >
          1D
        </TimeButton>
        <TimeButton 
          active={timeframe === '1w'} 
          onClick={() => setTimeframe('1w')}
        >
          1W
        </TimeButton>
        <TimeButton 
          active={timeframe === '1m'} 
          onClick={() => setTimeframe('1m')}
        >
          1M
        </TimeButton>
        <TimeButton 
          active={timeframe === '3m'} 
          onClick={() => setTimeframe('3m')}
        >
          3M
        </TimeButton>
      </TimeControls>
      
      <ChartContainer>
        <PriceLabel>
          ${data[data.length - 1].price.toFixed(2)}
          <span style={{ 
            color: data[data.length - 1].price > data[data.length - 2].price ? '#2dff7a' : '#ff2d7a',
            marginLeft: '5px'
          }}>
            {data[data.length - 1].price > data[data.length - 2].price ? '▲' : '▼'}
          </span>
        </PriceLabel>
        
        <DateLabel>
          {data[0].date} - {data[data.length - 1].date}
        </DateLabel>
        
        <ChartSvg viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Background gradient */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f8cff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4f8cff" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Fill area under line */}
          <polygon 
            points={fillPoints} 
            fill="url(#areaGradient)" 
          />
          
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#4f8cff"
            strokeWidth="0.5"
          />
          
          {/* Data points */}
          {data.map((d, i) => {
            // Calculate position
            const x = padding + (i / (data.length - 1)) * chartWidth;
            const normalizedPrice = (d.price - minPrice) / range;
            const y = 100 - (padding + normalizedPrice * chartHeight);
            
            return (
              <ChartPoint
                key={i}
                cx={x}
                cy={y}
                initial={{ r: 0 }}
                animate={{ r: hoveredPoint === i ? 3 : 0 }}
                onMouseOver={(e) => handleMouseOver(d, i, e)}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}
        </ChartSvg>
        
        {/* Tooltip */}
        {hoveredPoint !== null && (
          <Tooltip
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div>${data[hoveredPoint].price.toFixed(2)}</div>
            <div>{data[hoveredPoint].date}</div>
          </Tooltip>
        )}
      </ChartContainer>
    </div>
  );
};

export default SimpleChart; 