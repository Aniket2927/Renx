import * as realAPI from './api';
import mockAPI from './mockApi';

// Check if we should use mock API (development without backend) or real API
const useRealAPI = process.env.REACT_APP_USE_REAL_API === 'true';

// Export the appropriate API methods
export const authAPI = useRealAPI ? realAPI.authAPI : mockAPI.authAPI;
export const orderbookAPI = useRealAPI ? realAPI.orderbookAPI : mockAPI.orderbookAPI;
export const tradesAPI = useRealAPI ? realAPI.tradesAPI : mockAPI.tradesAPI;
export const watchlistAPI = useRealAPI ? realAPI.watchlistAPI : mockAPI.watchlistAPI; 