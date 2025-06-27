import { marketDataService } from './marketDataService';
import { cacheService } from './cacheService';
import { auditService } from './auditService';

interface MarketSymbol {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  marketCap: number;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  pe: number;
  dividend: number;
  beta: number;
  lastUpdate: Date;
  isActive: boolean;
  isTradable: boolean;
}

interface MarketCategory {
  id: string;
  name: string;
  description: string;
  symbols: string[];
  color: string;
  icon: string;
}

interface MarketFilters {
  search?: string;
  exchange?: string;
  sector?: string;
  industry?: string;
  minPrice?: number;
  maxPrice?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  minVolume?: number;
  maxVolume?: number;
  hasDividend?: boolean;
  minPE?: number;
  maxPE?: number;
  sortBy?: 'symbol' | 'name' | 'price' | 'change' | 'volume' | 'marketCap';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface MarketStats {
  totalSymbols: number;
  activeSymbols: number;
  exchanges: string[];
  sectors: { name: string; count: number }[];
  topGainers: MarketSymbol[];
  topLosers: MarketSymbol[];
  mostActive: MarketSymbol[];
  marketSummary: {
    totalMarketCap: number;
    avgPE: number;
    totalVolume: number;
    advancingStocks: number;
    decliningStocks: number;
  };
}

export class MarketSelectorService {
  private symbols: Map<string, MarketSymbol> = new Map();
  private categories: Map<string, MarketCategory> = new Map();
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly DEFAULT_LIMIT = 50;
  private readonly MAX_LIMIT = 500;
  private readonly UPDATE_INTERVAL = 60000; // 1 minute
  private updateTimer?: NodeJS.Timeout;

  constructor() {
    this.initializeMarketData();
    this.startPeriodicUpdates();
  }

  /**
   * Search and filter market symbols
   */
  async searchSymbols(filters: MarketFilters): Promise<{
    symbols: MarketSymbol[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const cacheKey = `market_search:${JSON.stringify(filters)}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      let filteredSymbols = Array.from(this.symbols.values());

      // Apply filters
      filteredSymbols = this.applyFilters(filteredSymbols, filters);

      // Sort symbols
      filteredSymbols = this.sortSymbols(filteredSymbols, filters);

      // Pagination
      const page = Math.max(1, filters.page || 1);
      const limit = Math.min(filters.limit || this.DEFAULT_LIMIT, this.MAX_LIMIT);
      const total = filteredSymbols.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      
      const paginatedSymbols = filteredSymbols.slice(offset, offset + limit);

      const result = {
        symbols: paginatedSymbols,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };

      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);

      // Log search
      await auditService.logSecurityEvent({
        type: 'data_access',
        details: {
          action: 'market_search',
          filters: JSON.stringify(filters),
          resultCount: paginatedSymbols.length
        },
        severity: 'low'
      });

      return result;
    } catch (error) {
      console.error('Error searching symbols:', error);
      throw error;
    }
  }

  /**
   * Get symbol details by symbol
   */
  async getSymbolDetails(symbol: string): Promise<MarketSymbol | null> {
    try {
      const cacheKey = `symbol_details:${symbol}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const symbolData = this.symbols.get(symbol.toUpperCase());
      if (!symbolData) {
        return null;
      }

      // Update with latest market data
      const quote = await marketDataService.getStockQuote(symbol);
      symbolData.price = quote.price;
      symbolData.change = quote.change;
      symbolData.changePercent = quote.changePercent;
      symbolData.volume = quote.volume;
      symbolData.lastUpdate = new Date();

      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(symbolData), this.CACHE_TTL);

      return symbolData;
    } catch (error) {
      console.error('Error getting symbol details:', error);
      return null;
    }
  }

