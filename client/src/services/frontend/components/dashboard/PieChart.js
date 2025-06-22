import React from 'react';

const PieChart = ({ colors = ['#3498db', '#9b59b6', '#e74c3c', '#34495e'] }) => {
  // Generate random data for the pie chart segments
  const generateData = () => {
    let remaining = 100;
    const segments = [];
    
    for (let i = 0; i < colors.length - 1; i++) {
      const value = Math.floor(Math.random() * (remaining - 10)) + 5;
      segments.push(value);
      remaining -= value;
    }
    
    segments.push(remaining);
    return segments;
  };
  
  const data = generateData();
  
  // Calculate SVG paths for each segment
  const calculatePieSegments = () => {
    const segments = [];
    let startAngle = 0;
    const centerX = 50;
    const centerY = 50;
    const radius = 40;
    
    data.forEach((value, index) => {
      const percentage = value / 100;
      const angle = percentage * 360;
      const endAngle = startAngle + angle;
      
      // Calculate x,y coordinates for the two points of the arc
      const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
      const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
      const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
      const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
      
      // Create the SVG arc path
      const largeArcFlag = angle > 180 ? 1 : 0;
      const path = [
        `M ${centerX} ${centerY}`,
        `L ${startX} ${startY}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        'Z'
      ].join(' ');
      
      segments.push({
        path,
        color: colors[index % colors.length],
        value
      });
      
      startAngle = endAngle;
    });
    
    return segments;
  };
  
  const segments = calculatePieSegments();
  
  return (
    <div className="pie-chart">
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        {/* Render each segment */}
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
            stroke="#fff"
            strokeWidth="1"
          />
        ))}
        
        {/* Optional inner circle for donut chart effect */}
        <circle cx="50" cy="50" r="25" fill="#fff" />
      </svg>
    </div>
  );
};

export default PieChart; 