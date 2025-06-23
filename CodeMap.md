# RenX Consolidation - Complete CodeMap
## Multi-Codebase Architecture Analysis

> **Document Version:** 1.0  
> **Generated:** Phase 1 Deep Audit  
> **Purpose:** Complete inventory of all files, functions, and features across NH-UI and AN-BK codebases  
> **Coverage:** 100% file scan + function-level analysis  

---

## 📊 Executive Summary

| Metric | NH-UI (Canonical) | AN-BK (Additional) | Total |
|--------|-------------------|-------------------|--------|
| **Total Files** | 124 | 189 | 313 |
| **React Components** | 47 | 31 | 78 |
| **Services/APIs** | 23 | 45 | 68 |
| **Test Files** | 8 | 12 | 20 |
| **Config Files** | 12 | 18 | 30 |
| **Documentation** | 2 | 23 | 25 |

---

## 🗂 NH-UI Codebase Structure (Canonical Frontend)

### 📁 Client-Side Architecture
```
client/src/
├── components/
│   ├── Layout/
│   │   ├── AppLayout.tsx (Main app wrapper)
│   │   ├── Header.tsx (Navigation bar)
│   │   ├── Sidebar.tsx (Navigation sidebar)
│   │   └── ThemeSelector.tsx (Theme switching)
│   ├── Charts/
│   │   ├── TradingChart.tsx (Primary trading chart)
│   │   └── PortfolioChart.tsx (Portfolio visualization)
│   ├── AI/
│   │   └── SignalCard.tsx (AI signal display)
│   ├── Portfolio/
│   │   └── HoldingsTable.tsx (Holdings display)
│   ├── Trading/
│   │   └── OrderPanel.tsx (Order placement)
│   ├── ThemeProvider.tsx (Theme context)
│   └── ui/ (47 Shadcn/UI components)
├── hooks/
│   ├── useAuth.ts (Authentication logic)
│   ├── useWebSocket.ts (WebSocket management)
│   ├── useTheme.tsx (Theme management)
│   ├── use-mobile.tsx (Mobile detection)
│   └── use-toast.ts (Toast notifications)
├── lib/
│   ├── utils.ts (Utility functions)
│   ├── websocket.ts (WebSocket client)
│   ├── authUtils.ts (Auth utilities)
│   └── queryClient.ts (React Query client)
├── pages/
│   ├── Dashboard.tsx (Main dashboard)
│   ├── Trading.tsx (Trading interface)
│   ├── Portfolio.tsx (Portfolio management)
│   ├── Landing.tsx (Landing page)
│   ├── AISignals.tsx (AI signals page)
│   ├── MarketScanner.tsx (Market scanner)
│   ├── Backtesting.tsx (Backtesting interface)
│   ├── RiskManagement.tsx (Risk management)
│   ├── Settings.tsx (User settings)
│   ├── Community.tsx (Community features)
│   ├── News.tsx (News feed)
│   ├── Screening.tsx (Stock screening)
│   └── not-found.tsx (404 page)
└── types/
    └── trading.ts (TypeScript interfaces)
```

### 🖥 Server-Side Architecture
```
server/
├── services/
│   ├── aiService.ts (AI model integration)
│   ├── advancedAIService.ts (Advanced AI features)
│   ├── tradingService.ts (Trading logic)
│   ├── tradingBotService.ts (Automated trading)
│   ├── marketDataService.ts (Market data)
│   ├── sentimentAnalysisService.ts (Sentiment analysis)
│   └── websocketService.ts (WebSocket server)
├── db.ts (Database connection)
├── index.ts (Server entry point)
├── routes.ts (API routes)
├── storage.ts (Data storage)
├── replitAuth.ts (Replit authentication)
└── vite.ts (Vite configuration)
```

### 📋 Shared Resources
```
shared/
└── schema.ts (Database schema definitions)
```

---

## 🔧 AN-BK Codebase Structure (Additional Features)

