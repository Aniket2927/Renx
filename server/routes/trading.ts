import { Router } from 'express';
import { authenticateMultiTenant } from '../middleware/multiTenantMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import {
  // Order Book
  getOrderBook,
  subscribeToOrderBook,
  unsubscribeFromOrderBook,
  getMarketDepth,
  
  // Trade History
  getTradeHistory,
  getTradeById,
  getTradeAnalytics,
  getPerformanceMetrics,
  exportTradeHistory,
  
  // Market Selector
  searchMarkets,
  getSymbolDetails,
  getMarketCategories,
  getSymbolsByCategory,
  getMarketStats,
  getPopularSymbols,
  getTrendingSymbols,
  
  // Watchlist
  getUserWatchlists,
  getWatchlist,
  createWatchlist,
  updateWatchlist,
  deleteWatchlist,
  addSymbolToWatchlist,
  removeSymbolFromWatchlist,
  updateWatchlistItem,
  getWatchlistPerformance,
  getPublicWatchlists
} from '../controllers/tradingController';

const router = Router();

// Apply rate limiting to all trading routes
router.use(rateLimitMiddleware);

/**
 * Order Book Routes
 */
router.get('/orderbook/:symbol', getOrderBook);
router.post('/orderbook/:symbol/subscribe', authenticateMultiTenant, subscribeToOrderBook);
router.delete('/orderbook/:symbol/subscribe', authenticateMultiTenant, unsubscribeFromOrderBook);
router.get('/orderbook/:symbol/depth', getMarketDepth);

/**
 * Trade History Routes
 */
router.get('/trades', authenticateMultiTenant, getTradeHistory);
router.get('/trades/export', authenticateMultiTenant, exportTradeHistory);
router.get('/trades/:tradeId', authenticateMultiTenant, getTradeById);
router.get('/analytics', authenticateMultiTenant, getTradeAnalytics);
router.get('/performance', authenticateMultiTenant, getPerformanceMetrics);

/**
 * Market Selector Routes
 */
router.get('/markets/search', searchMarkets);
router.get('/markets/categories', getMarketCategories);
router.get('/markets/categories/:categoryId', getSymbolsByCategory);
router.get('/markets/stats', getMarketStats);
router.get('/markets/popular', getPopularSymbols);
router.get('/markets/trending', getTrendingSymbols);
router.get('/markets/:symbol', getSymbolDetails);

/**
 * Watchlist Routes
 */
router.get('/watchlists', authenticateMultiTenant, getUserWatchlists);
router.post('/watchlists', authenticateMultiTenant, createWatchlist);
router.get('/watchlists/public', getPublicWatchlists);
router.get('/watchlists/:watchlistId', authenticateMultiTenant, getWatchlist);
router.put('/watchlists/:watchlistId', authenticateMultiTenant, updateWatchlist);
router.delete('/watchlists/:watchlistId', authenticateMultiTenant, deleteWatchlist);
router.post('/watchlists/:watchlistId/symbols', authenticateMultiTenant, addSymbolToWatchlist);
router.delete('/watchlists/:watchlistId/symbols/:symbol', authenticateMultiTenant, removeSymbolFromWatchlist);
router.put('/watchlists/:watchlistId/symbols/:symbol', authenticateMultiTenant, updateWatchlistItem);
router.get('/watchlists/:watchlistId/performance', authenticateMultiTenant, getWatchlistPerformance);

export default router; 