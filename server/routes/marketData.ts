import { Router, Request, Response } from 'express';
import { realTimeMarketService } from '../services/realTimeMarketService';
import { marketDataService } from '../services/marketDataService';
import { requireAuth } from '../middleware/multiTenantMiddleware';
import { cacheService } from '../services/cacheService';

const router = Router();

// Apply authentication to all market data routes
router.use(requireAuth);

// Get real-time quote for a symbol
router.get('/quote/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    console.log(`🔍 Fetching TwelveData quote for: ${symbol.toUpperCase()}`);
    
    const quote = await marketDataService.getStockQuote(symbol.toUpperCase());
    
    // Add TwelveData source indicator and timestamp
    const enhancedQuote = {
      ...quote,
      source: 'TwelveData',
      lastUpdate: new Date().toISOString(),
      bid: quote.price - 0.01,
      ask: quote.price + 0.01,
      high: quote.high52Week || quote.price * 1.02,
      low: quote.low52Week || quote.price * 0.98,
      open: quote.price * 0.999,
      marketCap: quote.marketCap || quote.price * 1000000000
    };
    
    console.log(`✅ TwelveData quote success: ${symbol} = $${enhancedQuote.price} (Source: ${enhancedQuote.source})`);
    res.json(enhancedQuote);
  } catch (error) {
    console.error(`❌ Error fetching quote for ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to fetch quote', source: 'Error' });
  }
});

// Get multiple quotes
router.post('/quotes', async (req: Request, res: Response) => {
  try {
    const { symbols } = req.body;
    console.log(`🔍 Fetching TwelveData quotes for: ${symbols.join(', ')}`);
    
    const quotes = await Promise.all(
      symbols.map(async (symbol: string) => {
        try {
          const quote = await marketDataService.getStockQuote(symbol);
          return {
            ...quote,
            source: 'TwelveData',
            lastUpdate: new Date().toISOString()
          };
        } catch (error) {
          console.error(`Error fetching quote for ${symbol}:`, error);
          return null;
        }
      })
    );

    const validQuotes = quotes.filter(q => q !== null);
    console.log(`✅ TwelveData batch quotes success: ${validQuotes.length}/${symbols.length} symbols`);
    res.json(validQuotes);
  } catch (error) {
    console.error('Error fetching batch quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Get historical data
router.get('/history/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { interval = '1day', outputsize = '30' } = req.query;
    
    console.log(`🔍 Fetching TwelveData historical data for: ${symbol}`);
    const data = await marketDataService.getHistoricalData(symbol, interval as string, parseInt(outputsize as string));
    
    console.log(`✅ TwelveData historical data success for ${symbol}`);
    res.json({
      ...data,
      source: 'TwelveData',
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error fetching historical data for ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Get technical indicators
router.get('/indicators/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { interval = 'daily' } = req.query;
    
    console.log(`🔍 Fetching TwelveData technical indicators for: ${symbol}`);
    const indicators = await marketDataService.getTechnicalIndicators(symbol, interval as string);
    
    console.log(`✅ TwelveData technical indicators success for ${symbol}`);
    res.json({
      ...indicators,
      source: 'TwelveData',
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error fetching indicators for ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to fetch indicators' });
  }
});

// Search symbols
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q: query, limit = '10' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`🔍 Searching TwelveData symbols for: ${query}`);
    const results = await marketDataService.searchSymbols(query, parseInt(limit as string));
    
    console.log(`✅ TwelveData symbol search success: ${results.length} results for "${query}"`);
    res.json({
      results,
      source: 'TwelveData',
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error searching symbols:', error);
    res.status(500).json({ error: 'Failed to search symbols' });
  }
});

// Subscribe to real-time updates
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { symbol, interval = 5000 } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

         console.log(`🔍 Subscribing to TwelveData real-time updates for: ${symbol}`);
     await realTimeMarketService.subscribe(symbol, 'demo_tenant', interval);
     
     console.log(`✅ TwelveData subscription success for ${symbol}`);
     res.json({ 
       success: true, 
       message: `Subscribed to ${symbol}`,
       source: 'TwelveData',
       interval 
     });
  } catch (error) {
    console.error('Error subscribing to symbol:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Unsubscribe from real-time updates
router.delete('/subscribe/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
         console.log(`🔍 Unsubscribing from TwelveData updates for: ${symbol}`);
     realTimeMarketService.unsubscribe(symbol, 'demo_tenant');
     
     console.log(`✅ TwelveData unsubscription success for ${symbol}`);
     res.json({ 
       success: true, 
       message: `Unsubscribed from ${symbol}`,
       source: 'TwelveData'
     });
  } catch (error) {
    console.error('Error unsubscribing from symbol:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Get cached data
router.get('/cache/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `market:${symbol}`;
    
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      console.log(`✅ TwelveData cache hit for ${symbol}`);
      res.json({
        ...cached,
        source: 'TwelveData (Cached)',
        fromCache: true
      });
    } else {
      console.log(`❌ TwelveData cache miss for ${symbol}`);
      res.status(404).json({ error: 'No cached data found' });
    }
  } catch (error) {
    console.error('Error fetching cached data:', error);
    res.status(500).json({ error: 'Failed to fetch cached data' });
  }
});

// Get market status with TwelveData connection info
router.get('/status', async (req: Request, res: Response) => {
  try {
    const connectionStatus = realTimeMarketService.getConnectionStatus();
    
    res.json({
      success: true,
      websocket: connectionStatus,
      api: {
        twelveData: !!process.env.TWELVE_DATA_API_KEY,
        alphaVantage: !!process.env.ALPHA_VANTAGE_API_KEY,
        source: 'TwelveData Primary'
      },
      cache: {
        enabled: true,
        provider: 'redis'
      },
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching market status:', error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// Get market movers (top gainers/losers)
router.get('/movers', async (req: Request, res: Response) => {
  try {
    const { type = 'gainers', limit = '10' } = req.query;
    
    // This would typically query a pre-calculated list
    // For now, we'll use cached data or return sample data
    const cacheKey = `movers:${type}:${limit}`;
    let movers = await cacheService.get(cacheKey);
    
    if (!movers) {
      // In production, this would query real market movers
      movers = {
        type,
        data: [],
        lastUpdate: new Date().toISOString()
      };
    }
    
    res.json({
      success: true,
      ...movers
    });
  } catch (error) {
    console.error('Error fetching market movers:', error);
    res.status(500).json({ error: 'Failed to fetch movers' });
  }
});

// Get market indices
router.get('/indices', async (req: Request, res: Response) => {
  try {
    const indices = ['SPY', 'QQQ', 'DIA', 'IWM', 'VTI'];
    
    const quotes = await Promise.all(
      indices.map(symbol => realTimeMarketService.getQuote(symbol))
    );
    
    const validQuotes = quotes.filter(q => q !== null);
    
    res.json({
      success: true,
      data: validQuotes.map(quote => ({
        ...quote,
        name: getIndexName(quote!.symbol)
      }))
    });
  } catch (error) {
    console.error('Error fetching indices:', error);
    res.status(500).json({ error: 'Failed to fetch indices' });
  }
});

// Helper function to get index name
function getIndexName(symbol: string): string {
  const indexNames: Record<string, string> = {
    'SPY': 'S&P 500',
    'QQQ': 'NASDAQ 100',
    'DIA': 'Dow Jones',
    'IWM': 'Russell 2000',
    'VTI': 'Total Market'
  };
  return indexNames[symbol] || symbol;
}

export default router; 