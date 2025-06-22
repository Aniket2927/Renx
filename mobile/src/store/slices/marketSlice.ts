import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
}

interface MarketState {
  watchlist: MarketData[];
  marketData: Record<string, MarketData>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: MarketState = {
  watchlist: [],
  marketData: {},
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setWatchlist: (state, action: PayloadAction<MarketData[]>) => {
      state.watchlist = action.payload;
    },
    addToWatchlist: (state, action: PayloadAction<MarketData>) => {
      const exists = state.watchlist.find(item => item.symbol === action.payload.symbol);
      if (!exists) {
        state.watchlist.push(action.payload);
      }
    },
    removeFromWatchlist: (state, action: PayloadAction<string>) => {
      state.watchlist = state.watchlist.filter(item => item.symbol !== action.payload);
    },
    updateMarketData: (state, action: PayloadAction<Record<string, MarketData>>) => {
      state.marketData = { ...state.marketData, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    },
    updateSingleMarketData: (state, action: PayloadAction<MarketData>) => {
      state.marketData[action.payload.symbol] = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  updateMarketData,
  updateSingleMarketData,
  setLoading,
  setError,
} = marketSlice.actions;

export default marketSlice.reducer; 