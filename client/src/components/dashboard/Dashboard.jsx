import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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

const WATCHLIST_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');

  // Fetch real portfolio data from backend
  const { data: portfolioData, isLoading: portfolioLoading, error: portfolioError } = useQuery({
    queryKey: ['portfolio-summary'],
    queryFn: async () => {
      const response = await fetch('/api/portfolio/summary');
      if (!response.ok) throw new Error('Failed to fetch portfolio data');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch real P&L data from backend
  const { data: plData, isLoading: plLoading, error: plError } = useQuery({
    queryKey: ['portfolio-pnl'],
    queryFn: async () => {
      const response = await fetch('/api/portfolio/pnl');
      if (!response.ok) throw new Error('Failed to fetch P&L data');
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch watchlist data
  const { data: watchlistData, isLoading: watchlistLoading } = useQuery({
    queryKey: ['watchlist-quotes', WATCHLIST_SYMBOLS],
    queryFn: () => marketDataService.getBatchQuotes(WATCHLIST_SYMBOLS),
    refetchInterval: 30000,
    select: (data) => data.map(q => ({
      symbol: q.symbol,
      price: parseFloat(q.close),
      change: parseFloat(q.percent_change),
      volume: q.volume || '-',
      name: q.name || ''
    }))
  });

  // Fetch historical data for selected symbol
  const { data: historicalData } = useQuery({
    queryKey: ['historical-data', selectedSymbol],
    queryFn: () => marketDataService.getTimeSeries(selectedSymbol),
    enabled: !!selectedSymbol,
  });

  // Fetch AI predictions for selected symbol
  const { data: aiPredictions } = useQuery({
    queryKey: ['ai-predictions', selectedSymbol, historicalData],
    queryFn: () => aiService.getPrediction(selectedSymbol, historicalData),
    enabled: !!selectedSymbol && !!historicalData,
  });

  // Fetch sentiment analysis for selected symbol
  const { data: sentimentData } = useQuery({
    queryKey: ['sentiment-analysis', selectedSymbol],
    queryFn: () => aiService.getSentiment(selectedSymbol),
    enabled: !!selectedSymbol,
  });

  const isLoading = portfolioLoading || plLoading || watchlistLoading;
  const hasError = portfolioError || plError;

  if (isLoading && !portfolioData && !plData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PortfolioCard 
          data={portfolioData} 
          isLoading={portfolioLoading} 
          error={portfolioError} 
        />
        <PLCard 
          data={plData} 
          isLoading={plLoading} 
          error={plError} 
        />
      </div>

      {/* Market Ticker */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <MarketTicker data={watchlistData || []} />
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
              data={watchlistData || []} 
              onSelectSymbol={setSelectedSymbol} 
              selectedSymbol={selectedSymbol} 
            />
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">AI Trading Signal</h3>
              <AISignalTag 
                symbol={selectedSymbol} 
                features={historicalData?.map(d => d.y[3]) || []} 
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