  /**
   * Get market categories
   */
  async getMarketCategories(): Promise<MarketCategory[]> {
    try {
      const cacheKey = 'market_categories';
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const categories = Array.from(this.categories.values());
      
      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(categories), this.CACHE_TTL * 2);

      return categories;
    } catch (error) {
      console.error('Error getting market categories:', error);
      throw error;
    }
  }

  /**
   * Get symbols by category
   */
  async getSymbolsByCategory(categoryId: string): Promise<MarketSymbol[]> {
    try {
      const category = this.categories.get(categoryId);
      if (!category) {
        return [];
      }

      const symbols = category.symbols
        .map(symbol => this.symbols.get(symbol))
        .filter(symbol => symbol !== undefined) as MarketSymbol[];

      return symbols;
    } catch (error) {
      console.error('Error getting symbols by category:', error);
      return [];
    }
  }

  /**
   * Get market statistics
   */
  async getMarketStats(): Promise<MarketStats> {
    try {
      const cacheKey = 'market_stats';
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const allSymbols = Array.from(this.symbols.values());
      const activeSymbols = allSymbols.filter(s => s.isActive);

      // Calculate sector distribution
      const sectorCounts = new Map<string, number>();
      activeSymbols.forEach(symbol => {
        const count = sectorCounts.get(symbol.sector) || 0;
        sectorCounts.set(symbol.sector, count + 1);
      });

      const sectors = Array.from(sectorCounts.entries()).map(([name, count]) => ({
        name,
        count
      }));

      // Get top performers
      const topGainers = [...activeSymbols]
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 10);

      const topLosers = [...activeSymbols]
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, 10);

      const mostActive = [...activeSymbols]
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 10);

      // Calculate market summary
      const totalMarketCap = activeSymbols.reduce((sum, s) => sum + s.marketCap, 0);
      const avgPE = activeSymbols
        .filter(s => s.pe > 0)
        .reduce((sum, s, _, arr) => sum + s.pe / arr.length, 0);
      const totalVolume = activeSymbols.reduce((sum, s) => sum + s.volume, 0);
      const advancingStocks = activeSymbols.filter(s => s.change > 0).length;
      const decliningStocks = activeSymbols.filter(s => s.change < 0).length;

      const stats: MarketStats = {
        totalSymbols: allSymbols.length,
        activeSymbols: activeSymbols.length,
        exchanges: [...new Set(activeSymbols.map(s => s.exchange))],
        sectors,
        topGainers,
        topLosers,
        mostActive,
        marketSummary: {
          totalMarketCap,
          avgPE,
          totalVolume,
          advancingStocks,
          decliningStocks
        }
      };

      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(stats), this.CACHE_TTL);

      return stats;
    } catch (error) {
      console.error('Error getting market stats:', error);
      throw error;
    }
  }

  /**
   * Get popular symbols
   */
  async getPopularSymbols(limit: number = 20): Promise<MarketSymbol[]> {
    try {
      const cacheKey = `popular_symbols:${limit}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get symbols with highest volume and market cap
      const symbols = Array.from(this.symbols.values())
        .filter(s => s.isActive && s.isTradable)
        .sort((a, b) => {
          const scoreA = (a.volume / a.avgVolume) * Math.log(a.marketCap);
          const scoreB = (b.volume / b.avgVolume) * Math.log(b.marketCap);
          return scoreB - scoreA;
        })
        .slice(0, limit);

      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(symbols), this.CACHE_TTL);

      return symbols;
    } catch (error) {
      console.error('Error getting popular symbols:', error);
      return [];
    }
  }

  /**
   * Get trending symbols
   */
  async getTrendingSymbols(limit: number = 10): Promise<MarketSymbol[]> {
    try {
      const cacheKey = `trending_symbols:${limit}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get symbols with highest volume relative to average
      const symbols = Array.from(this.symbols.values())
        .filter(s => s.isActive && s.isTradable && s.avgVolume > 0)
        .sort((a, b) => {
          const ratioA = a.volume / a.avgVolume;
          const ratioB = b.volume / b.avgVolume;
          return ratioB - ratioA;
        })
        .slice(0, limit);

      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(symbols), this.CACHE_TTL);

      return symbols;
    } catch (error) {
      console.error('Error getting trending symbols:', error);
      return [];
    }
  }

  /**
   * Apply filters to symbols
   */
  private applyFilters(symbols: MarketSymbol[], filters: MarketFilters): MarketSymbol[] {
    return symbols.filter(symbol => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (!symbol.symbol.toLowerCase().includes(search) &&
            !symbol.name.toLowerCase().includes(search)) {
          return false;
        }
      }

      // Exchange filter
      if (filters.exchange && symbol.exchange !== filters.exchange) {
        return false;
      }

      // Sector filter
      if (filters.sector && symbol.sector !== filters.sector) {
        return false;
      }

      // Industry filter
      if (filters.industry && symbol.industry !== filters.industry) {
        return false;
      }

      // Price filters
      if (filters.minPrice && symbol.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && symbol.price > filters.maxPrice) {
        return false;
      }

      // Market cap filters
      if (filters.minMarketCap && symbol.marketCap < filters.minMarketCap) {
        return false;
      }
      if (filters.maxMarketCap && symbol.marketCap > filters.maxMarketCap) {
        return false;
      }

      // Volume filters
      if (filters.minVolume && symbol.volume < filters.minVolume) {
        return false;
      }
      if (filters.maxVolume && symbol.volume > filters.maxVolume) {
        return false;
      }

      // Dividend filter
      if (filters.hasDividend && symbol.dividend <= 0) {
        return false;
      }

      // P/E filters
      if (filters.minPE && symbol.pe < filters.minPE) {
        return false;
      }
      if (filters.maxPE && symbol.pe > filters.maxPE) {
        return false;
      }

      return true;
    });
  }

  /**
   * Sort symbols based on criteria
   */
  private sortSymbols(symbols: MarketSymbol[], filters: MarketFilters): MarketSymbol[] {
    const sortBy = filters.sortBy || 'symbol';
    const sortOrder = filters.sortOrder || 'asc';

    return symbols.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'change':
          comparison = a.changePercent - b.changePercent;
          break;
        case 'volume':
          comparison = a.volume - b.volume;
          break;
        case 'marketCap':
          comparison = a.marketCap - b.marketCap;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Initialize market data with sample symbols
   */
  private async initializeMarketData(): Promise<void> {
    try {
      // Sample market symbols - in production, this would come from a data provider
      const sampleSymbols = [
        { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Consumer Electronics' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology', industry: 'Software' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Internet Services' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary', industry: 'E-commerce' },
        { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary', industry: 'Electric Vehicles' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Technology', industry: 'Semiconductors' },
        { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Social Media' },
        { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', sector: 'Financial Services', industry: 'Banking' },
        { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', sector: 'Healthcare', industry: 'Pharmaceuticals' },
        { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', sector: 'Financial Services', industry: 'Payment Processing' }
      ];

      for (const symbolData of sampleSymbols) {
        const marketSymbol: MarketSymbol = {
          ...symbolData,
          marketCap: Math.random() * 2000000000000, // Random market cap
          price: Math.random() * 500 + 10, // Random price between $10-$510
          change: (Math.random() - 0.5) * 20, // Random change ±$10
          changePercent: (Math.random() - 0.5) * 10, // Random change ±5%
          volume: Math.floor(Math.random() * 100000000), // Random volume
          avgVolume: Math.floor(Math.random() * 50000000), // Random avg volume
          pe: Math.random() * 50 + 5, // Random P/E between 5-55
          dividend: Math.random() > 0.5 ? Math.random() * 5 : 0, // Random dividend or 0
          beta: Math.random() * 2 + 0.5, // Random beta between 0.5-2.5
          lastUpdate: new Date(),
          isActive: true,
          isTradable: true
        };

        this.symbols.set(symbolData.symbol, marketSymbol);
      }

      // Initialize categories
      this.initializeCategories();

    } catch (error) {
      console.error('Error initializing market data:', error);
    }
  }

  /**
   * Initialize market categories
   */
  private initializeCategories(): void {
    const categories: MarketCategory[] = [
      {
        id: 'tech_giants',
        name: 'Tech Giants',
        description: 'Large technology companies',
        symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'],
        color: '#3B82F6',
        icon: 'cpu'
      },
      {
        id: 'ev_stocks',
        name: 'Electric Vehicles',
        description: 'Electric vehicle manufacturers',
        symbols: ['TSLA'],
        color: '#10B981',
        icon: 'zap'
      },
      {
        id: 'financial',
        name: 'Financial Services',
        description: 'Banks and financial institutions',
        symbols: ['JPM', 'V'],
        color: '#F59E0B',
        icon: 'dollar-sign'
      },
      {
        id: 'healthcare',
        name: 'Healthcare',
        description: 'Healthcare and pharmaceutical companies',
        symbols: ['JNJ'],
        color: '#EF4444',
        icon: 'heart'
      },
      {
        id: 'semiconductors',
        name: 'Semiconductors',
        description: 'Chip manufacturers and semiconductor companies',
        symbols: ['NVDA'],
        color: '#8B5CF6',
        icon: 'chip'
      }
    ];

    categories.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  /**
   * Start periodic market data updates
   */
  private startPeriodicUpdates(): void {
    this.updateTimer = setInterval(async () => {
      try {
        await this.updateMarketData();
      } catch (error) {
        console.error('Error updating market data:', error);
      }
    }, this.UPDATE_INTERVAL);
  }

  /**
   * Update market data for all symbols
   */
  private async updateMarketData(): Promise<void> {
    try {
      const symbols = Array.from(this.symbols.keys());
      
      // Update in batches to avoid rate limiting
      const batchSize = 10;
      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async symbol => {
          try {
            const quote = await marketDataService.getStockQuote(symbol);
            const marketSymbol = this.symbols.get(symbol);
            
            if (marketSymbol) {
              marketSymbol.price = quote.price;
              marketSymbol.change = quote.change;
              marketSymbol.changePercent = quote.changePercent;
              marketSymbol.volume = quote.volume;
              marketSymbol.lastUpdate = new Date();
            }
          } catch (error) {
            console.error(`Error updating ${symbol}:`, error);
          }
        }));

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Clear cache after updates
      await cacheService.delete('market_stats');
      
    } catch (error) {
      console.error('Error in periodic market data update:', error);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }
  }
}

export const marketSelectorService = new MarketSelectorService(); 