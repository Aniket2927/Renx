import React from 'react';

const LineChart = ({ height = 200, color = "#3498db" }) => {
  // Generate random data points for the chart
  const generateData = () => {
    const points = [];
    for (let i = 0; i < 10; i++) {
      points.push(40 + Math.random() * 40);
    }
    return points;
  };

  const data = generateData();
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;

  // Normalize data points to fit in the chart
  const normalizePoint = (point) => {
    return height - ((point - minValue) / range) * (height * 0.8);
  };

  // Generate SVG path for the line
  const generatePath = () => {
    let path = '';
    const segmentWidth = 100 / (data.length - 1);

    data.forEach((point, index) => {
      const x = index * segmentWidth;
      const y = normalizePoint(point);
      
      if (index === 0) {
        path += `M${x},${y}`;
      } else {
        path += ` L${x},${y}`;
      }
    });

    return path;
  };

  // Generate SVG path for the area under the line
  const generateAreaPath = () => {
    let path = generatePath();
    const lastX = 100;
    const lastY = height;
    const firstX = 0;
    
    path += ` L${lastX},${lastY} L${firstX},${lastY} Z`;
    return path;
  };

  return (
    <div className="line-chart" style={{ height: `${height}px`, width: '100%' }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Optional grid lines */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="#34495e" strokeWidth="0.2" strokeDasharray="1" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#34495e" strokeWidth="0.2" strokeDasharray="1" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#34495e" strokeWidth="0.2" strokeDasharray="1" />
        
        {/* Area under the line */}
        <path
          d={generateAreaPath()}
          fill={color}
          opacity="0.1"
        />
        
        {/* Line */}
        <path
          d={generatePath()}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          strokeLinecap="round"
        />
        
        {/* Data points */}
        {data.map((point, index) => {
          const x = index * (100 / (data.length - 1));
          const y = normalizePoint(point);
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1"
              fill={color}
              stroke="white"
              strokeWidth="0.2"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default LineChart; 