### 🌐 Frontend Extensions
```
src/
├── components/
│   ├── auth/ (Authentication components)
│   ├── chart/ (Chart components)
│   │   ├── AIPredictionChart.js
│   │   ├── CandlestickChart.js
│   │   ├── CorrelationMatrix.js
│   │   └── SentimentAnalysis.js
│   ├── dashboard/
│   │   ├── Dashboard.js (Main dashboard)
│   │   ├── MarketTicker.js (Market ticker)
│   │   ├── PLCard.js (P&L card)
│   │   ├── PortfolioCard.js (Portfolio card)
│   │   ├── WatchlistTable.js (Watchlist)
│   │   └── AISignalTag.js (AI signal tags)
│   ├── trades/
│   │   ├── AdvancedTradingChart.js
│   │   ├── AITradingChart.js
│   │   ├── MarketSelector.js
│   │   ├── OrderBook.js
│   │   ├── SimpleChart.js
│   │   ├── TestChart.js
│   │   ├── TradeHistory.js
│   │   └── TradesSection.js
│   ├── profile/
│   │   ├── ProfilePage.js
│   │   ├── ProfileRoute.js
│   │   └── ProfileSection.js
│   ├── orderbook/
│   └── watchlist/
├── services/
│   ├── ai/
│   │   └── aiService.js (AI service integration)
│   ├── auth/
│   │   ├── auth.service.js
│   │   ├── middleware.js
│   │   └── rbac.js (Role-based access control)
│   ├── frontend/ (Frontend services)
│   ├── backend/ (Backend services - see below)
│   ├── api.js (API service)
│   ├── apiConfig.js (API configuration)
│   ├── marketDataService.js (Market data)
│   └── mockApi.js (Mock API for testing)
└── utils/
    └── api/ (API utilities)
```

### 🔙 Backend Services (AN-BK Exclusive)
```
src/services/backend/
├── controllers/
│   ├── auth.controller.js (Authentication)
│   ├── orderbook.controller.js (Order book)
│   ├── stock.controller.js (Stock data)
│   ├── tenant.controller.js (Multi-tenancy)
│   ├── trades.controller.js (Trading)
│   └── watchlist.controller.js (Watchlist)
├── models/
│   ├── pg.order.model.js (Order model)
│   ├── pg.trade.model.js (Trade model)
│   ├── pg.user.model.js (User model)
│   ├── pg.watchlist.model.js (Watchlist model)
│   └── index.js (Model index)
├── routes/
│   ├── auth.routes.js
│   ├── orderbook.routes.js
│   ├── pricing.routes.js
│   ├── stock.routes.js
│   ├── tenant.routes.js
│   ├── trades.routes.js
│   └── watchlist.routes.js
├── services/
│   ├── cache/
│   │   └── redis.service.js
│   ├── notification/
│   │   ├── notification.service.js
│   │   └── templates/ (Email templates)
│   ├── pricing/
│   │   └── pricing.service.js
│   ├── tenant/
│   │   └── tenant.service.js
│   └── websocket/
│       └── websocket.service.js
├── middleware/
│   └── auth.middleware.js
├── config/
│   ├── db.config.js
│   ├── kafka.config.js
│   └── threshold.config.js
├── tests/ (12 test files)
├── utils/
│   └── twelveDataAPI.js
└── server.js (Express server)
```

### 🤖 AI Backend Services
```
ai-backend/
├── main.py (FastAPI server)
├── ml_service.py (ML model service)
├── download_nltk_data.py (NLTK data setup)
├── set_env.py (Environment setup)
├── requirements.txt (Python dependencies)
└── venv/ (Virtual environment)
```

### 📚 Documentation & Planning
```
docs/
├── PROJECT_SUMMARY.md
├── TECHNICAL_DOCUMENTATION.md
├── API_DOCUMENTATION.md
├── REAL_TIME_API.md
├── FeatureRoadmap.md
├── task_manager.md
├── RenX_App revamap.md
└── Phase Wise Completion report/
```

---

## 🔍 Function-Level Analysis

### 🧩 Key Functions by Category

