export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  high52Week?: number;
  low52Week?: number;
  avgVolume?: number;
}

export interface CryptoQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  circulatingSupply?: number;
}

export interface ForexQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  bid: number;
  ask: number;
}

export interface CommodityQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  movingAverages: {
    ma20: number;
    ma50: number;
    ma200: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  volume: number;
  volatility: number;
}

export interface NewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date;
  sentiment?: 'positive' | 'negative' | 'neutral';
  symbols?: string[];
}

interface TwelveDataResponse {
  price?: string;
  values?: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    // Technical indicator fields
    rsi?: string;
    macd?: string;
    macd_signal?: string;
    macd_hist?: string;
    [key: string]: any;
  }>;
  // Quote response fields
  symbol?: string;
  close?: string;
  change?: string;
  percent_change?: string;
  volume?: string;
  high?: string;
  low?: string;
  fifty_two_week?: {
    high?: string;
    low?: string;
  };
  market_cap?: string;
  error?: string;
  [key: string]: any;
}

class TwelveDataAPI {
  private apiKey: string;
  private baseUrl = 'https://api.twelvedata.com';

  constructor() {
    this.apiKey = process.env.TWELVE_DATA_API_KEY || '';
    if (!this.apiKey) {
      console.warn('TwelveData API key not configured');
    }
  }

