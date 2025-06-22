import React from 'react';

const BarChart = ({ height = 200, color = "#3498db" }) => {
  // Generate random data for the bar chart
  const generateData = () => {
    const data = [];
    for (let i = 0; i < 7; i++) {
      data.push(Math.floor(Math.random() * 80) + 20);
    }
    return data;
  };
  
  const data = generateData();
  const maxValue = Math.max(...data);
  
  // Days of the week for labels
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Calculate bar width based on number of bars
  const barWidth = 8;
  const gap = 6;
  const barSpacing = barWidth + gap;
  
  return (
    <div className="bar-chart" style={{ height: `${height}px`, width: '100%' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${(barWidth + gap) * data.length} 100`} preserveAspectRatio="none">
        {/* Optional grid lines */}
        <line x1="0" y1="75" x2="100" y2="75" stroke="#34495e" strokeWidth="0.2" strokeDasharray="1" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#34495e" strokeWidth="0.2" strokeDasharray="1" />
        <line x1="0" y1="25" x2="100" y2="25" stroke="#34495e" strokeWidth="0.2" strokeDasharray="1" />
        
        {/* Render bars */}
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * 80;
          const xPosition = index * barSpacing;
          const yPosition = 100 - barHeight;
          
          return (
            <rect
              key={index}
              x={xPosition}
              y={yPosition}
              width={barWidth}
              height={barHeight}
              rx={2}
              ry={2}
              fill={color}
            />
          );
        })}
        
        {/* Optional day labels */}
        {daysOfWeek.map((day, index) => (
          <text
            key={index}
            x={index * barSpacing + barWidth / 2}
            y="98"
            fontSize="6"
            textAnchor="middle"
            fill="#95a5a6"
          >
            {day}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default BarChart; 