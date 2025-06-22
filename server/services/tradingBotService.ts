import { db } from "../db";
import { storage } from "../storage";
import { aiService } from "./aiService";
import { marketDataService } from "./marketDataService";
import { tradingService } from "./tradingService";
import type { TradingBot, InsertTradingBot } from "../../shared/schema";
import { tradingBots, aiSignals, orders } from "../../shared/schema";
import { eq, and } from "drizzle-orm";

export interface BotStrategy {
  type: 'momentum' | 'mean_reversion' | 'breakout' | 'ai_signals' | 'arbitrage';
  parameters: {
    indicators?: string[];
    thresholds?: Record<string, number>;
    timeframe?: string;
    maxPositions?: number;
    riskPerTrade?: number;
  };
}

export interface BotPerformanceMetrics {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  sharpeRatio: number;
  maxDrawdown: number;
  avgHoldTime: number;
  successfulSignals: number;
}

export class TradingBotService {
  async createBot(userId: string, botData: Omit<InsertTradingBot, 'userId'>): Promise<TradingBot> {
    const bot = await storage.createTradingBot({
      ...botData,
      userId,
      isActive: false,
      totalPnL: "0",
      totalTrades: 0,
      winRate: "0",
      performance: {
        sharpeRatio: 0,
        maxDrawdown: 0,
        avgHoldTime: 0,
        monthlyReturns: []
      }
    });

    return bot;
  }

  async startBot(botId: string, userId: string): Promise<void> {
    const bot = await storage.getTradingBot(botId);
    if (!bot || bot.userId !== userId) {
      throw new Error('Bot not found or unauthorized');
    }

    await storage.updateTradingBot(botId, { 
      isActive: true, 
      isAutomated: true 
    });

    // Start bot execution loop
    this.executeBotStrategy(botId);
  }

  async stopBot(botId: string, userId: string): Promise<void> {
    const bot = await storage.getTradingBot(botId);
    if (!bot || bot.userId !== userId) {
      throw new Error('Bot not found or unauthorized');
    }

    await storage.updateTradingBot(botId, { 
      isActive: false, 
      isAutomated: false 
    });
  }

  async executeBotStrategy(botId: string): Promise<void> {
    try {
      const bot = await storage.getTradingBot(botId);
      if (!bot || !bot.isActive || !bot.isAutomated) {
        return;
      }

      const strategy = bot.strategy as BotStrategy;
      const portfolio = await storage.getDefaultPortfolio(bot.userId);
      
      if (!portfolio) {
        console.error(`No default portfolio found for bot ${botId}`);
        return;
      }

      switch (strategy.type) {
        case 'ai_signals':
          await this.executeAISignalStrategy(bot, portfolio.id);
          break;
        case 'momentum':
          await this.executeMomentumStrategy(bot, portfolio.id);
          break;
        case 'mean_reversion':
          await this.executeMeanReversionStrategy(bot, portfolio.id);
          break;
        case 'breakout':
          await this.executeBreakoutStrategy(bot, portfolio.id);
          break;
        case 'arbitrage':
          await this.executeArbitrageStrategy(bot, portfolio.id);
          break;
      }

      // Update bot performance metrics
      await this.updateBotPerformance(botId);

      // Schedule next execution if bot is still active
      if (bot.isActive) {
        setTimeout(() => this.executeBotStrategy(botId), 60000); // Run every minute
      }
    } catch (error) {
      console.error(`Error executing bot strategy for ${botId}:`, error);
    }
  }

  private async executeAISignalStrategy(bot: TradingBot, portfolioId: string): Promise<void> {
    // Get active AI signals for supported asset classes
    const signals = await db
      .select()
      .from(aiSignals)
      .where(
        and(
          eq(aiSignals.isActive, true),
          eq(aiSignals.confidence, '> 75') // High confidence signals only
        )
      )
      .limit(10);

    for (const signal of signals) {
      if (!bot.assetClasses?.includes(signal.assetClass)) continue;

      const currentPositions = await storage.getPortfolioPositions(portfolioId);
      if (currentPositions.length >= (bot.maxPositions || 5)) continue;

      // Check if we already have a position in this symbol
      const existingPosition = currentPositions.find(p => p.symbol === signal.symbol);
      if (existingPosition) continue;

      // Execute trade based on signal
      if (signal.action === 'buy') {
        await this.executeBotTrade(bot, portfolioId, {
          symbol: signal.symbol,
          side: 'buy',
          quantity: this.calculatePositionSize(bot, signal.currentPrice),
          orderType: 'market'
        });
      }
    }
  }

