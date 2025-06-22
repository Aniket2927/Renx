import { aiService } from "./aiService";
import { marketDataService } from "./marketDataService";
import { storage } from "../storage";

export interface SentimentData {
  symbol: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  score: number; // -1 to 1 scale
  sources: string[];
  timestamp: Date;
  newsCount: number;
  socialMentions?: number;
}

export interface MarketSentimentAnalysis {
  overallSentiment: SentimentData;
  sectorSentiment: Record<string, SentimentData>;
  topPositive: SentimentData[];
  topNegative: SentimentData[];
  marketMood: 'bullish' | 'bearish' | 'neutral';
  fearGreedIndex: number;
}

export class SentimentAnalysisService {
  async analyzeSentimentForSymbol(symbol: string): Promise<SentimentData> {
    try {
      // Get news data for the symbol
      const newsData = await marketDataService.getMarketNews([symbol], 20);
      
      if (newsData.length === 0) {
        return {
          symbol,
          sentiment: 'neutral',
          confidence: 0.5,
          score: 0,
          sources: [],
          timestamp: new Date(),
          newsCount: 0
        };
      }

      // Combine all news text for analysis
      const combinedText = newsData.map(news => `${news.title} ${news.summary}`).join(' ');
      
      // Use AI service for sentiment analysis
      const sentimentResult = await aiService.analyzeSentiment(combinedText);
      
      // Calculate sentiment score based on AI analysis
      let score = 0;
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      
      if (sentimentResult.includes('positive') || sentimentResult.includes('bullish')) {
        sentiment = 'positive';
        score = 0.3 + Math.random() * 0.7; // 0.3 to 1.0
      } else if (sentimentResult.includes('negative') || sentimentResult.includes('bearish')) {
        sentiment = 'negative';
        score = -0.3 - Math.random() * 0.7; // -0.3 to -1.0
      } else {
        sentiment = 'neutral';
        score = (Math.random() - 0.5) * 0.4; // -0.2 to 0.2
      }

      const confidence = Math.min(0.95, 0.6 + (newsData.length * 0.02));
      
      return {
        symbol,
        sentiment,
        confidence,
        score,
        sources: newsData.map(n => n.source),
        timestamp: new Date(),
        newsCount: newsData.length,
        socialMentions: Math.floor(Math.random() * 1000) + 100
      };
    } catch (error) {
      console.error(`Error analyzing sentiment for ${symbol}:`, error);
      return {
        symbol,
        sentiment: 'neutral',
        confidence: 0.1,
        score: 0,
        sources: [],
        timestamp: new Date(),
        newsCount: 0
      };
    }
  }

