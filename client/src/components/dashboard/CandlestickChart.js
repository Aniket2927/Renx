import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import marketDataService from '../../services/marketDataService';

const CandlestickChart = ({ symbol = 'AAPL' }) => {
  const [chartData, setChartData] = useState({
    series: [{ data: [] }],
    options: {
      chart: {
        type: 'candlestick',
        height: 400,
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
        text: `${symbol} Price Chart`,
        align: 'left'
      },
      xaxis: {
        type: 'datetime'
      },
      yaxis: {
        tooltip: {
          enabled: true
        }
      }
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setChartData(prev => ({
      ...prev,
      title: { text: `${symbol} Price Chart`, align: 'left' }
    }));

    async function fetchOHLC() {
      try {
        const ohlc = await marketDataService.getTimeSeries(symbol, '1day', 30);
        if (!isMounted) return;
        setChartData(prev => ({
          ...prev,
          series: [{ data: ohlc }],
          options: {
            ...prev.options,
            title: { text: `${symbol} Price Chart`, align: 'left' }
          }
        }));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch chart data.');
        setLoading(false);
      }
    }
    fetchOHLC();
    // Optionally, refresh every 60 seconds
    const interval = setInterval(fetchOHLC, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="candlestick"
        height={400}
      />
    </div>
  );
};

export default CandlestickChart; 