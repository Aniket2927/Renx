import React, { useState, useEffect } from 'react';
import PortfolioCard from './PortfolioCard';
import PLCard from './PLCard';
import MarketTicker from './MarketTicker';
import WatchlistTable from './WatchlistTable';
import CandlestickChart from './CandlestickChart';
import AIPredictionChart from './AIPredictionChart';
import AISignalTag from './AISignalTag';
import SentimentAnalysis from './SentimentAnalysis';
import CorrelationMatrix from './CorrelationMatrix';
import marketDataService from '../../services/marketDataService';
import AITradingWidget from './AITradingWidget';
import aiService from '../../services/ai/aiService';

const PORTFOLIO_SYMBOL = 'AAPL';
const WATCHLIST_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [plData, setPLData] = useState(null);
  const [watchlistData, setWatchlistData] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(PORTFOLIO_SYMBOL);
  const [historicalData, setHistoricalData] = useState([]);
  const [aiPredictions, setAiPredictions] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        // Fetch portfolio (main symbol) quote
        const portfolioQuote = await marketDataService.getQuote(PORTFOLIO_SYMBOL);
        // Fetch watchlist quotes
        const watchlistQuotes = await marketDataService.getBatchQuotes(WATCHLIST_SYMBOLS);
        // Fetch historical data for selected symbol
        const history = await marketDataService.getTimeSeries(selectedSymbol);
        
        // Fetch AI predictions
        const predictions = await aiService.getPrediction(selectedSymbol, history);
        
        // Fetch sentiment analysis
        const sentiment = await aiService.getSentiment(selectedSymbol);

        if (!isMounted) return;

        // Portfolio Card
        setPortfolioData({
          value: parseFloat(portfolioQuote.close),
          change: parseFloat(portfolioQuote.percent_change),
          changeAmount: parseFloat(portfolioQuote.change)
        });

        // P/L Card
        setPLData({
          todayPL: parseFloat(portfolioQuote.change),
          percentage: parseFloat(portfolioQuote.percent_change),
          isPositive: parseFloat(portfolioQuote.change) >= 0
        });

        // Watchlist Table
        setWatchlistData(
          watchlistQuotes.map(q => ({
            symbol: q.symbol,
            price: parseFloat(q.close),
            change: parseFloat(q.percent_change),
            volume: q.volume || '-',
            name: q.name || ''
          }))
        );

        // Historical Data
        setHistoricalData(history);
        
        // AI Predictions
        setAiPredictions(predictions);
        
        // Sentiment Data
        setSentimentData(sentiment);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch market data.');
        setLoading(false);
      }
    }

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedSymbol]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PortfolioCard data={portfolioData} />
        <PLCard data={plData} />
      </div>

      {/* Market Ticker */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <MarketTicker data={watchlistData} />
      </div>

      {/* Chart and Watchlist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart - Takes 2/3 of the space */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <AIPredictionChart 
              symbol={selectedSymbol} 
              historicalData={historicalData}
              predictions={aiPredictions}
            />
          </div>
          {/* AI/ML Features Section */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <AITradingWidget 
              symbol={selectedSymbol}
              predictions={aiPredictions}
            />
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <CandlestickChart symbol={selectedSymbol} />
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <CorrelationMatrix symbols={WATCHLIST_SYMBOLS} />
          </div>
        </div>

        {/* Watchlist and AI Analysis - Takes 1/3 of the space */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <WatchlistTable 
              data={watchlistData} 
              onSelectSymbol={setSelectedSymbol} 
              selectedSymbol={selectedSymbol} 
            />
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">AI Trading Signal</h3>
              <AISignalTag 
                symbol={selectedSymbol} 
                features={historicalData.map(d => d.y[3])} 
                predictions={aiPredictions}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">News Sentiment</h3>
              <SentimentAnalysis 
                symbol={selectedSymbol}
                sentimentData={sentimentData}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 