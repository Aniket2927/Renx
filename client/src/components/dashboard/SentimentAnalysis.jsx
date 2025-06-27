import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import aiService from '../../services/ai/aiService';

const SentimentAnalysis = ({ symbol }) => {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock news headlines for demonstration
  const mockHeadlines = [
    `${symbol} announces record quarterly earnings`,
    `Analysts raise price target for ${symbol}`,
    `${symbol} faces regulatory scrutiny`,
    `${symbol} expands into new markets`,
    `${symbol} stock reaches all-time high`
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function analyzeSentiment() {
      try {
        // Analyze each headline
        const sentiments = await Promise.all(
          mockHeadlines.map(headline => aiService.getSentiment(headline))
        );

        if (!isMounted) return;

        // Count sentiments
        const counts = sentiments.reduce((acc, curr) => {
          acc[curr.label] = (acc[curr.label] || 0) + 1;
          return acc;
        }, {});

        setSentimentData({
          series: Object.values(counts),
          options: {
            chart: {
              type: 'pie',
              height: 300
            },
            labels: Object.keys(counts),
            colors: ['#10B981', '#F59E0B', '#EF4444'],
            legend: {
              position: 'bottom'
            },
            title: {
              text: 'News Sentiment Analysis',
              align: 'center'
            }
          }
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to analyze sentiment');
        setLoading(false);
      }
    }

    analyzeSentiment();
    // Refresh every 15 minutes
    const interval = setInterval(analyzeSentiment, 15 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
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

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <ReactApexChart
        options={sentimentData.options}
        series={sentimentData.series}
        type="pie"
        height={300}
      />
    </div>
  );
};

export default SentimentAnalysis; 