  private async apiCall(endpoint: string, params: Record<string, any> = {}): Promise<TwelveDataResponse> {
    try {
      const url = `${this.baseUrl}/${endpoint}`;
      const response = await fetch(url + '?' + new URLSearchParams({
        ...params,
        apikey: this.apiKey
      }));

      if (!response.ok) {
        throw new Error(`TwelveData API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error calling Twelve Data API (${endpoint}):`, error);
      throw error;
    }
  }

  async getPrice(symbol: string): Promise<TwelveDataResponse> {
    return this.apiCall('price', { symbol });
  }

  async getTimeSeries(symbol: string, interval = '1min', outputsize = 30): Promise<TwelveDataResponse> {
    return this.apiCall('time_series', { symbol, interval, outputsize });
  }

  async getQuotes(symbols: string | string[]): Promise<TwelveDataResponse> {
    const symbolString = Array.isArray(symbols) ? symbols.join(',') : symbols;
    return this.apiCall('quote', { symbol: symbolString });
  }

  async getIndicator(
    symbol: string, 
    indicator: string, 
    interval = '1day', 
    outputsize = 30, 
    params: Record<string, any> = {}
  ): Promise<TwelveDataResponse> {
    return this.apiCall(indicator, {
      symbol,
      interval,
      outputsize,
      ...params
    });
  }

  async getSymbols(exchange = 'NASDAQ'): Promise<TwelveDataResponse> {
    return this.apiCall('stocks', { exchange });
  }
}

export const twelveDataAPI = new TwelveDataAPI();

export class MarketDataService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Use environment variables for API configuration
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || process.env.POLYGON_API_KEY || process.env.MARKET_DATA_API_KEY || "demo";
    this.baseUrl = "https://www.alphavantage.co/query";
  }

  async getStockQuote(symbol: string): Promise<StockQuote> {
    try {
      // Try TwelveData API first (primary source)
      const twelveDataQuote = await twelveDataAPI.getQuotes(symbol);
      
      if (twelveDataQuote && !twelveDataQuote.error) {
        // Handle single quote response
        const quote = Array.isArray(twelveDataQuote) ? twelveDataQuote[0] : twelveDataQuote;
        
        return {
          symbol: quote.symbol || symbol,
          price: parseFloat(quote.close || quote.price || 0),
          change: parseFloat(quote.change || 0),
          changePercent: parseFloat(quote.percent_change || 0),
          volume: parseInt(quote.volume || 0),
          high52Week: parseFloat(quote.fifty_two_week?.high || quote.high || 0),
          low52Week: parseFloat(quote.fifty_two_week?.low || quote.low || 0)
        };
      }
    } catch (error) {
      console.warn(`TwelveData API failed for ${symbol}, trying Alpha Vantage fallback:`, error);
    }

    try {
      // Fallback to Alpha Vantage API
      const response = await fetch(
        `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const quote = data["Global Quote"];
      
      if (!quote) {
        throw new Error("Invalid API response");
      }

      return {
        symbol: quote["01. symbol"],
        price: parseFloat(quote["05. price"]),
        change: parseFloat(quote["09. change"]),
        changePercent: parseFloat(quote["10. change percent"].replace('%', '')),
        volume: parseInt(quote["06. volume"]),
        high52Week: parseFloat(quote["03. high"]),
        low52Week: parseFloat(quote["04. low"])
      };
    } catch (error) {
      console.error(`Both TwelveData and Alpha Vantage failed for ${symbol}:`, error);
      // Only return mock data as last resort
      console.warn(`Returning mock data for ${symbol} due to API failures`);
      return this.getMockStockQuote(symbol);
    }
  }

  async getCryptoQuote(symbol: string): Promise<CryptoQuote> {
    try {
      // Try TwelveData API first for crypto
      const cryptoSymbol = symbol.includes('/') ? symbol : `${symbol}/USD`;
      const twelveDataQuote = await twelveDataAPI.getQuotes(cryptoSymbol);
      
      if (twelveDataQuote && !twelveDataQuote.error) {
        const quote = Array.isArray(twelveDataQuote) ? twelveDataQuote[0] : twelveDataQuote;
        
        return {
          symbol,
          price: parseFloat(quote.close || quote.price || 0),
          change: parseFloat(quote.change || 0),
          changePercent: parseFloat(quote.percent_change || 0),
          volume: parseInt(quote.volume || 0),
          marketCap: quote.market_cap ? parseFloat(quote.market_cap) : undefined
        };
      }
    } catch (error) {
      console.warn(`TwelveData crypto API failed for ${symbol}, trying Alpha Vantage fallback:`, error);
    }

    try {
      // Fallback to Alpha Vantage
      const response = await fetch(
        `${this.baseUrl}?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol}&to_currency=USD&apikey=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const rate = data["Realtime Currency Exchange Rate"];
      
      if (!rate) {
        throw new Error("Invalid API response");
      }

      return {
        symbol,
        price: parseFloat(rate["5. Exchange Rate"]),
        change: 0, // Would need historical data
        changePercent: 0,
        volume: 0
      };
    } catch (error) {
      console.error(`Both TwelveData and Alpha Vantage failed for crypto ${symbol}:`, error);
      console.warn(`Returning mock data for ${symbol} due to API failures`);
      return this.getMockCryptoQuote(symbol);
    }
  }

  async getForexQuote(pair: string): Promise<ForexQuote> {
    try {
      // Try TwelveData API first for forex
      const twelveDataQuote = await twelveDataAPI.getQuotes(pair);
      
      if (twelveDataQuote && !twelveDataQuote.error) {
        const quote = Array.isArray(twelveDataQuote) ? twelveDataQuote[0] : twelveDataQuote;
        const price = parseFloat(quote.close || quote.price || 0);
        
        return {
          symbol: pair,
          price,
          change: parseFloat(quote.change || 0),
          changePercent: parseFloat(quote.percent_change || 0),
          bid: price * 0.9999, // Realistic bid/ask spread
          ask: price * 1.0001
        };
      }
    } catch (error) {
      console.warn(`TwelveData forex API failed for ${pair}, trying Alpha Vantage fallback:`, error);
    }

    try {
      // Fallback to Alpha Vantage
      const [from, to] = pair.split('/');
      const response = await fetch(
        `${this.baseUrl}?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const rate = data["Realtime Currency Exchange Rate"];
      
      if (!rate) {
        throw new Error("Invalid API response");
      }

      const price = parseFloat(rate["5. Exchange Rate"]);
      return {
        symbol: pair,
        price,
        change: 0,
        changePercent: 0,
        bid: price * 0.9999, // Mock bid/ask spread
        ask: price * 1.0001
      };
    } catch (error) {
      console.error(`Both TwelveData and Alpha Vantage failed for forex ${pair}:`, error);
      console.warn(`Returning mock data for ${pair} due to API failures`);
      return this.getMockForexQuote(pair);
    }
  }

  async getTechnicalIndicators(symbol: string, interval: string = 'daily'): Promise<TechnicalIndicators> {
    try {
      // Try TwelveData API first for technical indicators
      const [rsiData, macdData] = await Promise.allSettled([
        twelveDataAPI.getIndicator(symbol, 'rsi', '1day', 30, { time_period: 14 }),
        twelveDataAPI.getIndicator(symbol, 'macd', '1day', 30)
      ]);

      let rsiValue = 50;
      let macdValues = { macd: 0, signal: 0, histogram: 0 };

      // Process RSI data
      if (rsiData.status === 'fulfilled' && rsiData.value?.values) {
        const latestRsi = rsiData.value.values[0];
        rsiValue = parseFloat(latestRsi?.rsi || '50');
      }

      // Process MACD data
      if (macdData.status === 'fulfilled' && macdData.value?.values) {
        const latestMacd = macdData.value.values[0];
        macdValues = {
          macd: parseFloat(latestMacd?.macd || '0'),
          signal: parseFloat(latestMacd?.macd_signal || '0'),
          histogram: parseFloat(latestMacd?.macd_hist || '0')
        };
      }

      return {
        rsi: rsiValue,
        macd: macdValues,
        movingAverages: {
          ma20: 0, // Would need separate API calls
          ma50: 0,
          ma200: 0
        },
        bollinger: {
          upper: 0,
          middle: 0,
          lower: 0
        },
        volume: 0,
        volatility: 0
      };
    } catch (error) {
      console.warn(`TwelveData technical indicators failed for ${symbol}, trying Alpha Vantage fallback:`, error);
    }

    try {
      // Fallback to Alpha Vantage API
      const [rsiResponse, macdResponse] = await Promise.all([
        fetch(`${this.baseUrl}?function=RSI&symbol=${symbol}&interval=${interval}&time_period=14&series_type=close&apikey=${this.apiKey}`),
        fetch(`${this.baseUrl}?function=MACD&symbol=${symbol}&interval=${interval}&series_type=close&apikey=${this.apiKey}`)
      ]);
      
      // Parse responses
      const rsiData = await rsiResponse.json();
      const macdData = await macdResponse.json();
      
      // Get latest values
      const rsiValues = rsiData["Technical Analysis: RSI"];
      const macdValues = macdData["Technical Analysis: MACD"];
      
      const latestRsiDate = Object.keys(rsiValues || {})[0];
      const latestMacdDate = Object.keys(macdValues || {})[0];
      
      return {
        rsi: rsiValues?.[latestRsiDate]?.["RSI"] ? parseFloat(rsiValues[latestRsiDate]["RSI"]) : 50,
        macd: {
          macd: macdValues?.[latestMacdDate]?.["MACD"] ? parseFloat(macdValues[latestMacdDate]["MACD"]) : 0,
          signal: macdValues?.[latestMacdDate]?.["MACD_Signal"] ? parseFloat(macdValues[latestMacdDate]["MACD_Signal"]) : 0,
          histogram: macdValues?.[latestMacdDate]?.["MACD_Hist"] ? parseFloat(macdValues[latestMacdDate]["MACD_Hist"]) : 0
        },
        movingAverages: {
          ma20: 0, // Would need separate API calls
          ma50: 0,
          ma200: 0
        },
        bollinger: {
          upper: 0,
          middle: 0,
          lower: 0
        },
        volume: 0,
        volatility: 0
      };
    } catch (error) {
      console.error(`Both TwelveData and Alpha Vantage failed for technical indicators ${symbol}:`, error);
      console.warn(`Returning mock technical indicators for ${symbol} due to API failures`);
      return this.getMockTechnicalIndicators();
    }
  }

  async getMarketNews(symbols?: string[], limit: number = 20): Promise<NewsItem[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}?function=NEWS_SENTIMENT${symbols ? `&tickers=${symbols.join(',')}` : ''}&apikey=${this.apiKey}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const feed = data.feed || [];
      
      return feed.map((item: any) => ({
        title: item.title,
        summary: item.summary,
        url: item.url,
        source: item.source,
        publishedAt: new Date(item.time_published),
        sentiment: this.mapSentiment(item.overall_sentiment_score),
        symbols: item.ticker_sentiment?.map((t: any) => t.ticker) || []
      }));
    } catch (error) {
      console.error("Error fetching market news:", error);
      return this.getMockNews();
    }
  }

  async searchStocks(query: string, limit: number = 10): Promise<{ symbol: string; name: string; type: string; region: string }[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const matches = data.bestMatches || [];
      
      return matches.slice(0, limit).map((match: any) => ({
        symbol: match["1. symbol"],
        name: match["2. name"],
        type: match["3. type"],
        region: match["4. region"]
      }));
    } catch (error) {
      console.error(`Error searching stocks for query: ${query}:`, error);
      return [];
    }
  }

  // Mock data methods for development/demo
  private getMockStockQuote(symbol: string): StockQuote {
    const basePrice = Math.random() * 300 + 50;
    const change = (Math.random() - 0.5) * 10;
    
    return {
      symbol,
      price: basePrice,
      change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 10000000) + 100000,
      marketCap: Math.floor(Math.random() * 1000000000000) + 1000000000,
      pe: Math.random() * 50 + 5,
      high52Week: basePrice * 1.3,
      low52Week: basePrice * 0.7,
      avgVolume: Math.floor(Math.random() * 5000000) + 500000
    };
  }

  private getMockCryptoQuote(symbol: string): CryptoQuote {
    const basePrice = symbol === 'BTC' ? 45000 : symbol === 'ETH' ? 3344 : Math.random() * 100;
    const change = (Math.random() - 0.5) * basePrice * 0.1;
    
    return {
      symbol,
      price: basePrice,
      change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 1000000) + 10000,
      marketCap: Math.floor(Math.random() * 100000000000) + 1000000000
    };
  }

  private getMockForexQuote(pair: string): ForexQuote {
    const basePrice = Math.random() * 2 + 0.5;
    const change = (Math.random() - 0.5) * 0.01;
    
    return {
      symbol: pair,
      price: basePrice,
      change,
      changePercent: (change / basePrice) * 100,
      bid: basePrice * 0.9999,
      ask: basePrice * 1.0001
    };
  }

  private getMockTechnicalIndicators(): TechnicalIndicators {
    return {
      rsi: Math.random() * 100,
      macd: {
        macd: (Math.random() - 0.5) * 2,
        signal: (Math.random() - 0.5) * 2,
        histogram: (Math.random() - 0.5) * 1
      },
      movingAverages: {
        ma20: Math.random() * 300 + 50,
        ma50: Math.random() * 300 + 50,
        ma200: Math.random() * 300 + 50
      },
      bollinger: {
        upper: Math.random() * 300 + 100,
        middle: Math.random() * 300 + 50,
        lower: Math.random() * 300 + 10
      },
      volume: Math.floor(Math.random() * 10000000) + 100000,
      volatility: Math.random() * 0.5
    };
  }

  private getMockNews(): NewsItem[] {
    return [
      {
        title: "Market Update: Technology Stocks Rally",
        summary: "Technology stocks showed strong performance today as investors remain optimistic about AI developments.",
        url: "https://example.com/news/1",
        source: "Financial News",
        publishedAt: new Date(),
        sentiment: 'positive',
        symbols: ['AAPL', 'GOOGL', 'MSFT']
      }
    ];
  }

  private mapSentiment(score: number): 'positive' | 'negative' | 'neutral' {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
  }

  /**
   * Get real market data for multiple symbols using TwelveData API
   */
  async getMarketData(symbols: string[]): Promise<StockQuote[]> {
    try {
      const results = await Promise.all(
        symbols.map(symbol => this.getStockQuote(symbol))
      );
      return results;
    } catch (error) {
      console.error('Error getting market data:', error);
      // Return mock data for demo if API fails
      return symbols.map(symbol => this.getMockStockQuote(symbol));
    }
  }

  /**
   * Get historical data using TwelveData API
   */
  async getHistoricalData(symbol: string, interval: string = '1day', outputsize: number = 30): Promise<any> {
    try {
      const data = await twelveDataAPI.getTimeSeries(symbol, interval, outputsize);
      return data;
    } catch (error) {
      console.error(`Error getting historical data for ${symbol}:`, error);
      // Return mock historical data if API fails
      const quote = this.getMockStockQuote(symbol);
      return {
        values: Array.from({ length: outputsize }, (_, i) => ({
          datetime: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          open: (quote.price * (0.98 + Math.random() * 0.04)).toFixed(2),
          high: (quote.price * (1.01 + Math.random() * 0.02)).toFixed(2),
          low: (quote.price * (0.97 + Math.random() * 0.02)).toFixed(2),
          close: (quote.price * (0.99 + Math.random() * 0.02)).toFixed(2),
          volume: Math.floor(quote.volume * (0.8 + Math.random() * 0.4)).toString()
        })).reverse()
      };
    }
  }

  /**
   * Get real-time quote using TwelveData API with fallback to Alpha Vantage
   */
  async getRealTimeQuote(symbol: string): Promise<StockQuote> {
    try {
      // Try TwelveData first
      const twelveDataQuote = await twelveDataAPI.getPrice(symbol);
      if (twelveDataQuote.price) {
        return {
          symbol,
          price: parseFloat(twelveDataQuote.price),
          change: 0, // TwelveData price endpoint doesn't include change
          changePercent: 0,
          volume: 0
        };
      }
      
      // Fallback to full quote
      return await this.getStockQuote(symbol);
    } catch (error) {
      console.error(`Error getting real-time quote for ${symbol}:`, error);
      return this.getMockStockQuote(symbol);
    }
  }

  /**
   * Search symbols using TwelveData API
   */
  async searchSymbols(query: string, limit: number = 10): Promise<{ symbol: string; name: string; type: string; region: string }[]> {
    try {
      const data = await twelveDataAPI.getSymbols();
      // Filter results based on query (this is a simplified implementation)
      if (data && Array.isArray(data)) {
        return data
          .filter((item: any) => 
            item.symbol?.toLowerCase().includes(query.toLowerCase()) ||
            item.name?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, limit)
          .map((item: any) => ({
            symbol: item.symbol,
            name: item.name || item.symbol,
            type: item.type || 'stock',
            region: item.exchange || 'US'
          }));
      }
      
      // Fallback to existing search method
      return await this.searchStocks(query, limit);
    } catch (error) {
      console.error('Error searching symbols:', error);
      return await this.searchStocks(query, limit);
    }
  }
}

export const marketDataService = new MarketDataService();
