import * as realAPI from './api';
import mockAPI from './mockApi';

// CRITICAL FIX: Use real API by default for production functionality
// Only use mock API when explicitly set to development mode
const useRealAPI = import.meta.env.VITE_USE_REAL_API !== 'false';

// Export the real API methods (mock API removed from production)
export const authAPI = useRealAPI ? realAPI.authAPI : mockAPI.authAPI;
export const tradingAPI = useRealAPI ? realAPI.tradingAPI : mockAPI.tradingAPI;
export const orderbookAPI = useRealAPI ? realAPI.orderbookAPI : mockAPI.orderbookAPI;
export const tradesAPI = useRealAPI ? realAPI.tradesAPI : mockAPI.tradesAPI;
export const watchlistAPI = useRealAPI ? realAPI.watchlistAPI : mockAPI.watchlistAPI; 