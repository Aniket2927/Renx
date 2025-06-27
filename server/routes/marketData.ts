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
    const tenantId = (req as any).tenantId;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    const quote = await realTimeMarketService.getQuote(symbol.toUpperCase());
    
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    res.json({
      success: true,
      data: quote,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// Get multiple quotes (batch)
router.post('/quotes', async (req: Request, res: Response) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Symbols array is required' });
    }
    
    if (symbols.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 symbols allowed per request' });
    }
    
    const quotes = await Promise.all(
      symbols.map(symbol => realTimeMarketService.getQuote(symbol.toUpperCase()))
    );
    
    const validQuotes = quotes.filter(q => q !== null);
    
    res.json({
      success: true,
      data: validQuotes,
      requested: symbols.length,
      returned: validQuotes.length
    });
  } catch (error) {
    console.error('Error fetching batch quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Get historical data
router.get('/historical/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { interval = '1day', outputsize = '30' } = req.query;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    const data = await realTimeMarketService.getHistoricalData(
      symbol.toUpperCase(),
      interval as string,
      parseInt(outputsize as string)
    );
    
    if (!data) {
      return res.status(404).json({ error: 'Historical data not found' });
    }
    
    res.json({
      success: true,
      data,
      symbol: symbol.toUpperCase(),
      interval,
      outputsize: parseInt(outputsize as string)
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Search symbols
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { query, limit = '10' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = await realTimeMarketService.searchSymbols(
      query,
      parseInt(limit as string)
    );
    
    res.json({
      success: true,
      data: results,
      query,
      count: results.length
    });
  } catch (error) {
    console.error('Error searching symbols:', error);
    res.status(500).json({ error: 'Failed to search symbols' });
  }
});

// Subscribe to real-time updates for a symbol
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { symbol, interval = 5000 } = req.body;
    const tenantId = (req as any).tenantId;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    await realTimeMarketService.subscribe(
      symbol.toUpperCase(),
      tenantId,
      interval
    );
    
    res.json({
      success: true,
      message: `Subscribed to ${symbol.toUpperCase()}`,
      interval
    });
  } catch (error) {
    console.error('Error subscribing to symbol:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Unsubscribe from real-time updates
router.post('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.body;
    const tenantId = (req as any).tenantId;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    realTimeMarketService.unsubscribe(symbol.toUpperCase(), tenantId);
    
    res.json({
      success: true,
      message: `Unsubscribed from ${symbol.toUpperCase()}`
    });
  } catch (error) {
    console.error('Error unsubscribing from symbol:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Get technical indicators
router.get('/indicators/:symbol/:indicator', async (req: Request, res: Response) => {
  try {
    const { symbol, indicator } = req.params;
    const { interval = '1day', outputsize = '30', ...params } = req.query;
    
    if (!symbol || !indicator) {
      return res.status(400).json({ error: 'Symbol and indicator are required' });
    }
    
    const data = await marketDataService.getTechnicalIndicators(
      symbol.toUpperCase(),
      interval as string
    );
    
    res.json({
      success: true,
      data,
      symbol: symbol.toUpperCase(),
      indicator,
      interval
    });
  } catch (error) {
    console.error('Error fetching indicators:', error);
    res.status(500).json({ error: 'Failed to fetch indicators' });
  }
});

// Get market status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const connectionStatus = realTimeMarketService.getConnectionStatus();
    
    res.json({
      success: true,
      websocket: connectionStatus,
      api: {
        twelveData: !!process.env.TWELVE_DATA_API_KEY,
        alphaVantage: !!process.env.ALPHA_VANTAGE_API_KEY
      },
      cache: {
        enabled: true,
        provider: 'redis'
      }
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