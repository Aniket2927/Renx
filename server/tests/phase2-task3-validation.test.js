const fs = require('fs');
const path = require('path');

describe('Phase 2 Task 3: Trading Interface Completion - Validation Tests', () => {
  
  describe('1. Real-time Order Book Integration', () => {
    test('Order book service should be implemented with required functionality', () => {
      const orderBookServicePath = path.join(__dirname, '../services/orderBookService.ts');
      expect(fs.existsSync(orderBookServicePath)).toBe(true);
      
      const content = fs.readFileSync(orderBookServicePath, 'utf8');
      
      // Check for order book interfaces
      expect(content).toMatch(/interface\s+OrderBook/);
      expect(content).toMatch(/interface\s+OrderBookLevel/);
      expect(content).toMatch(/interface\s+MarketDepth/);
      
      // Check for subscription management
      expect(content).toMatch(/subscribeToOrderBook/);
      expect(content).toMatch(/unsubscribeFromOrderBook/);
      expect(content).toMatch(/getOrderBook/);
      expect(content).toMatch(/getMarketDepth/);
      
      // Check for real-time updates
      expect(content).toMatch(/EventEmitter/);
      expect(content).toMatch(/updateOrderBook/);
      expect(content).toMatch(/UPDATE_FREQUENCY.*=.*500/); // 500ms updates
      
      // Check for market depth calculation
      expect(content).toMatch(/calculateMarketDepth|getMarketDepth/);
      expect(content).toMatch(/bidDepth/);
      expect(content).toMatch(/askDepth/);
      expect(content).toMatch(/imbalance/);
      expect(content).toMatch(/pressureIndex/);
    });

    test('Order book controller endpoints should be implemented', () => {
      const controllerPath = path.join(__dirname, '../controllers/tradingController.ts');
      expect(fs.existsSync(controllerPath)).toBe(true);
      
      const content = fs.readFileSync(controllerPath, 'utf8');
      
      // Check for order book endpoints
      expect(content).toMatch(/getOrderBook.*async/);
      expect(content).toMatch(/subscribeToOrderBook.*async/);
      expect(content).toMatch(/unsubscribeFromOrderBook.*async/);
      expect(content).toMatch(/getMarketDepth.*async/);
      
      // Check for proper error handling
      expect(content).toMatch(/catch.*error/);
      expect(content).toMatch(/status\(500\)/);
    });

    test('Order book routes should be configured', () => {
      const routesPath = path.join(__dirname, '../routes/trading.ts');
      expect(fs.existsSync(routesPath)).toBe(true);
      
      const content = fs.readFileSync(routesPath, 'utf8');
      
      // Check for order book routes
      expect(content).toMatch(/\/orderbook\/:symbol.*getOrderBook/);
      expect(content).toMatch(/\/orderbook\/:symbol\/subscribe.*subscribeToOrderBook/);
      expect(content).toMatch(/\/orderbook\/:symbol\/depth.*getMarketDepth/);
    });
  });

  describe('2. Enhanced Trade History Integration', () => {
    test('Trade history service should have comprehensive functionality', () => {
      const serviceePath = path.join(__dirname, '../services/tradeHistoryService.ts');
      expect(fs.existsSync(serviceePath)).toBe(true);
      
      const content = fs.readFileSync(serviceePath, 'utf8');
      
      // Check for trade interfaces
      expect(content).toMatch(/interface\s+Trade/);
      expect(content).toMatch(/interface\s+TradeFilters/);
      expect(content).toMatch(/interface\s+TradeAnalytics/);
      expect(content).toMatch(/interface\s+PerformanceMetrics/);
      
      // Check for filtering and pagination
      expect(content).toMatch(/getTradeHistory/);
      expect(content).toMatch(/buildTradeQuery/);
      expect(content).toMatch(/pagination/);
      expect(content).toMatch(/sortBy/);
      expect(content).toMatch(/sortOrder/);
      
      // Check for analytics features
      expect(content).toMatch(/getTradeAnalytics/);
      expect(content).toMatch(/getPerformanceMetrics/);
      expect(content).toMatch(/calculateProfitLoss/);
      expect(content).toMatch(/calculateWinRate/);
      
      // Check for export functionality
      expect(content).toMatch(/exportTradeHistory/);
      expect(content).toMatch(/CSV/);
    });

    test('Trade history endpoints should be implemented', () => {
      const controllerPath = path.join(__dirname, '../controllers/tradingController.ts');
      const content = fs.readFileSync(controllerPath, 'utf8');
      
      // Check for trade history endpoints
      expect(content).toMatch(/getTradeHistory.*async/);
      expect(content).toMatch(/getTradeById.*async/);
      expect(content).toMatch(/getTradeAnalytics.*async/);
      expect(content).toMatch(/getPerformanceMetrics.*async/);
      expect(content).toMatch(/exportTradeHistory.*async/);
      
      // Check for authentication requirement
      expect(content).toMatch(/req\.user\?\.id/);
      expect(content).toMatch(/Authentication required/);
    });

    test('Trade history routes should be configured', () => {
      const routesPath = path.join(__dirname, '../routes/trading.ts');
      const content = fs.readFileSync(routesPath, 'utf8');
      
      // Check for trade history routes
      expect(content).toMatch(/\/trades.*getTradeHistory/);
      expect(content).toMatch(/\/trades\/export.*exportTradeHistory/);
      expect(content).toMatch(/\/analytics.*getTradeAnalytics/);
      expect(content).toMatch(/\/performance.*getPerformanceMetrics/);
      
      // Check for authentication middleware
      expect(content).toMatch(/authenticateToken.*getTradeHistory/);
    });
  });

  describe('3. Multi-Market Support Integration', () => {
    test('Market selector service should support multiple markets', () => {
      const servicePath = path.join(__dirname, '../services/marketSelectorService.ts');
      expect(fs.existsSync(servicePath)).toBe(true);
      
      const content = fs.readFileSync(servicePath, 'utf8');
      
      // Check for market interfaces
      expect(content).toMatch(/interface\s+MarketSymbol/);
      expect(content).toMatch(/interface\s+MarketCategory/);
      expect(content).toMatch(/interface\s+MarketFilters/);
      expect(content).toMatch(/interface\s+MarketStats/);
      
      // Check for search and filtering
      expect(content).toMatch(/searchSymbols/);
      expect(content).toMatch(/applyFilters/);
      expect(content).toMatch(/sortSymbols/);
      
      // Check for market categories
      expect(content).toMatch(/getMarketCategories/);
      expect(content).toMatch(/getSymbolsByCategory/);
      
      // Check for market statistics
      expect(content).toMatch(/getMarketStats/);
      expect(content).toMatch(/getPopularSymbols/);
      expect(content).toMatch(/getTrendingSymbols/);
      
      // Check for multiple exchanges/sectors
      expect(content).toMatch(/exchange/);
      expect(content).toMatch(/sector/);
      expect(content).toMatch(/industry/);
    });

    test('Market selector endpoints should be implemented', () => {
      const controllerPath = path.join(__dirname, '../controllers/tradingController.ts');
      const content = fs.readFileSync(controllerPath, 'utf8');
      
      // Check for market selector endpoints
      expect(content).toMatch(/searchMarkets.*async/);
      expect(content).toMatch(/getSymbolDetails.*async/);
      expect(content).toMatch(/getMarketCategories.*async/);
      expect(content).toMatch(/getMarketStats.*async/);
      expect(content).toMatch(/getPopularSymbols.*async/);
      expect(content).toMatch(/getTrendingSymbols.*async/);
    });

    test('Market selector routes should be configured', () => {
      const routesPath = path.join(__dirname, '../routes/trading.ts');
      const content = fs.readFileSync(routesPath, 'utf8');
      
      // Check for market selector routes
      expect(content).toMatch(/\/markets\/search.*searchMarkets/);
      expect(content).toMatch(/\/markets\/categories.*getMarketCategories/);
      expect(content).toMatch(/\/markets\/stats.*getMarketStats/);
      expect(content).toMatch(/\/markets\/popular.*getPopularSymbols/);
      expect(content).toMatch(/\/markets\/trending.*getTrendingSymbols/);
    });
  });

  describe('4. Advanced Watchlist System', () => {
    test('Watchlist service should have advanced features', () => {
      const servicePath = path.join(__dirname, '../services/watchlistService.ts');
      expect(fs.existsSync(servicePath)).toBe(true);
      
      const content = fs.readFileSync(servicePath, 'utf8');
      
      // Check for watchlist interfaces
      expect(content).toMatch(/interface\s+Watchlist/);
      expect(content).toMatch(/interface\s+WatchlistItem/);
      expect(content).toMatch(/interface\s+WatchlistPerformance/);
      
      // Check for CRUD operations
      expect(content).toMatch(/getUserWatchlists/);
      expect(content).toMatch(/createWatchlist/);
      expect(content).toMatch(/updateWatchlist/);
      expect(content).toMatch(/deleteWatchlist/);
      
      // Check for symbol management
      expect(content).toMatch(/addSymbolToWatchlist/);
      expect(content).toMatch(/removeSymbolFromWatchlist/);
      expect(content).toMatch(/updateWatchlistItem/);
      
      // Check for advanced features
      expect(content).toMatch(/getWatchlistPerformance/);
      expect(content).toMatch(/getPublicWatchlists/);
      expect(content).toMatch(/targetPrice/);
      expect(content).toMatch(/stopLoss/);
      expect(content).toMatch(/alertEnabled/);
      
      // Check for real-time updates
      expect(content).toMatch(/EventEmitter/);
      expect(content).toMatch(/updateWatchlistData/);
      expect(content).toMatch(/UPDATE_INTERVAL/);
      
      // Check for limits and validation
      expect(content).toMatch(/MAX_WATCHLISTS_PER_USER.*=.*10/);
      expect(content).toMatch(/MAX_SYMBOLS_PER_WATCHLIST.*=.*100/);
    });

    test('Watchlist endpoints should be comprehensive', () => {
      const controllerPath = path.join(__dirname, '../controllers/tradingController.ts');
      const content = fs.readFileSync(controllerPath, 'utf8');
      
      // Check for watchlist endpoints
      expect(content).toMatch(/getUserWatchlists.*async/);
      expect(content).toMatch(/getWatchlist.*async/);
      expect(content).toMatch(/createWatchlist.*async/);
      expect(content).toMatch(/updateWatchlist.*async/);
      expect(content).toMatch(/deleteWatchlist.*async/);
      expect(content).toMatch(/addSymbolToWatchlist.*async/);
      expect(content).toMatch(/removeSymbolFromWatchlist.*async/);
      expect(content).toMatch(/updateWatchlistItem.*async/);
      expect(content).toMatch(/getWatchlistPerformance.*async/);
      expect(content).toMatch(/getPublicWatchlists.*async/);
      
      // Check for validation
      expect(content).toMatch(/name.*trim/);
      expect(content).toMatch(/symbol.*trim.*toUpperCase/);
    });

    test('Watchlist routes should be complete', () => {
      const routesPath = path.join(__dirname, '../routes/trading.ts');
      const content = fs.readFileSync(routesPath, 'utf8');
      
      // Check for watchlist routes
      expect(content).toMatch(/\/watchlists.*getUserWatchlists/);
      expect(content).toMatch(/\/watchlists.*createWatchlist/);
      expect(content).toMatch(/\/watchlists\/public.*getPublicWatchlists/);
      expect(content).toMatch(/\/watchlists\/:watchlistId.*getWatchlist/);
      expect(content).toMatch(/\/watchlists\/:watchlistId\/symbols.*addSymbolToWatchlist/);
      expect(content).toMatch(/\/watchlists\/:watchlistId\/performance.*getWatchlistPerformance/);
      
      // Check for authentication
      expect(content).toMatch(/authenticateToken.*getUserWatchlists/);
      expect(content).toMatch(/authenticateToken.*createWatchlist/);
    });
  });

  describe('5. Trading Interface Enhancement', () => {
    test('Trading routes should be integrated in main routes', () => {
      const mainRoutesPath = path.join(__dirname, '../routes.ts');
      expect(fs.existsSync(mainRoutesPath)).toBe(true);
      
      const content = fs.readFileSync(mainRoutesPath, 'utf8');
      
      // Check for trading routes import
      expect(content).toMatch(/import.*tradingRoutes.*from.*routes\/trading/);
      
      // Check for trading routes registration
      expect(content).toMatch(/app\.use\(.*\/api\/trading.*tradingRoutes\)/);
    });

    test('Rate limiting should be applied to trading routes', () => {
      const routesPath = path.join(__dirname, '../routes/trading.ts');
      const content = fs.readFileSync(routesPath, 'utf8');
      
      // Check for rate limiting middleware
      expect(content).toMatch(/rateLimitMiddleware/);
      expect(content).toMatch(/router\.use\(rateLimitMiddleware\)/);
    });

    test('Authentication should be properly implemented', () => {
      const routesPath = path.join(__dirname, '../routes/trading.ts');
      const content = fs.readFileSync(routesPath, 'utf8');
      
      // Check for authentication middleware import
      expect(content).toMatch(/import.*authenticateToken/);
      
      // Check that protected routes use authentication
      expect(content).toMatch(/authenticateToken.*subscribeToOrderBook/);
      expect(content).toMatch(/authenticateToken.*getTradeHistory/);
      expect(content).toMatch(/authenticateToken.*getUserWatchlists/);
    });

    test('Error handling should be consistent', () => {
      const controllerPath = path.join(__dirname, '../controllers/tradingController.ts');
      const content = fs.readFileSync(controllerPath, 'utf8');
      
      // Check for consistent error handling patterns
      expect(content).toMatch(/try\s*\{[\s\S]*?\}\s*catch.*error/g);
      expect(content).toMatch(/console\.error/);
      expect(content).toMatch(/res\.status\(500\)\.json/);
      expect(content).toMatch(/Internal server error/);
      
      // Check for validation error handling
      expect(content).toMatch(/res\.status\(400\)\.json/);
      expect(content).toMatch(/res\.status\(401\)\.json/);
      expect(content).toMatch(/res\.status\(404\)\.json/);
    });

    test('Response format should be standardized', () => {
      const controllerPath = path.join(__dirname, '../controllers/tradingController.ts');
      const content = fs.readFileSync(controllerPath, 'utf8');
      
      // Check for standardized response format
      expect(content).toMatch(/success:\s*true/);
      expect(content).toMatch(/data:/);
      expect(content).toMatch(/message:/);
      
      // Check for pagination support
      expect(content).toMatch(/pagination:/);
    });
  });

  describe('6. Integration and Performance Tests', () => {
    test('Services should have proper caching implementation', () => {
      const orderBookPath = path.join(__dirname, '../services/orderBookService.ts');
      const tradeHistoryPath = path.join(__dirname, '../services/tradeHistoryService.ts');
      const marketSelectorPath = path.join(__dirname, '../services/marketSelectorService.ts');
      const watchlistPath = path.join(__dirname, '../services/watchlistService.ts');
      
      [orderBookPath, tradeHistoryPath, marketSelectorPath, watchlistPath].forEach(filePath => {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          expect(content).toMatch(/cacheService/);
          expect(content).toMatch(/CACHE_TTL/);
          expect(content).toMatch(/cacheKey/);
        }
      });
    });

    test('Services should have audit logging', () => {
      const controllerPath = path.join(__dirname, '../controllers/tradingController.ts');
      const content = fs.readFileSync(controllerPath, 'utf8');
      
      // Check for audit service import
      expect(content).toMatch(/auditService/);
      
      // Check for audit logging in services
      const servicePaths = [
        '../services/orderBookService.ts',
        '../services/tradeHistoryService.ts',
        '../services/watchlistService.ts'
      ];
      
      servicePaths.forEach(servicePath => {
        const fullPath = path.join(__dirname, servicePath);
        if (fs.existsSync(fullPath)) {
          const serviceContent = fs.readFileSync(fullPath, 'utf8');
          expect(serviceContent).toMatch(/auditService/);
          expect(serviceContent).toMatch(/logSecurityEvent/);
        }
      });
    });

    test('Real-time updates should be properly configured', () => {
      const orderBookPath = path.join(__dirname, '../services/orderBookService.ts');
      const watchlistPath = path.join(__dirname, '../services/watchlistService.ts');
      
      [orderBookPath, watchlistPath].forEach(filePath => {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          expect(content).toMatch(/setInterval/);
          expect(content).toMatch(/UPDATE_INTERVAL|UPDATE_FREQUENCY/);
          expect(content).toMatch(/clearInterval/);
          expect(content).toMatch(/cleanup/);
        }
      });
    });

    test('Database queries should be optimized', () => {
      const tradeHistoryPath = path.join(__dirname, '../services/tradeHistoryService.ts');
      const watchlistPath = path.join(__dirname, '../services/watchlistService.ts');
      
      [tradeHistoryPath, watchlistPath].forEach(filePath => {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          expect(content).toMatch(/pool\.query/);
          expect(content).toMatch(/Promise\.all/); // Parallel queries
          expect(content).toMatch(/LIMIT|limit/);
          expect(content).toMatch(/OFFSET|offset/);
        }
      });
    });

    test('Memory management should be implemented', () => {
      const orderBookPath = path.join(__dirname, '../services/orderBookService.ts');
      const marketSelectorPath = path.join(__dirname, '../services/marketSelectorService.ts');
      const watchlistPath = path.join(__dirname, '../services/watchlistService.ts');
      
      [orderBookPath, marketSelectorPath, watchlistPath].forEach(filePath => {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          expect(content).toMatch(/cleanup/);
          expect(content).toMatch(/Map|Set/); // Efficient data structures
        }
      });
    });
  });

  describe('7. API Endpoint Coverage', () => {
    test('All required trading endpoints should be available', () => {
      const routesPath = path.join(__dirname, '../routes/trading.ts');
      const content = fs.readFileSync(routesPath, 'utf8');
      
      const requiredEndpoints = [
        // Order Book
        '/orderbook/:symbol',
        '/orderbook/:symbol/subscribe',
        '/orderbook/:symbol/depth',
        
        // Trade History
        '/trades',
        '/trades/export',
        '/analytics',
        '/performance',
        
        // Market Selector
        '/markets/search',
        '/markets/categories',
        '/markets/stats',
        '/markets/popular',
        '/markets/trending',
        
        // Watchlists
        '/watchlists',
        '/watchlists/public',
        '/watchlists/:watchlistId',
        '/watchlists/:watchlistId/symbols',
        '/watchlists/:watchlistId/performance'
      ];
      
      requiredEndpoints.forEach(endpoint => {
        expect(content).toMatch(new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      });
    });

    test('HTTP methods should be properly configured', () => {
      const routesPath = path.join(__dirname, '../routes/trading.ts');
      const content = fs.readFileSync(routesPath, 'utf8');
      
      // Check for different HTTP methods
      expect(content).toMatch(/router\.get\(/);
      expect(content).toMatch(/router\.post\(/);
      expect(content).toMatch(/router\.put\(/);
      expect(content).toMatch(/router\.delete\(/);
    });
  });
}); 