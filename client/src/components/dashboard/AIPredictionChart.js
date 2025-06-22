import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import aiService from '../../services/ai/aiService';

const AIPredictionChart = ({ symbol, historicalData, predictions }) => {
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If predictions are passed as prop, use them
        if (predictions) {
          setPredictionData(predictions);
          setLoading(false);
          return;
        }
        
        // Otherwise fetch predictions
        if (historicalData && historicalData.length > 0) {
          const prices = historicalData.map(d => d.y[3]); // Get closing prices
          const prediction = await aiService.getPrediction(symbol, prices);
          if (prediction) {
            setPredictionData(prediction);
          }
        }
      } catch (err) {
        setError('Failed to fetch prediction');
        console.error('Prediction error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [symbol, historicalData, predictions]);

  const chartOptions = {
    chart: {
      type: 'candlestick',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    title: {
      text: '',
      align: 'left'
    },
    xaxis: {
      type: 'datetime',
      tooltip: {
        enabled: true,
        theme: 'dark',
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      labels: {
        formatter: (value) => `$${value.toFixed(2)}`
      }
    },
    annotations: {
      points: predictionData ? [{
        x: new Date().getTime(),
        y: predictionData.prediction,
        marker: {
          size: 6,
          fillColor: '#00E396',
          strokeColor: '#00E396',
          radius: 2
        },
        label: {
          borderColor: '#00E396',
          style: {
            color: '#fff',
            background: '#00E396'
          },
          text: `Prediction: $${predictionData.prediction.toFixed(2)}`
        }
      }] : []
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      style: {
        fontSize: '12px'
      },
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        return `
          <div class="p-2">
            <div class="font-bold">${new Date(data.x).toLocaleDateString()}</div>
            <div>Open: $${data.y[0].toFixed(2)}</div>
            <div>High: $${data.y[1].toFixed(2)}</div>
            <div>Low: $${data.y[2].toFixed(2)}</div>
            <div>Close: $${data.y[3].toFixed(2)}</div>
            ${predictionData && dataPointIndex === w.globals.initialSeries[seriesIndex].data.length - 1 ? 
              `<div class="mt-2 text-green-500">
                Prediction: $${predictionData.prediction.toFixed(2)}
                <br/>
                Confidence: ${(predictionData.confidence * 100).toFixed(1)}%
              </div>` : ''}
          </div>
        `;
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#00E396',
          downward: '#FF4560'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No historical data available</div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-lg p-0 overflow-hidden border border-gray-100">
      {/* Card Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
        <h2 className="text-xl font-bold text-gray-800">AI Prediction for {symbol}</h2>
        {predictionData && (
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 font-medium">Confidence</span>
            <span className="text-base font-bold text-green-600">{(predictionData.confidence * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
      {/* Chart Area */}
      <div className="w-full overflow-x-auto px-2 md:px-6 py-4" style={{ minHeight: 420 }}>
        <div className="relative">
          <ReactApexChart
            options={chartOptions}
            series={[{
              data: historicalData
            }]}
            type="candlestick"
            height={400}
          />
          {predictionData && (
            <div className="absolute top-4 right-4 bg-white/90 p-4 rounded-xl shadow-xl border border-green-100 flex flex-col items-end min-w-[140px]">
              <div className="text-xs font-semibold text-gray-500 mb-1">AI Prediction</div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                ${predictionData.prediction.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPredictionChart; 