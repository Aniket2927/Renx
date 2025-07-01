import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import aiService from '../../services/ai/aiService';

const SentimentAnalysis = ({ symbol }) => {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newsHeadlines, setNewsHeadlines] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchNewsAndAnalyzeSentiment() {
      try {
        // Fetch real news headlines from backend
        const response = await fetch(`/api/news/${symbol}`);
        if (!response.ok) {
          throw new Error('Failed to fetch news data');
        }
        
        const newsData = await response.json();
        
        if (!isMounted) return;
        
        setNewsHeadlines(newsData.headlines || []);
        
        if (newsData.headlines && newsData.headlines.length > 0) {
          // Analyze sentiment for each headline
          const sentiments = await Promise.all(
            newsData.headlines.map(headline => aiService.getSentiment(headline.title || headline))
          );

          // Count sentiments
          const counts = sentiments.reduce((acc, curr) => {
            const label = curr.label || curr.sentiment || 'neutral';
            acc[label] = (acc[label] || 0) + 1;
            return acc;
          }, {});

          setSentimentData({
            series: Object.values(counts),
            options: {
              chart: {
                type: 'pie',
                height: 300
              },
              labels: Object.keys(counts).map(label => 
                label.charAt(0).toUpperCase() + label.slice(1)
              ),
              colors: ['#10B981', '#F59E0B', '#EF4444'],
              legend: {
                position: 'bottom'
              },
              title: {
                text: `News Sentiment Analysis for ${symbol}`,
                align: 'center'
              },
              tooltip: {
                y: {
                  formatter: function(val) {
                    return val + " articles"
                  }
                }
              }
            }
          });
        } else {
          // No news available
          setSentimentData({
            series: [1],
            options: {
              chart: {
                type: 'pie',
                height: 300
              },
              labels: ['No Data'],
              colors: ['#95a5a6'],
              legend: {
                position: 'bottom'
              },
              title: {
                text: `No News Available for ${symbol}`,
                align: 'center'
              }
            }
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching news and analyzing sentiment:', err);
        setError('Failed to analyze sentiment');
        setLoading(false);
      }
    }

    if (symbol) {
      fetchNewsAndAnalyzeSentiment();
      // Refresh every 15 minutes
      const interval = setInterval(fetchNewsAndAnalyzeSentiment, 15 * 60 * 1000);
      
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [symbol]);

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Market Sentiment</h3>
        <p className="text-sm text-gray-600">
          Based on {newsHeadlines.length} recent news articles
        </p>
      </div>
      
      {sentimentData && (
        <ReactApexChart
          options={sentimentData.options}
          series={sentimentData.series}
          type="pie"
          height={300}
        />
      )}
      
      {newsHeadlines.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium mb-3">Recent Headlines</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {newsHeadlines.slice(0, 5).map((headline, index) => (
              <div key={index} className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                {headline.title || headline}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentAnalysis; 