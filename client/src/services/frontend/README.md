# RenX Frontend

This is the frontend application for the RenX trading platform. It provides a user interface for authentication, trading, watchlist management, and orderbook visualization.

## Project Structure

```
frontend/
├── components/       # Reusable UI components
│   ├── dashboard/    # Dashboard-specific components
│   ├── orderbook/    # Orderbook-specific components
│   ├── trades/       # Trades-specific components
│   └── watchlist/    # Watchlist-specific components
├── pages/            # Page components
├── styles/           # CSS styles
└── App.js            # Main application component
```

## Features

- **Authentication:** User registration, login, and profile management
- **Dashboard:** Overview of account and market information
- **Trades:** View and manage trades
- **Orderbook:** Real-time orderbook visualization and order placement
- **Watchlist:** Track favorite trading pairs

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Build for production:
   ```
   npm run build
   ```

## Dependencies

- React
- React Router
- Formik and Yup (form handling and validation)
- React Toastify (notifications)
- React Icons
- Axios (API requests)

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## API Integration

The frontend connects to the backend API using the API service in `src/services/api.js`. This service provides methods for all API endpoints and handles authentication tokens. 