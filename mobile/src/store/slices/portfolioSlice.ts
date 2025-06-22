import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Position {
  id: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  change: number;
  changePercent: number;
}

interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  positions: Position[];
}

interface PortfolioState {
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  portfolios: [],
  currentPortfolio: null,
  isLoading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPortfolios: (state, action: PayloadAction<Portfolio[]>) => {
      state.portfolios = action.payload;
    },
    setCurrentPortfolio: (state, action: PayloadAction<Portfolio>) => {
      state.currentPortfolio = action.payload;
    },
    addPosition: (state, action: PayloadAction<Position>) => {
      if (state.currentPortfolio) {
        state.currentPortfolio.positions.push(action.payload);
      }
    },
    updatePosition: (state, action: PayloadAction<Position>) => {
      if (state.currentPortfolio) {
        const index = state.currentPortfolio.positions.findIndex(
          p => p.id === action.payload.id
        );
        if (index !== -1) {
          state.currentPortfolio.positions[index] = action.payload;
        }
      }
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
  setPortfolios,
  setCurrentPortfolio,
  addPosition,
  updatePosition,
  setLoading,
  setError,
} = portfolioSlice.actions;

export default portfolioSlice.reducer; 