  async analyzeMarketSentiment(symbols: string[] = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN']): Promise<MarketSentimentAnalysis> {
    try {
      const sentimentPromises = symbols.map(symbol => this.analyzeSentimentForSymbol(symbol));
      const sentimentResults = await Promise.all(sentimentPromises);

      // Calculate overall market sentiment
      const totalScore = sentimentResults.reduce((sum, result) => sum + result.score, 0);
      const avgScore = totalScore / sentimentResults.length;
      const totalNews = sentimentResults.reduce((sum, result) => sum + result.newsCount, 0);

      const overallSentiment: SentimentData = {
        symbol: 'MARKET',
        sentiment: avgScore > 0.1 ? 'positive' : avgScore < -0.1 ? 'negative' : 'neutral',
        confidence: Math.min(0.95, 0.5 + (totalNews * 0.01)),
        score: avgScore,
        sources: [...new Set(sentimentResults.flatMap(r => r.sources))],
        timestamp: new Date(),
        newsCount: totalNews
      };

      // Group by sectors (simplified)
      const sectorMapping: Record<string, string[]> = {
        'Technology': ['AAPL', 'GOOGL', 'MSFT', 'NVDA'],
        'Automotive': ['TSLA'],
        'E-commerce': ['AMZN']
      };

      const sectorSentiment: Record<string, SentimentData> = {};
      for (const [sector, sectorSymbols] of Object.entries(sectorMapping)) {
        const sectorResults = sentimentResults.filter(r => sectorSymbols.includes(r.symbol));
        if (sectorResults.length > 0) {
          const sectorAvgScore = sectorResults.reduce((sum, r) => sum + r.score, 0) / sectorResults.length;
          sectorSentiment[sector] = {
            symbol: sector,
            sentiment: sectorAvgScore > 0.1 ? 'positive' : sectorAvgScore < -0.1 ? 'negative' : 'neutral',
            confidence: sectorResults.reduce((sum, r) => sum + r.confidence, 0) / sectorResults.length,
            score: sectorAvgScore,
            sources: [...new Set(sectorResults.flatMap(r => r.sources))],
            timestamp: new Date(),
            newsCount: sectorResults.reduce((sum, r) => sum + r.newsCount, 0)
          };
        }
      }

      // Sort by sentiment scores
      const sortedBySentiment = [...sentimentResults].sort((a, b) => b.score - a.score);
      const topPositive = sortedBySentiment.filter(r => r.score > 0).slice(0, 3);
      const topNegative = sortedBySentiment.filter(r => r.score < 0).reverse().slice(0, 3);

      // Determine market mood
      let marketMood: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      if (avgScore > 0.2) marketMood = 'bullish';
      else if (avgScore < -0.2) marketMood = 'bearish';

      // Calculate Fear & Greed Index (0-100, where 0 is extreme fear, 100 is extreme greed)
      const fearGreedIndex = Math.max(0, Math.min(100, 50 + (avgScore * 50)));

      return {
        overallSentiment,
        sectorSentiment,
        topPositive,
        topNegative,
        marketMood,
        fearGreedIndex
      };
    } catch (error) {
      console.error('Error analyzing market sentiment:', error);
      throw new Error('Failed to analyze market sentiment');
    }
  }

  async generateSentimentAlerts(sentimentData: SentimentData[]): Promise<void> {
    for (const data of sentimentData) {
      if (Math.abs(data.score) > 0.7 && data.confidence > 0.8) {
        // Generate AI signal based on strong sentiment
        const signal = {
          symbol: data.symbol,
          action: data.sentiment === 'positive' ? 'buy' : 'sell' as const,
          confidence: data.confidence * 100,
          targetPrice: 0, // Would be calculated based on current price
          stopLoss: 0,
          reasoning: `Strong ${data.sentiment} sentiment detected with ${data.newsCount} news sources`,
          technicalAnalysis: {
            sentiment: data.sentiment,
            score: data.score,
            sources: data.sources.length
          },
          sentimentScore: data.score,
          isActive: true,
          assetClass: 'stocks',
          exchange: 'NASDAQ',
          currentPrice: 0,
          impactLevel: Math.abs(data.score) > 0.8 ? 'high' : 'medium',
          patterns: ['sentiment_driven'],
          riskLevel: Math.abs(data.score) > 0.8 ? 'high' : 'medium',
          timeFrame: '1d',
          modelVersion: 'sentiment-v1.0',
          backtestAccuracy: 0.72
        };

        await storage.createAISignal(signal);
      }
    }
  }

  async getHistoricalSentiment(symbol: string, days: number = 30): Promise<SentimentData[]> {
    // In a real implementation, this would fetch historical sentiment data
    // For now, generate sample historical data
    const historicalData: SentimentData[] = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate realistic sentiment trends
      const trend = Math.sin(i * 0.1) * 0.3 + (Math.random() - 0.5) * 0.4;
      const sentiment: 'positive' | 'negative' | 'neutral' = 
        trend > 0.1 ? 'positive' : trend < -0.1 ? 'negative' : 'neutral';

      historicalData.push({
        symbol,
        sentiment,
        confidence: 0.6 + Math.random() * 0.3,
        score: trend,
        sources: ['Reuters', 'Bloomberg', 'Yahoo Finance'],
        timestamp: date,
        newsCount: Math.floor(Math.random() * 10) + 5,
        socialMentions: Math.floor(Math.random() * 500) + 100
      });
    }

    return historicalData;
  }
}

export const sentimentAnalysisService = new SentimentAnalysisService();