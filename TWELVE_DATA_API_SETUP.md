# Twelve Data API Key Setup Guide

## ✅ API Key Configured
Your Twelve Data API key `353ddad011164bea9e7d8aea53138956` has been configured in the following locations:

### 1. Production Environment Template
- **File**: `config/production.env.template`
- **Variable**: `TWELVE_DATA_API_KEY=353ddad011164bea9e7d8aea53138956`

### 2. Environment Configuration Scripts
- **PowerShell**: `env-config.ps1` (for Windows)
- **Shell**: `env-config.sh` (for Linux/Mac)

### 3. Startup Scripts Updated
- `start-renx.ps1` now loads environment variables automatically
- `start-renx.sh` now loads environment variables automatically

## Manual Setup (if needed)

If you need to manually set up environment files, create these files:

### Root Directory `.env` (if not ignored)
```bash
TWELVE_DATA_API_KEY=353ddad011164bea9e7d8aea53138956
VITE_TWELVEDATA_API_KEY=353ddad011164bea9e7d8aea53138956
DATABASE_URL=postgresql://renx_admin:renx_password@localhost:5432/renx_db
NODE_ENV=development
PORT=3344
AI_BACKEND_PORT=8181
JWT_SECRET=renx_jwt_secret_dev_2024
```

### Client Directory `client/.env.local`
```bash
VITE_TWELVEDATA_API_KEY=353ddad011164bea9e7d8aea53138956
VITE_API_URL=http://localhost:3344
```

### Backend Directory `client/src/services/backend/.env`
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/renx_db
JWT_SECRET=renx_backend_jwt_secret_2024
TWELVE_DATA_API_KEY=353ddad011164bea9e7d8aea53138956
```

## Verification

To verify the API key is working:

1. Start the platform using `./start-renx.ps1` (Windows) or `./start-renx.sh` (Linux/Mac)
2. Check the logs in the `logs/` directory
3. Visit the application at `http://localhost:3344`
4. Test market data functionality to ensure API calls are successful

## API Key Details
- **Key**: `353ddad011164bea9e7d8aea53138956`
- **Provider**: TwelveData
- **Usage**: Market data, stock quotes, time series, technical indicators
- **Rate Limits**: Depends on your TwelveData subscription plan

## Security Notes
- Never commit `.env` files to version control
- The API key is set in template files for development purposes
- For production, ensure proper environment variable management
- Consider rotating API keys periodically for security 