import { Request, Response } from 'express';
import { orderBookService } from '../services/orderBookService';
import { tradeHistoryService } from '../services/tradeHistoryService';
import { marketSelectorService } from '../services/marketSelectorService';
import { watchlistService } from '../services/watchlistService';
import { auditService } from '../services/auditService';

/**
 * Order Book Endpoints
 */

// GET /api/trading/orderbook/:symbol
export const getOrderBook = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const userId = req.user?.id;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const orderBook = await orderBookService.getOrderBook(symbol.toUpperCase());
    
    if (!orderBook) {
      return res.status(404).json({ error: 'Order book not found' });
    }

    res.json({
      success: true,
      data: orderBook
    });
  } catch (error) {
    console.error('Error getting order book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/trading/orderbook/:symbol/subscribe
export const subscribeToOrderBook = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const userId = req.user?.id;
    const sessionId = req.session?.id || req.sessionID;

    if (!symbol || !userId) {
      return res.status(400).json({ error: 'Symbol and authentication required' });
    }

    const orderBook = await orderBookService.subscribeToOrderBook(
      symbol.toUpperCase(), 
      sessionId
    );

    res.json({
      success: true,
      data: orderBook,
      message: 'Successfully subscribed to order book updates'
    });
  } catch (error) {
    console.error('Error subscribing to order book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/trading/orderbook/:symbol/subscribe
export const unsubscribeFromOrderBook = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const sessionId = req.session?.id || req.sessionID;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    await orderBookService.unsubscribeFromOrderBook(symbol.toUpperCase(), sessionId);

    res.json({
      success: true,
      message: 'Successfully unsubscribed from order book updates'
    });
  } catch (error) {
    console.error('Error unsubscribing from order book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/trading/orderbook/:symbol/depth
export const getMarketDepth = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const marketDepth = await orderBookService.getMarketDepth(symbol.toUpperCase());
    
    if (!marketDepth) {
      return res.status(404).json({ error: 'Market depth not found' });
    }

    res.json({
      success: true,
      data: marketDepth
    });
  } catch (error) {
    console.error('Error getting market depth:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Trade History Endpoints
 */

// GET /api/trading/trades
export const getTradeHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const filters = {
      userId,
      symbol: req.query.symbol as string,
      type: req.query.type as 'buy' | 'sell',
      status: req.query.status as string,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
      minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
      maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sortBy: req.query.sortBy as 'executedAt' | 'total' | 'symbol',
      sortOrder: req.query.sortOrder as 'asc' | 'desc'
    };

    const result = await tradeHistoryService.getTradeHistory(filters);

    res.json({
      success: true,
      data: result.trades,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting trade history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/trading/trades/:tradeId
export const getTradeById = async (req: Request, res: Response) => {
  try {
    const { tradeId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const trade = await tradeHistoryService.getTradeById(tradeId, userId);
    
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    res.json({
      success: true,
      data: trade
    });
  } catch (error) {
    console.error('Error getting trade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/trading/analytics
export const getTradeAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const period = req.query.period as string;
    const analytics = await tradeHistoryService.getTradeAnalytics(userId, period);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting trade analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/trading/performance
export const getPerformanceMetrics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const period = req.query.period as string || '1y';
    const metrics = await tradeHistoryService.getPerformanceMetrics(userId, period);

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/trading/trades/export
export const exportTradeHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const filters = {
      symbol: req.query.symbol as string,
      type: req.query.type as 'buy' | 'sell',
      status: req.query.status as string,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
      minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
      maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined
    };

    const csvData = await tradeHistoryService.exportTradeHistory(userId, filters);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=trade-history.csv');
    res.send(csvData);
  } catch (error) {
    console.error('Error exporting trade history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Market Selector Endpoints
 */

// GET /api/trading/markets/search
export const searchMarkets = async (req: Request, res: Response) => {
  try {
    const filters = {
      search: req.query.search as string,
      exchange: req.query.exchange as string,
      sector: req.query.sector as string,
      industry: req.query.industry as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      minMarketCap: req.query.minMarketCap ? parseFloat(req.query.minMarketCap as string) : undefined,
      maxMarketCap: req.query.maxMarketCap ? parseFloat(req.query.maxMarketCap as string) : undefined,
      minVolume: req.query.minVolume ? parseFloat(req.query.minVolume as string) : undefined,
      maxVolume: req.query.maxVolume ? parseFloat(req.query.maxVolume as string) : undefined,
      hasDividend: req.query.hasDividend === 'true',
      minPE: req.query.minPE ? parseFloat(req.query.minPE as string) : undefined,
      maxPE: req.query.maxPE ? parseFloat(req.query.maxPE as string) : undefined,
      sortBy: req.query.sortBy as 'symbol' | 'name' | 'price' | 'change' | 'volume' | 'marketCap',
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };

    const result = await marketSelectorService.searchSymbols(filters);

    res.json({
      success: true,
      data: result.symbols,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error searching markets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/trading/markets/:symbol
export const getSymbolDetails = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const symbolDetails = await marketSelectorService.getSymbolDetails(symbol.toUpperCase());
    
    if (!symbolDetails) {
      return res.status(404).json({ error: 'Symbol not found' });
    }

    res.json({
      success: true,
      data: symbolDetails
    });
  } catch (error) {
    console.error('Error getting symbol details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/trading/markets/categories
export const getMarketCategories = async (req: Request, res: Response) => {
  try {
    const categories = await marketSelectorService.getMarketCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error getting market categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/trading/markets/categories/:categoryId
export const getSymbolsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    const symbols = await marketSelectorService.getSymbolsByCategory(categoryId);

    res.json({
      success: true,
      data: symbols
    });
  } catch (error) {
    console.error('Error getting symbols by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/trading/markets/stats
export const getMarketStats = async (req: Request, res: Response) => {
  try {
    const stats = await marketSelectorService.getMarketStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting market stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/trading/markets/popular
export const getPopularSymbols = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const symbols = await marketSelectorService.getPopularSymbols(limit);

    res.json({
      success: true,
      data: symbols
    });
  } catch (error) {
    console.error('Error getting popular symbols:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/trading/markets/trending
export const getTrendingSymbols = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const symbols = await marketSelectorService.getTrendingSymbols(limit);

    res.json({
      success: true,
      data: symbols
    });
  } catch (error) {
    console.error('Error getting trending symbols:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Watchlist Endpoints
 */

// GET /api/trading/watchlists
export const getUserWatchlists = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const watchlists = await watchlistService.getUserWatchlists(userId);

    res.json({
      success: true,
      data: watchlists
    });
  } catch (error) {
    console.error('Error getting user watchlists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/trading/watchlists/:watchlistId
export const getWatchlist = async (req: Request, res: Response) => {
  try {
    const { watchlistId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const watchlist = await watchlistService.getWatchlist(watchlistId, userId);
    
    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }

    res.json({
      success: true,
      data: watchlist
    });
  } catch (error) {
    console.error('Error getting watchlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/trading/watchlists
export const createWatchlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { name, description, isDefault, isPublic, color } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Watchlist name is required' });
    }

    const watchlist = await watchlistService.createWatchlist(userId, name.trim(), {
      description,
      isDefault,
      isPublic,
      color
    });

    res.status(201).json({
      success: true,
      data: watchlist,
      message: 'Watchlist created successfully'
    });
  } catch (error) {
    console.error('Error creating watchlist:', error);
    if (error instanceof Error && error.message.includes('Maximum')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/trading/watchlists/:watchlistId
export const updateWatchlist = async (req: Request, res: Response) => {
  try {
    const { watchlistId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { name, description, isDefault, isPublic, color } = req.body;

    const watchlist = await watchlistService.updateWatchlist(watchlistId, userId, {
      name: name?.trim(),
      description,
      isDefault,
      isPublic,
      color
    });

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist not found or unauthorized' });
    }

    res.json({
      success: true,
      data: watchlist,
      message: 'Watchlist updated successfully'
    });
  } catch (error) {
    console.error('Error updating watchlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/trading/watchlists/:watchlistId
export const deleteWatchlist = async (req: Request, res: Response) => {
  try {
    const { watchlistId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const success = await watchlistService.deleteWatchlist(watchlistId, userId);

    if (!success) {
      return res.status(404).json({ error: 'Watchlist not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Watchlist deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting watchlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/trading/watchlists/:watchlistId/symbols
export const addSymbolToWatchlist = async (req: Request, res: Response) => {
  try {
    const { watchlistId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { symbol, notes, targetPrice, stopLoss, alertEnabled } = req.body;

    if (!symbol || symbol.trim().length === 0) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const item = await watchlistService.addSymbolToWatchlist(watchlistId, userId, symbol.trim().toUpperCase(), {
      notes,
      targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      alertEnabled
    });

    if (!item) {
      return res.status(404).json({ error: 'Watchlist not found or unauthorized' });
    }

    res.status(201).json({
      success: true,
      data: item,
      message: 'Symbol added to watchlist successfully'
    });
  } catch (error) {
    console.error('Error adding symbol to watchlist:', error);
    if (error instanceof Error && (error.message.includes('Maximum') || error.message.includes('already exists'))) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/trading/watchlists/:watchlistId/symbols/:symbol
export const removeSymbolFromWatchlist = async (req: Request, res: Response) => {
  try {
    const { watchlistId, symbol } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const success = await watchlistService.removeSymbolFromWatchlist(watchlistId, userId, symbol.toUpperCase());

    if (!success) {
      return res.status(404).json({ error: 'Symbol not found in watchlist or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Symbol removed from watchlist successfully'
    });
  } catch (error) {
    console.error('Error removing symbol from watchlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/trading/watchlists/:watchlistId/symbols/:symbol
export const updateWatchlistItem = async (req: Request, res: Response) => {
  try {
    const { watchlistId, symbol } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { notes, targetPrice, stopLoss, alertEnabled } = req.body;

    const item = await watchlistService.updateWatchlistItem(watchlistId, userId, symbol.toUpperCase(), {
      notes,
      targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      alertEnabled
    });

    if (!item) {
      return res.status(404).json({ error: 'Symbol not found in watchlist or unauthorized' });
    }

    res.json({
      success: true,
      data: item,
      message: 'Watchlist item updated successfully'
    });
  } catch (error) {
    console.error('Error updating watchlist item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/trading/watchlists/:watchlistId/performance
export const getWatchlistPerformance = async (req: Request, res: Response) => {
  try {
    const { watchlistId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const performance = await watchlistService.getWatchlistPerformance(watchlistId, userId);

    if (!performance) {
      return res.status(404).json({ error: 'Watchlist not found or unauthorized' });
    }

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Error getting watchlist performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/trading/watchlists/public
export const getPublicWatchlists = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const watchlists = await watchlistService.getPublicWatchlists(limit);

    res.json({
      success: true,
      data: watchlists
    });
  } catch (error) {
    console.error('Error getting public watchlists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 