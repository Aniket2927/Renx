# Environment Configuration

To run the backend with the Twelve Data API integration, you need to set up the following environment variables in a `.env` file in the `src/services/backend` directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/renx_db
JWT_SECRET=your_jwt_secret_key_here
TWELVE_DATA_API_KEY=your_api_key_here
```

## Important Notes

1. You must obtain a Twelve Data API key from [https://twelvedata.com/](https://twelvedata.com/)
2. Never commit your `.env` file to version control
3. The API has rate limits - be aware of usage limitations based on your subscription plan

## API Usage

The backend is configured to proxy all requests to Twelve Data API to protect your API key. All stock market data endpoints are available at:

```
/api/stock/price/:symbol      - Get real-time price for a symbol
/api/stock/chart/:symbol      - Get chart/candlestick data
/api/stock/quotes/:symbols    - Get multiple stock quotes (comma-separated)
/api/stock/indicators/:symbol/:indicator - Get technical indicators
/api/stock/symbols            - Search for stock symbols
/api/stock/batch/:symbol      - Get multiple data types in one request
```

See the API controller code for more details on parameters and usage. 