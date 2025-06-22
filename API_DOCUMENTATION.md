# RenX API Documentation

## Overview
RenX is a comprehensive multi-tenant AI-powered trading platform. This document provides complete API specifications for all endpoints.

**Base URL:** `http://localhost:3001/api`  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`

---

## Authentication Endpoints

### POST /auth/login
Login to the platform with tenant-specific credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "tenantId": "tenant-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "user",
    "tenantId": "tenant-uuid"
  },
  "token": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "tenantId": "tenant-uuid"
}
```

### POST /auth/refresh
Refresh JWT token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

### POST /auth/logout
Logout and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

---

## Tenant Management Endpoints

### GET /tenants
List all tenants (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "tenants": [
    {
      "id": "tenant-uuid",
      "name": "Acme Corp",
      "domain": "acme.renx.com",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /tenants
Create a new tenant (Super Admin only).

**Request Body:**
```json
{
  "name": "New Corp",
  "domain": "newcorp.renx.com",
  "adminEmail": "admin@newcorp.com",
  "settings": {
    "maxUsers": 100,
    "features": ["trading", "ai", "analytics"]
  }
}
```

### GET /tenants/:id
Get tenant details.

### PUT /tenants/:id
Update tenant settings.

### DELETE /tenants/:id
Delete tenant (with confirmation).

---

## AI/ML Endpoints

### POST /ai/predict
Get AI price predictions for a symbol.

**Request Body:**
```json
{
  "symbol": "AAPL",
  "timeframe": "1D",
  "horizon": 5
}
```

**Response:**
```json
{
  "symbol": "AAPL",
  "predictions": [
    {
      "date": "2024-01-02",
      "price": 150.25,
      "confidence": 0.85
    }
  ],
  "model": "LSTM",
  "accuracy": 0.82
}
```

### POST /ai/sentiment
Analyze market sentiment for a symbol.

**Request Body:**
```json
{
  "symbol": "AAPL",
  "sources": ["news", "social", "technical"]
}
```

**Response:**
```json
{
  "symbol": "AAPL",
  "sentiment": {
    "overall": 0.65,
    "news": 0.7,
    "social": 0.6,
    "technical": 0.65
  },
  "confidence": 0.78,
  "sources": 125
}
```

### POST /ai/signals
Get AI trading signals.

**Request Body:**
```json
{
  "symbols": ["AAPL", "GOOGL"],
  "strategy": "momentum",
  "riskLevel": "medium"
}
```

**Response:**
```json
{
  "signals": [
    {
      "symbol": "AAPL",
      "action": "BUY",
      "strength": 0.8,
      "price": 150.25,
      "stopLoss": 145.00,
      "takeProfit": 160.00
    }
  ]
}
```

### GET /ai/correlation
Get correlation matrix for symbols.

**Query Parameters:**
- `symbols`: Comma-separated list of symbols
- `period`: Time period (1M, 3M, 6M, 1Y)

---

## Trading Endpoints

### GET /trading/markets
Get available markets and symbols.

**Response:**
```json
{
  "markets": {
    "stocks": ["AAPL", "GOOGL", "MSFT"],
    "crypto": ["BTC", "ETH", "ADA"],
    "forex": ["EURUSD", "GBPUSD"]
  }
}
```

### GET /trading/orderbook/:symbol
Get order book for a symbol.

**Response:**
```json
{
  "symbol": "AAPL",
  "bids": [
    {"price": 149.95, "size": 100},
    {"price": 149.90, "size": 200}
  ],
  "asks": [
    {"price": 150.05, "size": 150},
    {"price": 150.10, "size": 250}
  ],
  "spread": 0.10
}
```

### POST /trading/orders
Place a new order.

**Request Body:**
```json
{
  "symbol": "AAPL",
  "side": "BUY",
  "type": "LIMIT",
  "quantity": 100,
  "price": 150.00,
  "timeInForce": "GTC"
}
```

### GET /trading/orders
Get user's orders.

### GET /trading/positions
Get user's positions.

### GET /trading/history
Get trading history.

---

## Portfolio Endpoints

### GET /portfolio/summary
Get portfolio summary.

**Response:**
```json
{
  "totalValue": 10000.00,
  "dayChange": 150.25,
  "dayChangePercent": 1.52,
  "positions": 5,
  "cash": 2500.00,
  "performance": {
    "1D": 1.52,
    "1W": 3.25,
    "1M": 8.75,
    "1Y": 15.25
  }
}
```

### GET /portfolio/positions
Get detailed positions.

### GET /portfolio/performance
Get performance metrics.

### POST /portfolio/analyze
Analyze portfolio risk and optimization.

---

## Market Data Endpoints

### GET /market/quote/:symbol
Get real-time quote.

**Response:**
```json
{
  "symbol": "AAPL",
  "price": 150.25,
  "change": 2.15,
  "changePercent": 1.45,
  "volume": 1234567,
  "timestamp": "2024-01-01T15:30:00Z"
}
```

### GET /market/history/:symbol
Get historical data.

**Query Parameters:**
- `interval`: 1m, 5m, 15m, 1h, 1d
- `from`: Start date (ISO 8601)
- `to`: End date (ISO 8601)

### GET /market/news/:symbol
Get news for a symbol.

---

## Notification Endpoints

### GET /notifications
Get user notifications.

### POST /notifications/mark-read
Mark notifications as read.

### POST /notifications/settings
Update notification preferences.

### POST /notifications/test
Send test notification.

---

## Audit Endpoints

### GET /audit/logs
Get audit logs (Admin only).

**Query Parameters:**
- `userId`: Filter by user
- `action`: Filter by action type
- `from`: Start date
- `to`: End date

### GET /audit/reports
Generate audit reports.

---

## WebSocket Events

Connect to: `ws://localhost:3001`

### Authentication
```json
{
  "type": "auth",
  "token": "jwt-token"
}
```

### Subscribe to Market Data
```json
{
  "type": "subscribe",
  "channel": "market",
  "symbols": ["AAPL", "GOOGL"]
}
```

### Market Data Updates
```json
{
  "type": "market_update",
  "symbol": "AAPL",
  "price": 150.25,
  "change": 2.15,
  "timestamp": "2024-01-01T15:30:00Z"
}
```

### Subscribe to Notifications
```json
{
  "type": "subscribe",
  "channel": "notifications"
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": {}
  }
}
```

### Common Error Codes
- `INVALID_CREDENTIALS`: Authentication failed
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `TENANT_NOT_FOUND`: Tenant does not exist
- `VALIDATION_ERROR`: Request validation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## Rate Limits

- **Authentication:** 5 requests per minute
- **Market Data:** 100 requests per minute
- **Trading:** 10 requests per minute
- **AI/ML:** 20 requests per minute
- **General:** 60 requests per minute

---

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @renx/sdk
```

```typescript
import { RenXClient } from '@renx/sdk';

const client = new RenXClient({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:3001'
});

const quote = await client.market.getQuote('AAPL');
```

### Python
```bash
pip install renx-python
```

```python
from renx import RenXClient

client = RenXClient(api_key='your-api-key')
quote = client.market.get_quote('AAPL')
```

---

## Webhooks

RenX supports webhooks for real-time notifications.

### Configuration
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["order_filled", "price_alert", "portfolio_update"],
  "secret": "webhook-secret"
}
```

### Webhook Payload
```json
{
  "event": "order_filled",
  "timestamp": "2024-01-01T15:30:00Z",
  "data": {
    "orderId": "order-uuid",
    "symbol": "AAPL",
    "side": "BUY",
    "quantity": 100,
    "price": 150.25
  }
}
```

---

*Last Updated: January 2024*  
*Version: 1.0* 