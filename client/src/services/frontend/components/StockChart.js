import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import stockService from '../services/stockService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StockChart = ({ symbol }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await stockService.getChartData(symbol);
        
        if (response.success && response.data) {
          const { values } = response.data;
          
          // Prepare data for Chart.js
          const chartData = {
            labels: values.map(item => item.datetime),
            datasets: [
              {
                label: `${symbol} Price`,
                data: values.map(item => parseFloat(item.close)),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
              }
            ]
          };
          
          setChartData(chartData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  if (loading) return <div>Loading chart data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!chartData) return <div>No data available</div>;

  return (
    <div className="stock-chart">
      <h2>{symbol} Price Chart</h2>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: `${symbol} Price History`
            }
          },
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }}
      />
    </div>
  );
};

export default StockChart; 