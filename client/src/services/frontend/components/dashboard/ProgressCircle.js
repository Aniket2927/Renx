import React from 'react';

const ProgressCircle = ({ percentage = 0, color = "#3498db", size = 100 }) => {
  // Ensure percentage is between 0 and 100
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));
  
  // Calculate SVG parameters
  const centerX = 50;
  const centerY = 50;
  const radius = 40;
  const strokeWidth = 8;
  
  // Calculate the circumference of the circle
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the length of the arc representing the percentage
  const dashOffset = circumference - (normalizedPercentage / 100) * circumference;
  
  return (
    <div className="progress-circle" style={{ width: `${size}px`, height: `${size}px` }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        {/* Background circle (track) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="transparent"
          stroke="#eee"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress arc */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90, 50, 50)" // Start from the top instead of right
        />
        
        {/* Percentage text in the center */}
        <text
          x={centerX}
          y={centerY + 5} // Small offset to center text vertically
          fontSize="18"
          fontWeight="bold"
          textAnchor="middle"
          fill={color}
        >
          {normalizedPercentage}%
        </text>
      </svg>
    </div>
  );
};

export default ProgressCircle; 