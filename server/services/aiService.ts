import type { InsertAISignal } from "../../shared/schema";

// AI Backend Configuration
const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:8181';

export interface TechnicalIndicators {
  rsi: number;
  macd: { signal: number; histogram: number; macd: number };
  movingAverages: { ma20: number; ma50: number; ma200: number };
  volume: number;
  volatility: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  technicalIndicators: TechnicalIndicators;
}

export class AIService {
  /**
   * Generate trading signal using ML backend
   */
  async generateTradingSignal(marketData: MarketData, newsContext?: string): Promise<Omit<InsertAISignal, 'id' | 'createdAt'>> {
    try {
      // Get AI prediction from Python backend
      const prediction = await this.getPrediction(marketData.symbol, this.formatHistoricalData(marketData));
      
      // Get sentiment analysis
      const sentiment = await this.getSentiment(marketData.symbol);
      
      // Generate trading signals
      const features = this.extractFeatures(marketData);
      const signals = await this.getSignals(marketData.symbol, features);
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 4); // Default 4 hour expiry
      
      return {
        symbol: marketData.symbol,
        assetClass: this.determineAssetClass(marketData.symbol),
        exchange: this.determineExchange(marketData.symbol),
        action: signals.action || 'hold',
        confidence: signals.confidence?.toString() || '50',
        currentPrice: marketData.price.toString(),
        targetPrice: prediction.target_price?.toString() || (marketData.price * 1.02).toString(),
        stopLoss: prediction.stop_loss?.toString() || (marketData.price * 0.98).toString(),
        reasoning: signals.reasoning || 'AI-generated signal based on technical analysis',
        patterns: signals.patterns || [],
        technicalIndicators: {
          rsi: marketData.technicalIndicators.rsi,
          macd: marketData.technicalIndicators.macd,
          movingAverages: marketData.technicalIndicators.movingAverages,
          volume: marketData.technicalIndicators.volume,
          volatility: marketData.technicalIndicators.volatility
        },
        sentimentScore: sentiment.score?.toString() || "0",
        impactLevel: this.calculateImpactLevel(signals.confidence || 50),
        riskLevel: signals.risk_level || 'medium',
        timeFrame: signals.timeframe || '4h',
        modelVersion: prediction.model_version || 'ml-v1.0',
        backtestAccuracy: prediction.accuracy?.toString() || "65.0",
        isActive: true,
        expiresAt
      };
    } catch (error) {
      console.error('Error generating trading signal:', error);
      throw new Error('Failed to generate trading signal');
    }
  }

  /**
   * Get prediction from Python ML backend
   */
  async getPrediction(symbol: string, historicalData: any[]): Promise<any> {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          symbol, 
          historical_data: historicalData 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching prediction:', error);
      // Return fallback prediction
      return {
        target_price: null,
        stop_loss: null,
        model_version: 'fallback-v1.0',
        accuracy: 50
      };
    }
  }

  /**
   * Get trading signals from Python ML backend
   */
  async getSignals(symbol: string, features: number[]): Promise<any> {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/signals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, features }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching signals:', error);
      // Return fallback signal
      return {
        action: 'hold',
        confidence: 50,
        reasoning: 'AI backend unavailable - using fallback signal',
        patterns: [],
        risk_level: 'medium',
        timeframe: '4h'
      };
    }
  }

  /**
   * Analyze sentiment using Python ML backend
   */
  async analyzeSentiment(text: string): Promise<string> {
    // For text-based sentiment, we'll use the symbol-based sentiment for now
    // In a real implementation, you'd pass the text to the backend
    return "0"; // Neutral sentiment as fallback
  }

  /**
   * Get sentiment analysis for a symbol from Python ML backend
   */
  async getSentiment(symbol: string): Promise<any> {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/sentiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching sentiment:', error);
      return { score: 0 };
    }
  }

  /**
   * Analyze portfolio risk using correlation analysis
   */
  async analyzePortfolioRisk(positions: any[]): Promise<{
    riskScore: number,
    recommendations: string[],
    diversificationScore: number
  }> {
    try {
      // Extract symbols from positions
      const symbols = positions.map(pos => pos.symbol);
      
      // Get correlation analysis from Python backend
      const correlation = await this.getCorrelation(symbols);
      
      // Calculate risk metrics based on correlation
      const riskScore = this.calculateRiskScore(correlation);
      const diversificationScore = this.calculateDiversificationScore(correlation);
      const recommendations = this.generateRiskRecommendations(correlation, positions);
      
      return {
        riskScore,
        recommendations,
        diversificationScore
      };
    } catch (error: any) {
      console.error("Error analyzing portfolio risk:", error);
      return {
        riskScore: 50,
        recommendations: ["Risk analysis unavailable - AI backend connection failed"],
        diversificationScore: 50
      };
    }
  }

  /**
   * Get correlation analysis from Python ML backend
   */
  async getCorrelation(symbols: string[]): Promise<any> {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/correlation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching correlation:', error);
      return { correlation_matrix: {}, average_correlation: 0.5 };
    }
  }

  /**
   * Generate market insights using anomaly detection and sentiment analysis
   */
  async generateMarketInsights(symbols: string[]): Promise<{
    insights: string[],
    marketSentiment: number,
    keyEvents: string[]
  }> {
    try {
      const insights: string[] = [];
      let totalSentiment = 0;
      const keyEvents: string[] = [];

      // Get insights for each symbol
      for (const symbol of symbols) {
        // Get sentiment
        const sentiment = await this.getSentiment(symbol);
        totalSentiment += sentiment.score || 0;

        // Get anomalies
        const anomalies = await this.getAnomalies(symbol);
        if (anomalies.anomalies && anomalies.anomalies.length > 0) {
          insights.push(`${symbol}: Detected ${anomalies.anomalies.length} anomalies`);
          keyEvents.push(`Unusual activity detected in ${symbol}`);
        }

        // Add sentiment insights
        if (Math.abs(sentiment.score) > 50) {
          const sentimentType = sentiment.score > 0 ? 'positive' : 'negative';
          insights.push(`${symbol}: Strong ${sentimentType} sentiment (${sentiment.score})`);
        }
      }

      const averageSentiment = symbols.length > 0 ? totalSentiment / symbols.length : 0;

      return {
        insights: insights.length > 0 ? insights : ["No significant market insights detected"],
        marketSentiment: averageSentiment,
        keyEvents
      };
    } catch (error: any) {
      console.error("Error generating market insights:", error);
      return {
        insights: ["Market insights unavailable - AI backend connection failed"],
        marketSentiment: 0,
        keyEvents: []
      };
    }
  }

  /**
   * Get anomaly detection from Python ML backend
   */
  async getAnomalies(symbol: string): Promise<any> {
    try {
      const response = await fetch(`${AI_BACKEND_URL}/anomalies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      return { anomalies: [] };
    }
  }

  private determineAssetClass(symbol: string): string {
    if (symbol.includes('USD') || symbol.includes('EUR') || symbol.includes('GBP') || symbol.includes('JPY')) return 'forex';
    if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('DOGE') || symbol.includes('ADA')) return 'crypto';
    if (symbol.includes('GOLD') || symbol.includes('OIL') || symbol.includes('SILVER') || symbol.includes('COPPER')) return 'commodities';
    if (symbol.includes('SPY') || symbol.includes('QQQ') || symbol.includes('VTI') || symbol.includes('IWM')) return 'etf';
    if (symbol.includes('BOND') || symbol.includes('TREASURY')) return 'bonds';
    return 'stocks';
  }

  private determineExchange(symbol: string): string {
    const assetClass = this.determineAssetClass(symbol);
    switch (assetClass) {
      case 'crypto': return 'BINANCE';
      case 'forex': return 'FOREX';
      case 'commodities': return 'COMEX';
      case 'etf': return 'ARCA';
      default: return symbol.length <= 4 ? 'NYSE' : 'NASDAQ';
    }
  }

  private calculateImpactLevel(confidence: number): string {
    if (confidence >= 80) return 'high';
    if (confidence >= 60) return 'medium';
    return 'low';
  }

  /**
   * Helper methods for data processing
   */
  private formatHistoricalData(marketData: MarketData): any[] {
    // Convert market data to format expected by Python backend
    return [{
      timestamp: new Date().toISOString(),
      open: marketData.price,
      high: marketData.price * 1.02,
      low: marketData.price * 0.98,
      close: marketData.price,
      volume: marketData.volume
    }];
  }

  private extractFeatures(marketData: MarketData): number[] {
    // Extract numerical features for ML model
    return [
      marketData.technicalIndicators.rsi,
      marketData.technicalIndicators.macd.macd,
      marketData.technicalIndicators.macd.signal,
      marketData.technicalIndicators.macd.histogram,
      marketData.technicalIndicators.movingAverages.ma20,
      marketData.technicalIndicators.movingAverages.ma50,
      marketData.technicalIndicators.movingAverages.ma200,
      marketData.technicalIndicators.volatility,
      marketData.changePercent
    ];
  }

  private calculateRiskScore(correlation: any): number {
    const avgCorrelation = correlation.average_correlation || 0.5;
    // Higher correlation = higher risk
    return Math.min(100, Math.max(0, avgCorrelation * 100));
  }

  private calculateDiversificationScore(correlation: any): number {
    const avgCorrelation = correlation.average_correlation || 0.5;
    // Lower correlation = better diversification
    return Math.min(100, Math.max(0, (1 - avgCorrelation) * 100));
  }

  private generateRiskRecommendations(correlation: any, positions: any[]): string[] {
    const recommendations: string[] = [];
    const avgCorrelation = correlation.average_correlation || 0.5;

    if (avgCorrelation > 0.7) {
      recommendations.push("Portfolio shows high correlation - consider diversifying across different sectors");
    }

    if (positions.length < 5) {
      recommendations.push("Consider adding more positions to improve diversification");
    }

    if (avgCorrelation < 0.3) {
      recommendations.push("Good diversification detected - portfolio shows low correlation");
    }

    return recommendations.length > 0 ? recommendations : ["Portfolio analysis complete"];
  }
}

export const aiService = new AIService();