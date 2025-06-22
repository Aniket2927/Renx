# RenX Backend

This is the backend service for the RenX trading platform. It provides API endpoints for authentication, trading, watchlist management, and orderbook functionality.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/renx_db
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   NODE_ENV=development
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout a user

### Trades
- `GET /api/trades` - Get all trades
- `GET /api/trades/:id` - Get trade by ID
- `POST /api/trades` - Create a new trade
- `PUT /api/trades/:id` - Update a trade
- `DELETE /api/trades/:id` - Delete a trade

### Watchlist
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist/add` - Add symbol to watchlist
- `DELETE /api/watchlist/remove/:symbolId` - Remove symbol from watchlist

### Orderbook
- `GET /api/orderbook/:symbol` - Get orderbook for a specific symbol
- `POST /api/orderbook/order` - Place a new order
- `DELETE /api/orderbook/order/:orderId` - Cancel an order

## Database Models

- User
- Trade
- Order
- Watchlist 