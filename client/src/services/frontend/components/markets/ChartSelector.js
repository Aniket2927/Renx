import React, { useState } from 'react';
import { FaChartLine, FaChartBar, FaChartArea, FaInfoCircle } from 'react-icons/fa';
import '../../styles/Markets.css';

const ChartSelector = ({ activeChart, onChartTypeChange }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [infoType, setInfoType] = useState('');
  
  const chartTypes = [
    {
      id: 'candlestick',
      name: 'Candlestick',
      icon: <FaChartBar />,
      description: 'Displays open, high, low, and close prices with a visual body indicating open-close range. Helps identify market sentiment and potential reversals.'
    },
    {
      id: 'line',
      name: 'Line',
      icon: <FaChartLine />,
      description: 'Connects closing prices over time, forming a continuous line. Ideal for identifying long-term trends and providing a simplified view of price movements.'
    },
    {
      id: 'bar',
      name: 'Bar (OHLC)',
      icon: <FaChartArea />,
      description: 'Shows open, high, low, and close prices with vertical lines and horizontal ticks. Provides detailed view of price action, helping analyze volatility and price ranges.'
    }
  ];
  
  const handleInfoToggle = (type) => {
    if (infoType === type && showInfo) {
      setShowInfo(false);
    } else {
      setInfoType(type);
      setShowInfo(true);
    }
  };
  
  return (
    <div className="chart-type-selector">
      <div className="selector-title">Chart Type</div>
      
      <div className="chart-types">
        {chartTypes.map(type => (
          <div 
            key={type.id}
            className={`chart-type-option ${activeChart === type.id ? 'active' : ''}`}
          >
            <button 
              className="chart-type-button" 
              onClick={() => onChartTypeChange(type.id)}
              title={type.name}
            >
              {type.icon}
              <span>{type.name}</span>
            </button>
            
            <button 
              className="info-button"
              onClick={() => handleInfoToggle(type.id)}
              title="Learn more about this chart type"
            >
              <FaInfoCircle />
            </button>
            
            {showInfo && infoType === type.id && (
              <div className="chart-type-info">
                <div className="info-content">
                  <h4>{type.name} Chart</h4>
                  <p>{type.description}</p>
                </div>
                <div className="info-arrow"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartSelector; 