  private async executeMomentumStrategy(bot: TradingBot, portfolioId: string): Promise<void> {
    const strategy = bot.strategy as BotStrategy;
    const symbols = await this.getWatchlistSymbols(bot.userId);

    for (const symbol of symbols) {
      const marketData = await marketDataService.getStockQuote(symbol);
      const technicals = await marketDataService.getTechnicalIndicators(symbol);

      // Momentum criteria: RSI > 70, MACD positive, strong volume
      if (
        technicals.rsi > (strategy.parameters.thresholds?.rsi || 70) &&
        technicals.macd.macd > technicals.macd.signal &&
        technicals.volume > (strategy.parameters.thresholds?.volume || 1.5)
      ) {
        await this.executeBotTrade(bot, portfolioId, {
          symbol,
          side: 'buy',
          quantity: this.calculatePositionSize(bot, marketData.price.toString()),
          orderType: 'market'
        });
      }
    }
  }

  private async executeMeanReversionStrategy(bot: TradingBot, portfolioId: string): Promise<void> {
    const strategy = bot.strategy as BotStrategy;
    const symbols = await this.getWatchlistSymbols(bot.userId);

    for (const symbol of symbols) {
      const technicals = await marketDataService.getTechnicalIndicators(symbol);

      // Mean reversion: RSI < 30, price below lower Bollinger Band
      if (
        technicals.rsi < (strategy.parameters.thresholds?.rsi || 30) &&
        technicals.bollinger.lower > 0
      ) {
        const marketData = await marketDataService.getStockQuote(symbol);
        if (marketData.price < technicals.bollinger.lower) {
          await this.executeBotTrade(bot, portfolioId, {
            symbol,
            side: 'buy',
            quantity: this.calculatePositionSize(bot, marketData.price.toString()),
            orderType: 'limit',
            price: technicals.bollinger.middle.toString()
          });
        }
      }
    }
  }

  private async executeBreakoutStrategy(bot: TradingBot, portfolioId: string): Promise<void> {
    const strategy = bot.strategy as BotStrategy;
    const symbols = await this.getWatchlistSymbols(bot.userId);

    for (const symbol of symbols) {
      const marketData = await marketDataService.getStockQuote(symbol);
      const technicals = await marketDataService.getTechnicalIndicators(symbol);

      // Breakout: price above upper Bollinger Band with high volume
      if (
        marketData.price > technicals.bollinger.upper &&
        technicals.volume > (strategy.parameters.thresholds?.volume || 2.0)
      ) {
        await this.executeBotTrade(bot, portfolioId, {
          symbol,
          side: 'buy',
          quantity: this.calculatePositionSize(bot, marketData.price.toString()),
          orderType: 'market'
        });
      }
    }
  }

  private async executeArbitrageStrategy(bot: TradingBot, portfolioId: string): Promise<void> {
    // Multi-exchange arbitrage for crypto assets
    const cryptoSymbols = ['BTC', 'ETH', 'ADA', 'DOT'];
    
    for (const symbol of cryptoSymbols) {
      try {
        const binanceData = await marketDataService.getCryptoQuote(`${symbol}USDT`);
        // Simulate another exchange price (in real implementation, use actual exchange APIs)
        const alternatePrice = binanceData.price * (1 + (Math.random() - 0.5) * 0.02);
        
        const priceDiff = Math.abs(binanceData.price - alternatePrice) / binanceData.price;
        
        if (priceDiff > 0.01) { // 1% arbitrage opportunity
          const side = binanceData.price < alternatePrice ? 'buy' : 'sell';
          await this.executeBotTrade(bot, portfolioId, {
            symbol: `${symbol}USDT`,
            side,
            quantity: this.calculatePositionSize(bot, binanceData.price.toString()),
            orderType: 'market'
          });
        }
      } catch (error) {
        console.error(`Arbitrage error for ${symbol}:`, error);
      }
    }
  }

  private async executeBotTrade(
    bot: TradingBot, 
    portfolioId: string, 
    orderRequest: {
      symbol: string;
      side: 'buy' | 'sell';
      quantity: string;
      orderType: 'market' | 'limit';
      price?: string;
    }
  ): Promise<void> {
    try {
      const result = await tradingService.placeOrder({
        portfolioId,
        ...orderRequest,
        timeInForce: 'day'
      }, bot.userId);

      // Update bot statistics
      await storage.updateTradingBot(bot.id, {
        totalTrades: (bot.totalTrades || 0) + 1
      });

      console.log(`Bot ${bot.id} executed trade:`, result);
    } catch (error) {
      console.error(`Bot trade execution failed:`, error);
    }
  }