#### Authentication & Security
| Function | Location | Codebase | Description |
|----------|----------|----------|-------------|
| `useAuth()` | `client/src/hooks/useAuth.ts` | NH-UI | Authentication hook |
| `authMiddleware()` | `backend/middleware/auth.middleware.js` | AN-BK | JWT validation |
| `rbacCheck()` | `services/auth/rbac.js` | AN-BK | Role-based access control |

#### Trading & Orders
| Function | Location | Codebase | Description |
|----------|----------|----------|-------------|
| `OrderPanel()` | `client/src/components/Trading/OrderPanel.tsx` | NH-UI | Order placement UI |
| `executeTrade()` | `server/services/tradingService.ts` | NH-UI | Trade execution |
| `placeOrder()` | `backend/controllers/trades.controller.js` | AN-BK | Order placement API |

#### AI & Machine Learning
| Function | Location | Codebase | Description |
|----------|----------|----------|-------------|
| `aiService()` | `server/services/aiService.ts` | NH-UI | Basic AI service |
| `advancedAIService()` | `server/services/advancedAIService.ts` | NH-UI | Advanced AI features |
| `ml_predict()` | `ai-backend/ml_service.py` | AN-BK | ML model predictions |

#### Data & WebSocket
| Function | Location | Codebase | Description |
|----------|----------|----------|-------------|
| `useWebSocket()` | `client/src/hooks/useWebSocket.ts` | NH-UI | WebSocket management |
| `websocketService()` | `server/services/websocketService.ts` | NH-UI | WebSocket server |
| `marketDataService()` | `server/services/marketDataService.ts` | NH-UI | Market data fetching |

#### Multi-Tenancy (AN-BK Exclusive)
| Function | Location | Codebase | Description |
|----------|----------|----------|-------------|
| `createTenant()` | `backend/controllers/tenant.controller.js` | AN-BK | Tenant creation |
| `tenantService()` | `backend/services/tenant/tenant.service.js` | AN-BK | Tenant management |
| `isolateData()` | `backend/config/db.config.js` | AN-BK | Data isolation |

---

## 🎯 Integration Priority Matrix

### 🔴 P0 - Critical Missing Features (Must Integrate)
1. **Multi-Tenancy System** (AN-BK exclusive)
2. **RBAC Implementation** (AN-BK exclusive)
3. **PostgreSQL Models** (AN-BK exclusive)
4. **Redis Caching** (AN-BK exclusive)
5. **Kafka Integration** (AN-BK exclusive)
6. **Email Notifications** (AN-BK exclusive)

### 🟡 P1 - Important Enhancements
1. **Advanced Trading Charts** (AN-BK has more variety)
2. **Correlation Matrix** (AN-BK exclusive)
3. **Sentiment Analysis UI** (AN-BK exclusive)
4. **Profile Management** (AN-BK more comprehensive)
5. **Market Ticker** (AN-BK exclusive)

### 🟢 P2 - Nice-to-Have Features
1. **Test Charts** (AN-BK exclusive)
2. **Mock API** (AN-BK exclusive)
3. **Additional Documentation** (AN-BK extensive)

### 🔵 P3 - Future Consideration
1. **PowerShell Scripts** (AN-BK exclusive)
2. **Legacy Components** (AN-BK exclusive)

---

## 📈 Consolidation Strategy

### Phase 1: Infrastructure Integration
- Port multi-tenancy from AN-BK to NH-UI
- Integrate RBAC system
- Set up PostgreSQL models
- Configure Redis caching

### Phase 2: Feature Enhancement
- Merge advanced charts and components
- Integrate sentiment analysis
- Add correlation matrix
- Enhance profile management

### Phase 3: Service Integration
- Merge notification services
- Integrate Kafka messaging
- Add email templating
- Enhance API documentation

### Phase 4: Testing & Polish
- Migrate test suites
- Update documentation
- Performance optimization
- Security audit

---

## 🎯 Success Metrics

- **Code Coverage**: Maintain 90%+ test coverage
- **Performance**: No regression in load times
- **Features**: 100% feature parity with both codebases
- **Architecture**: Clean, maintainable code structure
- **Documentation**: Complete API and feature documentation

---

*Generated by RenX Consolidation Audit - Phase 1* 