  private calculatePositionSize(bot: TradingBot, price: string): string {
    const riskPerTrade = parseFloat(bot.maxRiskPerTrade || "2.0") / 100;
    const portfolioValue = 100000; // Should get from actual portfolio
    const maxRiskAmount = portfolioValue * riskPerTrade;
    const shares = Math.floor(maxRiskAmount / parseFloat(price));
    return Math.max(1, shares).toString();
  }

  private async getWatchlistSymbols(userId: string): Promise<string[]> {
    const watchlists = await storage.getUserWatchlists(userId);
    const symbols = watchlists.flatMap(w => w.symbols || []);
    return Array.from(new Set(symbols)); // Remove duplicates
  }

  private async updateBotPerformance(botId: string): Promise<void> {
    try {
      const bot = await storage.getTradingBot(botId);
      if (!bot) return;

      const portfolio = await storage.getDefaultPortfolio(bot.userId);
      if (!portfolio) return;

      const orders = await storage.getPortfolioOrders(portfolio.id);
      const filledOrders = orders.filter(o => o.status === 'filled');

      if (filledOrders.length > 0) {
        const totalPnL = filledOrders.reduce((sum, order) => {
          const pnl = parseFloat(order.filledPrice || "0") - parseFloat(order.price || "0");
          return sum + pnl * parseFloat(order.filledQuantity || "0");
        }, 0);

        const winningTrades = filledOrders.filter(o => {
          const pnl = parseFloat(o.filledPrice || "0") - parseFloat(o.price || "0");
          return pnl > 0;
        }).length;

        const winRate = (winningTrades / filledOrders.length) * 100;

        await storage.updateTradingBot(botId, {
          totalPnL: totalPnL.toString(),
          winRate: winRate.toString(),
          totalTrades: filledOrders.length,
          performance: {
            ...bot.performance as any,
            lastUpdated: new Date().toISOString(),
            sharpeRatio: this.calculateSharpeRatio(filledOrders),
            maxDrawdown: this.calculateMaxDrawdown(filledOrders)
          }
        });
      }
    } catch (error) {
      console.error(`Error updating bot performance for ${botId}:`, error);
    }
  }

  private calculateSharpeRatio(orders: any[]): number {
    if (orders.length < 2) return 0;
    
    const returns = orders.map(o => {
      const pnl = parseFloat(o.filledPrice || "0") - parseFloat(o.price || "0");
      return pnl / parseFloat(o.price || "1");
    });

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    return stdDev > 0 ? avgReturn / stdDev : 0;
  }

  private calculateMaxDrawdown(orders: any[]): number {
    let maxDrawdown = 0;
    let peak = 0;
    let runningPnL = 0;

    for (const order of orders) {
      const pnl = parseFloat(order.filledPrice || "0") - parseFloat(order.price || "0");
      runningPnL += pnl;
      
      if (runningPnL > peak) {
        peak = runningPnL;
      }
      
      const drawdown = (peak - runningPnL) / Math.max(peak, 1);
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown;
  }

  async getBotPerformance(botId: string): Promise<BotPerformanceMetrics> {
    const bot = await storage.getTradingBot(botId);
    if (!bot) {
      throw new Error('Bot not found');
    }

    return {
      totalTrades: bot.totalTrades || 0,
      winRate: parseFloat(bot.winRate || "0"),
      totalPnL: parseFloat(bot.totalPnL || "0"),
      sharpeRatio: (bot.performance as any)?.sharpeRatio || 0,
      maxDrawdown: (bot.performance as any)?.maxDrawdown || 0,
      avgHoldTime: (bot.performance as any)?.avgHoldTime || 0,
      successfulSignals: (bot.performance as any)?.successfulSignals || 0
    };
  }

  async getAllUserBots(userId: string): Promise<TradingBot[]> {
    return storage.getUserTradingBots(userId);
  }

  async cloneBot(botId: string, userId: string, newName: string): Promise<TradingBot> {
    const originalBot = await storage.getTradingBot(botId);
    if (!originalBot) {
      throw new Error('Bot not found');
    }

    return this.createBot(userId, {
      name: newName,
      description: `Cloned from ${originalBot.name}`,
      assetClasses: originalBot.assetClasses,
      strategy: originalBot.strategy,
      riskParameters: originalBot.riskParameters,
      maxPositions: originalBot.maxPositions,
      maxRiskPerTrade: originalBot.maxRiskPerTrade,
      modelVersion: originalBot.modelVersion
    });
  }
}

export const tradingBotService = new TradingBotService();